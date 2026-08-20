import { spawn } from "node:child_process";
import { chmod, mkdir, open, rename, rm, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { openExternalUrl, openLocalPath } from "./open-url.js";
const STDERR_TAIL_LIMIT = 8192;
export function spawnRunProcess() {
    return (request) => new Promise((resolve) => {
        let child;
        try {
            child = spawn(request.command, request.args, {
                stdio: ["ignore", "pipe", "pipe"],
                windowsHide: true,
            });
        }
        catch (error) {
            resolve({
                code: null,
                signal: null,
                stdout: "",
                stderrTail: "",
                spawnError: error instanceof Error ? error.message : "spawn failed",
            });
            return;
        }
        const streaming = typeof request.onStdoutLine === "function";
        let stdout = "";
        let pending = "";
        let stderrTail = "";
        let settled = false;
        let timedOut = false;
        const timer = request.timeoutMs && request.timeoutMs > 0
            ? setTimeout(() => {
                timedOut = true;
                child.kill("SIGKILL");
            }, request.timeoutMs)
            : undefined;
        child.stdout?.setEncoding("utf8");
        child.stdout?.on("data", (chunk) => {
            if (!streaming) {
                stdout += chunk;
                return;
            }
            pending += chunk;
            let newline = pending.indexOf("\n");
            while (newline >= 0) {
                request.onStdoutLine?.(pending.slice(0, newline).replace(/\r$/, ""));
                pending = pending.slice(newline + 1);
                newline = pending.indexOf("\n");
            }
        });
        child.stderr?.setEncoding("utf8");
        child.stderr?.on("data", (chunk) => {
            stderrTail = (stderrTail + chunk).slice(-STDERR_TAIL_LIMIT);
        });
        const settle = (result) => {
            if (settled)
                return;
            settled = true;
            if (timer)
                clearTimeout(timer);
            if (streaming && pending.length > 0) {
                request.onStdoutLine?.(pending.replace(/\r$/, ""));
                pending = "";
            }
            resolve(result);
        };
        child.on("error", (error) => {
            settle({
                code: null,
                signal: null,
                stdout,
                stderrTail,
                spawnError: error instanceof Error ? error.message : "spawn failed",
            });
        });
        child.on("close", (code, signal) => {
            settle({ code, signal, stdout, stderrTail, timedOut });
        });
    });
}
export function fetchSignedRawPut(fetchImpl = fetch) {
    return async (request) => {
        const response = await fetchImpl(request.url, {
            method: request.method,
            headers: request.headers,
            body: Buffer.from(request.body),
            credentials: request.credentials,
            redirect: request.redirect,
        });
        return { status: response.status, bodyText: await response.text() };
    };
}
export function processRuntime() {
    return {
        argv: process.argv.slice(2),
        env: process.env,
        stdout: process.stdout,
        stderr: process.stderr,
        now: () => new Date(),
        sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
        homedir,
        cwd: () => process.cwd(),
        signedRawPut: fetchSignedRawPut(),
        openUrl: openExternalUrl,
        openPath: openLocalPath,
        runProcess: spawnRunProcess(),
        isStderrTty: () => process.stderr.isTTY === true,
        fs: {
            mkdir,
            open,
            rename,
            rm,
            chmod,
            stat,
            homedir,
            env: process.env,
        },
    };
}
//# sourceMappingURL=runtime.js.map