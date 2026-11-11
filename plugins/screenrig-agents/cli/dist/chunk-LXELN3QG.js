import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  DEFAULT_ARCHIVE_LIMITS
} from "./chunk-UD3J3FNQ.js";
import {
  readAsset
} from "./chunk-4QJFIFQH.js";
import {
  processSettings
} from "./chunk-P3D5NU6C.js";
import {
  CliError,
  ExitCode,
  makeProblem
} from "./chunk-JP4OQPAN.js";

// dist/pack/paths.js
import path from "node:path";
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
      regex += "\\".concat(ch);
      continue;
    }
    regex += ch ?? "";
  }
  const source = anchored ? "^".concat(regex, "(?:/.*)?$") : "(^|/)".concat(regex, "(?:/.*)?$");
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
  // SSH private keys: id_ followed by the key type.
  ...["rsa", "dsa", "ecdsa", "ed25519"].map((type) => "id_".concat(type)),
  "credentials.json",
  "secrets.json",
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
  return posixNormalize(path.relative(root, absolute));
}

// dist/adapters/sdk-injection.js
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path2 from "node:path";

// dist/pack/limits.js
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
var SDK_PROTOCOL_VERSION = "1";
var SDK_RUNTIME_PATH = "_screenrig/runtime.js";
var SDK_MARKER = 'data-screenrig-sdk="'.concat(SDK_PROTOCOL_VERSION, '"');
var SDK_SCRIPT_TAG = '<script src="./'.concat(SDK_RUNTIME_PATH, '" ').concat(SDK_MARKER, "></script>");
function attribute(tag, name) {
  const match = tag.match(new RegExp("\\b".concat(name, "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))"), "i"));
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
  const tagEnd = "(?:[^\"'<>]|\"[^\"]*\"|'[^']*')*>";
  const prefix = new RegExp("(?:\\s+|<!--[\\s\\S]*?-->|<!doctype\\b".concat(tagEnd) + "|<(?:html|head|meta|base|link)(?=[\\s/>])".concat(tagEnd) + "|<(title|style|noscript)(?=[\\s/>])".concat(tagEnd, "[\\s\\S]*?<\\/\\1\\s*>)"), "iy");
  let offset = 0;
  while (prefix.exec(html))
    offset = prefix.lastIndex;
  return "".concat(html.slice(0, offset)).concat(SDK_SCRIPT_TAG, "\n").concat(html.slice(offset));
}
var ArchiveSdkInjector = class {
  runtime;
  constructor(runtime) {
    this.runtime = runtime;
  }
  async inject(entries, request = {}) {
    const version = request.sdk_version ?? SDK_PROTOCOL_VERSION;
    if (version !== SDK_PROTOCOL_VERSION) {
      throw packError("sdk_version_incompatible", "Requested SDK protocol ".concat(version, "; this release supports ").concat(SDK_PROTOCOL_VERSION));
    }
    if (entries.some((entry) => entry.path.toLocaleLowerCase("en-US") === SDK_RUNTIME_PATH.toLocaleLowerCase("en-US"))) {
      throw packError("sdk_path_collision", "".concat(SDK_RUNTIME_PATH, " is reserved for ScreenRig archive injection"));
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
      runtime = configured ? await readFile(path2.resolve(configured)) : readAsset("screenrig.runtime.js");
    } catch {
      const where = configured ? path2.resolve(configured) : "assets/screenrig.runtime.js";
      throw packError("sdk_runtime_missing", "Pinned SDK runtime is missing at ".concat(where, "; reinstall the ScreenRig CLI from a verified release"));
    }
    return new ArchiveSdkInjector(runtime).inject(entries, request);
  }
};
var defaultSdkInjector = new ReleaseLocalSdkInjector();

// dist/pack/archive.js
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
    throw packError("path_too_long", "USTAR field overflow: ".concat(value));
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
  throw packError("path_too_long", "Path cannot be encoded in ustar: ".concat(posixPath));
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
  const sumOct = "".concat(sum.toString(8).padStart(6, "0"), "\0 ");
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

