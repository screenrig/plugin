import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  parseSse
} from "./chunk-FCQ624QM.js";
import {
  CREDIT_HELP,
  INVITATION_HELP
} from "./chunk-4IIE6JYN.js";
import {
  screenScopeFromArgs
} from "./chunk-H6Z42XF2.js";
import {
  planFeatureFields,
  validateProjectCapabilities
} from "./chunk-VPHUSKMY.js";
import {
  apexHost
} from "./chunk-BWPKDRCP.js";
import {
  subcommand
} from "./chunk-QUFYJQPR.js";
import {
  Option,
  positiveInteger,
  projectSubset,
  reportFormatOption,
  reportOutputOption
} from "./chunk-X7VRDN2U.js";
import {
  addCommandNotes,
  requireOptionGroup
} from "./chunk-IBLNZ4EM.js";
import {
  readAuthoringText
} from "./chunk-OFOJKZJN.js";
import {
  AGENT_CAPABILITIES,
  AGENT_SELF_PATH,
  EVENT_STREAM_BACKOFF_CAP_MS,
  EVENT_STREAM_BACKOFF_MS,
  NOTE_INPUT_MAX_BYTES,
  NOTE_MATCHED_OPEN,
  NotesApi,
  accessibleProjects,
  adsListOption,
  clientFor,
  commandHandler,
  credentialRetiredError,
  formatBytes,
  handleVersion,
  headerValue,
  humanLines,
  identityForCommand,
  isAbortError,
  isHardFollowError,
  isPlainContactEmail,
  jsonBody,
  matchedOpenNote,
  missingCredentialError,
  noteBody,
  noteDetailLines,
  noteId,
  noteListLines,
  noteReason,
  notesHint,
  notesHintWarning,
  oauthSessionFor,
  oauthSessions,
  parseNoteAbout,
  parseNoteTtl,
  readFeedbackBody,
  requireFlagValue,
  requirePrivateNoStore,
  requireToken,
  reviewWarning,
  selfNoteCounts,
  selfNotesField,
  sessionRuntime,
  simpleGet,
  simpleList,
  sleepWhileOpen,
  streamEnvelope,
  streamToken,
  transportFor,
  uploadScopeFromArgs,
  uptimeDays,
  writeRecoveries
} from "./chunk-V75DKIZV.js";
import {
  FetchTransport,
  HEALTH_DEFAULT_WINDOW_MS,
  HEALTH_HOURLY_MAX_DAYS,
  SERIES_PAGE_SIZE,
  accessFields,
  assertProjectCredential,
  cacheProjectContexts,
  contextFromProject,
  downloadToFile,
  formatResultContext,
  manageWriteRecovery,
  playsInstantOption,
  projectConfigFor,
  projectName,
  projectStreamQuery,
  selectProject,
  seriesWindow,
  setResultContext,
  validateProjectContext,
  withProjectConfig
} from "./chunk-4XGOAGFN.js";
import {
  cwebpLookup,
  ffmpegLookup,
  loggerOf,
  placeAccessToken,
  refreshExpiryDays,
  resolveCwebpToolchain,
  resolveFfmpegToolchain
} from "./chunk-PPWTLS44.js";
import {
  ACCESS_LEVELS,
  OAUTH_CLIENT_ID,
  SCOPE_IDENTITY,
  accessClaims,
  accessFromScope,
  accessLabel,
  describeTokenPresence,
  flagBool,
  flagNumber,
  flagString,
  hasToken,
  isRetiredCredential,
  isServiceClientId,
  isSessionJwt,
  isValidIdempotencyKey,
  newIdempotencyKey,
  preserveLogSocket,
  randomPrefixedId,
  readConfigFile,
  readKeyFile,
  resolveConfig,
  sameCredential,
  serviceCredentialsFromConfig,
  successEnvelope,
  withConfigLock,
  writeConfigAtomic
} from "./chunk-D2RLMLYO.js";
import {
  CLI_VERSION,
  cliDistribution
} from "./chunk-V3QE7ELU.js";
import "./chunk-7EJTDXNL.js";
import {
  RESOURCE_ID_PATTERNS,
  isResourceID
} from "./chunk-SFYZH3GR.js";
import {
  CliError,
  ExitCode,
  configError,
  fileError,
  makeProblem,
  redactEvent,
  redactText,
  screenScopeOf,
  screenScopeText,
  unexpectedResponseError,
  usageError
} from "./chunk-JP4OQPAN.js";
import "./chunk-3FYAGULW.js";

// dist/handlers/project.js
import { open as open2 } from "node:fs/promises";
import path2 from "node:path";

