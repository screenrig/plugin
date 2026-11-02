import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  readServiceAccountKey
} from "./chunk-MM5BTU3W.js";
import {
  snoozeDurationMs,
  verifyLines
} from "./chunk-DA3VRVV6.js";
import {
  uploadMediaFile
} from "./chunk-4ELYSUHZ.js";
import {
  table
} from "./chunk-34HCQ4WD.js";
import {
  readAuthoringText
} from "./chunk-AA4UGMUE.js";
import {
  DEFAULT_ARCHIVE_LIMITS,
  clientFor,
  commandHandler,
  jsonBody,
  progressReporterFor,
  quotedRevision,
  requireInputFile,
  requireToken,
  transcodeOptionsFromArgs
} from "./chunk-BLRK52WK.js";
import {
  assertProjectCredential,
  pendingReviewOf,
  pendingReviewWarning,
  plainText,
  projectConfigFor,
  reviewNext,
  withProjectConfig
} from "./chunk-CLNYG2EL.js";
import {
  loggerOf
} from "./chunk-Q663CR2G.js";
import {
  flagBool,
  flagNumber,
  flagString,
  isValidIdempotencyKey,
  newIdempotencyKey,
  readConfigFile,
  successEnvelope,
  withConfigLock,
  writeConfigAtomic
} from "./chunk-5LZK5ICC.js";
import {
  readAsset
} from "./chunk-I6MYDZNA.js";
import {
  processSettings
} from "./chunk-3GNVNCBB.js";
import {
  isResourceID
} from "./chunk-XCQJWNID.js";
import {
  CliError,
  ExitCode,
  makeProblem,
  usageError
} from "./chunk-KI2KSDHX.js";
import {
  __export
} from "./chunk-CIJQ2GE5.js";

// dist/pack/limits.js
var limits_exports = {};
__export(limits_exports, {
  DEFAULT_ARCHIVE_LIMITS: () => DEFAULT_ARCHIVE_LIMITS,
  mergeLimits: () => mergeLimits,
  packError: () => packError
});
function packError(code, detail) {
  return new CliError(makeProblem(code, "Application archive rejected", 400, detail, {
    hint: "The CLI checks the archive locally; nothing was sent. Fix the file, line or ignore rule detail names, then run the command again.",
    next: {
      command: "screenrig app pack <directory>",
      reason: "Fix the named path or ignore rule, then rebuild the archive locally."
    }
  }), ExitCode.Usage);
}
function mergeLimits(overrides) {
  return { ...DEFAULT_ARCHIVE_LIMITS, ...overrides };
}

// dist/adapters/sdk-injection.js
var sdk_injection_exports = {};
__export(sdk_injection_exports, {
  ArchiveSdkInjector: () => ArchiveSdkInjector,
  SDK_MARKER: () => SDK_MARKER,
  SDK_PROTOCOL_VERSION: () => SDK_PROTOCOL_VERSION,
  SDK_RUNTIME_PATH: () => SDK_RUNTIME_PATH,
  SDK_SCRIPT_TAG: () => SDK_SCRIPT_TAG,
  defaultSdkInjector: () => defaultSdkInjector
});
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
var SDK_PROTOCOL_VERSION = "1";
var SDK_RUNTIME_PATH = "_screenrig/runtime.js";
var SDK_MARKER = `data-screenrig-sdk="${SDK_PROTOCOL_VERSION}"`;
var SDK_SCRIPT_TAG = `<script src="./${SDK_RUNTIME_PATH}" ${SDK_MARKER}></script>`;
function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3];
}
function injectTag(html) {
  const rawMarkers = html.match(/data-screenrig-sdk/gi) ?? [];
  const markedScripts = [...html.matchAll(/<script\b[^>]*data-screenrig-sdk[^>]*>\s*<\/script\s*>/gi)];
  if (rawMarkers.length !== markedScripts.length) {
    throw packError("sdk_marker_invalid", "data-screenrig-sdk must appear only on a complete script element");
  }
  if (markedScripts.length > 1) {
    throw packError("sdk_marker_duplicate", "index.html contains more than one ScreenRig SDK marker");
  }
  if (markedScripts.length === 1) {
    const tag = markedScripts[0]?.[0] ?? "";
    const version = attribute(tag, "data-screenrig-sdk");
    const source = attribute(tag, "src")?.replace(/^\.\//, "");
    if (version !== SDK_PROTOCOL_VERSION || source !== SDK_RUNTIME_PATH || /\b(?:async|defer)\b/i.test(tag)) {
      throw packError("sdk_marker_incompatible", "Existing ScreenRig SDK marker has an incompatible version, source, or loading mode");
    }
    return html;
  }
  const tagEnd = `(?:[^"'<>]|"[^"]*"|'[^']*')*>`;
  const prefix = new RegExp(`(?:\\s+|<!--[\\s\\S]*?-->|<!doctype\\b${tagEnd}|<(?:html|head|meta|base|link)(?=[\\s/>])${tagEnd}|<(title|style|noscript)(?=[\\s/>])${tagEnd}[\\s\\S]*?<\\/\\1\\s*>)`, "iy");
  let offset = 0;
  while (prefix.exec(html))
    offset = prefix.lastIndex;
  return `${html.slice(0, offset)}${SDK_SCRIPT_TAG}
${html.slice(offset)}`;
}
var ArchiveSdkInjector = class {
  runtime;
  constructor(runtime) {
    this.runtime = runtime;
  }
  async inject(entries, request = {}) {
    const version = request.sdk_version ?? SDK_PROTOCOL_VERSION;
    if (version !== SDK_PROTOCOL_VERSION) {
      throw packError("sdk_version_incompatible", `Requested SDK protocol ${version}; this release supports ${SDK_PROTOCOL_VERSION}`);
    }
    if (entries.some((entry) => entry.path.toLocaleLowerCase("en-US") === SDK_RUNTIME_PATH.toLocaleLowerCase("en-US"))) {
      throw packError("sdk_path_collision", `${SDK_RUNTIME_PATH} is reserved for ScreenRig archive injection`);
    }
    const index = entries.findIndex((entry) => entry.path === "index.html" && entry.type === "file");
    if (index < 0) {
      throw packError("missing_index", "Application root must contain index.html");
    }
    const cloned = entries.map((entry) => ({ ...entry, data: entry.data ? Buffer.from(entry.data) : void 0 }));
    const indexEntry = cloned[index];
    if (!indexEntry?.data) {
      throw packError("missing_index", "index.html has no readable contents");
    }
    const nextHtml = Buffer.from(injectTag(indexEntry.data.toString("utf8")), "utf8");
    cloned[index] = { ...indexEntry, data: nextHtml, size: nextHtml.length };
    const hash = createHash("sha256").update(this.runtime).digest("hex");
    if (request.sdk_sha256 && request.sdk_sha256 !== hash) {
      throw packError("sdk_hash_mismatch", "Pinned SDK runtime hash does not match the requested compatibility record");
    }
    cloned.push({ path: SDK_RUNTIME_PATH, type: "file", data: Buffer.from(this.runtime), size: this.runtime.length });
    return { entries: cloned, injected: true, reason: "Pinned ScreenRig browser runtime injected into archive only", asset_path: SDK_RUNTIME_PATH, asset_sha256: hash };
  }
};
var ReleaseLocalSdkInjector = class {
  async inject(entries, request) {
    const configured = processSettings().SCREENRIG_SDK_RUNTIME;
    let runtime;
    try {
      runtime = configured ? await readFile(path.resolve(configured)) : readAsset("screenrig.runtime.js");
    } catch {
      const where = configured ? path.resolve(configured) : "assets/screenrig.runtime.js";
      throw packError("sdk_runtime_missing", `Pinned SDK runtime is missing at ${where}; reinstall the ScreenRig CLI from a verified release`);
    }
    return new ArchiveSdkInjector(runtime).inject(entries, request);
  }
};
var defaultSdkInjector = new ReleaseLocalSdkInjector();

// dist/pack/archive.js
var archive_exports = {};
__export(archive_exports, {
  crc32: () => crc32,
  gzipDeterministic: () => gzipDeterministic,
  parseTar: () => parseTar,
  sha256Hex: () => sha256Hex,
  writeTar: () => writeTar
});
import { createHash as createHash2 } from "node:crypto";
import { deflateRawSync } from "node:zlib";
var BLOCK = 512;
var USTAR_MAGIC = "ustar\0";
var USTAR_VERSION = "00";
var CRC32_TABLE = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) === 1 ? 3988292384 ^ value >>> 1 : value >>> 1;
  }
  return value >>> 0;
});
function crc32(data) {
  let value = 4294967295;
  for (let index = 0; index < data.length; index += 1) {
    value = CRC32_TABLE[(value ^ data[index]) & 255] ^ value >>> 8;
  }
  return (value ^ 4294967295) >>> 0;
}
function putString(buf, offset, length, value) {
  buf.fill(0, offset, offset + length);
  if (value.length > length) {
    throw packError("path_too_long", `USTAR field overflow: ${value}`);
  }
  buf.write(value, offset, "utf8");
}
function putOctal(buf, offset, length, value) {
  const oct = value.toString(8).padStart(length - 1, "0");
  buf.fill(0, offset, offset + length);
  buf.write(oct, offset, length - 1, "ascii");
}
function checksum(header) {
  let sum = 0;
  for (let i = 0; i < BLOCK; i += 1) {
    sum += header[i] ?? 0;
  }
  return sum;
}
function splitName(posixPath) {
  if (Buffer.byteLength(posixPath, "utf8") <= 100) {
    return { name: posixPath, prefix: "" };
  }
  const parts = posixPath.split("/");
  for (let i = 1; i < parts.length; i += 1) {
    const prefix = parts.slice(0, i).join("/");
    const name = parts.slice(i).join("/");
    if (Buffer.byteLength(prefix, "utf8") <= 155 && Buffer.byteLength(name, "utf8") <= 100) {
      return { name, prefix };
    }
  }
  throw packError("path_too_long", `Path cannot be encoded in ustar: ${posixPath}`);
}
function headerFor(entry) {
  const header = Buffer.alloc(BLOCK);
  const split = splitName(entry.path);
  putString(header, 0, 100, split.name);
  putOctal(header, 100, 8, entry.type === "directory" ? 493 : 420);
  putOctal(header, 108, 8, 0);
  putOctal(header, 116, 8, 0);
  putOctal(header, 124, 12, entry.type === "file" ? entry.size : 0);
  putOctal(header, 136, 12, 0);
  header.fill(32, 148, 156);
  header[156] = entry.type === "directory" ? 53 : 48;
  putString(header, 257, 6, USTAR_MAGIC);
  putString(header, 263, 2, USTAR_VERSION);
  putString(header, 265, 32, "");
  putString(header, 297, 32, "");
  putOctal(header, 329, 8, 0);
  putOctal(header, 337, 8, 0);
  putString(header, 345, 155, split.prefix);
  const sum = checksum(header);
  const sumOct = `${sum.toString(8).padStart(6, "0")}\0 `;
  header.write(sumOct, 148, 8, "ascii");
  return header;
}
function padToBlock(size) {
  const rem = size % BLOCK;
  return rem === 0 ? 0 : BLOCK - rem;
}
function writeTar(entries) {
  const chunks = [];
  for (const entry of entries) {
    chunks.push(headerFor(entry));
    if (entry.type === "file") {
      const data = entry.data ?? Buffer.alloc(0);
      chunks.push(data);
      const pad = padToBlock(data.length);
      if (pad > 0) {
        chunks.push(Buffer.alloc(pad));
      }
    }
  }
  chunks.push(Buffer.alloc(BLOCK * 2));
  return Buffer.concat(chunks);
}
function gzipDeterministic(data) {
  const deflated = deflateRawSync(data, { level: 9 });
  const header = Buffer.from([31, 139, 8, 0, 0, 0, 0, 0, 2, 255]);
  const footer = Buffer.alloc(8);
  footer.writeUInt32LE(crc32(data), 0);
  footer.writeUInt32LE(data.length >>> 0, 4);
  return Buffer.concat([header, deflated, footer]);
}
function sha256Hex(data) {
  return createHash2("sha256").update(data).digest("hex");
}
function parseTar(archive) {
  const out = [];
  let offset = 0;
  while (offset + BLOCK <= archive.length) {
    const header = archive.subarray(offset, offset + BLOCK);
    if (header.every((byte) => byte === 0)) {
      break;
    }
    const name = header.subarray(0, 100).toString("utf8").replace(/\0+$/, "");
    const prefix = header.subarray(345, 500).toString("utf8").replace(/\0+$/, "");
    const posixPath = prefix ? `${prefix}/${name}` : name;
    const sizeRaw = header.subarray(124, 136).toString("ascii").replace(/\0+$/, "").trim();
    const size = Number.parseInt(sizeRaw, 8) || 0;
    const typeflag = header[156];
    const type = typeflag === 53 ? "directory" : "file";
    out.push({ path: posixPath, type, size });
    offset += BLOCK + size + padToBlock(size);
  }
  return out;
}

