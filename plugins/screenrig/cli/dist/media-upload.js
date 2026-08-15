import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isValidIdempotencyKey } from "./ids.js";
import { networkError, usageError } from "./problems.js";
export const SUPPORTED_MEDIA_CONTENT_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
];
const EXTENSIONS = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
};
function supported(value) {
    return SUPPORTED_MEDIA_CONTENT_TYPES.includes(value);
}
export async function prepareMediaUpload(filePath, explicitContentType) {
    const filename = path.basename(filePath);
    if (!filename || Buffer.byteLength(filename, "utf8") > 255)
        throw usageError("Media filename must be 1 to 255 bytes.");
    const contentType = explicitContentType ?? EXTENSIONS[path.extname(filename).toLowerCase()];
    if (!contentType || !supported(contentType)) {
        throw usageError(`Unsupported media type; use one of: ${SUPPORTED_MEDIA_CONTENT_TYPES.join(", ")}.`);
    }
    let bytes;
    try {
        bytes = await readFile(filePath);
    }
    catch (error) {
        throw usageError(`Cannot read media file: ${error instanceof Error ? error.message : "read failed"}`);
    }
    if (bytes.length < 1)
        throw usageError("Media file must not be empty.");
    if (bytes.length > 1_073_741_824)
        throw usageError("Media file exceeds the 1 GiB OpenAPI limit.");
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const commit = { content_type: contentType, bytes: bytes.length, sha256 };
    return { bytes, commit, declaration: { filename, ...commit } };
}
export function validateMediaUploadSession(input, nowMs = Date.now()) {
    if (!input || typeof input !== "object" || typeof input.id !== "string" || input.id.length === 0 ||
        !input.operation || typeof input.operation.id !== "string" || input.operation.id.length === 0) {
        throw usageError("Media upload declaration returned an invalid binding.");
    }
    if (input.method !== "PUT")
        throw usageError("Media upload declaration returned an unsupported method.");
    let parsed;
    try {
        parsed = new URL(input.upload_url);
    }
    catch {
        throw usageError("Media upload declaration returned an invalid URL.");
    }
    if (!/^(https?:)$/.test(parsed.protocol) || !parsed.host || parsed.username || parsed.password) {
        throw usageError("Media upload declaration returned an unsafe URL.");
    }
    if (!input.headers || typeof input.headers !== "object" || Array.isArray(input.headers)) {
        throw usageError("Media upload declaration returned invalid signed headers.");
    }
    const headers = {};
    for (const [name, value] of Object.entries(input.headers)) {
        if (!name || typeof value !== "string" || !value || /[\r\n]/.test(name) || /[\r\n]/.test(value)) {
            throw usageError("Media upload declaration returned invalid signed headers.");
        }
        headers[name] = value;
    }
    const expiresAt = Date.parse(input.expires_at);
    if (!Number.isFinite(expiresAt) || expiresAt <= nowMs)
        throw usageError("Media upload declaration is expired or invalid.");
    return { id: input.id, operationId: input.operation.id, uploadUrl: input.upload_url, headers, expiresAt };
}
export async function performSignedMediaPut(prepared, session, signedRawPut) {
    let response;
    try {
        response = await signedRawPut({
            url: session.uploadUrl,
            method: "PUT",
            headers: session.headers,
            body: prepared.bytes,
            credentials: "omit",
            redirect: "error",
        });
    }
    catch {
        throw networkError("Private media upload failed before the server accepted it.");
    }
    if (response.status < 200 || response.status >= 300) {
        throw networkError(`Private media upload returned HTTP ${response.status}.`);
    }
}
export function deriveCommitIdempotencyKey(base) {
    if (!isValidIdempotencyKey(base))
        throw usageError("Invalid base idempotency key for media commit.");
    const derived = createHash("sha256").update("screenrig.media.commit\0").update(base).digest("base64url");
    if (derived === base || !isValidIdempotencyKey(derived))
        throw usageError("Could not derive media commit idempotency key.");
    return derived;
}
//# sourceMappingURL=media-upload.js.map