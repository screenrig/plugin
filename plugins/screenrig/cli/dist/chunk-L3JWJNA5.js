import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  parseSse
} from "./chunk-FCQ624QM.js";
import {
  healthChangesText
} from "./chunk-E2AIBB3R.js";
import {
  EVENT_STREAM_BACKOFF_CAP_MS,
  EVENT_STREAM_BACKOFF_MS,
  clientFor,
  commandHandler,
  isAbortError,
  isHardFollowError,
  jsonBody,
  requireFlagValue,
  requireToken,
  sleepWhileOpen,
  streamEnvelope,
  streamToken,
  transportFor
} from "./chunk-SX4HKPRA.js";
import {
  loggerOf
} from "./chunk-PPWTLS44.js";
import {
  formatResultContext,
  projectStreamQuery
} from "./chunk-RY7TSGK3.js";
import {
  flagBool,
  flagNumber,
  flagString,
  successEnvelope
} from "./chunk-D2RLMLYO.js";
import {
  isResourceID
} from "./chunk-SFYZH3GR.js";
import {
  ExitCode,
  isSensitiveKey,
  isSensitiveValue,
  redactEvent,
  usageError
} from "./chunk-JP4OQPAN.js";

// dist/handlers/events.js
var handleEventsList = commandHandler(eventsList);
var handleEventsFollow = commandHandler(async (args, runtime, resolved) => {
  return loggerOf(runtime).withLocal({ op: "events.follow", message: "events follow" }, () => eventsFollow(args, runtime, resolved));
}, true);
var CANNED_EVENT_MESSAGES = /* @__PURE__ */ new Set([
  "Stream cursor advanced",
  "Stream replay state is no longer retained",
  "Screen came online",
  "Screen went offline",
  "Screen effective playlist switched",
  "Screen takeover started",
  "Screen takeover ended",
  "Screen takeover end changed",
  "A scheduled playlist cannot be shown; its entries were skipped",
  "Screen health changed",
  "Screen reboot requested",
  // screen.suspended carries the notice as details.message, so its own message must not repeat the key.
  "Screen suspended",
  "Screen resumed",
  "Screen replaced by another device",
  "Screen display override set",
  "Screen display schedule updated",
  "Screen display schedule cleared",
  "Screen reboot schedule updated",
  "Screen reboot schedule cleared",
  "Scheduled reboot skipped",
  "Screen volume requested"
]);
var NULL_AS_NONE_EVENT_TYPES = /* @__PURE__ */ new Set(["screen.display_changed", "screen.playlist_switched", "screen.takeover_started", "screen.takeover_updated", "screen.takeover_ended", "screen.playlist_unavailable"]);
var SILENT_EVENT_TYPES = /* @__PURE__ */ new Set(["application.event", "runtime.reported"]);
function isEventScalar(value) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
function formatLogfmtValue(value) {
  if (typeof value !== "string")
    return String(value);
  if (!/[\s="]/.test(value))
    return value;
  return '"'.concat(value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r/g, "\\r").replace(/\n/g, "\\n"), '"');
}
function pushLogfmtField(parts, key, value) {
  if (!isEventScalar(value))
    return false;
  if (isSensitiveKey(key))
    return false;
  if (typeof value === "string") {
    if (value.length === 0 || isSensitiveValue(value))
      return false;
  }
  parts.push("".concat(key, "=").concat(formatLogfmtValue(value)));
  return true;
}
function formatEventLine(event) {
  const parts = [];
  const hasAt = pushLogfmtField(parts, "at", event.at);
  const hasType = pushLogfmtField(parts, "type", event.type);
  pushLogfmtField(parts, "severity", event.severity);
  let payload = 0;
  const resource = event.resource;
  if (resource) {
    if (pushLogfmtField(parts, "resource_type", resource.type))
      payload += 1;
    if (pushLogfmtField(parts, "resource_id", resource.id))
      payload += 1;
  }
  const details = event.details ?? {};
  const used = /* @__PURE__ */ new Set();
  for (const key of ["code", "primitive_id"]) {
    if (!pushLogfmtField(parts, key, details[key]))
      continue;
    used.add(key);
    payload += 1;
  }
  if (event.type === "screen.health_changed") {
    const changes = healthChangesText(details.changes);
    if (changes && pushLogfmtField(parts, "changes", changes))
      payload += 1;
    used.add("changes");
  }
  const nullAsNone = NULL_AS_NONE_EVENT_TYPES.has(event.type);
  for (const key of Object.keys(details).sort()) {
    if (used.has(key))
      continue;
    const raw = details[key];
    const value = nullAsNone && raw === null ? "none" : nullAsNone && Array.isArray(raw) && raw.length > 0 && raw.every((item) => typeof item === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(item)) ? raw.join(",") : raw;
    if (pushLogfmtField(parts, key, value))
      payload += 1;
  }
  const message = event.message ?? "";
  const detailCode = details.code;
  const canned = CANNED_EVENT_MESSAGES.has(message);
  const duplicate = message === event.type || typeof detailCode === "string" && message === detailCode;
  if (message && !canned && !duplicate && pushLogfmtField(parts, "message", message)) {
    payload += 1;
  }
  if (!hasAt && !hasType)
    return void 0;
  if (SILENT_EVENT_TYPES.has(event.type) && payload === 0)
    return void 0;
  return parts.join(" ");
}
function formatEventLines(events) {
  return events.map((event) => formatEventLine(event)).filter((line) => line !== void 0).join("\n");
}
var EVENT_APPLICATION_ID = /^(?:(?:stage|qa|development)_)?app_[A-Za-z0-9_-]+$/;
function eventsListFilters(args) {
  requireFlagValue(args, "source", "log");
  requireFlagValue(args, "screen-id", "scr_01");
  requireFlagValue(args, "playlist-id", "pl_01");
  requireFlagValue(args, "app-id", "app_01");
  const source = flagString(args.flags, "source");
  const screenId = flagString(args.flags, "screen-id");
  const playlistId = flagString(args.flags, "playlist-id");
  const applicationId = flagString(args.flags, "app-id");
  if (source !== void 0 && source !== "project" && source !== "log")
    throw usageError("--source must be project or log.");
  if (screenId !== void 0 && !isResourceID(screenId, "screen"))
    throw usageError("--screen-id must be a screen identifier (scr_...).");
  if (playlistId !== void 0 && !isResourceID(playlistId, "playlist"))
    throw usageError("--playlist-id must be a playlist identifier (pl_...).");
  if (applicationId !== void 0 && !EVENT_APPLICATION_ID.test(applicationId))
    throw usageError("--app-id must be an application identifier (app_...).");
  if (source === "log" && (playlistId !== void 0 || applicationId !== void 0)) {
    const flag = playlistId !== void 0 ? "--playlist-id" : "--app-id";
    throw usageError("".concat(flag, " reads project events, and the Player log (--source log) holds screen records only. Drop --source log to read the project events of ").concat(playlistId !== void 0 ? "a playlist" : "an application", ", or use --screen-id to read one screen's Player log."));
  }
  return {
    ...source === void 0 ? {} : { source },
    ...screenId === void 0 ? {} : { screen_id: screenId },
    ...playlistId === void 0 ? {} : { playlist_id: playlistId },
    ...applicationId === void 0 ? {} : { application_id: applicationId }
  };
}
async function eventsList(args, runtime, resolved) {
  requireFlagValue(args, "limit", "50");
  requireFlagValue(args, "after", "ev1_0");
  const filters = eventsListFilters(args);
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const response = await client.call({
    method: "GET",
    path: "/api/events",
    query: {
      after: flagString(args.flags, "after"),
      limit: flagString(args.flags, "limit"),
      type: flagString(args.flags, "type"),
      ...filters
    }
  });
  const page = response.body;
  const items = page.items ?? [];
  const human = formatEventLines(items);
  const safePage = redactEvent({ ...page, items });
  return {
    envelope: jsonBody({ ...response, body: safePage }, client.requestId),
    exitCode: ExitCode.Success,
    human
  };
}
function eventTypeMatches(type, filter) {
  if (!filter)
    return true;
  if (typeof type !== "string")
    return false;
  if (type.startsWith("stream."))
    return true;
  return filter.endsWith(".") ? type.startsWith(filter) : type === filter;
}
async function eventsFollow(args, runtime, resolved) {
  let token = requireToken(resolved.token);
  const typeFilter = flagString(args.flags, "type");
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const transport = transportFor(runtime, resolved.apiUrl, token);
  const json = !flagBool(args.flags, "human");
  let printed = 0;
  let after = flagString(args.flags, "after");
  let delayMs = EVENT_STREAM_BACKOFF_MS;
  const controller = new AbortController();
  const timeoutMs = flagNumber(args.flags, "timeout");
  const timer = timeoutMs && timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : void 0;
  const emit = (event) => {
    if (!eventTypeMatches(event?.type, typeFilter))
      return;
    if (json) {
      printed += 1;
      runtime.stdout.write("".concat(JSON.stringify(streamEnvelope(runtime, redactEvent(event), client.requestId)), "\n"));
      return;
    }
    const line = formatEventLine(event);
    if (!line)
      return;
    if (printed === 0) {
      if (formatResultContext(runtime))
        runtime.stdout.write("".concat(formatResultContext(runtime), "\n"));
    }
    printed += 1;
    runtime.stdout.write("".concat(line, "\n"));
  };
  try {
    while (!controller.signal.aborted) {
      let buffer = "";
      let connected = false;
      try {
        token = await streamToken(runtime, token);
        const stream = await transport.stream({
          method: "GET",
          path: "/stream/project",
          query: { after, ...projectStreamQuery(resolved.projectId) },
          headers: { "x-request-id": client.nextRequestId(), authorization: "Bearer ".concat(token) },
          signal: controller.signal
        });
        connected = true;
        for await (const chunk of stream) {
          buffer += chunk;
          const parsed = parseSse(buffer);
          buffer = parsed.rest;
          for (const event of parsed.events) {
            if (event.id) {
              after = event.id;
            }
            if (!event.data)
              continue;
            try {
              emit(JSON.parse(event.data));
            } catch {
            }
          }
          if (controller.signal.aborted) {
            break;
          }
        }
      } catch (err) {
        if (controller.signal.aborted || isAbortError(err)) {
          break;
        }
        if (isHardFollowError(err)) {
          throw err;
        }
      }
      if (controller.signal.aborted) {
        break;
      }
      await sleepWhileOpen(delayMs, controller.signal, runtime.sleep);
      if (controller.signal.aborted) {
        break;
      }
      delayMs = connected ? EVENT_STREAM_BACKOFF_MS : Math.min(delayMs * 2, EVENT_STREAM_BACKOFF_CAP_MS);
    }
  } finally {
    if (timer)
      clearTimeout(timer);
  }
  if (printed === 0 && json) {
    runtime.stdout.write("".concat(JSON.stringify(streamEnvelope(runtime, { items: [] }, client.requestId)), "\n"));
  }
  return {
    envelope: successEnvelope({ items: [] }, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: "",
    output: "stream"
  };
}

export {
  handleEventsList,
  handleEventsFollow,
  formatLogfmtValue
};
