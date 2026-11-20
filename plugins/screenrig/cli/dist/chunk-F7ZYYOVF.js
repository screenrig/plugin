import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  readAuthoringText
} from "./chunk-FQBYL3RN.js";
import {
  usageError
} from "./chunk-VYWS3KLY.js";

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

export {
  BI_WEB_LOGIN_MODES,
  biWebLoginUrl,
  biCssSelector,
  biWaitMs,
  readWebPassword,
  readTotpSeed,
  readWebSteps,
  readWebCookies,
  webConnectionLines
};
