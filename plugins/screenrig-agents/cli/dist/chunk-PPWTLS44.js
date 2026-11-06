import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  OAuthClient,
  SCOPE_IDENTITY,
  accessClaims,
  isSessionJwt,
  newOAuthRequestId,
  readConfigFile,
  withConfigLock,
  writeConfigAtomic
} from "./chunk-D2RLMLYO.js";
import {
  readMediaHead,
  sniffMediaContainer
} from "./chunk-7EJTDXNL.js";
import {
  CliError,
  ExitCode,
  configError,
  isSensitiveKey,
  isSensitiveValue,
  makeProblem,
  redactText,
  redactValue,
  usageError
} from "./chunk-JP4OQPAN.js";
import {
  __export
} from "./chunk-3FYAGULW.js";

// dist/log/tag.js
var tag_exports = {};
__export(tag_exports, {
  httpResourceId: () => httpResourceId,
  httpTag: () => httpTag,
  localTag: () => localTag
});
var API_PREFIXES = ["/api/"];
var KEEP = /* @__PURE__ */ new Set([
  "api",
  "screen",
  "native",
  "screens",
  "playlists",
  "media",
  "applications",
  "project",
  "invitations",
  "sign-in-resets",
  "revoke",
  "agents",
  "operations",
  "events",
  "feedback",
  "comment",
  "playback",
  "capabilities",
  "enrollments",
  "uploads",
  "generations",
  "commit",
  "content",
  "pair",
  "provision",
  "archive",
  "unarchive",
  "toast",
  "reload",
  "screenshot",
  "status",
  "public-id",
  "rotate",
  "kv",
  "bugs",
  "features",
  "self",
  "activate",
  "browser-links",
  "claim",
  "agent-connections",
  "credential",
  "pairing-sessions",
  "pairing-events",
  "complete",
  "identity",
  "reset",
  "sessions",
  "challenges",
  "observation",
  "reports",
  "manifest",
  "manifests",
  "releases",
  "launch",
  "page",
  "stream",
  "support",
  "log",
  "query",
  "otel",
  "agentid",
  "website",
  "start",
  "callback",
  "health",
  "ready",
  "version",
  ".health",
  ".ready",
  ".version"
]);
var SINGULAR = {
  screens: "screen",
  playlists: "playlist",
  applications: "application",
  operations: "operation",
  uploads: "upload",
  generations: "generation",
  enrollments: "enrollment",
  agent_connections: "agent_connection",
  browser_links: "browser_link",
  pairing_sessions: "pairing_session",
  pairing_events: "pairing_event",
  sessions: "session",
  challenges: "challenge",
  manifests: "manifest",
  releases: "release",
  bugs: "bug",
  features: "feature",
  events: "event"
};
function stripQuery(path5) {
  const query = path5.indexOf("?");
  return query >= 0 ? path5.slice(0, query) : path5;
}
function stripKnownPrefix(path5) {
  for (const prefix of API_PREFIXES) {
    if (path5.startsWith(prefix)) {
      return path5.slice(prefix.length);
    }
  }
  return path5.startsWith("/") ? path5.slice(1) : path5;
}
function keepToken(segment) {
  const folded = segment.replaceAll("-", "_");
  return folded.startsWith(".") ? folded.slice(1) : folded;
}
function pathSegments(path5) {
  return stripKnownPrefix(stripQuery(path5)).split("/").filter((segment) => segment.length > 0);
}
function httpResourceId(path5) {
  for (const segment of pathSegments(path5)) {
    if (!KEEP.has(segment)) {
      return segment;
    }
  }
  return void 0;
}
function httpTag(method, path5) {
  const methodPart = method.toLowerCase();
  const segments = pathSegments(path5);
  const tokens = [];
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (segment === void 0 || !KEEP.has(segment)) {
      continue;
    }
    const token = keepToken(segment);
    const next = segments[i + 1];
    if (next !== void 0 && !KEEP.has(next)) {
      const singular = SINGULAR[token] ?? token;
      tokens.push(singular === token ? "".concat(token, "_id") : singular);
      i += 1;
      continue;
    }
    tokens.push(token);
  }
  return tokens.length > 0 ? "".concat(methodPart, "_").concat(tokens.join("_")) : methodPart;
}
function localTag(op) {
  return op.replaceAll(".", "_").replaceAll("-", "_").toLowerCase();
}

// dist/log/types.js
var types_exports = {};
__export(types_exports, {
  LOG_EVENT_VERSION: () => LOG_EVENT_VERSION
});
var LOG_EVENT_VERSION = 1;

