import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  kvWriteFromArgs
} from "./chunk-IHXC5MOO.js";
import {
  addVerifyOptions
} from "./chunk-SFIXFGXL.js";
import {
  connectionIdOption,
  readServiceAccountKey
} from "./chunk-23UOURHR.js";
import {
  singleStdin,
  snoozeDurationMs,
  verifyFlagsGiven,
  verifyLines,
  verifyMembers
} from "./chunk-I3NZWYMT.js";
import {
  SDK_PROTOCOL_VERSION,
  packDirectory
} from "./chunk-LXELN3QG.js";
import {
  isPlayerScreenPath
} from "./chunk-MR54EUES.js";
import "./chunk-UXMZL4AK.js";
import {
  apexHost
} from "./chunk-BWPKDRCP.js";
import {
  subcommand
} from "./chunk-QUFYJQPR.js";
import {
  table
} from "./chunk-CKOG7ZL3.js";
import {
  readAuthoringJson,
  readAuthoringText
} from "./chunk-OFOJKZJN.js";
import {
  cardUid
} from "./chunk-HQPJWYRP.js";
import {
  UPLOAD_BATCH_DEFAULT_CONCURRENCY,
  UPLOAD_BATCH_MAX_CONCURRENCY,
  UPLOAD_BATCH_MIN_CONCURRENCY,
  runMediaUploadBatch
} from "./chunk-QYNYC7PN.js";
import {
  performSignedBodyPut,
  uploadMediaFile,
  validateMediaUploadSession
} from "./chunk-4ENHCVGW.js";
import {
  canonicalPairingCode
} from "./chunk-3W3YTE3M.js";
import {
  Option,
  positiveInteger,
  positiveNumber,
  reviewNoteOption,
  revision
} from "./chunk-A2S45EKE.js";
import {
  MEDIA_FOLDER_ID_PATTERN,
  clientFor,
  commandHandler,
  humanLines,
  jsonBody,
  libraryQuery,
  mediaFolderId,
  progressReporterFor,
  quotedRevision,
  requireFlagValue,
  requireInputFile,
  requirePrivateNoStore,
  requireToken,
  resolveDownloadOutput,
  simpleGet,
  simpleList,
  streamToken,
  transcodeOptionsFromArgs,
  writeRecoveries
} from "./chunk-SX4HKPRA.js";
import {
  limitsFromCapabilities
} from "./chunk-UD3J3FNQ.js";
import {
  loggerOf
} from "./chunk-PPWTLS44.js";
import {
  assertProjectCredential,
  fetchSignedRawPut,
  openExternalUrl,
  openTempFile,
  pendingReviewOf,
  pendingReviewWarning,
  plainText,
  projectConfigFor,
  reviewNext,
  withProjectConfig
} from "./chunk-RY7TSGK3.js";
import {
  flagBool,
  flagNumber,
  flagString,
  isValidIdempotencyKey,
  newIdempotencyKey,
  readConfigFile,
  successEnvelope,
  withConfigLock,
  writeConfigAtomic
} from "./chunk-D2RLMLYO.js";
import {
  readAsset
} from "./chunk-4QJFIFQH.js";
import "./chunk-7EJTDXNL.js";
import "./chunk-BFLHHH47.js";
import "./chunk-P3D5NU6C.js";
import {
  RESOURCE_ID_PATTERNS,
  isResourceID
} from "./chunk-SFYZH3GR.js";
import {
  addCommandExamples,
  addCommandNotes,
  requireOptionGroup
} from "./chunk-IBLNZ4EM.js";
import {
  CliError,
  ExitCode,
  makeProblem,
  unexpectedResponseError,
  usageError
} from "./chunk-JP4OQPAN.js";
import {
  CREDIT_HELP
} from "./chunk-4IIE6JYN.js";
import "./chunk-PGM5AQER.js";
import "./chunk-G4R5Q7OS.js";
import "./chunk-LMVLFNSU.js";
import "./chunk-XAYSKU3G.js";
import "./chunk-3FYAGULW.js";

// dist/handlers/app.js
import { createHash } from "node:crypto";
import { lstat, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

// dist/adapters/sdk-types.js
var SDK_TYPES_FILE = "screenrig.d.ts";
function readSdkTypes() {
  try {
    return readAsset("screenrig.d.ts");
  } catch {
    throw new CliError(makeProblem("sdk_types_missing", "SDK types unavailable", 500, "The packaged SDK declaration file is missing at assets/screenrig.d.ts; reinstall the ScreenRig CLI from a verified release.", {
      hint: "Nothing was written."
    }), ExitCode.Unexpected);
  }
}

// dist/application-name.js
function normalizeApplicationName(value) {
  const name = value.trim();
  const scalars = [...name];
  if (scalars.length > 120 || new RegExp("\\p{Cc}", "u").test(value) || scalars.some((char) => {
    const code = char.codePointAt(0);
    return code >= 55296 && code <= 57343;
  })) {
    throw usageError("--name must be at most 120 Unicode characters and must not contain control characters or invalid Unicode.");
  }
  return name;
}
function applicationNameHeaders(value) {
  if (value === void 0)
    return {};
  const name = normalizeApplicationName(value);
  if (!name)
    return {};
  if (/^[\x20-\x7e]+$/.test(name))
    return { "screenrig-application-name": name };
  const encoded = encodeURIComponent(name).replace(/[!'()*]/g, (char) => "%".concat(char.charCodeAt(0).toString(16).toUpperCase()));
  return { "screenrig-application-name*": "UTF-8''".concat(encoded) };
}

// dist/app-upload.js
function directApplicationUploads(capabilities) {
  return capabilities?.features?.application_direct_uploads === true;
}
var COMMIT_ATTEMPTS = 4;
async function uploadApplicationDirect(input) {
  const { runtime, client, packed } = input;
  const declaration = {
    ...input.name ? { name: input.name } : {},
    sha256: packed.sha256,
    compressed_bytes: packed.compressed_bytes,
    expanded_bytes: packed.expanded_bytes,
    file_count: packed.file_count,
    sdk_version: input.sdkVersion
  };
  const declared = await client.call({
    method: "POST",
    path: input.applicationId ? "/api/applications/".concat(encodeURIComponent(input.applicationId), "/uploads") : "/api/applications/uploads",
    idempotent: true,
    ...input.ifMatch ? { headers: { "if-match": input.ifMatch } } : {},
    body: declaration
  });
  if (declared.headers["cache-control"] !== "private, no-store") {
    throw usageError("Application upload declaration did not return the required private, no-store cache policy.");
  }
  const body = declared.body;
  const session = validateMediaUploadSession(body, runtime.now().getTime(), "Application upload");
  if (typeof body.application_id !== "string" || !body.application_id || typeof body.release_id !== "string" || !body.release_id) {
    throw usageError("Application upload declaration returned an invalid binding.");
  }
  await performSignedBodyPut(packed.archive, session, runtime.signedRawPut ?? fetchSignedRawPut(), { label: "Application package upload", sleep: runtime.sleep });
  const commit = { sha256: packed.sha256, compressed_bytes: packed.compressed_bytes };
  const response = await commitUpload(client, runtime, session.id, commit);
  return {
    accepted: { id: body.application_id, release_id: body.release_id, operation_id: session.operationId },
    response
  };
}
async function commitUpload(client, runtime, uploadId, commit) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await client.call({
        method: "POST",
        path: "/api/applications/uploads/".concat(encodeURIComponent(uploadId), "/commit"),
        idempotent: true,
        body: commit
      });
    } catch (error) {
      if (!(error instanceof CliError))
        throw error;
      const { status, retry_after_seconds: after } = error.problem;
      if (attempt >= COMMIT_ATTEMPTS || !(status >= 500 || status === 429 || status === 408))
        throw error;
      await runtime.sleep(typeof after === "number" && after > 0 ? Math.min(after, 30) * 1e3 : 2e3 * attempt);
    }
  }
}

// dist/handlers/app.js
var handleAppPack = commandHandler(appPack, false);
var handleAppTypes = commandHandler(appTypes, false);
var handleAppUpload = commandHandler(async (args, runtime, resolved) => {
  return loggerOf(runtime).withLocal({ op: "app.upload", message: "app upload" }, () => appUpload(args, runtime, resolved, false));
}, true);
var handleAppUpdate = commandHandler(async (args, runtime, resolved) => {
  return loggerOf(runtime).withLocal({ op: "app.update", message: "app update" }, () => appUpload(args, runtime, resolved, true));
}, true);
var handleAppList = commandHandler(async (args, runtime, resolved) => {
  return simpleList(args, runtime, resolved, "/api/applications", "Applications");
}, true);
var handleAppShow = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  if (!id)
    throw usageError("app show requires an application id.");
  return simpleGet(args, runtime, resolved, "/api/applications/".concat(id), "Application");
}, true);
var handleAppRename = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  const name = normalizeApplicationName(flagString(args.flags, "name") ?? "");
  if (!id || !name)
    throw usageError("app rename requires <id> and a nonempty --name.");
  const revision2 = flagString(args.flags, "expect-rev");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: "PATCH",
    path: "/api/applications/".concat(encodeURIComponent(id)),
    body: { name },
    idempotent: true,
    headers: revision2 ? { "if-match": quotedRevision(revision2) } : void 0
  });
  const application = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: humanLines("Application renamed", [["id", application.id], ["name", application.name], ["revision", String(application.revision)]])
  };
}, true);
var handleAppDelete = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  if (!id)
    throw usageError("app delete requires <id>.");
  const revision2 = flagString(args.flags, "expect-rev");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: "DELETE",
    path: "/api/applications/".concat(encodeURIComponent(id)),
    idempotent: true,
    headers: revision2 ? { "if-match": quotedRevision(revision2) } : void 0
  });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Deleted application ".concat(id) };
}, true);
async function appPack(args, runtime) {
  const dir = args.positionals[2];
  if (!dir) {
    throw usageError("app pack requires a directory.");
  }
  const result = await packDirectory(await requireAppDirectory(runtime, dir, "app pack ./DIRECTORY"), { logger: loggerOf(runtime) });
  const output = flagString(args.flags, "output");
  if (output) {
    await writeFile(path.resolve(runtime.cwd(), output), result.archive);
  }
  const data = {
    sha256: result.sha256,
    compressed_bytes: result.compressed_bytes,
    expanded_bytes: result.expanded_bytes,
    file_count: result.file_count,
    entries: result.entries,
    sdk_injection: result.sdk_injection,
    output
  };
  return {
    envelope: successEnvelope(data),
    exitCode: ExitCode.Success,
    human: humanLines("Archive packed", [
      ["sha256", result.sha256],
      ["compressed_bytes", String(result.compressed_bytes)],
      ["expanded_bytes", String(result.expanded_bytes)],
      ["file_count", String(result.file_count)],
      ["sdk_injection", result.sdk_injection.injected ? "yes" : "deferred"]
    ])
  };
}
async function appTypes(args, runtime) {
  const dir = args.positionals[2] ?? ".";
  const root = path.resolve(runtime.cwd(), dir);
  const next = { command: "screenrig app types ./SOURCES", reason: "Writes ".concat(SDK_TYPES_FILE, " into a directory that exists.") };
  let isDirectory = false;
  try {
    isDirectory = (await stat(root)).isDirectory();
  } catch (error) {
    if (error.code !== "ENOENT")
      throw error;
    throw usageError("".concat(dir, " does not exist. Name the directory that holds your TypeScript sources."), next);
  }
  if (!isDirectory) {
    throw usageError("".concat(dir, " is a file. Name the directory to write ").concat(SDK_TYPES_FILE, " into."), next);
  }
  const types = runtime.sdkTypes ? Buffer.from(runtime.sdkTypes()) : readSdkTypes();
  const target = path.join(root, SDK_TYPES_FILE);
  const shown = path.join(dir, SDK_TYPES_FILE);
  let existing;
  try {
    if (!(await lstat(target)).isFile()) {
      throw usageError("".concat(shown, " exists and is not a regular file. Move it aside, then run the command again."), next);
    }
    existing = await readFile(target);
  } catch (error) {
    if (error instanceof CliError)
      throw error;
    if (error.code !== "ENOENT")
      throw error;
  }
  const written = existing === void 0 || !existing.equals(types);
  if (written) {
    const temporary = "".concat(target, ".").concat(process.pid, ".tmp");
    try {
      await writeFile(temporary, types, { flag: "wx", mode: 420 });
      await rename(temporary, target);
    } catch (error) {
      await rm(temporary, { force: true });
      throw error;
    }
  }
  const data = { path: shown, bytes: types.length, sha256: createHash("sha256").update(types).digest("hex"), written };
  return {
    envelope: successEnvelope(data),
    exitCode: ExitCode.Success,
    human: humanLines(written ? "SDK types written" : "SDK types already current", [
      ["path", data.path],
      ["bytes", String(data.bytes)],
      ["sha256", data.sha256]
    ])
  };
}
async function requireAppDirectory(runtime, dir, usage) {
  const root = path.resolve(runtime.cwd(), dir);
  let isDirectory = false;
  try {
    isDirectory = (await stat(root)).isDirectory();
  } catch (error) {
    if (error.code !== "ENOENT")
      throw error;
    throw usageError("".concat(dir, " does not exist. Pass the built application directory (the one with index.html)."), { command: "screenrig ".concat(usage), reason: "Packs and uploads the directory in one step." });
  }
  if (!isDirectory) {
    throw usageError("".concat(dir, " is a file. Pass the built application directory (the one with index.html), not a packed archive; the upload packs the directory itself."), { command: "screenrig ".concat(usage), reason: "Packs and uploads the directory in one step; app pack is only an optional local preview." });
  }
  return root;
}
async function appUpload(args, runtime, resolved, update) {
  const id = update ? args.positionals[2] : void 0;
  const dir = args.positionals[update ? 3 : 2];
  requireFlagValue(args, "expect-rev", "1");
  const revision2 = flagString(args.flags, "expect-rev");
  if (!dir || update && !id) {
    throw usageError(update ? "app update requires <id> <directory>." : "app upload requires one directory.");
  }
  if (update && args.flags.name !== void 0)
    throw usageError("app update preserves the application name; use app rename <id> --name NAME to rename it.");
  const ifMatch = update && revision2 ? quotedRevision(revision2) : void 0;
  requireFlagValue(args, "name", "Lobby board");
  const name = flagString(args.flags, "name");
  const nameHeaders = applicationNameHeaders(name);
  const root = await requireAppDirectory(runtime, dir, update ? "app update ".concat(id, " ./DIRECTORY") : "app upload ./DIRECTORY");
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const capabilitiesResponse = await client.call({ method: "GET", path: "/api/capabilities" });
  const capabilities = capabilitiesResponse.body;
  const packed = await packDirectory(root, {
    limits: limitsFromCapabilities(capabilities),
    logger: loggerOf(runtime)
  });
  const { accepted: body, response } = directApplicationUploads(capabilities) ? await uploadApplicationDirect({
    runtime,
    client,
    packed,
    sdkVersion: SDK_PROTOCOL_VERSION,
    ...update ? { applicationId: id } : {},
    ...ifMatch ? { ifMatch } : {},
    ...name !== void 0 ? { name: normalizeApplicationName(name) } : {}
  }) : await client.call({
    method: "POST",
    path: update ? "/api/applications/".concat(encodeURIComponent(id), "/releases") : "/api/applications",
    idempotent: true,
    headers: {
      "content-type": "application/gzip",
      "screenrig-archive-sha256": packed.sha256,
      "screenrig-expanded-bytes": String(packed.expanded_bytes),
      "screenrig-file-count": String(packed.file_count),
      "screenrig-sdk-version": SDK_PROTOCOL_VERSION,
      ...ifMatch ? { "if-match": ifMatch } : {},
      ...nameHeaders
    },
    body: packed.archive
  }).then((streamed) => ({ accepted: streamed.body, response: streamed }));
  const operation = !flagBool(args.flags, "no-wait") && body.operation_id ? await client.waitForOperation(body.operation_id, {
    timeoutMs: flagNumber(args.flags, "timeout") ?? 12e4,
    pollMs: flagNumber(args.flags, "poll-ms") ?? 1e3,
    sleep: runtime.sleep
  }) : null;
  const accepted = jsonBody({ body, headers: response.headers }, client.requestId);
  return {
    envelope: {
      ...accepted,
      data: {
        application: body,
        operation,
        pack: { sha256: packed.sha256, file_count: packed.file_count }
      }
    },
    exitCode: ExitCode.Success,
    human: humanLines(operation ? update ? "Application release uploaded" : "Application uploaded" : update ? "Application release accepted" : "Application upload accepted", [
      ["application_id", body.id],
      // Application primitives use the release id, not the application id.
      ["release_id", body.release_id],
      ["operation_id", body.operation_id],
      ["state", operation?.state],
      ["sha256", packed.sha256]
    ])
  };
}

// dist/handlers/app-dev.js
import path2 from "node:path";
var local = commandHandler(appDev, false);
var signedIn = commandHandler(appDev, true);
var handleAppDev = (args, runtime) => {
  const from = flagString(args.flags, "kv-from");
  if (from === void 0)
    return local(args, runtime);
  if (!/^(?:(?:stage|qa|development)_)?app_[A-Za-z0-9_-]+$/.test(from))
    throw usageError("--kv-from must be an application identifier (app_...).", { command: "screenrig app list", reason: "Lists the applications this project can read." });
  return signedIn(args, runtime);
};
function remoteReader(args, runtime, resolved) {
  const token = requireToken(resolved.token);
  const requestArgs = { ...args, flags: { ...args.flags, timeout: false } };
  return async (apiPath) => {
    try {
      const client = clientFor(runtime, requestArgs, resolved.apiUrl, await streamToken(runtime, token));
      return { ok: true, body: (await client.call({ method: "GET", path: apiPath })).body };
    } catch (error) {
      if (!(error instanceof CliError))
        throw error;
      const { code, status, detail, request_id, current_revision } = error.problem;
      return { ok: false, problem: { code, status, detail, ...request_id ? { request_id } : {}, ...current_revision === void 0 ? {} : { current_revision } } };
    }
  };
}
async function appDev(args, runtime, resolved) {
  const dir = args.positionals[2];
  if (!dir)
    throw usageError("app dev requires a directory.");
  const { assertDevPort, startDevServer } = await import("./dev-ODRWOGMF.js");
  const { DEV_PORT } = await import("./origins-PTIWFCQR.js");
  const { devEventData, formatDevLine } = await import("./output-LWET5CHN.js");
  const directory = await requireAppDirectory(runtime, dir, "app dev ./DIRECTORY");
  const port = flagNumber(args.flags, "port") ?? DEV_PORT;
  assertDevPort(port);
  const json = !flagBool(args.flags, "human");
  let kvFrom;
  const from = flagString(args.flags, "kv-from");
  if (from !== void 0) {
    const read = remoteReader(args, runtime, resolved);
    const probe = await read("/api/applications/".concat(encodeURIComponent(from), "/kv"));
    if (!probe.ok)
      throw usageError("Cannot read the stored values of ".concat(from, ": ").concat(probe.problem.detail), { command: "screenrig app list", reason: "Lists the applications this project can read." });
    kvFrom = { applicationId: from, read };
  }
  const kvFlag = flagString(args.flags, "kv");
  let announced = false;
  const early = [];
  const write = (entry) => {
    runtime.stdout.write("".concat(json ? JSON.stringify(successEnvelope(devEventData(entry))) : formatDevLine(entry), "\n"));
  };
  const print = (entry) => {
    if (announced)
      write(entry);
    else
      early.push(entry);
  };
  const handle = await startDevServer({
    directory,
    port,
    reload: !flagBool(args.flags, "no-reload"),
    print,
    ...kvFlag ? { kvFile: path2.resolve(runtime.cwd(), kvFlag) } : {},
    ...kvFrom ? { kvFrom } : {}
  });
  const started = { event: "started", url: handle.url, app_url: handle.appUrl, directory, release_host: handle.releaseHost, port, kv: handle.kv, reload: !flagBool(args.flags, "no-reload"), watching: handle.watching };
  if (json)
    runtime.stdout.write("".concat(JSON.stringify(successEnvelope(started)), "\n"));
  else {
    runtime.stdout.write([
      "screenRIG app dev",
      "  harness    ".concat(handle.url),
      "  app        ".concat(handle.appUrl),
      "  directory  ".concat(directory),
      "  stored     ".concat(handle.kv.mode === "remote" ? "real store of ".concat(handle.kv.location, " (read-only)") : handle.kv.location),
      "  reload     ".concat(started.reload ? "on file changes" : "off (use the Reload button)"),
      "Press Ctrl-C to stop.",
      ""
    ].join("\n"));
  }
  announced = true;
  for (const entry of early.splice(0))
    write(entry);
  if (flagBool(args.flags, "open")) {
    const opened = await (runtime.openUrl ?? openExternalUrl)(handle.url).catch(() => false);
    if (!opened)
      runtime.stderr.write("Open ".concat(handle.url, " in a browser.\n"));
  }
  const stopped = new AbortController();
  const stop = () => stopped.abort();
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  const timeoutMs = flagNumber(args.flags, "timeout");
  const timer = timeoutMs && timeoutMs > 0 ? setTimeout(stop, timeoutMs) : void 0;
  try {
    await new Promise((resolve) => {
      if (stopped.signal.aborted)
        resolve();
      else
        stopped.signal.addEventListener("abort", () => resolve(), { once: true });
    });
  } finally {
    clearTimeout(timer);
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
    await handle.close();
  }
  if (json)
    runtime.stdout.write("".concat(JSON.stringify(successEnvelope({ event: "stopped" })), "\n"));
  return { envelope: successEnvelope({ event: "stopped" }), exitCode: ExitCode.Success, human: "", output: "stream" };
}

// dist/cli-commands/app.js
function registerAppCommands(root, bind) {
  const app = root.command("app").description("Develop, pack, upload, rename, inspect, and delete applications");
  app.command("pack").description("Pack a local application directory").argument("<directory>", "Local directory").option("--output <PATH>", "Write the application package to this file").action(bind(handleAppPack));
  const dev = app.command("dev").description("Serve a local Player harness for developing an application").argument("<directory>", "Local directory").option("--port <PORT>", "Listen on this port; the runtime trusts the harness only on 18890, the default", positiveInteger("port")).option("--kv <FILE>", "Keep stored values in this JSON file; default .screenrig-dev/kv.json in the directory").option("--kv-from <ID>", "Read this application's real stored values through the signed-in CLI, read-only").option("--open", "Open the harness in the default browser").option("--no-reload", "Do not reload the application when a file changes").action(bind(handleAppDev));
  requireOptionGroup(dev, "atMostOne", ["--kv", "--kv-from"]);
  app.command("types").description("Write the TypeScript types for window.screenrig into a directory").argument("[directory]", "Directory to write screenrig.d.ts into; defaults to the current directory").action(bind(handleAppTypes));
  app.command("upload").description("Upload an application directory").argument("<directory>", "Local directory").option("--name <NAME>", "Set the application name").option("--no-wait", "Return after acceptance without waiting for processing").option("--poll-ms <MS>", "Set the operation polling interval", positiveInteger("poll-ms")).action(bind(handleAppUpload));
  app.command("update").description("Publish a new application release").argument("<id>", "Application identifier").argument("<directory>", "Local directory").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).option("--no-wait", "Return after acceptance without waiting for processing").option("--poll-ms <MS>", "Set the operation polling interval", positiveInteger("poll-ms")).action(bind(handleAppUpdate));
  app.command("list").description("List applications").action(bind(handleAppList));
  app.command("rename").description("Change an application's display name").argument("<id>", "Application identifier").requiredOption("--name <NAME>", "New application name").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleAppRename));
  app.command("show").description("Inspect an application").argument("<id>", "Application identifier").action(bind(handleAppShow));
  app.command("delete").description("Delete an application and all of its releases").argument("<id>", "Application identifier").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleAppDelete));
}

