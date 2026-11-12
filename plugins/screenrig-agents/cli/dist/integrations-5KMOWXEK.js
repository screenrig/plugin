import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  CONNECTION_ID_PATTERN,
  connectionIdOption,
  readServiceAccountKey
} from "./chunk-23UOURHR.js";
import {
  NOTIFICATION_CHAT_CHANNELS,
  NOTIFICATION_CONDITIONS,
  NOTIFICATION_ID_PATTERN,
  NOTIFICATION_SEVERITIES,
  notificationActiveHours,
  notificationAllTags,
  notificationAnyTags,
  notificationAudience,
  notificationAudienceOption,
  notificationConditions,
  notificationDeliveryCursor,
  notificationDeliveryTableLines,
  notificationDestination,
  notificationHold,
  notificationId,
  notificationLines,
  notificationProblem,
  notificationReachDrop,
  notificationReachDropPercent,
  notificationReachDropScreens,
  notificationRecipients,
  notificationSecretWarning,
  notificationSeverityMap,
  notificationSeverityOverride,
  notificationSnooze,
  notificationTableLines,
  notificationTags,
  notificationTelegramChat,
  notificationTimezone,
  notificationUserId,
  singleStdin,
  snoozeDurationMs,
  snoozedUntil
} from "./chunk-5NRO4BUB.js";
import "./chunk-ZGNMAAZS.js";
import {
  subcommand
} from "./chunk-QUFYJQPR.js";
import {
  WEBHOOK_ID_PATTERN,
  deliveryTableLines,
  table,
  webhookDeliveriesLimit,
  webhookDeliveryCursor,
  webhookDescription,
  webhookEventTypes,
  webhookId,
  webhookLines,
  webhookProblem,
  webhookSecretWarning,
  webhookTableLines,
  webhookUrl
} from "./chunk-CKOG7ZL3.js";
import {
  readAuthoringText
} from "./chunk-OFOJKZJN.js";
import {
  Option,
  reportFormatOption,
  reportOutputOption,
  revision
} from "./chunk-423MNWKW.js";
import {
  clientFor,
  commandHandler,
  humanLines,
  jsonBody,
  quotedRevision,
  reportFileOf,
  requireToken,
  webhookRevisionHeaders,
  writeRecoveries
} from "./chunk-AOLD7THY.js";
import "./chunk-UD3J3FNQ.js";
import "./chunk-V63J3UTW.js";
import "./chunk-XWMHWXE7.js";
import {
  campaignAnyTagAudience,
  campaignTagAudience,
  campaignWindowList,
  flagBool,
  flagString,
  successEnvelope,
  weeklyWindows
} from "./chunk-V5GOKJGU.js";
import "./chunk-7EJTDXNL.js";
import "./chunk-BFLHHH47.js";
import "./chunk-P3D5NU6C.js";
import "./chunk-SFYZH3GR.js";
import {
  addCommandExamples,
  addCommandNotes,
  requireOptionGroup
} from "./chunk-IBLNZ4EM.js";
import {
  CliError,
  ExitCode,
  makeProblem,
  usageError
} from "./chunk-JP4OQPAN.js";
import "./chunk-3FYAGULW.js";

// dist/handlers/webhooks.js
var WEBHOOKS_PATH = "/api/webhooks";
async function webhookCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw webhookProblem(error, id);
  }
}
async function webhookWithSecret(body, action, runtime) {
  const webhook = body;
  if (!webhook || typeof webhook.id !== "string" || typeof webhook.secret !== "string" || !webhook.secret) {
    await writeRecoveries.get(runtime)?.finish();
    const id = webhook && typeof webhook.id === "string" && WEBHOOK_ID_PATTERN.test(webhook.id) ? webhook.id : void 0;
    throw new CliError(makeProblem("unexpected_response", "Unexpected response", 502, "The ".concat(action === "create" ? "webhook create" : "rotate-secret", " request completed, but its answer did not carry a signing secret. Do not rerun it."), {
      next: id ? { command: "screenrig webhooks rotate-secret ".concat(id), reason: "Issue a new signing secret; it is shown once in data.secret." } : { command: "screenrig webhooks list", reason: "Find the webhook, then run screenrig webhooks rotate-secret ID to receive a new signing secret." }
    }), ExitCode.Unexpected);
  }
  return webhook;
}
async function webhookSecretResult(response, client, action, runtime) {
  const webhook = await webhookWithSecret(response.body, action, runtime);
  const warning = webhookSecretWarning(webhook.id, action);
  return {
    envelope: jsonBody(response, client.requestId, void 0, [warning]),
    exitCode: ExitCode.Success,
    human: [
      action === "create" ? "Created webhook ".concat(webhook.id) : "Rotated the signing secret of webhook ".concat(webhook.id),
      ...webhookLines(webhook),
      "secret: ".concat(webhook.secret),
      "warning: ".concat(warning.message)
    ].join("\n"),
    keepRecoveryUntilOutput: true
  };
}
var handleWebhooksCreate = commandHandler(async (args, runtime, resolved) => {
  const url = webhookUrl(flagString(args.flags, "url") ?? "");
  const eventTypes = webhookEventTypes(flagString(args.flags, "event-types") ?? "");
  const description = flagString(args.flags, "description");
  const body = {
    url,
    event_types: eventTypes,
    ...flagBool(args.flags, "disabled") ? { enabled: false } : {},
    ...description !== void 0 ? { description: webhookDescription(description) } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await webhookCall(client, { method: "POST", path: WEBHOOKS_PATH, idempotent: true, body });
  return webhookSecretResult(response, client, "create", runtime);
});
var handleWebhooksList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await webhookCall(client, { method: "GET", path: WEBHOOKS_PATH });
  const items = response.body?.items;
  const list = Array.isArray(items) ? items : [];
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Webhooks (".concat(list.length, ")"), ...webhookTableLines(list)].join("\n")
  };
});
var handleWebhooksShow = commandHandler(async (args, runtime, resolved) => {
  const id = webhookId(args.positionals[2], "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await webhookCall(client, { method: "GET", path: "".concat(WEBHOOKS_PATH, "/").concat(id) }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Webhook", ...webhookLines(response.body)].join("\n")
  };
});
var handleWebhooksUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = webhookId(args.positionals[2], "update");
  const url = flagString(args.flags, "url");
  const eventTypes = flagString(args.flags, "event-types");
  const description = flagString(args.flags, "description");
  const patch = {
    ...url !== void 0 ? { url: webhookUrl(url) } : {},
    ...eventTypes !== void 0 ? { event_types: webhookEventTypes(eventTypes) } : {},
    ...description !== void 0 ? { description: webhookDescription(description) } : {},
    ...flagBool(args.flags, "clear-description") ? { description: "" } : {},
    ...flagBool(args.flags, "enable") ? { enabled: true } : {},
    ...flagBool(args.flags, "disable") ? { enabled: false } : {}
  };
  if (!Object.keys(patch).length) {
    throw usageError("webhooks update requires at least one of --url, --event-types, --description, --clear-description, --enable, or --disable.");
  }
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await webhookCall(client, {
    method: "PATCH",
    path: "".concat(WEBHOOKS_PATH, "/").concat(id),
    idempotent: true,
    body: patch,
    headers: webhookRevisionHeaders(args)
  }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Updated webhook ".concat(id), ...webhookLines(response.body)].join("\n")
  };
});
var handleWebhooksDelete = commandHandler(async (args, runtime, resolved) => {
  const id = webhookId(args.positionals[2], "delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await webhookCall(client, {
    method: "DELETE",
    path: "".concat(WEBHOOKS_PATH, "/").concat(id),
    idempotent: true,
    headers: webhookRevisionHeaders(args)
  }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: "Deleted webhook ".concat(id, ". Its pending deliveries fail with webhook_deleted.")
  };
});
var handleWebhooksRotateSecret = commandHandler(async (args, runtime, resolved) => {
  const id = webhookId(args.positionals[2], "rotate-secret");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await webhookCall(client, {
    method: "POST",
    path: "".concat(WEBHOOKS_PATH, "/").concat(id, "/rotate-secret"),
    idempotent: true,
    headers: webhookRevisionHeaders(args)
  }, id);
  return webhookSecretResult(response, client, "rotate", runtime);
});
var handleWebhooksTest = commandHandler(async (args, runtime, resolved) => {
  const id = webhookId(args.positionals[2], "test");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await webhookCall(client, { method: "POST", path: "".concat(WEBHOOKS_PATH, "/").concat(id, "/test"), idempotent: true }, id);
  const delivery = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: humanLines("Queued a test delivery to webhook ".concat(id), [
      ["delivery_id", delivery?.id],
      ["event_type", delivery?.event_type],
      ["event_id", delivery?.event_id],
      ["state", delivery?.state],
      ["next", "screenrig webhooks deliveries ".concat(id, " --limit 1 shows its outcome; a test is attempted once, without retries.")]
    ])
  };
});
var handleWebhooksDeliveries = commandHandler(async (args, runtime, resolved) => {
  const id = webhookId(args.positionals[2], "deliveries");
  const before = flagString(args.flags, "before");
  const limit = flagString(args.flags, "limit");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await webhookCall(client, {
    method: "GET",
    path: "".concat(WEBHOOKS_PATH, "/").concat(id, "/deliveries"),
    query: {
      ...before !== void 0 ? { before: webhookDeliveryCursor(before) } : {},
      ...limit !== void 0 ? { limit: webhookDeliveriesLimit(limit) } : {}
    }
  }, id);
  const page = response.body;
  const items = Array.isArray(page?.items) ? page.items : [];
  const next = typeof page?.next_cursor === "string" ? page.next_cursor : void 0;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Webhook ".concat(id, " deliveries (").concat(items.length, ")"),
      ...deliveryTableLines(items),
      ...next ? ["next: screenrig webhooks deliveries ".concat(id, " --before ").concat(next).concat(limit ? " --limit ".concat(limit) : "")] : []
    ].join("\n")
  };
});

// dist/cli-commands/webhooks.js
var eventTypesOption = (value) => {
  webhookEventTypes(value);
  return value;
};
var urlOption = (value) => webhookUrl(value);
var cursorOption = (value) => webhookDeliveryCursor(value);
function registerWebhooksCommands(root, bind) {
  const webhooks = root.command("webhooks").description("Send this project's events to your HTTPS endpoints as signed POSTs");
  addCommandNotes(webhooks, 'Webhooks:\n  An organization has at most 50 notifications across its projects, email and webhook together. Each\n  matching project event is POSTed as the same JSON object events list returns,\n  signed with ScreenRig-Signature t=<unix>,v1=<hex HMAC-SHA256 over\n  "<t>.<raw body>">. The secret is printed only by create and rotate-secret.\n  Delivery is at least once and unordered; deduplicate on ScreenRig-Event-Id.\n  Email and screen alerts (offline, display disconnected, running hot, on battery, storage\n  full, content stuck, not playing, crashing) are screenrig notifications.');
  webhooks.command("create").description("Register an HTTPS endpoint and print its signing secret once").requiredOption("--url <URL>", "https URL on a public Internet host, port 443 or 8443 (required)", urlOption).requiredOption("--event-types <TYPES>", "Comma-separated event types (screen.online) or prefixes (screen.*) (required)", eventTypesOption).option("--description <TEXT>", "Describe the endpoint (at most 200 characters)", webhookDescription).option("--disabled", "Create it disabled; nothing is delivered until webhooks update --enable").action(bind(handleWebhooksCreate));
  webhooks.command("list").description("List this project's webhooks (never their secrets)").action(bind(handleWebhooksList));
  webhooks.command("show").description("Inspect a webhook and its delivery health").argument("<id>", "Webhook identifier").action(bind(handleWebhooksShow));
  const update = webhooks.command("update").description("Change a webhook's URL, event types, description, or enabled state").argument("<id>", "Webhook identifier").option("--url <URL>", "Replace the https URL; checked like create", urlOption).option("--event-types <TYPES>", "Replace the comma-separated event types or prefixes", eventTypesOption).addOption(new Option("--description <TEXT>", "Replace the description (at most 200 characters)").argParser(webhookDescription).conflicts(["clearDescription"])).addOption(new Option("--clear-description", "Remove the description").conflicts(["description"])).addOption(new Option("--enable", "Enable delivery; clears failure state and starts at the current event").conflicts(["disable"])).addOption(new Option("--disable", "Disable delivery; pending deliveries fail with webhook_disabled").conflicts(["enable"])).option("--expect-rev <REVISION>", "Optionally require this webhook revision", revision).action(bind(handleWebhooksUpdate));
  requireOptionGroup(update, "atLeastOne", ["--url", "--event-types", "--description", "--clear-description", "--enable", "--disable"]);
  webhooks.command("delete").description("Delete a webhook; its pending deliveries fail").argument("<id>", "Webhook identifier").option("--expect-rev <REVISION>", "Optionally require this webhook revision", revision).action(bind(handleWebhooksDelete));
  webhooks.command("rotate-secret").description("Replace a webhook's signing secret and print the new one once").argument("<id>", "Webhook identifier").option("--expect-rev <REVISION>", "Optionally require this webhook revision", revision).action(bind(handleWebhooksRotateSecret));
  webhooks.command("test").description("Queue one webhook.test delivery to this webhook only").argument("<id>", "Webhook identifier").action(bind(handleWebhooksTest));
  webhooks.command("deliveries").description("Read a webhook's delivery log, newest event first").argument("<id>", "Webhook identifier").option("--before <CURSOR>", "Continue from the next_cursor of the previous page", cursorOption).option("--limit <N>", "Rows per page, 1 to 200 (server default 50)", webhookDeliveriesLimit).action(bind(handleWebhooksDeliveries));
}

// dist/handlers/notifications.js
var NOTIFICATIONS_PATH = "/api/notifications";
async function notificationCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw notificationProblem(error, id);
  }
}
async function notificationWithSecret(body, action, runtime) {
  const notification = body;
  if (!notification || typeof notification.id !== "string" || typeof notification.secret !== "string" || !notification.secret) {
    await writeRecoveries.get(runtime)?.finish();
    const id = notification && typeof notification.id === "string" && NOTIFICATION_ID_PATTERN.test(notification.id) ? notification.id : void 0;
    throw new CliError(makeProblem("unexpected_response", "Unexpected response", 502, "The ".concat(action === "create" ? "notifications create" : "rotate-secret", " request completed, but its answer did not carry a signing secret. Do not rerun it."), {
      next: id ? { command: "screenrig notifications rotate-secret ".concat(id), reason: "Issue a new signing secret; it is shown once in data.secret." } : { command: "screenrig notifications list", reason: "Find the notification, then run screenrig notifications rotate-secret ID to receive a new signing secret." }
    }), ExitCode.Unexpected);
  }
  return notification;
}
async function notificationSecretResult(response, client, action, runtime) {
  const notification = await notificationWithSecret(response.body, action, runtime);
  const warning = notificationSecretWarning(notification.id, action);
  return {
    envelope: jsonBody(response, client.requestId, void 0, [warning]),
    exitCode: ExitCode.Success,
    human: [
      action === "create" ? "Created notification ".concat(notification.id) : "Rotated the signing secret of notification ".concat(notification.id),
      ...notificationLines(notification),
      "secret: ".concat(notification.secret),
      "warning: ".concat(warning.message)
    ].join("\n"),
    keepRecoveryUntilOutput: true
  };
}
async function notificationRuleFlags(args, runtime) {
  const severity = flagString(args.flags, "severity");
  const hours = flagString(args.flags, "active-hours");
  const anyTags = flagString(args.flags, "any-tag");
  const allTags = flagString(args.flags, "all-tags");
  const raw = flagString(args.flags, "audience");
  const audience = anyTags !== void 0 ? campaignAnyTagAudience(anyTags.split(",")) : allTags !== void 0 ? campaignTagAudience(allTags.split(",")) : raw !== void 0 ? await notificationAudience(raw, runtime) : void 0;
  return {
    audience,
    minSeverity: flagString(args.flags, "min-severity"),
    severity: severity !== void 0 ? notificationSeverityMap(severity) : void 0,
    windows: hours !== void 0 ? campaignWindowList(hours) : void 0,
    timezone: flagString(args.flags, "timezone"),
    outside: flagString(args.flags, "outside-hours"),
    reachDrop: notificationReachDrop(flagString(args.flags, "reach-drop-screens"), flagString(args.flags, "reach-drop-percent"))
  };
}
function reachDropNeedsCondition(conditions) {
  if (conditions !== void 0 && !conditions.includes("reach_dropped")) {
    throw usageError("--reach-drop-screens and --reach-drop-percent set the threshold of the reach_dropped condition; add reach_dropped to --conditions.");
  }
}
var handleNotificationsCreate = commandHandler(async (args, runtime, resolved) => {
  const email = flagString(args.flags, "email");
  const webhook = flagString(args.flags, "webhook");
  const chat = NOTIFICATION_CHAT_CHANNELS.flatMap(({ channel, flag }) => {
    const value = flagString(args.flags, flag);
    return value === void 0 ? [] : [{ channel, flag: "--".concat(flag), value }];
  });
  if ((email === void 0 ? 0 : 1) + (webhook === void 0 ? 0 : 1) + chat.length !== 1) {
    throw usageError("notifications create requires exactly one of --email, --webhook, --slack, --teams, --pagerduty or --telegram.");
  }
  const telegramChat = flagString(args.flags, "telegram-chat");
  if (chat[0]?.channel === "telegram" !== (telegramChat !== void 0)) {
    throw usageError("--telegram and --telegram-chat go together: the bot token and the chat it posts to.");
  }
  const conditions = flagString(args.flags, "conditions");
  const events = flagString(args.flags, "events");
  const tags = flagString(args.flags, "tag");
  const hold = flagString(args.flags, "hold");
  const description = flagString(args.flags, "description");
  const rules = await notificationRuleFlags(args, runtime);
  if (rules.reachDrop)
    reachDropNeedsCondition(conditions === void 0 ? [] : notificationConditions(conditions));
  const body = {
    channel: email !== void 0 ? "email" : webhook !== void 0 ? "webhook" : chat[0].channel,
    ...email !== void 0 ? { recipients: notificationRecipients(email) } : {},
    ...webhook !== void 0 ? { url: webhookUrl(webhook, "--webhook") } : {},
    ...chat.length ? { destination: await notificationDestination(chat[0].value, chat[0].flag, runtime) } : {},
    ...telegramChat !== void 0 ? { telegram_chat_id: telegramChat } : {},
    ...conditions !== void 0 ? { conditions: notificationConditions(conditions) } : {},
    ...events !== void 0 ? { event_types: webhookEventTypes(events, "--events") } : {},
    ...tags !== void 0 ? { screen_tags: tags.split(",") } : {},
    ...rules.audience !== void 0 ? { audience: rules.audience } : {},
    ...rules.minSeverity !== void 0 ? { min_severity: rules.minSeverity } : {},
    ...rules.severity !== void 0 ? { severity: rules.severity } : {},
    ...rules.windows !== void 0 ? { active_hours: notificationActiveHours(rules.windows, rules.timezone, rules.outside, void 0) } : {},
    ...rules.reachDrop ? { reach_drop: rules.reachDrop } : {},
    ...hold !== void 0 ? { hold_minutes: Number(notificationHold(hold)) } : {},
    ...description !== void 0 ? { description: webhookDescription(description) } : {},
    ...flagBool(args.flags, "disabled") ? { enabled: false } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await notificationCall(client, { method: "POST", path: NOTIFICATIONS_PATH, idempotent: true, body });
  if (body.channel === "webhook")
    return notificationSecretResult(response, client, "create", runtime);
  const created = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Created notification ".concat(created?.id ?? "").trimEnd(), ...notificationLines(created)].join("\n")
  };
});
var handleNotificationsList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await notificationCall(client, { method: "GET", path: NOTIFICATIONS_PATH });
  const items = response.body?.items;
  const list = Array.isArray(items) ? items : [];
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Notifications (".concat(list.length, ")"), ...notificationTableLines(list)].join("\n")
  };
});
var handleNotificationsShow = commandHandler(async (args, runtime, resolved) => {
  const id = notificationId(args.positionals[2], "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await notificationCall(client, { method: "GET", path: "".concat(NOTIFICATIONS_PATH, "/").concat(id) }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Notification", ...notificationLines(response.body)].join("\n")
  };
});
var handleNotificationsUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = notificationId(args.positionals[2], "update");
  const email = flagString(args.flags, "email");
  const url = flagString(args.flags, "url");
  const destination = flagString(args.flags, "destination");
  const telegramChat = flagString(args.flags, "telegram-chat");
  const conditions = flagString(args.flags, "conditions");
  const events = flagString(args.flags, "events");
  const tags = flagString(args.flags, "tag");
  const hold = flagString(args.flags, "hold");
  const description = flagString(args.flags, "description");
  const snooze = flagString(args.flags, "snooze");
  const rules = await notificationRuleFlags(args, runtime);
  let client;
  const getClient = () => client ??= clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let readRevision;
  let hours;
  if (flagBool(args.flags, "clear-active-hours"))
    hours = null;
  else if (rules.windows !== void 0)
    hours = notificationActiveHours(rules.windows, rules.timezone, rules.outside, void 0);
  else if (rules.timezone !== void 0 || rules.outside !== void 0) {
    const current = (await notificationCall(getClient(), { method: "GET", path: "".concat(NOTIFICATIONS_PATH, "/").concat(id) }, id)).body;
    hours = notificationActiveHours(void 0, rules.timezone, rules.outside, current?.active_hours);
    readRevision = current?.revision;
  }
  if (rules.reachDrop && conditions !== void 0)
    reachDropNeedsCondition(notificationConditions(conditions));
  const patch = {
    ...email !== void 0 ? { recipients: notificationRecipients(email) } : {},
    ...url !== void 0 ? { url: webhookUrl(url) } : {},
    ...destination !== void 0 ? { destination: await notificationDestination(destination, "--destination", runtime) } : {},
    ...telegramChat !== void 0 ? { telegram_chat_id: telegramChat } : {},
    ...conditions !== void 0 ? { conditions: notificationConditions(conditions) } : {},
    ...flagBool(args.flags, "clear-conditions") ? { conditions: [] } : {},
    ...events !== void 0 ? { event_types: webhookEventTypes(events, "--events") } : {},
    ...flagBool(args.flags, "clear-events") ? { event_types: [] } : {},
    // The audience and the screen tags exclude each other: switching from one to the other clears the first in the same request.
    ...tags !== void 0 ? { screen_tags: tags.split(","), audience: null } : {},
    ...rules.audience !== void 0 ? { audience: rules.audience, screen_tags: [] } : {},
    ...flagBool(args.flags, "all-screens") ? { screen_tags: [], audience: null } : {},
    ...rules.minSeverity !== void 0 ? { min_severity: rules.minSeverity } : {},
    ...flagBool(args.flags, "clear-min-severity") ? { min_severity: null } : {},
    ...rules.severity !== void 0 ? { severity: rules.severity } : {},
    ...flagBool(args.flags, "clear-severity") ? { severity: null } : {},
    ...hours !== void 0 ? { active_hours: hours } : {},
    ...rules.reachDrop ? { reach_drop: rules.reachDrop } : {},
    ...flagBool(args.flags, "clear-reach-drop") ? { reach_drop: null } : {},
    ...hold !== void 0 ? { hold_minutes: Number(notificationHold(hold)) } : {},
    ...description !== void 0 ? { description: webhookDescription(description) } : {},
    ...flagBool(args.flags, "clear-description") ? { description: "" } : {},
    ...flagBool(args.flags, "enable") ? { enabled: true } : {},
    ...flagBool(args.flags, "disable") ? { enabled: false } : {},
    ...snooze !== void 0 ? { snoozed_until: snoozedUntil(snooze, runtime.now()) } : {}
  };
  if (!Object.keys(patch).length) {
    throw usageError("notifications update requires at least one change: --email, --url, --destination, --telegram-chat, --conditions, --clear-conditions, --events, --clear-events, --tag, --any-tag, --all-tags, --audience, --all-screens, --min-severity, --clear-min-severity, --severity, --clear-severity, --active-hours, --timezone, --outside-hours, --clear-active-hours, --reach-drop-screens, --reach-drop-percent, --clear-reach-drop, --hold, --description, --clear-description, --enable, --disable, or --snooze.");
  }
  const guard = webhookRevisionHeaders(args) ?? (readRevision !== void 0 ? { "if-match": quotedRevision(String(readRevision)) } : void 0);
  const response = await notificationCall(getClient(), {
    method: "PATCH",
    path: "".concat(NOTIFICATIONS_PATH, "/").concat(id),
    idempotent: true,
    body: patch,
    headers: guard,
    ...snooze !== void 0 ? { recoverySupersede: JSON.stringify(["notifications update --snooze", id]) } : {}
  }, id);
  return {
    envelope: jsonBody(response, getClient().requestId),
    exitCode: ExitCode.Success,
    human: ["Updated notification ".concat(id), ...notificationLines(response.body)].join("\n")
  };
});
var handleNotificationsDelete = commandHandler(async (args, runtime, resolved) => {
  const id = notificationId(args.positionals[2], "delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await notificationCall(client, {
    method: "DELETE",
    path: "".concat(NOTIFICATIONS_PATH, "/").concat(id),
    idempotent: true,
    headers: webhookRevisionHeaders(args)
  }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: "Deleted notification ".concat(id, ". Its pending notices fail with webhook_deleted and its delivery log is no longer addressable.")
  };
});
var handleNotificationsRotateSecret = commandHandler(async (args, runtime, resolved) => {
  const id = notificationId(args.positionals[2], "rotate-secret");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await notificationCall(client, {
    method: "POST",
    path: "".concat(NOTIFICATIONS_PATH, "/").concat(id, "/rotate-secret"),
    idempotent: true,
    headers: webhookRevisionHeaders(args)
  }, id);
  return notificationSecretResult(response, client, "rotate", runtime);
});
var handleNotificationsTest = commandHandler(async (args, runtime, resolved) => {
  const id = notificationId(args.positionals[2], "test");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await notificationCall(client, { method: "POST", path: "".concat(NOTIFICATIONS_PATH, "/").concat(id, "/test"), idempotent: true }, id);
  const delivery = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: humanLines("Queued a test delivery to notification ".concat(id), [
      ["delivery_id", delivery?.id],
      ["event_type", delivery?.event_type],
      ["event_id", delivery?.event_id],
      ["state", delivery?.state],
      ["next", "screenrig notifications deliveries ".concat(id, " --limit 1 shows its outcome; a test is attempted once, without retries.")]
    ])
  };
});
var handleNotificationsResubscribe = commandHandler(async (args, runtime, resolved) => {
  const id = notificationId(args.positionals[2], "resubscribe");
  const user = notificationUserId(flagString(args.flags, "user") ?? "");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await notificationCall(client, {
    method: "DELETE",
    path: "".concat(NOTIFICATIONS_PATH, "/").concat(id, "/unsubscribed/").concat(encodeURIComponent(user)),
    idempotent: true
  }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Notification ".concat(id, " emails ").concat(user, " again, if they had unsubscribed."), ...notificationLines(response.body)].join("\n")
  };
});
var handleNotificationsDeliveries = commandHandler(async (args, runtime, resolved) => {
  const id = notificationId(args.positionals[2], "deliveries");
  const before = flagString(args.flags, "before");
  const limit = flagString(args.flags, "limit");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await notificationCall(client, {
    method: "GET",
    path: "".concat(NOTIFICATIONS_PATH, "/").concat(id, "/deliveries"),
    query: {
      ...before !== void 0 ? { before: notificationDeliveryCursor(before) } : {},
      ...limit !== void 0 ? { limit: webhookDeliveriesLimit(limit) } : {}
    }
  }, id);
  const page = response.body;
  const items = Array.isArray(page?.items) ? page.items : [];
  const next = typeof page?.next_cursor === "string" ? page.next_cursor : void 0;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Notification ".concat(id, " deliveries (").concat(items.length, ")"),
      ...notificationDeliveryTableLines(items),
      ...next ? ["next: screenrig notifications deliveries ".concat(id, " --before ").concat(next).concat(limit ? " --limit ".concat(limit) : "")] : []
    ].join("\n")
  };
});