// dist/log/logger.js
var logger_exports = {};
__export(logger_exports, {
  LOG_SINK_DEGRADED_CODE: () => LOG_SINK_DEGRADED_CODE,
  commandWords: () => commandWords,
  createMemoryLogger: () => createMemoryLogger,
  createSinkLogger: () => createSinkLogger,
  logSinkDegradedWarning: () => logSinkDegradedWarning,
  loggerOf: () => loggerOf,
  loggingRunProcess: () => loggingRunProcess,
  loggingSignedRawPut: () => loggingSignedRawPut,
  loggingTransport: () => loggingTransport,
  noopLogger: () => noopLogger,
  queryKeys: () => queryKeys,
  requestSummary: () => requestSummary,
  responseSummary: () => responseSummary
});
import { randomUUID } from "node:crypto";
import path from "node:path";
var SUMMARY_LIMIT = 8192;
var LOCAL_PARAM_KEYS = /* @__PURE__ */ new Set([
  "width",
  "height",
  "encoder",
  "file_count",
  "exit_code",
  "state",
  "capture_id",
  "operation_id"
]);
function isLogParamValue(value) {
  return typeof value === "string" || typeof value === "number" && Number.isFinite(value) || typeof value === "boolean";
}
function keepParam(key, value) {
  if (isSensitiveKey(key)) {
    return false;
  }
  if (typeof value === "string" && (value.length === 0 || isSensitiveValue(value))) {
    return false;
  }
  return true;
}
function takeParams(source, keys) {
  const out = {};
  if (!source) {
    return out;
  }
  for (const [key, value] of Object.entries(source)) {
    if (keys && !keys.has(key)) {
      continue;
    }
    if (!isLogParamValue(value) || !keepParam(key, value)) {
      continue;
    }
    out[key] = value;
  }
  return out;
}
function asParamRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  return value;
}
function compactParams(explicit, fields) {
  const out = {
    ...takeParams(asParamRecord(explicit)),
    ...takeParams(asParamRecord(fields?.params)),
    ...takeParams(fields, LOCAL_PARAM_KEYS)
  };
  return Object.keys(out).length > 0 ? out : void 0;
}
function omitResourceFields(fields) {
  if (!fields) {
    return void 0;
  }
  const { id: _id, params: _params, ...rest } = fields;
  return rest;
}
function resourceId(explicit, fields) {
  if (typeof explicit === "string" && explicit.length > 0 && !isSensitiveValue(explicit)) {
    return explicit;
  }
  if (!fields) {
    return void 0;
  }
  if (typeof fields.id === "string" && fields.id.length > 0 && !isSensitiveValue(fields.id)) {
    return fields.id;
  }
  for (const key of ["capture_id", "operation_id"]) {
    const value = fields[key];
    if (typeof value === "string" && value.length > 0 && !isSensitiveValue(value)) {
      return value;
    }
  }
  return void 0;
}
function commandWords(positionals) {
  return positionals.slice(0, 2).filter((word) => word.length > 0);
}
function isoNow(now) {
  return now().toISOString();
}
function errorMessage(err) {
  if (err instanceof CliError) {
    return redactText(err.problem.detail || err.problem.title);
  }
  if (typeof err === "string") {
    return redactText(err);
  }
  if (err instanceof Error) {
    return redactText(err.message);
  }
  return "unknown error";
}
function errorProblem(err) {
  if (err instanceof CliError) {
    return {
      code: err.problem.code,
      detail: redactText(err.problem.detail),
      message: redactText(err.problem.title)
    };
  }
  return void 0;
}
function summarizeJson(value) {
  const redacted = redactValue(value);
  let encoded;
  try {
    encoded = JSON.stringify(redacted);
  } catch {
    return { omitted: "unserializable" };
  }
  if (encoded.length <= SUMMARY_LIMIT) {
    return redacted;
  }
  return {
    truncated: true,
    byte_length: Buffer.byteLength(encoded, "utf8")
  };
}
function requestSummary(body, contentType) {
  if (body === void 0) {
    return contentType ? { content_type: contentType } : {};
  }
  if (body instanceof Uint8Array) {
    return { content_type: contentType ?? "application/octet-stream", byte_length: body.byteLength };
  }
  if (typeof body === "string") {
    return {
      content_type: contentType ?? "text/plain",
      byte_length: Buffer.byteLength(body, "utf8"),
      request: summarizeJson(redactText(body).slice(0, SUMMARY_LIMIT))
    };
  }
  return {
    content_type: contentType ?? "application/json",
    request: summarizeJson(body)
  };
}
function responseSummary(body, binary, contentType) {
  if (binary || body instanceof Uint8Array) {
    const bytes = body instanceof Uint8Array ? body.byteLength : void 0;
    return { content_type: contentType, byte_length: bytes };
  }
  if (body === void 0) {
    return contentType ? { content_type: contentType } : {};
  }
  return { content_type: contentType, response: summarizeJson(body) };
}
function serializeEvent(event) {
  const redacted = redactValue(event);
  const line = JSON.stringify(redacted);
  return redactText(line);
}
var SpanStack = class {
  ids = [];
  parent() {
    return this.ids[this.ids.length - 1];
  }
  push(id) {
    const parent = this.parent();
    this.ids.push(id);
    return parent;
  }
  pop(id) {
    const index = this.ids.lastIndexOf(id);
    if (index >= 0) {
      this.ids.splice(index, 1);
    }
  }
};
var BaseLogger = class {
  enabled;
  runId;
  command;
  now;
  sink;
  stack = new SpanStack();
  runSpan;
  closed = false;
  /** Nested spans under a quiet parent are omitted. The quiet span itself still emits start/finish. */
  suppressNested = 0;
  constructor(options) {
    this.enabled = options.enabled;
    this.runId = options.runId ?? randomUUID();
    this.command = options.command;
    this.now = options.now;
    this.sink = options.sink;
  }
  setCommand(command) {
    this.command = command;
  }
  droppedLines() {
    return this.sink.droppedCount();
  }
  emit(event) {
    if (!this.enabled || this.closed) {
      return;
    }
    const full = {
      ...event,
      v: LOG_EVENT_VERSION,
      ts: isoNow(this.now),
      event_id: randomUUID(),
      run_id: this.runId,
      command: event.command ?? this.command
    };
    const line = serializeEvent(full);
    try {
      this.sink.writeLine(line);
    } catch {
    }
  }
  startHttp(init) {
    if (this.suppressNested > 0) {
      return silentHttpSpan();
    }
    const correlationId = randomUUID();
    const parent = this.stack.push(correlationId);
    const started = this.now().getTime();
    const tag = httpTag(init.method, init.path);
    const id = resourceId(init.id) ?? httpResourceId(init.path);
    const params = compactParams(init.params);
    this.emit({
      kind: "http",
      phase: "request",
      op: init.op,
      tag,
      correlation_id: correlationId,
      ...parent ? { parent_correlation_id: parent } : {},
      method: init.method,
      path: init.path,
      ...init.query_keys && init.query_keys.length > 0 ? { query_keys: init.query_keys } : {},
      ...init.request_id ? { request_id: init.request_id } : {},
      ...init.invocation_id ? { invocation_id: init.invocation_id } : {},
      ...init.content_type ? { content_type: init.content_type } : {},
      ...init.byte_length !== void 0 ? { byte_length: init.byte_length } : {},
      ...init.request !== void 0 ? { request: init.request } : {},
      ...id ? { id } : {},
      ...params ? { params } : {}
    });
    let closed = false;
    const close = (phase, fields) => {
      if (closed) {
        return;
      }
      closed = true;
      this.stack.pop(correlationId);
      const closeParams = compactParams(params, fields) ?? params;
      this.emit({
        kind: "http",
        phase,
        op: init.op,
        correlation_id: correlationId,
        ...parent ? { parent_correlation_id: parent } : {},
        method: init.method,
        path: init.path,
        duration_ms: Math.max(0, this.now().getTime() - started),
        ...init.request_id ? { request_id: init.request_id } : {},
        ...omitResourceFields(fields) ?? {},
        tag,
        ...id ? { id } : {},
        ...closeParams ? { params: closeParams } : {}
      });
    };
    return {
      correlationId,
      get closed() {
        return closed;
      },
      response: (status, fields) => close("response", { status, ...fields ?? {} }),
      error: (err, fields) => close("error", {
        message: errorMessage(err),
        ...errorProblem(err) ? { problem: errorProblem(err) } : {},
        ...err instanceof CliError ? { status: err.problem.status } : {},
        ...fields ?? {}
      })
    };
  }
  startLocal(init) {
    if (this.suppressNested > 0) {
      return silentLocalSpan();
    }
    const correlationId = randomUUID();
    const parent = this.stack.push(correlationId);
    const started = this.now().getTime();
    const { op, message, id: initId, params: initParams, quiet, ...rest } = init;
    const tag = localTag(op);
    const id = resourceId(typeof initId === "string" ? initId : void 0, rest);
    const params = compactParams(initParams, rest);
    this.emit({
      kind: "local",
      phase: "start",
      op,
      correlation_id: correlationId,
      ...parent ? { parent_correlation_id: parent } : {},
      ...message ? { message } : {},
      ...rest,
      tag,
      ...id ? { id } : {},
      ...params ? { params } : {}
    });
    if (quiet) {
      this.suppressNested += 1;
    }
    let closed = false;
    const close = (phase, fields) => {
      if (closed) {
        return;
      }
      closed = true;
      if (quiet) {
        this.suppressNested = Math.max(0, this.suppressNested - 1);
      }
      this.stack.pop(correlationId);
      const closeId = resourceId(id, fields);
      const closeParams = compactParams(params, fields);
      this.emit({
        kind: "local",
        phase,
        op,
        correlation_id: correlationId,
        ...parent ? { parent_correlation_id: parent } : {},
        duration_ms: Math.max(0, this.now().getTime() - started),
        ...omitResourceFields(fields) ?? {},
        tag,
        ...closeId ? { id: closeId } : {},
        ...closeParams ? { params: closeParams } : {}
      });
    };
    return {
      correlationId,
      get closed() {
        return closed;
      },
      progress: (fields) => {
        if (closed || quiet) {
          return;
        }
        const progressId = resourceId(id, fields);
        const progressParams = compactParams(params, fields);
        this.emit({
          kind: "local",
          phase: "progress",
          op,
          correlation_id: correlationId,
          ...parent ? { parent_correlation_id: parent } : {},
          ...omitResourceFields(fields) ?? {},
          tag,
          ...progressId ? { id: progressId } : {},
          ...progressParams ? { params: progressParams } : {}
        });
      },
      finish: (fields) => close("finish", fields),
      error: (err, fields) => close("error", {
        message: errorMessage(err),
        ...errorProblem(err) ? { problem: errorProblem(err) } : {},
        ...fields ?? {}
      })
    };
  }
  async withLocal(init, fn) {
    const span = this.startLocal(init);
    try {
      const result = await fn(span);
      if (!span.closed) {
        span.finish();
      }
      return result;
    } catch (err) {
      if (!span.closed) {
        span.error(err);
      }
      throw err;
    }
  }
  beginRun() {
    if (!this.enabled || this.runSpan) {
      return;
    }
    this.runSpan = this.startLocal({
      op: "cli.run",
      message: this.command.length > 0 ? this.command.join(" ") : "screenrig"
    });
  }
  endRun(err) {
    if (!this.runSpan || this.runSpan.closed) {
      return;
    }
    if (err !== void 0) {
      this.runSpan.error(err);
    } else {
      this.runSpan.finish();
    }
  }
  async close() {
    if (this.closed) {
      return;
    }
    this.closed = true;
    try {
      await this.sink.close();
    } catch {
    }
  }
};
function silentHttpSpan() {
  let closed = false;
  return {
    correlationId: randomUUID(),
    get closed() {
      return closed;
    },
    response() {
      closed = true;
    },
    error() {
      closed = true;
    }
  };
}
function silentLocalSpan() {
  let closed = false;
  return {
    correlationId: randomUUID(),
    get closed() {
      return closed;
    },
    progress() {
    },
    finish() {
      closed = true;
    },
    error() {
      closed = true;
    }
  };
}
var silentSink = {
  writeLine() {
  },
  async close() {
  },
  droppedCount() {
    return 0;
  }
};
var LOG_SINK_DEGRADED_CODE = "log_sink_degraded";
function logSinkDegradedWarning(dropped) {
  if (!Number.isInteger(dropped) || dropped <= 0) {
    return void 0;
  }
  return {
    code: LOG_SINK_DEGRADED_CODE,
    dropped,
    message: "Operation log dropped ".concat(dropped, " line(s) because log_socket was unavailable or the consumer fell behind.")
  };
}
var noopLogger = new BaseLogger({
  enabled: false,
  command: [],
  now: () => /* @__PURE__ */ new Date(),
  sink: silentSink
});
function loggerOf(runtime) {
  return runtime.logger ?? noopLogger;
}
function createMemoryLogger(options = {}) {
  const events = [];
  const sink = {
    writeLine(line) {
      events.push(JSON.parse(line));
    },
    async close() {
    },
    droppedCount() {
      return 0;
    }
  };
  const logger = new BaseLogger({
    enabled: true,
    command: options.command ?? [],
    now: options.now ?? (() => /* @__PURE__ */ new Date()),
    sink
  });
  return { logger, events };
}
function createSinkLogger(options) {
  return new BaseLogger({
    enabled: true,
    command: options.command ?? [],
    now: options.now ?? (() => /* @__PURE__ */ new Date()),
    sink: options.sink,
    runId: options.runId
  });
}
function queryKeys(query) {
  if (!query) {
    return void 0;
  }
  const keys = Object.entries(query).filter(([, value]) => value !== void 0 && value !== "").map(([key]) => key);
  return keys.length > 0 ? keys : void 0;
}
function loggingRunProcess(run, logger) {
  if (!logger.enabled) {
    return run;
  }
  return async (request) => {
    const commandName = path.basename(request.command) || request.command;
    return logger.withLocal({
      op: "process.spawn",
      message: commandName,
      command_name: commandName,
      args: request.args.map((arg) => redactText(arg))
    }, async (span) => {
      const result = await run(request);
      if (result.spawnError || result.timedOut || result.code !== 0 && result.code !== null) {
        span.error(result.spawnError ?? "exit ".concat(result.code ?? "unknown"), {
          exit_code: result.code,
          timed_out: result.timedOut,
          stderr_tail: redactText(result.stderrTail).slice(-800)
        });
        return result;
      }
      span.finish({ exit_code: result.code });
      return result;
    });
  };
}
function loggingTransport(transport, logger) {
  if (!logger.enabled) {
    return transport;
  }
  return {
    request: (req) => transport.request(req),
    download: (req) => transport.download(req),
    stream: async (req) => {
      const keys = queryKeys(req.query);
      const span = logger.startLocal({
        op: "sse.connect",
        message: "SSE ".concat(req.method, " ").concat(req.path),
        method: req.method,
        path: req.path,
        ...keys ? { query_keys: keys } : {}
      });
      let stream;
      try {
        stream = await transport.stream(req);
      } catch (err) {
        span.error(err);
        throw err;
      }
      return {
        async *[Symbol.asyncIterator]() {
          try {
            for await (const chunk of stream) {
              const eventMatch = /^event:\s*(\S+)/m.exec(chunk);
              if (eventMatch?.[1]) {
                span.progress({ event_type: eventMatch[1] });
              }
              yield chunk;
            }
            span.finish();
          } catch (err) {
            span.error(err);
            throw err;
          }
        }
      };
    }
  };
}
function loggingSignedRawPut(put, logger) {
  if (!logger.enabled) {
    return put;
  }
  return async (request) => {
    const byteLength = request.body instanceof Uint8Array ? request.body.byteLength : void 0;
    return logger.withLocal({
      op: "media.signed_put",
      message: "PUT signed media object",
      method: "PUT",
      ...byteLength !== void 0 ? { byte_length: byteLength } : {}
    }, async (span) => {
      try {
        const response = await put(request);
        if (response.status < 200 || response.status >= 300) {
          span.error("HTTP ".concat(response.status), { status: response.status });
          return response;
        }
        span.finish({ status: response.status, ...byteLength !== void 0 ? { byte_length: byteLength } : {} });
        return response;
      } catch (err) {
        span.error(err);
        throw err;
      }
    });
  };
}