// dist/media-versions.js
import path3 from "node:path";
var versionsPath = (id) => "/api/media/".concat(encodeURIComponent(id), "/versions");
function mediaIdArg(value, usage) {
  if (!value)
    throw usageError("".concat(usage, " requires a media ID (med_...); media list shows them."));
  if (!isResourceID(value, "media"))
    throw usageError("".concat(usage, " takes a media ID (med_...), not ").concat(JSON.stringify(value), "; media list shows them."));
  return value;
}
function versionNumber(args, command) {
  const value = flagString(args.flags, "number");
  const number = Number(value);
  if (value === void 0 || !Number.isSafeInteger(number) || number < 1) {
    throw usageError("".concat(command, " requires --number N, a whole number from 1 as media versions lists it."));
  }
  return number;
}
function mediaVersionProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  const problem = error.problem;
  const next = problem.code === "revision_conflict" ? { command: "screenrig media show ".concat(id), argv: ["media", "show", id], reason: "Read the media's current revision, then run the command again with --expect-rev REVISION if the change still applies." } : problem.code === "not_found" ? { command: "screenrig media versions ".concat(id), argv: ["media", "versions", id], reason: "List the version numbers this media has; a deleted version does not come back." } : problem.code === "resource_conflict" ? { command: "screenrig media versions ".concat(id), argv: ["media", "versions", id], reason: "Read which version is current and whether a replacement waits for review (reviews list)." } : void 0;
  return next ? new CliError({ ...problem, next }, error.exitCode, error.warnings) : error;
}
async function versionCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw mediaVersionProblem(error, id);
  }
}
function isMediaWarning(value) {
  const warning = value;
  return !!warning && typeof warning === "object" && typeof warning.code === "string" && typeof warning.detail === "string";
}
function mediaWarningsOf(value) {
  return Array.isArray(value) ? value.filter(isMediaWarning).map((warning) => ({ ...warning, playlists: Array.isArray(warning.playlists) ? warning.playlists : [] })) : [];
}
function playlistsText(warning) {
  return warning.playlists.map((playlist) => "".concat(plainText(playlist.name), " (").concat(playlist.id, ")")).join(", ");
}
function envelopeWarning(warning) {
  const playlists = playlistsText(warning);
  return { code: warning.code, message: "".concat(plainText(warning.detail)).concat(playlists ? " Playlists: ".concat(playlists, ".") : "") };
}
var REPLACE_PENDING_SENTENCE = "Screens keep playing the current file until a person approves the replacement; they can also reject it or ask for changes. Do not repeat the write: check the decision later.";
function replaceNext(id) {
  return { command: "screenrig media versions ".concat(id), argv: ["media", "versions", id], reason: "Lists the media's versions; the new file is the current one." };
}
async function reviewUrl(client, reviewId) {
  try {
    const url = (await client.call({ method: "GET", path: "/api/reviews/".concat(encodeURIComponent(reviewId)) })).body?.url;
    return typeof url === "string" && url ? url : void 0;
  } catch {
    return void 0;
  }
}
async function mediaRevision(client, id) {
  try {
    const revision2 = (await client.call({ method: "GET", path: "/api/media/".concat(encodeURIComponent(id)) })).body?.revision;
    return typeof revision2 === "number" ? revision2 : void 0;
  } catch {
    return void 0;
  }
}
function sizeText(version) {
  const parts = [
    typeof version.width === "number" && typeof version.height === "number" ? "".concat(version.width, "x").concat(version.height) : "",
    typeof version.duration_ms === "number" ? "".concat((version.duration_ms / 1e3).toFixed(1), " s") : ""
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : "-";
}
function mediaReplaceResult(args, runtime, client, mediaId, uploaded, revision2, reviewLink) {
  const result = uploaded.operation.result ?? {};
  const waited = uploaded.operation.state === "succeeded";
  const warnings = mediaWarningsOf(result.warnings);
  const pendingId = waited && result.status === "pending_review" && typeof result.review_id === "string" ? result.review_id : void 0;
  const version = typeof result.version === "number" ? result.version : void 0;
  const data = {
    media_id: mediaId,
    id: mediaId,
    ...pendingId ? { status: "pending_review", review_id: pendingId } : {},
    ...version !== void 0 ? { version } : {},
    ...revision2 !== void 0 ? { revision: revision2 } : {},
    ...waited ? { warnings } : {},
    operation: uploaded.operation,
    upload: uploaded.upload,
    transcode: uploaded.transcode,
    timing: uploaded.timing,
    ...pendingId ? { next: reviewNext(pendingId) } : waited ? { next: replaceNext(mediaId) } : {}
  };
  const envelopeWarnings = [
    ...pendingId ? [reviewLink ? pendingReviewWarning({ url: reviewLink }) : { code: "pending_review", message: "The replacement waits for a person to approve it: screenrig reviews show ".concat(pendingId) }] : [],
    ...warnings.map(envelopeWarning),
    ...uploaded.warnings
  ];
  const human = flagBool(args.flags, "human");
  if (!human)
    for (const warning of warnings)
      runtime.stderr.write("screenrig: warning: ".concat(envelopeWarning(warning).message, "\n"));
  const title = pendingId ? "Replacement waiting for review" : waited ? "Media replaced" : "Media replacement accepted";
  const lines = [
    title,
    "media_id: ".concat(mediaId),
    ...version !== void 0 ? ["version: ".concat(version)] : [],
    ...revision2 !== void 0 ? ["revision: ".concat(revision2)] : [],
    "operation_id: ".concat(uploaded.operation.id),
    "state: ".concat(uploaded.operation.state),
    ...pendingId ? ["review_id: ".concat(pendingId), ...reviewLink ? ["url: ".concat(reviewLink)] : [], "next: screenrig reviews show ".concat(pendingId), REPLACE_PENDING_SENTENCE] : waited ? ["next: screenrig media versions ".concat(mediaId)] : ["next: screenrig operations wait ".concat(uploaded.operation.id)],
    "content_type: ".concat(uploaded.upload.content_type),
    "sha256: ".concat(uploaded.upload.sha256),
    "transcode: ".concat(typeof uploaded.transcode.duration_ms === "number" ? "".concat(uploaded.transcode.reason, " in ").concat(uploaded.transcode.duration_ms, " ms") : "skipped"),
    "timing: ".concat(Object.entries(uploaded.timing).map(([stage, ms]) => "".concat(stage.replace(/_ms$/, ""), " ").concat(ms, " ms")).join(", ")),
    ...warnings.map((warning) => "warning: ".concat(envelopeWarning(warning).message)),
    ...uploaded.warnings.map((warning) => "warning: ".concat(warning.message))
  ];
  return {
    envelope: successEnvelope(data, { request_id: client.requestId, operation_id: uploaded.operation.id, warnings: envelopeWarnings }),
    exitCode: ExitCode.Success,
    human: lines.join("\n")
  };
}
var handleMediaReplace = commandHandler(async (args, runtime, resolved) => {
  const mediaId = mediaIdArg(args.positionals[2], "media replace");
  const file = args.positionals[3];
  if (!file)
    throw usageError("media replace requires <id> and <file>.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  return loggerOf(runtime).withLocal({ op: "media.replace", message: "media replace" }, async () => {
    const sourcePath = path3.resolve(runtime.cwd(), file);
    await requireInputFile(sourcePath, file);
    const transcodeOptions = transcodeOptionsFromArgs(args);
    let media;
    try {
      media = (await client.call({ method: "GET", path: "/api/media/".concat(encodeURIComponent(mediaId)) })).body;
    } catch (error) {
      throw mediaVersionProblem(error, mediaId);
    }
    const primitive = media.primitive === "image" || media.primitive === "video" || media.primitive === "audio" ? media.primitive : void 0;
    const note = flagString(args.flags, "note");
    const ifMatch = flagString(args.flags, "expect-rev");
    const noWait = flagBool(args.flags, "no-wait");
    let uploaded;
    try {
      uploaded = await uploadMediaFile({
        runtime,
        client,
        sourcePath,
        // A scoped uploader must declare into the target's existing folder.
        folderId: typeof media.folder_id === "string" && media.folder_id ? media.folder_id : void 0,
        explicitContentType: flagString(args.flags, "content-type"),
        transcodeOptions,
        noTranscode: flagBool(args.flags, "no-transcode"),
        reporter: progressReporterFor(args, runtime),
        noWait,
        timeoutMs: flagNumber(args.flags, "timeout") ?? 12e4,
        pollMs: flagNumber(args.flags, "poll-ms") ?? 1e3,
        resumable: flagString(args.flags, "idempotency-key") !== void 0,
        replace: { mediaId, ...primitive ? { primitive } : {}, ...ifMatch !== void 0 ? { ifMatch } : {}, ...note !== void 0 ? { note } : {} }
      });
    } catch (error) {
      throw mediaVersionProblem(error, mediaId);
    }
    const result = uploaded.operation.result ?? {};
    const pendingId = uploaded.operation.state === "succeeded" && result.status === "pending_review" && typeof result.review_id === "string" ? result.review_id : void 0;
    const reviewLink = pendingId ? await reviewUrl(client, pendingId) : void 0;
    const revision2 = uploaded.operation.state === "succeeded" && !pendingId ? await mediaRevision(client, mediaId) : void 0;
    return mediaReplaceResult(args, runtime, client, mediaId, uploaded, revision2, reviewLink);
  });
}, true);
function actorText(by) {
  if (!by)
    return "-";
  const name = plainText(by.name ?? by.id ?? "");
  return name ? "".concat(name, " (").concat(by.kind, ")") : by.kind;
}
function sourceText(version) {
  return version.source === "restore" && version.restored_from !== void 0 ? "restore of ".concat(version.restored_from) : version.source;
}
function mediaVersionLines(mediaId, page) {
  const items = Array.isArray(page?.items) ? page.items : [];
  const next = typeof page?.next_cursor === "string" && page.next_cursor ? page.next_cursor : void 0;
  return [
    "Media ".concat(mediaId, " versions (").concat(items.length, ")"),
    ...items.length ? table(["NUMBER", "SOURCE", "FILENAME", "BYTES", "SIZE", "BY", "CREATED", "NOTE"], items.map((item) => [
      "".concat(item.number).concat(item.current ? " (current)" : ""),
      sourceText(item),
      plainText(item.filename),
      String(item.bytes),
      sizeText(item),
      actorText(item.by),
      item.created_at,
      item.note === void 0 ? "" : plainText(item.note)
    ])) : ["No versions"],
    ...next ? ["next: screenrig media versions ".concat(mediaId, " --cursor ").concat(next)] : []
  ];
}
var handleMediaVersions = commandHandler(async (args, runtime, resolved) => {
  const id = mediaIdArg(args.positionals[2], "media versions");
  const limit = flagString(args.flags, "limit");
  const cursor = flagString(args.flags, "cursor");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const request = async () => limit !== void 0 || cursor !== void 0 ? client.call({ method: "GET", path: versionsPath(id), query: { ...limit !== void 0 ? { limit } : {}, ...cursor !== void 0 ? { cursor } : {} } }) : client.listAll(versionsPath(id), void 0, { cursorParam: "cursor" });
  let response;
  try {
    response = await request();
  } catch (error) {
    throw mediaVersionProblem(error, id);
  }
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: mediaVersionLines(id, response.body).join("\n")
  };
}, true);
var RESTORE_PENDING_SENTENCE = "Screens keep playing the current file until a person approves the restore; they can also reject it or ask for changes. Do not repeat the write: check the decision later.";
var handleMediaRestore = commandHandler(async (args, runtime, resolved) => {
  const id = mediaIdArg(args.positionals[2], "media restore");
  const number = versionNumber(args, "media restore");
  const note = flagString(args.flags, "note");
  const ifMatch = flagString(args.flags, "expect-rev");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await versionCall(client, {
    method: "POST",
    path: "".concat(versionsPath(id), "/").concat(number, "/restore"),
    idempotent: true,
    ...ifMatch !== void 0 ? { headers: { "if-match": quotedRevision(ifMatch) } } : {},
    ...note !== void 0 ? { body: { note } } : {}
  }, id);
  const warnings = mediaWarningsOf(response.body?.warnings);
  const pending = pendingReviewOf(response);
  if (pending) {
    return {
      envelope: jsonBody(response, client.requestId, { next: reviewNext(pending.review.id) }, [pendingReviewWarning(pending.review), ...warnings.map(envelopeWarning)]),
      exitCode: ExitCode.Success,
      human: [
        "Restore of version ".concat(number, " waiting for review"),
        "review_id: ".concat(pending.review.id),
        ...pending.review.subject ? ["subject: media ".concat(plainText(pending.review.subject.name), " (").concat(pending.review.subject.id, ")")] : [],
        ...typeof pending.review.impact?.screens === "number" ? ["impact: approving changes ".concat(pending.review.impact.screens, " screen").concat(pending.review.impact.screens === 1 ? "" : "s")] : [],
        "url: ".concat(pending.review.url),
        "next: screenrig reviews show ".concat(pending.review.id),
        RESTORE_PENDING_SENTENCE,
        ...warnings.map((warning) => "warning: ".concat(envelopeWarning(warning).message))
      ].join("\n")
    };
  }
  const revision2 = response.body?.media?.revision;
  return {
    envelope: jsonBody(response, client.requestId, { next: replaceNext(id) }, warnings.map(envelopeWarning)),
    exitCode: ExitCode.Success,
    human: [
      "Restored version ".concat(number, " of ").concat(id, " as the current file"),
      ...typeof revision2 === "number" ? ["revision: ".concat(revision2)] : [],
      "next: screenrig media versions ".concat(id),
      ...warnings.map((warning) => "warning: ".concat(envelopeWarning(warning).message))
    ].join("\n")
  };
}, true);
var handleMediaVersionDelete = commandHandler(async (args, runtime, resolved) => {
  const id = mediaIdArg(args.positionals[3], "media version delete");
  const number = versionNumber(args, "media version delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await versionCall(client, { method: "DELETE", path: "".concat(versionsPath(id), "/").concat(number), idempotent: true }, id);
  return {
    envelope: jsonBody(response, client.requestId, { media_id: id, version: number, deleted: true }),
    exitCode: ExitCode.Success,
    human: "Deleted version ".concat(number, " of media ").concat(id)
  };
}, true);

// dist/handlers/media.js
import { createHash as createHash3 } from "node:crypto";
import { rename as rename2, rm as rm2 } from "node:fs/promises";
import path4 from "node:path";

// dist/media-generate-retry.js
import { createHash as createHash2 } from "node:crypto";
function generateRequestHash(request) {
  return createHash2("sha256").update(JSON.stringify([request.prompt, request.aspect_ratio ?? "", request.quality ?? "", request.tag ?? ""])).digest("hex");
}
async function generateRetryState(options) {
  return withConfigLock(options.resolved.configPath, options.runtime.fs, { sleep: options.runtime.sleep, now: () => options.runtime.now().getTime() }, async () => {
    const stored = await readConfigFile(options.resolved.configPath, options.runtime.fs);
    const current = stored ? projectConfigFor(stored, options.resolved) : void 0;
    if (current)
      assertProjectCredential(current, options.resolved);
    const pending = current?.media_generate;
    const reused = pending !== void 0 && pending.request_hash === options.requestHash && (options.requestedKey === void 0 || options.requestedKey === pending.idempotency_key);
    const idempotencyKey = reused ? pending.idempotency_key : options.requestedKey ?? (options.generateIdempotencyKey ?? newIdempotencyKey)();
    if (!isValidIdempotencyKey(idempotencyKey)) {
      throw usageError("media generate idempotency key is invalid.");
    }
    const state = { idempotency_key: idempotencyKey, request_hash: options.requestHash };
    if (!reused || pending.idempotency_key !== idempotencyKey) {
      await writeConfigAtomic(options.resolved.configPath, withProjectConfig(stored ?? { api_url: options.resolved.apiUrl }, options.resolved, {
        ...current ?? { api_url: options.resolved.apiUrl },
        media_generate: state,
        updated_at: options.runtime.now().toISOString()
      }), options.runtime.fs);
    }
    return { state, reused };
  });
}
async function clearGenerateRetryState(resolved, runtime, idempotencyKey) {
  await withConfigLock(resolved.configPath, runtime.fs, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    const stored = await readConfigFile(resolved.configPath, runtime.fs);
    const current = stored ? projectConfigFor(stored, resolved) : void 0;
    if (current)
      assertProjectCredential(current, resolved);
    if (!current || current.media_generate?.idempotency_key !== idempotencyKey)
      return;
    const { media_generate: _resolvedGeneration, ...rest } = current;
    await writeConfigAtomic(resolved.configPath, withProjectConfig(stored, resolved, rest), runtime.fs);
  });
}