// dist/pack/paths.js
var paths_exports = {};
__export(paths_exports, {
  BUILTIN_IGNORE_PATTERNS: () => BUILTIN_IGNORE_PATTERNS,
  caseFold: () => caseFold,
  compileIgnore: () => compileIgnore,
  hasIllegalChars: () => hasIllegalChars,
  hasTraversal: () => hasTraversal,
  isBuiltinIgnored: () => isBuiltinIgnored,
  isDotComponentPath: () => isDotComponentPath,
  pathDepth: () => pathDepth,
  posixNormalize: () => posixNormalize,
  toPosixRelative: () => toPosixRelative,
  utf8Bytes: () => utf8Bytes
});
import path2 from "node:path";
function posixNormalize(relativePath) {
  const replaced = relativePath.replaceAll("\\", "/").normalize("NFC");
  const parts = [];
  for (const part of replaced.split("/")) {
    if (part === "" || part === ".") {
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}
function caseFold(relativePath) {
  return posixNormalize(relativePath).toLocaleLowerCase("en-US");
}
function hasTraversal(relativePath) {
  if (relativePath.startsWith("/") || /^[A-Za-z]:/.test(relativePath)) {
    return true;
  }
  return relativePath.split(/[/\\]/).some((part) => part === "..");
}
function pathDepth(relativePath) {
  const normalized = posixNormalize(relativePath);
  if (!normalized) {
    return 0;
  }
  return normalized.split("/").length;
}
function utf8Bytes(value) {
  return Buffer.byteLength(value, "utf8");
}
function hasIllegalChars(relativePath) {
  if (relativePath.includes("\0")) {
    return true;
  }
  return /[\u0000-\u001f\u007f]/.test(relativePath);
}
function compileIgnore(patterns) {
  const rules = patterns.map((line) => line.trim()).filter((line) => line.length > 0 && !line.startsWith("#")).map((line) => {
    const negated = line.startsWith("!");
    const raw = negated ? line.slice(1) : line;
    const directoryOnly = raw.endsWith("/");
    const pattern = directoryOnly ? raw.slice(0, -1) : raw;
    return { negated, directoryOnly, regex: globToRegExp(pattern) };
  });
  return (posixPath, isDir) => {
    let ignored = false;
    for (const rule of rules) {
      if (rule.directoryOnly && !isDir) {
        continue;
      }
      if (rule.regex.test(posixPath) || rule.regex.test(posixPath.split("/").pop() ?? "")) {
        ignored = !rule.negated;
      }
    }
    return ignored;
  };
}
function globToRegExp(pattern) {
  const anchored = pattern.startsWith("/");
  const body = anchored ? pattern.slice(1) : pattern;
  let regex = "";
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (ch === "*" && body[i + 1] === "*") {
      if (body[i + 2] === "/") {
        regex += "(?:.*/)?";
        i += 2;
      } else {
        regex += ".*";
        i += 1;
      }
      continue;
    }
    if (ch === "*") {
      regex += "[^/]*";
      continue;
    }
    if (ch === "?") {
      regex += "[^/]";
      continue;
    }
    if (ch && "\\^$+{}[]()|.".includes(ch)) {
      regex += `\\${ch}`;
      continue;
    }
    regex += ch ?? "";
  }
  const source = anchored ? `^${regex}(?:/.*)?$` : `(^|/)${regex}(?:/.*)?$`;
  return new RegExp(source);
}
var BUILTIN_IGNORE_PATTERNS = [
  "node_modules/",
  "bower_components/",
  "jspm_packages/",
  "vendor/",
  ".venv/",
  "venv/",
  "__pycache__/",
  ".tox/",
  ".mypy_cache/",
  ".pytest_cache/",
  ".eggs/",
  ".idea/",
  ".vscode/",
  ".vs/",
  ".yarn/",
  ".git/",
  ".svn/",
  ".hg/",
  ".bzr/",
  "CVS/",
  "*.map",
  "*.pem",
  "*.key",
  "*.p12",
  "*.pfx",
  "*.crt",
  "*.cer",
  "id_rsa",
  "id_dsa",
  "id_ecdsa",
  "id_ed25519",
  "credentials.json",
  "secrets.json",
  ".npmrc",
  ".pypirc",
  ".netrc",
  "*.swp",
  "*.swo",
  "*~",
  "Thumbs.db",
  "desktop.ini"
];
var builtinMatcher = compileIgnore(BUILTIN_IGNORE_PATTERNS);
function isDotComponentPath(posixPath) {
  return posixNormalize(posixPath).split("/").some((part) => part.startsWith("."));
}
function isBuiltinIgnored(posixPath, isDir) {
  if (isDotComponentPath(posixPath)) {
    return true;
  }
  return builtinMatcher(posixPath, isDir);
}
function toPosixRelative(root, absolute) {
  return posixNormalize(path2.relative(root, absolute));
}

// dist/pack/walk.js
var walk_exports = {};
__export(walk_exports, {
  loadScreenrigIgnore: () => loadScreenrigIgnore,
  walkDirectory: () => walkDirectory
});
import { constants } from "node:fs";
import { lstat, open, readdir, readFile as readFile2 } from "node:fs/promises";
import path3 from "node:path";
var FILE_TYPE_NAMES = {
  0: "unknown"
};
function fileTypeLabel(stat) {
  if (stat.isSymbolicLink())
    return "symlink";
  if (stat.isFIFO())
    return "fifo";
  if (stat.isSocket())
    return "socket";
  if (stat.isCharacterDevice())
    return "character-device";
  if (stat.isBlockDevice())
    return "block-device";
  if (stat.isDirectory())
    return "directory";
  if (stat.isFile())
    return "file";
  return FILE_TYPE_NAMES[0] ?? "unsupported";
}
function isSparse(stat) {
  if (typeof stat.blocks !== "number") {
    return false;
  }
  return stat.blocks * 512 < stat.size;
}
async function loadScreenrigIgnore(root) {
  try {
    const raw = await readFile2(path3.join(root, ".screenrigignore"), "utf8");
    return compileIgnore(raw.split(/\r?\n/));
  } catch (err) {
    if (err.code === "ENOENT") {
      return () => false;
    }
    throw err;
  }
}
async function walkDirectory(root, limits) {
  const extraIgnore = await loadScreenrigIgnore(root);
  const entries = [];
  const seenNormalized = /* @__PURE__ */ new Set();
  const seenFolded = /* @__PURE__ */ new Set();
  let fileCount = 0;
  let expandedBytes = 0;
  async function visit(absolute) {
    const relative = toPosixRelative(root, absolute);
    const posixPath = posixNormalize(relative);
    let st;
    try {
      st = await lstat(absolute);
    } catch (err) {
      throw packError("unsupported_entry", `Unable to stat ${posixPath || "."}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
    const isDir = st.isDirectory();
    if (posixPath) {
      if (hasTraversal(posixPath) || posixPath.startsWith("/") || hasIllegalChars(posixPath)) {
        throw packError("path_traversal", `Rejected path ${posixPath}`);
      }
      if (utf8Bytes(posixPath) > limits.application_path_bytes) {
        throw packError("path_too_long", `Path exceeds ${limits.application_path_bytes} bytes: ${posixPath}`);
      }
      if (pathDepth(posixPath) > limits.application_path_depth) {
        throw packError("path_too_deep", `Path exceeds depth ${limits.application_path_depth}: ${posixPath}`);
      }
      if (isBuiltinIgnored(posixPath, isDir) || extraIgnore(posixPath, isDir)) {
        return;
      }
      if (seenNormalized.has(posixPath)) {
        throw packError("duplicate_path", `Duplicate normalized path: ${posixPath}`);
      }
      const folded = caseFold(posixPath);
      if (seenFolded.has(folded)) {
        throw packError("duplicate_path", `Duplicate case-folded path: ${posixPath}`);
      }
      seenNormalized.add(posixPath);
      seenFolded.add(folded);
    }
    if (st.isSymbolicLink()) {
      throw packError("symlink_rejected", `Symlinks are not allowed: ${posixPath || "."}`);
    }
    if (st.isFIFO()) {
      throw packError("fifo_rejected", `FIFOs are not allowed: ${posixPath || "."}`);
    }
    if (st.isSocket()) {
      throw packError("socket_rejected", `Sockets are not allowed: ${posixPath || "."}`);
    }
    if (st.isCharacterDevice() || st.isBlockDevice()) {
      throw packError("device_rejected", `Device files are not allowed: ${posixPath || "."}`);
    }
    if (!st.isFile() && !st.isDirectory()) {
      throw packError("unsupported_entry", `Unsupported filesystem entry (${fileTypeLabel(st)}): ${posixPath || "."}`);
    }
    if (st.isFile() && st.nlink > 1) {
      throw packError("hardlink_rejected", `Hardlinks are not allowed: ${posixPath || "."}`);
    }
    if (st.isFile() && isSparse(st)) {
      throw packError("sparse_rejected", `Sparse files are not allowed: ${posixPath || "."}`);
    }
    if (st.isDirectory()) {
      if (posixPath) {
        entries.push({ path: posixPath, type: "directory", size: 0 });
      }
      const children = await readdir(absolute);
      children.sort((a, b) => Buffer.compare(Buffer.from(a.normalize("NFC")), Buffer.from(b.normalize("NFC"))));
      for (const child of children) {
        await visit(path3.join(absolute, child));
      }
      return;
    }
    if (st.size > limits.application_file_bytes) {
      throw packError("file_too_large", `File exceeds ${limits.application_file_bytes} bytes: ${posixPath}`);
    }
    if (fileCount >= limits.application_file_count) {
      throw packError("too_many_files", `Archive exceeds the ${limits.application_file_count} file limit at ${posixPath}`);
    }
    if (st.size > limits.application_expanded_bytes - expandedBytes) {
      throw packError("expanded_too_large", `Expanded size exceeds ${limits.application_expanded_bytes} at ${posixPath}`);
    }
    const handle = await open(absolute, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    let data;
    try {
      const opened = await handle.stat();
      if (!opened.isFile() || opened.dev !== st.dev || opened.ino !== st.ino || opened.size !== st.size || opened.nlink !== 1 || isSparse(opened)) {
        throw packError("unsupported_entry", `File changed while packing: ${posixPath}`);
      }
      data = Buffer.allocUnsafe(st.size);
      let offset = 0;
      while (offset < data.length) {
        const { bytesRead } = await handle.read(data, offset, Math.min(256 * 1024, data.length - offset), offset);
        if (bytesRead === 0)
          throw packError("unsupported_entry", `File changed while packing: ${posixPath}`);
        offset += bytesRead;
      }
      const after = await handle.stat();
      if (after.size !== opened.size || after.mtimeMs !== opened.mtimeMs || after.ctimeMs !== opened.ctimeMs) {
        throw packError("unsupported_entry", `File changed while packing: ${posixPath}`);
      }
    } finally {
      await handle.close();
    }
    fileCount += 1;
    expandedBytes += data.length;
    entries.push({ path: posixPath, type: "file", data, size: data.length });
  }
  const rootStat = await lstat(root);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw packError("unsupported_entry", "Application source must be a real directory");
  }
  await visit(root);
  const files = entries.filter((entry) => entry.type === "file");
  if (files.length > limits.application_file_count) {
    throw packError("too_many_files", `Archive contains ${files.length} files; limit is ${limits.application_file_count}`);
  }
  const expanded = files.reduce((sum, entry) => sum + entry.size, 0);
  if (expanded > limits.application_expanded_bytes) {
    throw packError("expanded_too_large", `Expanded size ${expanded} exceeds ${limits.application_expanded_bytes}`);
  }
  if (!files.some((entry) => entry.path === "index.html")) {
    throw packError("missing_index", "Application directory must contain index.html at the archive root");
  }
  return entries.sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path)));
}

// dist/pack/inline.js
var inline_exports = {};
__export(inline_exports, {
  hoistInlineAssets: () => hoistInlineAssets
});
import { createHash as createHash3 } from "node:crypto";
var HOIST_PREFIX = "_screenrig-inline-";
var HTML_PATH = /\.html?$/i;
var RAW_TEXT_ELEMENTS = { style: true, script: true, textarea: true, title: true };
var HTML_VOID_ELEMENTS = /* @__PURE__ */ new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
var SVG_HTML_INTEGRATION_POINTS = /* @__PURE__ */ new Set(["foreignobject", "desc", "title"]);
var EXECUTABLE_SCRIPT_TYPES = {
  "": true,
  "application/ecmascript": true,
  "application/javascript": true,
  "module": true,
  "text/ecmascript": true,
  "text/javascript": true
};
var URL_ATTRIBUTES = {
  href: true,
  src: true,
  "xlink:href": true,
  action: true,
  formaction: true
};
var SCRIPT_ATTRIBUTES_DROPPED = /* @__PURE__ */ new Set(["src", "async", "defer"]);
function isSpace(char) {
  return char === " " || char === "	" || char === "\n" || char === "\r" || char === "\f";
}
function lineAt(html, offset) {
  let line = 1;
  for (let index = 0; index < offset && index < html.length; index += 1) {
    if (html[index] === "\n")
      line += 1;
  }
  return line;
}
function scanTag(html, start) {
  const nameMatch = /^<([a-zA-Z][a-zA-Z0-9:-]*)/.exec(html.slice(start));
  if (!nameMatch)
    return null;
  const name = nameMatch[1].toLowerCase();
  const attributes = [];
  let selfClosing = false;
  let index = start + nameMatch[0].length;
  while (index < html.length) {
    while (index < html.length && isSpace(html[index]))
      index += 1;
    if (index >= html.length)
      break;
    if (html[index] === ">") {
      index += 1;
      break;
    }
    if (html[index] === "/" && html[index + 1] === ">") {
      selfClosing = true;
      index += 2;
      break;
    }
    const attributeStart = index;
    while (index < html.length && !isSpace(html[index]) && html[index] !== "=" && html[index] !== ">" && html[index] !== "/") {
      index += 1;
    }
    const attributeName = html.slice(attributeStart, index);
    if (attributeName === "") {
      index += 1;
      continue;
    }
    while (index < html.length && isSpace(html[index]))
      index += 1;
    let value;
    if (html[index] === "=") {
      index += 1;
      while (index < html.length && isSpace(html[index]))
        index += 1;
      const quote = html[index];
      if (quote === '"' || quote === "'") {
        const close = html.indexOf(quote, index + 1);
        if (close < 0) {
          value = html.slice(index + 1);
          index = html.length;
        } else {
          value = html.slice(index + 1, close);
          index = close + 1;
        }
      } else {
        const valueStart = index;
        while (index < html.length && !isSpace(html[index]) && html[index] !== ">")
          index += 1;
        value = html.slice(valueStart, index);
      }
    }
    const end = value === void 0 ? attributeStart + attributeName.length : index;
    attributes.push({ name: attributeName.toLowerCase(), value, offset: attributeStart, end });
  }
  return { name, start, end: Math.min(index, html.length), attributes, selfClosing };
}
function attributeValue(tag, name) {
  return tag.attributes.find((attribute2) => attribute2.name === name)?.value;
}
function scriptTypeName(value) {
  if (value === void 0)
    return "";
  return value.split(";")[0].trim().toLowerCase();
}
function decodeEntities(value) {
  return value.replace(/&#x([0-9a-f]+);?/gi, (_match, hex) => String.fromCodePoint(Number.parseInt(hex, 16))).replace(/&#(\d+);?/g, (_match, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10))).replace(/&(colon|tab|newline);/gi, (_match, name) => ({ colon: ":", tab: "	", newline: "\n" })[name.toLowerCase()] ?? "");
}
function serializeAttributes(html, tag, dropped = /* @__PURE__ */ new Set()) {
  let out = "";
  for (const attribute2 of tag.attributes) {
    if (dropped.has(attribute2.name))
      continue;
    out += ` ${html.slice(attribute2.offset, attribute2.end)}`;
  }
  return out;
}
function rejectUnsafeAttributes(path5, html, tag) {
  for (const attribute2 of tag.attributes) {
    const line = lineAt(html, attribute2.offset);
    if (/^on[a-z]+$/.test(attribute2.name)) {
      throw packError("inline_event_handler", `${path5}:${line}: inline event handler attribute '${attribute2.name}' cannot be hoisted; the release host blocks inline script. Move the handler into an external script.`);
    }
    if (attribute2.value !== void 0 && URL_ATTRIBUTES[attribute2.name] === true) {
      const normalized = decodeEntities(attribute2.value).replace(/[\u0000-\u0020]/g, "").toLowerCase();
      if (normalized.startsWith("javascript:")) {
        throw packError("javascript_url", `${path5}:${line}: '${attribute2.name}' uses a javascript: URL, which the release host blocks. Use an external script and an event listener instead.`);
      }
    }
  }
}
function findRawClose(html, from, name) {
  const pattern = new RegExp(`</${name}\\s*>`, "gi");
  pattern.lastIndex = from;
  const match = pattern.exec(html);
  if (!match)
    return null;
  return { index: match.index, end: match.index + match[0].length };
}
function findCommentEnd(html, from) {
  const close = html.indexOf("-->", from);
  return close < 0 ? html.length : close + 3;
}
function emitAsset(generated, existing, path5, extension, content) {
  const hash = createHash3("sha256").update(content, "utf8").digest("hex").slice(0, 32);
  const filename = `${HOIST_PREFIX}${hash}.${extension}`;
  const assetPath = `${path5.slice(0, path5.lastIndexOf("/") + 1)}${filename}`;
  if (existing.has(assetPath)) {
    throw packError("inline_asset_conflict", `${path5} inline ${extension} hoists onto the reserved asset ${assetPath}; rename or remove that file.`);
  }
  if (!generated.has(assetPath)) {
    const data = Buffer.from(content, "utf8");
    generated.set(assetPath, { path: assetPath, type: "file", data, size: data.length });
  }
  return `./${filename}`;
}
function transformHtml(path5, html, generated, existing) {
  const elements = [];
  let out = "";
  let cursor = 0;
  let index = 0;
  while (index < html.length) {
    const open2 = html.indexOf("<", index);
    if (open2 < 0)
      break;
    const next = html[open2 + 1];
    if (next === void 0)
      break;
    if (next === "!") {
      index = html.startsWith("<!--", open2) ? findCommentEnd(html, open2 + 4) : open2 + 1;
      continue;
    }
    if (next === "/") {
      const close = /^<\/([a-zA-Z][a-zA-Z0-9:-]*)\s*>/.exec(html.slice(open2));
      if (close) {
        const name = close[1].toLowerCase();
        for (let depth = elements.length - 1; depth >= 0; depth -= 1) {
          if (elements[depth].name === name) {
            elements.length = depth;
            break;
          }
        }
        index = open2 + close[0].length;
      } else {
        index = open2 + 1;
      }
      continue;
    }
    if (next === "?") {
      index = open2 + 1;
      continue;
    }
    const tag = scanTag(html, open2);
    if (!tag) {
      index = open2 + 1;
      continue;
    }
    rejectUnsafeAttributes(path5, html, tag);
    const parent = elements.at(-1);
    const namespace = tag.name === "svg" || parent?.namespace === "svg" && !SVG_HTML_INTEGRATION_POINTS.has(parent.name) ? "svg" : "html";
    const selfClosing = namespace === "svg" && tag.selfClosing;
    if (!selfClosing && RAW_TEXT_ELEMENTS[tag.name] === true && (namespace === "html" || tag.name === "style" || tag.name === "script")) {
      const close = findRawClose(html, tag.end, tag.name);
      if (!close) {
        throw packError("inline_unterminated", `${path5}:${lineAt(html, tag.start)}: unterminated <${tag.name}> element.`);
      }
      if (tag.name === "style" && namespace === "html") {
        out += html.slice(cursor, tag.start);
        const href = emitAsset(generated, existing, path5, "css", html.slice(tag.end, close.index));
        out += `<link rel="stylesheet" href="${href}"${serializeAttributes(html, tag)}>`;
        cursor = close.end;
      } else if (tag.name === "script" && attributeValue(tag, "src") === void 0 && EXECUTABLE_SCRIPT_TYPES[scriptTypeName(attributeValue(tag, "type"))] === true) {
        out += html.slice(cursor, tag.start);
        const href = emitAsset(generated, existing, path5, "js", html.slice(tag.end, close.index));
        out += `<script${serializeAttributes(html, tag, SCRIPT_ATTRIBUTES_DROPPED)} src="${href}"></script>`;
        cursor = close.end;
      }
      index = close.end;
      continue;
    }
    if (!selfClosing && !(namespace === "html" && HTML_VOID_ELEMENTS.has(tag.name))) {
      elements.push({ name: tag.name, namespace });
    }
    index = tag.end;
  }
  if (cursor < html.length)
    out += html.slice(cursor);
  if (out === "")
    return html;
  return out;
}
function hoistInlineAssets(entries) {
  const existing = new Set(entries.map((entry) => entry.path));
  const generated = /* @__PURE__ */ new Map();
  const rewritten = entries.map((entry) => {
    if (entry.type !== "file" || !entry.data || !HTML_PATH.test(entry.path))
      return entry;
    const html = entry.data.toString("utf8");
    const transformed = transformHtml(entry.path, html, generated, existing);
    if (transformed === html)
      return entry;
    const data = Buffer.from(transformed, "utf8");
    return { ...entry, data, size: data.length };
  });
  return [...rewritten, ...generated.values()];
}

// dist/pack/index.js
var pack_exports = {};
__export(pack_exports, {
  DEFAULT_ARCHIVE_LIMITS: () => DEFAULT_ARCHIVE_LIMITS,
  gzipDeterministic: () => gzipDeterministic,
  hoistInlineAssets: () => hoistInlineAssets,
  mergeLimits: () => mergeLimits,
  packDirectory: () => packDirectory,
  parseTar: () => parseTar,
  sha256Hex: () => sha256Hex,
  walkDirectory: () => walkDirectory,
  writeTar: () => writeTar
});
async function packDirectory(root, options = {}) {
  const logger = options.logger;
  const run = async () => {
    const limits = mergeLimits(options.limits);
    const walked = logger ? await logger.withLocal({ op: "pack.walk", message: `walk ${root}` }, async (span) => {
      const result = await walkDirectory(root, limits);
      span.finish({ file_count: result.filter((entry) => entry.type === "file").length });
      return result;
    }) : await walkDirectory(root, limits);
    const hoisted = hoistInlineAssets(walked);
    const injector = options.injector ?? defaultSdkInjector;
    const injected = await injector.inject(hoisted);
    const entries = injected.entries.slice().sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path)));
    const files = entries.filter((entry) => entry.type === "file");
    const expandedBytes = files.reduce((sum, entry) => sum + entry.size, 0);
    const enforceLimits = () => {
      if (files.length > limits.application_file_count) {
        throw packError("too_many_files", `Archive contains ${files.length} files; limit is ${limits.application_file_count}`);
      }
      if (expandedBytes > limits.application_expanded_bytes) {
        throw packError("expanded_too_large", `Expanded archive ${expandedBytes} exceeds ${limits.application_expanded_bytes}`);
      }
    };
    if (logger?.enabled) {
      await logger.withLocal({ op: "pack.limits", message: "enforce archive limits" }, async (span) => {
        enforceLimits();
        span.finish({
          file_count: files.length,
          expanded_bytes: expandedBytes,
          application_file_count: limits.application_file_count,
          application_expanded_bytes: limits.application_expanded_bytes
        });
      });
    } else {
      enforceLimits();
    }
    const packed = logger ? await logger.withLocal({ op: "pack.archive", message: "write gzip archive" }, async (span) => {
      const tar = writeTar(entries);
      const archive = gzipDeterministic(tar);
      span.finish({
        compressed_bytes: archive.length,
        expanded_bytes: expandedBytes,
        file_count: files.length,
        sha256: sha256Hex(archive)
      });
      return archive;
    }) : gzipDeterministic(writeTar(entries));
    if (packed.length > limits.application_archive_bytes) {
      throw packError("compressed_too_large", `Compressed archive ${packed.length} exceeds ${limits.application_archive_bytes}`);
    }
    return {
      archive: packed,
      sha256: sha256Hex(packed),
      compressed_bytes: packed.length,
      expanded_bytes: expandedBytes,
      file_count: files.length,
      entries: entries.map((entry) => ({ path: entry.path, type: entry.type, size: entry.size })),
      sdk_injection: {
        injected: injected.injected,
        reason: injected.reason,
        asset_path: injected.asset_path,
        asset_sha256: injected.asset_sha256
      }
    };
  };
  if (!logger?.enabled) {
    return run();
  }
  return logger.withLocal({ op: "pack.directory", message: `pack ${root}` }, async (span) => {
    const result = await run();
    span.finish({
      compressed_bytes: result.compressed_bytes,
      expanded_bytes: result.expanded_bytes,
      file_count: result.file_count,
      sha256: result.sha256
    });
    return result;
  });
}

// dist/media-versions.js
var media_versions_exports = {};
__export(media_versions_exports, {
  handleMediaReplace: () => handleMediaReplace,
  handleMediaRestore: () => handleMediaRestore,
  handleMediaVersionDelete: () => handleMediaVersionDelete,
  handleMediaVersions: () => handleMediaVersions,
  mediaVersionLines: () => mediaVersionLines,
  mediaVersionProblem: () => mediaVersionProblem
});
import path4 from "node:path";
var versionsPath = (id) => `/api/media/${encodeURIComponent(id)}/versions`;
function mediaIdArg(value, usage) {
  if (!value)
    throw usageError(`${usage} requires a media ID (med_...); media list shows them.`);
  if (!isResourceID(value, "media"))
    throw usageError(`${usage} takes a media ID (med_...), not ${JSON.stringify(value)}; media list shows them.`);
  return value;
}
function versionNumber(args, command) {
  const value = flagString(args.flags, "number");
  const number = Number(value);
  if (value === void 0 || !Number.isSafeInteger(number) || number < 1) {
    throw usageError(`${command} requires --number N, a whole number from 1 as media versions lists it.`);
  }
  return number;
}
function mediaVersionProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  const problem = error.problem;
  const next = problem.code === "revision_conflict" ? { command: `screenrig media show ${id}`, argv: ["media", "show", id], reason: "Read the media's current revision, then run the command again with --expect-rev REVISION if the change still applies." } : problem.code === "not_found" ? { command: `screenrig media versions ${id}`, argv: ["media", "versions", id], reason: "List the version numbers this media has; a deleted version does not come back." } : problem.code === "resource_conflict" ? { command: `screenrig media versions ${id}`, argv: ["media", "versions", id], reason: "Read which version is current and whether a replacement waits for review (reviews list)." } : void 0;
  return next ? new CliError({ ...problem, next }, error.exitCode, error.warnings) : error;
}
async function versionCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw mediaVersionProblem(error, id);
  }
}
function isMediaWarning(value) {
  const warning = value;
  return !!warning && typeof warning === "object" && typeof warning.code === "string" && typeof warning.detail === "string";
}
function mediaWarningsOf(value) {
  return Array.isArray(value) ? value.filter(isMediaWarning).map((warning) => ({ ...warning, playlists: Array.isArray(warning.playlists) ? warning.playlists : [] })) : [];
}
function playlistsText(warning) {
  return warning.playlists.map((playlist) => `${plainText(playlist.name)} (${playlist.id})`).join(", ");
}
function envelopeWarning(warning) {
  const playlists = playlistsText(warning);
  return { code: warning.code, message: `${plainText(warning.detail)}${playlists ? ` Playlists: ${playlists}.` : ""}` };
}
var REPLACE_PENDING_SENTENCE = "Screens keep playing the current file until a person approves the replacement; they can also reject it or ask for changes. Do not repeat the write: check the decision later.";
function replaceNext(id) {
  return { command: `screenrig media versions ${id}`, argv: ["media", "versions", id], reason: "Lists the media's versions; the new file is the current one." };
}
async function reviewUrl(client, reviewId) {
  try {
    const url = (await client.call({ method: "GET", path: `/api/reviews/${encodeURIComponent(reviewId)}` })).body?.url;
    return typeof url === "string" && url ? url : void 0;
  } catch {
    return void 0;
  }
}
async function mediaRevision(client, id) {
  try {
    const revision = (await client.call({ method: "GET", path: `/api/media/${encodeURIComponent(id)}` })).body?.revision;
    return typeof revision === "number" ? revision : void 0;
  } catch {
    return void 0;
  }
}
function sizeText(version) {
  const parts = [
    typeof version.width === "number" && typeof version.height === "number" ? `${version.width}x${version.height}` : "",
    typeof version.duration_ms === "number" ? `${(version.duration_ms / 1e3).toFixed(1)} s` : ""
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : "-";
}
function mediaReplaceResult(args, runtime, client, mediaId, uploaded, revision, reviewLink) {
  const result = uploaded.operation.result ?? {};
  const waited = uploaded.operation.state === "succeeded";
  const warnings = mediaWarningsOf(result.warnings);
  const pendingId = waited && result.status === "pending_review" && typeof result.review_id === "string" ? result.review_id : void 0;
  const version = typeof result.version === "number" ? result.version : void 0;
  const data = {
    media_id: mediaId,
    id: mediaId,
    ...pendingId ? { status: "pending_review", review_id: pendingId } : {},
    ...version !== void 0 ? { version } : {},
    ...revision !== void 0 ? { revision } : {},
    ...waited ? { warnings } : {},
    operation: uploaded.operation,
    upload: uploaded.upload,
    transcode: uploaded.transcode,
    timing: uploaded.timing,
    ...pendingId ? { next: reviewNext(pendingId) } : waited ? { next: replaceNext(mediaId) } : {}
  };
  const envelopeWarnings = [
    ...pendingId ? [reviewLink ? pendingReviewWarning({ url: reviewLink }) : { code: "pending_review", message: `The replacement waits for a person to approve it: screenrig reviews show ${pendingId}` }] : [],
    ...warnings.map(envelopeWarning),
    ...uploaded.warnings
  ];
  const human = flagBool(args.flags, "human");
  if (!human)
    for (const warning of warnings)
      runtime.stderr.write(`screenrig: warning: ${envelopeWarning(warning).message}
`);
  const title = pendingId ? "Replacement waiting for review" : waited ? "Media replaced" : "Media replacement accepted";
  const lines = [
    title,
    `media_id: ${mediaId}`,
    ...version !== void 0 ? [`version: ${version}`] : [],
    ...revision !== void 0 ? [`revision: ${revision}`] : [],
    `operation_id: ${uploaded.operation.id}`,
    `state: ${uploaded.operation.state}`,
    ...pendingId ? [`review_id: ${pendingId}`, ...reviewLink ? [`url: ${reviewLink}`] : [], `next: screenrig reviews show ${pendingId}`, REPLACE_PENDING_SENTENCE] : waited ? [`next: screenrig media versions ${mediaId}`] : [`next: screenrig operations wait ${uploaded.operation.id}`],
    `content_type: ${uploaded.upload.content_type}`,
    `sha256: ${uploaded.upload.sha256}`,
    `transcode: ${typeof uploaded.transcode.duration_ms === "number" ? `${uploaded.transcode.reason} in ${uploaded.transcode.duration_ms} ms` : "skipped"}`,
    `timing: ${Object.entries(uploaded.timing).map(([stage, ms]) => `${stage.replace(/_ms$/, "")} ${ms} ms`).join(", ")}`,
    ...warnings.map((warning) => `warning: ${envelopeWarning(warning).message}`),
    ...uploaded.warnings.map((warning) => `warning: ${warning.message}`)
  ];
  return {
    envelope: successEnvelope(data, { request_id: client.requestId, operation_id: uploaded.operation.id, warnings: envelopeWarnings }),
    exitCode: ExitCode.Success,
    human: lines.join("\n")
  };
}
var handleMediaReplace = commandHandler(async (args, runtime, resolved) => {
  const mediaId = mediaIdArg(args.positionals[2], "media replace");
  const file = args.positionals[3];
  if (!file)
    throw usageError("media replace requires <id> and <file>.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  return loggerOf(runtime).withLocal({ op: "media.replace", message: "media replace" }, async () => {
    const sourcePath = path4.resolve(runtime.cwd(), file);
    await requireInputFile(sourcePath, file);
    const transcodeOptions = transcodeOptionsFromArgs(args);
    let media;
    try {
      media = (await client.call({ method: "GET", path: `/api/media/${encodeURIComponent(mediaId)}` })).body;
    } catch (error) {
      throw mediaVersionProblem(error, mediaId);
    }
    const primitive = media.primitive === "image" || media.primitive === "video" || media.primitive === "audio" ? media.primitive : void 0;
    const note = flagString(args.flags, "note");
    const ifMatch = flagString(args.flags, "expect-rev");
    const noWait = flagBool(args.flags, "no-wait");
    let uploaded;
    try {
      uploaded = await uploadMediaFile({
        runtime,
        client,
        sourcePath,
        explicitContentType: flagString(args.flags, "content-type"),
        transcodeOptions,
        noTranscode: flagBool(args.flags, "no-transcode"),
        reporter: progressReporterFor(args, runtime),
        noWait,
        timeoutMs: flagNumber(args.flags, "timeout") ?? 12e4,
        pollMs: flagNumber(args.flags, "poll-ms") ?? 1e3,
        resumable: flagString(args.flags, "idempotency-key") !== void 0,
        replace: { mediaId, ...primitive ? { primitive } : {}, ...ifMatch !== void 0 ? { ifMatch } : {}, ...note !== void 0 ? { note } : {} }
      });
    } catch (error) {
      throw mediaVersionProblem(error, mediaId);
    }
    const result = uploaded.operation.result ?? {};
    const pendingId = uploaded.operation.state === "succeeded" && result.status === "pending_review" && typeof result.review_id === "string" ? result.review_id : void 0;
    const reviewLink = pendingId ? await reviewUrl(client, pendingId) : void 0;
    const revision = uploaded.operation.state === "succeeded" && !pendingId ? await mediaRevision(client, mediaId) : void 0;
    return mediaReplaceResult(args, runtime, client, mediaId, uploaded, revision, reviewLink);
  });
}, true);
function actorText(by) {
  if (!by)
    return "-";
  const name = plainText(by.name ?? by.id ?? "");
  return name ? `${name} (${by.kind})` : by.kind;
}
function sourceText(version) {
  return version.source === "restore" && version.restored_from !== void 0 ? `restore of ${version.restored_from}` : version.source;
}
function mediaVersionLines(mediaId, page) {
  const items = Array.isArray(page?.items) ? page.items : [];
  const next = typeof page?.next_cursor === "string" && page.next_cursor ? page.next_cursor : void 0;
  return [
    `Media ${mediaId} versions (${items.length})`,
    ...items.length ? table(["NUMBER", "SOURCE", "FILENAME", "BYTES", "SIZE", "BY", "CREATED", "NOTE"], items.map((item) => [
      `${item.number}${item.current ? " (current)" : ""}`,
      sourceText(item),
      plainText(item.filename),
      String(item.bytes),
      sizeText(item),
      actorText(item.by),
      item.created_at,
      item.note === void 0 ? "" : plainText(item.note)
    ])) : ["No versions"],
    ...next ? [`next: screenrig media versions ${mediaId} --cursor ${next}`] : []
  ];
}
var handleMediaVersions = commandHandler(async (args, runtime, resolved) => {
  const id = mediaIdArg(args.positionals[2], "media versions");
  const limit = flagString(args.flags, "limit");
  const cursor = flagString(args.flags, "cursor");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const request = async () => limit !== void 0 || cursor !== void 0 ? client.call({ method: "GET", path: versionsPath(id), query: { ...limit !== void 0 ? { limit } : {}, ...cursor !== void 0 ? { cursor } : {} } }) : client.listAll(versionsPath(id), void 0, { cursorParam: "cursor" });
  let response;
  try {
    response = await request();
  } catch (error) {
    throw mediaVersionProblem(error, id);
  }
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: mediaVersionLines(id, response.body).join("\n")
  };
}, true);
var RESTORE_PENDING_SENTENCE = "Screens keep playing the current file until a person approves the restore; they can also reject it or ask for changes. Do not repeat the write: check the decision later.";
var handleMediaRestore = commandHandler(async (args, runtime, resolved) => {
  const id = mediaIdArg(args.positionals[2], "media restore");
  const number = versionNumber(args, "media restore");
  const note = flagString(args.flags, "note");
  const ifMatch = flagString(args.flags, "expect-rev");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await versionCall(client, {
    method: "POST",
    path: `${versionsPath(id)}/${number}/restore`,
    idempotent: true,
    ...ifMatch !== void 0 ? { headers: { "if-match": quotedRevision(ifMatch) } } : {},
    ...note !== void 0 ? { body: { note } } : {}
  }, id);
  const warnings = mediaWarningsOf(response.body?.warnings);
  const pending = pendingReviewOf(response);
  if (pending) {
    return {
      envelope: jsonBody(response, client.requestId, { next: reviewNext(pending.review.id) }, [pendingReviewWarning(pending.review), ...warnings.map(envelopeWarning)]),
      exitCode: ExitCode.Success,
      human: [
        `Restore of version ${number} waiting for review`,
        `review_id: ${pending.review.id}`,
        ...pending.review.subject ? [`subject: media ${plainText(pending.review.subject.name)} (${pending.review.subject.id})`] : [],
        ...typeof pending.review.impact?.screens === "number" ? [`impact: approving changes ${pending.review.impact.screens} screen${pending.review.impact.screens === 1 ? "" : "s"}`] : [],
        `url: ${pending.review.url}`,
        `next: screenrig reviews show ${pending.review.id}`,
        RESTORE_PENDING_SENTENCE,
        ...warnings.map((warning) => `warning: ${envelopeWarning(warning).message}`)
      ].join("\n")
    };
  }
  const revision = response.body?.media?.revision;
  return {
    envelope: jsonBody(response, client.requestId, { next: replaceNext(id) }, warnings.map(envelopeWarning)),
    exitCode: ExitCode.Success,
    human: [
      `Restored version ${number} of ${id} as the current file`,
      ...typeof revision === "number" ? [`revision: ${revision}`] : [],
      `next: screenrig media versions ${id}`,
      ...warnings.map((warning) => `warning: ${envelopeWarning(warning).message}`)
    ].join("\n")
  };
}, true);
var handleMediaVersionDelete = commandHandler(async (args, runtime, resolved) => {
  const id = mediaIdArg(args.positionals[3], "media version delete");
  const number = versionNumber(args, "media version delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await versionCall(client, { method: "DELETE", path: `${versionsPath(id)}/${number}`, idempotent: true }, id);
  return {
    envelope: jsonBody(response, client.requestId, { media_id: id, version: number, deleted: true }),
    exitCode: ExitCode.Success,
    human: `Deleted version ${number} of media ${id}`
  };
}, true);

// dist/media-generate-retry.js
var media_generate_retry_exports = {};
__export(media_generate_retry_exports, {
  clearGenerateRetryState: () => clearGenerateRetryState,
  generateRequestHash: () => generateRequestHash,
  generateRetryState: () => generateRetryState
});
import { createHash as createHash4 } from "node:crypto";
function generateRequestHash(request) {
  return createHash4("sha256").update(JSON.stringify([request.prompt, request.aspect_ratio ?? "", request.quality ?? "", request.tag ?? ""])).digest("hex");
}
async function generateRetryState(options) {
  return withConfigLock(options.resolved.configPath, options.runtime.fs, { sleep: options.runtime.sleep, now: () => options.runtime.now().getTime() }, async () => {
    const stored = await readConfigFile(options.resolved.configPath, options.runtime.fs);
    const current = stored ? projectConfigFor(stored, options.resolved) : void 0;
    if (current)
      assertProjectCredential(current, options.resolved);
    const pending = current?.media_generate;
    const reused = pending !== void 0 && pending.request_hash === options.requestHash && (options.requestedKey === void 0 || options.requestedKey === pending.idempotency_key);
    const idempotencyKey = reused ? pending.idempotency_key : options.requestedKey ?? (options.generateIdempotencyKey ?? newIdempotencyKey)();
    if (!isValidIdempotencyKey(idempotencyKey)) {
      throw usageError("media generate idempotency key is invalid.");
    }
    const state = { idempotency_key: idempotencyKey, request_hash: options.requestHash };
    if (!reused || pending.idempotency_key !== idempotencyKey) {
      await writeConfigAtomic(options.resolved.configPath, withProjectConfig(stored ?? { api_url: options.resolved.apiUrl }, options.resolved, {
        ...current ?? { api_url: options.resolved.apiUrl },
        media_generate: state,
        updated_at: options.runtime.now().toISOString()
      }), options.runtime.fs);
    }
    return { state, reused };
  });
}
async function clearGenerateRetryState(resolved, runtime, idempotencyKey) {
  await withConfigLock(resolved.configPath, runtime.fs, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    const stored = await readConfigFile(resolved.configPath, runtime.fs);
    const current = stored ? projectConfigFor(stored, resolved) : void 0;
    if (current)
      assertProjectCredential(current, resolved);
    if (!current || current.media_generate?.idempotency_key !== idempotencyKey)
      return;
    const { media_generate: _resolvedGeneration, ...rest } = current;
    await writeConfigAtomic(resolved.configPath, withProjectConfig(stored, resolved, rest), runtime.fs);
  });
}

// dist/media-sync.js
var media_sync_exports = {};
__export(media_sync_exports, {
  MEDIA_SYNC_ACCOUNT_ID_PATTERN: () => MEDIA_SYNC_ACCOUNT_ID_PATTERN,
  MEDIA_SYNC_EVERY_MAX_S: () => MEDIA_SYNC_EVERY_MAX_S,
  MEDIA_SYNC_EVERY_MIN_S: () => MEDIA_SYNC_EVERY_MIN_S,
  MEDIA_SYNC_ID_PATTERN: () => MEDIA_SYNC_ID_PATTERN,
  accountLines: () => accountLines,
  handleMediaSyncAccountAdd: () => handleMediaSyncAccountAdd,
  handleMediaSyncAccountAddDropbox: () => handleMediaSyncAccountAddDropbox,
  handleMediaSyncAccountAddGoogleDrive: () => handleMediaSyncAccountAddGoogleDrive,
  handleMediaSyncAccountConnect: () => handleMediaSyncAccountConnect,
  handleMediaSyncAccountDelete: () => handleMediaSyncAccountDelete,
  handleMediaSyncAccountList: () => handleMediaSyncAccountList,
  handleMediaSyncAccountShow: () => handleMediaSyncAccountShow,
  handleMediaSyncAccountTest: () => handleMediaSyncAccountTest,
  handleMediaSyncAccountUpdate: () => handleMediaSyncAccountUpdate,
  handleMediaSyncCreate: () => handleMediaSyncCreate,
  handleMediaSyncCreateDropbox: () => handleMediaSyncCreateDropbox,
  handleMediaSyncCreateGoogleDrive: () => handleMediaSyncCreateGoogleDrive,
  handleMediaSyncDelete: () => handleMediaSyncDelete,
  handleMediaSyncList: () => handleMediaSyncList,
  handleMediaSyncRun: () => handleMediaSyncRun,
  handleMediaSyncShow: () => handleMediaSyncShow,
  handleMediaSyncUpdate: () => handleMediaSyncUpdate,
  mediaSyncAccountId: () => mediaSyncAccountId,
  mediaSyncAccountOption: () => mediaSyncAccountOption,
  mediaSyncAppKey: () => mediaSyncAppKey,
  mediaSyncClientId: () => mediaSyncClientId,
  mediaSyncDriveUrl: () => mediaSyncDriveUrl,
  mediaSyncDropboxUrl: () => mediaSyncDropboxUrl,
  mediaSyncEvery: () => mediaSyncEvery,
  mediaSyncFolderOption: () => mediaSyncFolderOption,
  mediaSyncId: () => mediaSyncId,
  mediaSyncName: () => mediaSyncName,
  mediaSyncProblem: () => mediaSyncProblem,
  mediaSyncTenant: () => mediaSyncTenant,
  mediaSyncUrl: () => mediaSyncUrl,
  syncLines: () => syncLines,
  syncTableLines: () => syncTableLines
});
var ACCOUNTS_PATH = "/api/media-sync-accounts";
var SYNCS_PATH = "/api/media-syncs";
var DROPBOX_CALLBACK_PATH = "/api/dropbox/callback";
var MEDIA_SYNC_ACCOUNT_ID_PATTERN = /^(?:(?:stage|qa|development)_)?msa_[A-Za-z0-9_-]+$/;
var MEDIA_SYNC_ID_PATTERN = /^(?:(?:stage|qa|development)_)?msy_[A-Za-z0-9_-]+$/;
var MEDIA_FOLDER_ID_PATTERN = /^(?:(?:stage|qa|development)_)?mfd_[A-Za-z0-9]{1,64}$/;
var GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var TENANT_DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
var DROPBOX_APP_KEY_PATTERN = /^[A-Za-z0-9]{1,64}$/;
var DRIVE_FOLDER_ID_PATTERN = /^[A-Za-z0-9_-]{1,4096}$/;
var MEDIA_SYNC_EVERY_MIN_S = 300;
var MEDIA_SYNC_EVERY_MAX_S = 86400;
var SECRET_FILE_MAX_BYTES = 8192;
var KEY_FILE_MAX_CHARACTERS = 8192;
var NAME_MAX = 80;
var URL_MAX = 4096;
function mediaSyncAccountId(value, command) {
  if (!value)
    throw usageError(`media sync account ${command} requires <id>.`);
  if (!MEDIA_SYNC_ACCOUNT_ID_PATTERN.test(value)) {
    throw usageError("An account id looks like msa_ followed by letters, digits, - or _.", {
      command: "screenrig media sync account list",
      reason: "List this project's media sync accounts and their ids."
    });
  }
  return value;
}
function mediaSyncId(value, command) {
  if (!value)
    throw usageError(`media sync ${command} requires <id>.`);
  if (!MEDIA_SYNC_ID_PATTERN.test(value)) {
    throw usageError("A sync id looks like msy_ followed by letters, digits, - or _.", {
      command: "screenrig media sync list",
      reason: "List this project's media syncs and their ids."
    });
  }
  return value;
}
function mediaSyncAccountOption(value) {
  if (!MEDIA_SYNC_ACCOUNT_ID_PATTERN.test(value)) {
    throw usageError("--account-id takes a media sync account id (msa_\u2026).", {
      command: "screenrig media sync account list",
      reason: "List this project's media sync accounts and their ids."
    });
  }
  return value;
}
function mediaSyncFolderOption(value) {
  if (!MEDIA_FOLDER_ID_PATTERN.test(value)) {
    throw usageError("--folder-id takes a media folder id (mfd_\u2026).", { command: "screenrig media folder list", reason: "List this project's media folders and their ids." });
  }
  return value;
}
function mediaSyncName(value) {
  const trimmed = value.trim();
  if (!trimmed || [...trimmed].length > NAME_MAX || /[\p{Cc}\p{Cf}]/u.test(value)) {
    throw usageError(`--name must contain 1 to ${NAME_MAX} characters without controls.`);
  }
  return trimmed;
}
function mediaSyncTenant(value) {
  const tenant = value.trim();
  if (["common", "organizations", "consumers"].includes(tenant.toLowerCase())) {
    throw usageError("--tenant-id must be your organization's own tenant: its directory id or primary domain, not common, organizations or consumers.");
  }
  if (!GUID_PATTERN.test(tenant) && !TENANT_DOMAIN_PATTERN.test(tenant)) {
    throw usageError("--tenant-id takes the tenant's directory id (a GUID) or its primary domain, such as contoso.onmicrosoft.com.");
  }
  return tenant;
}
function mediaSyncClientId(value) {
  const client = value.trim();
  if (!GUID_PATTERN.test(client))
    throw usageError("--client-id takes the app registration's application (client) id, a GUID.");
  return client;
}
function isHttpsAddress(text) {
  let address;
  try {
    address = new URL(text);
  } catch {
    address = void 0;
  }
  return address !== void 0 && address.protocol === "https:" && [...text].length <= URL_MAX && !/[\p{Cc}]/u.test(text);
}
function mediaSyncUrl(value) {
  const text = value.trim();
  if (!isHttpsAddress(text))
    throw usageError("--url takes the https address of a SharePoint folder, or its sharing link (Share \u2192 Copy link).");
  return text;
}
function mediaSyncDropboxUrl(value) {
  const text = value.trim();
  const path5 = text.startsWith("/") && [...text].length <= URL_MAX && !/[\p{Cc}]/u.test(text);
  if (!path5 && !isHttpsAddress(text)) {
    throw usageError("--url takes the folder's address in Dropbox (https://www.dropbox.com/home/...), a shared folder link the connected account has added to its Dropbox, or a path that starts with /.");
  }
  return text;
}
function mediaSyncDriveUrl(value) {
  const text = value.trim();
  if (!isHttpsAddress(text) && !DRIVE_FOLDER_ID_PATTERN.test(text)) {
    throw usageError("--url takes the Google Drive folder's address (https://drive.google.com/drive/folders/ID) or its id.");
  }
  return text;
}
function mediaSyncAppKey(value) {
  const key = value.trim();
  if (!DROPBOX_APP_KEY_PATTERN.test(key)) {
    throw usageError("--app-key takes the app key of your own Dropbox app: 1 to 64 letters and digits, shown on its page in the Dropbox App Console.");
  }
  return key;
}
function mediaSyncEvery(value) {
  const text = value.trim();
  const seconds = /^\d+$/.test(text) ? Number(text) : (snoozeDurationMs(text) ?? Number.NaN) / 1e3;
  if (!Number.isInteger(seconds) || seconds < MEDIA_SYNC_EVERY_MIN_S || seconds > MEDIA_SYNC_EVERY_MAX_S) {
    throw usageError("--every takes a duration from 5 minutes to 24 hours, such as 15m, 1h or 6h (or plain seconds, 300 to 86400).");
  }
  return String(seconds);
}
async function readSecret(file, runtime) {
  const text = (await readAuthoringText(file, runtime, SECRET_FILE_MAX_BYTES)).trim();
  const where = file === "-" ? "stdin" : file;
  if (!text)
    throw usageError(`${where} holds no secret.`);
  if (/\s/.test(text))
    throw usageError(`${where} must hold only the client secret's value: one value without spaces or line breaks.`);
  return text;
}
function mediaSyncProblem(error, id) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  if (problem.next)
    return error;
  const withNext = (command, reason) => new CliError({ ...problem, next: { command, reason } }, error.exitCode, error.warnings);
  const account = id !== void 0 && MEDIA_SYNC_ACCOUNT_ID_PATTERN.test(id);
  if (problem.code === "media_sync_source_refused") {
    return withNext(account ? `screenrig media sync account test ${id}` : "screenrig media sync account list", "Fix what the detail says, then test the account and run the command again. Microsoft: the app's Sites.Selected grant on the site, or Files.Read.All, with admin consent, and a current client secret. Dropbox: the connected person must be able to open the folder, and a shared folder link must already be added to their Dropbox. Google Drive: share the folder with the account's service_account_email (Viewer is enough).");
  }
  if (problem.code === "media_sync_source_unavailable") {
    return withNext("screenrig media sync list", "The provider could not be reached. Nothing was changed; run the same command again in a moment.");
  }
  if (problem.code === "dropbox_reconnect_required") {
    return withNext(account ? `screenrig media sync account connect ${id}` : "screenrig media sync account list", "Dropbox no longer honors the account's connection. Make a new link and send it to the person who owns the Dropbox account; they open it signed in to Dropbox. Then run media sync account show until its state is ready.");
  }
  if (problem.code === "dropbox_not_configured") {
    return withNext("screenrig media sync account add dropbox --help", "This server has no screenRIG Dropbox app, so a Dropbox account needs the app key of your own Dropbox app: media sync account add dropbox --name NAME --app-key KEY.");
  }
  if (problem.code === "google_drive_not_configured") {
    return withNext("screenrig media sync account add google-drive --help", "This server has no screenRIG service account, so a Google Drive account needs the JSON key of your own Google Cloud service account: media sync account add google-drive --name NAME --key-file FILE.");
  }
  if (problem.code === "media_sync_sharer_not_member") {
    return withNext(account ? `screenrig media sync account show ${id}` : "screenrig media sync account list", "Share the folder with the account's service_account_email from the Google account of a member of this project whose email is verified, then create the sync again.");
  }
  if (problem.code === "resource_conflict" && account) {
    return withNext("screenrig media sync list", "Delete the syncs the detail names (media sync delete ID), then delete the account.");
  }
  if (problem.code === "revision_conflict" && id !== void 0) {
    return withNext(account ? `screenrig media sync account show ${id}` : `screenrig media sync show ${id}`, "Read the current revision, then run the command again with --expect-rev REVISION if the change still applies.");
  }
  if (problem.code === "not_found" && id !== void 0) {
    return account ? withNext("screenrig media sync account list", "List this project's accounts and their ids. An account belongs to one project.") : withNext("screenrig media sync list", "List this project's syncs and their ids. A sync belongs to one project.");
  }
  return error;
}
async function syncCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw mediaSyncProblem(error, id);
  }
}
var dash = (value) => value && value.length ? value : "-";
function checkLines(checks) {
  return (checks ?? []).map((check) => `  ${!check.ok ? "failed" : check.warn ? "warning" : "ok"} ${check.name}${check.detail ? `: ${check.detail}` : ""}`);
}
var PROVIDER_NAMES = { microsoft365: "Microsoft", dropbox: "Dropbox", google_drive: "Google Drive" };
var providerName = (kind) => PROVIDER_NAMES[kind] ?? kind;
function dropboxPerson(account) {
  const config = account.config ?? {};
  if (!config.display_name && !config.email)
    return account.secret?.set ? "connected" : "not connected";
  return `${config.display_name ?? config.email}${config.display_name && config.email ? ` (${config.email})` : ""}`;
}
function accessLines(account) {
  const config = account.config ?? {};
  if (account.kind === "dropbox") {
    return [
      `dropbox account: ${dropboxPerson(account)}`,
      `app: ${config.app_key ? `your own Dropbox app (app key ${config.app_key})` : "screenRIG's Dropbox app"}`
    ];
  }
  if (account.kind === "google_drive") {
    return [
      `service account: ${dash(config.service_account_email)}`,
      `key: ${account.secret?.set ? `your own service account key${account.secret.hint ? ` (ends ${account.secret.hint})` : ""}` : "none of your own; the account reads through screenRIG's service account"}`
    ];
  }
  if (account.kind !== "microsoft365")
    return [];
  return config.connection_id ? [`connection: ${config.connection_id} (a Microsoft connection signs in; this account holds no secret)`] : [
    `tenant: ${dash(config.tenant_id)}`,
    `client: ${dash(config.client_id)}`,
    `secret: ${account.secret?.set ? `set${account.secret.hint ? ` (ends ${account.secret.hint})` : ""}` : "not set"}`
  ];
}
function accountLines(account) {
  if (!account)
    return [];
  const test = account.last_test;
  return [
    `id: ${account.id}`,
    `name: ${account.name}`,
    `kind: ${account.kind}`,
    ...accessLines(account),
    `state: ${account.state}`,
    `last test: ${test ? `${test.ok ? "ok" : "failed"} at ${test.at}` : "never"}`,
    ...test ? checkLines(test.checks) : [],
    `revision: ${account.revision}`
  ];
}
function connectHintLines(account) {
  if (account?.kind !== "dropbox")
    return [];
  if (account.state === "pending_consent") {
    return ["", `Waiting for the person who owns the Dropbox account to open the link: screenrig media sync account connect ${account.id} makes a new link to send them.`];
  }
  if (account.state === "reconnect_required") {
    return ["", `Dropbox no longer honors the connection: screenrig media sync account connect ${account.id} makes a new link for the person who owns the Dropbox account to open.`];
  }
  return [];
}
function dropboxRedirectUri(apiUrl) {
  return `${new URL(apiUrl).origin}${DROPBOX_CALLBACK_PATH}`;
}
function consentLines(account, apiUrl, ownApp = false) {
  if (!account?.authorize_url)
    return [];
  const provider = providerName(account.kind);
  return [
    "",
    `Connect link, for the person who owns the ${provider} account. Send it to that person only, or open it yourself if that is you: it is the credential of one consent, and works once${account.authorize_expires_at ? ` until ${account.authorize_expires_at}` : ""}.`,
    `authorize_url: ${account.authorize_url}`,
    "",
    `They open it signed in to ${provider}${account.kind === "dropbox" ? " and allow screenRIG read-only access to the files in that Dropbox (files.metadata.read, files.content.read, account_info.read)" : ""}. The CLI never opens a browser.`,
    ...ownApp || account.config?.app_key ? [`This account goes through your own Dropbox app, which must list ${dropboxRedirectUri(apiUrl)} as a redirect URI (Dropbox App Console, the app's Settings, OAuth 2) and have those permissions enabled.`] : [],
    `When they finish, screenrig media sync account show ${account.id} reads state ready. screenrig media sync account connect ${account.id} makes a new link, which replaces this one.`,
    ...account.kind === "dropbox" ? [`Then: screenrig media sync create dropbox --account-id ${account.id} --url FOLDER`] : []
  ];
}
function consentWarnings(account, apiUrl, ownApp = false) {
  if (!account?.authorize_url)
    return [];
  const provider = providerName(account.kind);
  return [
    {
      code: "media_sync_consent_link",
      message: `data.authorize_url is the link of one consent: send it to the person who owns the ${provider} account, who opens it signed in to ${provider}${account.authorize_expires_at ? ` before ${account.authorize_expires_at}` : ""}. screenrig does not save it, and a read of the account never shows it. screenrig media sync account connect ${account.id} makes a new link, which replaces this one.`
    },
    ...ownApp || account.config?.app_key ? [{
      code: "media_sync_redirect_uri",
      message: `The account goes through your own Dropbox app, which must list ${dropboxRedirectUri(apiUrl)} as a redirect URI and have files.metadata.read, files.content.read and account_info.read enabled.`
    }] : []
  ];
}
function driveShareLines(account) {
  const email = account?.config?.service_account_email;
  if (!account || !email)
    return [];
  return [
    "",
    `Share the Google Drive folder with ${email} (Viewer is enough).`,
    account.secret?.set ? "That is your own service account: a folder shared with it syncs." : "That is screenRIG's service account: a folder syncs through it only when a member of this project with a verified email shared it or owns it, so share it from that member's Google account.",
    `Then: screenrig media sync create google-drive --account-id ${account.id} --url FOLDER`
  ];
}
function driveShareWarnings(account) {
  const email = account?.config?.service_account_email;
  if (!account || !email)
    return [];
  return [{
    code: "media_sync_share_folder",
    message: `Share the Google Drive folder with ${email} (Viewer is enough), then run media sync create google-drive. ${account.secret?.set ? "That is your own service account: a folder shared with it syncs." : "That is screenRIG's service account: a folder syncs through it only when a member of this project with a verified email shared it or owns it."}`
  }];
}
function accountSubject(item) {
  const config = item.config ?? {};
  if (item.kind === "dropbox")
    return config.email ?? config.display_name ?? (item.secret?.set ? "connected" : "(not connected)");
  if (item.kind === "google_drive")
    return dash(config.service_account_email);
  return dash(config.tenant_id ?? config.connection_id);
}
function accountSecretCell(item) {
  if (item.kind === "dropbox")
    return "-";
  if (item.config?.connection_id)
    return "via connection";
  if (item.kind === "google_drive" && !item.secret?.set)
    return "screenRIG's";
  return item.secret?.set ? item.secret.hint ? `\u2026${item.secret.hint}` : "set" : "not set";
}
function accountTableLines(items) {
  if (!items.length)
    return ["No media sync accounts"];
  return table(["ID", "NAME", "KIND", "STATE", "ACCOUNT", "SECRET", "TEST"], items.map((item) => [
    item.id,
    item.name,
    item.kind,
    item.state,
    accountSubject(item),
    accountSecretCell(item),
    item.last_test ? item.last_test.ok ? "ok" : "failed" : "never"
  ]));
}
function everyText(seconds) {
  if (seconds % 3600 === 0)
    return `${seconds / 3600}h`;
  if (seconds % 60 === 0)
    return `${seconds / 60}m`;
  return `${seconds}s`;
}
function runLines(run) {
  if (!run)
    return ["last run: not yet"];
  const counts = `${run.added} added, ${run.updated} replaced, ${run.removed} removed${run.pending_delete ? `, ${run.pending_delete} held back` : ""}`;
  const lines = [`last run: ${run.status} at ${run.at} (${counts})`];
  if (run.error)
    lines.push(`  ${run.error.code}: ${run.error.detail}`);
  for (const skipped of run.skipped ?? [])
    lines.push(`  skipped ${skipped.name} (${skipped.reason})${skipped.detail ? `: ${skipped.detail}` : ""}`);
  if (run.skipped_total > (run.skipped?.length ?? 0))
    lines.push(`  and ${run.skipped_total - (run.skipped?.length ?? 0)} more skipped`);
  return lines;
}
function syncLines(sync) {
  if (!sync)
    return [];
  return [
    `id: ${sync.id}`,
    `name: ${sync.name}`,
    `provider: ${sync.provider}`,
    `account: ${sync.account_id}`,
    `source: ${dash(sync.source?.web_url)}`,
    ...sync.source?.path ? [`path: ${sync.source.path}`] : [],
    ...sync.source?.shared_by ? [`shared by: ${sync.source.shared_by} (checked on every run)`] : [],
    `media folder: ${sync.folder_id}`,
    `every: ${everyText(sync.every_s)}`,
    `state: ${sync.state}`,
    `next run: ${sync.next_run_at}`,
    ...runLines(sync.last_run),
    `revision: ${sync.revision}`
  ];
}
function syncTableLines(items) {
  if (!items.length)
    return ["No media syncs"];
  return table(["ID", "NAME", "PROVIDER", "FOLDER", "EVERY", "STATE", "LAST RUN"], items.map((item) => [
    item.id,
    item.name,
    item.provider,
    item.folder_id,
    everyText(item.every_s),
    item.state,
    item.last_run ? item.last_run.status : "not yet"
  ]));
}
var FOLDER_HINT = 'Play it with a folder selector: {"by": "folder", "folder_id": "FOLDER"}.';
function listBody(response) {
  const items = response.body?.items;
  return Array.isArray(items) ? items : [];
}
async function allPages(client, path5, query) {
  const items = [];
  let response = await syncCall(client, { method: "GET", path: path5, ...query ? { query } : {} });
  for (let pages = 0; pages < 1e3; pages++) {
    items.push(...listBody(response));
    const cursor = response.body?.next_cursor ?? void 0;
    if (!cursor)
      break;
    response = await syncCall(client, { method: "GET", path: path5, query: { ...query ?? {}, cursor } });
  }
  return { items, response };
}
function revisionHeader(args) {
  const revision = flagString(args.flags, "expect-rev");
  return revision ? { "if-match": quotedRevision(revision) } : void 0;
}
var handleMediaSyncAccountAdd = commandHandler(async (args, runtime, resolved) => {
  const name = flagString(args.flags, "name");
  const tenant = flagString(args.flags, "tenant-id");
  const client = flagString(args.flags, "client-id");
  const secretFile = flagString(args.flags, "secret-file");
  const connectionId = flagString(args.flags, "connection-id");
  if (name === void 0)
    throw usageError("media sync account add microsoft365 requires --name.");
  let body;
  if (connectionId !== void 0) {
    if (tenant !== void 0 || client !== void 0 || secretFile !== void 0) {
      throw usageError("--connection-id replaces --tenant-id, --client-id and --secret-file: the Microsoft connection holds them.");
    }
    body = { kind: "microsoft365", name: mediaSyncName(name), config: { connection_id: connectionId } };
  } else {
    if (tenant === void 0 || client === void 0 || secretFile === void 0) {
      throw usageError("media sync account add microsoft365 requires --connection-id, or --tenant-id, --client-id and --secret-file.");
    }
    body = { kind: "microsoft365", name: mediaSyncName(name), config: { tenant_id: mediaSyncTenant(tenant), client_id: mediaSyncClientId(client) }, secret: await readSecret(secretFile, runtime) };
  }
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "POST", path: ACCOUNTS_PATH, idempotent: true, body });
  const created = response.body;
  return {
    envelope: jsonBody(response, api.requestId),
    exitCode: ExitCode.Success,
    human: [`Created media sync account ${created?.id ?? ""}`.trimEnd(), ...accountLines(created), "", `Next: screenrig media sync account test ${created?.id ?? "ID"}`].join("\n")
  };
});
var handleMediaSyncAccountAddDropbox = commandHandler(async (args, runtime, resolved) => {
  const name = flagString(args.flags, "name");
  const appKey = flagString(args.flags, "app-key");
  if (name === void 0)
    throw usageError("media sync account add dropbox requires --name.");
  const body = { kind: "dropbox", name: mediaSyncName(name), ...appKey !== void 0 ? { config: { app_key: mediaSyncAppKey(appKey) } } : {} };
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "POST", path: ACCOUNTS_PATH, idempotent: true, body });
  const created = response.body;
  return {
    envelope: jsonBody(response, api.requestId, void 0, consentWarnings(created, resolved.apiUrl, appKey !== void 0)),
    exitCode: ExitCode.Success,
    human: [`Created media sync account ${created?.id ?? ""}`.trimEnd(), ...accountLines(created), ...consentLines(created, resolved.apiUrl, appKey !== void 0)].join("\n")
  };
});
var handleMediaSyncAccountAddGoogleDrive = commandHandler(async (args, runtime, resolved) => {
  const name = flagString(args.flags, "name");
  const keyFile = flagString(args.flags, "key-file");
  if (name === void 0)
    throw usageError("media sync account add google-drive requires --name.");
  const body = { kind: "google_drive", name: mediaSyncName(name), ...keyFile !== void 0 ? { secret: await readServiceAccountKey(keyFile, runtime, KEY_FILE_MAX_CHARACTERS) } : {} };
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "POST", path: ACCOUNTS_PATH, idempotent: true, body });
  const created = response.body;
  return {
    envelope: jsonBody(response, api.requestId, void 0, driveShareWarnings(created)),
    exitCode: ExitCode.Success,
    human: [`Created media sync account ${created?.id ?? ""}`.trimEnd(), ...accountLines(created), ...driveShareLines(created)].join("\n")
  };
});
var handleMediaSyncAccountConnect = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncAccountId(args.positionals[4], "connect");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "POST", path: `${ACCOUNTS_PATH}/${id}/connect`, idempotent: true }, id);
  const connecting = response.body;
  return {
    envelope: jsonBody(response, api.requestId, void 0, consentWarnings(connecting, resolved.apiUrl)),
    exitCode: ExitCode.Success,
    human: [
      `New connect link for media sync account ${id}. Any earlier link no longer works; a connected account stays connected until the new consent completes.`,
      ...accountLines(connecting),
      ...consentLines(connecting, resolved.apiUrl)
    ].join("\n")
  };
});
var handleMediaSyncAccountList = commandHandler(async (args, runtime, resolved) => {
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const { items, response } = await allPages(api, ACCOUNTS_PATH);
  return {
    envelope: jsonBody({ ...response, body: { items, next_cursor: null } }, api.requestId),
    exitCode: ExitCode.Success,
    human: [`Media sync accounts (${items.length})`, ...accountTableLines(items)].join("\n")
  };
});
var handleMediaSyncAccountShow = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncAccountId(args.positionals[4], "show");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "GET", path: `${ACCOUNTS_PATH}/${id}` }, id);
  const shown = response.body;
  return { envelope: jsonBody(response, api.requestId), exitCode: ExitCode.Success, human: ["Media sync account", ...accountLines(shown), ...connectHintLines(shown)].join("\n") };
});
var handleMediaSyncAccountUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncAccountId(args.positionals[4], "update");
  const name = flagString(args.flags, "name");
  const tenant = flagString(args.flags, "tenant-id");
  const client = flagString(args.flags, "client-id");
  const secretFile = flagString(args.flags, "secret-file");
  const keyFile = flagString(args.flags, "key-file");
  if (name === void 0 && tenant === void 0 && client === void 0 && secretFile === void 0 && keyFile === void 0) {
    throw usageError("media sync account update requires --name, --tenant-id, --client-id, --secret-file or --key-file.");
  }
  const config = { ...tenant !== void 0 ? { tenant_id: mediaSyncTenant(tenant) } : {}, ...client !== void 0 ? { client_id: mediaSyncClientId(client) } : {} };
  const body = {
    ...name !== void 0 ? { name: mediaSyncName(name) } : {},
    ...Object.keys(config).length ? { config } : {},
    ...secretFile !== void 0 ? { secret: await readSecret(secretFile, runtime) } : keyFile !== void 0 ? { secret: await readServiceAccountKey(keyFile, runtime, KEY_FILE_MAX_CHARACTERS) } : {}
  };
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "PATCH", path: `${ACCOUNTS_PATH}/${id}`, idempotent: true, body, headers: revisionHeader(args) }, id);
  return {
    envelope: jsonBody(response, api.requestId),
    exitCode: ExitCode.Success,
    human: [`Updated media sync account ${id}`, ...accountLines(response.body)].join("\n")
  };
});
var handleMediaSyncAccountTest = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncAccountId(args.positionals[4], "test");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "POST", path: `${ACCOUNTS_PATH}/${id}/test`, idempotent: true }, id);
  const report = response.body;
  return {
    envelope: jsonBody(response, api.requestId),
    exitCode: ExitCode.Success,
    human: [
      `Media sync account ${id}: ${report?.ok ? "ok" : "failed"}`,
      ...checkLines(report?.checks),
      ...report?.ok ? ["", "This checks the account's sign-in or connection and the permissions it holds. It does not judge a site's grant or a folder: media sync create reads the folder you name."] : []
    ].join("\n")
  };
});
var handleMediaSyncAccountDelete = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncAccountId(args.positionals[4], "delete");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "DELETE", path: `${ACCOUNTS_PATH}/${id}`, idempotent: true, headers: revisionHeader(args) }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? api.requestId }),
    exitCode: ExitCode.Success,
    human: `Deleted media sync account ${id}.`
  };
});
function createHandler(provider, word, address) {
  return commandHandler(async (args, runtime, resolved) => {
    const accountId = flagString(args.flags, "account-id");
    const url = flagString(args.flags, "url");
    if (accountId === void 0 || url === void 0)
      throw usageError(`media sync create ${word} requires --account-id and --url.`);
    const folderId = flagString(args.flags, "folder-id");
    const every = flagString(args.flags, "every");
    const name = flagString(args.flags, "name");
    const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
    const response = await syncCall(api, {
      method: "POST",
      path: SYNCS_PATH,
      idempotent: true,
      body: {
        provider,
        account_id: mediaSyncAccountOption(accountId),
        url: address(url),
        ...folderId !== void 0 ? { folder_id: mediaSyncFolderOption(folderId) } : {},
        ...every !== void 0 ? { every: Number(mediaSyncEvery(every)) } : {},
        ...name !== void 0 ? { name: mediaSyncName(name) } : {}
      }
    }, accountId);
    const created = response.body;
    return {
      envelope: jsonBody(response, api.requestId),
      exitCode: ExitCode.Success,
      human: [
        `Created media sync ${created?.id ?? ""}`.trimEnd(),
        ...syncLines(created),
        "",
        `The first run starts within about 30 seconds. ${FOLDER_HINT.replace("FOLDER", created?.folder_id ?? "FOLDER")}`,
        `Next: screenrig media sync show ${created?.id ?? "ID"}`
      ].join("\n")
    };
  });
}
var handleMediaSyncCreate = createHandler("sharepoint", "sharepoint", mediaSyncUrl);
var handleMediaSyncCreateDropbox = createHandler("dropbox", "dropbox", mediaSyncDropboxUrl);
var handleMediaSyncCreateGoogleDrive = createHandler("google_drive", "google-drive", mediaSyncDriveUrl);
var handleMediaSyncList = commandHandler(async (args, runtime, resolved) => {
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const { items, response } = await allPages(api, SYNCS_PATH);
  return {
    envelope: jsonBody({ ...response, body: { items, next_cursor: null } }, api.requestId),
    exitCode: ExitCode.Success,
    human: [`Media syncs (${items.length})`, ...syncTableLines(items)].join("\n")
  };
});
var handleMediaSyncShow = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncId(args.positionals[3], "show");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "GET", path: `${SYNCS_PATH}/${id}` }, id);
  const sync = response.body;
  return {
    envelope: jsonBody(response, api.requestId),
    exitCode: ExitCode.Success,
    human: ["Media sync", ...syncLines(sync), ...sync ? ["", FOLDER_HINT.replace("FOLDER", sync.folder_id)] : []].join("\n")
  };
});
var handleMediaSyncUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncId(args.positionals[3], "update");
  const name = flagString(args.flags, "name");
  const every = flagString(args.flags, "every");
  const folderId = flagString(args.flags, "folder-id");
  const pause = flagBool(args.flags, "pause");
  const resume = flagBool(args.flags, "resume");
  if (name === void 0 && every === void 0 && folderId === void 0 && !pause && !resume) {
    throw usageError("media sync update requires --name, --every, --folder-id, --pause or --resume.");
  }
  const body = {
    ...name !== void 0 ? { name: mediaSyncName(name) } : {},
    ...every !== void 0 ? { every: Number(mediaSyncEvery(every)) } : {},
    ...folderId !== void 0 ? { folder_id: mediaSyncFolderOption(folderId) } : {},
    ...pause ? { state: "paused" } : {},
    ...resume ? { state: "active" } : {}
  };
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "PATCH", path: `${SYNCS_PATH}/${id}`, idempotent: true, body, headers: revisionHeader(args) }, id);
  return {
    envelope: jsonBody(response, api.requestId),
    exitCode: ExitCode.Success,
    human: [`Updated media sync ${id}`, ...syncLines(response.body)].join("\n")
  };
});
var handleMediaSyncRun = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncId(args.positionals[3], "run");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "POST", path: `${SYNCS_PATH}/${id}/run`, idempotent: true }, id);
  return {
    envelope: jsonBody(response, api.requestId),
    exitCode: ExitCode.Success,
    human: [`Media sync ${id} is due now; it runs within about 30 seconds.`, "", `Next: screenrig media sync show ${id}`].join("\n")
  };
});
var handleMediaSyncDelete = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncId(args.positionals[3], "delete");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "DELETE", path: `${SYNCS_PATH}/${id}`, idempotent: true, headers: revisionHeader(args) }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? api.requestId }),
    exitCode: ExitCode.Success,
    human: `Deleted media sync ${id}. Its media and folder stay; nothing is imported or removed from now on.`
  };
});