// dist/cli-commands/notifications.js
var conditionsOption = (value) => {
  notificationConditions(value);
  return value;
};
var recipientsOption = (value) => {
  notificationRecipients(value);
  return value;
};
var eventsOption = (value) => {
  webhookEventTypes(value, "--events");
  return value;
};
var webhookOption = (value) => webhookUrl(value, "--webhook");
var urlOption2 = (value) => webhookUrl(value);
var cursorOption2 = (value) => notificationDeliveryCursor(value);
var chatOption = (value) => notificationTelegramChat(value);
var CHANNEL_FLAGS = ["email", "webhook", "slack", "teams", "pagerduty", "telegram"];
var otherChannels = (flag) => CHANNEL_FLAGS.filter((name) => name !== flag);
var activeHoursOption = weeklyWindows("--active-hours");
var REACH_DROP_SCREENS_HELP = "With the reach_dropped condition: send a notice only when a campaign loses at least N screens (default 1)";
var REACH_DROP_PERCENT_HELP = "With the reach_dropped condition: send a notice only when the loss is at least P percent (1 to 100) of the screens the campaign reached when it was published; a drop must meet both thresholds";
var CONDITIONS = NOTIFICATION_CONDITIONS.join(", ");
var SEVERITIES = NOTIFICATION_SEVERITIES.join(", ");
var SEVERITY_HELP = "Override a condition's severity for this notification, CONDITION=LEVEL such as not_playing=error (repeatable; conditions: ".concat(CONDITIONS, "; levels: ").concat(SEVERITIES, "). The default is error for screen_offline and warning for every other condition. It counts for --min-severity and is the severity every channel shows");
var HOURS_HELP = 'Send opened notices only in this weekly window, DAYS HH:MM-HH:MM such as "Mon-Fri 08:00-22:00" (repeatable, at most 16; needs --timezone)';
var AUDIENCE_HELP = 'The screens it covers, as a campaign audience rule in JSON such as {"all":[{"tag":"level2"},{"tag":"overhead"}]} (inline, a FILE, or - for stdin); instead of --tag';
var RECIPIENTS = "comma-separated, at most 20: owner (whoever owns the project when a notice sends) and project members' user ids";
var EVENTS = "exact event types (screen.online) or prefixes (screen.*), comma-separated, at most 32";
function registerNotificationsCommands(root, bind) {
  const notifications = root.command("notifications").description("Email, webhook, chat or pager alerts for screen changes");
  addCommandNotes(notifications, [
    "Notifications:",
    "  A notification sends an email, a signed webhook POST, or a message in Slack,",
    "  Teams, PagerDuty or Telegram when a screen changes",
    "  state: screen_offline, display_disconnected, running_hot, on_battery,",
    "  storage_full, content_stuck, not_playing, loop_stalled, glass_blank, glass_frozen or crashing,",
    "  or when a data source fails to refresh or goes stale (source_failed,",
    "  source_stale; --tag never matches a source), or when a content campaign (the",
    "  shared level of the schedule stack) stops reaching screens: reach_dropped when",
    "  it reaches fewer screens than when it was last published (--reach-drop-screens",
    "  and --reach-drop-percent set the smallest drop that notifies), group_empty when",
    "  a tag or folder its audience names matches no screen. Neither is limited by",
    "  --tag or --audience. card_data_stale says a card went blank: the data an agent, a",
    "  job or a person wrote to it with an expiry (card data put --ttl) reached that",
    "  expiry with no new write while a screen shows the card; the next write clears it.",
    "  Like a data source it is about a card, not a screen, so --tag never matches it",
    "  (a data source's own documents are source_stale). A condition notifies once it has lasted",
    "  --hold minutes (default 10), and a resolved notice follows when it clears after",
    "  a notice went out; crashing is sent at once. A notice sends nothing when the",
    "  screen's alert is acknowledged or snoozed during the hold, or a mute covers the",
    "  screen (screenrig alerts). --tag limits a notification to screens carrying one",
    "  of those tags, --any-tag and --all-tags to screens carrying at least one or",
    "  every one of them, and --audience takes any campaign audience rule.",
    "  --min-severity (info, warning, error) creates no opened notice below that level",
    "  and --severity CONDITION=LEVEL sets a condition's level: error for",
    "  screen_offline and warning for every other condition unless overridden;",
    "  email, Slack and Telegram text show the severity, Teams and PagerDuty use it,",
    '  and a signed webhook body carries severity. --active-hours "Mon-Fri',
    '  08:00-22:00" --timezone ZONE sends opened notices only in those windows: a',
    "  notice that falls due outside them is held until the next window opens (and",
    "  sent if its condition still holds) or, with --outside-hours drop, skipped; a",
    "  resolved notice for a sent notice and a test always go out. Email goes to each recipient's verified address, one email per",
    "  recipient for everything that falls due within about two minutes, and is free.",
    "  Every email has an unsubscribe link for its recipient alone (the",
    "  List-Unsubscribe button of mail apps, and the footer): it stops that",
    "  notification's email to that person without a sign-in, and the page it opens",
    "  can resubscribe; notifications show lists who unsubscribed. A",
    "  webhook is signed with ScreenRig-Signature t=<unix>,v1=<hex HMAC-SHA256 over",
    '  "<t>.<raw body>">; its secret is printed only by create and rotate-secret.',
    "  Slack, Teams, PagerDuty and Telegram post one message per outage and screen and",
    "  a recovery after it; their credential is sealed, never shown again (only a",
    "  masked destination_hint), and a - value reads it from stdin. A",
    "  organization has at most 50 notifications of every channel across its projects, and a new",
    "  project starts with one email to its owner for screens that go offline."
  ].join("\n"));
  const create = notifications.command("create").description("Create an email, webhook, Slack, Teams, PagerDuty or Telegram notification for screen state changes").addOption(new Option("--email <RECIPIENTS>", "Email these recipients, ".concat(RECIPIENTS)).argParser(recipientsOption).conflicts(otherChannels("email"))).addOption(new Option("--webhook <URL>", "POST signed notices to this https URL on a public Internet host, port 443 or 8443").argParser(webhookOption).conflicts(otherChannels("webhook"))).addOption(new Option("--slack <URL>", "Post to a Slack channel through its incoming webhook URL (https://hooks.slack.com/services/...), or - to read the URL from one line of stdin").conflicts(otherChannels("slack"))).addOption(new Option("--teams <URL>", 'Post to a Teams channel through a Workflows webhook URL (the trigger "When a Teams webhook request is received"), or - to read the URL from one line of stdin').conflicts(otherChannels("teams"))).addOption(new Option("--pagerduty <KEY>", "Trigger and resolve PagerDuty incidents with this Events API v2 routing key (32 characters), or - to read the key from one line of stdin").conflicts(otherChannels("pagerduty"))).addOption(new Option("--telegram <TOKEN>", "Post to Telegram with this bot token (needs --telegram-chat), or - to read the token from one line of stdin").conflicts(otherChannels("telegram"))).addOption(new Option("--telegram-chat <CHAT_ID>", "With --telegram: the chat to post to, its numeric id (-1001234567890) or @channelname").argParser(chatOption)).option("--conditions <LIST>", "Notify on these screen state changes, comma-separated: ".concat(CONDITIONS), conditionsOption).option("--events <TYPES>", "Webhook only: also POST these raw project events as they happen, ".concat(EVENTS), eventsOption).addOption(new Option("--tag <TAG>", "Only screens carrying any of these tags (repeatable, or comma-separated; at most 16). Without a screen option, every screen").argParser(notificationTags).conflicts(["anyTag", "allTags", "audience"])).addOption(new Option("--any-tag <TAG>", "Only screens carrying at least one of these tags (repeatable, or comma-separated), as a campaign any rule").argParser(notificationAnyTags).conflicts(["tag", "allTags", "audience"])).addOption(new Option("--all-tags <TAG>", "Only screens carrying every one of these tags (repeatable, or comma-separated), as a campaign all rule").argParser(notificationAllTags).conflicts(["tag", "anyTag", "audience"])).addOption(new Option("--audience <FILE|->", AUDIENCE_HELP).argParser(notificationAudienceOption).conflicts(["tag", "anyTag", "allTags"])).addOption(new Option("--min-severity <LEVEL>", "Create no opened notice below this severity (a resolved notice follows its opened one); info, warning or error").choices([...NOTIFICATION_SEVERITIES])).addOption(new Option("--severity <CONDITION=LEVEL>", SEVERITY_HELP).argParser(notificationSeverityOverride)).addOption(new Option("--active-hours <SPEC>", HOURS_HELP).argParser(activeHoursOption)).addOption(new Option("--timezone <ZONE>", "With --active-hours: the IANA timezone its windows are read in, such as America/Los_Angeles").argParser(notificationTimezone)).addOption(new Option("--outside-hours <WHEN>", "With --active-hours: hold (default) keeps a notice until the next window opens and sends it if its condition still holds; drop skips it").choices(["hold", "drop"])).addOption(new Option("--reach-drop-screens <N>", REACH_DROP_SCREENS_HELP).argParser(notificationReachDropScreens)).addOption(new Option("--reach-drop-percent <P>", REACH_DROP_PERCENT_HELP).argParser(notificationReachDropPercent)).option("--hold <MINUTES>", "Minutes a condition must last before it notifies, 0 to 1440 (default 10); crashing is never held", notificationHold).option("--description <TEXT>", "Describe the notification (at most 200 characters)", webhookDescription).option("--disabled", "Create it disabled; nothing is sent until notifications update --enable").action(bind(handleNotificationsCreate));
  requireOptionGroup(create, "exactlyOne", ["--email", "--webhook", "--slack", "--teams", "--pagerduty", "--telegram"]);
  requireOptionGroup(create, "atLeastOne", ["--conditions", "--events"]);
  requireOptionGroup(create, "requires", ["--email", "--conditions"]);
  requireOptionGroup(create, "requires", ["--events", "--webhook"]);
  requireOptionGroup(create, "together", ["--telegram", "--telegram-chat"]);
  requireOptionGroup(create, "requires", ["--active-hours", "--timezone"]);
  requireOptionGroup(create, "requires", ["--timezone", "--active-hours"]);
  requireOptionGroup(create, "requires", ["--outside-hours", "--active-hours"]);
  notifications.command("list").description("List this project's notifications (never their secrets)").action(bind(handleNotificationsList));
  notifications.command("show").description("Inspect a notification and its delivery health").argument("<id>", "Notification identifier").action(bind(handleNotificationsShow));
  const update = notifications.command("update").description("Change a notification's recipients, URL, destination, conditions, screens, severity, active hours, hold, snooze or enabled state").argument("<id>", "Notification identifier").addOption(new Option("--email <RECIPIENTS>", "Email notifications: replace the recipients, ".concat(RECIPIENTS)).argParser(recipientsOption).conflicts(["url", "destination"])).addOption(new Option("--url <URL>", "Webhook notifications: replace the https URL; checked like create").argParser(urlOption2).conflicts(["email", "destination"])).addOption(new Option("--destination <VALUE>", "Slack, Teams, PagerDuty and Telegram notifications: replace the webhook URL, routing key or bot token; checked like create. - reads it from one line of stdin").conflicts(["email", "url"])).addOption(new Option("--telegram-chat <CHAT_ID>", "Telegram notifications: replace the chat").argParser(chatOption)).addOption(new Option("--conditions <LIST>", "Replace the conditions with these, comma-separated: ".concat(CONDITIONS)).argParser(conditionsOption).conflicts(["clearConditions"])).addOption(new Option("--clear-conditions", "Remove every condition (a webhook then needs --events)").conflicts(["conditions"])).addOption(new Option("--events <TYPES>", "Webhook notifications: replace the raw project events, ".concat(EVENTS)).argParser(eventsOption).conflicts(["clearEvents"])).addOption(new Option("--clear-events", "Webhook notifications: stop POSTing raw project events (it then needs conditions)").conflicts(["events"])).addOption(new Option("--tag <TAG>", "Replace the screens with any of these tags (repeatable, or comma-separated; at most 16); replaces an audience too").argParser(notificationTags).conflicts(["allScreens", "anyTag", "allTags", "audience"])).addOption(new Option("--any-tag <TAG>", "Replace the screens with those carrying at least one of these tags (repeatable, or comma-separated), as a campaign any rule").argParser(notificationAnyTags).conflicts(["allScreens", "tag", "allTags", "audience"])).addOption(new Option("--all-tags <TAG>", "Replace the screens with those carrying every one of these tags (repeatable, or comma-separated), as a campaign all rule").argParser(notificationAllTags).conflicts(["allScreens", "tag", "anyTag", "audience"])).addOption(new Option("--audience <FILE|->", "Replace the screens with ".concat(AUDIENCE_HELP.replace(/^The screens it covers, as/, ""))).argParser(notificationAudienceOption).conflicts(["allScreens", "tag", "anyTag", "allTags"])).addOption(new Option("--all-screens", "Remove the screen tags and the audience; the notification covers every screen").conflicts(["tag", "anyTag", "allTags", "audience"])).addOption(new Option("--min-severity <LEVEL>", "Create no opened notice below this severity; info, warning or error").choices([...NOTIFICATION_SEVERITIES]).conflicts(["clearMinSeverity"])).addOption(new Option("--clear-min-severity", "Remove the severity filter; every opened notice is created").conflicts(["minSeverity"])).addOption(new Option("--severity <CONDITION=LEVEL>", "Replace every override with these. ".concat(SEVERITY_HELP)).argParser(notificationSeverityOverride).conflicts(["clearSeverity"])).addOption(new Option("--clear-severity", "Remove every severity override; each condition has its default severity again").conflicts(["severity"])).addOption(new Option("--active-hours <SPEC>", "Replace the active hours with these windows. ".concat(HOURS_HELP.replace("; needs --timezone", "; --timezone defaults to the zone the notification has"))).argParser(activeHoursOption).conflicts(["clearActiveHours"])).addOption(new Option("--timezone <ZONE>", "The IANA timezone the active hours are read in; alone it keeps the current windows").argParser(notificationTimezone).conflicts(["clearActiveHours"])).addOption(new Option("--outside-hours <WHEN>", "hold keeps a notice until the next window opens, drop skips it; alone it keeps the current windows").choices(["hold", "drop"]).conflicts(["clearActiveHours"])).addOption(new Option("--clear-active-hours", "Remove the active hours; notices go out at any time").conflicts(["activeHours", "timezone", "outsideHours"])).addOption(new Option("--reach-drop-screens <N>", "Replace the reach-drop threshold. ".concat(REACH_DROP_SCREENS_HELP)).argParser(notificationReachDropScreens).conflicts(["clearReachDrop"])).addOption(new Option("--reach-drop-percent <P>", "Replace the reach-drop threshold. ".concat(REACH_DROP_PERCENT_HELP)).argParser(notificationReachDropPercent).conflicts(["clearReachDrop"])).addOption(new Option("--clear-reach-drop", "Remove the reach-drop threshold; any drop notifies").conflicts(["reachDropScreens", "reachDropPercent"])).option("--hold <MINUTES>", "Minutes a condition must last before it notifies, 0 to 1440", notificationHold).addOption(new Option("--description <TEXT>", "Replace the description (at most 200 characters)").argParser(webhookDescription).conflicts(["clearDescription"])).addOption(new Option("--clear-description", "Remove the description").conflicts(["description"])).addOption(new Option("--enable", "Enable the notification; clears failure state and starts at the event that records the change").conflicts(["disable"])).addOption(new Option("--disable", "Disable the notification; pending notices fail with webhook_disabled").conflicts(["enable"])).option("--snooze <WHEN>", "Send nothing until then: a duration (30m, 1h, 4h, 2d; at most 30 days), an RFC 3339 instant with seconds and an offset, or off to end the snooze", notificationSnooze).option("--expect-rev <REVISION>", "Optionally require this notification revision", revision).action(bind(handleNotificationsUpdate));
  requireOptionGroup(update, "atLeastOne", [
    "--email",
    "--url",
    "--destination",
    "--telegram-chat",
    "--conditions",
    "--clear-conditions",
    "--events",
    "--clear-events",
    "--tag",
    "--any-tag",
    "--all-tags",
    "--audience",
    "--all-screens",
    "--min-severity",
    "--clear-min-severity",
    "--severity",
    "--clear-severity",
    "--active-hours",
    "--timezone",
    "--outside-hours",
    "--clear-active-hours",
    "--reach-drop-screens",
    "--reach-drop-percent",
    "--clear-reach-drop",
    "--hold",
    "--description",
    "--clear-description",
    "--enable",
    "--disable",
    "--snooze"
  ]);
  requireOptionGroup(update, "atMostOne", ["--email", "--url", "--destination"]);
  notifications.command("delete").description("Delete a notification; its pending notices fail").argument("<id>", "Notification identifier").option("--expect-rev <REVISION>", "Optionally require this notification revision", revision).action(bind(handleNotificationsDelete));
  notifications.command("rotate-secret").description("Replace a webhook notification's signing secret and print the new one once").argument("<id>", "Notification identifier").option("--expect-rev <REVISION>", "Optionally require this notification revision", revision).action(bind(handleNotificationsRotateSecret));
  notifications.command("test").description("Send one test email, signed test POST or chat message to this notification only").argument("<id>", "Notification identifier").action(bind(handleNotificationsTest));
  notifications.command("resubscribe").description("Email a person again who unsubscribed from a notification's email").argument("<id>", "Notification identifier").addOption(new Option("--user <USER_ID>", "The person's user id, as notifications show lists it under unsubscribed").argParser(notificationUserId).makeOptionMandatory()).action(bind(handleNotificationsResubscribe));
  notifications.command("deliveries").description("Read a notification's delivery log, newest first").argument("<id>", "Notification identifier").option("--before <CURSOR>", "Continue from the next_cursor of the previous page", cursorOption2).option("--limit <N>", "Rows per page, 1 to 200 (server default 50)", webhookDeliveriesLimit).action(bind(handleNotificationsDeliveries));
}