// dist/handlers/media.js
var MEDIA_TAG_PATTERN = /^[A-Za-z0-9]{1,32}$/;
function mediaTagFromArgs(args) {
  requireFlagValue(args, "tag", "lobby");
  const tag = flagString(args.flags, "tag");
  if (tag === void 0) {
    return void 0;
  }
  if (!MEDIA_TAG_PATTERN.test(tag)) {
    throw usageError("--tag must be 1 to 32 letters or digits.");
  }
  return tag;
}
function mediaPrimitiveFromArgs(args) {
  requireFlagValue(args, "primitive", "image");
  const primitive = flagString(args.flags, "primitive");
  if (primitive === void 0) {
    return void 0;
  }
  if (primitive !== "image" && primitive !== "video" && primitive !== "audio") {
    throw usageError("--primitive must be image, video, or audio.");
  }
  return primitive;
}
var handleMediaList = commandHandler(async (args, runtime, resolved) => {
  const folder = flagString(args.flags, "folder");
  return simpleList(args, runtime, resolved, "/api/media", "Media", {
    tag: mediaTagFromArgs(args),
    primitive: mediaPrimitiveFromArgs(args),
    ...libraryQuery(args),
    ...folder === void 0 ? {} : { folder: folder === "root" ? folder : mediaFolderId(folder, "--folder") }
  });
}, true);
var handleMediaShow = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  if (!id)
    throw usageError("media show requires an id.");
  return simpleGet(args, runtime, resolved, "/api/media/".concat(id), "Media");
}, true);
var handleSelectorPreview = commandHandler(async (args, runtime, resolved) => {
  const file = args.positionals[2];
  if (!file)
    throw usageError("media selector-preview requires <selector.json> and --primitive image|video.");
  const selector = await readAuthoringJson(file, runtime);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const rect = flagString(args.flags, "rect");
  let rectBody;
  if (rect !== void 0) {
    const match = /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/.exec(rect);
    if (!match || Number(match[1]) <= 0 || Number(match[2]) <= 0)
      throw usageError("media selector-preview --rect takes WIDTHxHEIGHT, both above 0, for example 1080x1920.");
    rectBody = { width: Number(match[1]), height: Number(match[2]) };
  }
  const timezone = flagString(args.flags, "timezone");
  const response = await client.call({ method: "POST", path: "/api/selectors/preview", body: { primitive: flagString(args.flags, "primitive"), selector, ...rectBody ? { rect: rectBody } : {}, ...timezone === void 0 ? {} : { timezone } } });
  const preview = response.body;
  const shares = (preview.candidates ?? []).filter((item) => item.share_percent !== void 0).map((item) => "".concat(item.share_percent, "%	").concat(item.filename, "	").concat(item.media_id));
  const left = (preview.excluded ?? []).map((item) => "left out (".concat(item.reason, ")	").concat(item.filename, "	").concat(item.media_id));
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [JSON.stringify(response.body, null, 2), ...shares.length > 0 ? ["Expected shares (one cycle is ".concat(preview.cycle, " plays):"), ...shares] : [], ...left].join("\n")
  };
}, true);
var handleMediaUpdate = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  return mediaUpdate(args, client);
}, true);
var handleMediaDownload = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  return loggerOf(runtime).withLocal({ op: "media.download", message: "media download" }, () => mediaDownload(args, runtime, client));
}, true);
var handleMediaDelete = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const id = args.positionals[2];
  const revision2 = flagString(args.flags, "expect-rev");
  if (!id)
    throw usageError("media delete requires <id>.");
  const response = await client.call({
    method: "DELETE",
    path: "/api/media/".concat(id),
    idempotent: true,
    headers: revision2 ? { "if-match": quotedRevision(revision2) } : void 0
  });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Deleted media ".concat(id) };
}, true);
async function uploadFolderFromArgs(args, client) {
  const folder = flagString(args.flags, "folder");
  if (folder === void 0)
    return void 0;
  const id = mediaFolderId(folder, "--folder");
  await client.call({ method: "GET", path: "/api/media-folders/".concat(id) });
  return id;
}
var handleMediaFolderList = commandHandler(async (args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/media-folders", "Media folders", libraryQuery(args)), true);
var handleMediaFolderShow = commandHandler(async (args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/media-folders/".concat(mediaFolderId(args.positionals[3], "media folder show <id>")), "Media folder"), true);
var handleMediaFolderCreate = commandHandler(async (args, runtime, resolved) => {
  const parent = flagString(args.flags, "parent");
  const body = { name: flagString(args.flags, "name") };
  if (parent !== void 0)
    body.parent_id = mediaFolderId(parent, "--parent");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "POST", path: "/api/media-folders", idempotent: true, body });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Created media folder ".concat(response.body.id) };
}, true);
var handleMediaFolderUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = mediaFolderId(args.positionals[3], "media folder update <id>");
  const name = flagString(args.flags, "name");
  const parent = flagString(args.flags, "parent");
  const root = flagBool(args.flags, "root");
  const revision2 = flagString(args.flags, "expect-rev");
  if (name === void 0 && parent === void 0 && !root) {
    throw usageError("media folder update requires --name NAME, --parent ID, or --root.");
  }
  const body = {};
  if (name !== void 0)
    body.name = name;
  if (parent !== void 0)
    body.parent_id = mediaFolderId(parent, "--parent");
  if (root)
    body.parent_id = null;
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: "PATCH",
    path: "/api/media-folders/".concat(id),
    idempotent: true,
    body,
    headers: revision2 ? { "if-match": quotedRevision(revision2) } : void 0
  });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Updated media folder ".concat(id) };
}, true);
var handleMediaFolderDelete = commandHandler(async (args, runtime, resolved) => {
  const id = mediaFolderId(args.positionals[3], "media folder delete <id>");
  const revision2 = flagString(args.flags, "expect-rev");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: "DELETE",
    path: "/api/media-folders/".concat(id),
    idempotent: true,
    headers: revision2 ? { "if-match": quotedRevision(revision2) } : void 0
  });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Deleted media folder ".concat(id, "; its contents moved up one level") };
}, true);
var handleMediaMove = commandHandler(async (args, runtime, resolved) => {
  const destination = flagString(args.flags, "folder");
  const toRoot = flagBool(args.flags, "root");
  if (destination === void 0 === !toRoot)
    throw usageError("media move requires exactly one of --folder ID or --root.");
  const media_ids = [];
  const folder_ids = [];
  for (const id of args.positionals.slice(2)) {
    if (MEDIA_FOLDER_ID_PATTERN.test(id))
      folder_ids.push(id);
    else if (MEDIA_ID_PATTERN.test(id))
      media_ids.push(id);
    else
      throw usageError("media move takes media IDs (med_...) and folder IDs (mfd_...), not ".concat(JSON.stringify(id), "."));
  }
  if (!media_ids.length && !folder_ids.length)
    throw usageError("media move requires at least one media or folder ID.");
  const body = {
    folder_id: destination === void 0 ? null : mediaFolderId(destination, "--folder"),
    ...media_ids.length ? { media_ids } : {},
    ...folder_ids.length ? { folder_ids } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "POST", path: "/api/media/move", idempotent: true, body });
  const moved = response.body;
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Moved ".concat(moved.media, " files and ").concat(moved.folders, " folders") };
}, true);
var handleMediaGenerate = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  return loggerOf(runtime).withLocal({ op: "media.generate", message: "media generate" }, () => mediaGenerate(args, runtime, client, resolved));
}, true);
var handleMediaUpload = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  return loggerOf(runtime).withLocal({ op: "media.upload", message: "media upload" }, () => mediaUpload(args, runtime, client));
}, true);
var handleMediaUploadBatch = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  return mediaUploadBatch(args, runtime, client, resolved);
}, true);
var GENERATE_ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"];
var GENERATE_QUALITIES = ["low", "medium", "high"];
var GENERATE_PROMPT_MAX = 4e3;
var GENERATE_WAIT_MS = 18e4;
var GENERATE_TYPICAL_SECONDS = {
  low: 15,
  medium: 35,
  high: 80
};
function isGenerateAspectRatio(value) {
  return GENERATE_ASPECT_RATIOS.includes(value);
}
function isGenerateQuality(value) {
  return GENERATE_QUALITIES.includes(value);
}
function mediaGenerationFromBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw unexpectedResponseError("Media generation response does not match the MediaGeneration contract.");
  }
  const rec = body;
  const media = rec.media;
  const usage = rec.usage;
  if (!media || typeof media !== "object" || Array.isArray(media)) {
    throw unexpectedResponseError("Media generation response does not match the MediaGeneration contract.");
  }
  const id = media.id;
  if (typeof id !== "string" || !isResourceID(id, "media")) {
    throw unexpectedResponseError("Media generation response is missing a med_\u2026 media id.");
  }
  if (!usage || typeof usage !== "object" || Array.isArray(usage)) {
    throw unexpectedResponseError("Media generation response does not match the MediaGeneration contract.");
  }
  const credits = usage.credits;
  const usd = usage.usd;
  if (typeof credits !== "number" || !Number.isInteger(credits) || credits < 1) {
    throw unexpectedResponseError("Media generation response does not match the MediaGeneration contract.");
  }
  if (typeof usd !== "string" || usd.length < 1) {
    throw unexpectedResponseError("Media generation response does not match the MediaGeneration contract.");
  }
  return {
    media,
    usage
  };
}
function unusableGenerateAnswer(error, tag) {
  if (!(error instanceof CliError) || error.problem.code !== "unexpected_response")
    return error;
  const listCommand = tag ? "screenrig media list --tag ".concat(tag) : "screenrig media list --primitive image";
  return new CliError({
    ...error.problem,
    hint: "The server's answer did not describe a generated still, so it is unknown whether one was created. Check ".concat(listCommand, " before generating again; if no new still is there, create the image with your own tools and add it with screenrig media upload, and report the request_id with screenrig feedback bug."),
    next: { command: listCommand, reason: "Lists this project's stills, newest first, so you can see whether the generation produced one." }
  }, error.exitCode, error.warnings);
}
function ambiguousGenerateError(error, options) {
  if (!(error instanceof CliError))
    return error;
  if (error.problem.code !== "timeout" && error.problem.code !== "transport_error")
    return error;
  const seconds = Math.round(options.elapsedMs / 1e3);
  const listCommand = options.tag ? "screenrig media list --tag ".concat(options.tag) : "screenrig media list --primitive image";
  return new CliError(makeProblem(error.problem.code, error.problem.title, error.problem.status, "media generate did not return a result after ".concat(seconds, " s. The still may or may not have been created, and a created still is billed. ") + "Re-run the identical media generate command: it retries with the same idempotency key, so a still that was created is returned instead of generating and billing a second one.", {
    request_id: error.problem.request_id,
    hint: "Run the identical media generate command again, unchanged: a still that was already created is returned and not billed twice. Changing the prompt or options starts a new, separately billed generation.",
    next: {
      command: listCommand,
      reason: "Lists this project's stills, newest first, so you can see whether the generation completed before you re-run it."
    }
  }), error.exitCode, error.warnings);
}
function writeGenerateNotice(args, runtime, quality) {
  if (flagBool(args.flags, "no-progress"))
    return;
  const seconds = GENERATE_TYPICAL_SECONDS[quality];
  if (!flagBool(args.flags, "human")) {
    runtime.stderr.write("".concat(JSON.stringify({
      event: "media_generate_started",
      quality,
      typical_seconds: seconds,
      timeout_ms: GENERATE_WAIT_MS
    }), "\n"));
    return;
  }
  runtime.stderr.write("screenrig: media generate waits until the still is ready; ".concat(quality, " quality usually takes about ").concat(seconds, " s.\n"));
}
async function mediaGenerate(args, runtime, client, resolved) {
  requireFlagValue(args, "prompt", '"Finished event poster with title, facts, and type in the image"');
  requireFlagValue(args, "aspect-ratio", "16:9");
  requireFlagValue(args, "quality", "medium");
  const promptFile = flagString(args.flags, "prompt-file");
  const prompt = promptFile ? await readAuthoringText(promptFile, runtime, GENERATE_PROMPT_MAX * 4) : flagString(args.flags, "prompt");
  if (prompt === void 0 || prompt.length < 1 || prompt.length > GENERATE_PROMPT_MAX) {
    throw usageError("media generate requires --prompt TEXT or --prompt-file FILE containing 1 to 4000 characters.");
  }
  const aspectRatio = flagString(args.flags, "aspect-ratio") ?? "16:9";
  if (!isGenerateAspectRatio(aspectRatio)) {
    throw usageError("--aspect-ratio must be 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, or 2:3.");
  }
  const quality = flagString(args.flags, "quality") ?? "medium";
  if (!isGenerateQuality(quality)) {
    throw usageError("--quality must be low, medium, or high.");
  }
  const tag = mediaTagFromArgs(args);
  const body = {
    prompt,
    aspect_ratio: aspectRatio,
    quality,
    ...tag ? { tag } : {}
  };
  const waitMs = flagNumber(args.flags, "timeout") ?? GENERATE_WAIT_MS;
  const retry = await generateRetryState({
    resolved,
    runtime,
    requestHash: generateRequestHash(body),
    ...flagString(args.flags, "idempotency-key") ? { requestedKey: flagString(args.flags, "idempotency-key") } : {}
  });
  writeGenerateNotice(args, runtime, quality);
  const startedAt = runtime.now().getTime();
  let response;
  try {
    response = await client.call({
      method: "POST",
      path: "/api/media/generations",
      idempotent: true,
      idempotencyKey: retry.state.idempotency_key,
      body
    });
  } catch (error) {
    const ambiguous = ambiguousGenerateError(error, {
      elapsedMs: runtime.now().getTime() - startedAt,
      ...tag ? { tag } : {}
    });
    if (ambiguous === error) {
      await clearGenerateRetryState(resolved, runtime, retry.state.idempotency_key);
    }
    throw unusableGenerateAnswer(ambiguous, tag);
  }
  let generated;
  let operationId;
  try {
    if (response.status === 202) {
      const accepted = acceptedGenerationOperation(response.body);
      operationId = accepted;
      const operation = await client.waitForOperation(accepted, {
        timeoutMs: waitMs,
        pollMs: flagNumber(args.flags, "poll-ms") ?? 1e3,
        sleep: runtime.sleep
      });
      generated = mediaGenerationFromBody({ media: { id: operation.result?.media_id }, usage: operation.result?.usage });
      generated = { ...generated, media: await generatedMedia(client, generated.media.id) };
    } else {
      throw unexpectedResponseError("media generate expected HTTP 202 with an operation and got HTTP ".concat(response.status, "."), response.headers["x-request-id"] ?? client.requestId);
    }
  } catch (error) {
    if (!(error instanceof CliError && (error.problem.code === "timeout" || error.problem.code === "transport_error") && operationId !== void 0)) {
      await clearGenerateRetryState(resolved, runtime, retry.state.idempotency_key);
    }
    throw unusableGenerateAnswer(waitingForGeneration(error, operationId), tag);
  }
  const elapsedMs = runtime.now().getTime() - startedAt;
  const mediaId = generated.media.id;
  await clearGenerateRetryState(resolved, runtime, retry.state.idempotency_key);
  return {
    envelope: successEnvelope({ media: generated.media, usage: generated.usage, id: mediaId, media_id: mediaId, elapsed_ms: elapsedMs }, {
      request_id: client.requestId,
      ...operationId ? { operation_id: operationId } : {},
      warnings: response.headers.warning ? [{ code: "server_warning", message: response.headers.warning }] : []
    }),
    exitCode: ExitCode.Success,
    human: humanLines("Generated media", [
      ["media_id", mediaId],
      ["quality", generated.usage.quality ?? quality],
      ["credits", String(generated.usage.credits)],
      ["usd", generated.usage.usd],
      ["elapsed_ms", String(elapsedMs)]
    ])
  };
}
function acceptedGenerationOperation(body) {
  const id = body && typeof body === "object" ? body.id : void 0;
  if (typeof id !== "string" || !/^(?:(?:stage|qa|development)_)?op_[A-Za-z0-9_-]+$/.test(id)) {
    throw unexpectedResponseError("media generate expected an op_\u2026 operation id in the HTTP 202 answer.");
  }
  return id;
}
async function generatedMedia(client, mediaId) {
  try {
    const response = await client.call({ method: "GET", path: "/api/media/".concat(mediaId) });
    return response.body;
  } catch {
    return { id: mediaId };
  }
}
function waitingForGeneration(error, operationId) {
  if (operationId === void 0 || !(error instanceof CliError))
    return error;
  if (error.problem.code !== "timeout" && error.problem.code !== "transport_error")
    return error;
  return new CliError({
    ...error.problem,
    hint: "".concat(error.problem.hint ?? "", " Or rerun the identical media generate command: it resumes operation ").concat(operationId, " under the same idempotency key and never bills a second still.").trim()
  }, error.exitCode, error.warnings);
}
async function mediaUpdate(args, client) {
  const id = args.positionals[2];
  const revision2 = flagString(args.flags, "expect-rev");
  const clearTag = flagBool(args.flags, "clear-tag");
  const tag = mediaTagFromArgs(args);
  if (!id) {
    throw usageError("media update requires <id> and --tag TAG, --tags TAG1,TAG2, or --clear-tag.");
  }
  if ([clearTag, Boolean(tag), flagString(args.flags, "tags") !== void 0].filter(Boolean).length !== 1) {
    throw usageError("media update requires exactly one of --tag TAG, --tags TAG1,TAG2, or --clear-tag.");
  }
  const tagsFlag = flagString(args.flags, "tags");
  const tags = tagsFlag?.split(",");
  if (tags !== void 0 && (tags.length > 32 || new Set(tags).size !== tags.length || tags.some((value) => !/^[A-Za-z0-9]{1,32}$/.test(value))))
    throw usageError("--tags requires 1 through 32 unique alphanumeric tags separated by commas; use --clear-tag to clear the set.");
  const body = tags === void 0 ? { tag: clearTag ? null : tag ?? null } : { tags };
  const response = await client.call({
    method: "PATCH",
    path: "/api/media/".concat(id),
    idempotent: true,
    headers: revision2 ? { "if-match": quotedRevision(revision2) } : void 0,
    body
  });
  const done = clearTag ? "Cleared tags on media ".concat(id) : "Replaced tags on media ".concat(id);
  if (response.body?.review_state === "pending")
    return mediaReviewPendingResult(response, client.requestId, done);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: done
  };
}
var MEDIA_AVAILABILITY_KEYS = ["from", "until", "windows", "monthly", "dates", "except"];
function mediaAvailabilityRule(parsed, file) {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw usageError("".concat(file, ' must hold one JSON object, for example {"from": "2026-11-27T00:00", "until": "2026-11-30T00:00"}.'));
  }
  const rule = parsed;
  const keys = Object.keys(rule);
  if (keys.length === 0) {
    throw usageError("".concat(file, " holds an empty rule. Give at least one of ").concat(MEDIA_AVAILABILITY_KEYS.join(", "), ", or use --clear to make the file always available."));
  }
  for (const key of keys) {
    if (key === "data" || key === "interaction") {
      throw usageError('An availability rule says when a file may play, not what plays: remove "'.concat(key, '" from ').concat(file, "."));
    }
    if (!MEDIA_AVAILABILITY_KEYS.includes(key)) {
      throw usageError("".concat(file, ' has "').concat(key, '", which an availability rule does not take. Use ').concat(MEDIA_AVAILABILITY_KEYS.join(", "), "."));
    }
  }
  return rule;
}
var handleMediaAvailability = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  const file = flagString(args.flags, "file");
  const clear = flagBool(args.flags, "clear");
  if (!id)
    throw usageError("media availability requires <id> and exactly one of --file RULE.json or --clear.");
  if (!MEDIA_ID_PATTERN.test(id))
    throw usageError("media availability takes a media ID (med_...), not ".concat(JSON.stringify(id), "; media list shows them."));
  if (file === void 0 === !clear)
    throw usageError("media availability requires exactly one of --file RULE.json (or - for stdin) or --clear.");
  const rule = file === void 0 ? null : mediaAvailabilityRule(await readAuthoringJson(file, runtime), file);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let revision2 = flagString(args.flags, "expect-rev");
  if (revision2 === void 0) {
    const current = await client.call({ method: "GET", path: "/api/media/".concat(id) });
    const value = current.body?.revision;
    if (typeof value !== "number")
      throw usageError("Media ".concat(id, " returned no revision; add --expect-rev REVISION."));
    revision2 = String(value);
  }
  const response = await client.call({
    method: "PATCH",
    path: "/api/media/".concat(id, "/availability"),
    idempotent: true,
    headers: { "if-match": quotedRevision(revision2) },
    body: { availability: rule }
  });
  const done = rule === null ? "Cleared availability on media ".concat(id, ": the file is always available to dynamic selectors") : "Set availability on media ".concat(id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: "".concat(done, "\n").concat(JSON.stringify(response.body, null, 2))
  };
}, true);
var MEDIA_REVIEW_PENDING_SENTENCE = "Screens keep playing what was approved until a person approves this change. Its review appears in screenrig reviews list within seconds; a change that alters no approved playlist or open proposal applies without one. Do not repeat the write.";
function mediaReviewPendingResult(response, requestId, done) {
  const next = { command: "screenrig reviews list", argv: ["reviews", "list"], reason: "Find this media's review and give the person its URL." };
  return {
    envelope: jsonBody(response, requestId, { next }, [{ code: "media_review_pending", message: "Waiting for a person to approve this media change; its review appears in screenrig reviews list within seconds." }]),
    exitCode: ExitCode.Success,
    human: [done, "review_state: pending", MEDIA_REVIEW_PENDING_SENTENCE, "next: ".concat(next.command)].join("\n")
  };
}
var MEDIA_ID_PATTERN = RESOURCE_ID_PATTERNS.media;
var MEDIA_CONTENT_EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "audio/mpeg": "mp3"
};
function mediaRecordFromBody(body, id) {
  const rec = body ?? {};
  if (rec.id !== id || typeof rec.content_type !== "string" || typeof rec.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(rec.sha256) || typeof rec.bytes !== "number" || !Number.isInteger(rec.bytes) || rec.bytes < 1) {
    throw usageError("Media ".concat(id, " metadata does not match the Media contract; cannot verify a download."));
  }
  return rec;
}
async function mediaDownload(args, runtime, client) {
  const id = args.positionals[2];
  if (!id || !MEDIA_ID_PATTERN.test(id)) {
    throw usageError("media download requires <id> starting with med_.");
  }
  const metadataResponse = await client.call({ method: "GET", path: "/api/media/".concat(id) });
  const media = mediaRecordFromBody(metadataResponse.body, id);
  const extension = MEDIA_CONTENT_EXTENSIONS[media.content_type.toLowerCase()];
  if (!extension) {
    throw usageError("Media ".concat(id, " has content type ").concat(media.content_type, ", which this CLI cannot write."));
  }
  const outputPath = await resolveDownloadOutput(runtime.cwd(), "./".concat(id, ".").concat(extension), args.flags);
  const response = await client.download({ method: "GET", path: "/api/media/".concat(id, "/content") });
  let temp;
  let digest = "";
  let written = 0;
  try {
    const contentType = (response.headers["content-type"] ?? "").split(";", 1)[0]?.trim().toLowerCase();
    if (contentType !== media.content_type.toLowerCase()) {
      throw usageError("Media ".concat(id, " download Content-Type did not match its metadata."));
    }
    const reportedLength = response.headers["content-length"];
    if (reportedLength !== void 0 && reportedLength !== String(media.bytes)) {
      throw usageError("Media ".concat(id, " download Content-Length did not match its metadata."));
    }
    if (!response.body) {
      throw usageError("Media ".concat(id, " download returned no body."));
    }
    const hash = createHash3("sha256");
    temp = await openTempFile(outputPath);
    const handle = temp.handle;
    try {
      for await (const chunk of response.body) {
        written += chunk.byteLength;
        if (written > media.bytes) {
          throw usageError("Media ".concat(id, " download exceeded the declared length."));
        }
        let offset = 0;
        while (offset < chunk.byteLength) {
          const result = await handle.write(chunk, offset, chunk.byteLength - offset);
          offset += result.bytesWritten;
        }
        hash.update(chunk);
      }
      await handle.sync();
    } finally {
      await handle.close();
    }
    if (written !== media.bytes) {
      throw usageError("Media ".concat(id, " download ended before the declared length."));
    }
    digest = hash.digest("hex");
    if (digest !== media.sha256) {
      throw usageError("Media ".concat(id, " download SHA-256 did not match its metadata."));
    }
    await rename2(temp.path, outputPath);
  } catch (error) {
    if (temp)
      await rm2(temp.path, { force: true });
    if (error instanceof CliError) {
      throw error;
    }
    throw usageError("Cannot write the media download to the output path.");
  } finally {
    temp?.release();
    await response.body?.cancel?.();
  }
  const data = {
    media_id: id,
    id,
    path: outputPath,
    bytes: written,
    sha256: digest,
    content_type: media.content_type,
    primitive: media.primitive,
    filename: media.filename,
    ...typeof media.source_filename === "string" ? { source_filename: media.source_filename } : {},
    ...typeof media.width === "number" ? { width: media.width } : {},
    ...typeof media.height === "number" ? { height: media.height } : {}
  };
  return {
    envelope: successEnvelope(data, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: humanLines("Media downloaded", [
      ["media_id", id],
      ["path", outputPath],
      ["bytes", String(written)],
      ["sha256", digest],
      ["content_type", media.content_type],
      ["filename", media.filename],
      ["source_filename", media.source_filename],
      ["size", typeof media.width === "number" && typeof media.height === "number" ? "".concat(media.width, "x").concat(media.height) : void 0]
    ])
  };
}
async function mediaUpload(args, runtime, client) {
  const file = args.positionals[2];
  if (!file)
    throw usageError("media upload requires a file.");
  const sourcePath = path4.resolve(runtime.cwd(), file);
  await requireInputFile(sourcePath, file);
  const explicitContentType = flagString(args.flags, "content-type");
  const transcodeOptions = transcodeOptionsFromArgs(args);
  const folderId = await uploadFolderFromArgs(args, client);
  const uploaded = await uploadMediaFile({
    runtime,
    client,
    sourcePath,
    explicitContentType,
    tag: mediaTagFromArgs(args),
    ...folderId ? { folderId } : {},
    transcodeOptions,
    noTranscode: flagBool(args.flags, "no-transcode"),
    reporter: progressReporterFor(args, runtime),
    noWait: flagBool(args.flags, "no-wait"),
    timeoutMs: flagNumber(args.flags, "timeout") ?? 12e4,
    pollMs: flagNumber(args.flags, "poll-ms") ?? 1e3,
    resumable: flagString(args.flags, "idempotency-key") !== void 0
  });
  const mediaId = uploaded.mediaId;
  const data = {
    ...mediaId ? { media_id: mediaId, id: mediaId } : {},
    ...folderId ? { folder_id: folderId } : {},
    operation: uploaded.operation,
    reused: uploaded.reused,
    upload: uploaded.upload,
    transcode: uploaded.transcode,
    timing: uploaded.timing
  };
  return {
    envelope: successEnvelope(data, {
      request_id: client.requestId,
      operation_id: uploaded.operation.id,
      warnings: uploaded.warnings
    }),
    exitCode: ExitCode.Success,
    human: humanLines(uploaded.reused ? "Media already uploaded" : flagBool(args.flags, "no-wait") ? "Media upload committed" : "Media uploaded", [
      ["media_id", mediaId],
      ["operation_id", uploaded.operation.id],
      ["state", uploaded.operation.state],
      ["filename", uploaded.upload.filename],
      ["source_filename", uploaded.upload.source_filename],
      ["content_type", uploaded.upload.content_type],
      ["tag", uploaded.upload.tag],
      ["folder_id", folderId],
      ["transcode", typeof uploaded.transcode.duration_ms === "number" ? "".concat(uploaded.transcode.reason, " in ").concat(uploaded.transcode.duration_ms, " ms") : "skipped"],
      ["sha256", uploaded.upload.sha256],
      ["timing", Object.entries(uploaded.timing).map(([stage, ms]) => "".concat(stage.replace(/_ms$/, ""), " ").concat(ms, " ms")).join(", ")],
      ...uploaded.warnings.map((warning) => ["warning", warning.message])
    ])
  };
}
async function mediaUploadBatch(args, runtime, client, resolved) {
  const manifest = args.positionals[2];
  if (!manifest) {
    throw usageError("media upload-batch requires one manifest JSON file.");
  }
  requireFlagValue(args, "state", "./upload-state.json");
  requireFlagValue(args, "concurrency", "4");
  const state = flagString(args.flags, "state") ?? path4.join(path4.dirname(resolved.configPath), "upload-batches", createHash3("sha256").update(JSON.stringify([resolved.apiUrl, resolved.projectId ?? resolved.token, path4.resolve(runtime.cwd(), manifest)])).digest("hex") + ".json");
  const concurrency = flagNumber(args.flags, "concurrency") ?? UPLOAD_BATCH_DEFAULT_CONCURRENCY;
  if (!Number.isInteger(concurrency) || concurrency < UPLOAD_BATCH_MIN_CONCURRENCY || concurrency > UPLOAD_BATCH_MAX_CONCURRENCY) {
    throw usageError("--concurrency must be a whole number from ".concat(UPLOAD_BATCH_MIN_CONCURRENCY, " to ").concat(UPLOAD_BATCH_MAX_CONCURRENCY, "."));
  }
  const transcodeOptions = transcodeOptionsFromArgs(args);
  const folderId = await uploadFolderFromArgs(args, client);
  const result = await runMediaUploadBatch({
    runtime,
    client,
    manifestPath: path4.resolve(runtime.cwd(), manifest),
    statePath: path4.resolve(runtime.cwd(), state),
    apiUrl: resolved.apiUrl,
    projectId: resolved.projectId,
    concurrency,
    defaultTag: mediaTagFromArgs(args),
    ...folderId ? { folderId } : {},
    transcodeOptions,
    noTranscode: flagBool(args.flags, "no-transcode"),
    reporter: progressReporterFor(args, runtime),
    json: !flagBool(args.flags, "human"),
    noProgress: flagBool(args.flags, "no-progress"),
    timeoutMs: flagNumber(args.flags, "timeout") ?? 12e4,
    pollMs: flagNumber(args.flags, "poll-ms") ?? 1e3
  });
  return {
    envelope: successEnvelope(folderId ? { ...result.data, folder_id: folderId } : result.data, {
      request_id: client.requestId,
      warnings: result.warnings
    }),
    exitCode: result.exitCode,
    human: result.human
  };
}

// dist/media-sync.js
var ACCOUNTS_PATH = "/api/media-sync-accounts";
var SYNCS_PATH = "/api/media-syncs";
var DROPBOX_CALLBACK_PATH = "/api/dropbox/callback";
var MEDIA_SYNC_ACCOUNT_ID_PATTERN = /^(?:(?:stage|qa|development)_)?msa_[A-Za-z0-9_-]+$/;
var MEDIA_SYNC_ID_PATTERN = /^(?:(?:stage|qa|development)_)?msy_[A-Za-z0-9_-]+$/;
var MEDIA_FOLDER_ID_PATTERN2 = /^(?:(?:stage|qa|development)_)?mfd_[A-Za-z0-9]{1,64}$/;
var GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var TENANT_DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
var DROPBOX_APP_KEY_PATTERN = /^[A-Za-z0-9]{1,64}$/;
var DRIVE_FOLDER_ID_PATTERN = /^[A-Za-z0-9_-]{1,4096}$/;
var MEDIA_SYNC_EVERY_MIN_S = 300;
var MEDIA_SYNC_EVERY_MAX_S = 86400;
var SECRET_FILE_MAX_BYTES = 8192;
var KEY_FILE_MAX_CHARACTERS = 8192;
var NAME_MAX = 80;
var URL_MAX = 4096;
function mediaSyncAccountId(value, command) {
  if (!value)
    throw usageError("media sync account ".concat(command, " requires <id>."));
  if (!MEDIA_SYNC_ACCOUNT_ID_PATTERN.test(value)) {
    throw usageError("An account id looks like msa_ followed by letters, digits, - or _.", {
      command: "screenrig media sync account list",
      reason: "List this project's media sync accounts and their ids."
    });
  }
  return value;
}
function mediaSyncId(value, command) {
  if (!value)
    throw usageError("media sync ".concat(command, " requires <id>."));
  if (!MEDIA_SYNC_ID_PATTERN.test(value)) {
    throw usageError("A sync id looks like msy_ followed by letters, digits, - or _.", {
      command: "screenrig media sync list",
      reason: "List this project's media syncs and their ids."
    });
  }
  return value;
}
function mediaSyncAccountOption(value) {
  if (!MEDIA_SYNC_ACCOUNT_ID_PATTERN.test(value)) {
    throw usageError("--account-id takes a media sync account id (msa_\u2026).", {
      command: "screenrig media sync account list",
      reason: "List this project's media sync accounts and their ids."
    });
  }
  return value;
}
function mediaSyncFolderOption(value) {
  if (!MEDIA_FOLDER_ID_PATTERN2.test(value)) {
    throw usageError("--folder-id takes a media folder id (mfd_\u2026).", { command: "screenrig media folder list", reason: "List this project's media folders and their ids." });
  }
  return value;
}
function mediaSyncName(value) {
  const trimmed = value.trim();
  if (!trimmed || [...trimmed].length > NAME_MAX || /[\p{Cc}\p{Cf}]/u.test(value)) {
    throw usageError("--name must contain 1 to ".concat(NAME_MAX, " characters without controls."));
  }
  return trimmed;
}
function mediaSyncTenant(value) {
  const tenant = value.trim();
  if (["common", "organizations", "consumers"].includes(tenant.toLowerCase())) {
    throw usageError("--tenant-id must be your organization's own tenant: its directory id or primary domain, not common, organizations or consumers.");
  }
  if (!GUID_PATTERN.test(tenant) && !TENANT_DOMAIN_PATTERN.test(tenant)) {
    throw usageError("--tenant-id takes the tenant's directory id (a GUID) or its primary domain, such as contoso.onmicrosoft.com.");
  }
  return tenant;
}
function mediaSyncClientId(value) {
  const client = value.trim();
  if (!GUID_PATTERN.test(client))
    throw usageError("--client-id takes the app registration's application (client) id, a GUID.");
  return client;
}
function isHttpsAddress(text) {
  let address;
  try {
    address = new URL(text);
  } catch {
    address = void 0;
  }
  return address !== void 0 && address.protocol === "https:" && [...text].length <= URL_MAX && !/[\p{Cc}]/u.test(text);
}
function mediaSyncUrl(value) {
  const text = value.trim();
  if (!isHttpsAddress(text))
    throw usageError("--url takes the https address of a SharePoint folder, or its sharing link (Share \u2192 Copy link).");
  return text;
}
function mediaSyncDropboxUrl(value) {
  const text = value.trim();
  const path5 = text.startsWith("/") && [...text].length <= URL_MAX && !/[\p{Cc}]/u.test(text);
  if (!path5 && !isHttpsAddress(text)) {
    throw usageError("--url takes the folder's address in Dropbox (https://www.dropbox.com/home/...), a shared folder link the connected account has added to its Dropbox, or a path that starts with /.");
  }
  return text;
}
function mediaSyncDriveUrl(value) {
  const text = value.trim();
  if (!isHttpsAddress(text) && !DRIVE_FOLDER_ID_PATTERN.test(text)) {
    throw usageError("--url takes the Google Drive folder's address (https://drive.google.com/drive/folders/ID) or its id.");
  }
  return text;
}
function mediaSyncAppKey(value) {
  const key = value.trim();
  if (!DROPBOX_APP_KEY_PATTERN.test(key)) {
    throw usageError("--app-key takes the app key of your own Dropbox app: 1 to 64 letters and digits, shown on its page in the Dropbox App Console.");
  }
  return key;
}
function mediaSyncEvery(value) {
  const text = value.trim();
  const seconds = /^\d+$/.test(text) ? Number(text) : (snoozeDurationMs(text) ?? Number.NaN) / 1e3;
  if (!Number.isInteger(seconds) || seconds < MEDIA_SYNC_EVERY_MIN_S || seconds > MEDIA_SYNC_EVERY_MAX_S) {
    throw usageError("--every takes a duration from 5 minutes to 24 hours, such as 15m, 1h or 6h (or plain seconds, 300 to 86400).");
  }
  return String(seconds);
}
async function readSecret(file, runtime) {
  const text = (await readAuthoringText(file, runtime, SECRET_FILE_MAX_BYTES)).trim();
  const where = file === "-" ? "stdin" : file;
  if (!text)
    throw usageError("".concat(where, " holds no secret."));
  if (/\s/.test(text))
    throw usageError("".concat(where, " must hold only the client secret's value: one value without spaces or line breaks."));
  return text;
}
function mediaSyncProblem(error, id) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  if (problem.next)
    return error;
  const withNext = (command, reason) => new CliError({ ...problem, next: { command, reason } }, error.exitCode, error.warnings);
  const account = id !== void 0 && MEDIA_SYNC_ACCOUNT_ID_PATTERN.test(id);
  if (problem.code === "media_sync_source_refused") {
    return withNext(account ? "screenrig media sync account test ".concat(id) : "screenrig media sync account list", "Fix what the detail says, then test the account and run the command again. Microsoft: the app's Sites.Selected grant on the site, or Files.Read.All, with admin consent, and a current client secret. Dropbox: the connected person must be able to open the folder, and a shared folder link must already be added to their Dropbox. Google Drive: share the folder with the account's service_account_email (Viewer is enough).");
  }
  if (problem.code === "media_sync_source_unavailable") {
    return withNext("screenrig media sync list", "The provider could not be reached. Nothing was changed; run the same command again in a moment.");
  }
  if (problem.code === "dropbox_reconnect_required") {
    return withNext(account ? "screenrig media sync account connect ".concat(id) : "screenrig media sync account list", "Dropbox no longer honors the account's connection. Make a new link and send it to the person who owns the Dropbox account; they open it signed in to Dropbox. Then run media sync account show until its state is ready.");
  }
  if (problem.code === "dropbox_not_configured") {
    return withNext("screenrig media sync account add dropbox --help", "This server has no screenRIG Dropbox app, so a Dropbox account needs the app key of your own Dropbox app: media sync account add dropbox --name NAME --app-key KEY.");
  }
  if (problem.code === "google_drive_not_configured") {
    return withNext("screenrig media sync account add google-drive --help", "This server has no screenRIG service account, so a Google Drive account needs the JSON key of your own Google Cloud service account: media sync account add google-drive --name NAME --key-file FILE.");
  }
  if (problem.code === "media_sync_sharer_not_member") {
    return withNext(account ? "screenrig media sync account show ".concat(id) : "screenrig media sync account list", "Share the folder with the account's service_account_email from the Google account of a member of this project whose email is verified, then create the sync again.");
  }
  if (problem.code === "resource_conflict" && account) {
    return withNext("screenrig media sync list", "Delete the syncs the detail names (media sync delete ID), then delete the account.");
  }
  if (problem.code === "revision_conflict" && id !== void 0) {
    return withNext(account ? "screenrig media sync account show ".concat(id) : "screenrig media sync show ".concat(id), "Read the current revision, then run the command again with --expect-rev REVISION if the change still applies.");
  }
  if (problem.code === "not_found" && id !== void 0) {
    return account ? withNext("screenrig media sync account list", "List this project's accounts and their ids. An account belongs to one project.") : withNext("screenrig media sync list", "List this project's syncs and their ids. A sync belongs to one project.");
  }
  return error;
}
async function syncCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw mediaSyncProblem(error, id);
  }
}
var dash = (value) => value && value.length ? value : "-";
function checkLines(checks) {
  return (checks ?? []).map((check) => "  ".concat(!check.ok ? "failed" : check.warn ? "warning" : "ok", " ").concat(check.name).concat(check.detail ? ": ".concat(check.detail) : ""));
}
var PROVIDER_NAMES = { microsoft365: "Microsoft", dropbox: "Dropbox", google_drive: "Google Drive" };
var providerName = (kind) => PROVIDER_NAMES[kind] ?? kind;
function dropboxPerson(account) {
  const config = account.config ?? {};
  if (!config.display_name && !config.email)
    return account.secret?.set ? "connected" : "not connected";
  return "".concat(config.display_name ?? config.email).concat(config.display_name && config.email ? " (".concat(config.email, ")") : "");
}
function accessLines(account) {
  const config = account.config ?? {};
  if (account.kind === "dropbox") {
    return [
      "dropbox account: ".concat(dropboxPerson(account)),
      "app: ".concat(config.app_key ? "your own Dropbox app (app key ".concat(config.app_key, ")") : "screenRIG's Dropbox app")
    ];
  }
  if (account.kind === "google_drive") {
    return [
      "service account: ".concat(dash(config.service_account_email)),
      "key: ".concat(account.secret?.set ? "your own service account key".concat(account.secret.hint ? " (ends ".concat(account.secret.hint, ")") : "") : "none of your own; the account reads through screenRIG's service account")
    ];
  }
  if (account.kind !== "microsoft365")
    return [];
  return config.connection_id ? ["connection: ".concat(config.connection_id, " (a Microsoft connection signs in; this account holds no secret)")] : [
    "tenant: ".concat(dash(config.tenant_id)),
    "client: ".concat(dash(config.client_id)),
    "secret: ".concat(account.secret?.set ? "set".concat(account.secret.hint ? " (ends ".concat(account.secret.hint, ")") : "") : "not set")
  ];
}
function accountLines(account) {
  if (!account)
    return [];
  const test = account.last_test;
  return [
    "id: ".concat(account.id),
    "name: ".concat(account.name),
    "kind: ".concat(account.kind),
    ...accessLines(account),
    "state: ".concat(account.state),
    "last test: ".concat(test ? "".concat(test.ok ? "ok" : "failed", " at ").concat(test.at) : "never"),
    ...test ? checkLines(test.checks) : [],
    "revision: ".concat(account.revision)
  ];
}
function connectHintLines(account) {
  if (account?.kind !== "dropbox")
    return [];
  if (account.state === "pending_consent") {
    return ["", "Waiting for the person who owns the Dropbox account to open the link: screenrig media sync account connect ".concat(account.id, " makes a new link to send them.")];
  }
  if (account.state === "reconnect_required") {
    return ["", "Dropbox no longer honors the connection: screenrig media sync account connect ".concat(account.id, " makes a new link for the person who owns the Dropbox account to open.")];
  }
  return [];
}
function dropboxRedirectUri(apiUrl) {
  return "".concat(new URL(apiUrl).origin).concat(DROPBOX_CALLBACK_PATH);
}
function consentLines(account, apiUrl, ownApp = false) {
  if (!account?.authorize_url)
    return [];
  const provider = providerName(account.kind);
  return [
    "",
    "Connect link, for the person who owns the ".concat(provider, " account. Send it to that person only, or open it yourself if that is you: it is the credential of one consent, and works once").concat(account.authorize_expires_at ? " until ".concat(account.authorize_expires_at) : "", "."),
    "authorize_url: ".concat(account.authorize_url),
    "",
    "They open it signed in to ".concat(provider).concat(account.kind === "dropbox" ? " and allow screenRIG read-only access to the files in that Dropbox (files.metadata.read, files.content.read, account_info.read, sharing.read)" : "", ". The CLI never opens a browser."),
    ...ownApp || account.config?.app_key ? ["This account goes through your own Dropbox app, which must list ".concat(dropboxRedirectUri(apiUrl), " as a redirect URI (Dropbox App Console, the app's Settings, OAuth 2) and have those permissions enabled.")] : [],
    "When they finish, screenrig media sync account show ".concat(account.id, " reads state ready. screenrig media sync account connect ").concat(account.id, " makes a new link, which replaces this one."),
    ...account.kind === "dropbox" ? ["Then: screenrig media sync create dropbox --account-id ".concat(account.id, " --url FOLDER")] : []
  ];
}
function consentWarnings(account, apiUrl, ownApp = false) {
  if (!account?.authorize_url)
    return [];
  const provider = providerName(account.kind);
  return [
    {
      code: "media_sync_consent_link",
      message: "data.authorize_url is the link of one consent: send it to the person who owns the ".concat(provider, " account, who opens it signed in to ").concat(provider).concat(account.authorize_expires_at ? " before ".concat(account.authorize_expires_at) : "", ". screenrig does not save it, and a read of the account never shows it. screenrig media sync account connect ").concat(account.id, " makes a new link, which replaces this one.")
    },
    ...ownApp || account.config?.app_key ? [{
      code: "media_sync_redirect_uri",
      message: "The account goes through your own Dropbox app, which must list ".concat(dropboxRedirectUri(apiUrl), " as a redirect URI and have files.metadata.read, files.content.read, account_info.read and sharing.read enabled.")
    }] : []
  ];
}
function driveShareLines(account) {
  const email = account?.config?.service_account_email;
  if (!account || !email)
    return [];
  return [
    "",
    "Share the Google Drive folder with ".concat(email, " (Viewer is enough)."),
    account.secret?.set ? "That is your own service account: a folder shared with it syncs." : "That is screenRIG's service account: a folder syncs through it only when a member of this project with a verified email shared it or owns it, so share it from that member's Google account.",
    "Then: screenrig media sync create google-drive --account-id ".concat(account.id, " --url FOLDER")
  ];
}
function driveShareWarnings(account) {
  const email = account?.config?.service_account_email;
  if (!account || !email)
    return [];
  return [{
    code: "media_sync_share_folder",
    message: "Share the Google Drive folder with ".concat(email, " (Viewer is enough), then run media sync create google-drive. ").concat(account.secret?.set ? "That is your own service account: a folder shared with it syncs." : "That is screenRIG's service account: a folder syncs through it only when a member of this project with a verified email shared it or owns it.")
  }];
}
function accountSubject(item) {
  const config = item.config ?? {};
  if (item.kind === "dropbox")
    return config.email ?? config.display_name ?? (item.secret?.set ? "connected" : "(not connected)");
  if (item.kind === "google_drive")
    return dash(config.service_account_email);
  return dash(config.tenant_id ?? config.connection_id);
}
function accountSecretCell(item) {
  if (item.kind === "dropbox")
    return "-";
  if (item.config?.connection_id)
    return "via connection";
  if (item.kind === "google_drive" && !item.secret?.set)
    return "screenRIG's";
  return item.secret?.set ? item.secret.hint ? "\u2026".concat(item.secret.hint) : "set" : "not set";
}
function accountTableLines(items) {
  if (!items.length)
    return ["No media sync accounts"];
  return table(["ID", "NAME", "KIND", "STATE", "ACCOUNT", "SECRET", "TEST"], items.map((item) => [
    item.id,
    item.name,
    item.kind,
    item.state,
    accountSubject(item),
    accountSecretCell(item),
    item.last_test ? item.last_test.ok ? "ok" : "failed" : "never"
  ]));
}
function everyText(seconds) {
  if (seconds % 3600 === 0)
    return "".concat(seconds / 3600, "h");
  if (seconds % 60 === 0)
    return "".concat(seconds / 60, "m");
  return "".concat(seconds, "s");
}
function runLines(run) {
  if (!run)
    return ["last run: not yet"];
  const counts = "".concat(run.added, " added, ").concat(run.updated, " replaced, ").concat(run.removed, " removed").concat(run.pending_delete ? ", ".concat(run.pending_delete, " held back") : "");
  const lines = ["last run: ".concat(run.status, " at ").concat(run.at, " (").concat(counts, ")")];
  if (run.error)
    lines.push("  ".concat(run.error.code, ": ").concat(run.error.detail));
  for (const skipped of run.skipped ?? [])
    lines.push("  skipped ".concat(skipped.name, " (").concat(skipped.reason, ")").concat(skipped.detail ? ": ".concat(skipped.detail) : ""));
  if (run.skipped_total > (run.skipped?.length ?? 0))
    lines.push("  and ".concat(run.skipped_total - (run.skipped?.length ?? 0), " more skipped"));
  return lines;
}
function syncLines(sync) {
  if (!sync)
    return [];
  return [
    "id: ".concat(sync.id),
    "name: ".concat(sync.name),
    "provider: ".concat(sync.provider),
    "account: ".concat(sync.account_id),
    "source: ".concat(dash(sync.source?.web_url)),
    ...sync.source?.path ? ["path: ".concat(sync.source.path)] : [],
    ...sync.source?.shared_by ? ["shared by: ".concat(sync.source.shared_by, " (checked on every run)")] : [],
    "media folder: ".concat(sync.folder_id),
    "every: ".concat(everyText(sync.every_s)),
    "state: ".concat(sync.state),
    "next run: ".concat(sync.next_run_at),
    ...runLines(sync.last_run),
    "revision: ".concat(sync.revision)
  ];
}
function syncTableLines(items) {
  if (!items.length)
    return ["No media syncs"];
  return table(["ID", "NAME", "PROVIDER", "FOLDER", "EVERY", "STATE", "LAST RUN"], items.map((item) => [
    item.id,
    item.name,
    item.provider,
    item.folder_id,
    everyText(item.every_s),
    item.state,
    item.last_run ? item.last_run.status : "not yet"
  ]));
}
var FOLDER_HINT = 'Play it with a folder selector: {"by": "folder", "folder_id": "FOLDER"}.';
function listBody(response) {
  const items = response.body?.items;
  return Array.isArray(items) ? items : [];
}
async function allPages(client, path5, query) {
  const items = [];
  let response = await syncCall(client, { method: "GET", path: path5, ...query ? { query } : {} });
  for (let pages = 0; pages < 1e3; pages++) {
    items.push(...listBody(response));
    const cursor = response.body?.next_cursor ?? void 0;
    if (!cursor)
      break;
    response = await syncCall(client, { method: "GET", path: path5, query: { ...query ?? {}, cursor } });
  }
  return { items, response };
}
function revisionHeader(args) {
  const revision2 = flagString(args.flags, "expect-rev");
  return revision2 ? { "if-match": quotedRevision(revision2) } : void 0;
}
var handleMediaSyncAccountAdd = commandHandler(async (args, runtime, resolved) => {
  const name = flagString(args.flags, "name");
  const tenant = flagString(args.flags, "tenant-id");
  const client = flagString(args.flags, "client-id");
  const secretFile = flagString(args.flags, "secret-file");
  const connectionId = flagString(args.flags, "connection-id");
  if (name === void 0)
    throw usageError("media sync account add microsoft365 requires --name.");
  let body;
  if (connectionId !== void 0) {
    if (tenant !== void 0 || client !== void 0 || secretFile !== void 0) {
      throw usageError("--connection-id replaces --tenant-id, --client-id and --secret-file: the Microsoft connection holds them.");
    }
    body = { kind: "microsoft365", name: mediaSyncName(name), config: { connection_id: connectionId } };
  } else {
    if (tenant === void 0 || client === void 0 || secretFile === void 0) {
      throw usageError("media sync account add microsoft365 requires --connection-id, or --tenant-id, --client-id and --secret-file.");
    }
    body = { kind: "microsoft365", name: mediaSyncName(name), config: { tenant_id: mediaSyncTenant(tenant), client_id: mediaSyncClientId(client) }, secret: await readSecret(secretFile, runtime) };
  }
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "POST", path: ACCOUNTS_PATH, idempotent: true, body });
  const created = response.body;
  return {
    envelope: jsonBody(response, api.requestId),
    exitCode: ExitCode.Success,
    human: ["Created media sync account ".concat(created?.id ?? "").trimEnd(), ...accountLines(created), "", "Next: screenrig media sync account test ".concat(created?.id ?? "ID")].join("\n")
  };
});
var handleMediaSyncAccountAddDropbox = commandHandler(async (args, runtime, resolved) => {
  const name = flagString(args.flags, "name");
  const appKey = flagString(args.flags, "app-key");
  if (name === void 0)
    throw usageError("media sync account add dropbox requires --name.");
  const body = { kind: "dropbox", name: mediaSyncName(name), ...appKey !== void 0 ? { config: { app_key: mediaSyncAppKey(appKey) } } : {} };
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "POST", path: ACCOUNTS_PATH, idempotent: true, body });
  const created = response.body;
  return {
    envelope: jsonBody(response, api.requestId, void 0, consentWarnings(created, resolved.apiUrl, appKey !== void 0)),
    exitCode: ExitCode.Success,
    human: ["Created media sync account ".concat(created?.id ?? "").trimEnd(), ...accountLines(created), ...consentLines(created, resolved.apiUrl, appKey !== void 0)].join("\n")
  };
});
var handleMediaSyncAccountAddGoogleDrive = commandHandler(async (args, runtime, resolved) => {
  const name = flagString(args.flags, "name");
  const keyFile = flagString(args.flags, "key-file");
  if (name === void 0)
    throw usageError("media sync account add google-drive requires --name.");
  const body = { kind: "google_drive", name: mediaSyncName(name), ...keyFile !== void 0 ? { secret: await readServiceAccountKey(keyFile, runtime, KEY_FILE_MAX_CHARACTERS) } : {} };
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "POST", path: ACCOUNTS_PATH, idempotent: true, body });
  const created = response.body;
  return {
    envelope: jsonBody(response, api.requestId, void 0, driveShareWarnings(created)),
    exitCode: ExitCode.Success,
    human: ["Created media sync account ".concat(created?.id ?? "").trimEnd(), ...accountLines(created), ...driveShareLines(created)].join("\n")
  };
});
var handleMediaSyncAccountConnect = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncAccountId(args.positionals[4], "connect");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "POST", path: "".concat(ACCOUNTS_PATH, "/").concat(id, "/connect"), idempotent: true }, id);
  const connecting = response.body;
  return {
    envelope: jsonBody(response, api.requestId, void 0, consentWarnings(connecting, resolved.apiUrl)),
    exitCode: ExitCode.Success,
    human: [
      "New connect link for media sync account ".concat(id, ". Any earlier link no longer works; a connected account stays connected until the new consent completes."),
      ...accountLines(connecting),
      ...consentLines(connecting, resolved.apiUrl)
    ].join("\n")
  };
});
var handleMediaSyncAccountList = commandHandler(async (args, runtime, resolved) => {
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const { items, response } = await allPages(api, ACCOUNTS_PATH);
  return {
    envelope: jsonBody({ ...response, body: { items, next_cursor: null } }, api.requestId),
    exitCode: ExitCode.Success,
    human: ["Media sync accounts (".concat(items.length, ")"), ...accountTableLines(items)].join("\n")
  };
});
var handleMediaSyncAccountShow = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncAccountId(args.positionals[4], "show");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "GET", path: "".concat(ACCOUNTS_PATH, "/").concat(id) }, id);
  const shown = response.body;
  return { envelope: jsonBody(response, api.requestId), exitCode: ExitCode.Success, human: ["Media sync account", ...accountLines(shown), ...connectHintLines(shown)].join("\n") };
});
var handleMediaSyncAccountUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncAccountId(args.positionals[4], "update");
  const name = flagString(args.flags, "name");
  const tenant = flagString(args.flags, "tenant-id");
  const client = flagString(args.flags, "client-id");
  const secretFile = flagString(args.flags, "secret-file");
  const keyFile = flagString(args.flags, "key-file");
  if (name === void 0 && tenant === void 0 && client === void 0 && secretFile === void 0 && keyFile === void 0) {
    throw usageError("media sync account update requires --name, --tenant-id, --client-id, --secret-file or --key-file.");
  }
  const config = { ...tenant !== void 0 ? { tenant_id: mediaSyncTenant(tenant) } : {}, ...client !== void 0 ? { client_id: mediaSyncClientId(client) } : {} };
  const body = {
    ...name !== void 0 ? { name: mediaSyncName(name) } : {},
    ...Object.keys(config).length ? { config } : {},
    ...secretFile !== void 0 ? { secret: await readSecret(secretFile, runtime) } : keyFile !== void 0 ? { secret: await readServiceAccountKey(keyFile, runtime, KEY_FILE_MAX_CHARACTERS) } : {}
  };
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "PATCH", path: "".concat(ACCOUNTS_PATH, "/").concat(id), idempotent: true, body, headers: revisionHeader(args) }, id);
  return {
    envelope: jsonBody(response, api.requestId),
    exitCode: ExitCode.Success,
    human: ["Updated media sync account ".concat(id), ...accountLines(response.body)].join("\n")
  };
});
var handleMediaSyncAccountTest = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncAccountId(args.positionals[4], "test");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "POST", path: "".concat(ACCOUNTS_PATH, "/").concat(id, "/test"), idempotent: true }, id);
  const report = response.body;
  return {
    envelope: jsonBody(response, api.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Media sync account ".concat(id, ": ").concat(report?.ok ? "ok" : "failed"),
      ...checkLines(report?.checks),
      ...report?.ok ? ["", "This checks the account's sign-in or connection and the permissions it holds. It does not judge a site's grant or a folder: media sync create reads the folder you name."] : []
    ].join("\n")
  };
});
var handleMediaSyncAccountDelete = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncAccountId(args.positionals[4], "delete");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "DELETE", path: "".concat(ACCOUNTS_PATH, "/").concat(id), idempotent: true, headers: revisionHeader(args) }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? api.requestId }),
    exitCode: ExitCode.Success,
    human: "Deleted media sync account ".concat(id, ".")
  };
});
function createHandler(provider, word, address) {
  return commandHandler(async (args, runtime, resolved) => {
    const accountId = flagString(args.flags, "account-id");
    const url = flagString(args.flags, "url");
    if (accountId === void 0 || url === void 0)
      throw usageError("media sync create ".concat(word, " requires --account-id and --url."));
    const folderId = flagString(args.flags, "folder-id");
    const every = flagString(args.flags, "every");
    const name = flagString(args.flags, "name");
    const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
    const response = await syncCall(api, {
      method: "POST",
      path: SYNCS_PATH,
      idempotent: true,
      body: {
        provider,
        account_id: mediaSyncAccountOption(accountId),
        url: address(url),
        ...folderId !== void 0 ? { folder_id: mediaSyncFolderOption(folderId) } : {},
        ...every !== void 0 ? { every: Number(mediaSyncEvery(every)) } : {},
        ...name !== void 0 ? { name: mediaSyncName(name) } : {}
      }
    }, accountId);
    const created = response.body;
    return {
      envelope: jsonBody(response, api.requestId),
      exitCode: ExitCode.Success,
      human: [
        "Created media sync ".concat(created?.id ?? "").trimEnd(),
        ...syncLines(created),
        "",
        "The first run starts within about 30 seconds. ".concat(FOLDER_HINT.replace("FOLDER", created?.folder_id ?? "FOLDER")),
        "Next: screenrig media sync show ".concat(created?.id ?? "ID")
      ].join("\n")
    };
  });
}
var handleMediaSyncCreate = createHandler("sharepoint", "sharepoint", mediaSyncUrl);
var handleMediaSyncCreateDropbox = createHandler("dropbox", "dropbox", mediaSyncDropboxUrl);
var handleMediaSyncCreateGoogleDrive = createHandler("google_drive", "google-drive", mediaSyncDriveUrl);
var handleMediaSyncList = commandHandler(async (args, runtime, resolved) => {
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const { items, response } = await allPages(api, SYNCS_PATH);
  return {
    envelope: jsonBody({ ...response, body: { items, next_cursor: null } }, api.requestId),
    exitCode: ExitCode.Success,
    human: ["Media syncs (".concat(items.length, ")"), ...syncTableLines(items)].join("\n")
  };
});
var handleMediaSyncShow = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncId(args.positionals[3], "show");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "GET", path: "".concat(SYNCS_PATH, "/").concat(id) }, id);
  const sync = response.body;
  return {
    envelope: jsonBody(response, api.requestId),
    exitCode: ExitCode.Success,
    human: ["Media sync", ...syncLines(sync), ...sync ? ["", FOLDER_HINT.replace("FOLDER", sync.folder_id)] : []].join("\n")
  };
});
var handleMediaSyncUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncId(args.positionals[3], "update");
  const name = flagString(args.flags, "name");
  const every = flagString(args.flags, "every");
  const folderId = flagString(args.flags, "folder-id");
  const pause = flagBool(args.flags, "pause");
  const resume = flagBool(args.flags, "resume");
  if (name === void 0 && every === void 0 && folderId === void 0 && !pause && !resume) {
    throw usageError("media sync update requires --name, --every, --folder-id, --pause or --resume.");
  }
  const body = {
    ...name !== void 0 ? { name: mediaSyncName(name) } : {},
    ...every !== void 0 ? { every: Number(mediaSyncEvery(every)) } : {},
    ...folderId !== void 0 ? { folder_id: mediaSyncFolderOption(folderId) } : {},
    ...pause ? { state: "paused" } : {},
    ...resume ? { state: "active" } : {}
  };
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "PATCH", path: "".concat(SYNCS_PATH, "/").concat(id), idempotent: true, body, headers: revisionHeader(args) }, id);
  return {
    envelope: jsonBody(response, api.requestId),
    exitCode: ExitCode.Success,
    human: ["Updated media sync ".concat(id), ...syncLines(response.body)].join("\n")
  };
});
var handleMediaSyncRun = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncId(args.positionals[3], "run");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "POST", path: "".concat(SYNCS_PATH, "/").concat(id, "/run"), idempotent: true }, id);
  return {
    envelope: jsonBody(response, api.requestId),
    exitCode: ExitCode.Success,
    human: ["Media sync ".concat(id, " is due now; it runs within about 30 seconds."), "", "Next: screenrig media sync show ".concat(id)].join("\n")
  };
});
var handleMediaSyncDelete = commandHandler(async (args, runtime, resolved) => {
  const id = mediaSyncId(args.positionals[3], "delete");
  const api = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await syncCall(api, { method: "DELETE", path: "".concat(SYNCS_PATH, "/").concat(id), idempotent: true, headers: revisionHeader(args) }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? api.requestId }),
    exitCode: ExitCode.Success,
    human: "Deleted media sync ".concat(id, ". Its media and folder stay; nothing is imported or removed from now on.")
  };
});