// dist/kv-webhooks.js
var kv_webhooks_exports = {};
__export(kv_webhooks_exports, {
  KV_WEBHOOKS_MAX: () => KV_WEBHOOKS_MAX,
  KV_WEBHOOK_DESCRIPTION_MAX_BYTES: () => KV_WEBHOOK_DESCRIPTION_MAX_BYTES,
  KV_WEBHOOK_ID_PATTERN: () => KV_WEBHOOK_ID_PATTERN,
  KV_WEBHOOK_MAPPING_MAX_BYTES: () => KV_WEBHOOK_MAPPING_MAX_BYTES,
  KV_WEBHOOK_SECRET_PATTERN: () => KV_WEBHOOK_SECRET_PATTERN,
  KV_WEBHOOK_SIGNING_SECRET_PATTERN: () => KV_WEBHOOK_SIGNING_SECRET_PATTERN,
  cardWebhookExample: () => cardWebhookExample,
  cardWebhookLines: () => cardWebhookLines,
  cardWebhookSigningWarning: () => cardWebhookSigningWarning,
  cardWebhookTableLines: () => cardWebhookTableLines,
  kvWebhookDeliveriesLimit: () => kvWebhookDeliveriesLimit,
  kvWebhookDeliveryTableLines: () => kvWebhookDeliveryTableLines,
  kvWebhookDescription: () => kvWebhookDescription,
  kvWebhookExample: () => kvWebhookExample,
  kvWebhookId: () => kvWebhookId,
  kvWebhookKey: () => kvWebhookKey,
  kvWebhookLines: () => kvWebhookLines,
  kvWebhookMapping: () => kvWebhookMapping,
  kvWebhookProblem: () => kvWebhookProblem,
  kvWebhookSecretWarning: () => kvWebhookSecretWarning,
  kvWebhookTableLines: () => kvWebhookTableLines,
  kvWebhookTargetFlag: () => kvWebhookTargetFlag,
  kvWebhooksPath: () => kvWebhooksPath
});
var KV_WEBHOOK_ID_PATTERN = /^(?:(?:stage|qa|development)_)?kvw_[A-Za-z0-9_-]+$/;
var KV_WEBHOOK_SECRET_PATTERN = /^srkw_[A-Za-z0-9_-]{43}$/;
var KV_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$/;
var KV_WEBHOOK_ID_MAX_BYTES = 200;
var KV_WEBHOOKS_MAX = 20;
var KV_WEBHOOK_DESCRIPTION_MAX_BYTES = 200;
var KV_WEBHOOK_SIGNING_SECRET_PATTERN = /^whsec_[A-Za-z0-9_-]{43}$/;
var KV_WEBHOOK_MAPPING_MAX_BYTES = 64 * 1024;
function kvWebhookTargetFlag(target) {
  return target.kind === "app" ? `--app-id ${target.id}` : `--card ${target.id}`;
}
function kvWebhooksPath(target) {
  const id = encodeURIComponent(target.id);
  return target.kind === "app" ? `/api/applications/${id}/kv-webhooks` : `/api/cards/${id}/kv-webhooks`;
}
function kvWebhookId(value, command, target) {
  if (!value)
    throw usageError(`kv webhook ${command} requires <webhook_id>.`);
  if (Buffer.byteLength(value) > KV_WEBHOOK_ID_MAX_BYTES || !KV_WEBHOOK_ID_PATTERN.test(value)) {
    throw usageError("A K/V webhook id looks like kvw_ followed by letters, digits, - or _.", {
      command: `screenrig kv webhook list ${kvWebhookTargetFlag(target)}`,
      reason: target.kind === "app" ? "List this application's K/V webhooks and their ids." : "List this card's webhooks and their ids."
    });
  }
  return value;
}
function kvWebhookDeliveriesLimit(value) {
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 100)
    throw usageError("--limit must be a whole number from 1 to 100.");
  return value;
}
function kvWebhookMapping(text) {
  if (Buffer.byteLength(text) > KV_WEBHOOK_MAPPING_MAX_BYTES)
    throw usageError("--map is larger than 64 KiB.");
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw usageError("--map must hold a JSON object: the template that builds the card's data document.", {
      command: "screenrig kv webhook create --help",
      reason: 'Example template: {"title":"{{body.alert.title}}","body":"{{body.alert.message}}"}.'
    });
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw usageError("--map must be a JSON object: the template that builds the card's data document.");
  }
  return parsed;
}
function kvWebhookKey(value) {
  if (!value)
    throw usageError("kv webhook create requires <key>.");
  if (!KV_KEY_PATTERN.test(value)) {
    throw usageError("<key> must be 1 to 256 characters of letters, digits and . _ : / -, starting with a letter or digit.");
  }
  return value;
}
function kvWebhookDescription(value) {
  const trimmed = value.trim();
  if (Buffer.byteLength(trimmed) > KV_WEBHOOK_DESCRIPTION_MAX_BYTES || new RegExp("\\p{Cc}", "u").test(trimmed)) {
    throw usageError(`--description must be at most ${KV_WEBHOOK_DESCRIPTION_MAX_BYTES} bytes after trimming, without control characters.`);
  }
  return trimmed;
}
function kvWebhookSecretWarning(id, target, action, signing = false) {
  if (target.kind === "card")
    return cardWebhookSecretWarning(id, target, action, signing);
  const applicationId = target.id;
  const send = "The sending system posts the key's new value to data.url with the header Authorization: Bearer <data.secret> (or HTTP Basic with data.id as the username and data.secret as the password); the raw body becomes the value and its Content-Type the content type.";
  return {
    code: "kv_webhook_secret_shown_once",
    message: action === "create" ? `data.secret is this webhook's secret and is shown only in this answer. Store it in the sending system now; screenrig does not save it in its config, logs, or recovery state. ${send} After an interrupted or ambiguous create, rerun the identical command within 24 hours to get this same answer and secret back. Replace a lost secret with screenrig kv webhook rotate-secret ${id} --app-id ${applicationId}.` : `data.secret is the webhook's new secret and is shown only in this answer. The previous secret stopped working: put the new one in the sending system now; screenrig does not save it. ${send} After an interrupted or ambiguous rotation, rerun the identical command within 24 hours to get this same secret back.`
  };
}
function kvWebhookProblem(error, target, id) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  const flag = kvWebhookTargetFlag(target);
  const owner = target.kind === "app" ? "application" : "card";
  if (problem.code === "kv_webhook_limit_reached") {
    return new CliError({
      ...problem,
      detail: `This ${owner} already has the maximum of ${KV_WEBHOOKS_MAX} ${target.kind === "app" ? "K/V webhooks" : "webhooks"}. Nothing was created.`,
      next: problem.next ?? {
        command: `screenrig kv webhook list ${flag}`,
        reason: `Delete a webhook you no longer need with screenrig kv webhook delete ID ${flag}, then rerun create.`
      }
    }, error.exitCode, error.warnings);
  }
  if (problem.next)
    return error;
  if (problem.code === "card_not_found") {
    return new CliError({ ...problem, next: { command: "screenrig card list", reason: "Find the card's current ID (crd_...), then rerun with --card." } }, error.exitCode, error.warnings);
  }
  if (problem.code === "not_found") {
    if (target.kind === "card") {
      return new CliError({
        ...problem,
        next: { command: `screenrig kv webhook list ${flag}`, reason: "List this card's webhooks; a deleted webhook does not come back." }
      }, error.exitCode, error.warnings);
    }
    return new CliError({
      ...problem,
      next: id ? { command: `screenrig kv webhook list ${flag}`, reason: "List this application's K/V webhooks; a deleted webhook does not come back." } : { command: "screenrig app list", reason: "Find the application's current ID, then rerun with --app-id." }
    }, error.exitCode, error.warnings);
  }
  return error;
}
function kvWebhookExample(url, secret) {
  return `curl -X POST "${url}" -H "Authorization: Bearer ${secret}" -H "Content-Type: application/json" --data '{"message":"Hello"}'`;
}
function when(value, label) {
  return value === void 0 || value === "" ? [] : [`${label}: ${value}`];
}
function kvWebhookLines(webhook) {
  if (!webhook)
    return [];
  return [
    `id: ${webhook.id}`,
    `application_id: ${webhook.application_id}`,
    `key: ${webhook.key}`,
    ...when(webhook.description, "description"),
    `url: ${webhook.url}`,
    ...when(webhook.created_at, "created_at"),
    ...when(webhook.last_used_at, "last_used_at")
  ];
}
function table2(header, rows) {
  const widths = header.map((cell, index) => Math.max(cell.length, ...rows.map((row) => (row[index] ?? "").length)));
  const render = (row) => row.map((cell, index) => cell.padEnd(widths[index])).join("  ").trimEnd();
  return [render(header), ...rows.map(render)];
}
function kvWebhookTableLines(items) {
  if (!items.length)
    return ["No K/V webhooks"];
  return table2(["ID", "KEY", "LAST_USED", "URL", "DESCRIPTION"], items.map((item) => [
    item.id ?? "",
    item.key ?? "",
    item.last_used_at ?? "-",
    item.url ?? "",
    item.description ?? ""
  ]));
}
function cardWebhookSecretWarning(id, target, action, signing) {
  const flag = kvWebhookTargetFlag(target);
  const send = "The sending system posts a JSON or form body to data.url with the header Authorization: Bearer <data.secret> (or HTTP Basic with data.id as the username and data.secret as the password); the webhook's mapping, when it has one, builds the card's document from the body, and the card's own validation decides whether it is shown.";
  return {
    code: "kv_webhook_secret_shown_once",
    message: action === "create" ? `data.secret is this webhook's secret${signing ? " and data.signing_secret its signing secret" : ""}, shown only in this answer. Store ${signing ? "them" : "it"} in the sending system now; screenrig does not save ${signing ? "them" : "it"} in its config, logs, or recovery state. ${send} After an interrupted or ambiguous create, rerun the identical command within 24 hours to get this same answer back. Replace a lost secret with screenrig kv webhook rotate-secret ${id} ${flag}.` : `data.secret is the webhook's new secret and is shown only in this answer. The previous secret stopped working: put the new one in the sending system now; screenrig does not save it. ${send} After an interrupted or ambiguous rotation, rerun the identical command within 24 hours to get this same secret back.`
  };
}
function cardWebhookSigningWarning(id, target) {
  return {
    code: "kv_webhook_signing_secret_shown_once",
    message: `data.signing_secret is shown only in this answer. Store it in the sending system now; screenrig does not save it. Every post then carries ScreenRig-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>" keyed with the signing secret>, and a post whose timestamp is more than five minutes from the server's clock, or whose signature does not match, is refused like a wrong secret. Replace a lost signing secret with screenrig kv webhook rotate-secret ${id} ${kvWebhookTargetFlag(target)} --signing.`
  };
}
function cardWebhookExample(url, secret, signing) {
  const bearer = secret ? `Bearer ${secret}` : "Bearer <secret>";
  const signed = signing ? ` -H "ScreenRig-Signature: t=<unix seconds>,v1=<hmac>"` : "";
  return `curl -X POST "${url}" -H "Authorization: ${bearer}"${signed} -H "Content-Type: application/json" --data '{"message":"Hello"}'`;
}
function mappingSummary(webhook) {
  return webhook.mapping === null || webhook.mapping === void 0 ? "(none: the posted object is the document)" : `${Object.keys(webhook.mapping).length} top-level member${Object.keys(webhook.mapping).length === 1 ? "" : "s"}`;
}
function cardWebhookLines(webhook) {
  if (!webhook)
    return [];
  return [
    `id: ${webhook.id}`,
    `card_id: ${webhook.card_id}`,
    ...when(webhook.description, "description"),
    `mapping: ${mappingSummary(webhook)}`,
    ...when(webhook.key_template, "key_template"),
    `enabled: ${webhook.enabled}`,
    `signing: ${webhook.signing}`,
    ...verifyLines(webhook.verify, webhook.handshake),
    `url: ${webhook.url}`,
    ...when(webhook.created_at, "created_at"),
    ...when(webhook.last_used_at, "last_used_at")
  ];
}
function cardWebhookTableLines(items) {
  if (!items.length)
    return ["No card webhooks"];
  const vendors = items.some((item) => item.verify || item.handshake);
  return table2(["ID", "ENABLED", "SIGNING", ...vendors ? ["VERIFY", "HANDSHAKE"] : [], "MAPPING", "KEY_TEMPLATE", "LAST_USED", "URL", "DESCRIPTION"], items.map((item) => [
    item.id ?? "",
    String(item.enabled),
    String(item.signing),
    ...vendors ? [item.verify?.vendor ?? "-", item.handshake ?? "-"] : [],
    item.mapping === null || item.mapping === void 0 ? "no" : "yes",
    item.key_template || "-",
    item.last_used_at ?? "-",
    item.url ?? "",
    item.description ?? ""
  ]));
}
function kvWebhookDeliveryTableLines(items) {
  if (!items.length)
    return ["No deliveries in the last seven days"];
  const files = items.some((item) => item.files !== void 0);
  return table2(["AT", "OUTCOME", "REASON", "STATUS", "BYTES", "REVISION", ...files ? ["FILES"] : [], "DETAIL"], items.map((item) => [
    item.at ?? "",
    item.outcome ?? "",
    item.reason ?? "-",
    String(item.status ?? ""),
    String(item.bytes ?? ""),
    item.revision === void 0 ? "-" : String(item.revision),
    ...files ? [item.files === void 0 ? "-" : String(item.files)] : [],
    item.detail ?? ""
  ]));
}

