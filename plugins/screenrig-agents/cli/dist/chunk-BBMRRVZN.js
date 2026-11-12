import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  readAuthoringText
} from "./chunk-JHXOFG33.js";
import {
  usageError
} from "./chunk-VYWS3KLY.js";

// dist/connection-ids.js
var CONNECTION_ID_PATTERN = /^(?:(?:stage|qa|development)_)?pcn_[A-Za-z0-9_-]+$/;
var CONNECTION_REFERENCE_PATTERN = /^(?:(?:stage|qa|development)_)?pcn_[A-Za-z0-9_-]{4,64}$/;
function connectionIdOption(value) {
  if (!CONNECTION_REFERENCE_PATTERN.test(value)) {
    throw usageError("--connection-id takes a connection id (pcn_\u2026).", { command: "screenrig connection list", reason: "List this project's connections and their ids." });
  }
  return value;
}

// dist/service-account-key.js
var KEY_FILE_MAX_BYTES = 20 * 1024;
async function readServiceAccountKey(file, runtime, maxCharacters) {
  const where = file === "-" ? "stdin" : file;
  const text = await readAuthoringText(file, runtime, KEY_FILE_MAX_BYTES);
  let key;
  try {
    key = JSON.parse(text);
  } catch {
    key = void 0;
  }
  const object = key && typeof key === "object" && !Array.isArray(key) ? key : void 0;
  if (!object || object.type !== "service_account" || typeof object.client_email !== "string" || typeof object.private_key !== "string") {
    throw usageError("".concat(where, " must be the service account's JSON key file (Google Cloud console: IAM and admin, Service accounts, Keys, Add key, JSON)."));
  }
  const compact = JSON.stringify(object);
  if ([...compact].length > maxCharacters)
    throw usageError("The key file in ".concat(where, " is larger than ").concat(maxCharacters, " characters."));
  return compact;
}

export {
  CONNECTION_ID_PATTERN,
  connectionIdOption,
  readServiceAccountKey
};
