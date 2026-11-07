import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  parseSse
} from "./chunk-FCQ624QM.js";
import {
  addVerifyOptions
} from "./chunk-XBKR2L42.js";
import {
  singleStdin,
  verifyLines,
  verifyMembers
} from "./chunk-MGR6GQ5I.js";
import {
  NOTIFICATION_SNOOZE_MAX_MS,
  snoozeDurationMs
} from "./chunk-NLGWPOA3.js";
import {
  healthChangesText
} from "./chunk-ZYFFYQJM.js";
import {
  Option,
  eventTypeOption,
  positiveInteger,
  reportFormatOption,
  reportOutputOption,
  revision
} from "./chunk-UZ2GQVZJ.js";
import {
  addCommandNotes,
  requireOptionGroup
} from "./chunk-IBLNZ4EM.js";
import {
  fleetLinkTags
} from "./chunk-UXMZL4AK.js";
import {
  table
} from "./chunk-CKOG7ZL3.js";
import {
  readAuthoringJson,
  readAuthoringText
} from "./chunk-OFOJKZJN.js";
import {
  EVENT_STREAM_BACKOFF_CAP_MS,
  EVENT_STREAM_BACKOFF_MS,
  PLAYBACK_DAY_PATTERN,
  aggregateDays,
  clientFor,
  commandHandler,
  humanLines,
  isAbortError,
  isHardFollowError,
  jsonBody,
  playbackFormat,
  quotedRevision,
  reportFileOf,
  requireFlagValue,
  requireToken,
  resolveDownloadOutput,
  simpleGet,
  sleepWhileOpen,
  streamEnvelope,
  streamToken,
  transportFor,
  writeRecoveries
} from "./chunk-FP3WGXZK.js";
import {
  AGGREGATE_MAX_DAYS,
  CsvStreamFailure,
  PLAYBACK_CSV_IDLE_TIMEOUT_MS,
  PLAYS_ALL_MAX_PAGES,
  PLAYS_LIMIT_MAX,
  PLAYS_SETTLE_MS,
  formatResultContext,
  playbackExportBudget,
  playsCursor,
  playsInstantOption,
  playsLimit,
  playsRange,
  projectStreamQuery,
  requireCsvResponse,
  shellQuote,
  unusedPath,
  writeCsvFile,
  writeCsvStdout
} from "./chunk-LN4XKIFM.js";
import {
  loggerOf
} from "./chunk-PPWTLS44.js";
import {
  flagBool,
  flagNumber,
  flagString,
  normalizeInstant,
  screenTag,
  successEnvelope
} from "./chunk-D2RLMLYO.js";
import "./chunk-V3QE7ELU.js";
import "./chunk-7EJTDXNL.js";
import {
  isResourceID
} from "./chunk-SFYZH3GR.js";
import {
  CliError,
  ExitCode,
  isSensitiveKey,
  isSensitiveValue,
  makeProblem,
  networkError,
  redactEvent,
  usageError
} from "./chunk-JP4OQPAN.js";
import "./chunk-3FYAGULW.js";

