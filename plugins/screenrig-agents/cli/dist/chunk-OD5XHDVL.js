import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  UPLOAD_BATCH_DEFAULT_CONCURRENCY,
  UPLOAD_BATCH_MAX_ATTEMPTS,
  UPLOAD_BATCH_MAX_CONCURRENCY,
  UPLOAD_BATCH_MIN_CONCURRENCY,
  computeBackoffMs
} from "./chunk-CSSCI5HU.js";
import {
  cleanupPreparedMediaFile,
  prepareMediaFileForUpload,
  submitPreparedMedia
} from "./chunk-3MGWFCRB.js";
import {
  canonicalPairingCode
} from "./chunk-7FXG5Y5E.js";
import {
  Option,
  positiveInteger
} from "./chunk-AYKYHF7L.js";
import {
  clientFor,
  commandHandler,
  mediaFolderId,
  progressReporterFor,
  requireToken,
  transcodeOptionsFromArgs
} from "./chunk-V4WYI62I.js";
import {
  loggerOf
} from "./chunk-NLAIEK5L.js";
import {
  pendingReviewOf,
  shellQuote
} from "./chunk-B2ICBIZJ.js";
import {
  flagBool,
  flagNumber,
  flagString,
  successEnvelope
} from "./chunk-4DSCAOZX.js";
import {
  DEFAULT_CANVAS,
  VENDORS,
  allocateTags,
  buildLayout,
  buildPlaylist,
  campaignTiming,
  cleanName,
  createVendorHttp,
  openLocalFiles,
  placeholderBody,
  tagAudience,
  truncate,
  uploadName,
  vendorBadResponse
} from "./chunk-NIXEGXQX.js";
import {
  addCommandNotes
} from "./chunk-B3OG6ANV.js";
import {
  CliError,
  ExitCode,
  makeProblem,
  usageError
} from "./chunk-VYWS3KLY.js";
import {
  __export
} from "./chunk-3FYAGULW.js";

// dist/bundles/migrate.js
var migrate_exports3 = {};
__export(migrate_exports3, {
  register: () => register
});

// dist/cli-commands/migrate.js
var migrate_exports2 = {};
__export(migrate_exports2, {
  registerMigrateCommands: () => registerMigrateCommands
});

// dist/handlers/migrate.js
var migrate_exports = {};
__export(migrate_exports, {
  handleMigrateApply: () => handleMigrateApply,
  handleMigratePair: () => handleMigratePair,
  handleMigrateScan: () => handleMigrateScan,
  handleMigrateVendors: () => handleMigrateVendors,
  migrateProjectId: () => migrateProjectId
});
import path4 from "node:path";

// dist/migrate/apply.js
var apply_exports = {};
__export(apply_exports, {
  CAMPAIGN_CAP: () => CAMPAIGN_CAP,
  FLEET_LINK_CAP: () => FLEET_LINK_CAP,
  ONLY_KINDS: () => ONLY_KINDS,
  finishScreen: () => finishScreen,
  isStop: () => isStop,
  placeholderKey: () => placeholderKey,
  runApply: () => runApply,
  sourceRef: () => sourceRef
});
import path2 from "node:path";

// dist/migrate/credentials.js
var credentials_exports = {};
__export(credentials_exports, {
  loadCredentials: () => loadCredentials,
  parseCredentialFile: () => parseCredentialFile,
  scrubSecrets: () => scrubSecrets
});
import { readFile } from "node:fs/promises";
function parseCredentialFile(text) {
  const values = {};
  for (const line of text.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match)
      continue;
    let value = match[2];
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.length >= 2 && value.endsWith(quote))
      value = value.slice(1, -1);
    values[match[1]] = value;
  }
  return values;
}
async function loadCredentials(adapter, options) {
  let source = {};
  if (options.file !== void 0) {
    let text;
    try {
      text = await (options.read ?? ((file) => readFile(file, "utf8")))(options.file);
    } catch {
      throw usageError("Cannot read the --credentials file. It holds NAME=VALUE lines.");
    }
    source = parseCredentialFile(text);
  }
  const values = {};
  for (const declared of adapter.credentials) {
    const value = source[declared.name];
    if (value !== void 0 && value !== "") {
      values[declared.name] = value;
    } else if (declared.required) {
      throw usageError("".concat(adapter.name, " needs a ").concat(declared.name, " line in ").concat(options.file !== void 0 ? "the --credentials file" : "a file given with --credentials FILE", ". ").concat(declared.help), { command: "screenrig migrate vendors ".concat(adapter.id), reason: "Shows how to make a read-only key for ".concat(adapter.name, " and what the file holds.") });
    }
  }
  return values;
}
function scrubSecrets(text, secrets) {
  let result = text;
  for (const secret of secrets) {
    if (secret.length >= 4)
      result = result.split(secret).join("[redacted]");
  }
  return result;
}

// dist/migrate/report.js
var report_exports = {};
__export(report_exports, {
  REPORT_SCHEMA: () => REPORT_SCHEMA,
  buildContext: () => buildContext,
  buildReport: () => buildReport,
  classify: () => classify,
  contentKey: () => contentKey,
  countsOf: () => countsOf,
  placeholderFor: () => placeholderFor,
  reportLines: () => reportLines,
  screenContent: () => screenContent,
  standInMediaId: () => standInMediaId
});
import { createHash } from "node:crypto";
var REPORT_SCHEMA = "screenrig.migration-report/v1";
function countsOf(catalog) {
  return {
    media: catalog.media.length,
    playlists: catalog.playlists.length,
    layouts: catalog.layouts.length,
    schedules: catalog.schedules.length,
    groups: catalog.groups.length,
    screens: catalog.screens.length
  };
}
function standInMediaId(sourceId) {
  return "med_".concat(createHash("sha256").update(sourceId).digest("hex").slice(0, 22));
}
function buildContext(catalog, canvas2, media) {
  return {
    media,
    playlists: new Map(catalog.playlists.map((playlist) => [playlist.id, playlist])),
    layouts: new Map(catalog.layouts.map((layout) => [layout.id, layout])),
    canvas: canvas2
  };
}
function contentKey(content) {
  return "playlist_id" in content ? "playlist:".concat(content.playlist_id) : "layout:".concat(content.layout_id);
}
function targetedScreens(catalog, schedule) {
  const known = new Map(catalog.screens.map((screen) => [screen.id, screen]));
  return schedule.targets.screen_ids.flatMap((id) => known.get(id) ?? []);
}
function classify(catalog, canvas2 = DEFAULT_CANVAS) {
  const media = new Map(catalog.media.map((item) => [item.id, { id: standInMediaId(item.id), kind: item.kind }]));
  const ctx = buildContext(catalog, canvas2, media);
  const content = /* @__PURE__ */ new Map();
  for (const playlist of catalog.playlists)
    content.set("playlist:".concat(playlist.id), buildPlaylist(playlist, ctx));
  for (const layout of catalog.layouts)
    content.set("layout:".concat(layout.id), buildLayout(layout, { ...ctx, canvas: canvas2 }));
  const groupIds = new Set(catalog.groups.map((group2) => group2.id));
  const ownTagScreens = /* @__PURE__ */ new Set();
  const schedules = /* @__PURE__ */ new Map();
  for (const schedule of catalog.schedules) {
    const timing = campaignTiming(schedule);
    const key = contentKey(schedule.content);
    const groups = schedule.targets.group_ids.filter((id) => groupIds.has(id));
    const screens = targetedScreens(catalog, schedule).map((screen) => screen.id);
    if (!timing.ok)
      schedules.set(schedule.id, { reason: timing.reason });
    else if (content.get(key)?.ok !== true)
      schedules.set(schedule.id, { reason: "The playlist it plays could not be imported." });
    else if (groups.length + screens.length === 0)
      schedules.set(schedule.id, { reason: "None of the groups or screens it targets came over." });
    else {
      schedules.set(schedule.id, { timing, targets: { groups, screens }, content: key });
      for (const id of screens)
        ownTagScreens.add(id);
    }
  }
  const wants = [
    ...catalog.groups.map((group2) => ({ key: "group:".concat(group2.id), name: group2.name, fallback: "Group", id: group2.id })),
    ...catalog.screens.filter((screen) => ownTagScreens.has(screen.id)).map((screen) => ({ key: "screen:".concat(screen.id), name: screen.name, fallback: "Screen", id: screen.id }))
  ];
  return { content, wants, ownTagScreens, schedules };
}
function screenContent(screen, classified) {
  if (!screen.content)
    return void 0;
  const key = contentKey(screen.content);
  return classified.content.get(key)?.ok === true ? key : void 0;
}
function placeholderFor(screen, tags, classified) {
  return placeholderBody(screen, (id) => tags["group:".concat(id)], classified.ownTagScreens.has(screen.id) ? tags["screen:".concat(screen.id)] : void 0);
}
function buildReport(input) {
  const { catalog } = input;
  const classified = classify(catalog);
  const tags = allocateTags(classified.wants, []);
  const notImported = [...input.notImported];
  const lossy = [...input.lossy];
  const addLossy = (kind, source_id, name, changes) => {
    for (const change of new Set(changes))
      lossy.push({ kind, source_id, name, change });
  };
  let playlists = 0;
  let layouts = 0;
  const describe = (item, key, kind) => {
    const built = classified.content.get(key);
    if (built.ok) {
      if (kind === "playlist")
        playlists += 1;
      else
        layouts += 1;
    } else {
      notImported.push({ kind, source_id: item.id, name: item.name, reason: built.reason });
    }
    addLossy(kind, item.id, item.name, [...item.notes, ...built.lossy]);
  };
  for (const playlist of catalog.playlists)
    describe(playlist, "playlist:".concat(playlist.id), "playlist");
  for (const layout of catalog.layouts)
    describe(layout, "layout:".concat(layout.id), "layout");
  for (const group2 of catalog.groups) {
    const tag = tags["group:".concat(group2.id)];
    if (tag !== group2.name)
      addLossy("group", group2.id, group2.name, ["The group is now the tag ".concat(tag, ".")]);
  }
  let noDefault = 0;
  for (const screen of catalog.screens) {
    const body = placeholderFor(screen, tags, classified);
    const wanted = screen.content ? contentKey(screen.content) : void 0;
    const changes = [...screen.notes, ...body.lossy];
    if (wanted !== void 0 && screenContent(screen, classified) === void 0) {
      changes.push("The playlist it showed could not be imported, so it has no default playlist.");
    }
    if (screenContent(screen, classified) === void 0)
      noDefault += 1;
    addLossy("screen", screen.id, screen.name, changes);
  }
  const zoneOf = (screen) => screen.timezone ?? input.timezone;
  let schedules = 0;
  for (const schedule of catalog.schedules) {
    const verdict = classified.schedules.get(schedule.id);
    if ("reason" in verdict) {
      notImported.push({ kind: "schedule", source_id: schedule.id, name: schedule.name, reason: verdict.reason });
      continue;
    }
    schedules += 1;
    const changes = [...schedule.notes, ...verdict.timing.lossy];
    const reached = catalog.screens.filter((screen) => verdict.targets.screens.includes(screen.id) || screen.group_ids.some((id) => verdict.targets.groups.includes(id)));
    if (schedule.timezone !== void 0 && reached.some((screen) => zoneOf(screen) !== schedule.timezone)) {
      changes.push("Its times were read in ".concat(schedule.timezone, "; the campaign reads them in each screen's own time zone."));
    }
    addLossy("schedule", schedule.id, schedule.name, changes);
  }
  const notes = [...input.notes];
  if (noDefault > 0)
    notes.push("".concat(noDefault, " screen").concat(noDefault === 1 ? " has" : "s have", " no default playlist; campaigns need one (no_default_playlist), so set it after pairing (screen assign)."));
  return {
    schema: REPORT_SCHEMA,
    vendor: input.vendor,
    label: input.label,
    scanned_at: input.scannedAt,
    found: input.found,
    importable: {
      media: catalog.media.length,
      playlists,
      layouts,
      schedules,
      groups: catalog.groups.length,
      screens: catalog.screens.length
    },
    not_imported: notImported,
    lossy,
    notes
  };
}
function group(items, reasonOf) {
  const groups = /* @__PURE__ */ new Map();
  for (const item of items)
    groups.set(reasonOf(item), [...groups.get(reasonOf(item)) ?? [], item]);
  return [...groups].map(([reason, list]) => ({ reason, items: list }));
}
function names(items) {
  const shown = items.slice(0, 5).map((item) => item.name).join(", ");
  return items.length > 5 ? "".concat(shown, ", and ").concat(items.length - 5, " more") : shown;
}
function reportLines(report, directory) {
  const row = (label, found, importable) => "".concat(label, ": ").concat(importable, " of ").concat(found);
  const lines = [
    "Scan of ".concat(report.label, " (").concat(report.vendor, ")"),
    "Can come over:",
    "  ".concat(row("media", report.found.media, report.importable.media)),
    "  ".concat(row("playlists", report.found.playlists, report.importable.playlists)),
    ...report.found.layouts > 0 ? ["  ".concat(row("layouts", report.found.layouts, report.importable.layouts))] : [],
    "  ".concat(row("schedules", report.found.schedules, report.importable.schedules)),
    "  ".concat(row("groups", report.found.groups, report.importable.groups)),
    "  ".concat(row("screens", report.found.screens, report.importable.screens))
  ];
  if (report.not_imported.length > 0) {
    lines.push("Cannot come over:");
    for (const entry of group(report.not_imported, (item) => item.reason)) {
      lines.push("  ".concat(entry.reason, " (").concat(entry.items.length, "): ").concat(names(entry.items)));
      const next = entry.items.find((item) => item.next)?.next;
      if (next)
        lines.push("    next: ".concat(next));
    }
  }
  if (report.lossy.length > 0) {
    lines.push("Changes on the way:");
    for (const entry of group(report.lossy, (item) => item.change))
      lines.push("  ".concat(entry.reason, " (").concat(entry.items.length, "): ").concat(names(entry.items)));
  }
  for (const note of report.notes)
    lines.push("note: ".concat(note));
  lines.push("full list: ".concat(directory, "/scan.json"));
  return lines;
}