// dist/memory-config.js
var memory_config_exports = {};
__export(memory_config_exports, {
  memoryConfigFs: () => memoryConfigFs
});
import path2 from "node:path";
function errno(code, target) {
  const err = new Error("".concat(code, ": ").concat(target));
  err.code = code;
  return err;
}
function memoryConfigFs(base, root) {
  const entries = /* @__PURE__ */ new Map([[root, { kind: "dir", data: "", mode: 448, mtimeMs: Date.now() }]]);
  const inside = (target) => {
    const resolved = path2.resolve(String(target));
    return resolved === root || resolved.startsWith("".concat(root).concat(path2.sep)) ? resolved : void 0;
  };
  const children = (dir) => [...entries.keys()].filter((key) => key.startsWith("".concat(dir).concat(path2.sep)));
  const handle = (target, entry, writable) => ({
    readFile: async () => {
      if (!entry || entry.kind !== "file")
        throw errno("EISDIR", target);
      return entry.data;
    },
    writeFile: async (data) => {
      if (!writable || !entry)
        throw errno("EBADF", target);
      entry.data = typeof data === "string" ? data : Buffer.from(data).toString("utf8");
      entry.mtimeMs = Date.now();
    },
    sync: async () => void 0,
    close: async () => void 0
  });
  const fs = {
    ...base,
    mkdir: (async (target, options) => {
      const at = inside(target);
      if (!at)
        return base.mkdir(target, options);
      if (entries.has(at)) {
        if (options?.recursive)
          return void 0;
        throw errno("EEXIST", at);
      }
      if (!entries.has(path2.dirname(at)) && !options?.recursive)
        throw errno("ENOENT", at);
      entries.set(at, { kind: "dir", data: "", mode: options?.mode ?? 448, mtimeMs: Date.now() });
      return void 0;
    }),
    open: (async (target, flags, mode) => {
      const at = inside(target);
      if (!at)
        return base.open(target, flags, mode);
      const existing = entries.get(at);
      if (flags === "w" || flags === "wx") {
        if (flags === "wx" && existing)
          throw errno("EEXIST", at);
        if (!entries.has(path2.dirname(at)))
          throw errno("ENOENT", at);
        const entry = { kind: "file", data: "", mode: mode ?? 384, mtimeMs: Date.now() };
        entries.set(at, entry);
        return handle(at, entry, true);
      }
      if (!existing)
        throw errno("ENOENT", at);
      return handle(at, existing, false);
    }),
    rename: (async (from, to) => {
      const source = inside(from);
      const target = inside(to);
      if (!source && !target)
        return base.rename(from, to);
      if (!source || !target)
        throw errno("EXDEV", String(from));
      const entry = entries.get(source);
      if (!entry)
        throw errno("ENOENT", source);
      for (const child of children(source)) {
        entries.set(target + child.slice(source.length), entries.get(child));
        entries.delete(child);
      }
      entries.delete(source);
      entries.set(target, entry);
    }),
    rm: (async (target, options) => {
      const at = inside(target);
      if (!at)
        return base.rm(target, options);
      if (!entries.has(at)) {
        if (options?.force)
          return;
        throw errno("ENOENT", at);
      }
      for (const child of children(at))
        entries.delete(child);
      entries.delete(at);
    }),
    chmod: (async (target, mode) => {
      const at = inside(target);
      if (!at)
        return base.chmod(target, mode);
      const entry = entries.get(at);
      if (!entry)
        throw errno("ENOENT", at);
      entry.mode = mode;
    }),
    stat: (async (target) => {
      const at = inside(target);
      if (!at)
        return base.stat(target);
      const entry = entries.get(at);
      if (!entry)
        throw errno("ENOENT", at);
      return { mode: entry.mode, mtimeMs: entry.mtimeMs, isDirectory: () => entry.kind === "dir", isFile: () => entry.kind === "file", size: entry.data.length };
    })
  };
  return fs;
}

