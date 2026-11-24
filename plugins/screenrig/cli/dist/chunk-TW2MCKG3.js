import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/pack/release-core.js
var DEFAULT_ARCHIVE_LIMITS = {
  application_archive_bytes: 100 * 1024 * 1024,
  application_expanded_bytes: 250 * 1024 * 1024,
  application_file_count: 5e3,
  application_file_bytes: 32 * 1024 * 1024,
  application_path_depth: 16,
  application_path_bytes: 255
};
var ReleaseRuleError = class extends Error {
  code;
  detail;
  constructor(code, detail) {
    super(detail);
    this.code = code;
    this.detail = detail;
    this.name = "ReleaseRuleError";
  }
};
function refuse(code, detail) {
  throw new ReleaseRuleError(code, detail);
}
var encoder = new TextEncoder();
var decoder = new TextDecoder("utf-8", { ignoreBOM: true });
function utf8Bytes(value) {
  return encoder.encode(value).length;
}
function compareUtf8(a, b) {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    if (left[index] !== right[index])
      return left[index] - right[index];
  }
  return left.length - right.length;
}
async function sha256Hex(data) {
  const bytes = typeof data === "string" ? encoder.encode(data) : new Uint8Array(data);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  let out = "";
  for (const byte of digest)
    out += byte.toString(16).padStart(2, "0");
  return out;
}
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
function admitPath(posixPath, isDir, limits, seen, extraIgnore = () => false) {
  if (hasTraversal(posixPath) || posixPath.startsWith("/") || hasIllegalChars(posixPath)) {
    refuse("path_traversal", "Rejected path ".concat(posixPath));
  }
  if (utf8Bytes(posixPath) > limits.application_path_bytes) {
    refuse("path_too_long", "Path exceeds ".concat(limits.application_path_bytes, " bytes: ").concat(posixPath));
  }
  if (pathDepth(posixPath) > limits.application_path_depth) {
    refuse("path_too_deep", "Path exceeds depth ".concat(limits.application_path_depth, ": ").concat(posixPath));
  }
  if (isBuiltinIgnored(posixPath, isDir) || extraIgnore(posixPath, isDir)) {
    return false;
  }
  if (/[^\u0020-\u007e]/.test(posixPath)) {
    refuse("path_unpackable", "Path is not plain ASCII, which the server cannot unpack; rename it: ".concat(posixPath));
  }
  if (seen.normalized.has(posixPath)) {
    refuse("duplicate_path", "Duplicate normalized path: ".concat(posixPath));
  }
  const folded = caseFold(posixPath);
  if (seen.folded.has(folded)) {
    refuse("duplicate_path", "Duplicate case-folded path: ".concat(posixPath));
  }
  seen.normalized.add(posixPath);
  seen.folded.add(folded);
  return true;
}
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
  return tag.attributes.find((attribute) => attribute.name === name)?.value;
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
  for (const attribute of tag.attributes) {
    if (dropped.has(attribute.name))
      continue;
    out += " ".concat(html.slice(attribute.offset, attribute.end));
  }
  return out;
}
function rejectUnsafeAttributes(path, html, tag) {
  for (const attribute of tag.attributes) {
    const line = lineAt(html, attribute.offset);
    if (/^on[a-z]+$/.test(attribute.name)) {
      refuse("inline_event_handler", "".concat(path, ":").concat(line, ": inline event handler attribute '").concat(attribute.name, "' cannot be hoisted; the release host blocks inline script. Move the handler into an external script."));
    }
    if (attribute.value !== void 0 && URL_ATTRIBUTES[attribute.name] === true) {
      const normalized = decodeEntities(attribute.value).replace(/[\u0000- ]/g, "").toLowerCase();
      if (normalized.startsWith("javascript:")) {
        refuse("javascript_url", "".concat(path, ":").concat(line, ": '").concat(attribute.name, "' uses a javascript: URL, which the release host blocks. Use an external script and an event listener instead."));
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
async function emitAsset(generated, existing, path, extension, content) {
  const hash = (await sha256Hex(content)).slice(0, 32);
  const filename = "".concat(HOIST_PREFIX).concat(hash, ".").concat(extension);
  const assetPath = "".concat(path.slice(0, path.lastIndexOf("/") + 1)).concat(filename);
  if (existing.has(assetPath)) {
    refuse("inline_asset_conflict", "".concat(path, " inline ").concat(extension, " hoists onto the reserved asset ").concat(assetPath, "; rename or remove that file."));
  }
  if (!generated.has(assetPath)) {
    const data = encoder.encode(content);
    generated.set(assetPath, { path: assetPath, type: "file", data, size: data.length });
  }
  return "./".concat(filename);
}
async function transformHtml(path, html, generated, existing) {
  const elements = [];
  let out = "";
  let cursor = 0;
  let index = 0;
  while (index < html.length) {
    const open = html.indexOf("<", index);
    if (open < 0)
      break;
    const next = html[open + 1];
    if (next === void 0)
      break;
    if (next === "!") {
      index = html.startsWith("<!--", open) ? findCommentEnd(html, open + 4) : open + 1;
      continue;
    }
    if (next === "/") {
      const close = /^<\/([a-zA-Z][a-zA-Z0-9:-]*)\s*>/.exec(html.slice(open));
      if (close) {
        const name = close[1].toLowerCase();
        for (let depth = elements.length - 1; depth >= 0; depth -= 1) {
          if (elements[depth].name === name) {
            elements.length = depth;
            break;
          }
        }
        index = open + close[0].length;
      } else {
        index = open + 1;
      }
      continue;
    }
    if (next === "?") {
      index = open + 1;
      continue;
    }
    const tag = scanTag(html, open);
    if (!tag) {
      index = open + 1;
      continue;
    }
    rejectUnsafeAttributes(path, html, tag);
    const parent = elements.at(-1);
    const namespace = tag.name === "svg" || parent?.namespace === "svg" && !SVG_HTML_INTEGRATION_POINTS.has(parent.name) ? "svg" : "html";
    const selfClosing = namespace === "svg" && tag.selfClosing;
    if (!selfClosing && RAW_TEXT_ELEMENTS[tag.name] === true && (namespace === "html" || tag.name === "style" || tag.name === "script")) {
      const close = findRawClose(html, tag.end, tag.name);
      if (!close) {
        refuse("inline_unterminated", "".concat(path, ":").concat(lineAt(html, tag.start), ": unterminated <").concat(tag.name, "> element."));
      }
      if (tag.name === "style" && namespace === "html") {
        out += html.slice(cursor, tag.start);
        const href = await emitAsset(generated, existing, path, "css", html.slice(tag.end, close.index));
        out += '<link rel="stylesheet" href="'.concat(href, '"').concat(serializeAttributes(html, tag), ">");
        cursor = close.end;
      } else if (tag.name === "script" && attributeValue(tag, "src") === void 0 && EXECUTABLE_SCRIPT_TYPES[scriptTypeName(attributeValue(tag, "type"))] === true) {
        out += html.slice(cursor, tag.start);
        const href = await emitAsset(generated, existing, path, "js", html.slice(tag.end, close.index));
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
async function hoistInlineAssets(entries) {
  const existing = new Set(entries.map((entry) => entry.path));
  const generated = /* @__PURE__ */ new Map();
  const rewritten = [];
  for (const entry of entries) {
    if (entry.type !== "file" || !entry.data || !HTML_PATH.test(entry.path)) {
      rewritten.push(entry);
      continue;
    }
    const html = decoder.decode(entry.data);
    const transformed = await transformHtml(entry.path, html, generated, existing);
    if (transformed === html) {
      rewritten.push(entry);
      continue;
    }
    const data = encoder.encode(transformed);
    rewritten.push({ ...entry, data, size: data.length });
  }
  return [...rewritten, ...generated.values()];
}
var SDK_PROTOCOL_VERSION = "1";
var SDK_RUNTIME_PATH = "_screenrig/runtime.js";
var SDK_MARKER = 'data-screenrig-sdk="'.concat(SDK_PROTOCOL_VERSION, '"');
var SDK_SCRIPT_TAG = '<script src="./'.concat(SDK_RUNTIME_PATH, '" ').concat(SDK_MARKER, "></script>");
function markerAttribute(tag, name) {
  const match = tag.match(new RegExp("\\b".concat(name, "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))"), "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3];
}
function injectSdkTag(html) {
  const rawMarkers = html.match(/data-screenrig-sdk/gi) ?? [];
  const markedScripts = [...html.matchAll(/<script\b[^>]*data-screenrig-sdk[^>]*>\s*<\/script\s*>/gi)];
  if (rawMarkers.length !== markedScripts.length) {
    refuse("sdk_marker_invalid", "data-screenrig-sdk must appear only on a complete script element");
  }
  if (markedScripts.length > 1) {
    refuse("sdk_marker_duplicate", "index.html contains more than one ScreenRig SDK marker");
  }
  if (markedScripts.length === 1) {
    const tag = markedScripts[0]?.[0] ?? "";
    const version = markerAttribute(tag, "data-screenrig-sdk");
    const source = markerAttribute(tag, "src")?.replace(/^\.\//, "");
    if (version !== SDK_PROTOCOL_VERSION || source !== SDK_RUNTIME_PATH || /\b(?:async|defer)\b/i.test(tag)) {
      refuse("sdk_marker_incompatible", "Existing ScreenRig SDK marker has an incompatible version, source, or loading mode");
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
async function injectRuntime(entries, runtime) {
  if (entries.some((entry) => entry.path.toLocaleLowerCase("en-US") === SDK_RUNTIME_PATH.toLocaleLowerCase("en-US"))) {
    refuse("sdk_path_collision", "".concat(SDK_RUNTIME_PATH, " is reserved for ScreenRig archive injection"));
  }
  const index = entries.findIndex((entry) => entry.path === "index.html" && entry.type === "file");
  if (index < 0) {
    refuse("missing_index", "Application root must contain index.html");
  }
  const cloned = entries.map((entry) => ({ ...entry, data: entry.data ? entry.data.slice() : void 0 }));
  const indexEntry = cloned[index];
  if (!indexEntry?.data) {
    refuse("missing_index", "index.html has no readable contents");
  }
  const nextHtml = encoder.encode(injectSdkTag(decoder.decode(indexEntry.data)));
  cloned[index] = { ...indexEntry, data: nextHtml, size: nextHtml.length };
  cloned.push({ path: SDK_RUNTIME_PATH, type: "file", data: runtime.slice(), size: runtime.length });
  return { entries: cloned, asset_sha256: await sha256Hex(runtime) };
}
function finishRelease(entries, limits) {
  const sorted = entries.slice().sort((a, b) => compareUtf8(a.path, b.path));
  const files = sorted.filter((entry) => entry.type === "file");
  const expandedBytes = files.reduce((sum, entry) => sum + entry.size, 0);
  if (files.length > limits.application_file_count) {
    refuse("too_many_files", "Archive contains ".concat(files.length, " files; limit is ").concat(limits.application_file_count));
  }
  if (expandedBytes > limits.application_expanded_bytes) {
    refuse("expanded_too_large", "Expanded archive ".concat(expandedBytes, " exceeds ").concat(limits.application_expanded_bytes));
  }
  return { entries: sorted, file_count: files.length, expanded_bytes: expandedBytes };
}
var BLOCK = 512;
var USTAR_MAGIC = "ustar\0";
var USTAR_VERSION = "00";
function putString(buf, offset, length, value) {
  buf.fill(0, offset, offset + length);
  if (value.length > length) {
    refuse("path_too_long", "USTAR field overflow: ".concat(value));
  }
  buf.set(encoder.encode(value).subarray(0, buf.length - offset), offset);
}
function putOctal(buf, offset, length, value) {
  const oct = value.toString(8).padStart(length - 1, "0");
  buf.fill(0, offset, offset + length);
  buf.set(encoder.encode(oct).subarray(0, length - 1), offset);
}
function checksum(header) {
  let sum = 0;
  for (let i = 0; i < BLOCK; i += 1) {
    sum += header[i] ?? 0;
  }
  return sum;
}
function splitName(posixPath) {
  if (utf8Bytes(posixPath) <= 100) {
    return { name: posixPath, prefix: "" };
  }
  const parts = posixPath.split("/");
  for (let i = 1; i < parts.length; i += 1) {
    const prefix = parts.slice(0, i).join("/");
    const name = parts.slice(i).join("/");
    if (utf8Bytes(prefix) <= 155 && utf8Bytes(name) <= 100) {
      return { name, prefix };
    }
  }
  refuse("path_too_long", "Path cannot be encoded in ustar: ".concat(posixPath));
}
function headerFor(entry) {
  const header = new Uint8Array(BLOCK);
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
  header.set(encoder.encode("".concat(sum.toString(8).padStart(6, "0"), "\0 ")), 148);
  return header;
}
function padToBlock(size) {
  const rem = size % BLOCK;
  return rem === 0 ? 0 : BLOCK - rem;
}
function writeTar(entries) {
  const chunks = [];
  let total = 0;
  for (const entry of entries) {
    const header = headerFor(entry);
    chunks.push(header);
    total += header.length;
    if (entry.type === "file") {
      const data = entry.data ?? new Uint8Array(0);
      chunks.push(data);
      total += data.length + padToBlock(data.length);
      if (padToBlock(data.length) > 0)
        chunks.push(new Uint8Array(padToBlock(data.length)));
    }
  }
  chunks.push(new Uint8Array(BLOCK * 2));
  total += BLOCK * 2;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

// dist/adapters/protocol.js
var AGENT_CAPABILITIES = ["screens", "content", "playlists", "advertising", "reports", "project"];
function limitsFromCapabilities(capabilities) {
  return {
    application_archive_bytes: capabilities.application_compressed_bytes,
    application_expanded_bytes: capabilities.application_expanded_bytes,
    application_file_count: capabilities.application_file_count,
    application_file_bytes: capabilities.application_file_bytes,
    application_path_depth: capabilities.application_path_depth,
    application_path_bytes: capabilities.application_path_bytes
  };
}
var TEMPORARY_PROTOCOL_VERSION = "screenrig.cli.adapter/0";

export {
  DEFAULT_ARCHIVE_LIMITS,
  ReleaseRuleError,
  posixNormalize,
  compileIgnore,
  isBuiltinIgnored,
  admitPath,
  hoistInlineAssets,
  SDK_PROTOCOL_VERSION,
  SDK_RUNTIME_PATH,
  injectRuntime,
  finishRelease,
  writeTar,
  AGENT_CAPABILITIES,
  limitsFromCapabilities,
  TEMPORARY_PROTOCOL_VERSION
};
