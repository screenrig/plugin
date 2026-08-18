import { chmod, mkdir, open, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { configError } from "./problems.js";
import { redactToken, tokenLookupId } from "./redact.js";
export const DEFAULT_API_URL = "https://api.screenrig.ai";
const DEFAULT_CONFIG_NAME = "config.json";
const LOCAL_DEV_CONFIG_NAME = "config.local-dev.json";
function defaultConfigDir(fsLike) {
    const xdg = fsLike.env.XDG_CONFIG_HOME;
    if (xdg && xdg.length > 0) {
        return path.join(xdg, "screenrig");
    }
    if (process.platform === "win32") {
        const appdata = fsLike.env.APPDATA;
        if (appdata && appdata.length > 0) {
            return path.join(appdata, "screenrig");
        }
    }
    return path.join(fsLike.homedir(), ".config", "screenrig");
}
async function configPathExists(filePath, fsLike) {
    try {
        await fsLike.stat(filePath);
        return true;
    }
    catch (err) {
        if (err.code === "ENOENT") {
            return false;
        }
        throw err;
    }
}
export async function defaultConfigPath(fsLike) {
    const fromEnv = fsLike.env.SCREENRIG_CONFIG;
    if (fromEnv && fromEnv.length > 0) {
        return fromEnv;
    }
    const dir = defaultConfigDir(fsLike);
    const localDev = path.join(dir, LOCAL_DEV_CONFIG_NAME);
    if (await configPathExists(localDev, fsLike)) {
        return localDev;
    }
    return path.join(dir, DEFAULT_CONFIG_NAME);
}
function modeOf(value) {
    return value.mode & 0o777;
}
export function isWorldOrGroupReadable(mode) {
    return (mode & 0o077) !== 0;
}
async function fsyncDir(dir, fsLike) {
    const handle = await fsLike.open(dir, "r");
    try {
        await handle.sync();
    }
    catch {
        // Directory fsync is best-effort on filesystems that reject it.
    }
    finally {
        await handle.close();
    }
}
export async function readConfigFile(configPath, fsLike, options = {}) {
    let info;
    try {
        info = await fsLike.stat(configPath);
    }
    catch (err) {
        const code = err.code;
        if (code === "ENOENT") {
            return undefined;
        }
        throw err;
    }
    if (isWorldOrGroupReadable(modeOf(info))) {
        if (!options.repair) {
            throw configError(`Refusing to read group/world-readable config at ${configPath}`, {
                command: `screenrig doctor --repair-config --config ${configPath}`,
                reason: "Repair permissions to user-only (0600) before reading the token file.",
            });
        }
        await fsLike.chmod(configPath, 0o600);
    }
    const handle = await fsLike.open(configPath, "r");
    try {
        const raw = await handle.readFile("utf8");
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
            throw configError("Config file is not a JSON object.");
        }
        return parsed;
    }
    catch (err) {
        if (err instanceof SyntaxError) {
            throw configError(`Config file is not valid JSON: ${configPath}`);
        }
        throw err;
    }
    finally {
        await handle.close();
    }
}
export async function writeConfigAtomic(configPath, config, fsLike) {
    const dir = path.dirname(configPath);
    await fsLike.mkdir(dir, { recursive: true, mode: 0o700 });
    try {
        await fsLike.chmod(dir, 0o700);
    }
    catch {
        // chmod after mkdir is best-effort when umask already produced 0700.
    }
    const tmp = `${configPath}.${process.pid}.${Date.now()}.tmp`;
    const body = `${JSON.stringify(config, null, 2)}\n`;
    try {
        const handle = await fsLike.open(tmp, "w", 0o600);
        try {
            await handle.writeFile(body, "utf8");
            await handle.sync();
        }
        finally {
            await handle.close();
        }
        await fsLike.chmod(tmp, 0o600);
        await fsLike.rename(tmp, configPath);
        await fsLike.chmod(configPath, 0o600);
        await fsyncDir(dir, fsLike);
    }
    catch (err) {
        await fsLike.rm(tmp, { force: true }).catch(() => undefined);
        throw err;
    }
}
/**
 * Serialize first-use enrollment across CLI processes. The lock lives beside
 * the durable config, never in a replaceable plugin/cache directory.
 */
export async function withConfigLock(configPath, fsLike, options, callback) {
    const dir = path.dirname(configPath);
    const lockPath = `${configPath}.lock`;
    const retryMs = options.retryMs ?? 50;
    const staleMs = options.staleMs ?? 30_000;
    const maxWaitMs = options.maxWaitMs ?? 10_000;
    const started = options.now();
    await fsLike.mkdir(dir, { recursive: true, mode: 0o700 });
    await fsLike.chmod(dir, 0o700).catch(() => undefined);
    while (true) {
        try {
            await fsLike.mkdir(lockPath, { mode: 0o700 });
            break;
        }
        catch (err) {
            if (err.code !== "EEXIST") {
                throw err;
            }
            try {
                const info = await fsLike.stat(lockPath);
                if (options.now() - info.mtimeMs > staleMs) {
                    const abandoned = `${lockPath}.stale.${process.pid}.${options.now()}`;
                    try {
                        await fsLike.rename(lockPath, abandoned);
                        await fsLike.rm(abandoned, { recursive: true, force: true });
                    }
                    catch (reclaimError) {
                        const code = reclaimError.code;
                        if (code !== "ENOENT" && code !== "EEXIST") {
                            throw reclaimError;
                        }
                    }
                    continue;
                }
            }
            catch (statError) {
                if (statError.code !== "ENOENT") {
                    throw statError;
                }
                continue;
            }
            if (options.now() - started >= maxWaitMs) {
                throw configError(`Timed out waiting for the credential lock at ${lockPath}.`);
            }
            await options.sleep(retryMs);
        }
    }
    try {
        return await callback();
    }
    finally {
        await fsLike.rm(lockPath, { recursive: true, force: true });
    }
}
export async function resolveConfig(options) {
    const configPath = (typeof options.flags.config === "string" && options.flags.config) ||
        (await defaultConfigPath(options.fs));
    const file = await readConfigFile(configPath, options.fs, { repair: options.repair });
    const flagApi = typeof options.flags["api-url"] === "string" ? options.flags["api-url"] : undefined;
    const envApi = options.fs.env.SCREENRIG_API_URL;
    const flagToken = options.flags.token;
    const envToken = options.fs.env.SCREENRIG_TOKEN;
    if (flagToken !== undefined || envToken) {
        throw configError("Token flags and SCREENRIG_TOKEN are not supported. ScreenRig enrolls automatically and stores its credential in the user config.");
    }
    let apiUrl = DEFAULT_API_URL;
    let apiSource = "default";
    if (file?.api_url) {
        apiUrl = file.api_url;
        apiSource = "config";
    }
    if (envApi) {
        apiUrl = envApi;
        apiSource = "env";
    }
    if (flagApi) {
        apiUrl = flagApi;
        apiSource = "flag";
    }
    let token;
    let tokenSource = "none";
    if (file?.token) {
        token = file.token;
        tokenSource = "config";
    }
    return {
        apiUrl: apiUrl.replace(/\/+$/, ""),
        token,
        accountId: file?.account_id,
        enrollment: file?.enrollment,
        configPath,
        source: { apiUrl: apiSource, token: tokenSource },
    };
}
export function describeToken(token) {
    if (!token) {
        return "(none)";
    }
    const id = tokenLookupId(token);
    return id ? redactToken(token) : "sr_live_***";
}
//# sourceMappingURL=config.js.map