// dist/migrate/state.js
var state_exports = {};
__export(state_exports, {
  MAP_SCHEMA: () => MAP_SCHEMA,
  MigrationDir: () => MigrationDir,
  SCAN_SCHEMA: () => SCAN_SCHEMA,
  Serial: () => Serial,
  dirMismatch: () => dirMismatch,
  emptyMap: () => emptyMap,
  fingerprintOf: () => fingerprintOf,
  migrationKey: () => migrationKey,
  writeFileAtomic: () => writeFileAtomic
});
import { createHash as createHash2, randomBytes } from "node:crypto";
import { chmod, mkdir, open, readFile as readFile2, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
var SCAN_SCHEMA = "screenrig.migration-scan/v1";
var MAP_SCHEMA = "screenrig.migration-map/v1";
function emptyMap(binding) {
  return { schema: MAP_SCHEMA, ...binding, seed: randomBytes(32).toString("hex"), tags: {}, items: {}, failed: {} };
}
function migrationKey(seed, key, phase, fingerprint = "") {
  return createHash2("sha256").update("screenrig.migration\0").update(seed).update("\0").update(key).update("\0").update(phase).update("\0").update(fingerprint).digest("base64url");
}
function fingerprintOf(value) {
  return createHash2("sha256").update(JSON.stringify(value)).digest("hex");
}
function dirMismatch(dir, differs) {
  return new CliError(makeProblem("migration_dir_mismatch", "Migration directory belongs to another import", 400, "".concat(dir, " was made for another ").concat(differs, ". A migration directory is bound to one screenRIG project, API URL, vendor and source account, so reruns and resumes stay safe."), { hint: "Use another --dir for this import, or the same --dir with the project and vendor account it was made for." }), ExitCode.Usage);
}
var Serial = class {
  tail = Promise.resolve();
  run(work) {
    const next = this.tail.then(work, work);
    this.tail = next.then(() => void 0, () => void 0);
    return next;
  }
};
async function fsyncDirectory(directory) {
  let handle;
  try {
    handle = await open(directory, "r");
    await handle.sync();
  } catch {
  } finally {
    await handle?.close();
  }
}
async function writeFileAtomic(file, text) {
  const temporary = "".concat(file, ".").concat(process.pid, ".").concat(randomBytes(4).toString("hex"), ".tmp");
  try {
    const handle = await open(temporary, "w", 384);
    try {
      await handle.writeFile(text, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }
    await chmod(temporary, 384);
    await rename(temporary, file);
    await fsyncDirectory(path.dirname(file));
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}
function running(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}
var MigrationDir = class {
  dir;
  scanFile;
  mapFile;
  lockFile;
  stagingDir;
  constructor(dir) {
    this.dir = dir;
    this.scanFile = path.join(dir, "scan.json");
    this.mapFile = path.join(dir, "map.json");
    this.lockFile = path.join(dir, "map.json.lock");
    this.stagingDir = path.join(dir, "staging");
  }
  /** Creates the directory, mode 0700, when it does not exist; one that does is left as it is. */
  async ensure() {
    try {
      await stat(this.dir);
    } catch {
      await mkdir(this.dir, { recursive: true, mode: 448 });
      await chmod(this.dir, 448);
    }
  }
  async readScan() {
    let text;
    try {
      text = await readFile2(this.scanFile, "utf8");
    } catch {
      throw usageError("There is no scan in ".concat(this.dir, ". Run migrate scan first."), {
        command: "screenrig migrate scan --from VENDOR",
        reason: "Reads the vendor account and writes scan.json here; migrate apply reads that file."
      });
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw usageError("".concat(this.scanFile, " is not valid JSON. Run migrate scan again."), { command: "screenrig migrate scan --from VENDOR", reason: "Writes a fresh scan.json." });
    }
    if (parsed.schema !== SCAN_SCHEMA) {
      throw usageError("".concat(this.scanFile, " is not a ").concat(SCAN_SCHEMA, " document. Run migrate scan again."), { command: "screenrig migrate scan --from VENDOR", reason: "Writes a fresh scan.json." });
    }
    return parsed;
  }
  async writeScan(scan) {
    await this.ensure();
    await writeFileAtomic(this.scanFile, "".concat(JSON.stringify(scan, null, 2), "\n"));
  }
  async readMap() {
    let text;
    try {
      text = await readFile2(this.mapFile, "utf8");
    } catch {
      return void 0;
    }
    try {
      const parsed = JSON.parse(text);
      if (parsed.schema === MAP_SCHEMA)
        return parsed;
    } catch {
    }
    throw usageError("".concat(this.mapFile, " is not a ").concat(MAP_SCHEMA, " document, so it is not overwritten. Move it away or use another --dir."));
  }
  async writeMap(map) {
    await this.ensure();
    await writeFileAtomic(this.mapFile, "".concat(JSON.stringify(map, null, 2), "\n"));
  }
  /** Throws migration_dir_mismatch when the map was made for another project, API URL, vendor or account. */
  checkBinding(map, binding) {
    if (!map)
      return;
    if (binding.api_url !== void 0 && map.api_url !== binding.api_url)
      throw dirMismatch(this.dir, "API URL");
    if (binding.project_id !== void 0 && map.project_id !== binding.project_id)
      throw dirMismatch(this.dir, "project");
    if (binding.vendor !== void 0 && map.vendor !== binding.vendor)
      throw dirMismatch(this.dir, "vendor");
    if (binding.account !== void 0 && map.account !== binding.account)
      throw dirMismatch(this.dir, "source account");
  }
  /** The lock file holds the pid of the running apply or pair. A pid that is not running is taken over. */
  async lock() {
    await this.ensure();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const handle = await open(this.lockFile, "wx", 384);
        try {
          await handle.writeFile(String(process.pid));
        } finally {
          await handle.close();
        }
        return async () => {
          try {
            if ((await readFile2(this.lockFile, "utf8")).trim() === String(process.pid))
              await rm(this.lockFile, { force: true });
          } catch {
          }
        };
      } catch (error) {
        if (error.code !== "EEXIST")
          throw error;
      }
      const holder = Number((await readFile2(this.lockFile, "utf8").catch(() => "")).trim());
      if (Number.isInteger(holder) && holder > 0 && running(holder)) {
        throw usageError("Another migrate apply or pair is running in ".concat(this.dir, " (process ").concat(holder, "). Wait for it, or use another --dir."));
      }
      await rm(this.lockFile, { force: true });
    }
    throw usageError("Could not take the lock in ".concat(this.dir, "; try again."));
  }
  /** A per-object directory for downloads. The file inside carries the upload's own name. */
  stagingFor(key) {
    return path.join(this.stagingDir, createHash2("sha256").update(key).digest("hex"));
  }
  async makeStaging(key) {
    const directory = this.stagingFor(key);
    await rm(directory, { recursive: true, force: true });
    await mkdir(directory, { recursive: true, mode: 448 });
    return directory;
  }
  /** Downloads an interrupted run left behind; only called while the lock is held. */
  async clearStaging() {
    await rm(this.stagingDir, { recursive: true, force: true });
  }
  async removeStaging(key) {
    await rm(this.stagingFor(key), { recursive: true, force: true });
  }
};

// dist/migrate/apply.js
var FLEET_LINK_CAP = 50;
var CAMPAIGN_CAP = 100;
var ONLY_KINDS = ["media", "playlists", "screens", "schedules"];
var tally = () => ({ create: 0, reuse: 0, recreate: 0, waiting: 0, fail: 0 });
var STOP_CODES = /* @__PURE__ */ new Set([
  "quota_exceeded",
  "vendor_refused",
  "vendor_rate_limited",
  "vendor_unavailable",
  "campaign_limit_reached",
  "insufficient_access",
  "pending_review",
  "transport_error",
  "timeout",
  "not_enrolled",
  "unauthenticated",
  "session_ended",
  "credential_retired"
]);
var ITEM_CODES = /* @__PURE__ */ new Set(["vendor_bad_response", "vendor_file_gone", "vendor_file_stalled"]);
function isStop(error) {
  if (!(error instanceof CliError))
    return false;
  const { status, code } = error.problem;
  if (ITEM_CODES.has(code))
    return false;
  return STOP_CODES.has(code) || status === 401 || status === 402 || status === 403 || status === 429 || status >= 500;
}
function stopNext(error, rerun) {
  const code = error.problem.code;
  if (code === "pending_review" || code === "insufficient_access") {
    return { command: "screenrig login --access manage", reason: "migrate apply writes media, playlists, screens and campaigns, which needs Manage access that a person approves in the dashboard. Then run the same apply again." };
  }
  if (code === "quota_exceeded") {
    return { command: rerun, reason: "Storage is full. Delete media the project no longer needs or move to a larger plan (screenrig billing usage shows the storage limit), then run the same apply again: it continues where it stopped." };
  }
  if (code === "rate_limited") {
    return { command: rerun, reason: "The organization's hourly request cap is spent. Wait ".concat(error.problem.retry_after_seconds ?? "the Retry-After", " seconds, then run the same apply again: it continues where it stopped.") };
  }
  if (code === "feature_not_in_plan") {
    return { command: "screenrig project capabilities", reason: "The project's plan does not include the feature the problem names (campaigns need Plus), and required_plan names the plan that does. What was made before it stays. Running the same apply again repeats the refusal: tell the user which plan includes it, or leave it out." };
  }
  if (code === "campaign_limit_reached") {
    return { command: rerun, reason: "Delete campaigns the project no longer needs (screenrig campaign list, campaign delete), then run the same apply again: only the campaigns still missing are made." };
  }
  return { command: rerun, reason: "Fix the cause named in detail, then run the same apply again: it continues where this one stopped." };
}
function problemOf(error, secrets) {
  if (error instanceof CliError) {
    return {
      code: error.problem.code,
      status: error.problem.status,
      detail: truncate(error.problem.detail, 300).text,
      ...error.problem.next ? { next: error.problem.next } : {},
      exit: error.exitCode
    };
  }
  return {
    code: "unexpected_error",
    status: 500,
    detail: truncate(scrubSecrets(error instanceof Error ? error.message : "unknown error", secrets), 300).text,
    exit: ExitCode.Unexpected
  };
}
function exitForFailures(failed) {
  const last = failed[failed.length - 1];
  if (!last)
    return ExitCode.Success;
  if (last.status === 429)
    return ExitCode.RateLimited;
  if (last.status >= 500)
    return ExitCode.Server;
  if (last.code === "usage_error")
    return ExitCode.Usage;
  return ExitCode.Client;
}
function sourceRef(vendor, id) {
  return "".concat(vendor, ":").concat(id);
}
function placeholderKey(id) {
  return "screen:".concat(id);
}
async function mapPool(items, concurrency, worker) {
  let next = 0;
  const run = async () => {
    for (; ; ) {
      const index = next;
      next += 1;
      if (index >= items.length)
        return;
      await worker(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => run()));
}
async function listItems(client, route) {
  const response = await client.listAll(route, void 0, { uncapped: true });
  const items = response.body?.items;
  return Array.isArray(items) ? items : [];
}
async function readProject(client) {
  const [media, playlists, links, campaigns, screens, folders] = await Promise.all([
    listItems(client, "/api/media"),
    listItems(client, "/api/playlists"),
    listItems(client, "/api/fleet-links"),
    listItems(client, "/api/campaigns"),
    listItems(client, "/api/screens"),
    listItems(client, "/api/media-folders")
  ]);
  return {
    media: new Map(media.map((item) => [String(item.id), item])),
    playlists: new Set(playlists.map((item) => item.id)),
    links: new Map(links.map((item) => [item.id, item])),
    campaigns: new Map(campaigns.map((item) => [item.id, item])),
    screens,
    folders: new Set(folders.map((item) => item.id))
  };
}
function mediaOf(root, playlists, layouts) {
  const found = /* @__PURE__ */ new Set();
  const seen = /* @__PURE__ */ new Set();
  const visit = (items) => {
    for (const item of items) {
      if ("media_id" in item)
        found.add(item.media_id);
      else if ("playlist_id" in item) {
        const nested = playlists.get(item.playlist_id);
        if (nested && !seen.has("p:".concat(nested.id))) {
          seen.add("p:".concat(nested.id));
          visit(nested.items);
        }
      } else if ("layout_id" in item) {
        const nested = layouts.get(item.layout_id);
        if (nested && !seen.has("l:".concat(nested.id))) {
          seen.add("l:".concat(nested.id));
          for (const zone of nested.zones)
            visit(zone.items);
        }
      }
    }
  };
  if ("zones" in root)
    for (const zone of root.zones)
      visit(zone.items);
  else
    visit(root.items);
  return found;
}
var TERMINAL = /terminal|upload already finished/i;
function terminalConflict(error) {
  return error instanceof CliError && error.problem.code === "resource_conflict" && error.problem.status === 409 && TERMINAL.test(error.problem.detail);
}
function retryable(error) {
  return error instanceof CliError && (error.problem.status === 429 || error.problem.status >= 500);
}
async function runApply(deps, options) {
  const { runtime, client, dir, scan } = deps;
  const dry = options.dryRun;
  const secrets = deps.secrets ?? [];
  const catalog = scan.catalog;
  const vendor = scan.vendor;
  const release = dry ? void 0 : await dir.lock();
  try {
    if (!dry)
      await dir.clearStaging();
    let map = await dir.readMap();
    dir.checkBinding(map, { api_url: deps.apiUrl, project_id: deps.projectId, vendor, account: scan.account });
    const fresh = map === void 0;
    map ??= emptyMap({ api_url: deps.apiUrl, project_id: deps.projectId, vendor, account: scan.account });
    const state = map;
    const saves = new Serial();
    const save = () => dry ? Promise.resolve() : saves.run(() => dir.writeMap(state));
    if (fresh)
      await save();
    const snapshot = await readProject(client);
    const classified = classify(catalog, options.canvas);
    const planned = /* @__PURE__ */ new Set();
    const known = /* @__PURE__ */ new Map();
    const mediaRefs = /* @__PURE__ */ new Map();
    const results = { media: tally(), playlists: tally(), layouts: tally(), screens: tally(), schedules: tally() };
    const items = [];
    const failed = [];
    const waiting = [];
    const placeholders = [];
    let stopped;
    const halted = () => stopped;
    let bytes = 0;
    let folderId;
    let sessionPromise;
    let filesPromise;
    const session = () => sessionPromise ??= deps.openSession();
    const localFiles = () => filesPromise ??= deps.openFiles();
    const stamp = () => runtime.now().toISOString();
    const progress = (phase, done, total) => deps.progress?.({ event: "migrate_progress", phase, done, total });
    const note = (kind, item) => {
      items.push(item);
      results[kind][item.action] += 1;
      if (item.action === "waiting")
        waiting.push({ key: item.key, name: item.name, reason: item.reason ?? "" });
    };
    const fail = (kind, key, name, error) => {
      const problem = problemOf(error, secrets);
      results[kind].fail += 1;
      failed.push({ key, name, code: problem.code, status: problem.status, detail: problem.detail, ...problem.next ? { next: problem.next } : {} });
      state.failed[key] = { code: problem.code, detail: problem.detail, at: stamp() };
    };
    const succeeded = (key) => {
      delete state.failed[key];
    };
    const request = async (call) => {
      const response = await client.call(call);
      if (pendingReviewOf(response)) {
        throw new CliError(makeProblem("pending_review", "Changes wait for review", 202, "This sign-in proposes changes for a person to approve, so the write became a review and nothing was applied.", {
          hint: "Sign in again with Manage access, then run the same apply again."
        }), ExitCode.Auth);
      }
      return { body: response.body, status: response.status };
    };
    const guard = async (work, kind, key, name) => {
      if (halted())
        return;
      try {
        await work();
      } catch (error) {
        if (isStop(error)) {
          stopped = error;
          return;
        }
        fail(kind, key, name, error);
        await save();
      }
    };
    const stopWaiting = (kind, key, name) => {
      note(kind, { key, action: "waiting", name, reason: "The run stopped (".concat(halted()?.problem.code ?? "stopped", ") before this was reached.") });
    };
    if (!dry && options.only.has("media")) {
      const due = catalog.media.some((media) => {
        const mapped = state.items["media:".concat(media.id)]?.id;
        return media.local === void 0 && !(mapped !== void 0 && snapshot.media.has(mapped));
      });
      if (due)
        await session();
    }
    const ownLinks = new Set(Object.values(state.items).flatMap((item) => item.fleet_link_id !== void 0 ? [item.fleet_link_id] : []));
    const ownScreens = new Set(Object.values(state.items).flatMap((item) => item.screen_id !== void 0 ? [item.screen_id] : []));
    const taken = [];
    for (const screen of snapshot.screens) {
      if (ownScreens.has(screen.id) || screen.fleet_link_id !== void 0 && ownLinks.has(screen.fleet_link_id))
        continue;
      taken.push(...screen.tags ?? []);
    }
    for (const link of snapshot.links.values())
      if (!ownLinks.has(link.id))
        taken.push(...link.tags ?? []);
    Object.assign(state.tags, allocateTags(classified.wants, taken, state.tags));
    await save();
    if (options.only.has("media") && catalog.media.length > 0) {
      if (options.folder !== void 0) {
        if (!snapshot.folders.has(options.folder))
          await client.call({ method: "GET", path: "/api/media-folders/".concat(options.folder) });
        folderId = options.folder;
      } else {
        const mapped = state.items["folder:root"]?.id;
        if (mapped !== void 0 && snapshot.folders.has(mapped))
          folderId = mapped;
        else if (dry)
          folderId = "(planned)";
        else {
          const name = truncate("Imported from ".concat(deps.vendorName), 100).text;
          try {
            const made = await request({
              method: "POST",
              path: "/api/media-folders",
              idempotent: true,
              idempotencyKey: migrationKey(state.seed, "folder:root", "create", "".concat(name, "\0").concat(mapped ?? "")),
              body: { name }
            });
            folderId = made.body.id;
            state.items["folder:root"] = { id: folderId, at: stamp() };
            await save();
          } catch (error) {
            if (isStop(error))
              stopped = error;
            else
              throw error;
          }
        }
      }
    }
    const importMedia = async (media) => {
      const key = "media:".concat(media.id);
      const staging = await dir.makeStaging(key);
      const file = path2.join(staging, uploadName(media));
      try {
        if (media.local !== void 0) {
          const files = await localFiles();
          const entry = files.entries().find((candidate) => candidate.path === media.local);
          if (!entry)
            throw usageError("".concat(media.filename, " is no longer in --files. Put it back and run the same command again."));
          await files.extract(entry, file);
        } else {
          await (await session()).fetchMedia(media, file);
        }
        const input = {
          runtime,
          client,
          sourcePath: file,
          transcodeOptions: options.transcodeOptions,
          noTranscode: options.noTranscode,
          reporter: deps.reporter,
          resumable: true,
          timeoutMs: options.timeoutMs ?? 12e4,
          pollMs: options.pollMs ?? 1e3
        };
        const prepared = await prepareMediaFileForUpload(input);
        let mediaId;
        try {
          let attempt = 0;
          for (let loop = 0; mediaId === void 0; loop += 1) {
            const idempotencyKey = migrationKey(state.seed, key, "upload", "".concat(prepared.prepared.declaration.sha256, "\0").concat(attempt, "\0").concat(state.items[key]?.id ?? ""));
            try {
              mediaId = (await submitPreparedMedia({ ...input, idempotencyKey }, prepared)).mediaId;
              if (mediaId === void 0)
                throw usageError("The upload finished without a media id.");
            } catch (error) {
              if (terminalConflict(error)) {
                const found = await findBySha(client, prepared.prepared.declaration.sha256);
                if (found) {
                  mediaId = found;
                  break;
                }
                if (loop + 1 >= UPLOAD_BATCH_MAX_ATTEMPTS)
                  throw error;
                attempt += 1;
                continue;
              }
              if (!retryable(error) || loop + 1 >= UPLOAD_BATCH_MAX_ATTEMPTS)
                throw error;
              await runtime.sleep(computeBackoffMs({ attemptIndex: loop, ...error.problem.retry_after_seconds !== void 0 ? { retryAfterSeconds: error.problem.retry_after_seconds } : {} }));
            }
          }
        } finally {
          await cleanupPreparedMediaFile(prepared);
        }
        if (folderId !== void 0) {
          await request({
            method: "POST",
            path: "/api/media/move",
            idempotent: true,
            idempotencyKey: migrationKey(state.seed, key, "move", "".concat(mediaId, "\0").concat(folderId)),
            body: { folder_id: folderId, media_ids: [mediaId] }
          });
        }
        state.items[key] = { id: mediaId, at: stamp() };
        succeeded(key);
        await save();
        known.set(key, mediaId);
        const ref = { id: mediaId, kind: media.kind };
        if (media.kind === "video") {
          const read = await client.call({ method: "GET", path: "/api/media/".concat(mediaId) });
          const duration = read.body?.duration_ms;
          if (typeof duration === "number")
            ref.duration_ms = duration;
        }
        mediaRefs.set(media.id, ref);
      } finally {
        await dir.removeStaging(key);
      }
    };
    if (options.only.has("media")) {
      const pending = [];
      for (const media of catalog.media) {
        const key = "media:".concat(media.id);
        const mapped = state.items[key]?.id;
        const record = mapped === void 0 ? void 0 : snapshot.media.get(mapped);
        if (mapped !== void 0 && record) {
          known.set(key, mapped);
          mediaRefs.set(media.id, { id: mapped, kind: media.kind, ...typeof record.duration_ms === "number" ? { duration_ms: record.duration_ms } : {} });
          note("media", { key, action: "reuse", name: media.name });
        } else {
          pending.push({ media, action: mapped === void 0 ? "create" : "recreate" });
        }
      }
      if (dry) {
        for (const { media, action } of pending) {
          planned.add("media:".concat(media.id));
          mediaRefs.set(media.id, { id: "(planned)", kind: media.kind });
          note("media", { key: "media:".concat(media.id), action, name: media.name });
          if (media.bytes !== void 0)
            bytes += media.bytes;
        }
      } else {
        let done = 0;
        await mapPool(pending, options.concurrency, async ({ media, action }) => {
          const key = "media:".concat(media.id);
          if (halted()) {
            stopWaiting("media", key, media.name);
            return;
          }
          await guard(async () => {
            await importMedia(media);
            note("media", { key, action, name: media.name });
          }, "media", key, media.name);
          if (halted() && !items.some((item) => item.key === key) && !failed.some((entry) => entry.key === key))
            stopWaiting("media", key, media.name);
          done += 1;
          progress("media", done, pending.length);
        });
      }
    } else {
      for (const media of catalog.media) {
        const key = "media:".concat(media.id);
        const mapped = state.items[key]?.id;
        const record = mapped === void 0 ? void 0 : snapshot.media.get(mapped);
        if (mapped !== void 0 && record) {
          known.set(key, mapped);
          mediaRefs.set(media.id, { id: mapped, kind: media.kind, ...typeof record.duration_ms === "number" ? { duration_ms: record.duration_ms } : {} });
        }
      }
    }
    const playlistsBySource = new Map(catalog.playlists.map((playlist) => [playlist.id, playlist]));
    const layoutsBySource = new Map(catalog.layouts.map((layout) => [layout.id, layout]));
    const context = () => ({ media: mediaRefs, playlists: playlistsBySource, layouts: layoutsBySource, canvas: options.canvas });
    const contentName = (key) => (key.startsWith("playlist:") ? playlistsBySource.get(key.slice(9)) : layoutsBySource.get(key.slice(7)))?.name ?? key;
    const importContent = async (key, source, kind) => {
      const mapped = state.items[key]?.id;
      if (mapped !== void 0 && snapshot.playlists.has(mapped)) {
        known.set(key, mapped);
        note(kind, { key, action: "reuse", name: source.name });
        return;
      }
      const action = mapped === void 0 ? "create" : "recreate";
      const missing = [...mediaOf(source, playlistsBySource, layoutsBySource)].filter((id) => catalog.media.some((media) => media.id === id) && !mediaRefs.has(id));
      if (missing.length > 0) {
        const first = catalog.media.find((media) => media.id === missing[0]);
        note(kind, { key, action: "waiting", name: source.name, reason: "Its media has not been imported (".concat(first.name).concat(missing.length > 1 ? " and ".concat(missing.length - 1, " more") : "", ").") });
        return;
      }
      if (dry) {
        planned.add(key);
        note(kind, { key, action, name: source.name });
        return;
      }
      await guard(async () => {
        const built = "zones" in source ? buildLayout(source, context()) : buildPlaylist(source, context());
        if (!built.ok)
          throw usageError(built.reason);
        const made = await request({
          method: "POST",
          path: "/api/playlists",
          idempotent: true,
          idempotencyKey: migrationKey(state.seed, key, "create", fingerprintOf([built.document, mapped ?? null])),
          body: built.document
        });
        state.items[key] = { id: made.body.id, at: stamp() };
        succeeded(key);
        await save();
        known.set(key, made.body.id);
        snapshot.playlists.add(made.body.id);
        note(kind, { key, action, name: source.name });
      }, kind, key, source.name);
      if (halted() && !items.some((item) => item.key === key) && !failed.some((entry) => entry.key === key))
        stopWaiting(kind, key, source.name);
    };
    if (options.only.has("playlists")) {
      const work = [];
      for (const playlist of catalog.playlists)
        if (classified.content.get("playlist:".concat(playlist.id))?.ok)
          work.push(["playlist:".concat(playlist.id), playlist, "playlists"]);
      for (const layout of catalog.layouts)
        if (classified.content.get("layout:".concat(layout.id))?.ok)
          work.push(["layout:".concat(layout.id), layout, "layouts"]);
      let done = 0;
      for (const [key, source, kind] of work) {
        if (halted())
          stopWaiting(kind, key, source.name);
        else
          await importContent(key, source, kind);
        done += 1;
        progress("playlists", done, work.length);
      }
    } else {
      for (const key of classified.content.keys()) {
        const mapped = state.items[key]?.id;
        if (mapped !== void 0 && snapshot.playlists.has(mapped))
          known.set(key, mapped);
      }
    }
    const contentReady = (key) => known.has(key) || planned.has(key);
    const findScreen = (linkId) => linkId === void 0 ? void 0 : snapshot.screens.find((screen) => screen.fleet_link_id === linkId);
    let linkSlots = FLEET_LINK_CAP - snapshot.links.size;
    let linkCapReached = false;
    const counts = { linked: 0, unlinked: 0, paired: 0, finished: 0 };
    if (options.only.has("screens")) {
      let done = 0;
      for (const source of catalog.screens) {
        const key = placeholderKey(source.id);
        const entry = state.items[key];
        const place = (status, extra = {}) => {
          placeholders.push({ source_id: source.id, name: source.name, state: status, ...extra });
          if (status in counts)
            counts[status] += 1;
        };
        done += 1;
        progress("screens", done, catalog.screens.length);
        if (entry?.finished) {
          note("screens", { key, action: "reuse", name: source.name });
          place("finished", { ...entry.screen_id ? { screen_id: entry.screen_id } : {} });
          continue;
        }
        if (halted()) {
          stopWaiting("screens", key, source.name);
          place("waiting");
          continue;
        }
        const content = screenContent(source, classified);
        if (content !== void 0 && !contentReady(content)) {
          note("screens", { key, action: "waiting", name: source.name, reason: "Its playlist has not been imported (".concat(contentName(content), ").") });
          place("waiting");
          continue;
        }
        const body = placeholderFor(source, state.tags, classified);
        const linkId = entry?.fleet_link_id;
        const screen = entry?.screen_id === void 0 ? findScreen(linkId) : void 0;
        if (entry?.screen_id !== void 0) {
          note("screens", { key, action: "reuse", name: source.name });
          place("paired", { screen_id: entry.screen_id, ...linkId ? { fleet_link_id: linkId } : {} });
          continue;
        }
        const linkExists = linkId !== void 0 && snapshot.links.has(linkId);
        if (screen) {
          note("screens", { key, action: "reuse", name: source.name });
          place("paired", { screen_id: screen.id, ...linkId ? { fleet_link_id: linkId } : {} });
          if (!dry) {
            await guard(async () => {
              await finishScreen({ client, request, state, seed: state.seed, vendor, source, screen, ...linkExists ? { linkId } : {}, timezone: source.timezone ?? scan.inputs.timezone, stamp });
              const last = placeholders[placeholders.length - 1];
              last.state = "finished";
              counts.paired -= 1;
              counts.finished += 1;
              await save();
            }, "screens", key, source.name);
          }
          continue;
        }
        if (linkExists) {
          note("screens", { key, action: "reuse", name: source.name });
          place("linked", { fleet_link_id: linkId });
          continue;
        }
        const action = entry?.fleet_link_id === void 0 ? "create" : "recreate";
        if (linkCapReached || linkSlots <= 0) {
          note("screens", { key, action, name: source.name, reason: "The project is at its fleet link limit, so this screen waits for a Player code." });
          place("unlinked");
          continue;
        }
        if (dry) {
          linkSlots -= 1;
          note("screens", { key, action, name: source.name });
          place("linked");
          continue;
        }
        await guard(async () => {
          const link = {
            label: body.label,
            tags: body.tags,
            ...content !== void 0 ? { playlist_id: known.get(content) } : {},
            max_screens: 1,
            fields: { migrated_from: sourceRef(vendor, source.id) }
          };
          try {
            const made = await request({
              method: "POST",
              path: "/api/fleet-links",
              idempotent: true,
              idempotencyKey: migrationKey(state.seed, key, "link", fingerprintOf([link, entry?.fleet_link_id ?? null])),
              body: link
            });
            state.items[key] = { ...entry, fleet_link_id: made.body.id, at: stamp() };
            succeeded(key);
            await save();
            snapshot.links.set(made.body.id, made.body);
            linkSlots -= 1;
            note("screens", { key, action, name: source.name });
            place("linked", { fleet_link_id: made.body.id });
          } catch (error) {
            if (error instanceof CliError && error.problem.code === "fleet_link_limit_reached") {
              linkCapReached = true;
              note("screens", { key, action, name: source.name, reason: "The project is at its fleet link limit, so this screen waits for a Player code." });
              place("unlinked");
              return;
            }
            throw error;
          }
        }, "screens", key, source.name);
        if (halted() && !items.some((item) => item.key === key) && !failed.some((entry2) => entry2.key === key)) {
          stopWaiting("screens", key, source.name);
          place("waiting");
        }
      }
    }
    if (options.only.has("schedules")) {
      let done = 0;
      for (const schedule of catalog.schedules) {
        const key = "schedule:".concat(schedule.id);
        const verdict = classified.schedules.get(schedule.id);
        done += 1;
        progress("schedules", done, catalog.schedules.length);
        if (!verdict || "reason" in verdict)
          continue;
        const mapped = state.items[key]?.id;
        if (mapped !== void 0 && snapshot.campaigns.has(mapped)) {
          note("schedules", { key, action: "reuse", name: schedule.name });
          continue;
        }
        if (halted()) {
          stopWaiting("schedules", key, schedule.name);
          continue;
        }
        const action = mapped === void 0 ? "create" : "recreate";
        if (!contentReady(verdict.content)) {
          note("schedules", { key, action: "waiting", name: schedule.name, reason: "The playlist it plays has not been imported (".concat(contentName(verdict.content), ").") });
          continue;
        }
        if (dry) {
          note("schedules", { key, action, name: schedule.name });
          continue;
        }
        await guard(async () => {
          const tags = [
            ...verdict.targets.groups.map((id) => state.tags["group:".concat(id)]),
            ...verdict.targets.screens.map((id) => state.tags["screen:".concat(id)])
          ].filter((tag) => tag !== void 0);
          const body = {
            name: truncate(cleanName(schedule.name) || "Imported schedule", 120).text,
            playlist_id: known.get(verdict.content),
            audience: tagAudience([...new Set(tags)]),
            ...verdict.timing.from !== void 0 ? { from: verdict.timing.from } : {},
            ...verdict.timing.until !== void 0 ? { until: verdict.timing.until } : {},
            ...verdict.timing.windows !== void 0 ? { windows: verdict.timing.windows } : {},
            priority: Math.min(100, Math.max(0, Math.round(schedule.priority)))
          };
          const made = await request({
            method: "POST",
            path: "/api/campaigns",
            idempotent: true,
            idempotencyKey: migrationKey(state.seed, key, "create", fingerprintOf([body, mapped ?? null])),
            body
          });
          state.items[key] = { id: made.body.id, at: stamp() };
          succeeded(key);
          await save();
          snapshot.campaigns.set(made.body.id, made.body);
          note("schedules", { key, action, name: schedule.name });
        }, "schedules", key, schedule.name);
        if (halted() && !items.some((item) => item.key === key) && !failed.some((entry) => entry.key === key))
          stopWaiting("schedules", key, schedule.name);
      }
    }
    await save();
    return finishResult({ deps, options, dry, results, items, failed, waiting, placeholders, counts, bytes, snapshot, tags: state.tags, ...folderId !== void 0 && folderId !== "(planned)" ? { folderId } : {}, stopped: halted() });
  } finally {
    await release?.();
  }
}
async function findBySha(client, sha256) {
  try {
    const response = await client.listAll("/api/media", void 0, { uncapped: true });
    const rows = response.body?.items ?? [];
    return rows.find((row) => row.sha256 === sha256 && typeof row.id === "string")?.id;
  } catch {
    return void 0;
  }
}
async function finishScreen(input) {
  const { state, source, screen } = input;
  const key = placeholderKey(source.id);
  const label = truncate(cleanName(source.name) || "Imported screen", 80).text;
  const patch = {};
  if (screen.label !== label)
    patch.name = label;
  if (input.timezone !== void 0 && screen.timezone !== input.timezone)
    patch.timezone = input.timezone;
  if (Object.keys(patch).length > 0) {
    await input.request({
      method: "PATCH",
      path: "/api/screens/".concat(screen.id),
      idempotent: true,
      idempotencyKey: migrationKey(input.seed, key, "finish", fingerprintOf(patch)),
      body: patch
    });
  }
  if (input.linkId !== void 0) {
    try {
      await input.client.call({ method: "DELETE", path: "/api/fleet-links/".concat(input.linkId), idempotent: true, idempotencyKey: migrationKey(input.seed, key, "unlink", input.linkId) });
    } catch (error) {
      if (!(error instanceof CliError && error.problem.status === 404))
        throw error;
    }
  }
  state.items[key] = { ...state.items[key], screen_id: screen.id, finished: true, at: input.stamp() };
}
function finishResult(input) {
  const { deps, dry, results, failed, waiting, snapshot } = input;
  const warnings = [];
  const base = { dir: deps.dir.dir, vendor: deps.scan.vendor, dry_run: dry, tags: input.tags, ...input.folderId !== void 0 ? { folder_id: input.folderId } : {} };
  if (dry) {
    const creating = results.schedules.create + results.schedules.recreate;
    const data2 = {
      ...base,
      plan: results,
      bytes: input.bytes,
      items: input.items,
      placeholders: input.counts,
      project: {
        fleet_links: { used: snapshot.links.size, max: FLEET_LINK_CAP },
        campaigns: { used: snapshot.campaigns.size, max: CAMPAIGN_CAP }
      }
    };
    const lines2 = [
      "Plan for ".concat(deps.scan.label, " (").concat(deps.scan.vendor, "); nothing was written"),
      ...Object.entries(results).filter(([, row]) => Object.values(row).some(Boolean)).map(([kind, row]) => "  ".concat(kind, ": ").concat(row.create, " to create, ").concat(row.recreate, " to recreate, ").concat(row.reuse, " already there, ").concat(row.waiting, " waiting")),
      "  screens waiting for a Player: ".concat(input.counts.linked, " with a link, ").concat(input.counts.unlinked, " to pair by code, ").concat(input.counts.paired, " paired, ").concat(input.counts.finished, " finished"),
      "  project: fleet links ".concat(snapshot.links.size, "/").concat(FLEET_LINK_CAP, ", campaigns ").concat(snapshot.campaigns.size, "/").concat(CAMPAIGN_CAP, " (").concat(creating, " to create)"),
      ...input.bytes > 0 ? ["  to download: ".concat(input.bytes, " bytes")] : []
    ];
    return { data: data2, warnings, exitCode: ExitCode.Success, human: lines2.join("\n") };
  }
  const stoppedData = input.stopped ? { code: input.stopped.problem.code, detail: truncate(input.stopped.problem.detail, 300).text, next: stopNext(input.stopped, deps.rerun) } : void 0;
  const data = {
    ...base,
    applied: results,
    failed,
    waiting,
    placeholders: input.placeholders,
    ...stoppedData ? { stopped: stoppedData } : {}
  };
  if (failed.length > 0) {
    warnings.push({ code: "migration_items_failed", message: "".concat(failed.length, " item").concat(failed.length === 1 ? "" : "s", " failed; run the same apply again to retry ").concat(failed.length === 1 ? "it" : "them", ".") });
  }
  const lines = [
    "Applied ".concat(deps.scan.label, " (").concat(deps.scan.vendor, ")"),
    ...Object.entries(results).filter(([, row]) => Object.values(row).some(Boolean)).map(([kind, row]) => "  ".concat(kind, ": ").concat(row.create, " created, ").concat(row.recreate, " recreated, ").concat(row.reuse, " already there, ").concat(row.waiting, " waiting, ").concat(row.fail, " failed")),
    ...input.placeholders.length > 0 ? ["  screens: ".concat(input.counts.linked, " wait on a link, ").concat(input.counts.unlinked, " wait for a Player code (migrate pair), ").concat(input.counts.finished, " finished")] : [],
    ...stoppedData ? ["stopped: ".concat(stoppedData.code, ": ").concat(stoppedData.detail), "next: ".concat(stoppedData.next.command)] : [],
    ...failed.map((item) => "failed: ".concat(item.key, " ").concat(item.code))
  ];
  const exitCode = input.stopped ? input.stopped.exitCode : exitForFailures(failed);
  return { data, warnings, exitCode, human: lines.join("\n") };
}

// dist/migrate/cli.js
var cli_exports = {};
__export(cli_exports, {
  DIR_PREFIX: () => DIR_PREFIX,
  chooseDir: () => chooseDir,
  describeVendor: () => describeVendor,
  findVendor: () => findVendor,
  sortedVendors: () => sortedVendors,
  vendorHttpFor: () => vendorHttpFor,
  vendorLines: () => vendorLines
});
import { readdir } from "node:fs/promises";
import path3 from "node:path";
var DIR_PREFIX = "screenrig-migration-";
function sortedVendors(vendors = VENDORS) {
  return [...vendors].sort((a, b) => a.id === "files" ? 1 : b.id === "files" ? -1 : a.id.localeCompare(b.id));
}
function describeVendor(adapter) {
  return {
    id: adapter.id,
    name: adapter.name,
    inputs: {
      flags: [
        ...adapter.inputs.url ? [{ flag: "--url", required: adapter.inputs.url === "required" }] : [],
        ...adapter.inputs.regions ? [{ flag: "--region", required: true, values: [...adapter.inputs.regions] }] : [],
        ...adapter.inputs.timezone ? [{ flag: "--timezone", required: false }] : [],
        ...adapter.inputs.files ? [{ flag: "--files", required: adapter.inputs.files === "required" }] : []
      ],
      credentials: adapter.credentials.map((credential) => ({ name: credential.name, secret: credential.secret, required: credential.required, help: credential.help }))
    },
    connect: [...adapter.connect],
    maps: [...adapter.maps],
    skips: [...adapter.skips],
    docs: [...adapter.docs],
    example: adapter.example
  };
}
function vendorLines(adapter) {
  const flags = [
    ...adapter.inputs.url ? ["--url (".concat(adapter.inputs.url, ")")] : [],
    ...adapter.inputs.regions ? ["--region ".concat(adapter.inputs.regions.join("|"), " (required)")] : [],
    ...adapter.inputs.timezone ? ["--timezone (optional)"] : [],
    ...adapter.inputs.files ? ["--files (".concat(adapter.inputs.files, ")")] : []
  ];
  return [
    "".concat(adapter.id, ": ").concat(adapter.name),
    "  takes: ".concat(flags.join(", ") || "no vendor flags"),
    ...adapter.credentials.map((credential) => "  ".concat(credential.name).concat(credential.secret ? " (secret)" : "").concat(credential.required ? " (required)" : "", ": ").concat(credential.help)),
    ...adapter.connect.map((step, index) => "  connect ".concat(index + 1, ". ").concat(step)),
    ...adapter.maps.map((line) => "  maps: ".concat(line)),
    ...adapter.skips.map((line) => "  skips: ".concat(line)),
    ...adapter.docs.map((line) => "  docs: ".concat(line)),
    "  example: ".concat(adapter.example)
  ];
}
function findVendor(id, vendors = VENDORS) {
  const found = vendors.find((vendor) => vendor.id === id);
  if (!found) {
    throw usageError("".concat(JSON.stringify(id), " is not a system migrate reads. The systems are ").concat(sortedVendors(vendors).map((vendor) => vendor.id).join(", "), "."), {
      command: "screenrig migrate vendors",
      reason: "Lists every system migrate reads, with what each takes."
    });
  }
  return found;
}
async function chooseDir(runtime, flag, vendor) {
  if (flag !== void 0)
    return new MigrationDir(path3.resolve(runtime.cwd(), flag));
  if (vendor !== void 0)
    return new MigrationDir(path3.resolve(runtime.cwd(), "".concat(DIR_PREFIX).concat(vendor)));
  let found = [];
  try {
    found = (await readdir(runtime.cwd(), { withFileTypes: true })).filter((entry) => entry.isDirectory() && entry.name.startsWith(DIR_PREFIX)).map((entry) => entry.name).sort();
  } catch {
  }
  if (found.length === 1)
    return new MigrationDir(path3.resolve(runtime.cwd(), found[0]));
  throw usageError(found.length === 0 ? "There is no migration directory here. Add --dir DIR, the directory migrate scan wrote." : "More than one migration directory is here (".concat(found.join(", "), "). Add --dir DIR for the one you mean."), {
    command: "screenrig migrate scan --from VENDOR",
    reason: "Reads the vendor account and writes a migration directory."
  });
}
function vendorHttpFor(runtime, adapter) {
  const logger = loggerOf(runtime);
  return createVendorHttp({
    vendor: adapter.id,
    name: adapter.name,
    credentialNames: adapter.credentials.map((credential) => credential.name),
    fetch: runtime.vendorFetch ?? globalThis.fetch,
    sleep: runtime.sleep,
    now: () => runtime.now().getTime(),
    log: (request) => {
      const span = logger.startLocal({
        op: "migrate.vendor.request",
        message: "".concat(request.vendor, " ").concat(request.method, " ").concat(request.status),
        params: { vendor: request.vendor, method: request.method, status: request.status, ms: request.ms, ...request.cause !== void 0 ? { cause: request.cause } : {} },
        quiet: true
      });
      if (request.status === 0 || request.status >= 400) {
        span.error(new Error("".concat(request.vendor, " ").concat(request.method, " ").concat(request.status === 0 ? "got no answer".concat(request.cause ? " (".concat(request.cause, ")") : "") : "answered ".concat(request.status))));
      } else {
        span.finish();
      }
    }
  });
}

// dist/migrate/pair.js
var pair_exports = {};
__export(pair_exports, {
  findPlaceholder: () => findPlaceholder,
  runPair: () => runPair
});
function findPlaceholder(scan, wanted) {
  const screens = scan.catalog.screens;
  const byId = screens.find((screen) => screen.id === wanted);
  if (byId)
    return byId;
  const named = screens.filter((screen) => screen.name === wanted);
  if (named.length === 1)
    return named[0];
  if (named.length > 1) {
    throw usageError("".concat(named.length, " screens are named ").concat(JSON.stringify(wanted), ": ").concat(named.map((screen) => JSON.stringify(screen.id)).join(", "), ". Pass the source id of the one you mean."));
  }
  throw usageError("No screen in the scan has the source id or the exact name ".concat(JSON.stringify(wanted), "."), {
    command: "screenrig migrate scan --from VENDOR",
    reason: "The scan in this directory lists the vendor's screens; scan again if the list is out of date."
  });
}
async function runPair(input) {
  const { client, dir, scan } = input;
  const release = await dir.lock();
  try {
    const map = await dir.readMap();
    if (!map) {
      throw usageError("".concat(dir.dir, " has no map, so no placeholder has been made. Run migrate apply first."), {
        command: "screenrig migrate apply --dir ".concat(dir.dir),
        reason: "Imports the media and playlists and makes the placeholders; migrate pair then claims a Player code for one of them."
      });
    }
    dir.checkBinding(map, { api_url: input.apiUrl, project_id: input.projectId, vendor: scan.vendor, account: scan.account });
    const source = findPlaceholder(scan, input.screen);
    const key = placeholderKey(source.id);
    const entry = map.items[key];
    if (entry?.finished) {
      throw new CliError(makeProblem("resource_conflict", "Placeholder already paired", 409, "".concat(source.name, " is already screen ").concat(entry.screen_id ?? "(unknown)", ". A placeholder pairs once."), {
        next: entry.screen_id ? { command: "screenrig screen show ".concat(entry.screen_id), reason: "Shows the screen this placeholder became." } : void 0
      }), ExitCode.Conflict);
    }
    const classified = classify(scan.catalog);
    const content = screenContent(source, classified);
    const playlistId = content === void 0 ? void 0 : map.items[content]?.id;
    if (content !== void 0 && playlistId === void 0) {
      throw usageError("".concat(source.name, " shows a playlist that has not been imported. Run migrate apply first, then pair."), {
        command: "screenrig migrate apply --dir ".concat(dir.dir),
        reason: "Imports the playlists the placeholders show."
      });
    }
    const body = placeholderFor(source, map.tags, classified);
    const steps = [];
    const stamp = () => input.runtime.now().toISOString();
    let screenId = entry?.screen_id;
    let publicUrl;
    if (screenId === void 0) {
      const claim = await client.call({
        method: "POST",
        path: "/api/screens/pair",
        idempotent: true,
        idempotencyKey: migrationKey(map.seed, key, "pair", input.code),
        body: { code: input.code, label: body.label }
      });
      const paired = claim.body;
      if (!paired.screen?.id)
        throw usageError("The pairing answer did not name a screen.");
      screenId = paired.screen.id;
      publicUrl = paired.public_url;
      map.items[key] = { ...entry, screen_id: screenId, at: stamp() };
      await dir.writeMap(map);
      steps.push("paired");
    }
    const timezone = source.timezone ?? scan.inputs.timezone;
    const update = {
      ...playlistId !== void 0 ? { playlist_id: playlistId } : {},
      ...timezone !== void 0 ? { timezone } : {},
      fields: { migrated_from: sourceRef(scan.vendor, source.id) }
    };
    await client.call({
      method: "PATCH",
      path: "/api/screens/".concat(screenId),
      idempotent: true,
      idempotencyKey: migrationKey(map.seed, key, "pair-update", fingerprintOf(update)),
      body: update
    });
    steps.push("updated");
    await client.call({
      method: "PATCH",
      path: "/api/screens/".concat(screenId),
      idempotent: true,
      idempotencyKey: migrationKey(map.seed, key, "pair-tags", fingerprintOf(body.tags)),
      body: { tags: body.tags }
    });
    steps.push("tagged");
    if (entry?.fleet_link_id !== void 0) {
      try {
        await client.call({ method: "DELETE", path: "/api/fleet-links/".concat(entry.fleet_link_id), idempotent: true, idempotencyKey: migrationKey(map.seed, key, "unlink", entry.fleet_link_id) });
        steps.push("link deleted");
      } catch (error) {
        if (!(error instanceof CliError && error.problem.status === 404))
          throw error;
      }
    }
    map.items[key] = { ...map.items[key], screen_id: screenId, finished: true, at: stamp() };
    await dir.writeMap(map);
    steps.push("recorded");
    const label = truncate(cleanName(source.name) || "Imported screen", 80).text;
    const next = { command: "screenrig screen show ".concat(screenId), reason: "The Player finishes pairing the next time it contacts the service; screen show reports state active and online true once it has. screen screenshot shows what it plays." };
    return {
      data: { source_id: source.id, name: label, screen_id: screenId, ...publicUrl !== void 0 ? { public_url: publicUrl } : {}, steps, next },
      human: ["Paired ".concat(label, " as screen ").concat(screenId), "steps: ".concat(steps.join(", ")), "next: ".concat(next.command)].join("\n")
    };
  } finally {
    await release();
  }
}

// dist/migrate/scan.js
var scan_exports = {};
__export(scan_exports, {
  checkFlags: () => checkFlags,
  inputsText: () => inputsText,
  resolveMedia: () => resolveMedia,
  runScan: () => runScan
});
function inputsText(adapter) {
  const flags = [];
  if (adapter.inputs.url)
    flags.push("--url ADDRESS (".concat(adapter.inputs.url, ")"));
  if (adapter.inputs.regions)
    flags.push("--region ".concat(adapter.inputs.regions.join("|"), " (required)"));
  if (adapter.inputs.timezone)
    flags.push("--timezone ZONE (optional)");
  if (adapter.inputs.files)
    flags.push("--files PATH (".concat(adapter.inputs.files, ")"));
  const variables = adapter.credentials.map((credential) => "".concat(credential.name, " (").concat(credential.required ? "required" : "optional").concat(credential.secret ? ", secret" : "", ")"));
  return "".concat(adapter.name, " takes ").concat(flags.length ? flags.join(", ") : "no vendor flags").concat(variables.length ? "; its --credentials file holds ".concat(variables.join(", ")) : "", ". --credentials FILE and --dir DIR work with every vendor.");
}
function badInput(adapter, detail) {
  return usageError("".concat(detail, " ").concat(inputsText(adapter)), { command: "screenrig migrate vendors ".concat(adapter.id), reason: "Shows what ".concat(adapter.name, " takes and how to make its read-only key.") });
}
function checkFlags(adapter, flags) {
  const { inputs } = adapter;
  if (flags.url !== void 0 && !inputs.url)
    throw badInput(adapter, "".concat(adapter.name, " does not take --url."));
  if (flags.url === void 0 && inputs.url === "required")
    throw badInput(adapter, "".concat(adapter.name, " needs --url."));
  if (flags.region !== void 0 && !inputs.regions)
    throw badInput(adapter, "".concat(adapter.name, " does not take --region."));
  if (inputs.regions && flags.region === void 0)
    throw badInput(adapter, "".concat(adapter.name, " needs --region."));
  if (inputs.regions && flags.region !== void 0 && !inputs.regions.includes(flags.region)) {
    throw badInput(adapter, "--region ".concat(flags.region, " is not one of ").concat(inputs.regions.join(", "), "."));
  }
  if (flags.timezone !== void 0 && !inputs.timezone)
    throw badInput(adapter, "".concat(adapter.name, " does not take --timezone."));
  if (flags.files !== void 0 && !inputs.files)
    throw badInput(adapter, "".concat(adapter.name, " does not take --files."));
  if (flags.files === void 0 && inputs.files === "required")
    throw badInput(adapter, "".concat(adapter.name, " needs --files."));
  if (flags.timezone !== void 0) {
    try {
      new Intl.DateTimeFormat("en", { timeZone: flags.timezone });
    } catch {
      throw usageError("--timezone must be an IANA time zone name such as America/Toronto.");
    }
  }
}
function assertCatalog(adapter, catalog) {
  const kinds = [
    ["media", catalog.media],
    ["playlist", catalog.playlists],
    ["layout", catalog.layouts],
    ["group", catalog.groups],
    ["screen", catalog.screens],
    ["schedule", catalog.schedules]
  ];
  for (const [kind, list] of kinds) {
    const seen = /* @__PURE__ */ new Set();
    for (const item of list) {
      if (typeof item.id !== "string" || item.id === "" || seen.has(item.id)) {
        throw vendorBadResponse(adapter.name, "two ".concat(kind, " entries have the same id, or one has none"));
      }
      seen.add(item.id);
    }
  }
}
function resolveMedia(adapter, catalog, files) {
  const media = [];
  const notImported = [];
  const lossy = [];
  for (const item of catalog.media) {
    const wantsLocal = item.fetch === void 0 || !item.original;
    let local;
    if (wantsLocal && files) {
      const candidates = files.match(item.filename, item.bytes).filter((entry) => !entry.unreadable);
      if (candidates.length > 1) {
        notImported.push({ kind: "media", source_id: item.id, name: item.name, reason: "There are ".concat(candidates.length, " files named ").concat(item.filename, " in --files."), next: "Keep one of them, or rename them, and rerun migrate scan." });
        continue;
      }
      local = candidates[0]?.path;
    }
    if (local === void 0 && item.fetch === void 0) {
      notImported.push({
        kind: "media",
        source_id: item.id,
        name: item.name,
        reason: "".concat(adapter.name, " does not hand out this file").concat(files ? ", and no file of that name is in --files" : "", "."),
        next: "Download ".concat(item.filename, " from ").concat(adapter.name, " into a folder and rerun migrate scan with --files DIR.")
      });
      continue;
    }
    if (local === void 0 && !item.original) {
      lossy.push({ kind: "media", source_id: item.id, name: item.name, change: "Only ".concat(adapter.name, "'s re-encoded copy is available, not the original. Put the original in --files and rescan to import it instead.") });
    }
    media.push({ ...item, ...local !== void 0 ? { local } : {} });
  }
  return { media, notImported, lossy };
}
async function runScan(request) {
  const { adapter, flags } = request;
  checkFlags(adapter, flags);
  const credentials = await loadCredentials(adapter, request.credentialsFile !== void 0 ? { file: request.credentialsFile } : {});
  const files = flags.files !== void 0 ? await openLocalFiles(flags.files) : void 0;
  let catalog;
  try {
    const session = await adapter.open({
      ...flags.url !== void 0 ? { url: flags.url } : {},
      ...flags.region !== void 0 ? { region: flags.region } : {},
      ...flags.timezone !== void 0 ? { timezone: flags.timezone } : {},
      credentials,
      http: request.http,
      ...files ? { files } : {},
      now: request.now
    });
    catalog = await session.scan();
  } catch (error) {
    if (error instanceof CliError)
      throw error;
    throw vendorBadResponse(adapter.name, "it could not be read (".concat(scrubSecrets(error instanceof Error ? error.message : "unknown error", Object.values(credentials)).slice(0, 200), ")"));
  }
  assertCatalog(adapter, catalog);
  const resolved = resolveMedia(adapter, catalog, files);
  const scanned = { ...catalog, media: resolved.media, not_imported: [], notes: [] };
  const scannedAt = request.now().toISOString();
  const report = buildReport({
    vendor: adapter.id,
    label: catalog.label,
    scannedAt,
    catalog: scanned,
    found: countsOf(catalog),
    notImported: [...catalog.not_imported, ...resolved.notImported],
    lossy: resolved.lossy,
    notes: catalog.notes,
    ...flags.timezone !== void 0 ? { timezone: flags.timezone } : {}
  });
  request.dir.checkBinding(await request.dir.readMap(), { vendor: adapter.id, account: catalog.account });
  const scan = {
    schema: SCAN_SCHEMA,
    vendor: adapter.id,
    account: catalog.account,
    label: catalog.label,
    scanned_at: scannedAt,
    inputs: {
      ...flags.url !== void 0 ? { url: flags.url } : {},
      ...flags.region !== void 0 ? { region: flags.region } : {},
      ...flags.timezone !== void 0 ? { timezone: flags.timezone } : {},
      ...flags.files !== void 0 ? { files: flags.files } : {}
    },
    catalog: scanned,
    report
  };
  await request.dir.writeScan(scan);
  return { scan, report };
}

// dist/handlers/migrate.js
var handleMigrateVendors = commandHandler(async (args) => {
  const id = args.positionals[2];
  const vendors = id === void 0 ? sortedVendors() : [findVendor(id)];
  return {
    envelope: successEnvelope({ vendors: vendors.map(describeVendor) }),
    exitCode: ExitCode.Success,
    human: vendors.flatMap((vendor) => vendorLines(vendor)).join("\n")
  };
}, false);
var handleMigrateScan = commandHandler(async (args, runtime) => {
  const adapter = findVendor(flagString(args.flags, "from") ?? "");
  const resolvePath = (flag) => {
    const value = flagString(args.flags, flag);
    return value === void 0 ? void 0 : path4.resolve(runtime.cwd(), value);
  };
  const dir = await chooseDir(runtime, flagString(args.flags, "dir"), adapter.id);
  const files = resolvePath("files");
  const { report } = await runScan({
    adapter,
    flags: {
      ...flagString(args.flags, "url") !== void 0 ? { url: flagString(args.flags, "url") } : {},
      ...flagString(args.flags, "region") !== void 0 ? { region: flagString(args.flags, "region") } : {},
      ...flagString(args.flags, "timezone") !== void 0 ? { timezone: flagString(args.flags, "timezone") } : {},
      ...files !== void 0 ? { files } : {}
    },
    ...resolvePath("credentials") !== void 0 ? { credentialsFile: resolvePath("credentials") } : {},
    dir,
    now: runtime.now,
    http: vendorHttpFor(runtime, adapter)
  });
  return {
    envelope: successEnvelope({ ...report, dir: dir.dir, scan_file: dir.scanFile }),
    exitCode: ExitCode.Success,
    human: reportLines(report, dir.dir).join("\n")
  };
}, false);
async function migrateProjectId(client, configured) {
  if (configured)
    return configured;
  const id = (await client.call({ method: "GET", path: "/api/project" })).body?.id;
  if (typeof id !== "string" || id.length === 0)
    throw usageError("The project id is unavailable, so the migration directory cannot be bound to it.");
  return id;
}
var handleMigrateApply = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const dir = await chooseDir(runtime, flagString(args.flags, "dir"));
  const scan = await dir.readScan();
  const adapter = findVendor(scan.vendor);
  const concurrency = flagNumber(args.flags, "concurrency") ?? UPLOAD_BATCH_DEFAULT_CONCURRENCY;
  if (!Number.isInteger(concurrency) || concurrency < UPLOAD_BATCH_MIN_CONCURRENCY || concurrency > UPLOAD_BATCH_MAX_CONCURRENCY) {
    throw usageError("--concurrency must be a whole number from ".concat(UPLOAD_BATCH_MIN_CONCURRENCY, " to ").concat(UPLOAD_BATCH_MAX_CONCURRENCY, "."));
  }
  const canvasText = flagString(args.flags, "canvas");
  const canvasMatch = canvasText === void 0 ? void 0 : /^(\d+)x(\d+)$/i.exec(canvasText);
  const onlyText = flagString(args.flags, "only");
  const only2 = new Set(onlyText === void 0 ? ONLY_KINDS : onlyText.split(","));
  const credentialsFile = flagString(args.flags, "credentials") === void 0 ? void 0 : path4.resolve(runtime.cwd(), flagString(args.flags, "credentials"));
  const folder = flagString(args.flags, "folder");
  if (folder !== void 0)
    mediaFolderId(folder, "--folder");
  const options = {
    dryRun: flagBool(args.flags, "dry-run"),
    only: only2,
    ...folder !== void 0 ? { folder } : {},
    canvas: canvasMatch ? { width: Number(canvasMatch[1]), height: Number(canvasMatch[2]) } : { width: 1920, height: 1080 },
    concurrency,
    noTranscode: flagBool(args.flags, "no-transcode"),
    transcodeOptions: transcodeOptionsFromArgs(args),
    timeoutMs: flagNumber(args.flags, "timeout") ?? 12e4,
    pollMs: 1e3
  };
  const json = !flagBool(args.flags, "human");
  const secrets = [];
  const result = await runApply({
    runtime,
    client,
    dir,
    scan,
    vendorName: adapter.name,
    apiUrl: resolved.apiUrl.replace(/\/+$/, ""),
    projectId: await migrateProjectId(client, resolved.projectId),
    openSession: async () => {
      const credentials = await loadCredentials(adapter, credentialsFile !== void 0 ? { file: credentialsFile } : {});
      secrets.push(...Object.values(credentials));
      const files = scan.inputs.files !== void 0 ? await openLocalFiles(scan.inputs.files) : void 0;
      return adapter.open({
        ...scan.inputs.url !== void 0 ? { url: scan.inputs.url } : {},
        ...scan.inputs.region !== void 0 ? { region: scan.inputs.region } : {},
        ...scan.inputs.timezone !== void 0 ? { timezone: scan.inputs.timezone } : {},
        credentials,
        http: vendorHttpFor(runtime, adapter),
        ...files ? { files } : {},
        now: runtime.now
      });
    },
    openFiles: async () => {
      if (scan.inputs.files === void 0)
        throw usageError("This scan used no --files, so there are no local originals to import.");
      return openLocalFiles(scan.inputs.files);
    },
    reporter: progressReporterFor(args, runtime),
    rerun: shellQuote([
      "screenrig",
      "migrate",
      "apply",
      "--dir",
      dir.dir,
      ...onlyText !== void 0 ? ["--only", onlyText] : [],
      ...folder !== void 0 ? ["--folder", folder] : [],
      ...canvasText !== void 0 ? ["--canvas", canvasText] : [],
      ...credentialsFile !== void 0 ? ["--credentials", credentialsFile] : [],
      ...flagString(args.flags, "concurrency") !== void 0 ? ["--concurrency", String(concurrency)] : [],
      ...options.noTranscode ? ["--no-transcode"] : []
    ]),
    progress: (event) => {
      runtime.stderr.write(json ? "".concat(JSON.stringify(event), "\n") : "screenrig: migrate ".concat(String(event.phase), " ").concat(String(event.done), "/").concat(String(event.total), "\n"));
    },
    secrets
  }, options);
  return {
    envelope: successEnvelope(result.data, { request_id: client.requestId, warnings: result.warnings }),
    exitCode: result.exitCode,
    human: result.human
  };
}, true);
var handleMigratePair = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const rawCode = args.positionals.slice(2).join(" ");
  if (!rawCode)
    throw usageError("migrate pair requires CODE.");
  const code = canonicalPairingCode(rawCode, "migrate pair CODE");
  const dir = await chooseDir(runtime, flagString(args.flags, "dir"));
  const scan = await dir.readScan();
  const result = await runPair({
    runtime,
    client,
    dir,
    scan,
    apiUrl: resolved.apiUrl.replace(/\/+$/, ""),
    projectId: await migrateProjectId(client, resolved.projectId),
    code,
    screen: flagString(args.flags, "screen") ?? ""
  });
  return { envelope: successEnvelope(result.data, { request_id: client.requestId }), exitCode: ExitCode.Success, human: result.human };
}, true);