// dist/cli-commands/media.js
var REPLACE_NOTE_HELP = "Note kept with the new version and shown to a person who reviews it (at most 280 characters)";
var SECRET_FILE = "Read the client secret's value from this file, or - for stdin (never an argument)";
var KEY_FILE = "Read your own Google Cloud service account's JSON key file from this file, or - for stdin (never an argument)";
function syncCreateOptions(command) {
  return command.option("--folder-id <ID>", "The media folder the files land in (mfd_...); omitted creates one named after the source folder", mediaSyncFolderOption).option("--every <DURATION>", "How often to look for changes, 5 minutes to 24 hours (default 15m)", mediaSyncEvery).option("--name <NAME>", "Name the sync, 1 to 80 characters (default: the source folder's name)", mediaSyncName);
}
function registerMediaCommands(root, bind) {
  const media = root.command("media").description("Generate, upload, and manage images, videos, and soundtrack audio");
  addCommandNotes(media.command("generate").description("Generate an image from a prompt").addOption(new Option("--prompt <TEXT>", "Describe the complete image to generate").conflicts("promptFile")).addOption(new Option("--prompt-file <FILE>", "Read the complete prompt from a file or stdin (-)").conflicts("prompt")).addOption(new Option("--aspect-ratio <RATIO>", "Choose the generated image aspect ratio").choices(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"]).default("16:9")).addOption(new Option("--quality <low|medium|high>", "Choose generation quality").choices(["low", "medium", "high"]).default("medium")).option("--tag <TAG>", "Set the media tag").option("--no-progress", "Suppress stderr progress").action(bind(handleMediaGenerate)), CREDIT_HELP);
  const generate = media.commands.find((command) => command.name() === "generate");
  requireOptionGroup(generate, "exactlyOne", ["--prompt", "--prompt-file"]);
  addCommandExamples(generate, 'screenrig media generate --prompt "A full-screen welcome sign"', "screenrig media generate --prompt-file prompt.txt --aspect-ratio 9:16");
  media.command("upload").description("Upload an image, video, or audio track").argument("<file>", "Local input file").option("--content-type <TYPE>", "Declare the content MIME type").option("--tag <TAG>", "Set the media tag").option("--folder <ID>", "Upload into this media folder (mfd_...): the file lands there when it is ready. An uploader must name one of its folders").option("--no-wait", "Return after acceptance without waiting for processing").option("--poll-ms <MS>", "Set the operation polling interval", positiveInteger("poll-ms")).addOption(new Option("--no-transcode", "Upload accepted source bytes unchanged").conflicts(["codec", "maxFps", "maxEdge", "webpQuality", "preset", "audio"])).addOption(new Option("--codec <h264|hevc>", "Choose the video codec").choices(["h264", "hevc"]).default("h264").conflicts(["transcode"])).addOption(new Option("--max-fps <N>", "Constant output frame rate; every video is encoded at exactly this rate (default 30)").argParser(positiveNumber("max-fps")).conflicts(["transcode"])).addOption(new Option("--max-edge <PIXELS>", "Limit the longest video edge").argParser(positiveInteger("max-edge")).conflicts(["transcode"])).addOption(new Option("--webp-quality <1-100>", "Set WebP quality").argParser(positiveInteger("webp-quality")).conflicts(["transcode"])).option("--no-progress", "Suppress stderr progress").addOption(new Option("--preset <PRESET>", "Choose a transcoding preset").choices(["signage-1080p30", "signage-4k30"]).conflicts(["transcode"])).addOption(new Option("--no-audio", "Remove the audio track when transcoding").conflicts(["transcode"])).action(bind(handleMediaUpload));
  media.command("replace").description("Replace a media item's file in place; its id, playlists and schedules keep working").argument("<id>", "Media identifier (med_...)").argument("<file>", "Local input file, the same kind as the media (image, video or audio)").option("--expect-rev <REVISION>", "Optionally require this media revision", revision).option("--note <TEXT>", REPLACE_NOTE_HELP, reviewNoteOption).option("--content-type <TYPE>", "Declare the content MIME type").option("--no-wait", "Return after acceptance without waiting for processing").option("--poll-ms <MS>", "Set the operation polling interval", positiveInteger("poll-ms")).addOption(new Option("--no-transcode", "Upload accepted source bytes unchanged").conflicts(["codec", "maxFps", "maxEdge", "webpQuality", "preset", "audio"])).addOption(new Option("--codec <h264|hevc>", "Choose the video codec").choices(["h264", "hevc"]).default("h264").conflicts(["transcode"])).addOption(new Option("--max-fps <N>", "Constant output frame rate; every video is encoded at exactly this rate (default 30)").argParser(positiveNumber("max-fps")).conflicts(["transcode"])).addOption(new Option("--max-edge <PIXELS>", "Limit the longest video edge").argParser(positiveInteger("max-edge")).conflicts(["transcode"])).addOption(new Option("--webp-quality <1-100>", "Set WebP quality").argParser(positiveInteger("webp-quality")).conflicts(["transcode"])).option("--no-progress", "Suppress stderr progress").addOption(new Option("--preset <PRESET>", "Choose a transcoding preset").choices(["signage-1080p30", "signage-4k30"]).conflicts(["transcode"])).addOption(new Option("--no-audio", "Remove the audio track when transcoding").conflicts(["transcode"])).action(bind(handleMediaReplace));
  media.command("versions").description("List a media item's versions, the file in service first").argument("<id>", "Media identifier (med_...)").option("--limit <N>", "Read one page of this many versions, 1 to 100", positiveInteger("limit")).option("--cursor <CURSOR>", "Read the page after the data.next_cursor of the previous page").action(bind(handleMediaVersions));
  media.command("restore").description("Put a past version back in service, as a new version").argument("<id>", "Media identifier (med_...)").requiredOption("--number <N>", "Version number to put back, as media versions lists it (required)", positiveInteger("number")).option("--expect-rev <REVISION>", "Optionally require this media revision", revision).option("--note <TEXT>", REPLACE_NOTE_HELP, reviewNoteOption).action(bind(handleMediaRestore));
  const version = media.command("version").description("Manage one stored version of a media item");
  version.command("delete").description("Delete a past version and its stored bytes").argument("<id>", "Media identifier (med_...)").requiredOption("--number <N>", "Version number to delete, as media versions lists it (required)", positiveInteger("number")).action(bind(handleMediaVersionDelete));
  media.command("upload-batch").description("Upload a manifest with resumable state").argument("<manifest.json>", "Upload manifest file").option("--state <FILE>", "Override the automatic private resumable state file").option("--concurrency <N>", "Set concurrent batch uploads", positiveInteger("concurrency")).addOption(new Option("--no-transcode", "Upload accepted source bytes unchanged").conflicts(["codec", "maxFps", "maxEdge", "webpQuality", "preset", "audio"])).option("--tag <TAG>", "Set the media tag").option("--folder <ID>", "Upload every item into this media folder (mfd_...); an uploader must name one of its folders").option("--no-progress", "Suppress stderr progress").option("--poll-ms <MS>", "Set the operation polling interval", positiveInteger("poll-ms")).addOption(new Option("--codec <h264|hevc>", "Choose the video codec").choices(["h264", "hevc"]).default("h264").conflicts(["transcode"])).addOption(new Option("--max-fps <N>", "Constant output frame rate; every video is encoded at exactly this rate (default 30)").argParser(positiveNumber("max-fps")).conflicts(["transcode"])).addOption(new Option("--max-edge <PIXELS>", "Limit the longest video edge").argParser(positiveInteger("max-edge")).conflicts(["transcode"])).addOption(new Option("--webp-quality <1-100>", "Set WebP quality").argParser(positiveInteger("webp-quality")).conflicts(["transcode"])).addOption(new Option("--preset <PRESET>", "Choose a transcoding preset").choices(["signage-1080p30", "signage-4k30"]).conflicts(["transcode"])).addOption(new Option("--no-audio", "Remove the audio track when transcoding").conflicts(["transcode"])).action(bind(handleMediaUploadBatch));
  media.command("show").description("Inspect media").argument("<id>", "Media identifier").action(bind(handleMediaShow));
  media.command("download").description("Download media to a file").argument("<id>", "Media identifier").option("--output <PATH>", "Write downloaded media to this file").action(bind(handleMediaDownload));
  media.command("list").description("List media").option("--tag <TAG>", "Filter media by tag").addOption(new Option("--primitive <image|video|audio>", "Filter by media primitive").choices(["image", "video", "audio"])).option("--folder <ID|root>", "Only files directly in this folder (mfd_...), or root for the library root").option("--library", "List the organization Library's media instead (read-only)").action(bind(handleMediaList));
  const selectorPreview = media.command("selector-preview").description("Preview current selector matches without advancing playback").argument("<selector.json>", "JSON all/tag/folder selector file, or stdin (-)").addOption(new Option("--primitive <image|video>", "Media primitive to match (required)").choices(["image", "video"]).makeOptionMandatory()).option("--rect <WxH>", "Size of the primitive's rect, for example 1080x1920; required when the selector has fit aspect").option("--timezone <IANA>", "Time zone the files' availability rules are read in, for example America/New_York (default UTC)").action(bind(handleSelectorPreview));
  addCommandExamples(selectorPreview, "screenrig media selector-preview selector.json --primitive video", "screenrig media selector-preview selector.json --primitive image --timezone America/New_York");
  addCommandNotes(selectorPreview, 'The file holds one playlist media selector: {"by": "all"}, {"by": "tag", "tag": "Lobby"} or {"by": "folder", "folder_id": "mfd_..."}; each also takes order (filename, random or weighted), batch_size and one_at_a_time. Order weighted rotates one item per visit by weights, a map keyed by media id or tag:NAME to an integer 1 to 1000 (up to 64 keys; one_at_a_time or batch_size 1 is required): an item\'s weight is its media-id key, else the first tag:NAME key it carries (alphabetically), that weight split equally among the items sharing it, else 1. The preview returns each item\'s expected share of plays and the cycle length. fit aspect keeps only files whose aspect ratio is within 5% of the primitive\'s rect (--rect WxH); the others return in excluded with reason aspect_mismatch. A tag or tags entry may be {screen.field.NAME} or {screen.id}, which a screen fills with its own value; the server cannot fill them, so such a selector cannot be previewed. A file whose availability rule (media availability) does not hold now, read in --timezone, returns in excluded with reason outside_window. Reads current project-owned ready matches in filename order. Does not advance a Player cursor. Random order is a per-pass playback policy; see the returned normalized selector. Catalog changes take effect at the next loop refresh.');
  media.command("update").description("Replace media tags").argument("<id>", "Media identifier").addOption(new Option("--tag <TAG>", "Set the media tag").conflicts(["clearTag", "tags"])).addOption(new Option("--clear-tag", "Remove the media tag").conflicts(["tag", "tags"])).addOption(new Option("--tags <TAGS>", "Replace the tag set with comma-separated tags").conflicts(["tag", "clearTag"])).option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleMediaUpdate));
  const availability = media.command("availability").description("Set or clear when dynamic selectors may play a media file").argument("<id>", "Media identifier (med_...)").option("--file <RULE.json>", "Read the availability rule from this JSON file, or - for stdin").option("--clear", "Remove the rule: the file is always available").option("--expect-rev <REVISION>", "Require this media revision (default: the current revision, read first)", revision).action(bind(handleMediaAvailability));
  requireOptionGroup(availability, "exactlyOne", ["--file", "--clear"]);
  media.command("delete").description("Delete media").argument("<id>", "Media identifier").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleMediaDelete));
  requireOptionGroup(media.commands.find((command) => command.name() === "update"), "exactlyOne", ["--tag", "--tags", "--clear-tag"]);
  const move = media.command("move").description("Move media files and folders into a folder, or back to the library root").argument("<ids...>", "Media (med_...) and folder (mfd_...) identifiers, at most 1000").option("--folder <ID>", "Destination folder (mfd_...)").option("--root", "Move to the library root").action(bind(handleMediaMove));
  requireOptionGroup(move, "exactlyOne", ["--folder", "--root"]);
  const folder = media.command("folder").description("List, create, rename, move, and delete media library folders");
  folder.command("list").description("List the project's media folders; parent_id builds the tree").option("--library", "List the organization Library's folders instead (read-only)").action(bind(handleMediaFolderList));
  folder.command("show").description("Inspect a media folder").argument("<id>", "Media folder identifier (mfd_...)").action(bind(handleMediaFolderShow));
  folder.command("create").description("Create a media folder at the library root or inside another folder").requiredOption("--name <NAME>", "Folder name, 1 to 100 characters").option("--parent <ID>", "Create it inside this folder (mfd_...); omitted creates it at the library root").action(bind(handleMediaFolderCreate));
  const update = folder.command("update").description("Rename a media folder or move it, with everything inside, into another folder").argument("<id>", "Media folder identifier (mfd_...)").option("--name <NAME>", "New folder name, 1 to 100 characters").addOption(new Option("--parent <ID>", "Move it inside this folder (mfd_...)").conflicts("root")).addOption(new Option("--root", "Move it to the library root").conflicts("parent")).option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleMediaFolderUpdate));
  requireOptionGroup(update, "atLeastOne", ["--name", "--parent", "--root"]);
  folder.command("delete").description("Delete a media folder; its files and folders move up one level").argument("<id>", "Media folder identifier (mfd_...)").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleMediaFolderDelete));
  const sync = media.command("sync").description("Keep a SharePoint, OneDrive for work, Dropbox or Google Drive folder in step with a media folder");
  addCommandNotes(sync, [
    "Media sync:",
    "  A sync imports the images, videos and audio directly inside a SharePoint,",
    "  OneDrive for work, Dropbox or Google Drive folder into a media folder,",
    "  and keeps them in step: a changed file replaces its bytes under the same media",
    "  ID, so every playlist that plays it updates, and a file removed at the source",
    "  is taken out of play. Each sync reads through an account of the project:",
    "  SharePoint and OneDrive for work read through your own Microsoft Entra app:",
    "  application permission Sites.Selected, granted on each site, or Files.Read.All,",
    "  with admin consent. The client secret is sealed on the server and never shown.",
    "  An account may instead read through a Microsoft connection of the project",
    "  (--connection-id; connection create microsoft), which holds the app once for",
    "  data sources and Power BI too, in either mode.",
    "  Dropbox reads through the Dropbox account of a person, who allows read-only",
    "  access by opening a one-time link (account add dropbox prints it, account connect",
    "  makes a new one), to screenRIG's Dropbox app or your own (--app-key).",
    "  Google Drive reads the folders shared with a service account's address (Viewer",
    "  is enough): screenRIG's, or your own with a JSON key file (--key-file; the key",
    "  is sealed on the server and never shown). account add google-drive prints the",
    "  address.",
    "  Play the media folder with a folder selector in a playlist."
  ].join("\n"));
  const account = sync.command("account").description("Add, connect, test and manage the accounts a project's syncs read through: a Microsoft Entra app, a Dropbox account or a Google Drive service account");
  const add = account.command("add").description("Add an account a sync reads through");
  const addMicrosoft = add.command("microsoft365").description("Add a Microsoft Entra app: its tenant, application id and a client secret, or a Microsoft connection of this project").requiredOption("--name <NAME>", "Name the account, 1 to 80 characters", mediaSyncName).option("--tenant-id <TENANT>", "Your organization's directory (tenant) id, or its primary domain such as contoso.onmicrosoft.com", mediaSyncTenant).option("--client-id <ID>", "The app registration's application (client) id", mediaSyncClientId).option("--secret-file <FILE>", "".concat(SECRET_FILE, "; the file holds only the secret's Value")).addOption(new Option("--connection-id <ID>", "Sign in through a Microsoft connection of this project, in either mode (pcn_..., screenrig connection list), instead of --tenant-id, --client-id and --secret-file").argParser(connectionIdOption).conflicts(["tenantId", "clientId", "secretFile"])).action(bind(handleMediaSyncAccountAdd));
  requireOptionGroup(addMicrosoft, "exactlyOne", ["--connection-id", "--tenant-id"]);
  requireOptionGroup(addMicrosoft, "together", ["--tenant-id", "--client-id", "--secret-file"]);
  add.command("dropbox").description("Add a Dropbox account: prints the link the person who owns it opens, signed in to Dropbox, to connect it").requiredOption("--name <NAME>", "Name the account, 1 to 80 characters", mediaSyncName).option("--app-key <KEY>", "The app key of your own Dropbox app (never its app secret); omitted: screenRIG's Dropbox app", mediaSyncAppKey).action(bind(handleMediaSyncAccountAddDropbox));
  add.command("google-drive").description("Add a Google Drive account: the service account address folders are shared with, screenRIG's or your own").requiredOption("--name <NAME>", "Name the account, 1 to 80 characters", mediaSyncName).option("--key-file <FILE>", "".concat(KEY_FILE, "; omitted: the account reads through screenRIG's service account")).action(bind(handleMediaSyncAccountAddGoogleDrive));
  account.command("list").description("List this project's media sync accounts").action(bind(handleMediaSyncAccountList));
  account.command("show").description("Inspect one account and its last test").argument("<id>", "Account identifier (msa_...)").action(bind(handleMediaSyncAccountShow));
  const accountUpdate = account.command("update").description("Change an account's name, tenant, application id, client secret or Google Drive key").argument("<id>", "Account identifier (msa_...)").option("--name <NAME>", "Rename the account", mediaSyncName).option("--tenant-id <TENANT>", "The tenant's directory id or primary domain", mediaSyncTenant).option("--client-id <ID>", "The app registration's application (client) id", mediaSyncClientId).option("--secret-file <FILE>", "".concat(SECRET_FILE, "; it replaces the stored secret")).option("--key-file <FILE>", "".concat(KEY_FILE, "; it replaces a Google Drive account's own key")).option("--expect-rev <REVISION>", "Optionally require this account revision", revision).action(bind(handleMediaSyncAccountUpdate));
  requireOptionGroup(accountUpdate, "atLeastOne", ["--name", "--tenant-id", "--client-id", "--secret-file", "--key-file"]);
  requireOptionGroup(accountUpdate, "atMostOne", ["--secret-file", "--key-file"]);
  account.command("connect").description("Make a new link to connect (or reconnect) a Dropbox account; send it to the person who owns the Dropbox account").argument("<id>", "Account identifier (msa_...)").action(bind(handleMediaSyncAccountConnect));
  account.command("test").description("Check an account: a Microsoft app's sign-in and Graph permissions, or the connection or key of a Dropbox or Google Drive account").argument("<id>", "Account identifier (msa_...)").action(bind(handleMediaSyncAccountTest));
  account.command("delete").description("Delete an account no sync uses").argument("<id>", "Account identifier (msa_...)").option("--expect-rev <REVISION>", "Optionally require this account revision", revision).action(bind(handleMediaSyncAccountDelete));
  const create = sync.command("create").description("Start keeping a folder in step with a media folder");
  syncCreateOptions(create.command("sharepoint").description("Sync a SharePoint or OneDrive for work folder").requiredOption("--account-id <ID>", "The account to read through (msa_...)", mediaSyncAccountOption).requiredOption("--url <URL>", "The folder's SharePoint address, or its sharing link", mediaSyncUrl)).action(bind(handleMediaSyncCreate));
  syncCreateOptions(create.command("dropbox").description("Sync a Dropbox folder").requiredOption("--account-id <ID>", "The connected Dropbox account to read through (msa_...)", mediaSyncAccountOption).requiredOption("--url <URL|PATH>", "The folder's Dropbox address, a shared folder link the account has added to its Dropbox, or a path that starts with /", mediaSyncDropboxUrl)).action(bind(handleMediaSyncCreateDropbox));
  syncCreateOptions(create.command("google-drive").description("Sync a Google Drive folder shared with an account's service account").requiredOption("--account-id <ID>", "The Google Drive account to read through (msa_...)", mediaSyncAccountOption).requiredOption("--url <URL|ID>", "The folder's Google Drive address (https://drive.google.com/drive/folders/ID), or its id", mediaSyncDriveUrl)).action(bind(handleMediaSyncCreateGoogleDrive));
  sync.command("list").description("List this project's media syncs").action(bind(handleMediaSyncList));
  sync.command("show").description("Inspect one sync and what its last run did").argument("<id>", "Sync identifier (msy_...)").action(bind(handleMediaSyncShow));
  const syncUpdate = sync.command("update").description("Change a sync's cadence, name or media folder, or pause and resume it").argument("<id>", "Sync identifier (msy_...)").option("--name <NAME>", "Rename the sync", mediaSyncName).option("--every <DURATION>", "How often to look for changes, 5 minutes to 24 hours", mediaSyncEvery).option("--folder-id <ID>", "Fill this media folder instead (mfd_...)", mediaSyncFolderOption).addOption(new Option("--pause", "Stop running until resumed").conflicts(["resume"])).addOption(new Option("--resume", "Run again; also resumes a sync an error stopped").conflicts(["pause"])).option("--expect-rev <REVISION>", "Optionally require this sync revision", revision).action(bind(handleMediaSyncUpdate));
  requireOptionGroup(syncUpdate, "atLeastOne", ["--name", "--every", "--folder-id", "--pause", "--resume"]);
  sync.command("run").description("Run a sync now instead of at its next time").argument("<id>", "Sync identifier (msy_...)").action(bind(handleMediaSyncRun));
  sync.command("delete").description("Stop a sync; its media and folder stay").argument("<id>", "Sync identifier (msy_...)").option("--expect-rev <REVISION>", "Optionally require this sync revision", revision).action(bind(handleMediaSyncDelete));
}

