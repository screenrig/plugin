function takeValue(argv, index, current) {
    const eq = current.indexOf("=");
    if (eq >= 0) {
        return { value: current.slice(eq + 1), nextIndex: index };
    }
    const next = argv[index + 1];
    if (next === undefined || next.startsWith("-")) {
        return { value: "", nextIndex: index };
    }
    return { value: next, nextIndex: index + 1 };
}
const VALUE_FLAGS = new Set([
    "api-url",
    "beta-key",
    "token",
    "config",
    "idempotency-key",
    "request-id",
    "timeout",
    "output",
    "cursor",
    "after",
    "limit",
    "if-match",
    "revision",
    "id",
    "key",
    "value",
    "json-value",
    "file",
    "value-base64",
    "application-id",
    "playlist-id",
    "timezone",
    "screen-id",
    "media-id",
    "name",
    "type",
    "severity",
    "operation-id",
    "poll-ms",
    "label",
    "content-type",
    "code",
    "codec",
    "max-fps",
    "max-edge",
    "webp-quality",
    "body",
    "body-file",
    "command",
    "kind",
    "level",
    "text",
    "duration-ms",
    "tag",
    "day",
]);
export function parseArgv(argv) {
    const flags = {};
    const positionals = [];
    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === undefined) {
            continue;
        }
        if (arg === "--") {
            positionals.push(...argv.slice(i + 1));
            break;
        }
        if (arg === "--json") {
            flags.json = true;
            continue;
        }
        if (arg === "--no-wait") {
            flags["no-wait"] = true;
            continue;
        }
        if (arg === "--repair-config") {
            flags["repair-config"] = true;
            continue;
        }
        if (arg === "--help" || arg === "-h") {
            flags.help = true;
            continue;
        }
        if (arg === "--version" || arg === "-V") {
            flags.version = true;
            continue;
        }
        if (arg.startsWith("--")) {
            const raw = arg.slice(2);
            const name = raw.split("=")[0] ?? raw;
            if (VALUE_FLAGS.has(name) || raw.includes("=")) {
                const taken = takeValue(argv, i, raw);
                if (taken.value === "") {
                    flags[name] = true;
                }
                else {
                    flags[name] = taken.value;
                    i = taken.nextIndex;
                }
                continue;
            }
            flags[name] = true;
            continue;
        }
        positionals.push(arg);
    }
    return {
        command: positionals.slice(0, 2),
        flags,
        positionals,
    };
}
export function flagString(flags, name) {
    const value = flags[name];
    return typeof value === "string" && value.length > 0 ? value : undefined;
}
export function flagBool(flags, name) {
    return flags[name] === true;
}
export function flagNumber(flags, name) {
    const value = flagString(flags, name);
    if (value === undefined) {
        return undefined;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
}
//# sourceMappingURL=argv.js.map