// dist/reports.js
var REPORT_GROUPINGS = ["folder", "screen", "tag"];
var REPORT_CADENCES = ["daily", "weekly", "monthly"];
var REPORT_WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
var REPORT_SUBSCRIPTION_FORMATS = ["pdf", "xlsx", "csv"];
var REPORT_RECIPIENTS_MAX = 25;
var KIND_PATTERN = /^[a-z][a-z_]{1,40}$/;
var DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
var SUBSCRIPTION_ID_PATTERN = /^(?:(?:stage|qa|development)_)?rsub_[A-Za-z0-9_-]{16,24}$/;
function reportKind(value, command) {
  if (!value || !KIND_PATTERN.test(value)) {
    throw usageError("".concat(command, " requires a report kind such as fleet_health, uptime, publishing, alerts, alert_log or proof_of_play."), {
      command: "screenrig reports list",
      reason: "List the report kinds and the filters each takes."
    });
  }
  return value;
}
function reportSubscriptionId(value, command) {
  if (!value)
    throw usageError("reports subscriptions ".concat(command, " requires <id>."));
  if (!SUBSCRIPTION_ID_PATTERN.test(value)) {
    throw usageError("A report subscription id looks like rsub_ followed by 16 to 24 letters, digits, - or _.", {
      command: "screenrig reports subscriptions list",
      reason: "List this project's report subscriptions and their ids."
    });
  }
  return value;
}
function reportDay(flag) {
  return (value) => {
    const ms = DAY_PATTERN.test(value) ? Date.parse("".concat(value, "T00:00:00Z")) : NaN;
    if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== value)
      throw usageError("".concat(flag, " must be a UTC calendar day as YYYY-MM-DD."));
    return value;
  };
}
function reportQuery(args) {
  return {
    from: flagString(args.flags, "from"),
    to: flagString(args.flags, "to"),
    group_by: flagString(args.flags, "group-by"),
    folder_id: flagString(args.flags, "folder-id"),
    direct: flagBool(args.flags, "direct") ? "true" : void 0,
    tag: flagString(args.flags, "tag"),
    campaign_id: flagString(args.flags, "campaign-id"),
    advertiser: flagString(args.flags, "advertiser")
  };
}
function cell(column, value) {
  if (value === null || value === void 0)
    return "";
  if (typeof value === "boolean")
    return value ? "yes" : "no";
  if (typeof value === "number")
    return column.type === "percent" || column.type === "hours" ? value.toFixed(2) : String(value);
  return String(value);
}
function reportTableLines(report) {
  const columns = report?.columns ?? [];
  const rows = report?.rows ?? [];
  const lines = [report?.title ?? "Report"];
  if (report?.subtitle)
    lines.push(report.subtitle);
  else if (report?.from && report?.to)
    lines.push("".concat(report.from, " to ").concat(report.to));
  if (columns.length === 0)
    return lines;
  const body = rows.map((row) => columns.map((column) => cell(column, row[column.key])));
  if (report?.totals && Object.keys(report.totals).length > 0) {
    body.push(columns.map((column, index) => index === 0 && report.totals?.[column.key] == null ? "Total" : cell(column, report.totals?.[column.key])));
  }
  lines.push(...table(columns.map((column) => column.label), body));
  if (rows.length === 0)
    lines.push("Nothing to report for this period.");
  for (const note of report?.notes ?? [])
    lines.push(note);
  if (report?.truncated)
    lines.push("The report shows only its first rows.");
  return lines;
}
function reportCatalogLines(catalog) {
  const lines = ["Reports"];
  for (const item of catalog?.items ?? []) {
    lines.push("".concat(item.kind, ": ").concat(item.title), "  ".concat(item.description), "  filters: ".concat(item.params.map((param) => param.name).join(", ")));
  }
  if (catalog?.formats?.length)
    lines.push("formats: ".concat(catalog.formats.join(", "), " (reports show KIND --format xlsx --output report.xlsx)"));
  return lines;
}
function reportRecipients(value) {
  const entries = value.split(",").map((entry) => entry.trim()).filter((entry) => entry.length > 0);
  if (entries.length === 0 || entries.length > REPORT_RECIPIENTS_MAX || new Set(entries.map((entry) => entry.toLowerCase())).size !== entries.length || entries.some((entry) => entry.length > 254)) {
    throw usageError("--recipients takes 1 to ".concat(REPORT_RECIPIENTS_MAX, " different project members, comma-separated: a user id or the email address of a member."));
  }
  return entries;
}
function reportFilter(value, previous) {
  const separator = value.indexOf("=");
  const name = value.slice(0, separator);
  if (separator < 1 || !/^[a-z_]{1,40}$/.test(name) || value.length - separator - 1 > 200) {
    throw usageError("--filter takes NAME=VALUE, such as --filter folder_id=sfd_ID or --filter group_by=screen.");
  }
  return previous ? "".concat(previous, "\n").concat(value) : value;
}
function reportFilters(raw) {
  if (raw === void 0)
    return void 0;
  const filters = {};
  for (const entry of raw.split("\n")) {
    const separator = entry.indexOf("=");
    filters[entry.slice(0, separator)] = entry.slice(separator + 1);
  }
  return filters;
}
function reportSchedule(args) {
  const cadence = flagString(args.flags, "cadence");
  const weekday = flagString(args.flags, "weekday");
  const dayOfMonth = flagString(args.flags, "day-of-month");
  const hour = flagString(args.flags, "hour");
  const timezone = flagString(args.flags, "timezone");
  if ([cadence, weekday, dayOfMonth, hour, timezone].every((member) => member === void 0))
    return void 0;
  const schedule = {};
  if (cadence !== void 0)
    schedule.cadence = cadence;
  if (weekday !== void 0)
    schedule.weekday = weekday;
  if (dayOfMonth !== void 0)
    schedule.day_of_month = Number(dayOfMonth);
  if (hour !== void 0)
    schedule.hour = Number(hour);
  if (timezone !== void 0)
    schedule.timezone = timezone;
  return schedule;
}
function scheduleText(schedule) {
  if (!schedule)
    return "";
  const when = schedule.cadence === "weekly" ? "weekly on ".concat(schedule.weekday ?? "monday") : schedule.cadence === "monthly" ? "monthly on day ".concat(schedule.day_of_month ?? 1) : "daily";
  return "".concat(when, " at ").concat(String(schedule.hour ?? 0).padStart(2, "0"), ":00 ").concat(schedule.timezone ?? "UTC");
}
function subscriptionLines(subscription) {
  if (!subscription)
    return ["No report subscription"];
  const lines = [
    "".concat(subscription.name ?? "", " (").concat(subscription.id ?? "", ")"),
    "  report: ".concat(subscription.kind ?? "", " as ").concat(subscription.format ?? "").concat(subscription.enabled === false ? " (paused)" : ""),
    "  schedule: ".concat(scheduleText(subscription.schedule)),
    "  recipients: ".concat((subscription.recipients ?? []).map((recipient) => recipient.user_id).join(", "))
  ];
  if (subscription.filters && Object.keys(subscription.filters).length > 0) {
    lines.push("  filters: ".concat(Object.entries(subscription.filters).map(([name, value]) => "".concat(name, "=").concat(value)).join(" ")));
  }
  if (subscription.next_run_at)
    lines.push("  next run: ".concat(subscription.next_run_at));
  if (subscription.last_status) {
    lines.push("  last run: ".concat(subscription.last_status).concat(subscription.last_run_at ? " at ".concat(subscription.last_run_at) : "").concat(subscription.last_from ? " for ".concat(subscription.last_from, " to ").concat(subscription.last_to) : ""));
    if (subscription.last_status === "failed" && subscription.last_error)
      lines.push("  failure: ".concat(subscription.last_error));
    if (subscription.last_status === "delivered")
      lines.push("  mailed: ".concat(subscription.last_delivered ?? 0, " member").concat(subscription.last_delivered === 1 ? "" : "s"));
  }
  return lines;
}
function subscriptionListLines(items) {
  if (!items?.length)
    return ["No report subscriptions"];
  return table(["ID", "NAME", "REPORT", "SCHEDULE", "FORMAT", "NEXT_RUN", "LAST"], items.map((item) => [
    item.id ?? "",
    item.name ?? "",
    item.kind ?? "",
    scheduleText(item.schedule),
    item.format ?? "",
    item.enabled === false ? "(paused)" : item.next_run_at ?? "",
    item.last_status ?? ""
  ]));
}

// dist/handlers/reports.js
var REPORTS_PATH = "/api/reports";
var REPORT_SUBSCRIPTIONS_PATH = "/api/report-subscriptions";
var handleReportsList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: REPORTS_PATH });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: reportCatalogLines(response.body).join("\n")
  };
});
var handleReportsShow = commandHandler(async (args, runtime, resolved) => {
  const kind = reportKind(args.positionals[2], "reports show");
  const query = reportQuery(args);
  const file = await reportFileOf(args, runtime, resolved, "".concat(REPORTS_PATH, "/").concat(kind), query, "".concat(kind.replaceAll("_", "-")).concat(query.to ? "-".concat(query.to) : ""), "".concat(kind, " report"));
  if (file)
    return file;
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "".concat(REPORTS_PATH, "/").concat(kind), query });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: reportTableLines(response.body).join("\n")
  };
});
var handleReportSubscriptionsList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: REPORT_SUBSCRIPTIONS_PATH });
  const body = response.body;
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: subscriptionListLines(body?.items).join("\n") };
});
var handleReportSubscriptionsShow = commandHandler(async (args, runtime, resolved) => {
  const id = reportSubscriptionId(args.positionals[3], "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "".concat(REPORT_SUBSCRIPTIONS_PATH, "/").concat(id) });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: subscriptionLines(response.body).join("\n") };
});
function reportSubscriptionBody(args) {
  const body = {};
  const name = flagString(args.flags, "name");
  const format = flagString(args.flags, "format");
  const recipients = flagString(args.flags, "recipients");
  const filters = reportFilters(flagString(args.flags, "filter"));
  const schedule = reportSchedule(args);
  if (name !== void 0)
    body.name = name;
  if (format !== void 0)
    body.format = format;
  if (recipients !== void 0)
    body.recipients = reportRecipients(recipients);
  if (filters !== void 0)
    body.filters = filters;
  if (schedule !== void 0)
    body.schedule = schedule;
  if (flagBool(args.flags, "pause"))
    body.enabled = false;
  if (flagBool(args.flags, "resume"))
    body.enabled = true;
  return body;
}
var handleReportSubscriptionsCreate = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const body = { ...reportSubscriptionBody(args), kind: reportKind(flagString(args.flags, "kind"), "reports subscriptions create --kind") };
  const response = await client.call({ method: "POST", path: REPORT_SUBSCRIPTIONS_PATH, body, idempotent: true });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: ["Created", ...subscriptionLines(response.body)].join("\n") };
});
var handleReportSubscriptionsUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = reportSubscriptionId(args.positionals[3], "update");
  const body = reportSubscriptionBody(args);
  if (Object.keys(body).length === 0)
    throw usageError("reports subscriptions update needs at least one change: --name, --cadence, --format, --recipients, --filter, --pause or --resume.");
  const revision2 = flagString(args.flags, "expect-rev");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: "PATCH",
    path: "".concat(REPORT_SUBSCRIPTIONS_PATH, "/").concat(id),
    body,
    idempotent: true,
    headers: revision2 ? { "if-match": quotedRevision(revision2) } : void 0
  });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: ["Updated", ...subscriptionLines(response.body)].join("\n") };
});
var handleReportSubscriptionsDelete = commandHandler(async (args, runtime, resolved) => {
  const id = reportSubscriptionId(args.positionals[3], "delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "DELETE", path: "".concat(REPORT_SUBSCRIPTIONS_PATH, "/").concat(id), idempotent: true });
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: "Deleted report subscription ".concat(id, ". Nothing more is sent.")
  };
});
var handleReportSubscriptionsSend = commandHandler(async (args, runtime, resolved) => {
  const id = reportSubscriptionId(args.positionals[3], "send");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "POST", path: "".concat(REPORT_SUBSCRIPTIONS_PATH, "/").concat(id, "/send"), idempotent: true });
  const sent = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [sent?.last_status === "delivered" ? "Sent now" : "Not delivered", ...subscriptionLines(sent)].join("\n")
  };
});

// dist/cli-commands/reports.js
var scheduleOptions = (command, cadenceRequired) => command.addOption(cadenceRequired ? new Option("--cadence <CADENCE>", "daily, weekly or monthly").choices(REPORT_CADENCES).makeOptionMandatory() : new Option("--cadence <CADENCE>", "daily, weekly or monthly").choices(REPORT_CADENCES)).addOption(new Option("--weekday <DAY>", "Weekly runs: monday (default) to sunday").choices(REPORT_WEEKDAYS)).option("--day-of-month <N>", "Monthly runs: the day, 1 to 28 (default 1)", (value) => {
  if (!/^\d{1,2}$/.test(value) || Number(value) < 1 || Number(value) > 28)
    throw new Error("--day-of-month must be 1 to 28.");
  return value;
}).option("--hour <N>", "Hour of the day in the time zone, 0 to 23 (default 0)", (value) => {
  if (!/^\d{1,2}$/.test(value) || Number(value) > 23)
    throw new Error("--hour must be 0 to 23.");
  return value;
}).option("--timezone <ZONE>", "IANA time zone such as America/Los_Angeles (default UTC)");
function registerReportsCommands(root, bind) {
  const reports = root.command("reports").description("Build reports from the project's aggregates, write them as CSV, XLSX or PDF, and email them on a schedule");
  addCommandNotes(reports, [
    "Reports:",
    "  fleet_health, uptime, publishing and alerts roll the fleet up by folder",
    "  (every folder includes the folders inside it; the first row is the whole",
    "  project), by screen or by tag: availability and recorded coverage, alerts",
    "  open now and begun in the period by condition, hot, display-disconnected and",
    "  crashing screens, and content status (current, updating, needs attention).",
    "  alert_log lists every alert begun in the period. proof_of_play totals the",
    "  plays of the project's direct campaigns per campaign, media and screen for a",
    "  sponsor or advertiser, as a statement ready to send. Days are UTC days. Reports",
    "  read aggregates, never raw events. reports show --format csv, xlsx or pdf",
    "  writes a file; the report, alert, uptime, health, play and ad report",
    "  commands write the same formats. reports subscriptions email a report to",
    "  project members daily, weekly or monthly; recipients are members only."
  ].join("\n"));
  reports.command("list").description("List the report kinds and the filters each takes").action(bind(handleReportsList));
  reports.command("show").description("Build one report, as rows or as a CSV, XLSX or PDF file").argument("<kind>", "fleet_health, uptime, publishing, alerts, alert_log or proof_of_play").option("--from <YYYY-MM-DD>", "First UTC day, inclusive (default 29 days before --to)", reportDay("--from")).option("--to <YYYY-MM-DD>", "Last UTC day, inclusive (default today); at most 366 days after --from", reportDay("--to")).addOption(new Option("--group-by <GROUPING>", "What a row is: folder (default), screen or tag").choices(REPORT_GROUPINGS)).option("--folder-id <ID>", "Only this screen folder and everything inside it").option("--direct", "With --folder-id: only the screens directly in the folder (--group-by screen), or the folder and its child folders").option("--tag <TAG>", "Only screens carrying this tag").option("--campaign-id <ID>", "proof_of_play: one direct campaign").option("--advertiser <NAME>", "proof_of_play: the campaigns of this advertiser or sponsor (exact name, any case)").addOption(reportFormatOption()).addOption(reportOutputOption("KIND-DAY.FORMAT")).action(bind(handleReportsShow));
  const subscriptions = reports.command("subscriptions").description("Email a report to project members on a schedule");
  addCommandNotes(subscriptions, [
    "Report subscriptions:",
    "  A subscription mails one report as a PDF, XLSX or CSV attachment, daily,",
    "  weekly (--weekday) or monthly (--day-of-month, 1 to 28), at --hour in",
    "  --timezone. Each run covers the period before it in UTC days: yesterday,",
    "  the seven days before, or last month. Recipients are members of the project,",
    "  named by user id or by the email address of the member; anyone else is",
    "  refused, and a member who leaves stops receiving it. A failed run is retried",
    "  and shows in the subscription as last_status failed with last_error. An organization",
    "  has at most 50 subscriptions across its projects. Reading needs the project capability."
  ].join("\n"));
  subscriptions.command("list").description("List this project's report subscriptions").action(bind(handleReportSubscriptionsList));
  subscriptions.command("show").description("Inspect a report subscription and its last run").argument("<id>", "Report subscription identifier").action(bind(handleReportSubscriptionsShow));
  const create = subscriptions.command("create").description("Schedule a report email to project members").requiredOption("--name <NAME>", "Name, at most 100 characters").addOption(new Option("--kind <KIND>", "fleet_health, uptime, publishing, alerts, alert_log or proof_of_play").makeOptionMandatory()).addOption(new Option("--format <FORMAT>", "Attachment: pdf, xlsx or csv").choices(REPORT_SUBSCRIPTION_FORMATS).makeOptionMandatory()).requiredOption("--recipients <MEMBERS>", "Project members, comma-separated: a user id, a member's email address or owner (at most 25)").option("--filter <NAME=VALUE>", "A report filter such as group_by=screen, folder_id=sfd_ID, tag=Lobby, advertiser=Acme (repeatable)", reportFilter);
  scheduleOptions(create, true);
  create.action(bind(handleReportSubscriptionsCreate));
  const update = subscriptions.command("update").description("Change a report subscription; the report kind never changes").argument("<id>", "Report subscription identifier").option("--name <NAME>", "Name, at most 100 characters").addOption(new Option("--format <FORMAT>", "Attachment: pdf, xlsx or csv").choices(REPORT_SUBSCRIPTION_FORMATS)).option("--recipients <MEMBERS>", "Replace the recipients: user ids or members' email addresses, comma-separated").option("--filter <NAME=VALUE>", "Replace the filters with these (repeatable)", reportFilter).option("--pause", "Send nothing until resumed").option("--resume", "Send again from the next occurrence").option("--expect-rev <REVISION>", "Fail unless the subscription is at this revision", revision);
  scheduleOptions(update, false);
  update.action(bind(handleReportSubscriptionsUpdate));
  requireOptionGroup(update, "atMostOne", ["--pause", "--resume"]);
  subscriptions.command("delete").description("Delete a report subscription").argument("<id>", "Report subscription identifier").action(bind(handleReportSubscriptionsDelete));
  subscriptions.command("send").description("Email a report now to its recipients, without moving its schedule").argument("<id>", "Report subscription identifier").action(bind(handleReportSubscriptionsSend));
}

