import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  isResourceID
} from "./chunk-SFYZH3GR.js";
import {
  CliError,
  ExitCode,
  OAUTH_PROBLEMS,
  configError,
  exitCodeForStatus,
  makeProblem,
  normalizeProblem,
  parseRetryAfter,
  redactText,
  unexpectedResponseError,
  usageError,
  withRetryAfter
} from "./chunk-JP4OQPAN.js";
import {
  __export
} from "./chunk-3FYAGULW.js";

// dist/command-input.js
var command_input_exports = {};
__export(command_input_exports, {
  flagBool: () => flagBool,
  flagNumber: () => flagNumber,
  flagString: () => flagString
});
function flagString(flags, name) {
  const value = flags[name];
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function flagBool(flags, name) {
  return flags[name] === true;
}
function flagNumber(flags, name) {
  const value = flagString(flags, name);
  if (value === void 0) {
    return void 0;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : void 0;
}

// dist/oauth.js
var oauth_exports = {};
__export(oauth_exports, {
  ACCESS_LEVELS: () => ACCESS_LEVELS,
  GRANT_DEVICE_CODE: () => GRANT_DEVICE_CODE,
  OAUTH_CLIENT_ID: () => OAUTH_CLIENT_ID,
  OAUTH_TIMEOUT_MS: () => OAUTH_TIMEOUT_MS,
  OAuthClient: () => OAuthClient,
  SCOPE_IDENTITY: () => SCOPE_IDENTITY,
  accessClaims: () => accessClaims,
  accessFromScope: () => accessFromScope,
  accessLabel: () => accessLabel,
  clientAssertion: () => clientAssertion,
  isServiceClientId: () => isServiceClientId,
  isSessionJwt: () => isSessionJwt,
  jwkThumbprint: () => jwkThumbprint,
  loopbackOrigin: () => loopbackOrigin,
  newOAuthRequestId: () => newOAuthRequestId,
  oauthUnavailable: () => oauthUnavailable,
  publicJwk: () => publicJwk,
  readKeyFile: () => readKeyFile,
  serviceCredentialsFromConfig: () => serviceCredentialsFromConfig
});
import { createHash, createPrivateKey, createPublicKey, randomBytes, sign } from "node:crypto";
var OAUTH_CLIENT_ID = "screenrig-cli";
var GRANT_DEVICE_CODE = "urn:ietf:params:oauth:grant-type:device_code";
var SCOPE_IDENTITY = "identity";
var OAUTH_TIMEOUT_MS = 6e4;
var ACCESS_LEVELS = ["read", "propose", "manage"];
function accessLabel(level) {
  return level === "manage" ? "Manage" : level === "propose" ? "Propose" : "Read only";
}
function accessFromScope(scope) {
  return ACCESS_LEVELS.find((level) => scope.includes("access:".concat(level))) ?? "read";
}
function isSessionJwt(token) {
  return typeof token === "string" && /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
}
function accessClaims(token) {
  if (!isSessionJwt(token))
    return void 0;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    if (typeof payload.exp !== "number")
      return void 0;
    const scope = typeof payload.scope === "string" ? payload.scope.split(" ").filter(Boolean) : [];
    return {
      exp: payload.exp,
      ...payload.projects && typeof payload.projects === "object" && !Array.isArray(payload.projects) ? { projects: payload.projects } : {},
      ...typeof payload.prj === "string" && payload.prj ? { prj: payload.prj } : {},
      ...typeof payload.sid === "string" && payload.sid ? { sid: payload.sid } : {},
      ...typeof payload.sub === "string" ? { sub: payload.sub } : {},
      ...typeof payload.client_id === "string" ? { clientId: payload.client_id } : {},
      scope
    };
  } catch {
    return void 0;
  }
}
function newOAuthRequestId() {
  return randomBytes(32).toString("base64url");
}
function loopbackOrigin(url) {
  const host = url.hostname;
  return url.protocol === "http:" && (host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1" || host === "[::1]");
}
function oauthProblem(error, status, description, retryAfter) {
  const row = OAUTH_PROBLEMS[error];
  const detail = description ? "".concat(description, " (").concat(error, ")") : "The authorization server answered ".concat(error, ".");
  if (!row) {
    return new CliError(makeProblem(error.replace(/[^a-z0-9_]/gi, "_") || "oauth_error", "Authorization failed", status, detail));
  }
  const problem = withRetryAfter(makeProblem(row.code, row.title, status, detail, row.next ? { next: row.next } : void 0), parseRetryAfter(retryAfter, Date.now()));
  return new CliError(problem, row.exitCode);
}
function oauthUnavailable(detail, status = 404) {
  return new CliError(makeProblem("oauth_unavailable", "Sign-in unavailable", status, detail), ExitCode.Unexpected);
}
function errorBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    return void 0;
  const { error, error_description: description } = body;
  return typeof error === "string" && error ? { error, ...typeof description === "string" ? { error_description: description } : {} } : void 0;
}
function jsonObject(response) {
  let body = response.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return void 0;
    }
  }
  return body && typeof body === "object" && !Array.isArray(body) && !(body instanceof Uint8Array) ? body : void 0;
}
function unexpected(status, detail) {
  return new CliError(makeProblem("unexpected_response", "Unexpected response", status, redactText(detail)), status >= 500 ? ExitCode.Server : ExitCode.Unexpected);
}
function refusal(response, what) {
  const body = errorBody(jsonObject(response));
  const retryAfter = response.headers["retry-after"];
  if (body) {
    if (body.error === "authorization_pending" || body.error === "slow_down") {
      return new CliError(makeProblem(body.error, body.error, response.status, body.error_description ?? body.error));
    }
    return oauthProblem(body.error, response.status, body.error_description, retryAfter);
  }
  if (response.status === 429)
    return oauthProblem("rate_limited", 429, void 0, retryAfter);
  return unexpected(response.status, "The authorization server answered ".concat(what, " with HTTP ").concat(response.status, " and no OAuth error."));
}
function tokenSet(response) {
  const body = jsonObject(response);
  const accessToken = body?.access_token;
  const refreshToken = body?.refresh_token;
  if (!body || typeof accessToken !== "string" || !isSessionJwt(accessToken) || typeof body.token_type !== "string" || body.token_type.toLowerCase() !== "bearer" || refreshToken !== void 0 && (typeof refreshToken !== "string" || !refreshToken)) {
    throw unexpected(response.status, "The token response does not carry a bearer session JWT.");
  }
  const refreshExpiresAt = body.refresh_expires_at;
  return {
    accessToken,
    expiresIn: typeof body.expires_in === "number" ? body.expires_in : 900,
    ...typeof refreshToken === "string" ? { refreshToken } : {},
    ...typeof refreshExpiresAt === "number" ? { refreshExpiresAt } : {},
    scope: typeof body.scope === "string" ? body.scope.split(" ").filter(Boolean) : accessClaims(accessToken)?.scope ?? []
  };
}
function formEncode(value) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}
var OAuthClient = class {
  apiUrl;
  transport;
  service;
  metadata;
  constructor(apiUrl, transport, service) {
    this.apiUrl = apiUrl;
    this.transport = transport;
    this.service = service;
  }
  get issuer() {
    return new URL(this.apiUrl).origin;
  }
  /** One request to the authorization server, never redirected. */
  async send(method, endpoint, form, headers = {}) {
    const target = new URL(endpoint);
    if (target.origin !== this.issuer) {
      throw oauthUnavailable("The authorization server named ".concat(target.origin, ", not ").concat(this.issuer, ". Nothing was sent."), 400);
    }
    const response = await this.transport.request({
      method,
      path: target.pathname,
      headers: { accept: "application/json", ...form ? { "content-type": "application/x-www-form-urlencoded" } : {}, ...headers },
      ...form ? { body: form.toString() } : {},
      credential: true,
      timeout_ms: OAUTH_TIMEOUT_MS
    });
    if (response.status >= 300 && response.status < 400) {
      throw new CliError(makeProblem("credential_redirect_refused", "Redirect refused", response.status, "The authorization server answered ".concat(target.pathname, " with a redirect (HTTP ").concat(response.status, "). Nothing was sent onward.")), ExitCode.Unexpected);
    }
    return response;
  }
  discover() {
    this.metadata ??= this.discoverOnce();
    return this.metadata;
  }
  /** Fetch and validate the discovery document, so no lock is held for it. */
  async ready() {
    await this.discover();
  }
  /** RFC 8414 metadata, accepted only when it names this exact origin and serves every endpoint from it. */
  async discoverOnce() {
    const server = new URL(this.issuer);
    if (server.protocol !== "https:" && !loopbackOrigin(server)) {
      throw oauthUnavailable("".concat(server.origin, " is not HTTPS. Nothing was sent."), 400);
    }
    const response = await this.send("GET", "".concat(server.origin, "/.well-known/oauth-authorization-server"));
    const metadata = response.status === 200 ? jsonObject(response) : void 0;
    if (!metadata)
      throw oauthUnavailable("".concat(server.origin, " has no authorization server metadata (HTTP ").concat(response.status, ")."), response.status === 200 ? 502 : response.status);
    if (metadata.issuer !== server.origin) {
      throw oauthUnavailable("The authorization server metadata names issuer ".concat(JSON.stringify(metadata.issuer), ", not ").concat(server.origin, ". Nothing was sent."), 400);
    }
    for (const name of ["token_endpoint", "revocation_endpoint", "device_authorization_endpoint"]) {
      const value = metadata[name];
      if (value === void 0)
        continue;
      let endpoint;
      try {
        endpoint = new URL(String(value));
      } catch {
        throw oauthUnavailable("The authorization server metadata has an invalid ".concat(name, ". Nothing was sent."), 400);
      }
      if (typeof value !== "string" || endpoint.origin !== server.origin || endpoint.protocol !== "https:" && !loopbackOrigin(endpoint)) {
        throw oauthUnavailable("The authorization server metadata puts ".concat(name, " at ").concat(endpoint.origin, ", not ").concat(server.origin, ". Nothing was sent."), 400);
      }
    }
    if (typeof metadata.token_endpoint !== "string")
      throw oauthUnavailable("The authorization server metadata has no token endpoint. Nothing was sent.");
    return metadata;
  }
  /** Client authentication: a service client by HTTP Basic or a signed assertion, the CLI by its public client_id. */
  authenticate(form, metadata) {
    const service = this.service;
    if (!service) {
      form.set("client_id", OAUTH_CLIENT_ID);
      return {};
    }
    if (service.method === "client_secret_basic") {
      return { authorization: "Basic ".concat(Buffer.from("".concat(formEncode(service.clientId), ":").concat(formEncode(service.secret))).toString("base64")) };
    }
    form.set("client_id", service.clientId);
    form.set("client_assertion_type", CLIENT_ASSERTION_TYPE);
    form.set("client_assertion", clientAssertion(service, metadata.issuer));
    return {};
  }
  async grant(params) {
    const metadata = await this.discover();
    const form = new URLSearchParams(params);
    const headers = this.authenticate(form, metadata);
    const response = await this.send("POST", metadata.token_endpoint, form, headers);
    if (response.status !== 200)
      throw refusal(response, "the token request");
    return tokenSet(response);
  }
  refresh(refreshToken, options) {
    return this.grant({
      grant_type: "refresh_token",
      resource: "".concat(this.issuer, "/api"),
      refresh_token: refreshToken,
      request_id: options.requestId,
      ...options.projects ? { projects: options.projects.join(" ") } : {}
    });
  }
  async startDevice(options) {
    const metadata = await this.discover();
    if (!metadata.device_authorization_endpoint)
      throw oauthUnavailable("The authorization server offers no device sign-in.");
    const form = new URLSearchParams({
      scope: "access:".concat(options.access),
      agent_type: "cli",
      ...options.projectId ? { project_id: options.projectId } : {},
      ...options.name ? { name: options.name } : {},
      ...options.platform ? { platform: options.platform } : {},
      ...options.version ? { version: options.version } : {},
      ...options.installSource ? { install_source: options.installSource } : {}
    });
    const headers = { ...this.authenticate(form, metadata), ...options.bearer ? { authorization: "Bearer ".concat(options.bearer) } : {} };
    const response = await this.send("POST", metadata.device_authorization_endpoint, form, headers);
    if (response.status !== 200)
      throw refusal(response, "the device sign-in");
    const body = jsonObject(response);
    if (!body || typeof body.device_code !== "string" || typeof body.user_code !== "string" || typeof body.verification_uri !== "string" || typeof body.verification_uri_complete !== "string" || typeof body.expires_in !== "number") {
      throw unexpected(200, "The device sign-in answer is incomplete.");
    }
    return {
      deviceCode: body.device_code,
      userCode: body.user_code,
      verificationUri: body.verification_uri,
      verificationUriComplete: body.verification_uri_complete,
      expiresIn: body.expires_in,
      interval: typeof body.interval === "number" && body.interval >= 5 ? body.interval : 5
    };
  }
  /** A service client's token: 15 minutes, its project, no refresh token. */
  clientCredentials(options = {}) {
    if (!this.service)
      throw new CliError(makeProblem("client_not_allowed", "Client not allowed", 400, "Only a service client uses client credentials."), ExitCode.Auth);
    return this.grant({ grant_type: "client_credentials", ...options.resource ? { resource: options.resource } : {} });
  }
  /** One poll of a device login. Pending and slow_down are states, not errors. */
  async pollDevice(deviceCode) {
    try {
      return { status: "approved", tokens: await this.grant({ grant_type: GRANT_DEVICE_CODE, device_code: deviceCode }) };
    } catch (err) {
      if (err instanceof CliError && err.problem.code === "authorization_pending")
        return { status: "pending" };
      if (err instanceof CliError && err.problem.code === "slow_down")
        return { status: "slow_down" };
      throw err;
    }
  }
  /** RFC 7009. The server answers 200 for an unknown or expired token too. */
  async revoke(token) {
    const metadata = await this.discover();
    if (!metadata.revocation_endpoint)
      throw oauthUnavailable("The authorization server offers no revocation endpoint.");
    const form = new URLSearchParams({ token, token_type_hint: "refresh_token" });
    const headers = this.authenticate(form, metadata);
    const response = await this.send("POST", metadata.revocation_endpoint, form, headers);
    if (response.status !== 200)
      throw refusal(response, "the revocation");
  }
};
var CLIENT_ASSERTION_TYPE = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
var ASSERTION_LIFETIME_S = 60;
function clientAssertion(service, issuer, now = Date.now()) {
  const iat = Math.floor(now / 1e3);
  const part = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const input = "".concat(part({ alg: service.alg, kid: service.kid, typ: "JWT" }), ".").concat(part({
    iss: service.clientId,
    sub: service.clientId,
    aud: issuer,
    iat,
    nbf: iat,
    exp: iat + ASSERTION_LIFETIME_S,
    jti: randomBytes(16).toString("base64url")
  }));
  const data = Buffer.from(input);
  const signature = service.alg === "EdDSA" ? sign(null, data, service.key) : service.alg === "ES256" ? sign("sha256", data, { key: service.key, dsaEncoding: "ieee-p1363" }) : sign("sha256", data, service.key);
  return "".concat(input, ".").concat(signature.toString("base64url"));
}
var SERVICE_CLIENT_ID_RE = /^(?:(?:stage|qa|development)_)?scl_[A-Za-z0-9_-]+$/;
function isServiceClientId(value) {
  return typeof value === "string" && SERVICE_CLIENT_ID_RE.test(value);
}
function credentialsError(detail) {
  return new CliError(makeProblem("config_error", "Service client configuration", 400, detail, {
    next: { command: "screenrig service-client --help", reason: "Shows how a service client is created and which variables a run sets." }
  }), ExitCode.Config);
}
function algorithmOf(jwk) {
  if (jwk.kty === "OKP" && jwk.crv === "Ed25519")
    return "EdDSA";
  if (jwk.kty === "EC" && jwk.crv === "P-256")
    return "ES256";
  if (jwk.kty === "RSA" && typeof jwk.n === "string" && Buffer.from(jwk.n, "base64url").length * 8 >= 2048)
    return "RS256";
  throw credentialsError("The key must be Ed25519, EC P-256 or RSA of at least 2048 bits.");
}
function publicJwk(jwk) {
  const { d: _d, p: _p, q: _q, dp: _dp, dq: _dq, qi: _qi, oth: _oth, k: _k, key_ops: _ops, ext: _ext, ...rest } = jwk;
  return rest;
}
function jwkThumbprint(jwk) {
  const required = jwk.kty === "RSA" ? { e: jwk.e, kty: jwk.kty, n: jwk.n } : jwk.kty === "EC" ? { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y } : { crv: jwk.crv, kty: jwk.kty, x: jwk.x };
  return createHash("sha256").update(JSON.stringify(required)).digest("base64url");
}
function readKeyFile(text) {
  const trimmed = text.trim();
  let jwk;
  let privateKey;
  try {
    if (trimmed.startsWith("{")) {
      jwk = JSON.parse(trimmed);
      if (typeof jwk.d === "string")
        privateKey = createPrivateKey({ key: jwk, format: "jwk" });
    } else if (trimmed.includes("PRIVATE KEY")) {
      privateKey = createPrivateKey(trimmed);
      jwk = privateKey.export({ format: "jwk" });
    } else {
      jwk = createPublicKey(trimmed).export({ format: "jwk" });
    }
  } catch {
    throw credentialsError("The key file is not a JWK or a PEM key.");
  }
  if (!jwk || typeof jwk !== "object" || typeof jwk.kty !== "string")
    throw credentialsError("The key file is not a JWK or a PEM key.");
  const alg = algorithmOf(jwk);
  const publicKey = publicJwk(jwk);
  const kid = typeof jwk.kid === "string" && jwk.kid ? jwk.kid : jwkThumbprint(publicKey);
  return { publicKey: { ...publicKey, kid }, ...privateKey ? { privateKey } : {}, kid, alg };
}
async function serviceCredentialsFromConfig(stored, readText) {
  const clientId = stored.client_id;
  if (!isServiceClientId(clientId))
    throw credentialsError("The saved service client id is not a service client id (scl_...); run screenrig login --client-id again.");
  if (Boolean(stored.key_file) === Boolean(stored.secret_file))
    throw credentialsError("The saved service client needs exactly one of a key file or a secret file; run screenrig login --client-id again.");
  const file = stored.key_file ?? stored.secret_file;
  let text;
  try {
    text = await readText(file);
  } catch {
    throw credentialsError("The service client's ".concat(stored.key_file ? "key" : "secret", " file ").concat(file, " cannot be read."));
  }
  if (stored.secret_file) {
    const secret = text.trim();
    if (!secret)
      throw credentialsError("The service client's secret file ".concat(file, " is empty."));
    return { clientId, method: "client_secret_basic", secret };
  }
  const key = readKeyFile(text);
  if (!key.privateKey)
    throw credentialsError("The service client's key file ".concat(file, " must hold the private key; the server keeps only the public one."));
  return { clientId, method: "private_key_jwt", key: key.privateKey, kid: key.kid, alg: key.alg };
}

