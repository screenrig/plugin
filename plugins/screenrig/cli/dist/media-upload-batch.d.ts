import type { ApiClient } from "./client.js";
import type { ConfigFs } from "./config.js";
import { ExitCode } from "./exit-codes.js";
import { type ProgressReporter } from "./media/progress.js";
import type { TranscodeOptions } from "./media/transcode.js";
import type { CliRuntime } from "./runtime.js";
export declare const UPLOAD_BATCH_MIN_ITEMS = 1;
export declare const UPLOAD_BATCH_MAX_ITEMS = 1000;
export declare const UPLOAD_BATCH_MAX_ATTEMPTS = 8;
export declare const UPLOAD_BATCH_BACKOFF_START_MS = 1000;
export declare const UPLOAD_BATCH_BACKOFF_CAP_MS = 30000;
export declare const UPLOAD_BATCH_DEFAULT_CONCURRENCY = 4;
export declare const UPLOAD_BATCH_MIN_CONCURRENCY = 1;
export declare const UPLOAD_BATCH_MAX_CONCURRENCY = 8;
export interface UploadBatchManifestItem {
    /** Absolute path used to read bytes. */
    path: string;
    /** Path as written in the manifest, for reports. */
    displayPath: string;
    tag?: string;
    content_type?: string;
}
export interface UploadBatchStateRecord {
    media_id?: string;
    revision?: number;
    completed_at?: string;
    operation_id?: string;
    idempotency_key?: string;
    attempt?: number;
}
export interface UploadBatchState {
    api_url: string;
    account_id: string;
    items: Record<string, UploadBatchStateRecord>;
}
export interface UploadBatchFailedItem {
    path: string;
    sha256?: string;
    problem: {
        code: string;
        status: number;
        title: string;
        detail: string;
        retry_after_seconds?: number;
    };
}
/**
 * One row per item that reached the account, in manifest order. Counts alone
 * force a second `media list --tag` call to learn what a batch created, and a
 * batch without a tag has no way back to its ids at all.
 */
export interface UploadBatchItem {
    path: string;
    source_filename: string;
    sha256: string;
    outcome: "accepted" | "resumed";
    media_id?: string;
    revision?: number;
}
export interface UploadBatchEnvelopeData {
    attempts: number;
    rate_limited: number;
    wait_ms: number;
    transfer_ms: number;
    accepted: number;
    resumed: number;
    items: UploadBatchItem[];
    failed: UploadBatchFailedItem[];
}
export interface MediaUploadBatchResult {
    data: UploadBatchEnvelopeData;
    warnings: {
        code: string;
        message: string;
    }[];
    exitCode: ExitCode;
    human: string;
}
export interface RunMediaUploadBatchInput {
    runtime: CliRuntime;
    client: ApiClient;
    manifestPath: string;
    statePath: string;
    apiUrl: string;
    accountId?: string;
    concurrency: number;
    defaultTag?: string;
    transcodeOptions: TranscodeOptions;
    noTranscode: boolean;
    reporter: ProgressReporter;
    json: boolean;
    noProgress: boolean;
    timeoutMs?: number;
    pollMs?: number;
    random?: () => number;
}
export declare function deriveBatchIdempotencyKey(contentSha256: string, attempt?: number): string;
export declare function computeBackoffMs(options: {
    attemptIndex: number;
    retryAfterSeconds?: number;
    random?: () => number;
}): number;
export declare function parseUploadBatchManifest(input: unknown, manifestDir: string): UploadBatchManifestItem[];
export declare function parseUploadBatchState(input: unknown): UploadBatchState;
export declare function writeUploadBatchStateAtomic(statePath: string, state: UploadBatchState, fsLike: ConfigFs, nowMs: number): Promise<void>;
export declare function runMediaUploadBatch(input: RunMediaUploadBatchInput): Promise<MediaUploadBatchResult>;
//# sourceMappingURL=media-upload-batch.d.ts.map