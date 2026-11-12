import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  DEV_PORT,
  PLAYER_HOST,
  appOrigin,
  parseHostHeader,
  playerOrigin,
  releaseHostFor
} from "./chunk-ZEIGXBC7.js";
import {
  isBuiltinIgnored,
  releaseEntries
} from "./chunk-TAUC6G6F.js";
import "./chunk-UD3J3FNQ.js";
import "./chunk-4QJFIFQH.js";
import "./chunk-P3D5NU6C.js";
import {
  CliError,
  ExitCode,
  makeProblem,
  usageError
} from "./chunk-VYWS3KLY.js";
import {
  __template
} from "./chunk-3FYAGULW.js";

// dist/dev/index.js
import { createHash as createHash4 } from "node:crypto";
import path3 from "node:path";

// dist/dev/kv.js
import { createHash } from "node:crypto";
import { watch as watchPath } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
var KV_FILE_SCHEMA = "screenrig.dev-kv/v1";
var MAX_KV_VALUE_BYTES = 1 << 20;
var MAX_LIST = 200;
var IDEMPOTENCY_MEMORY = 1e3;
var problemSerial = 0;
function kvProblem(code, status, detail, extra = {}) {
  problemSerial += 1;
  return { code, status, detail, request_id: "dev_".concat(problemSerial.toString(36).padStart(6, "0")), ...extra };
}
function kvFailure(code, status, detail, extra = {}) {
  return { ok: false, problem: kvProblem(code, status, detail, extra) };
}
function validKvKey(key) {
  return typeof key === "string" && key.length >= 1 && key.length <= 256 && Buffer.from(key, "utf8").toString("utf8") === key && !key.startsWith("_screenrig/") && key !== "." && key !== "..";
}
function normalizeContentType(value) {
  const text = value.trim();
  const match = /^([A-Za-z0-9][A-Za-z0-9!#$&^_.+-]*)\/([A-Za-z0-9][A-Za-z0-9!#$&^_.+-]*)((?:\s*;\s*[A-Za-z0-9!#$&^_.+-]+=(?:[A-Za-z0-9!#$&^_.+-]+|"[^"\r\n]*"))*)$/.exec(text);
  if (!match)
    return void 0;
  const parameters = match[3].replace(/\s*;\s*([^=;\s]+)=/g, (_whole, name) => "; ".concat(name.toLowerCase(), "="));
  const normalized = "".concat(match[1].toLowerCase(), "/").concat(match[2].toLowerCase()).concat(parameters);
  return normalized.length <= 127 ? normalized : void 0;
}
function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
function summary(applicationId, key, entry) {
  return { application_id: applicationId, key, content_type: entry.contentType, bytes: entry.value.length, sha256: sha256(entry.value), revision: entry.revision };
}
function sameValue(left, right) {
  return left.contentType === right.contentType && left.value.equals(right.value);
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function textual(contentType) {
  return /^text\//.test(contentType) || /^application\/(?:[a-z.+-]*\+)?json(?:;|$)/.test(contentType);
}
function fileEntry(entry) {
  const out = { content_type: entry.contentType };
  const text = textual(entry.contentType) ? entry.value.toString("utf8") : void 0;
  const exact = text !== void 0 && Buffer.from(text, "utf8").equals(entry.value);
  if (exact && /json/.test(entry.contentType)) {
    try {
      const parsed = JSON.parse(text);
      if (JSON.stringify(parsed) === text)
        out.value = parsed;
      else
        out.value = text;
    } catch {
      out.value = text;
    }
  } else if (exact) {
    out.value = text;
  } else {
    out.value_base64 = entry.value.toString("base64");
  }
  out.revision = entry.revision;
  return out;
}
function readFileEntry(raw) {
  if (!isRecord(raw))
    return { reason: "an entry must be an object" };
  let value;
  let contentType;
  if (typeof raw.value_base64 === "string") {
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(raw.value_base64))
      return { reason: "value_base64 is not base64" };
    value = Buffer.from(raw.value_base64, "base64");
  } else if (typeof raw.value === "string") {
    value = Buffer.from(raw.value, "utf8");
    contentType = "text/plain";
  } else if ("value" in raw && raw.value !== void 0) {
    value = Buffer.from(JSON.stringify(raw.value), "utf8");
    contentType = "application/json";
  } else {
    return { reason: "an entry needs value or value_base64" };
  }
  if (typeof raw.content_type === "string")
    contentType = raw.content_type;
  else if (raw.content_type !== void 0)
    return { reason: "content_type must be a string" };
  const normalized = normalizeContentType(contentType ?? "application/octet-stream");
  if (!normalized)
    return { reason: "content_type is not a media type" };
  if (value.length > MAX_KV_VALUE_BYTES)
    return { reason: "a value is at most 1 MiB" };
  if (raw.revision !== void 0 && (typeof raw.revision !== "number" || !Number.isSafeInteger(raw.revision) || raw.revision < 1))
    return { reason: "revision must be a positive integer" };
  return { entry: { value, contentType: normalized, ...raw.revision === void 0 ? {} : { revision: raw.revision } } };
}
var FileKvStore = class {
  file;
  applicationId;
  options;
  entries = /* @__PURE__ */ new Map();
  fences = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Set();
  idempotent = /* @__PURE__ */ new Map();
  watcher;
  timer;
  invalid;
  queue = Promise.resolve();
  constructor(file, applicationId, options = {}) {
    this.file = file;
    this.applicationId = applicationId;
    this.options = options;
  }
  /** Reads the file (when it exists) and starts watching it. */
  async open() {
    await this.reload();
    if (this.options.watch !== false)
      this.startWatching();
  }
  startWatching() {
    const directory = path.dirname(this.file);
    const name = path.basename(this.file);
    const attach = () => {
      try {
        this.watcher = watchPath(directory, { persistent: false }, (_event, changed) => {
          if (changed && changed !== name)
            return;
          clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            void this.reload();
          }, 60);
        });
        this.watcher.on("error", () => void 0);
      } catch {
        this.watcher = void 0;
      }
    };
    attach();
    this.reattach = attach;
  }
  reattach;
  /** Serializes work on the file: the application's writes and an outside edit never interleave. */
  exclusive(work) {
    const next = this.queue.then(work, work);
    this.queue = next.catch(() => void 0);
    return next;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  publish(change) {
    for (const listener of this.listeners) {
      try {
        listener(change);
      } catch {
      }
    }
  }
  async close() {
    clearTimeout(this.timer);
    this.watcher?.close();
    this.watcher = void 0;
    await this.queue;
  }
  /** Re-reads the file and pushes what an outside edit changed. */
  reload() {
    return this.exclusive(async () => {
      let text;
      try {
        text = await readFile(this.file, "utf8");
      } catch (error) {
        if (error.code === "ENOENT") {
          this.invalid = void 0;
          this.applyDisk(/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map());
          return;
        }
        this.refuse("cannot read ".concat(this.file, ": ").concat(error instanceof Error ? error.message : String(error)));
        return;
      }
      let parsed;
      try {
        parsed = text.trim() === "" ? { entries: {} } : JSON.parse(text);
      } catch (error) {
        this.refuse("".concat(this.file, " is not valid JSON (").concat(error instanceof Error ? error.message : String(error), "); the previous values stay in force and writes are refused until it is fixed"));
        return;
      }
      if (!isRecord(parsed) || parsed.entries !== void 0 && !isRecord(parsed.entries)) {
        this.refuse("".concat(this.file, " must be an object with an entries object; the previous values stay in force and writes are refused until it is fixed"));
        return;
      }
      const incoming = /* @__PURE__ */ new Map();
      for (const [key, raw] of Object.entries(parsed.entries ?? {})) {
        const read = readFileEntry(raw);
        if (!validKvKey(key)) {
          this.refuse("".concat(this.file, ": ").concat(JSON.stringify(key), " is not a valid key"));
          return;
        }
        if ("reason" in read) {
          this.refuse("".concat(this.file, ": entry ").concat(JSON.stringify(key), ": ").concat(read.reason));
          return;
        }
        incoming.set(key, read.entry);
      }
      const fences = /* @__PURE__ */ new Map();
      if (isRecord(parsed.deleted)) {
        for (const [key, revision] of Object.entries(parsed.deleted)) {
          if (typeof revision === "number" && Number.isSafeInteger(revision) && revision > 0)
            fences.set(key, revision);
        }
      }
      this.invalid = void 0;
      const normalized = this.applyDisk(incoming, fences);
      if (normalized)
        await this.persist();
    });
  }
  refuse(message) {
    this.invalid = message;
    this.options.onProblem?.(message);
  }
  /**
   * Replaces memory with the file's values, assigning revisions to what the
   * file did not number or changed without numbering, and pushing the changes.
   * Returns whether the file needs rewriting to say what memory now holds.
   */
  applyDisk(incoming, fences) {
    const changes = [];
    let rewrite = false;
    for (const [key, fence] of fences)
      this.fences.set(key, Math.max(this.fences.get(key) ?? 0, fence));
    for (const [key, old] of [...this.entries]) {
      if (incoming.has(key))
        continue;
      this.entries.delete(key);
      this.fences.set(key, Math.max(this.fences.get(key) ?? 0, old.revision));
      changes.push({ key, deleted: true });
      rewrite = true;
    }
    for (const [key, next] of incoming) {
      const old = this.entries.get(key);
      const fence = this.fences.get(key) ?? 0;
      if (!old) {
        const revision2 = next.revision !== void 0 && next.revision > fence ? next.revision : fence + 1;
        this.entries.set(key, { value: next.value, contentType: next.contentType, revision: revision2 });
        changes.push({ key, revision: revision2, deleted: false });
        if (revision2 !== next.revision)
          rewrite = true;
        continue;
      }
      const edited = !sameValue(old, { ...next, revision: old.revision });
      let revision = old.revision;
      if (edited)
        revision = next.revision !== void 0 && next.revision > old.revision ? next.revision : old.revision + 1;
      else if (next.revision !== void 0 && next.revision > old.revision)
        revision = next.revision;
      if (revision !== next.revision)
        rewrite = true;
      if (revision === old.revision && !edited)
        continue;
      this.entries.set(key, { value: next.value, contentType: next.contentType, revision });
      changes.push({ key, revision, deleted: false });
    }
    for (const change of changes)
      this.publish(change);
    return rewrite;
  }
  async persist() {
    const entries = {};
    for (const key of [...this.entries.keys()].sort())
      entries[key] = fileEntry(this.entries.get(key));
    const deleted = {};
    for (const [key, revision] of [...this.fences].sort(([a], [b]) => a < b ? -1 : 1))
      if (!this.entries.has(key))
        deleted[key] = revision;
    const document = { schema: KV_FILE_SCHEMA, entries, ...Object.keys(deleted).length ? { deleted } : {} };
    await mkdir(path.dirname(this.file), { recursive: true });
    const temporary = "".concat(this.file, ".").concat(process.pid, ".tmp");
    try {
      await writeFile(temporary, "".concat(JSON.stringify(document, null, 2), "\n"), { mode: 384 });
      await rename(temporary, this.file);
    } catch (error) {
      await rm(temporary, { force: true });
      throw error;
    }
    if (this.options.watch !== false && !this.watcher)
      this.reattach?.();
  }
  blocked() {
    return this.invalid ? kvFailure("internal_error", 500, this.invalid) : void 0;
  }
  async get(key) {
    return this.exclusive(async () => {
      const entry = this.entries.get(key);
      if (!entry)
        return kvFailure("not_found", 404, "Key/value entry not found.");
      return { ok: true, value: { ...summary(this.applicationId, key, entry), value_base64: entry.value.toString("base64") } };
    });
  }
  async list() {
    return this.exclusive(async () => {
      const keys = [...this.entries.keys()].sort((a, b) => a < b ? -1 : a > b ? 1 : 0).slice(0, MAX_LIST);
      return { ok: true, value: keys.map((key) => summary(this.applicationId, key, this.entries.get(key))) };
    });
  }
  replay(key, hash) {
    const known = this.idempotent.get(key);
    if (!known)
      return void 0;
    if (known.hash !== hash)
      return kvFailure("idempotency_mismatch", 409, "This idempotency key was used for a different request.");
    return known.result;
  }
  remember(key, hash, result) {
    if (this.idempotent.size >= IDEMPOTENCY_MEMORY)
      this.idempotent.delete(this.idempotent.keys().next().value);
    this.idempotent.set(key, { hash, result });
  }
  async set(key, input) {
    return this.exclusive(async () => {
      if (!validKvKey(key))
        return kvFailure("invalid_request", 400, "The key is not a valid key.");
      if (input.idempotencyKey.length < 8 || input.idempotencyKey.length > 200)
        return kvFailure("invalid_request", 400, "An idempotency key of 8 to 200 characters is required.");
      if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input.valueBase64))
        return kvFailure("invalid_request", 400, "value_base64 is invalid.");
      const value = Buffer.from(input.valueBase64, "base64");
      const contentType = normalizeContentType(input.contentType);
      if (value.length > MAX_KV_VALUE_BYTES)
        return kvFailure("invalid_request", 400, "A value is at most 1 MiB.");
      if (!contentType)
        return kvFailure("invalid_request", 400, "content_type is not a media type.");
      const hash = createHash("sha256").update(JSON.stringify(["set", key, input.valueBase64, contentType, input.expectedRevision ?? null])).digest("hex");
      const replayed = this.replay(input.idempotencyKey, hash);
      if (replayed)
        return replayed;
      const blocked = this.blocked();
      if (blocked)
        return blocked;
      const current = this.entries.get(key);
      const expected = input.expectedRevision;
      let result;
      if (expected !== void 0 && current && expected !== current.revision) {
        result = kvFailure("revision_conflict", 412, "Resource revision does not match.", { current_revision: current.revision });
      } else if (expected !== void 0 && !current && expected !== 0) {
        result = kvFailure("revision_conflict", 412, "Resource revision does not match.");
      } else {
        const revision = current ? current.revision + 1 : (this.fences.get(key) ?? 0) + 1;
        const stored = { value, contentType, revision };
        this.entries.set(key, stored);
        try {
          await this.persist();
        } catch (error) {
          if (current)
            this.entries.set(key, current);
          else
            this.entries.delete(key);
          return kvFailure("internal_error", 500, "cannot write ".concat(this.file, ": ").concat(error instanceof Error ? error.message : String(error)));
        }
        this.publish({ key, revision, deleted: false });
        result = { ok: true, value: { ...summary(this.applicationId, key, stored), value_base64: value.toString("base64") } };
      }
      this.remember(input.idempotencyKey, hash, result);
      return result;
    });
  }
  async delete(key, input) {
    return this.exclusive(async () => {
      if (input.idempotencyKey.length < 8 || input.idempotencyKey.length > 200)
        return kvFailure("invalid_request", 400, "An idempotency key of 8 to 200 characters is required.");
      const hash = createHash("sha256").update(JSON.stringify(["delete", key, input.expectedRevision ?? null])).digest("hex");
      const replayed = this.replay(input.idempotencyKey, hash);
      if (replayed)
        return replayed;
      const blocked = this.blocked();
      if (blocked)
        return blocked;
      const current = this.entries.get(key);
      let result;
      if (!current) {
        result = kvFailure("not_found", 404, "Key/value entry not found.");
      } else if (input.expectedRevision !== void 0 && input.expectedRevision > 0 && input.expectedRevision !== current.revision) {
        result = kvFailure("revision_conflict", 412, "Resource revision does not match.", { current_revision: current.revision });
      } else {
        this.entries.delete(key);
        this.fences.set(key, Math.max(this.fences.get(key) ?? 0, current.revision));
        try {
          await this.persist();
        } catch (error) {
          this.entries.set(key, current);
          return kvFailure("internal_error", 500, "cannot write ".concat(this.file, ": ").concat(error instanceof Error ? error.message : String(error)));
        }
        this.publish({ key, deleted: true });
        result = { ok: true, value: null };
      }
      this.remember(input.idempotencyKey, hash, result);
      return result;
    });
  }
};
var RemoteKvStore = class {
  applicationId;
  read;
  constructor(applicationId, read) {
    this.applicationId = applicationId;
    this.read = read;
  }
  async fetch(apiPath) {
    const answer = await this.read(apiPath);
    if (!answer.ok)
      return { ok: false, problem: { ...answer.problem, request_id: answer.problem.request_id ?? kvProblem("", 0, "").request_id } };
    return { ok: true, value: answer.body };
  }
  async get(key) {
    return this.fetch("/api/applications/".concat(encodeURIComponent(this.applicationId), "/kv/").concat(encodeURIComponent(key)));
  }
  async list() {
    const page = await this.fetch("/api/applications/".concat(encodeURIComponent(this.applicationId), "/kv"));
    if (!page.ok)
      return page;
    return { ok: true, value: Array.isArray(page.value.items) ? page.value.items : [] };
  }
  async set() {
    return kvFailure("forbidden", 403, "Stored values are read-only: this run reads the application's real store (--kv-from).");
  }
  async delete() {
    return kvFailure("forbidden", 403, "Stored values are read-only: this run reads the application's real store (--kv-from).");
  }
  subscribe() {
    return () => void 0;
  }
  async close() {
    return void 0;
  }
};

// dist/dev/server.js
import http from "node:http";

// dist/dev/csp.js
function releaseCsp(playerOrigin2) {
  return "default-src 'self' https: http: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: blob:; style-src 'self' 'unsafe-inline' https: http:; img-src 'self' data: blob: https: http:; media-src 'self' data: blob: https: http:; font-src 'self' data: https: http:; connect-src 'self' https: http: wss: ws: data: blob:; frame-src https: http:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self' https:; frame-ancestors 'self' " + playerOrigin2;
}
function harnessCsp(appOrigin2) {
  return "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-src " + appOrigin2 + "; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
}