// dist/project-export.js
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, open, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
var EXPORT_FORMAT = "screenrig.export/v1";
var PLAYS_WINDOW_DAYS = 31;
var PLAYS_LOOKBACK_DAYS = 400;
var UPTIME_LOOKBACK_DAYS = 365;
var DAY_MS = 864e5;
async function sha256Of(file) {
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of createReadStream(file)) {
    hash.update(chunk);
    bytes += chunk.byteLength;
  }
  return { bytes, sha256: hash.digest("hex") };
}
async function writeAtomic(target, text) {
  await mkdir(path.dirname(target), { recursive: true });
  const temp = "".concat(target, ".part");
  await writeFile(temp, text, { mode: 384 });
  await rename(temp, target);
}
var asArray = (value) => Array.isArray(value) ? value.filter((item) => !!item && typeof item === "object" && !Array.isArray(item)) : [];
var asRecord = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
function origin(value) {
  if (typeof value !== "string")
    return void 0;
  try {
    return new URL(value).origin;
  } catch {
    return void 0;
  }
}
function stripSecrets(record) {
  const out = { ...record };
  delete out.secret;
  if (typeof out.url === "string") {
    out.url_origin = origin(out.url);
    delete out.url;
  }
  if (out.secrets && typeof out.secrets === "object") {
    out.secret_names = Object.keys(out.secrets).sort();
    delete out.secrets;
  }
  return out;
}
function absent(error) {
  if (error instanceof CliError && error.problem.status === 404)
    return null;
  throw error;
}
async function mapLimit(items, limit, work) {
  const results = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (; ; ) {
      const index = next++;
      if (index >= items.length)
        return;
      results[index] = await work(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}
var CONCURRENCY = 8;
var RequiredExportReadError = class extends Error {
};
var dayOf = (date) => date.toISOString().slice(0, 10);
var EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "audio/ogg": "ogg"
};
async function appendCsv(target, source, first) {
  await mkdir(path.dirname(target), { recursive: true });
  const output = createWriteStream(target, { flags: first ? "w" : "a", mode: 384 });
  let skipping = !first;
  await new Promise((resolve, reject) => {
    output.on("error", reject);
    const input = createReadStream(source);
    input.on("error", reject);
    input.on("data", (chunk) => {
      let buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
      if (skipping) {
        const newline = buffer.indexOf(10);
        if (newline < 0)
          return;
        buffer = buffer.subarray(newline + 1);
        skipping = false;
      }
      if (buffer.length > 0)
        output.write(buffer);
    });
    input.on("end", () => output.end(resolve));
  });
}
async function runProjectExport(api, options) {
  const root = path.resolve(options.directory);
  await mkdir(root, { recursive: true });
  const say = options.progress ?? (() => void 0);
  const sections = [];
  const written = /* @__PURE__ */ new Set();
  let playlistHasApplications = false;
  const result = { directory: root, sections, files: [], media: { listed: 0, downloaded: 0, kept: 0, failed: 0 }, failed: 0 };
  const json = async (relative, value) => {
    await writeAtomic(path.join(root, relative), "".concat(JSON.stringify(value, null, 2), "\n"));
    written.add(relative);
    if (relative.startsWith("playlists/")) {
      for (const item of Array.isArray(value) ? asArray(value) : [asRecord(value)]) {
        const playlist = asRecord(item.playlist ?? item);
        if (asArray(playlist.pages).some((page) => asArray(page.primitives).some((primitive) => primitive.primitive === "application"))) {
          playlistHasApplications = true;
        }
      }
    }
  };
  const requiredGet = async (pathName) => {
    try {
      return await api.get(pathName);
    } catch (error) {
      throw new RequiredExportReadError("Could not export ".concat(pathName, ": ").concat(error instanceof Error ? error.message : String(error)), { cause: error });
    }
  };
  const requiredList = async (pathName) => {
    try {
      return await api.list(pathName);
    } catch (error) {
      throw new RequiredExportReadError("Could not export ".concat(pathName, ": ").concat(error instanceof Error ? error.message : String(error)), { cause: error });
    }
  };
  const section = async (name, run) => {
    say("exporting ".concat(name));
    try {
      sections.push({ name, status: "ok", files: await run() });
    } catch (error) {
      const cause = error instanceof RequiredExportReadError ? error.cause : error;
      const problem = cause instanceof CliError ? cause.problem : void 0;
      const skipped = !(error instanceof RequiredExportReadError) && (problem?.status === 403 || problem?.status === 404 || problem?.code === "forbidden" || problem?.code === "not_ready" || problem?.code === "feature_not_in_plan");
      sections.push({ name, status: skipped ? "skipped" : "failed", files: 0, detail: error instanceof RequiredExportReadError ? error.message : problem?.detail ?? (error instanceof Error ? error.message : String(error)), code: problem?.code });
      if (!skipped)
        result.failed += 1;
    }
  };
  let projectCreated;
  await section("project", async () => {
    const project2 = asRecord(await api.get("/api/project"));
    projectCreated = typeof project2.created_at === "string" ? project2.created_at : void 0;
    await json("project.json", project2);
    return 1;
  });
  let screens = [];
  await section("screens", async () => {
    screens = [...asArray(await api.list("/api/screens")), ...asArray(await api.list("/api/screens", { state: "archived" }))];
    await json("screens/screens.json", screens);
    const tags = /* @__PURE__ */ new Map();
    for (const screen of screens) {
      for (const tag of Array.isArray(screen.tags) ? screen.tags : [])
        tags.set(tag, [...tags.get(tag) ?? [], String(screen.id)]);
    }
    await json("tags.json", [...tags.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([tag, ids]) => ({ tag, screen_ids: ids })));
    return 2;
  });
  await section("screen schedules", async () => {
    const schedules = await mapLimit(screens, CONCURRENCY, async (screen) => {
      const id = String(screen.id);
      const playlist = await api.get("/api/screens/".concat(id, "/playlist-schedule")).catch(absent);
      const display = await api.get("/api/screens/".concat(id, "/display-schedule")).catch(absent);
      return { screen_id: id, playlist_schedule: playlist, display_schedule: display, takeover: screen.takeover ?? null, effective_playlist: screen.effective_playlist ?? null };
    });
    await json("screens/schedules.json", schedules);
    return 1;
  });
  await section("folders", async () => {
    await json("screens/folders.json", asArray(asRecord(await api.get("/api/screen-folders")).items));
    await json("media/folders.json", asArray(asRecord(await api.get("/api/media-folders")).items));
    return 2;
  });
  await section("playlists", async () => {
    const playlists = asArray(await api.list("/api/playlists"));
    await json("playlists/playlists.json", playlists);
    const counts = await mapLimit(playlists, CONCURRENCY, async (playlist) => {
      const id = String(playlist.id);
      await json("playlists/".concat(id, "/playlist.json"), await api.get("/api/playlists/".concat(id)));
      const revisions = asArray(await api.list("/api/playlists/".concat(id, "/revisions")));
      await json("playlists/".concat(id, "/revisions.json"), revisions);
      await mapLimit(revisions, CONCURRENCY, async (revision) => {
        const number = String(revision.revision ?? revision.number);
        await json("playlists/".concat(id, "/revisions/").concat(number, ".json"), await api.get("/api/playlists/".concat(id, "/revisions/").concat(number)));
      });
      return revisions.length + 2;
    });
    return 1 + counts.reduce((sum, count) => sum + count, 0);
  });
  await section("campaigns", async () => {
    await json("campaigns.json", asArray(asRecord(await api.get("/api/campaigns")).items));
    return 1;
  });
  await section("direct campaigns", async () => {
    await json("advertising/direct-campaigns.json", asArray(asRecord(await api.get("/api/advertising/direct-campaigns")).items));
    return 1;
  });
  await section("cards", async () => {
    const cards = asArray(await api.list("/api/cards"));
    const data = asArray(await api.list("/api/card-data"));
    const cardDetails = await mapLimit(cards, CONCURRENCY, (card) => requiredGet("/api/cards/".concat(encodeURIComponent(String(card.id)))));
    const documents = await mapLimit(data, CONCURRENCY, (entry) => requiredGet("/api/card-data/".concat(encodeURIComponent(String(entry.key)))));
    await json("cards/cards.json", cardDetails);
    await json("cards/card-data.json", documents);
    return 2;
  });
  await section("sources", async () => {
    await json("sources.json", asArray(await api.list("/api/sources")).map(stripSecrets));
    return 1;
  });
  await section("notifications", async () => {
    await json("notifications.json", asArray(asRecord(await api.get("/api/notifications")).items).map(stripSecrets));
    await json("alert-mutes.json", asArray(asRecord(await api.get("/api/alert-mutes")).items));
    return 2;
  });
  await section("webhooks", async () => {
    await json("webhooks.json", asArray(asRecord(await api.get("/api/webhooks")).items).map(stripSecrets));
    return 1;
  });
  let applications = [];
  await section("applications", async () => {
    applications = asArray(await api.list("/api/applications"));
    await json("applications.json", applications);
    await json("triggers.json", asArray(asRecord(await api.get("/api/triggers")).items).map(stripSecrets));
    for (const application of applications) {
      const id = encodeURIComponent(String(application.id));
      const kvPath = "/api/applications/".concat(id, "/kv");
      const entries = asArray(await requiredList(kvPath));
      const values = await mapLimit(entries, CONCURRENCY, (entry) => requiredGet("".concat(kvPath, "/").concat(encodeURIComponent(String(entry.key)))));
      await json("applications/".concat(id, "/kv.json"), values);
    }
    return applications.length + 2;
  });
  if (applications.length > 0 || playlistHasApplications) {
    sections.push({
      name: "application files",
      status: "failed",
      files: 0,
      code: "application_content_omitted",
      detail: "Published application files (HTML, scripts, stylesheets and other release assets), including playlist-pinned releases, are omitted. Retain the original application archives alongside this export; rerunning does not add these files."
    });
    result.failed += 1;
  }
  await section("report subscriptions", async () => {
    await json("report-subscriptions.json", asArray(asRecord(await api.get("/api/report-subscriptions")).items));
    return 1;
  });
  await section("event log", async () => {
    const target = path.join(root, "log/events.jsonl");
    await mkdir(path.dirname(target), { recursive: true });
    const temp = "".concat(target, ".part");
    const handle = await open(temp, "w", 384);
    try {
      if (options.since === void 0) {
        let after;
        for (; ; ) {
          const page = asRecord(await api.get("/api/events", { limit: "200", ...after ? { after } : {} }));
          const items = asArray(page.items);
          if (items.length > 0)
            await handle.write("".concat(items.map((item) => JSON.stringify(item)).join("\n"), "\n"));
          const next = typeof page.next_cursor === "string" ? page.next_cursor : void 0;
          if (!next || items.length === 0)
            break;
          after = next;
        }
      } else {
        const from = "".concat(options.since, "T00:00:00Z");
        const kept = [];
        let before;
        for (let done = false; !done; ) {
          const page = asRecord(await api.get("/api/events", { limit: "200", order: "desc", ...before ? { before } : {} }));
          const items = asArray(page.items);
          for (const item of items) {
            if (typeof item.at === "string" && item.at < from) {
              done = true;
              break;
            }
            kept.push(item);
          }
          const next = typeof page.next_cursor === "string" ? page.next_cursor : void 0;
          if (!next || items.length === 0)
            done = true;
          before = next;
        }
        if (kept.length > 0)
          await handle.write("".concat(kept.reverse().map((item) => JSON.stringify(item)).join("\n"), "\n"));
      }
      await handle.sync();
    } finally {
      await handle.close();
    }
    await rename(temp, target);
    written.add("log/events.jsonl");
    return 1;
  });
  await section("audit log", async () => {
    const target = path.join(root, "log/audit.jsonl");
    await mkdir(path.dirname(target), { recursive: true });
    const temp = "".concat(target, ".part");
    const handle = await open(temp, "w", 384);
    try {
      const head = asRecord(await api.get("/api/audit/head"));
      let cursor;
      const query = options.since === void 0 ? {} : { since: "".concat(options.since, "T00:00:00Z") };
      const kept = [];
      for (; ; ) {
        const page = asRecord(await api.get("/api/audit", { limit: "200", ...query, ...cursor ? { cursor } : {} }));
        const items = asArray(page.items);
        kept.push(...items);
        const next = typeof page.next_cursor === "string" ? page.next_cursor : void 0;
        if (!next || items.length === 0)
          break;
        cursor = next;
      }
      if (kept.length > 0)
        await handle.write("".concat(kept.reverse().map((item) => JSON.stringify(item)).join("\n"), "\n"));
      await handle.sync();
      await json("log/audit-head.json", head);
    } finally {
      await handle.close();
    }
    await rename(temp, target);
    written.add("log/audit.jsonl");
    return 2;
  });
  await section("plays, uptime and alerts", async () => {
    let files = 0;
    const csv = async (relative, pathName, query) => {
      const target = path.join(root, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await api.file(pathName, { ...query, format: "csv" }, "".concat(target, ".part"), "text/csv");
      await rename("".concat(target, ".part"), target);
      written.add(relative);
      files += 1;
    };
    const today = dayOf(options.now);
    const playsFrom = dayOf(new Date(options.now.getTime() - (PLAYS_LOOKBACK_DAYS - 1) * DAY_MS));
    const created = projectCreated ? projectCreated.slice(0, 10) : playsFrom;
    const since = options.since ?? (created > playsFrom ? created : playsFrom);
    const uptimeFrom = (() => {
      const limit = dayOf(new Date(options.now.getTime() - (UPTIME_LOOKBACK_DAYS - 1) * DAY_MS));
      return since > limit ? since : limit;
    })();
    await csv("data/uptime-daily.csv", "/api/uptime/daily", { day_from: uptimeFrom, day_to: today });
    await csv("data/uptime-by-screen.csv", "/api/reports/uptime", { group_by: "screen", from: uptimeFrom, to: today });
    await csv("data/alerts.csv", "/api/alerts", { state: "all" });
    await csv("data/play-aggregates.csv", "/api/playback", { day_from: uptimeFrom, day_to: today });
    const playsTarget = path.join(root, "data/plays.csv");
    await rm(playsTarget, { force: true });
    let first = true;
    for (let start = Date.parse("".concat(since, "T00:00:00Z")); start < options.now.getTime(); start += PLAYS_WINDOW_DAYS * DAY_MS) {
      const end = Math.min(start + PLAYS_WINDOW_DAYS * DAY_MS, options.now.getTime() - 5e3);
      if (end <= start)
        break;
      const piece = "".concat(playsTarget, ".window");
      await api.file("/api/playback/plays", { from: new Date(start).toISOString(), to: new Date(end).toISOString(), format: "csv" }, piece, "text/csv");
      await appendCsv(playsTarget, piece, first);
      first = false;
      await rm(piece, { force: true });
    }
    written.add("data/plays.csv");
    return files + 1;
  });
  await section("media", async () => {
    const items = asArray(await api.list("/api/media"));
    result.media.listed = items.length;
    const manifest = [];
    let files = 0;
    for (const item of items) {
      const id = String(item.id);
      const extension = EXTENSIONS[String(item.content_type ?? "").toLowerCase()] ?? "bin";
      const relative = "media/files/".concat(id, ".").concat(extension);
      const entry = {
        id,
        filename: item.source_filename ?? item.filename,
        content_type: item.content_type,
        primitive: item.primitive,
        bytes: item.bytes,
        sha256: item.sha256,
        folder_id: item.folder_id ?? null,
        tags: item.tags ?? [],
        created_at: item.created_at,
        path: options.media ? relative : null
      };
      if (options.media) {
        try {
          const state = await mediaFile(api, "/api/media/".concat(id, "/content"), path.join(root, relative), Number(item.bytes), String(item.sha256));
          result.media[state] += 1;
          entry.status = "complete";
          written.add(relative);
          files += 1;
        } catch (error) {
          result.media.failed += 1;
          entry.status = "failed";
          entry.error = error instanceof CliError ? error.problem.detail : error instanceof Error ? error.message : String(error);
        }
        say("media ".concat(manifest.length + 1, "/").concat(items.length, " ").concat(id));
      }
      manifest.push(entry);
    }
    await json("media/media.json", items);
    await json("media/manifest.json", { format: EXPORT_FORMAT, files: manifest });
    if (result.media.failed > 0)
      throw new Error("".concat(result.media.failed, " media file(s) did not download; run the export again to continue them."));
    return files + 2;
  });
  for (const relative of [...written].sort()) {
    const { bytes, sha256 } = await sha256Of(path.join(root, relative));
    result.files.push({ path: relative, bytes, sha256 });
  }
  const project = asRecord(await readFile(path.join(root, "project.json"), "utf8").then((text) => JSON.parse(text)).catch(() => void 0));
  await json("export.json", {
    format: EXPORT_FORMAT,
    generated_at: options.now.toISOString(),
    project_id: project.id ?? null,
    media_files: options.media,
    sections,
    files: result.files
  });
  return result;
}
async function mediaFile(api, pathName, target, bytes, sha256) {
  await mkdir(path.dirname(target), { recursive: true });
  const existing = await stat(target).catch(() => void 0);
  if (existing?.isFile() && existing.size === bytes && (await sha256Of(target)).sha256 === sha256)
    return "kept";
  const part = "".concat(target, ".part");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let have = (await stat(part).catch(() => void 0))?.size ?? 0;
    if (attempt > 0 || have > bytes) {
      await rm(part, { force: true });
      have = 0;
    }
    if (have < bytes || bytes === 0)
      await api.append(pathName, have, part);
    const done = await sha256Of(part).catch(() => void 0);
    if (done && done.bytes === bytes && done.sha256 === sha256) {
      await rename(part, target);
      return "downloaded";
    }
  }
  await rm(part, { force: true });
  throw new Error("Media ".concat(path.basename(target), " did not match its recorded SHA-256 after downloading it twice."));
}

// dist/handlers/project.js
var handleProjectShow = commandHandler(projectShow);
var handleProjectList = commandHandler(projectList, false);
var handleProjectCreate = commandHandler(projectCreate);
var handleProjectUse = commandHandler(projectUse, false);
var handleProjectMoves = commandHandler(projectMoves);
var handleProjectMove = commandHandler(projectMove);
var handleProjectOwnerTransfer = commandHandler(projectOwnerTransfer);
var handleProjectDeletionPreview = commandHandler(projectDeletionPreview);
var handleProjectDelete = commandHandler(projectDelete);
var handleProjectCapabilities = commandHandler(projectCapabilities);
var handleProjectRename = commandHandler(projectRename);
async function projectShow(args, runtime, resolved) {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const response = await client.call({ method: "GET", path: "/api/project" });
  const envelope = jsonBody(response, client.requestId, { token_present: hasToken(token) });
  const project = response.body;
  const context = contextFromProject(project);
  if (resolved.projectId && context.project.id !== resolved.projectId)
    throw configError("Project response changed the command's target.");
  await cacheProjectContexts(runtime, resolved, [context], { credential: resolved.token });
  return {
    envelope,
    exitCode: ExitCode.Success,
    human: humanLines("Project", [
      ["id", project.id],
      ["name", project.name],
      ["revision", project.revision !== void 0 ? String(project.revision) : void 0],
      ["credit_remaining", project.credit_remaining !== void 0 ? String(project.credit_remaining) : void 0],
      ["token", describeTokenPresence(token)],
      ["request_id", client.requestId]
    ])
  };
}
var handleProjectToken = commandHandler(async (args, runtime, resolved) => {
  const stored = await readConfigFile(resolved.configPath, { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir });
  if (!stored?.oauth)
    throw missingCredentialError(resolved);
  const raw = flagString(args.flags, "projects") ?? "";
  const projects = raw.split(/[\s,]+/).filter(Boolean);
  if (projects.some((id) => !isResourceID(id, "project")))
    throw usageError("--projects requires project IDs separated by commas or spaces.");
  const token = await oauthSessionFor(runtime, resolved).selectProjects(projects);
  return {
    envelope: successEnvelope({ projects: token ? Object.keys(accessClaims(token)?.projects ?? {}) : [] }),
    exitCode: ExitCode.Success,
    human: "Current token project subset updated."
  };
}, false);
async function projectList(args, runtime, resolved) {
  const listed = await accessibleProjects(args, runtime, resolved);
  await cacheProjectContexts(runtime, listed.resolved, listed.projects, { identityToken: listed.resolved.identityToken });
  return {
    envelope: successEnvelope({ projects: listed.projects }, { request_id: listed.requestId }),
    exitCode: ExitCode.Success,
    human: listed.projects.map((item) => "".concat(item.organization.name, " / ").concat(item.project.name, ": ").concat(item.project.id).concat(typeof item.in_token === "boolean" ? " (in token: ".concat(item.in_token, ")") : "")).join("\n") || "No accessible projects."
  };
}
async function projectUse(args, runtime, resolved) {
  const id = args.positionals[2];
  if (!isResourceID(id, "project"))
    throw usageError("project use requires a project ID from project list.");
  const listed = await accessibleProjects(args, runtime, resolved);
  const selected = listed.projects.find((item) => item.project.id === id);
  if (!selected) {
    throw new CliError(makeProblem("not_found", "Project not available", 404, "".concat(id, " is not a project this identity belongs to."), {
      hint: "Pick an ID from project list; to join another project, sign in to it with screenrig login --project ID.",
      next: { command: "screenrig project list", reason: "Lists the projects this identity can select." }
    }));
  }
  if (selected.in_token === false)
    throw new CliError(makeProblem("project_not_in_token", "Project outside token", 403, "This project is outside the current token subset.", { next: { command: "screenrig project token --projects ".concat(id), reason: "Request a token for consented projects. Membership discovery does not grant access." } }));
  await cacheProjectContexts(runtime, listed.resolved, [selected], { identityToken: listed.resolved.identityToken, select: id });
  return {
    envelope: successEnvelope(selected, { request_id: listed.requestId }),
    exitCode: ExitCode.Success,
    human: "Selected ".concat(selected.organization.name, " / ").concat(selected.project.name, " (").concat(id, ")")
  };
}
async function projectCreate(args, runtime, resolved) {
  const name = projectName(args.positionals[2]);
  const organizationId = flagString(args.flags, "organization-id");
  const organizationName = flagString(args.flags, "organization");
  if (organizationId && organizationName)
    throw usageError("Use one of --organization-id or --organization.");
  const identity = await identityForCommand(runtime, resolved);
  const claims = accessClaims(identity.identityToken);
  const projects = claims?.projects ? Object.keys(claims.projects) : claims?.prj ? [claims.prj] : [];
  if (projects.length >= 64)
    throw configError("The current token already carries 64 projects. Narrow its subset with project token --projects ID,ID before creating another project.");
  const client = clientFor(runtime, args, identity.apiUrl, identity.identityToken);
  const body = {
    name,
    ...organizationId ? { organization_id: organizationId } : {},
    ...organizationName !== void 0 ? { organization_name: projectName(organizationName, "Organization name") } : {}
  };
  const response = await client.call({ method: "POST", path: "/api/projects", body, idempotent: true });
  if (!(headerValue(response.headers, "cache-control") ?? "").split(",").map((value) => value.trim().toLowerCase()).includes("no-store")) {
    throw configError("The project create response did not prohibit storage.");
  }
  const context = validateProjectContext(response.body);
  if (!projects.includes(context.project.id)) {
    const token = await oauthSessionFor(runtime, identity).selectProjects([...projects, context.project.id]);
    const refreshed = accessClaims(token);
    if (!refreshed?.projects?.[context.project.id] && refreshed?.prj !== context.project.id) {
      throw configError("The refreshed token does not carry the created project. The previous project remains selected.");
    }
  }
  await cacheProjectContexts(runtime, identity, [context], { identityToken: identity.identityToken, select: context.project.id });
  return {
    envelope: successEnvelope({ project: context.project, organization: context.organization, ...context.owner_user_id ? { owner_user_id: context.owner_user_id } : {} }, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: "Created ".concat(context.organization.name, " / ").concat(context.project.name, " (").concat(context.project.id, ")")
  };
}
async function projectMoves(args, runtime, resolved) {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "/api/project/moves" });
  const organizations = response.body.organizations;
  if (!Array.isArray(organizations))
    throw configError("Project move destinations do not match the contract.");
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: organizations.map((item) => "".concat(item.name, ": ").concat(item.id)).join("\n") || "No allowed destinations."
  };
}
async function projectLifecycleWrite(args, runtime, resolved, method, path5, body) {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method, path: path5, body });
  const context = validateProjectContext(response.body);
  if (context.project.id !== resolved.projectId)
    throw configError("Project lifecycle response changed the command's target.");
  await cacheProjectContexts(runtime, resolved, [context], { credential: resolved.token });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: "".concat(context.organization.name, " / ").concat(context.project.name, " (").concat(context.project.id, ")")
  };
}
async function projectMove(args, runtime, resolved) {
  const id = flagString(args.flags, "organization-id");
  if (!id)
    throw usageError("project move requires --organization-id from project moves.");
  return projectLifecycleWrite(args, runtime, resolved, "POST", "/api/project/move", { organization_id: id });
}
async function projectOwnerTransfer(args, runtime, resolved) {
  const id = flagString(args.flags, "user-id");
  if (!id)
    throw usageError("project transfer-owner requires --user-id for an existing verified project member.");
  return projectLifecycleWrite(args, runtime, resolved, "PUT", "/api/project/owner", { user_id: id });
}
async function projectDeletionPreview(args, runtime, resolved) {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "/api/project/deletion-preview" });
  const context = validateProjectContext(response.body);
  const preview = response.body;
  if (typeof preview.allowed !== "boolean" || !Array.isArray(preview.devices))
    throw configError("Project deletion preview does not match the contract.");
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: humanLines("Project deletion preview", [["name", context.project.name], ["revision", String(context.project.revision)], ["allowed", String(preview.allowed)], ["reason", preview.reason]])
  };
}
async function projectDelete(args, runtime, resolved) {
  const name = projectName(flagString(args.flags, "name"));
  const revision = flagNumber(args.flags, "revision");
  if (!flagBool(args.flags, "yes") || !Number.isInteger(revision) || !revision || revision < 1) {
    throw usageError("project delete requires --yes --name NAME --revision N matching project deletion-preview.");
  }
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "DELETE", path: "/api/project", body: { name, revision } });
  if (response.body?.id !== resolved.projectId)
    throw configError("Project deletion response changed the command's target.");
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Deleted project " + resolved.projectName + " (" + resolved.projectId + ")" };
}
async function projectCapabilities(args, runtime, resolved) {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const response = await client.call({ method: "GET", path: "/api/project/capabilities" });
  requirePrivateNoStore(response.headers, "Project capabilities response");
  const capabilities = validateProjectCapabilities(response.body);
  return {
    envelope: jsonBody(response, client.requestId, { token_present: hasToken(token) }),
    exitCode: ExitCode.Success,
    human: humanLines("Project capabilities", [
      ["project_id", capabilities.project_id],
      ["plan_id", capabilities.plan_id],
      ...planFeatureFields(capabilities),
      ["features", "advertiser=".concat(capabilities.features.advertiser, " screens=").concat(capabilities.features.screens)],
      ["feature_revision", String(capabilities.feature_revision)],
      ["capabilities", [...capabilities.capabilities].sort().join(", ") || "(none)"],
      ["media_video_bytes", capabilities.media_video_bytes === void 0 ? "(not stated)" : String(capabilities.media_video_bytes)],
      ["request_id", client.requestId]
    ])
  };
}
async function projectRename(args, runtime, resolved) {
  const name = args.positionals[2]?.trim();
  if (!name || [...name].length > 60 || /[\p{Cc}\p{Cf}]/u.test(name))
    throw usageError("project rename requires NAME containing 1\u201360 characters without controls.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "PATCH", path: "/api/project", body: { name }, idempotent: true });
  const project = response.body;
  let context;
  try {
    context = contextFromProject(project);
  } catch (error) {
    if (!(error instanceof CliError))
      throw error;
    context = contextFromProject((await client.call({ method: "GET", path: "/api/project" })).body);
  }
  if (context.project.id !== resolved.projectId)
    throw configError("Rename response changed the command's target.");
  await cacheProjectContexts(runtime, resolved, [context], { credential: resolved.token });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: humanLines("Project renamed", [["id", project.id], ["name", project.name]])
  };
}
var handleProjectUptime = commandHandler(async (args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/uptime/daily", "Project uptime", uptimeDays(args)), true);
var handleProjectHealthTrend = commandHandler(async (args, runtime, resolved) => {
  requireFlagValue(args, "from", "7d");
  requireFlagValue(args, "to", "now");
  const range = seriesWindow({
    from: flagString(args.flags, "from"),
    to: flagString(args.flags, "to"),
    fromFlag: "--from",
    toFlag: "--to",
    now: runtime.now(),
    defaultMs: HEALTH_DEFAULT_WINDOW_MS,
    maxDays: HEALTH_HOURLY_MAX_DAYS
  });
  return simpleList(args, runtime, resolved, "/api/health/trend", "Project health trend", { from: range.from, to: range.to, limit: SERIES_PAGE_SIZE }, { cursorParam: "cursor", uncapped: true });
}, true);
var handleProjectExport = commandHandler(async (args, runtime, resolved) => {
  const directory = args.positionals[2];
  if (!directory)
    throw usageError("project export requires a directory: screenrig project export ./export.");
  const since = flagString(args.flags, "since");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const api = {
    get: async (pathName, query) => (await client.call({ method: "GET", path: pathName, query })).body,
    list: async (pathName, query) => {
      const response = await client.listAll(pathName, query, { uncapped: true });
      const items = response.body?.items;
      return Array.isArray(items) ? items : [];
    },
    file: async (pathName, query, target, contentType) => {
      await downloadToFile(client, { path: pathName, query, target, contentType, what: pathName });
    },
    append: async (pathName, offset, target) => {
      const response = await client.download({ method: "GET", path: pathName, headers: offset > 0 ? { range: "bytes=".concat(offset, "-") } : void 0 });
      if (!response.body)
        throw usageError("".concat(pathName, " returned no body."));
      const handle = await open2(target, offset > 0 && response.status === 206 ? "a" : "w", 384);
      try {
        for await (const chunk of response.body) {
          let written = 0;
          while (written < chunk.byteLength)
            written += (await handle.write(chunk, written, chunk.byteLength - written)).bytesWritten;
        }
        await handle.sync();
      } finally {
        await handle.close();
      }
    }
  };
  const result = await runProjectExport(api, {
    directory: path2.resolve(runtime.cwd(), directory),
    media: !flagBool(args.flags, "no-media"),
    since,
    now: runtime.now(),
    progress: (line) => runtime.stderr.write("".concat(line, "\n"))
  });
  const warnings = result.sections.filter((section) => section.status !== "ok").map((section) => ({
    code: section.code === "application_content_omitted" ? "export_application_content_omitted" : section.status === "failed" ? "export_section_failed" : "export_section_skipped",
    message: "".concat(section.name, ": ").concat(section.detail ?? section.status)
  }));
  const data = {
    directory: result.directory,
    complete: result.failed === 0,
    sections: result.sections,
    media: result.media,
    files: result.files.length,
    bytes: result.files.reduce((sum, file) => sum + file.bytes, 0)
  };
  return {
    envelope: successEnvelope(data, { request_id: client.requestId, warnings }),
    exitCode: ExitCode.Success,
    human: [
      "Project exported to ".concat(result.directory),
      "  files: ".concat(data.files, " (").concat(formatBytes(data.bytes), "), listed in export.json with their SHA-256"),
      "  media: ".concat(result.media.listed, " listed, ").concat(result.media.downloaded, " downloaded, ").concat(result.media.kept, " already complete, ").concat(result.media.failed, " failed"),
      ...result.sections.filter((section) => section.status !== "ok").map((section) => "  ".concat(section.status, ": ").concat(section.name, ": ").concat(section.detail ?? "")),
      result.failed > 0 ? "  Check each section's recovery steps before rerunning; finished files are kept." : "  Run the same command again at any time to refresh the copy."
    ].join("\n")
  };
});

// dist/cli-commands/project.js
function registerProjectCommands(root, bind) {
  const project = root.command("project").description("Create, select, and manage projects");
  project.command("token").description("Request one access token for a subset of consented projects").requiredOption("--projects <IDS>", "Select 1\u201364 project IDs separated by commas or spaces", projectSubset).action(bind(handleProjectToken));
  project.command("list").description("List this identity's accessible projects by organization").action(bind(handleProjectList));
  project.command("create").description("Create and select a named project; defaults to the current or administered organization").argument("<NAME>", "Project name, unique within its organization").addOption(new Option("--organization-id <ID>", "Create in an organization you administer").conflicts("organization")).option("--organization <NAME>", "Use an accessible organization by name, or create one when you hold no free organization").action(bind(handleProjectCreate));
  project.command("use").description("Select an accessible project as the last-used project").argument("<ID>", "Project ID from project list").action(bind(handleProjectUse));
  project.command("moves").description("List destinations permitted for this project's owner").action(bind(handleProjectMoves));
  project.command("move").description("Move this project, carrying its screens to the destination payer").requiredOption("--organization-id <ID>", "Destination from project moves").action(bind(handleProjectMove));
  project.command("transfer-owner").description("Transfer ownership to an existing verified project member").requiredOption("--user-id <ID>", "Verified person's ID").action(bind(handleProjectOwnerTransfer));
  project.command("deletion-preview").description("Read deletion conditions, archived devices, name and revision").action(bind(handleProjectDeletionPreview));
  project.command("delete").description("Delete an eligible project and email its members").requiredOption("--name <NAME>", "Exact name from deletion-preview").requiredOption("--revision <N>", "Exact revision from deletion-preview", positiveInteger("revision")).option("--yes", "Confirm deletion").action(bind(handleProjectDelete));
  addCommandNotes(project.command("show").description("Inspect your project and credits").action(bind(handleProjectShow)), CREDIT_HELP);
  project.command("capabilities").description("Read this project's plan, feature flags, and effective capabilities").action(bind(handleProjectCapabilities));
  project.command("uptime").description("Read the project's daily screen availability over UTC days").option("--day-from <YYYY-MM-DD>", "First UTC day, inclusive (default 29 days before --day-to)").option("--day-to <YYYY-MM-DD>", "Last UTC day, inclusive (default today); at most 366 days after --day-from").addOption(reportFormatOption()).addOption(reportOutputOption("project-uptime.FORMAT")).action(bind(handleProjectUptime));
  project.command("health-trend").description("List the fleet's health by UTC hour: screens reporting, hot, display disconnected, crashing").option("--from <TIME>", "Inclusive start of the hour: RFC 3339, now, or an age such as 7d, 12h, 30m (default 24 hours before --to)", playsInstantOption("--from")).option("--to <TIME>", "Exclusive end: RFC 3339, now, or an age (default now); at most 93 days after --from", playsInstantOption("--to")).addOption(reportFormatOption()).addOption(reportOutputOption("health-trend.FORMAT")).action(bind(handleProjectHealthTrend));
  const exportCommand = subcommand(project, "export").description("Write this project's data to a directory in open formats with each section's outcome").argument("<DIR>", "Directory to write (created if needed; a rerun continues and refreshes it)").option("--no-media", "Skip the original media files (the manifest still lists them with their hashes)").option("--since <YYYY-MM-DD>", "First UTC day of the plays, uptime and playback CSV and of the event log (default: as far back as the plan keeps the CSV data, and the whole log)");
  exportCommand.action(bind(handleProjectExport));
  addCommandNotes(exportCommand, [
    "Export:",
    "  DIR gets JSON for the project, screens, screen folders, tags, per-screen",
    "  schedules, playlists with every revision, campaigns, direct campaigns, cards and",
    "  their data, sources (credentials never included), notifications, webhooks (no",
    "  signing secrets or receiver URLs), mutes, application metadata, triggers and report",
    "  subscriptions; the original media files (media/files) with media/manifest.json",
    "  holding each file's SHA-256; CSV for plays, playback, uptime and alerts (data/);",
    "  and the project event log (log/events.jsonl). export.json lists every file with",
    "  its size and SHA-256. A rerun keeps media files that are complete and continues",
    "  partial ones. It reads through the project's own routes, so it needs the",
    "  access those reads need; a section the credential cannot read is reported as",
    "  skipped. Application files are reported as omitted with complete:false and",
    "  an export_application_content_omitted warning, including with --no-media.",
    "  Retain original application archives alongside the export for recovery;",
    "  rerunning refreshes metadata. Each request is a billed API request, and",
    "  media downloads are egress."
  ].join("\n"));
  project.command("rename").description("Rename this project").argument("<NAME>", "Project display name").action(bind(handleProjectRename));
}

// dist/handlers/organization.js
var handleOrganizationList = commandHandler(async (args, runtime, resolved) => {
  const identity = await identityForCommand(runtime, resolved);
  const client = clientFor(runtime, args, identity.apiUrl, identity.identityToken);
  const response = await client.call({ method: "GET", path: "/api/organizations" });
  const body = response.body;
  if (!Array.isArray(body?.organizations) || body.organizations.some((org) => !org || !/^(?:(?:stage|qa|development)_)?org_[A-Za-z0-9_-]+$/.test(org.id) || typeof org.name !== "string" || typeof org.admin !== "boolean"))
    throw configError("Organization list does not match the contract.");
  const tags = (org) => [org.admin && "admin", org.free === true && "free", org.plan_required === true && "plan required", org.library_project_id && "Library ".concat(org.library_project_id)].filter(Boolean).join(", ");
  const lines = body.organizations.map((org) => "".concat(projectName(org.name, "Organization name"), ": ").concat(org.id).concat(tags(org) ? " (".concat(tags(org), ")") : ""));
  if (body.new_organization_allowed === false)
    lines.push("New organization: add projects to an existing organization; another needs a paid plan.");
  return {
    envelope: successEnvelope(body, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: lines.join("\n") || "No visible organizations."
  };
}, false);
var handleOrganizationRename = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  if (!id || !/^(?:(?:stage|qa|development)_)?org_[A-Za-z0-9_-]+$/.test(id))
    throw usageError("organization rename requires an organization ID.");
  const name = projectName(args.positionals[3], "Organization name");
  const identity = await identityForCommand(runtime, resolved);
  const client = clientFor(runtime, args, identity.apiUrl, identity.identityToken);
  const response = await client.call({ method: "PATCH", path: "/api/organizations/".concat(encodeURIComponent(id)), body: { name } });
  const organization = response.body;
  if (organization?.id !== id || projectName(organization.name, "Organization name") !== name)
    throw configError("Organization rename response does not match this request.");
  const listed = await accessibleProjects(args, runtime, identity);
  await cacheProjectContexts(runtime, identity, listed.projects, { identityToken: identity.identityToken });
  return { envelope: successEnvelope({ organization }, { request_id: client.requestId }), exitCode: ExitCode.Success, human: "Organization renamed: ".concat(name, " (").concat(id, ")") };
}, false);

// dist/cli-commands/organization.js
function registerOrganizationCommands(root, bind) {
  const organization = root.command("organization").description("List organizations and administer their names");
  organization.command("list").description("List visible organizations without granting project access").action(bind(handleOrganizationList));
  organization.command("rename").description("Rename an organization you administer").argument("<ID>", "Organization ID from organization list").argument("<NAME>", "New display name").action(bind(handleOrganizationRename));
}

// dist/handlers/invitations.js
function invitationEmail(value) {
  const email = value?.trim();
  if (!email) {
    throw usageError("invitations create requires --email ADDRESS.");
  }
  if (!isPlainContactEmail(email)) {
    throw usageError("invitations create --email must be one plain ASCII address with an unquoted local part and dotted DNS domain.");
  }
  return email;
}
var handleInvitationsCreate = commandHandler(async (args, runtime, resolved) => {
  const uploader = flagString(args.flags, "kind") === "uploader";
  const kind = flagString(args.flags, "kind") === "ad-buyer" ? "ad_buyer" : "project_member";
  const link = flagBool(args.flags, "link");
  if (link && flagString(args.flags, "email") !== void 0)
    throw usageError("--link cannot be used with --email: a link names no recipient. Use --email to invite by email, or --link alone.");
  const emails = link ? [] : adsListOption(flagString(args.flags, "email"), "email").map(invitationEmail);
  if (!link && (!emails.length || emails.length > 50))
    throw usageError("invitations create requires --link, or --email with 1 to 50 addresses.");
  const screenIds = adsListOption(flagString(args.flags, "screen-id"), "screen-id");
  const screenFolderIds = adsListOption(flagString(args.flags, "screen-folder-id"), "screen-folder-id");
  const slotIds = adsListOption(flagString(args.flags, "slot-id"), "slot-id");
  const policy = flagString(args.flags, "policy");
  if (kind === "ad_buyer" && link)
    throw usageError("--link is available only for member invitations.");
  if (kind === "project_member" && (slotIds.length || policy !== void 0)) {
    throw usageError("Advertising scope and policy require --kind ad-buyer.");
  }
  if (kind === "ad_buyer" && screenFolderIds.length)
    throw usageError("--screen-folder-id limits a member to screen folders and needs --kind member.");
  if (uploader && (screenIds.length || screenFolderIds.length)) {
    throw usageError("An uploader works in media folders and playlists, not screens: give --folder-id and --playlist-id with --kind uploader, or --screen-folder-id and --screen-id with --kind member.");
  }
  const screenScope = kind === "project_member" && (screenIds.length || screenFolderIds.length) ? screenScopeFromArgs(screenFolderIds, screenIds) : void 0;
  if (!uploader && (flagString(args.flags, "folder-id") !== void 0 || flagString(args.flags, "playlist-id") !== void 0 || flagString(args.flags, "access") !== void 0)) {
    throw usageError("--folder-id, --playlist-id and --access require --kind uploader.");
  }
  const uploadScope = uploader ? uploadScopeFromArgs(args, "invitations create --kind uploader", true) : void 0;
  if (uploadScope?.access !== void 0 && uploadScope.access !== "propose" && uploadScope.access !== "manage")
    throw usageError("--access takes propose or manage.");
  if (kind === "ad_buyer" && !screenIds.length && !slotIds.length) {
    throw usageError("Ad-buyer invitations require at least one --screen-id or --slot-id.");
  }
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: "POST",
    path: "/api/invitations",
    idempotent: true,
    body: {
      kind,
      delivery: link ? "link" : "email",
      ...!link ? { emails } : {},
      ...uploadScope ? { upload_scope: uploadScope } : {},
      ...screenScope ? { screen_scope: screenScope } : {},
      ...kind === "ad_buyer" ? { advertising: { screen_ids: screenIds, slot_ids: slotIds, policy: policy ?? "trusted" } } : {}
    }
  });
  requirePrivateNoStore(response.headers, "Invitation response");
  const body = response.body;
  if (!Array.isArray(body?.invitations) || !body.invitations.length || link && body.invitations.length !== 1) {
    throw usageError("Invitation response does not match the generated invitation contract.");
  }
  const invitations = body.invitations.map((value) => {
    const invitation = validateInvitation(value);
    if (link) {
      if (typeof value.url !== "string" || !value.url)
        throw usageError("Link invitation response is missing its URL.");
      return { ...invitation, url: value.url };
    }
    return invitation;
  });
  return {
    envelope: successEnvelope({ invitations }, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: humanLines("Invitations created", [
      ["invitations", String(invitations.length)],
      ["delivery", link ? "Deliver this link only to the intended person; do not store or log it." : "Email requested; delivery is not confirmed."],
      ...link ? [["url", invitations[0].url]] : []
    ])
  };
});
var handleInvitationsList = commandHandler(async (args, runtime, resolved) => {
  const kind = flagString(args.flags, "kind");
  const status = flagString(args.flags, "status");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "/api/invitations", query: {
    ...kind ? { kind: kind === "ad-buyer" ? "ad_buyer" : "project_member" } : {},
    ...status ? { status } : {}
  } });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: JSON.stringify(response.body, null, 2)
  };
});
var handleInvitationsRevoke = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  if (!id)
    throw usageError("invitations revoke requires ID.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  await client.call({ method: "POST", path: "/api/invitations/".concat(encodeURIComponent(id), "/revoke"), idempotent: true });
  return {
    envelope: successEnvelope({ id, status: "revoked" }, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: humanLines("Invitation revoked", [["id", id], ["status", "revoked"]])
  };
});
function isDateTime(value) {
  return typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value));
}
function validateInvitation(value) {
  const invitation = value;
  if (!invitation || typeof invitation.id !== "string" || !invitation.id || !["project_member", "ad_buyer"].includes(invitation.kind ?? "") || !["email", "link"].includes(invitation.delivery ?? "") || !["queued", "sent", "issued", "accepted", "revoked", "expired", "failed"].includes(invitation.status ?? "") || typeof invitation.project_id !== "string" || !invitation.project_id || !isDateTime(invitation.created_at) || !isDateTime(invitation.expires_at)) {
    throw usageError("Invitation response does not match the generated invitation contract.");
  }
  const screenScope = screenScopeOf(invitation.screen_scope);
  return {
    id: invitation.id,
    kind: invitation.kind,
    delivery: invitation.delivery,
    status: invitation.status,
    project_id: invitation.project_id,
    created_at: invitation.created_at,
    expires_at: invitation.expires_at,
    ...invitation.recipient_email ? { recipient_email: invitation.recipient_email } : {},
    ...invitation.advertising ? { advertising: invitation.advertising } : {},
    ...invitation.upload_scope ? { upload_scope: invitation.upload_scope } : {},
    ...screenScope ? { screen_scope: screenScope } : {}
  };
}

