import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  formatLogfmtValue
} from "./chunk-L3JWJNA5.js";
import "./chunk-FCQ624QM.js";
import "./chunk-E2AIBB3R.js";
import "./chunk-SX4HKPRA.js";
import "./chunk-UD3J3FNQ.js";
import "./chunk-PPWTLS44.js";
import "./chunk-RY7TSGK3.js";
import "./chunk-D2RLMLYO.js";
import "./chunk-7EJTDXNL.js";
import "./chunk-BFLHHH47.js";
import "./chunk-P3D5NU6C.js";
import "./chunk-SFYZH3GR.js";
import {
  redactEvent,
  redactText
} from "./chunk-JP4OQPAN.js";
import "./chunk-3FYAGULW.js";

// dist/dev/output.js
function formatDevLine(entry) {
  const parts = ["at=".concat(entry.at), "type=".concat(entry.type)];
  if (entry.level)
    parts.push("level=".concat(entry.level));
  if (entry.code)
    parts.push("code=".concat(formatLogfmtValue(entry.code)));
  if (entry.message)
    parts.push("message=".concat(formatLogfmtValue(redactText(entry.message))));
  for (const [key, value] of Object.entries(redactEvent(entry.detail ?? {}))) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
      parts.push("".concat(key, "=").concat(formatLogfmtValue(typeof value === "string" ? redactText(value) : value)));
  }
  return parts.join(" ");
}
function devEventData(entry) {
  return redactEvent({
    event: entry.type,
    at: entry.at,
    ...entry.level ? { level: entry.level } : {},
    ...entry.code ? { code: entry.code } : {},
    ...entry.message ? { message: redactText(entry.message) } : {},
    ...entry.detail ?? {}
  });
}
export {
  devEventData,
  formatDevLine
};