// dist/dev/page.js
var _a;
var HTML = String.raw(_a || (_a = __template(['<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>screenRIG app dev</title>\n<link rel="stylesheet" href="/_dev/harness.css">\n</head>\n<body>\n<header id="top">\n  <div class="brand">screenRIG <span>app dev</span></div>\n  <div id="pills" class="pills"></div>\n  <div class="actions">\n    <button id="btn-restart" type="button" title="End this activation and start a new one (a new generation)">Restart activation</button>\n    <button id="btn-reload" type="button" title="Load the application\'s files again">Reload</button>\n  </div>\n</header>\n<div id="banners"></div>\n<main>\n  <section id="stage-area">\n    <div id="stage-meta" class="muted"></div>\n    <div id="stage"><div id="frame-box"></div></div>\n  </section>\n  <aside id="side">\n    <nav id="tabs" role="tablist"></nav>\n    <div id="panels"></div>\n  </aside>\n</main>\n<script src="/_dev/harness.js"></script>\n</body>\n</html>\n'])));
var _b;
var CSS = String.raw(_b || (_b = __template([':root {\n  color-scheme: light dark;\n  --bg: #f6f7f9; --panel: #ffffff; --ink: #14181f; --muted: #5d6675; --line: #d8dde5;\n  --accent: #1f6feb; --accent-ink: #ffffff; --ok: #1a7f37; --warn: #9a6700; --bad: #cf222e; --code: #eef1f5;\n  --font: 14px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; --small: 12px;\n}\n@media (prefers-color-scheme: dark) {\n  :root { --bg: #0e1116; --panel: #161b22; --ink: #e6e9ee; --muted: #9aa4b2; --line: #2b323c; --accent: #4493f8; --accent-ink: #0b0f14; --ok: #3fb950; --warn: #d29922; --bad: #f85149; --code: #1d232c; }\n}\n* { box-sizing: border-box; }\nhtml, body { margin: 0; height: 100%; }\nbody { background: var(--bg); color: var(--ink); font: var(--font); display: flex; flex-direction: column; }\nheader#top { display: flex; align-items: center; gap: 16px; padding: 12px 16px; background: var(--panel); border-bottom: 1px solid var(--line); flex-wrap: wrap; }\n.brand { font-weight: 650; }\n.brand span { color: var(--muted); font-weight: 400; }\n.pills { display: flex; gap: 8px; flex-wrap: wrap; flex: 1; }\n.pill { border: 1px solid var(--line); border-radius: 999px; padding: 2px 10px; font-size: var(--small); color: var(--muted); background: var(--bg); }\n.pill.ok { color: var(--ok); border-color: var(--ok); }\n.pill.warn { color: var(--warn); border-color: var(--warn); }\n.pill.bad { color: var(--bad); border-color: var(--bad); }\n.actions { display: flex; gap: 8px; }\nbutton, select, input[type=text], input[type=number], textarea { font: inherit; color: var(--ink); background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 5px 10px; }\nbutton { cursor: pointer; }\nbutton:hover { border-color: var(--accent); }\nbutton.primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }\nbutton.small { padding: 2px 8px; font-size: var(--small); }\ninput[type=number] { width: 7em; }\ninput[type=text] { min-width: 0; }\ntextarea { width: 100%; min-height: 5.5em; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: var(--small); }\n#banners { display: flex; flex-direction: column; }\n.banner { padding: 10px 16px; border-bottom: 1px solid var(--line); background: var(--panel); }\n.banner.bad { border-left: 4px solid var(--bad); }\n.banner.warn { border-left: 4px solid var(--warn); }\n.banner.ok { border-left: 4px solid var(--ok); }\n.banner strong { margin-right: 8px; }\n.banner code { background: var(--code); border-radius: 4px; padding: 1px 5px; }\nmain { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 460px; gap: 16px; padding: 16px; }\n@media (max-width: 1100px) { main { grid-template-columns: minmax(0, 1fr); } }\n#stage-area { min-width: 0; display: flex; flex-direction: column; gap: 8px; }\n#stage { flex: 1; min-height: 240px; background: repeating-conic-gradient(var(--line) 0 25%, var(--panel) 0 50%) 0 0 / 20px 20px; border: 1px solid var(--line); border-radius: 8px; overflow: auto; padding: 12px; }\n#frame-box { position: relative; background: #000; box-shadow: 0 0 0 1px var(--line); }\n#frame-box iframe { position: absolute; left: 0; top: 0; border: 0; background: #fff; transform-origin: 0 0; }\n.muted { color: var(--muted); font-size: var(--small); }\naside#side { min-width: 0; display: flex; flex-direction: column; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }\nnav#tabs { display: flex; flex-wrap: wrap; gap: 2px; padding: 8px 8px 0; border-bottom: 1px solid var(--line); }\nnav#tabs button { border: 0; border-bottom: 2px solid transparent; border-radius: 0; background: none; padding: 6px 10px; color: var(--muted); }\nnav#tabs button[aria-selected=true] { color: var(--ink); border-bottom-color: var(--accent); }\n#panels { flex: 1; min-height: 0; overflow: auto; padding: 16px; }\n.panel { display: none; flex-direction: column; gap: 16px; }\n.panel.on { display: flex; }\n.group { display: flex; flex-direction: column; gap: 8px; }\n.group > h3 { margin: 0; font-size: var(--font); font-weight: 650; }\n.row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }\n.row label { display: inline-flex; align-items: center; gap: 6px; }\n.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }\n.list { display: flex; flex-direction: column; gap: 6px; }\n.item { border: 1px solid var(--line); border-radius: 6px; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; }\n.item .head { display: flex; justify-content: space-between; gap: 8px; align-items: center; flex-wrap: wrap; }\n.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: var(--small); }\n.status { min-height: 1.4em; font-size: var(--small); color: var(--muted); }\n.status.bad { color: var(--bad); }\n.log { display: flex; flex-direction: column; gap: 2px; }\n.entry { display: grid; grid-template-columns: 5.5em 9em 1fr; gap: 8px; font-size: var(--small); padding: 2px 0; border-bottom: 1px dashed var(--line); }\n.entry .t { color: var(--muted); }\n.entry .k { font-weight: 600; overflow-wrap: anywhere; }\n.entry.error .k { color: var(--bad); }\n.entry.warn .k { color: var(--warn); }\n.entry.debug { opacity: .7; }\n.entry details > summary { cursor: pointer; color: var(--muted); }\n.entry pre { margin: 4px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; background: var(--code); border-radius: 4px; padding: 6px; }\ntable.kv { width: 100%; border-collapse: collapse; font-size: var(--small); }\ntable.kv th, table.kv td { text-align: left; padding: 4px 6px; border-bottom: 1px solid var(--line); vertical-align: top; overflow-wrap: anywhere; }\n'])));
var _c;
var SCRIPT = String.raw(_c || (_c = __template(["(function () {\n  'use strict';\n\n  var state = null;\n  var logEntries = [];\n  var frame = null;\n  var frameSrc = '';\n  var connectedBefore = false;\n  var showDebug = false;\n  var relayQueue = Promise.resolve();\n\n  function el(tag, attrs) {\n    var node = document.createElement(tag);\n    if (attrs) {\n      Object.keys(attrs).forEach(function (name) {\n        var value = attrs[name];\n        if (value === undefined || value === null || value === false) return;\n        if (name === 'class') node.className = value;\n        else if (name === 'text') node.textContent = value;\n        else if (name.slice(0, 2) === 'on') node.addEventListener(name.slice(2), value);\n        else node.setAttribute(name, value === true ? '' : String(value));\n      });\n    }\n    function add(child) {\n      if (child === null || child === undefined || child === false) return;\n      if (Array.isArray(child)) { child.forEach(add); return; }\n      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);\n    }\n    for (var i = 2; i < arguments.length; i += 1) add(arguments[i]);\n    return node;\n  }\n\n  function $(id) { return document.getElementById(id); }\n\n  function send(path, body) {\n    return fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })\n      .then(function (response) { return response.json().then(function (json) { return { status: response.status, json: json }; }); });\n  }\n\n  function command(body, statusId) {\n    return send('/_dev/command', body).then(function (answer) {\n      if (statusId) setStatus(statusId, answer.json.ok ? '' : answer.json.error, !answer.json.ok);\n      return answer.json;\n    }, function (error) {\n      if (statusId) setStatus(statusId, String(error), true);\n    });\n  }\n\n  function setStatus(id, text, bad) {\n    var node = $(id);\n    if (!node) return;\n    node.textContent = text || '';\n    node.className = bad ? 'status bad' : 'status';\n  }\n\n  function fire(trigger, statusId) {\n    return command({ command: 'trigger', trigger: trigger }, statusId).then(function (answer) {\n      if (answer && answer.ok && statusId) {\n        var result = answer.result || {};\n        setStatus(statusId, result.posted ? 'Sent.' : 'Not sent' + (result.dropped ? ': ' + result.dropped : '.') + (result.consumed === true ? ' The Player keeps the input.' : ''));\n      }\n    });\n  }\n\n  // The frame.\n\n  function mountFrame(src, allow) {\n    frameSrc = src;\n    var box = $('frame-box');\n    if (frame && frame.parentNode) frame.parentNode.removeChild(frame);\n    frame = document.createElement('iframe');\n    frame.title = 'Application';\n    // The permissions of a frame are fixed when it loads: camera and microphone only while device.hdmi_input is granted.\n    frame.setAttribute('allow', allow || (state && state.frame_allow) || 'autoplay; fullscreen; clipboard-read; clipboard-write');\n    frame.addEventListener('load', function () { command({ command: 'frame-loaded' }); });\n    frame.src = src;\n    box.appendChild(frame);\n    layoutFrame();\n  }\n\n  function layoutFrame() {\n    if (!state || !frame) return;\n    var width = state.viewport.width;\n    var height = state.viewport.height;\n    var stage = $('stage');\n    var room = Math.max(160, stage.clientWidth - 24);\n    var tall = Math.max(160, window.innerHeight - 220);\n    var scale = Math.min(1, room / width, tall / height);\n    var box = $('frame-box');\n    box.style.width = Math.round(width * scale) + 'px';\n    box.style.height = Math.round(height * scale) + 'px';\n    frame.style.width = width + 'px';\n    frame.style.height = height + 'px';\n    frame.style.transform = 'scale(' + scale + ')';\n    $('stage-meta').textContent = width + ' x ' + height + ' at ' + Math.round(scale * 100) + '%  |  ' + state.app_origin;\n  }\n\n  window.addEventListener('resize', layoutFrame);\n\n  window.addEventListener('message', function (event) {\n    if (!frame || event.source !== frame.contentWindow || !state || event.origin !== state.app_origin) return;\n    var body = { data: event.data, origin: event.origin };\n    relayQueue = relayQueue.then(function () { return send('/_dev/message', body); }).then(function () {}, function () {});\n  });\n\n  function toFrame(message) {\n    if (frame && frame.contentWindow && state) frame.contentWindow.postMessage(message, state.app_origin);\n  }\n\n  // Server events.\n\n  function connect() {\n    var source = new EventSource('/_dev/events');\n    source.addEventListener('open', function () {\n      if (connectedBefore && state) mountFrame(state.frame_src, state.frame_allow);\n      connectedBefore = true;\n    });\n    source.addEventListener('state', function (event) {\n      var next = JSON.parse(event.data);\n      if (next.log) { logEntries = next.log; delete next.log; }\n      var first = state === null;\n      state = next;\n      if (first) mountFrame(state.frame_src, state.frame_allow);\n      render();\n    });\n    source.addEventListener('bridge', function (event) { toFrame(JSON.parse(event.data)); });\n    source.addEventListener('log', function (event) {\n      logEntries.push(JSON.parse(event.data));\n      if (logEntries.length > 500) logEntries.shift();\n      renderLog();\n    });\n    source.addEventListener('frame', function (event) {\n      var message = JSON.parse(event.data);\n      if (state) { state.frame_src = message.src; state.frame_allow = message.allow; }\n      mountFrame(message.src, message.allow);\n    });\n  }\n\n  // Rendering.\n\n  function pill(text, kind) { return el('span', { class: 'pill ' + (kind || ''), text: text }); }\n\n  function renderTop() {\n    var host = state.host;\n    var pills = $('pills');\n    pills.textContent = '';\n    var activation = host.active ? ['active, generation ' + host.generation, 'ok'] : state.release ? ['waiting for the handshake', 'warn'] : ['no release', 'bad'];\n    pills.appendChild(pill(activation[0], activation[1]));\n    if (host.ready) pills.appendChild(pill('ready', 'ok'));\n    if (host.ended) pills.appendChild(pill('page ended: ' + host.ended, 'warn'));\n    if (host.held.length) pills.appendChild(pill('held: ' + host.held.join(', '), 'warn'));\n    pills.appendChild(pill(state.release ? 'release ' + state.release.revision + ', ' + state.release.file_count + ' files' : 'not built', state.release ? '' : 'bad'));\n    pills.appendChild(pill('kv: ' + state.kv.mode + (state.kv.mode === 'remote' ? ' (read-only)' : ''), ''));\n  }\n\n  function renderBanners() {\n    var box = $('banners');\n    box.textContent = '';\n    if (state.refusal) {\n      var refusal = state.refusal;\n      var where = refusal.file ? ' ' + refusal.file + (refusal.line ? ':' + refusal.line : '') : '';\n      box.appendChild(el('div', { class: 'banner bad' },\n        el('strong', { text: 'app pack would refuse this directory' }), el('code', { text: refusal.code }),\n        el('div', { text: refusal.detail + (where && refusal.detail.indexOf(refusal.file || '\0') < 0 ? ' (' + where.trim() + ')' : '') }),\n        el('div', { class: 'muted', text: state.release ? 'The last accepted build is still served.' : 'Nothing is served until the directory is accepted.' })));\n    }\n    if (state.changed_since_load) {\n      box.appendChild(el('div', { class: 'banner warn' }, el('strong', { text: 'Files changed.' }), 'Automatic reload is off. ', el('button', { class: 'small', type: 'button', text: 'Reload now', onclick: function () { command({ command: 'reload' }); } })));\n    }\n    if (state.host.ended) {\n      var names = { advance: 'The application called nextPage(): the Player moves to the next page.', skip: 'The application called skip(): the Player leaves the page without counting a play.', max_ms: 'The page reached max_ms: the Player moves on.' };\n      box.appendChild(el('div', { class: 'banner ok' }, el('strong', { text: 'Page ended.' }), names[state.host.ended] || '', state.loop ? ' Starting over.' : ' ', state.loop ? null : el('button', { class: 'small', type: 'button', text: 'Start again', onclick: function () { command({ command: 'restart' }); } })));\n    }\n  }\n\n  function field(label, input, extra) {\n    return el('label', { class: 'row' }, el('span', { class: 'muted', text: label }), input, extra || null);\n  }\n\n  var controls = {};\n\n  function control(id, node) { controls[id] = node; return node; }\n\n  function setIfIdle(node, value) {\n    if (document.activeElement !== node) node.value = value;\n  }\n\n  // Panels.\n\n  var panelDefs = [];\n\n  function addPanel(id, title, build) { panelDefs.push({ id: id, title: title, build: build }); }\n\n  function group(title) {\n    var box = el('div', { class: 'group' }, el('h3', { text: title }));\n    for (var i = 1; i < arguments.length; i += 1) if (arguments[i]) box.appendChild(arguments[i]);\n    return box;\n  }\n\n  function statusLine(id) { return el('div', { class: 'status', id: id }); }\n\n  addPanel('launch', 'Launch', function () {\n    var preset = control('preset', el('select', { id: 'preset' },\n      el('option', { value: '1920x1080', text: '1920 x 1080' }), el('option', { value: '3840x2160', text: '3840 x 2160' }),\n      el('option', { value: '1080x1920', text: '1080 x 1920 (portrait)' }), el('option', { value: 'custom', text: 'Custom' })));\n    var width = control('width', el('input', { type: 'number', id: 'width', min: 1, max: 8192 }));\n    var height = control('height', el('input', { type: 'number', id: 'height', min: 1, max: 8192 }));\n    function applySize() {\n      var parts = preset.value.split('x');\n      var w = preset.value === 'custom' ? Number(width.value) : Number(parts[0]);\n      var h = preset.value === 'custom' ? Number(height.value) : Number(parts[1]);\n      command({ command: 'viewport', width: w, height: h }, 'size-status');\n    }\n    preset.addEventListener('change', applySize);\n    var name = control('screen-name', el('input', { type: 'text', id: 'screen-name', placeholder: 'Lobby East' }));\n    var zone = control('screen-zone', el('input', { type: 'text', id: 'screen-zone', placeholder: 'America/Vancouver' }));\n    var params = control('params', el('textarea', { id: 'params', spellcheck: 'false', placeholder: 'name=value, one per line' }));\n    function apply() {\n      var out = {};\n      params.value.split('\n').forEach(function (line) {\n        var at = line.indexOf('=');\n        if (line.trim() === '' || at < 1) return;\n        out[line.slice(0, at).trim()] = line.slice(at + 1);\n      });\n      command({ command: 'launch', name: name.value, timezone: zone.value, params: out }, 'launch-status');\n    }\n    return [\n      group('Viewport and primitive', el('div', { class: 'row' }, preset, width, 'x', height, el('button', { type: 'button', text: 'Resize', onclick: applySize })), statusLine('size-status'),\n        el('div', { class: 'muted', text: 'The application sees this size as its viewport and its primitive. A resize sends viewport.changed.' })),\n      group('Screen and launch params', field('Screen name', name), field('Time zone', zone), params,\n        el('div', { class: 'row' }, el('button', { class: 'primary', type: 'button', text: 'Apply and restart', onclick: apply })), statusLine('launch-status'),\n        el('div', { class: 'muted', text: 'Names are 1 to 32 of a-z 0-9 _ (not ticket or policy); at most 16; values at most 512 characters.' })),\n      group('Application', el('div', { class: 'mono', id: 'ids' })),\n    ];\n  });\n\n  addPanel('caps', 'Capabilities', function () {\n    var box = el('div', { class: 'grid2', id: 'cap-grid' });\n    var featureBox = el('div', { class: 'grid2', id: 'feature-grid' });\n    function setAll(value) {\n      var values = {};\n      state.capability_names.forEach(function (name) { values[name] = value; });\n      command({ command: 'capabilities', values: values });\n    }\n    return [\n      group('Capabilities', box, el('div', { class: 'row' }, el('button', { type: 'button', text: 'Grant all', onclick: function () { setAll(true); } }), el('button', { type: 'button', text: 'Revoke all', onclick: function () { setAll(false); } })),\n        el('div', { class: 'muted', text: 'A change sends the context again with the same binding; nothing restarts. Use Restart activation for a new generation.' })),\n      group('Advertised features', featureBox, el('div', { class: 'muted', text: 'A kind whose feature is not advertised is answered not_supported.' })),\n    ];\n  });\n\n  addPanel('page', 'Page', function () {\n    var enabled = control('timer-enabled', el('input', { type: 'checkbox', id: 'timer-enabled' }));\n    var maxMs = control('timer-max', el('input', { type: 'number', id: 'timer-max', min: 1000 }));\n    var loop = control('loop', el('input', { type: 'checkbox', id: 'loop' }));\n    function applyTimer() { command({ command: 'timer', enabled: enabled.checked, maxMs: Number(maxMs.value) }, 'timer-status'); }\n    loop.addEventListener('change', function () { command({ command: 'loop', value: loop.checked }); });\n    return [\n      group('Page timer', el('div', { class: 'row' }, el('label', {}, enabled, 'Run the timer'), field('max_ms', maxMs), el('button', { type: 'button', text: 'Apply', onclick: applyTimer })), statusLine('timer-status'),\n        el('div', { class: 'mono', id: 'timing' }),\n        el('div', { class: 'row' }, el('label', {}, loop, 'Start the page again when it ends'))),\n      group('Playback', el('div', { class: 'row' },\n        el('button', { type: 'button', id: 'btn-pause', text: 'Pause', onclick: function () { command({ command: 'pause', paused: !state.host.held.includes('paused') }); } }),\n        el('button', { type: 'button', id: 'btn-dark', text: 'Darken display', onclick: function () { command({ command: 'display', dark: !state.host.display_held_dark }); } }),\n        el('button', { type: 'button', text: 'Fire leaving', onclick: function () { command({ command: 'leaving' }); } })),\n        el('div', { class: 'muted', text: 'Pause and a dark display are the two causes of visibility.changed; the page is visible again when both have ended. Leaving is posted once.' }),\n        el('div', { class: 'mono', id: 'playback' })),\n    ];\n  });\n\n  function fireRow(title, inputs, build, statusId, hint) {\n    var button = el('button', { type: 'button', text: 'Fire' });\n    button.addEventListener('click', function () { fire(build(), statusId); });\n    return group(title, el('div', { class: 'row' }, inputs, button), statusLine(statusId), hint ? el('div', { class: 'muted', text: hint }) : null);\n  }\n\n  addPanel('events', 'Device events', function () {\n    var keyName = el('select', {}, el('option', { value: 'volume_up', text: 'volume_up' }), el('option', { value: 'volume_down', text: 'volume_down' }));\n    var keyAction = el('select', {}, el('option', { value: 'down', text: 'down' }), el('option', { value: 'up', text: 'up' }));\n    var keyRepeat = el('input', { type: 'checkbox' });\n    var lux = el('input', { type: 'number', value: '120', step: 'any' });\n    var online = el('select', {}, el('option', { value: 'true', text: 'online' }), el('option', { value: 'false', text: 'offline' }));\n    var displayOn = el('select', {}, el('option', { value: 'true', text: 'on' }), el('option', { value: 'false', text: 'off' }));\n    var brightness = el('input', { type: 'number', value: '0.5', min: 0, max: 1, step: '0.05' });\n    var scanKind = el('select', {},\n      el('option', { value: 'wedge', text: 'Keyboard-wedge scanner' }), el('option', { value: 'nfc:uid', text: 'NFC uid' }), el('option', { value: 'nfc:ndef_text', text: 'NFC text' }),\n      el('option', { value: 'nfc:ndef_uri', text: 'NFC uri' }), el('option', { value: 'camera:qr', text: 'Camera qr' }), el('option', { value: 'camera:ean13', text: 'Camera ean13' }), el('option', { value: 'camera:code128', text: 'Camera code128' }));\n    var scanData = el('input', { type: 'text', value: '4006381333931' });\n    var people = el('input', { type: 'number', value: '2', min: 0, max: 1000 });\n    var sound = el('input', { type: 'number', value: '-42', min: -120, max: 0, step: 'any' });\n    return [\n      fireRow('Presence', [], function () { return { device: 'presence' }; }, 'ev-presence', 'At most one per second.'),\n      fireRow('Volume key', [keyName, keyAction, el('label', {}, keyRepeat, 'repeat')], function () { return { device: 'key', key: keyName.value, action: keyAction.value, repeat: keyRepeat.checked }; }, 'ev-key', 'A watched key is consumed by the Player.'),\n      fireRow('Ambient light (lux)', [lux], function () { return { device: 'light', lux: Number(lux.value) }; }, 'ev-light', 'The first reading posts; later ones need a 10% change or a crossing of 1 lux, and 1 second.'),\n      fireRow('Network', [online], function () { return { device: 'network', online: online.value === 'true' }; }, 'ev-network'),\n      fireRow('Display (effective state)', [displayOn, brightness], function () { return { device: 'display', on: displayOn.value === 'true', brightness: Number(brightness.value) }; }, 'ev-display'),\n      fireRow('Scan', [scanKind, scanData], function () {\n        var parts = scanKind.value.split(':');\n        if (parts[0] === 'wedge') return { device: 'typing', text: scanData.value, gapMs: 20, enter: true, field: false };\n        return { device: 'scan', source: parts[0], format: parts[1], data: scanData.value };\n      }, 'ev-scan', 'A camera read needs device.scanner.start. A wedge scan is 4 or more keys, 50 ms apart at most, ending in Enter.'),\n      fireRow('People in view', [people], function () { return { device: 'people', count: Number(people.value) }; }, 'ev-people', 'The first reading posts, then changes, at most one per second.'),\n      fireRow('Sound level (dBFS)', [sound], function () { return { device: 'sound', dbfs: Number(sound.value) }; }, 'ev-sound', 'At most one per second.'),\n    ];\n  });\n\n  addPanel('hardware', 'Hardware', function () {\n    return [\n      group('Device', el('div', { class: 'row' },\n        el('label', {}, control('hw-network', el('input', { type: 'checkbox', id: 'hw-network' })), 'Network online'),\n        el('label', {}, control('hw-camera', el('input', { type: 'checkbox', id: 'hw-camera' })), 'Camera'),\n        el('label', {}, control('hw-ble', el('input', { type: 'checkbox', id: 'hw-ble' })), 'Bluetooth adapter'),\n        el('label', {}, control('hw-gpio', el('input', { type: 'checkbox', id: 'hw-gpio' })), 'GPIO chip')), el('div', { class: 'mono', id: 'scanner' })),\n      group('Serial ports', el('div', { class: 'list', id: 'serial' }), statusLine('serial-status')),\n      group('GPIO lines', el('div', { class: 'list', id: 'gpio' }), statusLine('gpio-status'),\n        el('div', { class: 'muted', text: 'Click a level to drive the line from outside (a button pressed). A floating line has nothing connected: it reads its pull (up is high, down is low) and its own level with none. The application hears a line it watches.' }),\n        el('div', { class: 'list', id: 'gpio-released' })),\n      group('HDMI input', el('div', { class: 'mono', id: 'hdmi' }), el('div', { class: 'muted', text: 'While device.hdmi_input is granted the application frame may use the camera and microphone, so hdmiInput.open() gets this browser capture device. Switching it loads the frame again.' })),\n      group('Bluetooth LE', el('div', { class: 'list', id: 'ble' }), statusLine('ble-status')),\n      group('Printers', el('div', { class: 'list', id: 'printers' }), el('div', { class: 'list', id: 'jobs' })),\n    ];\n  });\n\n  addPanel('ir-udp', 'IR and UDP', function () {\n    var irCode = el('input', { type: 'text', value: '0x20DF10', 'aria-label': 'NEC code' });\n    var irRepeat = el('input', { type: 'checkbox' });\n    var irEmitter = control('hw-ir-emitter', el('input', { type: 'checkbox', id: 'hw-ir-emitter' }));\n    var irReceiver = control('hw-ir-receiver', el('input', { type: 'checkbox', id: 'hw-ir-receiver' }));\n    var udpSocket = control('udp-socket', el('select', { id: 'udp-socket', 'aria-label': 'Socket' }));\n    var udpHost = el('input', { type: 'text', value: '127.0.0.1', size: 12, 'aria-label': 'Sender address' });\n    var udpPort = el('input', { type: 'number', value: '40000', min: 1, max: 65535 });\n    var udpData = el('input', { type: 'text', value: 'hello', 'aria-label': 'Datagram' });\n    var udpHex = el('input', { type: 'checkbox' });\n    function injectUdp() {\n      var body = { command: 'udp-inject', socket: udpSocket.value || undefined, host: udpHost.value, port: Number(udpPort.value) };\n      if (udpHex.checked) body.hex = udpData.value; else body.text = udpData.value;\n      command(body, 'udp-status');\n    }\n    return [\n      group('Infrared receiver', el('div', { class: 'row' }, field('NEC code', irCode), el('label', {}, irRepeat, 'repeat frame'), el('button', { type: 'button', text: 'Receive', onclick: function () {\n        var code = Number(irCode.value);\n        fire({ device: 'ir', code: code, repeat: irRepeat.checked }, 'ir-status');\n      } })), statusLine('ir-status'),\n        el('div', { class: 'muted', text: 'A received code reaches an application that watches ir. The code is 0 to 0xFFFFFF: the command in bits 0 to 7 and the address in bits 8 to 23. A repeat frame is the auto-repeat of a held button. A send of repeat n hands the emitter n + 1 frames.' }),\n        el('div', { class: 'row' }, el('label', {}, irEmitter, 'Infrared emitter (send)'), el('label', {}, irReceiver, 'Infrared receiver (receive)'))),\n      group('Codes the application sent', el('div', { class: 'list', id: 'ir-sent' })),\n      group('UDP sockets', el('div', { class: 'mono', id: 'udp-where' }), el('div', { class: 'list', id: 'udp-sockets' })),\n      group('Send a datagram to a socket', el('div', { class: 'row' }, udpSocket), el('div', { class: 'row' }, field('From', udpHost), udpPort),\n        el('div', { class: 'row' }, udpData, el('label', {}, udpHex, 'hex'), el('button', { type: 'button', text: 'Send', onclick: injectUdp }),\n          el('button', { type: 'button', text: 'Close socket (network fault)', title: 'The operating system closes the socket: the application hears closed with reason error', onclick: function () {\n            if (udpSocket.value) fire({ device: 'udp', socket: udpSocket.value, closed: true }, 'udp-status');\n          } })), statusLine('udp-status')),\n      group('Datagrams', el('div', { class: 'list', id: 'udp-log' }), el('div', { class: 'muted', text: 'A datagram the application sends to a loopback address reaches the socket bound there; one sent anywhere else is recorded here and never transmitted.' })),\n    ];\n  });\n\n  addPanel('kv', 'Stored values', function () {\n    return [group('K/V', el('div', { class: 'mono', id: 'kv-where' }), el('div', { id: 'kv-table' }), el('button', { type: 'button', text: 'Refresh', onclick: function () { loadKv(); } }))];\n  });\n\n  addPanel('log', 'Log', function () {\n    var debug = el('input', { type: 'checkbox', id: 'show-debug' });\n    debug.addEventListener('change', function () { showDebug = debug.checked; renderLog(); });\n    return [group('Events', el('div', { class: 'row' }, el('label', {}, debug, 'Show debug'), el('button', { type: 'button', class: 'small', text: 'Clear', onclick: function () { command({ command: 'clear-log' }); logEntries = []; renderLog(); } })), el('div', { class: 'log', id: 'log' }))];\n  });\n\n  var activeTab = 'launch';\n\n  function buildPanels() {\n    var tabs = $('tabs');\n    var panels = $('panels');\n    panelDefs.forEach(function (def) {\n      var tab = el('button', { type: 'button', role: 'tab', 'aria-selected': def.id === activeTab ? 'true' : 'false', text: def.title, onclick: function () { selectTab(def.id); } });\n      tab.dataset.tab = def.id;\n      tabs.appendChild(tab);\n      var panel = el('section', { class: 'panel' + (def.id === activeTab ? ' on' : ''), id: 'panel-' + def.id });\n      def.build().forEach(function (part) { panel.appendChild(part); });\n      panels.appendChild(panel);\n    });\n  }\n\n  function selectTab(id) {\n    activeTab = id;\n    Array.prototype.forEach.call($('tabs').children, function (tab) { tab.setAttribute('aria-selected', tab.dataset.tab === id ? 'true' : 'false'); });\n    panelDefs.forEach(function (def) { $('panel-' + def.id).className = 'panel' + (def.id === id ? ' on' : ''); });\n    if (id === 'kv') loadKv();\n    if (id === 'log') renderLog();\n  }\n\n  function renderCapabilities() {\n    var grid = $('cap-grid');\n    if (!grid.firstChild) {\n      state.capability_names.forEach(function (name) {\n        var box = el('input', { type: 'checkbox', id: 'cap-' + name });\n        box.addEventListener('change', function () { command({ command: 'capability', name: name, value: box.checked }); });\n        grid.appendChild(el('label', { class: 'row' }, box, el('span', { class: 'mono', text: name })));\n      });\n      state.feature_names.forEach(function (name) {\n        var box = el('input', { type: 'checkbox', id: 'feat-' + name });\n        box.addEventListener('change', function () { command({ command: 'feature', name: name, value: box.checked }); });\n        $('feature-grid').appendChild(el('label', { class: 'row' }, box, el('span', { class: 'mono', text: name })));\n      });\n    }\n    state.capability_names.forEach(function (name) { $('cap-' + name).checked = state.host.capabilities[name] === true; });\n    var advertised = state.host.features || [];\n    state.feature_names.forEach(function (name) { $('feat-' + name).checked = advertised.indexOf(name) >= 0; });\n  }\n\n  function seconds(ms) { return ms === null ? 'none' : (ms / 1000).toFixed(1) + ' s'; }\n\n  function renderStatic() {\n    setIfIdle(controls['width'], state.viewport.width);\n    setIfIdle(controls['height'], state.viewport.height);\n    controls['preset'].value = state.preset;\n    setIfIdle(controls['screen-name'], state.screen.name);\n    setIfIdle(controls['screen-zone'], state.screen.timezone);\n    if (document.activeElement !== controls['params']) controls['params'].value = Object.keys(state.params).map(function (k) { return k + '=' + state.params[k]; }).join('\n');\n    $('ids').textContent = 'application_id ' + state.application_id + '\nrelease_id     ' + state.release_id + '\ndirectory      ' + state.directory;\n    $('ids').style.whiteSpace = 'pre-wrap';\n    controls['timer-enabled'].checked = state.timer.enabled;\n    setIfIdle(controls['timer-max'], state.timer.maxMs);\n    controls['loop'].checked = state.loop;\n    var host = state.host;\n    $('timing').textContent = 'elapsed ' + seconds(host.page.elapsed_ms) + '   remaining ' + seconds(host.page.remaining_ms) + '   ' + (host.page.paused ? 'held' : 'running');\n    $('playback').textContent = 'visibility.watch ' + (host.visibility_watching ? 'on' : 'off') + '   causes: ' + (host.held.length ? host.held.join(', ') : 'none') + '\ndisplay ' + (host.display.on ? 'on' : 'off') + (host.display.brightness === null ? '' : ', brightness ' + host.display.brightness) + (host.display_held_dark ? ' (held dark)' : '') + '\nwatching: ' + (host.watching.length ? host.watching.join(', ') : 'nothing') + '\nready ' + host.ready + '   advanced ' + host.advanced;\n    $('playback').style.whiteSpace = 'pre-wrap';\n    $('btn-pause').textContent = host.held.indexOf('paused') >= 0 ? 'Resume' : 'Pause';\n    $('btn-dark').textContent = host.display_held_dark ? 'Light display' : 'Darken display';\n    var hardware = host.hardware;\n    wire('hw-network', host.network.online, function (v) { command({ command: 'hardware', change: 'network', value: v }); });\n    wire('hw-camera', hardware.camera.available, function (v) { command({ command: 'hardware', change: 'camera.available', value: v }); });\n    wire('hw-ble', hardware.ble.adapter, function (v) { command({ command: 'hardware', change: 'ble.adapter', value: v }); });\n    wire('hw-gpio', hardware.gpio.chip, function (v) { command({ command: 'hardware', change: 'gpio.chip', value: v }); });\n    wire('hw-ir-emitter', hardware.ir.emitter, function (v) { command({ command: 'hardware', change: 'ir.emitter', value: v }); });\n    wire('hw-ir-receiver', hardware.ir.receiver, function (v) { command({ command: 'hardware', change: 'ir.receiver', value: v }); });\n    $('hdmi').textContent = 'device.hdmi_input ' + (host.capabilities['device.hdmi_input'] ? 'granted: the frame allows camera and microphone' : 'not granted: the frame has no camera or microphone') + '\nframe allow: ' + state.frame_allow;\n    $('hdmi').style.whiteSpace = 'pre-wrap';\n    $('scanner').textContent = 'scanner ' + (host.frame.scanning ? 'running' : 'stopped') + '   camera reads: ' + hardware.camera.formats.join(', ');\n  }\n\n  var wired = {};\n  function wire(id, value, onChange) {\n    var box = $(id);\n    box.checked = value;\n    if (!wired[id]) { wired[id] = true; box.addEventListener('change', function () { onChange(box.checked); }); }\n  }\n\n  function hexOf(base64) {\n    try { return Array.prototype.map.call(atob(base64), function (c) { return ('0' + c.charCodeAt(0).toString(16)).slice(-2); }).join(''); } catch (e) { return ''; }\n  }\n\n  function renderHardware() {\n    var host = state.host;\n    var hardware = host.hardware;\n    var serial = $('serial');\n    serial.textContent = '';\n    hardware.serial.ports.forEach(function (port) {\n      var open = host.frame.ports.filter(function (item) { return item.port === port.id; })[0];\n      var text = el('input', { type: 'text', placeholder: 'text to send', 'aria-label': 'Text to send to ' + port.id });\n      var echo = el('input', { type: 'checkbox' });\n      echo.checked = port.echo === true;\n      echo.addEventListener('change', function () { command({ command: 'hardware', change: 'serial.echo', id: port.id, value: echo.checked }); });\n      var busy = el('input', { type: 'checkbox' });\n      busy.checked = port.busy === true;\n      busy.addEventListener('change', function () { command({ command: 'hardware', change: 'serial.busy', id: port.id, value: busy.checked }); });\n      var item = el('div', { class: 'item' },\n        el('div', { class: 'head' }, el('span', { class: 'mono', text: port.id + '  ' + port.name }), el('span', { class: 'muted', text: open ? 'open ' + open.handle : 'closed' })),\n        el('div', { class: 'row' }, el('label', {}, echo, 'echo writes'), el('label', {}, busy, 'held by another process')));\n      if (open) {\n        item.appendChild(el('div', { class: 'row' }, text, el('button', { type: 'button', class: 'small', text: 'Send', onclick: function () { command({ command: 'serial-send', handle: open.handle, text: text.value }, 'serial-status'); } }),\n          el('button', { type: 'button', class: 'small', text: 'Unplug', onclick: function () { fire({ device: 'serial', handle: open.handle, closed: true, reason: 'unplugged' }, 'serial-status'); } }),\n          el('button', { type: 'button', class: 'small', text: 'Fail', onclick: function () { fire({ device: 'serial', handle: open.handle, closed: true, reason: 'error' }, 'serial-status'); } })));\n      }\n      serial.appendChild(item);\n    });\n    var gpio = $('gpio');\n    gpio.textContent = '';\n    hardware.gpio.pins.forEach(function (pin) {\n      var listened = host.frame.pins.indexOf(pin.pin) >= 0;\n      var key = String(pin.pin);\n      var level = host.frame.levels[key] === true;\n      var pull = host.frame.pull[key] || 'none';\n      var idle = host.frame.idle[key];\n      var levelButton = el('button', { type: 'button', class: 'small', text: level ? 'high' : 'low', onclick: function () { fire({ device: 'gpio', pin: pin.pin, value: !level }, 'gpio-status'); } });\n      var busy = el('input', { type: 'checkbox' });\n      busy.checked = pin.busy === true;\n      busy.addEventListener('change', function () { command({ command: 'hardware', change: 'pin.busy', id: key, value: busy.checked }); });\n      var floating = el('input', { type: 'checkbox' });\n      floating.checked = pin.floating === true;\n      floating.addEventListener('change', function () { command({ command: 'hardware', change: 'pin.floating', id: key, value: floating.checked }); });\n      var released = pin.floating === true && pin.driven !== undefined ? el('button', { type: 'button', class: 'small', text: 'Let go', title: 'Stop driving the line from outside: it floats to its pull again', onclick: function () { fire({ device: 'gpio', pin: pin.pin, value: null }, 'gpio-status'); } }) : null;\n      var notes = [];\n      if (listened) notes.push('application listens, pull ' + pull);\n      if (idle !== undefined) notes.push('written: let go at ' + (idle ? 'high' : 'low'));\n      gpio.appendChild(el('div', { class: 'item' },\n        el('div', { class: 'head' }, el('span', { class: 'mono', text: 'line ' + pin.pin }), el('span', { class: 'row' }, levelButton, released), el('span', { class: 'muted', text: notes.join('; ') })),\n        el('div', { class: 'row' }, el('label', {}, floating, 'nothing connected (floating)'), el('label', {}, busy, 'held by another process'))));\n    });\n    var letGo = $('gpio-released');\n    letGo.textContent = '';\n    host.frame.released.slice(-6).reverse().forEach(function (item) {\n      letGo.appendChild(el('div', { class: 'item' }, el('span', { class: 'mono', text: 'line ' + item.pin + ' driven ' + (item.value ? 'high' : 'low') + ' and released: ' + (item.cause === 'leaving' ? 'the page left the glass' : item.cause === 'context' ? 'its context ended' : 'it was destroyed') })));\n    });\n    var ble = $('ble');\n    ble.textContent = '';\n    hardware.ble.peripherals.forEach(function (peripheral) {\n      peripheral.services.forEach(function (service) {\n        service.characteristics.forEach(function (item) {\n          var subs = host.frame.subscriptions.filter(function (sub) { return sub.service === service.service && sub.characteristic === item.characteristic; });\n          var hex = el('input', { type: 'text', value: hexOf(item.value_base64), 'aria-label': 'Notification bytes in hexadecimal' });\n          ble.appendChild(el('div', { class: 'item' },\n            el('div', { class: 'head' }, el('span', { class: 'mono', text: peripheral.name + '  ' + service.service + ' / ' + item.characteristic }), el('span', { class: 'muted', text: subs.length + ' subscription' + (subs.length === 1 ? '' : 's') })),\n            el('div', { class: 'row' }, hex, el('button', { type: 'button', class: 'small', text: 'Notify', onclick: function () { command({ command: 'ble-notify', service: service.service, characteristic: item.characteristic, hex: hex.value }, 'ble-status'); } }))));\n        });\n      });\n    });\n    var printers = $('printers');\n    printers.textContent = '';\n    hardware.printers.forEach(function (printer) {\n      var failing = el('input', { type: 'checkbox' });\n      failing.checked = printer.failing === true;\n      failing.addEventListener('change', function () { command({ command: 'hardware', change: 'printer.failing', id: printer.id, value: failing.checked }); });\n      printers.appendChild(el('div', { class: 'item' }, el('div', { class: 'head' }, el('span', { class: 'mono', text: printer.id + '  ' + printer.name }), el('span', { class: 'muted', text: printer.formats.join(', ') + (printer.default ? ', default' : '') })), el('label', { class: 'row' }, failing, 'accepts jobs and fails them')));\n    });\n    var jobs = $('jobs');\n    jobs.textContent = '';\n    host.frame.printed.slice().reverse().forEach(function (job) {\n      jobs.appendChild(el('div', { class: 'item' }, el('div', { class: 'head' }, el('span', { class: 'mono', text: job.job }), el('span', { class: job.failed ? 'pill bad' : 'pill ok', text: (job.failed ? 'failed' : 'printed') + ' on ' + job.printer + ', ' + job.bytes + ' bytes, ' + job.format })), el('pre', { class: 'mono', text: job.preview })));\n    });\n  }\n\n  function hex(value) { var text = Number(value).toString(16).toUpperCase(); while (text.length < 6) text = '0' + text; return '0x' + text; }\n\n  function renderIrUdp() {\n    var frameState = state.host.frame;\n    var sent = $('ir-sent');\n    sent.textContent = '';\n    frameState.ir_sent.slice().reverse().forEach(function (item) {\n      sent.appendChild(el('div', { class: 'item' }, el('span', { class: 'mono', text: item.encoding + ' ' + hex(item.code) + (item.repeat ? ', sent ' + (item.repeat + 1) + ' times' : '') + '  wire ' + item.frames[0].map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join('') })));\n    });\n    if (!frameState.ir_sent.length) sent.appendChild(el('div', { class: 'muted', text: 'None yet.' }));\n    $('udp-where').textContent = frameState.udp_transport === 'loopback' ? 'Sockets bind on 127.0.0.1 only: a tool on this machine can send them datagrams.' : 'Sockets are simulated: nothing is bound.';\n    var select = $('udp-socket');\n    var chosen = select.value;\n    select.textContent = '';\n    frameState.sockets.forEach(function (socket) { select.appendChild(el('option', { value: socket.handle, text: socket.handle + (socket.port ? '  port ' + socket.port : '  send only') })); });\n    if (chosen) select.value = chosen;\n    var sockets = $('udp-sockets');\n    sockets.textContent = '';\n    frameState.sockets.forEach(function (socket) {\n      sockets.appendChild(el('div', { class: 'item' }, el('span', { class: 'mono', text: socket.handle + '  ' + (socket.port ? 'port ' + socket.port : 'send only') + (socket.broadcast ? ', broadcast' : '') + (socket.multicast ? ', multicast ' + socket.multicast : '') })));\n    });\n    if (!frameState.sockets.length) sockets.appendChild(el('div', { class: 'muted', text: 'The application holds no socket.' }));\n    var log = $('udp-log');\n    log.textContent = '';\n    frameState.datagrams.slice().reverse().forEach(function (item) {\n      var where = item.direction === 'sent' ? 'to ' : 'from ';\n      var how = item.direction === 'sent' ? (item.delivered ? ', delivered on loopback' : ', recorded only') : '';\n      log.appendChild(el('div', { class: 'item' }, el('div', { class: 'head' }, el('span', { class: 'mono', text: item.direction + ' ' + where + item.host + ':' + item.port + how }), el('span', { class: 'muted', text: item.bytes + ' bytes' })), el('pre', { class: 'mono', text: item.text + '\n' + item.hex })));\n    });\n  }\n\n  function loadKv() {\n    fetch('/_dev/kv').then(function (response) { return response.json(); }).then(function (kv) {\n      $('kv-where').textContent = kv.mode + (kv.location ? '  ' + kv.location : '');\n      var table = $('kv-table');\n      table.textContent = '';\n      if (kv.problem) { table.appendChild(el('div', { class: 'status bad', text: kv.problem })); return; }\n      var body = el('tbody', {});\n      kv.items.forEach(function (item) {\n        body.appendChild(el('tr', {}, el('td', { class: 'mono', text: item.key }), el('td', { text: String(item.revision) }), el('td', { text: item.content_type + ', ' + item.bytes + ' bytes' }), el('td', { class: 'mono', text: item.preview })));\n      });\n      if (!kv.items.length) body.appendChild(el('tr', {}, el('td', { colspan: 4, class: 'muted', text: 'No keys.' })));\n      table.appendChild(el('table', { class: 'kv' }, el('thead', {}, el('tr', {}, el('th', { text: 'Key' }), el('th', { text: 'Rev' }), el('th', { text: 'Type' }), el('th', { text: 'Value' }))), body));\n    }, function () {});\n  }\n\n  function renderLog() {\n    var box = $('log');\n    if (!box) return;\n    box.textContent = '';\n    logEntries.slice(-300).forEach(function (entry) {\n      if (entry.level === 'debug' && !showDebug) return;\n      var time = entry.at ? entry.at.slice(11, 19) : '';\n      var text = (entry.code ? entry.code + '  ' : '') + (entry.message || '');\n      var row = el('div', { class: 'entry ' + (entry.level || '') }, el('span', { class: 't', text: time }), el('span', { class: 'k', text: entry.type }), el('div', {}, text ? el('div', { text: text }) : null,\n        entry.detail && Object.keys(entry.detail).length ? el('details', {}, el('summary', { text: 'detail' }), el('pre', { text: JSON.stringify(entry.detail, null, 2) })) : null));\n      box.appendChild(row);\n    });\n    box.scrollTop = box.scrollHeight;\n    var panel = $('panel-log');\n    if (panel && panel.className.indexOf('on') >= 0) $('panels').scrollTop = $('panels').scrollHeight;\n    if (entryNeedsKv()) { if (activeTab === 'kv') loadKv(); }\n  }\n\n  function entryNeedsKv() {\n    var last = logEntries[logEntries.length - 1];\n    return last && last.type === 'kv.changed';\n  }\n\n  var capabilitiesBuilt = false;\n\n  function render() {\n    renderTop();\n    renderBanners();\n    if (!capabilitiesBuilt) { capabilitiesBuilt = true; }\n    renderCapabilities();\n    renderStatic();\n    renderHardware();\n    renderIrUdp();\n    layoutFrame();\n    renderLog();\n  }\n\n  $('btn-restart').addEventListener('click', function () { command({ command: 'restart' }); });\n  $('btn-reload').addEventListener('click', function () { command({ command: 'reload' }); });\n  buildPanels();\n  connect();\n}());\n"], ["(function () {\n  'use strict';\n\n  var state = null;\n  var logEntries = [];\n  var frame = null;\n  var frameSrc = '';\n  var connectedBefore = false;\n  var showDebug = false;\n  var relayQueue = Promise.resolve();\n\n  function el(tag, attrs) {\n    var node = document.createElement(tag);\n    if (attrs) {\n      Object.keys(attrs).forEach(function (name) {\n        var value = attrs[name];\n        if (value === undefined || value === null || value === false) return;\n        if (name === 'class') node.className = value;\n        else if (name === 'text') node.textContent = value;\n        else if (name.slice(0, 2) === 'on') node.addEventListener(name.slice(2), value);\n        else node.setAttribute(name, value === true ? '' : String(value));\n      });\n    }\n    function add(child) {\n      if (child === null || child === undefined || child === false) return;\n      if (Array.isArray(child)) { child.forEach(add); return; }\n      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);\n    }\n    for (var i = 2; i < arguments.length; i += 1) add(arguments[i]);\n    return node;\n  }\n\n  function $(id) { return document.getElementById(id); }\n\n  function send(path, body) {\n    return fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })\n      .then(function (response) { return response.json().then(function (json) { return { status: response.status, json: json }; }); });\n  }\n\n  function command(body, statusId) {\n    return send('/_dev/command', body).then(function (answer) {\n      if (statusId) setStatus(statusId, answer.json.ok ? '' : answer.json.error, !answer.json.ok);\n      return answer.json;\n    }, function (error) {\n      if (statusId) setStatus(statusId, String(error), true);\n    });\n  }\n\n  function setStatus(id, text, bad) {\n    var node = $(id);\n    if (!node) return;\n    node.textContent = text || '';\n    node.className = bad ? 'status bad' : 'status';\n  }\n\n  function fire(trigger, statusId) {\n    return command({ command: 'trigger', trigger: trigger }, statusId).then(function (answer) {\n      if (answer && answer.ok && statusId) {\n        var result = answer.result || {};\n        setStatus(statusId, result.posted ? 'Sent.' : 'Not sent' + (result.dropped ? ': ' + result.dropped : '.') + (result.consumed === true ? ' The Player keeps the input.' : ''));\n      }\n    });\n  }\n\n  // The frame.\n\n  function mountFrame(src, allow) {\n    frameSrc = src;\n    var box = $('frame-box');\n    if (frame && frame.parentNode) frame.parentNode.removeChild(frame);\n    frame = document.createElement('iframe');\n    frame.title = 'Application';\n    // The permissions of a frame are fixed when it loads: camera and microphone only while device.hdmi_input is granted.\n    frame.setAttribute('allow', allow || (state && state.frame_allow) || 'autoplay; fullscreen; clipboard-read; clipboard-write');\n    frame.addEventListener('load', function () { command({ command: 'frame-loaded' }); });\n    frame.src = src;\n    box.appendChild(frame);\n    layoutFrame();\n  }\n\n  function layoutFrame() {\n    if (!state || !frame) return;\n    var width = state.viewport.width;\n    var height = state.viewport.height;\n    var stage = $('stage');\n    var room = Math.max(160, stage.clientWidth - 24);\n    var tall = Math.max(160, window.innerHeight - 220);\n    var scale = Math.min(1, room / width, tall / height);\n    var box = $('frame-box');\n    box.style.width = Math.round(width * scale) + 'px';\n    box.style.height = Math.round(height * scale) + 'px';\n    frame.style.width = width + 'px';\n    frame.style.height = height + 'px';\n    frame.style.transform = 'scale(' + scale + ')';\n    $('stage-meta').textContent = width + ' x ' + height + ' at ' + Math.round(scale * 100) + '%  |  ' + state.app_origin;\n  }\n\n  window.addEventListener('resize', layoutFrame);\n\n  window.addEventListener('message', function (event) {\n    if (!frame || event.source !== frame.contentWindow || !state || event.origin !== state.app_origin) return;\n    var body = { data: event.data, origin: event.origin };\n    relayQueue = relayQueue.then(function () { return send('/_dev/message', body); }).then(function () {}, function () {});\n  });\n\n  function toFrame(message) {\n    if (frame && frame.contentWindow && state) frame.contentWindow.postMessage(message, state.app_origin);\n  }\n\n  // Server events.\n\n  function connect() {\n    var source = new EventSource('/_dev/events');\n    source.addEventListener('open', function () {\n      if (connectedBefore && state) mountFrame(state.frame_src, state.frame_allow);\n      connectedBefore = true;\n    });\n    source.addEventListener('state', function (event) {\n      var next = JSON.parse(event.data);\n      if (next.log) { logEntries = next.log; delete next.log; }\n      var first = state === null;\n      state = next;\n      if (first) mountFrame(state.frame_src, state.frame_allow);\n      render();\n    });\n    source.addEventListener('bridge', function (event) { toFrame(JSON.parse(event.data)); });\n    source.addEventListener('log', function (event) {\n      logEntries.push(JSON.parse(event.data));\n      if (logEntries.length > 500) logEntries.shift();\n      renderLog();\n    });\n    source.addEventListener('frame', function (event) {\n      var message = JSON.parse(event.data);\n      if (state) { state.frame_src = message.src; state.frame_allow = message.allow; }\n      mountFrame(message.src, message.allow);\n    });\n  }\n\n  // Rendering.\n\n  function pill(text, kind) { return el('span', { class: 'pill ' + (kind || ''), text: text }); }\n\n  function renderTop() {\n    var host = state.host;\n    var pills = $('pills');\n    pills.textContent = '';\n    var activation = host.active ? ['active, generation ' + host.generation, 'ok'] : state.release ? ['waiting for the handshake', 'warn'] : ['no release', 'bad'];\n    pills.appendChild(pill(activation[0], activation[1]));\n    if (host.ready) pills.appendChild(pill('ready', 'ok'));\n    if (host.ended) pills.appendChild(pill('page ended: ' + host.ended, 'warn'));\n    if (host.held.length) pills.appendChild(pill('held: ' + host.held.join(', '), 'warn'));\n    pills.appendChild(pill(state.release ? 'release ' + state.release.revision + ', ' + state.release.file_count + ' files' : 'not built', state.release ? '' : 'bad'));\n    pills.appendChild(pill('kv: ' + state.kv.mode + (state.kv.mode === 'remote' ? ' (read-only)' : ''), ''));\n  }\n\n  function renderBanners() {\n    var box = $('banners');\n    box.textContent = '';\n    if (state.refusal) {\n      var refusal = state.refusal;\n      var where = refusal.file ? ' ' + refusal.file + (refusal.line ? ':' + refusal.line : '') : '';\n      box.appendChild(el('div', { class: 'banner bad' },\n        el('strong', { text: 'app pack would refuse this directory' }), el('code', { text: refusal.code }),\n        el('div', { text: refusal.detail + (where && refusal.detail.indexOf(refusal.file || '\\u0000') < 0 ? ' (' + where.trim() + ')' : '') }),\n        el('div', { class: 'muted', text: state.release ? 'The last accepted build is still served.' : 'Nothing is served until the directory is accepted.' })));\n    }\n    if (state.changed_since_load) {\n      box.appendChild(el('div', { class: 'banner warn' }, el('strong', { text: 'Files changed.' }), 'Automatic reload is off. ', el('button', { class: 'small', type: 'button', text: 'Reload now', onclick: function () { command({ command: 'reload' }); } })));\n    }\n    if (state.host.ended) {\n      var names = { advance: 'The application called nextPage(): the Player moves to the next page.', skip: 'The application called skip(): the Player leaves the page without counting a play.', max_ms: 'The page reached max_ms: the Player moves on.' };\n      box.appendChild(el('div', { class: 'banner ok' }, el('strong', { text: 'Page ended.' }), names[state.host.ended] || '', state.loop ? ' Starting over.' : ' ', state.loop ? null : el('button', { class: 'small', type: 'button', text: 'Start again', onclick: function () { command({ command: 'restart' }); } })));\n    }\n  }\n\n  function field(label, input, extra) {\n    return el('label', { class: 'row' }, el('span', { class: 'muted', text: label }), input, extra || null);\n  }\n\n  var controls = {};\n\n  function control(id, node) { controls[id] = node; return node; }\n\n  function setIfIdle(node, value) {\n    if (document.activeElement !== node) node.value = value;\n  }\n\n  // Panels.\n\n  var panelDefs = [];\n\n  function addPanel(id, title, build) { panelDefs.push({ id: id, title: title, build: build }); }\n\n  function group(title) {\n    var box = el('div', { class: 'group' }, el('h3', { text: title }));\n    for (var i = 1; i < arguments.length; i += 1) if (arguments[i]) box.appendChild(arguments[i]);\n    return box;\n  }\n\n  function statusLine(id) { return el('div', { class: 'status', id: id }); }\n\n  addPanel('launch', 'Launch', function () {\n    var preset = control('preset', el('select', { id: 'preset' },\n      el('option', { value: '1920x1080', text: '1920 x 1080' }), el('option', { value: '3840x2160', text: '3840 x 2160' }),\n      el('option', { value: '1080x1920', text: '1080 x 1920 (portrait)' }), el('option', { value: 'custom', text: 'Custom' })));\n    var width = control('width', el('input', { type: 'number', id: 'width', min: 1, max: 8192 }));\n    var height = control('height', el('input', { type: 'number', id: 'height', min: 1, max: 8192 }));\n    function applySize() {\n      var parts = preset.value.split('x');\n      var w = preset.value === 'custom' ? Number(width.value) : Number(parts[0]);\n      var h = preset.value === 'custom' ? Number(height.value) : Number(parts[1]);\n      command({ command: 'viewport', width: w, height: h }, 'size-status');\n    }\n    preset.addEventListener('change', applySize);\n    var name = control('screen-name', el('input', { type: 'text', id: 'screen-name', placeholder: 'Lobby East' }));\n    var zone = control('screen-zone', el('input', { type: 'text', id: 'screen-zone', placeholder: 'America/Vancouver' }));\n    var params = control('params', el('textarea', { id: 'params', spellcheck: 'false', placeholder: 'name=value, one per line' }));\n    function apply() {\n      var out = {};\n      params.value.split('\\n').forEach(function (line) {\n        var at = line.indexOf('=');\n        if (line.trim() === '' || at < 1) return;\n        out[line.slice(0, at).trim()] = line.slice(at + 1);\n      });\n      command({ command: 'launch', name: name.value, timezone: zone.value, params: out }, 'launch-status');\n    }\n    return [\n      group('Viewport and primitive', el('div', { class: 'row' }, preset, width, 'x', height, el('button', { type: 'button', text: 'Resize', onclick: applySize })), statusLine('size-status'),\n        el('div', { class: 'muted', text: 'The application sees this size as its viewport and its primitive. A resize sends viewport.changed.' })),\n      group('Screen and launch params', field('Screen name', name), field('Time zone', zone), params,\n        el('div', { class: 'row' }, el('button', { class: 'primary', type: 'button', text: 'Apply and restart', onclick: apply })), statusLine('launch-status'),\n        el('div', { class: 'muted', text: 'Names are 1 to 32 of a-z 0-9 _ (not ticket or policy); at most 16; values at most 512 characters.' })),\n      group('Application', el('div', { class: 'mono', id: 'ids' })),\n    ];\n  });\n\n  addPanel('caps', 'Capabilities', function () {\n    var box = el('div', { class: 'grid2', id: 'cap-grid' });\n    var featureBox = el('div', { class: 'grid2', id: 'feature-grid' });\n    function setAll(value) {\n      var values = {};\n      state.capability_names.forEach(function (name) { values[name] = value; });\n      command({ command: 'capabilities', values: values });\n    }\n    return [\n      group('Capabilities', box, el('div', { class: 'row' }, el('button', { type: 'button', text: 'Grant all', onclick: function () { setAll(true); } }), el('button', { type: 'button', text: 'Revoke all', onclick: function () { setAll(false); } })),\n        el('div', { class: 'muted', text: 'A change sends the context again with the same binding; nothing restarts. Use Restart activation for a new generation.' })),\n      group('Advertised features', featureBox, el('div', { class: 'muted', text: 'A kind whose feature is not advertised is answered not_supported.' })),\n    ];\n  });\n\n  addPanel('page', 'Page', function () {\n    var enabled = control('timer-enabled', el('input', { type: 'checkbox', id: 'timer-enabled' }));\n    var maxMs = control('timer-max', el('input', { type: 'number', id: 'timer-max', min: 1000 }));\n    var loop = control('loop', el('input', { type: 'checkbox', id: 'loop' }));\n    function applyTimer() { command({ command: 'timer', enabled: enabled.checked, maxMs: Number(maxMs.value) }, 'timer-status'); }\n    loop.addEventListener('change', function () { command({ command: 'loop', value: loop.checked }); });\n    return [\n      group('Page timer', el('div', { class: 'row' }, el('label', {}, enabled, 'Run the timer'), field('max_ms', maxMs), el('button', { type: 'button', text: 'Apply', onclick: applyTimer })), statusLine('timer-status'),\n        el('div', { class: 'mono', id: 'timing' }),\n        el('div', { class: 'row' }, el('label', {}, loop, 'Start the page again when it ends'))),\n      group('Playback', el('div', { class: 'row' },\n        el('button', { type: 'button', id: 'btn-pause', text: 'Pause', onclick: function () { command({ command: 'pause', paused: !state.host.held.includes('paused') }); } }),\n        el('button', { type: 'button', id: 'btn-dark', text: 'Darken display', onclick: function () { command({ command: 'display', dark: !state.host.display_held_dark }); } }),\n        el('button', { type: 'button', text: 'Fire leaving', onclick: function () { command({ command: 'leaving' }); } })),\n        el('div', { class: 'muted', text: 'Pause and a dark display are the two causes of visibility.changed; the page is visible again when both have ended. Leaving is posted once.' }),\n        el('div', { class: 'mono', id: 'playback' })),\n    ];\n  });\n\n  function fireRow(title, inputs, build, statusId, hint) {\n    var button = el('button', { type: 'button', text: 'Fire' });\n    button.addEventListener('click', function () { fire(build(), statusId); });\n    return group(title, el('div', { class: 'row' }, inputs, button), statusLine(statusId), hint ? el('div', { class: 'muted', text: hint }) : null);\n  }\n\n  addPanel('events', 'Device events', function () {\n    var keyName = el('select', {}, el('option', { value: 'volume_up', text: 'volume_up' }), el('option', { value: 'volume_down', text: 'volume_down' }));\n    var keyAction = el('select', {}, el('option', { value: 'down', text: 'down' }), el('option', { value: 'up', text: 'up' }));\n    var keyRepeat = el('input', { type: 'checkbox' });\n    var lux = el('input', { type: 'number', value: '120', step: 'any' });\n    var online = el('select', {}, el('option', { value: 'true', text: 'online' }), el('option', { value: 'false', text: 'offline' }));\n    var displayOn = el('select', {}, el('option', { value: 'true', text: 'on' }), el('option', { value: 'false', text: 'off' }));\n    var brightness = el('input', { type: 'number', value: '0.5', min: 0, max: 1, step: '0.05' });\n    var scanKind = el('select', {},\n      el('option', { value: 'wedge', text: 'Keyboard-wedge scanner' }), el('option', { value: 'nfc:uid', text: 'NFC uid' }), el('option', { value: 'nfc:ndef_text', text: 'NFC text' }),\n      el('option', { value: 'nfc:ndef_uri', text: 'NFC uri' }), el('option', { value: 'camera:qr', text: 'Camera qr' }), el('option', { value: 'camera:ean13', text: 'Camera ean13' }), el('option', { value: 'camera:code128', text: 'Camera code128' }));\n    var scanData = el('input', { type: 'text', value: '4006381333931' });\n    var people = el('input', { type: 'number', value: '2', min: 0, max: 1000 });\n    var sound = el('input', { type: 'number', value: '-42', min: -120, max: 0, step: 'any' });\n    return [\n      fireRow('Presence', [], function () { return { device: 'presence' }; }, 'ev-presence', 'At most one per second.'),\n      fireRow('Volume key', [keyName, keyAction, el('label', {}, keyRepeat, 'repeat')], function () { return { device: 'key', key: keyName.value, action: keyAction.value, repeat: keyRepeat.checked }; }, 'ev-key', 'A watched key is consumed by the Player.'),\n      fireRow('Ambient light (lux)', [lux], function () { return { device: 'light', lux: Number(lux.value) }; }, 'ev-light', 'The first reading posts; later ones need a 10% change or a crossing of 1 lux, and 1 second.'),\n      fireRow('Network', [online], function () { return { device: 'network', online: online.value === 'true' }; }, 'ev-network'),\n      fireRow('Display (effective state)', [displayOn, brightness], function () { return { device: 'display', on: displayOn.value === 'true', brightness: Number(brightness.value) }; }, 'ev-display'),\n      fireRow('Scan', [scanKind, scanData], function () {\n        var parts = scanKind.value.split(':');\n        if (parts[0] === 'wedge') return { device: 'typing', text: scanData.value, gapMs: 20, enter: true, field: false };\n        return { device: 'scan', source: parts[0], format: parts[1], data: scanData.value };\n      }, 'ev-scan', 'A camera read needs device.scanner.start. A wedge scan is 4 or more keys, 50 ms apart at most, ending in Enter.'),\n      fireRow('People in view', [people], function () { return { device: 'people', count: Number(people.value) }; }, 'ev-people', 'The first reading posts, then changes, at most one per second.'),\n      fireRow('Sound level (dBFS)', [sound], function () { return { device: 'sound', dbfs: Number(sound.value) }; }, 'ev-sound', 'At most one per second.'),\n    ];\n  });\n\n  addPanel('hardware', 'Hardware', function () {\n    return [\n      group('Device', el('div', { class: 'row' },\n        el('label', {}, control('hw-network', el('input', { type: 'checkbox', id: 'hw-network' })), 'Network online'),\n        el('label', {}, control('hw-camera', el('input', { type: 'checkbox', id: 'hw-camera' })), 'Camera'),\n        el('label', {}, control('hw-ble', el('input', { type: 'checkbox', id: 'hw-ble' })), 'Bluetooth adapter'),\n        el('label', {}, control('hw-gpio', el('input', { type: 'checkbox', id: 'hw-gpio' })), 'GPIO chip')), el('div', { class: 'mono', id: 'scanner' })),\n      group('Serial ports', el('div', { class: 'list', id: 'serial' }), statusLine('serial-status')),\n      group('GPIO lines', el('div', { class: 'list', id: 'gpio' }), statusLine('gpio-status'),\n        el('div', { class: 'muted', text: 'Click a level to drive the line from outside (a button pressed). A floating line has nothing connected: it reads its pull (up is high, down is low) and its own level with none. The application hears a line it watches.' }),\n        el('div', { class: 'list', id: 'gpio-released' })),\n      group('HDMI input', el('div', { class: 'mono', id: 'hdmi' }), el('div', { class: 'muted', text: 'While device.hdmi_input is granted the application frame may use the camera and microphone, so hdmiInput.open() gets this browser capture device. Switching it loads the frame again.' })),\n      group('Bluetooth LE', el('div', { class: 'list', id: 'ble' }), statusLine('ble-status')),\n      group('Printers', el('div', { class: 'list', id: 'printers' }), el('div', { class: 'list', id: 'jobs' })),\n    ];\n  });\n\n  addPanel('ir-udp', 'IR and UDP', function () {\n    var irCode = el('input', { type: 'text', value: '0x20DF10', 'aria-label': 'NEC code' });\n    var irRepeat = el('input', { type: 'checkbox' });\n    var irEmitter = control('hw-ir-emitter', el('input', { type: 'checkbox', id: 'hw-ir-emitter' }));\n    var irReceiver = control('hw-ir-receiver', el('input', { type: 'checkbox', id: 'hw-ir-receiver' }));\n    var udpSocket = control('udp-socket', el('select', { id: 'udp-socket', 'aria-label': 'Socket' }));\n    var udpHost = el('input', { type: 'text', value: '127.0.0.1', size: 12, 'aria-label': 'Sender address' });\n    var udpPort = el('input', { type: 'number', value: '40000', min: 1, max: 65535 });\n    var udpData = el('input', { type: 'text', value: 'hello', 'aria-label': 'Datagram' });\n    var udpHex = el('input', { type: 'checkbox' });\n    function injectUdp() {\n      var body = { command: 'udp-inject', socket: udpSocket.value || undefined, host: udpHost.value, port: Number(udpPort.value) };\n      if (udpHex.checked) body.hex = udpData.value; else body.text = udpData.value;\n      command(body, 'udp-status');\n    }\n    return [\n      group('Infrared receiver', el('div', { class: 'row' }, field('NEC code', irCode), el('label', {}, irRepeat, 'repeat frame'), el('button', { type: 'button', text: 'Receive', onclick: function () {\n        var code = Number(irCode.value);\n        fire({ device: 'ir', code: code, repeat: irRepeat.checked }, 'ir-status');\n      } })), statusLine('ir-status'),\n        el('div', { class: 'muted', text: 'A received code reaches an application that watches ir. The code is 0 to 0xFFFFFF: the command in bits 0 to 7 and the address in bits 8 to 23. A repeat frame is the auto-repeat of a held button. A send of repeat n hands the emitter n + 1 frames.' }),\n        el('div', { class: 'row' }, el('label', {}, irEmitter, 'Infrared emitter (send)'), el('label', {}, irReceiver, 'Infrared receiver (receive)'))),\n      group('Codes the application sent', el('div', { class: 'list', id: 'ir-sent' })),\n      group('UDP sockets', el('div', { class: 'mono', id: 'udp-where' }), el('div', { class: 'list', id: 'udp-sockets' })),\n      group('Send a datagram to a socket', el('div', { class: 'row' }, udpSocket), el('div', { class: 'row' }, field('From', udpHost), udpPort),\n        el('div', { class: 'row' }, udpData, el('label', {}, udpHex, 'hex'), el('button', { type: 'button', text: 'Send', onclick: injectUdp }),\n          el('button', { type: 'button', text: 'Close socket (network fault)', title: 'The operating system closes the socket: the application hears closed with reason error', onclick: function () {\n            if (udpSocket.value) fire({ device: 'udp', socket: udpSocket.value, closed: true }, 'udp-status');\n          } })), statusLine('udp-status')),\n      group('Datagrams', el('div', { class: 'list', id: 'udp-log' }), el('div', { class: 'muted', text: 'A datagram the application sends to a loopback address reaches the socket bound there; one sent anywhere else is recorded here and never transmitted.' })),\n    ];\n  });\n\n  addPanel('kv', 'Stored values', function () {\n    return [group('K/V', el('div', { class: 'mono', id: 'kv-where' }), el('div', { id: 'kv-table' }), el('button', { type: 'button', text: 'Refresh', onclick: function () { loadKv(); } }))];\n  });\n\n  addPanel('log', 'Log', function () {\n    var debug = el('input', { type: 'checkbox', id: 'show-debug' });\n    debug.addEventListener('change', function () { showDebug = debug.checked; renderLog(); });\n    return [group('Events', el('div', { class: 'row' }, el('label', {}, debug, 'Show debug'), el('button', { type: 'button', class: 'small', text: 'Clear', onclick: function () { command({ command: 'clear-log' }); logEntries = []; renderLog(); } })), el('div', { class: 'log', id: 'log' }))];\n  });\n\n  var activeTab = 'launch';\n\n  function buildPanels() {\n    var tabs = $('tabs');\n    var panels = $('panels');\n    panelDefs.forEach(function (def) {\n      var tab = el('button', { type: 'button', role: 'tab', 'aria-selected': def.id === activeTab ? 'true' : 'false', text: def.title, onclick: function () { selectTab(def.id); } });\n      tab.dataset.tab = def.id;\n      tabs.appendChild(tab);\n      var panel = el('section', { class: 'panel' + (def.id === activeTab ? ' on' : ''), id: 'panel-' + def.id });\n      def.build().forEach(function (part) { panel.appendChild(part); });\n      panels.appendChild(panel);\n    });\n  }\n\n  function selectTab(id) {\n    activeTab = id;\n    Array.prototype.forEach.call($('tabs').children, function (tab) { tab.setAttribute('aria-selected', tab.dataset.tab === id ? 'true' : 'false'); });\n    panelDefs.forEach(function (def) { $('panel-' + def.id).className = 'panel' + (def.id === id ? ' on' : ''); });\n    if (id === 'kv') loadKv();\n    if (id === 'log') renderLog();\n  }\n\n  function renderCapabilities() {\n    var grid = $('cap-grid');\n    if (!grid.firstChild) {\n      state.capability_names.forEach(function (name) {\n        var box = el('input', { type: 'checkbox', id: 'cap-' + name });\n        box.addEventListener('change', function () { command({ command: 'capability', name: name, value: box.checked }); });\n        grid.appendChild(el('label', { class: 'row' }, box, el('span', { class: 'mono', text: name })));\n      });\n      state.feature_names.forEach(function (name) {\n        var box = el('input', { type: 'checkbox', id: 'feat-' + name });\n        box.addEventListener('change', function () { command({ command: 'feature', name: name, value: box.checked }); });\n        $('feature-grid').appendChild(el('label', { class: 'row' }, box, el('span', { class: 'mono', text: name })));\n      });\n    }\n    state.capability_names.forEach(function (name) { $('cap-' + name).checked = state.host.capabilities[name] === true; });\n    var advertised = state.host.features || [];\n    state.feature_names.forEach(function (name) { $('feat-' + name).checked = advertised.indexOf(name) >= 0; });\n  }\n\n  function seconds(ms) { return ms === null ? 'none' : (ms / 1000).toFixed(1) + ' s'; }\n\n  function renderStatic() {\n    setIfIdle(controls['width'], state.viewport.width);\n    setIfIdle(controls['height'], state.viewport.height);\n    controls['preset'].value = state.preset;\n    setIfIdle(controls['screen-name'], state.screen.name);\n    setIfIdle(controls['screen-zone'], state.screen.timezone);\n    if (document.activeElement !== controls['params']) controls['params'].value = Object.keys(state.params).map(function (k) { return k + '=' + state.params[k]; }).join('\\n');\n    $('ids').textContent = 'application_id ' + state.application_id + '\\nrelease_id     ' + state.release_id + '\\ndirectory      ' + state.directory;\n    $('ids').style.whiteSpace = 'pre-wrap';\n    controls['timer-enabled'].checked = state.timer.enabled;\n    setIfIdle(controls['timer-max'], state.timer.maxMs);\n    controls['loop'].checked = state.loop;\n    var host = state.host;\n    $('timing').textContent = 'elapsed ' + seconds(host.page.elapsed_ms) + '   remaining ' + seconds(host.page.remaining_ms) + '   ' + (host.page.paused ? 'held' : 'running');\n    $('playback').textContent = 'visibility.watch ' + (host.visibility_watching ? 'on' : 'off') + '   causes: ' + (host.held.length ? host.held.join(', ') : 'none') + '\\ndisplay ' + (host.display.on ? 'on' : 'off') + (host.display.brightness === null ? '' : ', brightness ' + host.display.brightness) + (host.display_held_dark ? ' (held dark)' : '') + '\\nwatching: ' + (host.watching.length ? host.watching.join(', ') : 'nothing') + '\\nready ' + host.ready + '   advanced ' + host.advanced;\n    $('playback').style.whiteSpace = 'pre-wrap';\n    $('btn-pause').textContent = host.held.indexOf('paused') >= 0 ? 'Resume' : 'Pause';\n    $('btn-dark').textContent = host.display_held_dark ? 'Light display' : 'Darken display';\n    var hardware = host.hardware;\n    wire('hw-network', host.network.online, function (v) { command({ command: 'hardware', change: 'network', value: v }); });\n    wire('hw-camera', hardware.camera.available, function (v) { command({ command: 'hardware', change: 'camera.available', value: v }); });\n    wire('hw-ble', hardware.ble.adapter, function (v) { command({ command: 'hardware', change: 'ble.adapter', value: v }); });\n    wire('hw-gpio', hardware.gpio.chip, function (v) { command({ command: 'hardware', change: 'gpio.chip', value: v }); });\n    wire('hw-ir-emitter', hardware.ir.emitter, function (v) { command({ command: 'hardware', change: 'ir.emitter', value: v }); });\n    wire('hw-ir-receiver', hardware.ir.receiver, function (v) { command({ command: 'hardware', change: 'ir.receiver', value: v }); });\n    $('hdmi').textContent = 'device.hdmi_input ' + (host.capabilities['device.hdmi_input'] ? 'granted: the frame allows camera and microphone' : 'not granted: the frame has no camera or microphone') + '\\nframe allow: ' + state.frame_allow;\n    $('hdmi').style.whiteSpace = 'pre-wrap';\n    $('scanner').textContent = 'scanner ' + (host.frame.scanning ? 'running' : 'stopped') + '   camera reads: ' + hardware.camera.formats.join(', ');\n  }\n\n  var wired = {};\n  function wire(id, value, onChange) {\n    var box = $(id);\n    box.checked = value;\n    if (!wired[id]) { wired[id] = true; box.addEventListener('change', function () { onChange(box.checked); }); }\n  }\n\n  function hexOf(base64) {\n    try { return Array.prototype.map.call(atob(base64), function (c) { return ('0' + c.charCodeAt(0).toString(16)).slice(-2); }).join(''); } catch (e) { return ''; }\n  }\n\n  function renderHardware() {\n    var host = state.host;\n    var hardware = host.hardware;\n    var serial = $('serial');\n    serial.textContent = '';\n    hardware.serial.ports.forEach(function (port) {\n      var open = host.frame.ports.filter(function (item) { return item.port === port.id; })[0];\n      var text = el('input', { type: 'text', placeholder: 'text to send', 'aria-label': 'Text to send to ' + port.id });\n      var echo = el('input', { type: 'checkbox' });\n      echo.checked = port.echo === true;\n      echo.addEventListener('change', function () { command({ command: 'hardware', change: 'serial.echo', id: port.id, value: echo.checked }); });\n      var busy = el('input', { type: 'checkbox' });\n      busy.checked = port.busy === true;\n      busy.addEventListener('change', function () { command({ command: 'hardware', change: 'serial.busy', id: port.id, value: busy.checked }); });\n      var item = el('div', { class: 'item' },\n        el('div', { class: 'head' }, el('span', { class: 'mono', text: port.id + '  ' + port.name }), el('span', { class: 'muted', text: open ? 'open ' + open.handle : 'closed' })),\n        el('div', { class: 'row' }, el('label', {}, echo, 'echo writes'), el('label', {}, busy, 'held by another process')));\n      if (open) {\n        item.appendChild(el('div', { class: 'row' }, text, el('button', { type: 'button', class: 'small', text: 'Send', onclick: function () { command({ command: 'serial-send', handle: open.handle, text: text.value }, 'serial-status'); } }),\n          el('button', { type: 'button', class: 'small', text: 'Unplug', onclick: function () { fire({ device: 'serial', handle: open.handle, closed: true, reason: 'unplugged' }, 'serial-status'); } }),\n          el('button', { type: 'button', class: 'small', text: 'Fail', onclick: function () { fire({ device: 'serial', handle: open.handle, closed: true, reason: 'error' }, 'serial-status'); } })));\n      }\n      serial.appendChild(item);\n    });\n    var gpio = $('gpio');\n    gpio.textContent = '';\n    hardware.gpio.pins.forEach(function (pin) {\n      var listened = host.frame.pins.indexOf(pin.pin) >= 0;\n      var key = String(pin.pin);\n      var level = host.frame.levels[key] === true;\n      var pull = host.frame.pull[key] || 'none';\n      var idle = host.frame.idle[key];\n      var levelButton = el('button', { type: 'button', class: 'small', text: level ? 'high' : 'low', onclick: function () { fire({ device: 'gpio', pin: pin.pin, value: !level }, 'gpio-status'); } });\n      var busy = el('input', { type: 'checkbox' });\n      busy.checked = pin.busy === true;\n      busy.addEventListener('change', function () { command({ command: 'hardware', change: 'pin.busy', id: key, value: busy.checked }); });\n      var floating = el('input', { type: 'checkbox' });\n      floating.checked = pin.floating === true;\n      floating.addEventListener('change', function () { command({ command: 'hardware', change: 'pin.floating', id: key, value: floating.checked }); });\n      var released = pin.floating === true && pin.driven !== undefined ? el('button', { type: 'button', class: 'small', text: 'Let go', title: 'Stop driving the line from outside: it floats to its pull again', onclick: function () { fire({ device: 'gpio', pin: pin.pin, value: null }, 'gpio-status'); } }) : null;\n      var notes = [];\n      if (listened) notes.push('application listens, pull ' + pull);\n      if (idle !== undefined) notes.push('written: let go at ' + (idle ? 'high' : 'low'));\n      gpio.appendChild(el('div', { class: 'item' },\n        el('div', { class: 'head' }, el('span', { class: 'mono', text: 'line ' + pin.pin }), el('span', { class: 'row' }, levelButton, released), el('span', { class: 'muted', text: notes.join('; ') })),\n        el('div', { class: 'row' }, el('label', {}, floating, 'nothing connected (floating)'), el('label', {}, busy, 'held by another process'))));\n    });\n    var letGo = $('gpio-released');\n    letGo.textContent = '';\n    host.frame.released.slice(-6).reverse().forEach(function (item) {\n      letGo.appendChild(el('div', { class: 'item' }, el('span', { class: 'mono', text: 'line ' + item.pin + ' driven ' + (item.value ? 'high' : 'low') + ' and released: ' + (item.cause === 'leaving' ? 'the page left the glass' : item.cause === 'context' ? 'its context ended' : 'it was destroyed') })));\n    });\n    var ble = $('ble');\n    ble.textContent = '';\n    hardware.ble.peripherals.forEach(function (peripheral) {\n      peripheral.services.forEach(function (service) {\n        service.characteristics.forEach(function (item) {\n          var subs = host.frame.subscriptions.filter(function (sub) { return sub.service === service.service && sub.characteristic === item.characteristic; });\n          var hex = el('input', { type: 'text', value: hexOf(item.value_base64), 'aria-label': 'Notification bytes in hexadecimal' });\n          ble.appendChild(el('div', { class: 'item' },\n            el('div', { class: 'head' }, el('span', { class: 'mono', text: peripheral.name + '  ' + service.service + ' / ' + item.characteristic }), el('span', { class: 'muted', text: subs.length + ' subscription' + (subs.length === 1 ? '' : 's') })),\n            el('div', { class: 'row' }, hex, el('button', { type: 'button', class: 'small', text: 'Notify', onclick: function () { command({ command: 'ble-notify', service: service.service, characteristic: item.characteristic, hex: hex.value }, 'ble-status'); } }))));\n        });\n      });\n    });\n    var printers = $('printers');\n    printers.textContent = '';\n    hardware.printers.forEach(function (printer) {\n      var failing = el('input', { type: 'checkbox' });\n      failing.checked = printer.failing === true;\n      failing.addEventListener('change', function () { command({ command: 'hardware', change: 'printer.failing', id: printer.id, value: failing.checked }); });\n      printers.appendChild(el('div', { class: 'item' }, el('div', { class: 'head' }, el('span', { class: 'mono', text: printer.id + '  ' + printer.name }), el('span', { class: 'muted', text: printer.formats.join(', ') + (printer.default ? ', default' : '') })), el('label', { class: 'row' }, failing, 'accepts jobs and fails them')));\n    });\n    var jobs = $('jobs');\n    jobs.textContent = '';\n    host.frame.printed.slice().reverse().forEach(function (job) {\n      jobs.appendChild(el('div', { class: 'item' }, el('div', { class: 'head' }, el('span', { class: 'mono', text: job.job }), el('span', { class: job.failed ? 'pill bad' : 'pill ok', text: (job.failed ? 'failed' : 'printed') + ' on ' + job.printer + ', ' + job.bytes + ' bytes, ' + job.format })), el('pre', { class: 'mono', text: job.preview })));\n    });\n  }\n\n  function hex(value) { var text = Number(value).toString(16).toUpperCase(); while (text.length < 6) text = '0' + text; return '0x' + text; }\n\n  function renderIrUdp() {\n    var frameState = state.host.frame;\n    var sent = $('ir-sent');\n    sent.textContent = '';\n    frameState.ir_sent.slice().reverse().forEach(function (item) {\n      sent.appendChild(el('div', { class: 'item' }, el('span', { class: 'mono', text: item.encoding + ' ' + hex(item.code) + (item.repeat ? ', sent ' + (item.repeat + 1) + ' times' : '') + '  wire ' + item.frames[0].map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join('') })));\n    });\n    if (!frameState.ir_sent.length) sent.appendChild(el('div', { class: 'muted', text: 'None yet.' }));\n    $('udp-where').textContent = frameState.udp_transport === 'loopback' ? 'Sockets bind on 127.0.0.1 only: a tool on this machine can send them datagrams.' : 'Sockets are simulated: nothing is bound.';\n    var select = $('udp-socket');\n    var chosen = select.value;\n    select.textContent = '';\n    frameState.sockets.forEach(function (socket) { select.appendChild(el('option', { value: socket.handle, text: socket.handle + (socket.port ? '  port ' + socket.port : '  send only') })); });\n    if (chosen) select.value = chosen;\n    var sockets = $('udp-sockets');\n    sockets.textContent = '';\n    frameState.sockets.forEach(function (socket) {\n      sockets.appendChild(el('div', { class: 'item' }, el('span', { class: 'mono', text: socket.handle + '  ' + (socket.port ? 'port ' + socket.port : 'send only') + (socket.broadcast ? ', broadcast' : '') + (socket.multicast ? ', multicast ' + socket.multicast : '') })));\n    });\n    if (!frameState.sockets.length) sockets.appendChild(el('div', { class: 'muted', text: 'The application holds no socket.' }));\n    var log = $('udp-log');\n    log.textContent = '';\n    frameState.datagrams.slice().reverse().forEach(function (item) {\n      var where = item.direction === 'sent' ? 'to ' : 'from ';\n      var how = item.direction === 'sent' ? (item.delivered ? ', delivered on loopback' : ', recorded only') : '';\n      log.appendChild(el('div', { class: 'item' }, el('div', { class: 'head' }, el('span', { class: 'mono', text: item.direction + ' ' + where + item.host + ':' + item.port + how }), el('span', { class: 'muted', text: item.bytes + ' bytes' })), el('pre', { class: 'mono', text: item.text + '\\n' + item.hex })));\n    });\n  }\n\n  function loadKv() {\n    fetch('/_dev/kv').then(function (response) { return response.json(); }).then(function (kv) {\n      $('kv-where').textContent = kv.mode + (kv.location ? '  ' + kv.location : '');\n      var table = $('kv-table');\n      table.textContent = '';\n      if (kv.problem) { table.appendChild(el('div', { class: 'status bad', text: kv.problem })); return; }\n      var body = el('tbody', {});\n      kv.items.forEach(function (item) {\n        body.appendChild(el('tr', {}, el('td', { class: 'mono', text: item.key }), el('td', { text: String(item.revision) }), el('td', { text: item.content_type + ', ' + item.bytes + ' bytes' }), el('td', { class: 'mono', text: item.preview })));\n      });\n      if (!kv.items.length) body.appendChild(el('tr', {}, el('td', { colspan: 4, class: 'muted', text: 'No keys.' })));\n      table.appendChild(el('table', { class: 'kv' }, el('thead', {}, el('tr', {}, el('th', { text: 'Key' }), el('th', { text: 'Rev' }), el('th', { text: 'Type' }), el('th', { text: 'Value' }))), body));\n    }, function () {});\n  }\n\n  function renderLog() {\n    var box = $('log');\n    if (!box) return;\n    box.textContent = '';\n    logEntries.slice(-300).forEach(function (entry) {\n      if (entry.level === 'debug' && !showDebug) return;\n      var time = entry.at ? entry.at.slice(11, 19) : '';\n      var text = (entry.code ? entry.code + '  ' : '') + (entry.message || '');\n      var row = el('div', { class: 'entry ' + (entry.level || '') }, el('span', { class: 't', text: time }), el('span', { class: 'k', text: entry.type }), el('div', {}, text ? el('div', { text: text }) : null,\n        entry.detail && Object.keys(entry.detail).length ? el('details', {}, el('summary', { text: 'detail' }), el('pre', { text: JSON.stringify(entry.detail, null, 2) })) : null));\n      box.appendChild(row);\n    });\n    box.scrollTop = box.scrollHeight;\n    var panel = $('panel-log');\n    if (panel && panel.className.indexOf('on') >= 0) $('panels').scrollTop = $('panels').scrollHeight;\n    if (entryNeedsKv()) { if (activeTab === 'kv') loadKv(); }\n  }\n\n  function entryNeedsKv() {\n    var last = logEntries[logEntries.length - 1];\n    return last && last.type === 'kv.changed';\n  }\n\n  var capabilitiesBuilt = false;\n\n  function render() {\n    renderTop();\n    renderBanners();\n    if (!capabilitiesBuilt) { capabilitiesBuilt = true; }\n    renderCapabilities();\n    renderStatic();\n    renderHardware();\n    renderIrUdp();\n    layoutFrame();\n    renderLog();\n  }\n\n  $('btn-restart').addEventListener('click', function () { command({ command: 'restart' }); });\n  $('btn-reload').addEventListener('click', function () { command({ command: 'reload' }); });\n  buildPanels();\n  connect();\n}());\n"])));
function harnessHtml() {
  return HTML;
}
function harnessCss() {
  return CSS;
}
function harnessScript() {
  return SCRIPT;
}