// dist/oauth-session.js
var oauth_session_exports = {};
__export(oauth_session_exports, {
  ACCESS_RENEW_MARGIN_S: () => ACCESS_RENEW_MARGIN_S,
  OAuthSession: () => OAuthSession,
  REFRESH_EXPIRY_WARNINGS_DAYS: () => REFRESH_EXPIRY_WARNINGS_DAYS,
  isSessionEnded: () => isSessionEnded,
  placeAccessToken: () => placeAccessToken,
  refreshExpiryDays: () => refreshExpiryDays,
  withoutSession: () => withoutSession
});
import { createHash } from "node:crypto";
var ACCESS_RENEW_MARGIN_S = 120;
var REFRESH_EXPIRY_WARNINGS_DAYS = [30, 7];
function digest(value) {
  return createHash("sha256").update("screenrig/cli-oauth/v1\0").update(value).digest("hex");
}
function isSessionEnded(err) {
  return err instanceof CliError && err.problem.code === "session_ended";
}
function placeAccessToken(file, accessToken, scope) {
  const claims = accessClaims(accessToken);
  const next = {
    ...file,
    token: accessToken,
    token_projects: claims?.projects ? Object.keys(claims.projects) : claims?.prj ? [claims.prj] : []
  };
  if (!next.project_id && next.token_projects?.length === 1)
    next.project_id = next.token_projects[0];
  if (next.projects)
    next.projects = Object.fromEntries(Object.entries(next.projects).map(([id, slot]) => {
      const { token: _token, ...state } = slot;
      return [id, state];
    }));
  delete next.identity_token;
  if (scope.includes(SCOPE_IDENTITY))
    next.identity_token = accessToken;
  return next;
}
function withoutSession(file) {
  const { oauth: _grant, login: _login, ...rest } = file;
  const next = { ...rest };
  if (isSessionJwt(next.token))
    delete next.token;
  delete next.token_projects;
  if (isSessionJwt(next.identity_token))
    delete next.identity_token;
  if (next.projects) {
    next.projects = Object.fromEntries(Object.entries(next.projects).map(([id, slot]) => {
      if (!isSessionJwt(slot?.token))
        return [id, slot];
      const { token: _token, ...kept } = slot;
      return [id, kept];
    }));
  }
  return next;
}
var OAuthSession = class {
  configPath;
  apiUrl;
  runtime;
  service;
  client;
  /** A service client's token lives only in memory; it is minted again rather than refreshed. */
  serviceAccess;
  constructor(configPath, apiUrl, transport, runtime, service) {
    this.configPath = configPath;
    this.apiUrl = apiUrl;
    this.runtime = runtime;
    this.service = service;
    this.client = new OAuthClient(apiUrl, transport, service);
  }
  get serviceMode() {
    return this.service !== void 0;
  }
  /** The service token, minted when there is none or it is about to expire, or when the API refused it. */
  async serviceToken(rejected) {
    const claims = accessClaims(this.serviceAccess);
    if (this.serviceAccess && this.serviceAccess !== rejected && claims && claims.exp - this.nowMs() / 1e3 > ACCESS_RENEW_MARGIN_S) {
      return this.serviceAccess;
    }
    const tokens = await this.client.clientCredentials();
    this.serviceAccess = tokens.accessToken;
    await this.locked(async () => {
      const current = await this.read() ?? { api_url: this.apiUrl };
      await this.write(placeAccessToken(current, tokens.accessToken, []));
    });
    return tokens.accessToken;
  }
  get oauth() {
    return this.client;
  }
  nowMs() {
    return this.runtime.now().getTime();
  }
  read() {
    return readConfigFile(this.configPath, this.runtime.fs);
  }
  write(config) {
    return writeConfigAtomic(this.configPath, { ...config, updated_at: this.runtime.now().toISOString() }, this.runtime.fs);
  }
  locked(action) {
    return withConfigLock(this.configPath, this.runtime.fs, { sleep: this.runtime.sleep, now: () => this.nowMs() }, action);
  }
  /** Renew one current token without changing its subset for the command's selection. */
  async prepare(resolved, _options = {}) {
    if (this.service) {
      const token2 = await this.serviceToken();
      const project = accessClaims(token2)?.prj;
      if (resolved.projectId && project !== resolved.projectId) {
        throw configError("This service client belongs to another project than --project-id names. Nothing else was sent.");
      }
      return { ...resolved, token: token2, ...project ? { projectId: project } : {} };
    }
    const file = await this.read();
    if (!file?.oauth)
      return resolved;
    const token = await this.accessFor(void 0);
    if (!token)
      return resolved;
    const claims = accessClaims(token);
    return { ...resolved, token, ...claims?.scope.includes(SCOPE_IDENTITY) ? { identityToken: token } : {} };
  }
  /** An access token carrying identity scope, renewed when needed; undefined when the grant has no identity access. */
  async identityToken() {
    if (this.service)
      return void 0;
    const file = await this.read();
    if (!file?.oauth?.identity)
      return void 0;
    return this.accessFor(void 0);
  }
  /** ApiClient hook for a 401 on an access token: an invalid_token refusal renews the token once. */
  async renewRejected(token, invalidToken = true) {
    if (this.service)
      return invalidToken ? this.serviceToken(token) : void 0;
    const claims = accessClaims(token);
    if (!claims?.sid)
      return void 0;
    return invalidToken ? this.accessFor(void 0, token) : void 0;
  }
  /**
   * The current access token, independent of project selection,
   * renewed under the lock. The holder re-reads the config first: another
   * process may have refreshed already, and then nothing is sent.
   */
  async accessFor(_projectId, rejected) {
    if (this.service)
      return this.serviceToken(rejected);
    const stored = (file) => {
      const token = file.token ?? file.identity_token;
      const claims = accessClaims(token);
      return token && token !== rejected && claims && claims.exp - this.nowMs() / 1e3 > ACCESS_RENEW_MARGIN_S ? token : void 0;
    };
    const unlocked = await this.read();
    if (!unlocked?.oauth)
      return void 0;
    const ready = stored(unlocked);
    if (ready)
      return ready;
    await this.client.ready();
    return this.locked(async () => {
      const file = await this.read();
      const grant = file?.oauth;
      if (!file || !grant)
        return void 0;
      return stored(file) ?? this.refreshLocked(file, grant);
    });
  }
  async refreshLocked(file, grant, projects, recoveredExpiredAccess = false) {
    if (grant.client_id !== "screenrig-cli")
      throw configError("The stored refresh family belongs to another client. Sign in with this CLI.");
    const from = digest(grant.refresh_token);
    let pending = grant.refresh_request;
    if (!pending || pending.from !== from) {
      const claims2 = accessClaims(file.token ?? file.identity_token);
      const selected = projects ?? file.token_projects ?? (claims2?.projects ? Object.keys(claims2.projects) : claims2?.prj ? [claims2.prj] : void 0);
      pending = { request_id: newOAuthRequestId(), from, started_at: this.runtime.now().toISOString(), ...selected ? { projects: selected } : {} };
      await this.write({ ...file, oauth: { ...grant, refresh_request: pending } });
    }
    let tokens;
    try {
      tokens = await this.client.refresh(grant.refresh_token, { requestId: pending.request_id, ...pending.projects ? { projects: pending.projects } : {} });
    } catch (err) {
      if (isSessionEnded(err)) {
        const current2 = await this.read() ?? file;
        await this.write({ ...withoutSession(current2), signed_out_at: this.runtime.now().toISOString() });
      }
      if (err instanceof CliError && !isSessionEnded(err) && err.problem.status >= 400 && err.problem.status < 500 && ![408, 429].includes(err.problem.status)) {
        const { refresh_request: _refused, ...kept } = grant;
        await this.write({ ...file, oauth: kept });
      }
      throw err;
    }
    const current = await this.read() ?? file;
    if (current.oauth?.refresh_token !== grant.refresh_token) {
      throw configError("The stored sign-in changed during a refresh. Run the command again.");
    }
    const { refresh_request: _done, ...settled } = grant;
    const next = placeAccessToken(current, tokens.accessToken, tokens.scope);
    const updated = {
      ...next,
      oauth: {
        ...settled,
        refresh_token: tokens.refreshToken ?? grant.refresh_token,
        ...tokens.refreshExpiresAt !== void 0 ? { refresh_expires_at: tokens.refreshExpiresAt } : {},
        identity: Boolean(grant.identity || tokens.scope.includes(SCOPE_IDENTITY))
      }
    };
    await this.write(updated);
    const claims = accessClaims(tokens.accessToken);
    if (!claims || claims.exp - this.nowMs() / 1e3 <= ACCESS_RENEW_MARGIN_S) {
      if (recoveredExpiredAccess) {
        throw new CliError(makeProblem("unexpected_response", "Expired access token", 502, "The server returned expired access tokens twice. The sign-in and latest refresh token were preserved; retry the command."), ExitCode.Server);
      }
      return this.refreshLocked(updated, updated.oauth, projects, true);
    }
    return tokens.accessToken;
  }
  /** Replace the token subset explicitly; directory memberships never expand it implicitly. */
  async selectProjects(projects) {
    if (!projects.length || projects.length > 64 || new Set(projects).size !== projects.length)
      throw configError("Select 1\u201364 distinct project IDs.");
    await this.client.ready();
    return this.locked(async () => {
      const file = await this.read();
      if (!file?.oauth)
        throw configError("Sign in before selecting token projects.");
      if (file.oauth.refresh_request) {
        const pendingProjects = file.oauth.refresh_request.projects;
        const token = await this.refreshLocked(file, file.oauth);
        if (pendingProjects && JSON.stringify([...pendingProjects].sort()) === JSON.stringify([...projects].sort()))
          return token;
        const settled = await this.read();
        return this.refreshLocked(settled, settled.oauth, projects);
      }
      return this.refreshLocked(file, file.oauth, projects);
    });
  }
  /**
   * RFC 7009 revocation of the refresh token, which revokes the grant, then
   * the grant and its access tokens leave the config. A failure that might
   * not have reached the server keeps them.
   */
  async logout() {
    const file = await this.read();
    const grant = file?.oauth;
    if (!grant) {
      if (file?.login)
        await this.locked(async () => {
          const current = await this.read();
          if (current?.login) {
            const { login: _pending, ...rest } = current;
            await this.write(rest);
          }
        });
      return { revoked: false };
    }
    await this.client.revoke(grant.refresh_token);
    await this.locked(async () => {
      const current = await this.read();
      if (!current)
        return;
      await this.write({ ...withoutSession(current), signed_out_at: this.runtime.now().toISOString() });
    });
    return { revoked: true };
  }
};
function refreshExpiryDays(grant, now) {
  if (!grant?.refresh_expires_at)
    return void 0;
  const days = Math.floor((grant.refresh_expires_at * 1e3 - now.getTime()) / 864e5);
  return days <= REFRESH_EXPIRY_WARNINGS_DAYS[0] ? Math.max(days, 0) : void 0;
}