// dist/bi.js
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// dist/bi-web.js
var BI_WEB_LOGIN_MODES = ["auto", "steps", "none"];
var STEP_ACTIONS = ["goto", "fill", "click", "press", "wait_for", "wait_ms"];
var STEPS_MAX = 30;
var COOKIES_MAX = 100;
var DOCUMENT_MAX_BYTES = 256 * 1024;
var SECRET_FILE_MAX_BYTES = 16 * 1024;
var PASSWORD_MAX_CHARACTERS = 4096;
var TOTP_MAX_CHARACTERS = 1024;
var SELECTOR_MAX_CHARACTERS = 512;
function biWebLoginUrl(value) {
  const text = value.trim();
  let protocol;
  try {
    protocol = new URL(text).protocol;
  } catch {
  }
  if (protocol !== "https:" || [...text].length > 2048 || /[\s\p{Cc}]/u.test(text)) {
    throw usageError("--login-url takes the https address of the site's sign-in page, such as https://login.example.com/signin.");
  }
  return text;
}
function biCssSelector(flag) {
  return (value) => {
    const text = value.trim();
    if (!text || [...text].length > SELECTOR_MAX_CHARACTERS || new RegExp("\\p{Cc}", "u").test(text)) {
      throw usageError("".concat(flag, " takes a CSS selector of 1 to ").concat(SELECTOR_MAX_CHARACTERS, ' characters, such as "#dashboard .loaded".'));
    }
    return text;
  };
}
function biWaitMs(value) {
  if (!/^\d+$/.test(value) || Number(value) > 1e4)
    throw usageError("--wait-ms takes whole milliseconds from 0 to 10000.");
  return value;
}
function secretText(text, where, what, max) {
  const secret = text.replace(/(?:\r?\n)+$/, "");
  if (!secret.trim())
    throw usageError("".concat(where, " holds no ").concat(what, "."));
  if (new RegExp("\\p{Cc}", "u").test(secret))
    throw usageError("".concat(where, " must hold only the ").concat(what, ": one line of text."));
  if ([...secret].length > max)
    throw usageError("The ".concat(what, " in ").concat(where, " is longer than ").concat(max, " characters."));
  return secret;
}
async function readWebPassword(file, runtime) {
  return secretText(await readAuthoringText(file, runtime, SECRET_FILE_MAX_BYTES), file === "-" ? "stdin" : file, "password", PASSWORD_MAX_CHARACTERS);
}
async function readTotpSeed(file, runtime) {
  return secretText(await readAuthoringText(file, runtime, SECRET_FILE_MAX_BYTES), file === "-" ? "stdin" : file, "authenticator key", TOTP_MAX_CHARACTERS);
}
async function readJson(file, flag, runtime) {
  const text = await readAuthoringText(file, runtime, DOCUMENT_MAX_BYTES);
  try {
    return JSON.parse(text);
  } catch {
    throw usageError("".concat(flag, " must hold valid JSON."));
  }
}
async function readWebSteps(file, runtime) {
  const parsed = await readJson(file, "--steps", runtime);
  if (!Array.isArray(parsed) || !parsed.length)
    throw usageError("--steps must hold a JSON array of 1 to ".concat(STEPS_MAX, ' steps: [{"action":"goto","url":"https://\u2026"},{"action":"fill","selector":"#user","value":"{{username}}"}].'));
  if (parsed.length > STEPS_MAX)
    throw usageError("--steps holds ".concat(parsed.length, " steps; a sign-in script has at most ").concat(STEPS_MAX, "."));
  parsed.forEach((step, index) => {
    const action = step && typeof step === "object" && !Array.isArray(step) ? step.action : void 0;
    if (typeof action !== "string" || !STEP_ACTIONS.includes(action)) {
      throw usageError("--steps[".concat(index, "] needs an action: ").concat(STEP_ACTIONS.join(", "), "."));
    }
  });
  return parsed;
}
function webCookies(parsed) {
  const list = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" && Array.isArray(parsed.cookies) ? parsed.cookies : void 0;
  if (!list)
    throw usageError("--cookies-file must hold a JSON array of cookies, or an object with a cookies array, as a browser extension or Playwright exports them.");
  if (list.length > COOKIES_MAX)
    throw usageError("--cookies-file holds ".concat(list.length, " cookies; a jar has at most ").concat(COOKIES_MAX, "."));
  return list.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry))
      throw usageError("--cookies-file cookie ".concat(index, " is not an object."));
    const cookie = entry;
    if (typeof cookie.name !== "string" || !cookie.name || typeof cookie.value !== "string" || typeof cookie.domain !== "string" || !cookie.domain) {
      throw usageError("--cookies-file cookie ".concat(index, " needs a name, a value and the domain of the site (.example.com for every subdomain)."));
    }
    const expiry = [cookie.expires, cookie.expirationDate].find((value) => typeof value === "number" && value > 0);
    return {
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      ...typeof cookie.path === "string" && cookie.path ? { path: cookie.path } : {},
      ...expiry !== void 0 ? { expires: Math.floor(expiry) } : {},
      ...typeof cookie.httpOnly === "boolean" ? { httpOnly: cookie.httpOnly } : {},
      ...typeof cookie.secure === "boolean" ? { secure: cookie.secure } : {},
      ...typeof cookie.sameSite === "string" && cookie.sameSite ? { sameSite: cookie.sameSite } : {}
    };
  });
}
async function readWebCookies(file, runtime) {
  return webCookies(await readJson(file, "--cookies-file", runtime));
}
function webConnectionLines(connection) {
  const config = connection.config ?? {};
  const session = connection.session;
  return [
    "login: ".concat(config.login_mode ?? "-").concat(config.login_url ? " at ".concat(config.login_url) : ""),
    ...config.username ? ["user: ".concat(config.username)] : [],
    ...config.steps?.length ? ["steps: ".concat(config.steps.length)] : [],
    "authenticator key: ".concat(connection.totp_secret?.set ? "set" : "not set"),
    ...session ? ["session: ".concat(session.state, ", ").concat(session.cookies, " cookie").concat(session.cookies === 1 ? "" : "s").concat(session.cookies_updated_at ? " (updated ".concat(session.cookies_updated_at, ")") : "").concat(session.last_login_at ? ", last sign-in ".concat(session.last_login_at) : "").concat(session.login_failures ? ", ".concat(session.login_failures, " refused sign-in").concat(session.login_failures === 1 ? "" : "s", " in a row") : "").concat(session.retry_at ? ", next sign-in not before ".concat(session.retry_at) : "")] : []
  ];
}