// dist/triggers.js
var TRIGGER_ID_PATTERN = /^(?:(?:stage|qa|development)_)?trg_[A-Za-z0-9_-]{1,64}$/;
var TRIGGER_PASSWORD_PATTERN = /^srtg_[A-Za-z0-9_-]{43}$/;
var TRIGGERS_MAX = 20;
var TRIGGER_LABEL_MAX = 80;
var TRIGGER_SCREENS_MAX = 500;
var TRIGGER_HOLD_MIN_SECONDS = 60;
var TRIGGER_OVERLAY_HOLD_MIN_SECONDS = 10;
var TRIGGER_HOLD_MAX_SECONDS = 604800;
var TRIGGER_SIGNING_SECRET_PATTERN = /^whsec_[A-Za-z0-9_-]{43}$/;
var TRIGGER_MAPPING_MAX_BYTES = 64 * 1024;
var TRIGGER_DELIVERIES_MAX = 100;
function triggerId(value, command) {
  if (!value)
    throw usageError("triggers ".concat(command, " requires <id>."));
  if (!TRIGGER_ID_PATTERN.test(value)) {
    throw usageError("A trigger id looks like trg_ followed by letters, digits, - or _.", {
      command: "screenrig triggers list",
      reason: "List this project's triggers and their ids."
    });
  }
  return value;
}
function triggerName(value) {
  const trimmed = value.trim();
  if (!trimmed || [...trimmed].length > TRIGGER_LABEL_MAX || /[\p{Cc}\p{Cf}]/u.test(value)) {
    throw usageError("--name must contain 1 to ".concat(TRIGGER_LABEL_MAX, " characters without controls."));
  }
  return trimmed;
}
function triggerTag(value) {
  return screenTag(value.trim(), "--tag");
}
function triggerScreenIds(value, previous) {
  const ids = [...previous ? previous.split(",") : [], ...value.split(",").map((id) => id.trim())];
  if (ids.some((id) => !isResourceID(id, "screen"))) {
    throw usageError("--screen-id takes screen ids (scr_\u2026), repeated or comma-separated.", {
      command: "screenrig screen list",
      reason: "List this project's screens and their ids."
    });
  }
  if (new Set(ids).size !== ids.length)
    throw usageError("--screen-id lists a screen more than once.");
  if (ids.length > TRIGGER_SCREENS_MAX)
    throw usageError("--screen-id accepts at most ".concat(TRIGGER_SCREENS_MAX, " screens; target a tag instead."));
  return ids.join(",");
}
function triggerHoldSeconds(value, kind = "cap") {
  const text = value.trim();
  const match = /^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(text);
  const seconds = match && text ? Number(match[1] ?? 0) * 86400 + Number(match[2] ?? 0) * 3600 + Number(match[3] ?? 0) * 60 + Number(match[4] ?? 0) : NaN;
  const minimum = kind === "overlay" ? TRIGGER_OVERLAY_HOLD_MIN_SECONDS : TRIGGER_HOLD_MIN_SECONDS;
  if (!Number.isFinite(seconds) || seconds < minimum || seconds > TRIGGER_HOLD_MAX_SECONDS) {
    throw usageError(kind === "overlay" ? "--for takes a duration from 10s to 7d, such as 90s, 30m, 2h, or 1d." : "--for takes a duration from 1m to 7d, such as 30m, 2h, or 1d.");
  }
  return seconds;
}
function triggerHoldOption(value) {
  triggerHoldSeconds(value, "overlay");
  return value;
}
function triggerMapping(text) {
  if (Buffer.byteLength(text) > TRIGGER_MAPPING_MAX_BYTES)
    throw usageError("--map is larger than 64 KiB.");
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw usageError("--map must hold a JSON object: the template that builds the overlay post.", {
      command: "screenrig triggers create --help",
      reason: 'Example template: {"alert_id":"{{body.groupKey}}","title":"{{body.title}}","state":"{{body.status}}"}.'
    });
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw usageError("--map must be a JSON object: the template that builds the overlay post.");
  }
  return parsed;
}
function triggerStyle(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw usageError('--style must hold a JSON object, such as {"theme":"signal","accent":"#FFB000"}.');
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw usageError('--style must be a JSON object, such as {"theme":"signal","accent":"#FFB000"}.');
  }
  return parsed;
}
function triggerDeliveriesLimit(value) {
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > TRIGGER_DELIVERIES_MAX)
    throw usageError("--limit takes a whole number from 1 to ".concat(TRIGGER_DELIVERIES_MAX, "."));
  return value;
}
function triggerPasswordWarning(id, action, kind = "cap") {
  const sender = kind === "overlay" ? "the sending system (Home Assistant, a sensor hub, an alerting tool)" : "the emergency notification system";
  const enter = kind === "overlay" ? "Enter data.url and data.password in ".concat(sender, " now: it posts to the url with Authorization: Bearer <password>, or HTTP Basic with data.username and the password.") : "Enter data.url, data.username and data.password in ".concat(sender, " now.");
  return {
    code: "trigger_password_shown_once",
    message: action === "create" ? "data.password is this trigger's ".concat(kind === "overlay" ? "secret" : "HTTP Basic password", " and is shown only in this answer. ").concat(enter, " screenrig does not save the password in its config, logs, or recovery state. After an interrupted or ambiguous create, rerun the identical command within 24 hours to get this same answer and password back. Replace a lost password with screenrig triggers rotate-secret ").concat(id, ".") : "data.password is the trigger's new ".concat(kind === "overlay" ? "secret" : "HTTP Basic password", " and is shown only in this answer. The previous password stopped working: enter the new one in ").concat(sender, " now; screenrig does not save it. After an interrupted or ambiguous rotation, rerun the identical command within 24 hours to get this same password back.")
  };
}
function triggerSigningWarning(id) {
  return {
    code: "trigger_signing_secret_shown_once",
    message: 'data.signing_secret is shown only in this answer. Store it in the sending system now; screenrig does not save it. Every post then carries ScreenRig-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>" keyed with the signing secret>, and a post whose timestamp is more than five minutes from the server\'s clock, or whose signature does not match, is refused like a wrong secret. Replace a lost signing secret with screenrig triggers rotate-secret '.concat(id, " --signing.")
  };
}
function triggerExample(url, signing) {
  const body = '\'{"alert_id":"front-door","title":"Front door","message":"The front door is open","duration":"10m"}\'';
  const signed = signing ? ' -H "ScreenRig-Signature: t=<unix seconds>,v1=<hmac>"' : "";
  return "curl -X POST ".concat(url, ' -H "Authorization: Bearer <password>"').concat(signed, ' -H "Content-Type: application/json" -d ').concat(body);
}
function triggerProblem(error, id) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  if (problem.code === "trigger_limit_reached") {
    return new CliError({
      ...problem,
      detail: "This organization already has the maximum of ".concat(TRIGGERS_MAX, " triggers across its projects. Nothing was created."),
      next: problem.next ?? {
        command: "screenrig triggers list",
        reason: "Delete a trigger you no longer need with screenrig triggers delete ID, then rerun create."
      }
    }, error.exitCode, error.warnings);
  }
  if (problem.next)
    return error;
  if (problem.code === "resource_conflict" && id) {
    return new CliError({
      ...problem,
      next: { command: "screenrig triggers clear ".concat(id), reason: "An alert is showing. Clear it first; its screens go back to what they played before." }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "revision_conflict" && id) {
    return new CliError({
      ...problem,
      next: { command: "screenrig triggers show ".concat(id), reason: "Read the current revision, then rerun with --expect-rev REVISION if the change still applies." }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "not_found" && id) {
    return new CliError({
      ...problem,
      next: { command: "screenrig triggers list", reason: "List this project's triggers; a deleted trigger does not come back." }
    }, error.exitCode, error.warnings);
  }
  return error;
}
function when(value, label) {
  return value === void 0 || value === "" ? [] : ["".concat(label, ": ").concat(value)];
}
function triggerTargetText(trigger) {
  const target = trigger?.target;
  if (target?.tag)
    return "tag ".concat(target.tag);
  const ids = target?.screen_ids ?? [];
  return "".concat(ids.length, " screen").concat(ids.length === 1 ? "" : "s").concat(ids.length ? ": ".concat(ids.join(", ")) : "");
}
function holdText(seconds) {
  if (seconds === void 0)
    return "";
  const parts = [];
  let rest = seconds;
  for (const [unit, size] of [["d", 86400], ["h", 3600], ["m", 60], ["s", 1]]) {
    if (rest >= size) {
      parts.push("".concat(Math.floor(rest / size)).concat(unit));
      rest %= size;
    }
  }
  return parts.join("") || "0s";
}
function alertScreensText(alert) {
  const screens = alert.screens;
  const changed = alert.state === "ended" ? "".concat(screens.cleared, " cleared") : "".concat(screens.taken_over, " taken over");
  const pending = screens.pending ? "; still writing screens" : "";
  return "".concat(changed, " of ").concat(screens.targeted, " targeted, ").concat(screens.skipped, " skipped, ").concat(screens.failed, " failed").concat(pending);
}
function alertLines(alert) {
  if (!alert)
    return [];
  return [
    "",
    "Alert",
    "id: ".concat(alert.id),
    "state: ".concat(alert.state).concat(alert.ended_reason ? " (".concat(alert.ended_reason, ")") : ""),
    "status: ".concat(alert.status),
    "msg_type: ".concat(alert.msg_type),
    ...when(alert.event, "event"),
    ...when(alert.headline, "headline"),
    ...when(alert.severity, "severity"),
    "sender: ".concat(alert.sender),
    "identifier: ".concat(alert.identifier),
    "until: ".concat(alert.until),
    "screens: ".concat(alertScreensText(alert)),
    ...when(alert.media_id, "media_id"),
    "started_at: ".concat(alert.started_at),
    ...when(alert.ended_at, "ended_at")
  ];
}
function untilText(until) {
  return until === null ? "until cleared" : "until ".concat(until);
}
function overlayScreensText(overlay) {
  const screens = overlay.screens;
  const done = overlay.show === "bar" ? "".concat(screens.holding, " hold the bar") : "".concat(screens.taken_over, " taken over");
  const edge = screens.edge_taken > 0 ? ", ".concat(screens.edge_taken, " with the edge taken") : "";
  const pending = overlay.pending ? "; still writing" : "";
  return "".concat(done, " of ").concat(screens.targeted, " targeted").concat(edge, ", ").concat(screens.removed, " removed, ").concat(screens.skipped, " skipped, ").concat(screens.failed, " failed").concat(pending);
}
function overlayLines(overlay) {
  if (!overlay)
    return [];
  const lines = [
    "",
    "Overlay",
    "show: ".concat(overlay.show).concat(overlay.edge ? " on the ".concat(overlay.edge, " edge") : ""),
    "enabled: ".concat(overlay.enabled),
    "signing: ".concat(overlay.signing),
    ...verifyLines(overlay.verify, overlay.handshake),
    ...when(overlay.card_id, "card_id"),
    ...overlay.mapping ? ["mapping: set"] : [],
    ...Object.keys(overlay.style ?? {}).length ? ["style: ".concat(JSON.stringify(overlay.style))] : [],
    "screens: ".concat(overlayScreensText(overlay)),
    "alerts: ".concat(overlay.alerts.length)
  ];
  for (const alert of overlay.alerts) {
    const words = [alert.label, alert.title, alert.message].filter(Boolean).join(" | ");
    lines.push("  ".concat(alert.id, "  ").concat(untilText(alert.until)).concat(words ? "  ".concat(words) : ""));
  }
  return lines;
}
function triggerLines(trigger) {
  if (!trigger)
    return [];
  return [
    "id: ".concat(trigger.id),
    "label: ".concat(trigger.label),
    "target: ".concat(triggerTargetText(trigger)),
    "kind: ".concat(trigger.kind),
    "hold: ".concat(holdText(trigger.default_for_seconds), " ").concat(trigger.kind === "overlay" ? "when a post names no duration" : "when an alert has no <expires>"),
    "url: ".concat(trigger.url),
    "username: ".concat(trigger.username),
    ...when(trigger.playlist_id, "playlist_id"),
    ...when(trigger.last_received_at, "last_received_at"),
    "revision: ".concat(trigger.revision),
    ...when(trigger.created_at, "created_at"),
    ...when(trigger.updated_at, "updated_at")
  ];
}
function alertCell(item) {
  if (item.overlay) {
    const count = item.overlay.alerts.length;
    const shown = item.overlay.alerts[0];
    const state = "".concat(item.overlay.show).concat(item.overlay.enabled ? "" : " (disabled)");
    return count ? "".concat(state, ": ").concat(count, " alert").concat(count === 1 ? "" : "s", ", ").concat(shown?.title ?? shown?.id ?? "").trim() : "".concat(state, ": none");
  }
  const alert = item.alert;
  if (!alert)
    return "-";
  if (alert.state === "ended")
    return "ended (".concat(alert.ended_reason ?? "ended", ")");
  return "".concat(alert.status === "Exercise" ? "exercise" : "active", " ").concat(alert.severity ?? "", " until ").concat(alert.until).replace(/\s+/g, " ");
}
function table2(header, rows) {
  const widths = header.map((cell, index) => Math.max(cell.length, ...rows.map((row) => (row[index] ?? "").length)));
  const render = (row) => row.map((cell, index) => cell.padEnd(widths[index])).join("  ").trimEnd();
  return [render(header), ...rows.map(render)];
}
function triggerTableLines(items) {
  if (!items.length)
    return ["No triggers"];
  return table2(["ID", "KIND", "LABEL", "TARGET", "ALERT", "LAST_RECEIVED"], items.map((item) => [
    item.id ?? "",
    item.kind ?? "",
    item.label ?? "",
    item.target?.tag ? "tag ".concat(item.target.tag) : "".concat(item.target?.screen_ids?.length ?? 0, " screens"),
    alertCell(item),
    item.last_received_at ?? ""
  ]));
}
function triggerDeliveryTableLines(items) {
  if (!items.length)
    return ["No deliveries in the last seven days"];
  const files = items.some((item) => item.files !== void 0);
  return table2(["AT", "OUTCOME", "REASON", "STATUS", "BYTES", "ALERT", ...files ? ["FILES"] : [], "DETAIL"], items.map((item) => [
    item.at ?? "",
    item.outcome ?? "",
    item.reason ?? "-",
    String(item.status ?? ""),
    String(item.bytes ?? ""),
    item.alert_id ?? "-",
    ...files ? [item.files === void 0 ? "-" : String(item.files)] : [],
    item.detail ?? ""
  ]));
}

// dist/handlers/triggers.js
var TRIGGERS_PATH = "/api/triggers";
async function triggerCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw triggerProblem(error, id);
  }
}
function triggerRevisionHeaders(args) {
  const revision2 = flagString(args.flags, "expect-rev");
  return revision2 ? { "if-match": quotedRevision(revision2) } : void 0;
}
async function triggerWithSecrets(body, action, wantSigning, runtime) {
  const trigger = body;
  const passwordOk = typeof trigger?.password === "string" && TRIGGER_PASSWORD_PATTERN.test(trigger.password);
  const signingOk = typeof trigger?.signing_secret === "string" && TRIGGER_SIGNING_SECRET_PATTERN.test(trigger.signing_secret);
  const needPassword = action === "create" || action === "rotate";
  const needSigning = action === "rotate-signing" || action === "create" && wantSigning;
  if (!trigger || typeof trigger.id !== "string" || needPassword && !passwordOk || needSigning && !signingOk || trigger.password !== void 0 && !passwordOk || trigger.signing_secret !== void 0 && !signingOk) {
    await writeRecoveries.get(runtime)?.finish();
    const id = trigger && typeof trigger.id === "string" && TRIGGER_ID_PATTERN.test(trigger.id) ? trigger.id : void 0;
    const signing = action === "rotate-signing" || wantSigning;
    throw new CliError(makeProblem("unexpected_response", "Unexpected response", 502, "The ".concat(action === "create" ? "trigger create" : action === "update" ? "trigger update" : "rotate-secret", " request completed, but its answer did not carry the secret it should. Do not rerun it."), {
      next: id ? { command: "screenrig triggers rotate-secret ".concat(id).concat(signing ? " --signing" : ""), reason: "Issue a new secret; it is shown once in the answer." } : { command: "screenrig triggers list", reason: "Find the trigger, then run screenrig triggers rotate-secret ID to receive a new secret." }
    }), ExitCode.Unexpected);
  }
  return trigger;
}
async function triggerSecretResult(response, client, action, wantSigning, runtime) {
  const trigger = await triggerWithSecrets(response.body, action, wantSigning, runtime);
  const warnings = [];
  if (trigger.password)
    warnings.push(triggerPasswordWarning(trigger.id, action === "create" ? "create" : "rotate", trigger.kind));
  if (trigger.signing_secret)
    warnings.push(triggerSigningWarning(trigger.id));
  const overlay = trigger.kind === "overlay";
  const title = action === "create" ? "Created trigger ".concat(trigger.id) : action === "update" ? "Updated trigger ".concat(trigger.id) : action === "rotate-signing" ? "Rotated the signing secret of trigger ".concat(trigger.id) : "Rotated the password of trigger ".concat(trigger.id);
  const lines = [title, ...triggerLines(trigger), ...overlayLines(trigger.overlay)];
  if (trigger.password || trigger.signing_secret) {
    lines.push("", overlay ? "Sensitive trigger secrets (enter them only in the system that posts to the url above)" : "Sensitive CAP password (enter it only in your emergency notification system, with the url and username above)");
    if (trigger.password)
      lines.push("password: ".concat(trigger.password));
    if (trigger.signing_secret)
      lines.push("signing_secret: ".concat(trigger.signing_secret));
    if (overlay)
      lines.push("example: ".concat(triggerExample(trigger.url, trigger.overlay?.signing === true)));
    for (const warning of warnings)
      lines.push("warning: ".concat(warning.message));
  }
  return {
    envelope: jsonBody(response, client.requestId, void 0, warnings.length ? warnings : void 0),
    exitCode: ExitCode.Success,
    human: lines.join("\n"),
    ...trigger.password || trigger.signing_secret ? { keepRecoveryUntilOutput: true } : {}
  };
}
async function triggerPull(file, runtime) {
  let parsed;
  try {
    parsed = await readAuthoringJson(file, runtime);
  } catch (error) {
    throw usageError("Cannot read the --pull JSON: ".concat(error instanceof Error ? error.message : "invalid JSON"));
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw usageError("--pull must hold a JSON object of CAP sources and filters.");
  return parsed;
}
function triggerTargetBody(args) {
  const tag = flagString(args.flags, "tag");
  const screenIds = flagString(args.flags, "screen-id");
  if (tag !== void 0 && screenIds !== void 0)
    throw usageError("Add --tag TAG or --screen-id ID, not both.");
  if (tag !== void 0)
    return { tag: triggerTag(tag) };
  if (screenIds !== void 0)
    return { screen_ids: triggerScreenIds(screenIds).split(",") };
  return void 0;
}
function triggerOverlayOptionsOnly(args, kind) {
  for (const flag of ["show", "edge", "style", "map", "signing", "verify", "verify-secret-file", "verify-header", "verify-encoding", "verify-timestamp-header", "verify-tolerance", "handshake"]) {
    const given = flag === "signing" ? flagBool(args.flags, flag) : flagString(args.flags, flag) !== void 0;
    if (given && kind !== "overlay")
      throw usageError("--".concat(flag, " applies to an overlay trigger: add --kind overlay."));
  }
}
var handleTriggersCreate = commandHandler(async (args, runtime, resolved) => {
  const label = triggerName(flagString(args.flags, "name") ?? "");
  const kind = flagString(args.flags, "kind") ?? "cap";
  const target = triggerTargetBody(args);
  if (!target)
    throw usageError("triggers create takes exactly one of --tag TAG or --screen-id ID.");
  const hold = flagString(args.flags, "for");
  const pullFile = flagString(args.flags, "pull");
  triggerOverlayOptionsOnly(args, kind);
  const signing = flagBool(args.flags, "signing");
  let body;
  if (kind === "overlay") {
    if (pullFile !== void 0)
      throw usageError("--pull applies to a CAP trigger: omit --kind overlay.");
    const show = flagString(args.flags, "show");
    if (show !== "bar" && show !== "takeover")
      throw usageError("An overlay trigger needs --show bar (a strip over whatever plays) or --show takeover (the alert fills the screen).");
    const edge = flagString(args.flags, "edge");
    if (edge !== void 0 && show !== "bar")
      throw usageError("--edge applies to a bar: use --show bar.");
    const styleFile = flagString(args.flags, "style");
    const mapFile = flagString(args.flags, "map");
    if (signing && flagString(args.flags, "verify") !== void 0)
      throw usageError("--verify and --signing exclude each other: a vendor signs with its own scheme, not ScreenRig-Signature.");
    singleStdin([["--style", styleFile], ["--map", mapFile], ["--verify-secret-file", flagString(args.flags, "verify-secret-file")]]);
    const vendor = await verifyMembers(args, runtime, { create: true, subject: "the trigger" });
    body = {
      kind: "overlay",
      label,
      target,
      ...hold !== void 0 ? { default_for_seconds: triggerHoldSeconds(hold, "overlay") } : {},
      overlay: {
        show,
        ...edge !== void 0 ? { edge } : {},
        ...styleFile !== void 0 ? { style: triggerStyle(await readAuthoringText(styleFile, runtime, TRIGGER_MAPPING_MAX_BYTES)) } : {},
        ...mapFile !== void 0 ? { mapping: triggerMapping(await readAuthoringText(mapFile, runtime, TRIGGER_MAPPING_MAX_BYTES)) } : {},
        ...signing ? { signing: true } : {},
        ...vendor.verify ? { verify: vendor.verify } : {},
        ...vendor.handshake ? { handshake: vendor.handshake } : {}
      }
    };
  } else {
    body = {
      label,
      target,
      ...hold !== void 0 ? { default_for_seconds: triggerHoldSeconds(hold) } : {},
      ...pullFile !== void 0 ? { pull: await triggerPull(pullFile, runtime) } : {}
    };
  }
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await triggerCall(client, { method: "POST", path: TRIGGERS_PATH, idempotent: true, body });
  return triggerSecretResult(response, client, "create", signing, runtime);
});
var handleTriggersUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = triggerId(args.positionals[2], "update");
  const name = flagString(args.flags, "name");
  const target = triggerTargetBody(args);
  const hold = flagString(args.flags, "for");
  const pullFile = flagString(args.flags, "pull");
  const edge = flagString(args.flags, "edge");
  const styleFile = flagString(args.flags, "style");
  const mapFile = flagString(args.flags, "map");
  if (flagBool(args.flags, "signing") && flagString(args.flags, "verify") !== void 0)
    throw usageError("--verify and --signing exclude each other: a vendor signs with its own scheme, not ScreenRig-Signature.");
  singleStdin([["--style", styleFile], ["--map", mapFile], ["--verify-secret-file", flagString(args.flags, "verify-secret-file")]]);
  const vendor = await verifyMembers(args, runtime, { create: false, subject: "the trigger" });
  const overlay = {
    ...edge !== void 0 ? { edge } : {},
    ...styleFile !== void 0 ? { style: triggerStyle(await readAuthoringText(styleFile, runtime, TRIGGER_MAPPING_MAX_BYTES)) } : {},
    ...flagBool(args.flags, "clear-style") ? { style: null } : {},
    ...mapFile !== void 0 ? { mapping: triggerMapping(await readAuthoringText(mapFile, runtime, TRIGGER_MAPPING_MAX_BYTES)) } : {},
    ...flagBool(args.flags, "clear-map") ? { mapping: null } : {},
    ...flagBool(args.flags, "enable") ? { enabled: true } : {},
    ...flagBool(args.flags, "disable") ? { enabled: false } : {},
    ...flagBool(args.flags, "signing") ? { signing: true } : {},
    ...flagBool(args.flags, "no-signing") ? { signing: false } : {},
    ...vendor.verify !== void 0 ? { verify: vendor.verify } : {},
    ...vendor.handshake !== void 0 ? { handshake: vendor.handshake } : {}
  };
  const body = {
    ...name !== void 0 ? { label: triggerName(name) } : {},
    ...target ? { target } : {},
    // The kind is not known here, so the server holds the 1m floor of a CAP trigger.
    ...hold !== void 0 ? { default_for_seconds: triggerHoldSeconds(hold, "overlay") } : {},
    ...pullFile !== void 0 ? { pull: await triggerPull(pullFile, runtime) } : {},
    ...flagBool(args.flags, "no-pull") ? { pull: null } : {},
    ...Object.keys(overlay).length ? { overlay } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await triggerCall(client, { method: "PATCH", path: "".concat(TRIGGERS_PATH, "/").concat(id), idempotent: true, body, headers: triggerRevisionHeaders(args) }, id);
  const trigger = response.body;
  if (trigger?.password !== void 0 || trigger?.signing_secret !== void 0)
    return triggerSecretResult(response, client, "update", flagBool(args.flags, "signing"), runtime);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Updated trigger ".concat(id), ...triggerLines(trigger), ...overlayLines(trigger?.overlay)].join("\n")
  };
});
var handleTriggersList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await triggerCall(client, { method: "GET", path: TRIGGERS_PATH });
  const items = response.body?.items;
  const list = Array.isArray(items) ? items : [];
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Triggers (".concat(list.length, ")"), ...triggerTableLines(list)].join("\n")
  };
});
var handleTriggersShow = commandHandler(async (args, runtime, resolved) => {
  const id = triggerId(args.positionals[2], "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await triggerCall(client, { method: "GET", path: "".concat(TRIGGERS_PATH, "/").concat(id) }, id);
  const trigger = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Trigger", ...triggerLines(trigger), ...alertLines(trigger?.alert), ...overlayLines(trigger?.overlay)].join("\n")
  };
});
var handleTriggersTest = commandHandler(async (args, runtime, resolved) => {
  const id = triggerId(args.positionals[2], "test");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await triggerCall(client, { method: "POST", path: "".concat(TRIGGERS_PATH, "/").concat(id, "/test"), idempotent: true }, id);
  const receipt = response.body;
  if (receipt && "active" in receipt) {
    return {
      envelope: jsonBody(response, client.requestId),
      exitCode: ExitCode.Success,
      human: receipt.outcome === "shown" ? "Showing a test overlay from trigger ".concat(id, " ").concat(receipt.until ? "until ".concat(receipt.until) : "until cleared", ". screenrig triggers show ").concat(id, " reports its screens; screenrig triggers clear ").concat(id, " ends it sooner.") : "Trigger ".concat(id, " answered ").concat(receipt.outcome ?? "no outcome", ".")
    };
  }
  const alert = receipt?.alert;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      alert && receipt?.outcome === "shown" ? "Showing an exercise alert from trigger ".concat(id, " until ").concat(alert.until, ". screenrig triggers show ").concat(id, " reports its screens; screenrig triggers clear ").concat(id, " ends it sooner.") : "Trigger ".concat(id, " answered ").concat(receipt?.outcome ?? "no outcome", "."),
      ...alertLines(alert)
    ].join("\n")
  };
});
var handleTriggersClear = commandHandler(async (args, runtime, resolved) => {
  const id = triggerId(args.positionals[2], "clear");
  const alertId2 = flagString(args.flags, "alert-id");
  if (alertId2 !== void 0 && (!alertId2.trim() || [...alertId2].length > 200))
    throw usageError("--alert-id takes the sender's alert id, 1 to 200 characters.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await triggerCall(client, {
    method: "POST",
    path: "".concat(TRIGGERS_PATH, "/").concat(id, "/clear"),
    idempotent: true,
    ...alertId2 !== void 0 ? { body: { alert_id: alertId2.trim() } } : {}
  }, id);
  const trigger = response.body;
  const remaining = trigger?.overlay?.alerts.length ?? 0;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      trigger?.overlay ? remaining ? "Trigger ".concat(id, " still shows ").concat(remaining, " alert").concat(remaining === 1 ? "" : "s", ".") : "No alert is active on trigger ".concat(id, ". Its bar is lowered, or its screens go back to what they played before.") : "No alert is active on trigger ".concat(id, ". Screens its alert took over go back to what they played before."),
      ...triggerLines(trigger),
      ...alertLines(trigger?.alert),
      ...overlayLines(trigger?.overlay)
    ].join("\n")
  };
});
var handleTriggersDeliveries = commandHandler(async (args, runtime, resolved) => {
  const id = triggerId(args.positionals[2], "deliveries");
  const limit = flagString(args.flags, "limit");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await triggerCall(client, { method: "GET", path: "".concat(TRIGGERS_PATH, "/").concat(id, "/deliveries"), ...limit ? { query: { limit } } : {} }, id);
  const items = response.body?.items;
  const list = Array.isArray(items) ? items : [];
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Deliveries of ".concat(id, " (").concat(list.length, ")"), ...triggerDeliveryTableLines(list)].join("\n")
  };
});
var handleTriggersRotateSecret = commandHandler(async (args, runtime, resolved) => {
  const id = triggerId(args.positionals[2], "rotate-secret");
  const signing = flagBool(args.flags, "signing");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await triggerCall(client, {
    method: "POST",
    path: "".concat(TRIGGERS_PATH, "/").concat(id, "/rotate-secret"),
    idempotent: true,
    headers: triggerRevisionHeaders(args),
    ...signing ? { body: { signing: true } } : {}
  }, id);
  return triggerSecretResult(response, client, signing ? "rotate-signing" : "rotate", signing, runtime);
});
var handleTriggersDelete = commandHandler(async (args, runtime, resolved) => {
  const id = triggerId(args.positionals[2], "delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await triggerCall(client, {
    method: "DELETE",
    path: "".concat(TRIGGERS_PATH, "/").concat(id),
    idempotent: true,
    headers: triggerRevisionHeaders(args)
  }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: "Deleted trigger ".concat(id, ". Its URL stopped accepting posts.")
  };
});