// dist/dev/release.js
import { createHash as createHash2 } from "node:crypto";
var TYPES = {
  html: "text/html; charset=utf-8",
  htm: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  json: "application/json; charset=utf-8",
  map: "application/json; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  xml: "application/xml; charset=utf-8",
  svg: "image/svg+xml",
  webmanifest: "application/manifest+json",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  ico: "image/x-icon",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  wasm: "application/wasm",
  pdf: "application/pdf"
};
function contentTypeOf(file) {
  const dot = file.lastIndexOf(".");
  return (dot < 0 ? void 0 : TYPES[file.slice(dot + 1).toLowerCase()]) ?? "application/octet-stream";
}
function located(detail) {
  const match = /^([^\n:]+):(\d+): /.exec(detail);
  return match ? { file: match[1], line: Number(match[2]) } : {};
}
function refusalOf(error) {
  if (error instanceof CliError)
    return { code: error.problem.code, detail: error.problem.detail, ...located(error.problem.detail) };
  const detail = error instanceof Error ? error.message : String(error);
  return { code: "unreadable", detail };
}
async function buildDevRelease(directory, revision, options = {}) {
  try {
    const built = await releaseEntries(directory, options);
    const files = /* @__PURE__ */ new Map();
    for (const entry of built.entries) {
      if (entry.type !== "file" || !entry.data)
        continue;
      files.set(entry.path, {
        path: entry.path,
        data: entry.data,
        type: contentTypeOf(entry.path),
        etag: '"'.concat(createHash2("sha256").update(entry.data).digest("hex").slice(0, 32), '"')
      });
    }
    return { ok: true, release: { revision, files, file_count: built.file_count, expanded_bytes: built.expanded_bytes, sdk_sha256: built.sdk_injection.asset_sha256, built_at: (/* @__PURE__ */ new Date()).toISOString() } };
  } catch (error) {
    return { ok: false, refusal: refusalOf(error) };
  }
}
function lookupFile(release, requestPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(requestPath);
  } catch {
    return void 0;
  }
  if (decoded.includes("\0") || decoded.includes("\\"))
    return void 0;
  const parts = decoded.split("/").filter((part) => part !== "");
  if (parts.some((part) => part === "." || part === ".."))
    return void 0;
  const joined = parts.join("/");
  if (joined !== "" && !decoded.endsWith("/")) {
    const direct = release.files.get(joined);
    if (direct)
      return direct;
  }
  return release.files.get(joined === "" ? "index.html" : "".concat(joined, "/index.html"));
}