// dist/cli-commands/invitations.js
function registerInvitationCommands(root, bind) {
  const invitations = root.command("invitations").description("Invite project members, uploaders and advertising buyers");
  const create = invitations.command("create").description("Create member or ad-buyer invitations").addOption(new Option("--email <ADDRESS[,ADDRESS]>", "Comma-separated recipient addresses to email").conflicts("link")).addOption(new Option("--kind <KIND>", "Invitation kind").choices(["member", "uploader", "ad-buyer"]).default("member")).addOption(new Option("--link", "Print one member invitation URL instead of emailing; it names no recipient, so deliver it only to the intended person").conflicts("email")).option("--screen-id <ID>", "Comma-separated screen identifiers (scr_...): the screens allowed for an ad-buyer, or the single screens a --kind member invitation limits the person to").option("--screen-folder-id <ID[,ID]>", "Comma-separated screen folders (sfd_...), each with every folder inside it, that a --kind member invitation limits the person to").option("--slot-id <ID>", "Comma-separated slot identifiers allowed for an ad-buyer").addOption(new Option("--policy <POLICY>", "Ad-buyer creative review policy").choices(["trusted", "review_required"])).option("--folder-id <ID[,ID]>", "Comma-separated media folders (mfd_...) an uploader uploads into; required with --kind uploader").option("--playlist-id <ID[,ID]>", "Comma-separated playlists (pl_...) an uploader changes pages of").addOption(new Option("--access <LEVEL>", "An uploader's level: propose sends its changes to review (default), manage publishes them").choices(["propose", "manage"])).action(bind(handleInvitationsCreate));
  addCommandNotes(create, INVITATION_HELP);
  requireOptionGroup(create, "exactlyOne", ["--email", "--link"]);
  invitations.command("list").description("List this project's invitations").addOption(new Option("--kind <KIND>", "Filter invitation kind").choices(["member", "ad-buyer"])).addOption(new Option("--status <STATUS>", "Filter invitation status").choices(["queued", "sent", "issued", "accepted", "revoked", "expired", "failed"])).action(bind(handleInvitationsList));
  invitations.command("revoke").description("Revoke an outstanding invitation").argument("<ID>", "Invitation identifier").action(bind(handleInvitationsRevoke));
}

// dist/handlers/billing.js
var handleBillingBalance = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const response = await client.call({ method: "GET", path: "/api/billing/balance" });
  requirePrivateNoStore(response.headers, "Billing balance response");
  const body = response.body ?? {};
  const withdrawal = body.withdrawal ?? {};
  const blockers = Array.isArray(withdrawal.blockers) ? withdrawal.blockers.filter((item) => typeof item === "string") : [];
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: humanLines("Credit balance", [
      ["remaining_mcr", typeof body.remaining_mcr === "string" ? body.remaining_mcr : void 0],
      ["reserved_mcr", typeof body.reserved_mcr === "string" ? body.reserved_mcr : void 0],
      ["available_mcr", typeof body.available_mcr === "string" ? body.available_mcr : void 0],
      ["withdrawal_allowed", withdrawal.allowed === void 0 ? void 0 : String(withdrawal.allowed)],
      ["eligible_earned_mcr", typeof withdrawal.eligible_earned_mcr === "string" ? withdrawal.eligible_earned_mcr : void 0],
      ["rails", withdrawal.rails_available === false ? "unavailable (".concat(typeof withdrawal.unavailable_reason === "string" ? withdrawal.unavailable_reason : "no payment rail", "); credits are spent in the dashboard and no payout can be requested from this CLI") : withdrawal.rails_available === true ? "available to the verified financial administrator in the dashboard" : void 0],
      ["blockers", blockers.length > 0 ? blockers.join(", ") : void 0],
      ["note", "purchased credits are not withdrawable, and promotional or included grants cannot fund paid ad spend"]
    ])
  };
});
var handleBillingStatement = commandHandler((args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/billing/statement", "Credit statement", {
  cursor: flagString(args.flags, "cursor"),
  limit: flagString(args.flags, "limit")
}));

// dist/cli-commands/billing.js
function registerBillingCommands(root, bind) {
  const billing = root.command("billing").description("Read this project's credits and ledger statement");
  billing.command("balance").description("Read remaining, reserved, and available credits with source eligibility").action(bind(handleBillingBalance));
  billing.command("statement").description("Read posted ledger entries").option("--cursor <CURSOR>", "Continue from the next_cursor of a previous statement").option("--limit <COUNT>", "Maximum entries to return", positiveInteger("limit")).action(bind(handleBillingStatement));
  addCommandNotes(billing.commands.find((command) => command.name() === "balance"), "One balance is shared by ordinary usage, AI generation, and advertising. Sources explain eligibility, not separate wallets: purchased credits cannot be withdrawn, promotional and included grants cannot fund paid ad spend, and only unspent, matured ad-earned credits can be withdrawn. A displayed balance never authorizes work; the server decides admission.");
  addCommandNotes(billing.commands.find((command) => command.name() === "statement"), "Entries are posted journal rows, ordered by a stable sequence. Reservations are shown as holds, not posted revenue or spend, and corrections link to the original entry instead of rewriting it. An advertising debit is visible to the buyer; a seller's gross, serving fee, and net are visible to the seller.");
}

// dist/login.js
import { randomBytes } from "node:crypto";
var LOGIN_MAX_INTERVAL_S = 60;
var LOGIN_ID_RE = /^login_[A-Za-z0-9_-]{22}$/;
function pendingSignIn(login2, now) {
  if (!login2 || !LOGIN_ID_RE.test(login2.id) || !(Date.parse(login2.expires_at) > now.getTime()))
    return void 0;
  const resume = ["login", "--resume", login2.id];
  return {
    status: "connecting",
    login_id: login2.id,
    user_code: login2.user_code,
    verification_uri: login2.verification_uri,
    verification_uri_complete: login2.verification_uri_complete,
    expires_at: login2.expires_at,
    access: login2.access,
    ...login2.project_id ? { project_id: login2.project_id } : {},
    next: { command: "screenrig ".concat(resume.join(" ")), argv: resume, reason: "After the person approves the sign-in, this stores its tokens." }
  };
}
function loginProblem(code, detail) {
  return code === "login_expired" ? new CliError(makeProblem(code, "Sign-in expired", 400, detail, { next: { command: "screenrig login", reason: "Start a new sign-in; each code lasts 24 hours." } }), ExitCode.Timeout) : new CliError(makeProblem(code, "No pending sign-in", 404, detail, { next: { command: "screenrig login", reason: "Start a new sign-in." } }), ExitCode.Usage);
}
function retriable(err) {
  return err instanceof CliError && ["transport_error", "timeout", "service_unavailable", "rate_limited", "unexpected_response"].includes(err.problem.code);
}
var DeviceLogin = class {
  session;
  configPath;
  runtime;
  constructor(session, configPath, runtime) {
    this.session = session;
    this.configPath = configPath;
    this.runtime = runtime;
  }
  read() {
    return readConfigFile(this.configPath, this.runtime.fs);
  }
  locked(action) {
    return withConfigLock(this.configPath, this.runtime.fs, { sleep: this.runtime.sleep, now: () => this.runtime.now().getTime() }, action);
  }
  write(config) {
    return writeConfigAtomic(this.configPath, { ...config, updated_at: this.runtime.now().toISOString() }, this.runtime.fs);
  }
  expired(login2) {
    return Date.parse(login2.expires_at) <= this.runtime.now().getTime();
  }
  /** Drop the pending-login slot, only when it is still this sign-in. */
  async clear(id) {
    await this.locked(async () => {
      const current = await this.read();
      if (current?.login?.id !== id)
        return;
      const { login: _ended, ...rest } = current;
      await this.write(rest);
    });
  }
  /** The pending sign-in to continue: the one --resume names, or one started with the same request. */
  async pending(request) {
    const file = await this.read();
    const login2 = file?.login;
    if (request.resume !== void 0) {
      if (!LOGIN_ID_RE.test(request.resume))
        throw usageError("login --resume takes the login_ handle a pending sign-in printed.");
      if (!login2 || login2.id !== request.resume)
        throw loginProblem("login_not_found", "No pending sign-in ".concat(request.resume, " is stored in this config."));
      if (this.expired(login2)) {
        await this.clear(login2.id);
        throw loginProblem("login_expired", "The pending sign-in expired before it was approved.");
      }
      return login2;
    }
    if (login2 && !this.expired(login2) && login2.access === request.access && login2.project_id === request.project)
      return login2;
    return void 0;
  }
  async run(request, onPending) {
    let login2 = await this.pending(request);
    const resumed = login2 !== void 0;
    if (!login2)
      login2 = await this.start(request);
    if (!request.wait)
      return { status: "pending", login: login2, resumed };
    onPending(login2, resumed);
    const tokens = await this.poll(login2);
    return this.store(login2, tokens);
  }
  async start(request) {
    const bearer = await this.session.identityToken();
    const started = await this.session.oauth.startDevice({
      access: request.access,
      ...request.project ? { projectId: request.project } : {},
      ...request.name ? { name: request.name } : {},
      ...request.platform ? { platform: request.platform } : {},
      ...request.version ? { version: request.version } : {},
      ...request.installSource ? { installSource: request.installSource } : {},
      ...bearer ? { bearer } : {}
    });
    const login2 = {
      id: "login_".concat(randomBytes(16).toString("base64url")),
      issuer: this.session.oauth.issuer,
      device_code: started.deviceCode,
      user_code: started.userCode,
      verification_uri: started.verificationUri,
      verification_uri_complete: started.verificationUriComplete,
      expires_at: new Date(this.runtime.now().getTime() + started.expiresIn * 1e3).toISOString(),
      interval: started.interval,
      access: request.access,
      ...request.project ? { project_id: request.project } : {},
      ...bearer ? { extends_grant: true } : {}
    };
    await this.locked(async () => {
      const current = await this.read();
      await this.write({ ...current ?? { api_url: this.session.oauth.issuer }, login: login2 });
    });
    return login2;
  }
  /** Poll outside the lock until approval, denial or expiry. */
  async poll(login2) {
    let interval = Math.max(login2.interval, 5);
    const budget = Math.ceil((Date.parse(login2.expires_at) - this.runtime.now().getTime()) / 5e3) + 2;
    for (let attempt = 0; attempt < budget; attempt += 1) {
      if (this.expired(login2))
        break;
      await this.runtime.sleep(interval * 1e3);
      let result;
      try {
        result = await this.session.oauth.pollDevice(login2.device_code);
      } catch (err) {
        if (retriable(err)) {
          interval = Math.min(interval * 2, LOGIN_MAX_INTERVAL_S);
          continue;
        }
        if (err instanceof CliError && ["login_denied", "login_expired", "session_ended"].includes(err.problem.code)) {
          await this.clear(login2.id);
        }
        throw err;
      }
      if (result.status === "approved")
        return result.tokens;
      if (result.status === "slow_down")
        interval += 5;
    }
    await this.clear(login2.id);
    throw loginProblem("login_expired", "Nobody approved the sign-in before its code expired.");
  }
  /** Store the tokens under the lock and select the approved project. */
  async store(login2, tokens) {
    const claims = accessClaims(tokens.accessToken);
    const agentId = claims?.sub?.startsWith("agent:") ? claims.sub.slice("agent:".length) : void 0;
    const extended = tokens.refreshToken === void 0;
    await this.locked(async () => {
      const current = await this.read();
      if (!current || current.login?.id !== login2.id)
        throw configError("The pending sign-in changed before its tokens were stored. Run screenrig login again.");
      const { login: _done, signed_out_at: _signedOut, ...rest } = current;
      let next;
      if (extended) {
        if (!rest.oauth)
          throw configError("The sign-in extended a grant this config no longer holds. Run screenrig login again.");
        next = placeAccessToken(rest, tokens.accessToken, tokens.scope);
      } else {
        next = placeAccessToken(preserveLogSocket(rest, { api_url: rest.api_url ?? this.session.oauth.issuer }), tokens.accessToken, tokens.scope);
        next.oauth = {
          issuer: login2.issuer,
          client_id: OAUTH_CLIENT_ID,
          refresh_token: tokens.refreshToken,
          ...tokens.refreshExpiresAt !== void 0 ? { refresh_expires_at: tokens.refreshExpiresAt } : {},
          identity: tokens.scope.includes(SCOPE_IDENTITY)
        };
        if (agentId)
          next.agent_id = agentId;
      }
      if (claims?.prj && next.project_id !== claims.prj)
        next = selectProject(next, claims.prj);
      await this.write(next);
    });
    return { status: "signed_in", login: login2, ...claims?.prj ? { projectId: claims.prj } : {}, ...agentId ? { agentId } : {}, scope: tokens.scope, extended };
  }
};