// dist/cli-commands/triggers.js
var nameOption = (value) => {
  triggerName(value);
  return value;
};
var OVERLAY_VERIFY = { scope: "Overlay", secret: "the trigger's srtg_ secret" };
function registerTriggersCommands(root, bind) {
  const triggers = root.command("triggers").description("Show alerts from outside systems on screens");
  addCommandNotes(triggers, "Triggers:\n  A trigger is a URL with its own secret that an outside system posts to. Two kinds.\n  CAP (the default): an emergency notification system (Everbridge, Rave, Alertus, an\n  IPAWS relay) posts CAP 1.2 alerts with HTTP Basic; an Alert takes the target screens\n  over with a full-screen card coloured by severity until the alert's <expires>, else\n  --for, and a Cancel or AllClear gives them back. Overlay (--kind overlay): Home\n  Assistant, a sensor hub or an alerting tool posts a few words (alert_id, title,\n  message, duration, clear) with Authorization: Bearer; --show bar draws a strip over\n  whatever plays, --show takeover plays the alert full screen. The same alert_id\n  updates one alert instead of stacking, a clear ends it, and every post holds its\n  alert for its duration from that post. The target is a tag or up to 500 screen ids.\n  An organization has at most 20 triggers across its projects, overlay triggers included.\n  An overlay trigger also takes posts straight from GitHub, Stripe, Shopify, Slack, Linear, Vercel,\n  Asana and any sender that signs with an HMAC, with no relay: --verify VENDOR --verify-secret-file FILE\n  makes the vendor's own signature authenticate a post, and the srtg_ secret keeps working beside it;\n  --handshake VENDOR answers the setup challenge of Microsoft Graph, monday.com, Trello or Azure Event Grid.");
  const create = triggers.command("create").description("Create a trigger and print its URL and secret").requiredOption("--name <NAME>", "Name the trigger, 1 to 80 characters (required)", nameOption).addOption(new Option("--kind <KIND>", "cap: emergency CAP 1.2 alerts (default). overlay: words from any sender over or instead of what plays").choices(["cap", "overlay"])).addOption(new Option("--tag <TAG>", "Target every active screen with this tag when an alert arrives").argParser(triggerTag).conflicts(["screenId"])).addOption(new Option("--screen-id <ID>", "Target this screen (repeatable, or comma-separated; at most 500)").argParser(triggerScreenIds).conflicts(["tag"])).option("--for <DURATION>", "Hold an alert that names no end this long: 1m to 7d for CAP (default 1h), 10s to 7d for overlay (default 10m)", triggerHoldOption).option("--pull <FILE>", "CAP: also read CAP alert sources the platform pulls: a JSON object (sources, location, filters) from a file, or - for stdin").addOption(new Option("--show <SHOW>", "Overlay: bar draws a strip over whatever plays; takeover plays the alert full screen").choices(["bar", "takeover"])).addOption(new Option("--edge <EDGE>", "Overlay bar: the edge it takes, bottom (default) or top").choices(["bottom", "top"])).option("--style <FILE>", "Overlay: the text card style, a JSON object (theme, accent, background, backgroundColor, textColor, align), or - for stdin").option("--map <FILE>", "Overlay: the template that builds the post from the body a sender posts, a JSON file or - for stdin").option("--signing", "Overlay: also require a ScreenRig-Signature header on every post, and print the signing secret once").action(bind(handleTriggersCreate));
  requireOptionGroup(create, "exactlyOne", ["--tag", "--screen-id"]);
  requireOptionGroup(create, "requires", ["--edge", "--show"]);
  addVerifyOptions(create, OVERLAY_VERIFY, false);
  const update = triggers.command("update").description("Change a trigger's name, target, hold or overlay without a new URL or secret").argument("<id>", "Trigger identifier").option("--name <NAME>", "Rename the trigger, 1 to 80 characters", nameOption).addOption(new Option("--tag <TAG>", "Target every active screen with this tag").argParser(triggerTag).conflicts(["screenId"])).addOption(new Option("--screen-id <ID>", "Target this screen (repeatable, or comma-separated; at most 500)").argParser(triggerScreenIds).conflicts(["tag"])).option("--for <DURATION>", "Hold an alert that names no end this long (CAP 1m to 7d, overlay 10s to 7d)", triggerHoldOption).option("--pull <FILE>", "CAP: replace the CAP alert sources, a JSON object from a file, or - for stdin").option("--no-pull", "CAP: stop reading CAP alert sources").addOption(new Option("--edge <EDGE>", "Overlay bar: move the bar to this edge").choices(["bottom", "top"])).addOption(new Option("--style <FILE>", "Overlay: replace the whole style, a JSON object from a file, or - for stdin").conflicts(["clearStyle"])).addOption(new Option("--clear-style", "Overlay: remove the style").conflicts(["style"])).addOption(new Option("--map <FILE>", "Overlay: replace the template that builds the post, a JSON file or - for stdin").conflicts(["clearMap"])).addOption(new Option("--clear-map", "Overlay: remove the template: the posted object is the post").conflicts(["map"])).addOption(new Option("--enable", "Overlay: accept posts again").conflicts(["disable"])).addOption(new Option("--disable", "Overlay: answer every post like a wrong secret until enabled again").conflicts(["enable"])).option("--signing", "Overlay: require a ScreenRig-Signature header and print the signing secret once").option("--no-signing", "Overlay: stop requiring a ScreenRig-Signature header").option("--expect-rev <REVISION>", "Optionally require this trigger revision", revision).action(bind(handleTriggersUpdate));
  addVerifyOptions(update, OVERLAY_VERIFY, true);
  requireOptionGroup(update, "atLeastOne", [
    "--name",
    "--tag",
    "--screen-id",
    "--for",
    "--pull",
    "--no-pull",
    "--edge",
    "--style",
    "--clear-style",
    "--map",
    "--clear-map",
    "--enable",
    "--disable",
    "--signing",
    "--no-signing",
    "--verify",
    "--clear-verify",
    "--handshake",
    "--clear-handshake"
  ]);
  triggers.command("list").description("List this project's triggers and their latest alerts").action(bind(handleTriggersList));
  triggers.command("show").description("Inspect a trigger, its latest alert or its active overlay alerts").argument("<id>", "Trigger identifier").action(bind(handleTriggersShow));
  triggers.command("test").description("Show a 60-second exercise alert (CAP) or test overlay on the trigger's screens").argument("<id>", "Trigger identifier").action(bind(handleTriggersTest));
  triggers.command("deliveries").description("Read an overlay trigger's log of posts: why each was shown, ignored or refused").argument("<id>", "Trigger identifier").option("--limit <N>", "How many deliveries, newest first (1 to 100)", triggerDeliveriesLimit).action(bind(handleTriggersDeliveries));
  triggers.command("clear").description("End the trigger's alert now and give its screens back").argument("<id>", "Trigger identifier").option("--alert-id <ID>", "Overlay: end only this alert; without it every alert ends").action(bind(handleTriggersClear));
  triggers.command("rotate-secret").description("Replace a trigger's password; the old one stops working at once").argument("<id>", "Trigger identifier").option("--signing", "Overlay: replace the signing secret instead of the password").option("--expect-rev <REVISION>", "Optionally require this trigger revision", revision).action(bind(handleTriggersRotateSecret));
  triggers.command("delete").description("Delete a trigger; its URL stops accepting posts").argument("<id>", "Trigger identifier").option("--expect-rev <REVISION>", "Optionally require this trigger revision", revision).action(bind(handleTriggersDelete));
}

