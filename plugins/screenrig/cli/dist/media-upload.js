import { createHash } from "node:crypto";
import { constants, createReadStream } from "node:fs";
import { open, rm } from "node:fs/promises";
import path from "node:path";
import { isValidIdempotencyKey } from "./ids.js";
import { lowInformationFilenameWarning } from "./media-filename.js";
import { transcodeForUpload } from "./media/transcode.js";
import { assertDeclaredTypeMatchesBytes } from "./media/sniff.js";
import { readWebpContainer } from "./media/webp.js";
import { CliError, networkError, usageError } from "./problems.js";
import { fetchSignedRawPut } from "./runtime.js";
const MEDIA_PUT_NOT_READY = "Private media upload did not complete because the service is not ready. Run screenrig --json doctor and check the ready result before retrying.";
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
export async function prepareMediaUpload(filePath, explicitContentType, expectedSha256) {
    const filename = path.basename(filePath);
    if (!filename || Buffer.byteLength(filename, "utf8") > 255)
        throw usageError("Media filename must be 1 to 255 bytes.");
    const contentType = explicitContentType ?? EXTENSIONS[path.extname(filename).toLowerCase()];
    if (!contentType || !supported(contentType)) {
        throw usageError(`Unsupported media type; use one of: ${SUPPORTED_MEDIA_CONTENT_TYPES.join(", ")}.`);
    }
    const bytes = await readMediaSnapshot(filePath);
    if (contentType === "image/webp" && readWebpContainer(bytes)?.lossless) {
        throw usageError("Lossless WebP (VP8L) is not accepted. Encode lossy WebP that keeps alpha, then upload with --no-transcode.");
    }
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    if (expectedSha256 !== undefined && sha256 !== expectedSha256) {
        throw usageError("Video bytes changed after delivery verification; retry the upload. No upload was started.");
    }
    const commit = { content_type: contentType, bytes: bytes.length, sha256 };
    return { bytes, commit, declaration: { filename, ...commit } };
}
async function readMediaSnapshot(filePath) {
    // Open first so admission and reads address the same file. NONBLOCK lets us
    // reject FIFOs without waiting for a writer; regular file reads are unaffected.
    let handle;
    try {
        handle = await open(filePath, constants.O_RDONLY | constants.O_NONBLOCK);
    }
    catch {
        throw usageError("Cannot open media file for reading.");
    }
    try {
        const before = await handle.stat();
        if (!before.isFile())
            throw usageError("Media input must be a regular file.");
        if (before.size < 1)
            throw usageError("Media file must not be empty.");
        if (before.size > 1_073_741_824) {
            throw usageError("Media file exceeds the 1 GiB per-upload transport ceiling. Run screenrig account show " +
                "to inspect used_bytes, any content_limit_bytes ceiling, and credit_remaining.");
        }
        const bytes = Buffer.allocUnsafe(before.size);
        let offset = 0;
        while (offset < bytes.length) {
            const { bytesRead } = await handle.read(bytes, offset, Math.min(256 * 1024, bytes.length - offset), offset);
            if (bytesRead === 0)
                throw usageError("Media file changed while reading; retry the upload.");
            offset += bytesRead;
        }
        const after = await handle.stat();
        if (after.size !== before.size || after.mtimeMs !== before.mtimeMs || after.ctimeMs !== before.ctimeMs) {
            throw usageError("Media file changed while reading; retry the upload.");
        }
        return bytes;
    }
    catch (error) {
        if (error instanceof CliError)
            throw error;
        throw usageError("Cannot read media file.");
    }
    finally {
        await handle.close();
    }
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
    return performSignedMediaBodyPut(prepared.bytes, session, signedRawPut);
}
export async function performSignedMediaFilePut(filePath, session, signedRawPut) {
    return performSignedMediaBodyPut(createReadStream(filePath), session, signedRawPut);
}
export async function performSignedMediaStreamPut(body, session, signedRawPut) {
    return performSignedMediaBodyPut(body, session, signedRawPut);
}
async function performSignedMediaBodyPut(body, session, signedRawPut) {
    let response;
    try {
        response = await signedRawPut({
            url: session.uploadUrl,
            method: "PUT",
            headers: session.headers,
            body,
            credentials: "omit",
            redirect: "error",
            expiresAt: session.expiresAt,
        });
    }
    catch {
        throw networkError(MEDIA_PUT_NOT_READY);
    }
    if (response.status < 200 || response.status >= 300) {
        if (response.status === 503) {
            throw networkError(MEDIA_PUT_NOT_READY);
        }
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
/** SHA-256 of the local source bytes. Batch resume keys this, not the transcoded digest. */
export async function hashLocalMediaFile(filePath) {
    const bytes = await readMediaSnapshot(filePath);
    return createHash("sha256").update(bytes).digest("hex");
}
export function readyMediaId(operation) {
    const mediaId = operation.result?.media_id;
    return typeof mediaId === "string" && mediaId.length > 0 ? mediaId : undefined;
}
/**
 * Transcode (unless `--no-transcode`) and snapshot the bytes that will be
 * declared. The caller must `cleanupPreparedMediaFile` after submit/failure.
 */
export async function prepareMediaFileForUpload(input) {
    // The declared type is a claim; the bytes are the fact. Refuse a contradiction
    // before ffmpeg or the server sees the file.
    await assertDeclaredTypeMatchesBytes(input.sourcePath, input.explicitContentType);
    const sourceFilename = path.basename(input.sourcePath);
    if (!sourceFilename || Buffer.byteLength(sourceFilename, "utf8") > 255) {
        throw usageError("Media filename must be 1 to 255 bytes.");
    }
    let transcode;
    if (!input.noTranscode) {
        transcode = await transcodeForUpload({
            runtime: input.runtime,
            filePath: input.sourcePath,
            explicitContentType: input.explicitContentType,
            options: input.transcodeOptions,
            reporter: input.reporter,
        });
    }
    try {
        const prepared = transcode
            ? await prepareMediaUpload(transcode.filePath, transcode.contentType, transcode.verifiedSha256)
            : await prepareMediaUpload(input.sourcePath, input.explicitContentType);
        // Always declare the caller's file name. The server derives the stored
        // filename from it (photo.png uploaded as WebP becomes photo.png.webp), so
        // distinct sources no longer collide, and `media list` keeps the handle.
        prepared.declaration.source_filename = sourceFilename;
        if (input.tag !== undefined) {
            prepared.declaration.tag = input.tag;
        }
        return { prepared, transcode };
    }
    catch (error) {
        if (transcode?.cleanupDir) {
            await rm(transcode.cleanupDir, { recursive: true, force: true });
        }
        throw error;
    }
}
export async function cleanupPreparedMediaFile(prepared) {
    if (prepared?.transcode?.cleanupDir) {
        await rm(prepared.transcode.cleanupDir, { recursive: true, force: true });
    }
}
function transcodeEnvelope(transcode) {
    if (!transcode) {
        return { applied: false, reason: "--no-transcode uploaded the source bytes unchanged" };
    }
    return {
        applied: !transcode.passthrough,
        stage: transcode.stage,
        reason: transcode.reason,
        source_bytes: transcode.sourceBytes,
        output_bytes: transcode.outputBytes,
        width: transcode.width,
        height: transcode.height,
        source_width: transcode.sourceWidth,
        source_height: transcode.sourceHeight,
        dimensions_measured: transcode.dimensionsMeasured,
        duration_ms: transcode.durationMs,
        ...(transcode.video ? { video: transcode.video } : {}),
    };
}
function uploadWarnings(prepared, transcode) {
    const warnings = (transcode?.warnings ?? []).map((message) => ({ code: "transcode_warning", message }));
    if (transcode?.resized) {
        const { sourceWidth, sourceHeight, width, height, maxEdge } = transcode.resized;
        warnings.push({
            code: "image_resized",
            message: `${prepared.declaration.source_filename ?? prepared.declaration.filename} was ${sourceWidth}x${sourceHeight} and was ` +
                `scaled down to ${width}x${height} to fit the ${maxEdge} px bound on each edge. The stored still is smaller ` +
                "than the source; pass --max-edge to tighten the bound further, or supply a smaller source to keep control of the result.",
        });
    }
    // Quote the name the caller chose. After a transcode the declared name is a
    // local derivative (photo.png sent as photo.webp) and quoting that reads as a
    // name the caller never typed.
    const filenameWarning = lowInformationFilenameWarning(prepared.declaration.source_filename ?? prepared.declaration.filename);
    if (filenameWarning)
        warnings.push({ code: "generic_filename", message: filenameWarning });
    return warnings;
}
/** Declare, signed PUT, commit, and optionally wait. Same path as `media upload`. */
export async function submitPreparedMedia(input, preparedFile) {
    const { runtime, client } = input;
    const { prepared } = preparedFile;
    const declareKey = input.idempotencyKey ?? client.idempotencyKey;
    const declarationResponse = await client.call({
        method: "POST",
        path: "/api/v1/media/uploads",
        idempotent: true,
        idempotencyKey: declareKey,
        body: prepared.declaration,
    });
    if (declarationResponse.headers["cache-control"] !== "private, no-store") {
        throw usageError("Media upload declaration did not return the required private, no-store cache policy.");
    }
    const session = validateMediaUploadSession(declarationResponse.body, runtime.now().getTime());
    if (input.onDeclared) {
        await input.onDeclared(session);
    }
    await performSignedMediaPut(prepared, session, runtime.signedRawPut ?? fetchSignedRawPut());
    const commitResponse = await client.call({
        method: "POST",
        path: `/api/v1/media/uploads/${session.id}/commit`,
        idempotent: true,
        idempotencyKey: deriveCommitIdempotencyKey(declareKey),
        body: prepared.commit,
    });
    let operation = commitResponse.body;
    if (!input.noWait) {
        operation = await client.waitForOperation(operation.id, {
            timeoutMs: input.timeoutMs ?? 120_000,
            pollMs: input.pollMs ?? 1000,
            sleep: runtime.sleep,
        });
    }
    return { mediaId: readyMediaId(operation), operation };
}
function asRecord(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return undefined;
    return value;
}
/**
 * The name the caller needs after an upload is the one the account now holds,
 * not the local pre-transcode guess: photo.png, photo.jpg, and photo.webp all
 * declare photo.webp but are stored as three distinct rows. Only the ready
 * object carries the derived name, so read it back.
 */
async function storedMediaFilename(client, mediaId) {
    try {
        const response = await client.call({ method: "GET", path: `/api/v1/media/${mediaId}` });
        const body = asRecord(response.body);
        const filename = typeof body?.filename === "string" && body.filename.length > 0 ? body.filename : undefined;
        const sourceFilename = typeof body?.source_filename === "string" && body.source_filename.length > 0 ? body.source_filename : undefined;
        return { ...(filename ? { filename } : {}), ...(sourceFilename ? { source_filename: sourceFilename } : {}) };
    }
    catch {
        // The bytes are already stored and billed. A failed read-back downgrades the
        // reported name; it does not fail the upload.
        return {};
    }
}
export async function uploadMediaFile(input) {
    const preparedFile = await prepareMediaFileForUpload(input);
    try {
        const submitted = await submitPreparedMedia(input, preparedFile);
        const stored = submitted.mediaId ? await storedMediaFilename(input.client, submitted.mediaId) : {};
        return {
            ...submitted,
            upload: {
                filename: stored.filename ?? preparedFile.prepared.declaration.filename,
                declared_filename: preparedFile.prepared.declaration.filename,
                filename_source: stored.filename ? "server" : "declared",
                ...(stored.source_filename ?? preparedFile.prepared.declaration.source_filename
                    ? { source_filename: stored.source_filename ?? preparedFile.prepared.declaration.source_filename }
                    : {}),
                content_type: preparedFile.prepared.declaration.content_type,
                bytes: preparedFile.prepared.declaration.bytes,
                sha256: preparedFile.prepared.declaration.sha256,
                ...(preparedFile.prepared.declaration.tag ? { tag: preparedFile.prepared.declaration.tag } : {}),
            },
            transcode: transcodeEnvelope(preparedFile.transcode),
            warnings: uploadWarnings(preparedFile.prepared, preparedFile.transcode),
        };
    }
    finally {
        await cleanupPreparedMediaFile(preparedFile);
    }
}
//# sourceMappingURL=media-upload.js.map