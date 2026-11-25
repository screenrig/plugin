import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  CliError,
  ExitCode,
  exitCodeForStatus,
  normalizeProblem,
  unexpectedResponseError,
  usageError
} from "./chunk-F5GLHZXQ.js";
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

// dist/generated/resource-ids.js
var resource_ids_exports = {};
__export(resource_ids_exports, {
  RESOURCE_ID_PATTERNS: () => RESOURCE_ID_PATTERNS,
  isResourceID: () => isResourceID
});
var environment = "(?:(?:stage|qa|development)_)?";
var RESOURCE_ID_PATTERNS = {
  project: new RegExp("^".concat(environment, "prj_[A-Za-z0-9_-]+$")),
  agent: new RegExp("^".concat(environment, "agt_[A-Za-z0-9_-]+$")),
  connection: new RegExp("^".concat(environment, "acn_[A-Za-z0-9_-]+$")),
  screen: new RegExp("^".concat(environment, "scr_[A-Za-z0-9_-]+$")),
  playlist: new RegExp("^".concat(environment, "pl_[A-Za-z0-9_-]+$")),
  release: new RegExp("^".concat(environment, "rel_[A-Za-z0-9_-]+$")),
  media: /^med_[A-Za-z0-9_-]+$/
};
function isResourceID(value, kind) {
  return typeof value === "string" && RESOURCE_ID_PATTERNS[kind].test(value);
}

