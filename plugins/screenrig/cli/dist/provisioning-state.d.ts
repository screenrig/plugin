import { type ResolvedConfig } from "./config.js";
import type { EnrollmentRuntime } from "./enrollment.js";
export interface ProvisioningRetryState {
    idempotency_key: string;
    label?: string;
}
export declare function provisionRetryState(options: {
    resolved: ResolvedConfig;
    runtime: EnrollmentRuntime;
    label?: string;
    requestedKey?: string;
    generateIdempotencyKey?: () => string;
}): Promise<ProvisioningRetryState>;
export declare function clearProvisionRetryState(resolved: ResolvedConfig, runtime: EnrollmentRuntime, idempotencyKey: string): Promise<void>;
//# sourceMappingURL=provisioning-state.d.ts.map