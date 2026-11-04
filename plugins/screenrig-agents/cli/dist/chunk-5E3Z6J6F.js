import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/exit-codes.js
var ExitCode = {
  Success: 0,
  Unexpected: 1,
  Usage: 2,
  Auth: 3,
  NotFound: 4,
  Conflict: 5,
  Precondition: 6,
  RateLimited: 7,
  Client: 8,
  Server: 9,
  Network: 10,
  Timeout: 11,
  Config: 12,
  OperationFailed: 13
};
function exitCodeForStatus(status) {
  if (status === 401 || status === 403) {
    return ExitCode.Auth;
  }
  if (status === 404) {
    return ExitCode.NotFound;
  }
  if (status === 409) {
    return ExitCode.Conflict;
  }
  if (status === 412) {
    return ExitCode.Precondition;
  }
  if (status === 408 || status === 504) {
    return ExitCode.Timeout;
  }
  if (status === 429) {
    return ExitCode.RateLimited;
  }
  if (status >= 400 && status < 500) {
    return ExitCode.Client;
  }
  if (status >= 500) {
    return ExitCode.Server;
  }
  return ExitCode.Unexpected;
}
var SIGN_IN_AGAIN = { command: "screenrig login", reason: "Sign this installation in again; a person approves it in the dashboard." };
var OAUTH_PROBLEMS = {
  invalid_grant: { code: "session_ended", title: "Session ended", exitCode: ExitCode.Auth, next: SIGN_IN_AGAIN },
  invalid_client: { code: "client_auth_failed", title: "Client authentication failed", exitCode: ExitCode.Auth },
  invalid_request: { code: "invalid_request", title: "Invalid request", exitCode: ExitCode.Client },
  invalid_scope: {
    code: "insufficient_access",
    title: "Insufficient access",
    exitCode: ExitCode.Auth,
    next: { command: "screenrig login --access manage", reason: "Ask a person to approve Manage access for this project." }
  },
  invalid_target: { code: "invalid_request", title: "Invalid request", exitCode: ExitCode.Client },
  unauthorized_client: { code: "client_not_allowed", title: "Client not allowed", exitCode: ExitCode.Auth },
  unsupported_grant_type: { code: "client_not_allowed", title: "Client not allowed", exitCode: ExitCode.Auth },
  access_denied: { code: "login_denied", title: "Sign-in denied", exitCode: ExitCode.Auth },
  expired_token: { code: "login_expired", title: "Sign-in expired", exitCode: ExitCode.Timeout, next: SIGN_IN_AGAIN },
  temporarily_unavailable: { code: "service_unavailable", title: "Service unavailable", exitCode: ExitCode.Server },
  rate_limited: { code: "rate_limited", title: "Rate limited", exitCode: ExitCode.RateLimited }
};

