import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  canonicalJson
} from "./chunk-IHXC5MOO.js";
import {
  handlePlaylistFields,
  handlePlaylistInstances,
  templateClearOption,
  templateSetOption
} from "./chunk-IQRO2VYC.js";
import {
  callPlaylist
} from "./chunk-RUNYOLA6.js";
import {
  handlePlaylistPromote,
  handlePlaylistRevisionShow,
  handlePlaylistRevisions
} from "./chunk-62YDP7Y7.js";
import {
  apexHost
} from "./chunk-BWPKDRCP.js";
import {
  subcommand
} from "./chunk-QUFYJQPR.js";
import {
  table
} from "./chunk-CKOG7ZL3.js";
import {
  assertOutputAvailable,
  readAuthoringJson,
  readInputBytes,
  writeAuthoringJson,
  writeOutputFile
} from "./chunk-OFOJKZJN.js";
import {
  requireCapability
} from "./chunk-VPHUSKMY.js";
import {
  FEED_AREA_UNKNOWN,
  FEED_CATEGORIES,
  FEED_CERTAINTIES,
  FEED_FAMILIES,
  FEED_PROVIDERS,
  FEED_SCOPES,
  FEED_SEVERITIES,
  FEED_STATUSES,
  FEED_URGENCIES,
  cardDetailsHuman,
  cardId,
  cardProperties,
  cardUid,
  feedListOption,
  feedQuery,
  validatePlaylistCards
} from "./chunk-HQPJWYRP.js";
import {
  performSignedMediaStreamPut,
  uploadMediaFile,
  validateMediaUploadSession
} from "./chunk-4ENHCVGW.js";
import {
  Argument,
  NOTE_HELP,
  Option,
  positiveInteger,
  reviewNoteOption,
  revision
} from "./chunk-A2S45EKE.js";
import {
  clientFor,
  commandHandler,
  humanLines,
  isScreenId,
  jsonBody,
  libraryQuery,
  pendingReviewResult,
  playlistWriteResult,
  progressReporterFor,
  quotedRevision,
  requireFlagValue,
  requireToken,
  resolveProjectContext,
  resourceNotes,
  reviewNoteFrom,
  scheduleZoneError,
  simpleGet,
  simpleList,
  transcodeOptionsFromArgs
} from "./chunk-SX4HKPRA.js";
import "./chunk-UD3J3FNQ.js";
import {
  loggerOf
} from "./chunk-PPWTLS44.js";
import {
  fetchSignedRawPut,
  pendingReviewLines,
  pendingReviewOf,
  pendingReviewWarning,
  playlistAnswerWarnings,
  playlistWarnings,
  reviewDetailLines,
  reviewListLines,
  reviewNext,
  reviewNoteHeaders,
  withoutAnswerWarnings
} from "./chunk-RY7TSGK3.js";
import {
  accessClaims,
  flagBool,
  flagNumber,
  flagString,
  isValidIdempotencyKey,
  playlistInUseProblem,
  successEnvelope
} from "./chunk-D2RLMLYO.js";
import {
  BACKGROUNDS_PATH,
  BACKGROUND_ORIENTATIONS,
  DEFAULT_BACKGROUND_COLOR,
  PLAYLIST_SERVER_CHECKS,
  assertPlaylistValid,
  assertWirePages,
  backgroundColor,
  backgroundId,
  backgroundOrSetId,
  backgroundUrl,
  editablePlaylist,
  hasScreenToken,
  iframeSnippetSource,
  imageBackgroundOf,
  isAdSlotPage,
  playlistLint,
  playlistNeedsTimezone,
  preparePlaylist,
  screenTemplateRefusal,
  screenTokenStandIn,
  setBackgroundColor,
  shortApplicationPageWarning,
  targetDimensions,
  validatePlaylistWrite,
  wallSize,
  withCanvasBackground
} from "./chunk-QFUGQ3ET.js";
import "./chunk-4QJFIFQH.js";
import "./chunk-7EJTDXNL.js";
import "./chunk-BFLHHH47.js";
import "./chunk-P3D5NU6C.js";
import {
  RESOURCE_ID_PATTERNS,
  isResourceID
} from "./chunk-SFYZH3GR.js";
import {
  addCommandExamples,
  addCommandNotes,
  requireOptionGroup
} from "./chunk-IBLNZ4EM.js";
import {
  CliError,
  ExitCode,
  makeProblem,
  parseRetryAfter,
  redactText,
  unexpectedResponseError,
  usageError
} from "./chunk-JP4OQPAN.js";
import "./chunk-PGM5AQER.js";
import "./chunk-G4R5Q7OS.js";
import "./chunk-LMVLFNSU.js";
import "./chunk-XAYSKU3G.js";
import "./chunk-3FYAGULW.js";

// dist/playlist-release.js
import { createHash } from "node:crypto";
function playlistReferences(screen, playlistId2) {
  const entries = screen.playlist_schedule?.entries;
  if (screen.playlist_schedule != null && (!Array.isArray(entries) || entries.some((entry) => !entry || typeof entry.id !== "string" || typeof entry.playlist_id !== "string"))) {
    throw usageError("Cannot determine affected screens: invalid playlist schedule.");
  }
  if (screen.takeover != null && typeof screen.takeover.playlist_id !== "string") {
    throw usageError("Cannot determine affected screens: invalid takeover.");
  }
  if (screen.effective_playlist != null && typeof screen.effective_playlist.id !== "string") {
    throw usageError("Cannot determine affected screens: invalid effective playlist.");
  }
  const scheduled = entries?.filter((entry) => entry.playlist_id === playlistId2) ?? [];
  return {
    default_assignment: screen.playlist_id === playlistId2 ? playlistId2 : void 0,
    schedule_entries: scheduled.length ? scheduled : void 0,
    takeover: screen.takeover?.playlist_id === playlistId2 ? screen.takeover : void 0,
    effective_playlist: screen.effective_playlist?.id === playlistId2 ? screen.effective_playlist : void 0
  };
}
async function replacePlaylistRelease(options) {
  const { client, playlistId: playlistId2, pageId, primitiveId, releaseId } = options;
  if (!options.apply && (options.revision || options.impact)) {
    throw usageError("Preview without write flags first. Use --apply to write; revision and impact guards are optional.");
  }
  const response = await client.call({ method: "GET", path: "/api/playlists/".concat(playlistId2) });
  const resource = response.body;
  if (resource?.id !== playlistId2 || !Number.isSafeInteger(resource.revision) || resource.revision < 1)
    throw usageError("Playlist response has invalid identity or revision.");
  if (options.apply && options.revision !== void 0 && options.revision !== String(resource.revision)) {
    throw new CliError(makeProblem("revision_conflict", "Playlist changed", 412, "Preview the replacement again before applying.", { current_revision: resource.revision }));
  }
  const document = editablePlaylist(response.body);
  const pages = document.pages.filter((page) => page.id === pageId);
  if (pages.length !== 1)
    throw usageError("Page ID must identify exactly one page in this playlist.");
  const primitives = pages[0].primitives.filter((primitive2) => primitive2.id === primitiveId);
  if (primitives.length !== 1 || primitives[0].primitive !== "application")
    throw usageError("Primitive ID must identify exactly one application on the selected page.");
  const primitive = primitives[0];
  const previousRelease = primitive.release_id;
  const unchanged = previousRelease === releaseId;
  primitive.release_id = releaseId;
  assertPlaylistValid(document);
  const impactChecked = !options.apply || options.impact !== void 0;
  const screens = [];
  for (const query of !options.apply || options.impact ? [void 0, { state: "archived" }] : []) {
    const listed = await client.listAll("/api/screens", query);
    const items = listed.body?.items;
    if (!Array.isArray(items))
      throw usageError("Cannot determine affected screens: invalid screen list.");
    for (const screen of items) {
      if (!screen || typeof screen !== "object")
        throw usageError("Cannot determine affected screens: invalid screen.");
      const references = playlistReferences(screen, playlistId2);
      if (Object.values(references).every((value) => value === void 0))
        continue;
      if (typeof screen.id !== "string" || !Number.isSafeInteger(screen.revision) || screen.revision < 1 || !["active", "pairing_pending", "archived"].includes(screen.state))
        throw usageError("Cannot determine affected screens: invalid screen identity, state or revision.");
      if (screens.some((item) => item.id === screen.id))
        throw usageError("Screen state changed while listing impact. Preview again.");
      screens.push({ id: screen.id, label: screen.label, state: screen.state, revision: screen.revision, references });
    }
  }
  screens.sort((a, b) => a.id.localeCompare(b.id));
  const review = {
    playlist_id: playlistId2,
    playlist_name: document.name,
    revision: resource.revision,
    page_id: pageId,
    primitive_id: primitiveId,
    previous_release_id: previousRelease,
    release_id: releaseId,
    affected_screens: impactChecked ? screens.map(({ references, ...screen }) => screen) : void 0,
    consequence: "Lists screens whose default assignment, stored schedule entries, takeover or current effective playlist references this shared playlist. Archived screens retain the new pin for later use. References are a snapshot; a supplied playlist revision is checked atomically. Release availability and ownership are checked by the server on apply."
  };
  const impact = createHash("sha256").update(canonicalJson(JSON.stringify({
    api_url: options.apiUrl,
    review,
    document,
    references: screens.map(({ id, references }) => ({ id, references }))
  }))).digest("hex");
  if (!options.apply)
    return { ...review, impact, applied: false };
  if (options.impact !== void 0 && options.impact !== impact) {
    throw new CliError(makeProblem("resource_conflict", "Replacement impact changed", 409, "Replacement or affected screens changed since the preview. Preview again and review the new impact before applying.", { current_revision: resource.revision }));
  }
  if (unchanged)
    return { ...review, impact, applied: true, unchanged: true, playlist: response.body };
  const updated = await client.call({
    method: "PUT",
    path: "/api/playlists/".concat(playlistId2),
    idempotent: true,
    headers: { ...reviewNoteHeaders(options.note), ...options.revision ? { "if-match": quotedRevision(options.revision) } : {} },
    body: document
  });
  const pending = pendingReviewOf(updated);
  if (pending)
    return {
      ...review,
      impact,
      applied: false,
      status: "pending_review",
      review: pending.review,
      playlist: pending.playlist,
      ...pending.warnings ? { warnings: pending.warnings } : {}
    };
  const written = updated.body?.revision;
  return { ...review, ...Number.isSafeInteger(written) ? { revision: written, previous_revision: review.revision } : {}, impact, applied: true, playlist: updated.body };
}

// dist/handlers/playlist.js
import { createHash as createHash3 } from "node:crypto";
import { stat } from "node:fs/promises";
import path2 from "node:path";

// dist/playlist-bundle.js
import { createHash as createHash2 } from "node:crypto";
import { constants } from "node:fs";
import { chmod, lstat, mkdir, mkdtemp, open, realpath, rename, rm } from "node:fs/promises";
import path from "node:path";

// dist/selector-tokens.js
function asRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
}
function selectorHasScreenTokens(selector) {
  const record2 = asRecord(selector);
  const tags = [record2.tag];
  const groups = asRecord(record2.tags);
  for (const key of ["all", "any", "none"]) {
    if (Array.isArray(groups[key]))
      tags.push(...groups[key]);
  }
  return tags.some((tag) => typeof tag === "string" && tag.includes("{screen."));
}