// dist/authoring-input.js
var authoring_input_exports = {};
__export(authoring_input_exports, {
  assertOutputAvailable: () => assertOutputAvailable,
  readAuthoringJson: () => readAuthoringJson,
  readAuthoringText: () => readAuthoringText,
  readInputBytes: () => readInputBytes,
  writeAuthoringJson: () => writeAuthoringJson,
  writeOutputFile: () => writeOutputFile
});
import { open, mkdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
var MAX_INPUT_BYTES = 8 * 1024 * 1024;
async function readAuthoringText(file, runtime, maxBytes = MAX_INPUT_BYTES) {
  try {
    if (file !== "-") {
      const handle = await open(path.resolve(runtime.cwd(), file), "r");
      try {
        if ((await handle.stat()).size > maxBytes)
          throw usageError("Input exceeds its size limit.");
        let size2 = 0;
        const chunks2 = [];
        for await (const chunk of handle.createReadStream({ autoClose: false })) {
          size2 += chunk.length;
          if (size2 > maxBytes)
            throw usageError("Input exceeds its size limit.");
          chunks2.push(chunk);
        }
        return Buffer.concat(chunks2).toString("utf8");
      } finally {
        await handle.close();
      }
    }
    if (!runtime.stdin || runtime.isStdinTty?.())
      throw usageError("Pipe input when using '-'.");
    let size = 0;
    const chunks = [];
    for await (const chunk of runtime.stdin) {
      const bytes = Buffer.from(chunk);
      size += bytes.length;
      if (size > maxBytes)
        throw usageError("Input exceeds its size limit.");
      chunks.push(bytes);
    }
    return Buffer.concat(chunks).toString("utf8");
  } catch (error) {
    if (error instanceof CliError)
      throw error;
    const code = error.code;
    if (file !== "-" && code === "ENOENT")
      throw usageError("".concat(file, " does not exist."));
    if (file !== "-" && code === "EISDIR")
      throw usageError("".concat(file, " is a directory; name a file."));
    if (file !== "-" && code === "EACCES")
      throw usageError("".concat(file, " cannot be read (permission denied)."));
    throw usageError("Cannot read ".concat(file === "-" ? "stdin" : file, "; provide a readable file or pipe, within the size limit."));
  }
}
async function readAuthoringJson(file, runtime) {
  const text = await readAuthoringText(file, runtime);
  try {
    return JSON.parse(text);
  } catch {
    throw usageError("Input is not valid JSON.");
  }
}
var outputExists = (output) => "Output file already exists: ".concat(output, ". Nothing was written and it still holds its earlier content. Choose a new --output path, or add --overwrite to replace it.");
async function holdsContent(output) {
  try {
    return (await stat(output)).size > 0;
  } catch (error) {
    if (error.code === "ENOENT")
      return false;
    throw error;
  }
}
async function assertOutputAvailable(output, overwrite) {
  if (!overwrite && await holdsContent(output))
    throw usageError(outputExists(output));
}
async function writeOutputFile(output, text, overwrite) {
  await mkdir(path.dirname(output), { recursive: true });
  await assertOutputAvailable(output, overwrite);
  const temporary = "".concat(output, ".").concat(crypto.randomUUID(), ".tmp");
  try {
    const handle = await open(temporary, "wx", 384);
    try {
      await handle.writeFile(text);
    } finally {
      await handle.close();
    }
    await rename(temporary, output);
  } catch {
    throw usageError("Cannot create output; check that the directory is writable.");
  } finally {
    await rm(temporary, { force: true });
  }
}
async function writeAuthoringJson(file, document, runtime, overwrite = false) {
  const output = path.resolve(runtime.cwd(), file);
  await writeOutputFile(output, JSON.stringify(document, null, 2) + "\n", overwrite);
  return output;
}
async function readInputBytes(file, cwd, runtime, maxBytes) {
  if (file === "-" && (!runtime?.stdin || runtime.isStdinTty?.())) {
    throw usageError("Pipe input when using '-'.");
  }
  const handle = file === "-" ? void 0 : await open(path.resolve(cwd, file), "r");
  try {
    const chunks = [];
    let size = 0;
    const input = handle ? handle.createReadStream({ autoClose: false }) : runtime.stdin;
    for await (const chunk of input) {
      const bytes = Buffer.from(chunk);
      size += bytes.length;
      if (size > maxBytes)
        throw usageError("Input exceeds its size limit.");
      chunks.push(bytes);
    }
    return Buffer.concat(chunks);
  } finally {
    await handle?.close();
  }
}

// dist/webhook-verify.js
var webhook_verify_exports = {};
__export(webhook_verify_exports, {
  VERIFY_FLAGS: () => VERIFY_FLAGS,
  WEBHOOK_HANDSHAKES: () => WEBHOOK_HANDSHAKES,
  WEBHOOK_VERIFY_ENCODINGS: () => WEBHOOK_VERIFY_ENCODINGS,
  WEBHOOK_VERIFY_TOLERANCE_MAX_S: () => WEBHOOK_VERIFY_TOLERANCE_MAX_S,
  WEBHOOK_VERIFY_TOLERANCE_MIN_S: () => WEBHOOK_VERIFY_TOLERANCE_MIN_S,
  WEBHOOK_VERIFY_VENDORS: () => WEBHOOK_VERIFY_VENDORS,
  readVerifySecret: () => readVerifySecret,
  singleStdin: () => singleStdin,
  verifyFlagsGiven: () => verifyFlagsGiven,
  verifyHeaderOption: () => verifyHeaderOption,
  verifyLines: () => verifyLines,
  verifyMembers: () => verifyMembers,
  verifyText: () => verifyText,
  verifyToleranceOption: () => verifyToleranceOption
});
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

// dist/screen-fleet.js
var screen_fleet_exports = {};
__export(screen_fleet_exports, {
  AUDIENCE_INPUT_MAX_BYTES: () => AUDIENCE_INPUT_MAX_BYTES,
  AUDIENCE_RULE_HELP: () => AUDIENCE_RULE_HELP,
  SCREEN_FOLDER_ID_PATTERN: () => SCREEN_FOLDER_ID_PATTERN,
  SCREEN_TAGS_MAX: () => SCREEN_TAGS_MAX,
  SCREEN_TAG_PATTERN: () => SCREEN_TAG_PATTERN,
  audienceJson: () => audienceJson,
  audienceOption: () => audienceOption,
  audienceRule: () => audienceRule,
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
var AUDIENCE_RULE_HELP = 'a rule as JSON with exactly one of all, any, not, tag, screen_id or folder, such as {"all":[{"tag":"Cafe"},{"not":{"tag":"Kiosk"}}]}';
var AUDIENCE_INPUT_MAX_BYTES = 64 * 1024;
function audienceOption(value) {
  if (!value.trim() || value.trim() === "@")
    throw usageError("--audience takes a JSON rule, @FILE to read it from a file, or - for stdin.");
  return value;
}
function audienceJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw usageError("--audience is not valid JSON. Give ".concat(AUDIENCE_RULE_HELP, ", @FILE to read it from a file, or - for stdin."));
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw usageError("--audience must be ".concat(AUDIENCE_RULE_HELP, '; {"all":[]} is every screen.'));
  }
  return parsed;
}
async function audienceRule(raw, runtime) {
  const source = raw.trim();
  const text = /^[[{]/.test(source) ? source : await readAuthoringText(source.startsWith("@") ? source.slice(1) : source, runtime, AUDIENCE_INPUT_MAX_BYTES);
  return audienceJson(text);
}
async function screenTarget(args, command, runtime) {
  const ids = args.positionals.slice(2);
  if (args.flags.tag === true)
    throw usageError("--tag requires a value, such as --tag Lobby.");
  if (args.flags.folder === true)
    throw usageError("--folder requires a value, such as --folder sfd_NORTH.");
  const tag = flagString(args.flags, "tag");
  const folder = flagString(args.flags, "folder");
  const audience = flagString(args.flags, "audience");
  if ([ids.length > 0, tag !== void 0, folder !== void 0, audience !== void 0].filter(Boolean).length > 1) {
    throw usageError("".concat(command, " takes screen ids, --tag TAG").concat(audience !== void 0 ? ", --folder ID or --audience RULE" : " or --folder ID", "; give only one."));
  }
  if (tag !== void 0)
    return { kind: "fleet", selector: { by: "tag", tag: screenTag(tag) } };
  if (folder !== void 0)
    return { kind: "fleet", selector: { by: "folder", folder_id: screenFolderId(folder, "--folder") } };
  if (audience !== void 0) {
    singleStdin([["--audience", audience.trim()], ["--file", flagString(args.flags, "file")]]);
    return { kind: "fleet", selector: { by: "audience", audience: await audienceRule(audience, runtime) } };
  }
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
  switch (selector.by) {
    case "tag":
      return "--tag ".concat(selector.tag);
    case "folder":
      return "--folder ".concat(selector.folder_id);
    case "audience":
      return "--audience '".concat(JSON.stringify(selector.audience), "'");
    default:
      return selector.screen_ids.join(" ");
  }
}
function rejectFleetRevision(args, command) {
  if (args.flags["expect-rev"] !== void 0) {
    throw usageError("".concat(command, " with several screens, --tag, --folder or --audience does not take --expect-rev: revision guards are per screen. Target one screen id to use --expect-rev."));
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

export {
  flagString,
  flagBool,
  flagNumber,
  command_input_exports,
  RESOURCE_ID_PATTERNS,
  isResourceID,
  resource_ids_exports,
  readAuthoringText,
  readAuthoringJson,
  assertOutputAvailable,
  writeOutputFile,
  writeAuthoringJson,
  readInputBytes,
  authoring_input_exports,
  WEBHOOK_VERIFY_VENDORS,
  WEBHOOK_HANDSHAKES,
  WEBHOOK_VERIFY_ENCODINGS,
  verifyHeaderOption,
  verifyToleranceOption,
  verifyFlagsGiven,
  singleStdin,
  verifyMembers,
  verifyLines,
  webhook_verify_exports,
  SCREEN_TAG_PATTERN,
  SCREEN_TAGS_MAX,
  screenTag,
  screenTagList,
  SCREEN_FOLDER_ID_PATTERN,
  screenFolderId,
  AUDIENCE_RULE_HELP,
  audienceOption,
  audienceRule,
  screenTarget,
  folderSubtree,
  selectorFlags,
  rejectFleetRevision,
  screenActionResult,
  fleetOutcome,
  fleetHumanLines,
  screen_fleet_exports
};