// dist/bi.js
var CONNECTIONS_PATH = "/api/bi-connections";
var VIEWS_PATH = "/api/bi-views";
var BI_CONNECTION_ID_PATTERN = /^(?:(?:stage|qa|development)_)?bic_[A-Za-z0-9_-]+$/;
var BI_VIEW_ID_PATTERN = /^(?:(?:stage|qa|development)_)?biv_[A-Za-z0-9_-]+$/;
var BI_FITS = ["contain", "cover", "fill"];
var BI_THEMES = ["dark", "light"];
var BI_REFRESH_MIN_S = 30;
var BI_REFRESH_MAX_S = 86400;
var BI_ROTATE_MIN_S = 10;
var BI_ROTATE_MAX_S = 3600;
var GUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
var TENANT_DOMAIN = /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
var TOKEN_FILE_MAX_BYTES = 8192;
var NAME_MAX = 80;
var APP_ID = /^[A-Za-z0-9_.:-]{1,128}$/;
var SITE = /^[A-Za-z0-9_.~-]{1,255}$/;
var VIEW_SEGMENT = /^[A-Za-z0-9_.%~-]{1,200}$/;
function biConnectionId(value, command) {
  if (!value)
    throw usageError("bi connection ".concat(command, " requires <id>."));
  if (!BI_CONNECTION_ID_PATTERN.test(value)) {
    throw usageError("A connection id looks like bic_ followed by letters, digits, - or _.", {
      command: "screenrig bi connection list",
      reason: "List this project's connections and their ids."
    });
  }
  return value;
}
function biViewId(value, command) {
  if (!value)
    throw usageError("bi view ".concat(command, " requires <id>."));
  if (!BI_VIEW_ID_PATTERN.test(value)) {
    throw usageError("A view id looks like biv_ followed by letters, digits, - or _.", {
      command: "screenrig bi view list",
      reason: "List this project's views and their ids."
    });
  }
  return value;
}
function biConnectionOption(value) {
  if (!BI_CONNECTION_ID_PATTERN.test(value)) {
    throw usageError("--connection-id takes a connection id (bic_\u2026).", { command: "screenrig bi connection list", reason: "List this project's connections and their ids." });
  }
  return value;
}
function biName(value) {
  const name = value.trim();
  if (!name || [...name].length > NAME_MAX || new RegExp("\\p{Cc}", "u").test(name))
    throw usageError("--name takes 1 to ".concat(NAME_MAX, " characters without control characters."));
  return name;
}
function biAddress(value) {
  const text = value.trim();
  if (!/^https?:\/\/[^\s]+$/i.test(text))
    throw usageError("--url takes the system's address, such as https://grafana.example.com, https://example.com/grafana or https://tableau.example.com.");
  return text;
}
function biOrgId(value) {
  if (!/^[1-9]\d{0,9}$/.test(value))
    throw usageError("--org-id takes a Grafana organization id: a whole number from 1.");
  return value;
}
function biPanelId(value) {
  if (!/^\d{1,10}$/.test(value))
    throw usageError("--panel takes a panel id: a whole number, as in the dashboard's viewPanel.");
  return value;
}
function biPixels(value) {
  if (!/^[1-9]\d{0,4}$/.test(value) || Number(value) > 1e4)
    throw usageError("--width and --height take a size in pixels, 1 to 10000.");
  return value;
}
function biDashboardUid(value) {
  if (!/^[A-Za-z0-9_.-]{1,128}$/.test(value))
    throw usageError("--dashboard takes a dashboard uid, the part after /d/ in its address.", { command: "screenrig bi connection browse ID", reason: "List the dashboards the connection can show, with their uids." });
  return value;
}
function biTenantId(value) {
  const text = value.trim();
  if (!GUID.test(text) && !(text.length <= 253 && TENANT_DOMAIN.test(text))) {
    throw usageError("--tenant-id takes your Microsoft Entra Directory (tenant) ID, a GUID, or its domain such as contoso.onmicrosoft.com.");
  }
  return text;
}
function biGuid(flag, what) {
  return (value) => {
    const text = value.trim();
    if (!GUID.test(text))
      throw usageError("".concat(flag, " takes ").concat(what, ", a GUID."));
    return text;
  };
}
var biClientId = biGuid("--client-id", "the Application (client) ID of your Microsoft Entra app registration");
var biWorkspaceId = biGuid("--workspace", "a Power BI workspace id, the part after /groups/ in a report's address");
var biReportId = biGuid("--report", "a Power BI report id, the part after /reports/ in its address");
function biAppId(flag, what) {
  return (value) => {
    const text = value.trim();
    if (!APP_ID.test(text))
      throw usageError("".concat(flag, " takes ").concat(what, "."));
    return text;
  };
}
var biAppClientId = biAppId("--client-id", "the Client ID of the connected app (Tableau: Settings > Connected Apps)");
var biSecretId = biAppId("--secret-id", "the Secret ID of a secret generated for the connected app, not the secret value");
function biTableauAddress(value) {
  const text = value.trim();
  if (!/^https:\/\/[^\s]+$/i.test(text))
    throw usageError("--url takes the https address of Tableau Server or your Tableau Cloud pod, such as https://tableau.example.com or https://10ay.online.tableau.com.");
  return text;
}
function biSite(value) {
  const text = value.trim();
  if (text !== "" && !SITE.test(text))
    throw usageError("--site takes the site's content URL, the part after /site/ or /t/ in a view's address (--default-site is Tableau Server's default site).");
  return text;
}
function biUsername(value) {
  const text = value.trim();
  if (!text || [...text].length > 320 || new RegExp("\\p{Cc}", "u").test(text))
    throw usageError("--username takes the Tableau user the screens' views are shown as (an email address on Tableau Cloud), or the service account a web connection signs in as.");
  return text;
}
function biViewPath(value) {
  const text = value.trim();
  const at = text.indexOf("/");
  const workbook = at < 0 ? "" : text.slice(0, at);
  const sheet = at < 0 ? "" : text.slice(at + 1);
  const valid = (segment) => VIEW_SEGMENT.test(segment) && segment !== "." && segment !== "..";
  if (!valid(workbook) || !valid(sheet)) {
    throw usageError("--view takes Workbook/View, the names after /views/ in the view's address.", { command: "screenrig bi connection browse ID", reason: "List the views the connection can show, with their paths." });
  }
  return text;
}
function biPage(value, previous) {
  const name = value.trim();
  if (!name || [...name].length > 200 || new RegExp("\\p{Cc}", "u").test(name))
    throw usageError("--page takes a page name or display name of 1 to 200 characters without control characters.");
  const pages = previous ? JSON.parse(previous) : [];
  pages.push(name);
  return JSON.stringify(pages);
}
function biTime(value) {
  if (!/^[A-Za-z0-9:+\-/_.,]{1,64}$/.test(value))
    throw usageError("--from and --to take a Grafana time such as now-6h, now/d, or an epoch in milliseconds.");
  return value;
}
function biVar(value, previous) {
  const at = value.indexOf("=");
  const rawName = at < 0 ? value : value.slice(0, at);
  const name = rawName.startsWith("var-") ? rawName : "var-".concat(rawName);
  if (at < 0 || !/^var-[A-Za-z0-9_-]{1,64}$/.test(name))
    throw usageError("--var takes NAME=VALUE, such as --var host=web1; NAME is the dashboard variable's name.");
  const text = value.slice(at + 1);
  if ([...text].length > 200 || new RegExp("\\p{Cc}", "u").test(text))
    throw usageError("--var values are at most 200 characters without control characters.");
  const vars = previous ? JSON.parse(previous) : {};
  vars[name] = text;
  return JSON.stringify(vars);
}
function biRefreshOption(value) {
  biRefreshSeconds(value);
  return value;
}
function biRefreshSeconds(value) {
  const text = value.trim();
  if (text === "0" || text.toLowerCase() === "off")
    return 0;
  const ms = /^\d+$/.test(text) ? Number(text) * 1e3 : snoozeDurationMs(text);
  const seconds = ms === void 0 ? NaN : Math.round(ms / 1e3);
  if (!Number.isFinite(seconds) || seconds < BI_REFRESH_MIN_S || seconds > BI_REFRESH_MAX_S) {
    throw usageError("--refresh takes a cadence from 30s to 24h, such as 30s, 5m, 1h or a number of seconds, or 0 for none (a Power BI or Tableau view that updates itself).");
  }
  return seconds;
}
function biRotateOption(value) {
  biRotateSeconds(value);
  return value;
}
function biRotateSeconds(value) {
  const text = value.trim();
  if (text === "0" || text.toLowerCase() === "off")
    return 0;
  const ms = /^\d+$/.test(text) ? Number(text) * 1e3 : snoozeDurationMs(text);
  const seconds = ms === void 0 ? NaN : Math.round(ms / 1e3);
  if (!Number.isFinite(seconds) || seconds < BI_ROTATE_MIN_S || seconds > BI_ROTATE_MAX_S) {
    throw usageError("--rotate takes how long each page or sheet shows, from 10s to 1h, such as 30s or 2m, or 0 for one.");
  }
  return seconds;
}
async function readToken(file, runtime, what = "token") {
  const text = (await readAuthoringText(file, runtime, TOKEN_FILE_MAX_BYTES)).trim();
  if (!text)
    throw usageError("".concat(file === "-" ? "stdin" : file, " holds no ").concat(what, "."));
  if (/\s/.test(text))
    throw usageError("".concat(file === "-" ? "stdin" : file, " must hold only the ").concat(what, ": one value without spaces or line breaks."));
  return text;
}
function biProblem(error, id) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  if (problem.next)
    return error;
  const withNext = (command, reason) => new CliError({ ...problem, next: { command, reason } }, error.exitCode, error.warnings);
  const connection = id !== void 0 && BI_CONNECTION_ID_PATTERN.test(id);
  if (problem.code === "bi_upstream_refused") {
    return withNext(connection ? "screenrig bi connection test ".concat(id) : "screenrig bi connection list", "Fix the connection as the detail says (Grafana: a Viewer service-account token; Power BI: the app's client secret value, the Embed content in apps and Service principals can call Fabric public APIs tenant settings and the app's role in the workspace; Tableau: the connected app is enabled, its client id, secret id and secret value belong together, and the user exists on the site), update it with bi connection update, then test it.");
  }
  if (problem.code === "bi_upstream_unavailable") {
    return withNext(connection ? "screenrig bi connection test ".concat(id) : "screenrig bi connection list", "Check that the system is reachable (Grafana: its address and the Image Renderer plugin or a remote rendering service; Tableau: the server or Tableau Cloud pod address), then test the connection again. Nothing was changed.");
  }
  if (problem.code === "bi_web_unavailable") {
    return withNext("screenrig bi connection list", "This server has no page renderer, so a web connection or view cannot be made here. Nothing was changed; the other kinds are unaffected.");
  }
  if (problem.code === "resource_conflict" && connection) {
    return withNext("screenrig bi view list", "Delete the views the detail names (bi view delete ID), then delete the connection.");
  }
  if (problem.code === "not_found" && id !== void 0) {
    return connection ? withNext("screenrig bi connection list", "List this project's connections and their ids. A connection belongs to one project.") : withNext("screenrig bi view list", "List this project's views and their ids. A view belongs to one project.");
  }
  return error;
}
async function biCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw biProblem(error, id);
  }
}
var dash = (value) => value && value.length ? value : "-";
function checkLines(checks) {
  return (checks ?? []).map((check) => "  ".concat(!check.ok ? "failed" : check.warn ? "warning" : "ok", " ").concat(check.name).concat(check.detail ? ": ".concat(check.detail) : ""));
}
function connectionLines(connection) {
  if (!connection)
    return [];
  const test = connection.last_test;
  return [
    "id: ".concat(connection.id),
    "name: ".concat(connection.name),
    "kind: ".concat(connection.kind),
    ...connection.kind === "powerbi" ? connection.config?.connection_id ? ["connection: ".concat(connection.config.connection_id, " (a Microsoft connection signs in; this one holds no secret)")] : ["tenant: ".concat(dash(connection.config?.tenant_id)), "app (client id): ".concat(dash(connection.config?.client_id))] : connection.kind === "tableau" ? [
      "url: ".concat(dash(connection.config?.url)),
      "site: ".concat(connection.config?.site || "(default site)"),
      "app (client id): ".concat(dash(connection.config?.client_id)),
      "secret id: ".concat(dash(connection.config?.secret_id)),
      "user: ".concat(dash(connection.config?.username))
    ] : connection.kind === "web" ? webConnectionLines(connection) : ["url: ".concat(dash(connection.config?.url)), "org: ".concat(connection.config?.org_id ?? 1)],
    "".concat(connection.kind === "web" ? "password" : "secret", ": ").concat(connection.secret?.set ? "set".concat(connection.secret.hint ? " (ends ".concat(connection.secret.hint, ")") : "") : "not set"),
    ...connection.embed_origin ? ["embed origin: ".concat(connection.embed_origin)] : [],
    "last test: ".concat(test ? "".concat(test.ok ? "ok" : "failed", " at ").concat(test.at) : "never"),
    ...test ? checkLines(test.checks) : [],
    "revision: ".concat(connection.revision)
  ];
}
function connectionTableLines(items) {
  if (!items.length)
    return ["No connections"];
  const where = (item) => item.kind === "powerbi" ? item.config?.connection_id ?? item.config?.tenant_id ?? "" : item.kind === "web" ? item.config?.login_url ?? "" : item.config?.url ?? "";
  return table(["ID", "KIND", "NAME", "URL OR TENANT", "TEST"], items.map((item) => [
    item.id,
    item.kind,
    item.name,
    dash(where(item)),
    item.last_test ? item.last_test.ok ? "ok" : "failed" : "never"
  ]));
}
function targetText(view) {
  const target = view.target ?? {};
  if (view.kind === "tableau") {
    const parts2 = [target.public_url ? "Tableau Public ".concat(target.public_url) : "view ".concat(target.view ?? "?")];
    if (target.rotate_sheets)
      parts2.push(view.rotate_s ? "every sheet each ".concat(view.rotate_s, "s") : "every sheet");
    return parts2.join(", ");
  }
  if (view.kind === "web" || target.url)
    return "page ".concat(target.url ?? "?");
  if (target.public_url)
    return "public link ".concat(target.public_url);
  if (view.kind === "powerbi" || target.report_id) {
    const parts2 = ["report ".concat(target.report_id ?? "?"), "workspace ".concat(target.workspace_id ?? "?")];
    if (target.pages?.length)
      parts2.push("pages ".concat(target.pages.join(", ")));
    if (target.rotate_all_pages)
      parts2.push("every page");
    if (view.rotate_s)
      parts2.push("each ".concat(view.rotate_s, "s"));
    return parts2.join(", ");
  }
  const parts = ["dashboard ".concat(target.dashboard_uid ?? "?")];
  if (target.panel_id !== void 0)
    parts.push("panel ".concat(target.panel_id));
  if (target.from || target.to)
    parts.push("".concat(target.from ?? "default", " to ").concat(target.to ?? "default"));
  for (const [name, value] of Object.entries(target.vars ?? {}))
    parts.push("".concat(name, "=").concat(value));
  if (target.theme)
    parts.push(target.theme);
  return parts.join(", ");
}
function viewLines(view) {
  if (!view)
    return [];
  const status = view.status ?? { last_ok_at: null, last_error: null };
  return [
    "id: ".concat(view.id),
    "name: ".concat(view.name),
    "connection: ".concat(view.connection_id ?? "(public link)"),
    "shows: ".concat(targetText(view)),
    "refresh: ".concat(view.refresh_s === 0 ? "never" : "every ".concat(view.refresh_s, "s")),
    ...view.kind === "powerbi" || view.kind === "tableau" ? [] : ["fit: ".concat(view.fit)],
    ...view.wait_for ? ["wait for: ".concat(view.wait_for)] : [],
    ...view.wait_ms ? ["wait after: ".concat(view.wait_ms, " ms")] : [],
    ...view.clip ? ["clip: ".concat(view.clip)] : [],
    "status: ".concat(status.last_error ? "".concat(status.last_error.code, " (").concat(status.last_error.detail, ")") : status.last_ok_at ? "ok since ".concat(status.last_ok_at) : "not shown yet"),
    "embed_url: ".concat(view.embed_url ?? "(none: this server has no embed host)"),
    "revision: ".concat(view.revision)
  ];
}
function viewTableLines(items) {
  if (!items.length)
    return ["No views"];
  return table(["ID", "NAME", "SHOWS", "REFRESH", "STATUS"], items.map((item) => [
    item.id,
    item.name,
    targetText(item),
    item.refresh_s === 0 ? "never" : "".concat(item.refresh_s, "s"),
    item.status?.last_error ? item.status.last_error.code : item.status?.last_ok_at ? "ok" : "new"
  ]));
}
var EMBED_HINT = "Put this URL in an iframe primitive (content_fit fill).";
function listBody(response) {
  const items = response.body?.items;
  return Array.isArray(items) ? items : [];
}
async function allPages(client, path2, id) {
  const items = [];
  let cursor;
  let response = await biCall(client, { method: "GET", path: path2 }, id);
  for (let pages = 0; pages < 1e3; pages++) {
    items.push(...listBody(response));
    cursor = response.body?.next_cursor ?? void 0;
    if (!cursor)
      break;
    response = await biCall(client, { method: "GET", path: path2, query: { cursor } }, id);
  }
  return { items, response };
}
var handleBiConnectionCreate = commandHandler(async (args, runtime, resolved) => {
  const url = flagString(args.flags, "url");
  const tokenFile = flagString(args.flags, "token-file");
  if (url === void 0 || tokenFile === void 0)
    throw usageError("bi connection create grafana requires --url and --token-file.");
  const name = flagString(args.flags, "name") ?? biHostName(url);
  const orgId = flagString(args.flags, "org-id");
  const secret = await readToken(tokenFile, runtime);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await biCall(client, {
    method: "POST",
    path: CONNECTIONS_PATH,
    idempotent: true,
    body: { name: biName(name), kind: "grafana", config: { url, ...orgId !== void 0 ? { org_id: Number(orgId) } : {} }, secret }
  });
  const created = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Created connection ".concat(created?.id ?? "").trimEnd(),
      ...connectionLines(created),
      "",
      "Next: screenrig bi connection test ".concat(created?.id ?? "ID")
    ].join("\n")
  };
});
var handleBiConnectionCreatePowerBI = commandHandler(async (args, runtime, resolved) => {
  const tenant = flagString(args.flags, "tenant-id");
  const clientId = flagString(args.flags, "client-id");
  const secretFile = flagString(args.flags, "secret-file");
  const connectionId2 = flagString(args.flags, "connection-id");
  const name = biName(flagString(args.flags, "name") ?? "Power BI");
  let body;
  if (connectionId2 !== void 0) {
    if (tenant !== void 0 || clientId !== void 0 || secretFile !== void 0) {
      throw usageError("--connection-id replaces --tenant-id, --client-id and --secret-file: the Microsoft connection holds them.");
    }
    body = { name, kind: "powerbi", config: { connection_id: connectionId2 } };
  } else {
    if (tenant === void 0 || clientId === void 0 || secretFile === void 0) {
      throw usageError("bi connection create powerbi requires --connection-id, or --tenant-id, --client-id and --secret-file.");
    }
    body = { name, kind: "powerbi", config: { tenant_id: tenant, client_id: clientId }, secret: await readToken(secretFile, runtime, "client secret") };
  }
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await biCall(client, { method: "POST", path: CONNECTIONS_PATH, idempotent: true, body });
  const created = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Created connection ".concat(created?.id ?? "").trimEnd(),
      ...connectionLines(created),
      "",
      "Next: screenrig bi connection test ".concat(created?.id ?? "ID")
    ].join("\n")
  };
});
var handleBiConnectionCreateWeb = commandHandler(async (args, runtime, resolved) => {
  const mode = flagString(args.flags, "login-mode");
  const loginUrl = flagString(args.flags, "login-url");
  const username = flagString(args.flags, "username");
  const passwordFile = flagString(args.flags, "password-file");
  const totpFile = flagString(args.flags, "totp-file");
  const stepsFile = flagString(args.flags, "steps");
  const cookiesFile = flagString(args.flags, "cookies-file");
  if (mode === void 0)
    throw usageError("bi connection create web requires --login-mode auto, steps or none.");
  if (mode === "none") {
    const unused = [["--login-url", loginUrl], ["--username", username], ["--password-file", passwordFile], ["--totp-file", totpFile], ["--steps", stepsFile]].filter(([, value]) => value !== void 0).map(([flag]) => flag);
    if (unused.length)
      throw usageError("--login-mode none does not sign in, so ".concat(unused.join(", "), " would not be used: give --cookies-file with the jar, or choose --login-mode auto or steps."));
  } else {
    if (loginUrl === void 0)
      throw usageError("--login-mode ".concat(mode, " needs --login-url: the page where the sign-in happens. The password is typed only there, never into a view's address."));
    if (mode === "auto" && (username === void 0 || passwordFile === void 0))
      throw usageError("--login-mode auto fills the sign-in form on --login-url: it needs --username and --password-file.");
    if (mode === "steps" && stepsFile === void 0)
      throw usageError("--login-mode steps runs a script: give it as --steps FILE, a JSON array of steps.");
    if (mode === "auto" && stepsFile !== void 0)
      throw usageError("--steps is the script of --login-mode steps; auto fills the form without one.");
  }
  singleStdin([["--password-file", passwordFile], ["--totp-file", totpFile], ["--steps", stepsFile], ["--cookies-file", cookiesFile]]);
  const steps = stepsFile !== void 0 ? await readWebSteps(stepsFile, runtime) : void 0;
  const secret = passwordFile !== void 0 ? await readWebPassword(passwordFile, runtime) : void 0;
  const totp = totpFile !== void 0 ? await readTotpSeed(totpFile, runtime) : void 0;
  const cookies = cookiesFile !== void 0 ? await readWebCookies(cookiesFile, runtime) : void 0;
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await biCall(client, {
    method: "POST",
    path: CONNECTIONS_PATH,
    idempotent: true,
    body: {
      name: biName(flagString(args.flags, "name") ?? (loginUrl !== void 0 ? biHostName(loginUrl, "Web page") : "Web page")),
      kind: "web",
      config: { login_mode: mode, ...loginUrl !== void 0 ? { login_url: biWebLoginUrl(loginUrl) } : {}, ...username !== void 0 ? { username } : {}, ...steps ? { steps } : {} },
      ...secret !== void 0 ? { secret } : {},
      ...totp !== void 0 ? { totp_secret: totp } : {},
      ...cookies ? { cookies } : {}
    }
  });
  const created = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Created connection ".concat(created?.id ?? "").trimEnd(),
      ...connectionLines(created),
      "",
      "Next: screenrig bi connection test ".concat(created?.id ?? "ID")
    ].join("\n")
  };
});
var handleBiConnectionCreateTableau = commandHandler(async (args, runtime, resolved) => {
  const url = flagString(args.flags, "url");
  const site = flagText(args.flags, "site");
  const clientId = flagString(args.flags, "client-id");
  const secretId = flagString(args.flags, "secret-id");
  const username = flagString(args.flags, "username");
  const secretFile = flagString(args.flags, "secret-file");
  if (url === void 0 || clientId === void 0 || secretId === void 0 || username === void 0 || secretFile === void 0) {
    throw usageError("bi connection create tableau requires --url, --client-id, --secret-id, --username and --secret-file.");
  }
  const secret = await readToken(secretFile, runtime, "secret value");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await biCall(client, {
    method: "POST",
    path: CONNECTIONS_PATH,
    idempotent: true,
    body: {
      name: biName(flagString(args.flags, "name") ?? biHostName(url, "Tableau")),
      kind: "tableau",
      config: { url, ...site ? { site } : {}, client_id: clientId, secret_id: secretId, username },
      secret
    }
  });
  const created = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Created connection ".concat(created?.id ?? "").trimEnd(),
      ...connectionLines(created),
      ...created?.embed_origin ? ["", "Add ".concat(created.embed_origin, " to the connected app's domain allowlist in Tableau.")] : [],
      "",
      "Next: screenrig bi connection test ".concat(created?.id ?? "ID")
    ].join("\n")
  };
});
function flagText(flags, name) {
  const value = flags[name];
  return typeof value === "string" ? value : void 0;
}
function biHostName(url, fallback = "Grafana") {
  try {
    return new URL(url).hostname;
  } catch {
    return fallback;
  }
}
var handleBiConnectionList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const { items, response } = await allPages(client, CONNECTIONS_PATH);
  return {
    envelope: jsonBody({ ...response, body: { items, next_cursor: null } }, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Connections (".concat(items.length, ")"), ...connectionTableLines(items)].join("\n")
  };
});
var handleBiConnectionShow = commandHandler(async (args, runtime, resolved) => {
  const id = biConnectionId(args.positionals[3], "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await biCall(client, { method: "GET", path: "".concat(CONNECTIONS_PATH, "/").concat(id) }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Connection", ...connectionLines(response.body)].join("\n")
  };
});
var handleBiConnectionUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = biConnectionId(args.positionals[3], "update");
  const name = flagString(args.flags, "name");
  const url = flagString(args.flags, "url");
  const orgId = flagString(args.flags, "org-id");
  const tenant = flagString(args.flags, "tenant-id");
  const clientId = flagString(args.flags, "client-id");
  const site = flagBool(args.flags, "default-site") ? "" : flagText(args.flags, "site");
  const secretId = flagString(args.flags, "secret-id");
  const username = flagString(args.flags, "username");
  const tokenFile = flagString(args.flags, "token-file");
  const secretFile = flagString(args.flags, "secret-file");
  const passwordFile = flagString(args.flags, "password-file");
  const loginMode = flagString(args.flags, "login-mode");
  const loginUrl = flagString(args.flags, "login-url");
  const stepsFile = flagString(args.flags, "steps");
  const totpFile = flagString(args.flags, "totp-file");
  const cookiesFile = flagString(args.flags, "cookies-file");
  const clearPassword = flagBool(args.flags, "clear-password");
  const clearTotp = flagBool(args.flags, "clear-totp");
  const clearCookies = flagBool(args.flags, "clear-cookies");
  if ([tokenFile, secretFile, passwordFile].filter((file) => file !== void 0).length + (clearPassword ? 1 : 0) > 1) {
    throw usageError("Give one of --token-file, --secret-file, --password-file or --clear-password: each is the connection's secret.");
  }
  const secretSource = tokenFile ?? secretFile ?? passwordFile;
  if ([name, url, orgId, tenant, clientId, site, secretId, username, secretSource, loginMode, loginUrl, stepsFile, totpFile, cookiesFile].every((value) => value === void 0) && !clearPassword && !clearTotp && !clearCookies) {
    throw usageError("bi connection update requires --name, --url, --org-id, --tenant-id, --client-id, --site, --default-site, --secret-id, --username, --token-file, --secret-file, --login-mode, --login-url, --password-file, --clear-password, --totp-file, --clear-totp, --steps, --cookies-file or --clear-cookies.");
  }
  singleStdin([["--token-file", tokenFile], ["--secret-file", secretFile], ["--password-file", passwordFile], ["--totp-file", totpFile], ["--steps", stepsFile], ["--cookies-file", cookiesFile]]);
  const config = {
    ...url !== void 0 ? { url } : {},
    ...orgId !== void 0 ? { org_id: Number(orgId) } : {},
    ...tenant !== void 0 ? { tenant_id: tenant } : {},
    ...clientId !== void 0 ? { client_id: clientId } : {},
    ...site !== void 0 ? { site } : {},
    ...secretId !== void 0 ? { secret_id: secretId } : {},
    ...username !== void 0 ? { username } : {},
    ...loginMode !== void 0 ? { login_mode: loginMode } : {},
    ...loginUrl !== void 0 ? { login_url: biWebLoginUrl(loginUrl) } : {},
    ...stepsFile !== void 0 ? { steps: await readWebSteps(stepsFile, runtime) } : {}
  };
  const body = {
    ...name !== void 0 ? { name: biName(name) } : {},
    ...Object.keys(config).length ? { config } : {},
    ...passwordFile !== void 0 ? { secret: await readWebPassword(passwordFile, runtime) } : secretSource !== void 0 ? { secret: await readToken(secretSource, runtime, secretFile !== void 0 ? "client secret" : "token") } : clearPassword ? { secret: "" } : {},
    ...totpFile !== void 0 ? { totp_secret: await readTotpSeed(totpFile, runtime) } : clearTotp ? { totp_secret: "" } : {},
    ...cookiesFile !== void 0 ? { cookies: await readWebCookies(cookiesFile, runtime) } : clearCookies ? { cookies: [] } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (url !== void 0 && secretSource === void 0) {
    const current = await biCall(client, { method: "GET", path: "".concat(CONNECTIONS_PATH, "/").concat(id) }, id);
    if (addressOriginChanged(current.body?.config?.url, url)) {
      throw usageError("Changing --url to another host, scheme or port needs the secret again: add --token-file FILE (Grafana) or --secret-file FILE (Tableau). The stored secret is only sent to the address it was saved for.");
    }
  }
  const response = await biCall(client, { method: "PATCH", path: "".concat(CONNECTIONS_PATH, "/").concat(id), idempotent: true, body, headers: revisionHeader(args) }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Updated connection ".concat(id), ...connectionLines(response.body)].join("\n")
  };
});
function addressOriginChanged(current, next) {
  if (!current)
    return false;
  try {
    return new URL(current).origin !== new URL(next).origin;
  } catch {
    return false;
  }
}
function revisionHeader(args) {
  const revision2 = flagString(args.flags, "expect-rev");
  return revision2 ? { "if-match": quotedRevision(revision2) } : void 0;
}
var handleBiConnectionDelete = commandHandler(async (args, runtime, resolved) => {
  const id = biConnectionId(args.positionals[3], "delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await biCall(client, { method: "DELETE", path: "".concat(CONNECTIONS_PATH, "/").concat(id), idempotent: true, headers: revisionHeader(args) }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: "Deleted connection ".concat(id, ".")
  };
});
var handleBiConnectionTest = commandHandler(async (args, runtime, resolved) => {
  const id = biConnectionId(args.positionals[3], "test");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await biCall(client, { method: "POST", path: "".concat(CONNECTIONS_PATH, "/").concat(id, "/test"), idempotent: true }, id);
  const report = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Connection ".concat(id, ": ").concat(report?.ok ? "ok" : "failed"),
      ...checkLines(report?.checks),
      ...report?.ok ? ["", "This does not judge a dashboard's permissions or a remote renderer: run screenrig bi view test ID to render for real."] : []
    ].join("\n")
  };
});
var handleBiConnectionBrowse = commandHandler(async (args, runtime, resolved) => {
  const id = biConnectionId(args.positionals[3], "browse");
  const query = flagString(args.flags, "query");
  const dashboard = flagString(args.flags, "dashboard");
  const workspace = flagString(args.flags, "workspace");
  if (dashboard !== void 0 && workspace !== void 0)
    throw usageError("Give --dashboard (Grafana) or --workspace (Power BI), not both.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const items = [];
  let cursor;
  const scope = { ...dashboard !== void 0 ? { dashboard } : {}, ...workspace !== void 0 ? { workspace } : {} };
  let response = await biCall(client, { method: "GET", path: "".concat(CONNECTIONS_PATH, "/").concat(id, "/browse"), query: { ...query !== void 0 ? { query } : {}, ...scope } }, id);
  for (let pages = 0; pages < 100; pages++) {
    items.push(...listBody(response));
    cursor = response.body?.next_cursor ?? void 0;
    if (!cursor)
      break;
    response = await biCall(client, { method: "GET", path: "".concat(CONNECTIONS_PATH, "/").concat(id, "/browse"), query: { ...query !== void 0 ? { query } : {}, cursor } }, id);
  }
  const heading = response.body?.dashboard;
  const text = (item, key) => String(item[key] ?? "");
  let lines;
  if (dashboard !== void 0) {
    lines = ["Panels of ".concat(heading?.title ?? dashboard, " (").concat(items.length, ")"), ...table(["PANEL", "TYPE", "TITLE"], items.map((item) => [text(item, "id"), text(item, "type"), text(item, "title")]))];
  } else if (workspace !== void 0) {
    lines = [
      "Reports in workspace ".concat(workspace, " (").concat(items.length, ")"),
      ...table(["REPORT", "NAME"], items.map((item) => [text(item, "id"), text(item, "name")])),
      ...items.length ? ["", "Next: screenrig bi view create --connection-id ".concat(id, " --workspace ").concat(workspace, " --report REPORT")] : []
    ];
  } else if (items.some((item) => "uid" in item)) {
    lines = ["Dashboards (".concat(items.length, ")"), ...table(["UID", "FOLDER", "TITLE"], items.map((item) => [text(item, "uid"), text(item, "folder"), text(item, "title")]))];
  } else if (items.some((item) => "path" in item)) {
    lines = [
      "Views (".concat(items.length, ")"),
      ...table(["VIEW", "NAME"], items.map((item) => [text(item, "path"), text(item, "name")])),
      "",
      "Next: screenrig bi view create --connection-id ".concat(id, " --view WORKBOOK/VIEW")
    ];
  } else {
    lines = [
      "Workspaces (".concat(items.length, ")"),
      ...table(["WORKSPACE", "NAME"], items.map((item) => [text(item, "id"), text(item, "name")])),
      ...items.length ? ["", "Next: screenrig bi connection browse ".concat(id, " --workspace WORKSPACE")] : []
    ];
  }
  return {
    envelope: jsonBody({ ...response, body: { ...heading ? { dashboard: heading } : {}, ...response.body?.workspace ? { workspace: response.body.workspace } : {}, items, next_cursor: null } }, client.requestId),
    exitCode: ExitCode.Success,
    human: lines.join("\n")
  };
});
function tableauPath(url) {
  const named = /\/(?:views|viz|vizhome)\/([^/?#]+)\/([^/?#]+)/.exec(url);
  if (named)
    return "".concat(named[1], "/").concat(named[2]);
  return /^[^/:\s]+\/[^/:\s]+$/.test(url.trim()) ? url.trim() : void 0;
}
function nameFromAddress(url, dashboard, report, view) {
  const path2 = view ?? (url !== void 0 ? tableauPath(url) : void 0);
  if (path2 !== void 0)
    return [..."Tableau " + path2].slice(0, NAME_MAX).join("");
  if (report !== void 0 || url !== void 0 && /\/reports\/|reportEmbed/i.test(url))
    return "Power BI report";
  const uid = dashboard ?? (url ? /\/d(?:-solo)?\/([^/?#]+)/.exec(url)?.[1] : void 0);
  if (uid)
    return "Grafana ".concat(uid);
  return url !== void 0 ? biHostName(url, "Grafana dashboard") : "Grafana dashboard";
}
function publicLinkKind(link) {
  try {
    const host = new URL(link).hostname.toLowerCase();
    if (host === "public.tableau.com")
      return "tableau";
    return host === "powerbi.com" || host.endsWith(".powerbi.com") ? "powerbi" : "grafana";
  } catch {
    return "grafana";
  }
}
var TARGET_FLAGS = ["panel", "from", "to", "var", "theme", "timezone", "workspace", "report", "page", "view"];
function targetFromFlags(args, base) {
  const target = { ...base ?? {}, ...base?.vars ? { vars: { ...base.vars } } : {}, ...base?.pages ? { pages: [...base.pages] } : {} };
  const dashboard = flagString(args.flags, "dashboard");
  if (dashboard !== void 0) {
    for (const key of Object.keys(target))
      delete target[key];
    target.dashboard_uid = dashboard;
  }
  const workspace = flagString(args.flags, "workspace");
  const report = flagString(args.flags, "report");
  if (workspace !== void 0 || report !== void 0) {
    const keptWorkspace = base?.workspace_id;
    for (const key of Object.keys(target))
      delete target[key];
    const chosen = workspace ?? keptWorkspace;
    if (chosen !== void 0)
      target.workspace_id = chosen;
    if (report !== void 0)
      target.report_id = report;
  }
  const tableauView = flagString(args.flags, "view");
  if (tableauView !== void 0) {
    const rotating = target.rotate_sheets;
    for (const key of Object.keys(target))
      delete target[key];
    target.view = tableauView;
    if (rotating)
      target.rotate_sheets = true;
  }
  if (flagBool(args.flags, "rotate-sheets"))
    target.rotate_sheets = true;
  const pages = flagString(args.flags, "page");
  if (pages !== void 0) {
    target.pages = JSON.parse(pages);
    delete target.rotate_all_pages;
  }
  if (flagBool(args.flags, "all-pages")) {
    target.rotate_all_pages = true;
    delete target.pages;
  }
  const panel = flagString(args.flags, "panel");
  if (panel !== void 0)
    target.panel_id = Number(panel);
  const from = flagString(args.flags, "from");
  if (from !== void 0)
    target.from = from;
  const to = flagString(args.flags, "to");
  if (to !== void 0)
    target.to = to;
  const theme = flagString(args.flags, "theme");
  if (theme !== void 0)
    target.theme = theme;
  const timezone = flagString(args.flags, "timezone");
  if (timezone !== void 0)
    target.timezone = timezone;
  const vars = flagString(args.flags, "var");
  if (vars !== void 0)
    target.vars = { ...target.vars ?? {}, ...JSON.parse(vars) };
  return target;
}
function viewTargetFlagsGiven(args) {
  return [
    ...TARGET_FLAGS.filter((flag) => flagString(args.flags, flag) !== void 0),
    ...flagBool(args.flags, "all-pages") ? ["all-pages"] : [],
    ...flagBool(args.flags, "rotate-sheets") ? ["rotate-sheets"] : []
  ].map((flag) => "--".concat(flag));
}
var handleBiViewCreate = commandHandler(async (args, runtime, resolved) => {
  const connectionId2 = flagString(args.flags, "connection-id");
  const url = flagString(args.flags, "url");
  const dashboard = flagString(args.flags, "dashboard");
  const report = flagString(args.flags, "report");
  const workspace = flagString(args.flags, "workspace");
  const publicUrl = flagString(args.flags, "public-url");
  const tableauView = flagString(args.flags, "view");
  const rotateSheets = flagBool(args.flags, "rotate-sheets");
  const refresh = flagString(args.flags, "refresh");
  const rotate = flagString(args.flags, "rotate");
  const fit = flagString(args.flags, "fit");
  const waitFor = flagString(args.flags, "wait-for");
  const waitMs = flagString(args.flags, "wait-ms");
  const clip = flagString(args.flags, "clip");
  const webFlags = [...waitFor !== void 0 ? ["--wait-for"] : [], ...waitMs !== void 0 ? ["--wait-ms"] : [], ...clip !== void 0 ? ["--clip"] : []];
  const given = viewTargetFlagsGiven(args).filter((flag) => flag !== "--rotate-sheets");
  if (webFlags.length && (publicUrl !== void 0 || dashboard !== void 0 || report !== void 0 || workspace !== void 0 || tableauView !== void 0)) {
    throw usageError("".concat(webFlags.join(", "), " apply to a view of a web connection, which takes the page's address as --url."));
  }
  let body;
  if (publicUrl !== void 0) {
    if (connectionId2 !== void 0 || url !== void 0 || dashboard !== void 0 || given.length) {
      throw usageError("--public-url needs no connection: give it alone, with --name, --refresh, --fit and --rotate-sheets.");
    }
    const kind = publicLinkKind(publicUrl);
    const named = kind === "tableau" ? "Tableau Public ".concat(tableauPath(publicUrl) ?? "viz") : kind === "powerbi" ? "Power BI public report" : "Grafana public dashboard";
    body = { kind, name: flagString(args.flags, "name") ?? [...named].slice(0, NAME_MAX).join(""), target: { public_url: publicUrl, ...rotateSheets ? { rotate_sheets: true } : {} } };
  } else {
    if (connectionId2 === void 0)
      throw usageError("bi view create requires --connection-id with --url, --dashboard, --view or --workspace and --report, or --public-url alone.");
    if (url !== void 0 && (dashboard !== void 0 || given.length)) {
      throw usageError("With --url the target comes from the address; to set ".concat(given.join(", ") || "--dashboard", " give --dashboard UID (Grafana), --workspace and --report (Power BI) or --view (Tableau) instead."));
    }
    if (url === void 0 && dashboard === void 0 && report === void 0 && workspace === void 0 && tableauView === void 0) {
      throw usageError("bi view create requires --url, --dashboard (Grafana), --workspace and --report (Power BI) or --view (Tableau) with --connection-id.");
    }
    if (workspace === void 0 !== (report === void 0))
      throw usageError("--workspace and --report are given together: the workspace and the report in it.");
    if (dashboard !== void 0 && report !== void 0)
      throw usageError("Give --dashboard (Grafana), --workspace and --report (Power BI) or --view (Tableau), not several.");
    body = {
      connection_id: connectionId2,
      name: flagString(args.flags, "name") ?? nameFromAddress(url, dashboard, report, tableauView),
      ...url !== void 0 ? { url, ...rotateSheets ? { target: { rotate_sheets: true } } : {} } : { target: targetFromFlags(args, void 0) }
    };
  }
  body.name = biName(String(body.name));
  if (refresh !== void 0)
    body.refresh_s = biRefreshSeconds(refresh);
  if (rotate !== void 0)
    body.rotate_s = biRotateSeconds(rotate);
  if (fit !== void 0)
    body.fit = fit;
  if (waitFor !== void 0)
    body.wait_for = waitFor;
  if (waitMs !== void 0)
    body.wait_ms = Number(waitMs);
  if (clip !== void 0)
    body.clip = clip;
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await biCall(client, { method: "POST", path: VIEWS_PATH, idempotent: true, body }, connectionId2);
  const created = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Created view ".concat(created?.id ?? "").trimEnd(),
      ...viewLines(created),
      ...created?.embed_url ? ["", EMBED_HINT] : [],
      "",
      "Next: screenrig bi view test ".concat(created?.id ?? "ID")
    ].join("\n")
  };
});
var handleBiViewList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const { items, response } = await allPages(client, VIEWS_PATH);
  return {
    envelope: jsonBody({ ...response, body: { items, next_cursor: null } }, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Views (".concat(items.length, ")"), ...viewTableLines(items)].join("\n")
  };
});
var handleBiViewShow = commandHandler(async (args, runtime, resolved) => {
  const id = biViewId(args.positionals[3], "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await biCall(client, { method: "GET", path: "".concat(VIEWS_PATH, "/").concat(id) }, id);
  const view = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["View", ...viewLines(view), ...view?.embed_url ? ["", EMBED_HINT] : []].join("\n")
  };
});
var handleBiViewUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = biViewId(args.positionals[3], "update");
  const name = flagString(args.flags, "name");
  const url = flagString(args.flags, "url");
  const dashboard = flagString(args.flags, "dashboard");
  const workspace = flagString(args.flags, "workspace");
  const report = flagString(args.flags, "report");
  const publicUrl = flagString(args.flags, "public-url");
  const rotateSheets = flagBool(args.flags, "rotate-sheets");
  const refresh = flagString(args.flags, "refresh");
  const rotate = flagString(args.flags, "rotate");
  const fit = flagString(args.flags, "fit");
  const waitFor = flagString(args.flags, "wait-for");
  const waitMs = flagString(args.flags, "wait-ms");
  const clip = flagString(args.flags, "clip");
  const clearWaitFor = flagBool(args.flags, "clear-wait-for");
  const clearClip = flagBool(args.flags, "clear-clip");
  const webChange = waitFor !== void 0 || waitMs !== void 0 || clip !== void 0 || clearWaitFor || clearClip;
  const given = viewTargetFlagsGiven(args).filter((flag) => flag !== "--rotate-sheets");
  const changesTarget = url !== void 0 || dashboard !== void 0 || publicUrl !== void 0 || given.length > 0 || rotateSheets;
  if (name === void 0 && refresh === void 0 && rotate === void 0 && fit === void 0 && !changesTarget && !webChange) {
    throw usageError("bi view update requires something to change: --name, --refresh, --rotate, --fit, --url, --dashboard, --workspace, --report, --view, --page, --all-pages, --rotate-sheets, --public-url, --wait-for, --clear-wait-for, --wait-ms, --clip, --clear-clip or a target flag.");
  }
  if (dashboard !== void 0 && (workspace !== void 0 || report !== void 0))
    throw usageError("Give --dashboard (Grafana), --workspace and --report (Power BI) or --view (Tableau), not several.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const body = {};
  if (name !== void 0)
    body.name = biName(name);
  if (refresh !== void 0)
    body.refresh_s = biRefreshSeconds(refresh);
  if (rotate !== void 0)
    body.rotate_s = biRotateSeconds(rotate);
  if (fit !== void 0)
    body.fit = fit;
  if (waitFor !== void 0)
    body.wait_for = waitFor;
  else if (clearWaitFor)
    body.wait_for = "";
  if (waitMs !== void 0)
    body.wait_ms = Number(waitMs);
  if (clip !== void 0)
    body.clip = clip;
  else if (clearClip)
    body.clip = "";
  if (publicUrl !== void 0) {
    if (url !== void 0 || dashboard !== void 0 || given.length)
      throw usageError("--public-url replaces the whole target: give it without the other target flags.");
    body.target = { public_url: publicUrl, ...rotateSheets ? { rotate_sheets: true } : {} };
  } else if (url !== void 0) {
    if (dashboard !== void 0 || given.length)
      throw usageError("--url replaces the whole target from the address: give it without the other target flags.");
    body.url = url;
    if (rotateSheets)
      body.target = { rotate_sheets: true };
  } else if (dashboard !== void 0 || given.length || rotateSheets) {
    const current = dashboard !== void 0 ? void 0 : (await biCall(client, { method: "GET", path: "".concat(VIEWS_PATH, "/").concat(id) }, id)).body.target;
    if (current?.public_url && given.length)
      throw usageError("This view shows a public link: change it with --public-url, or create a view of a connection.");
    body.target = targetFromFlags(args, current);
  } else if (rotate !== void 0 && biRotateSeconds(rotate) === 0) {
    const current = (await biCall(client, { method: "GET", path: "".concat(VIEWS_PATH, "/").concat(id) }, id)).body.target;
    if (current?.rotate_sheets) {
      const { rotate_sheets: _turning, ...kept } = current;
      body.target = kept;
    }
  }
  const response = await biCall(client, { method: "PATCH", path: "".concat(VIEWS_PATH, "/").concat(id), idempotent: true, body, headers: revisionHeader(args) }, id);
  const view = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Updated view ".concat(id), ...viewLines(view)].join("\n")
  };
});
var handleBiViewDelete = commandHandler(async (args, runtime, resolved) => {
  const id = biViewId(args.positionals[3], "delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await biCall(client, { method: "DELETE", path: "".concat(VIEWS_PATH, "/").concat(id), idempotent: true, headers: revisionHeader(args) }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: "Deleted view ".concat(id, ". A screen still showing its embed_url answers not_found until its playlist changes.")
  };
});
var handleBiViewTest = commandHandler(async (args, runtime, resolved) => {
  const id = biViewId(args.positionals[3], "test");
  const output = flagString(args.flags, "output");
  const width = flagString(args.flags, "width");
  const height = flagString(args.flags, "height");
  if (output === void 0 && (width !== void 0 || height !== void 0))
    throw usageError("--width and --height set the size of the image --output saves.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (output === void 0) {
    const response = await biCall(client, { method: "POST", path: "".concat(VIEWS_PATH, "/").concat(id, "/test"), idempotent: true }, id);
    const report = response.body;
    return {
      envelope: jsonBody(response, client.requestId),
      exitCode: ExitCode.Success,
      human: [
        "View ".concat(id, ": ").concat(report?.ok ? "ok" : "failed"),
        ...checkLines(report?.checks),
        ...report?.ok ? [] : ["", "Next: screenrig bi connection test ID, with the view's connection, checks the credentials themselves."]
      ].join("\n")
    };
  }
  const query = { width: width ?? "1920", height: height ?? "1080" };
  let download;
  try {
    download = await client.download({ method: "GET", path: "".concat(VIEWS_PATH, "/").concat(id, "/image"), query });
  } catch (error) {
    throw biProblem(error, id);
  }
  const file = path.resolve(runtime.cwd(), output);
  const chunks = [];
  let bytes = 0;
  try {
    if (!download.body)
      throw usageError("The server returned no image.");
    for await (const chunk of download.body) {
      bytes += chunk.byteLength;
      if (bytes > 16 * 1024 * 1024)
        throw usageError("The image is larger than 16 MiB; nothing was written.");
      chunks.push(Buffer.from(chunk));
    }
  } finally {
    await download.body?.cancel?.();
  }
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = "".concat(file, ".").concat(process.pid, ".tmp");
  try {
    await writeFile(temporary, Buffer.concat(chunks));
    await rename(temporary, file);
  } catch {
    await rm(temporary, { force: true });
    throw usageError("Cannot write the image; check that the output directory is writable.");
  }
  return {
    envelope: successEnvelope({ id, file, bytes, width: Number(query.width), height: Number(query.height) }, { request_id: download.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: "Rendered view ".concat(id, " at ").concat(query.width, "x").concat(query.height, ": ").concat(file, " (").concat(bytes, " bytes).\nOpen and inspect this image before publishing.")
  };
});

// dist/cli-commands/bi.js
var TOKEN_FILE = "Read the service-account token from this file, or - for stdin (never an argument)";
var SECRET_FILE = "Read the secret value from this file, or - for stdin (never an argument)";
function registerBiCommands(root, bind) {
  const bi = root.command("bi").description("Show live BI dashboards (Grafana, Power BI, Tableau, web) on screens");
  addCommandNotes(bi, [
    "BI dashboards:",
    "  A connection is a project's access to a BI system it owns: for Grafana its",
    "  address and a service-account token, for Power BI a Microsoft Entra app",
    "  (service principal) and its client secret, for Tableau a connected app and a",
    "  user; the secret is sealed on the server and never shown again. A view is one",
    "  dashboard or panel of a Grafana connection, one report of a Power BI",
    "  workspace, one view of a Tableau site, or a public link that needs no",
    "  connection (a Grafana public dashboard, a Power BI Publish to web link, a",
    "  Tableau Public viz). A view plays through an iframe primitive that shows its",
    "  embed_url.",
    "  Grafana: the server draws the dashboard as a PNG through the Image Renderer,",
    "  every --refresh (30s to 24h, default 5m), shared among screens of the same",
    "  size; the screen never talks to Grafana. Power BI: the page embeds the",
    "  report with a view-only token the server generates and renews; the screen",
    "  never holds the client secret. --rotate turns the report's pages. Tableau:",
    "  the page embeds the view with the Embedding API and a five-minute token the",
    "  server signs with the connected app (embed scope only); --rotate-sheets with",
    "  --rotate turns the workbook's sheets. A public link plays live from its host.",
    "  Web: any site that shows a dashboard behind a sign-in (Salesforce, Datadog,",
    "  HubSpot). The connection is a service account, never your own: --login-mode auto",
    "  fills the form on --login-url, steps runs a sign-in script, none signs nothing in",
    "  and shows pages with the cookies of a jar exported from a signed-in browser. A",
    "  view is one page of it, drawn by a browser on the server as an image every",
    "  --refresh (60s to 24h) and shared among screens, like Grafana's. Give a view",
    "  --wait-for, an element that shows only when signed in, so a sign-in page times out",
    "  instead of being drawn; --wait-ms waits for late charts; --clip draws one part.",
    "  Sites that approve sign-ins on a phone or show a CAPTCHA cannot be scripted: use",
    "  a cookie jar. The password, authenticator key and cookies are sealed, never shown.",
    "  Connections and views belong to one project."
  ].join("\n"));
  const connection = bi.command("connection").description("Add, test and manage a project's BI connections");
  const create = connection.command("create").description("Add a connection to a BI system");
  const grafana = create.command("grafana").description("Add a Grafana connection: its address and a service-account token").requiredOption("--url <URL>", "Grafana's address, such as https://grafana.example.com or https://example.com/grafana (a public host)", biAddress).requiredOption("--token-file <FILE>", "".concat(TOKEN_FILE, "; the file holds only the token")).option("--name <NAME>", "Name the connection, 1 to 80 characters (default: the host name)", biName).option("--org-id <N>", "The Grafana organization the token belongs to (default 1)", biOrgId).action(bind(handleBiConnectionCreate));
  void grafana;
  create.command("tableau").description("Add a Tableau connection: a connected app (direct trust), the user the screens show, and the app's secret value").requiredOption("--url <URL>", "The https address of Tableau Server, or of your Tableau Cloud pod such as https://10ay.online.tableau.com", biTableauAddress).option("--site <SITE>", "The site's content URL, the part after /site/ or /t/ in a view's address (omit for Tableau Server's default site)", biSite).requiredOption("--client-id <ID>", "The connected app's Client ID", biAppClientId).requiredOption("--secret-id <ID>", "The Secret ID of a secret generated for the connected app", biSecretId).requiredOption("--username <USER>", "The Tableau user the screens' views are shown as (an email address on Tableau Cloud)", biUsername).requiredOption("--secret-file <FILE>", "".concat(SECRET_FILE, "; the file holds only the secret value")).option("--name <NAME>", "Name the connection, 1 to 80 characters (default: the host name)", biName).action(bind(handleBiConnectionCreateTableau));
  const powerbi = create.command("powerbi").description("Add a Power BI connection: a Microsoft Entra app (service principal) and its client secret, or a Microsoft connection of this project").option("--tenant-id <ID>", "Your Microsoft Entra Directory (tenant) ID, or its domain such as contoso.onmicrosoft.com", biTenantId).option("--client-id <ID>", "The Application (client) ID of the app registration", biClientId).option("--secret-file <FILE>", "".concat(SECRET_FILE, "; the file holds only the secret value")).addOption(new Option("--connection-id <ID>", "Sign in through a Microsoft connection of this project in mode own_app (pcn_..., screenrig connection list) instead of --tenant-id, --client-id and --secret-file; a screenrig_app connection is refused").argParser(connectionIdOption).conflicts(["tenantId", "clientId", "secretFile"])).option("--name <NAME>", "Name the connection, 1 to 80 characters (default: Power BI)", biName).action(bind(handleBiConnectionCreatePowerBI));
  requireOptionGroup(powerbi, "exactlyOne", ["--connection-id", "--tenant-id"]);
  requireOptionGroup(powerbi, "together", ["--tenant-id", "--client-id", "--secret-file"]);
  create.command("web").description("Add a web connection: a service account of a site that shows a dashboard behind a sign-in, or the cookies of a signed-in browser").addOption(new Option("--login-mode <MODE>", "auto fills the form on --login-url with --username and the password; steps runs the --steps script; none signs nothing in, so pages show with the --cookies-file jar").choices([...BI_WEB_LOGIN_MODES]).makeOptionMandatory()).option("--login-url <URL>", "The https address of the site's sign-in page, on a public host (auto and steps). The password is typed only there and in the script's goto steps, never into a view's address", biWebLoginUrl).option("--username <USER>", "The service account's username (auto and steps)", biUsername).option("--password-file <FILE>", "".concat(SECRET_FILE, "; the service account's password: spaces are allowed, and one trailing line ending is dropped (needed by auto)")).option("--totp-file <FILE>", "".concat(SECRET_FILE, "; the base32 key the site shows for the account's authenticator app (16 to 128 characters), or its otpauth://totp address: the server computes the codes")).option("--steps <FILE>", "The sign-in script (login-mode steps): a JSON array of at most 30 steps, a file or - for stdin. Actions: goto (url), fill (selector, value), click and wait_for (selector), press (value such as Enter, optional selector), wait_ms (ms). A value may hold {{username}}, {{password}} and {{otp}}, never the secret itself").option("--cookies-file <FILE>", "A cookie jar exported from a signed-in browser: a JSON array of cookies (a cookie extension's export) or an object with a cookies array (Playwright's storage state), a file or - for stdin; at most 100. Only name, value, domain, path, expires, httpOnly, secure and sameSite are sent").option("--name <NAME>", "Name the connection, 1 to 80 characters (default: the sign-in host)", biName).action(bind(handleBiConnectionCreateWeb));
  connection.command("list").description("List this project's BI connections").action(bind(handleBiConnectionList));
  connection.command("show").description("Inspect one connection and its last test").argument("<id>", "Connection identifier").action(bind(handleBiConnectionShow));
  connection.command("update").description("Change a connection's name, address, organization, tenant, app, site, user, secret or, for a web connection, its sign-in and cookies").argument("<id>", "Connection identifier").option("--name <NAME>", "Rename the connection", biName).option("--url <URL>", "The new address of Grafana, or of the Tableau server or pod (https)", biAddress).option("--org-id <N>", "The Grafana organization the token belongs to", biOrgId).option("--tenant-id <ID>", "The Power BI connection's Microsoft Entra tenant", biTenantId).option("--client-id <ID>", "The Power BI connection's Application (client) ID, or the Tableau connected app's Client ID", biAppClientId).addOption(new Option("--site <SITE>", "The Tableau connection's site content URL").argParser(biSite).conflicts(["defaultSite"])).addOption(new Option("--default-site", "Tableau Server: sign in to the default site").conflicts(["site"])).option("--secret-id <ID>", "The Tableau connected app's Secret ID", biSecretId).option("--username <USER>", "The Tableau user the screens' views are shown as, or the web connection's service account", biUsername).addOption(new Option("--token-file <FILE>", "".concat(TOKEN_FILE, "; it replaces the stored token")).conflicts(["secretFile", "passwordFile", "clearPassword"])).addOption(new Option("--secret-file <FILE>", "".concat(SECRET_FILE, "; it replaces the stored secret")).conflicts(["tokenFile", "passwordFile", "clearPassword"])).addOption(new Option("--login-mode <MODE>", "Web: how it signs in, auto, steps or none").choices([...BI_WEB_LOGIN_MODES])).option("--login-url <URL>", "Web: the https address of the site's sign-in page. A new origin needs --password-file in the same request, so the stored password is never sent to a page you did not give it", biWebLoginUrl).addOption(new Option("--password-file <FILE>", "".concat(SECRET_FILE, "; Web: it replaces the service account's password")).conflicts(["tokenFile", "secretFile", "clearPassword"])).addOption(new Option("--clear-password", "Web: remove the stored password").conflicts(["tokenFile", "secretFile", "passwordFile"])).addOption(new Option("--totp-file <FILE>", "".concat(SECRET_FILE, "; Web: it replaces the authenticator key")).conflicts(["clearTotp"])).addOption(new Option("--clear-totp", "Web: remove the stored authenticator key").conflicts(["totpFile"])).option("--steps <FILE>", "Web: replace the sign-in script, a JSON array of at most 30 steps, a file or - for stdin").addOption(new Option("--cookies-file <FILE>", "Web: replace the cookie jar with one exported from a signed-in browser, a file or - for stdin (the same forms as create)").conflicts(["clearCookies"])).addOption(new Option("--clear-cookies", "Web: remove the stored cookie jar").conflicts(["cookiesFile"])).option("--expect-rev <REVISION>", "Optionally require this connection revision", revision).action(bind(handleBiConnectionUpdate));
  connection.command("test").description("Check the credentials: Grafana's token and Image Renderer, Power BI's app and its workspaces, or Tableau's sign-in").argument("<id>", "Connection identifier").action(bind(handleBiConnectionTest));
  connection.command("browse").description("List what a connection can show: Grafana dashboards and panels, Power BI workspaces and reports, Tableau views").argument("<id>", "Connection identifier").option("--query <TEXT>", "Only dashboards, workspaces, reports or views whose name matches").option("--dashboard <UID>", "Grafana: list this dashboard's panels instead", biDashboardUid).option("--workspace <ID>", "Power BI: list this workspace's reports instead", biWorkspaceId).action(bind(handleBiConnectionBrowse));
  connection.command("delete").description("Delete a connection no view uses").argument("<id>", "Connection identifier").option("--expect-rev <REVISION>", "Optionally require this connection revision", revision).action(bind(handleBiConnectionDelete));
  const view = bi.command("view").description("Add, test and manage the dashboards, reports and views that play on screens");
  const viewCreate = view.command("create").description("Add a view of a connection's dashboard, panel, report or Tableau view, or of a public link").option("--connection-id <ID>", "The connection to show something of (not with --public-url)", biConnectionOption).addOption(new Option("--url <URL>", "A dashboard address on the connection's Grafana host, a Power BI report address or a Tableau view address; the rest of the target is read from it").conflicts(["dashboard", "workspace", "view", "publicUrl"])).addOption(new Option("--dashboard <UID>", "Grafana: the dashboard's uid, the part after /d/ in its address").argParser(biDashboardUid).conflicts(["url", "workspace", "view", "publicUrl"])).addOption(new Option("--workspace <ID>", "Power BI: the workspace id, with --report").argParser(biWorkspaceId).conflicts(["url", "dashboard", "view", "publicUrl"])).addOption(new Option("--report <ID>", "Power BI: the report id, with --workspace").argParser(biReportId).conflicts(["url", "dashboard", "view", "publicUrl"])).addOption(new Option("--view <WORKBOOK/VIEW>", "Tableau: the view, the names after /views/ in its address (bi connection browse lists them)").argParser(biViewPath).conflicts(["url", "dashboard", "workspace", "report", "publicUrl"])).option("--rotate-sheets", "Tableau: turn the workbook's published sheets (with --rotate)").option("--page <NAME>", "Power BI: a page to show, by name or display name (repeatable, in this order)", biPage).option("--all-pages", "Power BI: rotate through every visible page (with --rotate)").option("--rotate <DURATION>", "Power BI: how long each page shows, 10s to 1h (needed with two or more pages or --all-pages). Tableau: how long each sheet shows (needed with --rotate-sheets)", biRotateOption).option("--panel <ID>", "Grafana: show this one panel instead of the whole dashboard", biPanelId).option("--from <TIME>", "Grafana: start of the time range, such as now-6h", biTime).option("--to <TIME>", "Grafana: end of the time range, such as now", biTime).option("--var <NAME=VALUE>", "Grafana: a dashboard variable (repeatable)", biVar).addOption(new Option("--theme <THEME>", "Grafana theme (default dark)").choices(BI_THEMES)).option("--timezone <ZONE>", "Grafana: time zone for the dashboard, such as Europe/Paris, utc or browser").addOption(new Option("--public-url <URL>", "A Grafana public dashboard link, a Power BI Publish to web link or a Tableau Public viz address; it needs no connection and plays live from its host").conflicts(["url", "dashboard", "workspace", "report", "view", "connectionId"])).option("--name <NAME>", "Name the view, 1 to 80 characters (default: from the target)", biName).option("--refresh <DURATION>", "Grafana: how often the image is drawn again, 30s to 24h (default 5m). Web: how often the page is drawn again, 60s to 24h. Power BI and Tableau: how often the report or view refreshes its data, 60s to 24h (default 5m), or 0 for none", biRefreshOption).addOption(new Option("--fit <FIT>", "Grafana and web: how the image fills the screen (default contain)").choices(BI_FITS)).option("--wait-for <CSS>", "Web: a CSS selector of an element that shows when the page is ready, and only when it is signed in; the capture waits for it and fails with bi_web_timeout when it never shows", biCssSelector("--wait-for")).addOption(new Option("--wait-ms <MS>", "Web: milliseconds to wait after the page is ready, for late charts, 0 to 10000").argParser(biWaitMs)).option("--clip <CSS>", "Web: a CSS selector of the part of the page to draw (the whole page by default)", biCssSelector("--clip")).action(bind(handleBiViewCreate));
  requireOptionGroup(viewCreate, "exactlyOne", ["--url", "--dashboard", "--workspace", "--view", "--public-url"]);
  requireOptionGroup(viewCreate, "together", ["--workspace", "--report"]);
  view.command("list").description("List this project's BI views").action(bind(handleBiViewList));
  view.command("show").description("Inspect one view, its embed_url and how it last fared on glass").argument("<id>", "View identifier").action(bind(handleBiViewShow));
  view.command("update").description("Change a view's name, target, cadence or fit").argument("<id>", "View identifier").option("--name <NAME>", "Rename the view", biName).addOption(new Option("--url <URL>", "A dashboard, report or Tableau view address; replaces the whole target").conflicts(["dashboard", "workspace", "report", "view", "publicUrl"])).addOption(new Option("--dashboard <UID>", "Grafana: show this dashboard; replaces the whole target").argParser(biDashboardUid).conflicts(["url", "workspace", "report", "view", "publicUrl"])).addOption(new Option("--workspace <ID>", "Power BI: show a report of this workspace (with --report); replaces the whole target").argParser(biWorkspaceId).conflicts(["url", "dashboard", "view", "publicUrl"])).addOption(new Option("--report <ID>", "Power BI: show this report (in --workspace, or the current one)").argParser(biReportId).conflicts(["url", "dashboard", "view", "publicUrl"])).addOption(new Option("--view <WORKBOOK/VIEW>", "Tableau: show this view; replaces the whole target").argParser(biViewPath).conflicts(["url", "dashboard", "workspace", "report", "publicUrl"])).option("--rotate-sheets", "Tableau: turn the workbook's published sheets (with --rotate)").option("--page <NAME>", "Power BI: the pages to show, by name or display name (repeatable); replaces the current pages", biPage).option("--all-pages", "Power BI: rotate through every visible page").option("--rotate <DURATION>", "Power BI: how long each page shows, 10s to 1h, or 0 for one page. Tableau: how long each sheet shows, or 0 to stop turning them", biRotateOption).option("--panel <ID>", "Grafana: show this one panel", biPanelId).option("--from <TIME>", "Grafana: start of the time range", biTime).option("--to <TIME>", "Grafana: end of the time range", biTime).option("--var <NAME=VALUE>", "Grafana: set a dashboard variable (repeatable)", biVar).addOption(new Option("--theme <THEME>", "Grafana theme").choices(BI_THEMES)).option("--timezone <ZONE>", "Grafana: time zone for the dashboard").addOption(new Option("--public-url <URL>", "A public link; replaces the whole target").conflicts(["url", "dashboard", "workspace", "report", "view"])).option("--refresh <DURATION>", "How often the image is drawn again or the report refreshes (web: 60s to 24h; Power BI and Tableau: 60s to 24h, or 0 for none)", biRefreshOption).addOption(new Option("--fit <FIT>", "Grafana and web: how the image fills the screen").choices(BI_FITS)).addOption(new Option("--wait-for <CSS>", "Web: the element that shows when the page is ready and signed in").argParser(biCssSelector("--wait-for")).conflicts(["clearWaitFor"])).addOption(new Option("--clear-wait-for", "Web: stop waiting for an element").conflicts(["waitFor"])).addOption(new Option("--wait-ms <MS>", "Web: milliseconds to wait after the page is ready, 0 to 10000; 0 removes the wait").argParser(biWaitMs)).addOption(new Option("--clip <CSS>", "Web: the part of the page to draw").argParser(biCssSelector("--clip")).conflicts(["clearClip"])).addOption(new Option("--clear-clip", "Web: draw the whole page again").conflicts(["clip"])).option("--expect-rev <REVISION>", "Optionally require this view revision", revision).action(bind(handleBiViewUpdate));
  view.command("test").description("Check a view for real: a Grafana render, a Power BI embed token, a Tableau lookup, or a public link").argument("<id>", "View identifier").option("--output <FILE>", "Grafana: save the rendered PNG here instead of running the checks").option("--width <PIXELS>", "Width of the saved image (default 1920)", biPixels).option("--height <PIXELS>", "Height of the saved image (default 1080)", biPixels).action(bind(handleBiViewTest));
  view.command("delete").description("Delete a view").argument("<id>", "View identifier").option("--expect-rev <REVISION>", "Optionally require this view revision", revision).action(bind(handleBiViewDelete));
}

// dist/audit.js
var AUDIT_ACTOR_KINDS = ["person", "agent", "service_client", "staff", "system"];
var AUDIT_SOURCES = ["dashboard", "api", "cli", "mcp", "staff", "device", "webhook", "system"];
var ID_PATTERN = /^(?:(?:stage|qa|development)_)?aud_[A-Za-z0-9_-]{1,100}$/;
var ANCHOR_PATTERN = /^\d{1,18}:[0-9a-f]{64}$/;
var ACTION_PATTERN = /^[a-z_.]{1,64}\*?$/;
function auditId(value, command) {
  if (!value)
    throw usageError("audit ".concat(command, " requires <id>."));
  if (!ID_PATTERN.test(value)) {
    throw usageError("An audit entry id looks like aud_ followed by letters, digits, - or _.", {
      command: "screenrig audit list",
      reason: "List the project's audit entries and their ids."
    });
  }
  return value;
}
function auditInstant(flag) {
  return (value) => {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(value) || Number.isNaN(Date.parse(value))) {
      throw usageError("".concat(flag, " must be an RFC 3339 instant with a zone, such as 2026-10-01T00:00:00Z."));
    }
    return value;
  };
}
function auditAction(value) {
  if (!ACTION_PATTERN.test(value))
    throw usageError("--action is a code such as screen.update, or a prefix ending in * such as playlist.*.");
  return value;
}
function auditField(value) {
  if (!value.startsWith("/") || value.length > 200)
    throw usageError("--field is a JSON Pointer such as /label or /fields/room.");
  return value;
}
function auditAnchor(value) {
  if (!ANCHOR_PATTERN.test(value))
    throw usageError("--anchor is SEQ:HASH, the chain head an export or `audit head` printed.");
  return value;
}
function auditQuery(args) {
  return {
    actor: flagString(args.flags, "actor"),
    actor_kind: flagString(args.flags, "actor-kind"),
    source: flagString(args.flags, "source"),
    resource_type: flagString(args.flags, "resource-type"),
    resource_id: flagString(args.flags, "resource-id"),
    action: flagString(args.flags, "action"),
    field: flagString(args.flags, "field"),
    since: flagString(args.flags, "since"),
    until: flagString(args.flags, "until"),
    cursor: flagString(args.flags, "after"),
    limit: flagString(args.flags, "limit")
  };
}
var actorText = (actor) => actor?.name ? "".concat(actor.name, " (").concat(actor.kind ?? "", ")") : "".concat(actor?.id ?? "", " (").concat(actor?.kind ?? "", ")");
var valueText = (value) => value === null || value === void 0 ? "(none)" : typeof value === "string" ? JSON.stringify(value) : JSON.stringify(value);
function auditListLines(items, next) {
  if (!items?.length)
    return ["No audit entries"];
  const lines = table(["TIME", "ACTOR", "SOURCE", "ACTION", "RESOURCE", "CHANGES", "ID"], items.map((item) => [
    item.at ?? "",
    actorText(item.actor),
    item.source ?? "",
    item.action ?? "",
    "".concat(item.resource?.type ?? "", " ").concat(item.resource?.id ?? "").concat(item.resource?.name ? " ".concat(item.resource.name) : "").trim(),
    item.unrecorded ? "(not recorded)" : String(item.changes?.length ?? 0),
    item.id ?? ""
  ]));
  if (next)
    lines.push("", "More: --after ".concat(next));
  return lines;
}
function auditEntryLines(entry) {
  if (!entry)
    return ["No audit entry"];
  const lines = [
    "".concat(entry.action ?? "", " on ").concat(entry.resource?.type ?? "", " ").concat(entry.resource?.id ?? "").concat(entry.resource?.name ? " (".concat(entry.resource.name, ")") : ""),
    "  ".concat(entry.id ?? "", " at ").concat(entry.at ?? ""),
    "  by ".concat(actorText(entry.actor), " through ").concat(entry.source ?? "").concat(entry.client?.kind ? " (".concat(entry.client.kind).concat(entry.client.version ? " ".concat(entry.client.version) : "", ")") : "").concat(entry.client_ip ? " from ".concat(entry.client_ip) : "")
  ];
  if (entry.approved_by)
    lines.push("  approved by ".concat(actorText(entry.approved_by)).concat(entry.review_id ? " in review ".concat(entry.review_id) : ""));
  if (entry.request_id)
    lines.push("  request ".concat(entry.request_id).concat(entry.route ? " (".concat(entry.route, ")") : ""));
  if (entry.revision)
    lines.push("  ".concat(entry.revision.type ?? "revision", " ").concat(entry.revision.id ?? "", " ").concat(entry.revision.before ?? "", " -> ").concat(entry.revision.after ?? "").replace(/\s+/g, " ").replace(/^ /, "  "));
  if (entry.unrecorded)
    lines.push("  The change was made; its values were not recorded.");
  for (const change of entry.changes ?? []) {
    lines.push("  ".concat(change.path).concat(change.redacted ? " (redacted)" : ""), "    before: ".concat(valueText(change.before)), "    after:  ".concat(valueText(change.after)));
  }
  if (entry.truncated)
    lines.push("  More fields changed than an entry keeps.");
  if (entry.seq)
    lines.push("  chain ".concat(entry.seq, " ").concat(entry.hash ?? ""));
  else
    lines.push("  waiting to be chained");
  return lines;
}
function auditHeadLines(head) {
  if (!head)
    return ["No audit chain head"];
  return [
    "Audit chain of ".concat(head.scope ?? ""),
    "  head: ".concat(head.seq ?? 0, ":").concat(head.hash ?? ""),
    "  retention floor: ".concat(head.floor_seq ?? 0, ":").concat(head.floor_hash ?? "", " (oldest kept entry ").concat(head.oldest_retained_seq ?? 1, ")"),
    "  waiting to be chained: ".concat(head.unsealed ?? 0).concat(head.sealed_through ? ", chained through ".concat(head.sealed_through) : ""),
    "  Keep the head as an anchor: screenrig audit verify --anchor SEQ:HASH proves nothing before it was rewritten or removed."
  ];
}
function auditVerifyLines(result) {
  if (!result)
    return ["No verification result"];
  const lines = [result.ok ? "Verified ".concat(result.checked ?? 0, " entries (").concat(result.first_seq ?? 0, " to ").concat(result.last_seq ?? 0, "). The chain is intact.") : "The audit chain does not verify (".concat(result.problems?.length ?? 0, " problems in ").concat(result.checked ?? 0, " entries checked).")];
  for (const problem of result.problems ?? [])
    lines.push("  ".concat(problem.seq, ": ").concat(problem.code, " - ").concat(problem.detail));
  if (result.next_seq)
    lines.push("More entries follow: screenrig audit verify --from-seq ".concat(result.next_seq));
  if (result.head?.unsealed)
    lines.push("".concat(result.head.unsealed, " newer entries are waiting to be chained."));
  return lines;
}

// dist/handlers/audit.js
var AUDIT_PATH = "/api/audit";
var handleAuditList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: AUDIT_PATH, query: auditQuery(args) });
  const body = response.body;
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: auditListLines(body?.items, body?.next_cursor).join("\n") };
});
var handleAuditShow = commandHandler(async (args, runtime, resolved) => {
  const id = auditId(args.positionals[2], "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "".concat(AUDIT_PATH, "/").concat(id) });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: auditEntryLines(response.body).join("\n") };
});
var handleAuditHead = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "".concat(AUDIT_PATH, "/head") });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: auditHeadLines(response.body).join("\n") };
});
var handleAuditVerify = commandHandler(async (args, runtime, resolved) => {
  const anchor = flagString(args.flags, "anchor");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: "GET",
    path: "".concat(AUDIT_PATH, "/verify"),
    query: { from_seq: flagString(args.flags, "from-seq"), limit: flagString(args.flags, "limit"), anchor: anchor === void 0 ? void 0 : auditAnchor(anchor) }
  });
  const body = response.body;
  return { envelope: jsonBody(response, client.requestId), exitCode: body?.ok === false ? ExitCode.OperationFailed : ExitCode.Success, human: auditVerifyLines(body).join("\n") };
});
var handleAuditExport = commandHandler(async (args, runtime, resolved) => {
  if (flagString(args.flags, "format") === void 0 || flagString(args.flags, "format") === "json") {
    throw usageError("audit export writes a file: give --format csv, xlsx or pdf (audit list prints the entries as JSON).");
  }
  const query = auditQuery(args);
  query.limit = void 0;
  const file = await reportFileOf(args, runtime, resolved, AUDIT_PATH, query, "audit-log".concat(query.until ? "-".concat(query.until.slice(0, 10)) : ""), "audit log");
  if (!file)
    throw usageError("audit export writes a file: give --format csv, xlsx or pdf.");
  return file;
});