// dist/browser-setup.js
function normalizeBrowserSetupCode(input) {
  const canonical = canonicalPairingCode(input, "browser setup --code");
  return { canonical, display: "".concat(canonical.slice(0, 3), "-").concat(canonical.slice(3)) };
}
function browserHandoffUrl(apiUrl, displayCode) {
  const api = new URL(apiUrl);
  if (api.protocol !== "https:") {
    throw usageError("browser setup --open requires the configured HTTPS ScreenRig origin.");
  }
  const host = apexHost(api.hostname);
  if (!host)
    throw usageError("browser setup --open requires a supported ScreenRig API origin (api.screenrig.ai, api.stage.screenrig.ai, or the configured HTTPS localhost origin).");
  const origin = "".concat(api.protocol, "//").concat(host).concat(api.port ? ":".concat(api.port) : "");
  return "".concat(origin, "/").concat(displayCode);
}
async function browserSetupRetryState(options) {
  return withConfigLock(options.resolved.configPath, options.runtime.fs, { sleep: options.runtime.sleep, now: () => options.runtime.now().getTime() }, async () => {
    const stored = await readConfigFile(options.resolved.configPath, options.runtime.fs);
    const current = stored ? projectConfigFor(stored, options.resolved) : void 0;
    if (current)
      assertProjectCredential(current, options.resolved);
    if (current?.browser_setup) {
      if (current.browser_setup.code !== options.code) {
        throw usageError("A browser setup claim retry is pending. Retry the same code before claiming another browser.");
      }
      if (options.requestedKey && current.browser_setup.idempotency_key !== options.requestedKey) {
        throw usageError("The supplied idempotency key does not match the pending browser setup claim.");
      }
      return current.browser_setup;
    }
    const idempotencyKey = options.requestedKey ?? (options.generateIdempotencyKey ?? newIdempotencyKey)();
    if (!isValidIdempotencyKey(idempotencyKey))
      throw usageError("Browser setup idempotency key is invalid.");
    const state = { idempotency_key: idempotencyKey, code: options.code };
    await writeConfigAtomic(options.resolved.configPath, withProjectConfig(stored ?? { api_url: options.resolved.apiUrl }, options.resolved, {
      ...current ?? { api_url: options.resolved.apiUrl },
      browser_setup: state,
      updated_at: options.runtime.now().toISOString()
    }), options.runtime.fs);
    return state;
  });
}
async function clearBrowserSetupRetryState(resolved, runtime, idempotencyKey) {
  await withConfigLock(resolved.configPath, runtime.fs, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    const stored = await readConfigFile(resolved.configPath, runtime.fs);
    const current = stored ? projectConfigFor(stored, resolved) : void 0;
    if (current)
      assertProjectCredential(current, resolved);
    if (!current || current.browser_setup?.idempotency_key !== idempotencyKey)
      return;
    const { browser_setup: _complete, ...complete } = current;
    await writeConfigAtomic(resolved.configPath, withProjectConfig(stored, resolved, complete), runtime.fs);
  });
}

// dist/handlers/browser.js
var handleBrowserSetup = commandHandler(browserSetupCommand);
async function browserSetupCommand(args, runtime, resolved) {
  const rawCode = flagString(args.flags, "code");
  if (!rawCode)
    throw usageError("browser setup requires --code CODE.");
  const code = normalizeBrowserSetupCode(rawCode);
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const retryRuntime = {
    fs: { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir },
    now: runtime.now,
    sleep: runtime.sleep
  };
  const retry = await browserSetupRetryState({
    resolved,
    runtime: retryRuntime,
    code: code.canonical,
    ...flagString(args.flags, "idempotency-key") ? { requestedKey: flagString(args.flags, "idempotency-key") } : {}
  });
  const request = { code: code.canonical };
  const response = await client.call({
    method: "POST",
    path: "/api/project/browser-links/claim",
    idempotent: true,
    idempotencyKey: retry.idempotency_key,
    body: request
  }).catch(async (error) => {
    if (error instanceof CliError && (error.problem.status === 404 && error.problem.code === "handoff_code_invalid" || error.problem.status === 410 && error.problem.code === "handoff_code_expired")) {
      await clearBrowserSetupRetryState(resolved, retryRuntime, retry.idempotency_key);
    }
    throw error;
  });
  requirePrivateNoStore(response.headers, "Browser setup claim response");
  const claim = response.body;
  const screen = claim.screen;
  if (!claim.session_id || claim.status !== "claimed" || !screen?.id || !screen.public_id || screen.state !== "pairing_pending" || !screen.public_url) {
    throw unexpectedResponseError("Browser setup response does not match the generated BrowserLinkClaim contract.", client.requestId, "The server may have claimed the code. Run screenrig screen list to find the screen before claiming again.");
  }
  const withheld = playerPublicUrlProblem(resolved.apiUrl, screen.public_url, screen.public_id);
  const opened = flagBool(args.flags, "open") ? await (runtime.openUrl?.(browserHandoffUrl(resolved.apiUrl, code.display)) ?? Promise.resolve(false)) : void 0;
  await clearBrowserSetupRetryState(resolved, retryRuntime, retry.idempotency_key);
  const playerPublicUrl = withheld ? void 0 : new URL(screen.public_url).href;
  const data = {
    code: code.display,
    status: claim.status,
    screen_id: screen.id,
    ...playerPublicUrl ? { player_public_url: playerPublicUrl } : { url_withheld: withheld },
    ...opened !== void 0 ? { opened } : {}
  };
  const warnings = withheld ? [{ code: "player_url_withheld", message: "The browser setup was claimed, but its Player public URL is not shown: ".concat(withheld) }] : [];
  return {
    envelope: successEnvelope(data, { request_id: client.requestId, warnings }),
    exitCode: ExitCode.Success,
    human: humanLines("Browser setup claimed", [
      ["code", code.display],
      ["status", claim.status],
      ["screen_id", screen.id],
      ["player_public_url", playerPublicUrl],
      ["url_withheld", withheld],
      ...opened !== void 0 ? [["opened", opened ? "true" : "false"]] : []
    ])
  };
}
function playerPublicUrlProblem(apiUrl, value, publicId) {
  const api = new URL(apiUrl);
  const apex = apexHost(api.hostname);
  let url;
  try {
    url = new URL(value);
  } catch {
    return "public_url is not a valid URL.";
  }
  if (!apex || url.origin !== "https://play.".concat(apex).concat(api.port ? ":".concat(api.port) : ""))
    return "public_url is not this API's Player origin.";
  if (url.username || url.password || url.hash || url.search)
    return "public_url carries credentials, a query or a fragment.";
  if (!isPlayerScreenPath(url.pathname, publicId))
    return "public_url does not name this screen's Player path (/s/PUBLIC_ID).";
  return void 0;
}

// dist/cli-commands/browser.js
function registerBrowserCommands(root, bind) {
  const browser = root.command("browser").description("Complete browser Player setup");
  browser.command("setup").description("Complete browser setup from a code").requiredOption("--code <CODE>", "Use the browser setup code (required)").option("--open", "Open the result in its viewer").action(bind(handleBrowserSetup));
}

