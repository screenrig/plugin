import type { LogSink } from "./types.js";
/** Counts every line and never writes. Used when connect fails. */
export declare class DroppingLogSink implements LogSink {
    private dropped;
    writeLine(_line: string): void;
    close(): Promise<void>;
    droppedCount(): number;
}
export declare function connectUnixLogSocket(socketPath: string): Promise<LogSink>;
//# sourceMappingURL=socket.d.ts.map