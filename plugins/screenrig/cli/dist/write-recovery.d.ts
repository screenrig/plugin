import { type ResolvedConfig } from "./config.js";
import type { CliRuntime } from "./runtime.js";
import type { TransportRequest } from "./transport/types.js";
interface PendingWrite {
    fingerprint: string;
    key: string;
}
/** Per-invocation coordinator. Only hashes, keys, timestamps and command names reach disk. */
export declare class WriteRecovery {
    private readonly resolved;
    private readonly runtime;
    private readonly command?;
    private readonly touched;
    constructor(resolved: ResolvedConfig, runtime: CliRuntime, command?: string | undefined);
    private update;
    prepare(request: Omit<TransportRequest, "headers"> & {
        headers?: Record<string, string>;
    }, requestedKey?: string): Promise<PendingWrite>;
    clear(pending: PendingWrite): Promise<void>;
    get hasPending(): boolean;
    finish(): Promise<void>;
}
export interface RecoveryEntry {
    id: string;
    command: string | null;
    created_at: string;
    replay_expires_at: string;
    replay_status: "within_window" | "expired";
}
/** Local-only management; never replays or undoes a remote mutation. */
export declare function manageWriteRecovery(resolved: ResolvedConfig, runtime: CliRuntime, action: "list" | "show" | "reconcile", id?: string): Promise<RecoveryEntry[]>;
export {};
//# sourceMappingURL=write-recovery.d.ts.map