// dist/kv-webhooks.js
var KV_WEBHOOK_ID_PATTERN = /^(?:(?:stage|qa|development)_)?kvw_[A-Za-z0-9_-]+$/;
var KV_WEBHOOK_SECRET_PATTERN = /^srkw_[A-Za-z0-9_-]{43}$/;
var KV_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$/;
var KV_WEBHOOK_ID_MAX_BYTES = 200;
var KV_WEBHOOKS_MAX = 20;
var KV_WEBHOOK_DESCRIPTION_MAX_BYTES = 200;
var KV_WEBHOOK_SIGNING_SECRET_PATTERN = /^whsec_[A-Za-z0-9_-]{43}$/;
var KV_WEBHOOK_MAPPING_MAX_BYTES = 64 * 1024;
function kvWebhookTargetFlag(target) {
  return target.kind === "app" ? "--app-id ".concat(target.id) : "--card ".concat(target.id);
}
function kvWebhooksPath(target) {
  const id = encodeURIComponent(target.id);
  return target.kind === "app" ? "/api/applications/".concat(id, "/kv-webhooks") : "/api/cards/".concat(id, "/kv-webhooks");
}
function kvWebhookId(value, command, target) {
  if (!value)
    throw usageError("kv webhook ".concat(command, " requires <webhook_id>."));
  if (Buffer.byteLength(value) > KV_WEBHOOK_ID_MAX_BYTES || !KV_WEBHOOK_ID_PATTERN.test(value)) {
    throw usageError("A K/V webhook id looks like kvw_ followed by letters, digits, - or _.", {
      command: "screenrig kv webhook list ".concat(kvWebhookTargetFlag(target)),
      reason: target.kind === "app" ? "List this application's K/V webhooks and their ids." : "List this card's webhooks and their ids."
    });
  }
  return value;
}
function kvWebhookDeliveriesLimit(value) {
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 100)
    throw usageError("--limit must be a whole number from 1 to 100.");
  return value;
}
function kvWebhookMapping(text) {
  if (Buffer.byteLength(text) > KV_WEBHOOK_MAPPING_MAX_BYTES)
    throw usageError("--map is larger than 64 KiB.");
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw usageError("--map must hold a JSON object: the template that builds the card's data document.", {
      command: "screenrig kv webhook create --help",
      reason: 'Example template: {"title":"{{body.alert.title}}","body":"{{body.alert.message}}"}.'
    });
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw usageError("--map must be a JSON object: the template that builds the card's data document.");
  }
  return parsed;
}
function kvWebhookKey(value) {
  if (!value)
    throw usageError("kv webhook create requires <key>.");
  if (!KV_KEY_PATTERN.test(value)) {
    throw usageError("<key> must be 1 to 256 characters of letters, digits and . _ : / -, starting with a letter or digit.");
  }
  return value;
}
function kvWebhookDescription(value) {
  const trimmed = value.trim();
  if (Buffer.byteLength(trimmed) > KV_WEBHOOK_DESCRIPTION_MAX_BYTES || new RegExp("\\p{Cc}", "u").test(trimmed)) {
    throw usageError("--description must be at most ".concat(KV_WEBHOOK_DESCRIPTION_MAX_BYTES, " bytes after trimming, without control characters."));
  }
  return trimmed;
}
function kvWebhookSecretWarning(id, target, action, signing = false) {
  if (target.kind === "card")
    return cardWebhookSecretWarning(id, target, action, signing);
  const applicationId = target.id;
  const send = "The sending system posts the key's new value to data.url with the header Authorization: Bearer <data.secret> (or HTTP Basic with data.id as the username and data.secret as the password); the raw body becomes the value and its Content-Type the content type.";
  return {
    code: "kv_webhook_secret_shown_once",
    message: action === "create" ? "data.secret is this webhook's secret and is shown only in this answer. Store it in the sending system now; screenrig does not save it in its config, logs, or recovery state. ".concat(send, " After an interrupted or ambiguous create, rerun the identical command within 24 hours to get this same answer and secret back. Replace a lost secret with screenrig kv webhook rotate-secret ").concat(id, " --app-id ").concat(applicationId, ".") : "data.secret is the webhook's new secret and is shown only in this answer. The previous secret stopped working: put the new one in the sending system now; screenrig does not save it. ".concat(send, " After an interrupted or ambiguous rotation, rerun the identical command within 24 hours to get this same secret back.")
  };
}
function kvWebhookProblem(error, target, id) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  const flag = kvWebhookTargetFlag(target);
  const owner = target.kind === "app" ? "application" : "card";
  if (problem.code === "kv_webhook_limit_reached") {
    return new CliError({
      ...problem,
      detail: "This ".concat(owner, " already has the maximum of ").concat(KV_WEBHOOKS_MAX, " ").concat(target.kind === "app" ? "K/V webhooks" : "webhooks", ". Nothing was created."),
      next: problem.next ?? {
        command: "screenrig kv webhook list ".concat(flag),
        reason: "Delete a webhook you no longer need with screenrig kv webhook delete ID ".concat(flag, ", then rerun create.")
      }
    }, error.exitCode, error.warnings);
  }
  if (problem.next)
    return error;
  if (problem.code === "card_not_found") {
    return new CliError({ ...problem, next: { command: "screenrig card list", reason: "Find the card's current ID (crd_...), then rerun with --card." } }, error.exitCode, error.warnings);
  }
  if (problem.code === "not_found") {
    if (target.kind === "card") {
      return new CliError({
        ...problem,
        next: { command: "screenrig kv webhook list ".concat(flag), reason: "List this card's webhooks; a deleted webhook does not come back." }
      }, error.exitCode, error.warnings);
    }
    return new CliError({
      ...problem,
      next: id ? { command: "screenrig kv webhook list ".concat(flag), reason: "List this application's K/V webhooks; a deleted webhook does not come back." } : { command: "screenrig app list", reason: "Find the application's current ID, then rerun with --app-id." }
    }, error.exitCode, error.warnings);
  }
  return error;
}
function kvWebhookExample(url, secret) {
  return 'curl -X POST "'.concat(url, '" -H "Authorization: Bearer ').concat(secret, '" -H "Content-Type: application/json" --data \'{"message":"Hello"}\'');
}
function when(value, label) {
  return value === void 0 || value === "" ? [] : ["".concat(label, ": ").concat(value)];
}
function kvWebhookLines(webhook) {
  if (!webhook)
    return [];
  return [
    "id: ".concat(webhook.id),
    "application_id: ".concat(webhook.application_id),
    "key: ".concat(webhook.key),
    ...when(webhook.description, "description"),
    "url: ".concat(webhook.url),
    ...when(webhook.created_at, "created_at"),
    ...when(webhook.last_used_at, "last_used_at")
  ];
}
function table2(header, rows) {
  const widths = header.map((cell, index) => Math.max(cell.length, ...rows.map((row) => (row[index] ?? "").length)));
  const render = (row) => row.map((cell, index) => cell.padEnd(widths[index])).join("  ").trimEnd();
  return [render(header), ...rows.map(render)];
}
function kvWebhookTableLines(items) {
  if (!items.length)
    return ["No K/V webhooks"];
  return table2(["ID", "KEY", "LAST_USED", "URL", "DESCRIPTION"], items.map((item) => [
    item.id ?? "",
    item.key ?? "",
    item.last_used_at ?? "-",
    item.url ?? "",
    item.description ?? ""
  ]));
}
function cardWebhookSecretWarning(id, target, action, signing) {
  const flag = kvWebhookTargetFlag(target);
  const send = "The sending system posts a JSON or form body to data.url with the header Authorization: Bearer <data.secret> (or HTTP Basic with data.id as the username and data.secret as the password); the webhook's mapping, when it has one, builds the card's document from the body, and the card's own validation decides whether it is shown.";
  return {
    code: "kv_webhook_secret_shown_once",
    message: action === "create" ? "data.secret is this webhook's secret".concat(signing ? " and data.signing_secret its signing secret" : "", ", shown only in this answer. Store ").concat(signing ? "them" : "it", " in the sending system now; screenrig does not save ").concat(signing ? "them" : "it", " in its config, logs, or recovery state. ").concat(send, " After an interrupted or ambiguous create, rerun the identical command within 24 hours to get this same answer back. Replace a lost secret with screenrig kv webhook rotate-secret ").concat(id, " ").concat(flag, ".") : "data.secret is the webhook's new secret and is shown only in this answer. The previous secret stopped working: put the new one in the sending system now; screenrig does not save it. ".concat(send, " After an interrupted or ambiguous rotation, rerun the identical command within 24 hours to get this same secret back.")
  };
}
function cardWebhookSigningWarning(id, target) {
  return {
    code: "kv_webhook_signing_secret_shown_once",
    message: 'data.signing_secret is shown only in this answer. Store it in the sending system now; screenrig does not save it. Every post then carries ScreenRig-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>" keyed with the signing secret>, and a post whose timestamp is more than five minutes from the server\'s clock, or whose signature does not match, is refused like a wrong secret. Replace a lost signing secret with screenrig kv webhook rotate-secret '.concat(id, " ").concat(kvWebhookTargetFlag(target), " --signing.")
  };
}
function cardWebhookExample(url, secret, signing) {
  const bearer = secret ? "Bearer ".concat(secret) : "Bearer <secret>";
  const signed = signing ? ' -H "ScreenRig-Signature: t=<unix seconds>,v1=<hmac>"' : "";
  return 'curl -X POST "'.concat(url, '" -H "Authorization: ').concat(bearer, '"').concat(signed, ' -H "Content-Type: application/json" --data \'{"message":"Hello"}\'');
}
function mappingSummary(webhook) {
  return webhook.mapping === null || webhook.mapping === void 0 ? "(none: the posted object is the document)" : "".concat(Object.keys(webhook.mapping).length, " top-level member").concat(Object.keys(webhook.mapping).length === 1 ? "" : "s");
}
function cardWebhookLines(webhook) {
  if (!webhook)
    return [];
  return [
    "id: ".concat(webhook.id),
    "card_id: ".concat(webhook.card_id),
    ...when(webhook.description, "description"),
    "mapping: ".concat(mappingSummary(webhook)),
    ...when(webhook.key_template, "key_template"),
    "enabled: ".concat(webhook.enabled),
    "signing: ".concat(webhook.signing),
    ...verifyLines(webhook.verify, webhook.handshake),
    "url: ".concat(webhook.url),
    ...when(webhook.created_at, "created_at"),
    ...when(webhook.last_used_at, "last_used_at")
  ];
}
function cardWebhookTableLines(items) {
  if (!items.length)
    return ["No card webhooks"];
  const vendors = items.some((item) => item.verify || item.handshake);
  return table2(["ID", "ENABLED", "SIGNING", ...vendors ? ["VERIFY", "HANDSHAKE"] : [], "MAPPING", "KEY_TEMPLATE", "LAST_USED", "URL", "DESCRIPTION"], items.map((item) => [
    item.id ?? "",
    String(item.enabled),
    String(item.signing),
    ...vendors ? [item.verify?.vendor ?? "-", item.handshake ?? "-"] : [],
    item.mapping === null || item.mapping === void 0 ? "no" : "yes",
    item.key_template || "-",
    item.last_used_at ?? "-",
    item.url ?? "",
    item.description ?? ""
  ]));
}
function kvWebhookDeliveryTableLines(items) {
  if (!items.length)
    return ["No deliveries in the last seven days"];
  const files = items.some((item) => item.files !== void 0);
  return table2(["AT", "OUTCOME", "REASON", "STATUS", "BYTES", "REVISION", ...files ? ["FILES"] : [], "DETAIL"], items.map((item) => [
    item.at ?? "",
    item.outcome ?? "",
    item.reason ?? "-",
    String(item.status ?? ""),
    String(item.bytes ?? ""),
    item.revision === void 0 ? "-" : String(item.revision),
    ...files ? [item.files === void 0 ? "-" : String(item.files)] : [],
    item.detail ?? ""
  ]));
}

// dist/handlers/kv.js
var handleKvList = commandHandler(async (args, runtime, resolved) => {
  const applicationId = flagString(args.flags, "app-id");
  if (!applicationId)
    throw usageError("kv commands require --app-id.");
  return simpleList(args, runtime, resolved, "/api/applications/".concat(applicationId, "/kv"), "K/V");
}, true);
var handleKvGet = commandHandler(async (args, runtime, resolved) => {
  const applicationId = flagString(args.flags, "app-id");
  if (!applicationId)
    throw usageError("kv commands require --app-id.");
  const key = args.positionals[2];
  if (!key)
    throw usageError("kv get requires a key.");
  return simpleGet(args, runtime, resolved, "/api/applications/".concat(applicationId, "/kv/").concat(encodeURIComponent(key)), "K/V");
}, true);
var handleKvSet = commandHandler(async (args, runtime, resolved) => {
  const applicationId = flagString(args.flags, "app-id");
  if (!applicationId)
    throw usageError("kv commands require --app-id.");
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const key = args.positionals[2];
  if (!key)
    throw usageError("kv set requires a key.");
  const body = await kvWriteFromArgs(args, runtime.cwd(), runtime);
  const revision2 = flagString(args.flags, "expect-rev");
  const response = await client.call({
    method: "PUT",
    path: "/api/applications/".concat(applicationId, "/kv/").concat(encodeURIComponent(key)),
    idempotent: true,
    headers: revision2 ? { "if-match": quotedRevision(revision2) } : void 0,
    body
  });
  const entry = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: humanLines("K/V value set", [
      ["key", entry.key],
      ["content_type", entry.content_type],
      ["bytes", String(entry.bytes)],
      ["sha256", entry.sha256],
      ["revision", String(entry.revision)]
    ])
  };
}, true);
var handleKvDelete = commandHandler(async (args, runtime, resolved) => {
  const applicationId = flagString(args.flags, "app-id");
  if (!applicationId)
    throw usageError("kv commands require --app-id.");
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const key = args.positionals[2];
  if (!key)
    throw usageError("kv delete requires a key.");
  const ifMatch = flagString(args.flags, "expect-rev");
  const response = await client.call({
    method: "DELETE",
    path: "/api/applications/".concat(applicationId, "/kv/").concat(encodeURIComponent(key)),
    idempotent: true,
    headers: ifMatch ? { "if-match": quotedRevision(ifMatch) } : void 0
  });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Deleted ".concat(key) };
}, true);
function kvWebhookTarget(args, command) {
  const applicationId = flagString(args.flags, "app-id");
  const card = flagString(args.flags, "card");
  if (applicationId && card)
    throw usageError("Add --app-id or --card, not both.");
  if (card)
    return { kind: "card", id: cardUid(card) };
  if (!applicationId)
    throw usageError("kv webhook ".concat(command, " requires --app-id (a key of an application) or --card (a card's data document)."));
  return { kind: "app", id: applicationId };
}
async function kvWebhookCall(client, request, target, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw kvWebhookProblem(error, target, id);
  }
}
async function kvWebhookWithSecret(body, action, target, runtime, signing = false) {
  const webhook = body;
  const secret = webhook?.secret;
  const signingSecret = webhook?.signing_secret;
  const secretOk = typeof secret === "string" && KV_WEBHOOK_SECRET_PATTERN.test(secret);
  const signingOk = signingSecret === void 0 ? !signing : KV_WEBHOOK_SIGNING_SECRET_PATTERN.test(signingSecret);
  const shapeOk = signing && action === "rotate" ? typeof signingSecret === "string" && signingOk : secretOk && signingOk;
  if (!webhook || typeof webhook.id !== "string" || !shapeOk) {
    await writeRecoveries.get(runtime)?.finish();
    const id = webhook && typeof webhook.id === "string" && KV_WEBHOOK_ID_PATTERN.test(webhook.id) ? webhook.id : void 0;
    const flag = kvWebhookTargetFlag(target);
    throw new CliError(makeProblem("unexpected_response", "Unexpected response", 502, "The ".concat(action === "create" ? "kv webhook create" : "rotate-secret", " request completed, but its answer did not carry a secret. Do not rerun it."), {
      next: id ? { command: "screenrig kv webhook rotate-secret ".concat(id, " ").concat(flag).concat(signing ? " --signing" : ""), reason: "Issue a new secret; it is shown once in the answer." } : { command: "screenrig kv webhook list ".concat(flag), reason: "Find the webhook, then run screenrig kv webhook rotate-secret ID to receive a new secret." }
    }), ExitCode.Unexpected);
  }
  return webhook;
}
async function kvWebhookSecretResult(response, client, action, target, runtime, signing = false) {
  const webhook = await kvWebhookWithSecret(response.body, action, target, runtime, signing);
  if (target.kind === "card")
    return cardWebhookSecretResult(response, client, webhook, action, target, signing);
  const secretWebhook = webhook;
  const warning = kvWebhookSecretWarning(webhook.id, target, action);
  return {
    envelope: jsonBody(response, client.requestId, void 0, [warning]),
    exitCode: ExitCode.Success,
    human: [
      action === "create" ? "Created K/V webhook ".concat(webhook.id) : "Rotated the secret of K/V webhook ".concat(webhook.id),
      ...kvWebhookLines(webhook),
      "",
      "Sensitive webhook secret (store it only in the system that posts to the url above)",
      "secret: ".concat(secretWebhook.secret),
      "example: ".concat(kvWebhookExample(webhook.url, secretWebhook.secret)),
      "warning: ".concat(warning.message)
    ].join("\n"),
    keepRecoveryUntilOutput: true
  };
}
function cardWebhookSecretResult(response, client, webhook, action, target, signingRotation = false) {
  const warnings = [];
  if (webhook.secret)
    warnings.push(kvWebhookSecretWarning(webhook.id, target, action === "update" ? "create" : action, Boolean(webhook.signing_secret)));
  if (webhook.signing_secret)
    warnings.push(cardWebhookSigningWarning(webhook.id, target));
  const title = action === "create" ? "Created card webhook ".concat(webhook.id) : action === "update" ? "Updated card webhook ".concat(webhook.id) : signingRotation ? "Rotated the signing secret of card webhook ".concat(webhook.id) : "Rotated the secret of card webhook ".concat(webhook.id);
  const lines = [title, ...cardWebhookLines(webhook)];
  if (webhook.secret || webhook.signing_secret) {
    lines.push("", "Sensitive webhook secrets (store them only in the system that posts to the url above)");
    if (webhook.secret)
      lines.push("secret: ".concat(webhook.secret));
    if (webhook.signing_secret)
      lines.push("signing_secret: ".concat(webhook.signing_secret));
    lines.push("example: ".concat(cardWebhookExample(webhook.url, webhook.secret, webhook.signing)));
    for (const warning of warnings)
      lines.push("warning: ".concat(warning.message));
  }
  return {
    envelope: jsonBody(response, client.requestId, void 0, warnings.length ? warnings : void 0),
    exitCode: ExitCode.Success,
    human: lines.join("\n"),
    ...webhook.secret || webhook.signing_secret ? { keepRecoveryUntilOutput: true } : {}
  };
}
var handleKvWebhookCreate = commandHandler(async (args, runtime, resolved) => {
  const target = kvWebhookTarget(args, "create");
  const description = flagString(args.flags, "description");
  const keyTemplate = flagString(args.flags, "key-template");
  const key = args.positionals[3];
  let body;
  if (target.kind === "app") {
    if (flagString(args.flags, "map") !== void 0 || flagString(args.flags, "key-template") !== void 0 || flagBool(args.flags, "signing")) {
      throw usageError("--map, --key-template and --signing apply to a card webhook: add --card CARD_ID instead of --app-id.");
    }
    if (verifyFlagsGiven(args).length)
      throw usageError("".concat(verifyFlagsGiven(args).join(", "), " apply to a card webhook: add --card CARD_ID instead of --app-id."));
    body = { key: kvWebhookKey(key), ...description !== void 0 ? { description: kvWebhookDescription(description) } : {} };
  } else {
    if (key !== void 0)
      throw usageError("A card webhook writes the card's data document, not a key: omit <key>.");
    const map = flagString(args.flags, "map");
    if (flagBool(args.flags, "signing") && flagString(args.flags, "verify") !== void 0)
      throw usageError("--verify and --signing exclude each other: a vendor signs with its own scheme, not ScreenRig-Signature.");
    singleStdin([["--map", map], ["--verify-secret-file", flagString(args.flags, "verify-secret-file")]]);
    const vendor = await verifyMembers(args, runtime, { create: true, subject: "the webhook" });
    body = {
      ...description !== void 0 ? { description: kvWebhookDescription(description) } : {},
      ...keyTemplate !== void 0 ? { key_template: keyTemplate } : {},
      ...map !== void 0 ? { mapping: kvWebhookMapping(await readAuthoringText(map, runtime, KV_WEBHOOK_MAPPING_MAX_BYTES)) } : {},
      ...flagBool(args.flags, "signing") ? { signing: true } : {},
      ...vendor.verify ? { verify: vendor.verify } : {},
      ...vendor.handshake ? { handshake: vendor.handshake } : {}
    };
  }
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await kvWebhookCall(client, { method: "POST", path: kvWebhooksPath(target), idempotent: true, body }, target);
  return kvWebhookSecretResult(response, client, "create", target, runtime, target.kind === "card" && flagBool(args.flags, "signing"));
}, true);
var handleKvWebhookList = commandHandler(async (args, runtime, resolved) => {
  const target = kvWebhookTarget(args, "list");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await kvWebhookCall(client, { method: "GET", path: kvWebhooksPath(target) }, target);
  const items = response.body?.items;
  const list = Array.isArray(items) ? items : [];
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: target.kind === "card" ? ["Card webhooks (".concat(list.length, ")"), ...cardWebhookTableLines(list)].join("\n") : ["K/V webhooks (".concat(list.length, ")"), ...kvWebhookTableLines(list)].join("\n")
  };
}, true);
var handleKvWebhookRotateSecret = commandHandler(async (args, runtime, resolved) => {
  const target = kvWebhookTarget(args, "rotate-secret");
  const id = kvWebhookId(args.positionals[3], "rotate-secret", target);
  const signing = flagBool(args.flags, "signing");
  if (signing && target.kind === "app")
    throw usageError("--signing rotates a card webhook's signing secret: add --card CARD_ID.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await kvWebhookCall(client, {
    method: "POST",
    path: "".concat(kvWebhooksPath(target), "/").concat(id, "/rotate-secret"),
    idempotent: true,
    ...signing ? { body: { signing: true } } : {}
  }, target, id);
  return kvWebhookSecretResult(response, client, "rotate", target, runtime, signing);
}, true);
var handleKvWebhookUpdate = commandHandler(async (args, runtime, resolved) => {
  const target = kvWebhookTarget(args, "update");
  if (target.kind !== "card")
    throw usageError("kv webhook update changes a card webhook: add --card CARD_ID.");
  const id = kvWebhookId(args.positionals[3], "update", target);
  const description = flagString(args.flags, "description");
  const keyTemplate = flagString(args.flags, "key-template");
  const map = flagString(args.flags, "map");
  if (flagBool(args.flags, "signing") && flagString(args.flags, "verify") !== void 0)
    throw usageError("--verify and --signing exclude each other: a vendor signs with its own scheme, not ScreenRig-Signature.");
  singleStdin([["--map", map], ["--verify-secret-file", flagString(args.flags, "verify-secret-file")]]);
  const vendor = await verifyMembers(args, runtime, { create: false, subject: "the webhook" });
  const body = {
    ...keyTemplate !== void 0 ? { key_template: keyTemplate } : {},
    ...flagBool(args.flags, "clear-key-template") ? { key_template: "" } : {},
    ...description !== void 0 ? { description: kvWebhookDescription(description) } : {},
    ...map !== void 0 ? { mapping: kvWebhookMapping(await readAuthoringText(map, runtime, KV_WEBHOOK_MAPPING_MAX_BYTES)) } : {},
    ...flagBool(args.flags, "clear-map") ? { mapping: null } : {},
    ...flagBool(args.flags, "enable") ? { enabled: true } : {},
    ...flagBool(args.flags, "disable") ? { enabled: false } : {},
    ...flagBool(args.flags, "signing") ? { signing: true } : {},
    ...flagBool(args.flags, "no-signing") ? { signing: false } : {},
    ...vendor.verify !== void 0 ? { verify: vendor.verify } : {},
    ...vendor.handshake !== void 0 ? { handshake: vendor.handshake } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await kvWebhookCall(client, { method: "PATCH", path: "".concat(kvWebhooksPath(target), "/").concat(id), idempotent: true, body }, target, id);
  return cardWebhookSecretResult(response, client, response.body, "update", target);
}, true);
var handleKvWebhookDeliveries = commandHandler(async (args, runtime, resolved) => {
  const target = kvWebhookTarget(args, "deliveries");
  if (target.kind !== "card")
    throw usageError("kv webhook deliveries reads a card webhook's log: add --card CARD_ID.");
  const id = kvWebhookId(args.positionals[3], "deliveries", target);
  const limit = flagString(args.flags, "limit");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await kvWebhookCall(client, {
    method: "GET",
    path: "".concat(kvWebhooksPath(target), "/").concat(id, "/deliveries"),
    ...limit ? { query: { limit } } : {}
  }, target, id);
  const items = response.body?.items;
  const list = Array.isArray(items) ? items : [];
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Deliveries of ".concat(id, " (").concat(list.length, ")"), ...kvWebhookDeliveryTableLines(list)].join("\n")
  };
}, true);
var handleKvWebhookDelete = commandHandler(async (args, runtime, resolved) => {
  const target = kvWebhookTarget(args, "delete");
  const id = kvWebhookId(args.positionals[3], "delete", target);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await kvWebhookCall(client, {
    method: "DELETE",
    path: "".concat(kvWebhooksPath(target), "/").concat(id),
    idempotent: true
  }, target, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: target.kind === "card" ? "Deleted card webhook ".concat(id, ". Its URL stopped working; the card keeps its document.") : "Deleted K/V webhook ".concat(id, ". Its URL stopped working; the key it wrote keeps its value.")
  };
}, true);

// dist/cli-commands/kv.js
var descriptionOption = (value) => {
  kvWebhookDescription(value);
  return value;
};
var CARD_VERIFY = { scope: "With --card", secret: "the webhook's srkw_ secret" };
function registerKvCommands(root, bind) {
  const kv = root.command("kv").description("Read and write application key-value data");
  kv.command("get").description("Read an application key").argument("<key>", "Application key").action(bind(handleKvGet));
  subcommand(kv, "set").description("Write a value").argument("<key>", "Application key").addOption(new Option("--json-value <JSON>", "Supply a JSON value").conflicts(["file", "valueBase64"])).addOption(new Option("--file <FILE>", "Read the value from a file, or - for stdin").conflicts(["jsonValue", "valueBase64"])).addOption(new Option("--value-base64 <BASE64>", "Supply canonical base64 bytes (may be empty)").conflicts(["jsonValue", "file"])).addOption(new Option("--content-type <TYPE>", "Content MIME type; defaults to application/octet-stream for bytes")).option("--expect-rev <REVISION>", "Require the current resource revision", revision).action(bind(handleKvSet));
  kv.command("delete").description("Delete an application key").argument("<key>", "Application key").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleKvDelete));
  kv.command("list").description("List application keys").action(bind(handleKvList));
  for (const command of kv.commands)
    command.requiredOption("--app-id <ID>", "Select the application's K/V namespace");
  const set = kv.commands.find((command) => command.name() === "set");
  requireOptionGroup(set, "exactlyOne", ["--json-value", "--file", "--value-base64"]);
  const webhook = kv.command("webhook").description("Let an outside system write one key, or keyed card documents, with an HTTP POST");
  addCommandNotes(webhook, "K/V webhooks:\n  A K/V webhook is a URL with its own srkw_ secret. An outside system (Zapier, Make,\n  a point of sale, a cron job, curl) posts to it with Authorization: Bearer <secret>,\n  or HTTP Basic with the webhook id and the secret. With --app-id the raw body\n  becomes the value of one application key and its Content-Type the content type;\n  apps read the key with screenrig.kv.get and see each change with\n  screenrig.kv.onChange. With --card the JSON or form body becomes the data\n  document of a card, as it is or through a --map template, and the card's own\n  validation decides whether it is shown. With --key-template the mapped object\n  contains documents, each with fields and document; use the same template as the placement data to select by screen field.\n  Retry an interrupted batch with the identical body and Idempotency-Key.\n  A card webhook also takes posts straight from GitHub, Stripe, Shopify, Slack,\n  Linear, Vercel, Asana and any sender that signs with an HMAC, with no relay:\n  --verify VENDOR --verify-secret-file FILE makes the vendor's own signature\n  authenticate a post, and the srkw_ secret keeps working beside it.\n  --handshake VENDOR answers the setup challenge of Microsoft Graph, monday.com,\n  Trello or Azure Event Grid. Bodies may be JSON, a form or multipart (each text\n  field is body.FIELD; file parts are ignored and counted).\n  An application or a card has at most 20\n  webhooks.");
  webhook.command("create").description("Create a K/V or card webhook and print its URL and secret").argument("[key]", "With --app-id: the key every post writes; it need not exist yet").option("--description <TEXT>", "Say what sends to it, at most 200 bytes", descriptionOption).option("--map <FILE>", "With --card: the template that builds the card's data document from the posted body, a JSON file or - for stdin").option("--key-template <TEMPLATE>", "With --card: write documents keyed by fields, for example room-{screen.field.room}").option("--signing", "With --card: also require a ScreenRig-Signature header on every post, and print the signing secret once").action(bind(handleKvWebhookCreate));
  addVerifyOptions(webhook.commands.find((command) => command.name() === "create"), CARD_VERIFY, false);
  webhook.command("list").description("List the webhooks of an application or a card").action(bind(handleKvWebhookList));
  webhook.command("rotate-secret").description("Replace a webhook's secret; the old one stops working at once").argument("<webhook_id>", "K/V webhook identifier").option("--signing", "With --card: replace the signing secret instead of the webhook secret").action(bind(handleKvWebhookRotateSecret));
  webhook.command("delete").description("Delete a webhook; its URL stops working and the key or card keeps its value").argument("<webhook_id>", "K/V webhook identifier").action(bind(handleKvWebhookDelete));
  for (const command of webhook.commands) {
    command.option("--app-id <ID>", "Select the application whose key the webhook writes");
    command.option("--card <CARD_ID>", "Select the card whose data document the webhook writes");
    requireOptionGroup(command, "exactlyOne", ["--app-id", "--card"]);
  }
  webhook.command("update").description("Change a card webhook: description, mapping, enabled state, signing, vendor verification or handshake").argument("<webhook_id>", "K/V webhook identifier").requiredOption("--card <CARD_ID>", "Select the card the webhook writes").option("--description <TEXT>", "Say what sends to it, at most 200 bytes", descriptionOption).addOption(new Option("--map <FILE>", "Replace the template that builds the card's data document, a JSON file or - for stdin").conflicts(["clearMap"])).addOption(new Option("--clear-map", "Remove the template: the posted object becomes the document").conflicts(["map"])).addOption(new Option("--key-template <TEMPLATE>", "Write keyed documents using fields from the mapped documents array").conflicts(["clearKeyTemplate"])).addOption(new Option("--clear-key-template", "Return to writing the card instance document").conflicts(["keyTemplate"])).addOption(new Option("--enable", "Accept posts again").conflicts(["disable"])).addOption(new Option("--disable", "Answer every post like a wrong secret until enabled again").conflicts(["enable"])).option("--signing", "Require a ScreenRig-Signature header and print the new signing secret once").option("--no-signing", "Stop requiring a ScreenRig-Signature header").action(bind(handleKvWebhookUpdate));
  const updateCommand = webhook.commands.find((command) => command.name() === "update");
  addVerifyOptions(updateCommand, CARD_VERIFY, true);
  requireOptionGroup(updateCommand, "atLeastOne", [
    "--description",
    "--map",
    "--clear-map",
    "--key-template",
    "--clear-key-template",
    "--enable",
    "--disable",
    "--signing",
    "--no-signing",
    "--verify",
    "--clear-verify",
    "--handshake",
    "--clear-handshake"
  ]);
  webhook.command("deliveries").description("Read a card webhook's delivery log: why each post was written, unchanged or refused").argument("<webhook_id>", "K/V webhook identifier").requiredOption("--card <CARD_ID>", "Select the card the webhook writes").option("--limit <N>", "How many deliveries, newest first (1 to 100)", kvWebhookDeliveriesLimit).action(bind(handleKvWebhookDeliveries));
}