// dist/playlist-bundle.js
var PLAYLIST_BUNDLE_SCHEMA = "screenrig.playlist-bundle/v1";
var PLAYLIST_BUNDLE_MANIFEST = "screenrig-bundle.json";
var PLAYLIST_BUNDLE_PLAYLIST = "playlist.json";
var JSON_FILE_LIMIT = 8 * 1024 * 1024;
var MAX_MEDIA_BYTES = 1073741824;
var MEDIA_UPLOAD_ADMISSION_QUOTA = 20;
var MEDIA_UPLOAD_ADMISSION_WINDOW_MS = 6e4;
var MEDIA_UPLOAD_RATE_LIMIT_RETRIES = 1;
var SHA256_PATTERN = /^[a-f0-9]{64}$/;
var MEDIA_ID_PATTERN = RESOURCE_ID_PATTERNS.media;
var CONTROL_PATTERN = /[\u0000-\u001F\u007F]/u;
var EXTENSION_BY_TYPE = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "audio/mpeg": ".mp3"
};
function record(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw usageError("".concat(name, " must be a JSON object."));
  }
  return value;
}
function stringField(owner, key, name) {
  const value = owner[key];
  if (typeof value !== "string" || value.length === 0) {
    throw usageError("".concat(name, ".").concat(key, " must be a non-empty string."));
  }
  return value;
}
function integerField(owner, key, name) {
  const value = owner[key];
  if (!Number.isSafeInteger(value) || value < 0) {
    throw usageError("".concat(name, ".").concat(key, " must be a non-negative whole number."));
  }
  return value;
}
function stringListField(owner, key, name, maxItems, maxLength) {
  const value = owner[key];
  if (!Array.isArray(value) || value.length < 1 || value.length > maxItems || value.some((entry) => typeof entry !== "string" || entry.length < 1 || entry.length > maxLength)) {
    throw usageError("".concat(name, ".").concat(key, " must be 1 to ").concat(maxItems, " non-empty strings of at most ").concat(maxLength, " characters."));
  }
  return [...value];
}
function exactKeys(owner, allowed, name) {
  const extras = Object.keys(owner).filter((key) => !allowed.includes(key));
  if (extras.length > 0)
    throw usageError("".concat(name, " contains unsupported fields: ").concat(extras.join(", "), "."));
}
function canonicalExtension(contentType) {
  const extension = EXTENSION_BY_TYPE[contentType];
  if (!extension)
    throw usageError("Unsupported bundle media content type: ".concat(contentType, "."));
  return extension;
}
function safeRelativePath(value, name) {
  if (!value || CONTROL_PATTERN.test(value) || value.includes("\\") || path.posix.isAbsolute(value) || path.win32.isAbsolute(value)) {
    throw usageError("".concat(name, " must be a safe relative POSIX path."));
  }
  const parts = value.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) {
    throw usageError("".concat(name, " must not contain empty or traversal segments."));
  }
  if (path.posix.normalize(value) !== value)
    throw usageError("".concat(name, " is not normalized."));
  return value;
}
function safeFilename(value) {
  if (CONTROL_PATTERN.test(value) || value.includes("/") || value.includes("\\") || Buffer.byteLength(value, "utf8") > 255) {
    throw usageError("Bundle media filename must be a 1 to 255 byte basename without control characters.");
  }
  return value;
}
function sparse(info) {
  return typeof info.blocks === "number" && info.blocks * 512 < info.size;
}
async function assertNoSymlinkAncestors(target, allowMissing = false) {
  const root = path.parse(target).root;
  let current = path.dirname(target);
  while (current !== root) {
    let info;
    try {
      info = await lstat(current);
    } catch (error) {
      if (allowMissing && error.code === "ENOENT") {
        current = path.dirname(current);
        continue;
      }
      throw usageError("Cannot inspect bundle ancestor ".concat(current, ": ").concat(error instanceof Error ? error.message : "missing path"));
    }
    if (info.isSymbolicLink())
      throw usageError("Bundle path has a symlinked ancestor: ".concat(current, "."));
    if (!info.isDirectory())
      throw usageError("Bundle ancestor is not a directory: ".concat(current, "."));
    current = path.dirname(current);
  }
}
async function openBundleFile(root, relative, maxBytes) {
  safeRelativePath(relative, "Bundle file path");
  const absolute = path.resolve(root, relative);
  const prefix = root.endsWith(path.sep) ? root : "".concat(root).concat(path.sep);
  if (!absolute.startsWith(prefix))
    throw usageError("Bundle file escaped the bundle directory.");
  let canonicalRoot;
  let canonicalFile;
  try {
    [canonicalRoot, canonicalFile] = await Promise.all([realpath(root), realpath(absolute)]);
  } catch (error) {
    throw usageError("Cannot resolve bundle file ".concat(relative, ": ").concat(error instanceof Error ? error.message : "missing file"));
  }
  const canonicalPrefix = canonicalRoot.endsWith(path.sep) ? canonicalRoot : "".concat(canonicalRoot).concat(path.sep);
  if (canonicalRoot !== root || canonicalFile !== absolute || !canonicalFile.startsWith(canonicalPrefix)) {
    throw usageError("Bundle file must stay within the real, symlink-free bundle root: ".concat(relative, "."));
  }
  let before;
  try {
    before = await lstat(absolute);
  } catch (error) {
    throw usageError("Cannot inspect bundle file ".concat(relative, ": ").concat(error instanceof Error ? error.message : "missing file"));
  }
  if (before.isSymbolicLink())
    throw usageError("Bundle file must not be a symlink: ".concat(relative, "."));
  if (!before.isFile())
    throw usageError("Bundle path must be a regular file: ".concat(relative, "."));
  if (before.nlink !== 1)
    throw usageError("Bundle file must not be a hardlink: ".concat(relative, "."));
  if (sparse(before))
    throw usageError("Bundle file must not be sparse: ".concat(relative, "."));
  if (before.size > maxBytes)
    throw usageError("Bundle file exceeds its size limit: ".concat(relative, "."));
  let handle;
  try {
    handle = await open(absolute, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  } catch (error) {
    throw usageError("Cannot open bundle file ".concat(relative, ": ").concat(error instanceof Error ? error.message : "open failed"));
  }
  const after = await handle.stat();
  if (!after.isFile() || after.nlink !== 1 || sparse(after) || after.dev !== before.dev || after.ino !== before.ino) {
    await handle.close();
    throw usageError("Bundle file changed or is unsafe: ".concat(relative, "."));
  }
  return { absolute, handle, info: after };
}
async function readBundleJson(root, relative) {
  const opened = await openBundleFile(root, relative, JSON_FILE_LIMIT);
  try {
    const text = await opened.handle.readFile("utf8");
    return JSON.parse(text);
  } catch (error) {
    throw usageError("Cannot parse ".concat(relative, ": ").concat(error instanceof Error ? error.message : "invalid JSON"));
  } finally {
    await opened.handle.close();
  }
}
async function holdVerifiedBundleFile(root, relative, expectedBytes) {
  const opened = await openBundleFile(root, relative, MAX_MEDIA_BYTES);
  try {
    if (opened.info.size !== expectedBytes) {
      throw usageError("Bundle media length mismatch for ".concat(relative, ": expected ").concat(expectedBytes, ", found ").concat(opened.info.size, "."));
    }
    const hash = createHash2("sha256");
    for await (const chunk of opened.handle.createReadStream({ autoClose: false, start: 0 }))
      hash.update(chunk);
    return { path: opened.absolute, handle: opened.handle, sha256: hash.digest("hex") };
  } catch (error) {
    await opened.handle.close();
    throw error;
  }
}
function parseManifest(input) {
  const root = record(input, PLAYLIST_BUNDLE_MANIFEST);
  exactKeys(root, ["schema", "selector_policy", "comments_policy", "playlist", "media"], PLAYLIST_BUNDLE_MANIFEST);
  if (root.schema !== PLAYLIST_BUNDLE_SCHEMA) {
    throw usageError("".concat(PLAYLIST_BUNDLE_MANIFEST, ".schema must be ").concat(PLAYLIST_BUNDLE_SCHEMA, "."));
  }
  if (root.selector_policy !== "snapshot") {
    throw usageError("".concat(PLAYLIST_BUNDLE_MANIFEST, ".selector_policy must be snapshot."));
  }
  if (root.comments_policy !== "excluded") {
    throw usageError("".concat(PLAYLIST_BUNDLE_MANIFEST, ".comments_policy must be excluded."));
  }
  const playlist = record(root.playlist, "".concat(PLAYLIST_BUNDLE_MANIFEST, ".playlist"));
  exactKeys(playlist, ["source_id", "source_revision", "path"], "".concat(PLAYLIST_BUNDLE_MANIFEST, ".playlist"));
  const sourceId = stringField(playlist, "source_id", "".concat(PLAYLIST_BUNDLE_MANIFEST, ".playlist"));
  if (!isResourceID(sourceId, "playlist"))
    throw usageError("Bundle source playlist id must be a playlist identifier.");
  const sourceRevision = integerField(playlist, "source_revision", "".concat(PLAYLIST_BUNDLE_MANIFEST, ".playlist"));
  if (sourceRevision < 1)
    throw usageError("Bundle source playlist revision must be positive.");
  if (playlist.path !== PLAYLIST_BUNDLE_PLAYLIST) {
    throw usageError("Bundle playlist path must be ".concat(PLAYLIST_BUNDLE_PLAYLIST, "."));
  }
  if (!Array.isArray(root.media))
    throw usageError("".concat(PLAYLIST_BUNDLE_MANIFEST, ".media must be an array."));
  const seenIds = /* @__PURE__ */ new Set();
  const media = root.media.map((value, index) => {
    const itemName = "".concat(PLAYLIST_BUNDLE_MANIFEST, ".media[").concat(index, "]");
    const item = record(value, itemName);
    exactKeys(item, ["source_id", "path", "filename", "content_type", "bytes", "sha256", "tag"], itemName);
    const id = stringField(item, "source_id", itemName);
    if (!MEDIA_ID_PATTERN.test(id))
      throw usageError("".concat(itemName, ".source_id is not a media id."));
    if (seenIds.has(id))
      throw usageError("Bundle media source id is duplicated: ".concat(id, "."));
    seenIds.add(id);
    const sha256 = stringField(item, "sha256", itemName);
    if (!SHA256_PATTERN.test(sha256))
      throw usageError("".concat(itemName, ".sha256 must be lowercase SHA-256 hex."));
    const contentType = stringField(item, "content_type", itemName);
    const expectedPath = "media/".concat(sha256).concat(canonicalExtension(contentType));
    const mediaPath = safeRelativePath(stringField(item, "path", itemName), "".concat(itemName, ".path"));
    if (mediaPath !== expectedPath)
      throw usageError("".concat(itemName, ".path must be ").concat(expectedPath, "."));
    const filename = safeFilename(stringField(item, "filename", itemName));
    const bytes = integerField(item, "bytes", itemName);
    if (bytes < 1 || bytes > MAX_MEDIA_BYTES)
      throw usageError("".concat(itemName, ".bytes is outside the media upload bounds."));
    const tag = item.tag;
    if (tag !== void 0 && (typeof tag !== "string" || !/^[A-Za-z0-9]{1,32}$/.test(tag))) {
      throw usageError("".concat(itemName, ".tag must be 1 to 32 letters or digits."));
    }
    return {
      source_id: id,
      path: mediaPath,
      filename,
      content_type: contentType,
      bytes,
      sha256,
      ...typeof tag === "string" ? { tag } : {}
    };
  });
  return {
    schema: PLAYLIST_BUNDLE_SCHEMA,
    selector_policy: "snapshot",
    comments_policy: "excluded",
    playlist: { source_id: sourceId, source_revision: sourceRevision, path: PLAYLIST_BUNDLE_PLAYLIST },
    media
  };
}
async function preflightPlaylistBundle(directory) {
  const root = path.resolve(directory);
  await assertNoSymlinkAncestors(root);
  let rootInfo;
  try {
    rootInfo = await lstat(root);
  } catch (error) {
    throw usageError("Cannot inspect playlist bundle directory: ".concat(error instanceof Error ? error.message : "missing directory"));
  }
  if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) {
    throw usageError("Playlist bundle source must be a real directory, not a symlink.");
  }
  let canonicalRoot;
  try {
    canonicalRoot = await realpath(root);
  } catch (error) {
    throw usageError("Cannot resolve playlist bundle directory: ".concat(error instanceof Error ? error.message : "missing directory"));
  }
  if (canonicalRoot !== root)
    throw usageError("Playlist bundle source must have no symlinked path components.");
  const manifest = parseManifest(await readBundleJson(root, PLAYLIST_BUNDLE_MANIFEST));
  const playlist = record(await readBundleJson(root, PLAYLIST_BUNDLE_PLAYLIST), PLAYLIST_BUNDLE_PLAYLIST);
  const mediaPrimitives = new Map(manifest.media.map((item) => [
    item.source_id,
    item.content_type.startsWith("image/") ? "image" : item.content_type.startsWith("audio/") ? "audio" : "video"
  ]));
  const referenced = validatePlaylistWrite(playlist, mediaPrimitives);
  const listed = new Set(manifest.media.map((item) => item.source_id));
  const missing = [...referenced].filter((id) => !listed.has(id));
  const unused = [...listed].filter((id) => !referenced.has(id));
  if (missing.length > 0)
    throw usageError("Bundle manifest is missing referenced media: ".concat(missing.join(", "), "."));
  if (unused.length > 0)
    throw usageError("Bundle manifest lists unreferenced media: ".concat(unused.join(", "), "."));
  const files = /* @__PURE__ */ new Map();
  const close = async () => {
    const held = [...files.values()];
    files.clear();
    await Promise.allSettled(held.map((file) => file.handle.close()));
  };
  try {
    for (const item of manifest.media) {
      const verified = await holdVerifiedBundleFile(root, item.path, item.bytes);
      if (verified.sha256 !== item.sha256) {
        await verified.handle.close();
        throw usageError("Bundle media SHA-256 mismatch for ".concat(item.path, "."));
      }
      files.set(item.source_id, { path: verified.path, handle: verified.handle });
    }
  } catch (error) {
    await close();
    throw error;
  }
  return { root, manifest, playlist, files, close };
}
function normalizedMediaSelector(input) {
  const selector = record(input, "Playlist media selector");
  let ids;
  if (selector.by === "id") {
    ids = [stringField(selector, "media_id", "Playlist media selector")];
  } else if (selector.by === "ids" && Array.isArray(selector.media_ids)) {
    ids = selector.media_ids.map((id) => {
      if (typeof id !== "string")
        throw usageError("Playlist contains an invalid snapshotted media id.");
      return id;
    });
  } else {
    throw usageError("Playlist export requires selectors snapshotted to by:id or by:ids.");
  }
  if (ids.length < 1 || ids.length > 1024 || ids.some((id) => !MEDIA_ID_PATTERN.test(id))) {
    throw usageError("Playlist export requires 1 to 1024 valid snapshotted media ids per primitive.");
  }
  if (new Set(ids).size !== ids.length)
    throw usageError("Playlist contains duplicate resolved media ids in one selector.");
  const oneAtATime = selector.one_at_a_time === true;
  if (ids.length === 1 && !oneAtATime)
    return { by: "id", media_id: ids[0] };
  return { by: "ids", media_ids: ids, one_at_a_time: oneAtATime };
}
function cloneJson(value) {
  return structuredClone(value);
}
function normalizePlaylistForBundle(input, options = {}) {
  const source = record(input, "Playlist");
  const id = stringField(source, "id", "Playlist");
  const revision2 = integerField(source, "revision", "Playlist");
  const name = stringField(source, "name", "Playlist");
  const editableNext = {
    command: "screenrig playlist show ".concat(id, " --output playlist.json"),
    reason: "Write an editable document with the existing card and application references in this project."
  };
  if (!Array.isArray(source.pages))
    throw usageError("Playlist.pages must be an array.");
  const mediaIds = /* @__PURE__ */ new Set();
  const skipped = { primitives: [], pages: [] };
  const pages = [];
  source.pages.forEach((pageValue, pageIndex) => {
    if (isAdSlotPage(pageValue)) {
      throw usageError("Playlist.pages[".concat(pageIndex, "] is an adslot page. A bundle carries fixed media only, and an adslot page selects its fill at runtime; export stopped before media download."));
    }
    const page = record(pageValue, "Playlist.pages[".concat(pageIndex, "]"));
    if (!Array.isArray(page.primitives))
      throw usageError("Playlist.pages[".concat(pageIndex, "].primitives must be an array."));
    const primitives = [];
    const pageMediaIds = [];
    let skippedApplications = false;
    page.primitives.forEach((primitiveValue, primitiveIndex) => {
      const primitive = record(primitiveValue, "Playlist.pages[".concat(pageIndex, "].primitives[").concat(primitiveIndex, "]"));
      const category = primitive.primitive;
      if (category === "card") {
        throw usageError("Playlist bundles do not carry card instances or their data. Use playlist show --output for an editable document in the same project. Export stopped before media download.", editableNext);
      }
      if (category === "application") {
        if (!options.skipApplications) {
          throw usageError("Playlist export does not support application primitives; add --skip-applications to export the remaining supported content, or use playlist show --output for an editable document in the same project. Export stopped before media download.", editableNext);
        }
        skipped.primitives.push(stringField(primitive, "id", "Playlist primitive"));
        skippedApplications = true;
        return;
      }
      let normalized;
      if (category === "iframe") {
        normalized = {
          primitive: "iframe",
          src: stringField(primitive, "src", "Iframe primitive"),
          title: stringField(primitive, "title", "Iframe primitive"),
          // The server stores reload_s only above 0, and fallback_src and navigation_allowlist only when set.
          ...primitive.reload_s !== void 0 ? { reload_s: integerField(primitive, "reload_s", "Iframe primitive") } : {},
          ...primitive.fallback_src !== void 0 ? { fallback_src: stringField(primitive, "fallback_src", "Iframe primitive") } : {},
          ...primitive.navigation_allowlist !== void 0 ? { navigation_allowlist: stringListField(primitive, "navigation_allowlist", "Iframe primitive", 64, 2048) } : {}
        };
      } else if (category === "image" || category === "video") {
        const selector = normalizedMediaSelector(primitive.selector);
        const ids = selector.by === "id" ? [selector.media_id] : selector.media_ids;
        pageMediaIds.push(...ids);
        normalized = {
          primitive: category,
          selector,
          ...category === "image" && typeof primitive.alt === "string" ? { alt: primitive.alt } : {},
          ...category === "video" ? { muted: primitive.muted !== false, loop: primitive.loop === true } : {}
        };
      } else {
        throw usageError("Playlist export encountered an unsupported primitive.");
      }
      primitives.push({
        id: stringField(primitive, "id", "Playlist primitive"),
        ...normalized,
        rect: cloneJson(primitive.rect),
        layer: primitive.layer,
        content_fit: primitive.content_fit,
        ...primitive.enter !== void 0 ? { enter: cloneJson(primitive.enter) } : {},
        ...primitive.motion !== void 0 ? { motion: cloneJson(primitive.motion) } : {}
      });
    });
    const pageID = stringField(page, "id", "Playlist page");
    const advanceMode = page.advance !== null && typeof page.advance === "object" ? page.advance.mode : void 0;
    if (skippedApplications && (primitives.length === 0 || advanceMode === "application")) {
      skipped.pages.push(pageID);
      return;
    }
    for (const mediaId of pageMediaIds)
      mediaIds.add(mediaId);
    pages.push({
      id: pageID,
      canvas: cloneJson(page.canvas),
      transition: cloneJson(page.transition),
      advance: cloneJson(page.advance),
      ...page.visibility !== void 0 ? { visibility: cloneJson(page.visibility) } : {},
      ...page.audio_cue !== void 0 ? { audio_cue: normalizedAudioCue(page.audio_cue) } : {},
      primitives
    });
  });
  if (pages.length === 0 && skipped.pages.length > 0) {
    throw usageError("Playlist export would produce no pages after --skip-applications. Use playlist show --output for an editable document in the same project.", editableNext);
  }
  const audio = source.audio === void 0 || source.audio === null ? void 0 : normalizedAudio(source.audio);
  for (const track of audio?.tracks ?? [])
    mediaIds.add(track.media_id);
  return { id, revision: revision2, playlist: { name, ...audio ? { audio } : {}, pages }, mediaIds: [...mediaIds].sort(), skipped };
}
function normalizedAudio(input) {
  const audio = record(input, "Playlist.audio");
  if (!Array.isArray(audio.tracks))
    throw usageError("Playlist.audio.tracks must be an array.");
  const tracks = audio.tracks.map((value, index) => {
    const track = record(value, "Playlist.audio.tracks[".concat(index, "]"));
    const mediaId = stringField(track, "media_id", "Playlist.audio.tracks[".concat(index, "]"));
    if (!MEDIA_ID_PATTERN.test(mediaId))
      throw usageError("Playlist.audio.tracks[".concat(index, "].media_id is not a media id."));
    return { id: stringField(track, "id", "Playlist.audio.tracks[".concat(index, "]")), media_id: mediaId };
  });
  return {
    tracks,
    ...typeof audio.loop === "boolean" ? { loop: audio.loop } : {},
    ...typeof audio.volume === "number" ? { volume: audio.volume } : {},
    // The server stores and echoes `cued` only when true.
    ...audio.cued === true ? { cued: true } : {}
  };
}
function normalizedAudioCue(input) {
  const cue = record(input, "Playlist page audio_cue");
  return {
    track: stringField(cue, "track", "Playlist page audio_cue"),
    ...typeof cue.restart === "boolean" ? { restart: cue.restart } : {}
  };
}
function parseRemoteMedia(input, expectedId) {
  const media = record(input, "Media ".concat(expectedId));
  const id = stringField(media, "id", "Media ".concat(expectedId));
  if (id !== expectedId)
    throw usageError("Media response id mismatch for ".concat(expectedId, "."));
  const sha256 = stringField(media, "sha256", "Media ".concat(expectedId));
  if (!SHA256_PATTERN.test(sha256))
    throw usageError("Media ".concat(expectedId, " has an invalid SHA-256."));
  const contentType = stringField(media, "content_type", "Media ".concat(expectedId));
  const bytes = integerField(media, "bytes", "Media ".concat(expectedId));
  if (bytes < 1 || bytes > MAX_MEDIA_BYTES)
    throw usageError("Media ".concat(expectedId, " is outside the export size bounds."));
  const tag = media.tag;
  if (tag !== void 0 && typeof tag !== "string")
    throw usageError("Media ".concat(expectedId, " has an invalid tag."));
  return {
    id,
    source_id: id,
    path: "media/".concat(sha256).concat(canonicalExtension(contentType)),
    filename: safeFilename(stringField(media, "filename", "Media ".concat(expectedId))),
    content_type: contentType,
    bytes,
    sha256,
    ...typeof tag === "string" ? { tag } : {}
  };
}
function header(headers, name) {
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers))
    if (key.toLowerCase() === lower)
      return value;
  return void 0;
}
function validateMediaHeaders(headers, media) {
  const length = header(headers, "content-length");
  const contentType = header(headers, "content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  const etag = header(headers, "etag");
  if (contentType !== media.content_type)
    throw usageError("Media ".concat(media.id, " export Content-Type did not match metadata."));
  if (length !== String(media.bytes))
    throw usageError("Media ".concat(media.id, " export Content-Length did not match metadata."));
  if (etag !== '"'.concat(media.sha256, '"'))
    throw usageError("Media ".concat(media.id, " export ETag did not match metadata SHA-256."));
}
async function writePrivateJson(filename, value) {
  const handle = await open(filename, "wx", 384);
  try {
    await handle.writeFile("".concat(JSON.stringify(value, null, 2), "\n"), "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await chmod(filename, 384);
}
async function streamMediaToFile(client, media, filename) {
  const head = await client.call({ method: "HEAD", path: "/api/media/".concat(media.id, "/content") });
  validateMediaHeaders(head.headers, media);
  const response = await client.download({ method: "GET", path: "/api/media/".concat(media.id, "/content") });
  try {
    validateMediaHeaders(response.headers, media);
    if (!response.body)
      throw usageError("Media ".concat(media.id, " export returned no body."));
    const handle = await open(filename, "wx", 384);
    const hash = createHash2("sha256");
    let bytes = 0;
    try {
      for await (const chunk of response.body) {
        let offset = 0;
        while (offset < chunk.byteLength) {
          const written = await handle.write(chunk, offset, chunk.byteLength - offset);
          offset += written.bytesWritten;
        }
        hash.update(chunk);
        bytes += chunk.byteLength;
        if (bytes > media.bytes)
          throw usageError("Media ".concat(media.id, " export exceeded the declared length."));
      }
      await handle.sync();
    } finally {
      await handle.close();
    }
    if (bytes !== media.bytes)
      throw usageError("Media ".concat(media.id, " export ended before the declared length."));
    if (hash.digest("hex") !== media.sha256)
      throw usageError("Media ".concat(media.id, " export SHA-256 did not match metadata."));
    await chmod(filename, 384);
  } finally {
    await response.body?.cancel?.();
  }
}
async function destinationAbsent(destination) {
  try {
    await lstat(destination);
  } catch (error) {
    if (error.code === "ENOENT")
      return;
    throw error;
  }
  throw usageError("Playlist export destination already exists: ".concat(destination, "."));
}
async function snapshotBundleSelectors(client, input) {
  const source = cloneJson(record(input, "Playlist"));
  if (!Array.isArray(source.pages))
    return source;
  const catalogs = /* @__PURE__ */ new Map();
  const pages = [];
  for (const rawPage of source.pages) {
    const page = record(rawPage, "Playlist page");
    if (!Array.isArray(page.primitives)) {
      pages.push(page);
      continue;
    }
    const primitives = [];
    for (const raw of page.primitives) {
      const primitive = record(raw, "Playlist primitive");
      const selector = primitive.selector;
      if (!selector || !["all", "tag", "folder"].includes(String(selector.by))) {
        primitives.push(primitive);
        continue;
      }
      const category = stringField(primitive, "primitive", "Playlist primitive");
      if (selectorHasScreenTokens(selector)) {
        const where = [typeof page.id === "string" ? "page ".concat(page.id) : "a page", typeof primitive.id === "string" ? "".concat(category, " primitive ").concat(primitive.id) : "a ".concat(category, " primitive")].join(", ");
        throw usageError("Cannot export ".concat(where, ": its tag selector names a screen token ({screen.id} or {screen.field.NAME}), which is filled per screen and cannot be frozen into a bundle. Replace the token with a concrete tag and export again."));
      }
      if (selector.batch_size !== void 0 && selector.one_at_a_time !== true)
        throw usageError("Static bundle export cannot retain a runtime batch cursor; remove batch_size or use explicit ids.");
      const rect = selector.fit === "aspect" ? record(primitive.rect, "Playlist primitive rect") : void 0;
      const key = JSON.stringify([category, selector, rect?.width, rect?.height]);
      let ids = catalogs.get(key);
      if (!ids) {
        const response = await client.call({ method: "POST", path: "/api/selectors/preview", body: { primitive: category, selector, ...rect ? { rect: { width: rect.width, height: rect.height } } : {} } });
        const preview = record(response.body, "Selector preview");
        if (!Array.isArray(preview.candidates) || preview.candidates.length > 1024)
          throw usageError("Selector preview must contain at most 1024 candidates.");
        ids = preview.candidates.map((item) => stringField(record(item, "Selector candidate"), "media_id", "Selector candidate"));
        catalogs.set(key, ids);
      }
      if (ids.length === 0)
        continue;
      const ordered = [...ids];
      if (selector.order === "random")
        for (let i = ordered.length - 1; i > 0; --i) {
          const j = Math.floor(Math.random() * (i + 1));
          [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
        }
      primitive.selector = { by: "ids", media_ids: ordered, one_at_a_time: selector.one_at_a_time === true };
      primitives.push(primitive);
    }
    if (primitives.length > 0 || page.primitives.length === 0)
      pages.push({ ...page, primitives });
  }
  return { ...source, pages };
}
async function exportPlaylistBundle(options) {
  if (!isResourceID(options.playlistId, "playlist"))
    throw usageError("playlist export requires a playlist identifier.");
  const destination = path.resolve(options.outputDirectory);
  await destinationAbsent(destination);
  const playlistResponse = await callPlaylist(options.client, { method: "GET", id: options.playlistId });
  const snapshot = await snapshotBundleSelectors(options.client, playlistResponse.body);
  const normalized = normalizePlaylistForBundle(snapshot, { skipApplications: options.skipApplications === true });
  if (normalized.id !== options.playlistId)
    throw usageError("Playlist export response id did not match the requested playlist.");
  const media = [];
  for (const mediaId of normalized.mediaIds) {
    const response = await options.client.call({ method: "GET", path: "/api/media/".concat(mediaId) });
    media.push(parseRemoteMedia(response.body, mediaId));
  }
  const parent = path.dirname(destination);
  await mkdir(parent, { recursive: true, mode: 448 });
  const temporary = await mkdtemp(path.join(parent, ".".concat(path.basename(destination), ".tmp-")));
  await chmod(temporary, 448);
  try {
    const mediaDirectory = path.join(temporary, "media");
    await mkdir(mediaDirectory, { mode: 448 });
    await chmod(mediaDirectory, 448);
    await writePrivateJson(path.join(temporary, PLAYLIST_BUNDLE_PLAYLIST), normalized.playlist);
    const writtenPaths = /* @__PURE__ */ new Set();
    for (const item of media) {
      if (writtenPaths.has(item.path))
        continue;
      await streamMediaToFile(options.client, item, path.join(temporary, item.path));
      writtenPaths.add(item.path);
    }
    const manifest = {
      schema: PLAYLIST_BUNDLE_SCHEMA,
      selector_policy: "snapshot",
      comments_policy: "excluded",
      playlist: {
        source_id: normalized.id,
        source_revision: normalized.revision,
        path: PLAYLIST_BUNDLE_PLAYLIST
      },
      media: media.map(({ id: _id, primitive: _primitive, ...item }) => item)
    };
    await writePrivateJson(path.join(temporary, PLAYLIST_BUNDLE_MANIFEST), manifest);
    await destinationAbsent(destination);
    await rename(temporary, destination);
    return {
      schema: PLAYLIST_BUNDLE_SCHEMA,
      directory: destination,
      playlist_id: normalized.id,
      playlist_revision: normalized.revision,
      media_count: media.length,
      media_bytes: media.reduce((sum, item) => sum + item.bytes, 0),
      skipped_applications: normalized.skipped
    };
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    throw error;
  }
}
function deriveBundleIdempotencyKey(base, phase, identity) {
  if (!isValidIdempotencyKey(base))
    throw usageError("Invalid base idempotency key for playlist import.");
  const key = createHash2("sha256").update("screenrig.playlist-bundle\0").update(phase).update("\0").update(identity).update("\0").update(base).digest("base64url");
  if (!isValidIdempotencyKey(key) || key === base)
    throw usageError("Could not derive playlist import idempotency key.");
  return key;
}
function existingMediaList(input) {
  const root = record(input, "Media list");
  if (!Array.isArray(root.items))
    throw usageError("Media list response must contain items.");
  return root.items.map((item, index) => {
    const value = record(item, "Media list item ".concat(index));
    const id = stringField(value, "id", "Media list item ".concat(index));
    if (!MEDIA_ID_PATTERN.test(id))
      throw usageError("Media list item ".concat(index, " has an invalid id."));
    const sha256 = stringField(value, "sha256", "Media list item ".concat(index));
    if (!SHA256_PATTERN.test(sha256))
      throw usageError("Media list item ".concat(index, " has an invalid SHA-256."));
    const contentType = stringField(value, "content_type", "Media list item ".concat(index));
    canonicalExtension(contentType);
    return {
      id,
      source_id: id,
      path: "",
      filename: stringField(value, "filename", "Media list item ".concat(index)),
      content_type: contentType,
      bytes: integerField(value, "bytes", "Media list item ".concat(index)),
      sha256,
      ...typeof value.tag === "string" ? { tag: value.tag } : {}
    };
  });
}
function exactMediaMatch(candidate, source) {
  return candidate.filename === source.filename && candidate.content_type === source.content_type && candidate.bytes === source.bytes && candidate.sha256 === source.sha256 && candidate.tag === source.tag;
}
function rewritePlaylistIds(playlist, mapping) {
  const output = cloneJson(playlist);
  const audio = output.audio;
  for (const track of audio?.tracks ?? []) {
    const source = track.media_id;
    const destination = mapping.get(source);
    if (!destination)
      throw usageError("No imported media mapping exists for ".concat(source, "."));
    track.media_id = destination;
  }
  const pages = output.pages;
  for (const page of pages) {
    for (const primitive of page.primitives) {
      if (primitive.primitive !== "image" && primitive.primitive !== "video")
        continue;
      const selector = primitive.selector;
      if (selector.by === "id") {
        const source = selector.media_id;
        const destination = mapping.get(source);
        if (!destination)
          throw usageError("No imported media mapping exists for ".concat(source, "."));
        selector.media_id = destination;
      } else {
        selector.media_ids = selector.media_ids.map((source) => {
          const destination = mapping.get(source);
          if (!destination)
            throw usageError("No imported media mapping exists for ".concat(source, "."));
          return destination;
        });
      }
    }
  }
  return output;
}
function mediaIdFromOperation(operation) {
  const id = operation.result?.media_id;
  return typeof id === "string" && MEDIA_ID_PATTERN.test(id) ? id : void 0;
}
function writeImportProgress(runtime, message) {
  runtime.stderr.write("".concat(message, "\n"));
}
function mediaUploadAdmissionLimiter(runtime) {
  const admissions = [];
  return {
    async waitForSlot() {
      while (true) {
        const now = runtime.now().getTime();
        while (admissions.length > 0 && now - admissions[0] >= MEDIA_UPLOAD_ADMISSION_WINDOW_MS) {
          admissions.shift();
        }
        if (admissions.length < MEDIA_UPLOAD_ADMISSION_QUOTA)
          return;
        const waitMs = admissions[0] + MEDIA_UPLOAD_ADMISSION_WINDOW_MS - now;
        writeImportProgress(runtime, "Playlist import is waiting ".concat(Math.ceil(waitMs / 1e3), " seconds for media upload admission."));
        await runtime.sleep(waitMs);
      }
    },
    recordAdmission() {
      admissions.push(runtime.now().getTime());
    }
  };
}
async function declareBundleMediaUpload(options) {
  let rateLimitRetries = 0;
  while (true) {
    await options.limiter.waitForSlot();
    try {
      const response = await options.client.call({
        method: "POST",
        path: "/api/media/uploads",
        idempotent: true,
        idempotencyKey: options.idempotencyKey,
        body: options.body
      });
      options.limiter.recordAdmission();
      return response;
    } catch (error) {
      const retryAfterSeconds = error instanceof CliError && error.problem.status === 429 ? error.problem.retry_after_seconds : void 0;
      if (retryAfterSeconds === void 0 || rateLimitRetries >= MEDIA_UPLOAD_RATE_LIMIT_RETRIES)
        throw error;
      rateLimitRetries += 1;
      writeImportProgress(options.runtime, "Playlist import is rate limited; waiting ".concat(retryAfterSeconds, " seconds before retrying the same media declaration."));
      await options.runtime.sleep(retryAfterSeconds * 1e3);
    }
  }
}
function rethrowRateLimitedImport(error, state) {
  if (!(error instanceof CliError) || error.problem.status !== 429)
    return;
  const count = state.uploaded.length;
  const confirmed = count > 0 ? " The import is partially complete: ".concat(count, " new media object").concat(count === 1 ? " is" : "s are", " confirmed ready.") : "";
  let phase;
  let next = error.problem.next;
  if (state.playlistWriteStarted) {
    phase = " The playlist write request was sent and its outcome may be unknown. No cleanup was attempted, and no media was deleted.";
    next = {
      command: error.problem.next?.command ?? "retry the same playlist import command",
      reason: "".concat(error.problem.next?.reason ? "".concat(error.problem.next.reason, " ") : "", "Read back the destination project when practical, then retry the exact import with the same idempotency key; an exact playlist-write replay returns the original outcome.")
    };
  } else if (count > 0) {
    phase = " No playlist write was started, no cleanup was attempted, and no media was deleted.";
  } else if (state.mutationStarted) {
    phase = " Media upload work was admitted, but no new media object is confirmed ready. No playlist write was started, no cleanup was attempted, and no media was deleted.";
  } else {
    phase = " No media upload or playlist write was admitted; the import made no remote mutation.";
  }
  throw new CliError({
    ...error.problem,
    detail: "".concat(error.problem.detail).concat(confirmed).concat(phase),
    errors: [
      ...error.problem.errors,
      ...state.uploaded.map((media_id) => ({ code: "confirmed_media_ready", media_id }))
    ],
    next
  }, error.exitCode, error.warnings);
}
function partialImportError(error, uploaded, mutationStarted, playlistWriteStarted) {
  if (!mutationStarted)
    throw error;
  const cause = error instanceof CliError ? error.problem.code : "import_failed";
  const playlistState = playlistWriteStarted ? "The playlist write outcome may be unknown" : "No playlist write was started";
  throw new CliError(makeProblem("bundle_import_partial", "Playlist bundle import stopped after remote mutation", 409, "The import stopped after starting media upload work (".concat(cause, "). ").concat(uploaded.length, " new media object").concat(uploaded.length === 1 ? " is" : "s are", " ready. ").concat(playlistState, ", and no media was deleted. Retry the same bundle to reuse exact media."), {
    errors: uploaded.map((media_id) => ({ code: "confirmed_media_ready", media_id })),
    next: {
      command: "retry the same playlist import command with the same --idempotency-key when supplied",
      reason: "The importer lists and reuses exact ready media before uploading missing objects."
    }
  }), ExitCode.Conflict);
}
async function importPlaylistBundle(options) {
  if (options.name !== void 0) {
    const trimmed = options.name.trim();
    if (trimmed.length === 0 || trimmed.length > 120)
      throw usageError("playlist import --name must be 1 to 120 characters.");
  }
  if (!options.updateId && options.ifMatch)
    throw usageError("playlist import --expect-rev requires --update PLAYLIST_ID.");
  if (options.updateId && !isResourceID(options.updateId, "playlist"))
    throw usageError("playlist import --update requires a playlist identifier.");
  const ifMatch = options.ifMatch ? quotedRevision(options.ifMatch) : void 0;
  const bundle = await preflightPlaylistBundle(options.directory);
  const usedDestinationIds = /* @__PURE__ */ new Set();
  const mapping = /* @__PURE__ */ new Map();
  let reused = 0;
  let mutationStarted = false;
  let playlistWriteStarted = false;
  const uploaded = [];
  const admissionLimiter = mediaUploadAdmissionLimiter(options.runtime);
  try {
    if (options.updateId && options.ifMatch) {
      const target = await callPlaylist(options.client, { method: "GET", id: options.updateId });
      const targetBody = record(target.body, "Playlist update target");
      if (targetBody.id !== options.updateId)
        throw usageError("Playlist update target response did not match --update.");
      const current = targetBody.revision;
      const expected = Number(options.ifMatch.replaceAll('"', ""));
      if (!Number.isSafeInteger(current) || current !== expected) {
        throw new CliError(makeProblem("revision_conflict", "Playlist revision changed", 409, "Playlist ".concat(options.updateId, " is at revision ").concat(String(current), "; no media upload was started."), { current_revision: typeof current === "number" ? current : void 0 }), ExitCode.Conflict);
      }
    }
    await options.beforePlaylistWrite?.(bundle.playlist, options.updateId);
    const list = await options.client.listAll("/api/media");
    const existing = existingMediaList(list.body);
    for (const source of bundle.manifest.media) {
      const reusable = existing.filter((candidate) => !usedDestinationIds.has(candidate.id) && exactMediaMatch(candidate, source)).sort((left, right) => {
        if (left.id === source.source_id)
          return -1;
        if (right.id === source.source_id)
          return 1;
        return left.id.localeCompare(right.id);
      })[0];
      if (reusable) {
        mapping.set(source.source_id, reusable.id);
        usedDestinationIds.add(reusable.id);
        reused += 1;
        continue;
      }
      const declareKey = deriveBundleIdempotencyKey(options.client.idempotencyKey, "media-declare", source.source_id);
      const commitKey = deriveBundleIdempotencyKey(options.client.idempotencyKey, "media-commit", source.source_id);
      const declarationResponse = await declareBundleMediaUpload({
        client: options.client,
        runtime: options.runtime,
        limiter: admissionLimiter,
        idempotencyKey: declareKey,
        body: {
          filename: source.filename,
          content_type: source.content_type,
          bytes: source.bytes,
          sha256: source.sha256,
          ...source.tag ? { tag: source.tag } : {}
        }
      });
      mutationStarted = true;
      if (header(declarationResponse.headers, "cache-control") !== "private, no-store") {
        throw usageError("Media upload declaration did not return the required private, no-store cache policy.");
      }
      const session = validateMediaUploadSession(declarationResponse.body, options.runtime.now().getTime());
      const held = bundle.files.get(source.source_id);
      if (!held)
        throw usageError("Bundle media handle disappeared from preflight: ".concat(source.source_id, "."));
      await performSignedMediaStreamPut(held.handle.createReadStream({ autoClose: false, start: 0 }), session, options.runtime.signedRawPut ?? fetchSignedRawPut());
      const commit = await options.client.call({
        method: "POST",
        path: "/api/media/uploads/".concat(session.id, "/commit"),
        idempotent: true,
        idempotencyKey: commitKey,
        body: { content_type: source.content_type, bytes: source.bytes, sha256: source.sha256 }
      });
      let operation = commit.body;
      operation = await options.client.waitForOperation(operation.id, {
        timeoutMs: options.timeoutMs ?? 12e4,
        pollMs: options.pollMs ?? 1e3,
        sleep: options.runtime.sleep
      });
      const destinationId = mediaIdFromOperation(operation);
      if (!destinationId)
        throw usageError("Media import operation for ".concat(source.source_id, " returned no ready media id."));
      if (usedDestinationIds.has(destinationId))
        throw usageError("Media import did not produce an injective source-to-destination mapping.");
      usedDestinationIds.add(destinationId);
      mapping.set(source.source_id, destinationId);
      uploaded.push(destinationId);
    }
    const playlist = rewritePlaylistIds(bundle.playlist, mapping);
    if (options.name !== void 0)
      playlist.name = options.name.trim();
    const playlistKey = deriveBundleIdempotencyKey(options.client.idempotencyKey, options.updateId ? "playlist-update" : "playlist-create", options.updateId ?? bundle.manifest.playlist.source_id);
    playlistWriteStarted = true;
    const response = options.updateId ? await callPlaylist(options.client, {
      method: "PUT",
      id: options.updateId,
      idempotencyKey: playlistKey,
      body: playlist,
      headers: { ...reviewNoteHeaders(options.note), ...ifMatch ? { "if-match": ifMatch } : {} }
    }) : await options.client.call({
      method: "POST",
      path: "/api/playlists",
      idempotent: true,
      idempotencyKey: playlistKey,
      body: playlist,
      headers: reviewNoteHeaders(options.note)
    });
    const pending = pendingReviewOf(response);
    return {
      schema: PLAYLIST_BUNDLE_SCHEMA,
      directory: bundle.root,
      source_playlist_id: bundle.manifest.playlist.source_id,
      playlist: pending ? pending.playlist : response.body,
      mode: options.updateId ? "update" : "create",
      media: { total: bundle.manifest.media.length, reused, uploaded: uploaded.length },
      ...pending ? { status: "pending_review", review: pending.review } : {},
      ...pending?.warnings ? { warnings: pending.warnings } : {}
    };
  } catch (error) {
    rethrowRateLimitedImport(error, { uploaded, mutationStarted, playlistWriteStarted });
    partialImportError(error, uploaded, mutationStarted, playlistWriteStarted);
  } finally {
    await bundle.close();
  }
}

// dist/handlers/playlist.js
var handlePlaylistValidate = commandHandler(async (args, runtime) => {
  const file = args.positionals[2];
  if (!file)
    throw usageError("playlist validate requires one JSON file.");
  let parsed;
  try {
    parsed = await readAuthoringJson(file, runtime);
  } catch {
    throw usageError("Cannot read playlist JSON.");
  }
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.pages))
    assertWirePages(parsed.pages);
  const body = parsed;
  assertPlaylistValid(body);
  const lint = playlistLint(body);
  const shortApplication = shortApplicationPageWarning(body);
  return {
    envelope: successEnvelope({ valid: true, scope: "local_schema_and_semantics", server_checks: PLAYLIST_SERVER_CHECKS, lint }, { warnings: shortApplication ? [shortApplication] : [] }),
    exitCode: ExitCode.Success,
    human: [
      "Playlist passed local canonical validation. Reference authorization and runtime readiness require server checks.",
      ...shortApplication ? ["warning: ".concat(shortApplication.message)] : [],
      ...lint.map((item) => "lint: ".concat(item.page_id, " ").concat(item.code, " ").concat(item.id))
    ].join("\n")
  };
}, false);
var handlePlaylistList = commandHandler(async (args, runtime, resolved) => {
  const result = await simpleList(args, runtime, resolved, "/api/playlists", "Playlists", libraryQuery(args));
  if (result.envelope.ok) {
    const data = result.envelope.data;
    if (Array.isArray(data.items) && flagBool(args.flags, "templates")) {
      data.items = data.items.filter((item) => Array.isArray(item.fields) && item.fields.length > 0);
    }
    if (Array.isArray(data.items)) {
      const marked = data.items.some((item) => item.library === true);
      result.human = [
        "Playlists",
        "ID	Revision	Updated	Name".concat(marked ? "	Library" : ""),
        ...data.items.map((item) => "".concat(item.id, "	").concat(item.revision, "	").concat(item.updated_at ?? "\u2014", "	").concat(item.name).concat(marked ? "	".concat(item.library === true ? "Library" : "") : ""))
      ].join("\n");
    }
  }
  return result;
}, true);
var handlePlaylistShow = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  if (!id)
    throw usageError("playlist show requires an id.");
  const output = flagString(args.flags, "output");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await callPlaylist(client, { method: "GET", id });
  if (!output && !flagBool(args.flags, "editable")) {
    const requestId = client.requestId;
    const notes = await resourceNotes(runtime, client, "playlist", id);
    return {
      envelope: jsonBody(response, requestId, void 0, notes.warnings),
      exitCode: ExitCode.Success,
      human: ["Playlist\n".concat(JSON.stringify(response.body, null, 2)), ...notes.lines].join("\n")
    };
  }
  const resource = response.body;
  if (resource.id !== id || !Number.isSafeInteger(resource.revision) || resource.revision < 1)
    throw usageError("Playlist response has invalid identity or revision.");
  const document = editablePlaylist(response.body);
  const file = output ? await writeAuthoringJson(output, document, runtime, flagBool(args.flags, "overwrite")) : void 0;
  return { envelope: successEnvelope({ playlist_id: id, revision: resource.revision, ...file ? { output: file } : { document } }, { request_id: client.requestId }), exitCode: ExitCode.Success, human: file ? "Editable playlist written to ".concat(file) : JSON.stringify(document, null, 2) };
}, true);
var handlePlaylistExport = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  requireFlagValue(args, "output", "./playlist-bundle");
  const id = args.positionals[2];
  const output = flagString(args.flags, "output");
  if (!id || !output) {
    throw usageError("playlist export requires <id> --output <directory>.");
  }
  const result = await exportPlaylistBundle({
    playlistId: id,
    outputDirectory: path2.resolve(runtime.cwd(), output),
    client,
    skipApplications: flagBool(args.flags, "skip-applications")
  });
  const skipped = result.skipped_applications;
  return {
    envelope: successEnvelope(result, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: humanLines("Playlist exported", [
      ["playlist_id", result.playlist_id],
      ["directory", result.directory],
      ["media_count", String(result.media_count)],
      ["media_bytes", String(result.media_bytes)],
      ...skipped.primitives.length > 0 ? [["skipped_application_primitives", skipped.primitives.join(", ")]] : [],
      ...skipped.pages.length > 0 ? [["skipped_pages", skipped.pages.join(", ")]] : []
    ])
  };
}, true);
var handlePlaylistImport = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  requireFlagValue(args, "update", "pl_01");
  requireFlagValue(args, "expect-rev", "1");
  requireFlagValue(args, "name", "Lobby loop (copy)");
  const directory = args.positionals[2];
  if (!directory)
    throw usageError("playlist import requires one <directory>.");
  const updateId = flagString(args.flags, "update");
  const ifMatch = flagString(args.flags, "expect-rev");
  const name = flagString(args.flags, "name");
  const result = await importPlaylistBundle({
    directory: path2.resolve(runtime.cwd(), directory),
    client,
    runtime,
    updateId,
    ifMatch,
    name,
    timeoutMs: flagNumber(args.flags, "timeout"),
    pollMs: flagNumber(args.flags, "poll-ms"),
    note: flagString(args.flags, "note"),
    beforePlaylistWrite: async (playlist, targetId) => {
      if (targetId)
        await assertAssignedScreensHaveZone(client, targetId, playlist.pages);
    }
  });
  const media = [
    ["source_playlist_id", result.source_playlist_id],
    ["directory", result.directory],
    ["media_reused", String(result.media.reused)],
    ["media_uploaded", String(result.media.uploaded)]
  ];
  const lifted = releaseWarnings(result);
  const { warnings: _raw, ...rest } = result;
  const data = { ...rest, playlist: withoutAnswerWarnings(result.playlist) };
  const warningLines = lifted.map((warning) => "warning: ".concat(warning.message));
  if (result.review) {
    return {
      envelope: successEnvelope({ ...data, next: reviewNext(result.review.id) }, { request_id: client.requestId, warnings: [pendingReviewWarning(result.review), ...lifted] }),
      exitCode: ExitCode.Success,
      human: [...pendingReviewLines(result.review), ...media.map(([key, value]) => "".concat(key, ": ").concat(value)), ...warningLines].join("\n")
    };
  }
  return {
    envelope: successEnvelope(data, { request_id: client.requestId, warnings: lifted }),
    exitCode: ExitCode.Success,
    human: [humanLines("Playlist ".concat(result.mode === "create" ? "imported" : "updated from bundle"), media), ...warningLines].join("\n")
  };
}, true);
function releaseWarnings(result) {
  const playlist = result.playlist;
  const id = typeof playlist?.id === "string" ? playlist.id : void 0;
  return result.warnings !== void 0 ? playlistWarnings(result.warnings, id, true) : playlistAnswerWarnings(result.playlist);
}
async function playlistCreateUpdateAction(args, runtime, resolved, action) {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const id = action === "update" ? args.positionals[2] : void 0;
  const file = action === "update" ? args.positionals[3] : args.positionals[2];
  const ifMatch = flagString(args.flags, "expect-rev");
  if (!file || action === "update" && !id) {
    throw usageError("playlist ".concat(action, " requires ").concat(action === "update" ? "<id> <file>" : "<file>", "."));
  }
  let parsed;
  try {
    parsed = await readAuthoringJson(file, runtime);
  } catch (err) {
    throw usageError("Cannot read playlist JSON: ".concat(err instanceof Error ? err.message : "invalid JSON"));
  }
  if (!parsed || typeof parsed !== "object" || typeof parsed.name !== "string" || !Array.isArray(parsed.pages)) {
    throw usageError("Playlist JSON must contain string name and array pages.");
  }
  const extra = Object.keys(parsed).filter((key) => key !== "name" && key !== "audio" && key !== "format" && key !== "fields" && key !== "pages");
  if (extra.length > 0) {
    throw usageError("Playlist JSON contains unsupported fields: ".concat(extra.join(", "), "."));
  }
  const pages = parsed.pages;
  assertWirePages(pages);
  const region = flagString(args.flags, "format-region");
  const orientation = flagString(args.flags, "format-orientation");
  const format = region !== void 0 && orientation !== void 0 ? { region, orientation } : parsed.format;
  const body = { name: parsed.name, ...parsed.audio !== void 0 ? { audio: parsed.audio } : {}, ...format !== void 0 ? { format } : {}, ...parsed.fields !== void 0 ? { fields: parsed.fields } : {}, pages };
  assertPlaylistValid(body);
  await validatePlaylistCards(client, body);
  if (pages.some(isAdSlotPage)) {
    await requireCapability(client, "signage.playlists", "playlist ".concat(action, " with adslot pages"), {
      command: "screenrig project capabilities",
      reason: "Read the project's effective capabilities before authoring an ad-bearing playlist; only a screens-capable project can place adslot pages."
    });
  }
  if (action === "update" && id) {
    await assertAssignedScreensHaveZone(client, id, pages);
  }
  const note = reviewNoteFrom(args);
  const response = action === "create" ? await client.call({ method: "POST", path: "/api/playlists", idempotent: true, body, headers: note }) : await callPlaylist(client, {
    method: "PUT",
    id,
    body,
    headers: { ...note, ...ifMatch ? { "if-match": quotedRevision(ifMatch) } : {} }
  });
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  return playlistWriteResult(response, client.requestId, "Playlist ".concat(action, "d."));
}
var handlePlaylistCreate = commandHandler(async (args, runtime, resolved) => {
  if (flagString(args.flags, "from-template") !== void 0 || flagString(args.flags, "starter") !== void 0) {
    return (await import("./playlist-fields-EDJPSGHU.js")).playlistCreateFromTemplate(args, runtime, resolved);
  }
  return playlistCreateUpdateAction(args, runtime, resolved, "create");
}, true);
var handlePlaylistUpdate = commandHandler(async (args, runtime, resolved) => {
  return playlistCreateUpdateAction(args, runtime, resolved, "update");
}, true);
var handlePlaylistPatch = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  const file = args.positionals[3];
  if (!id)
    throw usageError("playlist patch requires <id> and at least one changed field.");
  let body = {};
  if (file) {
    const parsed = await readAuthoringJson(file, runtime);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw usageError("Playlist patch JSON must be an object.");
    body = parsed;
  }
  const unknown = Object.keys(body).filter((key) => !["name", "pages", "audio", "format", "fields"].includes(key));
  if (unknown.length)
    throw usageError("Playlist patch contains unsupported fields: ".concat(unknown.join(", "), "."));
  const name = flagString(args.flags, "name");
  if (name !== void 0) {
    if (Object.hasOwn(body, "name"))
      throw usageError("Supply name in the patch file or --name, not both.");
    body.name = name;
  }
  if (flagBool(args.flags, "clear-audio")) {
    if (Object.hasOwn(body, "audio"))
      throw usageError("Supply audio in the patch file or --clear-audio, not both.");
    body.audio = null;
  }
  if (!Object.keys(body).length)
    throw usageError("playlist patch requires a partial JSON file, --name, or --clear-audio.");
  if (Object.hasOwn(body, "name")) {
    if (typeof body.name !== "string" || !body.name.trim() || [...body.name.trim()].length > 120 || /[\p{Cc}]/u.test(body.name)) {
      throw usageError("name must contain 1 to 120 Unicode characters after trimming, with no control characters.");
    }
    body.name = body.name.trim();
  }
  if (Object.hasOwn(body, "pages")) {
    if (!Array.isArray(body.pages) || body.pages.length === 0)
      throw usageError("pages must be a non-empty array.");
    assertWirePages(body.pages);
  }
  if (body.audio !== void 0 && body.audio !== null && (typeof body.audio !== "object" || Array.isArray(body.audio))) {
    throw usageError("audio must be a soundtrack object or null.");
  }
  if (body.format !== void 0 && body.format !== null && (typeof body.format !== "object" || Array.isArray(body.format))) {
    throw usageError("format must be a video wall or region format object, or null.");
  }
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (Array.isArray(body.pages)) {
    await validatePlaylistCards(client, { pages: body.pages });
    await assertAssignedScreensHaveZone(client, id, body.pages);
  }
  const expected = flagString(args.flags, "expect-rev");
  const response = await callPlaylist(client, {
    method: "PATCH",
    id,
    body,
    headers: { ...reviewNoteFrom(args), ...expected ? { "if-match": quotedRevision(expected) } : {} }
  });
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  return playlistWriteResult(response, client.requestId, "Playlist ".concat(id, " updated."));
}, true);
var handlePlaylistReplaceRelease = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const result = await replacePlaylistRelease({
    client,
    apiUrl: resolved.apiUrl,
    playlistId: args.positionals[2],
    pageId: flagString(args.flags, "page"),
    primitiveId: flagString(args.flags, "primitive"),
    releaseId: flagString(args.flags, "release-id"),
    apply: flagBool(args.flags, "apply"),
    revision: flagString(args.flags, "expect-rev"),
    impact: flagString(args.flags, "expect-impact"),
    note: flagString(args.flags, "note")
  });
  const answer = result;
  const lifted = releaseWarnings(answer);
  const data = { ...result, ...answer.playlist ? { playlist: withoutAnswerWarnings(answer.playlist) } : {} };
  delete data.warnings;
  const warningLines = lifted.map((warning) => "warning: ".concat(warning.message));
  if ("review" in result && result.review) {
    return {
      envelope: successEnvelope({ ...data, next: reviewNext(result.review.id) }, { request_id: client.requestId, warnings: [pendingReviewWarning(result.review), ...lifted] }),
      exitCode: ExitCode.Success,
      human: [...pendingReviewLines(result.review), ...warningLines].join("\n")
    };
  }
  return { envelope: successEnvelope(data, { request_id: client.requestId, warnings: lifted }), exitCode: ExitCode.Success, human: [JSON.stringify(data, null, 2), ...warningLines].join("\n") };
}, true);
var handlePlaylistDelete = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const id = args.positionals[2];
  const ifMatch = flagString(args.flags, "expect-rev");
  if (!id)
    throw usageError("playlist delete requires <id>.");
  let response;
  try {
    response = await callPlaylist(client, {
      method: "DELETE",
      id,
      ...ifMatch ? { headers: { "if-match": quotedRevision(ifMatch) } } : {}
    });
  } catch (error) {
    throw playlistInUseProblem(error);
  }
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Deleted playlist ".concat(id) };
}, true);
async function assertAssignedScreensHaveZone(client, playlistId2, pages) {
  if (!playlistNeedsTimezone({ pages })) {
    return;
  }
  const response = await client.listAll("/api/screens");
  const items = response.body?.items;
  if (!Array.isArray(items)) {
    return;
  }
  const unzoned = items.find((screen) => screen?.playlist_id === playlistId2 && !screen?.timezone);
  if (unzoned) {
    throw scheduleZoneError(unzoned.id);
  }
}
function sanitizedPreparationApiUrl(value) {
  const url = new URL(value);
  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}
