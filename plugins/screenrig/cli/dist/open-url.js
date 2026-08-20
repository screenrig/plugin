import { spawn } from "node:child_process";
function spawnDetached(command, argv) {
    return new Promise((resolve) => {
        const child = spawn(command, argv, { detached: true, stdio: "ignore", shell: false });
        child.once("error", () => resolve(false));
        child.once("spawn", () => {
            child.unref();
            resolve(true);
        });
    });
}
export const openExternalUrl = async (url) => {
    const target = new URL(url);
    if (target.protocol !== "https:" && !(target.protocol === "http:" && (target.hostname === "localhost" || target.hostname === "127.0.0.1" || target.hostname.endsWith(".localhost"))))
        return false;
    const [command, argv] = process.platform === "darwin"
        ? ["open", [target.href]]
        : process.platform === "win32"
            ? ["rundll32.exe", ["url.dll,FileProtocolHandler", target.href]]
            : ["xdg-open", [target.href]];
    return spawnDetached(command, argv);
};
/** Open a local filesystem path. Refuses a NUL byte. Does not accept URLs. */
export const openLocalPath = async (filePath) => {
    if (filePath.includes("\0"))
        return false;
    const [command, argv] = process.platform === "darwin"
        ? ["open", [filePath]]
        : process.platform === "win32"
            ? ["cmd", ["/c", "start", "", filePath]]
            : ["xdg-open", [filePath]];
    return spawnDetached(command, argv);
};
//# sourceMappingURL=open-url.js.map