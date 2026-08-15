import { type ResolvedConfig } from "./config.js";
import type { EnrollmentRuntime } from "./enrollment.js";
export interface BrowserSetupCode {
    canonical: string;
    display: string;
}
export declare function normalizeBrowserSetupCode(input: string): BrowserSetupCode;
export declare function browserHandoffUrl(apiUrl: string, displayCode: string): string;
export declare function browserSetupRetryState(options: {
    resolved: ResolvedConfig;
    runtime: EnrollmentRuntime;
    code: string;
    requestedKey?: string;
    generateIdempotencyKey?: () => string;
}): Promise<{
    idempotency_key: string;
    code: string;
}>;
export declare function clearBrowserSetupRetryState(resolved: ResolvedConfig, runtime: EnrollmentRuntime, idempotencyKey: string): Promise<void>;
//# sourceMappingURL=browser-setup.d.ts.map