var PLAYLIST_INIT_UPLOAD_CONCURRENCY = 4;
var handlePlaylistInit = commandHandler(async (args, runtime, resolved) => {
  let existingClient;
  let preparedClient;
  const remote = () => preparedClient ??= (async () => {
    requireToken(resolved.token);
    resolved = await resolveProjectContext(args, runtime, resolved);
    return existingClient = clientFor(runtime, args, resolved.apiUrl, resolved.token);
  })();
  const screenId = flagString(args.flags, "screen-id");
  const width = flagNumber(args.flags, "target-width"), height = flagNumber(args.flags, "target-height");
  const screen = screenId ? (await (await remote()).call({ method: "GET", path: "/api/screens/".concat(encodeURIComponent(screenId)) })).body : void 0;
  const dimensions = targetDimensions(screen, width, height);
  const target = screen;
  if (screenId && (!target || target.id !== screenId || !Number.isSafeInteger(target.revision) || target.revision < 1)) {
    throw usageError("Screen response has invalid identity or revision.");
  }
  const content = [];
  const files = /* @__PURE__ */ new Map();
  const warnings = [];
  for (const input of args.positionals.slice(2)) {
    if (RESOURCE_ID_PATTERNS.media.test(input)) {
      const record2 = (await (await remote()).call({ method: "GET", path: "/api/media/".concat(input) })).body;
      if (record2?.id !== input)
        throw usageError("Media response identity did not match.");
      content.push(record2);
    } else if (RESOURCE_ID_PATTERNS.release.test(input)) {
      content.push({ primitive: "application", release_id: input });
    } else if (iframeSnippetSource(input) !== void 0 || /^[a-z][a-z0-9+.-]*:/i.test(input)) {
      const written = iframeSnippetSource(input) ?? input;
      const templated = hasScreenToken(written);
      if (templated) {
        const refusal = screenTemplateRefusal(written);
        if (refusal !== void 0)
          throw usageError("The iframe address ".concat(refusal, "."));
      }
      let url;
      try {
        url = new URL(templated ? screenTokenStandIn(written) : written);
      } catch {
        throw usageError("Provide a valid http or https iframe URL or embed code.");
      }
      if (url.protocol !== "https:" && url.protocol !== "http:" || !url.hostname)
        throw usageError("Iframe URLs must use http or https.");
      content.push({ primitive: "iframe", src: templated ? written.trim() : url.href, title: url.hostname.slice(0, 200) });
    } else {
      const sourcePath = path2.resolve(runtime.cwd(), input);
      try {
        if (!(await stat(sourcePath)).isFile())
          throw new Error();
      } catch {
        throw usageError("Each input must be a readable image/video/audio file, media ID, release ID, http(s) URL, or iframe embed code.");
      }
      files.set(content.length, sourcePath);
      const audioFile = /\.(mp3|wav|wave|aac|m4a|m4b|ogg|oga|opus|flac|aif|aiff|wma)$/i.test(sourcePath);
      content.push({ primitive: audioFile ? "audio" : "image", state: "ready", id: "med_PENDING" });
    }
  }
  const options = { name: flagString(args.flags, "name"), content, ...dimensions, durationMs: flagNumber(args.flags, "duration-ms"), fit: flagString(args.flags, "fit") ?? "contain", sound: flagBool(args.flags, "sound") };
  const validated = preparePlaylist(options);
  const shortApplication = shortApplicationPageWarning(validated);
  if (shortApplication)
    warnings.push(shortApplication);
  const output = path2.resolve(runtime.cwd(), flagString(args.flags, "output"));
  const overwrite = flagBool(args.flags, "overwrite");
  await assertOutputAvailable(output, overwrite);
  const queue = [...files];
  const uploads = [];
  const uploadNext = async () => {
    for (let next = queue.shift(); next; next = queue.shift()) {
      const [index, sourcePath] = next;
      const idempotencyKey = createHash3("sha256").update(JSON.stringify(["screenrig.playlist.init.upload", (await remote()).idempotencyKey, index])).digest("base64url");
      const client = await remote();
      const uploaded = await loggerOf(runtime).withLocal({ op: "media.upload", message: "media upload" }, () => uploadMediaFile({
        runtime,
        client,
        sourcePath,
        idempotencyKey,
        transcodeOptions: transcodeOptionsFromArgs(args),
        noTranscode: flagBool(args.flags, "no-transcode"),
        reporter: progressReporterFor(args, runtime),
        noWait: false,
        resumable: flagString(args.flags, "idempotency-key") !== void 0,
        timeoutMs: flagNumber(args.flags, "timeout") ?? 12e4,
        pollMs: flagNumber(args.flags, "poll-ms") ?? 1e3
      }));
      warnings.push(...uploaded.warnings);
      if (!uploaded.mediaId)
        throw usageError("Upload completed without a media identifier.");
      const record2 = (await (await remote()).call({ method: "GET", path: "/api/media/".concat(encodeURIComponent(uploaded.mediaId)) })).body;
      if (record2?.id !== uploaded.mediaId)
        throw usageError("Media response identity did not match.");
      content[index] = record2;
      uploads.push({ index, media_id: uploaded.mediaId, reused: uploaded.reused, timing: uploaded.timing });
    }
  };
  const workers = await Promise.allSettled(Array.from({ length: Math.min(PLAYLIST_INIT_UPLOAD_CONCURRENCY, files.size) }, () => uploadNext().catch((error) => {
    queue.length = 0;
    throw error;
  })));
  const failure = workers.find((worker) => worker.status === "rejected");
  if (failure)
    throw failure.reason;
  await writeOutputFile(output, JSON.stringify(preparePlaylist(options), null, 2) + "\n", overwrite);
  const context = ["--config", resolved.configPath, "--api-url", sanitizedPreparationApiUrl(resolved.apiUrl)];
  const trackCount = content.filter((item) => item.primitive === "audio").length;
  const releaseIds = content.filter((item) => item.primitive === "application").map((item) => String(item.release_id));
  const mediaIds = content.filter((item) => typeof item.id === "string" && RESOURCE_ID_PATTERNS.media.test(item.id)).map((item) => String(item.id));
  return { envelope: successEnvelope({
    output,
    ...dimensions,
    page_count: content.length - trackCount,
    ...trackCount > 0 ? { soundtrack_tracks: trackCount } : {},
    ...releaseIds.length > 0 ? { release_ids: releaseIds } : {},
    ...mediaIds.length > 0 ? { media_ids: mediaIds } : {},
    ...uploads.length > 0 ? { uploads: uploads.sort((a, b) => a.index - b.index).map(({ index, ...upload }) => ({ source: args.positionals[2 + index], ...upload })) } : {},
    ...target ? { screen_id: target.id, screen_revision: target.revision } : {},
    ...target ? { publish: { argv: ["screen", "publish", target.id, output, ...context], reason: "Inspect the prepared document before publishing." } } : {}
  }, { request_id: existingClient?.requestId, warnings }), exitCode: ExitCode.Success, human: "Playlist prepared at ".concat(output) };
}, false);