// dist/cli-commands/migrate.js
function only(value) {
  const kinds = value.split(",").map((kind) => kind.trim());
  const bad = kinds.find((kind) => !ONLY_KINDS.includes(kind));
  if (bad !== void 0 || new Set(kinds).size !== kinds.length) {
    throw usageError("--only takes a comma-separated list of ".concat(ONLY_KINDS.join(", "), ", each at most once."));
  }
  return kinds.join(",");
}
function canvas(value) {
  const match = /^(\d{2,5})x(\d{2,5})$/i.exec(value);
  if (!match || Number(match[1]) < 16 || Number(match[2]) < 16)
    throw usageError("--canvas takes WIDTHxHEIGHT in pixels, such as 1920x1080.");
  return value;
}
function registerMigrateCommands(root, bind) {
  const migrate = root.command("migrate").description("Import media, playlists and screens from another signage system");
  addCommandNotes(migrate, "Migration:\n  migrate runs in this CLI, on this machine. The vendor's key is read from a --credentials FILE of NAME=VALUE lines, goes only to that vendor, and is never stored, printed or sent to screenRIG. Steps: migrate vendors (what each system takes), migrate scan (read the account and report what can and cannot come over; needs no sign-in), migrate apply --dry-run, migrate apply, then migrate pair for each display.");
  migrate.command("vendors").description("List the systems migrate reads, what each takes and how to make its read-only key").argument("[vendor]", "One system's id").action(bind(handleMigrateVendors));
  migrate.command("scan").description("Read a signage account and report what can and cannot come over; writes scan.json, sends nothing to screenRIG").addOption(new Option("--from <VENDOR>", "The system to read").choices(sortedVendors().map((vendor) => vendor.id)).makeOptionMandatory()).option("--url <ADDRESS>", "The address of a self-hosted system").option("--region <REGION>", "The region of a hosted account, where the system has regions").option("--timezone <ZONE>", "An IANA time zone to set on screens that have none, such as America/Toronto (without one a screen follows its device)").option("--files <PATH>", "A folder or .zip of the originals the system's API cannot hand out").option("--credentials <FILE>", "NAME=VALUE lines holding the vendor's key").option("--dir <DIR>", "The migration directory (default ./screenrig-migration-VENDOR)").action(bind(handleMigrateScan));
  migrate.command("apply").description("Import what the scan found: media, playlists, waiting screens and campaigns; safe to rerun").option("--dir <DIR>", "The migration directory holding scan.json (default ./screenrig-migration-VENDOR when one exists)").option("--dry-run", "Read the project and print the plan; writes nothing and needs no vendor key").option("--only <KINDS>", "Only these, comma-separated: media, playlists, screens, schedules", only).option("--folder <ID>", "Put the media in this existing folder (mfd_...) instead of one made for the import").option("--canvas <WIDTHxHEIGHT>", "The canvas of plain playlists (default 1920x1080); layouts keep their own size", canvas).option("--credentials <FILE>", "NAME=VALUE lines holding the vendor's key, for downloads from the vendor").option("--concurrency <N>", "Media imported at once, 1 to 8 (default 4)", positiveInteger("concurrency")).option("--no-transcode", "Upload accepted source bytes unchanged").action(bind(handleMigrateApply));
  migrate.command("pair").description("Pair a Player code to one waiting screen, under its old name, playlist, time zone and tags").argument("<code...>", "The code the Player shows, such as ABC 234").requiredOption("--screen <ID_OR_NAME>", "The waiting screen: its source id or its exact old name").option("--dir <DIR>", "The migration directory (default ./screenrig-migration-VENDOR when one exists)").action(bind(handleMigratePair));
}

// dist/bundles/migrate.js
function register(root, bind) {
  registerMigrateCommands(root, bind);
}

export {
  credentials_exports,
  report_exports,
  state_exports,
  apply_exports,
  cli_exports,
  pair_exports,
  scan_exports,
  migrate_exports,
  migrate_exports2,
  register,
  migrate_exports3
};