// dist/handlers/operations.js
var handleOperationsGet = commandHandler(operationsGet);
var handleOperationsWait = commandHandler(operationsWait);
var handleOperationsCancel = commandHandler(operationsCancel);
async function operationsGet(args, runtime, resolved) {
  const id = args.positionals[2];
  if (!id)
    throw usageError("operations show requires an id.");
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const operation = await client.getOperation(id);
  return {
    envelope: successEnvelope(operation, { request_id: client.requestId, operation_id: operation.id }),
    exitCode: ExitCode.Success,
    human: humanLines("Operation", [
      ["id", operation.id],
      ["state", operation.state],
      ["kind", operation.kind],
      ["request_id", operation.request_id ?? client.requestId]
    ])
  };
}
async function operationsWait(args, runtime, resolved) {
  const id = args.positionals[2];
  if (!id)
    throw usageError("operations wait requires an id.");
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const operation = await client.waitForOperation(id, {
    timeoutMs: flagNumber(args.flags, "timeout") ?? 12e4,
    pollMs: flagNumber(args.flags, "poll-ms") ?? 1e3,
    sleep: runtime.sleep
  });
  return {
    envelope: successEnvelope(operation, { request_id: client.requestId, operation_id: operation.id }),
    exitCode: ExitCode.Success,
    human: humanLines("Operation complete", [
      ["id", operation.id],
      ["state", operation.state]
    ])
  };
}
async function operationsCancel(args, runtime, resolved) {
  const id = args.positionals[2];
  if (!id)
    throw usageError("operations cancel requires an id.");
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const response = await client.call({ method: "POST", path: "/api/operations/".concat(id, "/cancel"), idempotent: true });
  const operation = response.body;
  return {
    envelope: successEnvelope(operation, { request_id: client.requestId, operation_id: operation.id }),
    exitCode: ExitCode.Success,
    human: humanLines("Operation cancelled", [["id", operation.id], ["state", operation.state]])
  };
}

