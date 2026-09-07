import type { MediaCommit, MediaUploadDeclaration, MediaUploadSession, Operation } from "./adapters/protocol.js";
import type { ApiClient } from "./client.js";
import type { ProgressReporter } from "./media/progress.js";
import { type TranscodeOptions, type TranscodeResult } from "./media/transcode.js";
import { type CliRuntime, type SignedRawPut } from "./runtime.js";
export declare const SUPPORTED_MEDIA_CONTENT_TYPES: readonly ["image/png", "image/jpeg", "image/webp", "image/gif", "video/mp4", "video/webm"];
export type SupportedMediaContentType = (typeof SUPPORTED_MEDIA_CONTENT_TYPES)[number];
export interface PreparedMediaUpload {
    bytes: Buffer;
    declaration: MediaUploadDeclaration;
    commit: MediaCommit;
}
export interface ValidatedMediaUploadSession {
    id: string;
    operationId: string;
    uploadUrl: string;
    headers: Record<string, string>;
    expiresAt: number;
}
export declare function prepareMediaUpload(filePath: string, explicitContentType?: string, expectedSha256?: string): Promise<PreparedMediaUpload>;
export declare function validateMediaUploadSession(input: MediaUploadSession, nowMs?: number): ValidatedMediaUploadSession;
export declare function performSignedMediaPut(prepared: PreparedMediaUpload, session: ValidatedMediaUploadSession, signedRawPut: SignedRawPut): Promise<void>;
export declare function performSignedMediaFilePut(filePath: string, session: ValidatedMediaUploadSession, signedRawPut: SignedRawPut): Promise<void>;
export declare function performSignedMediaStreamPut(body: AsyncIterable<Uint8Array>, session: ValidatedMediaUploadSession, signedRawPut: SignedRawPut): Promise<void>;
export declare function deriveCommitIdempotencyKey(base: string): string;
/** SHA-256 of the local source bytes. Batch resume keys this, not the transcoded digest. */
export declare function hashLocalMediaFile(filePath: string): Promise<string>;
export declare function readyMediaId(operation: Operation): string | undefined;
export interface MediaFileUploadInput {
    runtime: CliRuntime;
    client: ApiClient;
    sourcePath: string;
    explicitContentType?: string;
    tag?: string;
    transcodeOptions: TranscodeOptions;
    noTranscode: boolean;
    reporter: ProgressReporter;
    noWait?: boolean;
    timeoutMs?: number;
    pollMs?: number;
    /** Declare key; commit is derived from this. Defaults to `client.idempotencyKey`. */
    idempotencyKey?: string;
    /** Called after declare succeeds and before the signed PUT. */
    onDeclared?: (session: ValidatedMediaUploadSession) => Promise<void>;
}
export interface MediaFileUploadResult {
    mediaId?: string;
    operation: Operation;
    upload: {
        /**
         * The stored name. Read back from the ready media object, because the
         * server derives it from `source_filename` (photo.png sent as WebP is
         * stored as photo.png.webp) and only the server knows the result.
         */
        filename: string;
        /** The name the CLI put on the wire, before the server derived the stored one. */
        declared_filename: string;
        /** `server` when `filename` came from the ready object, `declared` when it could not be read back. */
        filename_source: "server" | "declared";
        /** The caller's original file name, declared so the ready object keeps the handle. */
        source_filename?: string;
        content_type: string;
        bytes: number;
        sha256: string;
        tag?: string;
    };
    transcode: {
        applied: boolean;
        stage?: string;
        reason: string;
        source_bytes?: number;
        output_bytes?: number;
        width?: number;
        height?: number;
        /** Probed source dimensions before any bound; present when the transcoder ran. */
        source_width?: number;
        source_height?: number;
        dimensions_measured?: boolean;
        duration_ms?: number;
        video?: TranscodeResult["video"];
    };
    warnings: {
        code: string;
        message: string;
    }[];
}
export interface PreparedMediaFile {
    prepared: PreparedMediaUpload;
    transcode?: TranscodeResult;
}
/**
 * Transcode (unless `--no-transcode`) and snapshot the bytes that will be
 * declared. The caller must `cleanupPreparedMediaFile` after submit/failure.
 */
export declare function prepareMediaFileForUpload(input: MediaFileUploadInput): Promise<PreparedMediaFile>;
export declare function cleanupPreparedMediaFile(prepared: PreparedMediaFile | undefined): Promise<void>;
/** Declare, signed PUT, commit, and optionally wait. Same path as `media upload`. */
export declare function submitPreparedMedia(input: MediaFileUploadInput, preparedFile: PreparedMediaFile): Promise<Pick<MediaFileUploadResult, "mediaId" | "operation">>;
export declare function uploadMediaFile(input: MediaFileUploadInput): Promise<MediaFileUploadResult>;
//# sourceMappingURL=media-upload.d.ts.map