// dist/redact.js
var TOKEN_RE = /\bsr_live_[A-Za-z0-9_-]+_[A-Za-z0-9_-]+\b/g;
var AGENT_CONNECTION_TOKEN_RE = /\bsac_[A-Za-z0-9_-]{43}\b/g;
var BEARER_RE = /Bearer\s+\S+/gi;
var WEBHOOK_SECRET_RE = /\bwhsec_[A-Za-z0-9_-]{8,}/g;
var FLEET_LINK_SECRET_RE = /\bsrfl_[A-Za-z0-9_-]{8,}/g;
var SCREEN_LINK_SECRET_RE = /\bsrsl_[A-Za-z0-9_-]{8,}/g;
var TRIGGER_PASSWORD_RE = /\bsrtg_[A-Za-z0-9_-]{8,}/g;
var KV_WEBHOOK_SECRET_RE = /\bsrkw_[A-Za-z0-9_-]{8,}/g;
var AGENT_CONNECTION_AUTH_RE = /ScreenRig-Agent-Connect\s+\S+/gi;
var AGENTID_CLAIM_RE = /\bagid_[A-Za-z0-9_-]{8,}\b/g;
var CLIENT_CREDENTIAL_RE = /\b(cli|xchg)_[A-Za-z0-9_-]{43}\b/g;
var URL_SIGNATURE_RE = /([?&](?:X-Amz-Signature|X-Goog-Signature|signature)=)[^&#\s"'<>]+/gi;
var URL_USERINFO_PASSWORD_RE = /(\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@"'<>]*):[^\s/@"'<>]+@/gi;
var JWT_RE = /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{16,}/g;
var URL_FRAGMENT_TOKEN_RE = /#(token|link|provision|fleet|screen)=[A-Za-z0-9_-]{8,}/gi;
var SENSITIVE_KEY_RE = /(authorization|access_token|token|password|secret|private[_-]?(?:key|jwk)|ciphertext|nonce|cookie|object_key|signed_url|completion_nonce|upload_url|image_bytes|pixels|agentid_claim|claim_code|idempotency|beta_key|device_code|assertion)/i;
var SENSITIVE_VALUE_RE = /(sr_live_|sac_|whsec_|srfl_|srsl_|srtg_|srkw_|agid_|(?:cli|xchg)_[A-Za-z0-9_-]{43}|Bearer\s|ScreenRig-Agent-Connect\s|data:image\/|#(token|link|provision|fleet|screen)=|[?&](X-Amz-Signature|X-Goog-Signature|signature)=|\beyJ[A-Za-z0-9_-]{8,}\.eyJ)/i;
function tokenLookupId(token) {
  const match = /^sr_live_([A-Za-z0-9_-]+)_/.exec(token);
  return match?.[1];
}
var REDACTED_TOKEN = "sr_live_***";
function isSensitiveKey(key) {
  return SENSITIVE_KEY_RE.test(key);
}
function isSensitiveValue(value) {
  return SENSITIVE_VALUE_RE.test(value);
}
function redactText(value) {
  return value.replace(JWT_RE, "jwt_***").replace(TOKEN_RE, REDACTED_TOKEN).replace(AGENT_CONNECTION_TOKEN_RE, "sac_***").replace(AGENT_CONNECTION_AUTH_RE, "ScreenRig-Agent-Connect ***").replace(BEARER_RE, "Bearer ***").replace(AGENTID_CLAIM_RE, "agid_***").replace(CLIENT_CREDENTIAL_RE, "$1_***").replace(WEBHOOK_SECRET_RE, "whsec_***").replace(URL_FRAGMENT_TOKEN_RE, (_match, name) => "#".concat(name.toLowerCase(), "=***")).replace(FLEET_LINK_SECRET_RE, "srfl_***").replace(SCREEN_LINK_SECRET_RE, "srsl_***").replace(TRIGGER_PASSWORD_RE, "srtg_***").replace(KV_WEBHOOK_SECRET_RE, "srkw_***").replace(URL_SIGNATURE_RE, "$1***").replace(URL_USERINFO_PASSWORD_RE, "$1:***@");
}
function redactSensitive(nested) {
  if (typeof nested === "string" && tokenLookupId(nested)) {
    return REDACTED_TOKEN;
  }
  return "***";
}
function redactValue(value) {
  if (typeof value === "string") {
    return redactText(value);
  }
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      if (isSensitiveKey(key)) {
        out[key] = redactSensitive(nested);
        continue;
      }
      out[key] = redactValue(nested);
    }
    return out;
  }
  return value;
}
function redactEvent(value) {
  if (typeof value === "string") {
    return redactText(value);
  }
  if (Array.isArray(value)) {
    return value.map(redactEvent);
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      if (isSensitiveKey(key))
        continue;
      if (typeof nested === "string" && isSensitiveValue(nested))
        continue;
      out[key] = redactEvent(nested);
    }
    return out;
  }
  return value;
}