// dist/cli-commands/operations.js
function registerOperationsCommands(root, bind) {
  const operations = root.command("operations").description("Inspect, wait for, or cancel operations");
  operations.command("show").description("Inspect an operation").argument("<id>", "Operation identifier").action(bind(handleOperationsGet));
  operations.command("wait").description("Wait for an operation to finish").argument("<id>", "Operation identifier").option("--poll-ms <MS>", "Set the operation polling interval", positiveInteger("poll-ms")).action(bind(handleOperationsWait));
  operations.command("cancel").description("Cancel an operation").argument("<id>", "Operation identifier").action(bind(handleOperationsCancel));
}

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
  "Scheduled reboot skipped"
]);
var NULL_AS_NONE_EVENT_TYPES = /* @__PURE__ */ new Set(["screen.display_changed", "screen.playlist_switched", "screen.takeover_started", "screen.takeover_ended", "screen.playlist_unavailable"]);
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

// dist/cli-commands/events.js
function registerEventsCommands(root, bind) {
  const events = root.command("events").description("List or follow project events");
  events.command("list").description("List project events").option("--after <CURSOR>", "Read events after this cursor").option("--limit <N>", "Limit returned events", positiveInteger("limit")).option("--type <TYPE>", "Only this event type, or a family by a prefix ending in a dot (note.)", eventTypeOption).addOption(new Option("--source <SOURCE>", "project (default) lists project events; log lists Player log records").choices(["project", "log"])).option("--screen-id <ID>", "Only the events of this screen (with --source log, its Player log records)").option("--playlist-id <ID>", "Only the project events of this playlist (not with --source log)").option("--app-id <ID>", "Only application resource, release and K/V events (not SDK emits or --source log)").action(bind(handleEventsList));
  events.command("follow").description("Stream project events").option("--after <CURSOR>", "Read events after this cursor").option("--type <TYPE>", "Only this event type, or a family by a prefix ending in a dot (note.)", eventTypeOption).action(bind(handleEventsFollow));
}