// dist/pack/walk.js
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
      throw packError("unsupported_entry", "Unable to stat ".concat(posixPath || ".", ": ").concat(err instanceof Error ? err.message : "unknown error"));
    }
    const isDir = st.isDirectory();
    if (posixPath) {
      if (hasTraversal(posixPath) || posixPath.startsWith("/") || hasIllegalChars(posixPath)) {
        throw packError("path_traversal", "Rejected path ".concat(posixPath));
      }
      if (utf8Bytes(posixPath) > limits.application_path_bytes) {
        throw packError("path_too_long", "Path exceeds ".concat(limits.application_path_bytes, " bytes: ").concat(posixPath));
      }
      if (pathDepth(posixPath) > limits.application_path_depth) {
        throw packError("path_too_deep", "Path exceeds depth ".concat(limits.application_path_depth, ": ").concat(posixPath));
      }
      if (isBuiltinIgnored(posixPath, isDir) || extraIgnore(posixPath, isDir)) {
        return;
      }
      if (seenNormalized.has(posixPath)) {
        throw packError("duplicate_path", "Duplicate normalized path: ".concat(posixPath));
      }
      const folded = caseFold(posixPath);
      if (seenFolded.has(folded)) {
        throw packError("duplicate_path", "Duplicate case-folded path: ".concat(posixPath));
      }
      seenNormalized.add(posixPath);
      seenFolded.add(folded);
    }
    if (st.isSymbolicLink()) {
      throw packError("symlink_rejected", "Symlinks are not allowed: ".concat(posixPath || "."));
    }
    if (st.isFIFO()) {
      throw packError("fifo_rejected", "FIFOs are not allowed: ".concat(posixPath || "."));
    }
    if (st.isSocket()) {
      throw packError("socket_rejected", "Sockets are not allowed: ".concat(posixPath || "."));
    }
    if (st.isCharacterDevice() || st.isBlockDevice()) {
      throw packError("device_rejected", "Device files are not allowed: ".concat(posixPath || "."));
    }
    if (!st.isFile() && !st.isDirectory()) {
      throw packError("unsupported_entry", "Unsupported filesystem entry (".concat(fileTypeLabel(st), "): ").concat(posixPath || "."));
    }
    if (st.isFile() && st.nlink > 1) {
      throw packError("hardlink_rejected", "Hardlinks are not allowed: ".concat(posixPath || "."));
    }
    if (st.isFile() && isSparse(st)) {
      throw packError("sparse_rejected", "Sparse files are not allowed: ".concat(posixPath || "."));
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
      throw packError("file_too_large", "File exceeds ".concat(limits.application_file_bytes, " bytes: ").concat(posixPath));
    }
    if (fileCount >= limits.application_file_count) {
      throw packError("too_many_files", "Archive exceeds the ".concat(limits.application_file_count, " file limit at ").concat(posixPath));
    }
    if (st.size > limits.application_expanded_bytes - expandedBytes) {
      throw packError("expanded_too_large", "Expanded size exceeds ".concat(limits.application_expanded_bytes, " at ").concat(posixPath));
    }
    const handle = await open(absolute, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    let data;
    try {
      const opened = await handle.stat();
      if (!opened.isFile() || opened.dev !== st.dev || opened.ino !== st.ino || opened.size !== st.size || opened.nlink !== 1 || isSparse(opened)) {
        throw packError("unsupported_entry", "File changed while packing: ".concat(posixPath));
      }
      data = Buffer.allocUnsafe(st.size);
      let offset = 0;
      while (offset < data.length) {
        const { bytesRead } = await handle.read(data, offset, Math.min(256 * 1024, data.length - offset), offset);
        if (bytesRead === 0)
          throw packError("unsupported_entry", "File changed while packing: ".concat(posixPath));
        offset += bytesRead;
      }
      const after = await handle.stat();
      if (after.size !== opened.size || after.mtimeMs !== opened.mtimeMs || after.ctimeMs !== opened.ctimeMs) {
        throw packError("unsupported_entry", "File changed while packing: ".concat(posixPath));
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
    throw packError("too_many_files", "Archive contains ".concat(files.length, " files; limit is ").concat(limits.application_file_count));
  }
  const expanded = files.reduce((sum, entry) => sum + entry.size, 0);
  if (expanded > limits.application_expanded_bytes) {
    throw packError("expanded_too_large", "Expanded size ".concat(expanded, " exceeds ").concat(limits.application_expanded_bytes));
  }
  if (!files.some((entry) => entry.path === "index.html")) {
    throw packError("missing_index", "Application directory must contain index.html at the archive root");
  }
  return entries.sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path)));
}