// dist/screen-control.js
var screen_control_exports = {};
__export(screen_control_exports, {
  LEVEL_DISPLAYS_MAX: () => LEVEL_DISPLAYS_MAX,
  LEVEL_IDLE_DEFAULT_S: () => LEVEL_IDLE_DEFAULT_S,
  LEVEL_IDLE_MAX_S: () => LEVEL_IDLE_MAX_S,
  LEVEL_IDLE_MIN_S: () => LEVEL_IDLE_MIN_S,
  SCHEDULE_DATES_MAX: () => SCHEDULE_DATES_MAX,
  SCHEDULE_ENTRIES_MAX: () => SCHEDULE_ENTRIES_MAX,
  SCHEDULE_EXCEPT_MAX: () => SCHEDULE_EXCEPT_MAX,
  SCHEDULE_MONTHLY_MAX: () => SCHEDULE_MONTHLY_MAX,
  SCHEDULE_WINDOWS_MAX: () => SCHEDULE_WINDOWS_MAX,
  TAKEOVER_FOR_MAX_MS: () => TAKEOVER_FOR_MAX_MS,
  TAKEOVER_MAX_MS: () => TAKEOVER_MAX_MS,
  TAKEOVER_REASON_MAX: () => TAKEOVER_REASON_MAX,
  assignmentLine: () => assignmentLine,
  dataConditionText: () => dataConditionText,
  dateText: () => dateText,
  durationMs: () => durationMs,
  durationOption: () => durationOption,
  effectivePlaylistText: () => effectivePlaylistText,
  instantInZone: () => instantInZone,
  interactionText: () => interactionText,
  isCivilDate: () => isCivilDate,
  levelPlacementParts: () => levelPlacementParts,
  levelRuleParts: () => levelRuleParts,
  monthlyText: () => monthlyText,
  normalizeInstant: () => normalizeInstant,
  playlistInUseProblem: () => playlistInUseProblem,
  scheduleData: () => scheduleData,
  scheduleDate: () => scheduleDate,
  scheduleDisplays: () => scheduleDisplays,
  scheduleEntries: () => scheduleEntries,
  scheduleExcept: () => scheduleExcept,
  scheduleInteraction: () => scheduleInteraction,
  scheduleLevelMembers: () => scheduleLevelMembers,
  scheduleMonthly: () => scheduleMonthly,
  scheduleTableLines: () => scheduleTableLines,
  scheduleWindow: () => scheduleWindow,
  screenControlProblem: () => screenControlProblem,
  takeoverForProblem: () => takeoverForProblem,
  takeoverLine: () => takeoverLine,
  takeoverReason: () => takeoverReason,
  takeoverUntil: () => takeoverUntil,
  takeoverUntilOption: () => takeoverUntilOption
});
var SCHEDULE_ENTRIES_MAX = 32;
var SCHEDULE_WINDOWS_MAX = 16;
var SCHEDULE_MONTHLY_MAX = 16;
var SCHEDULE_DATES_MAX = 100;
var SCHEDULE_EXCEPT_MAX = 100;
var LEVEL_DISPLAYS_MAX = 12;
var LEVEL_IDLE_MIN_S = 5;
var LEVEL_IDLE_MAX_S = 3600;
var LEVEL_IDLE_DEFAULT_S = 60;
var TAKEOVER_REASON_MAX = 120;
var TAKEOVER_MAX_MS = 7 * 24 * 60 * 60 * 1e3;
var DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
var CLOCK = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
var CIVIL = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T([01][0-9]|2[0-3]):[0-5][0-9]$/;
var ENTRY_ID = /^[A-Za-z0-9_-]{1,64}$/;
var CIVIL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
var NTHS = [1, 2, 3, 4, -1];
var COVERS = ["full", "main", "header", "footer", "side"];
var STARTS = ["next_item", "on_time"];
var DATA_KEY = /^(?:[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}|\{screen\.weather\})$/;
var ENTRY_KEYS = ["id", "playlist_id", "from", "until", "windows", "monthly", "dates", "except", "data", "interaction", "covers", "displays", "start", "paused"];
var RFC3339 = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/;
function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
function scheduleError(path2, message) {
  return usageError("Schedule file: ".concat(path2, " ").concat(message), {
    command: "screenrig screen schedule --help",
    reason: 'The file is {"entries": [{"id"?, "playlist_id", "from"?, "until"?, "windows"?, "monthly"?, "dates"?, "except"?, "data"?, "interaction"?, "covers"?, "displays"?, "start"?}]} in priority order, each entry with at least one of from, until, windows, monthly, dates, except, data or interaction.'
  });
}
function onlyKeys(value, allowed, path2, fail = scheduleError) {
  const extra = Object.keys(value).find((key) => !allowed.includes(key));
  if (extra !== void 0)
    throw fail(path2, "has unknown field ".concat(JSON.stringify(extra).slice(0, 80), "; allowed: ").concat(allowed.join(", "), "."));
}
function clockEdges(item, path2, fail) {
  for (const key of ["start", "end"]) {
    if (item[key] !== void 0 && (typeof item[key] !== "string" || !CLOCK.test(item[key]))) {
      throw fail("".concat(path2, ".").concat(key), "must be HH:MM in 24-hour time, such as 07:30.");
    }
  }
  if (item.start === void 0 !== (item.end === void 0)) {
    throw fail(path2, "must set both start and end, or neither for the whole day.");
  }
}
function scheduleWindow(value, path2, fail = scheduleError) {
  const item = record(value);
  if (!item)
    throw fail(path2, "must be an object with days and optional start and end.");
  const extra = Object.keys(item).find((key) => !["days", "start", "end"].includes(key));
  if (extra !== void 0)
    throw fail(path2, "has unknown field ".concat(JSON.stringify(extra).slice(0, 80), "; allowed: days, start, end."));
  const days = item.days;
  if (!Array.isArray(days) || days.length < 1 || days.length > 7)
    throw fail("".concat(path2, ".days"), "must list 1 to 7 days.");
  days.forEach((day, index) => {
    if (typeof day !== "string" || !DAYS.includes(day)) {
      throw fail("".concat(path2, ".days[").concat(index, "]"), "must be one of ".concat(DAYS.join(", "), "."));
    }
  });
  if (new Set(days).size !== days.length)
    throw fail("".concat(path2, ".days"), "must not repeat a day.");
  clockEdges(item, path2, fail);
  return item;
}
function isCivilDate(value) {
  const match = typeof value === "string" ? CIVIL_DATE.exec(value) : null;
  if (!match)
    return false;
  const month = Number(match[2]);
  return month >= 1 && month <= 12 && Number(match[3]) >= 1 && Number(match[3]) <= daysInMonth(Number(match[1]), month);
}
function scheduleMonthly(value, path2, fail = scheduleError) {
  const item = record(value);
  if (!item)
    throw fail(path2, "must be an object with day, or nth and weekday, and optional start and end.");
  onlyKeys(item, ["day", "nth", "weekday", "start", "end"], path2, fail);
  if (item.day !== void 0) {
    if (item.nth !== void 0 || item.weekday !== void 0)
      throw fail(path2, "must set either day, or nth and weekday, not both.");
    if (typeof item.day !== "number" || !Number.isInteger(item.day) || item.day < 1 || item.day > 31) {
      throw fail("".concat(path2, ".day"), "must be a day of the month from 1 to 31.");
    }
  } else {
    if (item.nth === void 0 && item.weekday === void 0)
      throw fail(path2, "must set day, or nth and weekday.");
    if (!NTHS.includes(item.nth))
      throw fail("".concat(path2, ".nth"), "must be 1, 2, 3, 4 or -1 for the last, with weekday.");
    if (typeof item.weekday !== "string" || !DAYS.includes(item.weekday)) {
      throw fail("".concat(path2, ".weekday"), "must be one of ".concat(DAYS.join(", "), ", with nth."));
    }
  }
  clockEdges(item, path2, fail);
  return {
    ...item.day !== void 0 ? { day: item.day } : { nth: item.nth, weekday: item.weekday },
    ...item.start !== void 0 ? { start: item.start, end: item.end } : {}
  };
}
function scheduleDate(value, path2, fail = scheduleError) {
  const item = record(value);
  if (!item)
    throw fail(path2, "must be an object with date and optional start and end.");
  onlyKeys(item, ["date", "start", "end"], path2, fail);
  if (!isCivilDate(item.date))
    throw fail("".concat(path2, ".date"), "must be a real civil date such as 2026-12-24.");
  clockEdges(item, path2, fail);
  return { date: item.date, ...item.start !== void 0 ? { start: item.start, end: item.end } : {} };
}
function scheduleExcept(value, path2, fail = scheduleError) {
  if (!Array.isArray(value) || value.length < 1 || value.length > SCHEDULE_EXCEPT_MAX)
    throw fail(path2, "must list 1 to ".concat(SCHEDULE_EXCEPT_MAX, " dates."));
  value.forEach((date, index) => {
    if (!isCivilDate(date))
      throw fail("".concat(path2, "[").concat(index, "]"), "must be a real civil date such as 2026-12-25.");
  });
  const dates = [...value].sort();
  const repeated = dates.find((date, index) => index > 0 && date === dates[index - 1]);
  if (repeated !== void 0)
    throw fail(path2, "must not repeat ".concat(repeated, "."));
  return dates;
}
function scheduleData(value, path2, fail = scheduleError) {
  const item = record(value);
  if (!item)
    throw fail(path2, "must be an object with key and optional path and equals.");
  onlyKeys(item, ["key", "path", "equals"], path2, fail);
  if (typeof item.key !== "string" || !DATA_KEY.test(item.key) || item.key.startsWith("feed:")) {
    throw fail("".concat(path2, ".key"), "must name card data (a project data key or card instance ID, or {screen.weather}), not a feed.");
  }
  const pointer = item.path;
  if (pointer !== void 0 && (typeof pointer !== "string" || Buffer.byteLength(pointer, "utf8") > 256 || pointer !== "" && !pointer.startsWith("/") || /~(?:[^01]|$)/.test(pointer) || pointer.split("/").length > 17)) {
    throw fail("".concat(path2, ".path"), "must be an RFC 6901 pointer of at most 256 bytes and 16 segments.");
  }
  if (Object.hasOwn(item, "equals")) {
    const expected = item.equals;
    if (expected !== null && typeof expected !== "string" && typeof expected !== "boolean" && !(typeof expected === "number" && Number.isFinite(expected))) {
      throw fail("".concat(path2, ".equals"), "must be a string, number, boolean or null.");
    }
    if (typeof expected === "string" && Buffer.byteLength(expected, "utf8") > 1024)
      throw fail("".concat(path2, ".equals"), "must be at most 1024 bytes.");
  }
  return {
    key: item.key,
    ...pointer !== void 0 ? { path: pointer } : {},
    ...Object.hasOwn(item, "equals") ? { equals: item.equals } : {}
  };
}
function scheduleInteraction(value, path2, fail = scheduleError) {
  const item = record(value);
  if (!item)
    throw fail(path2, "must be an object with an optional idle_s.");
  onlyKeys(item, ["idle_s"], path2, fail);
  if (item.idle_s !== void 0 && (typeof item.idle_s !== "number" || !Number.isInteger(item.idle_s) || item.idle_s < LEVEL_IDLE_MIN_S || item.idle_s > LEVEL_IDLE_MAX_S)) {
    throw fail("".concat(path2, ".idle_s"), "must be a whole number of seconds from ".concat(LEVEL_IDLE_MIN_S, " to ").concat(LEVEL_IDLE_MAX_S, "."));
  }
  return item.idle_s !== void 0 ? { idle_s: item.idle_s } : {};
}
function scheduleDisplays(value, path2, fail = scheduleError) {
  if (!Array.isArray(value) || value.length < 1 || value.length > LEVEL_DISPLAYS_MAX)
    throw fail(path2, "must list 1 to ".concat(LEVEL_DISPLAYS_MAX, " displays."));
  value.forEach((display, index) => {
    if (typeof display !== "number" || !Number.isInteger(display) || display < 1 || display > LEVEL_DISPLAYS_MAX) {
      throw fail("".concat(path2, "[").concat(index, "]"), "must be a display number from 1 to ".concat(LEVEL_DISPLAYS_MAX, "."));
    }
  });
  if (new Set(value).size !== value.length)
    throw fail(path2, "must not repeat a display.");
  return [...value].sort((a, b) => a - b);
}
function memberList(value, path2, max, noun, each, fail) {
  if (!Array.isArray(value) || value.length < 1 || value.length > max)
    throw fail(path2, "must list 1 to ".concat(max, " ").concat(noun, "."));
  return value.map((item, index) => each(item, "".concat(path2, "[").concat(index, "]")));
}
function scheduleLevelMembers(item, path2, fail = scheduleError) {
  const members = {};
  if (item.windows !== void 0) {
    members.windows = memberList(item.windows, "".concat(path2, ".windows"), SCHEDULE_WINDOWS_MAX, "windows", (window, windowPath) => {
      const checked = scheduleWindow(window, windowPath, fail);
      return { days: checked.days, ...checked.start !== void 0 ? { start: checked.start, end: checked.end } : {} };
    }, fail);
  }
  if (item.monthly !== void 0)
    members.monthly = memberList(item.monthly, "".concat(path2, ".monthly"), SCHEDULE_MONTHLY_MAX, "monthly rules", (monthly, monthlyPath) => scheduleMonthly(monthly, monthlyPath, fail), fail);
  if (item.dates !== void 0)
    members.dates = memberList(item.dates, "".concat(path2, ".dates"), SCHEDULE_DATES_MAX, "dates", (date, datePath) => scheduleDate(date, datePath, fail), fail);
  if (item.except !== void 0)
    members.except = scheduleExcept(item.except, "".concat(path2, ".except"), fail);
  if (item.data !== void 0)
    members.data = scheduleData(item.data, "".concat(path2, ".data"), fail);
  if (item.interaction !== void 0)
    members.interaction = scheduleInteraction(item.interaction, "".concat(path2, ".interaction"), fail);
  if (item.covers !== void 0) {
    if (!COVERS.includes(item.covers))
      throw fail("".concat(path2, ".covers"), "must be full, main, header, footer or side.");
    members.covers = item.covers;
  }
  if (item.displays !== void 0)
    members.displays = scheduleDisplays(item.displays, "".concat(path2, ".displays"), fail);
  if (item.start !== void 0) {
    if (!STARTS.includes(item.start))
      throw fail("".concat(path2, ".start"), "must be next_item or on_time.");
    members.start = item.start;
  }
  return members;
}
function entry(value, path2) {
  const item = record(value);
  if (!item)
    throw scheduleError(path2, "must be an object.");
  onlyKeys(item, ENTRY_KEYS, path2);
  if (item.id !== void 0 && (typeof item.id !== "string" || !ENTRY_ID.test(item.id))) {
    throw scheduleError("".concat(path2, ".id"), "must be 1 to 64 letters, digits, - or _.");
  }
  if (typeof item.playlist_id !== "string" || !item.playlist_id)
    throw scheduleError("".concat(path2, ".playlist_id"), "is required.");
  for (const key of ["from", "until"]) {
    if (item[key] !== void 0 && (typeof item[key] !== "string" || !CIVIL.test(item[key]))) {
      throw scheduleError("".concat(path2, ".").concat(key), "must be a civil minute such as 2026-12-24T18:00 (screen timezone, no offset).");
    }
  }
  if (typeof item.from === "string" && typeof item.until === "string" && item.from >= item.until) {
    throw scheduleError(path2, "from must be before until.");
  }
  const members = scheduleLevelMembers(item, path2);
  if (item.paused !== void 0 && typeof item.paused !== "boolean")
    throw scheduleError("".concat(path2, ".paused"), "must be true (a draft) or false.");
  if (item.from === void 0 && item.until === void 0 && !["windows", "monthly", "dates", "except", "data", "interaction"].some((key) => item[key] !== void 0)) {
    throw scheduleError(path2, "must set at least one rule: windows, monthly, dates, except, from, until, data or interaction.");
  }
  return {
    ...item.id !== void 0 ? { id: item.id } : {},
    playlist_id: item.playlist_id,
    ...item.from !== void 0 ? { from: item.from } : {},
    ...item.until !== void 0 ? { until: item.until } : {},
    ...members,
    ...item.paused !== void 0 ? { paused: item.paused } : {}
  };
}
function scheduleEntries(document) {
  let entries = document;
  const envelope = record(document);
  if (envelope && envelope.ok === true && record(envelope.data))
    document = envelope.data;
  const object = record(document);
  entries = object ? void 0 : document;
  if (object) {
    onlyKeys(object, ["entries", "updated_at", "effective_playlist"], "document");
    entries = object.entries;
  }
  if (!Array.isArray(entries))
    throw scheduleError("entries", "must be an array of schedule entries.");
  if (entries.length < 1) {
    throw usageError("Schedule file: entries must list at least one entry. To remove a schedule, run screen schedule clear.", {
      command: "screenrig screen schedule clear <id>",
      reason: "Clearing is its own command."
    });
  }
  if (entries.length > SCHEDULE_ENTRIES_MAX)
    throw scheduleError("entries", "must list at most ".concat(SCHEDULE_ENTRIES_MAX, " entries."));
  const parsed = entries.map((item, index) => entry(item, "entries[".concat(index, "]")));
  const ids = parsed.map((item) => item.id).filter((id) => id !== void 0);
  if (new Set(ids).size !== ids.length)
    throw scheduleError("entries", "must not repeat an entry id.");
  return parsed;
}
var TAKEOVER_FOR_MAX_MS = TAKEOVER_MAX_MS - 6e4;
function durationMs(value) {
  const match = /^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(value.trim());
  const ms = match && value.trim() ? (Number(match[1] ?? 0) * 86400 + Number(match[2] ?? 0) * 3600 + Number(match[3] ?? 0) * 60 + Number(match[4] ?? 0)) * 1e3 : NaN;
  if (!Number.isFinite(ms) || ms <= 0)
    throw usageError("--for takes a duration such as 30m, 2h, 1h30m, or 3d.");
  if (ms > TAKEOVER_FOR_MAX_MS) {
    throw usageError("--for must be under 7 days (at most 6d23h59m), leaving a minute for clock differences with the server. Use --until for an exact end, or --until none to hold until cleared.");
  }
  return ms;
}
function durationOption(value) {
  durationMs(value);
  return value;
}
function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}
function normalizeInstant(value) {
  const match = RFC3339.exec(value);
  if (!match)
    return void 0;
  const [year, month, day, hour, minute, second] = match.slice(1, 7).map(Number);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month) || hour > 23 || minute > 59 || second > 59)
    return void 0;
  const offset = match[8];
  if (offset !== "Z" && (Number(offset.slice(1, 3)) > 23 || Number(offset.slice(4, 6)) > 59))
    return void 0;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms))
    return void 0;
  return new Date(ms).toISOString().replace(/\.000Z$/, "Z");
}
function takeoverUntilOption(value) {
  if (value === "none")
    return value;
  if (normalizeInstant(value) === void 0) {
    throw usageError("--until takes an RFC 3339 instant with seconds and an offset, such as 2026-09-26T18:00:00Z or 2026-09-26T11:00:00-07:00, or none.");
  }
  return value;
}
function takeoverUntil(until, forValue, now) {
  if (until !== void 0 && forValue !== void 0)
    throw usageError("Use --until or --for, not both.");
  if (forValue !== void 0)
    return new Date(now.getTime() + durationMs(forValue)).toISOString().replace(/\.\d{3}Z$/, "Z");
  if (until === void 0)
    return void 0;
  if (until === "none")
    return null;
  takeoverUntilOption(until);
  return normalizeInstant(until);
}
function takeoverReason(value) {
  const trimmed = value.trim();
  if (!trimmed)
    throw usageError("--reason must not be empty.");
  if ([...trimmed].length > TAKEOVER_REASON_MAX)
    throw usageError("--reason must be at most ".concat(TAKEOVER_REASON_MAX, " characters."));
  if (new RegExp("\\p{Cc}", "u").test(trimmed))
    throw usageError("--reason must not contain control characters.");
  return trimmed;
}
function instantInZone(value, timezone) {
  const ms = Date.parse(value);
  if (!Number.isFinite(ms))
    return value;
  const render = (zone) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date(ms)).map((part) => [part.type, part.value]));
    return "".concat(parts.year, "-").concat(parts.month, "-").concat(parts.day, " ").concat(parts.hour, ":").concat(parts.minute, " ").concat(zone);
  };
  if (timezone) {
    try {
      return render(timezone);
    } catch {
    }
  }
  return render("UTC");
}
function effectivePlaylistText(effective, takeover, timezone) {
  if (!effective || typeof effective.id !== "string")
    return void 0;
  const until = typeof effective.until === "string" ? " until ".concat(instantInZone(effective.until, timezone)) : "";
  if (effective.source === "takeover") {
    const end = until || (typeof takeover?.until === "string" ? " until ".concat(instantInZone(takeover.until, timezone)) : " until cleared");
    return "".concat(effective.id, " (takeover").concat(end, ")");
  }
  if (effective.source === "campaign") {
    return "".concat(effective.id, " (campaign").concat(effective.entry_id ? " ".concat(effective.entry_id) : "").concat(until, ")");
  }
  if (effective.source === "schedule") {
    return "".concat(effective.id, " (schedule").concat(effective.entry_id ? " entry ".concat(effective.entry_id) : "").concat(until, ")");
  }
  if (effective.source === "folder") {
    return "".concat(effective.id, " (folder").concat(effective.entry_id ? " ".concat(effective.entry_id) : "", " default").concat(until ? ", a campaign or schedule changes it".concat(until) : "", ")");
  }
  return "".concat(effective.id, " (default").concat(until ? ", a campaign or schedule changes it".concat(until) : "", ")");
}
function assignmentLine(effective, takeover, timezone) {
  const text = effectivePlaylistText(effective, takeover, timezone);
  return text ? ["Assigned: ".concat(text)] : [];
}
function takeoverLine(takeover, timezone) {
  if (!takeover || typeof takeover.playlist_id !== "string")
    return [];
  const until = typeof takeover.until === "string" ? "until ".concat(instantInZone(takeover.until, timezone)) : "until cleared";
  return ["Takeover: ".concat(takeover.playlist_id, " ").concat(until).concat(takeover.reason ? " (".concat(takeover.reason, ")") : "")];
}
function windowText(item) {
  const days = (item.days ?? []).join(",");
  return item.start !== void 0 ? "".concat(days, " ").concat(item.start, "-").concat(item.end) : "".concat(days, " all day");
}
var WEEKDAY_NAMES = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday"
};
var NTH_NAMES = /* @__PURE__ */ new Map([[1, "1st"], [2, "2nd"], [3, "3rd"], [4, "4th"], [-1, "last"]]);
function timesText(item) {
  return item.start !== void 0 && item.end !== void 0 ? " ".concat(item.start, "\u2013").concat(item.end) : "";
}
function monthlyText(item) {
  const what = item.day !== void 0 ? "day ".concat(item.day) : "".concat(NTH_NAMES.get(item.nth ?? 0) ?? String(item.nth), " ").concat(item.weekday ? WEEKDAY_NAMES[item.weekday] ?? item.weekday : "").trimEnd();
  return "".concat(what).concat(timesText(item));
}
function dateText(item) {
  return "".concat(item.date).concat(timesText(item));
}
function dataConditionText(item) {
  return "data ".concat(item.key).concat(item.path ? " ".concat(item.path) : "").concat(Object.hasOwn(item, "equals") ? " = ".concat(JSON.stringify(item.equals)) : " exists");
}
function interactionText(item) {
  return "on touch (idle ".concat(item.idle_s ?? LEVEL_IDLE_DEFAULT_S, " s)");
}
function levelRuleParts(level) {
  return [
    ...(level.monthly ?? []).map(monthlyText),
    ...(level.dates ?? []).map((item) => "on ".concat(dateText(item))),
    ...level.except?.length ? ["except ".concat(level.except.join(", "))] : [],
    ...level.data ? [dataConditionText(level.data)] : [],
    ...level.interaction ? [interactionText(level.interaction)] : []
  ];
}
function levelPlacementParts(level) {
  return [
    ...level.covers && level.covers !== "full" ? ["covers ".concat(level.covers)] : [],
    ...level.displays?.length ? ["displays ".concat(level.displays.join(", "))] : [],
    ...level.start === "on_time" ? ["starts on time"] : []
  ];
}
function scheduleTableLines(entries, timezone) {
  if (!entries?.length)
    return ["No playlist schedule"];
  const rules = entries.map((item) => [...item.paused ? ["draft (paused)"] : [], ...levelRuleParts(item), ...levelPlacementParts(item)].join("; "));
  const withRules = rules.some((text) => text !== "");
  const zone = timezone === void 0 ? [] : ["".concat(withRules ? "Windows, FROM/UNTIL and the monthly and date rules" : "Windows and FROM/UNTIL", " are civil times (screen timezone ").concat(timezone || "not set", ").")];
  const rows = entries.map((item, index) => [
    item.id ?? "",
    item.playlist_id ?? "",
    (item.windows ?? []).map(windowText).join("; "),
    item.from ?? "",
    item.until ?? "",
    ...withRules ? [rules[index]] : []
  ]);
  const header = ["ENTRY", "PLAYLIST", "WINDOWS", "FROM", "UNTIL", ...withRules ? ["RULES"] : []];
  const widths = header.map((cell, index) => Math.max(cell.length, ...rows.map((row) => row[index].length)));
  const render = (row) => row.map((cell, index) => cell.padEnd(widths[index])).join("  ").trimEnd();
  return [...zone, render(header), ...rows.map(render)];
}
function screenControlProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  const problem = error.problem;
  if (problem.code === "invalid_request" && /^playlist_id:.*default playlist/i.test(problem.detail)) {
    return new CliError({
      ...problem,
      detail: "Assign the screen a default playlist first: ".concat(problem.detail),
      next: {
        command: "screenrig screen assign ".concat(id, " --playlist-id PLAYLIST_ID"),
        reason: "A schedule or takeover falls back to the assigned default when it ends, so the screen needs one. Assign it, then rerun."
      }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "invalid_request" && /^timezone: /.test(problem.detail)) {
    return new CliError({
      ...problem,
      detail: "Set the screen timezone first: ".concat(problem.detail),
      next: {
        command: "screenrig screen set-timezone ".concat(id, " --timezone ZONE"),
        reason: "Schedules are civil times read in the screen timezone. Replace ZONE with the IANA name of where the screen is (for example Europe/London or America/New_York; ask the user if unsure), then rerun."
      }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "screen_archived") {
    return new CliError({
      ...problem,
      next: { command: "screenrig screen unarchive ".concat(id), reason: "An archived screen refuses schedules and takeovers. Unarchive it first if it should play again." }
    }, error.exitCode, error.warnings);
  }
  return error;
}
function playlistInUseProblem(error) {
  if (!(error instanceof CliError) || error.problem.next || error.problem.code !== "resource_conflict")
    return error;
  if (!/assigned|schedule|takeover/i.test(error.problem.detail))
    return error;
  return new CliError({
    ...error.problem,
    next: {
      command: "screenrig screen list",
      reason: "A screen can still show this playlist: it is assigned, named by a playlist schedule entry, held by a takeover, shown by a campaign, or effective. screen show ID reports playlist_id, playlist_schedule, takeover, and effective_playlist, and campaign explain ID names the campaign a screen plays; change those first."
    }
  }, error.exitCode, error.warnings);
}
function takeoverForProblem(error) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  if (error.problem.code !== "invalid_request" || !/^until: /.test(error.problem.detail))
    return error;
  return new CliError({
    ...error.problem,
    next: {
      command: "rerun with a shorter --for, such as --for 6d23h",
      reason: "--for is converted with this computer's clock, which may differ from the server's. Check the clock, shorten --for, or add --until as an exact instant."
    }
  }, error.exitCode, error.warnings);
}

// dist/screen-fleet.js
var screen_fleet_exports = {};
__export(screen_fleet_exports, {
  SCREEN_FOLDER_ID_PATTERN: () => SCREEN_FOLDER_ID_PATTERN,
  SCREEN_TAGS_MAX: () => SCREEN_TAGS_MAX,
  SCREEN_TAG_PATTERN: () => SCREEN_TAG_PATTERN,
  fleetHumanLines: () => fleetHumanLines,
  fleetOutcome: () => fleetOutcome,
  folderSubtree: () => folderSubtree,
  rejectFleetRevision: () => rejectFleetRevision,
  screenActionResult: () => screenActionResult,
  screenFolderId: () => screenFolderId,
  screenTag: () => screenTag,
  screenTagList: () => screenTagList,
  screenTarget: () => screenTarget,
  selectorFlags: () => selectorFlags
});
var SCREEN_TAG_PATTERN = /^[A-Za-z0-9]{1,32}$/;
var SCREEN_TAGS_MAX = 16;
function screenTag(value, flag = "--tag") {
  if (!SCREEN_TAG_PATTERN.test(value))
    throw usageError("".concat(flag, " must be 1 to 32 letters or digits."));
  return value;
}
function screenTagList(value, flag) {
  const tags = value.split(",").map((tag) => tag.trim());
  if (tags.some((tag) => !SCREEN_TAG_PATTERN.test(tag))) {
    throw usageError("".concat(flag, " takes comma-separated tags of 1 to 32 letters or digits, for example ").concat(flag, " Lobby,Floor2."));
  }
  if (new Set(tags).size !== tags.length)
    throw usageError("".concat(flag, " lists a tag more than once."));
  if (tags.length > SCREEN_TAGS_MAX)
    throw usageError("".concat(flag, " accepts at most ").concat(SCREEN_TAGS_MAX, " tags."));
  return tags;
}
var SCREEN_FOLDER_ID_PATTERN = /^(?:(?:stage|qa|development)_)?sfd_[A-Za-z0-9]{1,64}$/;
function screenFolderId(value, label) {
  if (!value || !SCREEN_FOLDER_ID_PATTERN.test(value)) {
    throw usageError("".concat(label, " must be a screen folder ID (sfd_...); screen folder list shows them."));
  }
  return value;
}
function screenTarget(args, command) {
  const ids = args.positionals.slice(2);
  if (args.flags.tag === true)
    throw usageError("--tag requires a value, such as --tag Lobby.");
  if (args.flags.folder === true)
    throw usageError("--folder requires a value, such as --folder sfd_NORTH.");
  const tag = flagString(args.flags, "tag");
  const folder = flagString(args.flags, "folder");
  if ([ids.length > 0, tag !== void 0, folder !== void 0].filter(Boolean).length > 1) {
    throw usageError("".concat(command, " takes screen ids, --tag TAG or --folder ID; give only one."));
  }
  if (tag !== void 0)
    return { kind: "fleet", selector: { by: "tag", tag: screenTag(tag) } };
  if (folder !== void 0)
    return { kind: "fleet", selector: { by: "folder", folder_id: screenFolderId(folder, "--folder") } };
  if (!ids.length)
    throw usageError("".concat(command, " requires <id>, --tag TAG or --folder ID."));
  if (ids.some((id) => id.length < 1 || id.length > 200))
    throw usageError("".concat(command, " screen ids must be 1 to 200 characters."));
  if (new Set(ids).size !== ids.length)
    throw usageError("".concat(command, " lists a screen id more than once."));
  if (ids.length === 1)
    return { kind: "single", id: ids[0] };
  return { kind: "fleet", selector: { by: "ids", screen_ids: ids } };
}
function folderSubtree(items, rootId) {
  const subtree = [rootId];
  const seen = new Set(subtree);
  for (let index = 0; index < subtree.length; index += 1) {
    for (const item of items) {
      if (item.parent_id === subtree[index] && !seen.has(item.id)) {
        seen.add(item.id);
        subtree.push(item.id);
      }
    }
  }
  return subtree;
}
function selectorFlags(selector) {
  return selector.by === "tag" ? "--tag ".concat(selector.tag) : selector.by === "folder" ? "--folder ".concat(selector.folder_id) : selector.screen_ids.join(" ");
}
function rejectFleetRevision(args, command) {
  if (args.flags["expect-rev"] !== void 0) {
    throw usageError("".concat(command, " with several screens or --tag does not take --expect-rev: revision guards are per screen. Target one screen id to use --expect-rev."));
  }
}
function isCount(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
function screenActionResult(body, action) {
  const result = body;
  const results = result?.results;
  const valid = result !== void 0 && result !== null && typeof result === "object" && result.action === action && isCount(result.matched) && isCount(result.succeeded) && isCount(result.failed) && (result.offset === void 0 || isCount(result.offset)) && (result.total === void 0 || isCount(result.total)) && (result.next_cursor === void 0 || typeof result.next_cursor === "string" && /^\d+$/.test(result.next_cursor)) && Array.isArray(results) && results.length === result.matched && result.succeeded + result.failed === result.matched && results.every((item) => item && typeof item.screen_id === "string" && (item.status === "ok" || item.status === "failed")) && results.filter((item) => item.status === "failed").length === result.failed;
  if (!valid)
    throw unexpectedResponseError("Screen actions response does not match the generated ScreenActionResult contract.");
  return {
    ...result,
    results: results.map((item) => item.status === "failed" && item.problem !== void 0 ? { ...item, problem: normalizeProblem(item.problem) } : item)
  };
}
function fleetOutcome(summary, exitCodeOf) {
  const warnings = [];
  if (summary.matched === 0) {
    warnings.push({ code: "fleet_no_match", message: "No screen matched the selector; nothing was changed." });
    return { exitCode: ExitCode.Success, warnings };
  }
  if (summary.failed === 0)
    return { exitCode: ExitCode.Success, warnings };
  warnings.push({
    code: "fleet_partial_failure",
    message: "".concat(summary.failed, " of ").concat(summary.matched, " screens failed; ").concat(summary.succeeded, " succeeded. See data.results[].problem for each failed screen.")
  });
  const first = summary.results.find((item) => item.status === "failed");
  const known = first ? exitCodeOf?.(first) : void 0;
  if (known !== void 0)
    return { exitCode: known, warnings };
  const status = first?.problem?.status;
  const exitCode = typeof status === "number" && status >= 400 ? exitCodeForStatus(status) : ExitCode.Client;
  return { exitCode, warnings };
}
function problemLabel(problem) {
  const code = typeof problem?.code === "string" && /^[a-z][a-z0-9_]{0,63}$/.test(problem.code) ? problem.code : "failed";
  return typeof problem?.status === "number" ? "".concat(code, "/").concat(problem.status) : code;
}
function fleetHumanLines(title, summary, detail) {
  const rows = summary.results.map((item) => [
    item.screen_id,
    item.status,
    item.status === "failed" ? problemLabel(item.problem) : detail?.(item) ?? ""
  ]);
  const widths = [0, 1].map((index) => rows.reduce((width, row) => Math.max(width, row[index].length), 0));
  return [
    "".concat(title, ": matched ").concat(summary.matched, ", succeeded ").concat(summary.succeeded, ", failed ").concat(summary.failed),
    ...rows.map((row) => row.map((cell, index) => index < widths.length ? cell.padEnd(widths[index]) : cell).join("  ").trimEnd())
  ].join("\n");
}

// dist/campaigns.js
var campaigns_exports = {};
__export(campaigns_exports, {
  CAMPAIGNS_MAX: () => CAMPAIGNS_MAX,
  CAMPAIGN_AUDIENCE_INPUT_MAX_BYTES: () => CAMPAIGN_AUDIENCE_INPUT_MAX_BYTES,
  CAMPAIGN_AUDIENCE_RULES_MAX: () => CAMPAIGN_AUDIENCE_RULES_MAX,
  CAMPAIGN_ID_PATTERN: () => CAMPAIGN_ID_PATTERN,
  CAMPAIGN_NAME_MAX: () => CAMPAIGN_NAME_MAX,
  CAMPAIGN_PRIORITY_MAX: () => CAMPAIGN_PRIORITY_MAX,
  CAMPAIGN_SCREENS_LIMIT_MAX: () => CAMPAIGN_SCREENS_LIMIT_MAX,
  CAMPAIGN_WINDOWS_MAX: () => CAMPAIGN_WINDOWS_MAX,
  campaignAllScreensAudience: () => campaignAllScreensAudience,
  campaignAnyTagAudience: () => campaignAnyTagAudience,
  campaignAnyTags: () => campaignAnyTags,
  campaignAudienceJson: () => campaignAudienceJson,
  campaignAudienceOption: () => campaignAudienceOption,
  campaignAudienceText: () => campaignAudienceText,
  campaignBounds: () => campaignBounds,
  campaignCountsText: () => campaignCountsText,
  campaignData: () => campaignData,
  campaignDataOption: () => campaignDataOption,
  campaignDate: () => campaignDate,
  campaignDateList: () => campaignDateList,
  campaignDateSpec: () => campaignDateSpec,
  campaignDates: () => campaignDates,
  campaignDisplayList: () => campaignDisplayList,
  campaignDisplays: () => campaignDisplays,
  campaignExceptDates: () => campaignExceptDates,
  campaignExplainLines: () => campaignExplainLines,
  campaignExplainTime: () => campaignExplainTime,
  campaignFolder: () => campaignFolder,
  campaignFolderAudience: () => campaignFolderAudience,
  campaignId: () => campaignId,
  campaignInstant: () => campaignInstant,
  campaignLines: () => campaignLines,
  campaignMonthlies: () => campaignMonthlies,
  campaignMonthly: () => campaignMonthly,
  campaignMonthlyList: () => campaignMonthlyList,
  campaignMonthlySpec: () => campaignMonthlySpec,
  campaignName: () => campaignName,
  campaignOnTouch: () => campaignOnTouch,
  campaignPlaylistId: () => campaignPlaylistId,
  campaignPriority: () => campaignPriority,
  campaignProblem: () => campaignProblem,
  campaignPromoteProblem: () => campaignPromoteProblem,
  campaignReachText: () => campaignReachText,
  campaignScreenAudience: () => campaignScreenAudience,
  campaignScreenId: () => campaignScreenId,
  campaignScreenIds: () => campaignScreenIds,
  campaignScreensCursor: () => campaignScreensCursor,
  campaignScreensLimit: () => campaignScreensLimit,
  campaignScreensLines: () => campaignScreensLines,
  campaignStandingDetail: () => campaignStandingDetail,
  campaignTableLines: () => campaignTableLines,
  campaignTagAudience: () => campaignTagAudience,
  campaignTags: () => campaignTags,
  campaignWhenText: () => campaignWhenText,
  campaignWindow: () => campaignWindow,
  campaignWindowList: () => campaignWindowList,
  campaignWindowSpec: () => campaignWindowSpec,
  campaignWindows: () => campaignWindows,
  tagList: () => tagList,
  verdictDetail: () => verdictDetail,
  weeklyWindows: () => weeklyWindows
});
var CAMPAIGN_ID_PATTERN = /^(?:(?:stage|qa|development)_)?cmp_[A-Za-z0-9_-]+$/;
var CAMPAIGNS_MAX = 100;
var CAMPAIGN_NAME_MAX = 120;
var CAMPAIGN_PRIORITY_MAX = 100;
var CAMPAIGN_WINDOWS_MAX = 16;
var CAMPAIGN_SCREENS_LIMIT_MAX = 500;
var CAMPAIGN_AUDIENCE_RULES_MAX = 500;
var AUDIENCE_LEAVES_MAX = CAMPAIGN_AUDIENCE_RULES_MAX - 1;
var CAMPAIGN_AUDIENCE_INPUT_MAX_BYTES = 64 * 1024;
var CURSOR_MAX = 200;
var DAYS2 = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
var CLOCK2 = /^([01]\d|2[0-3]):[0-5]\d$/;
var CIVIL2 = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)$/;
function campaignId(value, command) {
  if (!value)
    throw usageError("campaign ".concat(command, " requires <id>."));
  if (!CAMPAIGN_ID_PATTERN.test(value)) {
    throw usageError("A campaign id looks like cmp_ followed by letters, digits, - or _.", {
      command: "screenrig campaign list",
      reason: "List this project's campaigns and their ids. Advertising campaigns (screenrig ads campaigns list) are a different resource."
    });
  }
  return value;
}
function campaignScreenId(value) {
  if (!value)
    throw usageError("campaign explain requires <screen-id>.");
  if (!isResourceID(value, "screen")) {
    throw usageError("A screen id looks like scr_ followed by letters, digits, - or _.", {
      command: "screenrig screen list",
      reason: "List this project's screens and their ids."
    });
  }
  return value;
}
function campaignName(value) {
  const trimmed = value.trim();
  if (!trimmed || [...trimmed].length > CAMPAIGN_NAME_MAX || new RegExp("\\p{Cc}", "u").test(value)) {
    throw usageError("--name must contain 1 to ".concat(CAMPAIGN_NAME_MAX, " characters without controls."));
  }
  return trimmed;
}
function campaignPlaylistId(value) {
  if (!isResourceID(value, "playlist")) {
    throw usageError("--playlist-id must be a playlist id (pl_\u2026).", {
      command: "screenrig playlist list",
      reason: "List this project's playlists and their ids."
    });
  }
  return value;
}
function campaignPriority(value) {
  if (!/^\d+$/.test(value) || Number(value) > CAMPAIGN_PRIORITY_MAX) {
    throw usageError("--priority must be a whole number from 0 to ".concat(CAMPAIGN_PRIORITY_MAX, "."));
  }
  return value;
}
function campaignScreensLimit(value) {
  const number = Number(value);
  if (!/^\d+$/.test(value) || number < 1 || number > CAMPAIGN_SCREENS_LIMIT_MAX) {
    throw usageError("--limit must be a whole number from 1 to ".concat(CAMPAIGN_SCREENS_LIMIT_MAX, "."));
  }
  return value;
}
function campaignScreensCursor(value) {
  if (!value.trim() || value.length > CURSOR_MAX || new RegExp("\\p{Cc}", "u").test(value)) {
    throw usageError("--cursor takes the data.next_cursor of the previous page.");
  }
  return value;
}
function accumulate(value, previous) {
  return [...previous ? previous.split(",") : [], ...value.split(",").map((item) => item.trim())];
}
function tagList(value, previous, flag) {
  const tags = accumulate(value, previous);
  if (tags.some((tag) => !SCREEN_TAG_PATTERN.test(tag))) {
    throw usageError("".concat(flag, " takes tags of 1 to 32 letters or digits, repeated or comma-separated, for example ").concat(flag, " Lobby,Floor2."));
  }
  if (new Set(tags).size !== tags.length)
    throw usageError("".concat(flag, " lists a tag more than once."));
  if (tags.length > AUDIENCE_LEAVES_MAX)
    throw usageError("".concat(flag, " accepts at most ").concat(AUDIENCE_LEAVES_MAX, " tags: an audience has at most ").concat(CAMPAIGN_AUDIENCE_RULES_MAX, " rules."));
  return tags.join(",");
}
function campaignTags(value, previous) {
  return tagList(value, previous, "--tag");
}
function campaignAnyTags(value, previous) {
  return tagList(value, previous, "--any-tag");
}
function campaignScreenIds(value, previous) {
  const ids = accumulate(value, previous);
  if (ids.some((id) => !isResourceID(id, "screen"))) {
    throw usageError("--screen-id takes screen ids (scr_\u2026), repeated or comma-separated.", {
      command: "screenrig screen list",
      reason: "List this project's screens and their ids."
    });
  }
  if (new Set(ids).size !== ids.length)
    throw usageError("--screen-id lists a screen more than once.");
  if (ids.length > AUDIENCE_LEAVES_MAX) {
    throw usageError("--screen-id accepts at most ".concat(AUDIENCE_LEAVES_MAX, " screens: an audience has at most ").concat(CAMPAIGN_AUDIENCE_RULES_MAX, " rules. Tag the screens and use --tag for a larger fleet."));
  }
  return ids.join(",");
}
function campaignTagAudience(tags) {
  return tags.length === 1 ? { tag: tags[0] } : { all: tags.map((tag) => ({ tag })) };
}
function campaignAnyTagAudience(tags) {
  return { any: tags.map((tag) => ({ tag })) };
}
function campaignScreenAudience(ids) {
  return ids.length === 1 ? { screen_id: ids[0] } : { any: ids.map((id) => ({ screen_id: id })) };
}
function campaignFolder(value) {
  return screenFolderId(value, "--folder");
}
function campaignFolderAudience(id) {
  return { folder: id };
}
function campaignAllScreensAudience() {
  return { all: [] };
}
function campaignAudienceJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw usageError('--audience is not valid JSON. Pass a rule such as {"tag":"Lobby"}, @FILE to read it from a file, or - for stdin.');
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw usageError('--audience must be a JSON object with exactly one of all, any, tag, screen_id or folder, such as {"all":[{"tag":"Lobby"},{"folder":"sfd_NORTH"}]}; {"all":[]} is every screen.');
  }
  return parsed;
}
function campaignAudienceOption(value) {
  if (!value.trim() || value.trim() === "@") {
    throw usageError("--audience takes a JSON rule, @FILE to read it from a file, or - for stdin.");
  }
  return value;
}
function splitTimes(spec, fail) {
  const text = spec.trim();
  const at = text.indexOf("@");
  if (at < 0)
    return { head: text };
  const times = /^(\d{2}:\d{2})-(\d{2}:\d{2})$/.exec(text.slice(at + 1).trim());
  if (!times || !CLOCK2.test(times[1]) || !CLOCK2.test(times[2])) {
    throw fail("The time of day after @ must be HH:MM-HH:MM in 24-hour time, such as 09:00-17:00.");
  }
  return { head: text.slice(0, at).trim(), start: times[1], end: times[2] };
}
function windowError(spec, detail, flag = "--window") {
  return usageError("".concat(flag, " ").concat(JSON.stringify(spec), ": ").concat(detail, ' A window is DAYS or DAYS@HH:MM-HH:MM (a space may stand for the @), such as mon-fri@09:00-17:00, "Mon-Fri 09:00-17:00", sat,sun or daily@22:00-06:00.'));
}
function dayIndex(name, spec, flag) {
  const index = DAYS2.indexOf(name);
  if (index < 0) {
    throw windowError(spec, name === "" ? "A day is missing." : "".concat(JSON.stringify(name), " is not a day; use mon, tue, wed, thu, fri, sat or sun (daily stands alone)."), flag);
  }
  return index;
}
function windowDays(text, spec, flag) {
  if (text === "daily")
    return [...DAYS2];
  const selected = /* @__PURE__ */ new Set();
  for (const item of text.split(",")) {
    const bounds = item.split("-").map((name) => name.trim());
    if (bounds.length > 2)
      throw windowError(spec, "".concat(JSON.stringify(item), " is not a day or a range such as mon-fri."), flag);
    const first = dayIndex(bounds[0], spec, flag);
    const last = bounds.length === 2 ? dayIndex(bounds[1], spec, flag) : first;
    for (let index = first; ; index = (index + 1) % DAYS2.length) {
      selected.add(index);
      if (index === last)
        break;
    }
  }
  return DAYS2.filter((_, index) => selected.has(index));
}
function campaignWindow(spec, flag = "--window") {
  const written = spec.includes("@") ? spec : spec.replace(/^\s*(\S+)\s+(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})\s*$/, "$1@$2");
  const { head, start, end } = splitTimes(written, (detail) => windowError(spec, detail, flag));
  const window = { days: windowDays(head.toLowerCase(), spec, flag) };
  if (start !== void 0) {
    window.start = start;
    window.end = end;
  }
  return scheduleWindow(window, flag, (_path, message) => windowError(spec, message, flag));
}
function daysText(days) {
  const indexes = DAYS2.flatMap((day, index) => days.includes(day) ? [index] : []);
  if (indexes.length !== days.length)
    return days.join(",");
  if (indexes.length === DAYS2.length)
    return "daily";
  const parts = [];
  for (let start = 0; start < indexes.length; ) {
    let end = start;
    while (end + 1 < indexes.length && indexes[end + 1] === indexes[end] + 1)
      end += 1;
    if (end - start >= 2)
      parts.push("".concat(DAYS2[indexes[start]], "-").concat(DAYS2[indexes[end]]));
    else
      for (let index = start; index <= end; index += 1)
        parts.push(DAYS2[indexes[index]]);
    start = end + 1;
  }
  return parts.join(",");
}
function campaignWindowSpec(window) {
  const days = daysText(window.days ?? []);
  return window.start !== void 0 && window.end !== void 0 ? "".concat(days, "@").concat(window.start, "-").concat(window.end) : days;
}
function weeklyWindows(flag) {
  return (value, previous) => {
    const specs = [...previous ? previous.split(";") : [], campaignWindowSpec(campaignWindow(value, flag))];
    if (specs.length > CAMPAIGN_WINDOWS_MAX)
      throw usageError("".concat(flag, " accepts at most ").concat(CAMPAIGN_WINDOWS_MAX, " windows."));
    return specs.join(";");
  };
}
var campaignWindows = weeklyWindows("--window");
function campaignWindowList(accumulated) {
  return accumulated.split(";").map((spec) => campaignWindow(spec));
}
var ORDINALS = { "1st": 1, "2nd": 2, "3rd": 3, "4th": 4, last: -1 };
function monthlyError(spec, detail) {
  return usageError("--monthly ".concat(JSON.stringify(spec), ": ").concat(detail, " A monthly rule is DAY or NTH-WEEKDAY with an optional @HH:MM-HH:MM, such as 15, day15, 1st-mon, 3rd-wed@18:00-21:00 or last-sun@09:00-14:00."));
}
function campaignMonthly(spec) {
  const fail = (detail) => monthlyError(spec, detail);
  const { head, start, end } = splitTimes(spec, fail);
  const text = head.toLowerCase();
  const day = /^(?:day\s*)?(\d{1,2})$/.exec(text);
  const nth = /^([a-z0-9]+)\s*-\s*([a-z]+)$/.exec(text);
  let monthly;
  if (day) {
    if (Number(day[1]) < 1 || Number(day[1]) > 31)
      throw fail("".concat(day[1], " is not a day of the month; use 1 to 31."));
    monthly = { day: Number(day[1]) };
  } else if (nth) {
    const count = ORDINALS[nth[1]];
    if (count === void 0)
      throw fail("".concat(JSON.stringify(nth[1]), " is not an occurrence; use 1st, 2nd, 3rd, 4th or last."));
    const weekday = DAYS2.find((name) => name === nth[2]);
    if (!weekday)
      throw fail("".concat(JSON.stringify(nth[2]), " is not a day; use mon, tue, wed, thu, fri, sat or sun."));
    monthly = { nth: count, weekday };
  } else {
    throw fail(text === "" ? "The day or occurrence is missing." : "".concat(JSON.stringify(head), " is not a day of the month or an occurrence such as 1st-mon."));
  }
  if (start !== void 0) {
    monthly.start = start;
    monthly.end = end;
  }
  return scheduleMonthly(monthly, "--monthly", (_path, message) => fail(message));
}
function campaignMonthlySpec(item) {
  const ordinal = Object.entries(ORDINALS).find(([, count]) => count === item.nth)?.[0] ?? String(item.nth);
  const head = item.day !== void 0 ? "day".concat(item.day) : "".concat(ordinal, "-").concat(item.weekday);
  return item.start !== void 0 && item.end !== void 0 ? "".concat(head, "@").concat(item.start, "-").concat(item.end) : head;
}
function campaignMonthlies(value, previous) {
  const specs = [...previous ? previous.split(";") : [], campaignMonthlySpec(campaignMonthly(value))];
  if (specs.length > SCHEDULE_MONTHLY_MAX)
    throw usageError("--monthly accepts at most ".concat(SCHEDULE_MONTHLY_MAX, " rules."));
  return specs.join(";");
}
function campaignMonthlyList(accumulated) {
  return accumulated.split(";").map(campaignMonthly);
}
function dateError(spec, detail) {
  return usageError("--date ".concat(JSON.stringify(spec), ": ").concat(detail, " A date is YYYY-MM-DD with an optional @HH:MM-HH:MM, such as 2026-12-24 or 2026-12-24@18:00-22:00."));
}
function campaignDate(spec) {
  const fail = (detail) => dateError(spec, detail);
  const { head, start, end } = splitTimes(spec, fail);
  if (!isCivilDate(head))
    throw fail(head === "" ? "The date is missing." : "".concat(JSON.stringify(head), " is not a real calendar date written YYYY-MM-DD."));
  return scheduleDate({ date: head, ...start !== void 0 ? { start, end } : {} }, "--date", (_path, message) => fail(message));
}
function campaignDateSpec(item) {
  return item.start !== void 0 && item.end !== void 0 ? "".concat(item.date, "@").concat(item.start, "-").concat(item.end) : item.date;
}
function campaignDates(value, previous) {
  const specs = [...previous ? previous.split(";") : [], campaignDateSpec(campaignDate(value))];
  if (specs.length > SCHEDULE_DATES_MAX)
    throw usageError("--date accepts at most ".concat(SCHEDULE_DATES_MAX, " dates."));
  return specs.join(";");
}
function campaignDateList(accumulated) {
  return accumulated.split(";").map(campaignDate);
}
function campaignExceptDates(value, previous) {
  const dates = accumulate(value, previous);
  const bad = dates.find((date) => !isCivilDate(date));
  if (bad !== void 0) {
    throw usageError("--except takes real calendar dates written YYYY-MM-DD, repeated or comma-separated, for example --except 2026-12-25,2027-01-01; ".concat(JSON.stringify(bad), " is not one."));
  }
  if (new Set(dates).size !== dates.length)
    throw usageError("--except lists a date more than once.");
  if (dates.length > SCHEDULE_EXCEPT_MAX)
    throw usageError("--except accepts at most ".concat(SCHEDULE_EXCEPT_MAX, " dates."));
  return dates.sort().join(",");
}
function campaignDisplays(value) {
  const displays = value.split(",").map((item) => /^\d{1,2}$/.test(item.trim()) ? Number(item) : Number.NaN);
  if (displays.some((display) => !(display >= 1 && display <= LEVEL_DISPLAYS_MAX))) {
    throw usageError("--displays takes display numbers from 1 to ".concat(LEVEL_DISPLAYS_MAX, ", comma-separated, for example --displays 1,2."));
  }
  if (new Set(displays).size !== displays.length)
    throw usageError("--displays lists a display more than once.");
  return displays.sort((a, b) => a - b).join(",");
}
function campaignDisplayList(value) {
  return value.split(",").map(Number);
}
function campaignData(value) {
  let key = "";
  let rest;
  for (let index = 0; index < value.length; index++) {
    if (value[index] === "\\" && value[index + 1] === ":") {
      key += ":";
      index++;
    } else if (value[index] === ":") {
      rest = value.slice(index + 1);
      break;
    } else {
      key += value[index];
    }
  }
  const condition = { key };
  if (rest !== void 0) {
    const equals = rest.indexOf("=");
    condition.path = equals < 0 ? rest : rest.slice(0, equals);
    if (equals >= 0) {
      const text = rest.slice(equals + 1);
      try {
        condition.equals = JSON.parse(text);
      } catch {
        if (/^["\[{]/.test(text.trimStart()))
          throw usageError("--data VALUE must be a JSON scalar or a bare string; quote strings with JSON syntax to preserve their type.");
        condition.equals = text;
      }
    }
  }
  return scheduleData(condition, "--data", (field, reason) => usageError("".concat(field, " ").concat(reason)));
}
function campaignDataOption(value, previous) {
  if (previous !== void 0)
    throw usageError("--data may be given only once.");
  campaignData(value);
  return value;
}
function campaignOnTouch(value) {
  if (!/^\d+$/.test(value) || Number(value) < LEVEL_IDLE_MIN_S || Number(value) > LEVEL_IDLE_MAX_S) {
    throw usageError("--on-touch takes the seconds without input before the screen counts as idle, a whole number from ".concat(LEVEL_IDLE_MIN_S, " to ").concat(LEVEL_IDLE_MAX_S, " (default: ").concat(LEVEL_IDLE_DEFAULT_S, "), for example --on-touch 90."));
  }
  return value;
}
function daysInMonth2(year, month) {
  if (month === 2)
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}
function campaignInstant(flag) {
  return (value) => {
    const match = CIVIL2.exec(value);
    const year = Number(match?.[1]);
    const month = Number(match?.[2]);
    const day = Number(match?.[3]);
    if (!match || month < 1 || month > 12 || day < 1 || day > daysInMonth2(year, month)) {
      throw usageError("".concat(flag, " takes a civil date and time in each screen's timezone as YYYY-MM-DDTHH:MM, such as 2026-12-24T18:00 (no offset, no seconds)."));
    }
    return value;
  };
}
var EXPLAIN_INSTANT = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d+)?(?:Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/;
function campaignExplainTime(flag) {
  return (value) => {
    const match = EXPLAIN_INSTANT.exec(value) ?? /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(value);
    const year = Number(match?.[1]);
    const month = Number(match?.[2]);
    const day = Number(match?.[3]);
    if (!match || month < 1 || month > 12 || day < 1 || day > daysInMonth2(year, month)) {
      throw usageError("".concat(flag, " takes an instant with a zone, such as 2026-03-08T09:30:00Z or 2026-03-08T01:30:00-08:00, or a time on the screen's clock, such as 2026-03-08T09:30 (no zone)."));
    }
    return value;
  };
}
function campaignBounds(from, until) {
  if (from !== void 0 && until !== void 0 && until <= from)
    throw usageError("--until must be later than --from.");
}
function campaignProblem(error, id, subject = "campaign") {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  if (problem.code === "campaign_limit_reached") {
    return new CliError({
      ...problem,
      detail: "This organization already has the maximum of ".concat(CAMPAIGNS_MAX, " campaigns across its projects. Nothing was created."),
      next: problem.next ?? {
        command: "screenrig campaign list",
        reason: "Delete a campaign you no longer need with screenrig campaign delete ID, then rerun create."
      }
    }, error.exitCode, error.warnings);
  }
  if (problem.next)
    return error;
  if (problem.code === "revision_conflict" && id) {
    return new CliError({
      ...problem,
      next: { command: "screenrig campaign show ".concat(id), reason: "Read the current revision and state, then rerun with --expect-rev REVISION if the change still applies." }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "not_found" && id) {
    return new CliError({
      ...problem,
      next: subject === "screen" ? { command: "screenrig screen list", reason: "List this project's screens and their ids." } : { command: "screenrig campaign list", reason: "List this project's campaigns; a deleted campaign does not come back. An id from screenrig ads campaigns list names an advertising campaign, not this resource." }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "playlist_not_approved") {
    return new CliError({
      ...problem,
      next: { command: "screenrig reviews list", reason: "A campaign shows only an approved playlist. Its review waits for a person; choose an approved playlist with --playlist-id, or rerun once the review is approved." }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "invalid_request" && problem.errors.some((item) => item?.field === "playlist_id")) {
    return new CliError({
      ...problem,
      next: { command: "screenrig playlist list", reason: "Choose a playlist id from this project for --playlist-id." }
    }, error.exitCode, error.warnings);
  }
  return error;
}
function campaignPromoteProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next || error.problem.code !== "invalid_request")
    return error;
  return new CliError({
    ...error.problem,
    next: { command: "screenrig campaign revisions ".concat(id), reason: "Promote copies the audience of a revision that was paused (a draft) while the campaign is published for its test. Pick that revision from the list, rerun with --revision N." }
  }, error.exitCode, error.warnings);
}
function when(value, label) {
  return value === void 0 || value === "" ? [] : ["".concat(label, ": ").concat(value)];
}
function clip(text, width) {
  const characters = [...text];
  return characters.length <= width ? text : "".concat(characters.slice(0, width - 1).join(""), "\u2026");
}
function campaignAudienceText(audience, nested = false) {
  if (!audience)
    return "";
  const group = (rules, word) => {
    const parts = rules.map((rule) => campaignAudienceText(rule, true));
    const text = parts.join(" ".concat(word, " "));
    return nested && parts.length > 1 ? "(".concat(text, ")") : text;
  };
  if (audience.all)
    return audience.all.length ? group(audience.all, "and") : "every screen";
  if (audience.any)
    return group(audience.any, "or");
  if (audience.tag !== void 0)
    return "tag ".concat(audience.tag);
  if (audience.screen_id !== void 0)
    return "screen ".concat(audience.screen_id);
  if (audience.folder !== void 0)
    return "folder ".concat(audience.folder);
  return JSON.stringify(audience);
}
function campaignWhenText(campaign) {
  const parts = [
    ...campaign.from ? ["from ".concat(campaign.from)] : [],
    ...campaign.until ? ["until ".concat(campaign.until)] : [],
    ...(campaign.windows ?? []).map(campaignWindowSpec),
    ...levelRuleParts(campaign)
  ];
  return parts.length ? parts.join("; ") : "always";
}
function campaignReachText(reach) {
  if (!reach || !Number.isSafeInteger(reach.current) || !Number.isSafeInteger(reach.published))
    return "";
  return "".concat(reach.current, " of ").concat(reach.published);
}
function reachLines(reach) {
  const text = campaignReachText(reach);
  if (!text || !reach)
    return [];
  const dropped = reach.current < reach.published ? " (".concat(reach.published - reach.current, " fewer than when it was published)") : "";
  const empty = Array.isArray(reach.empty_groups) ? reach.empty_groups : [];
  return [
    "reach: ".concat(text, " screens").concat(dropped).concat(reach.at ? ", counted ".concat(reach.at) : ""),
    ...empty.length ? ["empty_groups: ".concat(empty.join(", "), " (no screen matches)")] : []
  ];
}
function campaignLines(campaign) {
  if (!campaign)
    return [];
  const clock = campaignWhenText(campaign);
  const civil = Boolean(campaign.from || campaign.until || campaign.windows?.length || campaign.monthly?.length || campaign.dates?.length || campaign.except?.length);
  return [
    "id: ".concat(campaign.id),
    "name: ".concat(campaign.name),
    "playlist_id: ".concat(campaign.playlist_id),
    "audience: ".concat(campaignAudienceText(campaign.audience)),
    ...reachLines(campaign.reach),
    "when: ".concat(clock).concat(civil ? " (civil times in each screen's timezone)" : ""),
    ...campaign.covers && campaign.covers !== "full" ? ["covers: ".concat(campaign.covers)] : [],
    ...campaign.displays?.length ? ["displays: ".concat(campaign.displays.join(", "))] : [],
    ...campaign.start ? ["start: ".concat(campaign.start === "on_time" ? "on time" : "next item")] : [],
    "priority: ".concat(campaign.priority),
    "paused: ".concat(campaign.paused),
    ...campaign.reserved ? ["reserved: true (only a person who can approve changes it)"] : [],
    ...campaign.editable === false ? ["editable: false (it reaches screens outside this caller's scope, so it is read-only here)"] : [],
    "revision: ".concat(campaign.revision),
    ...when(campaign.created_at, "created_at"),
    ...when(campaign.updated_at, "updated_at")
  ];
}
function table(header, rows) {
  const widths = header.map((cell, index) => Math.max(cell.length, ...rows.map((row) => (row[index] ?? "").length)));
  const render = (row) => row.map((cell, index) => cell.padEnd(widths[index])).join("  ").trimEnd();
  return [render(header), ...rows.map(render)];
}
function campaignTableLines(items) {
  if (!items.length)
    return ["No campaigns"];
  const reach = items.some((item) => campaignReachText(item.reach) !== "");
  const reserved = items.some((item) => item.reserved);
  const scoped = items.some((item) => item.editable !== void 0);
  return table(["ID", "NAME", "PLAYLIST", "AUDIENCE", ...reach ? ["REACH"] : [], "WHEN", "PRIORITY", "PAUSED", ...reserved ? ["RESERVED"] : [], ...scoped ? ["EDITABLE"] : []], items.map((item) => [
    item.id ?? "",
    clip(item.name ?? "", 40),
    item.playlist_id ?? "",
    clip(campaignAudienceText(item.audience), 48),
    ...reach ? [campaignReachText(item.reach)] : [],
    clip(campaignWhenText(item), 56),
    String(item.priority ?? 0),
    item.paused ? "yes" : "no",
    ...reserved ? [item.reserved ? "yes" : "no"] : [],
    ...scoped ? [item.editable === false ? "no" : "yes"] : []
  ]));
}
var STACK_ONLY_DETAIL = "needs a Player that resolves its own stack";
var REGION_DETAIL = "laid out on no display of this screen (a strip of the wrong orientation or over half the display, or a display lock naming none of its outputs)";
function conditionalDetail(reason) {
  return reason === "interaction" ? "plays while someone is using the screen" : reason === "data" ? "plays while its data condition holds" : "plays while the Player's condition holds";
}
var STANDING_ORDER = ["playing", "pending", "waiting", "ended", "outranked", "conditional", "paused", "blocked", "not_in_audience"];
function campaignCountsText(counts) {
  const rank = (name) => {
    const index = STANDING_ORDER.indexOf(name);
    return index < 0 ? STANDING_ORDER.length : index;
  };
  return Object.entries(counts ?? {}).filter(([name, count]) => name !== "audience" && count > 0).sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b)).map(([name, count]) => "".concat(count, " ").concat(name.replaceAll("_", " "))).join(", ");
}
function campaignStandingDetail(status, screenId) {
  switch (status.status) {
    case "playing":
      return "";
    case "pending":
      return "the switch lands within a minute";
    case "waiting":
      return status.next_start ? "outside from, until and windows now; starts ".concat(status.next_start) : "outside from, until and windows now; no start within eight days";
    case "ended":
      return "until has passed";
    case "paused":
      return "the campaign is paused";
    case "not_in_audience":
      return "the screen is not in the audience";
    case "outranked":
      return status.reason === "takeover" ? "a screen takeover wins" : status.reason === "campaign" ? status.by ? "campaign ".concat(status.by, " wins") : "another campaign wins" : "outranked";
    case "conditional":
      return conditionalDetail(status.reason);
    case "blocked":
      switch (status.reason) {
        case "no_default_playlist":
          return "the screen has no default playlist: screenrig screen assign ".concat(screenId ?? "SCREEN_ID", " --playlist-id PLAYLIST_ID");
        case "no_timezone":
          return "the screen has no timezone: screenrig screen set-timezone ".concat(screenId ?? "SCREEN_ID", " --timezone ZONE");
        case "playlist_unavailable":
          return "the playlist is missing, unapproved or does not fit the screen";
        case "region_not_laid_out":
          return REGION_DETAIL;
        case "stack_only":
          return STACK_ONLY_DETAIL;
        default:
          return "blocked";
      }
    default:
      return status.reason ?? "";
  }
}
function campaignScreensLines(id, page, limit) {
  const audience = page?.counts?.audience ?? 0;
  const items = Array.isArray(page?.items) ? page.items : [];
  const counts = campaignCountsText(page?.counts);
  const next = typeof page?.next_cursor === "string" ? page.next_cursor : void 0;
  return [
    "Campaign ".concat(id, " reaches ").concat(audience, " screen").concat(audience === 1 ? "" : "s"),
    ...counts ? ["counts: ".concat(counts)] : [],
    ...items.length ? table(["SCREEN", "NAME", "STATUS", "DETAIL"], items.map((item) => [
      item.screen_id ?? "",
      clip(item.screen_name ?? "", 32),
      item.status ?? "",
      campaignStandingDetail(item)
    ])) : [audience === 0 ? "No live screen is in the audience. screenrig campaign show ".concat(id, " prints the audience, and screenrig screen tag sets a screen's tags.") : "No screens on this page."],
    ...next ? ["next: screenrig campaign screens ".concat(id, " --cursor ").concat(next).concat(limit ? " --limit ".concat(limit) : "")] : []
  ];
}
function verdictDetail(verdict, screenId, timezone) {
  const next = verdict.next_start ? instantInZone(verdict.next_start, timezone) : void 0;
  switch (verdict.verdict) {
    case "won":
      return "";
    case "outranked": {
      const by = verdict.by;
      const who = !by ? "another candidate" : by.kind === "takeover" ? "the screen takeover" : by.kind === "campaign" ? "campaign ".concat(by.id ?? "").trim() : "schedule entry ".concat(by.id ?? "").trim();
      return "".concat(who, " wins");
    }
    case "not_started":
      return next ? "before its from; starts ".concat(next) : "before its from";
    case "outside_hours":
      return next ? "outside its windows; holds again ".concat(next) : "outside its windows; no start within eight days";
    case "ended":
      return verdict.kind === "takeover" && verdict.until ? "ended ".concat(instantInZone(verdict.until, timezone)) : "until has passed";
    case "conditional":
      return conditionalDetail(verdict.reason);
    case "off":
      switch (verdict.reason) {
        case "paused":
          return verdict.kind === "schedule" ? "the schedule entry is paused (a draft)" : "the campaign is paused";
        case "not_in_audience":
          return "the screen is not in the audience";
        case "no_default_playlist":
          return "the screen has no default playlist: screenrig screen assign ".concat(screenId, " --playlist-id PLAYLIST_ID");
        case "no_timezone":
          return "the screen has no timezone: screenrig screen set-timezone ".concat(screenId, " --timezone ZONE");
        case "playlist_unavailable":
          return "the playlist is missing, unapproved or not in the stack this screen's Player receives";
        case "region_not_laid_out":
          return REGION_DETAIL;
        case "stack_only":
          return STACK_ONLY_DETAIL;
        default:
          return "does not apply";
      }
    default:
      return "";
  }
}
function candidateText(verdict) {
  return verdict.kind === "takeover" ? "takeover" : verdict.kind === "campaign" ? "campaign ".concat(verdict.id ?? "").trim() : "schedule entry ".concat(verdict.id ?? "").trim();
}
function campaignExplainAtLines(screenId, at) {
  const zone = at.timezone || void 0;
  const effective = effectivePlaylistText(at.effective_playlist ?? void 0, void 0, zone);
  const clock = at.local && zone ? "".concat(at.local.replace("T", " "), " ").concat(zone) : instantInZone(at.instant, zone);
  const when2 = "".concat(clock, " (").concat(at.instant, ")");
  const lines = [effective ? "Screen ".concat(screenId, " at ").concat(when2, " plays ").concat(effective) : "Screen ".concat(screenId, " at ").concat(when2, " plays no playlist")];
  const verdicts = Array.isArray(at.verdicts) ? at.verdicts : [];
  lines.push(...verdicts.length ? ["Takeover, campaigns and schedule entries, in the order the screen reads them", ...table(["CANDIDATE", "PLAYLIST", "VERDICT", "DETAIL"], verdicts.map((verdict) => [
    candidateText(verdict),
    verdict.playlist_id ?? "",
    verdict.verdict ?? "",
    verdictDetail(verdict, screenId, zone)
  ]))] : ["No takeover, campaigns or schedule entries apply to this screen"]);
  const timeline = Array.isArray(at.timeline) ? at.timeline : [];
  if (timeline.length) {
    const last = timeline[timeline.length - 1];
    lines.push("Switches from ".concat(instantInZone(timeline[0].from, zone), " to ").concat(instantInZone(last.to, zone)).concat(at.timeline_truncated ? " (stopped early; ask again with --at ".concat(last.to, ")") : ""), ...table(["FROM", "TO", "PLAYS"], timeline.map((segment) => [
      instantInZone(segment.from, zone),
      instantInZone(segment.to, zone),
      segment.playlist_id ? "".concat(segment.playlist_id, " (").concat(segment.source).concat(segment.entry_id ? " ".concat(segment.entry_id) : "", ")") : "no playlist"
    ])));
  }
  const notJudged = Array.isArray(at.not_judged) ? at.not_judged : [];
  if (notJudged.length)
    lines.push("Not judged", ...notJudged.map((item) => "  ".concat(item.detail)));
  return lines;
}
function campaignExplainLines(screenId, view) {
  if (view?.at)
    return campaignExplainAtLines(screenId, view.at);
  const effective = effectivePlaylistText(view?.effective_playlist ?? void 0);
  const items = Array.isArray(view?.items) ? view.items : [];
  return [
    effective ? "Screen ".concat(screenId, " plays ").concat(effective) : "Screen ".concat(screenId, " plays no playlist"),
    ...items.length ? ["Campaigns, in precedence order (".concat(items.length, ")"), ...table(["CAMPAIGN", "STATUS", "DETAIL"], items.map((item) => [
      item.campaign_id ?? "",
      item.status ?? "",
      campaignStandingDetail(item, screenId)
    ]))] : ["No campaigns in this project"]
  ];
}

// dist/config.js
var config_exports = {};
__export(config_exports, {
  DEFAULT_API_URL: () => DEFAULT_API_URL,
  LOCAL_DEV_API_URL: () => LOCAL_DEV_API_URL,
  defaultConfigPath: () => defaultConfigPath,
  describeTokenPresence: () => describeTokenPresence,
  hasToken: () => hasToken,
  isRetiredCredential: () => isRetiredCredential,
  isWorldOrGroupReadable: () => isWorldOrGroupReadable,
  preserveLogSocket: () => preserveLogSocket,
  readConfigFile: () => readConfigFile,
  resolveConfig: () => resolveConfig,
  sameCredential: () => sameCredential,
  validateLogSocketPath: () => validateLogSocketPath,
  withConfigLock: () => withConfigLock,
  writeConfigAtomic: () => writeConfigAtomic
});
import { randomBytes as randomBytes2 } from "node:crypto";
import path from "node:path";
var DEFAULT_API_URL = "https://api.screenrig.ai";
var LOCAL_DEV_API_URL = "http://api.screenrig.localhost:18880";
var DEFAULT_CONFIG_NAME = "config.json";
var LOCAL_DEV_CONFIG_NAME = "config.local-dev.json";
function defaultConfigDir(fsLike) {
  const xdg = fsLike.settings.XDG_CONFIG_HOME;
  if (xdg && xdg.length > 0) {
    return path.join(xdg, "screenrig");
  }
  if (process.platform === "win32") {
    const appdata = fsLike.settings.APPDATA;
    if (appdata && appdata.length > 0) {
      return path.join(appdata, "screenrig");
    }
  }
  return path.join(fsLike.homedir(), ".config", "screenrig");
}
async function defaultConfigPath(fsLike) {
  const fromEnv = fsLike.settings.SCREENRIG_CONFIG;
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  return path.join(defaultConfigDir(fsLike), DEFAULT_CONFIG_NAME);
}
function modeOf(value) {
  return value.mode & 511;
}
function isWorldOrGroupReadable(mode) {
  return (mode & 63) !== 0;
}
async function fsyncDir(dir, fsLike) {
  const handle = await fsLike.open(dir, "r");
  try {
    await handle.sync();
  } catch {
  } finally {
    await handle.close();
  }
}
async function readConfigFile(configPath, fsLike, options = {}) {
  return withConfigLog(fsLike, "config.read", configPath, async () => {
    let info;
    try {
      info = await fsLike.stat(configPath);
    } catch (err) {
      const code = err.code;
      if (code === "ENOENT") {
        return void 0;
      }
      throw err;
    }
    if (isWorldOrGroupReadable(modeOf(info))) {
      if (!options.repair) {
        throw configError("Refusing to read group/world-readable config at ".concat(configPath), {
          command: "screenrig doctor --repair-config --config ".concat(configPath),
          reason: "Repair permissions to user-only (0600) before reading the token file."
        });
      }
      await fsLike.chmod(configPath, 384);
    }
    const handle = await fsLike.open(configPath, "r");
    try {
      const raw = await handle.readFile("utf8");
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        throw configError("Config file is not a JSON object.");
      }
      return parsed;
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw configError("Config file is not valid JSON: ".concat(configPath));
      }
      throw err;
    } finally {
      await handle.close();
    }
  });
}
function preserveLogSocket(current, next) {
  const fromNext = typeof next.log_socket === "string" ? next.log_socket.trim() : "";
  const fromCurrent = typeof current?.log_socket === "string" ? current.log_socket.trim() : "";
  const logSocket = fromNext || fromCurrent;
  if (logSocket) {
    return { ...next, log_socket: logSocket };
  }
  if ("log_socket" in next) {
    const { log_socket: _omit, ...rest } = next;
    return rest;
  }
  return next;
}
async function withConfigLog(fsLike, op, configPath, work) {
  const logger = fsLike.logger;
  if (!logger?.enabled) {
    return work();
  }
  return logger.withLocal({ op, message: op, config_path: configPath }, async (span) => {
    try {
      const result = await work();
      span.finish({ outcome: "ok", config_path: configPath });
      return result;
    } catch (err) {
      span.error(err, { config_path: configPath });
      throw err;
    }
  });
}
async function writeConfigAtomic(configPath, config, fsLike) {
  return withConfigLog(fsLike, "config.write", configPath, async () => {
    const dir = path.dirname(configPath);
    await fsLike.mkdir(dir, { recursive: true, mode: 448 });
    try {
      await fsLike.chmod(dir, 448);
    } catch {
    }
    const tmp = "".concat(configPath, ".").concat(process.pid, ".").concat(Date.now(), ".tmp");
    const body = "".concat(JSON.stringify(config, null, 2), "\n");
    try {
      const handle = await fsLike.open(tmp, "w", 384);
      try {
        await handle.writeFile(body, "utf8");
        await handle.sync();
      } finally {
        await handle.close();
      }
      await fsLike.chmod(tmp, 384);
      await fsLike.rename(tmp, configPath);
      await fsLike.chmod(configPath, 384);
      await fsyncDir(dir, fsLike);
    } catch (err) {
      await fsLike.rm(tmp, { force: true }).catch(() => void 0);
      throw err;
    }
  });
}
var LOCK_OWNER_FILE = "owner.json";
function processAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === "EPERM";
  }
}
async function readLockOwner(lockPath, fsLike) {
  let handle;
  try {
    handle = await fsLike.open(path.join(lockPath, LOCK_OWNER_FILE), "r");
  } catch {
    return void 0;
  }
  try {
    const owner = JSON.parse(await handle.readFile("utf8"));
    return typeof owner.pid === "number" && typeof owner.nonce === "string" && typeof owner.acquired_at === "number" ? { pid: owner.pid, nonce: owner.nonce, acquired_at: owner.acquired_at } : void 0;
  } catch {
    return void 0;
  } finally {
    await handle.close();
  }
}
async function writeLockOwner(lockPath, owner, fsLike) {
  const handle = await fsLike.open(path.join(lockPath, LOCK_OWNER_FILE), "wx", 384);
  try {
    await handle.writeFile(JSON.stringify(owner), "utf8");
  } finally {
    await handle.close();
  }
}
async function withConfigLock(configPath, fsLike, options, callback) {
  return withConfigLog(fsLike, "config.lock", configPath, async () => {
    const dir = path.dirname(configPath);
    const lockPath = "".concat(configPath, ".lock");
    const retryMs = options.retryMs ?? 50;
    const staleMs = options.staleMs ?? 18e4;
    const maxWaitMs = options.maxWaitMs ?? 18e4;
    const started = options.now();
    await fsLike.mkdir(dir, { recursive: true, mode: 448 });
    await fsLike.chmod(dir, 448).catch(() => void 0);
    const isAlive = options.isAlive ?? processAlive;
    const nonce = randomBytes2(16).toString("hex");
    const reclaim = async () => {
      const abandoned = "".concat(lockPath, ".stale.").concat(process.pid, ".").concat(options.now());
      try {
        await fsLike.rename(lockPath, abandoned);
        await fsLike.rm(abandoned, { recursive: true, force: true });
      } catch (reclaimError) {
        const code = reclaimError.code;
        if (code !== "ENOENT" && code !== "EEXIST" && code !== "ENOTEMPTY") {
          throw reclaimError;
        }
      }
    };
    while (true) {
      try {
        await fsLike.mkdir(lockPath, { mode: 448 });
        await writeLockOwner(lockPath, { pid: process.pid, nonce, acquired_at: options.now() }, fsLike);
        break;
      } catch (err) {
        if (err.code !== "EEXIST") {
          throw err;
        }
        const owner = await readLockOwner(lockPath, fsLike);
        if (owner) {
          if (!isAlive(owner.pid)) {
            await reclaim();
            continue;
          }
        } else {
          try {
            const info = await fsLike.stat(lockPath);
            if (options.now() - info.mtimeMs > staleMs) {
              await reclaim();
              continue;
            }
          } catch (statError) {
            if (statError.code !== "ENOENT") {
              throw statError;
            }
            continue;
          }
        }
        if (options.now() - started >= maxWaitMs) {
          throw configError("Timed out waiting for the credential lock at ".concat(lockPath, "."));
        }
        await options.sleep(retryMs);
      }
    }
    try {
      return await callback();
    } finally {
      const owner = await readLockOwner(lockPath, fsLike);
      if (owner?.nonce === nonce) {
        await fsLike.rm(lockPath, { recursive: true, force: true });
      }
    }
  });
}
async function validateLogSocketPath(value, fsLike) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  if (typeof value !== "string") {
    throw configError("log_socket must be a string path to an already-listening Unix socket.");
  }
  const socketPath = value.trim();
  if (socketPath.length === 0) {
    return void 0;
  }
  try {
    const info = await fsLike.stat(socketPath);
    if (info.isDirectory()) {
      throw configError("log_socket is a directory: ".concat(socketPath, ". Set it to a Unix socket path whose consumer is already listening."));
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      return socketPath;
    }
    throw err;
  }
  return socketPath;
}
function holdsCredential(file) {
  return Boolean(file.token || file.identity_token || file.oauth?.refresh_token || file.login?.device_code || Object.values(file.projects ?? {}).some((project) => project?.token));
}
function isRetiredCredential(token) {
  return typeof token === "string" && token.startsWith("sr_live_");
}
function holdsRetiredCredential(file) {
  return [file.token, file.identity_token, ...Object.values(file.projects ?? {}).map((project) => project?.token)].some(isRetiredCredential);
}
function parsedOrigin(value) {
  try {
    return new URL(value);
  } catch {
    throw configError("API URL ".concat(JSON.stringify(value), " is not a valid URL."));
  }
}
function loopbackHost(hostname) {
  return hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1" || hostname === "[::1]";
}
function assertCredentialOrigin(file, apiUrl, issuedFor) {
  const target = parsedOrigin(apiUrl);
  if (target.protocol !== "https:" && !(target.protocol === "http:" && loopbackHost(target.hostname))) {
    throw configError("API URL ".concat(target.origin, " is not HTTPS. ScreenRig sends credentials only over HTTPS, or plain http to localhost."), {
      command: "screenrig doctor",
      reason: "Shows the configured API origin. Use an https:// API URL."
    });
  }
  if (!file || !holdsCredential(file))
    return;
  const issued = parsedOrigin(issuedFor);
  for (const issuer of [file.oauth?.issuer, file.login?.issuer]) {
    if (issuer !== void 0 && parsedOrigin(issuer).origin !== target.origin) {
      throw configError("This config holds a sign-in issued by ".concat(parsedOrigin(issuer).origin, "; it is never sent to ").concat(target.origin, ". Nothing was sent."), {
        command: "screenrig --config PATH ...",
        reason: "Use a separate --config for ".concat(target.origin, ".")
      });
    }
  }
  if (issued.origin !== target.origin) {
    throw configError("This config holds a credential issued for ".concat(issued.origin, "; it is never sent to ").concat(target.origin, ". Nothing was sent."), {
      command: "screenrig --config PATH ...",
      reason: "Drop --api-url and SCREENRIG_API_URL to use ".concat(issued.origin, ", or use a separate --config for ").concat(target.origin, ".")
    });
  }
}
async function resolveConfig(options) {
  const configPath = typeof options.flags.config === "string" && options.flags.config || await defaultConfigPath(options.fs);
  const file = await readConfigFile(configPath, options.fs, { repair: options.repair });
  const flagApi = typeof options.flags["api-url"] === "string" ? options.flags["api-url"] : void 0;
  const envApi = options.fs.settings.SCREENRIG_API_URL;
  const localDevProfile = path.basename(configPath) === LOCAL_DEV_CONFIG_NAME;
  let apiUrl = localDevProfile ? LOCAL_DEV_API_URL : DEFAULT_API_URL;
  let apiSource = localDevProfile ? "local-dev" : "default";
  const storedApiUrl = file?.api_url?.replace(/\/+$/, "");
  if (storedApiUrl && (!localDevProfile || storedApiUrl !== DEFAULT_API_URL)) {
    apiUrl = storedApiUrl;
    apiSource = "config";
  }
  if (envApi) {
    apiUrl = envApi;
    apiSource = "setting";
  }
  if (flagApi) {
    apiUrl = flagApi;
    apiSource = "flag";
  }
  assertCredentialOrigin(file, apiUrl, localDevProfile && (storedApiUrl === void 0 || storedApiUrl === DEFAULT_API_URL) ? LOCAL_DEV_API_URL : storedApiUrl ?? DEFAULT_API_URL);
  let token;
  let tokenSource = "none";
  const selectedId = typeof options.flags["project-id"] === "string" ? options.flags["project-id"] : file?.project_id;
  if (options.flags["project-id"] !== void 0 && !isResourceID(selectedId, "project"))
    throw configError("--project-id must be a project ID from project list.");
  const selected = selectedId && selectedId !== file?.project_id ? file?.projects?.[selectedId] : file;
  const usable = (value) => isRetiredCredential(value) ? void 0 : value;
  const selectedToken = usable(file?.token);
  const identityToken = usable(file?.identity_token);
  if (selectedToken || identityToken) {
    token = selectedToken ?? identityToken;
    tokenSource = "config";
  }
  const logSocket = await validateLogSocketPath(file?.log_socket, options.fs);
  return {
    apiUrl: apiUrl.replace(/\/+$/, ""),
    token,
    projectId: selectedId,
    projectName: selected?.project_name,
    organizationId: selected?.organization_id,
    organizationName: selected?.organization_name,
    identityToken,
    agentId: file?.agent_id,
    enrollment: file?.enrollment,
    login: file?.login,
    lastAgent: file?.last_agent,
    ...file?.signed_out_at ? { signedOut: true } : {},
    ...file && !file.oauth && holdsRetiredCredential(file) ? { retiredCredential: true } : {},
    configPath,
    logSocket,
    source: { apiUrl: apiSource, token: tokenSource }
  };
}
function sameCredential(a, b, kind = "project") {
  if (a === b)
    return true;
  const left = accessClaims(a);
  const right = accessClaims(b);
  const holder = (claims) => claims?.sid ?? (claims?.clientId ? "client:".concat(claims.clientId) : void 0);
  if (!left || !right || !holder(left) || holder(left) !== holder(right))
    return false;
  return kind === "identity" || (left.projects || right.projects ? JSON.stringify(Object.keys(left.projects ?? {}).sort()) === JSON.stringify(Object.keys(right.projects ?? {}).sort()) : left.prj === right.prj);
}
function hasToken(token) {
  return typeof token === "string" && token.length > 0;
}
function describeTokenPresence(token) {
  return hasToken(token) ? "present" : "(none)";
}