// dist/enrollment.js
var DEFINITE_ENROLL_REFUSALS = /* @__PURE__ */ new Set([400, 403, 404, 422]);
async function ensureCredential(options) {
  const { runtime, resolved } = options;
  if (resolved.token && !resolved.enrollment) {
    return resolved;
  }
  const enrolled = await withConfigLock(resolved.configPath, runtime.fs, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    const current = await readConfigFile(resolved.configPath, runtime.fs);
    if (current?.token) {
      return {
        ...resolved,
        token: current.token,
        projectId: current.project_id,
        projectName: current.project_name,
        organizationId: current.organization_id,
        organizationName: current.organization_name,
        identityToken: current.identity_token,
        agentId: current.agent_id,
        enrollment: current.enrollment,
        lastAgent: current.last_agent,
        source: { ...resolved.source, token: "config" }
      };
    }
    if (current?.enrollment && current.api_url.replace(/\/+$/, "") !== resolved.apiUrl) {
      throw configError("Pending enrollment is bound to a different API URL.");
    }
    const existingEnrollment = current?.enrollment;
    if (existingEnrollment?.email && options.enrollmentEmail && existingEnrollment.email !== options.enrollmentEmail) {
      throw configError("Pending enrollment is bound to a different contact email. Resume it without changing --email.");
    }
    if (existingEnrollment?.agentid_claim && options.enrollmentAgentIdClaim && existingEnrollment.agentid_claim !== options.enrollmentAgentIdClaim) {
      throw configError("Pending enrollment is bound to a different AgentID claim. Resume it without changing --agentid-claim, or discard it with agent enroll --force.");
    }
    if (existingEnrollment?.email && options.enrollmentAgentIdClaim) {
      throw configError("Pending enrollment redeems a contact email, not an AgentID claim. Resume it without --agentid-claim, or discard it with agent enroll --force.");
    }
    if (existingEnrollment?.agentid_claim && options.enrollmentEmail) {
      throw configError("Pending enrollment redeems an AgentID claim, not a contact email. Resume it without --email, or discard it with agent enroll --force.");
    }
    if (existingEnrollment?.intent && options.enrollmentIntent && existingEnrollment.intent !== options.enrollmentIntent) {
      throw configError("Pending enrollment is bound to a different purpose. Resume it without changing --intent, or discard it with agent enroll --force.");
    }
    if (existingEnrollment && options.enrollmentSetupCode !== void 0 && existingEnrollment.setup_code !== options.enrollmentSetupCode) {
      throw configError(existingEnrollment.setup_code ? "Pending enrollment is bound to a different setup code. Resume it without changing --setup-code, or discard it with agent enroll --force." : "Pending enrollment was started without a setup code. Resume it without --setup-code, or discard it with agent enroll --force.");
    }
    const email = existingEnrollment?.email ?? options.enrollmentEmail;
    const agentidClaim2 = existingEnrollment?.agentid_claim ?? options.enrollmentAgentIdClaim;
    if (existingEnrollment && options.enrollmentOrganization !== void 0 && existingEnrollment.organization !== options.enrollmentOrganization) {
      throw configError("Pending enrollment is bound to a different organization. Resume without changing --organization.");
    }
    if (email === void 0 === (agentidClaim2 === void 0)) {
      throw configError("Enrollment requires exactly one of --email ADDRESS or --agentid-claim CODE. Run screenrig agent enroll --email ADDRESS --organization NAME or screenrig agent enroll --agentid-claim CODE --organization NAME.");
    }
    const intent = existingEnrollment?.intent ?? options.enrollmentIntent;
    const setupCode = existingEnrollment?.setup_code ?? options.enrollmentSetupCode;
    const projectName2 = existingEnrollment?.project_name;
    const organization = existingEnrollment ? existingEnrollment.organization : options.enrollmentOrganization;
    const enrollment = {
      ...existingEnrollment?.credential_format === "oauth" ? existingEnrollment : {
        client_id: (options.generateClientId ?? (() => randomPrefixedId("cli", 32)))(),
        idempotency_key: (options.generateIdempotencyKey ?? newIdempotencyKey)()
      },
      credential_format: "oauth",
      ...email !== void 0 ? { email } : {},
      ...agentidClaim2 !== void 0 ? { agentid_claim: agentidClaim2 } : {},
      ...projectName2 !== void 0 ? { project_name: projectName2 } : {},
      ...organization !== void 0 ? { organization } : {},
      ...intent ? { intent } : {},
      ...setupCode !== void 0 ? { setup_code: setupCode } : {}
    };
    if (!/^cli_[A-Za-z0-9_-]{43}$/.test(enrollment.client_id)) {
      throw configError("Enrollment client state is invalid.");
    }
    if (!isValidIdempotencyKey(enrollment.idempotency_key)) {
      throw configError("Enrollment idempotency state is invalid.");
    }
    const pending = preserveLogSocket(current, {
      api_url: resolved.apiUrl,
      enrollment,
      updated_at: runtime.now().toISOString()
    });
    await writeConfigAtomic(resolved.configPath, pending, runtime.fs);
    let credential;
    try {
      credential = await options.enroll({
        clientId: enrollment.client_id,
        idempotencyKey: enrollment.idempotency_key,
        ...enrollment.email !== void 0 ? { email: enrollment.email } : {},
        ...enrollment.agentid_claim !== void 0 ? { agentidClaim: enrollment.agentid_claim } : {},
        ...enrollment.project_name !== void 0 ? { projectName: enrollment.project_name } : {},
        ...enrollment.organization !== void 0 ? { organization: enrollment.organization } : {},
        ...enrollment.intent ? { intent: enrollment.intent } : {},
        ...enrollment.setup_code !== void 0 ? { setupCode: enrollment.setup_code } : {},
        credentialFormat: enrollment.credential_format
      });
    } catch (error) {
      if (error instanceof CliError && (error.problem.code === "feature_unavailable" || DEFINITE_ENROLL_REFUSALS.has(error.problem.status))) {
        const { enrollment: _refused, ...rest } = current ?? { api_url: resolved.apiUrl };
        await writeConfigAtomic(resolved.configPath, { ...rest, api_url: resolved.apiUrl }, runtime.fs);
      }
      throw error;
    }
    if (!credential.token || credential.token.trim() !== credential.token) {
      throw configError("Enrollment returned an invalid credential.");
    }
    const config = preserveLogSocket(current, {
      api_url: resolved.apiUrl,
      token: credential.token,
      ...credential.projectId ? { project_id: credential.projectId } : {},
      ...credential.projectName ? { project_name: credential.projectName } : {},
      ...credential.agentId ? { agent_id: credential.agentId } : {},
      ...credential.identityToken ? { identity_token: credential.identityToken } : {},
      ...credential.organizationId ? { organization_id: credential.organizationId } : {},
      ...credential.organizationName ? { organization_name: credential.organizationName } : {},
      oauth: {
        issuer: new URL(resolved.apiUrl).origin,
        client_id: OAUTH_CLIENT_ID,
        refresh_token: credential.oauth.refreshToken,
        ...credential.oauth.refreshExpiresAt !== void 0 ? { refresh_expires_at: credential.oauth.refreshExpiresAt } : {},
        identity: credential.oauth.identity
      },
      enrollment,
      updated_at: runtime.now().toISOString()
    });
    await writeConfigAtomic(resolved.configPath, config, runtime.fs);
    return {
      ...resolved,
      token: credential.token,
      projectId: credential.projectId,
      projectName: credential.projectName,
      agentId: credential.agentId,
      identityToken: credential.identityToken,
      organizationId: credential.organizationId,
      organizationName: credential.organizationName,
      enrollment,
      source: { ...resolved.source, token: "config" }
    };
  });
  if (!enrolled.token || !enrolled.enrollment) {
    return enrolled;
  }
  await options.verify(enrolled.token, enrolled.projectId);
  return withConfigLock(enrolled.configPath, runtime.fs, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    const current = await readConfigFile(enrolled.configPath, runtime.fs);
    if (!current?.token || !current.enrollment) {
      return enrolled;
    }
    if (current.token !== enrolled.token || current.enrollment.idempotency_key !== enrolled.enrollment?.idempotency_key) {
      throw configError("Enrollment state changed before verification cleanup.");
    }
    const { enrollment: _verified, ...verified } = current;
    await writeConfigAtomic(enrolled.configPath, verified, runtime.fs);
    const { enrollment: _cleared, ...complete } = enrolled;
    return complete;
  });
}

// dist/install-source.js
import { fileURLToPath } from "node:url";
var INSTALL_SOURCE = /^[a-z][a-z0-9-]{0,31}(\/[a-z0-9][a-z0-9._-]{0,63})?$/;
function installSource(settings, moduleUrl = import.meta.url) {
  const value = settings.SCREENRIG_INSTALL_SOURCE?.trim();
  if (value && INSTALL_SOURCE.test(value))
    return value;
  return /[\\/]node_modules[\\/]screenrig[\\/]/.test(fileURLToPath(moduleUrl)) ? "npm" : void 0;
}

// dist/service-login.js
import { readFile as readFile2 } from "node:fs/promises";
import path3 from "node:path";
var DEVICE_LOGIN_FLAGS = ["project", "access", "name", "resume"];
function holdsAgentSignIn(file) {
  return Boolean(file && (file.token || file.identity_token || file.oauth || file.enrollment || file.login || file.agent_id || Object.keys(file.projects ?? {}).length));
}
async function serviceLogin(args, runtime, resolved) {
  const clientId = flagString(args.flags, "client-id");
  if (!isServiceClientId(clientId))
    throw usageError("login --client-id must be a service client id (scl_...) from screenrig service-client list.");
  for (const flag of DEVICE_LOGIN_FLAGS) {
    if (flagString(args.flags, flag) !== void 0)
      throw usageError("login --".concat(flag, " is for a person's sign-in; a service client signs in with --client-id alone."));
  }
  if (flagBool(args.flags, "no-wait"))
    throw usageError("login --no-wait is for a person's sign-in; a service client signs in at once.");
  const keyFile = flagString(args.flags, "client-key-file");
  const secretFile = flagString(args.flags, "client-secret-file");
  if (Boolean(keyFile) === Boolean(secretFile))
    throw usageError("login --client-id takes exactly one of --client-key-file PATH (the private key) or --client-secret-file PATH (a file holding the secret).");
  const saved = {
    client_id: clientId,
    ...keyFile ? { key_file: path3.resolve(runtime.cwd(), keyFile) } : { secret_file: path3.resolve(runtime.cwd(), secretFile) }
  };
  const service = await serviceCredentialsFromConfig(saved, (file) => readFile2(file, "utf8"));
  const fs = runtime.fs;
  await withConfigLock(resolved.configPath, fs, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    const current = await readConfigFile(resolved.configPath, fs);
    if (holdsAgentSignIn(current)) {
      throw usageError("".concat(resolved.configPath, " holds this installation's agent sign-in. Save the service client in a config of its own: screenrig --config PATH login --client-id ").concat(clientId, " ..."));
    }
    await writeConfigAtomic(resolved.configPath, {
      ...preserveLogSocket(current, { api_url: resolved.apiUrl }),
      service_client: saved,
      updated_at: runtime.now().toISOString()
    }, fs);
  });
  const next = ["project", "show"];
  return {
    envelope: successEnvelope({
      status: "signed_in",
      service_client_id: clientId,
      method: service.method,
      config: resolved.configPath,
      next: { command: "screenrig ".concat(next.join(" ")), argv: next, reason: "The first project command signs in as the service client." }
    }),
    exitCode: ExitCode.Success,
    human: "Saved service client ".concat(clientId, " in ").concat(resolved.configPath, ". Every command with this config signs in as it, reading the ").concat(keyFile ? "key" : "secret", " file each time.")
  };
}
async function serviceLogout(runtime, resolved) {
  const fs = runtime.fs;
  return withConfigLock(resolved.configPath, fs, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    const current = await readConfigFile(resolved.configPath, fs);
    const saved = current?.service_client;
    if (!current || !saved)
      return void 0;
    const { service_client: _removed, ...rest } = current;
    await writeConfigAtomic(resolved.configPath, { ...rest, updated_at: runtime.now().toISOString() }, fs);
    return {
      envelope: successEnvelope({ status: "signed_out", service_client_id: saved.client_id, revoked: false }),
      exitCode: ExitCode.Success,
      human: "Removed service client ".concat(saved.client_id, " from ").concat(resolved.configPath, ". Its key or secret file is unchanged; revoke the client with screenrig service-client revoke ").concat(saved.client_id, ".")
    };
  });
}

// dist/agent-identity.js
var AGENT_ID = RESOURCE_ID_PATTERNS.agent;
function isDateTime2(value) {
  return typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value));
}
function agentPlatform() {
  return "".concat(process.platform, "/").concat(process.arch);
}
function validateAgent(value, expectedState) {
  const agent = value;
  if (!agent || typeof agent.id !== "string" || !AGENT_ID.test(agent.id) || typeof agent.name !== "string" || agent.name.length === 0 || typeof agent.agent_type !== "string" || agent.agent_type.length === 0 || !["pending", "active", "revoked", "cancelled", "expired"].includes(agent.state ?? "") || typeof agent.authenticated_requests !== "number" || typeof agent.metered_credits !== "number" || !Array.isArray(agent.capabilities) || agent.capabilities.length === 0 || agent.capabilities.some((name) => typeof name !== "string") || !isDateTime2(agent.created_at) || expectedState !== void 0 && agent.state !== expectedState) {
    throw usageError("Agent response does not match the generated Agent contract.");
  }
  return agent;
}
function validateAgentSelfStatus(value, expectedState) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw usageError("Agent self status does not match the generated AgentSelfStatus contract.");
  }
  const status = value;
  if (typeof status.connection_ready !== "boolean") {
    throw usageError("Agent self status does not match the generated AgentSelfStatus contract.");
  }
  const level = (value2) => ["read", "propose", "manage"].includes(value2) ? value2 : void 0;
  const access = level(status.access);
  const effective = level(status.effective_access);
  const limitedBy = status.access_limited_by === "project" || status.access_limited_by === "person" ? status.access_limited_by : void 0;
  const screenScope = screenScopeOf(status.screen_scope);
  const personScope = screenScopeOf(status.person_screen_scope);
  return {
    agent: validateAgent(status.agent, expectedState),
    connection_ready: status.connection_ready,
    ...access ? { access } : {},
    ...effective ? { effective_access: effective } : {},
    ...limitedBy ? { access_limited_by: limitedBy } : {},
    ...screenScope ? { screen_scope: screenScope } : {},
    ...personScope ? { person_screen_scope: personScope } : {}
  };
}