// dist/cli-commands/audit.js
var filterOptions = (command) => command.option("--actor <ID>", "Only changes made by this person, agent or service client (its id)").addOption(new Option("--actor-kind <KIND>", "Only changes made by this kind of actor").choices(AUDIT_ACTOR_KINDS)).addOption(new Option("--source <SOURCE>", "Only changes that came through this surface").choices(AUDIT_SOURCES)).option("--resource-type <TYPE>", "Only changes to this kind of resource, such as screen, playlist, webhook or member").option("--resource-id <ID>", "Only changes to this resource").option("--action <CODE>", "An action such as screen.update, or a prefix ending in * such as playlist.*", auditAction).option("--field <POINTER>", "Only changes that touched this member or one below it, as a JSON Pointer such as /label", auditField).option("--since <TIME>", "Only changes at or after this RFC 3339 instant", auditInstant("--since")).option("--until <TIME>", "Only changes before this RFC 3339 instant", auditInstant("--until"));
function registerAuditCommands(root, bind) {
  const audit = root.command("audit").description("Read the project's audit log: every configuration change with who, what, when, source and the before and after of each field");
  addCommandNotes(audit, [
    "Audit log:",
    "  Every change to the project's configuration (screens, playlists, media,",
    "  schedules, campaigns, notifications, webhooks, sources, members, settings,",
    "  commands sent to screens) is recorded when it is made: who made it (person,",
    "  agent, service client, staff), through which surface (dashboard, api, cli,",
    "  mcp, ...), when, and the value of each changed field before and after.",
    "  Secrets read (redacted); every other value is the stored value. Card data,",
    "  K/V values and Player telemetry are not configuration and are not recorded.",
    "  Entries are kept 400 days. Nothing writes, edits or deletes an entry, and",
    "  each entry is chained to the one before it: audit verify recomputes the",
    "  chain, and an export prints the chain head so a copy you keep proves later",
    "  that nothing before it was rewritten or removed. Reading needs the project",
    "  capability."
  ].join("\n"));
  filterOptions(audit.command("list").description("List audit entries, newest first")).option("--limit <N>", "Entries per page, 1 to 200 (default 50)", (value) => {
    if (!/^\d{1,3}$/.test(value) || Number(value) < 1 || Number(value) > 200)
      throw new Error("--limit must be 1 to 200.");
    return value;
  }).option("--after <CURSOR>", "next_cursor of the previous page").action(bind(handleAuditList));
  audit.command("show").description("Show one audit entry with every changed field's before and after").argument("<id>", "Audit entry identifier").action(bind(handleAuditShow));
  audit.command("head").description("Show the audit chain head to keep as an anchor").action(bind(handleAuditHead));
  audit.command("verify").description("Recompute the audit hash chain and report anything that does not match").option("--from-seq <N>", "First chain position to check (default the oldest kept)", (value) => {
    if (!/^\d{1,18}$/.test(value))
      throw new Error("--from-seq must be a chain position.");
    return value;
  }).option("--limit <N>", "Entries to check in this call, at most 5000").option("--anchor <SEQ:HASH>", "A chain head you kept: also proves the history up to it is unchanged", auditAnchor).action(bind(handleAuditVerify));
  filterOptions(subcommand(audit, "export").description("Write the filtered audit log as a CSV, XLSX or PDF file, one row per changed field, with the chain head in it")).addOption(reportFormatOption().makeOptionMandatory()).addOption(reportOutputOption("audit-log.FORMAT")).action(bind(handleAuditExport));
}