// dist/handlers/playback.js
var handlePlaybackList = commandHandler(playbackList);
var handlePlaybackPlays = commandHandler(playbackPlays);
function playbackFilterFlags(args) {
  requireFlagValue(args, "screen-id", "scr_01");
  requireFlagValue(args, "media-id", "med_01");
  const screenId = flagString(args.flags, "screen-id");
  const mediaId = flagString(args.flags, "media-id");
  if (screenId !== void 0 && !isResourceID(screenId, "screen")) {
    throw usageError("--screen-id must be a screen identifier.");
  }
  if (mediaId !== void 0 && !isResourceID(mediaId, "media")) {
    throw usageError("--media-id must start with med_.");
  }
  return { screenId, mediaId };
}
async function playbackList(args, runtime, resolved) {
  const { screenId, mediaId } = playbackFilterFlags(args);
  for (const name of ["day", "day-from", "day-to"])
    requireFlagValue(args, name, "2026-08-14");
  const day = flagString(args.flags, "day");
  if (day !== void 0 && !PLAYBACK_DAY_PATTERN.test(day)) {
    throw usageError("--day must be a UTC calendar day as YYYY-MM-DD.");
  }
  const days = aggregateDays(flagString(args.flags, "day-from"), flagString(args.flags, "day-to"));
  if (day !== void 0 && (days.day_from !== void 0 || days.day_to !== void 0)) {
    throw usageError("Use --day for one UTC day, or --day-from/--day-to for a range, not both.");
  }
  const query = { screen_id: screenId, media_id: mediaId, day, ...days };
  const aggregateFile = await reportFileOf(args, runtime, resolved, "/api/playback", query, "play-aggregates", "playback aggregates", true);
  if (aggregateFile)
    return aggregateFile;
  if (playbackFormat(args, "playback list") === "csv") {
    return playbackCsvExport(args, runtime, resolved, {
      path: "/api/playback",
      query,
      what: "playback aggregates",
      defaultFile: "./playback-aggregates.csv"
    });
  }
  return simpleGet(args, runtime, resolved, "/api/playback", "Playback", query);
}
async function playbackPlays(args, runtime, resolved) {
  const { screenId, mediaId } = playbackFilterFlags(args);
  for (const [name, example] of [["from", "7d"], ["to", "now"], ["tag", "Lobby"], ["cursor", "pc_NEXT"], ["limit", "500"]]) {
    requireFlagValue(args, name, example);
  }
  const tagValue = flagString(args.flags, "tag");
  const tag = tagValue === void 0 ? void 0 : screenTag(tagValue);
  const cursorValue = flagString(args.flags, "cursor");
  const cursor = cursorValue === void 0 ? void 0 : playsCursor(cursorValue);
  const limitValue = flagString(args.flags, "limit") ?? (typeof args.flags.limit === "number" ? String(args.flags.limit) : void 0);
  const limit = limitValue === void 0 ? void 0 : playsLimit(limitValue);
  if (args.flags.all !== void 0 && args.flags.all !== true)
    throw usageError("--all takes no value.");
  const all = flagBool(args.flags, "all");
  const range = playsRange(flagString(args.flags, "from"), flagString(args.flags, "to"), runtime.now());
  const filters = { screen_id: screenId, media_id: mediaId, tag };
  const query = { from: range.from, to: range.to, ...filters };
  const playsFile = await reportFileOf(args, runtime, resolved, "/api/playback/plays", { ...query, cursor }, "plays", "plays", true);
  if (playsFile)
    return playsFile;
  const format = playbackFormat(args, "playback plays");
  const now = runtime.now().getTime();
  const reported = { from: range.from, to: Date.parse(range.to) > now - PLAYS_SETTLE_MS ? new Date(now - PLAYS_SETTLE_MS).toISOString().replace(/\.000Z$/, "Z") : range.to };
  if (format === "csv") {
    if (limit !== void 0)
      throw usageError("--limit is JSON-only; --format csv streams the whole range in one request.");
    if (all)
      throw usageError("--all is JSON-only; --format csv already streams the whole range in one request.");
    return playbackCsvExport(args, runtime, resolved, {
      path: "/api/playback/plays",
      query: { ...query, cursor },
      what: "playback plays",
      defaultFile: "./playback-plays.csv",
      range: reported,
      filters
    });
  }
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const pageLimit = limit ?? (all ? String(PLAYS_LIMIT_MAX) : void 0);
  const items = [];
  const warnings = [];
  let next = cursor ?? null;
  let pages = 0;
  while (true) {
    let response;
    try {
      response = await client.call({
        method: "GET",
        path: "/api/playback/plays",
        query: { ...query, ...next ? { cursor: next } : {}, ...pageLimit ? { limit: pageLimit } : {} }
      });
    } catch (error) {
      if (pages === 0 || !(error instanceof CliError) || error.problem.code !== "rate_limited")
        throw error;
      const wait = error.problem.retry_after_seconds;
      warnings.push({ code: "playback_export_rate_limited", message: "--all stopped after ".concat(pages, " pages: the playback export budget is spent").concat(wait === void 0 ? "" : " for ".concat(wait, " s"), ". Continue with data.next after that.") });
      break;
    }
    const page = response.body;
    items.push(...Array.isArray(page?.items) ? page.items : []);
    next = typeof page?.next_cursor === "string" ? page.next_cursor : null;
    pages += 1;
    if (!all || !next)
      break;
    if (pages >= PLAYS_ALL_MAX_PAGES) {
      warnings.push({ code: "playback_plays_truncated", message: "--all stopped after ".concat(PLAYS_ALL_MAX_PAGES, " pages (").concat(items.length, " plays). Continue with data.next, or export the range with --format csv.") });
      break;
    }
    const budget = playbackExportBudget(response.headers.ratelimit);
    if (budget !== void 0 && budget.remaining === 0) {
      warnings.push({ code: "playback_export_rate_limited", message: "--all stopped after ".concat(pages, " pages: the playback export budget is spent for ").concat(budget.resetSeconds, " s. Continue with data.next after that.") });
      break;
    }
  }
  const nextArgv = next ? playsNextArgv(reported, filters, next, limit, all) : void 0;
  const data = {
    items,
    next_cursor: next,
    from: reported.from,
    to: reported.to,
    pages,
    ...nextArgv ? { next: { command: "screenrig ".concat(shellQuote(nextArgv)), argv: nextArgv } } : {}
  };
  return {
    envelope: successEnvelope(data, { request_id: client.requestId, warnings }),
    exitCode: ExitCode.Success,
    human: [
      "Playback plays ".concat(reported.from, " to ").concat(reported.to, " (").concat(items.length).concat(pages > 1 ? " in ".concat(pages, " pages") : "", ")"),
      ...items.map((play) => [play.received_at, play.screen_id, play.media_id, play.primitive, play.page_id, play.playlist_id ?? "-"].join("  ")),
      ...nextArgv ? ["next: screenrig ".concat(shellQuote(nextArgv))] : [],
      ...warnings.map((warning) => "warning: ".concat(warning.message))
    ].join("\n")
  };
}
var handlePlaybackTotals = commandHandler(async (args, runtime, resolved) => {
  const { screenId, mediaId } = playbackFilterFlags(args);
  for (const [name, example] of [["by", "screen"], ["day-from", "2026-09-01"], ["day-to", "2026-09-30"], ["top", "5"]]) {
    requireFlagValue(args, name, example);
  }
  const by = flagString(args.flags, "by") ?? "day";
  if (by !== "day" && by !== "screen" && by !== "media" && by !== "screen_day")
    throw usageError("--by must be day, screen, media or screen_day.");
  const top = flagString(args.flags, "top");
  let maxDays = 92;
  let scope = " for a ranking";
  if (by === "day") {
    if (top !== void 0)
      throw usageError("--top ranks screens or media: use it with --by screen, media or screen_day.");
    if (screenId === void 0 && mediaId === void 0) {
      maxDays = AGGREGATE_MAX_DAYS;
      scope = "";
    } else {
      scope = " with --screen-id or --media-id";
    }
  } else {
    if (screenId !== void 0 || mediaId !== void 0)
      throw usageError("--screen-id and --media-id narrow only --by day.");
    const topMax = by === "screen_day" ? 10 : 100;
    if (top !== void 0 && (!/^\d+$/.test(top) || Number(top) < 1 || Number(top) > topMax)) {
      throw usageError("--top must be a whole number from 1 to ".concat(topMax, " with --by ").concat(by, "."));
    }
  }
  const days = aggregateDays(flagString(args.flags, "day-from"), flagString(args.flags, "day-to"), maxDays, scope);
  return simpleGet(args, runtime, resolved, "/api/playback/totals", "Playback totals", {
    by: flagString(args.flags, "by"),
    screen_id: screenId,
    media_id: mediaId,
    top,
    ...days
  });
}, true);
var handlePlaybackCompleteness = commandHandler(async (args, runtime, resolved) => {
  const { screenId } = playbackFilterFlags(args);
  for (const [name, example] of [["day-from", "2026-09-01"], ["day-to", "2026-09-30"], ["limit", "100"]]) {
    requireFlagValue(args, name, example);
  }
  const limit = flagString(args.flags, "limit");
  if (limit !== void 0 && (!/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 500)) {
    throw usageError("--limit must be a whole number from 1 to 500.");
  }
  const days = aggregateDays(flagString(args.flags, "day-from"), flagString(args.flags, "day-to"), 92, "");
  return simpleGet(args, runtime, resolved, "/api/playback/completeness", "Playback completeness", {
    screen_id: screenId,
    limit,
    ...days
  });
}, true);
function playsNextArgv(range, filters, cursor, limit, all) {
  return [
    "playback",
    "plays",
    "--from",
    range.from,
    "--to",
    range.to,
    ...filters.screen_id ? ["--screen-id", filters.screen_id] : [],
    ...filters.media_id ? ["--media-id", filters.media_id] : [],
    ...filters.tag ? ["--tag", filters.tag] : [],
    "--cursor",
    cursor,
    ...limit ? ["--limit", limit] : [],
    ...all ? ["--all"] : []
  ];
}
async function playbackCsvExport(args, runtime, resolved, spec) {
  const toStdout = flagString(args.flags, "output") === "-";
  const outputPath = toStdout ? void 0 : await resolveDownloadOutput(runtime.cwd(), spec.defaultFile, args.flags);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const idle = flagNumber(args.flags, "timeout") ?? PLAYBACK_CSV_IDLE_TIMEOUT_MS;
  const response = await client.download({
    method: "GET",
    path: spec.path,
    query: { ...spec.query, format: "csv" },
    timeout_ms: 0,
    idle_timeout_ms: idle,
    label: "Playback export"
  });
  try {
    requireCsvResponse(response.headers, spec.what, client.requestId);
    if (!response.body)
      throw networkError("The ".concat(spec.what, " export returned no body."), client.requestId);
  } catch (error) {
    await response.body?.cancel?.();
    throw error;
  }
  const rerun = (output, from) => {
    const query = { ...spec.query, ...from ? { from, cursor: void 0 } : {} };
    const argv = [...args.command];
    for (const [key, value] of Object.entries(query)) {
      if (value !== void 0 && key !== "format")
        argv.push("--".concat(key.replaceAll("_", "-")), value);
    }
    argv.push("--format", "csv", "--output", output);
    return from ? { command: "screenrig ".concat(shellQuote(argv)), argv, reason: "Export the rest of the range from ".concat(from, ", the last received_at received. Rows received at that instant appear in both files; drop the repeats when joining them.") } : { command: "screenrig ".concat(shellQuote(argv)), argv, reason: "Rerun the same export; nothing was written." };
  };
  const resume = (failure, output) => {
    const index = failure.header.indexOf("received_at");
    const last = index >= 0 ? failure.lastRow?.[index] : void 0;
    const from = spec.range && last !== void 0 ? normalizeInstant(last) : void 0;
    return rerun(output, from);
  };
  if (toStdout) {
    try {
      if (formatResultContext(runtime))
        runtime.stderr.write("".concat(formatResultContext(runtime), "\n"));
      await writeCsvStdout(response.body, runtime.stdout, spec.what, client.requestId);
    } catch (error) {
      const lines = ["error: ".concat(error instanceof CliError ? error.problem.detail : "the ".concat(spec.what, " CSV could not be written to stdout."), " stdout holds an incomplete export.")];
      if (error instanceof CsvStreamFailure)
        lines.push("next: ".concat(resume(error, "-").command));
      try {
        runtime.stderr.write("".concat(lines.join("\n"), "\n"));
      } catch {
      }
      return { envelope: successEnvelope({}), exitCode: error instanceof CliError ? error.exitCode : ExitCode.Unexpected, human: "", output: "stream" };
    }
    return { envelope: successEnvelope({}), exitCode: ExitCode.Success, human: "", output: "stream" };
  }
  let file;
  try {
    file = await writeCsvFile(response.body, outputPath, spec.what, client.requestId, spec.range !== void 0);
  } catch (error) {
    if (!(error instanceof CsvStreamFailure))
      throw error;
    const kept = error.partialPath ? " The ".concat(error.rows, " complete rows received are in ").concat(error.partialPath, "; ").concat(outputPath, " was not written.") : " Nothing was written to ".concat(outputPath, ".");
    const next = error.partialPath ? resume(error, await unusedPath("".concat(outputPath.replace(/\.csv$/i, ""), "-rest.csv"), ".csv")) : rerun(outputPath);
    throw new CliError({
      ...error.problem,
      detail: "The ".concat(spec.what, " CSV stream failed after the export started: ").concat(error.problem.detail).concat(kept),
      hint: error.partialPath ? "Run the next command to export the rows that were not received; the complete rows already received stay in the partial file." : "Run the next command to start the export again.",
      next
    }, error.exitCode, error.warnings);
  }
  const receivedIndex = file.header.indexOf("received_at");
  const lastReceivedAt = receivedIndex >= 0 ? file.last?.[receivedIndex] : void 0;
  const data = {
    path: file.path,
    bytes: file.bytes,
    rows: file.rows,
    sha256: file.sha256,
    content_type: "text/csv",
    ...spec.range ? { from: spec.range.from, to: spec.range.to } : {},
    ...lastReceivedAt ? { last_received_at: lastReceivedAt } : {}
  };
  return {
    envelope: successEnvelope(data, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: humanLines("".concat(spec.what[0].toUpperCase()).concat(spec.what.slice(1), " exported"), [
      ["path", file.path],
      ["rows", String(file.rows)],
      ["bytes", String(file.bytes)],
      ["sha256", file.sha256],
      ["range", spec.range ? "".concat(spec.range.from, " to ").concat(spec.range.to) : void 0],
      ["last_received_at", lastReceivedAt]
    ])
  };
}

// dist/cli-commands/playback.js
var formatOption = () => new Option("--format <FORMAT>", "json (default), csv, xlsx or pdf").choices(["json", "csv", "xlsx", "pdf"]);
var outputOption = () => new Option("--output <FILE>", "File to write (with --format csv, xlsx or pdf); - writes a CSV to stdout instead of the envelope");
function registerPlaybackCommands(root, bind) {
  const playback = root.command("playback").description("Inspect playback records");
  addCommandNotes(playback, "Billing and limits:\n  Each JSON page and each CSV stream is one billed API request. playback plays\n  --all bills one request per page it follows. Every plays request and every\n  CSV export also spends the playback export budget (30 per minute per organization);\n  past it the answer is rate_limited (exit 7) with retry_after_seconds.");
  playback.command("list").description("List daily playback aggregates, or export them as CSV").option("--screen-id <ID>", "Filter playback by screen").option("--media-id <ID>", "Filter playback by media").option("--day <YYYY-MM-DD>", "Filter playback by UTC day").option("--day-from <YYYY-MM-DD>", "First UTC day, inclusive (not with --day); CSV defaults to 30 days before --day-to").option("--day-to <YYYY-MM-DD>", "Last UTC day, inclusive (not with --day); CSV defaults to today; at most 366 days").addOption(formatOption()).addOption(outputOption()).action(bind(handlePlaybackList));
  playback.command("plays").description("List per-play records (one row per visible start), or export them as CSV").option("--from <TIME>", "Inclusive start of received_at: RFC 3339, now, or an age such as 7d, 12h, 30m (default 24h before --to)", playsInstantOption("--from")).option("--to <TIME>", "Exclusive end of received_at: RFC 3339, now, or an age (default now); at most 31 days after --from", playsInstantOption("--to")).option("--screen-id <ID>", "Only plays on this screen").option("--media-id <ID>", "Only plays of this media").option("--tag <TAG>", "Only plays on screens that carried this tag when the play was received").option("--cursor <CURSOR>", "Continue from data.next_cursor of the previous page (same filters)", playsCursor).option("--limit <N>", "JSON rows per page, 1 to 1000 (server default 200)", playsLimit).option("--all", "Follow next_cursor to the end of the range (at most 50 pages, one billed request each)").addOption(formatOption()).addOption(outputOption()).action(bind(handlePlaybackPlays));
  const totals = playback.command("totals").description("Total plays per UTC day, or rank the busiest screens or media").addOption(new Option("--by <GROUPING>", "day (default) one row per day; screen or media ranks the busiest; screen_day the day series of the top screens").choices(["day", "screen", "media", "screen_day"])).option("--day-from <YYYY-MM-DD>", "First UTC day, inclusive (default 29 days before --day-to); at most 366 days, 92 with --screen-id, --media-id or a ranking").option("--day-to <YYYY-MM-DD>", "Last UTC day, inclusive (default today)").option("--screen-id <ID>", "With --by day: only this screen").option("--media-id <ID>", "With --by day: only this media").option("--top <N>", "Rows of a ranking, 1 to 100 (1 to 10 with --by screen_day; default 10)", positiveInteger("top")).addOption(reportFormatOption()).addOption(reportOutputOption("play-totals.FORMAT")).action(bind(handlePlaybackTotals));
  requireOptionGroup(totals, "atMostOne", ["--screen-id", "--media-id"]);
  requireOptionGroup(totals, "requires", ["--top", "--by"]);
  playback.command("completeness").description("How many numbered plays reached screenRIG per UTC day, and the gaps where plays went missing").option("--day-from <YYYY-MM-DD>", "First UTC day, inclusive (default 29 days before --day-to); at most 92 days").option("--day-to <YYYY-MM-DD>", "Last UTC day, inclusive (default today)").option("--screen-id <ID>", "Only this screen").option("--limit <N>", "Gaps to list, newest first, 1 to 500 (default 100)", positiveInteger("limit")).addOption(reportFormatOption()).addOption(reportOutputOption("play-completeness.FORMAT")).action(bind(handlePlaybackCompleteness));
}

// dist/alerts.js
var ALERT_ID_PATTERN = /^(?:(?:stage|qa|development)_)?alr_[A-Za-z0-9_-]{16,24}$/;
var ALERT_MUTE_ID_PATTERN = /^(?:(?:stage|qa|development)_)?amt_[A-Za-z0-9_-]{16,24}$/;
var ALERT_STATES = ["open", "resolved", "all"];
var ALERTS_LIMIT_MAX = 200;
var ALERTS_CURSOR_MAX = 200;
var ALERT_MUTES_MAX = 50;
var ALERT_MUTE_SCREENS_MAX = 100;
var ALERT_NOTE_MAX = 200;
function alertId(value, command) {
  if (!value)
    throw usageError("alerts ".concat(command, " requires <id>."));
  if (!ALERT_ID_PATTERN.test(value)) {
    throw usageError("An alert id looks like alr_ followed by 16 to 24 letters, digits, - or _.", {
      command: "screenrig alerts list",
      reason: "List this project's open alerts and their ids."
    });
  }
  return value;
}
function alertMuteId(value, command) {
  if (!value)
    throw usageError("alerts ".concat(command, " requires <mute-id>."));
  if (!ALERT_MUTE_ID_PATTERN.test(value)) {
    throw usageError("A mute id looks like amt_ followed by 16 to 24 letters, digits, - or _.", {
      command: "screenrig alerts mutes",
      reason: "List this project's current mutes and their ids."
    });
  }
  return value;
}
function alertsLimit(value) {
  const number = Number(value);
  if (!/^\d+$/.test(value) || number < 1 || number > ALERTS_LIMIT_MAX) {
    throw usageError("--limit must be a whole number from 1 to ".concat(ALERTS_LIMIT_MAX, "."));
  }
  return value;
}
function alertsCursor(value) {
  if (!value || [...value].length > ALERTS_CURSOR_MAX) {
    throw usageError("--before takes the data.next_cursor of a previous alerts list page.");
  }
  return value;
}
function alertScreenId(value) {
  if (!isResourceID(value, "screen")) {
    throw usageError("--screen-id takes a screen id (scr_\u2026).", {
      command: "screenrig screen list",
      reason: "List this project's screens and their ids."
    });
  }
  return value;
}
function alertMuteScreenIds(value, previous) {
  const ids = [...previous ? previous.split(",") : [], ...value.split(",").map((id) => id.trim())];
  if (ids.some((id) => !isResourceID(id, "screen"))) {
    throw usageError("--screen-id takes screen ids (scr_\u2026), repeated or comma-separated.", {
      command: "screenrig screen list",
      reason: "List this project's screens and their ids."
    });
  }
  if (new Set(ids).size !== ids.length)
    throw usageError("--screen-id lists a screen more than once.");
  if (ids.length > ALERT_MUTE_SCREENS_MAX)
    throw usageError("--screen-id accepts at most ".concat(ALERT_MUTE_SCREENS_MAX, " screens; mute a tag instead."));
  return ids.join(",");
}
function alertMuteTags(value, previous) {
  return fleetLinkTags(value, previous);
}
function alertNote(value) {
  if ([...value].length > ALERT_NOTE_MAX)
    throw usageError("--note must be at most ".concat(ALERT_NOTE_MAX, " characters."));
  return value;
}
var FOR_FORMS = "--for takes a duration such as 30m, 1h, 4h or 2d (up to 30 days).";
var UNTIL_FORMS = "--until takes an RFC 3339 instant with seconds and an offset, such as 2026-11-01T09:00:00Z or 2026-11-01T09:00:00-07:00.";
function alertForInstant(value, now) {
  const ms = snoozeDurationMs(value.trim());
  if (ms === void 0 || ms <= 0)
    throw usageError(FOR_FORMS);
  if (ms > NOTIFICATION_SNOOZE_MAX_MS) {
    throw usageError("--for must be under 30 days (at most 29d23h59m), leaving a minute for clock differences with the server. Use --until for an exact end.");
  }
  return new Date(now.getTime() + ms).toISOString().replace(/\.\d{3}Z$/, "Z");
}
function alertUntilInstant(value) {
  const instant = normalizeInstant(value.trim());
  if (instant === void 0)
    throw usageError(UNTIL_FORMS);
  return instant;
}
function alertForOption(value) {
  alertForInstant(value, /* @__PURE__ */ new Date(0));
  return value;
}
function alertUntilOption(value) {
  alertUntilInstant(value);
  return value;
}
function alertEnd(forValue, untilValue, now) {
  if (forValue === void 0 === (untilValue === void 0))
    throw usageError("Provide exactly one of --for or --until.");
  return forValue !== void 0 ? alertForInstant(forValue, now) : alertUntilInstant(untilValue);
}
function alertProblem(error, id) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  if (problem.next)
    return error;
  const withNext = (command, reason) => new CliError({ ...problem, next: { command, reason } }, error.exitCode, error.warnings);
  if (problem.code === "alert_not_open") {
    return withNext("screenrig alerts list", "".concat(id ? "Alert ".concat(id, " has resolved") : "The alert has resolved", ", so there is nothing to acknowledge or snooze. List the open alerts and pick one of those."));
  }
  if (problem.code === "alert_mute_limit_reached") {
    return withNext("screenrig alerts mutes", "An organization has at most ".concat(ALERT_MUTES_MAX, " current mutes across its projects. End one with screenrig alerts unmute MUTE_ID, or cover more screens with one mute by tag, then rerun mute. Nothing was created."));
  }
  if (problem.code === "not_found" && id !== void 0) {
    return ALERT_MUTE_ID_PATTERN.test(id) ? withNext("screenrig alerts mutes", "List the current mutes and their ids. A mute that has ended is no longer listed or found.") : withNext("screenrig alerts list --state all", "List the project's alerts and their ids. A resolved alert is kept only for the plan's event retention, so an old id is no longer found.");
  }
  return error;
}
var instantMs = (value) => {
  const ms = value === void 0 ? NaN : Date.parse(value);
  return Number.isFinite(ms) ? ms : void 0;
};
function durationText(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1e3));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  if (days > 0)
    return hours > 0 ? "".concat(days, "d ").concat(hours, "h") : "".concat(days, "d");
  if (hours > 0)
    return minutes > 0 ? "".concat(hours, "h ").concat(minutes, "m") : "".concat(hours, "h");
  if (minutes > 0)
    return "".concat(minutes, "m");
  return "".concat(seconds, "s");
}
function lasted(alert, now) {
  const since = instantMs(alert.since);
  const end = alert.state === "resolved" ? instantMs(alert.resolved_at) : now.getTime();
  return since === void 0 || end === void 0 ? void 0 : durationText(end - since);
}
function screenAlertStateText(alert, now) {
  if (alert.state !== "open")
    return alert.state;
  const parts = ["open"];
  if (alert.snoozed_until !== void 0) {
    parts.push((instantMs(alert.snoozed_until) ?? 0) > now.getTime() ? "snoozed until ".concat(alert.snoozed_until) : "snooze ended");
  } else if (alert.acknowledged_at !== void 0) {
    parts.push("acknowledged");
  }
  if (alert.muted)
    parts.push("muted");
  return parts.join(", ");
}
function clip(text, width) {
  const chars = [...text];
  return chars.length > width ? "".concat(chars.slice(0, width - 1).join(""), "\u2026") : text;
}
function actorText(actor) {
  const label = actor.kind === "person" || actor.kind === "agent" ? "".concat(actor.kind, " ").concat(actor.id) : actor.id;
  return actor.name ? "".concat(actor.name, " (").concat(label, ")") : label;
}
function when2(value, label) {
  return value ? ["".concat(label, ": ").concat(value)] : [];
}
function screenAlertLines(alert, now) {
  if (!alert)
    return [];
  const duration = lasted(alert, now);
  return [
    "id: ".concat(alert.id),
    "screen_id: ".concat(alert.screen_id),
    ...when2(alert.screen_name, "screen_name"),
    "condition: ".concat(alert.condition),
    "state: ".concat(alert.state),
    "since: ".concat(alert.since),
    ...duration ? ["for: ".concat(duration)] : [],
    "attention: ".concat(alert.attention),
    "muted: ".concat(alert.muted),
    ...when2(alert.acknowledged_at, "acknowledged_at"),
    ...alert.acknowledged_by ? ["acknowledged_by: ".concat(actorText(alert.acknowledged_by))] : [],
    ...when2(alert.snoozed_until, "snoozed_until"),
    ...when2(alert.resolved_at, "resolved_at")
  ];
}
function screenAlertTableLines(items, now, state) {
  if (!items.length)
    return [state === "all" ? "No alerts" : "No ".concat(state ?? "open", " alerts")];
  return table(["ID", "SCREEN", "CONDITION", "SINCE", "FOR", "STATE"], items.map((item) => [
    item.id ?? "",
    clip(item.screen_name ?? item.screen_id ?? "", 40),
    item.condition ?? "",
    item.since ?? "",
    lasted(item, now) ?? "",
    screenAlertStateText(item, now)
  ]));
}
function screenAlertCountsLine(counts) {
  if (!counts || typeof counts.open !== "number" || typeof counts.attention !== "number")
    return void 0;
  return "counts: ".concat(counts.open, " open, ").concat(counts.attention, " ").concat(counts.attention === 1 ? "needs" : "need", " attention");
}
function screenAlertListLines(page, now, query) {
  const items = Array.isArray(page?.items) ? page.items : [];
  const counts = screenAlertCountsLine(page?.counts);
  const next = typeof page?.next_cursor === "string" && page.next_cursor ? page.next_cursor : void 0;
  return [
    "Alerts (".concat(items.length, ")"),
    ...screenAlertTableLines(items, now, query.state),
    ...counts ? [counts] : [],
    ...next ? ["next: screenrig alerts list".concat(query.state ? " --state ".concat(query.state) : "").concat(query.screenId ? " --screen-id ".concat(query.screenId) : "", " --before ").concat(next).concat(query.limit ? " --limit ".concat(query.limit) : "")] : []
  ];
}
function alertMuteLines(mute) {
  if (!mute)
    return [];
  return [
    "id: ".concat(mute.id),
    "screen_ids: ".concat((mute.screen_ids ?? []).join(", ") || "(none)"),
    "tags: ".concat((mute.tags ?? []).join(", ") || "(none)"),
    "until: ".concat(mute.until),
    ...when2(mute.note, "note"),
    ...mute.created_by ? ["created_by: ".concat(actorText(mute.created_by))] : [],
    ...when2(mute.created_at, "created_at")
  ];
}
function listCell(values) {
  const list = values ?? [];
  return list.length > 3 ? "".concat(list.slice(0, 3).join(","), " +").concat(list.length - 3, " more") : list.join(",");
}
function alertMuteTableLines(items) {
  if (!items.length)
    return ["No current mutes"];
  return table(["ID", "UNTIL", "SCREENS", "TAGS", "BY", "NOTE"], items.map((item) => [
    item.id ?? "",
    item.until ?? "",
    listCell(item.screen_ids),
    listCell(item.tags),
    item.created_by ? item.created_by.name ?? item.created_by.id : "",
    clip(item.note ?? "", 60)
  ]));
}