// dist/dev/session.js
import { createHash as createHash3 } from "node:crypto";

// dist/dev/bridge-protocol.js
var PROTOCOL = "1";
var PARENT_HANDSHAKE_PROTOCOL = "screenrig.parent-handshake/1";
var MAX_MESSAGE_BYTES = 65536;
var DEVICE_CHUNK_BYTES = 32768;
var MAX_SERIAL_PORTS = 4;
var MAX_BLE_SUBSCRIPTIONS = 8;
var MAX_GPIO_PINS = 16;
var MAX_UDP_SOCKETS = 4;
var MAX_UDP_BYTES = 8192;
var MAX_IR_REPEAT = 10;
var MAX_IR_CODE = 16777215;
var PLAYER_UDP_PORTS = [49817, 49818];
var MAX_PRINT_BYTES = 4194304;
var PRINT_IDLE_MS = 3e4;
var SKIP_WINDOW_MS = 1e4;
var CAPABILITY_NAMES = [
  "page.advance",
  "page.skip",
  "kv.read",
  "kv.write",
  "device.display",
  "device.presence",
  "device.keys",
  "device.light",
  "device.network",
  "device.haptics",
  "device.scan",
  "device.camera",
  "device.sound",
  "device.serial",
  "device.gpio",
  "device.ble",
  "device.print",
  "device.ir",
  "device.udp",
  "device.hdmi_input"
];
var FEATURE_NAMES = [
  "ready",
  "log",
  "event.emit",
  "page.advance",
  "page.skip",
  "kv.get",
  "kv.list",
  "kv.set",
  "kv.delete",
  "kv.watch",
  "device.display",
  "device.watch",
  "device.vibrate",
  "device.scan",
  "device.scanner",
  "device.people",
  "device.camera",
  "device.sound",
  "device.serial",
  "device.gpio",
  "device.ble",
  "device.print",
  "device.gpio.pull",
  "device.gpio.idle",
  "device.ir",
  "device.ir.send",
  "device.udp",
  "device.hdmi_input",
  "visibility.watch",
  "page.timing",
  "context.params",
  "context.screen"
];
var IMPLIED_FEATURES = {
  "device.ir": ["device.ir.send"],
  // Older Players advertised camera as one feature for both scanner controls
  // and people-count events.
  "device.camera": ["device.scanner", "device.people"]
};
function advertises(features, feature) {
  return features.includes(feature) || features.some((held) => IMPLIED_FEATURES[held]?.includes(feature) === true);
}
var BASELINE_FEATURES = [
  "context",
  "ready",
  "log",
  "event.emit",
  "page.advance",
  "viewport.changed",
  "kv.get",
  "kv.list",
  "kv.set",
  "kv.delete",
  "response.ack",
  "response.problem"
];
var KIND_FEATURES = {
  "device.scanner.start": "device.scanner",
  "device.scanner.stop": "device.scanner",
  "device.serial.list": "device.serial",
  "device.serial.open": "device.serial",
  "device.serial.write": "device.serial",
  "device.serial.close": "device.serial",
  "device.gpio.write": "device.gpio",
  "device.gpio.watch": "device.gpio",
  "device.udp.open": "device.udp",
  "device.udp.send": "device.udp",
  "device.udp.close": "device.udp",
  "device.ble.read": "device.ble",
  "device.ble.watch": "device.ble",
  "device.ble.unwatch": "device.ble",
  "device.print": "device.print",
  "device.printers": "device.print"
};
function featureOf(kind) {
  return Object.prototype.hasOwnProperty.call(KIND_FEATURES, kind) ? KIND_FEATURES[kind] : kind;
}
var WATCH_EVENTS = [
  { name: "display", capability: "device.display", feature: "device.display" },
  { name: "presence", capability: "device.presence", feature: "device.watch" },
  { name: "keys", capability: "device.keys", feature: "device.watch" },
  { name: "light", capability: "device.light", feature: "device.watch" },
  { name: "network", capability: "device.network", feature: "device.watch" },
  { name: "scan", capability: "device.scan", feature: "device.scan" },
  { name: "people", capability: "device.camera", feature: "device.people" },
  { name: "sound", capability: "device.sound", feature: "device.sound" },
  { name: "serial", capability: "device.serial", feature: "device.serial" },
  { name: "gpio", capability: "device.gpio", feature: "device.gpio" },
  { name: "ble", capability: "device.ble", feature: "device.ble" },
  { name: "ir", capability: "device.ir", feature: "device.ir" },
  { name: "udp", capability: "device.udp", feature: "device.udp" }
];
function allCapabilities(value) {
  return Object.fromEntries(CAPABILITY_NAMES.map((name) => [name, value]));
}
var ID_RE = /^[A-Za-z0-9._-]{8,128}$/;
var KIND_RE = /^[A-Za-z0-9._-]{1,64}$/;
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// dist/dev/bridge-host.js
import { randomBytes as randomBytes2 } from "node:crypto";