// dist/source-presets.js
var source_presets_exports = {};
__export(source_presets_exports, {
  SOURCE_PRESETS_PATH: () => SOURCE_PRESETS_PATH,
  SOURCE_PRESET_NAME_PATTERN: () => SOURCE_PRESET_NAME_PATTERN,
  handleSourcePresets: () => handleSourcePresets,
  presetCardTypes: () => presetCardTypes,
  presetSettingValue: () => presetSettingValue,
  sourcePresetLines: () => sourcePresetLines,
  sourcePresetName: () => sourcePresetName,
  sourcePresetOption: () => sourcePresetOption,
  sourcePresetTableLines: () => sourcePresetTableLines
});
var SOURCE_PRESETS_PATH = "/api/source-presets";
var SOURCE_PRESET_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
function sourcePresetName(value) {
  if (!SOURCE_PRESET_NAME_PATTERN.test(value)) {
    throw usageError("A preset name is lower-case words joined by hyphens, such as slack-channel.", { command: "screenrig source presets", reason: "List the presets and their names." });
  }
  return value;
}
function sourcePresetOption(value) {
  return sourcePresetName(value);
}
function presetSettingValue(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return text;
  }
  return parsed === null || typeof parsed === "object" || typeof parsed === "string" ? parsed : text;
}
function presetCardTypes(preset) {
  const cards = preset.cards ?? [];
  return [...cards.filter((card) => card.default), ...cards.filter((card) => !card.default)].map((card) => card.type);
}
function durationText(seconds) {
  if (seconds % 86400 === 0)
    return `${seconds / 86400}d`;
  if (seconds % 3600 === 0)
    return `${seconds / 3600}h`;
  if (seconds % 60 === 0)
    return `${seconds / 60}m`;
  return `${seconds}s`;
}
function sourcePresetTableLines(items) {
  if (!items.length)
    return ["No source presets"];
  return table(["NAME", "TITLE", "CARD", "CATEGORY"], items.map((item) => [item.name, item.title, presetCardTypes(item).join(", "), item.category]));
}
function fieldLines(fields, indent) {
  return fields.flatMap((field) => {
    const detail = [
      field.example !== void 0 ? `example: ${field.example}` : "",
      field.default !== void 0 ? `default: ${field.default}` : "",
      field.pattern ? `pattern: ${field.pattern}` : "",
      field.max_length ? `at most ${field.max_length} characters` : ""
    ].filter(Boolean);
    return [
      `${indent}${field.name} (${field.type}${field.required ? ", required" : ""}): ${field.label}`,
      ...field.help ? [`${indent}  ${field.help}`] : [],
      ...detail.length ? [`${indent}  ${detail.join("; ")}`] : [],
      ...field.options?.length ? [`${indent}  one of: ${field.options.map((option) => option.value === option.label ? option.value : `${option.value} (${option.label})`).join(", ")}`] : [],
      ...field.type === "list" ? [`${indent}  a JSON array of ${field.min_items ?? 0} to ${field.max_items ?? "any number of"} items, each an object with:`, ...fieldLines(field.fields ?? [], `${indent}    `)] : []
    ];
  });
}
function shellWord(value) {
  return /^[A-Za-z0-9_.\/:@%+=,-]+$/.test(value) ? value : `'${value.replaceAll("'", "'\\''")}'`;
}
function exampleSet(field) {
  if (field.type === "list") {
    const item = Object.fromEntries((field.fields ?? []).filter((member) => member.required).map((member) => [member.name, member.example ?? "VALUE"]));
    return `--set ${field.name}=${shellWord(JSON.stringify([item]))}`;
  }
  return `--set ${field.name}=${shellWord(field.example ?? "VALUE")}`;
}
function sourcePresetLines(preset) {
  if (!preset)
    return [];
  const cards = presetCardTypes(preset);
  const required = preset.fields.filter((field) => field.required);
  const neededSecrets = preset.secrets.filter((secret) => secret.required);
  return [
    `name: ${preset.name}`,
    `title: ${preset.title}`,
    `category: ${preset.category}`,
    `description: ${preset.description}`,
    `kind: ${preset.kind}`,
    `cards: ${cards.map((card, index) => index === 0 && cards.length > 1 ? `${card} (the one it is made for)` : card).join(", ")}; --card names an instance of ${cards.length === 1 ? "that card" : "one of them"} (card create)`,
    `refresh: every ${durationText(preset.refresh_seconds)} (at least ${durationText(preset.min_refresh_seconds)}); the card keeps its last good data for ${durationText(preset.stale_after_seconds)} when the source cannot refresh`,
    `data: ${preset.attribution?.text ?? ""}${preset.attribution?.terms ? ` Terms: ${preset.attribution.terms}` : ""}`,
    ...preset.docs ? [`docs: https://screenrig.ai${preset.docs.startsWith("/") ? preset.docs : `/${preset.docs}`}`] : [],
    "",
    ...preset.fields.length ? ["Fields (--set FIELD=VALUE, or --settings JSON; a list takes a JSON array):", ...fieldLines(preset.fields, "  ")] : ["Fields: none"],
    "",
    ...preset.secrets.length ? ["Secrets (--secret NAME=@FILE, or NAME=- for stdin):", ...preset.secrets.flatMap((secret) => [
      `  ${secret.name} (${secret.required ? "required" : "optional"}): ${secret.label}`,
      ...secret.help ? [`    ${secret.help}`] : [],
      ...secret.how_to_get ? [`    how to get it: ${secret.how_to_get}`] : []
    ])] : ["Secrets: none; the data is public."],
    "",
    `Next: screenrig source test --preset ${preset.name} --card crd_CARD${required.map((field) => ` ${exampleSet(field)}`).join("")}${neededSecrets.map((secret) => ` --secret ${secret.name}=@FILE`).join("")}`,
    "Then the same command as source create, with --name."
  ];
}
function presetProblem(error, name) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  if (error.problem.code === "not_found" && name !== void 0) {
    return new CliError({ ...error.problem, next: { command: "screenrig source presets", reason: "List the presets and their names." } }, error.exitCode, error.warnings);
  }
  return error;
}
async function presetCall(client, path5, name) {
  try {
    return await client.call({ method: "GET", path: path5 });
  } catch (error) {
    throw presetProblem(error, name);
  }
}
var handleSourcePresets = commandHandler(async (args, runtime, resolved) => {
  const name = args.positionals[2] !== void 0 ? sourcePresetName(args.positionals[2]) : void 0;
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (name === void 0) {
    const response2 = await presetCall(client, SOURCE_PRESETS_PATH);
    const items = response2.body?.items;
    const list = Array.isArray(items) ? items : [];
    return {
      envelope: jsonBody(response2, client.requestId),
      exitCode: ExitCode.Success,
      human: [`Source presets (${list.length})`, ...sourcePresetTableLines(list), "", "Next: screenrig source presets NAME shows a preset's fields, its secrets and how to get them."].join("\n")
    };
  }
  const response = await presetCall(client, `${SOURCE_PRESETS_PATH}/${name}`, name);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Source preset", ...sourcePresetLines(response.body)].join("\n")
  };
});

