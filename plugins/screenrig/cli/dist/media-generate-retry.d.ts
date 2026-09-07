import { type ResolvedConfig } from "./config.js";
import type { EnrollmentRuntime } from "./enrollment.js";
/**
 * `media generate` is one blocking, billed call. When it times out or the
 * connection drops, the caller cannot tell whether the still was created and
 * billed. The key that made the request is therefore persisted before the
 * request goes out, so re-running the identical command retries under the same
 * Idempotency-Key and the server replays the original MediaGeneration instead
 * of generating and billing a second still. The record is cleared as soon as a
 * generation returns.
 */
export interface GenerateRetryState {
    idempotency_key: string;
    /** Hash of the billable request. The prompt itself never lands in the config. */
    request_hash: string;
}
export interface GenerateRequestFingerprint {
    prompt: string;
    aspect_ratio?: string;
    quality?: string;
    tag?: string;
}
export declare function generateRequestHash(request: GenerateRequestFingerprint): string;
/**
 * Reuse the pending key when the request is identical to the one that did not
 * resolve, and start a fresh key otherwise. A different request never inherits
 * a previous key: replay is only correct for a byte-identical generation.
 */
export declare function generateRetryState(options: {
    resolved: ResolvedConfig;
    runtime: EnrollmentRuntime;
    requestHash: string;
    requestedKey?: string;
    generateIdempotencyKey?: () => string;
}): Promise<{
    state: GenerateRetryState;
    reused: boolean;
}>;
export declare function clearGenerateRetryState(resolved: ResolvedConfig, runtime: EnrollmentRuntime, idempotencyKey: string): Promise<void>;
//# sourceMappingURL=media-generate-retry.d.ts.map