// dist/ids.js
var ids_exports = {};
__export(ids_exports, {
  ENTROPY_BYTES: () => ENTROPY_BYTES,
  REQUEST_ID_MAX: () => REQUEST_ID_MAX,
  REQUEST_ID_MIN: () => REQUEST_ID_MIN,
  isValidIdempotencyKey: () => isValidIdempotencyKey,
  isValidRequestId: () => isValidRequestId,
  newIdempotencyKey: () => newIdempotencyKey,
  newRequestId: () => newRequestId,
  randomPrefixedId: () => randomPrefixedId,
  randomUrlSafe128: () => randomUrlSafe128
});
import { randomBytes as randomBytes3 } from "node:crypto";
var ENTROPY_BYTES = 16;
function randomUrlSafe128() {
  return randomBytes3(ENTROPY_BYTES).toString("base64url");
}
function randomPrefixedId(prefix, bytes = ENTROPY_BYTES) {
  const encoded = randomBytes3(bytes).toString("base64url");
  return "".concat(prefix, "_").concat(encoded);
}
function newRequestId() {
  return randomPrefixedId("req");
}
function newIdempotencyKey() {
  return randomUrlSafe128();
}
var REQUEST_ID_MIN = 16;
var REQUEST_ID_MAX = 64;
var REQUEST_ID_PATTERN = new RegExp("^req_[A-Za-z0-9_-]{".concat(REQUEST_ID_MIN, ",").concat(REQUEST_ID_MAX, "}$"));
function isValidRequestId(value) {
  return REQUEST_ID_PATTERN.test(value);
}
function isValidIdempotencyKey(value) {
  return /^[A-Za-z0-9._~-]{8,200}$/.test(value);
}