// dist/handlers/alerts.js
var ALERTS_PATH = "/api/alerts";
var ALERT_MUTES_PATH = "/api/alert-mutes";
async function alertCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw alertProblem(error, id);
  }
}
var handleAlertsList = commandHandler(async (args, runtime, resolved) => {
  const state = flagString(args.flags, "state");
  const screenId = flagString(args.flags, "screen-id");
  const before = flagString(args.flags, "before");
  const limit = flagString(args.flags, "limit");
  const alertQuery = {
    ...state !== void 0 ? { state } : {},
    ...screenId !== void 0 ? { screen_id: alertScreenId(screenId) } : {},
    ...before !== void 0 ? { before: alertsCursor(before) } : {},
    ...limit !== void 0 ? { limit: alertsLimit(limit) } : {}
  };
  const file = await reportFileOf(args, runtime, resolved, ALERTS_PATH, alertQuery, "alerts", "alerts");
  if (file)
    return file;
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await alertCall(client, {
    method: "GET",
    path: ALERTS_PATH,
    query: alertQuery
  });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: screenAlertListLines(response.body, runtime.now(), { state, screenId, limit }).join("\n")
  };
});
var handleAlertsShow = commandHandler(async (args, runtime, resolved) => {
  const id = alertId(args.positionals[2], "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await alertCall(client, { method: "GET", path: "".concat(ALERTS_PATH, "/").concat(id) }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Alert", ...screenAlertLines(response.body, runtime.now())].join("\n")
  };
});
var handleAlertsAck = commandHandler(async (args, runtime, resolved) => {
  const id = alertId(args.positionals[2], "ack");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await alertCall(client, { method: "POST", path: "".concat(ALERTS_PATH, "/").concat(id, "/acknowledge"), idempotent: true }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Acknowledged alert ".concat(id, ". It stays acknowledged until it resolves."), ...screenAlertLines(response.body, runtime.now())].join("\n")
  };
});
var handleAlertsSnooze = commandHandler(async (args, runtime, resolved) => {
  const id = alertId(args.positionals[2], "snooze");
  const forValue = flagString(args.flags, "for");
  const until = alertEnd(forValue, flagString(args.flags, "until"), runtime.now());
  const body = { until };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await alertCall(client, {
    method: "POST",
    path: "".concat(ALERTS_PATH, "/").concat(id, "/acknowledge"),
    idempotent: true,
    body,
    ...forValue !== void 0 ? { recoverySupersede: JSON.stringify(["alerts snooze", id]) } : {}
  }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Snoozed alert ".concat(id, " until ").concat(until, ". It needs attention again then if it is still open."), ...screenAlertLines(response.body, runtime.now())].join("\n")
  };
});
var handleAlertsMute = commandHandler(async (args, runtime, resolved) => {
  const screenIds = flagString(args.flags, "screen-id");
  const tags = flagString(args.flags, "tag");
  const note = flagString(args.flags, "note");
  const forValue = flagString(args.flags, "for");
  if (screenIds === void 0 && tags === void 0)
    throw usageError("alerts mute requires --screen-id or --tag.");
  const body = {
    ...screenIds !== void 0 ? { screen_ids: screenIds.split(",") } : {},
    ...tags !== void 0 ? { tags: tags.split(",") } : {},
    until: alertEnd(forValue, flagString(args.flags, "until"), runtime.now()),
    ...note !== void 0 ? { note: alertNote(note) } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await alertCall(client, {
    method: "POST",
    path: ALERT_MUTES_PATH,
    idempotent: true,
    body,
    ...forValue !== void 0 ? { recoverySupersede: JSON.stringify(["alerts mute", body.screen_ids ?? [], body.tags ?? [], body.note ?? null]) } : {}
  });
  const created = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Created mute ".concat(created?.id ?? "").trimEnd(), ...alertMuteLines(created)].join("\n")
  };
});
var handleAlertsMutes = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await alertCall(client, { method: "GET", path: ALERT_MUTES_PATH });
  const items = response.body?.items;
  const list = Array.isArray(items) ? items : [];
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Mutes (".concat(list.length, ")"), ...alertMuteTableLines(list)].join("\n")
  };
});
var handleAlertsUnmute = commandHandler(async (args, runtime, resolved) => {
  const id = alertMuteId(args.positionals[2], "unmute");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await alertCall(client, { method: "DELETE", path: "".concat(ALERT_MUTES_PATH, "/").concat(id), idempotent: true }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: "Ended mute ".concat(id, ". Open alerts on its screens need attention again unless they are acknowledged or snoozed.")
  };
});