// dist/media/ffmpeg.js
var ffmpeg_exports = {};
__export(ffmpeg_exports, {
  cwebpLookup: () => cwebpLookup,
  ffmpegLookup: () => ffmpegLookup,
  inputGuardArgs: () => inputGuardArgs,
  parseCwebpVersion: () => parseCwebpVersion,
  parseEncoderNames: () => parseEncoderNames,
  parseFilterNames: () => parseFilterNames,
  parseProbePayload: () => parseProbePayload,
  parseRate: () => parseRate,
  pixelFormatHasAlpha: () => pixelFormatHasAlpha,
  probeMedia: () => probeMedia,
  resetFfmpegToolchainCache: () => resetFfmpegToolchainCache,
  resolveCwebpToolchain: () => resolveCwebpToolchain,
  resolveFfmpegToolchain: () => resolveFfmpegToolchain,
  runProcessFor: () => runProcessFor
});
import path3 from "node:path";
var INSTALL_HINT = "Install ffmpeg 6.0 or newer and make ffmpeg and ffprobe reachable on PATH, or set SCREENRIG_FFMPEG and SCREENRIG_FFPROBE to their absolute paths.";
var VERSION_TIMEOUT_MS = 15e3;
function ffmpegLookup(settings) {
  const ffmpegEnv = trimmed(settings.SCREENRIG_FFMPEG);
  const ffprobeEnv = trimmed(settings.SCREENRIG_FFPROBE);
  return {
    ffmpeg: ffmpegEnv ?? "ffmpeg",
    ffprobe: ffprobeEnv ?? "ffprobe",
    ffmpegFromEnv: ffmpegEnv !== void 0,
    ffprobeFromEnv: ffprobeEnv !== void 0
  };
}
function cwebpLookup(settings) {
  const cwebpEnv = trimmed(settings.SCREENRIG_CWEBP);
  return {
    cwebp: cwebpEnv ?? "cwebp",
    cwebpFromEnv: cwebpEnv !== void 0
  };
}
function trimmed(value) {
  const text = value?.trim();
  return text && text.length > 0 ? text : void 0;
}
function parseCwebpVersion(output) {
  const match = /(\d+\.\d+(?:\.\d+)?)/.exec(output);
  return match?.[1] ?? "unknown";
}
function runProcessFor(runtime) {
  const run = runtime.runProcess;
  if (!run) {
    throw usageError("This runtime cannot start the ffmpeg toolchain.");
  }
  return loggingRunProcess(run, loggerOf(runtime));
}
function missingToolError(binary, result) {
  const reason = result.spawnError ? redactText(result.spawnError) : result.timedOut ? "the version probe timed out" : "it exited with status ".concat(result.code ?? "unknown");
  throw usageError("Cannot run ".concat(binary, ": ").concat(reason, ". ").concat(INSTALL_HINT), {
    command: "screenrig doctor",
    reason: "Report which part of the required ffmpeg toolchain is missing or unusable."
  }, "".concat(INSTALL_HINT, " If you cannot install software, a file already in a format screenRIG accepts can be uploaded unchanged with --no-transcode."));
}
function parseVersion(output) {
  const match = /^ff(?:mpeg|probe) version (\S+)/m.exec(output);
  return match?.[1] ?? "unknown";
}
function parseEncoderNames(output) {
  const names = /* @__PURE__ */ new Set();
  for (const line of output.split("\n")) {
    const match = /^\s[A-Za-z.]{6}\s+([A-Za-z0-9_.-]+)\s+\S/.exec(line);
    const name = match?.[1];
    if (name && name !== "=") {
      names.add(name);
    }
  }
  return names;
}
function parseFilterNames(output) {
  const names = /* @__PURE__ */ new Set();
  for (const line of output.split("\n")) {
    const match = /^\s*\S{2,4}\s+([A-Za-z0-9_]+)\s+[AVN|]+(?:->|→)[AVN|]+/.exec(line);
    const name = match?.[1];
    if (name) {
      names.add(name);
    }
  }
  return names;
}
var cached;
var cwebpCached;
function resetFfmpegToolchainCache() {
  cached = void 0;
  cwebpCached = void 0;
}
async function resolveFfmpegToolchain(runtime) {
  cached ??= probeToolchain(runtime);
  try {
    return await cached;
  } catch (error) {
    cached = void 0;
    throw error;
  }
}
async function probeToolchain(runtime) {
  const run = runProcessFor(runtime);
  const lookup = ffmpegLookup(runtime.settings);
  const ffmpegVersionResult = await run({
    command: lookup.ffmpeg,
    args: ["-hide_banner", "-version"],
    timeoutMs: VERSION_TIMEOUT_MS
  });
  if (ffmpegVersionResult.spawnError || ffmpegVersionResult.code !== 0) {
    missingToolError(lookup.ffmpeg, ffmpegVersionResult);
  }
  const ffprobeVersionResult = await run({
    command: lookup.ffprobe,
    args: ["-hide_banner", "-version"],
    timeoutMs: VERSION_TIMEOUT_MS
  });
  if (ffprobeVersionResult.spawnError || ffprobeVersionResult.code !== 0) {
    missingToolError(lookup.ffprobe, ffprobeVersionResult);
  }
  const encodersResult = await run({
    command: lookup.ffmpeg,
    args: ["-hide_banner", "-encoders"],
    timeoutMs: VERSION_TIMEOUT_MS
  });
  if (encodersResult.spawnError || encodersResult.code !== 0) {
    missingToolError(lookup.ffmpeg, encodersResult);
  }
  const filtersResult = await run({
    command: lookup.ffmpeg,
    args: ["-hide_banner", "-filters"],
    timeoutMs: VERSION_TIMEOUT_MS
  });
  if (filtersResult.spawnError || filtersResult.code !== 0) {
    missingToolError(lookup.ffmpeg, filtersResult);
  }
  return {
    ffmpeg: lookup.ffmpeg,
    ffprobe: lookup.ffprobe,
    ffmpegVersion: parseVersion(ffmpegVersionResult.stdout),
    ffprobeVersion: parseVersion(ffprobeVersionResult.stdout),
    encoders: parseEncoderNames(encodersResult.stdout),
    filters: parseFilterNames(filtersResult.stdout)
  };
}
async function resolveCwebpToolchain(runtime) {
  cwebpCached ??= probeCwebp(runtime);
  try {
    return await cwebpCached;
  } catch (error) {
    cwebpCached = void 0;
    throw error;
  }
}
async function probeCwebp(runtime) {
  const run = runProcessFor(runtime);
  const lookup = cwebpLookup(runtime.settings);
  const result = await run({
    command: lookup.cwebp,
    args: ["-version"],
    timeoutMs: VERSION_TIMEOUT_MS
  });
  if (result.spawnError || result.code !== 0 || result.timedOut) {
    return void 0;
  }
  const version = parseCwebpVersion("".concat(result.stdout, "\n").concat(result.stderrTail));
  return {
    cwebp: lookup.cwebp,
    version,
    fromEnv: lookup.cwebpFromEnv
  };
}
function inputGuardArgs(demuxer) {
  return ["-protocol_whitelist", "file", ...demuxer ? ["-f", demuxer] : []];
}
async function sniffedDemuxer(filePath) {
  return sniffMediaContainer(await readMediaHead(filePath))?.demuxer;
}
var ALPHA_PIXEL_MARKERS = ["rgba", "bgra", "argb", "abgr", "yuva", "gbrap", "pal8"];
function pixelFormatHasAlpha(pixelFormat) {
  if (pixelFormat.length === 0) {
    return false;
  }
  if (/^ya\d/.test(pixelFormat)) {
    return true;
  }
  return ALPHA_PIXEL_MARKERS.some((marker) => pixelFormat.includes(marker));
}
function parseProbePayload(raw) {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw usageError("ffprobe returned output the CLI could not parse.");
  }
  const streams = payload.streams ?? [];
  const video = streams.find((stream) => stream.codec_type === "video");
  const audio = streams.find((stream) => stream.codec_type === "audio");
  const codedWidth = video?.width ?? 0;
  const codedHeight = video?.height ?? 0;
  const rotationDegrees = normalizeRotation(video);
  const swapped = rotationDegrees === 90 || rotationDegrees === 270;
  const fps = parseRate(video?.avg_frame_rate) || parseRate(video?.r_frame_rate);
  const frameCount = Number.parseInt(video?.nb_frames ?? "", 10);
  const duration = Number.parseFloat(payload.format?.duration ?? "") || Number.parseFloat(video?.duration ?? "") || 0;
  const pixelFormat = normalizeField(video?.pix_fmt);
  return {
    hasVideo: video !== void 0 && codedWidth > 0 && codedHeight > 0,
    hasAudio: audio !== void 0,
    codec: normalizeField(video?.codec_name),
    codecTag: normalizeField(video?.codec_tag_string),
    streamCount: streams.length,
    videoStreamIndex: video?.index ?? streams.indexOf(video),
    audioStreamIndex: audio?.index ?? streams.indexOf(audio),
    audioProfile: normalizeField(audio?.profile),
    timeBase: parseRate(video?.time_base),
    profile: normalizeField(video?.profile),
    level: video?.level ?? 0,
    fieldOrder: normalizeField(video?.field_order),
    colorRange: normalizeField(video?.color_range),
    videoStreams: streams.filter((stream) => stream.codec_type === "video").length,
    audioStreams: streams.filter((stream) => stream.codec_type === "audio").length,
    audioCodec: normalizeField(audio?.codec_name),
    audioSampleRate: Number(audio?.sample_rate ?? 0),
    audioChannels: audio?.channels ?? 0,
    formatNames: (payload.format?.format_name ?? "").split(",").filter((name) => name.length > 0),
    pixelFormat,
    codedWidth,
    codedHeight,
    displayWidth: swapped ? codedHeight : codedWidth,
    displayHeight: swapped ? codedWidth : codedHeight,
    rotationDegrees,
    fps: Number.isFinite(fps) ? fps : 0,
    frameCount: Number.isInteger(frameCount) && frameCount > 0 ? frameCount : 0,
    durationSeconds: Number.isFinite(duration) && duration > 0 ? duration : 0,
    colorTransfer: normalizeField(video?.color_transfer),
    colorPrimaries: normalizeField(video?.color_primaries),
    colorSpace: normalizeField(video?.color_space),
    hasAlpha: pixelFormatHasAlpha(pixelFormat)
  };
}
function normalizeRotation(video) {
  const fromSideData = video?.side_data_list?.find((entry) => typeof entry.rotation === "number")?.rotation;
  const fromTag = Number.parseFloat(video?.tags?.rotate ?? "");
  const raw = typeof fromSideData === "number" ? fromSideData : fromTag;
  if (!Number.isFinite(raw)) {
    return 0;
  }
  const normalized = (Math.round(raw) % 360 + 360) % 360;
  return normalized === 90 || normalized === 180 || normalized === 270 ? normalized : 0;
}
function normalizeField(value) {
  const text = (value ?? "").trim().toLowerCase();
  return text === "unknown" || text === "n/a" ? "" : text;
}
function parseRate(rate) {
  if (!rate) {
    return 0;
  }
  const [numerator, denominator] = rate.split("/", 2);
  const num = Number.parseFloat(numerator ?? "");
  if (!Number.isFinite(num)) {
    return 0;
  }
  if (denominator === void 0) {
    return num;
  }
  const den = Number.parseFloat(denominator);
  return Number.isFinite(den) && den !== 0 ? num / den : 0;
}
function firstProbeError(stderr, filePath) {
  const line = stderr.split("\n").map((text) => text.trim()).find((text) => text.length > 0);
  if (!line)
    return void 0;
  const plain = redactText(line.split(filePath).join(path3.basename(filePath))).replace(/ @ 0x[0-9a-f]+\]/gi, "]");
  return plain.length > 300 ? "".concat(plain.slice(0, 300), "\u2026") : plain;
}
var UNREADABLE_MEDIA_HINT = "The file may be truncated or not a media file. Check that it plays in a media player, or export or download it again, then run the upload again.";
async function probeMedia(runtime, toolchain, filePath) {
  const run = runProcessFor(runtime);
  const demuxer = await sniffedDemuxer(filePath).catch(() => void 0);
  const result = await run({
    command: toolchain.ffprobe,
    args: [
      // Errors only: the line that says why a file cannot be read.
      "-v",
      "error",
      ...inputGuardArgs(demuxer),
      "-print_format",
      "json",
      "-show_streams",
      "-show_format",
      filePath
    ],
    timeoutMs: 12e4
  });
  if (result.spawnError) {
    throw usageError("ffprobe could not read the media file: ".concat(redactText(result.spawnError), "."));
  }
  if (result.code !== 0) {
    const status = "exit status ".concat(result.code ?? "unknown");
    const said = firstProbeError(result.stderrTail, filePath);
    throw usageError("ffprobe could not read the media file: ".concat(said ? "".concat(said, " (").concat(status, ")") : status, "."), void 0, UNREADABLE_MEDIA_HINT);
  }
  const probe = parseProbePayload(result.stdout);
  return demuxer ? { ...probe, inputDemuxer: demuxer } : probe;
}