// dist/playlist-page.js
import { randomBytes } from "node:crypto";
var PAGE_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
var ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
var DEFAULT_CANVAS = { width: 1920, height: 1080, background: "#000000FF" };
var DEFAULT_TRANSITION = { type: "crossfade", duration_ms: 600 };
var DEFAULT_SECONDS = 10;
var isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
function newPageId(random = randomBytes) {
  const bytes = random(8);
  let id = "up-";
  for (let index = 0; index < 8; index += 1)
    id += ID_ALPHABET[bytes[index] % ID_ALPHABET.length];
  return id;
}
function civilTime(value, edge, flag) {
  const text = value.trim();
  const full = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(text);
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  const match = full ?? day;
  if (!match)
    throw usageError("".concat(flag, " takes YYYY-MM-DDTHH:MM or YYYY-MM-DD, a time in each screen's timezone."));
  const [year, month, date] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const hours = full ? Number(match[4]) : 0, minutes = full ? Number(match[5]) : 0;
  const check = new Date(Date.UTC(year, month - 1, date, hours, minutes));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== date || hours > 23 || minutes > 59) {
    throw usageError("".concat(flag, " ").concat(text, " is not a real date and time."));
  }
  if (full || edge === "from")
    return "".concat(match[1], "-").concat(match[2], "-").concat(match[3], "T").concat(String(hours).padStart(2, "0"), ":").concat(String(minutes).padStart(2, "0"));
  const next = new Date(Date.UTC(year, month - 1, date + 1));
  return "".concat(next.getUTCFullYear(), "-").concat(String(next.getUTCMonth() + 1).padStart(2, "0"), "-").concat(String(next.getUTCDate()).padStart(2, "0"), "T00:00");
}
function formatCanvas(format) {
  if (!isObject(format))
    return void 0;
  const displays = Number(format.displays);
  if (!Number.isInteger(displays) || displays < 2)
    return void 0;
  const columns = Number(format.columns);
  if (format.arrangement === "grid" && !(Number.isInteger(columns) && columns > 0 && displays % columns === 0))
    return void 0;
  return wallSize(displays, format.arrangement, format.orientation === "portrait", columns);
}
function firstOrdinaryPage(playlist) {
  const pages = isObject(playlist) && Array.isArray(playlist.pages) ? playlist.pages : [];
  return pages.find((page) => isObject(page) && page.type === void 0 && isObject(page.canvas));
}
function pageCanvas(playlist) {
  const first = firstOrdinaryPage(playlist);
  const fromFormat = formatCanvas(isObject(playlist) ? playlist.format : void 0);
  const canvas = isObject(first?.canvas) ? first.canvas : void 0;
  const background = canvas?.background ?? DEFAULT_CANVAS.background;
  if (fromFormat)
    return { ...fromFormat, background };
  if (canvas && Number.isFinite(Number(canvas.width)) && Number.isFinite(Number(canvas.height))) {
    return { width: Number(canvas.width), height: Number(canvas.height), background };
  }
  return { ...DEFAULT_CANVAS };
}
function pageTransition(playlist) {
  const first = firstOrdinaryPage(playlist);
  return isObject(first?.transition) ? first.transition : { ...DEFAULT_TRANSITION };
}
function stingerLogo(transition) {
  const stinger = isObject(transition) && transition.type === "stinger" && isObject(transition.stinger) ? transition.stinger : void 0;
  const logo = stinger?.logo;
  return typeof logo === "string" && logo.startsWith("media:") ? logo.slice("media:".length) : void 0;
}
async function transitionFor(client, playlist) {
  const transition = pageTransition(playlist);
  const logo = stingerLogo(transition);
  if (logo === void 0)
    return transition;
  try {
    await client.call({ method: "GET", path: "/api/media/".concat(encodeURIComponent(logo)) });
    return transition;
  } catch (error) {
    const code = error instanceof CliError ? error.problem.code : void 0;
    if (code === "outside_upload_scope" || code === "not_found")
      return { ...DEFAULT_TRANSITION };
    if (code === "forbidden" || code === "insufficient_access")
      return transition;
    throw error;
  }
}
var SOUND_CUE_MESSAGE = "a page with sound cannot cue the soundtrack";
function buildMediaPage(input) {
  const canvas = pageCanvas(input.playlist);
  const primitive = {
    id: "media",
    primitive: input.kind,
    selector: { by: "id", media_id: input.mediaId },
    rect: { x: 0, y: 0, width: canvas.width, height: canvas.height },
    layer: 0,
    content_fit: input.fit
  };
  if (input.sound === true && input.kind !== "video")
    throw usageError("--sound plays a video's audio; this media is an image.");
  if (input.kind === "video")
    primitive.muted = input.sound !== true;
  const page = {
    id: input.id,
    canvas,
    transition: input.transition ?? pageTransition(input.playlist),
    advance: input.kind === "image" ? { mode: "duration", after_ms: Math.round(input.seconds * 1e3) } : { mode: "media_end" },
    primitives: [primitive]
  };
  const visibility = visibilityOf(void 0, input.from, input.until);
  if (visibility)
    page.visibility = visibility;
  return page;
}
function visibilityOf(existing, from, until) {
  const base = isObject(existing) ? { ...existing } : { enabled: true };
  if (from !== void 0)
    base.from = from;
  if (until !== void 0)
    base.until = until;
  const bounded = base.from !== void 0 || base.until !== void 0 || base.windows !== void 0 || base.data !== void 0;
  return bounded ? base : void 0;
}
function withoutDates(existing) {
  if (!isObject(existing))
    return void 0;
  const { from: _from, until: _until, ...rest } = existing;
  return rest.windows !== void 0 || rest.data !== void 0 || rest.enabled === false ? rest : void 0;
}
function authoringPage(stored) {
  const page = {};
  for (const [key, value] of Object.entries(stored)) {
    if (key === "comments")
      continue;
    page[key] = key === "primitives" && Array.isArray(value) ? value.map((primitive) => {
      if (!isObject(primitive))
        return primitive;
      const { resolved_media: _resolved, ...rest } = primitive;
      return rest;
    }) : value;
  }
  return page;
}
function replaceMedia(input) {
  const page = authoringPage(input.stored);
  let result = page;
  if (input.mediaId !== void 0 || input.fit !== void 0 || input.seconds !== void 0 || input.sound === true) {
    const primitives = Array.isArray(page.primitives) ? page.primitives : [];
    const only = primitives.length === 1 && isObject(primitives[0]) ? primitives[0] : void 0;
    if (!only) {
      throw usageError("Page ".concat(String(input.stored.id), " holds ").concat(primitives.length, " primitives, so its media cannot be swapped by itself. Send the whole page with --file."));
    }
    if (input.mediaId === void 0 || input.kind === void 0 || only.primitive === input.kind) {
      const primitive = { ...only };
      if (input.mediaId !== void 0)
        primitive.selector = { by: "id", media_id: input.mediaId };
      if (input.fit)
        primitive.content_fit = input.fit;
      if (input.sound === true) {
        if (only.primitive !== "video")
          throw usageError("--sound plays a video's audio; page ".concat(String(input.stored.id), " shows ").concat(only.primitive === "image" ? "an image" : "a ".concat(String(only.primitive)), "."));
        primitive.muted = false;
      }
      result = { ...page, primitives: [primitive] };
      if (only.primitive === "image" && input.seconds !== void 0)
        result.advance = { mode: "duration", after_ms: Math.round(input.seconds * 1e3) };
    } else {
      const rebuilt = buildMediaPage({ id: String(input.stored.id), mediaId: input.mediaId, kind: input.kind, fit: input.fit ?? "contain", seconds: input.seconds ?? DEFAULT_SECONDS, playlist: input.playlist, ...input.sound ? { sound: true } : {} });
      result = { ...page, canvas: rebuilt.canvas, advance: rebuilt.advance, primitives: rebuilt.primitives };
    }
  }
  if (input.sound === true && result.audio_cue !== void 0) {
    throw usageError("Page ".concat(String(input.stored.id), " has an audio_cue, and ").concat(SOUND_CUE_MESSAGE, ". Replace it with --file, without the cue, to give it sound."));
  }
  if (input.always) {
    const visibility2 = withoutDates(page.visibility);
    if (visibility2)
      result.visibility = visibility2;
    else
      delete result.visibility;
    return result;
  }
  const visibility = visibilityOf(page.visibility, input.from, input.until);
  if (visibility)
    result.visibility = visibility;
  return result;
}
function playlistId(args, command) {
  const id = args.positionals[3];
  if (!id || !isResourceID(id, "playlist"))
    throw usageError("playlist page ".concat(command, " requires the playlist ID (pl_...)."));
  return id;
}
function pageIdArg(args, command) {
  const id = args.positionals[4];
  if (!id || !PAGE_ID_PATTERN.test(id))
    throw usageError("playlist page ".concat(command, " requires the page ID (a letter, then letters, digits, - or _)."));
  return id;
}
function seconds(args) {
  const value = flagNumber(args.flags, "seconds");
  if (value === void 0)
    return void 0;
  if (!Number.isFinite(value) || value < 1 || value > 86400)
    throw usageError("--seconds takes 1 to 86400.");
  return value;
}
function fit(args) {
  const value = flagString(args.flags, "fit");
  if (value === void 0)
    return void 0;
  if (value !== "contain" && value !== "cover")
    throw usageError("--fit takes contain or cover.");
  return value;
}
function sound(args) {
  return flagBool(args.flags, "sound");
}
function dates(args) {
  const from = flagString(args.flags, "from"), until = flagString(args.flags, "until");
  const always = flagBool(args.flags, "always");
  if (always && (from !== void 0 || until !== void 0))
    throw usageError("--always removes the dates; it cannot be used with --from or --until.");
  return {
    ...from !== void 0 ? { from: civilTime(from, "from", "--from") } : {},
    ...until !== void 0 ? { until: civilTime(until, "until", "--until") } : {},
    always
  };
}
async function pageFromFile(file, runtime) {
  let parsed;
  try {
    parsed = await readAuthoringJson(file, runtime);
  } catch (error) {
    throw usageError("Cannot read the page JSON: ".concat(error instanceof Error ? error.message : "invalid JSON"));
  }
  if (!isObject(parsed))
    throw usageError("The page file must hold one page object.");
  return parsed;
}
async function mediaOf(client, mediaId) {
  if (!isResourceID(mediaId, "media"))
    throw usageError("--media takes a media ID (med_...); media list shows them.");
  const media = (await client.call({ method: "GET", path: "/api/media/".concat(encodeURIComponent(mediaId)) })).body;
  const kind = isObject(media) ? media.primitive : void 0;
  if (kind !== "image" && kind !== "video")
    throw usageError("Media ".concat(mediaId, " is ").concat(typeof kind === "string" ? "a ".concat(kind, " file") : "not a file a page can show", "; a page shows an image or a video."));
  return kind;
}
async function playlistOf(client, id) {
  const response = await client.call({ method: "GET", path: "/api/playlists/".concat(encodeURIComponent(id)) });
  const playlist = response.body;
  if (!isObject(playlist) || !Number.isSafeInteger(playlist.revision))
    throw usageError("The playlist answer does not match the generated contract.");
  return { playlist, revision: playlist.revision };
}
async function playlistAsProposed(client, id, playlist, token) {
  const claims = accessClaims(token);
  if (!claims?.clientId && !claims?.sub)
    return playlist;
  const response = await client.listAll("/api/reviews", { state: "pending", kind: "playlist_change", limit: "100" }, { cursorParam: "cursor", uncapped: true });
  const list = response.body;
  if (!Array.isArray(list?.items))
    throw unexpectedResponseError("The review list answer does not match the generated contract.", client.requestId);
  const review = list.items.find((candidate) => {
    const change = candidate.playlist_change;
    const own = claims.clientId ? candidate.proposer.kind === "client" && candidate.proposer.client_id === claims.clientId : candidate.proposer.kind === "agent" && candidate.proposer.agent_id === claims.sub;
    return own && candidate.kind === "playlist_change" && candidate.state === "pending" && candidate.subject.type === "playlist" && candidate.subject.id === id && change?.operation === "update" && change.base_revision === playlist.revision && Array.isArray(change.proposed.page_edits) && change.proposed.page_edits.length > 0;
  });
  if (!review)
    return playlist;
  const pages = review.playlist_change.proposed.pages;
  if (!Array.isArray(pages))
    throw unexpectedResponseError("The proposed playlist answer does not match the generated contract.", client.requestId);
  return { ...playlist, pages };
}
function pageWrite(client, args, request) {
  const expected = request.revision ?? flagString(args.flags, "expect-rev");
  return client.call({
    method: request.method,
    path: request.path,
    idempotent: true,
    ...request.body === void 0 ? {} : { body: request.body },
    headers: { ...reviewNoteFrom(args), ...expected !== void 0 ? { "if-match": quotedRevision(expected) } : {} }
  });
}
function pageResult(response, requestId, title) {
  const pending = pendingReviewOf(response);
  return pending ? pendingReviewResult(response, pending, requestId) : playlistWriteResult(response, requestId, title);
}
var pagesPath = (id) => "/api/playlists/".concat(encodeURIComponent(id), "/pages");
async function storedPageOf(client, id, pageId, token) {
  const { playlist: live, revision: revision2 } = await playlistOf(client, id);
  const playlist = await playlistAsProposed(client, id, live, token);
  const stored = (Array.isArray(playlist.pages) ? playlist.pages : []).find((candidate) => isObject(candidate) && candidate.id === pageId);
  if (!stored)
    throw usageError("Playlist ".concat(id, " has no page ").concat(pageId, "; playlist show ").concat(id, " lists its pages."));
  return { stored, playlist, revision: String(revision2) };
}
async function putPage(client, args, id, pageId, page, revision2, title) {
  const response = await pageWrite(client, args, { method: "PUT", path: "".concat(pagesPath(id), "/").concat(encodeURIComponent(pageId)), body: page, ...revision2 && flagString(args.flags, "expect-rev") === void 0 ? { revision: revision2 } : {} });
  return pageResult(response, client.requestId, title);
}
var handlePlaylistPageAdd = commandHandler(async (args, runtime, resolved) => {
  const id = playlistId(args, "add");
  const file = flagString(args.flags, "file"), media = flagString(args.flags, "media");
  if (file === void 0 === (media === void 0))
    throw usageError("playlist page add requires exactly one of --file PAGE.json or --media MED_ID.");
  const when = dates(args);
  if (when.always)
    throw usageError("--always belongs to playlist page replace: a new page is always shown unless --from or --until bound it.");
  const before = flagString(args.flags, "before");
  if (before !== void 0 && !PAGE_ID_PATTERN.test(before))
    throw usageError("--before takes a page ID.");
  const requestedId = flagString(args.flags, "page-id");
  if (requestedId !== void 0 && !PAGE_ID_PATTERN.test(requestedId))
    throw usageError("--page-id takes a letter, then letters, digits, - or _ (at most 64).");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let page;
  if (file !== void 0) {
    if (seconds(args) !== void 0 || fit(args) !== void 0 || sound(args))
      throw usageError("--seconds, --fit and --sound shape a page built from --media; a --file page is sent as written.");
    page = await pageFromFile(file, runtime);
    if (requestedId !== void 0)
      page.id = requestedId;
    const visibility = visibilityOf(page.visibility, when.from, when.until);
    if (visibility)
      page.visibility = visibility;
  } else {
    const kind = await mediaOf(client, media);
    const { playlist } = await playlistOf(client, id);
    const transition = await transitionFor(client, playlist);
    page = buildMediaPage({ id: requestedId ?? newPageId(), mediaId: media, kind, fit: fit(args) ?? "contain", seconds: seconds(args) ?? DEFAULT_SECONDS, playlist, transition, ...sound(args) ? { sound: true } : {}, ...when.from ? { from: when.from } : {}, ...when.until ? { until: when.until } : {} });
  }
  const response = await pageWrite(client, args, { method: "POST", path: pagesPath(id), body: { page, ...before !== void 0 ? { before } : {} } });
  return pageResult(response, client.requestId, "Page ".concat(String(page.id), " added to ").concat(id, "."));
}, true);
var handlePlaylistPageReplace = commandHandler(async (args, runtime, resolved) => {
  const id = playlistId(args, "replace");
  const pageId = pageIdArg(args, "replace");
  const file = flagString(args.flags, "file"), media = flagString(args.flags, "media");
  if (file !== void 0 && media !== void 0)
    throw usageError("playlist page replace takes --file PAGE.json or --media MED_ID, not both.");
  const when = dates(args);
  if (file === void 0 && media === void 0 && when.from === void 0 && when.until === void 0 && !when.always && !sound(args)) {
    throw usageError("playlist page replace requires --file PAGE.json, --media MED_ID, a date change (--from, --until or --always), or --sound.");
  }
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let page;
  let revision2;
  if (file !== void 0) {
    if (seconds(args) !== void 0 || fit(args) !== void 0 || sound(args))
      throw usageError("--seconds, --fit and --sound shape a page built from --media; a --file page is sent as written.");
    page = await pageFromFile(file, runtime);
    if (page.id !== void 0 && page.id !== pageId)
      throw usageError("The page file's id ".concat(String(page.id), " is not ").concat(pageId, "; a replace keeps the page's id."));
    page.id = pageId;
    if (when.always) {
      const visibility = withoutDates(page.visibility);
      if (visibility)
        page.visibility = visibility;
      else
        delete page.visibility;
    } else {
      const visibility = visibilityOf(page.visibility, when.from, when.until);
      if (visibility)
        page.visibility = visibility;
    }
  } else {
    const { stored, playlist, revision: current } = await storedPageOf(client, id, pageId, resolved.token);
    const kind = media !== void 0 ? await mediaOf(client, media) : void 0;
    page = replaceMedia({ stored, ...media !== void 0 ? { mediaId: media, kind } : {}, ...fit(args) ? { fit: fit(args) } : {}, ...seconds(args) !== void 0 ? { seconds: seconds(args) } : {}, ...sound(args) ? { sound: true } : {}, playlist, ...when.from ? { from: when.from } : {}, ...when.until ? { until: when.until } : {}, always: when.always });
    revision2 = current;
  }
  return putPage(client, args, id, pageId, page, revision2, "Page ".concat(pageId, " of ").concat(id, " replaced."));
}, true);
var handlePlaylistPageRemove = commandHandler(async (args, runtime, resolved) => {
  const id = playlistId(args, "remove");
  const pageId = pageIdArg(args, "remove");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await pageWrite(client, args, { method: "DELETE", path: "".concat(pagesPath(id), "/").concat(encodeURIComponent(pageId)) });
  return pageResult(response, client.requestId, "Page ".concat(pageId, " removed from ").concat(id, "."));
}, true);