// dist/cli-commands/alerts.js
function registerAlertsCommands(root, bind) {
  const alerts = root.command("alerts").description("Triage open screen alerts: acknowledge, snooze or mute them");
  addCommandNotes(alerts, [
    "Alerts:",
    "  An alert is one screen and one condition while it lasts: it opens when the",
    "  condition begins (screen_offline, display_disconnected, running_hot,",
    "  storage_full, content_stuck, not_playing, loop_stalled, glass_blank or",
    "  glass_frozen) and resolves when it clears. A screen has at most one open",
    "  alert per condition; crashing is a notice, never an alert. Resolved alerts",
    "  stay for the plan's event retention. attention is true for an open alert",
    "  that is not acknowledged, snoozed or muted, the count the dashboard shows.",
    "  ack marks an open alert as handled until it resolves; snooze does so until a",
    "  time at most 30 days ahead, when it needs attention again if it is still",
    "  open. mute covers screens by id or tag until a time at most 30 days ahead,",
    "  for maintenance: their alerts still open and resolve, marked muted, and",
    "  never need attention. A notification (screenrig notifications) skips a",
    "  notice whose alert is acknowledged or snoozed while the notice is in its",
    "  hold, and every notice about a muted screen. An organization has at most 50",
    "  current mutes across its projects."
  ].join("\n"));
  alerts.command("list").description("List this project's screen alerts, open first, with the counts the dashboard shows").addOption(new Option("--state <STATE>", "Which alerts: open, resolved (kept for the plan's event retention) or all").choices(ALERT_STATES).default("open")).option("--screen-id <ID>", "Only this screen's alerts", alertScreenId).option("--before <CURSOR>", "Continue from the data.next_cursor of the previous page", alertsCursor).option("--limit <N>", "Alerts per page, 1 to 200 (server default 100)", alertsLimit).addOption(reportFormatOption()).addOption(reportOutputOption("alerts.FORMAT")).action(bind(handleAlertsList));
  alerts.command("show").description("Inspect one alert").argument("<id>", "Alert identifier").action(bind(handleAlertsShow));
  alerts.command("ack").description("Acknowledge an open alert until it resolves").argument("<id>", "Alert identifier").action(bind(handleAlertsAck));
  const snooze = alerts.command("snooze").description("Acknowledge an open alert until a time, when it needs attention again if still open").argument("<id>", "Alert identifier").addOption(new Option("--for <DURATION>", "Snooze this long from now, such as 30m, 4h or 2d (at most 29d23h59m)").argParser(alertForOption).conflicts(["until"])).addOption(new Option("--until <TIME>", "Snooze until this RFC 3339 instant, with seconds and an offset (at most 30 days ahead)").argParser(alertUntilOption).conflicts(["for"])).action(bind(handleAlertsSnooze));
  requireOptionGroup(snooze, "exactlyOne", ["--for", "--until"]);
  const mute = alerts.command("mute").description("Mute screens by id or tag for maintenance until a time").option("--screen-id <ID>", "Mute this screen (repeatable, or comma-separated; at most 100)", alertMuteScreenIds).option("--tag <TAG>", "Mute every screen carrying this tag when a notice falls due (repeatable, or comma-separated; at most 16)", alertMuteTags).addOption(new Option("--for <DURATION>", "Mute this long from now, such as 4h, 2d or 7d (at most 29d23h59m)").argParser(alertForOption).conflicts(["until"])).addOption(new Option("--until <TIME>", "Mute until this RFC 3339 instant, with seconds and an offset (at most 30 days ahead)").argParser(alertUntilOption).conflicts(["for"])).option("--note <TEXT>", "Say why, for the people who see the mute (at most 200 characters)", alertNote).action(bind(handleAlertsMute));
  requireOptionGroup(mute, "atLeastOne", ["--screen-id", "--tag"]);
  requireOptionGroup(mute, "exactlyOne", ["--for", "--until"]);
  alerts.command("mutes").description("List the current mutes, soonest end first").action(bind(handleAlertsMutes));
  alerts.command("unmute").description("End a mute now").argument("<mute-id>", "Mute identifier").action(bind(handleAlertsUnmute));
}

// dist/bundles/monitoring.js
function register(root, bind) {
  registerTriggersCommands(root, bind);
  registerOperationsCommands(root, bind);
  registerEventsCommands(root, bind);
  registerPlaybackCommands(root, bind);
  registerAlertsCommands(root, bind);
}
export {
  register
};