// dist/handlers/agent.js
function enrollmentEmail(value) {
  const email = value?.trim();
  if (!email) {
    throw usageError("agent enroll requires --email ADDRESS for unverified project contact metadata.");
  }
  if (!isPlainContactEmail(email)) {
    throw usageError("agent enroll --email must be one plain ASCII address with an unquoted local part and dotted DNS domain.");
  }
  return email;
}
function agentidClaim(value) {
  const claim = value?.trim();
  if (!claim) {
    throw usageError("agent enroll requires --agentid-claim CODE.");
  }
  if (!/^agid_[A-Za-z0-9_-]{43}$/.test(claim)) {
    throw usageError("agent enroll --agentid-claim must be an AgentID claim code: agid_ followed by 43 base64url characters.");
  }
  return claim;
}
function agentidSignInUrl(apiUrl) {
  let api;
  try {
    api = new URL(apiUrl);
  } catch {
    return void 0;
  }
  const supported = api.protocol === "https:" || api.protocol === "http:" && api.hostname.endsWith(".localhost");
  return supported ? "".concat(api.origin, "/agentid/start") : void 0;
}
function enrollmentPurpose(value) {
  const intent = value?.trim();
  if (!intent)
    return void 0;
  if (intent !== "signage" && intent !== "advertising") {
    throw usageError("agent enroll --intent must be signage or advertising.");
  }
  return intent;
}
function enrollmentSetupCode(value) {
  if (value === void 0)
    return void 0;
  const code = value.trim();
  if (!/^[0-9A-Za-z]{4}-?[0-9A-Za-z]{4}$/.test(code)) {
    throw usageError("agent enroll --setup-code must be a setup code: two groups of four letters and digits, such as K7QX-2MPD.");
  }
  const bare = code.replace("-", "").toUpperCase();
  return "".concat(bare.slice(0, 4), "-").concat(bare.slice(4));
}
var handleAgentStatus = commandHandler(agentStatus, false);
var handleLogin = commandHandler(async (args, runtime, resolved) => {
  if (flagString(args.flags, "client-id") !== void 0 || flagString(args.flags, "client-key-file") !== void 0 || flagString(args.flags, "client-secret-file") !== void 0) {
    return loggerOf(runtime).withLocal({ op: "login", message: "login service client" }, () => serviceLogin(args, runtime, resolved));
  }
  return loggerOf(runtime).withLocal({ op: "login", message: "login" }, () => {
    const access = flagString(args.flags, "access") ?? "manage";
    if (!ACCESS_LEVELS.includes(access))
      throw usageError("login --access must be read, propose or manage.");
    return login(args, runtime, resolved, {
      project: flagString(args.flags, "project"),
      access,
      wait: !flagBool(args.flags, "no-wait"),
      resume: flagString(args.flags, "resume")
    });
  });
}, false);
var handleLogout = commandHandler(logout, false);
async function login(args, runtime, resolved, request) {
  if (request.project !== void 0 && !isResourceID(request.project, "project"))
    throw usageError("login --project must be a project ID (prj_...).");
  const name = flagString(args.flags, "name");
  if (name && name.length > 80)
    throw usageError("login --name is at most 80 characters.");
  const session = oauthSessionFor(runtime, resolved);
  const device = new DeviceLogin(session, resolved.configPath, sessionRuntime(runtime));
  const source = installSource(runtime.settings);
  const outcome = await device.run({
    access: request.access,
    ...request.project ? { project: request.project } : {},
    ...name ? { name } : {},
    platform: agentPlatform(),
    version: CLI_VERSION,
    ...source ? { installSource: source } : {},
    wait: request.wait,
    ...request.resume !== void 0 ? { resume: request.resume } : {}
  }, (pending2, resumed) => {
    runtime.stderr.write("".concat(resumed ? "Still waiting" : "Sign-in started", ": open ").concat(pending2.verification_uri_complete, " and confirm the code ").concat(pending2.user_code, ". It expires at ").concat(pending2.expires_at, ".\n"));
  });
  const pending = outcome.login;
  if (outcome.status === "pending") {
    const resume = ["login", "--resume", pending.id];
    return {
      envelope: successEnvelope({
        status: "pending",
        login_id: pending.id,
        user_code: pending.user_code,
        verification_uri: pending.verification_uri,
        verification_uri_complete: pending.verification_uri_complete,
        expires_at: pending.expires_at,
        access: pending.access,
        ...pending.project_id ? { project_id: pending.project_id } : {},
        next: { command: "screenrig ".concat(resume.join(" ")), argv: resume, reason: "After the person approves the sign-in, this stores its tokens." }
      }),
      exitCode: ExitCode.Success,
      human: humanLines(outcome.resumed ? "Sign-in pending" : "Sign-in started", [
        ["open", pending.verification_uri_complete],
        ["code", pending.user_code],
        ["expires_at", pending.expires_at],
        ["next", "screenrig ".concat(resume.join(" "))]
      ])
    };
  }
  const signedIn = await resolveConfig({
    flags: { ...typeof args.flags.config === "string" ? { config: args.flags.config } : {}, ...typeof args.flags["api-url"] === "string" ? { "api-url": args.flags["api-url"] } : {} },
    fs: { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir }
  });
  const token = requireToken(signedIn.token);
  const client = clientFor(runtime, args, signedIn.apiUrl, token);
  const response = await client.call({ method: "GET", path: "/api/project" });
  const context = contextFromProject(response.body);
  await cacheProjectContexts(runtime, signedIn, [context], { credential: token });
  const access = accessFromScope(outcome.scope);
  const self = await selfStatusFor(runtime, args, signedIn.apiUrl, token);
  const levels = accessFields({ access, effective_access: self?.effective_access, access_limited_by: self?.access_limited_by });
  return withNotesHint({
    envelope: successEnvelope({
      status: "signed_in",
      project: context.project,
      organization: context.organization,
      ...levels.data,
      identity: outcome.scope.includes(SCOPE_IDENTITY),
      ...outcome.agentId ? { agent_id: outcome.agentId } : {}
    }, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: humanLines("Signed in", [
      ["project", "".concat(context.organization.name, " / ").concat(context.project.name, " (").concat(context.project.id, ")")],
      ...levels.lines
    ])
  }, self ? selfNoteCounts(self) : void 0);
}
async function logout(_args, runtime, resolved) {
  const service = await serviceLogout(runtime, resolved);
  if (service)
    return service;
  const { revoked } = await oauthSessionFor(runtime, resolved).logout();
  return {
    envelope: successEnvelope({ status: "signed_out", revoked }),
    exitCode: ExitCode.Success,
    human: revoked ? "Signed out. The sign-in is revoked and its tokens were removed from this config." : "Already signed out."
  };
}
var handleAgentEnroll = commandHandler(async (args, runtime, resolved) => {
  return loggerOf(runtime).withLocal({ op: "agent.enroll", message: "agent enroll" }, () => agentEnroll(args, runtime, resolved));
}, false);
var handleAgentDisconnect = commandHandler(agentDisconnect, false);
var handleAgentRevokeIdentity = commandHandler(agentRevokeIdentity, false);
function safeAgentSummary(agent) {
  return {
    id: agent.id,
    name: agent.name,
    agent_type: agent.agent_type,
    state: agent.state,
    capabilities: agent.capabilities,
    ...agent.platform ? { platform: agent.platform } : {},
    ...agent.version ? { version: agent.version } : {},
    ...agent.connected_at ? { connected_at: agent.connected_at } : {},
    ...agent.last_used_at ? { last_used_at: agent.last_used_at } : {},
    ...agent.revoked_at ? { revoked_at: agent.revoked_at } : {},
    authenticated_requests: agent.authenticated_requests,
    metered_credits: agent.metered_credits
  };
}
function withNotesHint(result, counts) {
  const warning = notesHintWarning(counts);
  const hint = notesHint(counts);
  if (!warning || !hint)
    return result;
  return {
    ...result,
    envelope: { ...result.envelope, warnings: [...result.envelope.warnings, warning] },
    human: result.human ? "".concat(result.human, "\n").concat(hint) : hint
  };
}
async function selfStatusFor(runtime, args, apiUrl, token) {
  if (!token)
    return void 0;
  try {
    const response = await clientFor(runtime, args, apiUrl, token).call({ method: "GET", path: AGENT_SELF_PATH });
    const body = response.body;
    if (!body || typeof body !== "object" || Array.isArray(body))
      return void 0;
    const level = (value) => ACCESS_LEVELS.includes(value) ? value : void 0;
    const record = body;
    const limitedBy = record.access_limited_by === "project" || record.access_limited_by === "person" ? record.access_limited_by : void 0;
    return { ...record, access: level(record.access), effective_access: level(record.effective_access), access_limited_by: limitedBy };
  } catch {
    return void 0;
  }
}
async function agentStatus(args, runtime, resolved) {
  if (!resolved.token) {
    const pending = pendingSignIn(resolved.login, runtime.now());
    if (pending) {
      return {
        envelope: successEnvelope(pending),
        exitCode: ExitCode.Success,
        human: humanLines("Sign-in pending", [
          ["status", pending.status],
          ["open", pending.verification_uri_complete],
          ["expires_at", pending.expires_at],
          ["next", pending.next.command]
        ])
      };
    }
    const local = resolved.lastAgent;
    const status = local ? "disconnected" : "not_enrolled";
    return {
      envelope: successEnvelope({ status, path: "first_run_enroll", ...local ? { agent: local } : {} }),
      exitCode: ExitCode.Success,
      human: humanLines("Agent", [
        ["status", status],
        ["id", local?.id],
        ["name", local?.name],
        ["capabilities", local?.capabilities.join(", ")]
      ])
    };
  }
  const client = clientFor(runtime, args, resolved.apiUrl, resolved.token);
  try {
    const response = await client.call({ method: "GET", path: AGENT_SELF_PATH });
    requirePrivateNoStore(response.headers, "Agent status response");
    const self = validateAgentSelfStatus(response.body);
    const agent = self.agent;
    const status = agent.state === "active" ? "active" : agent.state === "revoked" ? "disconnected" : "connecting";
    const notes = selfNotesField(response.body);
    const levels = accessFields(self);
    return withNotesHint({
      envelope: successEnvelope({
        status,
        connection_ready: self.connection_ready,
        ...levels.data,
        ...self.screen_scope ? { screen_scope: self.screen_scope } : {},
        ...self.person_screen_scope ? { person_screen_scope: self.person_screen_scope } : {},
        agent: safeAgentSummary(agent),
        ...notes ? { notes } : {}
      }, { request_id: client.requestId }),
      exitCode: ExitCode.Success,
      human: humanLines("Agent", [
        ["status", status],
        ["id", agent.id],
        ["name", agent.name],
        ["agent_type", agent.agent_type],
        ...levels.lines,
        ["screen_scope", self.screen_scope ? screenScopeText(self.screen_scope) : void 0],
        ["person_screen_scope", self.person_screen_scope ? screenScopeText(self.person_screen_scope) : void 0],
        ["capabilities", agent.capabilities.join(", ")],
        ["platform", agent.platform],
        ["version", agent.version],
        ["connection_ready", self.connection_ready ? "true" : "false"],
        ["last_used_at", agent.last_used_at]
      ])
    }, selfNoteCounts(response.body));
  } catch (err) {
    if (!(err instanceof CliError) || err.problem.code !== "unauthorized")
      throw err;
    const next = {
      command: "screenrig agent disconnect --yes",
      reason: "The stored credential is no longer accepted. Complete local cleanup before connecting or enrolling."
    };
    return {
      envelope: successEnvelope({
        status: "disconnected",
        credential_accepted: false,
        local_cleanup_required: true,
        next
      }),
      exitCode: ExitCode.Success,
      human: humanLines("Agent", [
        ["status", "disconnected"],
        ["credential_accepted", "false"],
        ["next", next.command]
      ])
    };
  }
}
async function agentEnroll(args, runtime, resolved) {
  requireFlagValue(args, "name", "Office MacBook Codex");
  const name = flagString(args.flags, "name");
  if (name && name.length > 80)
    throw usageError("agent enroll --name is at most 80 characters.");
  const enrollIntent = enrollmentPurpose(flagString(args.flags, "intent"));
  const setupCode = enrollmentSetupCode(flagString(args.flags, "setup-code"));
  let enrollmentConfig = resolved;
  let replacedCredential = false;
  if (resolved.retiredCredential) {
    if (!freshEnrollmentInput(args))
      throw credentialRetiredError();
    enrollmentConfig = await dropDeadCredential(runtime, args, resolved);
    replacedCredential = true;
  } else if (resolved.enrollment && flagBool(args.flags, "force")) {
    const forceEmail = flagString(args.flags, "email");
    const forceClaim = flagString(args.flags, "agentid-claim");
    if (forceEmail !== void 0)
      enrollmentEmail(forceEmail);
    else if (forceClaim !== void 0)
      agentidClaim(forceClaim);
    else
      throw usageError("agent enroll --force requires --email ADDRESS or --agentid-claim CODE.");
    await clearPendingEnrollment(runtime, resolved);
    enrollmentConfig = await resolveConfig({
      flags: args.flags,
      fs: { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir }
    });
  }
  const enrollOnce = async (config) => {
    const enrolled = await enrollForCommand(args, runtime, config, {
      ...name ? { name } : {},
      ...enrollIntent ? { intent: enrollIntent } : {},
      ...setupCode !== void 0 ? { setupCode } : {},
      explicit: true
    });
    const token = requireToken(enrolled.token);
    setResultContext(runtime, enrolled);
    const client2 = clientFor(runtime, args, enrolled.apiUrl, token);
    const response = await client2.call({ method: "GET", path: "/api/agents/self" });
    requirePrivateNoStore(response.headers, "Agent enrollment verification response");
    const self2 = validateAgentSelfStatus(response.body, "active");
    let project2;
    if (!config.token && enrolled.projectId && enrolled.projectName) {
      project2 = { id: enrolled.projectId, name: enrolled.projectName };
    } else {
      const projectResponse = await client2.call({ method: "GET", path: "/api/project" });
      project2 = projectResponse.body;
    }
    return { client: client2, self: self2, project: project2 };
  };
  let outcome;
  try {
    outcome = await enrollOnce(enrollmentConfig);
  } catch (err) {
    if (!enrollmentConfig.token || enrollmentConfig.enrollment || !deadCredentialRefusal(err) || !freshEnrollmentInput(args))
      throw err;
    enrollmentConfig = await dropDeadCredential(runtime, args, enrollmentConfig);
    replacedCredential = true;
    outcome = await enrollOnce(enrollmentConfig);
  }
  const { client, self, project } = outcome;
  const agent = self.agent;
  return {
    envelope: successEnvelope({
      status: "active",
      connection_ready: self.connection_ready,
      agent: safeAgentSummary(agent),
      project: { id: project.id, name: project.name },
      invitation: "emailed to the contact address",
      ...replacedCredential ? { replaced_credential: true } : {}
    }, { request_id: client.requestId, ...replacedCredential ? { warnings: [CREDENTIAL_REPLACED] } : {} }),
    exitCode: ExitCode.Success,
    human: humanLines("Agent enrolled", [
      ...replacedCredential ? [["replaced", "the retired stored credential; this installation now uses the new project"]] : [],
      ["status", "active"],
      ["id", agent.id],
      ["name", agent.name],
      ["capabilities", agent.capabilities.join(", ")],
      ["connection_ready", self.connection_ready ? "true" : "false"],
      ["project_id", project.id],
      ["project_name", project.name],
      ["invitation", "emailed to the contact address"]
    ])
  };
}
var CREDENTIAL_REPLACED = {
  code: "credential_replaced",
  message: "The stored credential was retired (the server no longer accepts it), so this enrollment replaced it with the new project's credential."
};
function freshEnrollmentInput(args) {
  return flagString(args.flags, "email") !== void 0 || flagString(args.flags, "agentid-claim") !== void 0;
}
function deadCredentialRefusal(err) {
  if (!(err instanceof CliError))
    return false;
  return err.problem.code === "session_ended" || err.problem.status === 401 && ["credential_retired", "unauthorized"].includes(err.problem.code);
}
async function dropDeadCredential(runtime, args, resolved) {
  const email = flagString(args.flags, "email");
  const claim = flagString(args.flags, "agentid-claim");
  if (email !== void 0)
    enrollmentEmail(email);
  if (claim !== void 0)
    agentidClaim(claim);
  const organization = flagString(args.flags, "organization");
  if (organization === void 0)
    throw usageError("agent enroll requires --organization NAME.");
  projectName(organization, "Organization name");
  const fsLike = { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir };
  await withConfigLock(resolved.configPath, fsLike, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    const current = await readConfigFile(resolved.configPath, fsLike);
    if (!current)
      return;
    if (current.token && !isRetiredCredential(current.token) && !sameCredential(current.token, resolved.token)) {
      throw configError("The stored credential changed during enrollment. Run the command again.");
    }
    await writeConfigAtomic(resolved.configPath, preserveLogSocket(current, {
      api_url: current.api_url,
      ...current.enrollment ? { enrollment: current.enrollment } : {},
      updated_at: runtime.now().toISOString()
    }), fsLike);
  });
  oauthSessions.delete(runtime);
  const next = await resolveConfig({ flags: args.flags, fs: fsLike });
  oauthSessionFor(runtime, next);
  return next;
}
async function clearPendingEnrollment(runtime, resolved) {
  const fsLike = { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir };
  await withConfigLock(resolved.configPath, fsLike, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    const current = await readConfigFile(resolved.configPath, fsLike);
    if (!current?.enrollment)
      return;
    const { enrollment: _pending, token: _token, project_id: _project, project_name: _projectName, agent_id: _agent, ...rest } = current;
    await writeConfigAtomic(resolved.configPath, { ...rest, updated_at: runtime.now().toISOString() }, fsLike);
  });
}
async function removeLocalAgentCredential(runtime, resolved, token, agent) {
  const fsLike = { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir };
  await withConfigLock(resolved.configPath, fsLike, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    const current = await readConfigFile(resolved.configPath, fsLike);
    if (!current) {
      throw configError("The stored agent credential changed before local disconnect cleanup.");
    }
    const scoped = projectConfigFor(current, resolved);
    assertProjectCredential(scoped, { ...resolved, token });
    if (current.identity_token || current.projects) {
      const { token: _token, screen_provision: _provision, browser_setup: _browser, media_generate: _generate, pending_writes: _writes, ...withoutCredential } = scoped;
      const next = withProjectConfig(current, resolved, { ...withoutCredential, updated_at: runtime.now().toISOString() });
      if (!accessClaims(next.token)?.projects && resolved.projectId === accessClaims(next.token)?.prj)
        delete next.token;
      if (!accessClaims(next.identity_token)?.projects && resolved.projectId && accessClaims(next.identity_token)?.prj === resolved.projectId)
        delete next.identity_token;
      await writeConfigAtomic(resolved.configPath, next, fsLike);
      return;
    }
    const lastAgent = agent ? {
      id: agent.id,
      name: agent.name,
      agent_type: agent.agent_type,
      capabilities: agent.capabilities,
      state: "revoked",
      revoked_at: runtime.now().toISOString()
    } : current.last_agent;
    await writeConfigAtomic(resolved.configPath, preserveLogSocket(current, {
      api_url: current.api_url,
      ...lastAgent ? { last_agent: lastAgent } : {},
      updated_at: runtime.now().toISOString()
    }), fsLike);
  });
}
async function agentDisconnect(args, runtime, resolved) {
  const invokedName = "agent disconnect";
  if (!flagBool(args.flags, "yes")) {
    throw usageError("".concat(invokedName, " requires --yes. It revokes only this agent and preserves the project, screens, content, and other agents."), {
      command: "screenrig agent disconnect --yes",
      reason: "Run only after explicitly accepting revocation of this installation."
    });
  }
  if (!resolved.token)
    throw usageError("No stored ScreenRig agent credential exists; nothing was changed.");
  const token = resolved.token;
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  let agent;
  let credentialRejected = false;
  try {
    const current = await client.call({ method: "GET", path: "/api/agents/self" });
    requirePrivateNoStore(current.headers, "Agent status response");
    agent = validateAgentSelfStatus(current.body).agent;
  } catch (err) {
    if (!(err instanceof CliError) || err.problem.code !== "unauthorized")
      throw err;
    credentialRejected = true;
  }
  if (!credentialRejected) {
    const request = flagBool(args.flags, "allow-lockout") ? { allow_last_agent: true } : {};
    let response;
    try {
      response = await client.call({
        method: "POST",
        path: "/api/agents/self/disconnect",
        ...request.allow_last_agent ? { body: request } : {}
      });
    } catch (err) {
      if (err instanceof CliError && err.problem.code === "unauthorized") {
        credentialRejected = true;
      } else if (err instanceof CliError) {
        throw new CliError({
          ...err.problem,
          next: err.problem.code === "agent_lockout_risk" ? {
            command: "screenrig agent disconnect --yes --allow-lockout",
            reason: "Use only after confirming a registered dashboard passkey or explicitly accepting loss of this project."
          } : {
            command: "screenrig agent disconnect --yes",
            reason: "Local credential state was retained. Retrying the exact disconnect is safe after an ambiguous response."
          }
        }, err.exitCode);
      } else {
        throw err;
      }
    }
    if (!credentialRejected) {
      if (!response || response.status !== 204 || response.body !== void 0) {
        throw configError("The agent disconnect endpoint did not return the required empty 204 response; local credential state was retained.");
      }
      requirePrivateNoStore(response.headers, "Agent disconnect response");
    }
  }
  try {
    await removeLocalAgentCredential(runtime, resolved, token, agent);
  } catch (err) {
    const prefix = credentialRejected ? "The stored credential is no longer accepted, but atomic local cleanup failed" : "The server disconnected this agent, but atomic local cleanup failed";
    throw configError("".concat(prefix, ": ").concat(redactText(err instanceof Error ? err.message : "unknown filesystem error"), ". The retained credential no longer authorizes project operations."), {
      command: "screenrig agent disconnect --yes",
      reason: "Retrying with the retained exact credential safely completes local cleanup."
    });
  }
  return {
    envelope: successEnvelope({
      status: "disconnected",
      local_credential_removed: true,
      project_preserved: true,
      screens_preserved: true,
      other_agents_preserved: true,
      ...credentialRejected ? { credential_accepted: false } : {}
    }, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: humanLines("Agent disconnected", [
      ["local_credential", "removed"],
      ["project_screens_and_other_agents", "preserved"],
      ["next", "screenrig agent enroll --email ADDRESS --organization NAME creates a new project; screenrig login joins an existing one only when the user asks"]
    ])
  };
}
async function agentRevokeIdentity(args, runtime, resolved) {
  if (!flagBool(args.flags, "yes"))
    throw usageError("agent revoke-identity requires --yes. It revokes this identity and all of its project memberships.");
  const identity = await identityForCommand(runtime, resolved);
  const client = clientFor(runtime, args, identity.apiUrl, identity.identityToken);
  let alreadyRejected = false;
  try {
    const response = await client.call({ method: "POST", path: "/api/agent-identity/revoke" });
    if (response.status !== 204 || response.body !== void 0)
      throw configError("Identity revocation did not return an empty 204; local credentials were retained.");
    requirePrivateNoStore(response.headers, "Identity revocation response");
  } catch (error) {
    if (!(error instanceof CliError) || error.problem.code !== "unauthorized")
      throw error;
    alreadyRejected = true;
  }
  const fs = { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir };
  await withConfigLock(resolved.configPath, fs, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    const current = await readConfigFile(resolved.configPath, fs);
    if (!current || !sameCredential(current.identity_token, identity.identityToken, "identity"))
      throw configError("Identity changed before revocation cleanup. Local credentials were retained.");
    const scrub = (value) => {
      const { token: _token, token_projects: _subset, screen_provision: _provision, browser_setup: _browser, media_generate: _generate, pending_writes: _writes2, ...rest2 } = value;
      return rest2;
    };
    const { identity_token: _identity, identity_writes: _writes, enrollment: _enrollment, oauth: _grant, login: _login, ...rest } = scrub(current);
    const projects = current.projects ? Object.fromEntries(Object.entries(current.projects).map(([id, value]) => [id, scrub({ api_url: current.api_url, ...value })])) : void 0;
    if (projects)
      for (const slot of Object.values(projects))
        delete slot.api_url;
    await writeConfigAtomic(resolved.configPath, { ...rest, ...projects ? { projects } : {}, updated_at: runtime.now().toISOString() }, fs);
  });
  return {
    envelope: successEnvelope({ status: "revoked", all_memberships_revoked: true, local_credentials_removed: true, ...alreadyRejected ? { credential_accepted: false } : {} }, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: "Agent identity and all project memberships revoked."
  };
}
async function enrollForCommand(args, runtime, resolved, options = {}) {
  const suppliedEmail = flagString(args.flags, "email");
  const suppliedClaim = flagString(args.flags, "agentid-claim");
  const alreadyEnrolled = Boolean(resolved.token && !resolved.enrollment);
  const persistedEmail = resolved.enrollment?.email;
  const persistedClaim = resolved.enrollment?.agentid_claim;
  if (persistedEmail && suppliedEmail !== void 0 && enrollmentEmail(suppliedEmail) !== persistedEmail) {
    throw usageError("The pending enrollment is bound to a different contact email. Resume it without changing --email.");
  }
  if (persistedClaim && suppliedClaim !== void 0 && agentidClaim(suppliedClaim) !== persistedClaim) {
    throw usageError("The pending enrollment is bound to a different AgentID claim. Resume it without changing --agentid-claim, or discard it with agent enroll --force.");
  }
  if (resolved.enrollment && suppliedEmail !== void 0 && persistedClaim !== void 0) {
    throw usageError("The pending enrollment redeems an AgentID claim, not a contact email. Resume it without --email, or discard it with agent enroll --force.");
  }
  if (resolved.enrollment && suppliedClaim !== void 0 && persistedEmail !== void 0) {
    throw usageError("The pending enrollment redeems a contact email, not an AgentID claim. Resume it without --agentid-claim, or discard it with agent enroll --force.");
  }
  const email = alreadyEnrolled ? void 0 : persistedEmail ?? (suppliedEmail !== void 0 ? enrollmentEmail(suppliedEmail) : void 0);
  const claim = alreadyEnrolled ? void 0 : persistedClaim ?? (suppliedClaim !== void 0 ? agentidClaim(suppliedClaim) : void 0);
  if (!alreadyEnrolled && email === void 0 === (claim === void 0)) {
    throw usageError("agent enroll requires --email ADDRESS or --agentid-claim CODE.");
  }
  const organizationFlag = flagString(args.flags, "organization");
  const organization = organizationFlag !== void 0 ? projectName(organizationFlag, "Organization name") : resolved.enrollment?.organization;
  if (!resolved.token && !resolved.enrollment && !organization)
    throw usageError("agent enroll requires --organization NAME.");
  return await ensureCredential({
    resolved,
    ...email !== void 0 ? { enrollmentEmail: email } : {},
    ...claim !== void 0 ? { enrollmentAgentIdClaim: claim } : {},
    ...organization !== void 0 ? { enrollmentOrganization: organization } : {},
    ...options.intent ? { enrollmentIntent: options.intent } : {},
    ...options.setupCode !== void 0 ? { enrollmentSetupCode: options.setupCode } : {},
    runtime: {
      fs: { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir },
      now: runtime.now,
      sleep: runtime.sleep
    },
    enroll: async (state) => {
      const client = clientFor(runtime, args, resolved.apiUrl);
      const source = installSource(runtime.settings);
      const request = {
        client_id: state.clientId,
        credential_format: state.credentialFormat,
        ...state.email !== void 0 ? { email: state.email } : {},
        ...state.agentidClaim !== void 0 ? { agentid_claim: state.agentidClaim } : {},
        ...state.projectName !== void 0 ? { project_name: state.projectName } : {},
        ...state.organization !== void 0 ? { organization: state.organization } : {},
        ...state.intent ? { intent: state.intent } : {},
        ...state.setupCode !== void 0 ? { setup_code: state.setupCode } : {},
        ...options.name ? { name: options.name } : {},
        ...options.explicit ? { agent_type: "cli", platform: agentPlatform(), version: CLI_VERSION } : {},
        ...source ? { install_source: source } : {}
      };
      let response;
      try {
        response = await client.call({
          method: "POST",
          path: "/api/enrollments",
          idempotent: true,
          idempotencyKey: state.idempotencyKey,
          body: request
        });
      } catch (err) {
        if (err instanceof CliError) {
          if (err.problem.code === "agentid_claim_invalid" && !err.problem.next) {
            const signIn = agentidSignInUrl(resolved.apiUrl);
            throw new CliError({
              ...err.problem,
              next: {
                command: signIn ?? "screenrig agent enroll --email ADDRESS --organization NAME",
                reason: signIn ? "The AgentID claim code is missing, already redeemed, or expired. Sign in again at ".concat(signIn, " for a new claim code, or enroll with a contact email: screenrig agent enroll --email ADDRESS --organization NAME.") : "The AgentID claim code is missing, already redeemed, or expired. Enroll with a contact email instead: screenrig agent enroll --email ADDRESS --organization NAME."
              }
            }, err.exitCode, err.warnings);
          }
          if (err.problem.code === "agentid_already_enrolled" && !err.problem.next) {
            throw new CliError({
              ...err.problem,
              next: {
                command: "screenrig login",
                reason: "This AgentID already holds an enrolled agent. Sign this installation in to the existing project instead of enrolling a second agent."
              }
            }, err.exitCode, err.warnings);
          }
        }
        throw err;
      }
      requirePrivateNoStore(response.headers, "Enrollment response");
      const delivered = response.body;
      const agent = validateAgent(delivered.agent, "active");
      if (!delivered.project?.id || !delivered.project.name || !delivered.invitation?.id || delivered.connection_ready !== false || !isSessionJwt(delivered.access_token) || (typeof delivered.refresh_token !== "string" || !delivered.refresh_token) || delivered.token_type !== "Bearer" || typeof delivered.scope !== "string" || !delivered.issuance_id || !delivered.issuance_expires_at) {
        throw usageError("Enrollment response does not match the generated CLIEnrollmentOAuth contract.");
      }
      const identity = delivered.scope.split(" ").includes(SCOPE_IDENTITY);
      return {
        token: delivered.access_token,
        projectId: delivered.project.id,
        projectName: delivered.project.name,
        agentId: agent.id,
        ...identity ? { identityToken: delivered.access_token } : {},
        organizationId: delivered.project.organization_id,
        organizationName: delivered.project.organization_name,
        oauth: {
          refreshToken: delivered.refresh_token,
          ...typeof delivered.refresh_expires_at === "number" ? { refreshExpiresAt: delivered.refresh_expires_at } : {},
          identity
        }
      };
    },
    verify: async (token, projectId) => {
      const client = clientFor(runtime, args, resolved.apiUrl, token);
      const response = await client.call({ method: "GET", path: "/api/project" });
      const project = response.body;
      if (!project.id || projectId && project.id !== projectId) {
        throw usageError("Persisted enrollment credential did not verify against its project.");
      }
    }
  });
}

// dist/cli-commands/agent.js
function registerAgentCommands(root, bind) {
  const login2 = root.command("login").description("Sign this installation in with a person's approval in the dashboard").option("--project <ID>", "Suggest the project the person approves").addOption(new Option("--access <LEVEL>", "Ask for Read only, Propose or Manage access (default manage)").choices([...ACCESS_LEVELS])).option("--name <NAME>", "Set this agent installation name").option("--no-wait", "Print the sign-in URL and code with a resume handle, and return").option("--resume <ID>", "Continue a pending sign-in by the login_ handle --no-wait printed").option("--client-id <ID>", "Sign this config in as a service client (scl_...) instead of an agent").option("--client-key-file <PATH>", "With --client-id, the service client's private key (a JWK or PEM)").option("--client-secret-file <PATH>", "With --client-id, a file holding the service client's secret").action(bind(handleLogin));
  addCommandNotes(login2, "A server, script or CI job signs in as a service client instead: screenrig --config PATH login --client-id scl_... --client-key-file KEY.pem (or --client-secret-file FILE) saves the client in that config without a person's approval, and every later command with that config signs in as it, reading the key or secret file each time; screenrig logout removes it. Prints a dashboard URL and a code. A person signed in to the dashboard opens the link, which carries the code and shows one screen with the code, the project, Read only, Propose or Manage, and the capabilities; they check that the code matches the one shown here and press Connect once, with no second passkey prompt when they signed in to the dashboard in the last hour; the CLI then stores the session and selects that project. The code lasts 24 hours. --access suggests a level; the person approving chooses it. An installation that already holds identity access adds the approved project to its sign-in, which is also how a project's access is raised. Read only lists and reads; it cannot change, publish or buy, and metered reads still bill. Propose also uploads media and changes its tags, which wait for review before any selector plays the change, and writes notes; every change to what plays (playlist create and update, screen assign, schedules, takeovers) becomes a review that a person approves in the dashboard before it reaches a screen. Manage applies changes directly. A project that requires review for agent changes, or a responsible person who cannot approve, holds the sign-in to Propose; agent status shows access, effective_access and access_limited_by. --no-wait returns at once with a login_ handle that holds no secret; screenrig login --resume ID waits for the approval later. When the signed-in agent has new project notes or notes due for review, warning notes_waiting names them and screenrig notes; human output prints the same line after the result.");
  requireOptionGroup(login2, "atMostOne", ["--client-key-file", "--client-secret-file"]);
  addCommandNotes(root.command("logout").description("End this installation's sign-in and remove its tokens").action(bind(handleLogout)), "Revokes the sign-in on the server, then removes the stored session and access tokens. In a service client's config it removes the saved client and leaves its key or secret file. A failure that might not have reached the server keeps them, so rerunning logout is safe. Run screenrig login to sign in again.");
  const agent = root.command("agent").description("Enroll and manage this agent");
  const enroll = agent.command("enroll").description("Create a new project and its first agent").option("--email <ADDRESS>", "Set the project contact email").option("--agentid-claim <CODE>", "Redeem an AgentID sign-in claim code instead of a contact email").option("--organization <NAME>", "Create the organization containing Screens").addOption(new Option("--intent <INTENT>", "Choose the project's purpose: signage (default) or advertising").choices(["signage", "advertising"])).option("--setup-code <CODE>", "Link the new project to the website visit that showed this setup code, such as K7QX-2MPD").option("--name <NAME>", "Set this agent installation name").option("--force", "Discard a pending enrollment before enrolling").action(bind(handleAgentEnroll));
  requireOptionGroup(enroll, "atMostOne", ["--email", "--agentid-claim"]);
  agent.command("status").description("Inspect this agent's connection and access").action(bind(handleAgentStatus));
  agent.command("disconnect").description("Revoke this agent's membership in the current project").option("--yes", "Confirm this project's membership revocation").option("--allow-lockout", "Allow disconnecting the last agent").action(bind(handleAgentDisconnect));
  agent.command("revoke-identity").description("Revoke this identity and all its project memberships").option("--yes", "Confirm revocation across every project").action(bind(handleAgentRevokeIdentity));
}

// dist/handlers/service-client.js
import { open as open3, readFile as readFile3, rm as rm2 } from "node:fs/promises";
import path4 from "node:path";
function serviceClientId(args, verb) {
  const id = args.positionals[2];
  if (!isServiceClientId(id))
    throw usageError("service-client ".concat(verb, " requires a service client id (scl_...) from service-client list."));
  return id;
}
function serviceClientLines(client) {
  return [
    ["id", client.id],
    ["name", client.name],
    ...accessFields(client).lines,
    ["state", client.state],
    ["capabilities", client.capabilities.join(", ")],
    ["keys", client.keys.map((key) => "".concat(key.kid, " (").concat(key.alg, ")")).join(", ") || void 0],
    ["secrets", client.secrets.map((secret) => "".concat(secret.id, " (\u2026").concat(secret.hint, ")")).join(", ") || void 0],
    ["last_used_at", client.last_used_at],
    ...client.upload_scope ? [["uploader", "folders ".concat(client.upload_scope.folder_ids.join(", "), "; playlists ").concat(client.upload_scope.playlist_ids.join(", ") || "none")]] : []
  ];
}
async function serviceKeyFromFile(args, runtime) {
  const file = flagString(args.flags, "key-file");
  if (file === void 0)
    return void 0;
  let text;
  try {
    text = await readFile3(path4.resolve(runtime.cwd(), file), "utf8");
  } catch (error) {
    throw fileError("Cannot read --key-file ".concat(file, "."), error);
  }
  return (await readKeyFile(text)).publicKey;
}
async function reserveSecretFile(args, runtime) {
  const file = flagString(args.flags, "secret-file");
  if (file === void 0)
    return void 0;
  const target = path4.resolve(runtime.cwd(), file);
  let handle;
  try {
    handle = await open3(target, "wx", 384);
  } catch (error) {
    throw fileError("Cannot create --secret-file ".concat(file, "; it must not exist yet."), error);
  }
  return {
    path: target,
    write: async (secret) => {
      try {
        await handle.writeFile("".concat(secret, "\n"), "utf8");
        await handle.sync();
      } finally {
        await handle.close();
      }
    },
    discard: async () => {
      await handle.close().catch(() => void 0);
      await rm2(target, { force: true });
    }
  };
}
async function serviceClientWrite(args, runtime, resolved, request, secretFile) {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let response;
  try {
    response = await client.call({ method: "POST", path: request.path, ...request.body ? { body: request.body } : {} });
  } catch (error) {
    await secretFile?.discard();
    throw error;
  }
  const result = response.body;
  if (secretFile) {
    if (typeof result.secret !== "string") {
      await secretFile.discard();
      throw unexpectedResponseError("The server created no secret.", client.requestId);
    }
    try {
      await secretFile.write(result.secret);
    } catch (error) {
      throw fileError("The secret was created but could not be written to ".concat(secretFile.path, ". Remove it with service-client remove-secret and add another."), error);
    }
  }
  return {
    envelope: successEnvelope({ client: result.client, ...secretFile ? { secret_file: secretFile.path } : {}, ...result.propagation ? { propagation: result.propagation } : {} }, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: humanLines(request.title, [...serviceClientLines(result.client), ["secret_file", secretFile?.path], ["propagation", result.propagation]])
  };
}
var handleServiceClientList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "/api/service-clients" });
  const items = response.body.items ?? [];
  return {
    envelope: successEnvelope({ items }, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: items.map((item) => "".concat(item.id, "  ").concat(item.name, "  ").concat(accessLabel(item.access)).concat(item.effective_access && item.effective_access !== item.access ? " (acts as ".concat(accessLabel(item.effective_access), ")") : "", "  ").concat(item.state)).join("\n") || "No service clients."
  };
});
var handleServiceClientShow = commandHandler(async (args, runtime, resolved) => {
  const id = serviceClientId(args, "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "/api/service-clients/".concat(id) });
  return {
    envelope: successEnvelope(response.body, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: humanLines("Service client", serviceClientLines(response.body))
  };
});
var handleServiceClientCreate = commandHandler(async (args, runtime, resolved) => {
  const name = flagString(args.flags, "name");
  if (!name || name.length > 80)
    throw usageError("service-client create requires --name with 1-80 characters.");
  const key = await serviceKeyFromFile(args, runtime);
  if (!key && flagString(args.flags, "secret-file") === void 0) {
    throw usageError("service-client create needs --key-file PATH (a public key, recommended) or --secret-file PATH (a generated secret), or both.");
  }
  const capabilities = flagString(args.flags, "capability")?.split(",");
  const access = flagString(args.flags, "access");
  const uploader = flagBool(args.flags, "uploader");
  if (!uploader && (flagString(args.flags, "folder-id") !== void 0 || flagString(args.flags, "playlist-id") !== void 0)) {
    throw usageError("--folder-id and --playlist-id require --uploader.");
  }
  if (uploader && capabilities?.some((capability) => capability !== "content" && capability !== "playlists")) {
    throw usageError("An uploader client holds the content and playlists capabilities only.");
  }
  const scope = uploader ? uploadScopeFromArgs(args, "service-client create --uploader", false) : void 0;
  const secretFile = await reserveSecretFile(args, runtime);
  return serviceClientWrite(args, runtime, resolved, { path: "/api/service-clients", title: "Service client created", body: {
    name,
    ...capabilities ? { capabilities } : {},
    ...access ? { access } : {},
    ...key ? { key } : {},
    ...secretFile ? { secret: true } : {},
    ...scope ? { upload_scope: scope } : {}
  } }, secretFile);
});
var handleServiceClientAddKey = commandHandler(async (args, runtime, resolved) => {
  const id = serviceClientId(args, "add-key");
  const key = await serviceKeyFromFile(args, runtime);
  if (!key)
    throw usageError("service-client add-key requires --key-file PATH.");
  return serviceClientWrite(args, runtime, resolved, { path: "/api/service-clients/".concat(id, "/keys"), body: { key }, title: "Key added" });
});
var handleServiceClientAddSecret = commandHandler(async (args, runtime, resolved) => {
  const id = serviceClientId(args, "add-secret");
  if (flagString(args.flags, "secret-file") === void 0)
    throw usageError("service-client add-secret requires --secret-file PATH; the secret is written only there.");
  const secretFile = await reserveSecretFile(args, runtime);
  return serviceClientWrite(args, runtime, resolved, { path: "/api/service-clients/".concat(id, "/secrets"), title: "Secret added" }, secretFile);
});
var handleServiceClientRemoveKey = commandHandler(async (args, runtime, resolved) => {
  const id = serviceClientId(args, "remove-key");
  const kid = flagString(args.flags, "kid");
  if (!kid || kid.length > 200)
    throw usageError("service-client remove-key requires --kid KID from service-client show.");
  return serviceClientWrite(args, runtime, resolved, { path: "/api/service-clients/".concat(id, "/keys/").concat(encodeURIComponent(kid), "/remove"), title: "Key removed" });
});
var handleServiceClientRemoveSecret = commandHandler(async (args, runtime, resolved) => {
  const id = serviceClientId(args, "remove-secret");
  const secretId = flagString(args.flags, "secret-id");
  if (!secretId || !/^css_[A-Za-z0-9_-]+$/.test(secretId))
    throw usageError("service-client remove-secret requires --secret-id css_... from service-client show.");
  return serviceClientWrite(args, runtime, resolved, { path: "/api/service-clients/".concat(id, "/secrets/").concat(secretId, "/remove"), title: "Secret removed" });
});
var handleServiceClientRevoke = commandHandler(async (args, runtime, resolved) => {
  const id = serviceClientId(args, "revoke");
  if (!flagBool(args.flags, "yes"))
    throw usageError("service-client revoke requires --yes. Revocation is permanent: the client's keys and secrets are deleted and its tokens end.");
  return serviceClientWrite(args, runtime, resolved, { path: "/api/service-clients/".concat(id, "/revoke"), title: "Service client revoked" });
});

// dist/cli-commands/service-client.js
function registerServiceClientCommands(root, bind) {
  const group = root.command("service-client").description("Create and manage this project's service clients");
  addCommandNotes(group, "A service client is a server, script or CI job owned by this project. It signs in with client credentials, not a person's approval: screenrig --config PATH login --client-id scl_... --client-key-file KEY.pem (a private key whose public half is registered; recommended) or --client-secret-file FILE saves the client in that config, and every screenrig command with that config runs as that client, reading the key or secret file each time. Such a run keeps its token in memory and writes nothing else to the config; screenrig logout removes the client. Changing service clients requires identity scope, this agent's Manage grant with the project capability on the project, and a live organization admin role. Reading clients requires a project grant. A service client cannot manage clients.");
  group.command("list").description("List this project's service clients").action(bind(handleServiceClientList));
  group.command("show").description("Show one service client").argument("<id>", "Service client id (scl_...)").action(bind(handleServiceClientShow));
  const create = group.command("create").description("Create a service client").requiredOption("--name <NAME>", "Name the client").addOption(new Option("--capability <NAME>", "Grant a capability (repeatable; default: all six, each within yours)").choices([...AGENT_CAPABILITIES]).argParser((value, previous) => {
    if (!AGENT_CAPABILITIES.some((name) => name === value))
      throw usageError("Unknown capability ".concat(value, ". Choose from: ").concat(AGENT_CAPABILITIES.join(", "), "."));
    const requested = previous ? previous.split(",") : [];
    if (requested.includes(value))
      throw usageError("Capability ".concat(value, " was supplied more than once."));
    return [...requested, value].join(",");
  })).addOption(new Option("--access <LEVEL>", "Read only, Propose or Manage (default read; propose for an uploader)").choices([...ACCESS_LEVELS])).option("--uploader", "Limit the client to the playlists and media folders given with --playlist-id and --folder-id").option("--folder-id <ID[,ID]>", "With --uploader, the media folders (mfd_...) it uploads into; at least one").option("--playlist-id <ID[,ID]>", "With --uploader, the playlists (pl_...) it changes pages of").option("--key-file <PATH>", "Register this public key (a JWK or PEM; a private key file sends only its public half)").option("--secret-file <PATH>", "Generate a secret and write it to this new 0600 file").action(bind(handleServiceClientCreate));
  requireOptionGroup(create, "requires", ["--folder-id", "--uploader"]);
  requireOptionGroup(create, "requires", ["--playlist-id", "--uploader"]);
  requireOptionGroup(create, "requires", ["--uploader", "--folder-id"]);
  addCommandNotes(create, "Propose access proposes playlist and screen changes for a person to review instead of applying them. An uploader client (--uploader) works only in the folders and playlists it is given: it uploads media into its folders (media upload --folder ID) and adds, replaces and removes pages of its playlists (playlist page add|replace|remove), holds the content and playlists capabilities, and acts at Propose unless --access says otherwise; anything else it asks is outside_upload_scope, whose upload_scope lists what it may use. Its scope is set here and replaced by the project owner; to change what a client may do beyond that, create a new client. Supply --key-file, --secret-file or both. Keys are Ed25519, EC P-256 or RSA of at least 2048 bits; a key without a kid is known by its RFC 7638 thumbprint. The secret is shown once, so it is written only to --secret-file, which must not exist yet. At most 50 live clients per organization.");
  group.command("add-key").description("Register a second public key for rotation").argument("<id>", "Service client id").requiredOption("--key-file <PATH>", "The public key (a JWK or PEM)").action(bind(handleServiceClientAddKey));
  group.command("add-secret").description("Generate a second secret for rotation").argument("<id>", "Service client id").requiredOption("--secret-file <PATH>", "Write the new secret to this new 0600 file").action(bind(handleServiceClientAddSecret));
  group.command("remove-key").description("Remove a key; its tokens end within seconds").argument("<id>", "Service client id").requiredOption("--kid <KID>", "The key id from service-client show").action(bind(handleServiceClientRemoveKey));
  group.command("remove-secret").description("Remove a secret; its tokens end within seconds").argument("<id>", "Service client id").requiredOption("--secret-id <ID>", "The css_ secret id from service-client show").action(bind(handleServiceClientRemoveSecret));
  group.command("revoke").description("Revoke a service client permanently").argument("<id>", "Service client id").option("--yes", "Confirm the permanent revocation").action(bind(handleServiceClientRevoke));
}

// dist/handlers/dashboard.js
function signInResetEmail(value) {
  const email = value?.trim();
  if (!email) {
    throw usageError("dashboard reset-sign-in requires --email ADDRESS.");
  }
  if (!isPlainContactEmail(email)) {
    throw usageError("dashboard reset-sign-in --email must be one plain ASCII address with an unquoted local part and dotted DNS domain.");
  }
  return email;
}
var handleSignInReset = commandHandler(signInReset, false);
var handleDashboard = commandHandler(dashboardCommand, false);
async function dashboardCommand(_args, runtime, resolved) {
  const api = new URL(resolved.apiUrl);
  const hostname = apexHost(api.hostname);
  if (!hostname || api.protocol !== "https:" && !(api.protocol === "http:" && api.hostname.endsWith(".localhost"))) {
    throw usageError("dashboard requires a supported ScreenRig API origin.");
  }
  const origin2 = "".concat(api.protocol, "//").concat(hostname).concat(api.port ? ":".concat(api.port) : "", "/dashboard/");
  let opened = false;
  try {
    opened = await (runtime.openUrl?.(origin2) ?? Promise.resolve(false));
  } catch {
  }
  return {
    envelope: successEnvelope({ opened, ...!opened ? { url: origin2 } : {} }),
    exitCode: ExitCode.Success,
    human: humanLines(opened ? "Dashboard opened" : "No browser could be opened", [
      ...!opened ? [["url", origin2]] : []
    ])
  };
}
function validateSignInResetAccepted(value) {
  const body = value;
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length !== 1 || body.status !== "accepted") {
    throw usageError("Sign-in reset response does not match the accepted contract.");
  }
}
async function signInReset(args, runtime, resolved) {
  const email = signInResetEmail(flagString(args.flags, "email"));
  const configFs = { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir };
  if (!await readConfigFile(resolved.configPath, configFs)) {
    await withConfigLock(resolved.configPath, configFs, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
      if (await readConfigFile(resolved.configPath, configFs))
        return;
      await writeConfigAtomic(resolved.configPath, {
        api_url: resolved.apiUrl,
        updated_at: runtime.now().toISOString()
      }, configFs);
    });
  }
  const client = clientFor(runtime, args, resolved.apiUrl, void 0, writeRecoveries.get(runtime));
  const response = await client.call({
    method: "POST",
    path: "/api/sign-in-resets",
    idempotent: true,
    body: { email }
  });
  requirePrivateNoStore(response.headers, "Sign-in reset response");
  validateSignInResetAccepted(response.body);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: humanLines("Sign-in reset request accepted", [
      ["status", "accepted"],
      ["delivery", "If this address can receive sign-in instructions, check its inbox. Delivery is not confirmed."],
      ["request_id", client.requestId]
    ])
  };
}