// dist/cli-commands/playlist.js
var REGIONS = ["header", "footer", "side"];
var ORIENTATIONS = ["landscape", "portrait"];
var REGION_HELP = "Make a strip: a playlist drawn over the page along the top (header), bottom (footer) or right edge (side) of a display, replacing a format in the file; give --format-orientation too";
var ORIENTATION_HELP = "With --format-region: the orientation of the display the strip is made for, as the viewer sees it";
var SOUND_HELP = "Play a video's audio (default: silent)";
function registerPlaylistCommands(root, bind) {
  const playlist = root.command("playlist").description("Author, validate, and manage playlists");
  const init = playlist.command("init").description("Prepare an editable playlist from files, ready media, application releases, or http(s) URLs").argument("<inputs...>", "Local image/video/audio files, med_ IDs, rel_ IDs, http(s) URLs or pasted <iframe> embed codes (iframe pages) in playback order; audio becomes the soundtrack").requiredOption("--name <NAME>", "Playlist name").requiredOption("--output <FILE>", "Write an editable playlist file").option("--overwrite", "Replace an existing output file atomically with a document built from these inputs").option("--target-width <PX>", "Override canvas width", positiveInteger("target-width")).option("--target-height <PX>", "Override canvas height", positiveInteger("target-height")).addOption(new Option("--duration-ms <MS>", "Non-video page duration (default 8000; 86400000 for application pages)").argParser(positiveInteger("duration-ms"))).addOption(new Option("--fit <FIT>", "Content fit").choices(["contain", "cover", "fill"]).default("contain")).option("--sound", "Play the audio of video pages (default: silent)").option("--no-transcode", "Upload accepted file bytes unchanged").option("--no-progress", "Suppress upload progress on stderr").option("--poll-ms <MS>", "Upload polling interval", positiveInteger("poll-ms")).option("--screen-id <ID>", "Use this screen\u2019s identity, revision, and reported dimensions (a video wall\u2019s canvas and format when it has one)").action(bind(handlePlaylistInit));
  requireOptionGroup(init, "together", ["--target-width", "--target-height"]);
  addCommandNotes(init, "Provide --screen-id for target identity, revision, and reported dimensions, or both target dimensions. Files upload up to four at a time and wait for readiness; data.uploads reports each file's media_id, reused and per-stage timing. Nothing is written until every upload is ready, so an interrupted run leaves no output; rerun the same command and files already uploaded return their existing media IDs. Release IDs are pinned; server validation checks availability, and data.release_ids and data.media_ids report what the document holds. An existing non-empty --output file fails with usage_error (exit 2) and is left untouched; choose a new path or add --overwrite to rebuild it from these inputs, never publish the old file. Application pages hold for 24 hours (86400000 ms, the contract maximum) unless --duration-ms is given, because an app that rotates internally restarts each time its page advances; an application page set under 60 seconds earns an application_page_short warning here, in playlist validate and in screen publish. Audio inputs become the playlist soundtrack (tracks in input order) instead of pages. Video pages are silent unless --sound; a page with sound pauses the soundtrack while it shows. A screen with a video wall (screen wall set) uses the wall's canvas and the document carries the matching format {displays, arrangement, orientation, columns for a grid}: each tile is 1920x1080, or 1080x1920 for rotation 90 and 270, a row is that many tiles wide, a column that many tiles high and a grid its columns wide (data.format reports it). Explicit --target-width and --target-height instead make an ordinary playlist that every display mirrors. Inspect the document before publishing. An iframe address may carry screen tokens such as {screen.field.kiosk_id} in its path, query or fragment: it is kept as written and each screen's manifest fills in its own. A pasted <iframe> embed code (from Google's Publish to web or Microsoft's Embed dialog) is read for its src and becomes an iframe page; Google Slides, Docs and Sheets and Microsoft 365 Embed links are rebuilt for the screen when the playlist is written, and a Slides deck advances on its link's delay held to --duration-ms (give the page the time of the whole deck).");
  addCommandExamples(init, "screenrig playlist init med_IMAGE --name Lobby --screen-id scr_SCREEN --output lobby.json", "screenrig playlist init med_IMAGE med_VIDEO --name Lobby --target-width 1920 --target-height 1080 --output lobby.json");
  playlist.command("validate").description("Validate a playlist file").argument("<file>", "Playlist JSON file, or - for stdin").action(bind(handlePlaylistValidate));
  const create = playlist.command("create").description("Create a playlist from a file, from a template, or the built-in Urgent notice template").argument("[file]", "Playlist JSON file, or - for stdin").option("--from-template <ID>", "Make the playlist from this template: its current pages with the --set values filled in").option("--starter <KEY>", "Add a built-in template: urgent-notice (a headline and a message)").option("--name <NAME>", "The new playlist's name (required with --from-template)").option("--set <NAME=VALUE>", "With --from-template: a field's value, a media ID for a media field (repeatable)", templateSetOption).option("--dry-run", "With --from-template: check the values and print the page count without creating anything").option("--note <TEXT>", NOTE_HELP, reviewNoteOption).addOption(new Option("--format-region <REGION>", REGION_HELP).choices(REGIONS)).addOption(new Option("--format-orientation <ORIENTATION>", ORIENTATION_HELP).choices(ORIENTATIONS)).action(bind(handlePlaylistCreate));
  requireOptionGroup(create, "atMostOne", ["--from-template", "--starter", "--format-region"]);
  requireOptionGroup(create, "together", ["--format-region", "--format-orientation"]);
  requireOptionGroup(create, "requires", ["--set", "--from-template"]);
  requireOptionGroup(create, "requires", ["--dry-run", "--from-template"]);
  const fields = playlist.command("fields").description("Show a template's fields or a copy's values, or change the values and bring the copy up to date").argument("<id>", "Playlist identifier: a template, or a playlist made from one").option("--set <NAME=VALUE>", "Set a field's value (repeatable)", templateSetOption).option("--clear <NAME>", "Clear an optional field's value (repeatable)", templateClearOption).option("--refresh", "Build the pages again from the template's current revision, whatever the values").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handlePlaylistFields));
  addCommandExamples(fields, "screenrig playlist fields pl_TEMPLATE", "screenrig playlist fields pl_COPY --set headline=Closed");
  playlist.command("instances").description("List the playlists made from a template and the template revision each was built from").argument("<id>", "Template playlist identifier").action(bind(handlePlaylistInstances));
  const update = playlist.command("update").description("Update a playlist").argument("<id>", "Playlist identifier").argument("<file>", "Playlist JSON file, or - for stdin").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).addOption(new Option("--format-region <REGION>", REGION_HELP).choices(REGIONS)).addOption(new Option("--format-orientation <ORIENTATION>", ORIENTATION_HELP).choices(ORIENTATIONS)).action(bind(handlePlaylistUpdate));
  requireOptionGroup(update, "together", ["--format-region", "--format-orientation"]);
  const patch = playlist.command("patch").description("Change only supplied playlist fields; preserve everything omitted").argument("<id>", "Playlist identifier").argument("[file]", "Partial JSON object containing name, pages, audio or format; - for stdin").option("--name <NAME>", "Set the playlist name without resubmitting its content").option("--clear-audio", "Remove the soundtrack; pages must not retain audio cues").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handlePlaylistPatch));
  addCommandNotes(patch, "Supply a partial JSON file, --name, or --clear-audio. Omitted fields stay unchanged; supplied pages and audio replace the complete value, and audio null clears it. Arrays are not merged. Name-only changes do not revalidate existing content. Page/audio changes are checked together by the server. Review policy and Propose access work as for playlist update; pending_review waits for a person's approval. Use --expect-rev to refuse intervening edits. An interrupted retry uses the same saved write key.");
  addCommandExamples(patch, 'screenrig playlist patch pl_PLAYLIST --name "Cello recordings \u2014 36 tracks" --expect-rev 7', "screenrig playlist patch pl_PLAYLIST changes.json --expect-rev 7");
  playlist.command("rename").description("Change a playlist's name without resubmitting its content").argument("<id>", "Playlist identifier").requiredOption("--name <NAME>", "New playlist name").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handlePlaylistPatch));
  const replaceRelease = playlist.command("replace-release").description("Preview or apply one application release replacement and its shared-screen impact").argument("<id>", "Playlist identifier").requiredOption("--page <ID>", "Exact page identifier").requiredOption("--primitive <ID>", "Exact application primitive identifier within the page").requiredOption("--release-id <ID>", "New immutable release identifier").option("--apply", "Apply the reviewed replacement").option("--expect-rev <REVISION>", "Playlist revision from the preview", revision).option("--expect-impact <TOKEN>", "Impact token from the preview").option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handlePlaylistReplaceRelease));
  requireOptionGroup(replaceRelease, "requires", ["--expect-impact", "--apply"]);
  requireOptionGroup(replaceRelease, "requires", ["--expect-rev", "--apply"]);
  requireOptionGroup(replaceRelease, "requires", ["--note", "--apply"]);
  addCommandNotes(replaceRelease, "Defaults to a read-only preview including active, pairing-pending and archived screens whose default assignment, stored schedule entries, takeover or current effective playlist references the playlist. Current effective playlists include campaign and inherited-folder playback. Stored schedule references include paused and future entries. Apply writes directly; --expect-impact and --expect-rev are optional guards. Changed references or impact require a fresh review. References are a snapshot; a supplied playlist revision is checked atomically. Server validates release availability and ownership on apply.");
  addCommandExamples(replaceRelease, "screenrig playlist replace-release pl_PLAYLIST --page board-page --primitive board --release-id rel_NEW", "screenrig playlist replace-release pl_PLAYLIST --page board-page --primitive board --release-id rel_NEW --apply");
  const exportCommand = subcommand(playlist, "export").description("Export a playlist bundle").argument("<id>", "Playlist identifier").requiredOption("--output <PATH>", "Write the exported bundle to this directory (required)").option("--skip-applications", "Drop applications and empty or application-controlled pages; report what was skipped").action(bind(handlePlaylistExport));
  addCommandNotes(exportCommand, "Bundles image and video media, soundtrack audio and iframe URLs (an address with screen tokens keeps its tokens as written) with their reload_s, fallback_src and navigation_allowlist; dynamic media selectors are snapshotted. Cards, streams and adslot pages stop the export. Applications stop it by default; --skip-applications drops them and empty or application-controlled pages, reports skipped ids, and requires at least one remaining page. For an editable document retaining card and application references in the same project, use playlist show <id> --output playlist.json. Referenced resources stay in that project.");
  const importCommand2 = playlist.command("import").description("Import a playlist bundle").argument("<directory>", "Local directory").option("--name <NAME>", "Set the imported playlist name").option("--update <ID>", "Update this playlist when importing").option("--expect-rev <REVISION>", "Require the current resource revision", revision).option("--poll-ms <MS>", "Set the operation polling interval", positiveInteger("poll-ms")).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handlePlaylistImport));
  requireOptionGroup(importCommand2, "requires", ["--expect-rev", "--update"]);
  const show = playlist.command("show").description("Inspect a playlist or write an editable document").option("--output <FILE>", "Create an editable playlist file; report its revision on stdout").option("--editable", "Return an editable document and revision in the JSON envelope").option("--overwrite", "Replace an existing output file atomically").argument("<id>", "Playlist identifier").action(bind(handlePlaylistShow));
  addCommandExamples(show, "screenrig playlist show pl_PLAYLIST --output playlist.json", "screenrig playlist show pl_PLAYLIST --editable");
  playlist.command("list").description("List playlists").option("--templates", "Only templates: playlists that declare fields").option("--library", "List the organization Library's playlists instead (read-only)").action(bind(handlePlaylistList));
  playlist.command("revisions").description("List a playlist's revisions, newest first, one page at a time").argument("<id>", "Playlist identifier").option("--after <CURSOR>", "Continue from the data.next_cursor of the previous page").action(bind(handlePlaylistRevisions));
  const revisionGroup = playlist.command("revision").description("Inspect one stored revision of a playlist");
  revisionGroup.command("show").description("Show one revision and the playlist as it stood at that revision").argument("<id>", "Playlist identifier").requiredOption("--revision <N>", "Revision to show, as playlist revisions numbers it (required)", positiveInteger("revision")).action(bind(handlePlaylistRevisionShow));
  playlist.command("promote").description("Make an earlier revision current again by copying it forward as a new revision").argument("<id>", "Playlist identifier").requiredOption("--revision <N>", "Revision to copy forward, as playlist revisions numbers it (required)", positiveInteger("revision")).requiredOption("--expect-rev <REVISION>", "The playlist's current revision, from playlist show or the current row of playlist revisions (If-Match; required)", revision).action(bind(handlePlaylistPromote));
  const page = playlist.command("page").description("Add, replace or remove one page of a playlist without resending the others");
  const pageAdd = page.command("add").description("Add a page: an uploaded image or video, or a page file").argument("<playlist-id>", "Playlist identifier").option("--file <PAGE.json>", "A page object to add, or - for stdin").option("--media <MED_ID>", "Show this image or video full-canvas, built on the playlist's canvas").option("--seconds <N>", "How long an image shows (default 10); a video plays to its end", positiveInteger("seconds")).addOption(new Option("--fit <FIT>", "How the media fits the canvas (default contain)").choices(["contain", "cover"])).option("--sound", SOUND_HELP).option("--from <WHEN>", "First time the page is shown: YYYY-MM-DDTHH:MM or YYYY-MM-DD (00:00), in each screen's timezone").option("--until <WHEN>", "End of the page's showing: YYYY-MM-DDTHH:MM, or YYYY-MM-DD for the end of that day").option("--before <PAGE_ID>", "Put the page in front of this page (default: at the end)").option("--page-id <ID>", "The new page's id (default: up- and eight letters or digits)").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handlePlaylistPageAdd));
  requireOptionGroup(pageAdd, "exactlyOne", ["--file", "--media"]);
  const pageReplace = page.command("replace").description("Replace one page, keeping its place and id").argument("<playlist-id>", "Playlist identifier").argument("<page-id>", "The page to replace").option("--file <PAGE.json>", "The complete new page, or - for stdin").option("--media <MED_ID>", "Swap the page's media; everything else, dates included, stays as stored. Without --file or --media, only the dates (and --seconds, --fit, --sound) change").option("--seconds <N>", "How long an image shows", positiveInteger("seconds")).addOption(new Option("--fit <FIT>", "How the media fits the canvas").choices(["contain", "cover"])).option("--sound", SOUND_HELP).option("--from <WHEN>", "First time the page is shown: YYYY-MM-DDTHH:MM or YYYY-MM-DD (00:00), in each screen's timezone").option("--until <WHEN>", "End of the page's showing: YYYY-MM-DDTHH:MM, or YYYY-MM-DD for the end of that day").option("--always", "Remove the page's dates (from and until); a switch-off or weekly windows the project set stay").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handlePlaylistPageReplace));
  requireOptionGroup(pageReplace, "atMostOne", ["--file", "--media"]);
  requireOptionGroup(pageReplace, "atLeastOne", ["--file", "--media", "--from", "--until", "--always", "--sound"]);
  page.command("remove").description("Remove one page").argument("<playlist-id>", "Playlist identifier").argument("<page-id>", "The page to remove").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handlePlaylistPageRemove));
  playlist.command("delete").description("Delete a playlist").argument("<id>", "Playlist identifier").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handlePlaylistDelete));
}

// dist/handlers/reviews.js
var REVIEW_LIST_MAX = 100;
var handleReviewsList = commandHandler(async (args, runtime, resolved) => {
  const limit = flagString(args.flags, "limit");
  if (limit !== void 0 && Number(limit) > REVIEW_LIST_MAX)
    throw usageError("--limit must be at most ".concat(REVIEW_LIST_MAX, "."));
  const state = flagString(args.flags, "state");
  const kind = flagString(args.flags, "kind");
  const cursor = flagString(args.flags, "cursor");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "/api/reviews", query: { state, kind, limit, cursor } });
  const page = response.body ?? {};
  const next = typeof page.next_cursor === "string" && page.next_cursor ? page.next_cursor : void 0;
  const nextArgv = next ? ["reviews", "list", ...state ? ["--state", state] : [], ...kind ? ["--kind", kind] : [], ...limit ? ["--limit", limit] : [], "--cursor", next] : void 0;
  return {
    envelope: jsonBody(response, client.requestId, nextArgv ? { next: { command: "screenrig ".concat(nextArgv.join(" ")), argv: nextArgv, reason: "Read the next page of reviews." } } : void 0),
    exitCode: ExitCode.Success,
    human: [...reviewListLines(page), ...nextArgv ? ["next: screenrig ".concat(nextArgv.join(" "))] : []].join("\n")
  };
});
var handleReviewsShow = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  if (!id)
    throw usageError("reviews show requires <review-id>.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "/api/reviews/".concat(encodeURIComponent(id)) });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: reviewDetailLines(response.body).join("\n")
  };
});
var handleReviewsWithdraw = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  if (!id)
    throw usageError("reviews withdraw requires <review-id>.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "POST", path: "/api/reviews/".concat(encodeURIComponent(id), "/withdraw"), idempotent: true });
  const result = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Withdrew review ".concat(id, "; nothing it proposed reaches the screens."), ...result?.review ? reviewDetailLines(result.review).slice(1) : []].join("\n")
  };
});

// dist/cli-commands/reviews.js
function registerReviewsCommands(root, bind) {
  const reviews = root.command("reviews").description("Read and withdraw changes waiting for a person's review");
  addCommandNotes(reviews, "Under Propose access, or in a project that requires review for agent changes, playlist create and update, screen assign, playlist schedules and takeovers answer pending_review instead of applying: the change waits for a person to approve, reject or ask for changes in the dashboard, and nothing changes on glass until it is approved. The write returns the review id and its dashboard URL. Tell the person it is waiting and give them the URL; do not repeat the write or poll. Check the decision later with reviews show ID; a rejection or a change request carries the person's note in decision_note, so fix the change and propose it again with --note explaining it. A media replace or restore answers pending_review the same way. Media a Propose credential uploads or retags gets its own review (subject type media) when approving it would change what the tag, folder or all selectors of approved playlists or open playlist proposals play. Agents cannot approve playlist or screen reviews. In a project with a protected screen folder, every change that reaches one of its screens waits for a second approver at any access level: an approver other than you, and other than the person you work for, decides it (second_approver_required, exit 3, if the wrong person tries). Assigns, playlist schedules and takeovers are screen_change reviews with protected true; campaign create, change and delete, screen folder create, change, delete and protection removal, and screens moved are protected_change reviews (reviews list --kind protected_change). review_stale means the campaign or folder changed after the proposal: read it again and propose it again. Changes with no review form are refused with protected_target (exit 5). A caller limited to screen folders reads and withdraws only reviews whose whole reach is inside its scope.");
  reviews.command("list").description("List reviews, pending first by default").addOption(new Option("--state <STATE>", "pending (default), decided, or all").choices(["pending", "decided", "all"])).addOption(new Option("--kind <KIND>", "Only this kind of review").choices(["playlist_change", "screen_change", "ad_creative", "protected_change"])).option("--limit <N>", "Reviews per page, 1-100 (default 50)", positiveInteger("limit")).option("--cursor <CURSOR>", "Continue from data.next_cursor of the previous page").action(bind(handleReviewsList));
  addCommandNotes(reviews.command("show").description("Inspect one review and its decision").argument("<review-id>", "Review identifier (rvw_ or an ad review id)").action(bind(handleReviewsShow)), "state is pending, approved, rejected, changes_requested, withdrawn, superseded (a newer proposal replaced it) or stale (the live playlist moved on before approval; propose again; a stale media review is replaced by a fresh one within seconds). decision_note is the person's reason or requested changes. A playlist change carries preview.live and preview.proposed; playlist show returns the live version, not the proposal. A media review (subject type media, operation selector_refresh) has no preview: playlist_change.media_change holds the tags (one sorted set) and folder (empty at the library root) before (as last approved; null for a new upload) and after, and playlist_change.media_playlists lists each approved playlist or open playlist proposal whose selection changes, with its screens and the media it starts (media_added) and stops (media_removed) playing; impact.screens adds them up. A media replacement or restore (subject type media, operation media_replace; media replace and media restore under Propose access) has no preview either: playlist_change.media_replace holds the file now in service (before) and the file approving puts in service (after) with content_type, size and sha256, the version it becomes, source (replace or restore), the proposer's note, aspect_changed and the playlists that use the media; impact.screens counts their screens. The media keeps playing its current file until a person approves. A screen change shows blockers, the playlist reviews it waits on with their state now, and after approval result, with applying true while large fleets finish. A protected_change review (subject type campaign or screen_folder, or screen for screens moved) shows protected_change: subkind, and the campaign's name, playlist and audience, the folder's name and parent, or the screens and folders moved and where. protected is true on it and on a screen change that reached a protected screen.");
  addCommandNotes(reviews.command("withdraw").description("Withdraw a pending change this credential proposed").argument("<review-id>", "Review identifier").action(bind(handleReviewsWithdraw)), "Withdraws a pending playlist or screen change that this agent or service client proposed; nothing reaches the screens. A withdrawn new playlist stays unapproved.");
}

// dist/card-expiry.js
function cardTtl(value) {
  const match = /^([1-9][0-9]*)(s|m|h|d)?$/.exec(value);
  const seconds2 = match ? Number(match[1]) * ({ s: 1, m: 60, h: 3600, d: 86400 }[match[2] ?? "s"] ?? 1) : NaN;
  if (!Number.isSafeInteger(seconds2) || seconds2 < 1 || seconds2 > 31536e3)
    throw usageError("--ttl takes 1s to 365d, for example 30m or 12h.");
  return String(seconds2);
}
function cardExpiry(flags) {
  const at = flagString(flags, "expires-at");
  const ttl = flagString(flags, "ttl");
  if (at && ttl)
    throw usageError("Provide --expires-at or --ttl.");
  if (ttl)
    return { ttl_seconds: Number(cardTtl(ttl)) };
  if (!at)
    return {};
  if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(at) || !Number.isFinite(Date.parse(at)))
    throw usageError("--expires-at requires an ISO timestamp with a timezone.");
  return { expires_at: new Date(at).toISOString() };
}

// dist/card-preview.js
import { createHash as createHash4 } from "node:crypto";
import { mkdir as mkdir2, readFile, writeFile } from "node:fs/promises";
import path4 from "node:path";