// dist/media/webp.js
var webp_exports = {};
__export(webp_exports, {
  readWebpContainer: () => readWebpContainer
});
var RIFF = 1380533830;
var WEBP = 1464156752;
function readWebpContainer(bytes) {
  if (bytes.length < 16) {
    return void 0;
  }
  if (bytes.readUInt32BE(0) !== RIFF || bytes.readUInt32BE(8) !== WEBP) {
    return void 0;
  }
  let offset = 12;
  let result = { animated: false, width: 0, height: 0, lossless: false };
  while (offset + 8 <= bytes.length) {
    const id = bytes.toString("ascii", offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const payload = offset + 8;
    if (size > bytes.length - payload) {
      break;
    }
    if (id === "VP8X" && size >= 10) {
      const flags = bytes.readUInt8(payload);
      result = {
        ...result,
        animated: (flags & 2) !== 0,
        width: bytes.readUIntLE(payload + 4, 3) + 1,
        height: bytes.readUIntLE(payload + 7, 3) + 1
      };
    } else if (id === "VP8L") {
      result.lossless = true;
      if (result.width === 0 && size >= 5 && bytes.readUInt8(payload) === 47) {
        const bits = bytes.readUInt32LE(payload + 1);
        result.width = (bits & 16383) + 1;
        result.height = (bits >> 14 & 16383) + 1;
      }
    } else if (id === "VP8 " && size >= 10 && result.width === 0) {
      const start = payload + 3;
      if (bytes.readUInt8(start) === 157 && bytes.readUInt8(start + 1) === 1 && bytes.readUInt8(start + 2) === 42) {
        result.width = bytes.readUInt16LE(start + 3) & 16383;
        result.height = bytes.readUInt16LE(start + 5) & 16383;
      }
    }
    offset = payload + size + size % 2;
  }
  return result;
}

// dist/media/video-profile.js
var video_profile_exports = {};
__export(video_profile_exports, {
  MAX_VIDEO_PIXELS: () => MAX_VIDEO_PIXELS,
  boundedVideoSize: () => boundedVideoSize,
  planVideoDelivery: () => planVideoDelivery,
  validateVideoOutput: () => validateVideoOutput,
  videoBounds: () => videoBounds,
  videoLevel: () => videoLevel
});
var AVC_LEVELS = [
  { name: "4.2", id: 42, frame: 8704, rate: 522240, dpb: 34816 },
  { name: "5.1", id: 51, frame: 36864, rate: 983040, dpb: 184320 },
  { name: "5.2", id: 52, frame: 36864, rate: 2073600, dpb: 184320 }
];
var HEVC_LEVELS = [
  { name: "5.1", id: 153, frame: 8912896, rate: 534773760 },
  { name: "5.2", id: 156, frame: 8912896, rate: 1069547520 }
];
var MAX_VIDEO_PIXELS = 3840 * 2160;
function videoBounds(options) {
  const fullHd = options.preset === "signage-1080p30";
  return {
    longEdge: Math.min(options.maxEdge, fullHd ? 1920 : 3840),
    shortEdge: Math.min(options.maxEdge, options.preset ? fullHd ? 1080 : 2160 : 3840),
    pixels: fullHd ? 1920 * 1080 : MAX_VIDEO_PIXELS,
    fps: Math.min(options.maxFps, options.preset ? 30 : options.maxFps)
  };
}
function boundedVideoSize(width, height, options) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 2 || height < 2) {
    throw usageError("Video dimensions must be at least 2 pixels on each edge.");
  }
  const bounds = videoBounds(options);
  const scale = Math.min(1, bounds.longEdge / Math.max(width, height), bounds.shortEdge / Math.min(width, height), Math.sqrt(bounds.pixels / width / height));
  const result = { width: Math.floor(width * scale / 2) * 2, height: Math.floor(height * scale / 2) * 2 };
  if (result.width < 2 || result.height < 2)
    throw usageError("Video aspect ratio cannot fit the delivery bounds without upscaling.");
  return result;
}
function videoLevel(codec, width, height, fps) {
  if (!(fps > 0) || !Number.isFinite(fps))
    throw usageError("Video frame rate must be finite and positive.");
  const mbWidth = Math.ceil(width / 16);
  const mbHeight = Math.ceil(height / 16);
  const frame = codec === "h264" ? mbWidth * mbHeight : width * height;
  const level = codec === "h264" ? AVC_LEVELS.find((entry) => frame <= entry.frame && frame * fps <= entry.rate && mbWidth * mbWidth <= 8 * entry.frame && mbHeight * mbHeight <= 8 * entry.frame && frame * 4 <= entry.dpb) : HEVC_LEVELS.find((entry) => frame <= entry.frame && frame * fps <= entry.rate && width * width <= 8 * entry.frame && height * height <= 8 * entry.frame);
  if (!level)
    throw usageError("Video dimensions and frame rate exceed the supported codec levels; lower --max-edge or --max-fps.");
  return { level: level.name, levelId: level.id };
}
function planVideoDelivery(probe, options) {
  const size = boundedVideoSize(probe.displayWidth, probe.displayHeight, options);
  const fps = videoBounds(options).fps;
  return { ...size, fps, ...videoLevel(options.codec, size.width, size.height, fps), audio: probe.hasAudio && !options.noAudio };
}
function validateVideoOutput(probe, delivery, options) {
  const errors = [];
  const bounds = videoBounds(options);
  if (!probe.hasVideo || probe.videoStreams !== 1 || probe.codec !== options.codec || !probe.formatNames.includes("mp4"))
    errors.push("codec/container");
  if (probe.profile !== (options.codec === "h264" ? "high" : "main") || probe.level !== delivery.levelId || probe.codecTag !== (options.codec === "h264" ? "avc1" : "hvc1"))
    errors.push("profile/level");
  if (probe.pixelFormat !== "yuv420p" || probe.fieldOrder !== "progressive" && !(options.codec === "hevc" && ["", "unknown"].includes(probe.fieldOrder)))
    errors.push("pixel format/progressive scan");
  const { codedWidth: width, codedHeight: height } = probe;
  if (width < 2 || height < 2 || width % 2 || height % 2 || width !== delivery.width || height !== delivery.height || Math.max(width, height) > bounds.longEdge || Math.min(width, height) > bounds.shortEdge || width * height > bounds.pixels || probe.rotationDegrees !== 0)
    errors.push("dimensions");
  if (!(probe.fps > 0) || Math.abs(probe.fps - delivery.fps) > 2e-3 || probe.fps > bounds.fps + 2e-3)
    errors.push("frame rate");
  if (probe.colorTransfer !== "bt709" || probe.colorPrimaries !== "bt709" || probe.colorSpace !== "bt709" || probe.colorRange !== "tv")
    errors.push("color space");
  if (delivery.audio ? probe.audioStreams !== 1 || probe.audioCodec !== "aac" || probe.audioSampleRate !== 48e3 || probe.audioChannels !== 2 : probe.hasAudio)
    errors.push("audio");
  if (errors.length)
    throw usageError("Encoded video failed delivery validation (".concat(errors.join(", "), "); no upload was started."));
}