// dist/cli-commands/dashboard.js
function registerDashboardCommands(root, bind) {
  const dashboard = root.command("dashboard").description("Open the dashboard");
  dashboard.command("open", { isDefault: true }).description("Open the dashboard origin").action(bind(handleDashboard));
  dashboard.command("reset-sign-in").description("Request emailed sign-in instructions").requiredOption("--email <ADDRESS>", "Address to receive sign-in instructions").action(bind(handleSignInReset));
}

// dist/handlers/agent-notes.js
function notesFor(runtime, args, resolved) {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  return { client, notes: new NotesApi(client) };
}
var handleNotesList = commandHandler(async (args, runtime, resolved) => {
  requireFlagValue(args, "limit", "50");
  requireFlagValue(args, "after", "CURSOR");
  const state = flagBool(args.flags, "all") ? "all" : flagBool(args.flags, "resolved") ? "resolved" : "open";
  const about = flagString(args.flags, "about");
  const { client, notes } = notesFor(runtime, args, resolved);
  const response = await notes.list({
    // Open is the server's default.
    ...state === "open" ? {} : { state },
    aboutId: about === void 0 ? void 0 : parseNoteAbout(about).id,
    authorId: flagString(args.flags, "author"),
    after: flagString(args.flags, "after"),
    limit: flagString(args.flags, "limit")
  });
  const list = response.body ?? {};
  const review = reviewWarning(list);
  return {
    envelope: jsonBody(response, client.requestId, void 0, review ? [review] : []),
    exitCode: ExitCode.Success,
    human: noteListLines(list, runtime.now(), state).join("\n")
  };
});
var handleNotesShow = commandHandler(async (args, runtime, resolved) => {
  const id = noteId(args.positionals[2], "show");
  const { client, notes } = notesFor(runtime, args, resolved);
  const response = await notes.show(id);
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: noteDetailLines(response.body, runtime.now()).join("\n") };
});
var handleNotesAdd = commandHandler(async (args, runtime, resolved) => {
  const text = args.positionals[2];
  const file = flagString(args.flags, "file");
  if (text === void 0 === (file === void 0)) {
    throw usageError("notes add takes the note as TEXT, - for stdin, or --file FILE; supply exactly one.");
  }
  const source = file ?? (text === "-" ? "-" : void 0);
  const body = noteBody(source === void 0 ? text : await readAuthoringText(source, runtime, NOTE_INPUT_MAX_BYTES));
  const about = flagString(args.flags, "about");
  const ttl = flagString(args.flags, "ttl");
  const replaces = flagString(args.flags, "replaces");
  const { client, notes } = notesFor(runtime, args, resolved);
  const response = await notes.add({
    body,
    ...about !== void 0 ? { about: parseNoteAbout(about) } : {},
    ...ttl !== void 0 ? { ttlSeconds: parseNoteTtl(ttl) } : {},
    ...replaces !== void 0 ? { replaces } : {}
  });
  const note = response.body;
  const matched = matchedOpenNote(response);
  const message = matched ? "Matched open note ".concat(note.id, "; confirmed it.") : "Added note ".concat(note.id, ".").concat(replaces ? " ".concat(replaces, " is resolved as replaced.") : "");
  return {
    envelope: jsonBody(response, client.requestId, void 0, matched ? [{ code: NOTE_MATCHED_OPEN, message }] : []),
    exitCode: ExitCode.Success,
    human: message
  };
});
var handleNotesConfirm = commandHandler(async (args, runtime, resolved) => {
  const id = noteId(args.positionals[2], "confirm");
  const { client, notes } = notesFor(runtime, args, resolved);
  const response = await notes.confirm(id);
  const reviewAt = response.body?.review_at;
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Confirmed ".concat(id, ".").concat(reviewAt ? " Next review ".concat(reviewAt, ".") : "") };
});
var handleNotesResolve = commandHandler(async (args, runtime, resolved) => {
  const id = noteId(args.positionals[2], "resolve");
  const reason = noteReason(args.positionals.slice(3).join(" "));
  const { client, notes } = notesFor(runtime, args, resolved);
  const response = await notes.resolve(id, reason);
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Resolved ".concat(id, ".") };
});

