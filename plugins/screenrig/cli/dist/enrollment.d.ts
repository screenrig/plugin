import { type ConfigFs, type ResolvedConfig } from "./config.js";
export interface EnrollmentCredential {
    token: string;
    accountId?: string;
}
export interface EnrollmentState {
    clientId: string;
    idempotencyKey: string;
}
export interface EnrollmentRuntime {
    fs: ConfigFs;
    now: () => Date;
    sleep: (ms: number) => Promise<void>;
}
/**
 * Resolve a durable credential exactly once across concurrent CLI processes.
 * The callback owns the wire contract and is supplied by the command layer.
 */
export declare function ensureCredential(options: {
    resolved: ResolvedConfig;
    runtime: EnrollmentRuntime;
    enroll: (state: EnrollmentState) => Promise<EnrollmentCredential>;
    verify: (token: string, accountId?: string) => Promise<void>;
    generateClientId?: () => string;
    generateIdempotencyKey?: () => string;
}): Promise<ResolvedConfig>;
//# sourceMappingURL=enrollment.d.ts.map