// dist/media/video-inspection.js
var video_inspection_exports = {};
__export(video_inspection_exports, {
  H264HeaderInspection: () => H264HeaderInspection,
  VideoPacketInspection: () => VideoPacketInspection,
  inspectH264Passthrough: () => inspectH264Passthrough
});
import { createHash as createHash2 } from "node:crypto";
import { constants, createReadStream } from "node:fs";
import { copyFile, mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path4 from "node:path";
var LEVELS = {
  31: [3600, 108e3, 18e3],
  32: [5120, 216e3, 20480],
  40: [8192, 245760, 32768],
  41: [8192, 245760, 32768],
  42: [8704, 522240, 34816],
  50: [22080, 589824, 110400],
  51: [36864, 983040, 184320],
  52: [36864, 2073600, 184320]
};
var INSPECTION_TIMEOUT_MS = 15e3;
var MAX_LINES = 2e6;
var MAX_LINE_CHARS = 16384;
function candidate(probe, options) {
  try {
    if (options.codec !== "h264" || !LEVELS[probe.level] || !(probe.timeBase > 0) || !Number.isFinite(probe.timeBase) || probe.streamCount !== (probe.hasAudio ? 2 : 1) || probe.hasAudio && probe.audioProfile !== "lc")
      return false;
    const delivery = planVideoDelivery(probe, options);
    validateVideoOutput(probe, { ...delivery, levelId: probe.level }, options);
    return true;
  } catch {
    return false;
  }
}
var packetState = () => ({ count: 0, bytes: 0, bucket: 0, pendingPts: [] });
var VideoPacketInspection = class {
  probe;
  maxBytes;
  video = packetState();
  audio = packetState();
  valid = true;
  lines = 0;
  /** `maxBytes` is the project's video limit: a passthrough uploads the source as it is, so a source over it is re-encoded instead. */
  constructor(probe, maxBytes) {
    this.probe = probe;
    this.maxBytes = maxBytes;
  }
  line(line) {
    if (++this.lines > MAX_LINES)
      return this.valid = false;
    if (!line.trim())
      return this.valid;
    const fields = new Map(line.split("|").map((field) => {
      const at = field.indexOf("=");
      return [field.slice(0, at), field.slice(at + 1)];
    }));
    const index = Number(fields.get("stream_index"));
    const video = index === this.probe.videoStreamIndex;
    if (!video && (!this.probe.hasAudio || index !== this.probe.audioStreamIndex))
      return this.valid = false;
    const state = video ? this.video : this.audio;
    const dts = Number(fields.get("dts_time")), pts = Number(fields.get("pts_time"));
    const duration = Number(fields.get("duration_time")), bytes = Number(fields.get("size"));
    if (![dts, pts, duration, bytes].every(Number.isFinite) || duration <= 0 || !Number.isSafeInteger(bytes) || bytes < 1 || !(video ? /^[K_]+$/ : /^[KD_]+$/).test(fields.get("flags") ?? ""))
      return this.valid = false;
    const delta = state.lastDts === void 0 ? 0 : dts - state.lastDts;
    const tolerance = this.tolerance();
    if (video && state.count === 0 && Math.abs(pts) > tolerance)
      return this.valid = false;
    if (state.lastDts !== void 0 && (delta <= 0 || Math.abs(delta - state.lastDuration) > tolerance))
      return this.valid = false;
    const period = 1 / this.probe.fps;
    if (video && (Math.abs(duration - period) > tolerance || Math.abs(pts - dts) > period * 4 + tolerance))
      return this.valid = false;
    state.bucket = Math.max(0, state.bucket - delta * (video ? 8e6 : 192e3)) + bytes * 8;
    if (state.bucket > (video ? 16e6 : 384e3))
      return this.valid = false;
    state.lastDts = dts;
    state.lastDuration = duration;
    state.count++;
    state.bytes += bytes;
    if (state.bytes > this.maxBytes)
      return this.valid = false;
    if (video) {
      state.nextPts ??= pts;
      if (state.pendingPts.some((value) => Math.abs(value - pts) < tolerance))
        return this.valid = false;
      state.pendingPts.push(pts);
      state.pendingPts.sort((a, b) => a - b);
      if (state.pendingPts.length > 5 && !this.presentation())
        return this.valid = false;
    }
    return this.valid;
  }
  tolerance() {
    return Math.min(0.01 / this.probe.fps, Math.max(2e-6, this.probe.timeBase * 2));
  }
  presentation() {
    const pts = this.video.pendingPts.shift();
    if (pts === void 0 || Math.abs(pts - this.video.nextPts) > this.tolerance())
      return false;
    this.video.nextPts += 1 / this.probe.fps;
    return true;
  }
  finish() {
    while (this.valid && this.video.pendingPts.length)
      this.valid = this.presentation();
    return this.valid && this.video.count > 0 && (!this.probe.hasAudio || this.audio.count > 0);
  }
};
var SPS_FIELDS = /* @__PURE__ */ new Set([
  "profile_idc",
  "level_idc",
  "seq_parameter_set_id",
  "chroma_format_idc",
  "bit_depth_luma_minus8",
  "bit_depth_chroma_minus8",
  "max_num_ref_frames",
  "pic_width_in_mbs_minus1",
  "pic_height_in_map_units_minus1",
  "frame_mbs_only_flag",
  "frame_cropping_flag",
  "frame_crop_left_offset",
  "frame_crop_right_offset",
  "frame_crop_top_offset",
  "frame_crop_bottom_offset",
  "vui_parameters_present_flag",
  "video_signal_type_present_flag",
  "video_full_range_flag",
  "colour_description_present_flag",
  "colour_primaries",
  "transfer_characteristics",
  "matrix_coefficients",
  "bitstream_restriction_flag",
  "max_num_reorder_frames",
  "max_dec_frame_buffering",
  "timing_info_present_flag",
  "num_units_in_tick",
  "time_scale",
  "aspect_ratio_info_present_flag",
  "aspect_ratio_idc",
  "sar_width",
  "sar_height",
  "pic_order_cnt_type"
]);
var PPS_FIELDS = /* @__PURE__ */ new Set([
  "pic_parameter_set_id",
  "seq_parameter_set_id",
  "bottom_field_pic_order_in_frame_present_flag",
  "num_slice_groups_minus1",
  "num_ref_idx_l0_default_active_minus1",
  "num_ref_idx_l1_default_active_minus1",
  "redundant_pic_cnt_present_flag"
]);
var SLICE_FIELDS = /* @__PURE__ */ new Set([
  "nal_unit_type",
  "first_mb_in_slice",
  "slice_type",
  "pic_parameter_set_id",
  "field_pic_flag",
  "num_ref_idx_l0_active_minus1",
  "num_ref_idx_l1_active_minus1"
]);
var H264HeaderInspection = class {
  probe;
  packets = 0;
  bytes = 0;
  valid = true;
  lines = 0;
  section = "";
  fields = /* @__PURE__ */ new Map();
  sps = /* @__PURE__ */ new Set();
  pps = /* @__PURE__ */ new Set();
  signature;
  packet;
  lastIdr = -1;
  bRun = 0;
  constructor(probe) {
    this.probe = probe;
  }
  line(line) {
    if (++this.lines > MAX_LINES || /^(?:\[[^\]]+ @ [^\]]+\]\s*)?\[(?:error|fatal|panic)\]/.test(line))
      return this.valid = false;
    const match = /^\[trace_headers @ [^\]]+\]\s*(?:\[info\]\s*)?(.*)/.exec(line);
    if (!match)
      return this.valid;
    const text = match[1];
    if (/\b(error|invalid|failed|corrupt|overread)\b/i.test(text))
      return this.valid = false;
    if (text.startsWith("Packet:")) {
      this.endSection();
      this.endPacket();
      const packet = /^Packet: (\d+) bytes,( key frame,)? pts (-?\d+), dts (-?\d+), duration (\d+)\.$/.exec(text);
      if (!packet || !packet.slice(1).filter((_, index) => index !== 1).every((value) => Number.isSafeInteger(Number(value))))
        return this.valid = false;
      const size = Number(packet[1]);
      if (size < 1 || Number(packet[5]) < 1)
        return this.valid = false;
      this.bytes += size;
      this.packet = { key: Boolean(packet[2]), slices: 0, lastMb: -1 };
      return this.valid;
    }
    const field = /^\d+\s+([a-zA-Z0-9_]+)(?:\[[^\]]+\])?\s+[01]+\s*=\s*(-?\d+)\s*$/.exec(text);
    if (field) {
      const key = field[1], value = Number(field[2]);
      if (!Number.isSafeInteger(value))
        return this.valid = false;
      if (key === "nal_unit_type" && ![1, 5, 6, 7, 8, 9, 12].includes(value))
        return this.valid = false;
      const allowed = this.section === "Sequence Parameter Set" ? SPS_FIELDS : this.section === "Picture Parameter Set" ? PPS_FIELDS : SLICE_FIELDS;
      if (this.section && allowed.has(key))
        this.fields.set(key, value);
      return this.valid;
    }
    this.endSection();
    if (["Sequence Parameter Set", "Picture Parameter Set", "Slice Header"].includes(text))
      this.section = text;
    return this.valid;
  }
  endSection() {
    if (!this.section)
      return;
    const f = this.fields, get = (key) => f.get(key);
    if (this.section === "Sequence Parameter Set") {
      const limits = LEVELS[this.probe.level];
      const width = (get("pic_width_in_mbs_minus1") + 1) * 16;
      const height = (get("pic_height_in_map_units_minus1") + 1) * 16;
      const mbs = width * height / 256, dpb = get("max_dec_frame_buffering"), refs = get("max_num_ref_frames");
      const crop = (key) => get("frame_cropping_flag") === 0 ? 0 : get(key);
      const w = width - 2 * (crop("frame_crop_left_offset") + crop("frame_crop_right_offset"));
      const h = height - 2 * (crop("frame_crop_top_offset") + crop("frame_crop_bottom_offset"));
      const id = get("seq_parameter_set_id");
      const exact = {
        profile_idc: 100,
        level_idc: this.probe.level,
        chroma_format_idc: 1,
        bit_depth_luma_minus8: 0,
        bit_depth_chroma_minus8: 0,
        frame_mbs_only_flag: 1,
        vui_parameters_present_flag: 1,
        video_signal_type_present_flag: 1,
        video_full_range_flag: 0,
        colour_description_present_flag: 1,
        colour_primaries: 1,
        transfer_characteristics: 1,
        matrix_coefficients: 1,
        bitstream_restriction_flag: 1,
        timing_info_present_flag: 1,
        pic_order_cnt_type: 0
      };
      if (!limits || Object.entries(exact).some(([key, value]) => get(key) !== value) || !Number.isInteger(id) || id < 0 || id > 31 || ![0, 1].includes(get("frame_cropping_flag")) || w !== this.probe.codedWidth || h !== this.probe.codedHeight || !(refs >= 0 && refs <= dpb && dpb <= 4 && dpb >= 1) || !(get("max_num_reorder_frames") >= 0 && get("max_num_reorder_frames") <= Math.min(2, dpb)) || !(get("num_units_in_tick") > 0) || !(get("time_scale") > 0) || Math.abs(get("time_scale") / (2 * get("num_units_in_tick")) - this.probe.fps) > 2e-3 || mbs > limits[0] || mbs * this.probe.fps > limits[1] || mbs * dpb > limits[2] || (width / 16) ** 2 > 8 * limits[0] || (height / 16) ** 2 > 8 * limits[0])
        this.valid = false;
      const signature = JSON.stringify([...f].filter(([key]) => key !== "seq_parameter_set_id").sort(([a], [b]) => a.localeCompare(b)));
      if (this.signature !== void 0 && signature !== this.signature)
        this.valid = false;
      this.signature = signature;
      this.sps.add(id);
    } else if (this.section === "Picture Parameter Set") {
      const id = get("pic_parameter_set_id");
      if (!Number.isInteger(id) || id < 0 || id > 255 || !this.sps.has(get("seq_parameter_set_id")) || get("bottom_field_pic_order_in_frame_present_flag") !== 0 || get("num_slice_groups_minus1") !== 0 || get("redundant_pic_cnt_present_flag") !== 0 || !["num_ref_idx_l0_default_active_minus1", "num_ref_idx_l1_default_active_minus1"].every((key) => get(key) >= 0 && get(key) <= 3))
        this.valid = false;
      this.pps.add(id);
    } else {
      const type = get("slice_type"), mb = get("first_mb_in_slice"), nal = get("nal_unit_type");
      if (!this.packet || !this.pps.has(get("pic_parameter_set_id")) || !Number.isInteger(type) || type < 0 || type > 9 || type % 5 > 2 || ![1, 5].includes(nal) || !Number.isInteger(mb) || mb <= (this.packet?.lastMb ?? -1) || mb >= Math.ceil(this.probe.codedWidth / 16) * Math.ceil(this.probe.codedHeight / 16) || get("field_pic_flag") !== void 0 && get("field_pic_flag") !== 0 || ["num_ref_idx_l0_active_minus1", "num_ref_idx_l1_active_minus1"].some((key) => get(key) !== void 0 && !(get(key) >= 0 && get(key) <= 3)))
        this.valid = false;
      if (this.packet) {
        if (this.packet.slices === 0 && mb !== 0 || this.packet.type !== void 0 && this.packet.type !== type % 5 || this.packet.idr !== void 0 && this.packet.idr !== (nal === 5))
          this.valid = false;
        this.packet.slices++;
        this.packet.type = type % 5;
        this.packet.idr = nal === 5;
        this.packet.lastMb = mb;
      }
    }
    this.section = "";
    this.fields = /* @__PURE__ */ new Map();
  }
  endPacket() {
    if (!this.packet)
      return;
    const p = this.packet;
    if (!p.slices || p.key !== p.idr || p.idr && p.type !== 2)
      this.valid = false;
    if (p.idr)
      this.lastIdr = this.packets;
    if (this.lastIdr < 0 || this.packets - this.lastIdr >= Math.max(1, Math.round(this.probe.fps * 2)))
      this.valid = false;
    this.bRun = p.type === 1 ? this.bRun + 1 : 0;
    if (this.bRun > 2)
      this.valid = false;
    this.packets++;
    this.packet = void 0;
  }
  finish() {
    this.endSection();
    this.endPacket();
    return this.valid && this.sps.size > 0 && this.pps.size > 0 && this.packets > 0;
  }
};
function completed(result) {
  return result.code === 0 && !result.signal && !result.spawnError && !result.timedOut && !result.outputTruncated && !result.stoppedEarly;
}
async function inspectH264Passthrough(runtime, toolchain, source, initialProbe, options, maxBytes) {
  if (!candidate(initialProbe, options))
    return void 0;
  let cleanupDir;
  try {
    const sourceInfo = await stat(source);
    if (!sourceInfo.isFile() || sourceInfo.size < 1 || sourceInfo.size > maxBytes)
      return void 0;
    cleanupDir = await mkdtemp(path4.join(tmpdir(), "screenrig-inspect-"));
    const filePath = path4.join(cleanupDir, "".concat(path4.basename(source, path4.extname(source)) || "media", ".mp4"));
    await copyFile(source, filePath, constants.COPYFILE_FICLONE | constants.COPYFILE_EXCL);
    const snapshot = await stat(filePath);
    if (snapshot.size < 1 || snapshot.size > maxBytes)
      return void 0;
    const probe = await probeMedia(runtime, toolchain, filePath);
    if (!candidate(probe, options))
      return void 0;
    const packets = new VideoPacketInspection(probe, maxBytes), headers = new H264HeaderInspection(probe), run = runProcessFor(runtime);
    const packetResult = await run({
      command: toolchain.ffprobe,
      args: ["-v", "error", ...inputGuardArgs(probe.inputDemuxer), "-show_packets", "-show_entries", "packet=stream_index,pts_time,dts_time,duration_time,size,flags", "-of", "compact=p=0:nk=0", filePath],
      timeoutMs: INSPECTION_TIMEOUT_MS,
      maxLineChars: MAX_LINE_CHARS,
      onStdoutLine: (line) => packets.line(line)
    });
    if (!completed(packetResult) || packetResult.stderrTail.trim() !== "" || !packets.finish())
      return void 0;
    const headerResult = await run({
      command: toolchain.ffmpeg,
      args: ["-hide_banner", "-nostdin", "-nostats", "-xerror", "-loglevel", "level+info", "-copyts", ...inputGuardArgs(probe.inputDemuxer), "-i", filePath, "-map", "0:v:0", "-c:v", "copy", "-copytb", "1", "-bsf:v", "trace_headers", "-f", "null", "-"],
      timeoutMs: INSPECTION_TIMEOUT_MS,
      maxLineChars: MAX_LINE_CHARS,
      onStdoutLine: () => false,
      onStderrLine: (line) => headers.line(line)
    });
    if (!completed(headerResult) || !headers.finish() || headers.packets !== packets.video.count || headers.bytes !== packets.video.bytes)
      return void 0;
    const hash = createHash2("sha256");
    for await (const chunk of createReadStream(filePath))
      hash.update(chunk);
    const accepted = { filePath, cleanupDir, sha256: hash.digest("hex"), bytes: snapshot.size, probe };
    cleanupDir = void 0;
    return accepted;
  } catch {
    return void 0;
  } finally {
    if (cleanupDir)
      await rm(cleanupDir, { recursive: true, force: true });
  }
}

export {
  tag_exports,
  types_exports,
  commandWords,
  requestSummary,
  responseSummary,
  LOG_SINK_DEGRADED_CODE,
  logSinkDegradedWarning,
  noopLogger,
  loggerOf,
  createSinkLogger,
  queryKeys,
  loggingTransport,
  loggingSignedRawPut,
  logger_exports,
  memoryConfigFs,
  memory_config_exports,
  placeAccessToken,
  OAuthSession,
  refreshExpiryDays,
  oauth_session_exports,
  ffmpegLookup,
  cwebpLookup,
  runProcessFor,
  resolveFfmpegToolchain,
  resolveCwebpToolchain,
  inputGuardArgs,
  probeMedia,
  ffmpeg_exports,
  readWebpContainer,
  webp_exports,
  planVideoDelivery,
  validateVideoOutput,
  video_profile_exports,
  inspectH264Passthrough,
  video_inspection_exports
};