// dist/envelope.js
var envelope_exports = {};
__export(envelope_exports, {
  errorEnvelope: () => errorEnvelope,
  successEnvelope: () => successEnvelope
});
function successEnvelope(data, extras) {
  return {
    ok: true,
    data,
    request_id: extras?.request_id,
    operation_id: extras?.operation_id,
    warnings: extras?.warnings ?? []
  };
}
function errorEnvelope(error, extras) {
  const warnings = extras?.warnings ?? [];
  return warnings.length > 0 ? { ok: false, error, warnings } : { ok: false, error };
}

export {
  flagString,
  flagBool,
  flagNumber,
  command_input_exports,
  OAUTH_CLIENT_ID,
  SCOPE_IDENTITY,
  ACCESS_LEVELS,
  accessLabel,
  accessFromScope,
  isSessionJwt,
  accessClaims,
  newOAuthRequestId,
  OAuthClient,
  isServiceClientId,
  readKeyFile,
  serviceCredentialsFromConfig,
  oauth_exports,
  LEVEL_IDLE_DEFAULT_S,
  scheduleWindow,
  scheduleEntries,
  durationMs,
  durationOption,
  normalizeInstant,
  takeoverUntilOption,
  takeoverUntil,
  takeoverReason,
  instantInZone,
  effectivePlaylistText,
  assignmentLine,
  takeoverLine,
  scheduleTableLines,
  screenControlProblem,
  playlistInUseProblem,
  takeoverForProblem,
  screen_control_exports,
  SCREEN_TAGS_MAX,
  screenTag,
  screenTagList,
  SCREEN_FOLDER_ID_PATTERN,
  screenFolderId,
  screenTarget,
  folderSubtree,
  selectorFlags,
  rejectFleetRevision,
  screenActionResult,
  fleetOutcome,
  fleetHumanLines,
  screen_fleet_exports,
  CAMPAIGN_WINDOWS_MAX,
  CAMPAIGN_AUDIENCE_INPUT_MAX_BYTES,
  campaignId,
  campaignScreenId,
  campaignName,
  campaignPlaylistId,
  campaignPriority,
  campaignScreensLimit,
  campaignScreensCursor,
  tagList,
  campaignTags,
  campaignAnyTags,
  campaignScreenIds,
  campaignTagAudience,
  campaignAnyTagAudience,
  campaignScreenAudience,
  campaignFolder,
  campaignFolderAudience,
  campaignAllScreensAudience,
  campaignAudienceJson,
  campaignAudienceOption,
  campaignWindow,
  campaignWindowSpec,
  weeklyWindows,
  campaignWindows,
  campaignWindowList,
  campaignMonthlies,
  campaignMonthlyList,
  campaignDates,
  campaignDateList,
  campaignExceptDates,
  campaignDisplays,
  campaignDisplayList,
  campaignData,
  campaignDataOption,
  campaignOnTouch,
  campaignInstant,
  campaignExplainTime,
  campaignBounds,
  campaignProblem,
  campaignPromoteProblem,
  campaignAudienceText,
  campaignLines,
  campaignTableLines,
  campaignScreensLines,
  campaignExplainLines,
  campaigns_exports,
  defaultConfigPath,
  readConfigFile,
  preserveLogSocket,
  writeConfigAtomic,
  withConfigLock,
  isRetiredCredential,
  resolveConfig,
  sameCredential,
  hasToken,
  describeTokenPresence,
  config_exports,
  randomPrefixedId,
  newRequestId,
  newIdempotencyKey,
  REQUEST_ID_MIN,
  REQUEST_ID_MAX,
  isValidRequestId,
  isValidIdempotencyKey,
  ids_exports,
  successEnvelope,
  errorEnvelope,
  envelope_exports
};
