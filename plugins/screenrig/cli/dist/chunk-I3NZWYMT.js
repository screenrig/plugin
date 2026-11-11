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
  flagBool,
  flagString,
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

// dist/webhook-verify.js
var WEBHOOK_VERIFY_VENDORS = ["github", "stripe", "shopify", "slack", "linear", "vercel", "asana", "generic_hmac"];
var WEBHOOK_HANDSHAKES = ["microsoft_graph", "monday", "trello", "azure_event_grid"];
var WEBHOOK_VERIFY_ENCODINGS = ["hex", "base64"];
var SECRET_FILE_MAX_BYTES = 4096;
var SECRET_MAX_CHARACTERS = 512;
var HEADER_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
var WEBHOOK_VERIFY_TOLERANCE_MIN_S = 1;
var WEBHOOK_VERIFY_TOLERANCE_MAX_S = 86400;
var VERIFY_FLAGS = ["verify", "verify-secret-file", "verify-header", "verify-encoding", "verify-timestamp-header", "verify-tolerance", "handshake", "clear-verify", "clear-handshake"];
function verifyHeaderOption(flag) {
  return (value) => {
    if (!HEADER_PATTERN.test(value))
      throw usageError("".concat(flag, " takes a header name of 1 to 100 letters, digits, - or _, such as X-Acme-Signature."));
    return value;
  };
}
function verifyToleranceOption(value) {
  if (!/^\d+$/.test(value) || Number(value) < WEBHOOK_VERIFY_TOLERANCE_MIN_S || Number(value) > WEBHOOK_VERIFY_TOLERANCE_MAX_S) {
    throw usageError("--verify-tolerance takes whole seconds from ".concat(WEBHOOK_VERIFY_TOLERANCE_MIN_S, " to ").concat(WEBHOOK_VERIFY_TOLERANCE_MAX_S, ", such as 300."));
  }
  return value;
}
async function readVerifySecret(file, runtime) {
  const where = file === "-" ? "stdin" : file;
  const secret = (await readAuthoringText(file, runtime, SECRET_FILE_MAX_BYTES)).replace(/(?:\r?\n)+$/, "");
  if (!secret.trim())
    throw usageError("".concat(where, " holds no secret."));
  if (new RegExp("\\p{Cc}", "u").test(secret))
    throw usageError("".concat(where, " must hold only the vendor's secret: one line of text without control characters."));
  if ([...secret].length > SECRET_MAX_CHARACTERS)
    throw usageError("The secret in ".concat(where, " is longer than ").concat(SECRET_MAX_CHARACTERS, " characters."));
  return secret;
}
function verifyFlagsGiven(args) {
  return VERIFY_FLAGS.filter((name) => args.flags[name] !== void 0).map((name) => "--".concat(name));
}
function singleStdin(inputs) {
  const reading = inputs.filter(([, value]) => value === "-").map(([flag]) => flag);
  if (reading.length > 1)
    throw usageError("".concat(reading.join(" and "), " cannot both read stdin: give one of them a file."));
}
async function verifyMembers(args, runtime, options) {
  const members = {};
  const vendor = flagString(args.flags, "verify");
  const secretFile = flagString(args.flags, "verify-secret-file");
  const header = flagString(args.flags, "verify-header");
  const encoding = flagString(args.flags, "verify-encoding");
  const timestampHeader = flagString(args.flags, "verify-timestamp-header");
  const tolerance = flagString(args.flags, "verify-tolerance");
  const handshake = flagString(args.flags, "handshake");
  if (flagBool(args.flags, "clear-verify"))
    members.verify = null;
  if (flagBool(args.flags, "clear-handshake"))
    members.handshake = null;
  if (handshake !== void 0)
    members.handshake = handshake;
  if (vendor === void 0) {
    const stray = ["verify-secret-file", "verify-header", "verify-encoding", "verify-timestamp-header", "verify-tolerance"].find((name) => flagString(args.flags, name) !== void 0);
    if (stray !== void 0)
      throw usageError("--".concat(stray, " describes the vendor named by --verify: add --verify VENDOR."));
    return members;
  }
  const generic = vendor === "generic_hmac";
  if (!generic) {
    const stray = [["verify-header", header], ["verify-encoding", encoding], ["verify-timestamp-header", timestampHeader], ["verify-tolerance", tolerance]].find(([, value]) => value !== void 0);
    if (stray)
      throw usageError("--".concat(stray[0], " applies to --verify generic_hmac, the sender that signs with an HMAC of your choosing."));
  } else if (header === void 0) {
    throw usageError("--verify generic_hmac needs --verify-header NAME: the header that carries the signature.");
  }
  if (tolerance !== void 0 && timestampHeader === void 0)
    throw usageError("--verify-tolerance applies with --verify-timestamp-header: it is how far the timestamp may sit from the server's clock.");
  if (vendor === "asana") {
    if (secretFile !== void 0)
      throw usageError("--verify asana takes no secret: Asana's handshake delivers it when the webhook is created at Asana, and screenRIG keeps it sealed.");
  } else if (secretFile === void 0 && options.create) {
    throw usageError("--verify ".concat(vendor, " needs --verify-secret-file FILE (or - for stdin): the secret ").concat(generic ? "your sender signs with" : "".concat(vendorName(vendor), " shows"), ", so ").concat(options.subject, " can check its signature."));
  }
  members.verify = {
    vendor,
    ...secretFile !== void 0 ? { secret: await readVerifySecret(secretFile, runtime) } : {},
    ...header !== void 0 ? { header } : {},
    ...encoding !== void 0 ? { encoding } : {},
    ...timestampHeader !== void 0 ? { timestamp_header: timestampHeader } : {},
    ...tolerance !== void 0 ? { tolerance_seconds: Number(tolerance) } : {}
  };
  return members;
}
function vendorName(vendor) {
  switch (vendor) {
    case "github":
      return "GitHub";
    case "stripe":
      return "Stripe";
    case "shopify":
      return "Shopify";
    case "slack":
      return "Slack";
    case "linear":
      return "Linear";
    case "vercel":
      return "Vercel";
    case "asana":
      return "Asana";
    case "generic_hmac":
      return "the sender";
  }
}
function verifyText(verify) {
  if (!verify)
    return "";
  const parts = [verify.vendor];
  if (verify.vendor === "generic_hmac") {
    parts.push("header ".concat(verify.header ?? "?"), verify.encoding ?? "hex");
    if (verify.timestamp_header)
      parts.push("timestamp ".concat(verify.timestamp_header, " within ").concat(verify.tolerance_seconds ?? 300, "s"));
  }
  const secret = verify.secret;
  parts.push(secret?.set ? "secret held".concat(secret.hint ? " (".concat(secret.hint, ")") : "") : verify.vendor === "asana" ? "waiting for Asana's handshake: events are refused until it arrives" : "secret not held");
  return parts.join(", ");
}
function verifyLines(verify, handshake) {
  return [
    ...verify ? ["verify: ".concat(verifyText(verify))] : [],
    ...handshake ? ["handshake: ".concat(handshake)] : []
  ];
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
  notificationDeliveryTableLines,
  WEBHOOK_VERIFY_VENDORS,
  WEBHOOK_HANDSHAKES,
  WEBHOOK_VERIFY_ENCODINGS,
  verifyHeaderOption,
  verifyToleranceOption,
  verifyFlagsGiven,
  singleStdin,
  verifyMembers,
  verifyLines
};
