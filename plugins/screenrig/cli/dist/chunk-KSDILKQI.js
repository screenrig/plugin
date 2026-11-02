import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  readInputBytes
} from "./chunk-AA4UGMUE.js";
import {
  usageError
} from "./chunk-KI2KSDHX.js";

// dist/kv-write.js
var KV_VALUE_BASE64_MAX_LENGTH = 1398104;
function canonicalize(value) {
  if (Array.isArray(value))
    return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    const source = value;
    const result = /* @__PURE__ */ Object.create(null);
    for (const key of Object.keys(source).sort())
      result[key] = canonicalize(source[key]);
    return result;
  }
  return value;
}
function canonicalJson(input) {
  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw usageError("--json-value must contain valid JSON.");
  }
  return JSON.stringify(canonicalize(parsed));
}
function canonicalBase64(input) {
  if (input.length > KV_VALUE_BASE64_MAX_LENGTH) {
    throw usageError(`K/V value_base64 exceeds the OpenAPI limit of ${KV_VALUE_BASE64_MAX_LENGTH} characters.`);
  }
  const standard = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (!standard.test(input))
    throw usageError("--value-base64 must be canonical padded standard base64 without whitespace.");
  const decoded = Buffer.from(input, "base64");
  if (decoded.toString("base64") !== input) {
    throw usageError("--value-base64 must be canonical padded standard base64 without whitespace.");
  }
  return input;
}
function stringFlag(args, name) {
  const value = args.flags[name];
  return typeof value === "string" ? value : void 0;
}
function checkedContentType(args) {
  const contentType = stringFlag(args, "content-type") ?? "application/octet-stream";
  if (!contentType || contentType.length > 127) {
    throw usageError("--content-type must contain 1 to 127 characters.");
  }
  return contentType;
}
function checkedLength(valueBase64) {
  if (valueBase64.length > KV_VALUE_BASE64_MAX_LENGTH) {
    throw usageError(`K/V value_base64 exceeds the OpenAPI limit of ${KV_VALUE_BASE64_MAX_LENGTH} characters.`);
  }
  return valueBase64;
}
async function kvWriteFromArgs(args, cwd, runtime) {
  const modeNames = ["json-value", "file", "value-base64"];
  const selected = modeNames.filter((name) => Object.hasOwn(args.flags, name));
  if (selected.length !== 1) {
    throw usageError("kv set requires exactly one of --json-value, --file, or --value-base64.");
  }
  const mode = selected[0];
  if (mode === "json-value") {
    const input = stringFlag(args, mode);
    if (input === void 0 || input.length === 0)
      throw usageError("--json-value requires a JSON value.");
    if (Object.hasOwn(args.flags, "content-type") && stringFlag(args, "content-type")?.toLowerCase() !== "application/json") {
      throw usageError("--json-value always uses application/json; omit --content-type.");
    }
    const valueBase64 = Buffer.from(canonicalJson(input), "utf8").toString("base64");
    return { value_base64: checkedLength(valueBase64), content_type: "application/json" };
  }
  const contentType = checkedContentType(args);
  if (mode === "value-base64") {
    const input = stringFlag(args, mode);
    if (input === void 0)
      throw usageError("--value-base64 requires a value.");
    return { value_base64: canonicalBase64(input), content_type: contentType };
  }
  const file = stringFlag(args, "file");
  if (!file)
    throw usageError("--file requires a path.");
  let bytes;
  try {
    bytes = await readInputBytes(file, cwd, runtime, 1048576);
  } catch (error) {
    throw usageError(`Cannot read K/V file: ${error instanceof Error ? error.message : "read failed"}`);
  }
  return { value_base64: checkedLength(bytes.toString("base64")), content_type: contentType };
}

export {
  canonicalJson,
  kvWriteFromArgs
};
