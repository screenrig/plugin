import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  CliError,
  usageError
} from "./chunk-5E3Z6J6F.js";

// dist/webhooks.js
var WEBHOOK_ID_PATTERN = /^(?:(?:stage|qa|development)_)?whk_[A-Za-z0-9_-]{16,24}$/;
var WEBHOOK_DELIVERY_CURSOR_PATTERN = /^whc1_[0-9a-z]{1,16}$/;
var EVENT_TYPE_PATTERN = /^[a-z][a-z0-9_]{0,63}(\.[a-z][a-z0-9_]{0,63})*(\.\*|\.[a-z][a-z0-9_]{0,63})$/;
var WEBHOOK_EVENT_TYPES_MAX = 32;
var EVENT_TYPE_MAX_LENGTH = 200;
var URL_MAX_LENGTH = 2048;
var WEBHOOK_DESCRIPTION_MAX = 200;
var WEBHOOK_DELIVERIES_LIMIT_MAX = 200;
function webhookId(value, command) {
  if (!value)
    throw usageError("webhooks ".concat(command, " requires <id>."));
  if (!WEBHOOK_ID_PATTERN.test(value)) {
    throw usageError("A webhook id looks like whk_ followed by 16 to 24 letters, digits, - or _.", {
      command: "screenrig webhooks list",
      reason: "List this project's webhooks and their ids."
    });
  }
  return value;
}
function webhookEventTypes(value, flag = "--event-types") {
  const types = value.split(",").map((item) => item.trim());
  if (types.some((item) => !item))
    throw usageError("".concat(flag, " takes comma-separated event types with no empty entries."));
  if (types.length > WEBHOOK_EVENT_TYPES_MAX)
    throw usageError("".concat(flag, " takes at most ").concat(WEBHOOK_EVENT_TYPES_MAX, " event types."));
  for (const type of types) {
    if (type.length > EVENT_TYPE_MAX_LENGTH || !EVENT_TYPE_PATTERN.test(type)) {
      throw usageError("".concat(flag, " entries must be event types such as screen.online or prefixes such as screen.*."));
    }
  }
  if (new Set(types).size !== types.length)
    throw usageError("".concat(flag, " must not repeat an event type."));
  return types;
}
function webhookUrl(value, flag = "--url") {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw usageError("".concat(flag, " must be an absolute https URL."));
  }
  if (parsed.protocol !== "https:")
    throw usageError("".concat(flag, " must be an absolute https URL."));
  if (parsed.username || parsed.password || /^https:\/\/[^/?#]*@/i.test(value))
    throw usageError("".concat(flag, " must not carry credentials (user:password@)."));
  if (value.includes("#"))
    throw usageError("".concat(flag, " must not carry a fragment (#\u2026)."));
  if (value.length > URL_MAX_LENGTH)
    throw usageError("".concat(flag, " must be at most ").concat(URL_MAX_LENGTH, " characters."));
  return value;
}
function webhookDescription(value) {
  if ([...value].length > WEBHOOK_DESCRIPTION_MAX)
    throw usageError("--description must be at most ".concat(WEBHOOK_DESCRIPTION_MAX, " characters."));
  return value;
}
function webhookDeliveryCursor(value) {
  if (!WEBHOOK_DELIVERY_CURSOR_PATTERN.test(value)) {
    throw usageError("--before takes the next_cursor of a previous webhooks deliveries page (whc1_\u2026).");
  }
  return value;
}
function webhookDeliveriesLimit(value) {
  const number = Number(value);
  if (!/^\d+$/.test(value) || number < 1 || number > WEBHOOK_DELIVERIES_LIMIT_MAX) {
    throw usageError("--limit must be a whole number from 1 to ".concat(WEBHOOK_DELIVERIES_LIMIT_MAX, "."));
  }
  return value;
}
function webhookSecretWarning(id, action) {
  return {
    code: "webhook_secret_shown_once",
    message: action === "create" ? "data.secret is this webhook's signing secret and is shown only in this answer. Store it in the receiver's secret store now; screenrig does not save it in its config, logs, or recovery state. After an interrupted or ambiguous create, rerun the identical command within 24 hours to get this same answer and secret back. Replace a lost secret with screenrig webhooks rotate-secret ".concat(id, ".") : "data.secret is the new signing secret and is shown only in this answer. Store it in the receiver's secret store now; screenrig does not save it. The previous secret stopped signing, but at most one attempt already in flight may still arrive signed with it, so accept both briefly. After an interrupted or ambiguous rotation, rerun the identical command within 24 hours to get this same secret back."
  };
}
function webhookProblem(error, id) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  if (problem.code === "webhook_url_rejected") {
    const reason = problem.detail.trim().replace(/\.$/, "");
    return new CliError({
      ...problem,
      detail: "The webhook URL was rejected: ".concat(reason, "."),
      next: problem.next ?? {
        command: "screenrig webhooks create --url https://HOST/PATH --event-types TYPES",
        reason: "Use an https URL on port 443 (the default) or 8443 whose host resolves only to public Internet addresses. Nothing was created or changed."
      }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "webhook_limit_reached") {
    return new CliError({
      ...problem,
      detail: "This organization already has the maximum of 50 notifications, email and webhook together, across its projects. Nothing was created.",
      next: problem.next ?? {
        command: "screenrig notifications list",
        reason: "Delete a notification you no longer need with screenrig notifications delete ID, then rerun create."
      }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "revision_conflict" && id && !problem.next) {
    return new CliError({
      ...problem,
      next: { command: "screenrig webhooks show ".concat(id), reason: "Read the current revision and state, then rerun with --expect-rev REVISION if the change still applies." }
    }, error.exitCode, error.warnings);
  }
  return error;
}
function when(value, label) {
  return value ? ["".concat(label, ": ").concat(value)] : [];
}
var READ_ONLY_URL = "withheld from a Read only credential. A Manage sign-in (screenrig login --access manage) receives it.";
function withheld(webhook) {
  return webhook.url_redacted === true && !webhook.url;
}
function webhookLines(webhook) {
  if (!webhook)
    return [];
  return [
    "id: ".concat(webhook.id),
    "url: ".concat(withheld(webhook) ? READ_ONLY_URL : webhook.url),
    "event_types: ".concat((webhook.event_types ?? []).join(", ")),
    "enabled: ".concat(webhook.enabled),
    "status: ".concat(webhook.status),
    "revision: ".concat(webhook.revision),
    ...when(webhook.description, "description"),
    ...when(webhook.failing_since, "failing_since"),
    ...when(webhook.disabled_reason, "disabled_reason"),
    ...when(webhook.disabled_at, "disabled_at"),
    ...when(webhook.last_success_at, "last_success_at"),
    ...when(webhook.last_failure_at, "last_failure_at")
  ];
}
function table(header, rows) {
  const widths = header.map((cell, index) => Math.max(cell.length, ...rows.map((row) => (row[index] ?? "").length)));
  const render = (row) => row.map((cell, index) => cell.padEnd(widths[index])).join("  ").trimEnd();
  return [render(header), ...rows.map(render)];
}
function webhookTableLines(items) {
  if (!items.length)
    return ["No webhooks"];
  const lines = table(["ID", "STATUS", "ENABLED", "EVENT_TYPES", "URL"], items.map((item) => [
    item.id ?? "",
    item.status ?? "",
    String(item.enabled),
    (item.event_types ?? []).join(","),
    withheld(item) ? "(withheld)" : item.url ?? ""
  ]));
  return items.some(withheld) ? [...lines, "", "URLs: withheld from a Read only credential. A Manage sign-in (screenrig login --access manage) receives them."] : lines;
}
function deliveryTableLines(items) {
  if (!items.length)
    return ["No deliveries"];
  return table(["ID", "EVENT_TYPE", "STATE", "ATTEMPTS", "LAST_STATUS", "LAST_ERROR", "CREATED_AT"], items.map((item) => [
    item.id ?? "",
    "".concat(item.event_type ?? "").concat(item.test ? " (test)" : ""),
    item.state ?? "",
    String(item.attempts ?? 0),
    item.last_status === void 0 ? "" : String(item.last_status),
    item.last_error ?? "",
    item.created_at ?? ""
  ]));
}

export {
  WEBHOOK_ID_PATTERN,
  webhookId,
  webhookEventTypes,
  webhookUrl,
  webhookDescription,
  webhookDeliveryCursor,
  webhookDeliveriesLimit,
  webhookSecretWarning,
  webhookProblem,
  webhookLines,
  table,
  webhookTableLines,
  deliveryTableLines
};