// dist/headless-preview.js
import { spawn } from "node:child_process";
import { access, mkdtemp as mkdtemp2, rm as rm2 } from "node:fs/promises";
import { tmpdir } from "node:os";
import path3 from "node:path";
var PREVIEW_ORIGIN = "https://screenrig-preview.invalid";
var PREVIEW_CSP = "default-src 'self' blob: data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'none'";
function diagnostic(value) {
  return redactText(value.replace(/data:[^\s"'<>]+/g, "[inline resource]")).slice(0, 1e3);
}
async function withPreviewBrowser(settings, work) {
  const candidates = [settings.SCREENRIG_BROWSER, "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", settings.PROGRAMFILES && path3.join(settings.PROGRAMFILES, "Google/Chrome/Application/chrome.exe")];
  let binary;
  for (const candidate of candidates)
    if (candidate) {
      try {
        await access(candidate);
        binary = candidate;
        break;
      } catch {
      }
    }
  if (!binary)
    throw usageError("Local card previews need Chromium or Chrome. Set SCREENRIG_BROWSER to its executable path.");
  const profile = await mkdtemp2(path3.join(settings.TMPDIR ?? tmpdir(), "screenrig-preview-"));
  const rootFlags = process.getuid?.() === 0 ? ["--no-sandbox"] : [];
  const child = spawn(binary, ["--headless=new", "--no-first-run", "--no-default-browser-check", "--disable-background-networking", "--disable-extensions", "--disable-dev-shm-usage", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", ...rootFlags, "--remote-debugging-pipe", "--user-data-dir=".concat(profile), "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "about:blank"], { stdio: ["ignore", "ignore", "pipe", "pipe", "pipe"], detached: process.platform !== "win32" });
  const closed = new Promise((resolve) => {
    child.once("close", () => resolve());
  });
  const pending = /* @__PURE__ */ new Map();
  const listeners = /* @__PURE__ */ new Set();
  let serial = 0, buffered = "", stderr = "";
  let stopped;
  child.stderr?.on("data", (chunk) => {
    stderr = (stderr + chunk.toString()).slice(-2e3);
  });
  const failure = () => usageError(diagnostic("Local preview browser stopped: ".concat(stopped, ". ").concat(stderr)));
  const fail = (cause) => {
    stopped ??= cause;
    for (const call2 of pending.values())
      call2.reject(failure());
    pending.clear();
    for (const listener of listeners)
      listener({ method: "Browser.stopped" });
  };
  child.once("error", (error) => fail(error.message));
  child.once("close", (code, signal) => fail(signal ? "signal ".concat(signal) : "exit ".concat(code)));
  const input = child.stdio[3];
  const output = child.stdio[4];
  input.on("error", (error) => fail(error.message));
  output.on("error", (error) => fail(error.message));
  output.once("end", () => fail("browser closed its debugging pipe"));
  output.on("data", (chunk) => {
    buffered += chunk.toString();
    let end;
    while ((end = buffered.indexOf("\0")) >= 0) {
      const frame = buffered.slice(0, end);
      buffered = buffered.slice(end + 1);
      if (!frame)
        continue;
      let answer;
      try {
        answer = JSON.parse(frame);
      } catch {
        fail("invalid browser protocol response");
        continue;
      }
      if (answer.method) {
        for (const listener of listeners)
          listener(answer);
        continue;
      }
      const call2 = pending.get(answer.id);
      if (!call2)
        continue;
      pending.delete(answer.id);
      if (answer.error)
        call2.reject(usageError("Local preview: ".concat(answer.error.message)));
      else
        call2.resolve(answer.result);
    }
  });
  const call = (method, params = {}, sessionId, timeoutMs = 3e4) => new Promise((resolve, reject) => {
    if (stopped) {
      reject(failure());
      return;
    }
    const id = ++serial;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(usageError(diagnostic("Local preview timed out: ".concat(method, ". ").concat(stderr))));
    }, timeoutMs);
    pending.set(id, { resolve: (value) => {
      clearTimeout(timer);
      resolve(value);
    }, reject: (error) => {
      clearTimeout(timer);
      reject(error);
    } });
    input.write(JSON.stringify({ id, method, params, ...sessionId ? { sessionId } : {} }) + "\0");
  });
  const browser = {
    async render(html, width, height, assets = /* @__PURE__ */ new Map()) {
      const { targetId } = await call("Target.createTarget", { url: "about:blank" });
      let sessionId;
      const document = { bytes: Buffer.from(html), type: "text/html; charset=utf-8" };
      const loaded = /* @__PURE__ */ new Set();
      const errors = [];
      const requests = /* @__PURE__ */ new Map();
      let loadWaiter;
      let loadTimer;
      let rejectDelivery;
      const deliveryFailure = new Promise((_, reject) => {
        rejectDelivery = reject;
      });
      void deliveryFailure.catch(() => void 0);
      const pageCall = (method, params = {}) => Promise.race([call(method, params, sessionId), deliveryFailure]);
      const remember = (message) => {
        errors.push(diagnostic(message));
        if (errors.length > 8)
          errors.shift();
      };
      const observe = (message) => {
        if (message.method === "Browser.stopped") {
          loadWaiter?.();
          return;
        }
        if (message.sessionId !== sessionId)
          return;
        const p = message.params;
        if (message.method === "Fetch.requestPaused") {
          const url = new URL(p.request.url);
          const asset = url.origin === PREVIEW_ORIGIN && p.request.method === "GET" ? url.pathname === "/" ? document : assets.get(url.pathname) : void 0;
          const responseHeaders = [{ name: "Content-Type", value: asset?.type ?? "text/plain" }];
          if (asset === document)
            responseHeaders.push({ name: "Content-Security-Policy", value: PREVIEW_CSP }, { name: "Cache-Control", value: "no-store" });
          void call("Fetch.fulfillRequest", { requestId: p.requestId, responseCode: asset ? 200 : 404, responseHeaders, body: (asset?.bytes ?? Buffer.alloc(0)).toString("base64") }, sessionId).catch((error) => {
            remember("Preview resource delivery failed: ".concat(error instanceof Error ? error.message : String(error)));
            rejectDelivery(error);
          });
        }
        if (message.method === "Page.lifecycleEvent" && p.name === "load") {
          loaded.add("".concat(p.frameId, ":").concat(p.loaderId));
          loadWaiter?.();
        }
        if (message.method === "Runtime.exceptionThrown")
          remember(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text);
        if (message.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(p.type))
          remember("Console ".concat(p.type, ": ").concat(p.args.map((arg) => arg.description ?? (typeof arg.value === "string" ? arg.value : arg.type)).join(" ")));
        if (message.method === "Log.entryAdded" && ["error", "warning"].includes(p.entry.level))
          remember("".concat(p.entry.text, " ").concat(p.entry.url ?? ""));
        if (message.method === "Network.requestWillBeSent") {
          if (requests.size >= 256)
            requests.delete(requests.keys().next().value);
          requests.set(p.requestId, diagnostic(p.request.url));
        }
        if (message.method === "Network.responseReceived" && p.response.status >= 400)
          remember("HTTP ".concat(p.response.status, ": ").concat(p.response.url));
        if (message.method === "Network.loadingFailed")
          remember("Resource failed: ".concat(requests.get(p.requestId) ?? p.type, ": ").concat(p.errorText).concat(p.blockedReason ? " (".concat(p.blockedReason, ")") : ""));
        if (message.method === "Network.loadingFailed" || message.method === "Network.loadingFinished")
          requests.delete(p.requestId);
      };
      listeners.add(observe);
      try {
        ({ sessionId } = await call("Target.attachToTarget", { targetId, flatten: true }));
        await pageCall("Page.enable");
        await pageCall("Page.setLifecycleEventsEnabled", { enabled: true });
        await pageCall("Runtime.enable");
        await pageCall("Log.enable");
        await pageCall("Network.enable");
        await pageCall("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
        await pageCall("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
        await pageCall("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
        await pageCall("Page.bringToFront");
        const navigation = await pageCall("Page.navigate", { url: "".concat(PREVIEW_ORIGIN, "/") });
        if (navigation.errorText)
          throw usageError("Local preview navigation failed: ".concat(navigation.errorText));
        if (navigation.loaderId)
          await Promise.race([new Promise((resolve, reject) => {
            loadTimer = setTimeout(() => {
              loadWaiter = void 0;
              reject(usageError("Local preview timed out loading the card page."));
            }, 3e4);
            loadWaiter = () => {
              if (!stopped && !loaded.has("".concat(navigation.frameId, ":").concat(navigation.loaderId)))
                return;
              clearTimeout(loadTimer);
              loadWaiter = void 0;
              if (stopped)
                reject(failure());
              else
                resolve();
            };
            loadWaiter();
          }), deliveryFailure]);
        const result = await pageCall("Runtime.evaluate", { expression: "new Promise((resolve,reject)=>{const until=Date.now()+20000;function wait(){if(window.previewError)reject(new Error(window.previewError));else if(window.previewReady)resolve(window.previewResult);else if(Date.now()>until)reject(new Error('Card did not render'));else setTimeout(wait,20)}wait()})", awaitPromise: true, returnByValue: true });
        if (result.exceptionDetails)
          throw usageError("Card preview failed: ".concat(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text));
        const image = await pageCall("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
        return { png: Buffer.from(image.data, "base64"), result: result.result.value };
      } catch (error) {
        throw usageError(diagnostic(error instanceof Error ? error.message : String(error)) + (errors.length ? "\nBrowser diagnostics:\n".concat(errors.join("\n")) : ""));
      } finally {
        clearTimeout(loadTimer);
        loadWaiter = void 0;
        listeners.delete(observe);
        await call("Target.closeTarget", { targetId }, void 0, 1e3).catch(() => void 0);
      }
    }
  };
  try {
    return await work(browser);
  } finally {
    if (child.pid) {
      try {
        if (process.platform === "win32")
          child.kill();
        else
          process.kill(-child.pid, "SIGKILL");
      } catch {
      }
    }
    await closed;
    await rm2(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

// dist/card-preview.js
async function withCardPreview(options, work) {
  const origin = new URL(options.apiUrl);
  origin.hostname = apexHost(origin.hostname) ?? origin.hostname;
  const response = await fetch(new URL("/cards/index.json?local-preview=" + Date.now(), origin), { signal: AbortSignal.timeout(3e4), redirect: "error" });
  if (!response.ok)
    throw usageError("Cannot load the public card renderer (".concat(response.status, ")."));
  const index = await response.json();
  if (!index.web?.script || !index.web?.sandbox || !index.web?.fonts)
    throw usageError("The public cards index has no web renderer.");
  const assets = /* @__PURE__ */ new Map();
  const cache = path4.join(options.runtime.homedir(), ".cache", "screenrig", "preview");
  await mkdir2(cache, { recursive: true });
  for (const link of [index.web.script, index.web.sandbox, index.web.fonts, ...index.web.font_files ?? []]) {
    if (typeof link.src !== "string" || !/^\/cards\//.test(link.src) || !/^[a-f0-9]{64}$/.test(link.sha256))
      throw usageError("Invalid public renderer asset reference.");
    const filename = path4.join(cache, link.sha256);
    let bytes = await readFile(filename).catch(() => void 0);
    const valid = (value) => createHash4("sha256").update(value).digest("hex") === link.sha256;
    if (!bytes || !valid(bytes)) {
      const answer = await fetch(new URL(link.src, origin), { signal: AbortSignal.timeout(3e4), redirect: "error" });
      if (!answer.ok)
        throw usageError("Cannot load a public card renderer asset (".concat(answer.status, ")."));
      bytes = Buffer.from(await answer.arrayBuffer());
      if (bytes.length > 32 * 1024 * 1024 || !valid(bytes))
        throw usageError("Public card renderer asset failed its digest or size check.");
      await writeFile(filename, bytes);
    }
    assets.set(new URL(link.src, origin).pathname, { bytes, type: link.src.endsWith(".js") ? "text/javascript" : link.src.endsWith(".css") ? "text/css" : "font/ttf" });
  }
  return await withPreviewBrowser(options.runtime.settings, async (browser) => work({
    async render(input) {
      if (![input.width, input.height].every((size) => Number.isSafeInteger(size) && size > 0 && size <= 8192))
        throw usageError("Preview dimensions must be integers from 1 to 8192.");
      if (input.now && !Number.isFinite(Date.parse(input.now)))
        throw usageError("--now must be an ISO timestamp.");
      if (input.timezone) {
        try {
          new Intl.DateTimeFormat("en", { timeZone: input.timezone });
        } catch {
          throw usageError("--timezone must be an IANA timezone.");
        }
      }
      if (input.params && (typeof input.params !== "object" || Array.isArray(input.params)))
        throw usageError("Card params must be a JSON object.");
      const unrendered = [];
      async function resolveMedia(value) {
        if (Array.isArray(value))
          return Promise.all(value.map(resolveMedia));
        if (value && typeof value === "object")
          return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([key, item]) => [key, await resolveMedia(item)])));
        if (typeof value !== "string" || !value.startsWith("media:"))
          return value;
        const id = value.slice(6);
        if (!/^(?:(?:stage|qa|development)_)?med_[A-Za-z0-9_-]+$/.test(id) || !options.client) {
          unrendered.push("Card image ".concat(value, " unavailable"));
          return "";
        }
        try {
          const answer2 = await options.client.download({ method: "GET", path: "/api/media/".concat(encodeURIComponent(id), "/content") });
          if (!answer2.body)
            throw new Error("empty image");
          const bytes = Buffer.from(await new Response(answer2.body).arrayBuffer());
          if (bytes.length > 32 * 1024 * 1024)
            throw new Error("image too large");
          const localPath = "/preview-media/".concat(id);
          assets.set(localPath, { bytes, type: "application/octet-stream" });
          return value;
        } catch {
          unrendered.push("Card image ".concat(id, " unavailable"));
          return "";
        }
      }
      const resolved = { ...input, params: await resolveMedia(input.params), data: await resolveMedia(input.data) };
      const payload = JSON.stringify(resolved).replace(/</g, "\\u003c");
      const html = '<!doctype html><html><head><link rel="stylesheet" href="'.concat(index.web.fonts.src, '"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}#card{position:absolute;inset:0}</style><script src="').concat(index.web.script.src, '"></script></head><body><div id="card"></div><script>\n          const p=').concat(payload, ";\n          window.onerror=(message)=>window.previewError=String(message);\n          window.onunhandledrejection=(event)=>window.previewError=String(event.reason?.message||event.reason);\n          (async()=>{\n            await document.fonts.ready;\n            const api=window.ScreenRigCards;\n            api.configure({cardmlSandbox:()=>new Worker(").concat(JSON.stringify(index.web.sandbox.src), ")});\n            const version=api.versions().cards[p.card];\n            if(!version || (p.major!==undefined && Number(version.split('.')[0])!==p.major)) throw new Error('Published renderer does not carry '+p.card+' major '+p.major);\n            const manifest=api.manifest(p.card);\n            window.previewFeed=manifest.feed;\n            const params=Object.assign({},p.params,p.layout?{layout:p.layout}:{},p.anchor?{anchor:p.anchor}:{});\n            let geometry=api.place(p.layout||'full',p.anchor||'',p.width,p.height);\n            if(p.placement){\n              if(p.layout==='free'&&p.placement.rect){const r=p.placement.rect;geometry={x:r.x,y:r.y,w:r.width,h:r.height,rotation:0};}\n              if(p.layout==='corner'||p.layout==='chip'){\n                // A strip is 120 high and a header or footer 80, in design units; the larger wins where both hold an edge.\n                const thickness=api.place('strip','bottom',p.width,p.height).h;\n                const bar=thickness*80/120;\n                const anchor=p.anchor||'top-right';\n                const strips=p.placement.strips||[],bars=p.placement.bars||[];\n                const held=(edge)=>anchor.indexOf(edge)>=0&&strips.indexOf(edge)>=0;\n                const inset=(edge,barName)=>Math.max(held(edge)?thickness:0,anchor.indexOf(edge)>=0&&bars.indexOf(barName)>=0?bar:0);\n                if(held('left'))geometry.x+=thickness;else if(held('right'))geometry.x-=thickness;\n                if(anchor.indexOf('top')>=0)geometry.y+=inset('top','header');else if(anchor.indexOf('bottom')>=0)geometry.y-=inset('bottom','footer');\n              }\n            }\n            Object.assign(document.getElementById('card').style,{inset:'auto',left:geometry.x+'px',top:geometry.y+'px',width:geometry.w+'px',height:geometry.h+'px',transform:'rotate('+geometry.rotation+'deg)'});\n            const handle=api.mount(document.getElementById('card'),{cardId:p.card,params,dataKey:p.data?'preview':'',dataSource:p.data?{fetch:(key,done)=>done(p.data)}:null,feed:p.feed||null,mediaResolver:{resolve:(src,done)=>done(typeof src==='string'&&/^media:(?:(?:stage|qa|development)_)?med_[A-Za-z0-9_-]+$/.test(src)?'/preview-media/'+src.slice(6):'')},active:true,fadeMs:0,frozenNowMs:p.now?Date.parse(p.now):Date.now(),timeZone:p.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone,onFailed:(code,cause)=>window.previewError=cause?code+': '+cause:code,onReady:()=>requestAnimationFrame(async()=>{await document.fonts.ready;await Promise.all(Array.from(document.images).filter(img=>img.getAttribute('src')).map(img=>img.decode().catch(()=>{})));requestAnimationFrame(()=>{window.previewResult={card:p.card,version,geometry,feed:manifest.feed,unrendered:[]};window.previewReady=true;});})});\n          })().catch(e=>window.previewError=e.message);\n        </script></body></html>");
      const answer = await browser.render(html, input.width, input.height, assets);
      if (answer.result.feed && !input.feed && !(input.card === "events" && input.data?.events))
        unrendered.push("Host feed ".concat(answer.result.feed, " was not supplied"));
      answer.result.unrendered = unrendered;
      return answer;
    },
    async placement(raw) {
      let card = raw.card, params = raw.params ?? {}, major = raw.major, data;
      if (typeof card !== "string")
        throw usageError("Card placement has no card identifier.");
      if (/^(?:(?:stage|qa|development)_)?crd_/.test(card)) {
        if (!options.client)
          throw usageError("Previewing a card instance requires a project credential.");
        const instance = (await options.client.call({ method: "GET", path: "/api/cards/".concat(encodeURIComponent(card)) })).body;
        params = instance.params;
        major = instance.major;
        try {
          const record2 = (await options.client.call({ method: "GET", path: "/api/cards/".concat(encodeURIComponent(card), "/data") })).body;
          if (!record2.expired)
            data = record2.document;
        } catch (error) {
          if (!(error instanceof CliError) || error.problem.status !== 404)
            throw error;
        }
        card = instance.type;
      } else if (raw.data && options.client) {
        const record2 = (await options.client.call({ method: "GET", path: "/api/card-data/".concat(encodeURIComponent(raw.data)) })).body;
        if (!record2.expired)
          data = record2.document;
      }
      return { card, params, major, data };
    }
  }));
}

// dist/handlers/cards.js
import { mkdir as mkdir3, writeFile as writeFile2 } from "node:fs/promises";
import path5 from "node:path";
var handleCardsList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "/api/card-types" });
  const tag = flagString(args.flags, "tag"), category = flagString(args.flags, "category");
  const cards = response.body.cards.filter((card) => (!tag || card.tags.includes(tag)) && (!category || card.category === category));
  return {
    envelope: jsonBody(response, client.requestId, { cards }),
    exitCode: ExitCode.Success,
    human: cards.length ? cards.map((card) => "".concat(card.id, ": ").concat(card.title, " \u2014 ").concat(card.short, "\n  category: ").concat(card.category, "; tags: ").concat(card.tags.join(", "), "; tier: ").concat(card.tier, "; layouts: ").concat(card.layouts.join(", ") || "(none)", "; majors: ").concat(card.majors.join(", "))).join("\n") : "No matching cards."
  };
});
var handleCardsShow = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "/api/card-types/".concat(cardId(args.positionals[2])) });
  const card = response.body;
  return { envelope: jsonBody(response, client.requestId, { properties: cardProperties(card) }), exitCode: ExitCode.Success, human: cardDetailsHuman(card) };
});
function cardInstanceId(args, index = 2) {
  const id = args.positionals[index] ?? "";
  return cardUid(id);
}
async function cardObjectFile(args, runtime) {
  const value = await readAuthoringJson(flagString(args.flags, "file"), runtime);
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw usageError("Card input must be a JSON object.");
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > 1048576)
    throw usageError("Card input must be at most 1 MiB.");
  return value;
}
var handleCardPreview = commandHandler(async (args, runtime, resolved) => {
  const target = args.positionals[2];
  const output = flagString(args.flags, "output");
  if (!target || !output)
    throw usageError("card preview requires <type|id> and --output FILE.png.");
  const paramsFile = flagString(args.flags, "params");
  const dataFile = flagString(args.flags, "data");
  const feedFile = flagString(args.flags, "feed");
  const feed = feedFile ? await readAuthoringJson(feedFile, runtime) : void 0;
  const params = paramsFile ? await readAuthoringJson(paramsFile, runtime) : void 0;
  const data = dataFile ? await readAuthoringJson(dataFile, runtime) : void 0;
  const client = resolved.token ? clientFor(runtime, args, resolved.apiUrl, resolved.token) : void 0;
  const result = await withCardPreview({ apiUrl: resolved.apiUrl, runtime, client }, async (renderer) => {
    const placement = await renderer.placement({ card: target });
    const rendered = await renderer.render({
      ...placement,
      ...params ? { params } : {},
      ...data ? { data } : {},
      ...feed ? { feed } : {},
      width: flagNumber(args.flags, "width") ?? 1920,
      height: flagNumber(args.flags, "height") ?? 1080,
      layout: flagString(args.flags, "layout"),
      anchor: flagString(args.flags, "anchor"),
      now: flagString(args.flags, "now"),
      timezone: flagString(args.flags, "timezone")
    });
    const file = path5.resolve(runtime.cwd(), output);
    await mkdir3(path5.dirname(file), { recursive: true });
    await writeFile2(file, rendered.png);
    return { ...rendered.result, file, local: true };
  });
  return {
    envelope: successEnvelope(result, { request_id: client?.requestId }),
    exitCode: ExitCode.Success,
    human: "Local card preview: ".concat(result.file, "\nOpen and inspect this image before publishing.")
  };
});
var handleCardCreate = commandHandler(async (args, runtime, resolved) => {
  const params = await cardObjectFile(args, runtime);
  const type = cardId(flagString(args.flags, "type"));
  const major = flagNumber(args.flags, "major");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: "POST",
    path: "/api/cards",
    idempotent: true,
    body: { type, params, ...major !== void 0 ? { major } : {} }
  });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Created card ".concat(response.body.id) };
});
var handleCardList = commandHandler(async (args, runtime, resolved) => simpleList(args, runtime, resolved, "/api/cards", "Card instances"));
var handleCardShow = commandHandler(async (args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/cards/".concat(cardInstanceId(args)), "Card instance"));
var handleCardParams = commandHandler(async (args, runtime, resolved) => {
  const id = cardInstanceId(args);
  const params = await cardObjectFile(args, runtime);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "PATCH", path: "/api/cards/".concat(id), body: { params } });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Card params replaced: ".concat(id) };
});
var handleCardDelete = commandHandler(async (args, runtime, resolved) => {
  const id = cardInstanceId(args);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "DELETE", path: "/api/cards/".concat(id), idempotent: true });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Deleted card: ".concat(id) };
});
var handleCardInstanceDataGet = commandHandler(async (args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/cards/".concat(cardInstanceId(args, 3), "/data"), "Card instance data"));
var handleCardInstanceDataPut = commandHandler(async (args, runtime, resolved) => {
  const id = cardInstanceId(args, 3);
  const document = await cardObjectFile(args, runtime);
  const revision2 = flagString(args.flags, "expect-rev");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: "PUT",
    path: "/api/cards/".concat(id, "/data"),
    body: { document, ...cardExpiry(args.flags) },
    idempotent: true,
    headers: revision2 ? { "if-match": quotedRevision(revision2) } : void 0
  });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Card data written: ".concat(id, "\nrevision: ").concat(response.body.revision) };
});
var handleFeedsGet = commandHandler(async (args, runtime, resolved) => {
  const { query, repeated } = feedQuery(args);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "/api/feeds/".concat(args.positionals[2]), query, ...Object.keys(repeated).length ? { queryRepeated: repeated } : {} });
  const body = response.body;
  const key = response.headers["screenrig-feed-key"] ?? body.key;
  if (response.status === 202) {
    const now = runtime.now().getTime();
    const seconds2 = parseRetryAfter(response.headers["retry-after"], now) ?? body.retry_after_seconds;
    if (typeof seconds2 !== "number" || !Number.isFinite(seconds2) || seconds2 < 0 || !Number.isFinite(new Date(now + seconds2 * 1e3).getTime())) {
      throw unexpectedResponseError("Pending feed response lacks a valid retry time.", client.requestId);
    }
    const retryAt = new Date(now + seconds2 * 1e3).toISOString();
    return {
      envelope: jsonBody(response, client.requestId, { key, state: "pending", retry_after_seconds: seconds2, retry_at: retryAt }),
      exitCode: ExitCode.Success,
      human: "Feed pending\nkey: ".concat(key, "\nretry after: ").concat(seconds2, " seconds (").concat(retryAt, ")")
    };
  }
  return {
    envelope: jsonBody(response, client.requestId, key ? { key } : void 0),
    exitCode: ExitCode.Success,
    human: "Feed\n".concat(JSON.stringify(body, null, 2))
  };
});