// dist/source-presets.js
var SOURCE_PRESETS_PATH = "/api/source-presets";
var SOURCE_PRESET_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
function sourcePresetName(value) {
  if (!SOURCE_PRESET_NAME_PATTERN.test(value)) {
    throw usageError("A preset name is lower-case words joined by hyphens, such as slack-channel.", { command: "screenrig source presets", reason: "List the presets and their names." });
  }
  return value;
}
function sourcePresetOption(value) {
  return sourcePresetName(value);
}
function presetSettingValue(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return text;
  }
  return parsed === null || typeof parsed === "object" || typeof parsed === "string" ? parsed : text;
}
function presetCardTypes(preset) {
  const cards = preset.cards ?? [];
  return [...cards.filter((card) => card.default), ...cards.filter((card) => !card.default)].map((card) => card.type);
}
function durationText(seconds) {
  if (seconds % 86400 === 0)
    return "".concat(seconds / 86400, "d");
  if (seconds % 3600 === 0)
    return "".concat(seconds / 3600, "h");
  if (seconds % 60 === 0)
    return "".concat(seconds / 60, "m");
  return "".concat(seconds, "s");
}
function sourcePresetTableLines(items) {
  if (!items.length)
    return ["No source presets"];
  return table(["NAME", "TITLE", "CARD", "CATEGORY"], items.map((item) => [item.name, item.title, presetCardTypes(item).join(", "), item.category]));
}
function fieldLines(fields, indent) {
  return fields.flatMap((field) => {
    const detail = [
      field.example !== void 0 ? "example: ".concat(field.example) : "",
      field.default !== void 0 ? "default: ".concat(field.default) : "",
      field.pattern ? "pattern: ".concat(field.pattern) : "",
      field.max_length ? "at most ".concat(field.max_length, " characters") : ""
    ].filter(Boolean);
    return [
      "".concat(indent).concat(field.name, " (").concat(field.type).concat(field.required ? ", required" : "", "): ").concat(field.label),
      ...field.help ? ["".concat(indent, "  ").concat(field.help)] : [],
      ...detail.length ? ["".concat(indent, "  ").concat(detail.join("; "))] : [],
      ...field.options?.length ? ["".concat(indent, "  one of: ").concat(field.options.map((option) => option.value === option.label ? option.value : "".concat(option.value, " (").concat(option.label, ")")).join(", "))] : [],
      ...field.type === "list" ? ["".concat(indent, "  a JSON array of ").concat(field.min_items ?? 0, " to ").concat(field.max_items ?? "any number of", " items, each an object with:"), ...fieldLines(field.fields ?? [], "".concat(indent, "    "))] : []
    ];
  });
}
function shellWord(value) {
  return /^[A-Za-z0-9_.\/:@%+=,-]+$/.test(value) ? value : "'".concat(value.replaceAll("'", "'\\''"), "'");
}
function exampleSet(field) {
  if (field.type === "list") {
    const item = Object.fromEntries((field.fields ?? []).filter((member) => member.required).map((member) => [member.name, member.example ?? "VALUE"]));
    return "--set ".concat(field.name, "=").concat(shellWord(JSON.stringify([item])));
  }
  return "--set ".concat(field.name, "=").concat(shellWord(field.example ?? "VALUE"));
}
function sourcePresetLines(preset) {
  if (!preset)
    return [];
  const cards = presetCardTypes(preset);
  const required = preset.fields.filter((field) => field.required);
  const neededSecrets = preset.secrets.filter((secret) => secret.required);
  return [
    "name: ".concat(preset.name),
    "title: ".concat(preset.title),
    "category: ".concat(preset.category),
    "description: ".concat(preset.description),
    "kind: ".concat(preset.kind),
    "cards: ".concat(cards.map((card, index) => index === 0 && cards.length > 1 ? "".concat(card, " (the one it is made for)") : card).join(", "), "; --card names an instance of ").concat(cards.length === 1 ? "that card" : "one of them", " (card create)"),
    "refresh: every ".concat(durationText(preset.refresh_seconds), " (at least ").concat(durationText(preset.min_refresh_seconds), "); the card keeps its last good data for ").concat(durationText(preset.stale_after_seconds), " when the source cannot refresh"),
    "data: ".concat(preset.attribution?.text ?? "").concat(preset.attribution?.terms ? " Terms: ".concat(preset.attribution.terms) : ""),
    ...preset.docs ? ["docs: https://screenrig.ai".concat(preset.docs.startsWith("/") ? preset.docs : "/".concat(preset.docs))] : [],
    "",
    ...preset.fields.length ? ["Fields (--set FIELD=VALUE, or --settings JSON; a list takes a JSON array):", ...fieldLines(preset.fields, "  ")] : ["Fields: none"],
    "",
    ...preset.secrets.length ? ["Secrets (--secret NAME=@FILE, or NAME=- for stdin):", ...preset.secrets.flatMap((secret) => [
      "  ".concat(secret.name, " (").concat(secret.required ? "required" : "optional", "): ").concat(secret.label),
      ...secret.help ? ["    ".concat(secret.help)] : [],
      ...secret.how_to_get ? ["    how to get it: ".concat(secret.how_to_get)] : []
    ])] : ["Secrets: none; the data is public."],
    "",
    "Next: screenrig source test --preset ".concat(preset.name, " --card crd_CARD").concat(required.map((field) => " ".concat(exampleSet(field))).join("")).concat(neededSecrets.map((secret) => " --secret ".concat(secret.name, "=@FILE")).join("")),
    "Then the same command as source create, with --name."
  ];
}
function presetProblem(error, name) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  if (error.problem.code === "not_found" && name !== void 0) {
    return new CliError({ ...error.problem, next: { command: "screenrig source presets", reason: "List the presets and their names." } }, error.exitCode, error.warnings);
  }
  return error;
}
async function presetCall(client, path5, name) {
  try {
    return await client.call({ method: "GET", path: path5 });
  } catch (error) {
    throw presetProblem(error, name);
  }
}
var handleSourcePresets = commandHandler(async (args, runtime, resolved) => {
  const name = args.positionals[2] !== void 0 ? sourcePresetName(args.positionals[2]) : void 0;
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (name === void 0) {
    const response2 = await presetCall(client, SOURCE_PRESETS_PATH);
    const items = response2.body?.items;
    const list = Array.isArray(items) ? items : [];
    return {
      envelope: jsonBody(response2, client.requestId),
      exitCode: ExitCode.Success,
      human: ["Source presets (".concat(list.length, ")"), ...sourcePresetTableLines(list), "", "Next: screenrig source presets NAME shows a preset's fields, its secrets and how to get them."].join("\n")
    };
  }
  const response = await presetCall(client, "".concat(SOURCE_PRESETS_PATH, "/").concat(name), name);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Source preset", ...sourcePresetLines(response.body)].join("\n")
  };
});

// dist/sources.js
var SOURCE_ID_PATTERN = /^(?:(?:stage|qa|development)_)?src_[A-Za-z0-9_-]+$/;
var SOURCE_KINDS = ["ics", "sheets", "csv", "json", "microsoft365", "google_calendar", "square", "shopify", "momentus", "toast"];
var CONNECTION_KINDS = ["microsoft365", "google_calendar"];
var SOURCE_REFRESH_MIN_S = 30;
var SOURCE_REFRESH_MAX_S = 86400;
var SOURCE_STALE_MIN_S = 60;
var SOURCE_STALE_MAX_S = 604800;
var SECRET_NAME_PATTERN = /^[a-z0-9][A-Za-z0-9_.-]{0,63}$/;
var SECRET_NAME_RULE = "A secret name starts with a lower-case letter or digit, then letters, digits, . _ and -, up to 64 characters, such as calendar_url.lobby or header.X-Api-Key.";
var INPUT_MAX_BYTES = 1 << 20;
var SOURCES_PATH = "/api/sources";
function sourceId(value, command) {
  if (!value)
    throw usageError("source ".concat(command, " requires <source_id>."));
  if (!SOURCE_ID_PATTERN.test(value)) {
    throw usageError("A source id looks like src_ followed by letters, digits, - or _.", {
      command: "screenrig source list",
      reason: "List this project's data sources and their ids."
    });
  }
  return value;
}
function sourceName(value) {
  const trimmed = value.trim();
  if (!trimmed || [...trimmed].length > 80 || new RegExp("\\p{Cc}", "u").test(trimmed)) {
    throw usageError("--name must be 1 to 80 characters of text.");
  }
  return trimmed;
}
function durationSeconds(value) {
  const match = /^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(value.trim());
  return match && value.trim() !== "" ? Number(match[1] ?? 0) * 86400 + Number(match[2] ?? 0) * 3600 + Number(match[3] ?? 0) * 60 + Number(match[4] ?? 0) : NaN;
}
function sourceStaleAfterSeconds(value) {
  if (value.trim().toLowerCase() === "none")
    return null;
  const seconds = durationSeconds(value);
  if (!Number.isSafeInteger(seconds) || seconds < SOURCE_STALE_MIN_S || seconds > SOURCE_STALE_MAX_S) {
    throw usageError("--stale-after takes 1m to 7d, such as 30m, 2h or 1d, or none.");
  }
  return seconds;
}
function sourceStaleAfterOption(value) {
  sourceStaleAfterSeconds(value);
  return value;
}
function sourceRefreshSeconds(value) {
  const seconds = /\d+d/.test(value) ? NaN : durationSeconds(value);
  if (!Number.isSafeInteger(seconds) || seconds < SOURCE_REFRESH_MIN_S || seconds > SOURCE_REFRESH_MAX_S) {
    throw usageError("--refresh takes 30s to 24h, such as 30s, 5m, 1h or 1h30m.");
  }
  return seconds;
}
function sourceRefreshOption(value) {
  sourceRefreshSeconds(value);
  return value;
}
function accumulate(check) {
  return (value, previous) => {
    check(value);
    const list = previous === void 0 ? [] : JSON.parse(previous);
    return JSON.stringify([...list, value]);
  };
}
function accumulated(flags, name) {
  const raw = flagString(flags, name);
  return raw === void 0 ? [] : JSON.parse(raw);
}
function setPairCheck(value) {
  const at = value.indexOf("=");
  if (at < 1)
    throw usageError("--set takes KEY=VALUE, such as days=14 or time_zone=America/Vancouver.");
}
function secretPairCheck(value) {
  const at = value.indexOf("=");
  if (at < 1)
    throw usageError("--secret takes NAME=VALUE, NAME=@FILE or NAME=-, such as calendar_url.lobby=@lobby.url.");
  const name = value.slice(0, at);
  if (!SECRET_NAME_PATTERN.test(name))
    throw usageError(SECRET_NAME_RULE);
  if (value.slice(at + 1) === "")
    throw usageError("--secret ".concat(name, "= has no value; use NAME=@FILE or NAME=- to read it, or --unset-secret ").concat(name, " to remove it."));
}
function unsetSecretCheck(value) {
  if (!SECRET_NAME_PATTERN.test(value))
    throw usageError(SECRET_NAME_RULE);
}
function setValue(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
var Inputs = class {
  runtime;
  stdin;
  constructor(runtime) {
    this.runtime = runtime;
  }
  async text(option, file) {
    if (file === "-") {
      if (this.stdin !== void 0)
        throw usageError("".concat(option, " - cannot read stdin: another option already does. Give one option stdin and the others a file."));
      this.stdin = option;
    }
    return readAuthoringText(file, this.runtime, INPUT_MAX_BYTES);
  }
};
async function configFrom(source, inputs) {
  const trimmed = source.trim();
  const text = trimmed === "-" ? await inputs.text("--settings", "-") : trimmed.startsWith("@") ? await inputs.text("--settings", trimmed.slice(1)) : source;
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw usageError("--settings is not valid JSON. Give a JSON object, @FILE or - for stdin.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw usageError("--settings must be a JSON object.");
  return parsed;
}
function setMembers(pairs, read = setValue) {
  const members = /* @__PURE__ */ Object.create(null);
  for (const pair of pairs) {
    const at = pair.indexOf("=");
    const key = pair.slice(0, at);
    if (Object.hasOwn(members, key))
      throw usageError("--set ".concat(key, " is given twice."));
    members[key] = read(pair.slice(at + 1));
  }
  return { ...members };
}
async function secretsFrom(pairs, unset, inputs) {
  const secrets = {};
  for (const pair of pairs) {
    const at = pair.indexOf("=");
    const name = pair.slice(0, at);
    const raw = pair.slice(at + 1);
    if (Object.hasOwn(secrets, name))
      throw usageError("--secret ".concat(name, " is given twice."));
    const value = raw === "-" ? await inputs.text("--secret ".concat(name, "=-"), "-") : raw.startsWith("@") ? await inputs.text("--secret ".concat(name, "=@FILE"), raw.slice(1)) : raw;
    const clean = value.trim();
    if (!clean)
      throw usageError("The value for --secret ".concat(name, " is empty."));
    secrets[name] = clean;
  }
  for (const name of unset) {
    if (Object.hasOwn(secrets, name))
      throw usageError("".concat(name, " is both set with --secret and removed with --unset-secret."));
    secrets[name] = null;
  }
  return Object.keys(secrets).length ? secrets : void 0;
}
function setPairs(args) {
  const connection = flagString(args.flags, "connection-id");
  return [...accumulated(args.flags, "set"), ...connection !== void 0 ? ["connection_id=".concat(connection)] : []];
}
async function mergedConfig(args, inputs, saved) {
  const given = flagString(args.flags, "settings");
  const pairs = setPairs(args);
  if (given === void 0 && !pairs.length)
    return void 0;
  const base = given !== void 0 ? await configFrom(given, inputs) : await saved();
  return { ...base, ...setMembers(pairs) };
}
async function presetSettings(args, inputs) {
  const given = flagString(args.flags, "settings");
  return { ...given !== void 0 ? await configFrom(given, inputs) : {}, ...setMembers(accumulated(args.flags, "set"), presetSettingValue) };
}
async function savedEdit(args, inputs, read) {
  const given = flagString(args.flags, "settings");
  const pairs = setPairs(args);
  if (given === void 0 && !pairs.length)
    return {};
  const saved = await read();
  if (typeof saved.preset === "string" && saved.preset !== "") {
    if (flagString(args.flags, "connection-id") !== void 0)
      throw usageError("--connection-id applies to a microsoft365 or google_calendar source; this source is made from a preset.");
    return { settings: { ...given !== void 0 ? await configFrom(given, inputs) : {}, ...setMembers(pairs, presetSettingValue) } };
  }
  const base = given !== void 0 ? await configFrom(given, inputs) : saved.config ?? {};
  return { config: { ...base, ...setMembers(pairs) }, ...given === void 0 ? { readRevision: saved.revision } : {} };
}
async function sourceCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw sourceProblem(error, id);
  }
}
function revisionHeaders(revision2) {
  return revision2 === void 0 ? void 0 : { "if-match": quotedRevision(revision2) };
}
function namedSecret(problem) {
  for (const entry of problem.errors) {
    const field = entry?.field;
    if (typeof field === "string" && field.startsWith("secrets."))
      return field.slice("secrets.".length);
  }
  return void 0;
}
function namedSource(problem) {
  for (const entry of problem.errors) {
    const detail = entry?.detail;
    const match = typeof detail === "string" ? /\b((?:(?:stage|qa|development)_)?src_[A-Za-z0-9_-]+)/.exec(detail) : null;
    if (match)
      return match[1];
  }
  return void 0;
}
function sourceProblem(error, id) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  if (problem.next)
    return error;
  const withNext = (command, reason) => new CliError({ ...problem, next: { command, reason } }, error.exitCode, error.warnings);
  switch (problem.code) {
    case "source_target_taken": {
      const owner = namedSource(problem);
      return withNext(owner ? "screenrig source show ".concat(owner) : "screenrig source list", "One source writes one card. Change or delete the source that has this card, or point this source at another card. Nothing was created.");
    }
    case "source_target_unsupported":
      return withNext("screenrig card list", "List this project's cards. The detail names the card types this kind of source can fill; point the source at one of those.");
    case "source_secret_required": {
      const name = namedSecret(problem);
      return id && name ? withNext("screenrig source update ".concat(id, " --secret ").concat(name, "=@FILE"), "Enter ".concat(name, " again from a file (or - for stdin); a secret entered for one address or account is not carried to another.")) : withNext("screenrig help source create", name ? "Enter ".concat(name, " with --secret ").concat(name, "=@FILE (or - for stdin).") : "Enter each secret the kind needs with --secret NAME=@FILE.");
    }
    case "source_limit_reached":
      return withNext("screenrig source list", "An organization has at most 200 data sources across its projects. Delete one with screenrig source delete SOURCE_ID, then rerun create. Nothing was created.");
    case "source_has_no_rooms":
      return withNext("screenrig source list", "Only a source that reads a booking system's rooms (kind momentus) has a room mapping. Pick one of that kind.");
    case "source_busy":
      return withNext(id ? "screenrig source show ".concat(id) : "screenrig source list", "A scheduled sync is running. Wait for the retry interval, then refresh again; the sync updates the status on its own.");
    case "revision_conflict":
      return id ? withNext("screenrig source show ".concat(id), "Read the current revision, then rerun with --expect-rev REVISION if the change still applies.") : error;
    case "not_found":
      return id ? withNext("screenrig source list", "List this project's data sources; a deleted source does not come back.") : error;
    case "invalid_request":
      return problem.errors.some((entry) => entry?.field === "config") ? withNext(id ? "screenrig source show ".concat(id) : "screenrig source presets", "If this source is made from a preset, change its fields with --set FIELD=VALUE (or --settings): source show names its preset, and source presets NAME its fields. A config belongs to a source that has no preset.") : error;
    default:
      return error;
  }
}
function clip(text, width) {
  const chars = [...text];
  return chars.length > width ? "".concat(chars.slice(0, width - 1).join(""), "\u2026") : text;
}
function refreshText(seconds) {
  if (seconds % 3600 === 0)
    return "".concat(seconds / 3600, "h");
  if (seconds >= 3600)
    return "".concat(Math.floor(seconds / 3600), "h ").concat(Math.round(seconds % 3600 / 60), "m");
  if (seconds % 60 === 0)
    return "".concat(seconds / 60, "m");
  return "".concat(seconds, "s");
}
function statsText(stats) {
  return Object.entries(stats ?? {}).map(([name, value]) => "".concat(name, "=").concat(value)).join(", ");
}
function errorText(error) {
  return "".concat(error.code, ": ").concat(error.message, " (").concat(error.at, ")");
}
function sourceLines(source) {
  if (!source)
    return [];
  const status = source.status;
  const secrets = Object.entries(source.secrets ?? {});
  return [
    "id: ".concat(source.id),
    "name: ".concat(source.name),
    "kind: ".concat(source.kind),
    ...source.preset ? ["preset: ".concat(source.preset)] : [],
    "card_id: ".concat(source.target?.card_id),
    "enabled: ".concat(source.enabled),
    "refresh: ".concat(refreshText(source.refresh_seconds)),
    "stale_after: ".concat(source.stale_after_seconds === null || source.stale_after_seconds === void 0 ? "none (the last good data stays until the next refresh)" : refreshText(source.stale_after_seconds)),
    "revision: ".concat(source.revision),
    "state: ".concat(status.state),
    ...status.stale ? ["stale: true (the data has expired on screens; pages that depend on it have fallen back)"] : [],
    ...status.data_expires_at ? ["data_expires_at: ".concat(status.data_expires_at)] : [],
    ...status.last_attempt_at ? ["last_attempt_at: ".concat(status.last_attempt_at)] : [],
    ...status.last_success_at ? ["last_success_at: ".concat(status.last_success_at)] : [],
    ...status.last_change_at ? ["last_change_at: ".concat(status.last_change_at)] : [],
    ...status.next_run_at ? ["next_run_at: ".concat(status.next_run_at)] : [],
    "failures: ".concat(status.failures),
    ...status.error ? ["error: ".concat(errorText(status.error))] : [],
    ...Object.keys(status.stats ?? {}).length ? ["stats: ".concat(statsText(status.stats))] : [],
    ...status.warnings?.length ? ["warnings:", ...status.warnings.map((warning) => "  - ".concat(warning))] : [],
    ...secrets.length ? ["secrets:", ...secrets.map(([name, view]) => "  ".concat(name, ": ").concat(view.hint))] : [],
    ...source.preset && source.settings ? ["settings: ".concat(clip(JSON.stringify(source.settings), 400))] : [],
    "config: ".concat(clip(JSON.stringify(source.config ?? {}), 400))
  ];
}
function sourceTableLines(items) {
  if (!items.length)
    return ["No data sources"];
  return table(["ID", "NAME", "KIND", "CARD", "STATE", "LAST OK", "NEXT", "ERROR"], items.map((item) => [
    item.id,
    clip(item.name, 30),
    item.kind,
    item.target?.card_id ?? "",
    item.status.state,
    item.status.last_success_at ?? "",
    item.status.next_run_at ?? "",
    item.status.error?.code ?? ""
  ]));
}
var PREVIEW_LINES = 60;
function sourceTestLines(result) {
  if (!result)
    return [];
  const rendered = JSON.stringify(result.document ?? {}, null, 2).split("\n");
  return [
    result.valid ? "The card accepts this document." : "The card refuses this document at ".concat(result.validation_error?.path || "the document", ": ").concat(result.validation_error?.reason ?? "invalid"),
    "fetched_at: ".concat(result.fetched_at),
    ...result.request ? [
      "request: ".concat(result.request.method, " ").concat(result.request.url).concat(result.request.pages > 1 ? " (".concat(result.request.pages, " pages read)") : ""),
      ...result.request.headers?.length ? ["  headers sent: ".concat(result.request.headers.join(", "), " (names only)")] : [],
      ...result.request.body ? ["  body: ".concat(clip(result.request.body, 200))] : []
    ] : [],
    ...Object.keys(result.stats ?? {}).length ? ["stats: ".concat(statsText(result.stats))] : [],
    ...result.warnings?.length ? ["warnings:", ...result.warnings.map((warning) => "  - ".concat(warning))] : [],
    "document:",
    ...rendered.slice(0, PREVIEW_LINES).map((line) => "  ".concat(line)),
    ...rendered.length > PREVIEW_LINES ? ["  \u2026 ".concat(rendered.length - PREVIEW_LINES, " more lines (the JSON envelope has the whole document)")] : []
  ];
}
function sourceListLines(page) {
  const items = Array.isArray(page?.items) ? page.items : [];
  const next = typeof page?.next_cursor === "string" && page.next_cursor ? page.next_cursor : void 0;
  return ["Data sources (".concat(items.length, ")"), ...sourceTableLines(items), ...next ? ["next: screenrig source list --after ".concat(next)] : []];
}
var handleSourceList = commandHandler(async (args, runtime, resolved) => {
  const after = flagString(args.flags, "after");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await sourceCall(client, { method: "GET", path: SOURCES_PATH, query: after !== void 0 ? { after } : {} });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: sourceListLines(response.body).join("\n")
  };
});
var handleSourceShow = commandHandler(async (args, runtime, resolved) => {
  const id = sourceId(args.positionals[2], "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await sourceCall(client, { method: "GET", path: "".concat(SOURCES_PATH, "/").concat(id) }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Data source", ...sourceLines(response.body)].join("\n")
  };
});
var handleSourceCreate = commandHandler(async (args, runtime, resolved) => {
  const inputs = new Inputs(runtime);
  const refresh = flagString(args.flags, "refresh");
  const staleAfter = flagString(args.flags, "stale-after");
  const kind = flagString(args.flags, "kind");
  const preset = flagString(args.flags, "preset");
  if (kind === void 0 === (preset === void 0))
    throw usageError("source create takes --kind, or --preset NAME for a ready-made configuration (screenrig source presets), and not both.");
  const connection = flagString(args.flags, "connection-id");
  if (connection !== void 0 && preset !== void 0)
    throw usageError("--connection-id applies to a microsoft365 or google_calendar source, not to a preset.");
  if (connection !== void 0 && (kind === void 0 || !CONNECTION_KINDS.includes(kind))) {
    throw usageError("--connection-id applies to a microsoft365 or google_calendar source: it reads through a project connection (screenrig connection list) instead of credentials of its own.");
  }
  const members = preset !== void 0 ? { preset, settings: await presetSettings(args, inputs) } : { kind, config: await mergedConfig(args, inputs, async () => ({})) ?? {} };
  const secrets = await secretsFrom(accumulated(args.flags, "secret"), [], inputs);
  const body = {
    name: sourceName(flagString(args.flags, "name") ?? ""),
    ...members,
    target: { card_id: flagString(args.flags, "card") },
    ...secrets ? { secrets } : {},
    ...refresh !== void 0 ? { refresh_seconds: sourceRefreshSeconds(refresh) } : {},
    ...staleAfter !== void 0 ? { stale_after_seconds: sourceStaleAfterSeconds(staleAfter) } : {},
    ...flagBool(args.flags, "disabled") ? { enabled: false } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await sourceCall(client, { method: "POST", path: SOURCES_PATH, idempotent: true, body });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Created data source", ...sourceLines(response.body)].join("\n")
  };
});
var handleSourceUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = sourceId(args.positionals[2], "update");
  const inputs = new Inputs(runtime);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const name = flagString(args.flags, "name");
  const card = flagString(args.flags, "card");
  const refresh = flagString(args.flags, "refresh");
  const staleAfter = flagString(args.flags, "stale-after");
  const expect = flagString(args.flags, "expect-rev");
  const edit = await savedEdit(args, inputs, async () => (await sourceCall(client, { method: "GET", path: "".concat(SOURCES_PATH, "/").concat(id) }, id)).body);
  const readRevision = edit.readRevision;
  const secrets = await secretsFrom(accumulated(args.flags, "secret"), accumulated(args.flags, "unset-secret"), inputs);
  const body = {
    ...name !== void 0 ? { name: sourceName(name) } : {},
    ...card !== void 0 ? { target: { card_id: card } } : {},
    ...edit.config !== void 0 ? { config: edit.config } : {},
    ...edit.settings !== void 0 ? { settings: edit.settings } : {},
    ...secrets ? { secrets } : {},
    ...refresh !== void 0 ? { refresh_seconds: sourceRefreshSeconds(refresh) } : {},
    ...staleAfter !== void 0 ? { stale_after_seconds: sourceStaleAfterSeconds(staleAfter) } : {},
    ...flagBool(args.flags, "enable") ? { enabled: true } : {},
    ...flagBool(args.flags, "disable") ? { enabled: false } : {}
  };
  if (!Object.keys(body).length) {
    throw usageError("source update requires at least one change: --name, --card, --settings, --set, --connection-id, --secret, --unset-secret, --refresh, --stale-after, --enable or --disable.");
  }
  const response = await sourceCall(client, {
    method: "PATCH",
    path: "".concat(SOURCES_PATH, "/").concat(id),
    idempotent: true,
    body,
    headers: revisionHeaders(expect ?? (readRevision !== void 0 ? String(readRevision) : void 0)),
    // A merge derives its guard from a fresh read, so a rerun fingerprints differently.
    ...readRevision !== void 0 ? { recoverySupersede: JSON.stringify(["source update", id]) } : {}
  }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Updated data source ".concat(id), ...sourceLines(response.body)].join("\n")
  };
});
var handleSourceTest = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  const kind = flagString(args.flags, "kind");
  const card = flagString(args.flags, "card");
  const preset = flagString(args.flags, "preset");
  const connection = flagString(args.flags, "connection-id");
  if (id !== void 0) {
    sourceId(id, "test");
    if (preset !== void 0)
      throw usageError("--preset describes a source that is not saved: a saved source already has its preset, and --set changes its fields for this preview.");
  } else if (card === void 0 || kind === void 0 && preset === void 0) {
    throw usageError("source test takes a saved <source_id>, or --kind and --card (--preset NAME instead of --kind) to preview a source that is not saved.");
  }
  if (connection !== void 0 && preset !== void 0)
    throw usageError("--connection-id applies to a microsoft365 or google_calendar source, not to a preset.");
  if (connection !== void 0 && kind !== void 0 && !CONNECTION_KINDS.includes(kind)) {
    throw usageError("--connection-id applies to a microsoft365 or google_calendar source: it reads through a project connection (screenrig connection list) instead of credentials of its own.");
  }
  const inputs = new Inputs(runtime);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let edit;
  if (preset !== void 0)
    edit = { settings: await presetSettings(args, inputs) };
  else if (id === void 0)
    edit = { config: await mergedConfig(args, inputs, async () => ({})) };
  else
    edit = await savedEdit(args, inputs, async () => (await sourceCall(client, { method: "GET", path: "".concat(SOURCES_PATH, "/").concat(id) }, id)).body);
  const secrets = await secretsFrom(accumulated(args.flags, "secret"), [], inputs);
  const body = {
    ...id !== void 0 ? { source_id: id } : {},
    ...kind !== void 0 ? { kind } : {},
    ...preset !== void 0 ? { preset } : {},
    ...card !== void 0 ? { target: { card_id: card } } : {},
    ...edit.config !== void 0 ? { config: edit.config } : {},
    ...edit.settings !== void 0 ? { settings: edit.settings } : {},
    ...secrets ? { secrets } : {}
  };
  const response = await sourceCall(client, { method: "POST", path: "".concat(SOURCES_PATH, "/test"), body }, id);
  const result = response.body;
  const warnings = result && !result.valid ? [{ code: "source_document_refused", message: "The card refuses this document at ".concat(result.validation_error?.path || "the document", ": ").concat(result.validation_error?.reason ?? "invalid", ". Nothing was written; fix the config or the card and test again.") }] : [];
  return {
    envelope: jsonBody(response, client.requestId, void 0, warnings),
    exitCode: ExitCode.Success,
    human: ["Preview (nothing was saved or written)", ...sourceTestLines(result)].join("\n")
  };
});
var handleSourceRefresh = commandHandler(async (args, runtime, resolved) => {
  const id = sourceId(args.positionals[2], "refresh");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await sourceCall(client, { method: "POST", path: "".concat(SOURCES_PATH, "/").concat(id, "/refresh"), timeout_ms: 75e3 }, id);
  const source = response.body;
  const failed = source?.status.state === "error";
  return {
    envelope: jsonBody(response, client.requestId, void 0, failed && source?.status.error ? [{ code: "source_sync_failed", message: "The sync failed: ".concat(source.status.error.message, " The card keeps its last good document.") }] : []),
    exitCode: ExitCode.Success,
    human: [failed ? "Synced data source ".concat(id, ": failed") : "Synced data source ".concat(id), ...sourceLines(source)].join("\n")
  };
});
function sourceRoomsLines(report) {
  if (!report)
    return [];
  const summary = report.summary;
  const lines = [
    "source_id: ".concat(report.source_id),
    ...report.rooms_as_of ? ["rooms_as_of: ".concat(report.rooms_as_of)] : [],
    ...report.room_key_prefix ? ["rooms: screens name a room in the ".concat(report.room_field, " field; a card's data key is ").concat(report.room_key_prefix, "{screen.field.").concat(report.room_field, "}")] : [],
    ...report.area_key_prefix ? ["areas: screens name an area in the ".concat(report.area_field, " field; a card's data key is ").concat(report.area_key_prefix, "{screen.field.").concat(report.area_field, "}")] : [],
    "rooms ".concat(summary.rooms, " (").concat(summary.unmapped_rooms, " no screen shows), areas ").concat(summary.areas, " (").concat(summary.unmapped_areas, " no screen shows), screens ").concat(summary.screens, " (").concat(summary.missing_screens, " without a value, ").concat(summary.unknown_screens, " naming no room or area)"),
    ...report.warnings.length ? ["warnings:", ...report.warnings.map((warning) => "  - ".concat(warning))] : []
  ];
  const unmappedRooms = report.rooms.filter((room) => room.status === "unmapped");
  if (unmappedRooms.length) {
    lines.push("", "Rooms no screen shows", ...table(["KEY", "NAME", "CODE", "AREA"], unmappedRooms.map((room) => [room.key, clip(room.name ?? "", 30), room.code ?? "", room.area ?? ""])));
  }
  const unmappedAreas = report.areas.filter((area) => area.status === "unmapped");
  if (unmappedAreas.length) {
    lines.push("", "Areas no screen shows", ...table(["KEY", "NAME", "ROOMS"], unmappedAreas.map((area) => [area.key, clip(area.name, 30), String(area.rooms)])));
  }
  const problems = report.screens.filter((screen) => screen.status !== "mapped");
  if (problems.length) {
    lines.push("", "Screens to fix", ...table(["SCREEN", "NAME", "FIELD", "VALUE", "PROBLEM", "SUGGESTION"], problems.map((screen) => [
      screen.id,
      clip(screen.name, 30),
      screen.field,
      screen.value ?? "",
      screen.status === "missing" ? "no value" : "no such " + screen.kind,
      screen.suggestion ?? ""
    ])));
  }
  if (!unmappedRooms.length && !unmappedAreas.length && !problems.length)
    lines.push("", "Every room is shown and every screen names one.");
  return lines;
}
var handleSourceRooms = commandHandler(async (args, runtime, resolved) => {
  const id = sourceId(args.positionals[2], "rooms");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await sourceCall(client, { method: "GET", path: "".concat(SOURCES_PATH, "/").concat(id, "/rooms") }, id);
  const report = response.body;
  const warnings = [];
  if (report && report.summary.unmapped_rooms > 0)
    warnings.push({ code: "source_rooms_unmapped", message: "".concat(report.summary.unmapped_rooms, " room(s) of the source are shown by no screen.") });
  if (report && report.summary.missing_screens + report.summary.unknown_screens > 0)
    warnings.push({ code: "source_screens_unmapped", message: "".concat(report.summary.missing_screens + report.summary.unknown_screens, " screen(s) read a room or area and have no room the source offers. Fix them with screen update SCREEN_ID --field NAME=VALUE.") });
  return {
    envelope: jsonBody(response, client.requestId, void 0, warnings),
    exitCode: ExitCode.Success,
    human: ["Room mapping", ...sourceRoomsLines(report)].join("\n")
  };
});
var handleSourceDelete = commandHandler(async (args, runtime, resolved) => {
  const id = sourceId(args.positionals[2], "delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await sourceCall(client, {
    method: "DELETE",
    path: "".concat(SOURCES_PATH, "/").concat(id),
    idempotent: true,
    headers: revisionHeaders(flagString(args.flags, "expect-rev"))
  }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: "Deleted data source ".concat(id, ". The card keeps the last document the source wrote.")
  };
});

