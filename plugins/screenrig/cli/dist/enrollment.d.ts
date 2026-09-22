import type { EnrollmentIntent } from "./adapters/protocol.js";
import { type ConfigFs, type ResolvedConfig } from "./config.js";
export interface EnrollmentCredential {
    token: string;
    accountId?: string;
    agentId?: string;
}
export interface EnrollmentState {
    clientId: string;
    idempotencyKey: string;
    email: string;
    /** Enrollment purpose, fixed for the lifetime of one pending enrollment. */
    intent?: EnrollmentIntent;
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
    /** Exact validated, trimmed contact address for a new or pending enrollment. */
    enrollmentEmail?: string;
    /**
     * Enrollment purpose for a new enrollment; a pending enrollment keeps the
     * intent it was created with, and a changed one is rejected rather than
     * silently mutating the request behind the same idempotency key.
     */
    enrollmentIntent?: EnrollmentIntent;
    generateClientId?: () => string;
    generateIdempotencyKey?: () => string;
}): Promise<ResolvedConfig>;
//# sourceMappingURL=enrollment.d.ts.map