// dist/dev/hardware-requests.js
import { randomBytes } from "node:crypto";

// dist/dev/hardware.js
function pinLevel(spec, pull) {
  if (spec.floating !== true)
    return spec.value;
  if (spec.driven !== void 0)
    return spec.driven;
  return pull === "up" ? true : pull === "down" ? false : spec.value;
}
var SCAN_FORMATS = ["qr", "ean13", "ean8", "upca", "upce", "code128", "code39", "code93", "itf", "codabar", "datamatrix", "pdf417", "aztec"];
function defaultHardware() {
  return {
    camera: { available: true, formats: ["qr", "ean13", "upca", "code128"] },
    serial: {
      ports: [
        { id: "ttyUSB0", name: "FT232R USB UART", vendor_id: 1027, product_id: 24577, echo: true },
        { id: "ttyACM0", name: "Arduino Uno", vendor_id: 9025, product_id: 67, busy: true }
      ]
    },
    gpio: { chip: true, pins: [{ pin: 17, value: false, floating: true }, { pin: 27, value: true, floating: true }, { pin: 22, value: false, busy: true }] },
    ir: { emitter: true, receiver: true },
    ble: {
      adapter: true,
      peripherals: [{ name: "HRM-Strap", address: "aa:bb:cc:dd:ee:ff", services: [{ service: "180d", characteristics: [{ characteristic: "2a37", value_base64: "ABg=" }] }] }]
    },
    printers: [
      { id: "usb:epson-tm-t20", name: "Epson TM-T20", formats: ["escpos"], default: true },
      { id: "office", name: "Office laser", formats: ["pdf"] },
      { id: "jammed", name: "Jammed receipt printer", formats: ["escpos"], failing: true }
    ]
  };
}
function unknownMembers(value, allowed) {
  return Object.keys(value).filter((key) => !allowed.includes(key));
}
var BLE_UUID = /^(?:[0-9a-f]{4}|[0-9a-f]{8}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;
var HANDLE = /^[A-Za-z0-9_-]{8,64}$/;
var BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
function base64Length(value) {
  if (typeof value !== "string" || !BASE64.test(value))
    return void 0;
  const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
  return value.length / 4 * 3 - padding;
}
function validDeviceId(value) {
  return typeof value === "string" && value.length >= 1 && value.length <= 128 && !/[\u0000-\u001f\u007f]/.test(value);
}

// dist/dev/udp.js
import dgram from "node:dgram";
function isLoopbackHost(host) {
  return host === "localhost" || /^127(?:\.\d{1,3}){3}$/.test(host);
}
var SimulatedUdp = class {
  busy;
  kind = "simulated";
  constructor(busy = []) {
    this.busy = busy;
  }
  async bind(request) {
    if (this.busy.includes(request.port))
      return { ok: false, reason: "busy", detail: "Port ".concat(request.port, " is held by another process.") };
    return {
      ok: true,
      bound: { port: request.port, send: async () => ({ delivered: false }), close: () => void 0 }
    };
  }
};
var LoopbackUdp = class {
  kind = "loopback";
  bind(request, onPacket) {
    return new Promise((resolve) => {
      const socket = dgram.createSocket({ type: "udp4", reuseAddr: false });
      let settled = false;
      socket.once("error", (error) => {
        if (settled)
          return;
        settled = true;
        try {
          socket.close();
        } catch {
        }
        resolve({ ok: false, reason: error.code === "EADDRINUSE" || error.code === "EACCES" ? "busy" : "failed", detail: "".concat(error.code ?? "error", ": ").concat(error.message) });
      });
      socket.once("listening", () => {
        settled = true;
        socket.on("error", () => void 0);
        socket.on("message", (data, remote) => onPacket({ fromHost: remote.address, fromPort: remote.port, data }));
        resolve({
          ok: true,
          bound: {
            port: socket.address().port,
            send: (host, port, data) => new Promise((done) => {
              if (!isLoopbackHost(host)) {
                done({ delivered: false });
                return;
              }
              socket.send(data, port, "127.0.0.1", (error) => done(error === null ? { delivered: true } : { delivered: false, failed: true }));
            }),
            close: () => {
              try {
                socket.close();
              } catch {
              }
            }
          }
        });
      });
      socket.bind(request.port, "127.0.0.1");
    });
  }
};

// dist/dev/hardware-requests.js
var ok = (result, effect) => ({ ok: true, ...result === void 0 ? {} : { result }, ...effect === void 0 ? {} : { effect } });
var refuse = (code, status, detail) => ({ ok: false, code, status, detail });
var invalid = (detail) => refuse("invalid_request", 400, detail);
var BINDING = ["generation", "nonce"];
function necWire(code) {
  const command = code & 255;
  return [code >> 8 & 255, code >> 16 & 255, command, command ^ 255];
}
function necFromWire(wire) {
  if (!/^[0-9a-f]{8}$/i.test(wire))
    return "wire is four bytes in hexadecimal";
  const [low, high, command, complement] = [0, 2, 4, 6].map((at) => parseInt(wire.slice(at, at + 2), 16));
  if ((command ^ complement) !== 255)
    return "the last byte is not the complement of the command";
  return command | low << 8 | high << 16;
}
function validUdpHost(value) {
  if (typeof value !== "string" || value.length < 1 || value.length > 253)
    return false;
  const octets = value.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (octets)
    return octets.slice(1).every((part) => Number(part) <= 255);
  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(value) || /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+local$/i.test(value);
}
function validPort(value, from) {
  return typeof value === "number" && Number.isInteger(value) && value >= from && value <= 65535;
}
function validMulticast(value) {
  const match = typeof value === "string" ? value.match(/^239\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/) : null;
  return match !== null && match.slice(1).every((part) => Number(part) <= 255);
}
function handleId(prefix) {
  return "".concat(prefix, "_").concat(randomBytes(6).toString("hex"));
}
function printable(bytes, format) {
  if (format === "pdf")
    return bytes.subarray(0, 24).toString("hex");
  return bytes.toString("latin1").replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, "\xB7").slice(0, 400);
}
var FrameDevice = class {
  hardware;
  clock;
  activity;
  udp;
  heard;
  scanning = false;
  ports = /* @__PURE__ */ new Map();
  watchedPins = [];
  subscriptions = /* @__PURE__ */ new Map();
  /** The bias of each watched line that has one; a line with no entry has none. */
  pulls = /* @__PURE__ */ new Map();
  /** The lines the page wrote and the level each is let go at (the latest write's `idle`). */
  written = /* @__PURE__ */ new Map();
  /** What the Player did when the page let go of lines, newest last. */
  released = [];
  sockets = /* @__PURE__ */ new Map();
  /** The datagrams this frame sent and heard, newest last. */
  datagrams = [];
  /** The codes this frame sent, newest last. */
  irSent = [];
  job;
  bindings = /* @__PURE__ */ new Map();
  opening = 0;
  epoch = 0;
  /** The jobs this frame printed, newest last. */
  printed = [];
  constructor(hardware, clock, activity, udp, heard = () => void 0) {
    this.hardware = hardware;
    this.clock = clock;
    this.activity = activity;
    this.udp = udp;
    this.heard = heard;
  }
  /** The frame's context ended: everything it held goes. Lines it wrote are let go first (`releaseLines`). */
  reset() {
    this.epoch += 1;
    this.scanning = false;
    this.ports.clear();
    this.watchedPins = [];
    this.pulls.clear();
    this.written.clear();
    this.subscriptions.clear();
    for (const binding of this.bindings.values())
      binding.close();
    this.bindings.clear();
    this.sockets.clear();
    this.job = void 0;
  }
  get udpKind() {
    return this.udp.kind;
  }
  // Scanner.
  scannerStart(payload) {
    if (unknownMembers(payload, [...BINDING, "formats"]).length > 0)
      return invalid("device.scanner.start takes only formats.");
    let wanted;
    if (payload.formats !== void 0) {
      const formats = payload.formats;
      if (!Array.isArray(formats) || formats.length < 1 || formats.length > SCAN_FORMATS.length)
        return invalid("formats is 1 to 13 symbology names.");
      if (formats.some((name) => typeof name !== "string" || !SCAN_FORMATS.includes(name)))
        return invalid("formats names an unknown symbology.");
      if (new Set(formats).size !== formats.length)
        return invalid("formats repeats a symbology.");
      wanted = formats;
    }
    if (!this.hardware.camera.available)
      return refuse("camera_unavailable", 503, "The device has no camera the page may use.");
    const decoded = (wanted ?? this.hardware.camera.formats).filter((name) => this.hardware.camera.formats.includes(name));
    if (decoded.length > 0)
      this.scanning = true;
    this.activity({ type: "device.scanner.start", detail: { formats: decoded } });
    return ok({ formats: decoded });
  }
  scannerStop() {
    this.scanning = false;
    this.activity({ type: "device.scanner.stop", detail: {} });
    return ok();
  }
  // Serial.
  serialList() {
    const ports = this.hardware.serial.ports.slice(0, 16).map((port) => ({
      id: port.id,
      name: port.name,
      ...port.vendor_id === void 0 ? {} : { vendor_id: port.vendor_id },
      ...port.product_id === void 0 ? {} : { product_id: port.product_id }
    }));
    return ok({ ports });
  }
  serialOpen(payload) {
    if (unknownMembers(payload, [...BINDING, "port", "baud_rate", "data_bits", "stop_bits", "parity", "flow_control"]).length > 0)
      return invalid("device.serial.open takes port and the line settings only.");
    if (!validDeviceId(payload.port))
      return invalid("port must be a port id.");
    const baud = payload.baud_rate;
    if (typeof baud !== "number" || !Number.isInteger(baud) || baud < 50 || baud > 4e6)
      return invalid("baud_rate is an integer from 50 to 4000000.");
    if (payload.data_bits !== void 0 && ![5, 6, 7, 8].includes(payload.data_bits))
      return invalid("data_bits is 5, 6, 7 or 8.");
    if (payload.stop_bits !== void 0 && ![1, 2].includes(payload.stop_bits))
      return invalid("stop_bits is 1 or 2.");
    if (payload.parity !== void 0 && !["none", "even", "odd"].includes(payload.parity))
      return invalid("parity is none, even or odd.");
    if (payload.flow_control !== void 0 && !["none", "hardware"].includes(payload.flow_control))
      return invalid("flow_control is none or hardware.");
    const spec = this.hardware.serial.ports.find((port) => port.id === payload.port);
    if (!spec)
      return refuse("port_not_found", 404, "No serial port is named ".concat(payload.port, "."));
    if (spec.busy || [...this.ports.values()].some((open) => open.port === spec.id))
      return refuse("port_busy", 409, "".concat(spec.id, " is held by another process."));
    if (this.ports.size >= MAX_SERIAL_PORTS)
      return refuse("port_limit", 409, "A frame holds at most 4 open ports.");
    const handle = handleId("ser");
    this.ports.set(handle, { handle, port: spec.id });
    this.activity({ type: "device.serial.open", detail: { port: spec.id, handle, baud_rate: baud, data_bits: payload.data_bits ?? 8, stop_bits: payload.stop_bits ?? 1, parity: payload.parity ?? "none", flow_control: payload.flow_control ?? "none" } });
    return ok({ handle });
  }
  /** The bytes of a write that was accepted; `echo` says the simulated device answers with the same bytes. */
  serialWrite(payload) {
    if (unknownMembers(payload, [...BINDING, "handle", "data_base64"]).length > 0)
      return invalid("device.serial.write takes handle and data_base64 only.");
    if (typeof payload.handle !== "string" || payload.handle.length === 0)
      return invalid("handle must be a serial handle.");
    const length = base64Length(payload.data_base64);
    if (length === void 0 || length < 1)
      return invalid("data_base64 must be 1 or more bytes of base64.");
    if (length > DEVICE_CHUNK_BYTES)
      return refuse("payload_too_large", 413, "A write is at most 32768 bytes.");
    const port = this.ports.get(payload.handle);
    if (!port)
      return refuse("invalid_handle", 404, "This frame holds no open port with that handle.");
    if (port.failing)
      return refuse("io_failed", 502, "".concat(port.port, " failed the write."));
    const bytes = Buffer.from(payload.data_base64, "base64");
    this.activity({ type: "device.serial.write", detail: { port: port.port, handle: port.handle, bytes: bytes.length, hex: bytes.subarray(0, 64).toString("hex"), text: bytes.subarray(0, 64).toString("latin1").replace(/[^\x20-\x7e]/g, ".") } });
    const echo = this.hardware.serial.ports.find((spec) => spec.id === port.port)?.echo ? port.handle : void 0;
    return ok(void 0, { bytes, ...echo === void 0 ? {} : { echo } });
  }
  serialClose(payload) {
    if (typeof payload.handle === "string" && this.ports.delete(payload.handle))
      this.activity({ type: "device.serial.close", detail: { handle: payload.handle } });
    return ok();
  }
  // GPIO.
  /** `idleOk` is whether the host advertises `device.gpio.idle`, which makes `idle` a member of the write. */
  gpioWrite(payload, idleOk) {
    if (unknownMembers(payload, [...BINDING, "pin", "value", ...idleOk ? ["idle"] : []]).length > 0)
      return invalid(idleOk ? "device.gpio.write takes pin, value and idle only." : "device.gpio.write takes pin and value only.");
    const pin = payload.pin;
    if (typeof pin !== "number" || !Number.isInteger(pin) || pin < 0 || pin > 255)
      return invalid("pin is an integer from 0 to 255.");
    if (typeof payload.value !== "boolean")
      return invalid("value must be true or false.");
    if (payload.idle !== void 0 && typeof payload.idle !== "boolean")
      return invalid("idle must be true or false.");
    const problem = this.gpioProblem([pin]);
    if (problem)
      return problem;
    const idle = idleOk ? payload.idle ?? false : void 0;
    if (idle !== void 0)
      this.written.set(pin, idle);
    this.activity({ type: "device.gpio.write", detail: { pin, value: payload.value, ...idle === void 0 ? {} : { idle } } });
    return ok(void 0, { pin, value: payload.value });
  }
  /** What a line reads now, by the bias the frame requested it with. */
  gpioLevel(pin) {
    const spec = this.hardware.gpio.pins.find((candidate) => candidate.pin === pin);
    return spec === void 0 ? void 0 : pinLevel(spec, this.pulls.get(pin));
  }
  /** Something drives a line to a level: an output the page wrote, or the outside (a button, a signal). */
  gpioDrive(pin, value) {
    const spec = this.hardware.gpio.pins.find((candidate) => candidate.pin === pin);
    if (!spec)
      return;
    spec.value = spec.floating === true ? spec.value : value;
    if (spec.floating === true)
      spec.driven = value;
  }
  /** The outside lets go of a line: it floats to its bias again. */
  gpioFloat(pin) {
    const spec = this.hardware.gpio.pins.find((candidate) => candidate.pin === pin);
    if (spec)
      spec.driven = void 0;
  }
  /**
   * The page lets go: each line it wrote is driven to its idle level, in
   * ascending pin order, and released. What was driven is returned and kept for
   * the panel.
   */
  releaseLines(cause) {
    const drives = [...this.written.entries()].sort(([left], [right]) => left - right).map(([pin, value]) => ({ pin, value }));
    this.written.clear();
    for (const { pin, value } of drives) {
      const spec = this.hardware.gpio.pins.find((candidate) => candidate.pin === pin);
      if (spec) {
        spec.value = value;
        spec.driven = void 0;
      }
      this.released.push({ pin, value, cause, at: this.clock() });
      if (this.released.length > 20)
        this.released.shift();
      this.activity({ type: "device.gpio.release", detail: { pin, value, cause } });
    }
    return drives;
  }
  gpioProblem(pins) {
    if (!this.hardware.gpio.chip)
      return refuse("gpio_unavailable", 503, "The device has no GPIO chip the Player can open.");
    for (const pin of pins) {
      const spec = this.hardware.gpio.pins.find((candidate) => candidate.pin === pin);
      if (!spec)
        return refuse("pin_not_found", 404, "The device has no line ".concat(pin, "."));
      if (spec.busy)
        return refuse("pin_busy", 409, "Line ".concat(pin, " is held by another process."));
    }
    return void 0;
  }
  /**
   * `watching` is whether the frame's latest device.watch names gpio; `pullOk`
   * whether the host advertises `device.gpio.pull`, which makes `pull` a member.
   * The effect lists the lines to post: each one newly in the set and each whose
   * level changed because its bias did.
   */
  gpioWatch(payload, watching, pullOk) {
    if (unknownMembers(payload, [...BINDING, "pins", ...pullOk ? ["pull"] : []]).length > 0)
      return invalid(pullOk ? "device.gpio.watch takes pins and pull only." : "device.gpio.watch takes pins only.");
    const pins = payload.pins;
    if (!Array.isArray(pins) || pins.length > MAX_GPIO_PINS || pins.some((pin) => typeof pin !== "number" || !Number.isInteger(pin) || pin < 0 || pin > 255) || new Set(pins).size !== pins.length) {
      return invalid("pins is at most 16 distinct integers from 0 to 255.");
    }
    const pulls = /* @__PURE__ */ new Map();
    if (payload.pull !== void 0) {
      if (!isRecord2(payload.pull))
        return invalid("pull is an object keyed by pin.");
      for (const [key, value] of Object.entries(payload.pull)) {
        if (!/^(?:0|[1-9]\d{0,2})$/.test(key) || !pins.includes(Number(key)))
          return invalid("pull names ".concat(key.slice(0, 12), ", which is not a pin in pins."));
        if (value !== "up" && value !== "down" && value !== "none")
          return invalid("pull is up, down or none.");
        if (value !== "none")
          pulls.set(Number(key), value);
      }
    }
    if (!watching)
      return invalid("device.gpio.watch follows a device.watch that names gpio.");
    const problem = this.gpioProblem(pins);
    if (problem)
      return problem;
    const before = new Map(this.watchedPins.map((pin) => [pin, this.gpioLevel(pin)]));
    this.watchedPins = [...pins];
    this.pulls.clear();
    for (const [pin, pull] of pulls)
      this.pulls.set(pin, pull);
    const post = this.watchedPins.filter((pin) => !before.has(pin) || before.get(pin) !== this.gpioLevel(pin));
    this.activity({ type: "device.gpio.watch", detail: { pins: this.watchedPins, ...pulls.size > 0 ? { pull: Object.fromEntries([...pulls].map(([pin, pull]) => [String(pin), pull])) } : {} } });
    return ok({ pins: this.watchedPins }, { post });
  }
  // Infrared.
  /** The page sends one NEC code. */
  irSend(payload) {
    if (unknownMembers(payload, [...BINDING, "encoding", "code", "repeat"]).length > 0)
      return invalid("device.ir.send takes encoding, code and repeat only.");
    if (payload.encoding !== "NEC")
      return invalid("encoding is NEC.");
    const code = payload.code;
    if (typeof code !== "number" || !Number.isInteger(code) || code < 0 || code > MAX_IR_CODE)
      return invalid("code is a whole number from 0 to 16777215 (0xFFFFFF).");
    const repeat = payload.repeat;
    if (repeat !== void 0 && (typeof repeat !== "number" || !Number.isInteger(repeat) || repeat < 0 || repeat > MAX_IR_REPEAT))
      return invalid("repeat is a whole number from 0 to 10.");
    if (!this.hardware.ir.emitter)
      return refuse("ir_unavailable", 503, "The device has no infrared emitter the page may use.");
    const frames = Array.from({ length: (repeat ?? 0) + 1 }, () => necWire(code));
    const sent = { encoding: "NEC", code, repeat: repeat ?? 0, frames, at: this.clock() };
    this.irSent.push(sent);
    if (this.irSent.length > 20)
      this.irSent.shift();
    this.activity({ type: "device.ir.send", detail: { encoding: sent.encoding, code, hex: "0x".concat(code.toString(16).toUpperCase().padStart(6, "0")), repeat: sent.repeat, wire: frames[0].map((byte) => byte.toString(16).padStart(2, "0")).join(""), frames: frames.length } });
    return ok();
  }
  // UDP.
  /** Opens a socket; `port` 0 is a send-only socket. The socket ends with the frame's context. */
  async udpOpen(payload) {
    if (unknownMembers(payload, [...BINDING, "port", "broadcast", "multicast"]).length > 0)
      return invalid("device.udp.open takes port, broadcast and multicast only.");
    const port = payload.port;
    if (typeof port !== "number" || !Number.isInteger(port) || port !== 0 && !validPort(port, 1024))
      return invalid("port is 0 or a whole number from 1024 to 65535.");
    if (payload.broadcast !== void 0 && typeof payload.broadcast !== "boolean")
      return invalid("broadcast must be true or false.");
    if (payload.multicast !== void 0 && !validMulticast(payload.multicast))
      return invalid("multicast is an address of the form 239.x.x.x.");
    if (port === 0 && payload.multicast !== void 0)
      return invalid("multicast needs a port to bind.");
    if (PLAYER_UDP_PORTS.includes(port))
      return refuse("port_busy", 409, "Port ".concat(port, " is the Player's own."));
    if (port !== 0 && [...this.sockets.values()].some((open) => open.port === port))
      return refuse("port_busy", 409, "This frame holds port ".concat(port, " already."));
    if (this.sockets.size + this.opening >= MAX_UDP_SOCKETS)
      return refuse("socket_limit", 409, "A frame holds at most 4 UDP sockets.");
    const epoch = this.epoch;
    this.opening += 1;
    const handle = handleId("udp");
    let bind;
    try {
      bind = await this.udp.bind({ port }, (packet) => this.heard(handle, packet));
    } finally {
      this.opening -= 1;
    }
    if (!bind.ok)
      return refuse(bind.reason === "busy" ? "port_busy" : "io_failed", bind.reason === "busy" ? 409 : 502, bind.detail);
    if (epoch !== this.epoch) {
      bind.bound.close();
      return refuse("invalid_request", 400, "The context ended before the socket opened.");
    }
    const state = { handle, port: port === 0 ? 0 : bind.bound.port, broadcast: payload.broadcast === true, ...payload.multicast === void 0 ? {} : { multicast: payload.multicast } };
    this.sockets.set(handle, state);
    this.bindings.set(handle, bind.bound);
    this.activity({ type: "device.udp.open", detail: { socket: handle, port: state.port, broadcast: state.broadcast, ...state.multicast ? { multicast: state.multicast } : {}, transport: this.udp.kind } });
    return ok({ socket: handle });
  }
  async udpSend(payload) {
    if (unknownMembers(payload, [...BINDING, "socket", "host", "port", "data_base64"]).length > 0)
      return invalid("device.udp.send takes socket, host, port and data_base64 only.");
    if (typeof payload.socket !== "string" || payload.socket.length === 0)
      return invalid("socket must be a socket handle.");
    if (!validUdpHost(payload.host))
      return invalid("host is an IPv4 address, a .local name or a LAN name.");
    if (!validPort(payload.port, 1))
      return invalid("port is a whole number from 1 to 65535.");
    const length = base64Length(payload.data_base64);
    if (length === void 0 || length < 1)
      return invalid("data_base64 must be 1 or more bytes of base64.");
    if (length > MAX_UDP_BYTES)
      return refuse("payload_too_large", 413, "A datagram is at most 8192 bytes.");
    const binding = this.bindings.get(payload.socket);
    const socket = this.sockets.get(payload.socket);
    if (!binding || !socket)
      return refuse("invalid_handle", 404, "This frame holds no open socket with that handle.");
    const bytes = Buffer.from(payload.data_base64, "base64");
    const result = await binding.send(payload.host, payload.port, bytes);
    if (result.failed)
      return refuse("io_failed", 502, "The network refused the datagram.");
    this.noteDatagram({ direction: "sent", socket: socket.handle, host: payload.host, port: payload.port, bytes, delivered: result.delivered });
    return ok();
  }
  /** The operating system closed a socket on its own: it is gone. */
  udpEnded(handle) {
    this.sockets.delete(handle);
    this.bindings.get(handle)?.close();
    this.bindings.delete(handle);
    this.activity({ type: "device.udp.closed", detail: { socket: handle, reason: "error" } });
  }
  /** For the conformance fixtures: a socket the frame already holds, which may fail its sends. */
  restoreSocket(state, failing) {
    this.sockets.set(state.handle, state);
    this.bindings.set(state.handle, { port: state.port, send: async () => failing ? { delivered: false, failed: true } : { delivered: false }, close: () => void 0 });
  }
  udpClose(payload) {
    if (typeof payload.socket === "string" && this.sockets.delete(payload.socket)) {
      this.bindings.get(payload.socket)?.close();
      this.bindings.delete(payload.socket);
      this.activity({ type: "device.udp.close", detail: { socket: payload.socket } });
    }
    return ok();
  }
  /** A datagram the frame heard, for the panel's list. */
  noteHeard(handle, host, port, bytes) {
    this.noteDatagram({ direction: "received", socket: handle, host, port, bytes });
  }
  noteDatagram(input) {
    const { bytes } = input;
    const entry = {
      direction: input.direction,
      socket: input.socket,
      host: input.host,
      port: input.port,
      bytes: bytes.length,
      hex: bytes.subarray(0, 64).toString("hex"),
      text: bytes.subarray(0, 64).toString("latin1").replace(/[^\x20-\x7e]/g, "."),
      ...input.delivered === void 0 ? {} : { delivered: input.delivered },
      at: this.clock()
    };
    this.datagrams.push(entry);
    if (this.datagrams.length > 30)
      this.datagrams.shift();
    this.activity({
      type: input.direction === "sent" ? "device.udp.send" : "device.udp.receive",
      detail: { socket: entry.socket, [input.direction === "sent" ? "to" : "from"]: "".concat(entry.host, ":").concat(entry.port), bytes: entry.bytes, hex: entry.hex, text: entry.text, ...entry.delivered === void 0 ? {} : { delivered: entry.delivered ? "loopback" : isLoopbackHost(entry.host) ? "failed" : "recorded only: the harness never reaches the network" } }
    });
  }
  // Bluetooth LE.
  bleTarget(payload) {
    if (unknownMembers(payload, [...BINDING, "service", "characteristic", "device"]).length > 0)
      return invalid("A Bluetooth target is service, characteristic and device only.");
    if (typeof payload.service !== "string" || !BLE_UUID.test(payload.service))
      return invalid("service must be a lower case 4, 8 or 36 character UUID.");
    if (typeof payload.characteristic !== "string" || !BLE_UUID.test(payload.characteristic))
      return invalid("characteristic must be a lower case 4, 8 or 36 character UUID.");
    if (payload.device !== void 0 && (typeof payload.device !== "string" || payload.device.length < 1 || payload.device.length > 64))
      return invalid("device is an advertised name or an address of 1 to 64 characters.");
    return { service: payload.service, characteristic: payload.characteristic, ...payload.device === void 0 ? {} : { device: payload.device } };
  }
  bleFind(target) {
    if (!this.hardware.ble.adapter)
      return refuse("ble_unavailable", 503, "The device has no Bluetooth adapter the page may use.");
    const wanted = target.device?.toLowerCase();
    const peripheral = this.hardware.ble.peripherals.find((candidate) => (wanted === void 0 || candidate.name.toLowerCase() === wanted || candidate.address.toLowerCase() === wanted) && candidate.services.some((service) => service.service === target.service));
    if (!peripheral)
      return refuse("device_not_found", 404, target.device ? "No peripheral ".concat(target.device, " advertises ").concat(target.service, ".") : "No peripheral advertises ".concat(target.service, "."));
    const characteristic = peripheral.services.find((service) => service.service === target.service)?.characteristics.find((candidate) => candidate.characteristic === target.characteristic);
    if (!characteristic)
      return refuse("characteristic_not_found", 404, "".concat(peripheral.name, " has no characteristic ").concat(target.characteristic, " in ").concat(target.service, "."));
    return { characteristic };
  }
  bleRead(payload) {
    const target = this.bleTarget(payload);
    if ("ok" in target)
      return target;
    const found = this.bleFind(target);
    if ("ok" in found)
      return found;
    this.activity({ type: "device.ble.read", detail: { ...target } });
    return ok({ value_base64: found.characteristic.value_base64 });
  }
  bleWatch(payload, watching) {
    const target = this.bleTarget(payload);
    if ("ok" in target)
      return target;
    if (!watching)
      return invalid("device.ble.watch follows a device.watch that names ble.");
    const found = this.bleFind(target);
    if ("ok" in found)
      return found;
    if (this.subscriptions.size >= MAX_BLE_SUBSCRIPTIONS)
      return refuse("subscription_limit", 409, "A frame holds at most 8 subscriptions.");
    const subscription = handleId("ble");
    this.subscriptions.set(subscription, { subscription, ...target });
    this.activity({ type: "device.ble.watch", detail: { subscription, ...target } });
    return ok({ subscription });
  }
  bleUnwatch(payload) {
    if (typeof payload.subscription === "string" && this.subscriptions.delete(payload.subscription))
      this.activity({ type: "device.ble.unwatch", detail: { subscription: payload.subscription } });
    return ok();
  }
  // Printing.
  printers() {
    return ok({ printers: this.hardware.printers.slice(0, 16).map((printer) => ({ id: printer.id, name: printer.name, formats: printer.formats, ...printer.default ? { default: true } : {} })) });
  }
  /** One chunk of a job. The job is assembled per frame; an idle one is discarded. */
  print(payload) {
    const now = this.clock();
    if (this.job && now - this.job.touched > PRINT_IDLE_MS)
      this.job = void 0;
    if (unknownMembers(payload, [...BINDING, "job", "seq", "last", "data_base64", "format", "total_bytes", "printer"]).length > 0)
      return invalid("device.print takes job, seq, last, data_base64, format, total_bytes and printer only.");
    const length = base64Length(payload.data_base64);
    if (length !== void 0 && length > DEVICE_CHUNK_BYTES)
      return refuse("payload_too_large", 413, "A chunk is at most 32768 bytes.");
    if (typeof payload.job !== "string" || !HANDLE.test(payload.job))
      return invalid("job must be 8 to 64 of A-Z a-z 0-9 _ -.");
    if (typeof payload.seq !== "number" || !Number.isInteger(payload.seq) || payload.seq < 0)
      return invalid("seq must be a whole number from 0.");
    if (typeof payload.last !== "boolean")
      return invalid("last must be true or false.");
    if (length === void 0 || length < 1)
      return invalid("data_base64 must be 1 to 32768 bytes of base64.");
    const data = Buffer.from(payload.data_base64, "base64");
    if (payload.seq === 0) {
      if (payload.format !== "escpos" && payload.format !== "pdf")
        return invalid("The first chunk carries format escpos or pdf.");
      const total = payload.total_bytes;
      if (typeof total !== "number" || !Number.isInteger(total) || total < 1)
        return invalid("The first chunk carries total_bytes, a whole number from 1.");
      if (total > MAX_PRINT_BYTES)
        return refuse("payload_too_large", 413, "A job is at most 4194304 bytes.");
      if (payload.printer !== void 0 && !validDeviceId(payload.printer))
        return invalid("printer must be a printer id.");
      let printer;
      if (payload.printer !== void 0) {
        printer = this.hardware.printers.find((candidate) => candidate.id === payload.printer);
        if (!printer)
          return refuse("printer_not_found", 404, "No printer is named ".concat(payload.printer, "."));
        if (!printer.formats.includes(payload.format))
          return invalid("".concat(printer.id, " does not print ").concat(payload.format, "."));
      } else {
        const capable = this.hardware.printers.filter((candidate) => candidate.formats.includes(payload.format));
        printer = capable.find((candidate) => candidate.default) ?? capable[0];
        if (!printer)
          return refuse("printer_not_found", 404, "No printer prints ".concat(payload.format, "."));
      }
      this.job = { id: payload.job, nextSeq: 0, format: payload.format, printer, total, chunks: [], received: 0, touched: now };
    } else {
      if (payload.format !== void 0 || payload.total_bytes !== void 0 || payload.printer !== void 0)
        return invalid("Only the first chunk carries format, total_bytes and printer.");
      if (!this.job || this.job.id !== payload.job) {
        this.job = void 0;
        return invalid("This chunk does not continue the job in progress.");
      }
    }
    const job = this.job;
    if (payload.seq !== job.nextSeq) {
      this.job = void 0;
      return invalid("Expected chunk ".concat(job.nextSeq, " of the job, got ").concat(payload.seq, "."));
    }
    job.chunks.push(data);
    job.received += data.length;
    job.nextSeq += 1;
    job.touched = now;
    if (job.received > job.total) {
      this.job = void 0;
      return invalid("The chunks add up to more than total_bytes.");
    }
    if (payload.last === false)
      return ok();
    this.job = void 0;
    if (job.received !== job.total)
      return invalid("The chunks do not add up to total_bytes.");
    const bytes = Buffer.concat(job.chunks);
    const failed = job.printer.failing === true;
    this.printed.push({ job: job.id, printer: job.printer.id, format: job.format, bytes: bytes.length, failed, at: now, preview: printable(bytes, job.format) });
    if (this.printed.length > 20)
      this.printed.shift();
    this.activity({ type: "device.print", detail: { job: job.id, printer: job.printer.id, format: job.format, bytes: bytes.length, failed } });
    if (failed)
      return refuse("print_failed", 502, "".concat(job.printer.name, " accepted the job and failed it."));
    return ok();
  }
  /** The state of the frame's hardware in the fixtures' `host.hardware` shape (open ports, watched lines, subscriptions, scanner), and what the panel adds. */
  state() {
    return {
      scanning: this.scanning,
      ports: [...this.ports.values()],
      pins: this.watchedPins,
      subscriptions: [...this.subscriptions.values()],
      printed: this.printed,
      pull: Object.fromEntries([...this.pulls].map(([pin, pull]) => [String(pin), pull])),
      levels: Object.fromEntries(this.hardware.gpio.pins.map((spec) => [String(spec.pin), pinLevel(spec, this.pulls.get(spec.pin))])),
      idle: Object.fromEntries([...this.written].map(([pin, idle]) => [String(pin), idle])),
      released: this.released,
      sockets: [...this.sockets.values()],
      datagrams: this.datagrams,
      udp_transport: this.udp.kind,
      ir_sent: this.irSent
    };
  }
};