// dist/sources.js
var sources_exports = {};
__export(sources_exports, {
  SOURCE_ID_PATTERN: () => SOURCE_ID_PATTERN,
  SOURCE_KINDS: () => SOURCE_KINDS,
  SOURCE_REFRESH_MAX_S: () => SOURCE_REFRESH_MAX_S,
  SOURCE_REFRESH_MIN_S: () => SOURCE_REFRESH_MIN_S,
  SOURCE_STALE_MAX_S: () => SOURCE_STALE_MAX_S,
  SOURCE_STALE_MIN_S: () => SOURCE_STALE_MIN_S,
  accumulate: () => accumulate,
  handleSourceCreate: () => handleSourceCreate,
  handleSourceDelete: () => handleSourceDelete,
  handleSourceList: () => handleSourceList,
  handleSourceRefresh: () => handleSourceRefresh,
  handleSourceRooms: () => handleSourceRooms,
  handleSourceShow: () => handleSourceShow,
  handleSourceTest: () => handleSourceTest,
  handleSourceUpdate: () => handleSourceUpdate,
  refreshText: () => refreshText,
  secretPairCheck: () => secretPairCheck,
  setMembers: () => setMembers,
  setPairCheck: () => setPairCheck,
  setValue: () => setValue,
  sourceId: () => sourceId,
  sourceLines: () => sourceLines,
  sourceListLines: () => sourceListLines,
  sourceName: () => sourceName,
  sourceProblem: () => sourceProblem,
  sourceRefreshOption: () => sourceRefreshOption,
  sourceRefreshSeconds: () => sourceRefreshSeconds,
  sourceRoomsLines: () => sourceRoomsLines,
  sourceStaleAfterOption: () => sourceStaleAfterOption,
  sourceStaleAfterSeconds: () => sourceStaleAfterSeconds,
  sourceTableLines: () => sourceTableLines,
  sourceTestLines: () => sourceTestLines,
  unsetSecretCheck: () => unsetSecretCheck
});
var SOURCE_ID_PATTERN = /^(?:(?:stage|qa|development)_)?src_[A-Za-z0-9_-]+$/;
var SOURCE_KINDS = ["ics", "sheets", "csv", "json", "microsoft365", "google_calendar", "square", "shopify", "momentus", "toast"];
var CONNECTION_KINDS = ["microsoft365", "google_calendar"];
var SOURCE_REFRESH_MIN_S = 30;
var SOURCE_REFRESH_MAX_S = 86400;
var SOURCE_STALE_MIN_S = 60;
var SOURCE_STALE_MAX_S = 604800;
var SECRET_NAME_PATTERN = /^[a-z0-9][A-Za-z0-9_.-]{0,63}$/;
var SECRET_NAME_RULE = "A secret name starts with a lower-case letter or digit, then letters, digits, . _ and -, up to 64 characters, such as calendar_url.lobby or header.X-Api-Key.";
var INPUT_MAX_BYTES = 1 << 20;
var SOURCES_PATH = "/api/sources";
function sourceId(value, command) {
  if (!value)
    throw usageError(`source ${command} requires <source_id>.`);
  if (!SOURCE_ID_PATTERN.test(value)) {
    throw usageError("A source id looks like src_ followed by letters, digits, - or _.", {
      command: "screenrig source list",
      reason: "List this project's data sources and their ids."
    });
  }
  return value;
}
function sourceName(value) {
  const trimmed = value.trim();
  if (!trimmed || [...trimmed].length > 80 || new RegExp("\\p{Cc}", "u").test(trimmed)) {
    throw usageError("--name must be 1 to 80 characters of text.");
  }
  return trimmed;
}
function durationSeconds(value) {
  const match = /^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(value.trim());
  return match && value.trim() !== "" ? Number(match[1] ?? 0) * 86400 + Number(match[2] ?? 0) * 3600 + Number(match[3] ?? 0) * 60 + Number(match[4] ?? 0) : NaN;
}
function sourceStaleAfterSeconds(value) {
  if (value.trim().toLowerCase() === "none")
    return null;
  const seconds = durationSeconds(value);
  if (!Number.isSafeInteger(seconds) || seconds < SOURCE_STALE_MIN_S || seconds > SOURCE_STALE_MAX_S) {
    throw usageError("--stale-after takes 1m to 7d, such as 30m, 2h or 1d, or none.");
  }
  return seconds;
}
function sourceStaleAfterOption(value) {
  sourceStaleAfterSeconds(value);
  return value;
}
function sourceRefreshSeconds(value) {
  const seconds = /\d+d/.test(value) ? NaN : durationSeconds(value);
  if (!Number.isSafeInteger(seconds) || seconds < SOURCE_REFRESH_MIN_S || seconds > SOURCE_REFRESH_MAX_S) {
    throw usageError("--refresh takes 30s to 24h, such as 30s, 5m, 1h or 1h30m.");
  }
  return seconds;
}
function sourceRefreshOption(value) {
  sourceRefreshSeconds(value);
  return value;
}
function accumulate(check) {
  return (value, previous) => {
    check(value);
    const list = previous === void 0 ? [] : JSON.parse(previous);
    return JSON.stringify([...list, value]);
  };
}
function accumulated(flags, name) {
  const raw = flagString(flags, name);
  return raw === void 0 ? [] : JSON.parse(raw);
}
function setPairCheck(value) {
  const at = value.indexOf("=");
  if (at < 1)
    throw usageError("--set takes KEY=VALUE, such as days=14 or time_zone=America/Vancouver.");
}
function secretPairCheck(value) {
  const at = value.indexOf("=");
  if (at < 1)
    throw usageError("--secret takes NAME=VALUE, NAME=@FILE or NAME=-, such as calendar_url.lobby=@lobby.url.");
  const name = value.slice(0, at);
  if (!SECRET_NAME_PATTERN.test(name))
    throw usageError(SECRET_NAME_RULE);
  if (value.slice(at + 1) === "")
    throw usageError(`--secret ${name}= has no value; use NAME=@FILE or NAME=- to read it, or --unset-secret ${name} to remove it.`);
}
function unsetSecretCheck(value) {
  if (!SECRET_NAME_PATTERN.test(value))
    throw usageError(SECRET_NAME_RULE);
}
function setValue(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
var Inputs = class {
  runtime;
  stdin;
  constructor(runtime) {
    this.runtime = runtime;
  }
  async text(option, file) {
    if (file === "-") {
      if (this.stdin !== void 0)
        throw usageError(`${option} - cannot read stdin: another option already does. Give one option stdin and the others a file.`);
      this.stdin = option;
    }
    return readAuthoringText(file, this.runtime, INPUT_MAX_BYTES);
  }
};
async function configFrom(source, inputs) {
  const trimmed = source.trim();
  const text = trimmed === "-" ? await inputs.text("--settings", "-") : trimmed.startsWith("@") ? await inputs.text("--settings", trimmed.slice(1)) : source;
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw usageError("--settings is not valid JSON. Give a JSON object, @FILE or - for stdin.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw usageError("--settings must be a JSON object.");
  return parsed;
}
function setMembers(pairs, read = setValue) {
  const members = /* @__PURE__ */ Object.create(null);
  for (const pair of pairs) {
    const at = pair.indexOf("=");
    const key = pair.slice(0, at);
    if (Object.hasOwn(members, key))
      throw usageError(`--set ${key} is given twice.`);
    members[key] = read(pair.slice(at + 1));
  }
  return { ...members };
}
async function secretsFrom(pairs, unset, inputs) {
  const secrets = {};
  for (const pair of pairs) {
    const at = pair.indexOf("=");
    const name = pair.slice(0, at);
    const raw = pair.slice(at + 1);
    if (Object.hasOwn(secrets, name))
      throw usageError(`--secret ${name} is given twice.`);
    const value = raw === "-" ? await inputs.text(`--secret ${name}=-`, "-") : raw.startsWith("@") ? await inputs.text(`--secret ${name}=@FILE`, raw.slice(1)) : raw;
    const clean = value.trim();
    if (!clean)
      throw usageError(`The value for --secret ${name} is empty.`);
    secrets[name] = clean;
  }
  for (const name of unset) {
    if (Object.hasOwn(secrets, name))
      throw usageError(`${name} is both set with --secret and removed with --unset-secret.`);
    secrets[name] = null;
  }
  return Object.keys(secrets).length ? secrets : void 0;
}
function setPairs(args) {
  const connection = flagString(args.flags, "connection-id");
  return [...accumulated(args.flags, "set"), ...connection !== void 0 ? [`connection_id=${connection}`] : []];
}
async function mergedConfig(args, inputs, saved) {
  const given = flagString(args.flags, "settings");
  const pairs = setPairs(args);
  if (given === void 0 && !pairs.length)
    return void 0;
  const base = given !== void 0 ? await configFrom(given, inputs) : await saved();
  return { ...base, ...setMembers(pairs) };
}
async function presetSettings(args, inputs) {
  const given = flagString(args.flags, "settings");
  return { ...given !== void 0 ? await configFrom(given, inputs) : {}, ...setMembers(accumulated(args.flags, "set"), presetSettingValue) };
}
async function savedEdit(args, inputs, read) {
  const given = flagString(args.flags, "settings");
  const pairs = setPairs(args);
  if (given === void 0 && !pairs.length)
    return {};
  const saved = await read();
  if (typeof saved.preset === "string" && saved.preset !== "") {
    if (flagString(args.flags, "connection-id") !== void 0)
      throw usageError("--connection-id applies to a microsoft365 or google_calendar source; this source is made from a preset.");
    return { settings: { ...given !== void 0 ? await configFrom(given, inputs) : {}, ...setMembers(pairs, presetSettingValue) } };
  }
  const base = given !== void 0 ? await configFrom(given, inputs) : saved.config ?? {};
  return { config: { ...base, ...setMembers(pairs) }, ...given === void 0 ? { readRevision: saved.revision } : {} };
}
async function sourceCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw sourceProblem(error, id);
  }
}
function revisionHeaders(revision) {
  return revision === void 0 ? void 0 : { "if-match": quotedRevision(revision) };
}
function namedSecret(problem) {
  for (const entry of problem.errors) {
    const field = entry?.field;
    if (typeof field === "string" && field.startsWith("secrets."))
      return field.slice("secrets.".length);
  }
  return void 0;
}
function namedSource(problem) {
  for (const entry of problem.errors) {
    const detail = entry?.detail;
    const match = typeof detail === "string" ? /\b((?:(?:stage|qa|development)_)?src_[A-Za-z0-9_-]+)/.exec(detail) : null;
    if (match)
      return match[1];
  }
  return void 0;
}
function sourceProblem(error, id) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  if (problem.next)
    return error;
  const withNext = (command, reason) => new CliError({ ...problem, next: { command, reason } }, error.exitCode, error.warnings);
  switch (problem.code) {
    case "source_target_taken": {
      const owner = namedSource(problem);
      return withNext(owner ? `screenrig source show ${owner}` : "screenrig source list", "One source writes one card. Change or delete the source that has this card, or point this source at another card. Nothing was created.");
    }
    case "source_target_unsupported":
      return withNext("screenrig card list", "List this project's cards. The detail names the card types this kind of source can fill; point the source at one of those.");
    case "source_secret_required": {
      const name = namedSecret(problem);
      return id && name ? withNext(`screenrig source update ${id} --secret ${name}=@FILE`, `Enter ${name} again from a file (or - for stdin); a secret entered for one address or account is not carried to another.`) : withNext("screenrig help source create", name ? `Enter ${name} with --secret ${name}=@FILE (or - for stdin).` : "Enter each secret the kind needs with --secret NAME=@FILE.");
    }
    case "source_limit_reached":
      return withNext("screenrig source list", "An organization has at most 200 data sources across its projects. Delete one with screenrig source delete SOURCE_ID, then rerun create. Nothing was created.");
    case "source_has_no_rooms":
      return withNext("screenrig source list", "Only a source that reads a booking system's rooms (kind momentus) has a room mapping. Pick one of that kind.");
    case "source_busy":
      return withNext(id ? `screenrig source show ${id}` : "screenrig source list", "A scheduled sync is running. Wait for the retry interval, then refresh again; the sync updates the status on its own.");
    case "revision_conflict":
      return id ? withNext(`screenrig source show ${id}`, "Read the current revision, then rerun with --expect-rev REVISION if the change still applies.") : error;
    case "not_found":
      return id ? withNext("screenrig source list", "List this project's data sources; a deleted source does not come back.") : error;
    case "invalid_request":
      return problem.errors.some((entry) => entry?.field === "config") ? withNext(id ? `screenrig source show ${id}` : "screenrig source presets", "If this source is made from a preset, change its fields with --set FIELD=VALUE (or --settings): source show names its preset, and source presets NAME its fields. A config belongs to a source that has no preset.") : error;
    default:
      return error;
  }
}
function clip(text, width) {
  const chars = [...text];
  return chars.length > width ? `${chars.slice(0, width - 1).join("")}\u2026` : text;
}
function refreshText(seconds) {
  if (seconds % 3600 === 0)
    return `${seconds / 3600}h`;
  if (seconds >= 3600)
    return `${Math.floor(seconds / 3600)}h ${Math.round(seconds % 3600 / 60)}m`;
  if (seconds % 60 === 0)
    return `${seconds / 60}m`;
  return `${seconds}s`;
}
function statsText(stats) {
  return Object.entries(stats ?? {}).map(([name, value]) => `${name}=${value}`).join(", ");
}
function errorText(error) {
  return `${error.code}: ${error.message} (${error.at})`;
}
function sourceLines(source) {
  if (!source)
    return [];
  const status = source.status;
  const secrets = Object.entries(source.secrets ?? {});
  return [
    `id: ${source.id}`,
    `name: ${source.name}`,
    `kind: ${source.kind}`,
    ...source.preset ? [`preset: ${source.preset}`] : [],
    `card_id: ${source.target?.card_id}`,
    `enabled: ${source.enabled}`,
    `refresh: ${refreshText(source.refresh_seconds)}`,
    `stale_after: ${source.stale_after_seconds === null || source.stale_after_seconds === void 0 ? "none (the last good data stays until the next refresh)" : refreshText(source.stale_after_seconds)}`,
    `revision: ${source.revision}`,
    `state: ${status.state}`,
    ...status.stale ? ["stale: true (the data has expired on screens; pages that depend on it have fallen back)"] : [],
    ...status.data_expires_at ? [`data_expires_at: ${status.data_expires_at}`] : [],
    ...status.last_attempt_at ? [`last_attempt_at: ${status.last_attempt_at}`] : [],
    ...status.last_success_at ? [`last_success_at: ${status.last_success_at}`] : [],
    ...status.last_change_at ? [`last_change_at: ${status.last_change_at}`] : [],
    ...status.next_run_at ? [`next_run_at: ${status.next_run_at}`] : [],
    `failures: ${status.failures}`,
    ...status.error ? [`error: ${errorText(status.error)}`] : [],
    ...Object.keys(status.stats ?? {}).length ? [`stats: ${statsText(status.stats)}`] : [],
    ...status.warnings?.length ? ["warnings:", ...status.warnings.map((warning) => `  - ${warning}`)] : [],
    ...secrets.length ? ["secrets:", ...secrets.map(([name, view]) => `  ${name}: ${view.hint}`)] : [],
    ...source.preset && source.settings ? [`settings: ${clip(JSON.stringify(source.settings), 400)}`] : [],
    `config: ${clip(JSON.stringify(source.config ?? {}), 400)}`
  ];
}
function sourceTableLines(items) {
  if (!items.length)
    return ["No data sources"];
  return table(["ID", "NAME", "KIND", "CARD", "STATE", "LAST OK", "NEXT", "ERROR"], items.map((item) => [
    item.id,
    clip(item.name, 30),
    item.kind,
    item.target?.card_id ?? "",
    item.status.state,
    item.status.last_success_at ?? "",
    item.status.next_run_at ?? "",
    item.status.error?.code ?? ""
  ]));
}
var PREVIEW_LINES = 60;
function sourceTestLines(result) {
  if (!result)
    return [];
  const rendered = JSON.stringify(result.document ?? {}, null, 2).split("\n");
  return [
    result.valid ? "The card accepts this document." : `The card refuses this document at ${result.validation_error?.path || "the document"}: ${result.validation_error?.reason ?? "invalid"}`,
    `fetched_at: ${result.fetched_at}`,
    ...result.request ? [
      `request: ${result.request.method} ${result.request.url}${result.request.pages > 1 ? ` (${result.request.pages} pages read)` : ""}`,
      ...result.request.headers?.length ? [`  headers sent: ${result.request.headers.join(", ")} (names only)`] : [],
      ...result.request.body ? [`  body: ${clip(result.request.body, 200)}`] : []
    ] : [],
    ...Object.keys(result.stats ?? {}).length ? [`stats: ${statsText(result.stats)}`] : [],
    ...result.warnings?.length ? ["warnings:", ...result.warnings.map((warning) => `  - ${warning}`)] : [],
    "document:",
    ...rendered.slice(0, PREVIEW_LINES).map((line) => `  ${line}`),
    ...rendered.length > PREVIEW_LINES ? [`  \u2026 ${rendered.length - PREVIEW_LINES} more lines (the JSON envelope has the whole document)`] : []
  ];
}
function sourceListLines(page) {
  const items = Array.isArray(page?.items) ? page.items : [];
  const next = typeof page?.next_cursor === "string" && page.next_cursor ? page.next_cursor : void 0;
  return [`Data sources (${items.length})`, ...sourceTableLines(items), ...next ? [`next: screenrig source list --after ${next}`] : []];
}
var handleSourceList = commandHandler(async (args, runtime, resolved) => {
  const after = flagString(args.flags, "after");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await sourceCall(client, { method: "GET", path: SOURCES_PATH, query: after !== void 0 ? { after } : {} });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: sourceListLines(response.body).join("\n")
  };
});
var handleSourceShow = commandHandler(async (args, runtime, resolved) => {
  const id = sourceId(args.positionals[2], "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await sourceCall(client, { method: "GET", path: `${SOURCES_PATH}/${id}` }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Data source", ...sourceLines(response.body)].join("\n")
  };
});
var handleSourceCreate = commandHandler(async (args, runtime, resolved) => {
  const inputs = new Inputs(runtime);
  const refresh = flagString(args.flags, "refresh");
  const staleAfter = flagString(args.flags, "stale-after");
  const kind = flagString(args.flags, "kind");
  const preset = flagString(args.flags, "preset");
  if (kind === void 0 === (preset === void 0))
    throw usageError("source create takes --kind, or --preset NAME for a ready-made configuration (screenrig source presets), and not both.");
  const connection = flagString(args.flags, "connection-id");
  if (connection !== void 0 && preset !== void 0)
    throw usageError("--connection-id applies to a microsoft365 or google_calendar source, not to a preset.");
  if (connection !== void 0 && (kind === void 0 || !CONNECTION_KINDS.includes(kind))) {
    throw usageError("--connection-id applies to a microsoft365 or google_calendar source: it reads through a project connection (screenrig connection list) instead of credentials of its own.");
  }
  const members = preset !== void 0 ? { preset, settings: await presetSettings(args, inputs) } : { kind, config: await mergedConfig(args, inputs, async () => ({})) ?? {} };
  const secrets = await secretsFrom(accumulated(args.flags, "secret"), [], inputs);
  const body = {
    name: sourceName(flagString(args.flags, "name") ?? ""),
    ...members,
    target: { card_id: flagString(args.flags, "card") },
    ...secrets ? { secrets } : {},
    ...refresh !== void 0 ? { refresh_seconds: sourceRefreshSeconds(refresh) } : {},
    ...staleAfter !== void 0 ? { stale_after_seconds: sourceStaleAfterSeconds(staleAfter) } : {},
    ...flagBool(args.flags, "disabled") ? { enabled: false } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await sourceCall(client, { method: "POST", path: SOURCES_PATH, idempotent: true, body });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Created data source", ...sourceLines(response.body)].join("\n")
  };
});
var handleSourceUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = sourceId(args.positionals[2], "update");
  const inputs = new Inputs(runtime);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const name = flagString(args.flags, "name");
  const card = flagString(args.flags, "card");
  const refresh = flagString(args.flags, "refresh");
  const staleAfter = flagString(args.flags, "stale-after");
  const expect = flagString(args.flags, "expect-rev");
  const edit = await savedEdit(args, inputs, async () => (await sourceCall(client, { method: "GET", path: `${SOURCES_PATH}/${id}` }, id)).body);
  const readRevision = edit.readRevision;
  const secrets = await secretsFrom(accumulated(args.flags, "secret"), accumulated(args.flags, "unset-secret"), inputs);
  const body = {
    ...name !== void 0 ? { name: sourceName(name) } : {},
    ...card !== void 0 ? { target: { card_id: card } } : {},
    ...edit.config !== void 0 ? { config: edit.config } : {},
    ...edit.settings !== void 0 ? { settings: edit.settings } : {},
    ...secrets ? { secrets } : {},
    ...refresh !== void 0 ? { refresh_seconds: sourceRefreshSeconds(refresh) } : {},
    ...staleAfter !== void 0 ? { stale_after_seconds: sourceStaleAfterSeconds(staleAfter) } : {},
    ...flagBool(args.flags, "enable") ? { enabled: true } : {},
    ...flagBool(args.flags, "disable") ? { enabled: false } : {}
  };
  if (!Object.keys(body).length) {
    throw usageError("source update requires at least one change: --name, --card, --settings, --set, --connection-id, --secret, --unset-secret, --refresh, --stale-after, --enable or --disable.");
  }
  const response = await sourceCall(client, {
    method: "PATCH",
    path: `${SOURCES_PATH}/${id}`,
    idempotent: true,
    body,
    headers: revisionHeaders(expect ?? (readRevision !== void 0 ? String(readRevision) : void 0)),
    // A merge derives its guard from a fresh read, so a rerun fingerprints differently.
    ...readRevision !== void 0 ? { recoverySupersede: JSON.stringify(["source update", id]) } : {}
  }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [`Updated data source ${id}`, ...sourceLines(response.body)].join("\n")
  };
});
var handleSourceTest = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  const kind = flagString(args.flags, "kind");
  const card = flagString(args.flags, "card");
  const preset = flagString(args.flags, "preset");
  const connection = flagString(args.flags, "connection-id");
  if (id !== void 0) {
    sourceId(id, "test");
    if (preset !== void 0)
      throw usageError("--preset describes a source that is not saved: a saved source already has its preset, and --set changes its fields for this preview.");
  } else if (card === void 0 || kind === void 0 && preset === void 0) {
    throw usageError("source test takes a saved <source_id>, or --kind and --card (--preset NAME instead of --kind) to preview a source that is not saved.");
  }
  if (connection !== void 0 && preset !== void 0)
    throw usageError("--connection-id applies to a microsoft365 or google_calendar source, not to a preset.");
  if (connection !== void 0 && kind !== void 0 && !CONNECTION_KINDS.includes(kind)) {
    throw usageError("--connection-id applies to a microsoft365 or google_calendar source: it reads through a project connection (screenrig connection list) instead of credentials of its own.");
  }
  const inputs = new Inputs(runtime);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let edit;
  if (preset !== void 0)
    edit = { settings: await presetSettings(args, inputs) };
  else if (id === void 0)
    edit = { config: await mergedConfig(args, inputs, async () => ({})) };
  else
    edit = await savedEdit(args, inputs, async () => (await sourceCall(client, { method: "GET", path: `${SOURCES_PATH}/${id}` }, id)).body);
  const secrets = await secretsFrom(accumulated(args.flags, "secret"), [], inputs);
  const body = {
    ...id !== void 0 ? { source_id: id } : {},
    ...kind !== void 0 ? { kind } : {},
    ...preset !== void 0 ? { preset } : {},
    ...card !== void 0 ? { target: { card_id: card } } : {},
    ...edit.config !== void 0 ? { config: edit.config } : {},
    ...edit.settings !== void 0 ? { settings: edit.settings } : {},
    ...secrets ? { secrets } : {}
  };
  const response = await sourceCall(client, { method: "POST", path: `${SOURCES_PATH}/test`, body }, id);
  const result = response.body;
  const warnings = result && !result.valid ? [{ code: "source_document_refused", message: `The card refuses this document at ${result.validation_error?.path || "the document"}: ${result.validation_error?.reason ?? "invalid"}. Nothing was written; fix the config or the card and test again.` }] : [];
  return {
    envelope: jsonBody(response, client.requestId, void 0, warnings),
    exitCode: ExitCode.Success,
    human: ["Preview (nothing was saved or written)", ...sourceTestLines(result)].join("\n")
  };
});
var handleSourceRefresh = commandHandler(async (args, runtime, resolved) => {
  const id = sourceId(args.positionals[2], "refresh");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await sourceCall(client, { method: "POST", path: `${SOURCES_PATH}/${id}/refresh`, timeout_ms: 75e3 }, id);
  const source = response.body;
  const failed = source?.status.state === "error";
  return {
    envelope: jsonBody(response, client.requestId, void 0, failed && source?.status.error ? [{ code: "source_sync_failed", message: `The sync failed: ${source.status.error.message} The card keeps its last good document.` }] : []),
    exitCode: ExitCode.Success,
    human: [failed ? `Synced data source ${id}: failed` : `Synced data source ${id}`, ...sourceLines(source)].join("\n")
  };
});
function sourceRoomsLines(report) {
  if (!report)
    return [];
  const summary = report.summary;
  const lines = [
    `source_id: ${report.source_id}`,
    ...report.rooms_as_of ? [`rooms_as_of: ${report.rooms_as_of}`] : [],
    ...report.room_key_prefix ? [`rooms: screens name a room in the ${report.room_field} field; a card's data key is ${report.room_key_prefix}{screen.field.${report.room_field}}`] : [],
    ...report.area_key_prefix ? [`areas: screens name an area in the ${report.area_field} field; a card's data key is ${report.area_key_prefix}{screen.field.${report.area_field}}`] : [],
    `rooms ${summary.rooms} (${summary.unmapped_rooms} no screen shows), areas ${summary.areas} (${summary.unmapped_areas} no screen shows), screens ${summary.screens} (${summary.missing_screens} without a value, ${summary.unknown_screens} naming no room or area)`,
    ...report.warnings.length ? ["warnings:", ...report.warnings.map((warning) => `  - ${warning}`)] : []
  ];
  const unmappedRooms = report.rooms.filter((room) => room.status === "unmapped");
  if (unmappedRooms.length) {
    lines.push("", "Rooms no screen shows", ...table(["KEY", "NAME", "CODE", "AREA"], unmappedRooms.map((room) => [room.key, clip(room.name ?? "", 30), room.code ?? "", room.area ?? ""])));
  }
  const unmappedAreas = report.areas.filter((area) => area.status === "unmapped");
  if (unmappedAreas.length) {
    lines.push("", "Areas no screen shows", ...table(["KEY", "NAME", "ROOMS"], unmappedAreas.map((area) => [area.key, clip(area.name, 30), String(area.rooms)])));
  }
  const problems = report.screens.filter((screen) => screen.status !== "mapped");
  if (problems.length) {
    lines.push("", "Screens to fix", ...table(["SCREEN", "NAME", "FIELD", "VALUE", "PROBLEM", "SUGGESTION"], problems.map((screen) => [
      screen.id,
      clip(screen.name, 30),
      screen.field,
      screen.value ?? "",
      screen.status === "missing" ? "no value" : "no such " + screen.kind,
      screen.suggestion ?? ""
    ])));
  }
  if (!unmappedRooms.length && !unmappedAreas.length && !problems.length)
    lines.push("", "Every room is shown and every screen names one.");
  return lines;
}
var handleSourceRooms = commandHandler(async (args, runtime, resolved) => {
  const id = sourceId(args.positionals[2], "rooms");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await sourceCall(client, { method: "GET", path: `${SOURCES_PATH}/${id}/rooms` }, id);
  const report = response.body;
  const warnings = [];
  if (report && report.summary.unmapped_rooms > 0)
    warnings.push({ code: "source_rooms_unmapped", message: `${report.summary.unmapped_rooms} room(s) of the source are shown by no screen.` });
  if (report && report.summary.missing_screens + report.summary.unknown_screens > 0)
    warnings.push({ code: "source_screens_unmapped", message: `${report.summary.missing_screens + report.summary.unknown_screens} screen(s) read a room or area and have no room the source offers. Fix them with screen update SCREEN_ID --field NAME=VALUE.` });
  return {
    envelope: jsonBody(response, client.requestId, void 0, warnings),
    exitCode: ExitCode.Success,
    human: ["Room mapping", ...sourceRoomsLines(report)].join("\n")
  };
});
var handleSourceDelete = commandHandler(async (args, runtime, resolved) => {
  const id = sourceId(args.positionals[2], "delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await sourceCall(client, {
    method: "DELETE",
    path: `${SOURCES_PATH}/${id}`,
    idempotent: true,
    headers: revisionHeaders(flagString(args.flags, "expect-rev"))
  }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: `Deleted data source ${id}. The card keeps the last document the source wrote.`
  };
});