// dist/problems.js
var PROBLEM_BASE = "https://screenrig.ai/problems";
var CliError = class extends Error {
  problem;
  exitCode;
  warnings;
  constructor(problem, exitCode, warnings = []) {
    super(problem.detail || problem.title);
    this.name = "CliError";
    this.problem = problem;
    this.exitCode = exitCode ?? exitCodeForStatus(problem.status);
    this.warnings = warnings;
  }
};
function problemType(code) {
  return "".concat(PROBLEM_BASE, "/").concat(code.replaceAll("_", "-"));
}
function makeProblem(code, title, status, detail, extras) {
  return {
    type: extras?.type ?? problemType(code),
    title,
    status,
    detail,
    ...extras?.hint ? { hint: extras.hint } : {},
    instance: extras?.instance,
    code,
    request_id: extras?.request_id,
    operation_id: extras?.operation_id,
    current_revision: extras?.current_revision,
    ...extras?.display ? { display: extras.display } : {},
    errors: extras?.errors ?? [],
    next: extras?.next
  };
}
function asRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  return value;
}
function asString(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function asNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function reportedDisplayOf(value) {
  const display = asRecord(value);
  const reportedAt = asString(display?.reported_at);
  if (!reportedAt || !Number.isFinite(Date.parse(reportedAt)) || typeof display?.stale !== "boolean")
    return void 0;
  const power = display.power === "on" || display.power === "off" || display.power === "standby" || display.power === "unknown" ? display.power : void 0;
  return {
    ...power ? { power } : {},
    ...typeof display.connected === "boolean" ? { connected: display.connected } : {},
    reported_at: reportedAt,
    stale: display.stale
  };
}
function asArgv(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 64) {
    return void 0;
  }
  return value.every((item) => typeof item === "string" && item.length > 0 && item.length <= 2048) ? value : void 0;
}
var NEXT_COMMAND_MAX_CHARS = 2048;
function literalCommandWords(command) {
  const words = [];
  let current = "";
  let inWord = false;
  let quote;
  const chars = Array.from(command);
  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];
    const code = ch.codePointAt(0);
    if (code < 32 || code === 127) {
      return void 0;
    }
    if (quote === "'") {
      if (ch === "'")
        quote = void 0;
      else
        current += ch;
    } else if (quote === '"') {
      if (ch === '"')
        quote = void 0;
      else if (ch === "$" || ch === "`" || ch === "\\" || ch === "!")
        return void 0;
      else
        current += ch;
    } else if (ch === "'" || ch === '"') {
      quote = ch;
      inWord = true;
    } else if (ch === " ") {
      if (inWord) {
        words.push(current);
        current = "";
        inWord = false;
      }
    } else if (ch === "\\") {
      const escaped = chars[i + 1];
      if (escaped !== "'")
        return void 0;
      current += escaped;
      inWord = true;
      i += 1;
    } else if (/^[A-Za-z0-9_./:=@%+,-]$/.test(ch)) {
      current += ch;
      inWord = true;
    } else {
      return void 0;
    }
  }
  if (quote !== void 0) {
    return void 0;
  }
  if (inWord) {
    words.push(current);
  }
  return words;
}
function asNext(value) {
  const rec = asRecord(value);
  if (!rec) {
    return void 0;
  }
  const command = asString(rec.command);
  const reason = asString(rec.reason);
  if (!command || !reason || command.length > NEXT_COMMAND_MAX_CHARS) {
    return void 0;
  }
  const words = literalCommandWords(command);
  if (!words || words[0] !== "screenrig") {
    return void 0;
  }
  const argv = asArgv(rec.argv);
  if (!argv) {
    return { command, reason };
  }
  const rest = words.slice(1);
  return argv.length === rest.length && argv.every((word, index) => word === rest[index]) ? { command, reason, argv } : void 0;
}
function flattenProblemDocument(rec) {
  if (!rec || !Array.isArray(rec.errors) || asString(rec.code) !== void 0) {
    return rec;
  }
  const first = asRecord(rec.errors[0]);
  if (!first || !(asString(first.code) || asString(first.detail) || asString(first.title))) {
    return rec;
  }
  const fields = rec.errors.map(asRecord).filter((entry) => entry !== void 0 && asString(entry.field) !== void 0).map((entry) => asString(entry.detail) ? { field: entry.field, detail: entry.detail } : { field: entry.field });
  return { ...rec, ...first, errors: fields };
}
function problemCodeOf(body) {
  return asString(flattenProblemDocument(asRecord(body))?.code);
}
function isProblemDocument(rec) {
  return Boolean(rec && (asString(rec.code) || asString(rec.detail) || asString(rec.title)));
}
var BODY_SNIPPET_CHARS = 300;
function bodySnippet(text) {
  const flat = text === void 0 ? "" : redactText(text).replace(/\s+/g, " ").trim();
  if (!flat) {
    return void 0;
  }
  return flat.length > BODY_SNIPPET_CHARS ? "".concat(flat.slice(0, BODY_SNIPPET_CHARS), "\u2026") : flat;
}
function foreignBodyHint(status) {
  if (status >= 500 || status === 408 || status === 429) {
    return "Something between the CLI and the API (a proxy, gateway, or load balancer) answered instead of screenRIG. Wait a minute and retry; if it keeps happening, check --api-url with screenrig doctor and report the request_id with screenrig feedback bug.";
  }
  return "The answer did not come from the screenRIG API, so the request was probably not processed. Check --api-url and any proxy with screenrig doctor, then retry; if it keeps happening, report the request_id with screenrig feedback bug.";
}
function uploadScopeOf(value) {
  const scope = asRecord(value);
  const ids = (list) => Array.isArray(list) && list.every((id) => typeof id === "string") ? list : void 0;
  const playlists = ids(scope?.playlist_ids), folders = ids(scope?.folder_ids);
  if (!playlists || !folders)
    return void 0;
  const access = scope?.access === "propose" || scope?.access === "manage" ? scope.access : void 0;
  return { playlist_ids: playlists, folder_ids: folders, ...access ? { access } : {} };
}
function screenScopeOf(value) {
  const scope = asRecord(value);
  const ids = (list) => Array.isArray(list) && list.every((id) => typeof id === "string") ? list : void 0;
  const folders = ids(scope?.folder_ids), screens = ids(scope?.screen_ids);
  return folders && screens ? { folder_ids: folders, screen_ids: screens } : void 0;
}
function screenScopeText(scope) {
  return "folders ".concat(scope.folder_ids.join(", ") || "none", "; screens ").concat(scope.screen_ids.join(", ") || "none");
}
function planIdOf(value) {
  return typeof value === "string" && /^[a-z][a-z0-9_]{0,39}$/.test(value) ? value : void 0;
}
function normalizeProblem(input, fallback = {}) {
  const redacted = flattenProblemDocument(asRecord(redactValue(input)));
  const rec = isProblemDocument(redacted) ? redacted : void 0;
  const status = asNumber(rec?.status) ?? fallback.status ?? 500;
  const code = asString(rec?.code) ?? (status === 401 ? "unauthorized" : status >= 500 ? "internal_error" : "http_error");
  const foreign = !rec && fallback.bodyText !== void 0;
  const snippet = foreign ? bodySnippet(fallback.bodyText) : void 0;
  const title = asString(rec?.title) ?? (foreign ? "Unexpected error response" : "Request failed");
  const detail = asString(rec?.detail) ?? (foreign ? snippet ? "HTTP ".concat(status, " answered with a body that is not a screenRIG problem document: ").concat(snippet) : "HTTP ".concat(status, " answered with an empty body.") : title);
  const errors = Array.isArray(rec?.errors) ? rec.errors : [];
  const missingCapability = status === 403 && code === "forbidden" ? /^This agent credential lacks the (screens|content|playlists|advertising|reports|project) capability\.$/.exec(detail)?.[1] : void 0;
  const hint = code === "project_required" ? "Select a project with project use ID or --project-id ID, then retry." : asString(rec?.hint) ?? (foreign ? foreignBodyHint(status) : void 0);
  const retryable = typeof rec?.retryable === "boolean" ? rec.retryable : void 0;
  const traceId = asString(rec?.trace_id);
  const limitedBy = rec?.access_limited_by === "project" || rec?.access_limited_by === "person" ? rec.access_limited_by : void 0;
  const uploadScope = uploadScopeOf(rec?.upload_scope);
  const screenScope = screenScopeOf(rec?.screen_scope);
  const display = code === "screenshot_unavailable" ? reportedDisplayOf(rec?.display) : void 0;
  const feature = planIdOf(rec?.feature), plan = planIdOf(rec?.plan), requiredPlan = planIdOf(rec?.required_plan);
  return {
    type: asString(rec?.type) ?? problemType(code),
    title,
    status,
    detail,
    ...hint ? { hint } : {},
    instance: asString(rec?.instance),
    code,
    request_id: asString(rec?.request_id) ?? fallback.request_id,
    ...traceId ? { trace_id: traceId } : {},
    operation_id: asString(rec?.operation_id),
    current_revision: asNumber(rec?.current_revision),
    ...limitedBy ? { access_limited_by: limitedBy } : {},
    ...uploadScope ? { upload_scope: uploadScope } : {},
    ...screenScope ? { screen_scope: screenScope } : {},
    ...display ? { display } : {},
    ...feature ? { feature } : {},
    ...plan ? { plan } : {},
    ...requiredPlan ? { required_plan: requiredPlan } : {},
    ...retryable !== void 0 ? { retryable } : {},
    errors,
    // A valid server next action wins over local guidance; asNext drops any that is not a plain screenrig command.
    next: code === "project_required" ? { command: "screenrig project list", reason: "Select a project with project use ID or --project-id ID, then retry." } : asNext(rec?.next) ?? (missingCapability ? {
      command: "screenrig login",
      reason: "This sign-in lacks the ".concat(missingCapability, " capability. Sign in again and ask the person approving it in the dashboard to grant ").concat(missingCapability, ".")
    } : void 0)
  };
}
function renderProblemError(entry) {
  const rec = asRecord(entry);
  if (!rec) {
    return void 0;
  }
  const field = asString(rec.field);
  const message = asString(rec.detail);
  const code = asString(rec.code);
  const suffix = code && message ? " (".concat(code, ")") : "";
  if (field && message) {
    return "".concat(field, ": ").concat(message).concat(suffix);
  }
  return message ? "".concat(message).concat(suffix) : field;
}
function renderProblem(problem) {
  const local = problem.code === "transport_error" || problem.code === "timeout";
  const lines = ["".concat(problem.title, " (").concat(problem.code).concat(local ? "" : "/".concat(problem.status), ")"), problem.detail];
  for (const entry of problem.errors) {
    const rendered = renderProblemError(entry);
    if (rendered) {
      lines.push("- ".concat(rendered));
    }
  }
  if (problem.hint) {
    lines.push("hint: ".concat(problem.hint));
  }
  if (problem.request_id) {
    lines.push("request_id: ".concat(problem.request_id));
  }
  if (problem.trace_id) {
    lines.push("trace_id: ".concat(problem.trace_id));
  }
  if (problem.operation_id) {
    lines.push("operation_id: ".concat(problem.operation_id));
  }
  if (typeof problem.current_revision === "number") {
    lines.push("current_revision: ".concat(problem.current_revision));
  }
  if (problem.access_limited_by) {
    lines.push("access_limited_by: ".concat(problem.access_limited_by));
  }
  if (problem.upload_scope) {
    lines.push("upload_scope: folders ".concat(problem.upload_scope.folder_ids.join(", ") || "none", "; playlists ").concat(problem.upload_scope.playlist_ids.join(", ") || "none"));
  }
  if (problem.screen_scope) {
    lines.push("screen_scope: ".concat(screenScopeText(problem.screen_scope)));
  }
  if (problem.feature) {
    lines.push("feature: ".concat(problem.feature));
  }
  if (problem.plan) {
    lines.push("plan: ".concat(problem.plan));
  }
  if (problem.required_plan) {
    lines.push("required_plan: ".concat(problem.required_plan));
  }
  if (typeof problem.retryable === "boolean") {
    lines.push("retryable: ".concat(problem.retryable));
  }
  if (typeof problem.retry_after_seconds === "number") {
    lines.push("retry_after_seconds: ".concat(problem.retry_after_seconds));
  }
  if (problem.next) {
    lines.push("next: ".concat(problem.next.command));
    lines.push("      ".concat(problem.next.reason));
    if (problem.next.argv) {
      lines.push("      argv: ".concat(JSON.stringify(problem.next.argv)));
    }
    if (problem.next.after_inspection) {
      lines.push("      after inspection: ".concat(problem.next.after_inspection.command));
      lines.push("      ".concat(problem.next.after_inspection.reason));
    }
  }
  return lines.join("\n");
}
function parseRetryAfter(value, nowMs) {
  const text = value?.trim();
  if (!text) {
    return void 0;
  }
  if (/^\d+$/.test(text)) {
    const seconds = Number.parseInt(text, 10);
    return Number.isFinite(seconds) && seconds >= 0 ? seconds : void 0;
  }
  const at = Date.parse(text);
  if (!Number.isFinite(at)) {
    return void 0;
  }
  return Math.max(0, Math.ceil((at - nowMs) / 1e3));
}
function withGuidance(problem, guidance) {
  const hint = problem.hint ?? guidance.hint;
  const next = problem.next ?? guidance.next;
  return {
    ...problem,
    ...hint ? { hint } : {},
    ...next ? { next } : {}
  };
}
function withRetryAfter(problem, retryAfterSeconds) {
  if (retryAfterSeconds === void 0)
    return problem;
  if (problem.status === 503)
    return { ...problem, retry_after_seconds: retryAfterSeconds };
  if (problem.status !== 429) {
    return problem;
  }
  const detail = problem.detail.includes("Retry-After") ? problem.detail : "".concat(problem.detail, " Retry-After is ").concat(retryAfterSeconds, " seconds.");
  return { ...problem, detail, retry_after_seconds: retryAfterSeconds };
}
function withQuotaGuidance(problem) {
  if (problem.code !== "quota_exceeded") {
    return problem;
  }
  return withGuidance(problem, {
    hint: "The project is at its storage limit. Delete media or applications that are no longer used (screenrig media list, then screenrig media delete ID), or upload a smaller file, then retry.",
    next: {
      command: "screenrig project show",
      reason: "Read used_bytes and content_limit_bytes, then free space or upload a smaller file."
    }
  });
}
function withOverbookingGuidance(problem) {
  if (problem.code !== "goal_overbooked") {
    return problem;
  }
  return withGuidance(problem, {
    next: {
      command: "screenrig ads direct availability --help",
      reason: "Shows how to estimate the plays still available: the query document takes the draft's targeting, dayparts, flight_start and flight_end."
    }
  });
}
function withScreenScopeGuidance(problem) {
  if (problem.code !== "outside_screen_scope")
    return problem;
  return withGuidance(problem, {
    next: {
      command: "screenrig agent status",
      reason: "Shows screen_scope, the folders and screens this agent is limited to, and person_screen_scope, its responsible person's; the agent acts on what both allow. Only the project owner widens a scope, in the dashboard."
    }
  });
}
var PAYMENT_CODES = /* @__PURE__ */ new Set(["payment_required", "insufficient_credits"]);
function withPaymentGuidance(problem) {
  if (!PAYMENT_CODES.has(problem.code)) {
    return problem;
  }
  return withGuidance(problem, {
    hint: "This operation needs credit the project does not have, so retrying it is refused the same way. Stop retrying it, tell the user it was refused for lack of credit, and continue the task by other means where you can: for an image, create it with your own tools and add it with screenrig media upload. For an upload that would store more than 1 GB on Standard with no credit left, do not upload again and tell the user to add credit or delete content to get back under 1 GB.",
    next: {
      command: "screenrig billing balance",
      reason: "Shows remaining, reserved, and available credits so you can tell the user exactly what is left."
    }
  });
}
function planTitle(id) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}
function withPlanGuidance(problem) {
  const plan = problem.required_plan ? planTitle(problem.required_plan) : void 0;
  let guided = problem;
  if (problem.code === "feature_not_in_plan") {
    guided = withGuidance(problem, {
      next: {
        command: "screenrig project capabilities",
        reason: "Lists the features this project's plan has and which plan includes each one, so you can tell the user what the refused feature needs."
      }
    });
    if (plan && guided.hint && !guided.hint.includes(plan)) {
      guided = { ...guided, hint: "".concat(guided.hint, " The ").concat(plan, " plan includes it.") };
    }
    return guided;
  }
  if ((problem.code === "member_limit_reached" || problem.code === "project_limit_reached") && plan && problem.hint && !problem.hint.includes(plan)) {
    return { ...problem, hint: "".concat(problem.hint, " The ").concat(plan, " plan raises this limit; tell the user if more is needed.") };
  }
  return guided;
}
var DEFAULT_HINTS = {
  usage_error: "Fix the argument or input named in detail and run the command again. Add --help to the command to see its arguments, accepted values, and an example.",
  not_enrolled: "This installation has no active agent credential. Run the next command, then run the original command again.",
  unauthenticated: "This installation has no active agent credential. Run the next command, then run the original command again.",
  config_error: "Fix the configuration named in detail, or add --config with a different private config file. screenrig doctor checks the configuration without sending requests.",
  file_error: "Check that the target directory exists, is writable, and has free space, or choose a different output path, then run the command again.",
  unexpected_response: "The API answered with something the CLI cannot use, often a proxy or gateway page. Check --api-url with screenrig doctor and retry; if it keeps happening, report the request_id with screenrig feedback bug.",
  transport_error: "The CLI could not reach the API. Check network connectivity and the configured API with screenrig doctor, then run the command again.",
  timeout: "The request did not finish in time. Reads are safe to rerun, optionally with a larger --timeout. A write may already have happened: inspect the resource before changing it again.",
  unexpected_error: "The CLI hit an internal error. Run the command again; if it keeps happening, report the command (without secrets) with screenrig feedback bug.",
  operation_failed: "The server finished the operation with an error. Read detail, fix the input it names, and start the command again; screenrig operations show OPERATION_ID shows the stored result.",
  invalid_request: "The server rejected the request as invalid. Read detail and errors[] for the field to change, fix it, and send the request again; the unchanged request is refused the same way.",
  unauthorized: "The stored credential was not accepted, so this installation's project is gone. Clear it with screenrig agent disconnect --yes, then create a new project with screenrig agent enroll --email ADDRESS --organization NAME. Use screenrig login only when the user asked to join an existing project.",
  capability_required: "This project does not have the capability this command needs. Do not retry; tell the user, who can change the project's purpose in the dashboard.",
  capability_unavailable: "The project's capabilities could not be read, so the write was not attempted. Retry shortly; screenrig project capabilities checks them directly.",
  not_found: "Nothing with that id exists in this project. Check the id with the matching list command (for example screenrig screen list) and use an id from its output.",
  resource_conflict: "The resource is not in a state that allows this change. Inspect it with its show command, then retry only once its state allows the change.",
  quota_exceeded: "The project is at a limit. Free space or use a smaller input, then retry.",
  not_ready: "The resource is still being prepared. Wait a few seconds and retry, or follow its operation with screenrig operations wait OPERATION_ID.",
  internal_error: "The server failed while handling the request. If retryable is true, wait a moment and retry; otherwise report the request_id with screenrig feedback bug.",
  dependency_unavailable: "A service the API depends on is unavailable. Wait a minute and retry the same command."
};
function statusHint(problem) {
  if (problem.status >= 500) {
    return problem.retryable === false ? "The server could not complete this request, and repeating it unchanged will not help. Report the request_id with screenrig feedback bug." : "The server could not complete this request. Wait a minute and retry the same command; if it keeps failing, report the request_id with screenrig feedback bug.";
  }
  return "The server refused this request; detail says why. Change what it names before trying again, because the unchanged request is refused the same way.";
}
function withDefaultHint(problem) {
  if (problem.hint) {
    return problem;
  }
  return { ...problem, hint: DEFAULT_HINTS[problem.code] ?? statusHint(problem) };
}
function usageError(detail, next, hint) {
  return new CliError(makeProblem("usage_error", "Invalid command usage", 400, detail, {
    next,
    hint
  }), ExitCode.Usage);
}
function notEnrolledError(detail, next) {
  return new CliError(makeProblem("not_enrolled", "Installation is not enrolled", 401, detail, { next }), ExitCode.Auth);
}
function configError(detail, next, hint) {
  return new CliError(makeProblem("config_error", "Configuration error", 400, detail, { next, hint }), ExitCode.Config);
}
function fileError(detail, error) {
  const code = error?.code;
  const hint = code === "ENOSPC" ? "The disk is full. Free space or choose an output path on another disk, then run the command again." : code === "EACCES" || code === "EPERM" || code === "EROFS" ? "This process cannot write there. Choose an output path in a directory you can write, then run the command again." : code === "ENOENT" || code === "ENOTDIR" ? "The target directory does not exist. Create it or choose another output path, then run the command again." : void 0;
  return new CliError(makeProblem("file_error", "Cannot write the output file", 500, code ? "".concat(detail, " (").concat(code, ")") : detail, { hint }), ExitCode.Unexpected);
}
function unexpectedResponseError(detail, request_id, hint) {
  return new CliError(makeProblem("unexpected_response", "Unexpected response", 502, detail, { request_id, hint }), ExitCode.Unexpected);
}
function networkError(detail, request_id, hint) {
  return new CliError(makeProblem("transport_error", "Network error", 503, detail, {
    request_id,
    hint,
    next: { command: "screenrig doctor", reason: "Shows the configured API origin and credential without sending requests, so you can check where the CLI is connecting." }
  }), ExitCode.Network);
}
function timeoutError(detail, request_id, hint) {
  return new CliError(makeProblem("timeout", "Timed out", 408, detail, { request_id, hint }), ExitCode.Timeout);
}

export {
  ExitCode,
  exitCodeForStatus,
  OAUTH_PROBLEMS,
  isSensitiveKey,
  isSensitiveValue,
  redactText,
  redactValue,
  redactEvent,
  CliError,
  makeProblem,
  reportedDisplayOf,
  problemCodeOf,
  bodySnippet,
  screenScopeOf,
  screenScopeText,
  normalizeProblem,
  renderProblem,
  parseRetryAfter,
  withRetryAfter,
  withQuotaGuidance,
  withOverbookingGuidance,
  withScreenScopeGuidance,
  withPaymentGuidance,
  withPlanGuidance,
  withDefaultHint,
  usageError,
  notEnrolledError,
  configError,
  fileError,
  unexpectedResponseError,
  networkError,
  timeoutError
};
