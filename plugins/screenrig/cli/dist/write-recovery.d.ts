import { type ResolvedConfig } from "./config.js";
import type { CliRuntime } from "./runtime.js";
import type { TransportRequest } from "./transport/types.js";
interface PendingWrite {
    fingerprint: string;
    key: string;
}
/** Per-invocation coordinator. Only hashes, keys and timestamps reach disk. */
export declare class WriteRecovery {
    private readonly resolved;
    private readonly runtime;
    private readonly touched;
    constructor(resolved: ResolvedConfig, runtime: CliRuntime);
    private update;
    prepare(request: Omit<TransportRequest, "headers"> & {
        headers?: Record<string, string>;
    }, requestedKey?: string): Promise<PendingWrite>;
    clear(pending: PendingWrite): Promise<void>;
    get hasPending(): boolean;
    finish(): Promise<void>;
}
export {};
//# sourceMappingURL=write-recovery.d.ts.map