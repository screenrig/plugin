import { spawn } from "node:child_process";
import { chmod, mkdir, open, rename, rm, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { Readable } from "node:stream";
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
        let stderrPending = "";
        let outputTruncated = false;
        let stoppedEarly = false;
        let stderrTail = "";
        let settled = false;
        let timedOut = false;
        const timer = request.timeoutMs && request.timeoutMs > 0
            ? setTimeout(() => {
                timedOut = true;
                child.kill("SIGKILL");
            }, request.timeoutMs)
            : undefined;
        const emit = (line, callback) => {
            if (stoppedEarly)
                return;
            if (request.maxLineChars && line.length > request.maxLineChars) {
                outputTruncated = true;
                stoppedEarly = true;
            }
            else if (callback(line.replace(/\r$/, "")) === false) {
                stoppedEarly = true;
            }
            if (stoppedEarly)
                child.kill("SIGKILL");
        };
        const lines = (previous, chunk, callback) => {
            if (stoppedEarly)
                return "";
            const text = previous + chunk;
            let start = 0;
            for (let end = text.indexOf("\n"); end >= 0; end = text.indexOf("\n", start)) {
                emit(text.slice(start, end), callback);
                start = end + 1;
                if (stoppedEarly)
                    return "";
            }
            const rest = text.slice(start);
            if (request.maxLineChars && rest.length > request.maxLineChars) {
                outputTruncated = true;
                stoppedEarly = true;
                child.kill("SIGKILL");
                return "";
            }
            return rest;
        };
        child.stdout?.setEncoding("utf8");
        child.stdout?.on("data", (chunk) => {
            if (!streaming) {
                stdout += chunk;
                return;
            }
            pending = lines(pending, chunk, request.onStdoutLine);
        });
        child.stderr?.setEncoding("utf8");
        child.stderr?.on("data", (chunk) => {
            if (request.onStderrLine)
                stderrPending = lines(stderrPending, chunk, request.onStderrLine);
            else
                stderrTail = (stderrTail + chunk).slice(-STDERR_TAIL_LIMIT);
        });
        const settle = (result) => {
            if (settled)
                return;
            settled = true;
            if (timer)
                clearTimeout(timer);
            if (streaming && pending.length > 0) {
                emit(pending, request.onStdoutLine);
                pending = "";
            }
            if (request.onStderrLine && stderrPending)
                emit(stderrPending, request.onStderrLine);
            resolve({ ...result, outputTruncated, stoppedEarly });
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
        const source = request.body;
        // Fetch copies BufferSource bodies. Stream views of the held, verified
        // bytes instead, keeping read-ahead bounded without reopening the path.
        const chunks = source instanceof Uint8Array ? (function* () {
            for (let offset = 0; offset < source.byteLength; offset += 256 * 1024) {
                yield source.subarray(offset, Math.min(offset + 256 * 1024, source.byteLength));
            }
        })() : source;
        const body = Readable.from(chunks, { objectMode: false, highWaterMark: 256 * 1024 });
        const controller = new AbortController();
        const remaining = request.expiresAt === undefined ? undefined : request.expiresAt - Date.now();
        const timer = remaining === undefined ? undefined : setTimeout(() => controller.abort(), Math.max(1, Math.min(remaining, 2_147_483_647)));
        try {
            if (remaining !== undefined && remaining <= 0)
                throw new Error("Media upload session expired.");
            const response = await fetchImpl(request.url, {
                method: request.method,
                headers: request.headers,
                body,
                credentials: request.credentials,
                redirect: request.redirect,
                signal: controller.signal,
                duplex: "half",
            });
            // Only status is part of the PUT contract. Do not buffer an untrusted,
            // potentially unending storage response or retain its signed diagnostics.
            await response.body?.cancel();
            return { status: response.status };
        }
        finally {
            if (timer)
                clearTimeout(timer);
            body.destroy();
            // Readable.from may not start its input before a rejected fetch. Close a
            // caller-owned stream as well so an unopened wrapper cannot leak its fd.
            if (source instanceof Readable)
                source.destroy();
        }
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