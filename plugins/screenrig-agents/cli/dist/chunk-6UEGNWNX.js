import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  classifySource,
  quotedRevision,
  transcodeForUpload
} from "./chunk-NY3QU47I.js";
import {
  SIGNED_PUT_ANSWER_MS,
  SIGNED_PUT_IDLE_MS,
  fetchSignedRawPut
} from "./chunk-D5SW5B4X.js";
import {
  readWebpContainer
} from "./chunk-WUPXCRZD.js";
import {
  isValidIdempotencyKey,
  newIdempotencyKey
} from "./chunk-KGGOHJPO.js";
import {
  assertDeclaredTypeMatchesBytes
} from "./chunk-AUIOASIH.js";
import {
  CliError,
  ExitCode,
  makeProblem,
  usageError
} from "./chunk-CO45JNNU.js";

// dist/media-upload.js
import { createHash } from "node:crypto";
import { constants, createReadStream } from "node:fs";
import { open, rm } from "node:fs/promises";
import path2 from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// dist/media-filename.js
import path from "node:path";
var GENERIC_STEMS = [
  "video",
  "movie",
  "clip",
  "output",
  "out",
  "untitled",
  "unnamed",
  "new",
  "temp",
  "tmp",
  "final",
  "export",
  "render",
  "download",
  "downloaded",
  "file",
  "media",
  "image",
  "img",
  "photo",
  "pic",
  "picture",
  "asset",
  "content",
  "sample",
  "test",
  "demo",
  "copy",
  "document",
  "recording",
  "screenshot",
  "screencast",
  "capture",
  "upload"
];
var NOISE_SUFFIXES = [
  "copy",
  "final",
  "finished",
  "new",
  "edit",
  "edited",
  "export",
  "exported",
  "render",
  "rendered",
  "draft",
  "fixed",
  "updated",
  "revised",
  "compressed",
  "converted",
  "orig",
  "original",
  "backup",
  "bak"
];
var DEVICE_PREFIXES = [
  "screen recording",
  "screen capture",
  "whatsapp video",
  "whatsapp image",
  "new project",
  "my movie",
  "screen shot",
  "screenshot",
  "screencast",
  "recording",
  "untitled",
  "document",
  "snapshot",
  "sequence",
  "capture",
  "signal",
  "record",
  "takes",
  "photo",
  "video",
  "movie",
  "clip",
  "frame",
  "scene",
  "take",
  "dscn",
  "dscf",
  "gopr",
  "img",
  "dsc",
  "vid",
  "mvi",
  "mov",
  "pxl",
  "dji",
  "wa",
  "gh",
  "gx"
];
var P_PREFIX_MIN_DIGITS = 7;
var REMAINDER_TIME_WORDS = ["at"];
function separators() {
  return /[-_.+\s]+/gu;
}
var GENERIC_STEM_SET = new Set(GENERIC_STEMS);
var NOISE_SUFFIX_SET = new Set(NOISE_SUFFIXES);
var REMAINDER_TIME_WORD_SET = new Set(REMAINDER_TIME_WORDS);
var DEVICE_PREFIXES_LONGEST_FIRST = [...DEVICE_PREFIXES].sort((a, b) => b.length - a.length);
var COUNTER_PATTERN = /(?:\(\d+\)|\[\d+\])$/u;
var VERSION_TOKEN_PATTERN = /(?:^|[-_.+\s])v\d+$/iu;
var TRAILING_VERSION_PATTERN = /v\d+$/iu;
var TRAILING_DIGITS_PATTERN = /\d+$/u;
var TRAILING_SEPARATORS_PATTERN = /[-_.+\s]+$/u;
var LETTER_PATTERN = new RegExp("\\p{L}", "u");
var NON_ALNUM_PATTERN = /[^\p{L}\p{N}]/gu;
var PURE_DIGITS_PATTERN = /^\d+$/u;
var BARE_DATE_OR_TIMESTAMP_PATTERN = /^(?:\d{4}|\d{8}|\d{4}[-_]\d{2}[-_]\d{2})(?:[-_.+\s]+(?:\d{6}|\d{2}[-_.]\d{2}[-_.]\d{2}))?$/u;
var CAMEL_LOWER_TO_UPPER = new RegExp("(\\p{Ll})(\\p{Lu})", "gu");
var CAMEL_ACRONYM_TO_WORD = new RegExp("(\\p{Lu})(\\p{Lu}\\p{Ll})", "gu");
var WARNING_SUFFIX = " carries little information. The filename is how people identify this media in listings, playlists, and playback reports, so ask for a distinctive name and upload again if that matters.";
function stemOf(filename) {
  const base = path.basename(filename);
  const ext = path.extname(base);
  return ext ? base.slice(0, -ext.length) : base;
}
function collapseSeparators(value) {
  return value.replace(separators(), (run) => run[0] ?? "");
}
function canonicalizeSeparators(value) {
  return value.replace(separators(), " ").trim();
}
function stripTrailingNoiseOnce(value) {
  let next = value;
  if (COUNTER_PATTERN.test(next)) {
    next = next.replace(COUNTER_PATTERN, "");
  } else if (VERSION_TOKEN_PATTERN.test(next)) {
    next = next.replace(TRAILING_VERSION_PATTERN, "");
  } else if (TRAILING_DIGITS_PATTERN.test(next)) {
    next = next.replace(TRAILING_DIGITS_PATTERN, "");
  } else {
    for (const suffix of NOISE_SUFFIXES) {
      const noise = new RegExp("(?:^|[-_.+\\s])".concat(suffix, "$"), "iu");
      if (noise.test(next)) {
        next = next.slice(0, next.length - suffix.length);
        break;
      }
    }
  }
  return next.replace(TRAILING_SEPARATORS_PATTERN, "");
}
function stripTrailingNoise(value) {
  let current = value;
  for (; ; ) {
    const next = stripTrailingNoiseOnce(current);
    if (next === current)
      return current;
    current = next;
  }
}
function isBareDateOrDigits(core) {
  if (LETTER_PATTERN.test(core))
    return false;
  if (PURE_DIGITS_PATTERN.test(core))
    return true;
  return BARE_DATE_OR_TIMESTAMP_PATTERN.test(core);
}
function alphanumericLength(core) {
  return core.replace(NON_ALNUM_PATTERN, "").length;
}
function tokensOf(value) {
  const withCamelBreaks = value.replace(CAMEL_LOWER_TO_UPPER, "$1\0$2").replace(CAMEL_ACRONYM_TO_WORD, "$1\0$2");
  return withCamelBreaks.split(separators()).flatMap((part) => part.split("\0")).map((token) => token.toLowerCase()).filter((token) => token.length > 0);
}
function isUninformativeToken(token) {
  return GENERIC_STEM_SET.has(token) || NOISE_SUFFIX_SET.has(token) || isBareDateOrDigits(token);
}
function remainderIsDigitsDatesTimes(remainder) {
  const tokens = canonicalizeSeparators(remainder).split(" ").filter((token) => token.length > 0);
  if (tokens.length === 0)
    return true;
  return tokens.every((token) => PURE_DIGITS_PATTERN.test(token) || REMAINDER_TIME_WORD_SET.has(token));
}
function remainderAfterPrefix(canonical, prefix) {
  if (canonical === prefix)
    return "";
  if (canonical.startsWith("".concat(prefix, " ")))
    return canonical.slice(prefix.length + 1);
  if (canonical.startsWith(prefix) && PURE_DIGITS_PATTERN.test(canonical.slice(prefix.length, prefix.length + 1))) {
    return canonical.slice(prefix.length);
  }
  return null;
}
function matchesDevicePrefix(core) {
  const canonical = canonicalizeSeparators(core);
  for (const prefix of DEVICE_PREFIXES_LONGEST_FIRST) {
    const remainder = remainderAfterPrefix(canonical, prefix);
    if (remainder !== null && remainderIsDigitsDatesTimes(remainder))
      return true;
  }
  const pRemainder = remainderAfterPrefix(canonical, "p");
  if (pRemainder !== null && remainderIsDigitsDatesTimes(pRemainder)) {
    const digits = pRemainder.replace(/\D/gu, "");
    if (digits.length >= P_PREFIX_MIN_DIGITS)
      return true;
  }
  return false;
}
function lowInformationFilenameWarning(filename) {
  const collapsed = collapseSeparators(stemOf(filename).trim());
  const stripped = stripTrailingNoise(collapsed);
  const core = stripped.toLowerCase();
  const warning = 'Filename "'.concat(filename, '"').concat(WARNING_SUFFIX);
  if (core.length === 0)
    return warning;
  if (GENERIC_STEM_SET.has(core))
    return warning;
  if (isBareDateOrDigits(core))
    return warning;
  if (alphanumericLength(core) <= 2)
    return warning;
  if (matchesDevicePrefix(core))
    return warning;
  const tokens = tokensOf(stripped);
  if (tokens.length > 0 && tokens.every(isUninformativeToken))
    return warning;
  return null;
}