// dist/pack/inline.js
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
    out += " ".concat(html.slice(attribute2.offset, attribute2.end));
  }
  return out;
}
function rejectUnsafeAttributes(path4, html, tag) {
  for (const attribute2 of tag.attributes) {
    const line = lineAt(html, attribute2.offset);
    if (/^on[a-z]+$/.test(attribute2.name)) {
      throw packError("inline_event_handler", "".concat(path4, ":").concat(line, ": inline event handler attribute '").concat(attribute2.name, "' cannot be hoisted; the release host blocks inline script. Move the handler into an external script."));
    }
    if (attribute2.value !== void 0 && URL_ATTRIBUTES[attribute2.name] === true) {
      const normalized = decodeEntities(attribute2.value).replace(/[\u0000-\u0020]/g, "").toLowerCase();
      if (normalized.startsWith("javascript:")) {
        throw packError("javascript_url", "".concat(path4, ":").concat(line, ": '").concat(attribute2.name, "' uses a javascript: URL, which the release host blocks. Use an external script and an event listener instead."));
      }
    }
  }
}
function findRawClose(html, from, name) {
  const pattern = new RegExp("</".concat(name, "\\s*>"), "gi");
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
function emitAsset(generated, existing, path4, extension, content) {
  const hash = createHash3("sha256").update(content, "utf8").digest("hex").slice(0, 32);
  const filename = "".concat(HOIST_PREFIX).concat(hash, ".").concat(extension);
  const assetPath = "".concat(path4.slice(0, path4.lastIndexOf("/") + 1)).concat(filename);
  if (existing.has(assetPath)) {
    throw packError("inline_asset_conflict", "".concat(path4, " inline ").concat(extension, " hoists onto the reserved asset ").concat(assetPath, "; rename or remove that file."));
  }
  if (!generated.has(assetPath)) {
    const data = Buffer.from(content, "utf8");
    generated.set(assetPath, { path: assetPath, type: "file", data, size: data.length });
  }
  return "./".concat(filename);
}
function transformHtml(path4, html, generated, existing) {
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
    rejectUnsafeAttributes(path4, html, tag);
    const parent = elements.at(-1);
    const namespace = tag.name === "svg" || parent?.namespace === "svg" && !SVG_HTML_INTEGRATION_POINTS.has(parent.name) ? "svg" : "html";
    const selfClosing = namespace === "svg" && tag.selfClosing;
    if (!selfClosing && RAW_TEXT_ELEMENTS[tag.name] === true && (namespace === "html" || tag.name === "style" || tag.name === "script")) {
      const close = findRawClose(html, tag.end, tag.name);
      if (!close) {
        throw packError("inline_unterminated", "".concat(path4, ":").concat(lineAt(html, tag.start), ": unterminated <").concat(tag.name, "> element."));
      }
      if (tag.name === "style" && namespace === "html") {
        out += html.slice(cursor, tag.start);
        const href = emitAsset(generated, existing, path4, "css", html.slice(tag.end, close.index));
        out += '<link rel="stylesheet" href="'.concat(href, '"').concat(serializeAttributes(html, tag), ">");
        cursor = close.end;
      } else if (tag.name === "script" && attributeValue(tag, "src") === void 0 && EXECUTABLE_SCRIPT_TYPES[scriptTypeName(attributeValue(tag, "type"))] === true) {
        out += html.slice(cursor, tag.start);
        const href = emitAsset(generated, existing, path4, "js", html.slice(tag.end, close.index));
        out += "<script".concat(serializeAttributes(html, tag, SCRIPT_ATTRIBUTES_DROPPED), ' src="').concat(href, '"></script>');
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
async function releaseEntries(root, options = {}) {
  const logger = options.logger;
  const limits = mergeLimits(options.limits);
  const walked = logger ? await logger.withLocal({ op: "pack.walk", message: "walk ".concat(root) }, async (span) => {
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
      throw packError("too_many_files", "Archive contains ".concat(files.length, " files; limit is ").concat(limits.application_file_count));
    }
    if (expandedBytes > limits.application_expanded_bytes) {
      throw packError("expanded_too_large", "Expanded archive ".concat(expandedBytes, " exceeds ").concat(limits.application_expanded_bytes));
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
  return {
    entries,
    file_count: files.length,
    expanded_bytes: expandedBytes,
    sdk_injection: {
      injected: injected.injected,
      reason: injected.reason,
      asset_path: injected.asset_path,
      asset_sha256: injected.asset_sha256
    }
  };
}
async function packDirectory(root, options = {}) {
  const logger = options.logger;
  const limits = mergeLimits(options.limits);
  const run = async () => {
    const release = await releaseEntries(root, options);
    const { entries, expanded_bytes: expandedBytes, file_count: fileCount } = release;
    const packed = logger ? await logger.withLocal({ op: "pack.archive", message: "write gzip archive" }, async (span) => {
      const tar = writeTar(entries);
      const archive = gzipDeterministic(tar);
      span.finish({
        compressed_bytes: archive.length,
        expanded_bytes: expandedBytes,
        file_count: fileCount,
        sha256: sha256Hex(archive)
      });
      return archive;
    }) : gzipDeterministic(writeTar(entries));
    if (packed.length > limits.application_archive_bytes) {
      throw packError("compressed_too_large", "Compressed archive ".concat(packed.length, " exceeds ").concat(limits.application_archive_bytes));
    }
    return {
      archive: packed,
      sha256: sha256Hex(packed),
      compressed_bytes: packed.length,
      expanded_bytes: expandedBytes,
      file_count: fileCount,
      entries: entries.map((entry) => ({ path: entry.path, type: entry.type, size: entry.size })),
      sdk_injection: release.sdk_injection
    };
  };
  if (!logger?.enabled) {
    return run();
  }
  return logger.withLocal({ op: "pack.directory", message: "pack ".concat(root) }, async (span) => {
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

export {
  SDK_PROTOCOL_VERSION,
  isBuiltinIgnored,
  releaseEntries,
  packDirectory
};
