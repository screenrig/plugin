import net from "node:net";
import { configError } from "../problems.js";
import { redactText } from "../redact.js";
const MAX_PENDING_LOG_BYTES = 1024 * 1024;
const LOG_CLOSE_TIMEOUT_MS = 5000;
/** Counts every line and never writes. Used when connect fails. */
export class DroppingLogSink {
    dropped = 0;
    writeLine(_line) {
        this.dropped += 1;
    }
    async close() { }
    droppedCount() {
        return this.dropped;
    }
}
class UnixSocketSink {
    socket;
    failed = false;
    dropped = 0;
    constructor(socket) {
        this.socket = socket;
        this.socket.on("error", () => {
            this.failed = true;
        });
    }
    writeLine(line) {
        if (this.failed || this.socket.destroyed) {
            this.dropped += 1;
            return;
        }
        const payload = line.endsWith("\n") ? line : `${line}\n`;
        if (this.socket.writableLength + Buffer.byteLength(payload) > MAX_PENDING_LOG_BYTES) {
            this.dropped += 1;
            return;
        }
        // Socket end waits for all write callbacks. Keeping a Promise per completed
        // line would retain the entire history of a long-running events command.
        this.socket.write(payload, (err) => {
            if (err) {
                this.failed = true;
            }
        });
    }
    droppedCount() {
        return this.dropped;
    }
    async close() {
        if (this.socket.destroyed) {
            return;
        }
        try {
            await new Promise((resolve) => {
                const finish = () => {
                    clearTimeout(timer);
                    this.socket.removeListener("finish", onFinish);
                    this.socket.removeListener("error", onError);
                    this.socket.removeListener("close", onClose);
                    resolve();
                };
                const onFinish = () => finish();
                const onError = () => finish();
                const onClose = () => finish();
                const timer = setTimeout(finish, LOG_CLOSE_TIMEOUT_MS);
                this.socket.once("finish", onFinish);
                this.socket.once("error", onError);
                this.socket.once("close", onClose);
                this.socket.end();
            });
        }
        finally {
            this.socket.destroy();
        }
    }
}
export async function connectUnixLogSocket(socketPath) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const socket = net.createConnection({ path: socketPath });
        const fail = (err) => {
            if (settled) {
                return;
            }
            settled = true;
            socket.destroy();
            const code = err.code;
            const hint = code === "ENOENT" || code === "ECONNREFUSED"
                ? " The consumer must already be listening."
                : "";
            reject(configError(`Cannot connect to log_socket ${socketPath}: ${redactText(err.message)}.${hint}`));
        };
        socket.once("error", fail);
        socket.once("connect", () => {
            if (settled) {
                return;
            }
            settled = true;
            socket.removeListener("error", fail);
            resolve(new UnixSocketSink(socket));
        });
    });
}
//# sourceMappingURL=socket.js.map