// dist/connections.js
var CONNECTIONS_PATH2 = "/api/connections";
var CONNECTION_MODES = ["own_app", "screenrig_app"];
var SECRET_FILE_MAX_BYTES2 = 20 * 1024;
var CLIENT_SECRET_MAX_CHARACTERS = 1024;
var KEY_FILE_MAX_CHARACTERS = 16384;
function connectionId(value, command) {
  if (!value)
    throw usageError("connection ".concat(command, " requires <id>."));
  if (!CONNECTION_ID_PATTERN.test(value)) {
    throw usageError("A connection id looks like pcn_ followed by letters, digits, - or _.", {
      command: "screenrig connection list",
      reason: "List this project's connections and their ids."
    });
  }
  return value;
}
async function readClientSecret(file, runtime) {
  const where = file === "-" ? "stdin" : file;
  const text = (await readAuthoringText(file, runtime, SECRET_FILE_MAX_BYTES2)).trim();
  if (!text)
    throw usageError("".concat(where, " holds no client secret."));
  if (/\s/.test(text))
    throw usageError("".concat(where, " must hold only the client secret's Value: one value without spaces or line breaks."));
  if ([...text].length > CLIENT_SECRET_MAX_CHARACTERS)
    throw usageError("The client secret in ".concat(where, " is longer than ").concat(CLIENT_SECRET_MAX_CHARACTERS, " characters."));
  return text;
}
function connectionProblem(error, id) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  if (problem.next)
    return error;
  const withNext = (command, reason) => new CliError({ ...problem, next: { command, reason } }, error.exitCode, error.warnings);
  switch (problem.code) {
    case "connection_app_not_configured":
      return withNext("screenrig connection create --help", "This server has no screenRIG application for that provider, so a screenrig_app connection cannot be made here. An own_app connection (your own Microsoft Entra app or Google service account key) works. Nothing was created.");
    case "connection_limit_reached":
      return withNext("screenrig connection list", "An organization has at most 50 connections across its projects. Delete one that nothing reads through (screenrig connection delete ID), then run create again. Nothing was created.");
    case "resource_conflict":
      return id ? withNext("screenrig source list", "A data source, a Power BI connection (bi connection list) or a media sync account (media sync account list) still reads through this connection; the detail names them. Move or delete those first, then delete the connection.") : error;
    case "revision_conflict":
      return id ? withNext("screenrig connection show ".concat(id), "Read the current revision, then run the command again with --expect-rev REVISION if the change still applies.") : error;
    case "not_found":
      return id ? withNext("screenrig connection list", "List this project's connections and their ids. A connection belongs to one project.") : error;
    default:
      return error;
  }
}
async function connectionCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw connectionProblem(error, id);
  }
}
function revisionHeader2(args) {
  const revision2 = flagString(args.flags, "expect-rev");
  return revision2 ? { "if-match": quotedRevision(revision2) } : void 0;
}
var dash2 = (value) => value && value.length ? value : "-";
function checkLines2(checks) {
  return (checks ?? []).map((check) => "  ".concat(!check.ok ? "failed" : check.warn ? "warning" : "ok", " ").concat(check.name).concat(check.detail ? ": ".concat(check.detail) : ""));
}
function connectionLines2(connection) {
  if (!connection)
    return [];
  const test = connection.last_test;
  const config = connection.config ?? {};
  const own = connection.mode === "own_app";
  return [
    "id: ".concat(connection.id),
    "name: ".concat(connection.name),
    "provider: ".concat(connection.provider),
    "mode: ".concat(connection.mode).concat(own ? " (your own application)" : " (screenRIG's application)"),
    "status: ".concat(connection.status),
    ...connection.provider === "microsoft" ? ["tenant: ".concat(dash2(config.tenant_id)).concat(!own && !config.tenant_id ? " (set when the administrator has consented)" : ""), ...own ? ["app (client id): ".concat(dash2(config.client_id))] : []] : own ? ["service account: ".concat(dash2(config.service_account))] : ["account: ".concat(dash2(config.account)).concat(config.account ? " (a calendar source reads the calendars this account can see)" : "")],
    ...own ? ["secret: ".concat(connection.secret?.set ? "set".concat(connection.secret.hint ? " (".concat(connection.secret.hint, ")") : "") : "not set")] : [],
    ...connection.last_error ? ["error: ".concat(connection.last_error.code, ": ").concat(connection.last_error.message, " (").concat(connection.last_error.at, ")")] : [],
    "last test: ".concat(test ? "".concat(test.ok ? "ok" : "failed", " at ").concat(test.at) : "never"),
    ...test ? checkLines2(test.checks) : [],
    "revision: ".concat(connection.revision)
  ];
}
function connectionTableLines2(items) {
  if (!items.length)
    return ["No connections"];
  return table(["ID", "PROVIDER", "MODE", "NAME", "STATUS", "TENANT OR ACCOUNT", "TEST"], items.map((item) => [
    item.id,
    item.provider,
    item.mode,
    item.name,
    item.status,
    dash2(item.config?.tenant_id ?? item.config?.account ?? item.config?.service_account),
    item.last_test ? item.last_test.ok ? "ok" : "failed" : "never"
  ]));
}
function consentWho(provider) {
  return provider === "microsoft" ? "the Microsoft 365 administrator, who consents to screenRIG's application for the tenant and then signs in to it" : "the holder of the Google account, who signs in and grants read-only access to the calendars the account can see";
}
function consentLines(connection) {
  if (!connection?.consent_url)
    return [];
  return [
    "",
    "Consent link, for ".concat(consentWho(connection.provider), ". Send it to that person only: it is the credential of one consent, and works once").concat(connection.consent_expires_at ? " until ".concat(connection.consent_expires_at) : "", "."),
    "consent_url: ".concat(connection.consent_url),
    "",
    "When they finish the connection is ready: screenrig connection show ".concat(connection.id, " reads its status and last_error. screenrig connection connect ").concat(connection.id, " makes a new link.")
  ];
}
function consentWarnings(connection) {
  if (!connection?.consent_url)
    return [];
  return [{
    code: "connection_consent_link",
    message: "data.consent_url is the link of one consent: send it to ".concat(consentWho(connection.provider), ", who opens it").concat(connection.consent_expires_at ? " before ".concat(connection.consent_expires_at) : "", ". screenrig does not save it, and a read of the connection never shows it. screenrig connection connect ").concat(connection.id, " makes a new link, which replaces this one.")
  }];
}
function listBody2(response) {
  const items = response.body?.items;
  return Array.isArray(items) ? items : [];
}
var handleConnectionList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let response;
  try {
    response = await client.listAll(CONNECTIONS_PATH2);
  } catch (error) {
    throw connectionProblem(error);
  }
  const items = listBody2(response);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Connections (".concat(items.length, ")"), ...connectionTableLines2(items)].join("\n")
  };
});
var handleConnectionShow = commandHandler(async (args, runtime, resolved) => {
  const id = connectionId(args.positionals[2], "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await connectionCall(client, { method: "GET", path: "".concat(CONNECTIONS_PATH2, "/").concat(id) }, id);
  const connection = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Connection",
      ...connectionLines2(connection),
      ...connection?.status === "pending_consent" ? ["", "No one has consented yet. screenrig connection connect ".concat(connection.id, " makes a consent link to send to the person who can.")] : []
    ].join("\n")
  };
});
function createHandler(provider) {
  return commandHandler(async (args, runtime, resolved) => {
    const mode = flagString(args.flags, "mode");
    if (mode === void 0)
      throw usageError("connection create ".concat(provider, " requires --mode own_app or --mode screenrig_app."));
    const name = biName(flagString(args.flags, "name") ?? (provider === "microsoft" ? "Microsoft 365" : "Google Calendar"));
    let body;
    if (provider === "microsoft") {
      const tenant = flagString(args.flags, "tenant-id");
      const clientId = flagString(args.flags, "client-id");
      const secretFile = flagString(args.flags, "secret-file");
      if (mode === "screenrig_app") {
        if (tenant !== void 0 || clientId !== void 0 || secretFile !== void 0) {
          throw usageError("--mode screenrig_app uses screenRIG's own application, so it takes no --tenant-id, --client-id or --secret-file: the administrator who consents names the tenant.");
        }
        body = { provider, mode, name };
      } else {
        if (tenant === void 0 || clientId === void 0 || secretFile === void 0) {
          throw usageError("--mode own_app needs --tenant-id, --client-id and --secret-file: your Microsoft Entra app registration and the Value of one of its client secrets.");
        }
        body = { provider, mode, name, config: { tenant_id: biTenantId(tenant), client_id: biClientId(clientId) }, secret: await readClientSecret(secretFile, runtime) };
      }
    } else {
      const keyFile = flagString(args.flags, "service-account-key-file");
      if (mode === "screenrig_app") {
        if (keyFile !== void 0)
          throw usageError("--mode screenrig_app uses screenRIG's own application, so it takes no --service-account-key-file: the account holder who signs in grants access.");
        body = { provider, mode, name };
      } else {
        if (keyFile === void 0)
          throw usageError("--mode own_app needs --service-account-key-file: the service account's JSON key file.");
        body = { provider, mode, name, secret: await readServiceAccountKey(keyFile, runtime, KEY_FILE_MAX_CHARACTERS) };
      }
    }
    const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
    const response = await connectionCall(client, { method: "POST", path: CONNECTIONS_PATH2, idempotent: true, body });
    const created = response.body;
    return {
      envelope: jsonBody(response, client.requestId, void 0, consentWarnings(created)),
      exitCode: ExitCode.Success,
      human: [
        "Created connection ".concat(created?.id ?? "").trimEnd(),
        ...connectionLines2(created),
        ...consentLines(created),
        ...created && !created.consent_url ? ["", "Next: screenrig connection test ".concat(created.id)] : []
      ].join("\n")
    };
  });
}
var handleConnectionCreateMicrosoft = createHandler("microsoft");
var handleConnectionCreateGoogle = createHandler("google");
var handleConnectionUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = connectionId(args.positionals[2], "update");
  const name = flagString(args.flags, "name");
  const tenant = flagString(args.flags, "tenant-id");
  const clientId = flagString(args.flags, "client-id");
  const secretFile = flagString(args.flags, "secret-file");
  const keyFile = flagString(args.flags, "service-account-key-file");
  if ([name, tenant, clientId, secretFile, keyFile].every((value) => value === void 0)) {
    throw usageError("connection update requires --name, --tenant-id, --client-id, --secret-file or --service-account-key-file.");
  }
  if (secretFile === "-" && keyFile === "-")
    throw usageError("--secret-file and --service-account-key-file cannot both read stdin.");
  const config = { ...tenant !== void 0 ? { tenant_id: biTenantId(tenant) } : {}, ...clientId !== void 0 ? { client_id: biClientId(clientId) } : {} };
  const body = {
    ...name !== void 0 ? { name: biName(name) } : {},
    ...Object.keys(config).length ? { config } : {},
    ...secretFile !== void 0 ? { secret: await readClientSecret(secretFile, runtime) } : keyFile !== void 0 ? { secret: await readServiceAccountKey(keyFile, runtime, KEY_FILE_MAX_CHARACTERS) } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await connectionCall(client, { method: "PATCH", path: "".concat(CONNECTIONS_PATH2, "/").concat(id), idempotent: true, body, headers: revisionHeader2(args) }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Updated connection ".concat(id), ...connectionLines2(response.body)].join("\n")
  };
});
var handleConnectionDelete = commandHandler(async (args, runtime, resolved) => {
  const id = connectionId(args.positionals[2], "delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await connectionCall(client, { method: "DELETE", path: "".concat(CONNECTIONS_PATH2, "/").concat(id), idempotent: true, headers: revisionHeader2(args) }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: "Deleted connection ".concat(id, ". This does not end the vendor's side: a Microsoft 365 tenant keeps screenRIG's application until its administrator removes it, and a Google account keeps its grant until its holder revokes it.")
  };
});
var handleConnectionTest = commandHandler(async (args, runtime, resolved) => {
  const id = connectionId(args.positionals[2], "test");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await connectionCall(client, { method: "POST", path: "".concat(CONNECTIONS_PATH2, "/").concat(id, "/test"), idempotent: true }, id);
  const report = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Connection ".concat(id, ": ").concat(report?.ok ? "ok" : "failed"),
      ...checkLines2(report?.checks),
      ...report?.ok ? ["", "This signs in and checks the permissions the token carries. It does not judge a calendar's sharing, a mailbox access policy or a site grant: a source or a sync proves those when it runs."] : []
    ].join("\n")
  };
});
var handleConnectionConnect = commandHandler(async (args, runtime, resolved) => {
  const id = connectionId(args.positionals[2], "connect");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await connectionCall(client, { method: "POST", path: "".concat(CONNECTIONS_PATH2, "/").concat(id, "/connect"), idempotent: true }, id);
  const connection = response.body;
  return {
    envelope: jsonBody(response, client.requestId, void 0, consentWarnings(connection)),
    exitCode: ExitCode.Success,
    human: ["Made a new consent link for connection ".concat(id, ". Any earlier link no longer works; a connection that works stays as it is until the new consent completes."), ...connectionLines2(connection), ...consentLines(connection)].join("\n")
  };
});

