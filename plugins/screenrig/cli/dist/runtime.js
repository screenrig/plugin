import { chmod, mkdir, open, rename, rm, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { openExternalUrl } from "./open-url.js";
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