// dist/cli-commands/cards.js
function registerCardsCommands(root, bind) {
  const cards = root.command("cards").description("Discover cards and their property schemas");
  cards.command("list").description("List cards, optionally matching a tag and category").option("--tag <TAG>", "Match a catalogue tag").option("--category <CATEGORY>", "Match a catalogue category").action(bind(handleCardsList));
  cards.command("show").description("Inspect static and dynamic properties, tier, layouts, feed and an example placement").argument("<id>", "Catalogue card id", cardId).action(bind(handleCardsShow));
  const card = root.command("card").description("Create and manage card instances");
  card.command("preview").description("Render a card locally with Chromium; inspect the PNG before publishing").argument("<type|id>", "Catalogue type or card instance ID").requiredOption("--output <FILE>", "Write the local PNG").option("--params <FILE>", "Static properties as JSON").option("--data <FILE>", "Dynamic document as JSON").option("--feed <FILE>", "Host feed document as JSON; omitted feeds are reported").option("--width <PX>", "Image width (default 1920)", positiveInteger("width")).option("--height <PX>", "Image height (default 1080)", positiveInteger("height")).option("--layout <LAYOUT>", "Card layout to draw").option("--anchor <ANCHOR>", "Corner or strip edge").option("--now <ISO>", "Freeze the clock at this instant").option("--timezone <ZONE>", "Render in this IANA timezone").action(bind(handleCardPreview));
  card.command("create").description("Create a card instance in the selected project").requiredOption("--type <ID>", "Catalogue type from cards list", cardId).option("--major <N>", "Select a catalogue major version", positiveInteger("major")).requiredOption("--file <FILE>", "Read static params as a JSON object, or - for stdin").action(bind(handleCardCreate));
  card.command("list").description("List card instances across all pages").action(bind(handleCardList));
  card.command("show").description("Read a card instance by its global ID").argument("<id>", "Card instance ID (crd_...)", cardUid).action(bind(handleCardShow));
  card.command("params").description("Replace a card instance's static params").argument("<id>", "Card instance ID (crd_...)", cardUid).requiredOption("--file <FILE>", "Read static params as a JSON object, or - for stdin").action(bind(handleCardParams));
  card.command("delete").description("Delete a card instance that no playlist uses").argument("<id>", "Card instance ID (crd_...)", cardUid).action(bind(handleCardDelete));
  const instanceData = card.command("data").description("Read and replace a card instance's dynamic data");
  instanceData.command("get").description("Read dynamic data and its revision").argument("<id>", "Card instance ID (crd_...)", cardUid).action(bind(handleCardInstanceDataGet));
  const instancePut = instanceData.command("put").description("Create or replace dynamic data").argument("<id>", "Card instance ID (crd_...)", cardUid).requiredOption("--file <FILE>", "Read a JSON object, or - for stdin").option("--ttl <DURATION>", "Blank data after this long, including offline: 30m, 12h or 1d", cardTtl).option("--expires-at <INSTANT>", "Blank data at this ISO timestamp with timezone").option("--expect-rev <REVISION>", "Require the current data revision (If-Match)", revision).action(bind(handleCardInstanceDataPut));
  requireOptionGroup(instancePut, "atMostOne", ["--ttl", "--expires-at"]);
  const feeds = root.command("feeds").description("Read third-party data fetched and cached by screenRIG");
  const get = feeds.command("get").description("Read a feed once; report pending and its retry time").addArgument(new Argument("<family>", "Feed family").choices(FEED_FAMILIES)).option("--lat <DEGREES>", "Latitude for weather, airquality, alerts, earthquakes, cyclones, cap, tides, almanac, outdoorsafety or bikeshare").option("--lon <DEGREES>", "Longitude for weather, airquality, alerts, earthquakes, cyclones, cap, tides, almanac, outdoorsafety or bikeshare").option("--station <ID>", "Tides: a NOAA tide prediction station id, such as 9414290; without it --lat and --lon pick the nearest station within 100 km").option("--country <CODE>", "Drugalerts: us, ca or gb (required). Respiratory: us or gb (required). Almanac: the ISO 3166-1 country whose public holidays it lists").addOption(new Option("--category <CATEGORY>", "Drugalerts: drug (default) or food").choices(FEED_CATEGORIES)).option("--region <NAME>", "Respiratory: a US state, territory or DC by name or postal code, or England or a UKHSA region; the nation without it").option("--date <YYYY-MM-DD>", "Almanac: one fixed day instead of the days around today").addOption(new Option("--provider <PROVIDER>", "Departures: the transit provider of the stops (required): tfl, entur or digitransit").choices(FEED_PROVIDERS)).option("--stops <IDS>", "Departures: one to four stop ids of the provider, comma-separated (required): TfL StopPoint ids such as 940GZZLUOXC, Entur NSR:StopPlace:337 or NSR:Quay:568, Digitransit gtfsIds such as HSL:1040129").option("--system <ID>", "Bikeshare: a bike share system id, such as Mobibikes_CA_Vancouver; without it the nearest listed system that covers --lat and --lon serves").option("--radius-km <KM>", "Earthquake radius (default 500) or cyclone area, 10\u201320000 km").option("--min-magnitude <MAGNITUDE>", "Earthquakes: least magnitude, 0\u20139 (default 2.5)").option("--hours <HOURS>", "Earthquakes: window in hours, 1\u2013168 (default 24)").option("--basins <LIST>", "Cyclones: comma-separated basins at, ep, cp, wp (default all)").option("--base <CODE>", "Rates base currency (default EUR)").option("--symbols <IDS>", "Comma-separated crypto ids or tickers, at most 20").option("--currency <CODE>", "Crypto quote currency (default usd)").addOption(new Option("--url <URL>", "RSS or Atom feed URL for headlines; for cap, a CAP alert or ATOM/RSS index URL (repeatable, at most 5)").argParser(feedListOption("url", 2048))).option("--public", "Cap: also read the public alert feeds that cover --lat and --lon (the default without --url)").addOption(new Option("--geocode <NAME:VALUE>", "Cap: an area code of the location, such as UGC:WAC033 (repeatable)").argParser(feedListOption("geocode", 140))).addOption(new Option("--min-severity <LEVEL>", "Cap: only alerts at or above this severity").choices(FEED_SEVERITIES)).addOption(new Option("--max-severity <LEVEL>", "Cap: only alerts at or below this severity").choices(FEED_SEVERITIES)).addOption(new Option("--min-urgency <LEVEL>", "Cap: only alerts at least this urgent").choices(FEED_URGENCIES)).addOption(new Option("--min-certainty <LEVEL>", "Cap: only alerts at least this certain").choices(FEED_CERTAINTIES)).addOption(new Option("--event <NAME>", "Cap: only this event, * matches any run of characters (repeatable)").argParser(feedListOption("event", 120))).addOption(new Option("--exclude-event <NAME>", "Cap: leave out this event (repeatable)").argParser(feedListOption("exclude-event", 120))).addOption(new Option("--sender <NAME>", "Cap: only alerts from this sender (repeatable)").argParser(feedListOption("sender", 120))).addOption(new Option("--status <STATUS>", "Cap: alert status to read, default Actual (repeatable)").choices(FEED_STATUSES).argParser(feedListOption("status", 16, FEED_STATUSES))).addOption(new Option("--scope <SCOPE>", "Cap: alert scope to read, default Public (repeatable)").choices(FEED_SCOPES).argParser(feedListOption("scope", 16, FEED_SCOPES))).addOption(new Option("--language <TAG>", "Cap: language preference, the first present wins (repeatable). Almanac: the On This Day edition, ar, bs, cs, de, en, es, fr, it, pt, ru, sv, tr, uk or zh (default en)").argParser(feedListOption("language", 35))).addOption(new Option("--area-unknown <MODE>", "Cap: an alert told only by area codes the location lacks: hide (default) or show").choices(FEED_AREA_UNKNOWN)).action(bind(handleFeedsGet));
  requireOptionGroup(get, "together", ["--lat", "--lon"]);
  requireOptionGroup(get, "requires", ["--radius-km", "--lat", "--lon"]);
  requireOptionGroup(get, "requires", ["--public", "--lat", "--lon"]);
  requireOptionGroup(get, "requires", ["--geocode", "--lat", "--lon"]);
}

// dist/handlers/background.js
var APPLY_NEXT = "Next: screenrig background apply BACKGROUND_ID --playlist-id pl_PLAYLIST --page-id PAGE_ID";
var LAYOUT_HINT = "layout is where the decoration sits; keep content in the calm area outside it (on left-half, text goes on the right). tone is the image's lightness: light content reads on dark.";
async function catalogGet(client, path7, next) {
  try {
    return await client.call({ method: "GET", path: path7 });
  } catch (error) {
    if (error instanceof CliError && error.problem.code === "not_found" && !error.problem.next) {
      throw new CliError({ ...error.problem, next }, error.exitCode, error.warnings);
    }
    throw error;
  }
}
var colors = (group) => Array.isArray(group.colors) && group.colors.length ? group.colors.join(", ") : "(none)";
function categoryLines(items) {
  if (!items.length)
    return ["No background categories"];
  return table(["ID", "NAME", "SETS"], items.map((item) => [item.id, item.name, String(item.set_count)]));
}
function setLines(items) {
  if (!items.length)
    return ["No matching background sets"];
  return table(["ID", "NAME", "CATEGORY", "LANDSCAPE", "PORTRAIT", "COLORS"], items.map((item) => [item.id, item.name, item.category, String(item.landscape_count), String(item.portrait_count), colors(item)]));
}
function setDetailLines(group, apiUrl) {
  const images = Array.isArray(group.backgrounds) ? group.backgrounds : [];
  return [
    "Background set ".concat(group.id),
    "name: ".concat(group.name),
    "category: ".concat(group.category, " (").concat(group.category_name, ")"),
    "style: ".concat(group.style),
    "colors: ".concat(colors(group)),
    "images: ".concat(group.landscape_count, " landscape, ").concat(group.portrait_count, " portrait"),
    "thumbnail: ".concat(backgroundUrl(group.thumbnail_path, apiUrl)),
    "",
    ...images.length ? table(["ID", "ORIENTATION", "LAYOUT", "TONE", "IMAGE"], images.map((image) => [image.id, image.orientation, image.layout, image.tone, backgroundUrl(image.image_path, apiUrl)])) : ["No images"],
    "",
    LAYOUT_HINT,
    APPLY_NEXT
  ];
}
function backgroundLines(shown, apiUrl) {
  const { background: image, set: group } = shown;
  return [
    "Background ".concat(image.id),
    "set: ".concat(group.id, " (").concat(group.name, "); category: ").concat(group.category, " (").concat(group.category_name, ")"),
    "orientation: ".concat(image.orientation, " (").concat(image.width, "x").concat(image.height, ")"),
    "layout: ".concat(image.layout, " (").concat(image.label, ")"),
    "tone: ".concat(image.tone),
    "colors: ".concat(colors(group)),
    "image: ".concat(backgroundUrl(image.image_path, apiUrl)),
    "",
    LAYOUT_HINT,
    "Next: screenrig background apply ".concat(image.id, " --playlist-id pl_PLAYLIST --page-id PAGE_ID")
  ];
}
var handleBackgroundCategories = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "".concat(BACKGROUNDS_PATH, "/categories") });
  const items = response.body?.categories;
  const list = Array.isArray(items) ? items : [];
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Background categories (".concat(list.length, ")"), ...categoryLines(list), "", "Next: screenrig background sets --category ID lists a category's sets."].join("\n")
  };
});
var handleBackgroundSets = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "".concat(BACKGROUNDS_PATH, "/sets"), query: {
    category: flagString(args.flags, "category"),
    q: flagString(args.flags, "search"),
    orientation: flagString(args.flags, "orientation")
  } });
  const items = response.body?.sets;
  const list = Array.isArray(items) ? items : [];
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Background sets (".concat(list.length, ")"), ...setLines(list), "", "Next: screenrig background show SET_ID lists a set's images."].join("\n")
  };
});
var handleBackgroundShow = commandHandler(async (args, runtime, resolved) => {
  const id = backgroundOrSetId(args.positionals[2] ?? "");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (id.startsWith("bg_")) {
    const response2 = await catalogGet(client, "".concat(BACKGROUNDS_PATH, "/").concat(encodeURIComponent(id)), { command: "screenrig background sets", reason: "List the sets, then background show SET_ID lists a set's image ids." });
    return { envelope: jsonBody(response2, client.requestId), exitCode: ExitCode.Success, human: backgroundLines(response2.body, resolved.apiUrl).join("\n") };
  }
  const response = await catalogGet(client, "".concat(BACKGROUNDS_PATH, "/sets/").concat(encodeURIComponent(id)), { command: "screenrig background sets", reason: "List the sets and their ids." });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: setDetailLines(response.body, resolved.apiUrl).join("\n") };
});
function pageTarget(args) {
  const playlistId2 = flagString(args.flags, "playlist-id"), pageId = flagString(args.flags, "page-id");
  if (!playlistId2 || !pageId)
    throw usageError("Both --playlist-id and --page-id are required.");
  return { playlistId: playlistId2, pageId };
}
var handleBackgroundApply = commandHandler(async (args, runtime, resolved) => {
  const id = backgroundId(args.positionals[2] ?? "");
  const { playlistId: playlistId2, pageId } = pageTarget(args);
  const explicit = flagString(args.flags, "color");
  const color = explicit === void 0 ? void 0 : backgroundColor(explicit);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const found = await catalogGet(client, "".concat(BACKGROUNDS_PATH, "/").concat(encodeURIComponent(id)), { command: "screenrig background sets", reason: "List the sets, then background show SET_ID lists a set's image ids." });
  const { stored, revision: revision2 } = await storedPageOf(client, playlistId2, pageId, resolved.token);
  const kept = imageBackgroundOf(stored)?.color;
  const background = { type: "image", background_id: id, color: color ?? kept ?? setBackgroundColor(found.body?.set) };
  const page = withCanvasBackground(authoringPage(stored), background);
  return putPage(client, args, playlistId2, pageId, page, revision2, "Background ".concat(id, " set on page ").concat(pageId, " of ").concat(playlistId2, " (color ").concat(background.color, ")."));
}, true);
var handleBackgroundClear = commandHandler(async (args, runtime, resolved) => {
  const { playlistId: playlistId2, pageId } = pageTarget(args);
  const explicit = flagString(args.flags, "color");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const { stored, revision: revision2 } = await storedPageOf(client, playlistId2, pageId, resolved.token);
  const current = imageBackgroundOf(stored);
  if (explicit === void 0 && !current) {
    throw usageError("Page ".concat(pageId, " of ").concat(playlistId2, " has no image background to clear; give --color to set a solid colour."));
  }
  const color = explicit !== void 0 ? backgroundColor(explicit) : current?.color ?? DEFAULT_BACKGROUND_COLOR;
  const page = withCanvasBackground(authoringPage(stored), color);
  return putPage(client, args, playlistId2, pageId, page, revision2, "Page ".concat(pageId, " of ").concat(playlistId2, " has the solid background ").concat(color, "."));
}, true);

// dist/cli-commands/background.js
function playlistIdOption(value) {
  if (!isResourceID(value, "playlist")) {
    throw usageError("--playlist-id must be a playlist id (pl_...).", { command: "screenrig playlist list", reason: "List this project's playlists and their ids." });
  }
  return value;
}
function pageIdOption(value) {
  if (!PAGE_ID_PATTERN.test(value))
    throw usageError("--page-id takes a page id: a letter, then letters, digits, - or _ (at most 64).");
  return value;
}
var COLOR_HELP = "Colour under the image, #RRGGBBAA";
function pageWriteOptions(command) {
  return command.option("--expect-rev <REVISION>", "Require this playlist revision (If-Match); without it the write is held to the revision just read", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption);
}
function registerBackgroundCommands(root, bind) {
  const background = root.command("background").description("Browse the page background catalog and set a page's background image");
  background.command("categories").description("List the background categories and how many sets each holds").action(bind(handleBackgroundCategories));
  background.command("sets").description("List background sets, by category, search words or orientation").option("--category <ID>", "Only the sets of this category (background categories lists the ids)").option("--search <TEXT>", "Only sets whose name, style or category match every word").addOption(new Option("--orientation <ORIENTATION>", "Only sets with at least one image in this orientation").choices(BACKGROUND_ORIENTATIONS)).action(bind(handleBackgroundSets));
  background.command("show").description("Show a set with each of its images, or one background image").argument("<id>", "A set id from background sets, or a background id (bg_...)", backgroundOrSetId).action(bind(handleBackgroundShow));
  pageWriteOptions(background.command("apply").description("Set a page's canvas background to a catalog image").argument("<background-id>", "The background image (bg_...) from background show", backgroundId).requiredOption("--playlist-id <ID>", "The playlist (pl_...) that holds the page", playlistIdOption).requiredOption("--page-id <ID>", "The page to change", pageIdOption).option("--color <RRGGBBAA>", "".concat(COLOR_HELP, " (default: the page's current image colour, else the set's first colour, else #000000FF)"), backgroundColor)).action(bind(handleBackgroundApply));
  pageWriteOptions(background.command("clear").description("Replace a page's background image with a solid colour").requiredOption("--playlist-id <ID>", "The playlist (pl_...) that holds the page", playlistIdOption).requiredOption("--page-id <ID>", "The page to change", pageIdOption).option("--color <RRGGBBAA>", "The solid colour, #RRGGBBAA (default: the image's colour)", backgroundColor)).action(bind(handleBackgroundClear));
}

// dist/comments-write.js
var COMMENTS_MAX_BYTES = 1024;
function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function commentsObjectFromJson(input, source) {
  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw usageError("".concat(source, " must contain valid JSON."));
  }
  if (!isPlainObject(parsed)) {
    throw usageError("comments must be a JSON object.");
  }
  const compact = JSON.stringify(parsed);
  if (Buffer.byteLength(compact, "utf8") > COMMENTS_MAX_BYTES) {
    throw usageError("comments must be at most 1024 bytes of compact UTF-8 JSON.");
  }
  return parsed;
}
function stringFlag(args, name) {
  const value = args.flags[name];
  return typeof value === "string" ? value : void 0;
}
async function commentsWriteFromArgs(args, cwd, runtime) {
  if (Object.hasOwn(args.flags, "value") || Object.hasOwn(args.flags, "value-base64")) {
    throw usageError("comment set accepts --json-value or --file; it does not take --value or --value-base64.");
  }
  if (Object.hasOwn(args.flags, "content-type")) {
    throw usageError("--json-value and --file always send application/json; omit --content-type.");
  }
  const modeNames = ["json-value", "file"];
  const selected = modeNames.filter((name) => Object.hasOwn(args.flags, name));
  if (selected.length !== 1) {
    throw usageError("comment set requires exactly one of --json-value or --file.");
  }
  if (selected[0] === "json-value") {
    const input = stringFlag(args, "json-value");
    if (input === void 0 || input.length === 0) {
      throw usageError("--json-value requires a JSON object.");
    }
    return { comments: commentsObjectFromJson(input, "--json-value") };
  }
  const file = stringFlag(args, "file");
  if (!file) {
    throw usageError("--file requires a path.");
  }
  let text;
  try {
    text = (await readInputBytes(file, cwd, runtime, 1048576)).toString("utf8");
  } catch (error) {
    throw usageError("Cannot read comments file: ".concat(error instanceof Error ? error.message : "read failed"));
  }
  return { comments: commentsObjectFromJson(text, "comments file") };
}

// dist/handlers/comment.js
var PLAYLIST_PAGE_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
function commentPath(target, id, pageId) {
  if (target === "screen") {
    return "/api/comment/screen/".concat(encodeURIComponent(id));
  }
  if (pageId) {
    return "/api/comment/playlist/".concat(encodeURIComponent(id), "/page/").concat(encodeURIComponent(pageId));
  }
  return "/api/comment/playlist/".concat(encodeURIComponent(id));
}
function commentTarget(args, target) {
  const id = args.positionals[3];
  if (!id || target === "screen" && !isScreenId(id)) {
    throw usageError("comment ".concat(target, " requires <id>."));
  }
  if (Object.hasOwn(args.flags, "expect-rev")) {
    throw usageError("comment commands do not take --expect-rev; last write wins and does not bump revision.");
  }
  requireFlagValue(args, "page", "poster");
  const pageId = flagString(args.flags, "page");
  if (target === "screen" && pageId !== void 0) {
    throw usageError("comment screen commands do not take --page; use comment playlist <id> --page PAGE_ID.");
  }
  if (pageId !== void 0 && !PLAYLIST_PAGE_ID_PATTERN.test(pageId)) {
    throw usageError("--page must be a playlist page id: a letter, then up to 63 letters, digits, underscores, or hyphens.");
  }
  const pathName = commentPath(target, id, pageId);
  return { id, pageId, pathName };
}
async function showComment(args, runtime, resolved, target) {
  const { pathName } = commentTarget(args, target);
  return simpleGet(args, runtime, resolved, pathName, "Comments");
}
var handleCommentShowScreen = commandHandler((args, runtime, resolved) => showComment(args, runtime, resolved, "screen"));
var handleCommentShowPlaylist = commandHandler((args, runtime, resolved) => showComment(args, runtime, resolved, "playlist"));
async function setComment(args, runtime, resolved, target) {
  const { id, pageId, pathName } = commentTarget(args, target);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const body = await commentsWriteFromArgs(args, runtime.cwd(), runtime);
  const response = await client.call({
    method: "PUT",
    path: pathName,
    idempotent: true,
    body
  });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: humanLines("Comments set", [
      [target, id],
      ["page", pageId]
    ])
  };
}
var handleCommentSetScreen = commandHandler((args, runtime, resolved) => setComment(args, runtime, resolved, "screen"));
var handleCommentSetPlaylist = commandHandler((args, runtime, resolved) => setComment(args, runtime, resolved, "playlist"));
async function deleteComment(args, runtime, resolved, target) {
  const { id, pageId, pathName } = commentTarget(args, target);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: "DELETE",
    path: pathName,
    idempotent: true
  });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: pageId ? "Deleted comments on playlist ".concat(id, " page ").concat(pageId) : "Deleted comments on ".concat(target, " ").concat(id)
  };
}
var handleCommentDeleteScreen = commandHandler((args, runtime, resolved) => deleteComment(args, runtime, resolved, "screen"));
var handleCommentDeletePlaylist = commandHandler((args, runtime, resolved) => deleteComment(args, runtime, resolved, "playlist"));

// dist/cli-commands/comment.js
function registerCommentCommands(root, bind) {
  const comment = root.command("comment").description("Read and manage screen and playlist comments");
  const commentShow = comment.command("show").description("Read screen or playlist comments");
  commentShow.command("screen").description("Read screen comments").argument("<id>", "Screen or playlist identifier").action(bind(handleCommentShowScreen));
  commentShow.command("playlist").description("Read playlist comments").argument("<id>", "Screen or playlist identifier").option("--page <PAGE_ID>", "Select playlist page comments").action(bind(handleCommentShowPlaylist));
  const commentSet = subcommand(comment, "set").description("Replace screen or playlist comments");
  commentSet.command("screen").description("Replace screen comments").argument("<id>", "Screen or playlist identifier").addOption(new Option("--json-value <JSON>", "Supply a JSON value").conflicts(["file"])).addOption(new Option("--file <FILE>", "Read the value from a file, or - for stdin").conflicts(["jsonValue"])).action(bind(handleCommentSetScreen));
  commentSet.command("playlist").description("Replace playlist comments").argument("<id>", "Screen or playlist identifier").option("--page <PAGE_ID>", "Select playlist page comments").addOption(new Option("--json-value <JSON>", "Supply a JSON value").conflicts(["file"])).addOption(new Option("--file <FILE>", "Read the value from a file, or - for stdin").conflicts(["jsonValue"])).action(bind(handleCommentSetPlaylist));
  const commentDelete = comment.command("delete").description("Delete screen or playlist comments");
  commentDelete.command("screen").description("Delete screen comments").argument("<id>", "Screen or playlist identifier").action(bind(handleCommentDeleteScreen));
  commentDelete.command("playlist").description("Delete playlist comments").argument("<id>", "Screen or playlist identifier").option("--page <PAGE_ID>", "Select playlist page comments").action(bind(handleCommentDeletePlaylist));
  for (const command of commentSet.commands)
    requireOptionGroup(command, "exactlyOne", ["--json-value", "--file"]);
  for (const action of comment.commands)
    for (const command of action.commands)
      command.registeredArguments[0].description = command.name() === "screen" ? "Screen identifier" : "Playlist identifier";
}