// dist/cli-commands/agent-notes.js
function aboutOption(value) {
  parseNoteAbout(value);
  return value;
}
function ttlOption(value) {
  parseNoteTtl(value);
  return value;
}
function authorOption(value) {
  if (!isResourceID(value, "agent"))
    throw usageError("--author requires an agent ID (agt_...).");
  return value;
}
function replacesOption(value) {
  return noteId(value, "add --replaces");
}
function registerAgentNotesCommands(root, bind) {
  const notes = root.command("notes").description("Read and write the project notes agents leave for each other");
  notes.command("list", { isDefault: true }).description("List open project notes, newest first (default: screenrig notes)").addOption(new Option("--all", "Include resolved notes").conflicts(["resolved"])).addOption(new Option("--resolved", "List only resolved notes").conflicts(["all"])).option("--about <ID>", "Only notes about this screen or playlist (screen:ID, playlist:ID, or the ID)", aboutOption).option("--author <AGENT_ID>", "Only notes this agent wrote", authorOption).option("--limit <N>", "Limit returned notes (1-200, default 50)", positiveInteger("limit")).option("--after <CURSOR>", "Read the page after this cursor").action(bind(handleNotesList));
  notes.command("show").description("Read one note").argument("<id>", "Note identifier").action(bind(handleNotesShow));
  notes.command("add").description("Write a note for the project's agents").argument("[text]", "Note text, or - for stdin").option("--file <FILE>", "Read the note from a file, or - for stdin").option("--about <ID>", "Attach the note to a screen or playlist (screen:ID, playlist:ID, or the ID)", aboutOption).option("--ttl <DURATION>", "Resolve the note automatically after this long: hours or days, such as 12h or 3d", ttlOption).option("--replaces <ID>", "Resolve this open note as replaced by the new one", replacesOption).action(bind(handleNotesAdd));
  notes.command("confirm").description("Confirm that an open note is still true").argument("<id>", "Note identifier").action(bind(handleNotesConfirm));
  notes.command("resolve").description("Resolve an open note that is wrong or no longer true").argument("<id>", "Note identifier").argument("<reason...>", "Why the note no longer holds").action(bind(handleNotesResolve));
}

// dist/handlers/feedback.js
var FEEDBACK_PATHS = {
  bug: "/api/feedback/bugs",
  feature: "/api/feedback/features"
};
var FEEDBACK_COMMAND_PATTERN = /^[a-z][a-z0-9-]{0,31}( [a-z][a-z0-9-]{0,31}){0,3}$/;
var FEEDBACK_TITLE_MAX = 120;
var FEEDBACK_BODY_MAX = 4e3;
function feedbackContextFromArgs(args, platform) {
  if (flagBool(args.flags, "no-context")) {
    return void 0;
  }
  const context = { cli_version: CLI_VERSION };
  if (/^[a-z0-9]{1,16}\/[a-z0-9_]{1,16}$/.test(platform)) {
    context.platform = platform;
  }
  if (args.flags.command === true) {
    throw usageError('--command requires a value, such as --command "media upload".');
  }
  const command = flagString(args.flags, "command")?.trim();
  if (command !== void 0) {
    if (!FEEDBACK_COMMAND_PATTERN.test(command)) {
      throw usageError('--command accepts a command path only, as up to four lowercase words such as "media upload". Option flags, identifiers, file paths, and argument values are rejected by the server and must not be placed here.');
    }
    context.command = command;
  }
  return context;
}
var handleFeedbackList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  return feedbackList(args, client);
});
var handleFeedbackBug = commandHandler((args, runtime, resolved) => submitFeedback(args, runtime, resolved, "bug"));
var handleFeedbackFeature = commandHandler((args, runtime, resolved) => submitFeedback(args, runtime, resolved, "feature"));
function feedbackID(args) {
  const id = args.positionals[2];
  if (!id || !/^(?:(?:stage|qa|development)_)?fb_[A-Za-z0-9_-]{16,24}$/.test(id))
    throw usageError("Supply a feedback ID from feedback list.");
  return id;
}
function feedbackThreadHuman(item) {
  return [
    "".concat(item.id, "  ").concat(item.status ?? "open", "  ").concat(redactText(item.title)),
    redactText(item.body),
    ...(item.responses ?? []).map((reply) => "".concat(reply.created_at, "  ").concat(reply.author === "agent" ? "Agent" : "Staff", "  ").concat(reply.status).concat(reply.fixed_in ? " in ".concat(reply.fixed_in) : "", "\n").concat(redactText(reply.text)))
  ].join("\n\n");
}
var handleFeedbackShow = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "/api/feedback/".concat(feedbackID(args)) });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: feedbackThreadHuman(response.body) };
});
var handleFeedbackReply = commandHandler(async (args, runtime, resolved) => {
  const id = feedbackID(args);
  const text = (await readFeedbackBody(args, runtime)).trim();
  if (!text || [...text].length > 2e3)
    throw usageError("A feedback reply must be 1 to 2000 characters.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "POST", path: "/api/feedback/".concat(id, "/responses"), body: { text }, idempotent: true });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: feedbackThreadHuman(response.body) };
});
async function submitFeedback(args, runtime, resolved, kind) {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const title = args.positionals[2]?.trim();
  if (!title) {
    throw usageError("feedback ".concat(kind, " requires a title."));
  }
  if (title.length > FEEDBACK_TITLE_MAX) {
    throw usageError("A feedback title is at most ".concat(FEEDBACK_TITLE_MAX, " characters."));
  }
  const body = (await readFeedbackBody(args, runtime)).trim();
  if (!body) {
    throw usageError("A feedback body must not be empty.");
  }
  if (body.length > FEEDBACK_BODY_MAX) {
    throw usageError("A feedback body is at most ".concat(FEEDBACK_BODY_MAX, " characters."));
  }
  const context = feedbackContextFromArgs(args, "".concat(process.platform, "/").concat(process.arch));
  const payload = { title, body, ...context ? { context } : {} };
  const response = await client.call({
    method: "POST",
    path: FEEDBACK_PATHS[kind],
    idempotent: true,
    body: payload
  });
  const submission = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: humanLines(kind === "bug" ? "Bug report submitted" : "Feature request submitted", [
      ["id", submission?.id],
      ["kind", submission?.kind],
      ["title", submission?.title],
      ["created_at", submission?.created_at],
      ["note", "Add details with screenrig feedback reply ".concat(submission?.id, " --body TEXT.")]
    ])
  };
}
function feedbackReplyLines(item) {
  const reply = item.responses?.at(-1);
  if (!reply)
    return [];
  const text = redactText(reply.text).replace(/\s+/g, " ").trim();
  const shown = text.length > 200 ? "".concat(text.slice(0, 199), "\u2026") : text;
  const fixed = reply.fixed_in ? " in ".concat(reply.fixed_in) : "";
  return ["    ".concat(reply.author === "agent" ? "agent \xB7 " : "").concat(reply.status).concat(fixed, ": ").concat(shown)];
}
async function feedbackList(args, client) {
  const kindFlag = flagString(args.flags, "kind")?.toLowerCase();
  if (kindFlag !== void 0 && kindFlag !== "bug" && kindFlag !== "feature") {
    throw usageError("--kind accepts bug or feature.");
  }
  const kinds = kindFlag ? [kindFlag] : ["bug", "feature"];
  const items = [];
  for (const kind of kinds) {
    const response = await client.call({ method: "GET", path: FEEDBACK_PATHS[kind] });
    const page = response.body ?? {};
    for (const item of page.items ?? []) {
      items.push({ ...item, kind: item.kind ?? kind });
    }
  }
  items.sort((left, right) => left.created_at < right.created_at ? 1 : left.created_at > right.created_at ? -1 : 0);
  return {
    envelope: successEnvelope({ items }, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: items.length === 0 ? "No feedback submissions" : [
      "Feedback submissions (".concat(items.length, ")"),
      ...items.flatMap((item) => [
        "".concat(item.created_at, "  ").concat(item.kind.padEnd(7), "  ").concat(item.id, "  ").concat((item.status ?? "open").padEnd(9), "  ").concat(item.title),
        ...feedbackReplyLines(item)
      ])
    ].join("\n")
  };
}

// dist/cli-commands/feedback.js
function registerFeedbackCommands(root, bind) {
  const feedback = root.command("feedback").description("Submit and discuss bugs and feature requests");
  feedback.command("bug").description("Submit a bug report").argument("<title>", "Feedback title").addOption(new Option("--body <TEXT>", "Supply feedback details").conflicts(["bodyFile"])).addOption(new Option("--body-file <FILE>", "Read feedback details from a file").conflicts(["body"])).option("--command <GROUP ACTION>", "Identify the command involved").option("--no-context", "Omit diagnostic context").action(bind(handleFeedbackBug));
  feedback.command("feature").description("Submit a feature request").argument("<title>", "Feedback title").addOption(new Option("--body <TEXT>", "Supply feedback details").conflicts(["bodyFile"])).addOption(new Option("--body-file <FILE>", "Read feedback details from a file").conflicts(["body"])).option("--command <GROUP ACTION>", "Identify the command involved").option("--no-context", "Omit diagnostic context").action(bind(handleFeedbackFeature));
  feedback.command("show").description("Read a feedback report and its complete conversation").argument("<id>", "Feedback ID from feedback list").action(bind(handleFeedbackShow));
  feedback.command("reply").description("Append a reply to an existing feedback conversation").argument("<id>", "Feedback ID from feedback list").addOption(new Option("--body <TEXT>", "Supply a reply of 1 to 2000 characters").conflicts(["bodyFile"])).addOption(new Option("--body-file <FILE>", "Read the reply from a file").conflicts(["body"])).action(bind(handleFeedbackReply));
  feedback.command("list").description("List submitted feedback with its status and latest reply").addOption(new Option("--kind <bug|feature>", "Filter feedback by kind").choices(["bug", "feature"])).action(bind(handleFeedbackList));
  for (const command of feedback.commands.filter((command2) => ["bug", "feature", "reply"].includes(command2.name())))
    requireOptionGroup(command, "exactlyOne", ["--body", "--body-file"]);
}

// dist/handlers/support.js
var handleSupportStatus = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "/api/support/status" });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: JSON.stringify(response.body, null, 2) };
});
function supportConversation(args, required = false) {
  const id = flagString(args.flags, "conversation-id");
  if (required && !id || id && !/^sc_[A-Za-z0-9_-]+$/.test(id))
    throw usageError("Supply a valid --conversation-id.");
  return id;
}
function supportSequence(value) {
  if (value !== void 0 && !/^\d+$/.test(value))
    throw usageError("Support sequences must be nonnegative integers.");
  if (value !== void 0 && !Number.isSafeInteger(Number(value)))
    throw usageError("Support sequence is out of range.");
  return value;
}
var handleSupportSubmit = commandHandler(async (args, runtime, resolved) => {
  const id = supportConversation(args);
  const body = (await readFeedbackBody(args, runtime)).trim();
  if (!body || [...body].length > 4e3)
    throw usageError("A support message must contain 1\u20134000 characters.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "POST", path: id ? "/api/support/conversations/".concat(id, "/messages") : "/api/support/conversations", idempotent: true, body: { body, human_requested: flagBool(args.flags, "human-requested") } });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: JSON.stringify(response.body, null, 2) };
});
var handleSupportHistory = commandHandler(async (args, runtime, resolved) => {
  const id = supportConversation(args);
  const after = supportSequence(flagString(args.flags, "after"));
  if (after && !id)
    throw usageError("--after requires --conversation-id.");
  const before = flagString(args.flags, "before");
  if (before && (id || !/^sc_[A-Za-z0-9_-]+$/.test(before)))
    throw usageError("--before accepts a conversation cursor when listing conversations.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: id ? "/api/support/conversations/".concat(id, "/messages") : "/api/support/conversations", query: { after, before } });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: JSON.stringify(response.body, null, 2) };
});
var handleSupportClose = commandHandler(async (args, runtime, resolved) => {
  const id = supportConversation(args, true);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "POST", path: "/api/support/conversations/".concat(id, "/close"), body: {} });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Support conversation ended. Its history is saved." };
});
var handleSupportRead = commandHandler(async (args, runtime, resolved) => {
  const id = supportConversation(args, true);
  const sequence = supportSequence(flagString(args.flags, "sequence"));
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "PUT", path: "/api/support/conversations/".concat(id, "/read"), body: { sequence: Number(sequence) } });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Support replies marked read." };
});
var handleSupportFollow = commandHandler(async (args, runtime, resolved) => {
  const selected = supportConversation(args);
  let after = supportSequence(flagString(args.flags, "after")) ?? "0";
  let token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const transport = transportFor(runtime, resolved.apiUrl, token);
  const controller = new AbortController();
  const timeout = flagNumber(args.flags, "timeout");
  const timer = timeout && timeout > 0 ? setTimeout(() => controller.abort(), timeout) : void 0;
  let delay = EVENT_STREAM_BACKOFF_MS;
  let printedContext = false;
  try {
    while (!controller.signal.aborted) {
      let buffer = "";
      try {
        token = await streamToken(runtime, token);
        const stream = await transport.stream({ method: "GET", path: "/stream/support", query: { after, ...projectStreamQuery(resolved.projectId) }, headers: { authorization: "Bearer ".concat(token), "x-request-id": client.nextRequestId() }, signal: controller.signal });
        for await (const chunk of stream) {
          buffer += chunk;
          const parsed = parseSse(buffer);
          buffer = parsed.rest;
          if (buffer.length > 128 * 1024 || parsed.events.some((frame) => (frame.data?.length ?? 0) > 128 * 1024))
            throw unexpectedResponseError("Support stream frame exceeded its size limit.");
          for (const frame of parsed.events) {
            if (frame.event !== "support.message" || !frame.data)
              continue;
            let message;
            try {
              message = JSON.parse(frame.data);
            } catch {
              throw unexpectedResponseError("Support stream sent invalid JSON.");
            }
            if (!message || typeof message.body !== "string" || typeof message.author !== "string" || typeof message.conversation_id !== "string")
              throw unexpectedResponseError("Support stream sent an invalid message.");
            if (!frame.id || !/^\d+$/.test(frame.id) || !Number.isSafeInteger(message.sequence) || String(message.sequence) !== frame.id)
              throw unexpectedResponseError("Support stream sent an invalid sequence.");
            if (BigInt(frame.id) <= BigInt(after))
              continue;
            after = frame.id;
            if (selected && message.conversation_id !== selected)
              continue;
            if (flagBool(args.flags, "human") && !printedContext) {
              if (formatResultContext(runtime))
                runtime.stdout.write("".concat(formatResultContext(runtime), "\n"));
              printedContext = true;
            }
            runtime.stdout.write(flagBool(args.flags, "human") ? "".concat(message.author, ": ").concat(redactText(message.body), "\n") : "".concat(JSON.stringify(streamEnvelope(runtime, redactEvent(message), client.requestId)), "\n"));
          }
          delay = EVENT_STREAM_BACKOFF_MS;
          if (controller.signal.aborted)
            break;
        }
      } catch (error) {
        if (controller.signal.aborted || isAbortError(error))
          break;
        if (isHardFollowError(error) || error instanceof CliError && error.problem.code === "unexpected_response")
          throw error;
      }
      if (!controller.signal.aborted)
        await sleepWhileOpen(delay, controller.signal, runtime.sleep);
      delay = Math.min(delay * 2, EVENT_STREAM_BACKOFF_CAP_MS);
    }
  } finally {
    if (timer)
      clearTimeout(timer);
  }
  return { envelope: successEnvelope({ after }, { request_id: client.requestId }), exitCode: ExitCode.Success, human: "", output: "stream" };
});