export {
  limits_exports,
  SDK_PROTOCOL_VERSION,
  sdk_injection_exports,
  archive_exports,
  paths_exports,
  walk_exports,
  inline_exports,
  packDirectory,
  pack_exports,
  handleMediaReplace,
  handleMediaVersions,
  handleMediaRestore,
  handleMediaVersionDelete,
  media_versions_exports,
  generateRequestHash,
  generateRetryState,
  clearGenerateRetryState,
  media_generate_retry_exports,
  mediaSyncAccountOption,
  mediaSyncFolderOption,
  mediaSyncName,
  mediaSyncTenant,
  mediaSyncClientId,
  mediaSyncUrl,
  mediaSyncDropboxUrl,
  mediaSyncDriveUrl,
  mediaSyncAppKey,
  mediaSyncEvery,
  handleMediaSyncAccountAdd,
  handleMediaSyncAccountAddDropbox,
  handleMediaSyncAccountAddGoogleDrive,
  handleMediaSyncAccountConnect,
  handleMediaSyncAccountList,
  handleMediaSyncAccountShow,
  handleMediaSyncAccountUpdate,
  handleMediaSyncAccountTest,
  handleMediaSyncAccountDelete,
  handleMediaSyncCreate,
  handleMediaSyncCreateDropbox,
  handleMediaSyncCreateGoogleDrive,
  handleMediaSyncList,
  handleMediaSyncShow,
  handleMediaSyncUpdate,
  handleMediaSyncRun,
  handleMediaSyncDelete,
  media_sync_exports,
  KV_WEBHOOK_ID_PATTERN,
  KV_WEBHOOK_SECRET_PATTERN,
  KV_WEBHOOK_SIGNING_SECRET_PATTERN,
  KV_WEBHOOK_MAPPING_MAX_BYTES,
  kvWebhookTargetFlag,
  kvWebhooksPath,
  kvWebhookId,
  kvWebhookDeliveriesLimit,
  kvWebhookMapping,
  kvWebhookKey,
  kvWebhookDescription,
  kvWebhookSecretWarning,
  kvWebhookProblem,
  kvWebhookExample,
  kvWebhookLines,
  kvWebhookTableLines,
  cardWebhookSigningWarning,
  cardWebhookExample,
  cardWebhookLines,
  cardWebhookTableLines,
  kvWebhookDeliveryTableLines,
  kv_webhooks_exports,
  sourcePresetOption,
  handleSourcePresets,
  source_presets_exports,
  SOURCE_KINDS,
  sourceName,
  sourceStaleAfterOption,
  sourceRefreshOption,
  accumulate,
  setPairCheck,
  secretPairCheck,
  unsetSecretCheck,
  handleSourceList,
  handleSourceShow,
  handleSourceCreate,
  handleSourceUpdate,
  handleSourceTest,
  handleSourceRefresh,
  handleSourceRooms,
  handleSourceDelete,
  sources_exports
};
