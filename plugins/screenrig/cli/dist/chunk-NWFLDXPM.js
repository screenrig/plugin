import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  fleetLinkTags
} from "./chunk-UXMZL4AK.js";
import {
  table
} from "./chunk-CKOG7ZL3.js";
import {
  readAuthoringText
} from "./chunk-OFOJKZJN.js";
import {
  campaignAudienceJson,
  campaignAudienceText,
  campaignWindowSpec,
  normalizeInstant,
  tagList
} from "./chunk-D2RLMLYO.js";
import {
  CliError,
  usageError
} from "./chunk-JP4OQPAN.js";

// dist/notifications.js
var NOTIFICATION_ID_PATTERN = /^(?:(?:stage|qa|development)_)?(?:whk|ntf)_[A-Za-z0-9_-]{16,24}$/;
var NOTIFICATIONS_MAX = 50;
var NOTIFICATION_CHAT_CHANNELS = [
  { channel: "slack", flag: "slack" },
  { channel: "teams", flag: "teams" },
  { channel: "pagerduty", flag: "pagerduty" },
  { channel: "telegram", flag: "telegram" }
];
var DESTINATION_STDIN_MAX_BYTES = 4096;
var NOTIFICATION_CONDITIONS = ["screen_offline", "display_disconnected", "running_hot", "on_battery", "storage_full", "content_stuck", "not_playing", "loop_stalled", "glass_blank", "glass_frozen", "crashing", "source_failed", "source_stale", "reach_dropped", "group_empty", "card_data_stale"];
var NOTIFICATION_RECIPIENTS_MAX = 20;
var RECIPIENT_MAX_LENGTH = 200;
var NOTIFICATION_HOLD_MAX = 1440;
var NOTIFICATION_SNOOZE_MAX_MS = 30 * 864e5 - 6e4;
var NOTIFICATION_DELIVERY_CURSOR_PATTERN = /^whc[12]_[0-9a-z]{1,16}(_[a-z][a-z_]{0,39})?$/;
function notificationDeliveryCursor(value) {
  if (!NOTIFICATION_DELIVERY_CURSOR_PATTERN.test(value)) {
    throw usageError("--before takes the next_cursor of a previous notifications deliveries page (whc2_\u2026).");
  }
  return value;
}
var USER_ID_MAX_LENGTH = 200;
function notificationUserId(value) {
  if (!value || [...value].length > USER_ID_MAX_LENGTH || /\s/.test(value)) {
    throw usageError("--user takes a user id such as usr_\u2026: no spaces, at most ".concat(USER_ID_MAX_LENGTH, " characters. notifications show lists the people who unsubscribed."));
  }
  return value;
}
function notificationId(value, command) {
  if (!value)
    throw usageError("notifications ".concat(command, " requires <id>."));
  if (!NOTIFICATION_ID_PATTERN.test(value)) {
    throw usageError("A notification id looks like ntf_ (email, Slack, Teams, PagerDuty, Telegram) or whk_ (webhook) followed by 16 to 24 letters, digits, - or _.", {
      command: "screenrig notifications list",
      reason: "List this project's notifications and their ids."
    });
  }
  return value;
}
var NOTIFICATION_SEVERITIES = ["info", "warning", "error"];
var NOTIFICATION_AUDIENCE_INPUT_MAX_BYTES = 64 * 1024;
function notificationSeverityOverride(value, previous) {
  const pair = /^([a-z_]+)=([a-z]+)$/.exec(value.trim());
  const conditions = NOTIFICATION_CONDITIONS.join(", ");
  if (!pair)
    throw usageError("--severity takes CONDITION=LEVEL, such as not_playing=error (repeatable). Conditions: ".concat(conditions, ". Levels: ").concat(NOTIFICATION_SEVERITIES.join(", "), "."));
  const [, condition, level] = pair;
  if (!NOTIFICATION_CONDITIONS.includes(condition))
    throw usageError("--severity does not take the condition ".concat(JSON.stringify(condition), "; use ").concat(conditions, "."));
  if (!NOTIFICATION_SEVERITIES.includes(level))
    throw usageError("--severity does not take the level ".concat(JSON.stringify(level), "; use ").concat(NOTIFICATION_SEVERITIES.join(", "), "."));
  const pairs = [...previous ? previous.split(",") : [], "".concat(condition, "=").concat(level)];
  if (new Set(pairs.map((item) => item.split("=")[0])).size !== pairs.length)
    throw usageError("--severity names ".concat(condition, " more than once."));
  return pairs.join(",");
}
function notificationSeverityMap(accumulated) {
  return Object.fromEntries(accumulated.split(",").map((item) => item.split("=")));
}
function notificationReachDropScreens(value) {
  if (!/^\d+$/.test(value) || Number(value) < 1 || !Number.isSafeInteger(Number(value)))
    throw usageError("--reach-drop-screens takes a whole number of screens, 1 or more.");
  return value;
}
function notificationReachDropPercent(value) {
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 100)
    throw usageError("--reach-drop-percent takes a whole percent from 1 to 100.");
  return value;
}
function notificationReachDrop(screens, percent) {
  if (screens === void 0 && percent === void 0)
    return void 0;
  return { ...screens !== void 0 ? { screens: Number(screens) } : {}, ...percent !== void 0 ? { percent: Number(percent) } : {} };
}
function reachDropText(drop) {
  const parts = [...drop.screens !== void 0 ? ["at least ".concat(drop.screens, " ").concat(drop.screens === 1 ? "screen" : "screens")] : [], ...drop.percent !== void 0 ? ["at least ".concat(drop.percent, "% of the screens it reached when published")] : []];
  return parts.join(" and ") || "any drop";
}
function notificationAllTags(value, previous) {
  return tagList(value, previous, "--all-tags");
}
function notificationAnyTags(value, previous) {
  return tagList(value, previous, "--any-tag");
}
function notificationTimezone(value) {
  const zone = value.trim();
  let known = zone.length > 0 && zone.length <= 64 && !/\s/.test(zone);
  if (known) {
    try {
      new Intl.DateTimeFormat("en", { timeZone: zone });
    } catch {
      known = false;
    }
  }
  if (!known)
    throw usageError("--timezone takes an IANA timezone name, such as America/Los_Angeles, Europe/London or UTC.");
  return zone;
}
function notificationAudienceOption(value) {
  if (!value.trim() || value.trim() === "@")
    throw usageError("--audience takes a JSON rule, FILE to read it from a file, or - for stdin.");
  return value;
}
async function notificationAudienceText(raw, runtime) {
  const source = raw.trim();
  if (/^[\[{]/.test(source))
    return source;
  return readAuthoringText(source.startsWith("@") ? source.slice(1) : source, runtime, NOTIFICATION_AUDIENCE_INPUT_MAX_BYTES);
}
async function notificationAudience(raw, runtime) {
  return campaignAudienceJson(await notificationAudienceText(raw, runtime));
}
function notificationActiveHours(windows, timezone, outside, current) {
  const hours = windows ?? current?.windows;
  const zone = timezone ?? current?.timezone;
  if (hours === void 0)
    throw usageError("--timezone and --outside-hours change active hours; give --active-hours for a notification that has none.");
  if (zone === void 0)
    throw usageError("--active-hours needs --timezone ZONE, the zone its windows are read in, such as --timezone America/Los_Angeles.");
  const when2 = outside ?? current?.outside;
  return { timezone: zone, windows: hours, ...when2 !== void 0 ? { outside: when2 } : {} };
}
function notificationConditions(value) {
  const names = NOTIFICATION_CONDITIONS.join(", ");
  const conditions = value.split(",").map((item) => item.trim());
  if (conditions.some((item) => !item))
    throw usageError("--conditions takes comma-separated conditions with no empty entries: ".concat(names, "."));
  const unknown = conditions.find((item) => !NOTIFICATION_CONDITIONS.includes(item));
  if (unknown !== void 0)
    throw usageError("--conditions does not take ".concat(JSON.stringify(unknown), "; use ").concat(names, "."));
  if (new Set(conditions).size !== conditions.length)
    throw usageError("--conditions must not repeat a condition.");
  return conditions;
}
function notificationTelegramChat(value) {
  if (!/^(-?\d{1,20}|@[A-Za-z][A-Za-z0-9_]{4,31})$/.test(value)) {
    throw usageError("--telegram-chat takes a chat id such as -1001234567890 or a channel name such as @mychannel.");
  }
  return value;
}
async function notificationDestination(value, flag, runtime) {
  if (value !== "-")
    return value;
  const text = await readAuthoringText("-", runtime, DESTINATION_STDIN_MAX_BYTES);
  const line = text.split(/\r?\n/, 1)[0]?.trim() ?? "";
  if (!line)
    throw usageError("".concat(flag, " - reads the credential from one line of stdin, and stdin had none."));
  return line;
}
function notificationRecipients(value) {
  const recipients = value.split(",").map((item) => item.trim());
  if (recipients.some((item) => !item)) {
    throw usageError("--email takes comma-separated recipients with no empty entries: owner, or the user id of a project member.");
  }
  if (recipients.some((item) => [...item].length > RECIPIENT_MAX_LENGTH || /\s/.test(item))) {
    throw usageError("--email recipients are owner or a project member's user id: no spaces, at most ".concat(RECIPIENT_MAX_LENGTH, " characters each."));
  }
  if (new Set(recipients).size !== recipients.length)
    throw usageError("--email must not repeat a recipient.");
  if (recipients.length > NOTIFICATION_RECIPIENTS_MAX)
    throw usageError("--email takes at most ".concat(NOTIFICATION_RECIPIENTS_MAX, " recipients."));
  return recipients;
}
function notificationTags(value, previous) {
  return fleetLinkTags(value, previous);
}
function notificationHold(value) {
  if (!/^\d+$/.test(value) || Number(value) > NOTIFICATION_HOLD_MAX) {
    throw usageError("--hold must be a whole number of minutes from 0 to ".concat(NOTIFICATION_HOLD_MAX, "."));
  }
  return value;
}
var SNOOZE_FORMS = "--snooze takes a duration such as 30m, 1h, 4h or 2d (up to 30 days), an RFC 3339 instant with seconds and an offset such as 2026-11-01T09:00:00Z, or off.";
function snoozeDurationMs(text) {
  const match = /^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(text);
  if (!match || !text)
    return void 0;
  return (Number(match[1] ?? 0) * 86400 + Number(match[2] ?? 0) * 3600 + Number(match[3] ?? 0) * 60 + Number(match[4] ?? 0)) * 1e3;
}
function snoozedUntil(value, now) {
  const text = value.trim();
  if (text === "off")
    return null;
  const ms = snoozeDurationMs(text);
  if (ms !== void 0) {
    if (ms <= 0)
      throw usageError(SNOOZE_FORMS);
    if (ms > NOTIFICATION_SNOOZE_MAX_MS) {
      throw usageError("--snooze must be under 30 days (at most 29d23h59m), leaving a minute for clock differences with the server. Use an RFC 3339 instant for an exact end, or off to end a snooze.");
    }
    return new Date(now.getTime() + ms).toISOString().replace(/\.\d{3}Z$/, "Z");
  }
  const instant = normalizeInstant(text);
  if (instant === void 0)
    throw usageError(SNOOZE_FORMS);
  return instant;
}
function notificationSnooze(value) {
  snoozedUntil(value, /* @__PURE__ */ new Date(0));
  return value;
}
function notificationSecretWarning(id, action) {
  return {
    code: "webhook_secret_shown_once",
    message: action === "create" ? "data.secret is this webhook's signing secret and is shown only in this answer. Store it in the receiver's secret store now; screenrig does not save it in its config, logs, or recovery state. After an interrupted or ambiguous create, rerun the identical command within 24 hours to get this same answer and secret back. Replace a lost secret with screenrig notifications rotate-secret ".concat(id, ".") : "data.secret is the new signing secret and is shown only in this answer. Store it in the receiver's secret store now; screenrig does not save it. The previous secret stopped signing, but at most one attempt already in flight may still arrive signed with it, so accept both briefly. After an interrupted or ambiguous rotation, rerun the identical command within 24 hours to get this same secret back."
  };
}
function notificationProblem(error, id) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  if (problem.code === "webhook_url_rejected") {
    const reason = problem.detail.trim().replace(/\.$/, "");
    return new CliError({
      ...problem,
      detail: "The webhook URL was rejected: ".concat(reason, "."),
      next: problem.next ?? {
        command: id ? "screenrig notifications update ".concat(id, " --url https://HOST/PATH") : "screenrig notifications create --webhook https://HOST/PATH --conditions screen_offline",
        reason: "Use an https URL on port 443 (the default) or 8443 whose host resolves only to public Internet addresses. Nothing was created or changed."
      }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "notification_destination_rejected") {
    const reason = problem.detail.trim().replace(/\.$/, "");
    return new CliError({
      ...problem,
      detail: "The destination was rejected: ".concat(reason, ". Nothing was created or changed."),
      next: problem.next ?? {
        command: id ? "screenrig notifications update ".concat(id, " --destination -") : "screenrig notifications create --slack - --conditions screen_offline",
        reason: "Pipe the credential exactly as Slack, Teams, PagerDuty or Telegram issued it on stdin, so it stays out of your shell history."
      }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "notification_limit_reached") {
    return new CliError({
      ...problem,
      detail: "This organization already has the maximum of ".concat(NOTIFICATIONS_MAX, " notifications of every channel together, across its projects. Nothing was created."),
      next: problem.next ?? {
        command: "screenrig notifications list",
        reason: "Delete a notification you no longer need with screenrig notifications delete ID, then rerun create."
      }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "revision_conflict" && id && !problem.next) {
    return new CliError({
      ...problem,
      next: { command: "screenrig notifications show ".concat(id), reason: "Read the current revision and state, then rerun with --expect-rev REVISION if the change still applies." }
    }, error.exitCode, error.warnings);
  }
  return error;
}
function when(value, label) {
  return value ? ["".concat(label, ": ").concat(value)] : [];
}
var READ_ONLY_URL = "withheld from a Read only credential. A Manage sign-in (screenrig login --access manage) receives it.";
function withheld(notification) {
  return notification.url_redacted === true && !notification.url;
}
function severityText(severity) {
  return Object.entries(severity ?? {}).map(([condition, level]) => "".concat(condition, "=").concat(level)).join(", ");
}
function activeHoursText(hours) {
  const windows = (hours.windows ?? []).map(campaignWindowSpec).join("; ");
  return "".concat(hours.timezone, " ").concat(windows, " (outside the hours: ").concat(hours.outside ?? "hold", ")");
}
function ruleLines(notification) {
  return [
    ...notification.min_severity ? ["min_severity: ".concat(notification.min_severity)] : [],
    ...severityText(notification.severity) ? ["severity: ".concat(severityText(notification.severity))] : [],
    ...notification.active_hours ? ["active_hours: ".concat(activeHoursText(notification.active_hours))] : [],
    ...notification.reach_drop ? ["reach_drop: ".concat(reachDropText(notification.reach_drop))] : []
  ];
}
function notificationLines(notification) {
  if (!notification)
    return [];
  return [
    "id: ".concat(notification.id),
    "channel: ".concat(notification.channel),
    ...notification.recipients ? ["recipients: ".concat(notification.recipients.join(", "))] : [],
    ...notification.unsubscribed?.length ? ["unsubscribed: ".concat(notification.unsubscribed.length, " (").concat(notification.unsubscribed.map((person) => person.user_id).join(", "), "; notifications resubscribe ").concat(notification.id, " --user USER_ID mails one again)")] : [],
    ...notification.destination_hint ? ["destination: ".concat(notification.destination_hint, " (the credential is sealed and never shown)")] : [],
    ...notification.telegram_chat_id ? ["telegram_chat: ".concat(notification.telegram_chat_id)] : [],
    ...notification.url !== void 0 || notification.url_redacted ? ["url: ".concat(withheld(notification) ? READ_ONLY_URL : notification.url ?? "")] : [],
    "conditions: ".concat((notification.conditions ?? []).join(", ") || "none"),
    ...notification.event_types?.length ? ["event_types: ".concat(notification.event_types.join(", "))] : [],
    ...notification.audience ? ["audience: ".concat(campaignAudienceText(notification.audience))] : ["screen_tags: ".concat((notification.screen_tags ?? []).join(", ") || "(every screen)")],
    ...ruleLines(notification),
    "hold_minutes: ".concat(notification.hold_minutes),
    "enabled: ".concat(notification.enabled),
    "status: ".concat(notification.status),
    "revision: ".concat(notification.revision),
    ...when(notification.description, "description"),
    ...when(notification.snoozed_until, "snoozed_until"),
    ...when(notification.failing_since, "failing_since"),
    ...when(notification.disabled_reason, "disabled_reason"),
    ...when(notification.disabled_at, "disabled_at"),
    ...when(notification.last_success_at, "last_success_at"),
    ...when(notification.last_failure_at, "last_failure_at")
  ];
}
function destination(notification) {
  if (notification.recipients)
    return notification.recipients.join(",");
  if (notification.destination_hint)
    return notification.telegram_chat_id ? "".concat(notification.destination_hint, " -> ").concat(notification.telegram_chat_id) : notification.destination_hint;
  return withheld(notification) ? "(withheld)" : notification.url ?? "";
}
function rulesCell(item) {
  return [
    ...item.min_severity ? ["min ".concat(item.min_severity)] : [],
    ...severityText(item.severity) ? ["severity ".concat(severityText(item.severity).replaceAll(", ", ","))] : [],
    ...item.active_hours ? ["hours ".concat(activeHoursText(item.active_hours))] : [],
    ...item.reach_drop ? ["reach drop ".concat(reachDropText(item.reach_drop))] : [],
    ...item.audience ? ["audience ".concat(campaignAudienceText(item.audience))] : []
  ].join("; ");
}
function notificationTableLines(items) {
  if (!items.length)
    return ["No notifications"];
  const snoozed = items.some((item) => item.snoozed_until);
  const rules = items.some((item) => rulesCell(item) !== "");
  const events = items.some((item) => item.event_types?.length);
  const unsubscribed = items.some((item) => item.unsubscribed?.length);
  const lines = table(["ID", "CHANNEL", "STATUS", "ENABLED", ...snoozed ? ["SNOOZED_UNTIL"] : [], "CONDITIONS", ...events ? ["EVENTS"] : [], ...rules ? ["RULES"] : [], "TO", ...unsubscribed ? ["UNSUBSCRIBED"] : []], items.map((item) => [
    item.id ?? "",
    item.channel ?? "",
    item.status ?? "",
    String(item.enabled),
    ...snoozed ? [item.snoozed_until ?? ""] : [],
    (item.conditions ?? []).join(","),
    ...events ? [(item.event_types ?? []).join(",")] : [],
    ...rules ? [rulesCell(item)] : [],
    destination(item),
    ...unsubscribed ? [String(item.unsubscribed?.length ?? 0)] : []
  ]));
  return items.some(withheld) ? [...lines, "", "URLs: withheld from a Read only credential. A Manage sign-in (screenrig login --access manage) receives them."] : lines;
}
function deliveryGroupCell(item) {
  const group = item.group;
  if (group !== void 0) {
    const screens = "".concat(group.count, " ").concat(group.count === 1 ? "screen" : "screens");
    return "".concat(group.id, ": ").concat(screens, " \xB7 ").concat(group.attribute === "many_networks" ? group.value : "".concat(group.attribute, " ").concat(group.value));
  }
  return item.group_id === void 0 || item.group_id === "" ? void 0 : item.group_id;
}
function notificationDeliveryTableLines(items) {
  if (!items.length)
    return ["No deliveries"];
  const columns = [
    ["ID", (item) => item.id ?? "", true],
    ["EVENT_TYPE", (item) => "".concat(item.event_type ?? "").concat(item.test ? " (test)" : ""), true],
    ["CONDITION", (item) => item.condition, false],
    ["PHASE", (item) => item.phase, false],
    ["SCREEN", (item) => item.screen_name ?? item.screen_id, false],
    ["GROUP", deliveryGroupCell, false],
    ["AUDIENCE_GROUP", (item) => item.audience_group, false],
    ["STATE", (item) => item.state ?? "", true],
    ["ATTEMPTS", (item) => String(item.attempts ?? 0), true],
    ["LAST_STATUS", (item) => item.last_status === void 0 ? "" : String(item.last_status), true],
    ["LAST_ERROR", (item) => item.last_error ?? "", true],
    ["EMAILED", (item) => item.emailed === void 0 ? void 0 : String(item.emailed), false],
    ["CREATED_AT", (item) => item.created_at ?? "", true]
  ];
  const shown = columns.filter(([, cell, always]) => always || items.some((item) => cell(item) !== void 0));
  return table(shown.map(([name]) => name), items.map((item) => shown.map(([, cell]) => cell(item) ?? "")));
}

export {
  NOTIFICATION_ID_PATTERN,
  NOTIFICATION_CHAT_CHANNELS,
  NOTIFICATION_CONDITIONS,
  NOTIFICATION_SNOOZE_MAX_MS,
  notificationDeliveryCursor,
  notificationUserId,
  notificationId,
  NOTIFICATION_SEVERITIES,
  notificationSeverityOverride,
  notificationSeverityMap,
  notificationReachDropScreens,
  notificationReachDropPercent,
  notificationReachDrop,
  notificationAllTags,
  notificationAnyTags,
  notificationTimezone,
  notificationAudienceOption,
  notificationAudience,
  notificationActiveHours,
  notificationConditions,
  notificationTelegramChat,
  notificationDestination,
  notificationRecipients,
  notificationTags,
  notificationHold,
  snoozeDurationMs,
  snoozedUntil,
  notificationSnooze,
  notificationSecretWarning,
  notificationProblem,
  notificationLines,
  notificationTableLines,
  notificationDeliveryTableLines
};