// dist/cli-commands/support.js
function registerSupportCommands(root, bind) {
  const support = root.command("support").description("Project support conversations on every plan");
  support.command("status").description("Show support availability and staffed hours").action(bind(handleSupportStatus));
  const submit = support.command("submit").description("Start a conversation or send a follow-up").option("--conversation-id <ID>", "Reply in this conversation; omit to start a new one").addOption(new Option("--body <TEXT>", "Supply the support message").conflicts("bodyFile")).addOption(new Option("--body-file <FILE>", "Read the support message from a file").conflicts("body")).option("--human-requested", "Ask for a person (Education, Premium and Enterprise); on Standard and Plus the AI assistant answers").action(bind(handleSupportSubmit));
  requireOptionGroup(submit, "exactlyOne", ["--body", "--body-file"]);
  support.command("history").description("List conversations or a conversation's messages").option("--conversation-id <ID>", "Read messages in one conversation").option("--after <SEQUENCE>", "Read messages after this support sequence").option("--before <ID>", "Read older conversations using the history page's next cursor").action(bind(handleSupportHistory));
  support.command("follow").description("Follow support messages as resumable SSE").option("--conversation-id <ID>", "Print only this conversation; still advance the project cursor").option("--after <SEQUENCE>", "Resume after this support sequence; default replays history").action(bind(handleSupportFollow));
  support.command("close").description("End a conversation and preserve its history").requiredOption("--conversation-id <ID>", "Conversation to end").action(bind(handleSupportClose));
  support.command("read").description("Acknowledge staff replies through a message sequence").requiredOption("--conversation-id <ID>", "Conversation being read").requiredOption("--sequence <SEQUENCE>", "Last message you have read").action(bind(handleSupportRead));
}

// dist/handlers/doctor.js
var handleDoctor = commandHandler(doctor, false);
var READINESS_SENTENCE_MAX = 400;
function redactedReadinessSentence(sentence) {
  const flat = redactText(sentence).replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim();
  return flat.length > READINESS_SENTENCE_MAX ? "".concat(flat.slice(0, READINESS_SENTENCE_MAX), "...") : flat;
}
function credentialCheck(resolved, now = /* @__PURE__ */ new Date()) {
  if (hasToken(resolved.token)) {
    return { name: "token", status: "pass", detail: describeTokenPresence(resolved.token) };
  }
  const detail = describeTokenPresence(resolved.token);
  const pending = pendingSignIn(resolved.login, now);
  if (pending) {
    return {
      name: "token",
      status: "warn",
      detail: "".concat(detail, "; sign-in is pending until ").concat(pending.expires_at),
      path: "reconnect_existing",
      next: pending.next
    };
  }
  if (resolved.signedOut) {
    return {
      name: "token",
      status: "warn",
      detail: "".concat(detail, "; this installation is signed out"),
      path: "reconnect_existing",
      next: { command: "screenrig login", reason: "Sign this installation in again; a person approves it in the dashboard." }
    };
  }
  if (resolved.retiredCredential) {
    return {
      name: "token",
      status: "warn",
      detail: "".concat(detail, "; the stored credential is no longer accepted"),
      path: "reconnect_existing",
      next: { command: "screenrig login", reason: "Sign this installation in; a person approves it in the dashboard. Then rerun doctor." }
    };
  }
  if (resolved.lastAgent) {
    return {
      name: "token",
      status: "warn",
      detail: "".concat(detail, "; this installation was disconnected"),
      path: "first_run_enroll",
      next: {
        command: "screenrig agent enroll --email ADDRESS --organization NAME",
        reason: "Ask the user for their contact email, enroll a new project agent, then rerun doctor. Use screenrig login only when the user asked to join an existing project."
      }
    };
  }
  return {
    name: "token",
    status: "warn",
    detail: "".concat(detail, "; this installation is not enrolled"),
    path: "first_run_enroll",
    next: {
      command: resolved.enrollment ? "screenrig agent enroll" : "screenrig agent enroll --email ADDRESS --organization NAME",
      reason: resolved.enrollment ? "Resume the exact pending enrollment, then rerun doctor." : "Create the first agent with unverified contact metadata, then rerun doctor. Every authenticated command fails with not_enrolled until then."
    }
  };
}
function signInCheck(grant, now) {
  const ends = grant.refresh_expires_at ? new Date(grant.refresh_expires_at * 1e3).toISOString() : void 0;
  const days = refreshExpiryDays(grant, now);
  if (days === void 0) {
    return { name: "sign_in", status: "pass", detail: ends ? "session ends by ".concat(ends, "; each use moves the idle end forward") : "session present" };
  }
  return {
    name: "sign_in",
    status: "warn",
    detail: "session ends ".concat(ends, " (").concat(days, " days)"),
    next: { command: "screenrig login", reason: "Sign in again before the session ends; a person approves it in the dashboard." }
  };
}
function probeFailureDetail(err, fallback) {
  if (err instanceof CliError) {
    return err.problem.detail;
  }
  return err instanceof Error ? redactText(err.message) : fallback;
}
async function doctor(args, runtime, resolved) {
  const checks = [];
  const distribution = cliDistribution();
  checks.push({ name: "distribution", status: "pass", detail: "".concat(distribution.kind, "; ").concat(distribution.agent_setup) });
  const [nodeMajor = 0, nodeMinor = 0] = process.versions.node.split(".").map(Number);
  checks.push({
    name: "node",
    status: nodeMajor > 22 || nodeMajor === 22 && nodeMinor >= 11 ? "pass" : "fail",
    detail: "node ".concat(process.versions.node)
  });
  checks.push({
    name: "config_path",
    status: "pass",
    detail: resolved.configPath
  });
  try {
    const st = await runtime.fs.stat(resolved.configPath);
    const mode = st.mode & 511;
    const ok = (mode & 63) === 0;
    checks.push({
      name: "config_permissions",
      status: ok ? "pass" : "fail",
      detail: "mode ".concat(mode.toString(8))
    });
  } catch {
    checks.push({ name: "config_permissions", status: "pass", detail: "config file not present" });
  }
  checks.push(credentialCheck(resolved, runtime.now()));
  const grant = (await readConfigFile(resolved.configPath, { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir }).catch(() => void 0))?.oauth;
  if (grant)
    checks.push(signInCheck(grant, runtime.now()));
  checks.push({
    name: "api_url",
    status: resolved.apiUrl.startsWith("https://") || resolved.apiUrl.startsWith("http://127.") || resolved.apiUrl.includes("localhost") ? "pass" : "fail",
    detail: resolved.apiUrl
  });
  checks.push({
    name: "log_socket",
    status: "pass",
    detail: resolved.logSocket ?? "(none)"
  });
  const lookup = ffmpegLookup(runtime.settings);
  const webpLookup = cwebpLookup(runtime.settings);
  let toolchain;
  let toolchainDetail;
  try {
    toolchain = await resolveFfmpegToolchain(runtime);
  } catch (err) {
    toolchainDetail = probeFailureDetail(err, "ffmpeg probe failed");
  }
  let cwebp;
  let cwebpDetail;
  try {
    cwebp = await resolveCwebpToolchain(runtime);
  } catch (err) {
    cwebpDetail = probeFailureDetail(err, "cwebp probe failed");
  }
  const libwebp = toolchain?.encoders.has("libwebp");
  const webpEncodable = libwebp === true || cwebp !== void 0;
  if (toolchain) {
    checks.push({
      name: "ffmpeg",
      status: "pass",
      detail: "".concat(toolchain.ffmpeg, " ").concat(toolchain.ffmpegVersion).concat(lookup.ffmpegFromEnv ? " (SCREENRIG_FFMPEG)" : "")
    });
    checks.push({
      name: "ffprobe",
      status: "pass",
      detail: "".concat(toolchain.ffprobe, " ").concat(toolchain.ffprobeVersion).concat(lookup.ffprobeFromEnv ? " (SCREENRIG_FFPROBE)" : "")
    });
    const encoders = toolchain.encoders;
    checks.push({
      name: "encoder_libx264",
      status: encoders.has("libx264") ? "pass" : "fail",
      detail: encoders.has("libx264") ? "libx264 available" : "libx264 missing from this ffmpeg build; the default video profile cannot encode"
    });
    checks.push({
      name: "encoder_libx265",
      status: encoders.has("libx265") ? "pass" : "warn",
      detail: encoders.has("libx265") ? "libx265 available" : "libx265 missing from this ffmpeg build; --codec hevc is unavailable"
    });
    checks.push({
      name: "encoder_libwebp",
      status: encoders.has("libwebp") ? "pass" : webpEncodable ? "warn" : "fail",
      detail: encoders.has("libwebp") ? "libwebp available" : "libwebp missing from this ffmpeg build; animation cannot be encoded"
    });
    const tonemap = toolchain.filters.has("zscale") && toolchain.filters.has("tonemap");
    checks.push({
      name: "filter_hdr_tonemap",
      status: tonemap ? "pass" : "warn",
      detail: tonemap ? "zscale and tonemap available" : "zscale or tonemap missing; HDR sources convert without tone mapping"
    });
  } else {
    checks.push({ name: "ffmpeg", status: "fail", detail: toolchainDetail ?? "ffmpeg probe failed" });
  }
  if (cwebp) {
    checks.push({
      name: "cwebp",
      status: "pass",
      detail: "".concat(cwebp.cwebp, " ").concat(cwebp.version).concat(cwebp.fromEnv ? " (SCREENRIG_CWEBP)" : "")
    });
  } else {
    const missing = cwebpDetail ?? "".concat(webpLookup.cwebp, " not available").concat(webpLookup.cwebpFromEnv ? " (SCREENRIG_CWEBP)" : "");
    if (libwebp === true) {
      checks.push({
        name: "cwebp",
        status: "warn",
        detail: "".concat(missing, "; not required because this ffmpeg build has the libwebp encoder")
      });
    } else if (libwebp === false) {
      checks.push({
        name: "cwebp",
        status: "fail",
        detail: "".concat(missing, "; this ffmpeg build has no libwebp encoder either, so image transcode cannot produce WebP. ") + "Install an ffmpeg built with libwebp, or install cwebp on PATH (or set SCREENRIG_CWEBP)."
      });
    } else {
      checks.push({
        name: "cwebp",
        status: "warn",
        detail: "".concat(missing, "; it is the fallback for an ffmpeg build without libwebp, so fix ffmpeg first")
      });
    }
  }
  const client = clientFor(runtime, args, resolved.apiUrl, resolved.token);
  for (const route of ["/.health", "/.ready", "/.version", "/api/capabilities"]) {
    try {
      const response = await client.call({ method: "GET", path: route });
      const name = route === "/api/capabilities" ? "capabilities" : route.slice(2);
      const body = response.body;
      const degraded = route === "/.ready" && body !== null && typeof body === "object" && "degraded" in body && Array.isArray(body.degraded) ? body.degraded : [];
      const degradedDetail = route === "/.ready" && body !== null && typeof body === "object" && "degraded_detail" in body && body.degraded_detail !== null && typeof body.degraded_detail === "object" && !Array.isArray(body.degraded_detail) ? body.degraded_detail : {};
      const guidance2 = [...new Set(degraded.map((dependency) => {
        const sentence = typeof dependency === "string" ? degradedDetail[dependency] : void 0;
        if (typeof sentence === "string" && sentence.trim().length > 0) {
          return "".concat(dependency, ": ").concat(redactedReadinessSentence(sentence));
        }
        return "another optional dependency is unavailable; ask the service operator to inspect readiness diagnostics, then rerun doctor";
      }))];
      checks.push({
        name,
        status: degraded.length > 0 ? "warn" : "pass",
        detail: "status ".concat(response.status).concat(guidance2.length > 0 ? "; service ready with degraded dependencies. ".concat(guidance2.join(". ")) : "")
      });
      if (route === "/api/capabilities") {
        const features = (response.body ?? {}).features ?? {};
        const supported = features.feedback === true;
        checks.push({
          name: "feedback",
          // An optional server feature, so its absence is not a local defect.
          status: supported ? "pass" : "warn",
          detail: supported ? "server advertises feedback support" : "server does not advertise feedback support; feedback commands are unavailable"
        });
      }
    } catch (err) {
      const name = route === "/api/capabilities" ? "capabilities" : route.slice(2);
      if (err instanceof CliError && err.problem.code === "outside_upload_scope") {
        checks.push({ name, status: "pass", detail: "uploader: these playlists and folders" });
        continue;
      }
      const detail = err instanceof CliError ? err.problem.detail : err instanceof Error ? err.message : "".concat(route, " failed");
      checks.push({ name, status: "fail", detail });
    }
  }
  const failed = checks.some((check) => check.status === "fail");
  const warned = checks.some((check) => check.status === "warn");
  const status = failed ? "fail" : warned ? "warn" : "pass";
  const next = checks.find((check) => check.status === "fail" && check.next)?.next ?? checks.find((check) => check.status === "warn" && check.next)?.next;
  return {
    envelope: successEnvelope({ status, checks, version: CLI_VERSION, distribution, ...next ? { next } : {} }),
    exitCode: failed ? ExitCode.Unexpected : ExitCode.Success,
    human: checks.map((check) => "".concat(check.status.toUpperCase(), " ").concat(check.name, ": ").concat(check.detail).concat(check.next ? "\n  next: ".concat(check.next.command) : "")).join("\n")
  };
}

// dist/cli-commands/doctor.js
function registerDoctorCommands(root, bind) {
  root.command("doctor").description("Check this CLI installation and configuration").option("--repair-config", "Repair configuration permissions").action(bind(handleDoctor));
}

// dist/cli-commands/version.js
function registerVersionCommands(root, bind) {
  root.command("version").description("Show CLI and protocol versions").action(bind(handleVersion));
}

// dist/service-status.js
var MONITOR_ORIGIN = "https://monitor.screenrig.ai";
var STATES = /* @__PURE__ */ new Set(["up", "degraded", "down", "unknown"]);
function validateServiceStatus(value, environment, now) {
  const doc = value;
  if (!doc || doc.schema !== "screenrig.monitor/v1" || !Array.isArray(doc.environments) || doc.environments.length !== 1) {
    throw unexpectedResponseError("The service monitor returned an invalid status document.");
  }
  const current = doc.environments[0];
  if (!current || current.environment !== environment || !STATES.has(current.state) || !Array.isArray(current.components)) {
    throw unexpectedResponseError("The service monitor returned an invalid environment.");
  }
  const observed = Date.parse(current.observed_at);
  if (current.stale || !Number.isFinite(observed) || now.getTime() - observed > 9e4 || observed - now.getTime() > 5e3) {
    current.state = "unknown";
    current.stale = true;
    current.reasons = ["Monitor observations are stale; current service state is unknown."];
  }
  return doc;
}
var handleServiceStatus = async (args, runtime) => {
  const environment = flagString(args.flags, "environment") ?? "production";
  const transport = runtime.transport ?? new FetchTransport(MONITOR_ORIGIN, void 0);
  const response = await transport.request({
    method: "GET",
    path: "/api/status",
    query: { environment },
    timeout_ms: flagNumber(args.flags, "timeout") ?? 1e4
  });
  if (response.status !== 200)
    throw unexpectedResponseError("The independent service monitor is unavailable.");
  const data = validateServiceStatus(response.body, environment, runtime.now());
  const current = data.environments[0];
  return {
    envelope: successEnvelope(data),
    exitCode: ExitCode.Success,
    human: "".concat(environment, ": ").concat(current.state).concat(current.deploying ? " (deployment window)" : "").concat(current.version_mismatch ? " \xB7 backend versions differ" : "").concat(current.stale ? " \xB7 observations are stale" : "", "\n").concat(MONITOR_ORIGIN, "/?environment=").concat(environment)
  };
};

// dist/cli-commands/status.js
function registerStatusCommands(root, bind) {
  root.command("status").description("Check production or stage service availability").addOption(new Option("--environment <ENV>", "Environment to inspect").choices(["production", "stage"]).default("production")).action(bind(handleServiceStatus));
}

// dist/cli-commands/recovery.js
var guidance = "Inspect the remote outcome before reconciling. Reconcile removes local retry protection only; it does not retry, cancel, or undo the remote write. A subsequent invocation can create a new write.";
function handler(action) {
  return async (args, runtime) => {
    const resolved = await resolveConfig({ flags: args.flags, fs: { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir } });
    const entries = await manageWriteRecovery(resolved, runtime, action, args.positionals[2]);
    const data = action === "list" ? { entries, guidance } : action === "show" ? { entry: entries[0], guidance } : { entry: entries[0], reconciled: true, remote_changed: false, guidance };
    return {
      envelope: successEnvelope(data),
      exitCode: ExitCode.Success,
      human: [
        action === "reconcile" ? "Recovery entry reconciled locally" : "Pending write recovery",
        ...entries.map((entry) => "".concat(entry.id, " | ").concat(entry.command ?? "unknown command (legacy entry)", " | ").concat(entry.created_at, " | ").concat(entry.replay_status)),
        ...entries.length ? [] : ["No pending writes"],
        guidance
      ].join("\n")
    };
  };
}
function registerRecoveryCommands(root, bind) {
  const recovery = root.command("recovery").description("Inspect and reconcile local ordinary-write recovery state");
  recovery.command("list").description("List safe recovery metadata without sending requests").action(bind(handler("list")));
  recovery.command("show").description("Inspect one pending write; legacy entries have no command metadata").argument("<id>", "Recovery identifier from recovery list").action(bind(handler("show")));
  recovery.command("reconcile").description("Remove local retry protection after verifying the remote outcome; does not undo the write").argument("<id>", "Recovery identifier from recovery list").action(bind(handler("reconcile")));
}

// dist/bundles/account.js
function register(root, bind) {
  registerProjectCommands(root, bind);
  registerOrganizationCommands(root, bind);
  registerInvitationCommands(root, bind);
  registerBillingCommands(root, bind);
  registerAgentCommands(root, bind);
  registerServiceClientCommands(root, bind);
  registerDashboardCommands(root, bind);
  registerAgentNotesCommands(root, bind);
  registerFeedbackCommands(root, bind);
  registerSupportCommands(root, bind);
  registerDoctorCommands(root, bind);
  registerVersionCommands(root, bind);
  registerStatusCommands(root, bind);
  registerRecoveryCommands(root, bind);
}
export {
  register
};