// dist/dev/bridge-host.js
var SCAN_SOURCES = ["scanner", "nfc", "camera"];
var NFC_FORMATS = ["uid", "ndef_text", "ndef_uri"];
var FORMAT_RE = /^[a-z0-9_]{1,32}$/;
var KEYS = ["volume_up", "volume_down"];
var PARAM_NAME = /^[a-z0-9_]{1,32}$/;
var MAX_PARAMS = 16;
var MAX_PARAM_CODE_POINTS = 512;
function codePoints(text) {
  let count = 0;
  for (const _ of text)
    count += 1;
  return count;
}
function contextMembers(manifest) {
  const out = {};
  if (isRecord2(manifest?.launchParams)) {
    const valid = [];
    for (const [name2, value] of Object.entries(manifest.launchParams)) {
      if (!PARAM_NAME.test(name2) || name2 === "ticket" || name2 === "policy")
        continue;
      if (typeof value !== "string" || codePoints(value) > MAX_PARAM_CODE_POINTS)
        continue;
      valid.push([name2, value]);
    }
    valid.sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
    if (valid.length > 0)
      out.params = Object.fromEntries(valid.slice(0, MAX_PARAMS));
  }
  const name = typeof manifest?.screenLabel === "string" && manifest.screenLabel.length > 0 && manifest.screenLabel.length <= 200 && !/[\u0000-\u001f\u007f-\u009f]/.test(manifest.screenLabel) ? manifest.screenLabel : void 0;
  const timezone = typeof manifest?.timezone === "string" && manifest.timezone.length > 0 ? manifest.timezone : void 0;
  if (name !== void 0 || timezone !== void 0)
    out.screen = { ...name === void 0 ? {} : { name }, ...timezone === void 0 ? {} : { timezone } };
  return out;
}
function sanitizeSkipReason(reason) {
  if (typeof reason !== "string")
    return void 0;
  const text = [...reason.replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").trim()].slice(0, 64).join("");
  return text === "" ? void 0 : text;
}
var BridgeHost = class {
  options;
  generation = 0;
  nonce;
  active = false;
  readied = false;
  advanced = false;
  ended;
  held = /* @__PURE__ */ new Set();
  visibilityWatching = false;
  kvWatching = false;
  watching = /* @__PURE__ */ new Set();
  display = { on: true, brightness: 0.5 };
  darkHeld = false;
  network = { online: true };
  maxMs = null;
  activatedAt = 0;
  startedAt = 0;
  pausedAt;
  pausedTotal = 0;
  leftPosted = false;
  limits = { codes: /* @__PURE__ */ new Map() };
  sequence = 0;
  lastOpened;
  lastUdp;
  unsubscribeKv;
  frame;
  onPageEnd;
  constructor(options) {
    this.options = options;
    this.frame = new FrameDevice(options.hardware, options.clock, (activity) => this.options.log({ type: activity.type, detail: activity.detail }), options.udp ?? new SimulatedUdp(), (socket, packet) => {
      this.trigger({ device: "udp", socket, from_host: packet.fromHost, from_port: packet.fromPort, data_base64: packet.data.toString("base64") });
    });
    this.unsubscribeKv = options.kv.subscribe((change) => this.kvChanged(change));
  }
  destroy() {
    this.unsubscribeKv?.();
    this.unsubscribeKv = void 0;
    this.frame.releaseLines("destroyed");
    this.frame.reset();
    this.active = false;
  }
  get capabilities() {
    return this.options.capabilities;
  }
  // Activation and handshake.
  id(prefix) {
    this.sequence += 1;
    return "".concat(prefix, "_").concat(randomBytes2(8).toString("hex"));
  }
  newContext() {
    this.frame.releaseLines("context");
    this.active = false;
    this.readied = false;
    this.advanced = false;
    this.ended = void 0;
    this.visibilityWatching = false;
    this.kvWatching = false;
    this.leftPosted = false;
    this.watching = /* @__PURE__ */ new Set();
    this.limits = { codes: /* @__PURE__ */ new Map() };
    this.frame.reset();
    const now = this.options.clock();
    this.activatedAt = now;
    this.startedAt = now;
    this.pausedTotal = 0;
    this.pausedAt = this.held.size > 0 ? now : void 0;
  }
  /** A frame loaded: a new generation and nonce, and the parent handshake that offers them. */
  beginActivation() {
    this.generation += 1;
    this.nonce = randomBytes2(16).toString("hex");
    this.newContext();
    this.options.post({ protocol: PARENT_HANDSHAKE_PROTOCOL, kind: "parent.handshake", challenge: this.nonce });
  }
  /** For the conformance fixtures: the state after a handshake, without the handshake. */
  activateAs(generation, nonce) {
    this.generation = generation;
    this.nonce = nonce;
    this.newContext();
    this.active = true;
  }
  /** The page is leaving the glass and the frame ends with it. */
  endContext() {
    this.leaving();
    this.active = false;
    this.nonce = void 0;
    this.frame.reset();
  }
  envelope(kind, payload) {
    return { protocol: PROTOCOL, message_id: this.id("msg"), kind, primitive_id: this.options.primitiveId, payload };
  }
  bound(payload) {
    return { ...payload, generation: this.generation, nonce: this.nonce };
  }
  contextMessage() {
    const size = this.options.viewport;
    const members = contextMembers(this.options.manifest);
    return this.envelope("context", {
      application_id: this.options.applicationId,
      release_id: this.options.releaseId,
      primitive_id: this.options.primitiveId,
      generation: this.generation,
      nonce: this.nonce,
      player_origin: this.options.playerOrigin,
      capabilities: { ...this.options.capabilities },
      viewport: { ...size },
      primitive: { ...size },
      placement: { ...size },
      ...this.options.features === null ? {} : { features: [...this.options.features] },
      ...members.params ? { params: members.params } : {},
      ...members.screen ? { screen: members.screen } : {}
    });
  }
  /** Re-sends the context with the same binding to refresh capabilities, features or sizes; nothing ends. */
  refreshContext() {
    if (this.active)
      this.options.post(this.contextMessage());
  }
  setViewport(size) {
    this.options.viewport = { ...size };
    if (!this.active)
      return;
    this.options.post(this.envelope("viewport.changed", this.bound({ viewport: { ...size }, primitive: { ...size }, placement: { ...size } })));
  }
  setCapability(name, value) {
    this.options.capabilities[name] = value;
    this.refreshContext();
  }
  setFeatures(features) {
    this.options.features = features;
    this.refreshContext();
  }
  supports(kind) {
    const feature = featureOf(kind);
    return advertises(this.options.features === null ? BASELINE_FEATURES : this.options.features, feature);
  }
  // Inbound messages.
  /** One message from the application's window. `origin` is the sender's origin when the caller knows it. */
  async receive(data, origin) {
    if (!isRecord2(data))
      return;
    if (data.protocol === PARENT_HANDSHAKE_PROTOCOL) {
      if (!this.active && data.kind === "child.handshake" && this.nonce !== void 0 && data.challenge === this.nonce && data.parent_origin === this.options.playerOrigin && (origin === void 0 || origin === this.options.appOrigin)) {
        this.active = true;
        this.options.post(this.contextMessage());
        this.options.log({ type: "activated", detail: { generation: this.generation } });
      }
      return;
    }
    if (!this.active || this.nonce === void 0)
      return;
    if (data.protocol !== PROTOCOL || data.primitive_id !== this.options.primitiveId)
      return;
    if (typeof data.message_id !== "string" || !ID_RE.test(data.message_id))
      return;
    if (typeof data.kind !== "string" || !KIND_RE.test(data.kind) || !isRecord2(data.payload))
      return;
    const payload = data.payload;
    if (payload.generation !== this.generation || payload.nonce !== this.nonce)
      return;
    if (Buffer.byteLength(JSON.stringify(data)) > MAX_MESSAGE_BYTES)
      return;
    await this.dispatch({ message_id: data.message_id, kind: data.kind, payload });
  }
  reply(request, outcome, at) {
    if (at.generation !== this.generation || at.nonce !== this.nonce || !this.active)
      return;
    if (outcome.ok) {
      const message = this.envelope("response.ack", this.bound({ request_message_id: request.message_id, ...outcome.result === void 0 ? {} : { result: outcome.result } }));
      if (JSON.stringify(message).length > MAX_MESSAGE_BYTES) {
        this.problem(request, "internal_error", 413, "The answer is larger than a message may be.", at);
        return;
      }
      this.options.post(message);
    } else {
      this.problem(request, outcome.code, outcome.status, outcome.detail, at, outcome);
    }
  }
  problem(request, code, status, detail, at, extra = {}) {
    if (at.generation !== this.generation || at.nonce !== this.nonce || !this.active)
      return;
    this.options.post(this.envelope("response.problem", this.bound({
      request_message_id: request.message_id,
      problem: { code, status, detail, request_id: extra.request_id ?? "dev_".concat(this.sequence.toString(36).padStart(6, "0")), ...extra.current_revision === void 0 ? {} : { current_revision: extra.current_revision } }
    })));
  }
  async dispatch(request) {
    const at = { generation: this.generation, nonce: this.nonce };
    const { kind, payload } = request;
    switch (kind) {
      case "log":
        this.recordLog(payload);
        return;
      case "kv.watch":
        this.watchKv();
        return;
      case "visibility.watch":
        if (this.supports(kind)) {
          this.visibilityWatching = true;
          this.options.log({ type: "visibility.watch", level: "debug" });
        }
        return;
      case "device.watch":
        if (this.supports(kind))
          this.deviceWatch(payload);
        return;
      default:
        break;
    }
    const handler = this.requests[kind];
    if (!handler || !this.supports(kind)) {
      this.problem(request, "not_supported", 501, "The harness does not implement ".concat(kind.slice(0, 64), "."), at);
      return;
    }
    if (handler.capability && !this.options.capabilities[handler.capability]) {
      this.problem(request, "forbidden", 403, "".concat(kind, " needs the ").concat(handler.capability, " capability."), at);
      return;
    }
    try {
      const outcome = await handler.run.call(this, payload, request);
      if (outcome === void 0)
        return;
      this.reply(request, outcome, at);
      if (outcome.ok && at.generation === this.generation && at.nonce === this.nonce)
        outcome.after?.();
    } catch (error) {
      this.problem(request, "internal_error", 500, error instanceof Error ? error.message : String(error), at);
    }
  }
  requests = {
    "ready": { run: () => {
      this.readied = true;
      this.options.log({ type: "ready" });
      return { ok: true };
    } },
    "event.emit": { run: this.emitEvent },
    "page.advance": { capability: "page.advance", run: this.pageAdvance },
    "page.skip": { capability: "page.skip", run: this.pageSkip },
    "page.timing": { run: this.pageTimingRequest },
    "kv.get": { capability: "kv.read", run: this.kvGet },
    "kv.list": { capability: "kv.read", run: this.kvList },
    "kv.set": { capability: "kv.write", run: this.kvSet },
    "kv.delete": { capability: "kv.write", run: this.kvDelete },
    "device.display": { capability: "device.display", run: this.deviceDisplay },
    "device.vibrate": { capability: "device.haptics", run: this.deviceVibrate },
    "device.scanner.start": { capability: "device.camera", run: this.scannerStart },
    "device.scanner.stop": { capability: "device.camera", run: () => this.frame.scannerStop() },
    "device.serial.list": { capability: "device.serial", run: () => this.frame.serialList() },
    "device.serial.open": { capability: "device.serial", run: (payload) => {
      const outcome = this.frame.serialOpen(payload);
      if (outcome.ok)
        this.lastOpened = outcome.result.handle;
      return outcome;
    } },
    "device.serial.write": { capability: "device.serial", run: this.serialWrite },
    "device.serial.close": { capability: "device.serial", run: (payload) => this.frame.serialClose(payload) },
    "device.gpio.write": { capability: "device.gpio", run: this.gpioWrite },
    "device.gpio.watch": { capability: "device.gpio", run: this.gpioWatch },
    "device.ir.send": { capability: "device.ir", run: (payload) => this.frame.irSend(payload) },
    "device.udp.open": { capability: "device.udp", run: async (payload) => {
      const outcome = await this.frame.udpOpen(payload);
      if (outcome.ok)
        this.lastUdp = outcome.result.socket;
      return outcome;
    } },
    "device.udp.send": { capability: "device.udp", run: (payload) => this.frame.udpSend(payload) },
    "device.udp.close": { capability: "device.udp", run: (payload) => this.frame.udpClose(payload) },
    "device.ble.read": { capability: "device.ble", run: (payload) => this.frame.bleRead(payload) },
    "device.ble.watch": { capability: "device.ble", run: (payload) => this.frame.bleWatch(payload, this.watching.has("ble")) },
    "device.ble.unwatch": { capability: "device.ble", run: (payload) => this.frame.bleUnwatch(payload) },
    "device.printers": { capability: "device.print", run: () => this.frame.printers() },
    "device.print": { capability: "device.print", run: (payload) => this.frame.print(payload) }
  };
  // Notifications.
  recordLog(payload) {
    const level = payload.level === "debug" || payload.level === "info" || payload.level === "warn" || payload.level === "error" ? payload.level : "info";
    const code = typeof payload.code === "string" ? payload.code.slice(0, 64) : "";
    const message = typeof payload.message === "string" ? payload.message.slice(0, 2048) : "";
    this.options.log({ type: "log", level, code, message });
  }
  watchKv() {
    if (!this.options.capabilities["kv.read"] || !this.supports("kv.watch"))
      return;
    this.kvWatching = true;
    this.options.log({ type: "kv.watch", level: "debug" });
  }
  kvChanged(change) {
    this.options.log({ type: "kv.changed", detail: { key: change.key, revision: change.revision ?? null, deleted: change.deleted } });
    if (!this.active || !this.kvWatching)
      return;
    this.options.post(this.envelope("kv.changed", this.bound({ key: change.key, ...change.deleted ? {} : { revision: change.revision }, deleted: change.deleted })));
  }
  // Requests.
  async emitEvent(payload) {
    if (typeof payload.code !== "string" || !/^[A-Za-z0-9._-]{1,64}$/.test(payload.code))
      return { ok: false, code: "invalid_request", status: 400, detail: "code must be 1 to 64 of A-Z a-z 0-9 . _ -." };
    const answer = await this.options.events.emit(payload.code, this.options.primitiveId);
    return answer.ok ? { ok: true } : { ...answer };
  }
  pageAdvance() {
    if (this.advanced)
      return { ok: false, code: "forbidden", status: 403, detail: "page.advance is one-shot per activation." };
    this.advanced = true;
    this.finish("advance");
    return { ok: true };
  }
  pageSkip(payload) {
    const now = this.options.clock();
    if (this.readied || now - this.activatedAt > SKIP_WINDOW_MS)
      return { ok: false, code: "forbidden", status: 403, detail: "page.skip is a start-time decision: not after ready, nor after the skip window." };
    const reason = sanitizeSkipReason(payload.reason);
    this.finish("skip", reason);
    return { ok: true };
  }
  finish(end, detail) {
    if (this.ended)
      return;
    this.ended = end;
    this.options.log({ type: end === "skip" ? "page.skip" : end === "advance" ? "page.advance" : "page.end", detail: { ...detail === void 0 ? {} : { reason: detail }, reason_kind: end } });
    this.onPageEnd?.(end, detail);
  }
  /** Ends the page at its max_ms when the timer has run out. */
  checkPageEnd() {
    if (this.ended || this.maxMs === null || this.active === false)
      return;
    if (this.elapsedMs() >= this.maxMs)
      this.finish("max_ms");
  }
  elapsedMs() {
    const now = this.options.clock();
    return Math.max(0, Math.floor((this.pausedAt ?? now) - this.startedAt - this.pausedTotal));
  }
  remainingMs() {
    return this.maxMs === null ? null : Math.max(0, Math.floor(this.maxMs - this.elapsedMs()));
  }
  pageTimingRequest() {
    return { ok: true, result: { elapsed_ms: this.elapsedMs(), remaining_ms: this.remainingMs(), paused: this.held.size > 0 } };
  }
  /** For the conformance fixtures: the page timer as the `host.page` of a fixture states it. */
  restorePage(page) {
    const now = this.options.clock();
    this.held.clear();
    for (const cause of page.held)
      this.held.add(cause);
    this.startedAt = now - page.elapsedMs;
    this.pausedTotal = 0;
    this.pausedAt = this.held.size > 0 ? now : void 0;
    this.maxMs = page.remainingMs === null ? null : page.elapsedMs + page.remainingMs;
    this.visibilityWatching = page.visibilityWatching;
  }
  /** The page's own max_ms and whether the page timer restarts. */
  startTimer(maxMs) {
    const now = this.options.clock();
    this.maxMs = maxMs;
    this.startedAt = now;
    this.pausedTotal = 0;
    this.pausedAt = this.held.size > 0 ? now : void 0;
    this.ended = void 0;
  }
  async kvGet(payload) {
    if (!validKvKey(payload.key))
      return { ok: false, code: "invalid_request", status: 400, detail: "key must be a valid key." };
    return this.kvOutcome(await this.options.kv.get(payload.key), (entry) => entry);
  }
  async kvList() {
    return this.kvOutcome(await this.options.kv.list(), (items) => ({ items }));
  }
  async kvSet(payload) {
    if (!validKvKey(payload.key))
      return { ok: false, code: "invalid_request", status: 400, detail: "key must be a valid key." };
    if (typeof payload.value_base64 !== "string" || base64Length(payload.value_base64) === void 0)
      return { ok: false, code: "invalid_request", status: 400, detail: "value_base64 must be base64." };
    if (payload.content_type !== void 0 && typeof payload.content_type !== "string")
      return { ok: false, code: "invalid_request", status: 400, detail: "content_type must be a string." };
    if (typeof payload.idempotency_key !== "string")
      return { ok: false, code: "invalid_request", status: 400, detail: "idempotency_key must be a string." };
    const expected = payload.expected_revision;
    if (expected !== void 0 && (typeof expected !== "number" || !Number.isSafeInteger(expected) || expected < 0))
      return { ok: false, code: "invalid_request", status: 400, detail: "expected_revision must be a non-negative integer." };
    const result = await this.options.kv.set(payload.key, {
      valueBase64: payload.value_base64,
      contentType: payload.content_type ?? "application/octet-stream",
      idempotencyKey: payload.idempotency_key,
      ...expected === void 0 ? {} : { expectedRevision: expected }
    });
    return this.kvOutcome(result, (entry) => entry);
  }
  async kvDelete(payload) {
    if (!validKvKey(payload.key))
      return { ok: false, code: "invalid_request", status: 400, detail: "key must be a valid key." };
    if (typeof payload.idempotency_key !== "string")
      return { ok: false, code: "invalid_request", status: 400, detail: "idempotency_key must be a string." };
    const expected = payload.expected_revision;
    if (expected !== void 0 && (typeof expected !== "number" || !Number.isSafeInteger(expected) || expected < 0))
      return { ok: false, code: "invalid_request", status: 400, detail: "expected_revision must be a non-negative integer." };
    const result = await this.options.kv.delete(payload.key, { idempotencyKey: payload.idempotency_key, ...expected === void 0 ? {} : { expectedRevision: expected } });
    return this.kvOutcome(result, () => void 0);
  }
  kvOutcome(result, shape) {
    if (result.ok) {
      const body = shape(result.value);
      return body === void 0 ? { ok: true } : { ok: true, result: body };
    }
    const { problem } = result;
    return { ok: false, code: problem.code, status: problem.status, detail: problem.detail, request_id: problem.request_id, ...problem.current_revision === void 0 ? {} : { current_revision: problem.current_revision } };
  }
  // Display, vibration.
  effectiveOn() {
    return this.display.on && !this.darkHeld;
  }
  displayState() {
    return { on: this.effectiveOn(), brightness: this.display.brightness };
  }
  deviceDisplay(payload) {
    if (unknownMembers(payload, ["generation", "nonce", "on", "brightness"]).length > 0)
      return { ok: false, code: "invalid_request", status: 400, detail: "device.display takes on and brightness only." };
    if (payload.on !== void 0 && typeof payload.on !== "boolean")
      return { ok: false, code: "invalid_request", status: 400, detail: "on must be true or false." };
    const brightness = payload.brightness;
    if (brightness !== void 0 && (typeof brightness !== "number" || !Number.isFinite(brightness) || brightness < 0 || brightness > 1))
      return { ok: false, code: "invalid_request", status: 400, detail: "brightness is a number from 0 to 1." };
    const before = this.displayState();
    if (payload.on !== void 0)
      this.display.on = payload.on;
    if (brightness !== void 0)
      this.display.brightness = brightness;
    this.options.log({ type: "device.display", detail: { requested: { on: payload.on ?? null, brightness: brightness ?? null }, effective: this.displayState() } });
    this.displayEffectiveChanged(before);
    return { ok: true, result: this.displayState() };
  }
  deviceVibrate(payload) {
    if (unknownMembers(payload, ["generation", "nonce", "ms"]).length > 0)
      return { ok: false, code: "invalid_request", status: 400, detail: "device.vibrate takes ms only." };
    const ms = payload.ms;
    if (typeof ms !== "number" || !Number.isInteger(ms) || ms < 1 || ms > 200)
      return { ok: false, code: "invalid_request", status: 400, detail: "ms is a whole number from 1 to 200." };
    this.options.log({ type: "device.vibrate", detail: { ms } });
    return { ok: true };
  }
  scannerStart(payload) {
    if (!this.options.capabilities["device.scan"])
      return { ok: false, code: "forbidden", status: 403, detail: "device.scanner.start needs the device.scan capability as well." };
    return this.frame.scannerStart(payload);
  }
  // Serial and GPIO with their pushes.
  serialWrite(payload) {
    const outcome = this.frame.serialWrite(payload);
    if (!outcome.ok)
      return outcome;
    const echo = outcome.effect?.echo;
    const bytes = outcome.effect?.bytes;
    return { ok: true, ...echo === void 0 ? {} : { after: () => {
      this.trigger({ device: "serial", handle: echo, data_base64: bytes.toString("base64") });
    } } };
  }
  gpioWrite(payload) {
    const outcome = this.frame.gpioWrite(payload, this.supports("device.gpio.idle"));
    if (!outcome.ok)
      return outcome;
    const { pin, value } = outcome.effect;
    return { ok: true, after: () => {
      this.trigger({ device: "gpio", pin, value });
    } };
  }
  gpioWatch(payload) {
    const outcome = this.frame.gpioWatch(payload, this.watching.has("gpio"), this.supports("device.gpio.pull"));
    if (!outcome.ok)
      return outcome;
    const post = outcome.effect?.post ?? [];
    return {
      ok: true,
      result: outcome.result,
      after: () => {
        for (const pin of post) {
          const value = this.frame.gpioLevel(pin);
          if (value !== void 0 && this.frame.watchedPins.includes(pin) && this.watching.has("gpio"))
            this.deviceEvent({ type: "gpio", pin, value });
        }
      }
    };
  }
  // device.watch.
  deviceWatch(payload) {
    const requested = Array.isArray(payload.events) ? payload.events.filter((name) => typeof name === "string") : [];
    const next = /* @__PURE__ */ new Set();
    for (const event of WATCH_EVENTS) {
      if (requested.includes(event.name) && this.options.capabilities[event.capability] && this.supports(event.feature))
        next.add(event.name);
    }
    const before = this.watching;
    this.watching = next;
    if (!next.has("gpio")) {
      this.frame.watchedPins = [];
      this.frame.pulls.clear();
    }
    if (!next.has("ble"))
      this.frame.subscriptions.clear();
    for (const name of next)
      if (!before.has(name))
        this.limits = { ...this.limits, ...this.fresh(name) };
    this.options.log({ type: "device.watch", level: "debug", detail: { events: [...next] } });
    if (next.has("network") && !before.has("network"))
      this.deviceEvent({ type: "network", online: this.network.online });
  }
  fresh(name) {
    switch (name) {
      case "light":
        return { light: void 0 };
      case "people":
        return { people: void 0 };
      case "sound":
        return { sound: void 0 };
      case "presence":
        return { presence: void 0 };
      case "scan":
        return { scan: void 0 };
      default:
        return {};
    }
  }
  deviceEvent(payload) {
    if (!this.active)
      return;
    this.options.post(this.envelope("device.event", this.bound(payload)));
    this.options.log({ type: "device.event.".concat(String(payload.type)), level: "debug", detail: Object.fromEntries(Object.entries(payload).filter(([key]) => key !== "type")) });
  }
  // Visibility.
  cause(cause, on) {
    const now = this.options.clock();
    if (on) {
      if (this.held.has(cause))
        return;
      const empty = this.held.size === 0;
      this.held.add(cause);
      if (empty)
        this.pausedAt = now;
      if (empty)
        this.postVisible(false, cause);
    } else {
      if (!this.held.has(cause))
        return;
      this.held.delete(cause);
      if (this.held.size === 0) {
        if (this.pausedAt !== void 0)
          this.pausedTotal += now - this.pausedAt;
        this.pausedAt = void 0;
        this.postVisible(true, cause);
      }
    }
  }
  postVisible(visible, reason) {
    if (!this.active || !this.visibilityWatching || this.leftPosted)
      return;
    this.options.post(this.envelope("visibility.changed", this.bound({ visible, reason })));
    this.options.log({ type: "visibility.changed", level: "debug", detail: { visible, reason } });
  }
  /** Best effort, once: the frame is about to be torn down or hidden. The page lets go of the lines it wrote; what the Player drove is returned. */
  leaving() {
    if (this.active && !this.leftPosted) {
      this.postVisible(false, "leaving");
      this.leftPosted = true;
    }
    return this.frame.releaseLines("leaving");
  }
  setPaused(paused) {
    this.cause("paused", paused);
  }
  displayEffectiveChanged(before) {
    const after = this.displayState();
    if (after.on === before.on && after.brightness === before.brightness)
      return;
    if (this.watching.has("display"))
      this.deviceEvent({ type: "display", on: after.on, brightness: after.brightness });
    this.cause("display", !after.on);
  }
  /** The screen's schedule or an operator holds the display dark (or releases it). */
  holdDisplayDark(dark) {
    const before = this.displayState();
    this.darkHeld = dark;
    this.displayEffectiveChanged(before);
  }
  // Triggers: the device and the page change, and the frame is told what it opted in to.
  trigger(trigger) {
    const now = this.options.clock();
    if ("page" in trigger) {
      if (trigger.page === "display") {
        this.displayChanged(trigger.on, void 0);
        return { posted: false };
      }
      if (trigger.page === "pause") {
        this.setPaused(trigger.paused);
        return { posted: false };
      }
      if (trigger.page === "context")
        return { posted: false, drives: this.frame.releaseLines("context") };
      return { posted: false, drives: this.leaving() };
    }
    switch (trigger.device) {
      case "watch":
        return { posted: false };
      case "display":
        this.displayChanged(trigger.on, trigger.brightness);
        return { posted: false };
      case "presence":
        return this.sample("presence", trigger.atMs ?? now, () => {
          const last = this.limits.presence;
          if (last !== void 0 && (trigger.atMs ?? now) - last < 1e3)
            return "at most one presence per second";
          this.limits.presence = trigger.atMs ?? now;
          this.deviceEvent({ type: "presence" });
          return void 0;
        });
      case "key":
        return this.key(trigger.key, trigger.action);
      case "light":
        return this.light(trigger.lux, trigger.atMs ?? now);
      case "network":
        return this.networkChanged(trigger.online);
      case "typing":
        return this.typing(trigger.text, trigger.gapMs, trigger.enter, trigger.field, trigger.atMs ?? now);
      case "scan":
        return this.scan(trigger.source, trigger.format, trigger.data, trigger.atMs ?? now);
      case "people":
        return this.people(trigger.count, trigger.atMs ?? now);
      case "sound":
        return this.sound(trigger.dbfs, trigger.atMs ?? now);
      case "serial":
        return this.serial(trigger);
      case "gpio":
        return this.gpio(trigger.pin, trigger.value);
      case "ble":
        return this.ble(trigger.subscription, trigger.value_base64);
      case "ir":
        return this.ir(trigger);
      case "udp":
        return this.udp(trigger);
    }
  }
  sample(name, _at, work) {
    if (!this.watching.has(name))
      return { posted: false, dropped: "the frame does not watch ".concat(name) };
    const dropped = work();
    return dropped === void 0 ? { posted: true } : { posted: false, dropped };
  }
  displayChanged(on, brightness) {
    const before = this.displayState();
    this.display.on = on;
    if (brightness !== void 0)
      this.display.brightness = brightness;
    this.displayEffectiveChanged(before);
  }
  key(key, action) {
    if (!this.watching.has("keys") || !KEYS.includes(key))
      return { posted: false, consumed: false, dropped: this.watching.has("keys") ? "not a volume key" : "the frame does not watch keys" };
    if (action === "down")
      this.deviceEvent({ type: "key", key });
    return { posted: action === "down", consumed: true };
  }
  light(lux, at) {
    return this.sample("light", at, () => {
      if (!Number.isFinite(lux) || lux < 0)
        return "lux must be a number from 0";
      const last = this.limits.light;
      if (last !== void 0) {
        if (at - last.at < 1e3)
          return "at most one light reading per second";
        const crossed = last.lux >= 1 !== lux >= 1;
        const moved = last.lux === 0 ? lux !== 0 : Math.abs(lux - last.lux) / last.lux >= 0.1;
        if (!crossed && !moved)
          return "the change is under 10% and does not cross 1 lux";
      }
      this.limits.light = { lux, at };
      this.deviceEvent({ type: "light", lux });
      return void 0;
    });
  }
  networkChanged(online) {
    if (this.network.online === online)
      return { posted: false, dropped: "connectivity did not change" };
    this.network.online = online;
    if (!this.watching.has("network"))
      return { posted: false, dropped: "the frame does not watch network" };
    this.deviceEvent({ type: "network", online });
    return { posted: true };
  }
  people(count, at) {
    return this.sample("people", at, () => {
      if (!Number.isInteger(count) || count < 0 || count > 1e3)
        return "count is a whole number from 0 to 1000";
      const last = this.limits.people;
      if (last !== void 0 && (last.count === count || at - last.at < 1e3))
        return last.count === count ? "the count did not change" : "at most one people reading per second";
      this.limits.people = { count, at };
      this.deviceEvent({ type: "people", count });
      return void 0;
    });
  }
  sound(dbfs, at) {
    return this.sample("sound", at, () => {
      if (!Number.isFinite(dbfs) || dbfs < -120 || dbfs > 0)
        return "dbfs is a number from -120 to 0";
      if (this.limits.sound !== void 0 && at - this.limits.sound < 1e3)
        return "at most one sound reading per second";
      this.limits.sound = at;
      this.deviceEvent({ type: "sound", dbfs });
      return void 0;
    });
  }
  postScan(source, format, data, at) {
    if (data.length < 1 || data.length > 2048 || !FORMAT_RE.test(format))
      return { posted: false, dropped: "a scan is 1 to 2048 characters with a format of a-z 0-9 _" };
    if (this.limits.scan !== void 0 && at - this.limits.scan < 100)
      return { posted: false, dropped: "at most one scan per 100 ms" };
    if (source === "camera") {
      const code = "".concat(format, ":").concat(data);
      const seen = this.limits.codes.get(code);
      if (seen !== void 0 && at - seen < 2e3)
        return { posted: false, dropped: "the camera posts a code again only after 2000 ms" };
      this.limits.codes.set(code, at);
    }
    this.limits.scan = at;
    this.deviceEvent({ type: "scan", source, format, data });
    return { posted: true };
  }
  typing(text, gapMs, enter, field, at) {
    const burst = this.watching.has("scan") && !field && enter && [...text].length >= 4 && gapMs <= 50;
    if (!burst)
      return { posted: false, consumed: false, dropped: this.watching.has("scan") ? "not a scanner burst: it is typed into the page" : "the frame does not watch scan" };
    return { ...this.postScan("scanner", "text", text, at), consumed: true };
  }
  scan(source, format, data, at) {
    if (!this.watching.has("scan"))
      return { posted: false, dropped: "the frame does not watch scan" };
    if (!SCAN_SOURCES.includes(source) || source === "scanner")
      return { posted: false, dropped: "source is nfc or camera" };
    if (source === "nfc" && !NFC_FORMATS.includes(format))
      return { posted: false, dropped: "an NFC read is uid, ndef_text or ndef_uri" };
    if (source === "camera" && !this.frame.scanning)
      return { posted: false, dropped: "the scanner is not running (device.scanner.start)" };
    return this.postScan(source, format, data, at);
  }
  serial(trigger) {
    const handle = trigger.handle === "$opened" ? this.lastOpened : trigger.handle;
    if (handle === void 0 || !this.frame.ports.has(handle))
      return { posted: false, dropped: "the frame holds no such port" };
    if (!this.watching.has("serial"))
      return { posted: false, dropped: "the frame does not watch serial" };
    if (trigger.closed) {
      this.deviceEvent({ type: "serial", handle, closed: true, ...trigger.reason === "unplugged" || trigger.reason === "error" ? { reason: trigger.reason } : {} });
      this.frame.ports.delete(handle);
      return { posted: true };
    }
    const bytes = Buffer.from(trigger.data_base64 ?? "", "base64");
    if (bytes.length === 0)
      return { posted: false, dropped: "no bytes" };
    for (let offset = 0; offset < bytes.length; offset += DEVICE_CHUNK_BYTES) {
      this.deviceEvent({ type: "serial", handle, data_base64: bytes.subarray(offset, offset + DEVICE_CHUNK_BYTES).toString("base64") });
    }
    return { posted: true };
  }
  gpio(pin, value) {
    const before = this.frame.gpioLevel(pin);
    if (before === void 0)
      return { posted: false, dropped: "the device has no such line" };
    if (value === null)
      this.frame.gpioFloat(pin);
    else
      this.frame.gpioDrive(pin, value);
    if (before === this.frame.gpioLevel(pin))
      return { posted: false, dropped: "the level did not change" };
    if (!this.watching.has("gpio") || !this.frame.watchedPins.includes(pin))
      return { posted: false, dropped: "the frame does not listen to this line" };
    this.deviceEvent({ type: "gpio", pin, value: this.frame.gpioLevel(pin) });
    return { posted: true };
  }
  ir(trigger) {
    const repeat = trigger.repeat === true;
    if (!this.watching.has("ir"))
      return { posted: false, dropped: "the frame does not watch ir" };
    if (!this.options.hardware.ir.receiver)
      return { posted: false, dropped: "the device has no infrared receiver" };
    if ((trigger.encoding ?? "NEC") !== "NEC")
      return { posted: false, dropped: "encoding is NEC" };
    let code = trigger.code;
    if (trigger.wire !== void 0) {
      const decoded = necFromWire(trigger.wire);
      if (typeof decoded === "string")
        return { posted: false, dropped: decoded };
      code = decoded;
    }
    if (typeof code !== "number" || !Number.isInteger(code) || code < 0 || code > MAX_IR_CODE)
      return { posted: false, dropped: "code is a whole number from 0 to 16777215" };
    this.options.log({ type: "device.ir.receive", level: "debug", detail: { code, repeat } });
    this.deviceEvent({ type: "ir", encoding: "NEC", code, repeat });
    return { posted: true };
  }
  udp(trigger) {
    const handle = trigger.socket === "$opened" ? this.lastUdp : trigger.socket;
    const socket = handle === void 0 ? void 0 : this.frame.sockets.get(handle);
    if (handle === void 0 || !socket)
      return { posted: false, dropped: "the frame holds no such socket" };
    if (trigger.closed === true) {
      this.frame.udpEnded(handle);
      if (!this.watching.has("udp"))
        return { posted: false, dropped: "the frame does not watch udp" };
      this.deviceEvent({ type: "udp", socket: handle, closed: true, reason: "error" });
      return { posted: true };
    }
    if (socket.port === 0)
      return { posted: false, dropped: "a send-only socket (port 0) receives nothing" };
    const length = base64Length(trigger.data_base64);
    if (length === void 0 || length < 1 || length > MAX_UDP_BYTES)
      return { posted: false, dropped: "a datagram is 1 to 8192 bytes of base64" };
    const fromHost = trigger.from_host ?? "127.0.0.1";
    const fromPort = trigger.from_port ?? 4e4;
    this.frame.noteHeard(handle, fromHost, fromPort, Buffer.from(trigger.data_base64, "base64"));
    if (!this.watching.has("udp"))
      return { posted: false, dropped: "the frame does not watch udp" };
    this.deviceEvent({ type: "udp", socket: handle, from_host: fromHost, from_port: fromPort, data_base64: trigger.data_base64 });
    return { posted: true };
  }
  ble(subscription, valueBase64) {
    if (!this.watching.has("ble") || !this.frame.subscriptions.has(subscription))
      return { posted: false, dropped: "the frame holds no such subscription" };
    const length = base64Length(valueBase64);
    if (length === void 0 || length > 512)
      return { posted: false, dropped: "a notification is 0 to 512 bytes of base64" };
    this.deviceEvent({ type: "ble", subscription, value_base64: valueBase64 });
    return { posted: true };
  }
  /** A notification of a characteristic: the value is stored, and every subscription to it hears it. */
  bleNotify(service, characteristic, valueBase64) {
    for (const peripheral of this.options.hardware.ble.peripherals) {
      for (const candidate of peripheral.services) {
        if (candidate.service !== service)
          continue;
        const found = candidate.characteristics.find((item) => item.characteristic === characteristic);
        if (found)
          found.value_base64 = valueBase64;
      }
    }
    let heard = 0;
    for (const subscription of this.frame.subscriptions.values()) {
      if (subscription.service === service && subscription.characteristic === characteristic && this.ble(subscription.subscription, valueBase64).posted)
        heard += 1;
    }
    return heard;
  }
  /** What the harness shows of the host. */
  state() {
    return {
      generation: this.generation,
      active: this.active,
      ready: this.readied,
      advanced: this.advanced,
      ended: this.ended ?? null,
      held: [...this.held],
      visibility_watching: this.visibilityWatching,
      kv_watching: this.kvWatching,
      watching: [...this.watching],
      display: this.displayState(),
      display_held_dark: this.darkHeld,
      network: { ...this.network },
      page: { elapsed_ms: this.elapsedMs(), remaining_ms: this.remainingMs(), max_ms: this.maxMs, paused: this.held.size > 0 },
      capabilities: { ...this.options.capabilities },
      features: this.options.features === null ? null : [...this.options.features],
      hardware: this.options.hardware,
      frame: this.frame.state()
    };
  }
};

// dist/dev/session.js
var TERMINAL_TYPES = /* @__PURE__ */ new Set([
  "emit",
  "log",
  "release.built",
  "release.refused",
  "release.changed",
  "activated",
  "page.advance",
  "page.skip",
  "page.end",
  "kv.changed",
  "kv.problem",
  "harness.warning"
]);
var VIEWPORT_PRESETS = {
  "1920x1080": { width: 1920, height: 1080 },
  "3840x2160": { width: 3840, height: 2160 },
  "1080x1920": { width: 1080, height: 1920 }
};
var MAX_LOG = 500;
var FRAME_ALLOW = "autoplay; fullscreen; clipboard-read; clipboard-write";
var PRIMITIVE_ID = "prm_dev_0001";
function isSize(value) {
  return isRecord2(value) && Number.isInteger(value.width) && Number.isInteger(value.height) && value.width >= 1 && value.width <= 8192 && value.height >= 1 && value.height <= 8192;
}
var CommandError = class extends Error {
};
function digestOf(release) {
  const hash = createHash3("sha256");
  for (const path4 of [...release.files.keys()].sort())
    hash.update("".concat(path4, "\0").concat(release.files.get(path4).etag, "\0"));
  return hash.digest("hex");
}
var DevSession = class {
  options;
  release;
  refusal;
  host;
  viewport = { ...VIEWPORT_PRESETS["1920x1080"] };
  preset = "1920x1080";
  screen = { name: "", timezone: "" };
  params = {};
  timer = { enabled: false, maxMs: 15e3 };
  loop = true;
  log = [];
  clients = /* @__PURE__ */ new Set();
  seq = 0;
  revision = 0;
  digest = "";
  snapshotQueued = false;
  interval;
  restartTimer;
  hardware;
  clock;
  building = Promise.resolve();
  changedSinceLoad = false;
  constructor(options) {
    this.options = options;
    this.clock = options.clock ?? (() => Date.now());
    this.hardware = options.hardware ?? defaultHardware();
    this.host = this.newHost();
  }
  newHost() {
    const events = {
      emit: async (code, primitiveId) => {
        this.record({ type: "emit", code, detail: { primitive_id: primitiveId } });
        return { ok: true };
      }
    };
    const capabilities = this.host?.capabilities ?? allCapabilities(true);
    const host = new BridgeHost({
      applicationId: this.options.applicationId,
      releaseId: this.options.releaseId,
      primitiveId: PRIMITIVE_ID,
      playerOrigin: playerOrigin(this.options.port),
      appOrigin: appOrigin(this.options.releaseHost, this.options.port),
      capabilities,
      features: this.host ? this.host.options.features : [...FEATURE_NAMES],
      viewport: { ...this.viewport },
      manifest: this.manifest(),
      hardware: this.hardware,
      ...this.options.udp ? { udp: this.options.udp } : {},
      kv: this.options.kv,
      events,
      clock: this.clock,
      post: (message) => this.broadcast({ event: "bridge", data: message }),
      log: (event) => this.hostEvent(event)
    });
    host.onPageEnd = (end, detail) => this.pageEnded(end, detail);
    return host;
  }
  manifest() {
    return {
      ...Object.keys(this.params).length > 0 ? { launchParams: this.params } : {},
      screenLabel: this.screen.name,
      ...this.screen.timezone ? { timezone: this.screen.timezone } : {}
    };
  }
  /** Builds the first release and starts the page timer's clock. */
  async start() {
    await this.rebuild();
    this.interval = setInterval(() => {
      this.host.checkPageEnd();
      if (this.clients.size > 0 && this.host.active)
        this.queueState();
    }, 250);
    this.interval.unref();
  }
  async stop() {
    clearInterval(this.interval);
    clearTimeout(this.restartTimer);
    this.host.endContext();
    this.host.destroy();
    await this.options.kv.close();
  }
  // The release.
  /** Rebuilds from the directory; the app reloads when the files changed and the build is accepted. */
  rebuild() {
    this.building = this.building.then(async () => {
      const result = await buildDevRelease(this.options.directory, this.revision + 1);
      if (!result.ok) {
        this.refusal = result.refusal;
        this.record({ type: "release.refused", level: "error", code: result.refusal.code, message: result.refusal.detail, detail: { ...result.refusal.file ? { file: result.refusal.file } : {}, ...result.refusal.line ? { line: result.refusal.line } : {}, serving: this.release ? "the last accepted build" : "nothing" } });
        this.queueState();
        return;
      }
      const digest = digestOf(result.release);
      const first = this.release === void 0;
      this.refusal = void 0;
      if (!first && digest === this.digest) {
        this.queueState();
        return;
      }
      this.revision += 1;
      this.digest = digest;
      this.release = result.release;
      this.record({ type: first ? "release.built" : "release.changed", message: "".concat(result.release.file_count, " files, ").concat(result.release.expanded_bytes, " bytes"), detail: { revision: this.revision, file_count: result.release.file_count, expanded_bytes: result.release.expanded_bytes, sdk_sha256: result.release.sdk_sha256 ?? null } });
      if (!first) {
        if (this.options.autoReload)
          this.restart("files changed");
        else {
          this.changedSinceLoad = true;
          this.queueState();
        }
      } else
        this.queueState();
    });
    return this.building;
  }
  // The log and the stream to the page.
  record(event) {
    const entry = { seq: ++this.seq, at: (/* @__PURE__ */ new Date()).toISOString(), ...event };
    this.log.push(entry);
    if (this.log.length > MAX_LOG)
      this.log.shift();
    this.broadcast({ event: "log", data: entry });
    if (TERMINAL_TYPES.has(entry.type))
      this.options.print?.(entry);
    return entry;
  }
  hostEvent(event) {
    this.record(event);
    if (event.type === "ready" || event.type === "activated" || event.type === "device.display" || event.type === "visibility.watch" || event.type === "device.watch")
      this.queueState();
  }
  broadcast(event) {
    for (const client of this.clients) {
      try {
        client(event);
      } catch {
      }
    }
    if (event.event === "bridge" || event.event === "log")
      this.queueState();
  }
  /** The state, coalesced: one event per tick however many changes happened in it. */
  queueState() {
    if (this.snapshotQueued || this.clients.size === 0)
      return;
    this.snapshotQueued = true;
    setImmediate(() => {
      this.snapshotQueued = false;
      for (const client of this.clients) {
        try {
          client({ event: "state", data: this.snapshot() });
        } catch {
        }
      }
    });
  }
  /**
   * The `allow` attribute of the application's frame. A frame whose page holds
   * the `device.hdmi_input` capability may use the camera and the microphone, so
   * `screenrig.device.hdmiInput.open()` gets the browser's capture device; a
   * frame without it may not. The policy applies when the frame loads.
   */
  frameAllow() {
    return this.host.capabilities["device.hdmi_input"] ? "".concat(FRAME_ALLOW, "; camera; microphone") : FRAME_ALLOW;
  }
  frameSrc() {
    const query = new URLSearchParams(contextMembers({ launchParams: this.params }).params ?? {}).toString();
    return "".concat(appOrigin(this.options.releaseHost, this.options.port), "/index.html").concat(query ? "?".concat(query) : "");
  }
  snapshot() {
    return {
      directory: this.options.directory,
      port: this.options.port,
      player_origin: playerOrigin(this.options.port),
      app_origin: appOrigin(this.options.releaseHost, this.options.port),
      frame_src: this.frameSrc(),
      frame_allow: this.frameAllow(),
      application_id: this.options.applicationId,
      release_id: this.options.releaseId,
      release: this.release ? { revision: this.release.revision, file_count: this.release.file_count, expanded_bytes: this.release.expanded_bytes, built_at: this.release.built_at, sdk_sha256: this.release.sdk_sha256 ?? null } : null,
      refusal: this.refusal ?? null,
      changed_since_load: this.changedSinceLoad,
      auto_reload: this.options.autoReload,
      kv: { mode: this.options.kvMode, location: this.options.kvLocation },
      viewport: this.viewport,
      preset: this.preset,
      screen: this.screen,
      params: this.params,
      timer: this.timer,
      loop: this.loop,
      capability_names: CAPABILITY_NAMES,
      feature_names: FEATURE_NAMES,
      host: this.host.state(),
      log_tail: this.log.length
    };
  }
  // Activation.
  /** The page loaded the application's frame. */
  frameLoaded() {
    this.changedSinceLoad = false;
    this.host.beginActivation();
    this.host.startTimer(this.timer.enabled ? this.timer.maxMs : null);
    this.queueState();
  }
  /** Ends the activation and loads the frame again: a new generation. */
  restart(reason = "restart") {
    clearTimeout(this.restartTimer);
    this.host.leaving();
    this.record({ type: "restart", level: "debug", message: reason });
    this.broadcast({ event: "frame", data: { action: "restart", src: this.frameSrc(), allow: this.frameAllow() } });
    this.changedSinceLoad = false;
    this.queueState();
  }
  pageEnded(end, detail) {
    this.queueState();
    if (!this.loop)
      return;
    clearTimeout(this.restartTimer);
    this.restartTimer = setTimeout(() => this.restart("page ended (".concat(end).concat(detail ? ": ".concat(detail) : "", ")")), 1200);
    this.restartTimer.unref();
  }
  /** A message the application's window posted, relayed by the page. */
  async fromApp(data, origin) {
    await this.host.receive(data, origin);
  }
  // Commands from the panel.
  async command(raw) {
    if (!isRecord2(raw) || typeof raw.command !== "string")
      throw new CommandError("A command is an object with a command name.");
    const name = raw.command;
    switch (name) {
      case "frame-loaded":
        this.frameLoaded();
        return {};
      case "restart":
        this.restart("restart requested");
        return {};
      case "reload":
        this.restart("reload requested");
        return {};
      case "capability":
        return this.setCapability(raw);
      case "capabilities":
        return this.setCapabilities(raw);
      case "feature":
        return this.setFeature(raw);
      case "viewport":
        return this.setViewport(raw);
      case "launch":
        return this.setLaunch(raw);
      case "timer":
        return this.setTimer(raw);
      case "loop":
        this.loop = raw.value === true;
        this.queueState();
        return {};
      case "pause":
        this.host.setPaused(raw.paused === true);
        this.queueState();
        return {};
      case "display":
        this.host.holdDisplayDark(raw.dark === true);
        this.queueState();
        return {};
      case "leaving":
        this.host.leaving();
        this.queueState();
        return {};
      case "trigger":
        return this.fire(raw.trigger);
      case "ble-notify":
        return this.bleNotify(raw);
      case "serial-send":
        return this.serialSend(raw);
      case "udp-inject":
        return this.udpInject(raw);
      case "hardware":
        return this.setHardware(raw);
      case "clear-log":
        this.log.length = 0;
        this.queueState();
        return {};
      default:
        throw new CommandError("Unknown command ".concat(name.slice(0, 40), "."));
    }
  }
  setCapability(raw) {
    if (typeof raw.name !== "string" || !CAPABILITY_NAMES.includes(raw.name) || typeof raw.value !== "boolean")
      throw new CommandError("capability needs a capability name and true or false.");
    const allowBefore = this.frameAllow();
    this.host.setCapability(raw.name, raw.value);
    this.allowChanged(allowBefore);
    this.queueState();
    return {};
  }
  setCapabilities(raw) {
    if (!isRecord2(raw.values))
      throw new CommandError("capabilities needs a values object.");
    const allowBefore = this.frameAllow();
    for (const [name, value] of Object.entries(raw.values)) {
      if (!CAPABILITY_NAMES.includes(name) || typeof value !== "boolean")
        throw new CommandError("".concat(name.slice(0, 40), " is not a capability set to true or false."));
      this.host.options.capabilities[name] = value;
    }
    this.host.refreshContext();
    this.allowChanged(allowBefore);
    this.queueState();
    return {};
  }
  /** A frame's permissions are fixed when it loads: when they change, it loads again (a new generation). */
  allowChanged(before) {
    if (this.frameAllow() !== before)
      this.restart("the frame's camera and microphone permission changed (device.hdmi_input)");
  }
  setFeature(raw) {
    if (typeof raw.name !== "string" || !FEATURE_NAMES.includes(raw.name) || typeof raw.value !== "boolean")
      throw new CommandError("feature needs a feature name and true or false.");
    const current = new Set(this.host.options.features ?? []);
    if (raw.value)
      current.add(raw.name);
    else
      current.delete(raw.name);
    this.host.setFeatures(FEATURE_NAMES.filter((feature) => current.has(feature)));
    this.queueState();
    return {};
  }
  setViewport(raw) {
    const size = { width: raw.width, height: raw.height };
    if (!isSize(size))
      throw new CommandError("viewport needs whole-number width and height from 1 to 8192.");
    this.viewport = { width: size.width, height: size.height };
    const key = "".concat(size.width, "x").concat(size.height);
    this.preset = key in VIEWPORT_PRESETS ? key : "custom";
    this.host.setViewport(this.viewport);
    this.queueState();
    return {};
  }
  setLaunch(raw) {
    const name = raw.name === void 0 ? this.screen.name : raw.name;
    const timezone = raw.timezone === void 0 ? this.screen.timezone : raw.timezone;
    if (typeof name !== "string" || typeof timezone !== "string")
      throw new CommandError("name and timezone are text.");
    if (timezone !== "") {
      try {
        new Intl.DateTimeFormat("en", { timeZone: timezone });
      } catch {
        throw new CommandError("".concat(timezone.slice(0, 60), " is not an IANA time zone."));
      }
    }
    let params = this.params;
    if (raw.params !== void 0) {
      if (!isRecord2(raw.params))
        throw new CommandError("params is an object of text values.");
      params = {};
      for (const [key, value] of Object.entries(raw.params)) {
        if (typeof value !== "string")
          throw new CommandError("Launch param ".concat(key.slice(0, 40), " must be text."));
        params[key] = value;
      }
    }
    this.screen = { name, timezone };
    this.params = params;
    this.host.options.manifest = this.manifest();
    this.restart("launch settings changed");
    return { params: contextMembers({ launchParams: params }).params ?? {} };
  }
  setTimer(raw) {
    const maxMs = raw.maxMs === void 0 ? this.timer.maxMs : raw.maxMs;
    if (typeof maxMs !== "number" || !Number.isInteger(maxMs) || maxMs < 1e3 || maxMs > 864e5)
      throw new CommandError("maxMs is a whole number of milliseconds from 1000 to 86400000.");
    const enabled = raw.enabled === void 0 ? this.timer.enabled : raw.enabled === true;
    this.timer = { enabled, maxMs };
    this.host.startTimer(enabled ? maxMs : null);
    this.queueState();
    return {};
  }
  fire(raw) {
    if (!isRecord2(raw))
      throw new CommandError("trigger needs a trigger object.");
    const device = raw.device;
    const page = raw.page;
    const allowed = ["display", "presence", "key", "light", "network", "typing", "scan", "people", "sound", "serial", "gpio", "ble", "ir", "udp"];
    if (!(typeof device === "string" && allowed.includes(device)) && !(page === "leaving" || page === "context"))
      throw new CommandError("trigger names a device event.");
    const result = this.host.trigger(raw);
    this.record({ type: result.posted ? "harness.fired" : "harness.dropped", level: result.posted ? "debug" : "info", message: result.posted ? "".concat(String(device ?? page), " sent") : "".concat(String(device ?? page), " not sent").concat(result.dropped ? ": ".concat(result.dropped) : ""), detail: { trigger: raw, ...result.consumed === void 0 ? {} : { consumed: result.consumed }, ...result.drives && result.drives.length > 0 ? { drives: result.drives } : {} } });
    this.queueState();
    return result;
  }
  bleNotify(raw) {
    const { service, characteristic } = raw;
    if (typeof service !== "string" || typeof characteristic !== "string")
      throw new CommandError("ble-notify needs service and characteristic.");
    const bytes = typeof raw.hex === "string" ? Buffer.from(raw.hex.replace(/[^0-9a-f]/gi, ""), "hex") : Buffer.from(String(raw.text ?? ""), "utf8");
    if (bytes.length > 512)
      throw new CommandError("A notification is at most 512 bytes.");
    const heard = this.host.bleNotify(service, characteristic, bytes.toString("base64"));
    this.record({ type: "harness.fired", level: "debug", message: "ble notify ".concat(characteristic, ": ").concat(bytes.length, " bytes, ").concat(heard, " subscription").concat(heard === 1 ? "" : "s", " heard it") });
    this.queueState();
    return { heard };
  }
  serialSend(raw) {
    const handle = typeof raw.handle === "string" ? raw.handle : [...this.host.frame.ports.values()].find((port) => port.port === raw.port)?.handle;
    if (handle === void 0)
      throw new CommandError("The application has no open port to send to.");
    const bytes = typeof raw.hex === "string" ? Buffer.from(raw.hex.replace(/[^0-9a-f]/gi, ""), "hex") : Buffer.from(String(raw.text ?? ""), "utf8");
    if (bytes.length === 0)
      throw new CommandError("Nothing to send.");
    return this.fire({ device: "serial", handle, data_base64: bytes.toString("base64") });
  }
  /** A datagram arrives at a socket the application opened, from a peer the operator names (the loopback address and a port by default). */
  udpInject(raw) {
    const socket = typeof raw.socket === "string" ? raw.socket : [...this.host.frame.sockets.values()][0]?.handle;
    if (socket === void 0)
      throw new CommandError("The application has no open UDP socket to send to.");
    const bytes = typeof raw.hex === "string" ? Buffer.from(raw.hex.replace(/[^0-9a-f]/gi, ""), "hex") : Buffer.from(String(raw.text ?? ""), "utf8");
    if (bytes.length === 0)
      throw new CommandError("Nothing to send.");
    if (bytes.length > 8192)
      throw new CommandError("A datagram is at most 8192 bytes.");
    const host = raw.host === void 0 || raw.host === "" ? "127.0.0.1" : raw.host;
    const port = raw.port === void 0 || raw.port === "" ? 4e4 : raw.port;
    if (typeof host !== "string" || host.length > 253)
      throw new CommandError("host is the sender's address.");
    if (typeof port !== "number" || !Number.isInteger(port) || port < 1 || port > 65535)
      throw new CommandError("port is a whole number from 1 to 65535.");
    return this.fire({ device: "udp", socket, from_host: host, from_port: port, data_base64: bytes.toString("base64") });
  }
  setHardware(raw) {
    const hardware = this.hardware;
    const id = typeof raw.id === "string" ? raw.id : "";
    const value = raw.value === true;
    switch (raw.change) {
      case "serial.echo":
        this.port(id).echo = value;
        break;
      case "serial.busy":
        this.port(id).busy = value;
        break;
      case "printer.failing": {
        const printer = hardware.printers.find((candidate) => candidate.id === id);
        if (!printer)
          throw new CommandError("No such printer.");
        printer.failing = value;
        break;
      }
      case "pin.floating": {
        const pin = hardware.gpio.pins.find((candidate) => String(candidate.pin) === id);
        if (!pin)
          throw new CommandError("No such line.");
        pin.floating = value;
        pin.driven = void 0;
        break;
      }
      case "ir.emitter":
        hardware.ir.emitter = value;
        break;
      case "ir.receiver":
        hardware.ir.receiver = value;
        break;
      case "pin.busy": {
        const pin = hardware.gpio.pins.find((candidate) => String(candidate.pin) === id);
        if (!pin)
          throw new CommandError("No such line.");
        pin.busy = value;
        break;
      }
      case "gpio.chip":
        hardware.gpio.chip = value;
        break;
      case "ble.adapter":
        hardware.ble.adapter = value;
        break;
      case "camera.available":
        hardware.camera.available = value;
        break;
      case "network":
        this.host.trigger({ device: "network", online: value });
        break;
      default:
        throw new CommandError("Unknown hardware change.");
    }
    this.queueState();
    return {};
  }
  /** The stored values for the page's table: key, revision, type and a short preview. */
  async kvView() {
    const base = { mode: this.options.kvMode, location: this.options.kvLocation };
    const list = await this.options.kv.list();
    if (!list.ok)
      return { ...base, items: [], problem: list.problem.detail };
    const items = [];
    for (const summary2 of list.value) {
      const entry = await this.options.kv.get(summary2.key);
      let preview = "";
      if (entry.ok) {
        const bytes = Buffer.from(entry.value.value_base64, "base64");
        preview = /^text\/|json|xml/.test(summary2.content_type) ? bytes.subarray(0, 200).toString("utf8") : "".concat(bytes.length, " bytes");
      }
      items.push({ key: summary2.key, revision: summary2.revision, content_type: summary2.content_type, bytes: summary2.bytes, preview });
    }
    return { ...base, items };
  }
  port(id) {
    const port = this.hardware.serial.ports.find((candidate) => candidate.id === id);
    if (!port)
      throw new CommandError("No such serial port.");
    return port;
  }
};

// dist/dev/server.js
var MAX_BODY_BYTES = 256 * 1024;
var HEARTBEAT_MS = 15e3;
var BodyError = class extends Error {
  status;
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};
function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new BodyError(413, "The request body is over 256 KiB."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new BodyError(400, "The request body is not JSON."));
      }
    });
    request.on("error", reject);
  });
}
function send(response, status, type, body, headers = {}, head = false) {
  const bytes = typeof body === "string" ? Buffer.from(body) : body;
  response.writeHead(status, { "content-type": type, "content-length": bytes.length, "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", ...headers });
  response.end(head ? void 0 : bytes);
}
function sendJson(response, status, value) {
  send(response, status, "application/json; charset=utf-8", JSON.stringify(value));
}
function createDevServer(session) {
  const { port, releaseHost } = session.options;
  const player = playerOrigin(port);
  const app = appOrigin(releaseHost, port);
  function harness(request, response, path4) {
    const head = request.method === "HEAD";
    if (request.method === "POST") {
      void post(request, response, path4);
      return;
    }
    if (request.method !== "GET" && !head) {
      send(response, 405, "text/plain; charset=utf-8", "Method not allowed.\n", { allow: "GET, HEAD, POST" });
      return;
    }
    const security = { "content-security-policy": harnessCsp(app) };
    switch (path4) {
      case "/":
      case "/index.html":
        send(response, 200, "text/html; charset=utf-8", harnessHtml(), security, head);
        return;
      case "/_dev/harness.js":
        send(response, 200, "text/javascript; charset=utf-8", harnessScript(), security, head);
        return;
      case "/_dev/harness.css":
        send(response, 200, "text/css; charset=utf-8", harnessCss(), security, head);
        return;
      case "/_dev/state":
        sendJson(response, 200, session.snapshot());
        return;
      case "/_dev/log":
        sendJson(response, 200, session.log);
        return;
      case "/_dev/kv":
        void session.kvView().then((view) => sendJson(response, 200, view), () => sendJson(response, 500, { ok: false, error: "The stored values could not be read." }));
        return;
      case "/_dev/events":
        stream(request, response);
        return;
      case "/favicon.ico":
        response.writeHead(204).end();
        return;
      default:
        send(response, 404, "text/plain; charset=utf-8", "Not found.\n");
    }
  }
  function stream(request, response) {
    response.writeHead(200, { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" });
    response.write("retry: 1000\n\n");
    const write = (event) => {
      response.write("event: ".concat(event.event, "\ndata: ").concat(JSON.stringify(event.data), "\n\n"));
    };
    session.clients.add(write);
    write({ event: "state", data: { ...session.snapshot(), log: session.log } });
    const beat = setInterval(() => response.write(": ping\n\n"), HEARTBEAT_MS);
    beat.unref();
    request.on("close", () => {
      clearInterval(beat);
      session.clients.delete(write);
    });
  }
  async function post(request, response, path4) {
    if (request.headers.origin !== player || request.headers["sec-fetch-site"] !== void 0 && request.headers["sec-fetch-site"] !== "same-origin") {
      sendJson(response, 403, { ok: false, error: "Only the harness page may send commands." });
      return;
    }
    if (!String(request.headers["content-type"] ?? "").toLowerCase().startsWith("application/json")) {
      sendJson(response, 415, { ok: false, error: "Send JSON." });
      return;
    }
    try {
      const body = await readBody(request);
      if (path4 === "/_dev/message") {
        const message = body;
        if (typeof message !== "object" || message === null || typeof message.origin !== "string")
          throw new BodyError(400, "A relayed message names its origin.");
        await session.fromApp(message.data, message.origin);
        sendJson(response, 200, { ok: true });
      } else if (path4 === "/_dev/command") {
        sendJson(response, 200, { ok: true, result: await session.command(body) });
      } else {
        sendJson(response, 404, { ok: false, error: "Not found." });
      }
    } catch (error) {
      if (error instanceof BodyError)
        sendJson(response, error.status, { ok: false, error: error.message });
      else if (error instanceof CommandError)
        sendJson(response, 400, { ok: false, error: error.message });
      else
        sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  }
  function release(request, response, rawUrl) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      send(response, 405, "text/plain; charset=utf-8", "Method not allowed.\n", { allow: "GET, HEAD" });
      return;
    }
    const head = request.method === "HEAD";
    const built = session.release;
    if (!built) {
      const refusal = session.refusal;
      send(response, 503, "text/plain; charset=utf-8", "The application directory was refused: ".concat(refusal?.detail ?? "it has not been built yet", "\n"), {}, head);
      return;
    }
    const file = lookupFile(built, new URL(rawUrl, "http://dev.invalid").pathname);
    if (!file) {
      send(response, 404, "text/plain; charset=utf-8", "Release asset was not found.\n", { "content-security-policy": releaseCsp(player) }, head);
      return;
    }
    send(response, 200, file.type, file.data, { etag: file.etag, "content-security-policy": releaseCsp(player) }, head);
  }
  return http.createServer((request, response) => {
    const host = parseHostHeader(request.headers.host);
    const rawUrl = request.url ?? "/";
    if (!host || host.port !== String(port) || rawUrl.startsWith("//")) {
      send(response, 421, "text/plain; charset=utf-8", "Open ".concat(player, "/ in a browser: the harness answers only its own hosts.\n"));
      return;
    }
    if (host.hostname === PLAYER_HOST)
      harness(request, response, new URL(rawUrl, "http://dev.invalid").pathname);
    else if (host.hostname === releaseHost)
      release(request, response, rawUrl);
    else
      send(response, 421, "text/plain; charset=utf-8", "Open ".concat(player, "/ in a browser: the harness answers only its own hosts.\n"));
  });
}

// dist/dev/watcher.js
import { watch } from "node:fs";
import path2 from "node:path";
function watchDirectory(directory, onChange, options = {}) {
  const debounceMs = options.debounceMs ?? 150;
  let timer;
  let poll;
  let watcher;
  let closed = false;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!closed)
        onChange();
    }, debounceMs);
  };
  const startPolling = (reason) => {
    if (poll || closed)
      return;
    options.onWarning?.("File events are unavailable (".concat(reason, "); checking ").concat(directory, " every ").concat(options.pollMs ?? 2e3, " ms instead."));
    poll = setInterval(() => {
      if (!closed)
        onChange();
    }, options.pollMs ?? 2e3);
    poll.unref();
  };
  let mode = "events";
  try {
    watcher = watch(directory, { recursive: true, persistent: false }, (_event, filename) => {
      if (filename) {
        const name = filename.toString();
        if (isBuiltinIgnored(name.split(path2.sep).join("/"), false))
          return;
        if (options.ignore?.(path2.resolve(directory, name)))
          return;
      }
      schedule();
    });
    watcher.on("error", (error) => {
      watcher?.close();
      watcher = void 0;
      mode = "poll";
      startPolling(error.message);
    });
  } catch (error) {
    mode = "poll";
    startPolling(error instanceof Error ? error.message : String(error));
  }
  return {
    get mode() {
      return mode;
    },
    close() {
      closed = true;
      clearTimeout(timer);
      clearInterval(poll);
      watcher?.close();
    }
  };
}