// dist/cli-commands/connection.js
var SECRET_FILE2 = "Read the client secret's Value from this file, or - for stdin (never an argument); the file holds only the Value";
var KEY_FILE = "Read the service account's JSON key file from this file, or - for stdin (never an argument)";
var MICROSOFT_MODE_HELP = "own_app: your own application, a Microsoft Entra app registration with a client secret (--tenant-id, --client-id, --secret-file). screenrig_app: screenRIG's application, which a Microsoft 365 administrator consents to through a one-time link that this command prints";
var GOOGLE_MODE_HELP = "own_app: your own service account key (--service-account-key-file). screenrig_app: screenRIG's application, which the holder of a Google account signs in to and grants read-only calendar access through a one-time link that this command prints";
function registerConnectionCommands(root, bind) {
  const connection = root.command("connection").description("Share Microsoft 365 or Google access with sources, Power BI and syncs");
  addCommandNotes(connection, [
    "Connections:",
    "  A connection is the project's reusable access to Microsoft or Google for things",
    "  that run unattended: a microsoft365 or google_calendar data source",
    "  (source create --connection-id pcn_...), a Power BI connection",
    "  (bi connection create powerbi --connection-id) and a SharePoint media sync",
    "  account (media sync account add microsoft365 --connection-id) read through one",
    "  instead of each carrying a tenant, a client id and a secret. Credentials you",
    "  enter keep working unchanged.",
    "  Mode own_app holds your own application: for Microsoft a Microsoft Entra app",
    "  registration (--tenant-id, --client-id and the Value of a client secret), for",
    "  Google a service account's JSON key; the secret is sealed and never shown again.",
    "  Mode screenrig_app uses screenRIG's own application and needs no secret: create",
    "  prints a one-time consent link (data.consent_url) for the person who completes it,",
    "  a Microsoft 365 administrator who consents for the tenant, or the holder of a",
    "  Google account who grants read-only access to the calendars it can see. Send the",
    "  link to that person only, then read status and last_error with connection show;",
    "  connection connect makes a new link, to renew one or to move it to another tenant",
    "  or account. A Power BI connection takes only an own_app connection.",
    "  connection test signs in and reports what the credentials and permissions allow;",
    "  it does not judge a calendar's sharing, a mailbox access policy or a site grant.",
    "  connection delete is refused while anything reads through the connection, and does",
    "  not end the vendor's side. An organization has at most 50 connections across its",
    "  projects. Needs Manage access to change; reading needs Read access."
  ].join("\n"));
  const list = connection.command("list").description("List this project's connections with their status").action(bind(handleConnectionList));
  addCommandExamples(list, "screenrig connection list");
  const show = connection.command("show").description("Inspect one connection: its status, last error and last test").argument("<id>", "Connection identifier (pcn_...)").action(bind(handleConnectionShow));
  addCommandExamples(show, "screenrig connection show pcn_CONNECTION");
  const create = connection.command("create").description("Add a connection to Microsoft 365 or Google");
  const microsoft = create.command("microsoft").description("Add a Microsoft 365 connection: your own Entra app, or screenRIG's application with a consent link").addOption(new Option("--mode <MODE>", MICROSOFT_MODE_HELP).choices([...CONNECTION_MODES]).makeOptionMandatory()).option("--name <NAME>", "Name the connection, 1 to 80 characters (default: Microsoft 365)", biName).option("--tenant-id <ID>", "own_app: your Microsoft Entra Directory (tenant) ID, or its primary domain such as contoso.onmicrosoft.com", biTenantId).option("--client-id <ID>", "own_app: the Application (client) ID of the app registration", biClientId).option("--secret-file <FILE>", "own_app: ".concat(SECRET_FILE2)).action(bind(handleConnectionCreateMicrosoft));
  requireOptionGroup(microsoft, "together", ["--tenant-id", "--client-id", "--secret-file"]);
  addCommandNotes(microsoft, "own_app needs --tenant-id, --client-id and --secret-file; screenrig_app takes none of them and prints the consent link (data.consent_url) for the Microsoft 365 administrator, who consents to screenRIG's application for the tenant. The app registration lists Calendars.Read for meeting-room calendars, Sites.Selected or Files.Read.All for SharePoint media sync and, for Power BI, tenant settings and workspace membership instead of Graph permissions; connection test reports which permissions the token carries. A server without screenRIG's application answers connection_app_not_configured: own_app still works.");
  addCommandExamples(microsoft, "screenrig connection create microsoft --mode own_app --tenant-id contoso.onmicrosoft.com --client-id 0b1d2f3a-4c5e-4f60-8a7b-9c0d1e2f3a4b --secret-file secret.txt", 'screenrig connection create microsoft --mode screenrig_app --name "Contoso rooms"');
  const google = create.command("google").description("Add a Google connection: your own service account key, or screenRIG's application with a sign-in link").addOption(new Option("--mode <MODE>", GOOGLE_MODE_HELP).choices([...CONNECTION_MODES]).makeOptionMandatory()).option("--name <NAME>", "Name the connection, 1 to 80 characters (default: Google Calendar)", biName).option("--service-account-key-file <FILE>", "own_app: ".concat(KEY_FILE)).action(bind(handleConnectionCreateGoogle));
  addCommandNotes(google, "own_app needs --service-account-key-file; share each room calendar with the service account's address, or give the source a subject (domain-wide delegation). screenrig_app takes no key and prints the sign-in link (data.consent_url) for the holder of the Google account, who grants read-only calendar access: the account must see every room calendar a source lists, and such a source cannot name a subject. A server without screenRIG's application answers connection_app_not_configured: own_app still works.");
  addCommandExamples(google, "screenrig connection create google --mode own_app --service-account-key-file key.json", 'screenrig connection create google --mode screenrig_app --name "Venue calendars"');
  const update = connection.command("update").description("Rename a connection or, in mode own_app, change its tenant, app or secret").argument("<id>", "Connection identifier (pcn_...)").option("--name <NAME>", "Rename the connection", biName).option("--tenant-id <ID>", "Microsoft own_app: the Directory (tenant) ID or primary domain", biTenantId).option("--client-id <ID>", "Microsoft own_app: the Application (client) ID", biClientId).option("--secret-file <FILE>", "Microsoft own_app: ".concat(SECRET_FILE2, "; it replaces the stored secret")).option("--service-account-key-file <FILE>", "Google own_app: ".concat(KEY_FILE, "; it replaces the stored key")).option("--expect-rev <REVISION>", "Optionally require this connection revision", revision).action(bind(handleConnectionUpdate));
  requireOptionGroup(update, "atLeastOne", ["--name", "--tenant-id", "--client-id", "--secret-file", "--service-account-key-file"]);
  addCommandNotes(update, "A change to the credentials returns the connection to ready, clears its last error and last test, and retires every token minted for the old ones; test it again. A screenrig_app connection can only be renamed: connection connect makes a new consent link to change who consented. An omitted secret is kept.");
  addCommandExamples(update, "screenrig connection update pcn_CONNECTION --secret-file new-secret.txt", 'screenrig connection update pcn_CONNECTION --name "Contoso rooms" --expect-rev 2');
  const test = connection.command("test").description("Sign in with a connection and check what its credentials allow").argument("<id>", "Connection identifier (pcn_...)").action(bind(handleConnectionTest));
  addCommandNotes(test, "Microsoft: credentials (an app token for the tenant) and permissions (which of Calendars.Read, Sites.Selected, Files.Read.All, Sites.Read.All and Place.Read.All the token carries; none fails, Sites.Selected alone is a warning because each site needs its own grant). Google: credentials, naming the account the calendars must be visible to. A refusal moves the connection to error with last_error; a success returns it to ready. At most 30 a minute per organization.");
  addCommandExamples(test, "screenrig connection test pcn_CONNECTION");
  const connect = connection.command("connect").description("Make a new one-time consent link for a screenrig_app connection").argument("<id>", "Connection identifier (pcn_...)").action(bind(handleConnectionConnect));
  addCommandNotes(connect, "Prints data.consent_url for the person who completes the consent: the Microsoft 365 administrator, or the holder of the Google account. It replaces any earlier link. A connection that works stays as it is until the new consent completes, so this also renews one that moved to error (consent removed, access revoked) or moves it to another tenant or account. A connection in mode own_app has no consent step. At most 20 a minute per organization.");
  addCommandExamples(connect, "screenrig connection connect pcn_CONNECTION");
  const remove = connection.command("delete").description("Delete a connection that nothing reads through").argument("<id>", "Connection identifier (pcn_...)").option("--expect-rev <REVISION>", "Optionally require this connection revision", revision).action(bind(handleConnectionDelete));
  addCommandNotes(remove, "While a data source, a Power BI connection or a media sync account reads through the connection the answer is resource_conflict (exit 5), naming them. Deleting does not end the vendor's side: a Microsoft 365 tenant keeps screenRIG's application until its administrator removes it, and a Google account keeps its grant until its holder revokes it.");
  addCommandExamples(remove, "screenrig connection delete pcn_CONNECTION", "screenrig connection delete pcn_CONNECTION --expect-rev 2");
}

// dist/bundles/integrations.js
function register(root, bind) {
  registerWebhooksCommands(root, bind);
  registerNotificationsCommands(root, bind);
  registerReportsCommands(root, bind);
  registerBiCommands(root, bind);
  registerConnectionCommands(root, bind);
  registerAuditCommands(root, bind);
}
export {
  register
};
