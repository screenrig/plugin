import type { MediaCommit, MediaUploadDeclaration, MediaUploadSession } from "./adapters/protocol.js";
import type { SignedRawPut } from "./runtime.js";
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
export declare function prepareMediaUpload(filePath: string, explicitContentType?: string): Promise<PreparedMediaUpload>;
export declare function validateMediaUploadSession(input: MediaUploadSession, nowMs?: number): ValidatedMediaUploadSession;
export declare function performSignedMediaPut(prepared: PreparedMediaUpload, session: ValidatedMediaUploadSession, signedRawPut: SignedRawPut): Promise<void>;
export declare function performSignedMediaFilePut(filePath: string, session: ValidatedMediaUploadSession, signedRawPut: SignedRawPut): Promise<void>;
export declare function performSignedMediaStreamPut(body: AsyncIterable<Uint8Array>, session: ValidatedMediaUploadSession, signedRawPut: SignedRawPut): Promise<void>;
export declare function deriveCommitIdempotencyKey(base: string): string;
//# sourceMappingURL=media-upload.d.ts.map