// dist/dev/index.js
function assertDevPort(port) {
  if (port !== DEV_PORT) {
    throw new CliError(makeProblem("unsupported_port", "Unsupported port", 400, "The runtime trusts the development harness as its parent only on port ".concat(DEV_PORT, ": an application served from port ").concat(port, " would refuse the handshake and run without the SDK."), {
      hint: "Run without --port, or with --port ".concat(DEV_PORT, ". If ").concat(DEV_PORT, " is in use, stop the other app dev first."),
      next: { command: "screenrig app dev ./DIRECTORY", reason: "Serves the application and the harness on port ".concat(DEV_PORT, ".") }
    }), ExitCode.Usage);
  }
}
function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE")
        reject(usageError("Port ".concat(port, " on 127.0.0.1 is already in use. Stop the other process (another app dev?) and run the command again.")));
      else
        reject(error);
    });
    server.listen(port, "127.0.0.1", () => resolve());
  });
}
async function createDevSession(options) {
  const releaseHost = releaseHostFor(options.directory);
  const tag = createHash4("sha1").update(options.directory).digest("hex").slice(0, 12);
  const applicationId = options.kvFrom?.applicationId ?? "app_dev_".concat(tag);
  let session;
  const fileKv = options.kvFrom ? void 0 : path3.resolve(options.kvFile ?? path3.join(options.directory, ".screenrig-dev", "kv.json"));
  let kv;
  if (options.kvFrom) {
    kv = new RemoteKvStore(applicationId, options.kvFrom.read);
  } else {
    const store = new FileKvStore(fileKv, applicationId, { onProblem: (message) => session?.record({ type: "kv.problem", level: "error", message }) });
    await store.open();
    kv = store;
  }
  const kvLocation = options.kvFrom ? applicationId : fileKv;
  session = new DevSession({
    directory: options.directory,
    port: options.port,
    releaseHost,
    applicationId,
    releaseId: "rel_dev_".concat(tag),
    kv,
    kvMode: options.kvFrom ? "remote" : "file",
    kvLocation,
    autoReload: options.reload,
    hardware: options.hardware,
    udp: options.udp,
    print: options.print
  });
  await session.start();
  const warn = (message) => {
    session.record({ type: "harness.warning", level: "warn", message });
  };
  if (fileKv) {
    const relative = path3.relative(options.directory, fileKv);
    const inside = !relative.startsWith("..") && !path3.isAbsolute(relative);
    if (inside && !relative.split(path3.sep).some((part) => part.startsWith("."))) {
      warn("The K/V file ".concat(fileKv, " is inside the application directory, so app pack would ship it. Keep it in a dot directory such as .screenrig-dev."));
    }
  }
  return { session, releaseHost, kv: { mode: options.kvFrom ? "remote" : "file", location: kvLocation }, kvFile: fileKv, warn };
}
async function startDevServer(options) {
  if (!options.allowAnyPort)
    assertDevPort(options.port);
  const { session, releaseHost, kv, kvFile, warn } = await createDevSession({ ...options, udp: options.udp ?? new LoopbackUdp() });
  const server = createDevServer(session);
  try {
    await listen(server, options.port);
  } catch (error) {
    await session.stop();
    throw error;
  }
  const watcher = watchDirectory(options.directory, () => {
    void session.rebuild();
  }, {
    ignore: (absolute) => kvFile !== void 0 && absolute === kvFile,
    onWarning: warn
  });
  return {
    session,
    server,
    url: "".concat(playerOrigin(options.port), "/"),
    appUrl: session.frameSrc(),
    releaseHost,
    kv,
    watching: watcher.mode,
    async close() {
      watcher.close();
      await session.stop();
      server.closeAllConnections();
      await new Promise((resolve) => {
        server.close(() => resolve());
      });
    }
  };
}
export {
  assertDevPort,
  createDevSession,
  startDevServer
};