// dist/media/video-limit.js
var limits = /* @__PURE__ */ new WeakMap();
function projectVideoBytes(client) {
  let limit = limits.get(client);
  if (limit === void 0) {
    limit = readVideoBytes(client);
    limits.set(client, limit);
    limit.catch(() => limits.delete(client));
  }
  return limit;
}
async function readVideoBytes(client) {
  const response = await client.call({ method: "GET", path: "/api/project/capabilities" });
  const bytes = response.body?.media_video_bytes;
  if (typeof bytes !== "number" || !Number.isSafeInteger(bytes) || bytes < 1) {
    throw usageError("The project capabilities response does not state media_video_bytes, the video size limit of this project's plan.");
  }
  return bytes;
}
function videoLimitText(bytes) {
  const size = bytes % 1e9 === 0 ? "".concat(bytes / 1e9, " GB") : "".concat(Math.round(bytes / 1e6), " MB");
  return "".concat(bytes.toLocaleString("en-US"), "-byte (").concat(size, ")");
}

// dist/media-upload.js
var PUT_ATTEMPTS = 4;
var PUT_STALLS = {
  UPLOAD_STALLED: "the transfer stalled: no bytes moved for ".concat(SIGNED_PUT_IDLE_MS / 6e4, " minutes"),
  UPLOAD_UNANSWERED: "storage did not answer within ".concat(SIGNED_PUT_ANSWER_MS / 6e4, " minutes of the last byte")
};
var PUT_FAILURES = {
  ECONNRESET: "the connection was reset",
  EPIPE: "the connection was closed",
  UND_ERR_SOCKET: "the connection was closed",
  ECONNREFUSED: "the connection was refused",
  ETIMEDOUT: "the connection timed out",
  UND_ERR_CONNECT_TIMEOUT: "the connection timed out",
  UND_ERR_HEADERS_TIMEOUT: "storage did not answer in time",
  ENOTFOUND: "the storage host was not found",
  EAI_AGAIN: "the storage host was not found",
  ENETUNREACH: "the network is unreachable",
  EHOSTUNREACH: "the network is unreachable"
};
function putFailure(error) {
  for (let current = error, depth = 0; current && typeof current === "object" && depth < 8; depth += 1) {
    const code = current.code;
    const stall = typeof code === "string" ? PUT_STALLS[code] : void 0;
    if (stall)
      return stall;
    if (typeof code === "string" && /^[A-Z][A-Z0-9_]{1,40}$/.test(code))
      return "".concat(PUT_FAILURES[code] ?? "the connection failed", " (").concat(code, ")");
    if (current.name === "AbortError")
      return "the transfer was stopped";
    current = current.cause;
  }
  return "the connection failed";
}
function retryablePutStatus(status) {
  return status >= 500 || status === 408 || status === 429;
}
function storageAnswer(response) {
  return "HTTP ".concat(response.status).concat(response.errorCode ? " ".concat(response.errorCode) : "").concat(response.errorMessage ? ": ".concat(response.errorMessage) : "");
}
function putFailed(detail, operationId) {
  return new CliError(makeProblem("transport_error", "Upload to storage failed", 503, detail, {
    operation_id: operationId,
    hint: "Run the same command again to upload it again."
  }), ExitCode.Network);
}
var SUPPORTED_MEDIA_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg"
];
var MAX_TRANSPORT_BYTES = 1073741824;
var TRANSPORT_CEILING = {
  bytes: MAX_TRANSPORT_BYTES,
  message: "Media file exceeds the 1 GiB per-upload transport ceiling. Run screenrig project show to inspect used_bytes, any content_limit_bytes ceiling, and credit_remaining."
};
function uploadCeiling(contentType, videoBytes) {
  if (!contentType.startsWith("video/"))
    return TRANSPORT_CEILING;
  if (videoBytes === void 0)
    throw new Error("A video upload needs the project's video limit.");
  return {
    bytes: videoBytes,
    message: "Video exceeds the ".concat(videoLimitText(videoBytes), " limit for one video upload on this project's plan. Trim the video to a shorter clip, then run the upload again.")
  };
}
var EXTENSIONS = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg"
};
function supported(value) {
  return SUPPORTED_MEDIA_CONTENT_TYPES.includes(value);
}
async function prepareMediaUpload(filePath, explicitContentType, expectedSha256, videoBytes) {
  const filename = path2.basename(filePath);
  if (!filename || Buffer.byteLength(filename, "utf8") > 255)
    throw usageError("Media filename must be 1 to 255 bytes.");
  const contentType = explicitContentType ?? EXTENSIONS[path2.extname(filename).toLowerCase()];
  if (!contentType || !supported(contentType)) {
    throw usageError("Unsupported media type; use one of: ".concat(SUPPORTED_MEDIA_CONTENT_TYPES.join(", "), "."));
  }
  const bytes = await readMediaSnapshot(filePath, uploadCeiling(contentType, videoBytes));
  if (contentType === "image/webp" && readWebpContainer(bytes)?.lossless) {
    throw usageError("Lossless WebP (VP8L) is not accepted. Encode lossy WebP that keeps alpha, then upload with --no-transcode.");
  }
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (expectedSha256 !== void 0 && sha256 !== expectedSha256) {
    throw usageError("Media bytes changed after delivery verification; retry the upload. No upload was started.");
  }
  const commit = { content_type: contentType, bytes: bytes.length, sha256 };
  return { bytes, commit, declaration: { filename, ...commit } };
}
async function readMediaSnapshot(filePath, ceiling = TRANSPORT_CEILING) {
  let handle;
  try {
    handle = await open(filePath, constants.O_RDONLY | constants.O_NONBLOCK);
  } catch {
    throw usageError("Cannot open media file for reading.");
  }
  try {
    const before = await handle.stat();
    if (!before.isFile())
      throw usageError("Media input must be a regular file.");
    if (before.size < 1)
      throw usageError("Media file must not be empty.");
    if (before.size > ceiling.bytes)
      throw usageError(ceiling.message);
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
  } catch (error) {
    if (error instanceof CliError)
      throw error;
    throw usageError("Cannot read media file.");
  } finally {
    await handle.close();
  }
}
function validateMediaUploadSession(input, nowMs = Date.now(), label = "Media upload") {
  if (!input || typeof input !== "object" || typeof input.id !== "string" || input.id.length === 0 || !input.operation || typeof input.operation.id !== "string" || input.operation.id.length === 0) {
    throw usageError("".concat(label, " declaration returned an invalid binding."));
  }
  if (input.method !== "PUT")
    throw usageError("".concat(label, " declaration returned an unsupported method."));
  let parsed;
  try {
    parsed = new URL(input.upload_url);
  } catch {
    throw usageError("".concat(label, " declaration returned an invalid URL."));
  }
  if (!/^(https?:)$/.test(parsed.protocol) || !parsed.host || parsed.username || parsed.password) {
    throw usageError("".concat(label, " declaration returned an unsafe URL."));
  }
  if (!input.headers || typeof input.headers !== "object" || Array.isArray(input.headers)) {
    throw usageError("".concat(label, " declaration returned invalid signed headers."));
  }
  const headers = {};
  for (const [name, value] of Object.entries(input.headers)) {
    if (!name || typeof value !== "string" || !value || /[\r\n]/.test(name) || /[\r\n]/.test(value)) {
      throw usageError("".concat(label, " declaration returned invalid signed headers."));
    }
    headers[name] = value;
  }
  const expiresAt = Date.parse(input.expires_at);
  if (!Number.isFinite(expiresAt) || expiresAt <= nowMs)
    throw usageError("".concat(label, " declaration is expired or invalid."));
  return { id: input.id, operationId: input.operation.id, uploadUrl: input.upload_url, headers, expiresAt };
}
async function performSignedMediaPut(prepared, session, signedRawPut, options = {}) {
  return performSignedBodyPut(prepared.bytes, session, signedRawPut, options);
}
async function performSignedMediaStreamPut(body, session, signedRawPut) {
  return performSignedBodyPut(body, session, signedRawPut);
}
async function performSignedBodyPut(body, session, signedRawPut, options = {}) {
  const label = options.label ?? "Private media upload";
  const sleep = options.sleep ?? ((ms) => delay(ms));
  const maxAttempts = body instanceof Uint8Array ? PUT_ATTEMPTS : 1;
  const failed = (reason2, attempts) => "".concat(label, " to storage was interrupted: ").concat(reason2, ".").concat(attempts > 1 ? " It did not finish after ".concat(attempts, " attempts.") : "");
  let reason;
  for (let attempt = 1; ; attempt += 1) {
    if (Date.now() >= session.expiresAt) {
      throw putFailed(reason === void 0 ? "".concat(label, " could not start: its upload URL had expired.") : "".concat(failed(reason, attempt - 1), " Its upload URL expired before it could be sent again."), session.operationId);
    }
    let response;
    try {
      response = await signedRawPut({
        url: session.uploadUrl,
        method: "PUT",
        headers: session.headers,
        body,
        credentials: "omit",
        redirect: "error",
        expiresAt: session.expiresAt
      });
    } catch (error) {
      reason = putFailure(error);
    }
    if (response) {
      if (response.status >= 200 && response.status < 300)
        return;
      if (!retryablePutStatus(response.status)) {
        throw putFailed("".concat(label, " was refused by storage: ").concat(storageAnswer(response), "."), session.operationId);
      }
      reason = "storage answered ".concat(storageAnswer(response));
    }
    const why = reason ?? "the connection failed";
    if (attempt >= maxAttempts)
      throw putFailed(failed(why, attempt), session.operationId);
    const waitMs = Math.ceil(1e3 * 2 ** (attempt - 1) * (0.5 + Math.random() * 0.5));
    if (Date.now() + waitMs >= session.expiresAt) {
      throw putFailed("".concat(failed(why, attempt), " Its upload URL expired before it could be sent again."), session.operationId);
    }
    await sleep(waitMs);
  }
}
async function cancelInterruptedUpload(client, error) {
  const id = error.problem.operation_id;
  if (!id)
    return error;
  let hint;
  let next = error.problem.next;
  try {
    await client.call({ method: "POST", path: "/api/operations/".concat(encodeURIComponent(id), "/cancel"), idempotent: true, idempotencyKey: newIdempotencyKey() });
    hint = "Upload ".concat(id, " was cancelled, so it holds no storage. Run the same command again to upload it again.");
  } catch (cancelError) {
    if (cancelError instanceof CliError && cancelError.problem.status === 409) {
      hint = "Upload ".concat(id, " had already ended, so it holds no storage. Run the same command again to upload it again.");
    } else {
      const code = cancelError instanceof CliError ? cancelError.problem.code : "unexpected_error";
      hint = "Run the same command again to upload it again. Upload ".concat(id, " could not be cancelled (").concat(code, "), so it keeps its storage reserved until it is cancelled or the server releases it after 24 hours.");
      next = { command: "screenrig operations cancel ".concat(id), argv: ["operations", "cancel", id], reason: "Releases the storage the interrupted upload still holds." };
    }
  }
  return new CliError({ ...error.problem, hint, ...next ? { next } : {} }, error.exitCode, error.warnings);
}
function deriveCommitIdempotencyKey(base) {
  return deriveStepIdempotencyKey(base, "commit");
}
function deriveStepIdempotencyKey(base, step) {
  if (!isValidIdempotencyKey(base))
    throw usageError("Invalid base idempotency key for media ".concat(step, "."));
  const derived = createHash("sha256").update("screenrig.media.".concat(step, "\0")).update(base).digest("base64url");
  if (derived === base || !isValidIdempotencyKey(derived))
    throw usageError("Could not derive media ".concat(step, " idempotency key."));
  return derived;
}
function mediaPrimitiveOf(contentType) {
  const kind = contentType.split("/")[0];
  return kind === "image" || kind === "video" || kind === "audio" ? kind : void 0;
}
function replaceKindError(mediaId, primitive, file) {
  return usageError("".concat(file, " is not ").concat(primitive === "image" ? "an" : "a", " ").concat(primitive, " file, and ").concat(mediaId, " is ").concat(primitive === "image" ? "an" : "a", " ").concat(primitive, ": a replacement must be the same kind of file as the media it replaces. Nothing was uploaded."), { command: "screenrig media upload FILE", reason: "Add a file of another kind as new media instead; then point the playlist at it." });
}
function mediaPrimitiveOfFile(filePath, explicitContentType) {
  const contentType = explicitContentType ?? EXTENSIONS[path2.extname(filePath).toLowerCase()];
  return contentType && supported(contentType) ? mediaPrimitiveOf(contentType) : void 0;
}
async function hashLocalMediaFile(filePath) {
  const bytes = await readMediaSnapshot(filePath);
  return createHash("sha256").update(bytes).digest("hex");
}
function readyMediaId(operation) {
  const mediaId = operation.result?.media_id;
  return typeof mediaId === "string" && mediaId.length > 0 ? mediaId : void 0;
}
async function prepareMediaFileForUpload(input) {
  await assertDeclaredTypeMatchesBytes(input.sourcePath, input.explicitContentType);
  const sourceFilename = path2.basename(input.sourcePath);
  if (!sourceFilename || Buffer.byteLength(sourceFilename, "utf8") > 255) {
    throw usageError("Media filename must be 1 to 255 bytes.");
  }
  const sourceType = input.explicitContentType ?? EXTENSIONS[path2.extname(sourceFilename).toLowerCase()];
  const isVideo = input.noTranscode ? sourceType?.startsWith("video/") === true : classifySource(input.sourcePath, input.explicitContentType) === "video";
  const videoBytes = isVideo ? await projectVideoBytes(input.client) : void 0;
  let transcode;
  if (!input.noTranscode) {
    transcode = await transcodeForUpload({
      runtime: input.runtime,
      filePath: input.sourcePath,
      explicitContentType: input.explicitContentType,
      options: input.transcodeOptions,
      reporter: input.reporter,
      videoBytes
    });
  }
  try {
    const prepared = transcode ? await prepareMediaUpload(transcode.filePath, transcode.contentType, transcode.verifiedSha256, videoBytes) : await prepareMediaUpload(input.sourcePath, input.explicitContentType, void 0, videoBytes);
    prepared.declaration.source_filename = sourceFilename;
    if (input.tag !== void 0) {
      prepared.declaration.tag = input.tag;
    }
    if (input.folderId !== void 0) {
      prepared.declaration.folder_id = input.folderId;
    }
    return { prepared, transcode };
  } catch (error) {
    if (transcode?.cleanupDir) {
      await rm(transcode.cleanupDir, { recursive: true, force: true });
    }
    throw error;
  }
}
async function cleanupPreparedMediaFile(prepared) {
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
    ...transcode.video ? { video: transcode.video } : {}
  };
}
function uploadWarnings(prepared, transcode) {
  const warnings = (transcode?.warnings ?? []).map((message) => ({ code: "transcode_warning", message }));
  if (transcode?.resized) {
    const { sourceWidth, sourceHeight, width, height, maxEdge } = transcode.resized;
    warnings.push({
      code: "image_resized",
      message: "".concat(prepared.declaration.source_filename ?? prepared.declaration.filename, " was ").concat(sourceWidth, "x").concat(sourceHeight, " and was ") + "scaled down to ".concat(width, "x").concat(height, " to fit the ").concat(maxEdge, " px bound on each edge. The stored still is smaller ") + "than the source; add --max-edge to tighten the bound further, or supply a smaller source to keep control of the result."
    });
  }
  const filenameWarning = lowInformationFilenameWarning(prepared.declaration.source_filename ?? prepared.declaration.filename);
  if (filenameWarning)
    warnings.push({ code: "generic_filename", message: filenameWarning });
  return warnings;
}
async function submitPreparedMedia(input, preparedFile) {
  const { runtime, client } = input;
  const { prepared } = preparedFile;
  const declareKey = input.idempotencyKey ?? client.idempotencyKey;
  if (input.replace?.primitive && mediaPrimitiveOf(prepared.declaration.content_type) !== input.replace.primitive) {
    throw replaceKindError(input.replace.mediaId, input.replace.primitive, prepared.declaration.source_filename ?? prepared.declaration.filename);
  }
  let mark = runtime.now().getTime();
  const lap = () => {
    const now = runtime.now().getTime();
    const elapsed = now - mark;
    mark = now;
    return elapsed;
  };
  const declarationResponse = await client.call({
    method: "POST",
    path: "/api/media/uploads",
    idempotent: true,
    idempotencyKey: declareKey,
    body: prepared.declaration
  });
  if (declarationResponse.headers["cache-control"] !== "private, no-store") {
    throw usageError("Media upload declaration did not return the required private, no-store cache policy.");
  }
  const session = validateMediaUploadSession(declarationResponse.body, runtime.now().getTime());
  const declare_ms = lap();
  if (input.onDeclared) {
    await input.onDeclared(session);
  }
  lap();
  try {
    await performSignedMediaPut(prepared, session, runtime.signedRawPut ?? fetchSignedRawPut(), { sleep: runtime.sleep });
  } catch (error) {
    if (input.resumable || !(error instanceof CliError))
      throw error;
    throw await cancelInterruptedUpload(client, error);
  }
  const transfer_ms = lap();
  const commitResponse = input.replace ? await requestReplace(input, input.replace, session, declareKey) : await client.call({
    method: "POST",
    path: "/api/media/uploads/".concat(session.id, "/commit"),
    idempotent: true,
    idempotencyKey: deriveCommitIdempotencyKey(declareKey),
    body: prepared.commit
  });
  let operation = commitResponse.body;
  const timing = { declare_ms, transfer_ms, commit_ms: lap() };
  if (!input.noWait) {
    operation = await client.waitForOperation(operation.id, {
      timeoutMs: input.timeoutMs ?? 12e4,
      pollMs: input.pollMs ?? 1e3,
      sleep: runtime.sleep
    });
    timing.processing_ms = lap();
  }
  return { mediaId: readyMediaId(operation) ?? input.replace?.mediaId, operation, timing };
}
async function requestReplace(input, target, session, declareKey) {
  try {
    return await input.client.call({
      method: "POST",
      path: "/api/media/".concat(encodeURIComponent(target.mediaId), "/replace"),
      idempotent: true,
      idempotencyKey: deriveStepIdempotencyKey(declareKey, "replace"),
      ...target.ifMatch !== void 0 ? { headers: { "if-match": quotedRevision(target.ifMatch) } } : {},
      body: { upload_id: session.id, ...target.note !== void 0 ? { note: target.note } : {} }
    });
  } catch (error) {
    const status = error instanceof CliError ? error.problem.status : void 0;
    if (input.resumable || !(error instanceof CliError) || typeof status !== "number" || status >= 500 || status === 408 || status === 429)
      throw error;
    throw await releaseRefusedUpload(input.client, session.operationId, error);
  }
}
async function releaseRefusedUpload(client, operationId, error) {
  try {
    await client.call({ method: "POST", path: "/api/operations/".concat(encodeURIComponent(operationId), "/cancel"), idempotent: true, idempotencyKey: newIdempotencyKey() });
  } catch {
    return error;
  }
  return error.problem.hint ? error : new CliError({ ...error.problem, hint: "Upload ".concat(operationId, " was cancelled, so it holds no storage.") }, error.exitCode, error.warnings);
}
function asRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return void 0;
  return value;
}
async function storedMediaFilename(client, mediaId) {
  try {
    const response = await client.call({ method: "GET", path: "/api/media/".concat(mediaId) });
    const body = asRecord(response.body);
    const filename = typeof body?.filename === "string" && body.filename.length > 0 ? body.filename : void 0;
    const sourceFilename = typeof body?.source_filename === "string" && body.source_filename.length > 0 ? body.source_filename : void 0;
    return { ...filename ? { filename } : {}, ...sourceFilename ? { source_filename: sourceFilename } : {} };
  } catch {
    return {};
  }
}
async function existingUpload(client, declaration) {
  try {
    const primitive = declaration.content_type.split("/")[0];
    const response = await client.listAll("/api/media", { primitive });
    const items = asRecord(response.body)?.items;
    if (!Array.isArray(items))
      return void 0;
    const match = items.map(asRecord).find((item) => {
      if (!item || item.state !== "ready" || typeof item.id !== "string" || typeof item.operation_id !== "string")
        return false;
      const source = asRecord(item.upload_source) ?? item;
      return source.sha256 === declaration.sha256 && source.bytes === declaration.bytes && source.content_type === declaration.content_type && source.source_filename === declaration.source_filename && item.tag === declaration.tag && (declaration.folder_id === void 0 || item.folder_id === declaration.folder_id);
    });
    if (!match)
      return void 0;
    const operation = await client.getOperation(match.operation_id);
    if (operation.state !== "succeeded" || readyMediaId(operation) !== match.id)
      return void 0;
    return {
      mediaId: match.id,
      operation,
      ...typeof match.filename === "string" ? { filename: match.filename } : {},
      ...typeof match.source_filename === "string" ? { source_filename: match.source_filename } : {}
    };
  } catch {
    return void 0;
  }
}
async function uploadMediaFile(input) {
  const started = input.runtime.now().getTime();
  if (input.replace?.primitive) {
    const local = mediaPrimitiveOfFile(input.sourcePath, input.explicitContentType);
    if (local !== void 0 && local !== input.replace.primitive) {
      throw replaceKindError(input.replace.mediaId, input.replace.primitive, path2.basename(input.sourcePath));
    }
  }
  const preparedFile = await prepareMediaFileForUpload(input);
  const prepare_ms = input.runtime.now().getTime() - started;
  try {
    const existing = input.replace ? void 0 : await existingUpload(input.client, preparedFile.prepared.declaration);
    const submitted = existing ? { mediaId: existing.mediaId, operation: existing.operation, reused: true, timing: { prepare_ms } } : await submitPreparedMedia(input, preparedFile).then(({ timing, ...rest }) => ({ ...rest, reused: false, timing: { prepare_ms, ...timing } }));
    const stored = existing ?? (submitted.mediaId && !input.replace ? await storedMediaFilename(input.client, submitted.mediaId) : {});
    return {
      ...submitted,
      upload: {
        filename: stored.filename ?? preparedFile.prepared.declaration.filename,
        declared_filename: preparedFile.prepared.declaration.filename,
        filename_source: stored.filename ? "server" : "declared",
        ...stored.source_filename ?? preparedFile.prepared.declaration.source_filename ? { source_filename: stored.source_filename ?? preparedFile.prepared.declaration.source_filename } : {},
        content_type: preparedFile.prepared.declaration.content_type,
        bytes: preparedFile.prepared.declaration.bytes,
        sha256: preparedFile.prepared.declaration.sha256,
        ...preparedFile.prepared.declaration.tag ? { tag: preparedFile.prepared.declaration.tag } : {},
        ...preparedFile.prepared.declaration.folder_id ? { folder_id: preparedFile.prepared.declaration.folder_id } : {}
      },
      transcode: transcodeEnvelope(preparedFile.transcode),
      warnings: uploadWarnings(preparedFile.prepared, preparedFile.transcode)
    };
  } finally {
    await cleanupPreparedMediaFile(preparedFile);
  }
}

export {
  SUPPORTED_MEDIA_CONTENT_TYPES,
  validateMediaUploadSession,
  performSignedMediaStreamPut,
  performSignedBodyPut,
  hashLocalMediaFile,
  readyMediaId,
  prepareMediaFileForUpload,
  cleanupPreparedMediaFile,
  submitPreparedMedia,
  uploadMediaFile
};
