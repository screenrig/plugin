import { randomBytes } from "node:crypto";
import { rmSync } from "node:fs";
import { open } from "node:fs/promises";
import path from "node:path";
export function tempPathFor(target) {
    return path.join(path.dirname(target), `.${path.basename(target)}.${randomBytes(8).toString("hex")}.part`);
}
export function removeOnSignal(file) {
    const signals = ["SIGINT", "SIGTERM"];
    let released = false;
    const handler = (signal) => {
        try {
            rmSync(file, { force: true });
        }
        catch { /* best effort while exiting */ }
        release();
        // Nobody else handles it: restore the default action (exit by signal).
        if (process.listenerCount(signal) === 0)
            process.kill(process.pid, signal);
    };
    const release = () => {
        if (released)
            return;
        released = true;
        for (const signal of signals)
            process.removeListener(signal, handler);
    };
    for (const signal of signals)
        process.on(signal, handler);
    return release;
}
export async function openTempFile(target) {
    const file = tempPathFor(target);
    const handle = await open(file, "wx", 0o600);
    return { path: file, handle, release: removeOnSignal(file) };
}
/** POSIX sh single-quoting for a copy-paste command line. */
export function shellQuote(argv) {
    return argv.map((arg) => (/^[A-Za-z0-9_./:=@%+,-]+$/.test(arg) ? arg : `'${arg.replaceAll("'", "'\\''")}'`)).join(" ");
}
//# sourceMappingURL=temp-file.js.map