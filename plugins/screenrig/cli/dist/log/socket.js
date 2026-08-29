import net from "node:net";
import { configError } from "../problems.js";
import { redactText } from "../redact.js";
class UnixSocketSink {
    socket;
    socketPath;
    failed;
    writes = [];
    constructor(socket, socketPath) {
        this.socket = socket;
        this.socketPath = socketPath;
        this.socket.on("error", (err) => {
            this.failed = err;
        });
    }
    writeLine(line) {
        if (this.failed) {
            throw configError(`Failed to write operation log to ${this.socketPath}: ${redactText(this.failed.message)}. ` +
                "The consumer must already be listening.");
        }
        const payload = line.endsWith("\n") ? line : `${line}\n`;
        const write = new Promise((resolve, reject) => {
            this.socket.write(payload, (err) => {
                if (err) {
                    this.failed = err;
                    reject(configError(`Failed to write operation log to ${this.socketPath}: ${redactText(err.message)}. ` +
                        "The consumer must already be listening."));
                    return;
                }
                resolve();
            });
        });
        this.writes.push(write);
        void write.catch(() => undefined);
    }
    async close() {
        if (this.writes.length > 0) {
            await Promise.all(this.writes);
        }
        if (this.socket.destroyed) {
            return;
        }
        await new Promise((resolve, reject) => {
            this.socket.end(() => resolve());
            this.socket.once("error", reject);
        }).catch((err) => {
            throw configError(`Failed to close log_socket ${this.socketPath}: ${redactText(err instanceof Error ? err.message : "socket close failed")}.`);
        });
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
            resolve(new UnixSocketSink(socket, socketPath));
        });
    });
}
//# sourceMappingURL=socket.js.map