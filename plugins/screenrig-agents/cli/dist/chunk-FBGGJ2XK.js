import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  usageError
} from "./chunk-JP4OQPAN.js";

// dist/connection-ids.js
var CONNECTION_ID_PATTERN = /^(?:(?:stage|qa|development)_)?pcn_[A-Za-z0-9_-]+$/;
var CONNECTION_REFERENCE_PATTERN = /^(?:(?:stage|qa|development)_)?pcn_[A-Za-z0-9_-]{4,64}$/;
function connectionIdOption(value) {
  if (!CONNECTION_REFERENCE_PATTERN.test(value)) {
    throw usageError("--connection-id takes a connection id (pcn_\u2026).", { command: "screenrig connection list", reason: "List this project's connections and their ids." });
  }
  return value;
}

export {
  CONNECTION_ID_PATTERN,
  connectionIdOption
};