// dist/cli-commands/sources.js
var nameOption = (value) => sourceName(value);
var CONFIG_HELP = "The source's config (the kind's settings) as a JSON object, @FILE to read it from a file, or - for stdin. With --preset: the preset's fields (source presets NAME)";
var SET_HELP = 'Set one top-level config member (repeatable): the value is JSON when it parses (days=14, calendars=\'[{"key":"lobby"}]\'), else text (time_zone=America/Vancouver). With --preset: one field of the preset, text as written unless it is a JSON array or object (a list field\'s items)';
var PRESET_HELP = "Make the source from a ready-made, tested preset (source presets lists them): --set and --settings then give the preset's fields and --secret its credentials, instead of --kind and a config";
var CONNECTION_HELP = "microsoft365 and google_calendar: read through a project connection (pcn_..., screenrig connection list) instead of tenant, client_id and a secret of this source's own; sets the connection_id member";
var STALE_HELP = "How long the card keeps the last good data when the source cannot refresh, 1m to 7d, or none to keep it until the next refresh. After that the data expires on every screen and pages that depend on it fall back (momentus defaults to 30m)";
var SECRET_HELP = "A credential by name (repeatable): NAME=@FILE reads it from a file, NAME=- from stdin (at most one option reads stdin), NAME=VALUE is the literal value. Stored sealed and shown back only as a masked hint";
function registerSourceCommands(root, bind) {
  const source = root.command("source").description("Keep a card live from an outside address, such as a calendar");
  addCommandNotes(source, [
    "Data sources:",
    "  A data source reads an outside address on a schedule and writes the result to",
    "  one card's dynamic properties, so the card stays current without anyone",
    "  republishing: screens refetch the document when it changes. One source writes",
    "  one card, and an organization has at most 200 across its projects. Kinds: ics (iCalendar and webcal://",
    "  addresses: Google, Outlook, iCloud and Nextcloud calendars into an events card,",
    "  or a study-rooms card with one room per calendar), sheets, csv, json,",
    "  microsoft365, google_calendar, momentus, square, shopify and toast.",
    "  Create the card first (card create), preview with source test, then source",
    "  create. A fetch or validation failure never writes and keeps the last good documents;",
    "  the status shows the error. Status ok means the last fetch succeeded and the card",
    "  accepted the document; it does not judge whether the upstream data is right or",
    "  current, nor whether any screen shows the card.",
    "  A calendar address is a credential. Give it as --secret calendar_url.KEY=@FILE",
    "  (or - for stdin) so it stays out of your shell history and process list; it is",
    "  stored sealed and shown back only as scheme and host.",
    "  A sheets, csv or json source fills any card: its settings carry a mapping that",
    "  builds the card's data from the rows (rows, columns, by_key) or the JSON answer",
    "  (body, by_key). A Google Sheet needs no key: share it with Anyone with the link, or",
    "  publish it to the web. A token or API key for a csv or json address goes as",
    "  --secret token=@FILE and is sent only to the address's own origin. Preview a",
    "  mapping with source test before source create. Set key_template to, for example,",
    "  room-{screen.field.room} to write a mapped documents array of {fields,document}",
    "  objects. Use the same template as the card placement data; each screen reads",
    "  only the key filled from its own fields. A failed storage write can leave a",
    "  partial batch; refresh again to resume.",
    "  A microsoft365 or google_calendar source reads meeting-room calendars into a room",
    "  or room-board card with your own Microsoft Entra app (--secret client_secret=@FILE)",
    "  or Google service account (--secret service_account_key=@FILE, the JSON key file).",
    "  They only read: source test shows the bookings and per-room counts it read.",
    "  A momentus source reads the functions and spaces of a Momentus Enterprise venue",
    "  (formerly Ungerboeck, EBMS) with an API user (--secret api_key=@FILE and",
    "  --secret api_secret=@FILE, both GUIDs; settings base_url, organization, api_user).",
    "  It fills an events, room-board or room card, and with room_key_prefix it also",
    "  writes a document per room for each screen to read through its own room field;",
    "  source rooms lists the rooms no screen shows and the screens that name no room.",
    "  A source that cannot refresh keeps its last good data for --stale-after (30m for",
    "  momentus), then the data expires on every screen and pages that depend on it",
    "  fall back; notifications on source_failed and source_stale say when.",
    "  A square or shopify source reads a till's menu into a menu or price-matrix card",
    "  with the merchant's token (--secret access_token=@FILE; shopify also takes",
    "  client_secret with a client_id setting). Sold-out items follow the till.",
    "  A toast source reads a restaurant's menus the same way (settings restaurant, the",
    "  location's GUID that Toast e-mails with its API credentials, client_id and",
    "  environment; --secret client_secret=@FILE) into a menu or price-matrix card.",
    "  A csv or json source can send the request an API expects. Its settings: method",
    "  (GET or POST), body (a JSON object, or text; body_format json or form) or graphql",
    "  {query, variables}, headers (up to 8 plain ones), auth (none, bearer, header,",
    "  basic, oauth2 or token_request), pagination {type link_header, next_url, cursor",
    "  or page, max_pages}, time_zone, and for json format auto, json, csv or xml (an",
    "  RSS or Atom feed also gives body.items). {{now}}, {{today}} and {{unix}}, with an",
    "  offset such as {{today-1d}}, fill in the address, body and headers on every run.",
    "  Secrets are named for what they are: token (bearer or header auth), password",
    "  (basic auth, with a username setting), client_secret (oauth2, and what a",
    "  token_request body reads as {{secrets.client_secret}}), header.NAME (a secret",
    "  request header, such as header.X-Api-Key) and query.NAME (a secret query",
    "  parameter, sent as NAME=value and shown in a preview as NAME=***). source test",
    "  shows the request that went out as data.request: its address, the header names",
    "  and the start of the body, never a secret.",
    "  ics, microsoft365, google_calendar and momentus sources take include and exclude:",
    "  1 to 20 keywords each, matched against event titles only, without regard to case",
    "  or accents. An event stays when it matches an include keyword (if any is set)",
    "  and no exclude keyword; stats.filtered counts the ones removed.",
    "  A microsoft365 or google_calendar source may read through a project connection",
    "  (--connection-id pcn_...; connection create) instead of credentials of its own.",
    "  A preset is a ready-made, tested json source for one service (a Slack channel, a",
    "  job board, a build board): source presets lists them with the card each fills,",
    "  source presets NAME shows its fields, its secrets and how to get them, and",
    "  source create --preset NAME --card crd_... --name N --set FIELD=VALUE",
    "  --secret NAME=@FILE makes the source (source test --preset previews it first).",
    "  The settings of each kind, the status codes and the privacy rules are at",
    "  https://screenrig.ai/docs/sources."
  ].join("\n"));
  const list = source.command("list").description("List this project's data sources with their status").option("--after <CURSOR>", "Continue from the data.next_cursor of the previous page").action(bind(handleSourceList));
  addCommandExamples(list, "screenrig source list");
  const show = source.command("show").description("Inspect one data source: settings, masked secrets, last run and last error").argument("<source_id>", "Data source identifier (src_...)").action(bind(handleSourceShow));
  addCommandExamples(show, "screenrig source show src_SOURCE");
  const presets = source.command("presets").description("List the ready-made source presets, or show one with its fields, secrets and how to get them").argument("[name]", "A preset's name (slack-channel); without it every preset is listed", sourcePresetOption).action(bind(handleSourcePresets));
  addCommandNotes(presets, "A preset is a named, tested configuration of the json source, so a person fills in a few fields instead of writing a config and a mapping. The list shows each preset's title, the card types it fills (the first is the one it is made for) and its category. A name shows the fields to set (--set NAME=VALUE: text with its pattern and an example, a choice, or a list that takes a JSON array), the secrets to enter (--secret NAME=@FILE) with where the vendor issues each, how often it refreshes, how long a card keeps its last data, and whose data it reads under which terms. Read only: nothing is created.");
  addCommandExamples(presets, "screenrig source presets", "screenrig source presets slack-channel");
  const create = source.command("create").description("Create a data source that keeps one card live; it runs within seconds").addOption(new Option("--kind <KIND>", "Where the data comes from").choices([...SOURCE_KINDS])).addOption(new Option("--preset <NAME>", PRESET_HELP).argParser(sourcePresetOption)).requiredOption("--card <CARD_ID>", "The card instance to write (crd_...); one source per card", cardUid).requiredOption("--name <NAME>", "Name the source, 1 to 80 characters", nameOption).option("--settings <JSON|@FILE|->", CONFIG_HELP).option("--set <KEY=VALUE>", SET_HELP, accumulate(setPairCheck)).addOption(new Option("--connection-id <ID>", CONNECTION_HELP).argParser(connectionIdOption)).option("--secret <NAME=VALUE>", SECRET_HELP, accumulate(secretPairCheck)).option("--refresh <DURATION>", "How often to sync, 30s to 24h (default and floor depend on the kind; ics is 5m, momentus 1m; a preset sets its own)", sourceRefreshOption).option("--stale-after <DURATION|none>", STALE_HELP, sourceStaleAfterOption).option("--disabled", "Create it disabled; nothing is fetched until source update --enable").action(bind(handleSourceCreate));
  requireOptionGroup(create, "exactlyOne", ["--kind", "--preset"]);
  addCommandExamples(create, 'screenrig source create --kind ics --card crd_CARD --name "Lobby calendar" --set calendars=\'[{"key":"lobby"}]\' --set time_zone=America/Vancouver --secret calendar_url.lobby=@lobby.url', 'screenrig source create --kind ics --card crd_ROOMS --name "Study rooms" --settings @rooms.json --secret calendar_url.room1=@room1.url --secret calendar_url.room2=@room2.url --refresh 2m', 'screenrig source create --kind ics --card crd_EVENTS --name "Public events" --set calendars=\'[{"key":"main"}]\' --set exclude=\'["Private","Holiday"]\' --secret calendar_url.main=@main.url', 'screenrig source create --kind sheets --card crd_MENU --name "Cafe menu" --settings @menu-sheet.json', 'screenrig source create --kind json --card crd_KPI --name "Daily numbers" --settings @kpi-api.json --secret token=@api.token', 'screenrig source create --kind json --card crd_ORDERS --name "Open orders" --settings @graphql-orders.json --secret header.X-Api-Key=@orders.key', 'screenrig source create --kind json --card crd_STATUS --name "Status board" --settings @oauth-status.json --secret client_secret=@client.secret', 'screenrig source create --kind momentus --card crd_EVENTS --name "Venue events" --settings @momentus.json --secret api_key=@key.guid --secret api_secret=@secret.guid --stale-after 30m', 'screenrig source create --kind toast --card crd_MENU --name "Toast menu" --settings @toast.json --secret client_secret=@toast.secret', 'screenrig source create --kind microsoft365 --card crd_ROOMS --name "Meeting rooms" --settings @rooms.json --connection-id pcn_CONNECTION', 'screenrig source create --preset slack-channel --card crd_WALL --name "Team wall" --set channel=C0123456789 --secret token=@slack.token');
  addCommandNotes(create, [
    "Request settings of a csv or json source, as --settings JSON beside its mapping (a secret goes by name with --secret, never in the JSON):",
    '  secret header and query:  {"url":"https://api.example.com/v1/items"}  --secret header.X-Api-Key=@FILE --secret query.account=@FILE',
    '  POST a GraphQL query:     {"url":"https://api.example.com/graphql","graphql":{"query":"{ orders { id } }","variables":{}}}  --secret token=@FILE',
    '  basic auth:               {"url":"https://api.example.com/v1/items","auth":"basic","username":"screens"}  --secret password=@FILE',
    '  OAuth client credentials: {"url":"https://api.example.com/v1/stats","auth":"oauth2","token_url":"https://auth.example.com/token","client_id":"ID","scope":"read"}  --secret client_secret=@FILE',
    '  log in for a token:       {"url":"https://api.example.com/v1/items","auth":"token_request","token_url":"https://api.example.com/login","token_body":{"user":"screens","pass":"{{secrets.login_password}}"},"token_path":"token"}  --secret login_password=@FILE',
    '  pages:                    "rows_path":"data.items","pagination":{"type":"cursor","param":"after","path":"page.next","max_pages":5}',
    '  a dated address:          {"url":"https://api.example.com/events?from={{today}}&to={{today+7d}}","time_zone":"America/Vancouver"}',
    '  an RSS or Atom feed:      {"url":"https://example.com/feed.xml","format":"xml"} with a mapping that reads {{body.items}}'
  ].join("\n"));
  const update = source.command("update").description("Change a data source; a change other than a rename resets its failures and runs it again").argument("<source_id>", "Data source identifier (src_...)").option("--name <NAME>", "Rename the source", nameOption).option("--card <CARD_ID>", "Write another card instead", cardUid).option("--settings <JSON|@FILE|->", "Replace the whole config; for a source made from a preset, merge these fields into its settings. ".concat(CONFIG_HELP)).option("--set <KEY=VALUE>", "Change one top-level config member of the saved config, or one field of a preset's settings (repeatable). ".concat(SET_HELP), accumulate(setPairCheck)).addOption(new Option("--connection-id <ID>", "".concat(CONNECTION_HELP, ". Moving a source off its own credentials takes --settings without tenant and client_id, and --unset-secret client_secret")).argParser(connectionIdOption)).option("--secret <NAME=VALUE>", "Set or replace a secret (repeatable). ".concat(SECRET_HELP), accumulate(secretPairCheck)).option("--unset-secret <NAME>", "Remove a secret (repeatable)", accumulate(unsetSecretCheck)).option("--refresh <DURATION>", "How often to sync, 30s to 24h", sourceRefreshOption).option("--stale-after <DURATION|none>", STALE_HELP, sourceStaleAfterOption).option("--enable", "Resume the schedule").option("--disable", "Stop the schedule; the card keeps its last document").option("--expect-rev <REVISION>", "Require this source revision; --set guards the revision it read unless you name another", revision).action(bind(handleSourceUpdate));
  requireOptionGroup(update, "atMostOne", ["--enable", "--disable"]);
  addCommandExamples(update, "screenrig source update src_SOURCE --set days=14", "screenrig source update src_SOURCE --secret calendar_url.lobby=@new.url --refresh 10m", "screenrig source update src_SOURCE --stale-after 1h", "screenrig source update src_SOURCE --disable", 'screenrig source update src_SOURCE --set include=\'["Board","Training"]\'', "screenrig source update src_PRESETSOURCE --set channel=C0123456789 --secret token=@new.token");
  const test = source.command("test").description("Preview a source: fetch, shape and validate against the card, without saving or writing anything").argument("[source_id]", "A saved source to test; the other options override it").addOption(new Option("--kind <KIND>", "Where the data comes from (required without source_id, unless --preset names it)").choices([...SOURCE_KINDS]).conflicts(["preset"])).addOption(new Option("--preset <NAME>", "Preview a source made from this preset (source presets), with --set and --settings as its fields and --secret as its credentials, instead of --kind").argParser(sourcePresetOption).conflicts(["kind"])).option("--card <CARD_ID>", "The card instance to fill (required without source_id)", cardUid).option("--settings <JSON|@FILE|->", CONFIG_HELP).option("--set <KEY=VALUE>", SET_HELP, accumulate(setPairCheck)).addOption(new Option("--connection-id <ID>", CONNECTION_HELP).argParser(connectionIdOption)).option("--secret <NAME=VALUE>", SECRET_HELP, accumulate(secretPairCheck)).action(bind(handleSourceTest));
  addCommandNotes(test, "Prints the document the source would write, whether the card accepts it, and what the run noticed (a time zone it could not place, events cut at a limit). A csv or json source also shows the request that went out as data.request: its address with placeholders filled in and secret query parameters masked, the names of the headers sent and the start of the body, and how many pages it read. At most 30 previews a minute per organization.");
  addCommandExamples(test, 'screenrig source test --kind ics --card crd_CARD --set calendars=\'[{"key":"lobby"}]\' --secret calendar_url.lobby=@lobby.url', "screenrig source test src_SOURCE", "screenrig source test --kind momentus --card crd_EVENTS --settings @momentus.json --secret api_key=@key.guid --secret api_secret=@secret.guid", "screenrig source test --kind json --card crd_ORDERS --settings @graphql-orders.json --secret header.X-Api-Key=@orders.key", "screenrig source test --preset slack-channel --card crd_WALL --set channel=C0123456789 --secret token=@slack.token");
  const refresh = source.command("refresh").description("Sync a source now and show the result; a failed sync never changes the card").argument("<source_id>", "Data source identifier (src_...)").action(bind(handleSourceRefresh));
  addCommandNotes(refresh, "Runs inline (up to 60 seconds), resets the failure count and reads the address in full. source_busy (exit 5) while a scheduled sync is running. At most 6 a minute per source.");
  addCommandExamples(refresh, "screenrig source refresh src_SOURCE");
  const rooms = source.command("rooms").description("Room mapping: rooms the source offers that no screen shows, and screens that name no room").argument("<source_id>", "Data source identifier (src_...) of a source that reads a booking system's rooms").action(bind(handleSourceRooms));
  addCommandNotes(rooms, [
    "Reads the rooms of the source's last good refresh (nothing is fetched) and the project's screens.",
    "A screen shows a room through its room field: a playlist card whose data key is the source's",
    "room_key_prefix followed by {screen.field.room} reads the document of the room the field names.",
    "Areas, for a hallway display, work the same through area_key_prefix and the area field.",
    "Each screen that has a value or whose playlist reads the key is listed as mapped, missing (the",
    "playlist reads the field and the screen has none) or unknown (the value names no room; a",
    "suggestion says the room it probably meant). Fix a screen with screen update SCREEN_ID --field room=KEY."
  ].join("\n"));
  addCommandExamples(rooms, "screenrig source rooms src_SOURCE");
  const remove = source.command("delete").description("Delete a data source; the card keeps the last document it was given").argument("<source_id>", "Data source identifier (src_...)").option("--expect-rev <REVISION>", "Optionally require this source revision", revision).action(bind(handleSourceDelete));
  addCommandExamples(remove, "screenrig source delete src_SOURCE", "screenrig source delete src_SOURCE --expect-rev 3");
}

// dist/bundles/media.js
function register(root, bind) {
  registerAppCommands(root, bind);
  registerMediaCommands(root, bind);
  registerBrowserCommands(root, bind);
  registerKvCommands(root, bind);
  registerSourceCommands(root, bind);
}
export {
  register
};
