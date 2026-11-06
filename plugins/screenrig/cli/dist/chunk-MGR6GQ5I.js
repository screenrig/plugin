import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  readAuthoringText
} from "./chunk-OFOJKZJN.js";
import {
  flagBool,
  flagString
} from "./chunk-D2RLMLYO.js";
import {
  usageError
} from "./chunk-JP4OQPAN.js";

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