// dist/schedule-import.js
import { createHash as createHash5 } from "node:crypto";
import { mkdir as mkdir4, open as open2, rename as rename2, rm as rm3 } from "node:fs/promises";
import path6 from "node:path";
var SCHEDULE_IMPORT_MAX_BYTES = 8 * 1024 * 1024;
var SCHEDULE_IMPORT_MAX_ROWS = 5e3;
var SCHEDULE_IMPORT_NAME_MAX = 80;
var SOURCE_MAX = 200;
var PREVIEW_PATH = "/api/schedule/imports/preview";
var COMMIT_PATH = "/api/schedule/imports";
var TEMPLATE_PATH = "/api/schedule/imports/template";
var CSV_TYPE = "text/csv";
var XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
var IMPORT_TIMEOUT_MS = 12e4;
var SCHEDULE_IMPORT_NEEDS_CORRECTIONS = ExitCode.Client;
function scheduleImportName(value) {
  const trimmed = value.trim();
  if (!trimmed || [...trimmed].length > SCHEDULE_IMPORT_NAME_MAX || new RegExp("\\p{Cc}", "u").test(trimmed)) {
    throw usageError("--name must contain 1 to ".concat(SCHEDULE_IMPORT_NAME_MAX, " characters without controls."));
  }
  return trimmed;
}
function scheduleImportTimezone(value) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
  } catch {
    throw usageError("--timezone takes an IANA time zone name such as America/New_York, Europe/London or UTC.");
  }
  return value;
}
function scheduleImportCodeField(value) {
  const trimmed = value.trim();
  if (!trimmed || [...trimmed].length > 64 || new RegExp("\\p{Cc}", "u").test(trimmed)) {
    throw usageError("--code-field takes the name of a screen field, such as code or room_id.");
  }
  return trimmed;
}
function fileReadError(file, error) {
  if (error instanceof CliError)
    return error;
  const code = error.code;
  if (code === "ENOENT")
    return usageError("".concat(file, " does not exist."));
  if (code === "EISDIR")
    return usageError("".concat(file, " is a directory; name a .csv, .xlsx or .json file."));
  if (code === "EACCES")
    return usageError("".concat(file, " cannot be read (permission denied)."));
  return usageError("Cannot read ".concat(file, "; provide a readable file within the 8 MiB limit."));
}
function importRowsFromJson(text) {
  let document;
  try {
    document = JSON.parse(text);
  } catch {
    throw usageError('The JSON sheet is not valid JSON. Give an array of row objects or {"rows": [...]}.');
  }
  const rows = Array.isArray(document) ? document : document && typeof document === "object" ? document.rows : void 0;
  if (!Array.isArray(rows))
    throw usageError('The JSON sheet must be an array of row objects or {"rows": [...]}.');
  if (!rows.length)
    throw usageError("The JSON sheet lists no rows.");
  if (rows.length > SCHEDULE_IMPORT_MAX_ROWS)
    throw usageError("A sheet holds at most ".concat(SCHEDULE_IMPORT_MAX_ROWS, " rows; split it."));
  rows.forEach((row, index) => {
    if (!row || typeof row !== "object" || Array.isArray(row))
      throw usageError("JSON row ".concat(index + 1, " must be an object keyed by column name."));
    for (const [column, cell] of Object.entries(row)) {
      if (cell !== null && !["string", "number", "boolean"].includes(typeof cell)) {
        throw usageError("JSON row ".concat(index + 1, ", column ").concat(column, ": a cell is text, a number, true, false or null."));
      }
    }
  });
  return rows;
}
async function readImportSheet(file, runtime) {
  if (!file)
    throw usageError("schedule import requires <file>: a .csv, .xlsx or .json sheet, or - to read one from stdin.");
  let bytes;
  try {
    bytes = await readInputBytes(file, runtime.cwd(), runtime, SCHEDULE_IMPORT_MAX_BYTES);
  } catch (error) {
    throw file === "-" ? error instanceof CliError ? error : usageError("Cannot read stdin; pipe a sheet within the 8 MiB limit.") : fileReadError(file, error);
  }
  if (!bytes.length)
    throw usageError(file === "-" ? "Stdin held no sheet." : "".concat(file, " is empty."));
  let kind;
  if (file === "-") {
    if (bytes.subarray(0, 4).equals(Buffer.from("PK", "latin1")))
      kind = "xlsx";
    else {
      const first = bytes.toString("utf8", 0, Math.min(bytes.length, 64)).replace(/^\uFEFF/, "").trimStart()[0];
      kind = first === "[" || first === "{" ? "json" : "csv";
    }
  } else {
    const extension = path6.extname(file).toLowerCase();
    if (extension === ".csv")
      kind = "csv";
    else if (extension === ".xlsx")
      kind = "xlsx";
    else if (extension === ".json")
      kind = "json";
    else
      throw usageError("".concat(file, " is not a .csv, .xlsx or .json file. Save the sheet as CSV UTF-8 or XLSX, or pipe it in with -."));
  }
  const base = file === "-" ? void 0 : path6.basename(file);
  const source = base ? [...base].slice(0, SOURCE_MAX).join("") : void 0;
  const defaultName = base ? path6.basename(base, path6.extname(base)) : void 0;
  if (kind === "json")
    return { kind, source, defaultName, rows: importRowsFromJson(bytes.toString("utf8").replace(/^\uFEFF/, "")) };
  return { kind, source, defaultName, bytes };
}
function importRequest(sheet, parameters, fingerprint) {
  if (sheet.kind === "json") {
    return {
      headers: { "content-type": "application/json" },
      body: {
        ...parameters.name ? { name: parameters.name } : {},
        ...sheet.source ? { source: sheet.source } : {},
        ...parameters.timezone ? { timezone: parameters.timezone } : {},
        ...parameters.codeField ? { code_field: parameters.codeField } : {},
        ...fingerprint ? { fingerprint } : {},
        rows: sheet.rows
      }
    };
  }
  return {
    headers: { "content-type": sheet.kind === "xlsx" ? XLSX_TYPE : CSV_TYPE },
    body: sheet.bytes,
    query: { name: parameters.name, timezone: parameters.timezone, source: sheet.source, code_field: parameters.codeField, fingerprint }
  };
}
var COLUMN_TITLES = {
  target: "Screen",
  content: "File",
  start: "Start",
  end: "End",
  timezone: "Timezone",
  days: "Days",
  daily_start: "Daily start",
  daily_end: "Daily end",
  priority: "Priority",
  name: "Name",
  display: "Display",
  region: "Region"
};
function columnTitle(column) {
  return COLUMN_TITLES[column] ?? column.charAt(0).toUpperCase() + column.slice(1).replaceAll("_", " ");
}
function rowProblemLine(row, problem, warning = false) {
  const parts = [row ? "row ".concat(row) : "file", ...problem.column ? [columnTitle(problem.column)] : [], "".concat(warning ? "warning: " : "").concat(problem.message)];
  return parts.join(" \xB7 ");
}
function plural(count, noun) {
  return "".concat(count, " ").concat(noun).concat(count === 1 ? "" : "s");
}
function table2(header2, rows) {
  const widths = header2.map((cell, index) => Math.max(cell.length, ...rows.map((row) => [...row[index] ?? ""].length)));
  const render = (row) => row.map((cell, index) => cell.padEnd(widths[index])).join("  ").trimEnd();
  return [render(header2), ...rows.map(render)];
}
function clip(text, width) {
  const characters = [...text];
  return characters.length <= width ? text : "".concat(characters.slice(0, width - 1).join(""), "\u2026");
}
function capped(lines, limit, noun) {
  return lines.length <= limit ? lines : [...lines.slice(0, limit), "\u2026 and ".concat(lines.length - limit, " more ").concat(noun, "; --json lists every one.")];
}
function whenText(level) {
  const civil = (value) => value.replace("T", " ");
  if (!level.from && !level.until)
    return "always";
  return "".concat(level.from ? civil(level.from) : "\u2026", " \u2192 ").concat(level.until ? civil(level.until) : "\u2026");
}
function screenNames(preview) {
  const names = /* @__PURE__ */ new Map();
  for (const row of preview.rows) {
    if (row.level && row.target?.kind === "screen" && !names.has(row.level))
      names.set(row.level, row.target.name);
  }
  return names;
}
function removalText(removal) {
  if (removal.home === "screen")
    return "screen ".concat(removal.screen_id ?? "").concat(removal.entry_id ? " (entry ".concat(removal.entry_id, ")") : "").trimEnd();
  return "shared ".concat(removal.name ? '"'.concat(removal.name, '"') : removal.campaign_id ?? "").trimEnd();
}
function clockText(instant, timezone) {
  const date = new Date(instant);
  if (Number.isNaN(date.getTime()))
    return instant;
  const zone = timezone || "UTC";
  try {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date).map((part) => [part.type, part.value]));
    return "".concat(parts.year, "-").concat(parts.month, "-").concat(parts.day, " ").concat(parts.hour, ":").concat(parts.minute).concat(timezone ? "" : " UTC");
  } catch {
    return instant;
  }
}
function calendarLines(preview) {
  const groups = preview.calendar?.groups ?? [];
  if (!groups.length)
    return [];
  const made = /* @__PURE__ */ new Map();
  for (const level of preview.levels) {
    if (level.entry_id)
      made.set(level.entry_id, level);
    if (level.campaign_id)
      made.set(level.campaign_id, level);
    made.set("import_".concat(level.key), level);
  }
  const lines = groups.map((group) => {
    const record2 = new Map((group.levels ?? []).map((level2) => [level2.id, level2.record_id ?? ""]));
    const first = [...group.spans ?? []].filter((span) => (span.state === "plays" || span.state === "partial") && made.has(record2.get(span.level_id) ?? "")).sort((a, b) => a.from.localeCompare(b.from))[0];
    const conflicts = group.conflicts?.length ? "; ".concat(plural(group.conflicts.length, "conflict")) : "";
    const where = "".concat(plural(group.screens, "screen")).concat(group.timezone ? " (".concat(group.timezone, ")") : "");
    if (!first)
      return "  ".concat(where, ": no imported level plays in the window").concat(conflicts);
    const level = made.get(record2.get(first.level_id) ?? "");
    return "  ".concat(where, ": ").concat(level ? "".concat(clip(level.content.name, 40), " ") : "", "plays ").concat(clockText(first.from, group.timezone), " \u2192 ").concat(clockText(first.to, group.timezone)).concat(conflicts);
  });
  return ["Calendar (the first span an imported level plays, per group of screens)", ...capped(lines, 12, "groups"), ...preview.calendar?.truncated ? ["  More groups exist than the calendar lists."] : []];
}
function shellWord(value) {
  return /^[A-Za-z0-9_@%+=:,./-]+$/.test(value) ? value : "'".concat(value.replaceAll("'", "'\\''"), "'");
}
function importCommand(context, flags, commit) {
  return [
    "screenrig schedule import",
    shellWord(context.file),
    "--name",
    shellWord(context.name),
    ...flags.timezone ? ["--timezone", shellWord(flags.timezone)] : [],
    ...flags.codeField ? ["--code-field", shellWord(flags.codeField)] : [],
    ...commit ? ["--commit"] : []
  ].join(" ");
}
function previewLines(preview, next) {
  const summary = preview.summary;
  const counts = [
    summary.creates ? "".concat(summary.creates, " create") : "",
    summary.updates ? "".concat(summary.updates, " update") : "",
    summary.unchanged ? "".concat(summary.unchanged, " unchanged") : "",
    summary.removes ? "".concat(summary.removes, " remove") : ""
  ].filter(Boolean).join(", ");
  const lines = [
    'Import "'.concat(preview.name, '": ').concat(plural(summary.rows, "row"), ", ").concat(plural(summary.levels, "level")).concat(counts ? " (".concat(counts, ")") : "", ", ").concat(plural(summary.screens, "screen")).concat(summary.playlists ? ", ".concat(plural(summary.playlists, "playlist"), " made") : "").concat(summary.rows_with_errors ? ", ".concat(plural(summary.rows_with_errors, "row"), " with errors") : "")
  ];
  const problems = [
    ...(preview.errors ?? []).map((problem) => rowProblemLine(void 0, problem)),
    ...[...preview.rows].sort((a, b) => a.row - b.row).flatMap((row) => [
      ...(row.errors ?? []).map((problem) => rowProblemLine(row.row, problem)),
      ...(row.warnings ?? []).map((problem) => rowProblemLine(row.row, problem, true))
    ])
  ];
  if (problems.length)
    lines.push("", ...capped(problems, 200, "problems"));
  if (preview.levels.length) {
    const names = screenNames(preview);
    lines.push("", ...capped(table2(["ACTION", "WHERE", "CONTENT", "WHEN", "PRIORITY"], preview.levels.map((level) => [
      level.action,
      level.home === "screen" ? "screen ".concat(clip(names.get(level.key) ?? level.screen_id ?? "", 40)) : "shared (".concat(plural(level.screens, "screen"), ")"),
      clip(level.content.name, 40),
      whenText(level),
      String(level.priority)
    ])), 101, "levels"));
  }
  if (preview.removals.length) {
    lines.push("", "Removed because the sheet no longer has them:", ...capped(preview.removals.map((removal) => "  ".concat(removalText(removal))), 50, "removals"));
  }
  const calendar = calendarLines(preview);
  if (calendar.length)
    lines.push("", ...calendar);
  lines.push("", next);
  return lines;
}
function appliedLine(name, applied) {
  if (!applied.creates && !applied.updates && !applied.removes) {
    return 'Import "'.concat(name, '" applied: nothing changed, every level already matches the sheet.');
  }
  return 'Import "'.concat(name, '" applied: ').concat(applied.creates, " created, ").concat(applied.updates, " updated, ").concat(applied.unchanged, " unchanged, ").concat(applied.removes, " removed; ").concat(plural(applied.screens, "screen"), " written").concat(applied.playlists ? ", ".concat(plural(applied.playlists, "playlist"), " made") : "", ". Screens switch within a minute.");
}
function importIdempotencyKey(name, fingerprint) {
  return "sch-imp-".concat(createHash5("sha256").update("schedule-import\0".concat(name, "\0").concat(fingerprint)).digest("hex").slice(0, 48));
}
function scheduleImportProblem(error, rerun, stdin) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  if (problem.next)
    return error;
  if (problem.code === "schedule_import_stale") {
    return new CliError({
      ...problem,
      next: {
        command: rerun,
        reason: stdin ? "The screens, media or levels changed since the preview, so nothing was written. Pipe the same sheet again with --commit: the run previews again first." : "The screens, media or levels changed since the preview, so nothing was written. Run it again: the run previews again before it commits."
      }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "schedule_import_invalid") {
    return new CliError({
      ...problem,
      next: { command: rerun.replace(/ --commit$/, ""), reason: "Some rows have errors, so nothing was written. Run it without --commit to list the rows to correct." }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "invalid_request") {
    return new CliError({
      ...problem,
      next: { command: "screenrig schedule template --output schedule.csv", reason: "The sheet could not be read. Start from the template: one row per screen and file, with a header row." }
    }, error.exitCode, error.warnings);
  }
  return error;
}
async function importCall(client, request, rerun, stdin) {
  try {
    return await client.call(request);
  } catch (error) {
    throw scheduleImportProblem(error, rerun, stdin);
  }
}
var handleScheduleImport = commandHandler(async (args, runtime, resolved) => {
  const file = args.positionals[2] ?? "";
  const commit = flagBool(args.flags, "commit");
  const flagName = flagString(args.flags, "name");
  const timezone = flagString(args.flags, "timezone");
  const codeField = flagString(args.flags, "code-field");
  if (flagName !== void 0)
    scheduleImportName(flagName);
  const sheet = await readImportSheet(file, runtime);
  let name = flagName?.trim();
  if (name === void 0 && sheet.defaultName) {
    try {
      name = scheduleImportName(sheet.defaultName);
    } catch {
      throw usageError("The file name ".concat(sheet.defaultName, " cannot be the import's name (1 to ").concat(SCHEDULE_IMPORT_NAME_MAX, " characters). Add --name NAME."));
    }
  }
  const stdin = file === "-";
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const parameters = { name, timezone, codeField };
  const label = name ?? "import";
  const rerun = importCommand({ file, name: label }, { timezone, codeField }, true);
  const timeout_ms = (typeof args.flags.timeout === "string" ? Number(args.flags.timeout) : 0) || IMPORT_TIMEOUT_MS;
  runtime.stderr.write("Checking ".concat(file === "-" ? "the sheet from stdin" : file, " against the project...\n"));
  const previewRequest = importRequest(sheet, parameters);
  const previewResponse = await importCall(client, { method: "POST", path: PREVIEW_PATH, timeout_ms, ...previewRequest }, rerun, stdin);
  const preview = previewResponse.body;
  const importName = preview.name || label;
  const context = { file, name: importName };
  const flags = { timezone, codeField };
  if (!preview.valid) {
    return {
      envelope: jsonBody(previewResponse, client.requestId, {
        ...commit ? { committed: false } : {},
        next: { command: importCommand(context, flags, commit), reason: "Correct the rows listed in rows[].errors and errors, then run it again." }
      }),
      exitCode: SCHEDULE_IMPORT_NEEDS_CORRECTIONS,
      human: [...previewLines(preview, "Fix the rows above and run again.".concat(commit ? " Nothing was committed." : ""))].join("\n")
    };
  }
  const commitCommand = importCommand(context, flags, true);
  if (!commit) {
    return {
      envelope: jsonBody(previewResponse, client.requestId, { next: { command: commitCommand, reason: "The sheet is valid. Commit applies every level in one step, or none." } }),
      exitCode: ExitCode.Success,
      human: previewLines(preview, "Valid. Commit with: ".concat(commitCommand)).join("\n")
    };
  }
  runtime.stderr.write("The sheet is valid; committing import ".concat(importName, "...\n"));
  const request = importRequest(sheet, parameters, preview.fingerprint);
  const key = flagString(args.flags, "idempotency-key");
  const idempotencyKey = key && isValidIdempotencyKey(key) ? key : importIdempotencyKey(importName, preview.fingerprint);
  const response = await importCall(client, { method: "POST", path: COMMIT_PATH, timeout_ms, idempotent: true, idempotencyKey, ...request }, commitCommand, stdin);
  const committed = response.body;
  return {
    envelope: jsonBody(response, client.requestId, { committed: true }),
    exitCode: ExitCode.Success,
    human: [...previewLines(preview, appliedLine(importName, committed.applied))].join("\n")
  };
});
async function writeOutputBytes(output, bytes, overwrite) {
  await mkdir4(path6.dirname(output), { recursive: true });
  await assertOutputAvailable(output, overwrite);
  const temporary = "".concat(output, ".").concat(crypto.randomUUID(), ".tmp");
  try {
    const handle = await open2(temporary, "wx", 384);
    try {
      await handle.writeFile(bytes);
    } finally {
      await handle.close();
    }
    await rename2(temporary, output);
  } catch {
    throw usageError("Cannot create output; check that the directory is writable.");
  } finally {
    await rm3(temporary, { force: true });
  }
}
var handleScheduleTemplate = commandHandler(async (args, runtime, resolved) => {
  const format = flagString(args.flags, "format") ?? "csv";
  const outputFlag = flagString(args.flags, "output");
  const overwrite = flagBool(args.flags, "overwrite");
  if (format === "xlsx" && !outputFlag)
    throw usageError("--format xlsx writes a workbook: give --output FILE.");
  const output = outputFlag ? path6.resolve(runtime.cwd(), outputFlag) : void 0;
  if (output)
    await assertOutputAvailable(output, overwrite);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: "GET",
    path: TEMPLATE_PATH,
    query: { format },
    binary: true,
    headers: { accept: "".concat(CSV_TYPE, ", ").concat(XLSX_TYPE, ";q=0.9, */*;q=0.1") }
  });
  const bytes = response.body instanceof Uint8Array ? response.body : new TextEncoder().encode(String(response.body ?? ""));
  const requestId = response.headers["x-request-id"] ?? client.requestId;
  if (!output) {
    const content = new TextDecoder().decode(bytes);
    return {
      envelope: successEnvelope({ format, content }, { request_id: requestId }),
      exitCode: ExitCode.Success,
      human: content.trimEnd()
    };
  }
  await writeOutputBytes(output, bytes, overwrite);
  return {
    envelope: successEnvelope({ format, output, bytes: bytes.length, next: { command: "screenrig schedule import ".concat(shellWord(output)), reason: "Fill one row per screen and file, then preview the sheet." } }, { request_id: requestId }),
    exitCode: ExitCode.Success,
    human: "Wrote the ".concat(format.toUpperCase(), " template to ").concat(output, ". Fill one row per screen and file, then run: screenrig schedule import ").concat(shellWord(output))
  };
});

// dist/cli-commands/schedule-import.js
function registerScheduleImportCommands(root, bind) {
  const schedule = root.command("schedule").description("Import schedules in bulk from a spreadsheet");
  addCommandNotes(schedule, "Schedule import:\n  schedule import checks a sheet of rows (screen, file, start, end) against the\n  project, previews the levels it makes and the calendar effect, and with\n  --commit applies all of it or none. schedule template saves a sheet to start\n  from. A single screen's own schedule is screen schedule; a campaign\n  schedules an audience.");
  schedule.command("import").description("Check a spreadsheet of schedule rows and preview what it does; --commit applies it").argument("<file>", 'A .csv, .xlsx or .json sheet (JSON: an array of row objects or {"rows": [...]}), or - to read JSON rows or CSV text from stdin').option("--name <NAME>", "Name the import, 1 to 80 characters; importing again under the same name updates the levels it made (default: the file name without its extension)", scheduleImportName).option("--timezone <ZONE>", "IANA zone the times are written in when a row has no timezone, such as America/New_York (default: each screen's own clock)", scheduleImportTimezone).option("--code-field <FIELD>", "Read the screen code only from this screen field, such as code or room_id (default: a code matches any field)", scheduleImportCodeField).option("--commit", "Apply the import when the preview is valid; with row errors nothing is written").action(bind(handleScheduleImport));
  const template = schedule.command("template").description("Save a sheet with the columns a schedule import reads and three example rows").addOption(new Option("--format <FORMAT>", "Sheet format (default: csv)").choices(["csv", "xlsx"])).option("--output <FILE>", "Write the sheet to this file (required for xlsx); without it the CSV is printed").option("--overwrite", "Replace --output if it exists").action(bind(handleScheduleTemplate));
  requireOptionGroup(template, "requires", ["--overwrite", "--output"]);
}

// dist/bundles/playlists.js
function register(root, bind) {
  registerPlaylistCommands(root, bind);
  registerReviewsCommands(root, bind);
  registerCardsCommands(root, bind);
  registerBackgroundCommands(root, bind);
  registerCommentCommands(root, bind);
  registerScheduleImportCommands(root, bind);
}
export {
  register
};
