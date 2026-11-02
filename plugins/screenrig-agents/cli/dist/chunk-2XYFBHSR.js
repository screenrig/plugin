import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  requireCapability
} from "./chunk-D7JCTZ56.js";
import {
  isAdSlotPage,
  playlistNeedsTimezone,
  wallProblem
} from "./chunk-MUS5MXRK.js";
import {
  validatePlaylistCards
} from "./chunk-N7OKOCR3.js";
import {
  clientFor,
  commandHandler,
  jsonBody,
  quotedRevision,
  requireToken
} from "./chunk-T7G2ABSS.js";
import {
  assertProjectCredential,
  pendingReviewOf,
  plainText,
  playlistWarningItems,
  projectConfigFor,
  removeOnSignal,
  reviewNoteHeaders,
  tempPathFor,
  withProjectConfig
} from "./chunk-F7RM3JF3.js";
import {
  CAMPAIGN_WINDOWS_MAX,
  campaignWindow,
  campaignWindowSpec,
  durationMs,
  flagString,
  instantInZone,
  isValidIdempotencyKey,
  newIdempotencyKey,
  normalizeInstant,
  readConfigFile,
  scheduleWindow,
  withConfigLock,
  writeConfigAtomic
} from "./chunk-ZSDB2GXQ.js";
import {
  isResourceID
} from "./chunk-SFYZH3GR.js";
import {
  CliError,
  ExitCode,
  makeProblem,
  unexpectedResponseError,
  usageError
} from "./chunk-FZL3NTLT.js";
import {
  __export
} from "./chunk-3FYAGULW.js";

// dist/screen-manifest-upgrade.js
var screen_manifest_upgrade_exports = {};
__export(screen_manifest_upgrade_exports, {
  anyManifestUpgrade: () => anyManifestUpgrade,
  manifestUpgradeCell: () => manifestUpgradeCell,
  manifestUpgradeLines: () => manifestUpgradeLines,
  manifestUpgradeOf: () => manifestUpgradeOf
});
var UPGRADE_STATES = {
  none: true,
  pending: true,
  downloading: true,
  preparing: true,
  activating: true,
  retrying: true,
  failed: true,
  blocked: true,
  partial: true,
  current: true
};
var str = (value) => typeof value === "string" && value ? value : void 0;
var int = (value) => typeof value === "number" && Number.isSafeInteger(value) ? value : void 0;
var instant = (value) => typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : void 0;
function validPlaylist(value) {
  if (!value || typeof value !== "object")
    return void 0;
  const record2 = value;
  const id = str(record2.id);
  const revision = int(record2.revision);
  if (!id || revision === void 0 || revision < 1)
    return void 0;
  const name = typeof record2.name === "string" ? playlistName(record2.name) : null;
  return { id, name, revision };
}
function playlistName(name) {
  return name.replace(/[\r\n\t]+/g, " ").trim().slice(0, 48);
}
function playlistLabel(playlist) {
  return playlist.name || playlist.id;
}
function upgradeDetail(desired, active) {
  const target = validPlaylist(desired);
  const playing = validPlaylist(active);
  if (target && playing && target.id === playing.id) {
    return "Target v".concat(target.revision, " \xB7 Playing v").concat(playing.revision);
  }
  if (target && playing) {
    return "Target ".concat(playlistLabel(target), " v").concat(target.revision, " \xB7 Playing ").concat(playlistLabel(playing), " v").concat(playing.revision);
  }
  if (target)
    return "Target v".concat(target.revision);
  return "Target: unknown version";
}
var UPGRADE_CODE_TEXT = {
  download_failed: "the candidate download failed",
  hash_mismatch: "the downloaded candidate did not match its hash",
  storage_full: "Storage full.",
  manifest_invalid: "the candidate manifest was rejected as invalid",
  prepare_failed: "the candidate could not be prepared on the display",
  activate_failed: "the swap to the candidate failed",
  anchor_unavailable: "a page anchor the manifest references is unavailable",
  transition_blocked: "Storage full. Can't load the playlist update.",
  none_fit: "Storage full. Can't load this playlist.",
  staged: "the candidate is staged; the upgrade still needs its final step",
  capacity: "Storage full. Some playlist pages can't be loaded.",
  persist_failed: "the screen could not persist the activation",
  internal: "an internal error occurred",
  unsupported_content: "the manifest carries content this player cannot show"
};
function manifestUpgradeOf(screen) {
  const upgrade = screen?.manifest_upgrade;
  if (!upgrade || typeof upgrade !== "object")
    return void 0;
  const record2 = upgrade;
  if (typeof record2.state !== "string" || !(record2.state in UPGRADE_STATES))
    return void 0;
  return upgrade;
}
function manifestUpgradeLines(screen, now) {
  const upgrade = manifestUpgradeOf(screen);
  if (!upgrade)
    return [];
  const desired = str(upgrade.desired_revision);
  const active = str(upgrade.active_revision);
  const state = upgrade.state;
  if (state === "none" && !desired && !active)
    return [];
  const lines = ["Manifest upgrade"];
  const target = validPlaylist(upgrade.desired_playlist);
  const playing = validPlaylist(upgrade.active_playlist);
  lines.push(upgradeDetail(upgrade.desired_playlist, upgrade.active_playlist));
  if (target && playing && target.id === playing.id)
    lines.push("playlist: ".concat(playlistLabel(target)));
  if (!playing && !active)
    lines.push("Playing: none yet");
  const diagnostics = [
    desired ? "target ".concat(desired) : void 0,
    active ? "acknowledged ".concat(active) : void 0
  ].filter((part) => part !== void 0);
  if (diagnostics.length)
    lines.push("diagnostics: ".concat(diagnostics.join(", ")));
  const since = instant(upgrade.state_since);
  lines.push("state: ".concat(state).concat(since ? " (since ".concat(since, ")") : ""));
  const code = str(upgrade.code);
  if (code)
    lines.push("reason: ".concat(code).concat(UPGRADE_CODE_TEXT[code] ? " \u2014 ".concat(UPGRADE_CODE_TEXT[code]) : ""));
  const attempt = int(upgrade.attempt);
  if (attempt !== void 0)
    lines.push("attempt: ".concat(attempt));
  const retryAt = state === "retrying" ? instant(upgrade.retry_at) : void 0;
  if (retryAt) {
    const overdue = Date.parse(retryAt) < now.getTime();
    lines.push("retry: ".concat(retryAt).concat(overdue ? " (overdue)" : ""));
  }
  const missing = int(upgrade.missing_page_count);
  if (state === "partial" && missing !== void 0)
    lines.push("missing pages: ".concat(missing));
  const reported = instant(upgrade.reported_at);
  if (reported)
    lines.push("last report: ".concat(reported));
  else if (state === "pending")
    lines.push("no upgrade report yet");
  if (target && playing && (target.id !== playing.id || target.revision !== playing.revision)) {
    lines.push("Playing is the last activation the server confirmed; the display may still be showing it rather than the target, and it is not proof that every connected session shows it.");
  }
  if (state === "partial") {
    lines.push(missing !== void 0 ? "Partial: the target is on the display, but ".concat(missing, " whole page(s) of authored content are excluded.") : "Partial: the target is on the display, but not all authored content is eligible.");
  }
  if (state === "failed") {
    lines.push("No retry is scheduled. Fix the cause, then screen reload <id> or reassign the playlist.");
  }
  if (state === "retrying") {
    lines.push("A retry is scheduled; the player reports again after it. Offline is never reported as failure.");
  }
  if (state === "blocked") {
    lines.push("Free up storage on the device running this Player, then retry the playlist.");
  }
  return lines;
}
function manifestUpgradeCell(screen, now) {
  const upgrade = manifestUpgradeOf(screen);
  if (!upgrade || upgrade.state === "none")
    return void 0;
  const parts = [upgrade.state];
  const desired = str(upgrade.desired_revision);
  const target = validPlaylist(upgrade.desired_playlist);
  parts.push(target ? upgradeDetail(upgrade.desired_playlist, upgrade.active_playlist) : desired ? "Target unknown version" : "Target none yet");
  const code = str(upgrade.code);
  if (code)
    parts.push(code);
  const attempt = int(upgrade.attempt);
  if (attempt !== void 0)
    parts.push("attempt ".concat(attempt));
  const missing = int(upgrade.missing_page_count);
  if (missing !== void 0)
    parts.push("".concat(missing, " pages"));
  const retryAt = instant(upgrade.retry_at);
  if (retryAt) {
    parts.push("retry ".concat(retryAt));
    if (upgrade.state === "retrying" && Date.parse(retryAt) < now.getTime())
      parts.push("overdue");
  }
  const reported = instant(upgrade.reported_at);
  if (reported)
    parts.push("reported ".concat(reported));
  else if (upgrade.state === "pending")
    parts.push("no report yet");
  return parts.join(" ");
}
function anyManifestUpgrade(items, now) {
  return items.some((screen) => manifestUpgradeCell(screen, now) !== void 0);
}

// dist/screen-publish.js
var screen_publish_exports = {};
__export(screen_publish_exports, {
  publishScreen: () => publishScreen
});
import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
var digest = (value) => createHash("sha256").update(value).digest("hex");
function resource(value, kind) {
  const item = value;
  if (!item || typeof item.id !== "string" || !isResourceID(item.id, kind) || !Number.isSafeInteger(item.revision) || item.revision < 1)
    throw usageError("Server response has invalid resource identity or revision.");
  return item;
}
function staleRevision(detail, revision) {
  throw new CliError(makeProblem("revision_conflict", "Publish needs reconciliation", 412, detail, { current_revision: revision }));
}
function conflict(detail, revision) {
  throw new CliError(makeProblem("resource_conflict", "Publish needs reconciliation", 409, detail, { current_revision: revision }));
}
function playbackOf(screen, playlist) {
  const upgrade = manifestUpgradeOf(screen);
  const online = screen?.online === true;
  const effective = typeof screen?.effective_playlist?.id === "string" ? screen.effective_playlist.id : void 0;
  const detail = {
    online,
    ...upgrade ? { state: upgrade.state } : {},
    ...typeof upgrade?.code === "string" ? { code: upgrade.code } : {},
    ...typeof upgrade?.missing_page_count === "number" ? { missing_page_count: upgrade.missing_page_count } : {},
    ...effective ? { effective_playlist_id: effective } : {}
  };
  const active = upgrade?.active_playlist;
  if (upgrade?.desired_revision && upgrade.active_revision === upgrade.desired_revision && active?.id === playlist.id && active.revision >= playlist.revision)
    return { playing: true, final: true, ...detail };
  if (effective && effective !== playlist.id)
    return { playing: false, final: true, reason: "playlist_not_effective", ...detail };
  if (!online)
    return { playing: false, final: true, reason: "screen_offline", ...detail };
  if (upgrade?.state === "failed")
    return { playing: false, final: true, reason: "playback_failed", ...detail };
  return { playing: false, final: false, reason: "playback_pending", ...detail };
}
async function awaitPlayback(options) {
  const started = options.runtime.now().getTime();
  let screen = options.screen;
  let reported = null;
  for (; ; ) {
    const { final, ...playback } = playbackOf(screen, options.playlist);
    const waited_ms = options.runtime.now().getTime() - started;
    if (!playback.playing && playback.state !== reported)
      options.progress?.("assigned", reported = playback.state);
    if (final || waited_ms + options.wait.pollMs > options.wait.timeoutMs)
      return { ...playback, waited_ms };
    await options.runtime.sleep(options.wait.pollMs);
    screen = (await options.client.call({ method: "GET", path: "/api/screens/".concat(options.screenId) })).body;
  }
}
async function publishScreen(options) {
  const { client, screenId, document } = options;
  const expected = options.revision === void 0 ? void 0 : Number(options.revision.replaceAll('"', ""));
  const project = (await client.call({ method: "GET", path: "/api/project" })).body;
  if (typeof project?.id !== "string" || project.id.length === 0)
    throw usageError("Project identity is missing.");
  const pages = document.pages;
  if (Array.isArray(pages) && pages.some(isAdSlotPage)) {
    await requireCapability(client, "signage.publish", "screen publish with adslot pages", {
      command: "screenrig project capabilities",
      reason: "Read the project's effective capabilities before publishing an ad-bearing playlist; an advertising-only project cannot publish playlists."
    });
  }
  const fingerprint = digest(JSON.stringify([options.apiUrl, project.id, screenId, expected, document, options.requestedKey ?? ""]));
  const directory = path.join(path.dirname(options.configPath), "publishes");
  await mkdir(directory, { recursive: true, mode: 448 });
  const journalPath = path.join(directory, "".concat(fingerprint, ".json"));
  const lockPath = "".concat(journalPath, ".lock");
  for (let attempt = 0; ; attempt++) {
    try {
      await mkdir(lockPath, { mode: 448 });
      await writeFile(path.join(lockPath, "pid"), String(process.pid), { mode: 384 });
      break;
    } catch (error) {
      if (error.code !== "EEXIST")
        throw error;
      let dead = false;
      try {
        const pid = Number(await readFile(path.join(lockPath, "pid"), "utf8"));
        if (Number.isSafeInteger(pid) && pid > 0) {
          try {
            process.kill(pid, 0);
          } catch (probe) {
            dead = probe.code === "ESRCH";
          }
        }
      } catch {
      }
      if (!dead || attempt > 0)
        throw usageError("Publish is already running or has an incomplete lock at ".concat(lockPath, ". Confirm no publisher is running before removing an incomplete lock."));
      const abandoned = "".concat(lockPath, ".").concat(randomUUID(), ".stale");
      try {
        await rename(lockPath, abandoned);
        await rm(abandoned, { recursive: true, force: true });
      } catch {
        throw usageError("Publish lock changed; retry the same command.");
      }
    }
  }
  let state;
  const save = async () => {
    const temporary = "".concat(journalPath, ".").concat(randomUUID(), ".tmp");
    const file = await open(temporary, "wx", 384);
    try {
      await file.writeFile(JSON.stringify(state) + "\n");
      await file.sync();
    } finally {
      await file.close();
    }
    await rename(temporary, journalPath);
  };
  try {
    try {
      const info = await stat(journalPath);
      if ((info.mode & 63) !== 0)
        throw usageError("Publish journal must be private.");
      state = JSON.parse(await readFile(journalPath, "utf8"));
      if (state?.version !== 1 || state.fingerprint !== fingerprint || !Number.isFinite(state.created_at) || !state.create_key || !state.assign_key)
        throw usageError("Publish journal is invalid.");
      if (state.playlist)
        resource(state.playlist, "playlist");
      if (state.warnings !== void 0 && (!Array.isArray(state.warnings) || state.warnings.some((item) => typeof item?.code !== "string" || typeof item.message !== "string")))
        throw usageError("Publish journal is invalid.");
      if (state.reviews !== void 0 && (!Array.isArray(state.reviews) || state.reviews.some((review) => typeof review?.id !== "string" || typeof review.url !== "string")))
        throw usageError("Publish journal is invalid.");
    } catch (error) {
      if (error.code !== "ENOENT")
        throw error;
    }
    const noteHeaders = reviewNoteHeaders(options.note);
    const pendingResult = (reviews) => {
      options.progress?.("pending_review");
      return {
        playlist_id: state.playlist.id,
        playlist_revision: state.playlist.revision,
        screen_id: screenId,
        stage: "pending_review",
        assignment_verified: false,
        playback_verified: false,
        reviews,
        journal: journalPath,
        ...state.warnings?.length ? { warnings: state.warnings } : {}
      };
    };
    if (state?.proposed && state.playlist) {
      const current = resource((await client.call({ method: "GET", path: "/api/screens/".concat(screenId) })).body, "screen");
      if (current.id === screenId && current.playlist_id === state.playlist.id) {
        state.assigned = true;
        state.proposed = void 0;
        await save();
      } else {
        const reviews = [];
        for (const review of state.reviews ?? []) {
          const latest = (await client.call({ method: "GET", path: "/api/reviews/".concat(encodeURIComponent(review.id)) })).body;
          reviews.push({ ...review, state: typeof latest?.state === "string" ? latest.state : review.state });
        }
        const waiting = reviews.some((review) => review.state === "pending") && reviews.every((review) => review.state === "pending" || review.state === "approved");
        if (waiting) {
          state.reviews = reviews;
          await save();
          return pendingResult(reviews);
        }
        await rm(journalPath, { force: true });
        state = void 0;
      }
    }
    const resumed = state !== void 0;
    let alreadyPublished = false;
    if (state?.assigned && state.playlist) {
      const current = resource((await client.call({ method: "GET", path: "/api/screens/".concat(screenId) })).body, "screen");
      if (current.id === screenId && current.playlist_id === state.playlist.id)
        alreadyPublished = true;
      else {
        await rm(journalPath, { force: true });
        state = void 0;
      }
    }
    if (resumed && state && !state.assigned && state.playlist) {
      const current = resource((await client.call({ method: "GET", path: "/api/screens/".concat(screenId) })).body, "screen");
      if (current.id === screenId && current.playlist_id === state.playlist.id) {
        state.assigned = true;
        await save();
      } else if (expected !== void 0 && current.revision !== expected) {
        staleRevision("Screen changed since this publish created its playlist. Inspect it and reconcile before assigning.", current.revision);
      }
    }
    if (!state) {
      const screen2 = resource((await client.call({ method: "GET", path: "/api/screens/".concat(screenId) })).body, "screen");
      if (screen2.id !== screenId)
        throw usageError("Screen response identity did not match.");
      if (expected !== void 0 && screen2.revision !== expected)
        staleRevision("Screen changed before publishing. Inspect it and retry with its intended revision.", screen2.revision);
      if (playlistNeedsTimezone(document) && !screen2.timezone)
        throw usageError("Set the screen timezone before publishing a scheduled playlist.");
      state = { version: 1, created_at: options.runtime.now().getTime(), fingerprint, create_key: newIdempotencyKey(), assign_key: newIdempotencyKey() };
      await save();
    }
    const proposal = (response) => {
      const pending = pendingReviewOf(response);
      if (!pending)
        return void 0;
      const { id, kind, state: reviewState, url } = pending.review;
      state.reviews = [...(state.reviews ?? []).filter((review) => review.id !== id), { id, kind, state: reviewState, url }];
      return pending;
    };
    if (!state.assigned && options.runtime.now().getTime() - state.created_at >= 24 * 60 * 60 * 1e3) {
      throw usageError("The publish replay window has expired. Inspect the project and screen before reconciling; this command will not repeat an ambiguous write after server idempotency expiry.");
    }
    if (!state.playlist) {
      await validatePlaylistCards(client, document);
      const response = await client.call({ method: "POST", path: "/api/playlists", body: document, headers: noteHeaders, idempotent: true, idempotencyKey: state.create_key });
      const pending = proposal(response);
      state.playlist = resource(pending ? pending.playlist : response.body, "playlist");
      state.playlist = { id: state.playlist.id, revision: state.playlist.revision };
      const warnings = playlistWarningItems((pending ?? response.body)?.warnings);
      if (warnings.length)
        state.warnings = warnings;
      await save();
    }
    if (!state.assigned) {
      const response = await client.call({ method: "PATCH", path: "/api/screens/".concat(screenId), body: { playlist_id: state.playlist.id }, headers: { ...noteHeaders, ...options.revision ? { "if-match": quotedRevision(options.revision) } : {} }, idempotent: true, idempotencyKey: state.assign_key });
      if (proposal(response)) {
        state.proposed = true;
        await save();
        return pendingResult(state.reviews);
      }
      state.assigned = true;
      await save();
    }
    const screen = resource((await client.call({ method: "GET", path: "/api/screens/".concat(screenId) })).body, "screen");
    if (screen.id !== screenId || screen.playlist_id !== state.playlist.id)
      conflict("The screen no longer has this playlist assigned. Inspect it before making another change.", screen.revision);
    const playback = options.wait ? await awaitPlayback({ client, runtime: options.runtime, screenId, playlist: state.playlist, screen, wait: options.wait, progress: options.progress }) : { playing: false, reason: "not_waited", online: screen.online === true, waited_ms: 0 };
    if (playback.playing)
      options.progress?.("playing", playback.state);
    return {
      playlist_id: state.playlist.id,
      playlist_revision: state.playlist.revision,
      screen_id: screenId,
      screen_revision: screen.revision,
      stage: playback.playing ? "playing" : "assigned",
      assignment_verified: true,
      playback_verified: playback.playing,
      playback,
      journal: journalPath,
      ...alreadyPublished ? { already_published: true } : {},
      ...state.warnings?.length ? { warnings: state.warnings } : {}
    };
  } catch (error) {
    if (error instanceof CliError) {
      error.problem.errors.push({ stage: state?.assigned ? "verify" : state?.playlist ? "assign" : "create", playlist_id: state?.playlist?.id, journal: journalPath });
      const api = new URL(options.apiUrl);
      api.username = "";
      api.password = "";
      api.search = "";
      api.hash = "";
      const context = ["--config", options.configPath, "--api-url", api.toString().replace(/\/+$/, "")];
      if (!error.problem.next)
        error.problem.next = {
          command: "screenrig screen show ".concat(screenId),
          argv: ["screen", "show", screenId, ...context],
          reason: "Inspect the target using argv to preserve the selected configuration and API. After a transport failure, repeat the identical publish command to resume; revision conflicts require reconciliation. The journal records any playlist already created."
        };
      if (error.problem.code === "revision_conflict" && state?.playlist && !state.assigned) {
        error.problem.next = {
          command: "screenrig screen show ".concat(screenId),
          argv: ["screen", "show", screenId, ...context],
          reason: "Inspect the current screen and reconcile concurrent changes before assigning the playlist already created. Do not rerun publish with a new revision: that starts a new publish and can create another playlist.",
          after_inspection: {
            command: "screenrig screen assign ".concat(screenId, " --playlist-id ").concat(state.playlist.id, " --expect-rev <REVIEWED_REVISION>"),
            argv: ["screen", "assign", screenId, "--playlist-id", state.playlist.id, "--expect-rev", "<REVIEWED_REVISION>", ...context],
            reason: "Only if this assignment is still intended, replace <REVIEWED_REVISION> with the revision from the inspected screen. Use argv to preserve the configuration and API. The conflict response revision is not approval to overwrite concurrent changes."
          }
        };
      }
    }
    throw error;
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}

// dist/screen-display.js
var screen_display_exports = {};
__export(screen_display_exports, {
  DISPLAY_WINDOWS_MAX: () => DISPLAY_WINDOWS_MAX,
  displayLines: () => displayLines,
  displayPower: () => displayPower,
  displayProblem: () => displayProblem,
  displayScheduleWrite: () => displayScheduleWrite,
  displayUntil: () => displayUntil,
  playPageProblem: () => playPageProblem,
  rebootProblem: () => rebootProblem,
  rebootScheduleLines: () => rebootScheduleLines,
  rebootScheduleProblem: () => rebootScheduleProblem,
  rebootScheduleWrite: () => rebootScheduleWrite,
  rebootWindowList: () => rebootWindowList,
  rebootWindowOption: () => rebootWindowOption,
  untilOption: () => untilOption
});
var DISPLAY_WINDOWS_MAX = 16;
function displayScheduleError(path3, message) {
  return usageError("Display schedule file: ".concat(path3, " ").concat(message), {
    command: "screenrig screen display-schedule set --help",
    reason: 'The file is {"enabled": true, "windows": [{"days": [...], "start"?, "end"?}]}: the windows when the display is ON, in the screen timezone.'
  });
}
function rebootScheduleError(path3, message) {
  return usageError("Reboot schedule file: ".concat(path3, " ").concat(message), {
    command: "screenrig screen reboot-schedule set --help",
    reason: 'The file is {"enabled": true, "windows": [{"days": [...], "start"?, "end"?}]}: the windows in which the screen reboots, at the start of each, in the screen timezone.'
  });
}
function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
function scheduleWrite(document, kind) {
  let value = document;
  const envelope = record(value);
  if (envelope && envelope.ok === true && record(envelope.data))
    value = envelope.data;
  const view = record(value);
  if (view && kind.member in view)
    value = view[kind.member];
  const object = record(value);
  if (!object) {
    throw usageError("".concat(kind.noun, ' file: must be an object {"enabled": true, "windows": [...]}. To remove a schedule, run ').concat(kind.group, " clear."), {
      command: "screenrig ".concat(kind.group, " clear <id>"),
      reason: "Clearing is its own command."
    });
  }
  const extra = Object.keys(object).find((key) => !["enabled", "windows", "updated_at"].includes(key));
  if (extra !== void 0)
    throw kind.fail("document", "has unknown field ".concat(JSON.stringify(extra).slice(0, 80), "; allowed: enabled, windows."));
  if (typeof object.enabled !== "boolean")
    throw kind.fail("enabled", "must be true or false (false keeps the windows and ".concat(kind.disabled, ")."));
  const windows = object.windows;
  if (!Array.isArray(windows) || windows.length < 1 || windows.length > DISPLAY_WINDOWS_MAX) {
    throw kind.fail("windows", "must list 1 to ".concat(DISPLAY_WINDOWS_MAX, " windows."));
  }
  const parsed = windows.map((item, index) => scheduleWindow(item, "windows[".concat(index, "]"), kind.fail));
  return {
    enabled: object.enabled,
    windows: parsed.map((item) => ({ days: item.days, ...item.start !== void 0 ? { start: item.start, end: item.end } : {} }))
  };
}
function displayScheduleWrite(document) {
  return scheduleWrite(document, { member: "display_schedule", noun: "Display schedule", group: "screen display-schedule", fail: displayScheduleError, disabled: "leaves the display on" });
}
function rebootScheduleWrite(document) {
  return scheduleWrite(document, { member: "reboot_schedule", noun: "Reboot schedule", group: "screen reboot-schedule", fail: rebootScheduleError, disabled: "reboots nothing" });
}
function displayPower(value) {
  if (value === "on" || value === "off")
    return value;
  throw usageError("screen display requires the power: --power on or --power off (or a trailing on|off).");
}
var DISPLAY_FOR_MAX_MS = 7 * 24 * 60 * 60 * 1e3 - 6e4;
function displayUntil(until, forValue, now) {
  if (until !== void 0 && forValue !== void 0)
    throw usageError("Use --until or --for, not both.");
  if (forValue !== void 0) {
    let ms;
    try {
      ms = durationMs(forValue);
    } catch {
      throw usageError("--for takes a duration such as 30m, 2h, 1h30m, or 3d, under 7 days (at most 6d23h59m, leaving a minute for clock differences with the server).");
    }
    if (ms > DISPLAY_FOR_MAX_MS)
      throw usageError("--for must be at most 6d23h59m.");
    return new Date(now.getTime() + ms).toISOString().replace(/\.\d{3}Z$/, "Z");
  }
  if (until === void 0)
    return void 0;
  const normalized = normalizeInstant(until);
  if (normalized === void 0) {
    throw usageError("--until takes an RFC 3339 instant with seconds and an offset, such as 2026-09-26T18:00:00Z or 2026-09-26T11:00:00-07:00, strictly in the future and at most 7 days ahead.");
  }
  return normalized;
}
function untilOption(value) {
  if (normalizeInstant(value) === void 0)
    displayUntil(value, void 0, /* @__PURE__ */ new Date());
  return value;
}
function displayLines(display, timezone) {
  if (!display || typeof display !== "object" || display.requested !== "on" && display.requested !== "off")
    return [];
  const source = display.source === "override" ? "manual override" : display.source === "schedule" ? "display schedule" : "default";
  const until = typeof display.until === "string" ? " until ".concat(instantInZone(display.until, timezone)) : display.source === "override" ? " until replaced" : "";
  const lines = ["Display: ".concat(display.requested, " (").concat(source).concat(until, ")")];
  const schedule = display.schedule;
  if (schedule && Array.isArray(schedule.windows)) {
    lines.push("Display schedule: ".concat(schedule.enabled ? "enabled" : "disabled (display stays on)", ", ").concat(schedule.windows.length, " window").concat(schedule.windows.length === 1 ? "" : "s").concat(timezone ? " in ".concat(timezone) : ""));
    for (const window of schedule.windows) {
      lines.push("  ".concat(window.days.join(","), " ").concat(window.start !== void 0 ? "".concat(window.start, "-").concat(window.end) : "all day"));
    }
  }
  const reported = display.reported;
  if (reported && typeof reported.reported_at === "string") {
    const parts = [
      reported.power ? "power ".concat(reported.power) : void 0,
      reported.connected === true ? "connected" : reported.connected === false ? "disconnected" : void 0
    ].filter(Boolean).join(", ");
    lines.push("Display reported: ".concat(parts || "no power state", " at ").concat(reported.reported_at).concat(reported.stale ? " (stale: no report for over 35 minutes)" : ""));
  }
  return lines;
}
var REBOOT_WINDOW_MIN_MINUTES = 5;
function windowMinutes(window) {
  if (window.start === void 0 || window.end === void 0)
    return 24 * 60;
  const clock = (text) => Number(text.slice(0, 2)) * 60 + Number(text.slice(3, 5));
  const length = (clock(window.end) - clock(window.start) + 24 * 60) % (24 * 60);
  return length === 0 ? 24 * 60 : length;
}
function rebootWindowOption(value, previous) {
  const window = campaignWindow(value, "--window");
  if (windowMinutes(window) < REBOOT_WINDOW_MIN_MINUTES) {
    throw usageError("--window ".concat(JSON.stringify(value), ": a reboot window lasts 5 minutes to 24 hours; the reboot goes out at its start."));
  }
  const specs = [...previous ? previous.split(";") : [], campaignWindowSpec(window)];
  if (specs.length > CAMPAIGN_WINDOWS_MAX)
    throw usageError("--window accepts at most ".concat(CAMPAIGN_WINDOWS_MAX, " windows."));
  return specs.join(";");
}
function rebootWindowList(accumulated) {
  return accumulated.split(";").map((spec) => campaignWindow(spec));
}
function windowText(window) {
  return "".concat(window.days.join(","), " ").concat(window.start !== void 0 ? "".concat(window.start, "-").concat(window.end) : "all day");
}
function rebootScheduleLines(schedule, nextRebootAt, timezone) {
  if (!schedule || !Array.isArray(schedule.windows))
    return [];
  const lines = ["Reboot schedule: ".concat(schedule.enabled ? "enabled" : "disabled (no reboots)", ", ").concat(schedule.windows.length, " window").concat(schedule.windows.length === 1 ? "" : "s").concat(timezone ? " in ".concat(timezone) : "")];
  for (const window of schedule.windows)
    lines.push("  ".concat(windowText(window)));
  if (typeof nextRebootAt === "string" && nextRebootAt)
    lines.push("Next reboot: ".concat(instantInZone(nextRebootAt, timezone)));
  return lines;
}
function rebootScheduleProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  if (error.problem.code === "reboot_unsupported") {
    return new CliError({
      ...error.problem,
      detail: "".concat(error.problem.detail, " Nothing was stored. A reboot schedule needs a Player that declares the reboot capability in its host report (screen show lists host capabilities); this device's Player did not."),
      next: { command: "screenrig screen show ".concat(id), reason: "Check the host capabilities. A schedule can be set once the Player declares reboot." }
    }, error.exitCode, error.warnings);
  }
  if (error.problem.code === "invalid_request" && /timezone/i.test(error.problem.detail)) {
    return new CliError({
      ...error.problem,
      next: { command: "screenrig screen set-timezone ".concat(id, " --timezone ZONE"), reason: "A reboot schedule reads its windows in the screen's timezone. Set it first, then rerun." }
    }, error.exitCode, error.warnings);
  }
  return rebootProblem(error, id);
}
function rebootProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  if (error.problem.code === "reboot_unsupported") {
    return new CliError({
      ...error.problem,
      detail: "".concat(error.problem.detail, " Nothing was sent. A reboot reaches only a Player that declares the reboot capability in its host report (screen show lists host capabilities); this device's Player did not."),
      next: { command: "screenrig screen show ".concat(id), reason: "Check the host capabilities. To refresh content without a device reboot, run screen reload." }
    }, error.exitCode, error.warnings);
  }
  if (error.problem.code === "resource_conflict") {
    return new CliError({
      ...error.problem,
      next: { command: "screenrig screen show ".concat(id), reason: "A screen still waiting to pair has no Player to reboot. Pair it first." }
    }, error.exitCode, error.warnings);
  }
  if (error.problem.code === "screen_archived") {
    return new CliError({
      ...error.problem,
      next: { command: "screenrig screen unarchive ".concat(id), reason: "An archived screen refuses reboot and display control. Unarchive it first if it should play again." }
    }, error.exitCode, error.warnings);
  }
  return error;
}
function playPageProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  if (error.problem.code === "page_not_on_screen") {
    return new CliError({
      ...error.problem,
      next: { command: "screenrig screen show ".concat(id), reason: "The page must belong to the playlist the screen is playing now (its takeover, else a campaign that holds, else its schedule, else its assigned playlist). The detail names that playlist; use one of its page ids." }
    }, error.exitCode, error.warnings);
  }
  if (error.problem.code === "play_page_unsupported") {
    return new CliError({
      ...error.problem,
      detail: "".concat(error.problem.detail, " Nothing was sent. Only a Player that declares the play_page capability in its host report starts a page on demand; update this device's Player."),
      next: { command: "screenrig screen show ".concat(id), reason: "Check the host capabilities. Update the Player, then run the command again." }
    }, error.exitCode, error.warnings);
  }
  if (error.problem.code === "resource_conflict") {
    return new CliError({
      ...error.problem,
      next: { command: "screenrig screen show ".concat(id), reason: "A screen still waiting to pair has no Player to start a page. Pair it first." }
    }, error.exitCode, error.warnings);
  }
  if (error.problem.code === "screen_archived") {
    return new CliError({
      ...error.problem,
      next: { command: "screenrig screen unarchive ".concat(id), reason: "An archived screen refuses page control. Unarchive it first if it should play again." }
    }, error.exitCode, error.warnings);
  }
  return error;
}
function displayProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  if (error.problem.code === "resource_conflict") {
    return new CliError({
      ...error.problem,
      next: { command: "screenrig screen show ".concat(id), reason: "This screen has no paired Player yet, so there is no display to turn on or off. Pair it first; a display schedule can be set before pairing." }
    }, error.exitCode, error.warnings);
  }
  return rebootProblem(error, id);
}

// dist/screen-commands.js
var screen_commands_exports = {};
__export(screen_commands_exports, {
  COMMAND_EXPIRES_MAX_S: () => COMMAND_EXPIRES_MAX_S,
  COMMAND_EXPIRES_MIN_S: () => COMMAND_EXPIRES_MIN_S,
  IDENTIFY_DURATION_MAX_MS: () => IDENTIFY_DURATION_MAX_MS,
  IDENTIFY_DURATION_MIN_MS: () => IDENTIFY_DURATION_MIN_MS,
  MAINTENANCE: () => MAINTENANCE,
  SUSPEND_MESSAGE_MAX: () => SUSPEND_MESSAGE_MAX,
  boundedSeconds: () => boundedSeconds,
  commandCancelProblem: () => commandCancelProblem,
  commandLines: () => commandLines,
  commandResultText: () => commandResultText,
  expiresInOption: () => expiresInOption,
  expiresInSeconds: () => expiresInSeconds,
  identifyDurationMs: () => identifyDurationMs,
  identifyDurationOption: () => identifyDurationOption,
  identifyProblem: () => identifyProblem,
  maintenanceProblem: () => maintenanceProblem,
  replaceProblem: () => replaceProblem,
  replacedByLines: () => replacedByLines,
  suspendMessage: () => suspendMessage,
  suspendMessageOption: () => suspendMessageOption,
  suspendProblem: () => suspendProblem,
  suspensionLines: () => suspensionLines
});
var COMMAND_EXPIRES_MIN_S = 60;
var COMMAND_EXPIRES_MAX_S = 24 * 60 * 60;
var IDENTIFY_DURATION_MIN_MS = 2e3;
var IDENTIFY_DURATION_MAX_MS = 6e5;
var SUSPEND_MESSAGE_MAX = 280;
var DURATION = /^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/;
function durationSeconds(value) {
  const text = value.trim();
  const match = text ? DURATION.exec(text) : null;
  if (!match)
    return void 0;
  const total = Number(match[1] ?? 0) * 86400 + Number(match[2] ?? 0) * 3600 + Number(match[3] ?? 0) * 60 + Number(match[4] ?? 0);
  return Number.isFinite(total) && total > 0 ? total : void 0;
}
function boundedSeconds(flag, value, min, max, forms, bounds) {
  const total = durationSeconds(value);
  if (total === void 0)
    throw usageError("".concat(flag, " takes a duration with a unit, such as ").concat(forms, ", from ").concat(bounds, "."));
  if (total < min || total > max)
    throw usageError("".concat(flag, " must be from ").concat(bounds, "."));
  return total;
}
function expiresInSeconds(value) {
  return boundedSeconds("--expires-in", value, COMMAND_EXPIRES_MIN_S, COMMAND_EXPIRES_MAX_S, "90s, 30m, 2h, or 1d", "60s to 24h");
}
function expiresInOption(value) {
  expiresInSeconds(value);
  return value;
}
function identifyDurationMs(value) {
  return boundedSeconds("--duration", value, IDENTIFY_DURATION_MIN_MS / 1e3, IDENTIFY_DURATION_MAX_MS / 1e3, "30s, 2m, or 1m30s", "2s to 10m") * 1e3;
}
function identifyDurationOption(value) {
  identifyDurationMs(value);
  return value;
}
function suspendMessage(value) {
  const trimmed = value.trim();
  const length = [...trimmed].length;
  if (length < 1 || length > SUSPEND_MESSAGE_MAX || /[^\P{Cc}\n]/u.test(trimmed)) {
    throw usageError("--message must be 1 to ".concat(SUSPEND_MESSAGE_MAX, " characters, and line feed is the only control character."));
  }
  return trimmed;
}
function suspendMessageOption(value) {
  suspendMessage(value);
  return value;
}
function instant2(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T[0-9:.]+(?:Z|[+-]\d{2}:\d{2})$/i.test(value) && !Number.isNaN(Date.parse(value)) ? value : void 0;
}
var MAINTENANCE = {
  "clear-cache": {
    name: "clear-cache",
    type: "clear_cache",
    route: "clear-cache",
    title: "Clear cache",
    effect: "The Player deletes its downloaded media, application packages and data caches, keeps its pairing and settings, then fetches the manifest and content again; the screen can show its loading state while content refills.",
    fleetWarning: "each cleared screen downloads its content again."
  },
  "restart-app": {
    name: "restart-app",
    type: "restart_app",
    route: "restart-app",
    title: "Restart app",
    effect: "The Player restarts its application, not the device, and reports from the restarted process.",
    fleetWarning: "each restarted Player is dark until its application is back."
  },
  "update-software": {
    name: "update-software",
    type: "update",
    route: "update",
    title: "Update software",
    effect: "The Player checks for the newest Player release now and installs it; a Player that restarts to install reports from the new version.",
    fleetWarning: "each updating Player may restart."
  }
};
function commandResultText(kind, result) {
  const expires = instant2(result?.expires_at);
  if (!expires)
    return void 0;
  const state = result?.state === "queued" || result?.state === "sent" ? "".concat(result.state, ", ") : "";
  return "".concat(kind, " ").concat(state, "expires ").concat(expires);
}
var COMMAND_STATES = /* @__PURE__ */ new Set(["queued", "sent", "done", "failed", "expired", "cancelled", "superseded"]);
var COMMAND_TYPES = /* @__PURE__ */ new Set(["reboot", "reload", "clear_cache", "restart_app", "update"]);
var COMMAND_ID = /^[A-Za-z0-9_-]{8,64}$/;
var COMMAND_CAUSE = /^[a-z0-9_]{1,40}$/;
var COMMAND_DETAIL_MAX = 200;
function commandLines(screen) {
  const commands = screen?.commands;
  if (!Array.isArray(commands))
    return [];
  const rows = [];
  const notes = [];
  for (const item of commands) {
    const command = item ?? {};
    const { type, state, id } = command;
    if (typeof type !== "string" || !COMMAND_TYPES.has(type) || typeof state !== "string" || !COMMAND_STATES.has(state) || typeof id !== "string" || !COMMAND_ID.test(id))
      continue;
    const cause = typeof command.cause === "string" && COMMAND_CAUSE.test(command.cause) ? command.cause : "";
    rows.push([type, id, state, instant2(command.expires_at) ?? "", instant2(command.sent_at) ?? "", instant2(command.done_at) ?? "", cause, command.source === "schedule" ? "schedule" : ""]);
    const detail = typeof command.detail === "string" ? plainText(command.detail).trim().slice(0, COMMAND_DETAIL_MAX) : "";
    if (detail)
      notes.push("".concat(id, " ").concat(state).concat(cause ? " (".concat(cause, ")") : "", ": ").concat(detail));
  }
  if (!rows.length)
    return [];
  const withCause = rows.some((row) => row[6] !== "");
  const withSource = rows.some((row) => row[7] !== "");
  const header = ["TYPE", "ID", "STATE", "EXPIRES", "SENT", "DONE", ...withCause ? ["CAUSE"] : [], ...withSource ? ["SOURCE"] : []];
  for (const row of rows) {
    const [cause, source] = [row[6], row[7] || "manual"];
    row.length = 6;
    if (withCause)
      row.push(cause);
    if (withSource)
      row.push(source);
  }
  const widths = header.map((cell, index) => Math.max(cell.length, ...rows.map((row) => row[index].length)));
  const render = (row) => row.map((cell, index) => cell.padEnd(widths[index])).join("  ").trimEnd();
  const queued = rows.find((row) => row[2] === "queued");
  const screenId = typeof screen?.id === "string" && screen.id ? screen.id : "<id>";
  return [
    "Commands",
    render(header),
    ...rows.map(render),
    ...notes,
    ...queued ? ["".concat(queued[1], " is queued: it is sent when the screen comes online before it expires. Cancel it with screen command cancel ").concat(screenId, " ").concat(queued[1], ".")] : []
  ];
}
function maintenanceProblem(error, id, spec) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  if (error.problem.code === "command_unsupported") {
    return guided(error, { command: "screenrig screen show ".concat(id), reason: "Check the host capabilities. screen ".concat(spec.name, " reaches only a Player that declares ").concat(spec.type, "; to refresh content on any screen run screen reload.") }, "".concat(error.problem.detail, " Nothing was sent. A Player that does not declare the ").concat(spec.type, " capability in its host report (screen show lists host capabilities) cannot do this; this device's Player did not."));
  }
  if (error.problem.code === "resource_conflict") {
    return guided(error, { command: "screenrig screen show ".concat(id), reason: "A screen still waiting to pair has no Player for ".concat(spec.name, ". Pair it first.") });
  }
  if (error.problem.code === "screen_archived") {
    return guided(error, { command: "screenrig screen unarchive ".concat(id), reason: "An archived screen refuses ".concat(spec.name, ". Unarchive it first if it should play again.") });
  }
  return error;
}
function suspensionLines(screen) {
  const suspension = screen?.suspension;
  if (!suspension || typeof suspension.message !== "string" || !suspension.message)
    return [];
  const since = instant2(suspension.since);
  const screenId = typeof screen?.id === "string" && screen.id ? screen.id : "<id>";
  return [
    "Suspended".concat(since ? " since ".concat(since) : "", ": ").concat(plainText(suspension.message)),
    "The screen shows this notice instead of its content; its playlist, schedule and settings are unchanged. screen resume ".concat(screenId, " ends it.")
  ];
}
function replacedByLines(screen) {
  const target = screen?.replaced_by;
  if (typeof target !== "string" || !isResourceID(target, "screen"))
    return [];
  return ["Replaced by ".concat(target, ": its device now opens that screen, and a browser that still opens this screen's public URL plays that screen.")];
}
function guided(error, next, detail) {
  return new CliError({ ...error.problem, ...detail === void 0 ? {} : { detail }, next }, error.exitCode, error.warnings);
}
function identifyProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  if (error.problem.code === "identify_unsupported") {
    return guided(error, { command: "screenrig screen show ".concat(id), reason: "Check the host capabilities. Update the Player, then run the command again; screen toast shows the screen's name meanwhile." }, "".concat(error.problem.detail, " Nothing was sent. Only a Player that declares the identify capability in its host report shows the overlay; update this device's Player, or show the name with screen toast."));
  }
  if (error.problem.code === "resource_conflict") {
    return guided(error, { command: "screenrig screen show ".concat(id), reason: "A screen still waiting to pair has no Player to show an overlay. Pair it first." });
  }
  if (error.problem.code === "screen_archived") {
    return guided(error, { command: "screenrig screen unarchive ".concat(id), reason: "An archived screen refuses identify. Unarchive it first if it should play again." });
  }
  return error;
}
function suspendProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next || error.problem.code !== "screen_archived")
    return error;
  return guided(error, { command: "screenrig screen unarchive ".concat(id), reason: "An archived screen is already dark and refuses suspend and resume. Unarchive it first if it should show content or a notice again." });
}
function replaceProblem(error, id, withId) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  if (error.problem.code === "wall_unsupported")
    return wallProblem(error, withId);
  if (error.problem.code === "resource_conflict" || error.problem.code === "screen_archived") {
    return guided(error, {
      command: "screenrig screen show ".concat(withId),
      reason: "Replace needs two active screens with a paired Player: ".concat(id, ", which keeps its settings, and ").concat(withId, ", whose device takes over. Check both with screen show; a screen still waiting to pair has no Player yet. An archived screen is refused, and one archived as replaced cannot be restored.")
    });
  }
  return error;
}
function commandCancelProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  if (error.problem.code === "resource_conflict") {
    return guided(error, { command: "screenrig screen show ".concat(id), reason: "commands lists each command's state. Only a queued command can be cancelled: a command that was sent is done or failed once the Player reports (a reboot is done once the device reports it booted), and a command that expired, was cancelled or was superseded is no longer queued." });
  }
  if (error.problem.code === "not_found" && /command/i.test(error.problem.detail)) {
    return guided(error, { command: "screenrig screen show ".concat(id), reason: "commands lists the screen's recent commands; the id is the one listed there, or the reboot_id, reload_id or command_id the request answered with." });
  }
  return error;
}

// dist/screen-glass.js
var screen_glass_exports = {};
__export(screen_glass_exports, {
  flatFrameNote: () => flatFrameNote,
  frameRow: () => frameRow,
  glassLines: () => glassLines
});
function instant3(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T[0-9:.]+(?:Z|[+-]\d{2}:\d{2})$/i.test(value) && !Number.isNaN(Date.parse(value)) ? value : void 0;
}
function minutes(seconds) {
  const whole = Math.max(1, Math.round(seconds / 60));
  return whole >= 120 ? "".concat(Math.round(whole / 60), " hours") : "".concat(whole, " minute").concat(whole === 1 ? "" : "s");
}
function glassLines(screen) {
  return [...playbackLines(screen), ...pictureLines(screen)];
}
function playbackLines(screen) {
  const playback = screen?.glass?.playback;
  if (!playback || playback.verdict !== "stalled")
    return [];
  const since = instant3(playback.since);
  const last = instant3(playback.last_media_start_at);
  const allowed = typeof playback.threshold_s === "number" && Number.isFinite(playback.threshold_s) && playback.threshold_s > 0 ? playback.threshold_s : void 0;
  const screenId = screenIdOf(screen);
  return [
    "Playlist stalled".concat(since ? " since ".concat(since) : "", ": no media start has reached ScreenRig").concat(allowed ? " for more than ".concat(minutes(allowed)) : " for longer than the loop allows").concat(last ? " (the last was at ".concat(last, ")") : "", ", although the screen is online and its content is current."),
    "Look at the picture with screen screenshot ".concat(screenId, ", or restart the Player with screen reload ").concat(screenId, ". It clears when a media start arrives.")
  ];
}
function pictureLines(screen) {
  const picture = screen?.glass?.picture;
  if (!picture || picture.verdict !== "blank" && picture.verdict !== "frozen")
    return [];
  const since = instant3(picture.since);
  const screenId = screenIdOf(screen);
  const found = picture.verdict === "blank" ? "was one flat tone" : "was the same picture";
  return [
    "".concat(picture.verdict === "blank" ? "Blank screen" : "Frozen picture").concat(since ? " since ".concat(since) : "", ": every screenshot ScreenRig took over a run that covers the whole loop ").concat(found, ", although the screen is online and its content is current."),
    "Look at it with screen screenshot ".concat(screenId, ", or restart the Player with screen reload ").concat(screenId, ". It clears after two screenshots in a row that show a moving picture.")
  ];
}
function screenIdOf(screen) {
  return typeof screen?.id === "string" && screen.id ? screen.id : "<id>";
}
function frameRow(frame) {
  if (!frame || typeof frame.flat !== "boolean")
    return void 0;
  return frame.flat ? "flat (one tone)" : "not flat";
}
function flatFrameNote(frame, screen) {
  if (!frame || frame.flat !== true || screen?.glass?.picture?.verdict === "blank")
    return [];
  return ["This image is one flat tone. That alone is no verdict: a transition between pages, or a page that is black on purpose, looks the same. ScreenRig calls a screen blank (screen show, alerts) only when screenshots that cover its whole loop are all flat."];
}

// dist/screen-live.js
var screen_live_exports = {};
__export(screen_live_exports, {
  LIVE_DURATION_MAX_S: () => LIVE_DURATION_MAX_S,
  LIVE_DURATION_MIN_S: () => LIVE_DURATION_MIN_S,
  LIVE_POLL_MS: () => LIVE_POLL_MS,
  LIVE_WAIT_DEFAULT_MS: () => LIVE_WAIT_DEFAULT_MS,
  LIVE_WAIT_MAX_MS: () => LIVE_WAIT_MAX_MS,
  liveDurationOption: () => liveDurationOption,
  liveDurationSeconds: () => liveDurationSeconds,
  liveEndedError: () => liveEndedError,
  liveHumanLines: () => liveHumanLines,
  liveNotReadyWarning: () => liveNotReadyWarning,
  liveProblem: () => liveProblem,
  liveScreenId: () => liveScreenId,
  liveSessionBody: () => liveSessionBody,
  liveSettled: () => liveSettled,
  liveWaitMs: () => liveWaitMs,
  liveWaitOption: () => liveWaitOption,
  settleLive: () => settleLive
});
var LIVE_DURATION_MIN_S = 30;
var LIVE_DURATION_MAX_S = 300;
var LIVE_WAIT_DEFAULT_MS = 3e4;
var LIVE_WAIT_MAX_MS = 6e5;
var LIVE_POLL_MS = 1e3;
var LIVE_STATES = /* @__PURE__ */ new Set(["idle", "requested", "publishing", "ended"]);
function liveScreenId(value, command) {
  if (!value)
    throw usageError("screen live ".concat(command, " requires <id>."));
  if (!isResourceID(value, "screen")) {
    throw usageError("A screen id looks like scr_ followed by letters, digits, - or _.", {
      command: "screenrig screen list",
      reason: "List this project's screens and their ids."
    });
  }
  return value;
}
function liveDurationSeconds(value) {
  return boundedSeconds("--duration", value, LIVE_DURATION_MIN_S, LIVE_DURATION_MAX_S, "90s or 5m", "30s to 5m");
}
function liveDurationOption(value) {
  liveDurationSeconds(value);
  return value;
}
function liveWaitMs(value) {
  const text = value.trim();
  if (/^0[smhd]?$/.test(text))
    return 0;
  return boundedSeconds("--wait", text, 1, LIVE_WAIT_MAX_MS / 1e3, "30s or 1m", "1s to 10m, or 0 to return at once") * 1e3;
}
function liveWaitOption(value) {
  liveWaitMs(value);
  return value;
}
function liveSessionBody(body) {
  if (!body || typeof body !== "object")
    return void 0;
  const session = body;
  if (typeof session.state !== "string" || !LIVE_STATES.has(session.state) || typeof session.screen_id !== "string" || typeof session.viewer_url !== "string")
    return void 0;
  return session;
}
function liveSettled(session) {
  return session.publisher?.connected === true || session.state === "ended" || session.state === "idle";
}
async function settleLive(first, read, options) {
  const pollMs = options.pollMs ?? LIVE_POLL_MS;
  const deadline = options.now() + options.waitMs;
  let session = first;
  while (!liveSettled(session)) {
    const remaining = deadline - options.now();
    if (remaining <= 0)
      break;
    await options.sleep(Math.min(pollMs, remaining));
    session = await read();
  }
  return session;
}
var ENDED_SENTENCES = {
  stopped: "The session was stopped.",
  expired: "Nobody renewed the session, or it reached its five minutes.",
  consent_denied: "Someone at the screen declined to allow screen capture.",
  consent_timeout: "Nobody at the screen allowed screen capture in time. On Android, someone at the screen allows capture once each time the Player starts.",
  capture_failed: "The Player could not capture or encode the screen.",
  connection_failed: "The Player could not connect to the media relay.",
  player_stopped: "The Player stopped publishing."
};
function liveEndedError(session) {
  const reason = session.ended_reason;
  const detail = session.state === "ended" ? "The live session ended".concat(reason ? " (ended_reason ".concat(reason, ")") : "", ". ").concat((reason && ENDED_SENTENCES[reason]) ?? "The Player stopped publishing.") : "The live session is gone.";
  return new CliError(makeProblem("live_unavailable", "Live view is not available for this screen", 409, detail, {
    next: { command: "screenrig screen live start ".concat(session.screen_id), reason: "Start live view again; use screen screenshot for a still meanwhile." }
  }));
}
function liveNotReadyWarning(session) {
  return {
    code: "live_not_ready",
    message: session.state === "requested" ? "The Player has not started publishing yet. On Android, someone at the screen allows screen capture once each time the Player starts. Read screen live status again, or open viewer_url." : "The Player is publishing but has not reported connected yet. Read screen live status again, or open viewer_url."
  };
}
function liveProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  const guided2 = (next, detail) => new CliError({ ...error.problem, ...detail === void 0 ? {} : { detail }, next }, error.exitCode, error.warnings);
  switch (error.problem.code) {
    case "live_unsupported":
      return guided2({ command: "screenrig screen screenshot ".concat(id), reason: "This Player cannot publish live video. Update it to its current version; a screenshot shows the screen meanwhile." });
    case "live_unavailable":
      return guided2({ command: "screenrig screen show ".concat(id), reason: "Check the screen is online, then start live view again." });
    case "feature_unavailable":
      return guided2({ command: "screenrig screen screenshot ".concat(id), reason: "Live view is not configured on this server. A screenshot shows what the screen plays." });
    case "screen_archived":
      return guided2({ command: "screenrig screen unarchive ".concat(id), reason: "An archived screen shows nothing. Unarchive it first if it should play again." });
    default:
      return error;
  }
}
function liveHumanLines(session) {
  const lines = ["Live view of ".concat(session.screen_id, ": ").concat(session.state)];
  if (session.live_id)
    lines.push("live_id: ".concat(session.live_id));
  const publisher = session.publisher;
  if (publisher) {
    const size = publisher.width && publisher.height ? " ".concat(publisher.width, "x").concat(publisher.height).concat(publisher.fps ? " at ".concat(publisher.fps, " fps") : "") : "";
    lines.push("publisher: ".concat(publisher.connected ? "connected" : publisher.connection).concat(size));
  }
  if (session.lease_until)
    lines.push("lease_until: ".concat(session.lease_until));
  if (session.max_until)
    lines.push("max_until: ".concat(session.max_until));
  if (session.ended_reason)
    lines.push("ended_reason: ".concat(session.ended_reason));
  if (session.state !== "ended" && session.state !== "idle")
    lines.push("Watch it in the dashboard: ".concat(session.viewer_url));
  return lines.join("\n");
}

// dist/screen-live-frame.js
var screen_live_frame_exports = {};
__export(screen_live_frame_exports, {
  LIVE_FRAME_DURATION_DEFAULT_S: () => LIVE_FRAME_DURATION_DEFAULT_S,
  LIVE_FRAME_INTERVAL_DEFAULT_MS: () => LIVE_FRAME_INTERVAL_DEFAULT_MS,
  LIVE_FRAME_INTERVAL_MAX_S: () => LIVE_FRAME_INTERVAL_MAX_S,
  LIVE_FRAME_LEASE_MARGIN_S: () => LIVE_FRAME_LEASE_MARGIN_S,
  captureLiveFrames: () => captureLiveFrames,
  liveFrameFileName: () => liveFrameFileName,
  liveFrameIntervalMs: () => liveFrameIntervalMs,
  liveFrameIntervalOption: () => liveFrameIntervalOption,
  liveFrameLeaseSeconds: () => liveFrameLeaseSeconds,
  liveFrameProblem: () => liveFrameProblem,
  liveFramesBody: () => liveFramesBody,
  liveFramesHumanLines: () => liveFramesHumanLines,
  readLiveFrame: () => readLiveFrame,
  resolveFrameOutput: () => resolveFrameOutput
});
import { createHash as createHash2 } from "node:crypto";
import { mkdir as mkdir2, rename as rename2, rm as rm2, stat as stat2, writeFile as writeFile2 } from "node:fs/promises";
import path2 from "node:path";
var LIVE_FRAME_DURATION_DEFAULT_S = 120;
var LIVE_FRAME_LEASE_MARGIN_S = 30;
var LIVE_FRAME_INTERVAL_DEFAULT_MS = 1e3;
var LIVE_FRAME_INTERVAL_MAX_S = 300;
var LIVE_FRAME_MIN_STEP_MS = 1e3;
var LIVE_FRAME_STATES = /* @__PURE__ */ new Set(["starting", "streaming", "silent"]);
function liveFrameIntervalMs(value) {
  const text = value.trim();
  if (/^0[smhd]?$/.test(text))
    return 0;
  return boundedSeconds("--interval", text, 1, LIVE_FRAME_INTERVAL_MAX_S, "1s or 30s", "1s to 5m, or 0 to take each frame as it arrives") * 1e3;
}
function liveFrameIntervalOption(value) {
  liveFrameIntervalMs(value);
  return value;
}
function liveFrameLeaseSeconds(durationSeconds2, count, intervalMs) {
  const stepMs = Math.max(intervalMs, LIVE_FRAME_MIN_STEP_MS);
  const needed = Math.ceil(count * stepMs / 1e3) + LIVE_FRAME_LEASE_MARGIN_S;
  if (needed > LIVE_DURATION_MAX_S) {
    throw usageError("--count ".concat(count, " at --interval ").concat(Math.round(intervalMs / 1e3), "s needs a live session of ").concat(needed, "s, longer than the ").concat(LIVE_DURATION_MAX_S, "s a session can last. Lower --count or --interval."));
  }
  return Math.max(durationSeconds2 ?? LIVE_FRAME_DURATION_DEFAULT_S, needed);
}
async function resolveFrameOutput(cwd, output, count) {
  if (output === void 0)
    return { directory: path2.resolve(cwd) };
  const resolved = path2.resolve(cwd, output);
  const spelledAsDirectory = output.endsWith("/") || output.endsWith("\\");
  let isDirectory = spelledAsDirectory;
  try {
    isDirectory = (await stat2(resolved)).isDirectory();
  } catch (error) {
    if (error.code !== "ENOENT")
      throw usageError("Cannot read the --output path.");
  }
  if (isDirectory)
    return { directory: resolved };
  if (count > 1)
    throw usageError("--output must be a directory with --count above 1.");
  return { directory: path2.dirname(resolved), file: resolved };
}
function liveFrameFileName(capturedAt) {
  return "frame-".concat(capturedAt.replaceAll(":", "-"), ".jpg");
}
function liveFramesBody(body) {
  if (!body || typeof body !== "object")
    return void 0;
  const view = body;
  if (typeof view.live_id !== "string" || typeof view.state !== "string" || !LIVE_FRAME_STATES.has(view.state))
    return void 0;
  return view;
}
function readLiveFrame(response) {
  const jpeg = response.body;
  const contentType = response.headers["content-type"] ?? "";
  if (!(jpeg instanceof Uint8Array) || !contentType.toLowerCase().startsWith("image/jpeg") || jpeg.byteLength < 4 || jpeg[0] !== 255 || jpeg[1] !== 216) {
    throw unexpectedResponseError("Live frame response is not a JPEG image.");
  }
  const capturedAt = response.headers["screenrig-captured-at"];
  const width = Number(response.headers["screenrig-frame-width"]);
  const height = Number(response.headers["screenrig-frame-height"]);
  const liveId = response.headers["screenrig-live-id"];
  if (capturedAt === void 0 || !Number.isFinite(Date.parse(capturedAt)) || !Number.isInteger(width) || width < 1 || !Number.isInteger(height) || height < 1 || !liveId) {
    throw unexpectedResponseError("Live frame response does not carry ScreenRig-Captured-At, ScreenRig-Frame-Width, ScreenRig-Frame-Height and ScreenRig-Live-Id.");
  }
  const sha256 = createHash2("sha256").update(jpeg).digest("hex");
  const etag = response.headers.etag?.replace(/^W\//, "").replaceAll('"', "");
  if (etag !== void 0 && etag !== sha256) {
    throw unexpectedResponseError("Live frame download did not match its ETag.");
  }
  return { live_id: liveId, captured_at: capturedAt, width, height, jpeg, sha256 };
}
async function writeFrame(file, jpeg) {
  const temp = tempPathFor(file);
  const release = removeOnSignal(temp);
  try {
    await mkdir2(path2.dirname(file), { recursive: true });
    await writeFile2(temp, jpeg, { flag: "wx", mode: 384 });
    await rename2(temp, file);
  } catch {
    await rm2(temp, { force: true });
    throw usageError("Cannot write the frame to the output path.");
  } finally {
    release();
  }
}
function liveFrameProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  const guided2 = (next) => new CliError({ ...error.problem, next }, error.exitCode, error.warnings);
  switch (error.problem.code) {
    case "feature_unavailable":
      return guided2({ command: "screenrig screen screenshot ".concat(id), reason: "Live frames are not available on this server. A screenshot shows what the screen plays." });
    case "live_unavailable":
      return guided2({ command: "screenrig screen live status ".concat(id), reason: "Read why the live session ended or went silent, then start it again. A screenshot shows the screen meanwhile." });
    default:
      return liveProblem(error, id);
  }
}
function notReady(detail, id) {
  return new CliError(makeProblem("live_not_ready", "The screen is not publishing yet", 409, detail, {
    next: { command: "screenrig screen live status ".concat(id), reason: "Read the session, and retry when the Player is publishing." }
  }));
}
async function captureLiveFrames(plan, api, clock) {
  const id = plan.screenId;
  const base = "/api/screens/".concat(encodeURIComponent(id));
  const frames = [];
  let liveId = "";
  let failure;
  try {
    liveId = await publishing(plan, api, clock, "".concat(base, "/live"));
    await startFrames(plan, api, clock, "".concat(base, "/live/frames"));
    let after;
    for (let index = 0; index < plan.count; index += 1) {
      if (index > 0 && plan.intervalMs > 0)
        await clock.sleep(plan.intervalMs);
      const frame = await nextFrame(plan, api, clock, base, after);
      liveId = frame.live_id;
      const file = plan.output.file ?? path2.join(plan.output.directory, liveFrameFileName(frame.captured_at));
      await writeFrame(file, frame.jpeg);
      frames.push({ path: file, captured_at: frame.captured_at, width: frame.width, height: frame.height, bytes: frame.jpeg.byteLength, sha256: frame.sha256 });
      after = frame.captured_at;
    }
  } catch (error) {
    failure = error;
  }
  let stopped = false;
  if (plan.stop) {
    try {
      await api.call({ method: "DELETE", path: "".concat(base, "/live") });
      stopped = true;
    } catch (error) {
      failure ??= liveProblem(error, id);
    }
  }
  if (failure !== void 0)
    throw failure;
  return { screen_id: id, live_id: liveId, frames, ...stopped ? { stopped: true } : {} };
}
async function publishing(plan, api, clock, route) {
  let session;
  try {
    const started = await api.call({ method: "POST", path: route, body: { duration_s: plan.leaseSeconds } });
    session = liveSessionBody(started.body);
    if (!session)
      throw unexpectedResponseError("Screen live start response does not match the generated LiveSession contract.");
  } catch (error) {
    throw liveFrameProblem(error, plan.screenId);
  }
  const deadline = clock.now() + plan.waitMs;
  while (session.state !== "publishing") {
    if (session.state === "ended" || session.state === "idle")
      throw liveEndedError(session);
    const remaining = deadline - clock.now();
    if (remaining <= 0) {
      throw notReady("The Player has not started publishing".concat(plan.waitMs > 0 ? " within ".concat(Math.round(plan.waitMs / 1e3), "s") : "", ". On Android, someone at the screen allows screen capture once each time the Player starts."), plan.screenId);
    }
    await clock.sleep(Math.min(LIVE_POLL_MS, remaining));
    try {
      const read = liveSessionBody((await api.call({ method: "GET", path: route })).body);
      if (!read)
        throw unexpectedResponseError("Screen live status response does not match the generated LiveSession contract.");
      session = read;
    } catch (error) {
      throw liveFrameProblem(error, plan.screenId);
    }
  }
  if (!session.live_id)
    throw unexpectedResponseError("Screen live status response has no live_id.");
  return session.live_id;
}
async function startFrames(plan, api, clock, route) {
  const deadline = clock.now() + plan.waitMs;
  while (true) {
    try {
      const response = await api.call({ method: "POST", path: route });
      if (!liveFramesBody(response.body))
        throw unexpectedResponseError("Screen live frames response does not match the generated LiveFrames contract.");
      return;
    } catch (error) {
      if (error instanceof CliError && error.problem.code === "live_not_ready" && clock.now() < deadline) {
        await clock.sleep(Math.min(LIVE_POLL_MS, deadline - clock.now()));
        continue;
      }
      throw liveFrameProblem(error, plan.screenId);
    }
  }
}
async function nextFrame(plan, api, clock, base, after) {
  const deadline = clock.now() + plan.waitMs;
  while (true) {
    try {
      const response = await api.call({
        method: "GET",
        path: "".concat(base, "/live/frame"),
        ...after === void 0 ? {} : { query: { after } },
        headers: { accept: "image/jpeg" },
        binary: true
      });
      return readLiveFrame(response);
    } catch (error) {
      const code = error instanceof CliError ? error.problem.code : void 0;
      if (code !== "live_not_ready" && code !== "resource_conflict")
        throw liveFrameProblem(error, plan.screenId);
      if (clock.now() >= deadline) {
        throw notReady("No new frame arrived".concat(plan.waitMs > 0 ? " within ".concat(Math.round(plan.waitMs / 1e3), "s") : "", "."), plan.screenId);
      }
      await clock.sleep(Math.min(LIVE_POLL_MS, Math.max(deadline - clock.now(), 1)));
      if (code === "resource_conflict")
        await startFrames(plan, api, clock, "".concat(base, "/live/frames"));
    }
  }
}
function liveFramesHumanLines(result) {
  const lines = ["Saved ".concat(result.frames.length, " live frame").concat(result.frames.length === 1 ? "" : "s", " of ").concat(result.screen_id), "live_id: ".concat(result.live_id)];
  for (const frame of result.frames)
    lines.push("".concat(frame.path, "  ").concat(frame.width, "x").concat(frame.height, "  ").concat(frame.bytes, " bytes  ").concat(frame.captured_at));
  lines.push(result.stopped ? "The live session was stopped." : "The live session ends by itself when its lease runs out; screen live stop ends it now.");
  return lines.join("\n");
}

// dist/screen-outage.js
var screen_outage_exports = {};
__export(screen_outage_exports, {
  likelyCauseText: () => likelyCauseText,
  outageLines: () => outageLines
});
var CAUSES = {
  device_restart: "the device restarted (power loss or reboot)",
  app_crash: "the Player crashed and restarted",
  app_restart: "the Player restarted",
  network: "the screen's network connection",
  platform: "a screenRIG service interruption"
};
function instant4(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T[0-9:.]+(?:Z|[+-]\d{2}:\d{2})$/i.test(value) && !Number.isNaN(Date.parse(value)) ? value : void 0;
}
function span(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes2 = Math.floor(seconds % 3600 / 60);
  if (days > 0)
    return "".concat(days, "d ").concat(hours, "h");
  if (hours > 0)
    return "".concat(hours, "h ").concat(minutes2, "m");
  return minutes2 > 0 ? "".concat(minutes2, "m ").concat(seconds % 60, "s") : "".concat(seconds, "s");
}
function likelyCauseText(cause, rebootCommand = false) {
  if (typeof cause !== "string" || !Object.hasOwn(CAUSES, cause))
    return void 0;
  return cause === "device_restart" && rebootCommand ? "the device restarted after a reboot command" : CAUSES[cause];
}
function outageLines(screen) {
  const outage = screen?.last_outage;
  if (!outage || typeof outage !== "object")
    return [];
  const since = instant4(outage.offline_since);
  if (!since)
    return [];
  const back = instant4(outage.back_at);
  if (!back && screen?.online !== false)
    return [];
  const seconds = typeof outage.duration_s === "number" && Number.isSafeInteger(outage.duration_s) && outage.duration_s >= 0 ? outage.duration_s : void 0;
  const lines = [back ? "Last outage: offline from ".concat(since, " to ").concat(back).concat(seconds === void 0 ? "" : " (".concat(span(seconds), ")")) : "Last outage: offline since ".concat(since)];
  const evidence = outage.evidence && typeof outage.evidence === "object" ? outage.evidence : {};
  const cause = likelyCauseText(outage.likely_cause, evidence.reboot_command === true);
  if (cause)
    lines.push("Likely cause: ".concat(cause, "."));
  return lines;
}

// dist/screen-storage.js
var screen_storage_exports = {};
__export(screen_storage_exports, {
  forecastStorageWarnings: () => forecastStorageWarnings,
  isStorageFailureCode: () => isStorageFailureCode,
  screenStorageWarnings: () => screenStorageWarnings,
  storageFullWarning: () => storageFullWarning
});
var STORAGE_CODES = /* @__PURE__ */ new Set(["storage_full", "none_fit", "transition_blocked", "capacity"]);
function isStorageFailureCode(code) {
  return code !== void 0 && STORAGE_CODES.has(code);
}
function storageFullWarning(screenId, fit) {
  const impact = fit === "partial" ? "Some playlist pages can't be loaded." : fit === "transition_blocked" ? "Can't load the playlist update." : "Can't load this playlist.";
  return {
    code: "storage_full",
    message: "Screen ".concat(screenId, ": Storage full. ").concat(impact, " Ask the user to free up storage on the device running this Player, then retry the playlist.")
  };
}
function limited(fit) {
  return fit === "partial" || fit === "none_fit" || fit === "transition_blocked";
}
function withReportAge(warning, receivedAt, now) {
  const received = receivedAt ? Date.parse(receivedAt) : Number.NaN;
  return Number.isFinite(received) && now.getTime() - received > 864e5 ? { ...warning, message: "".concat(warning.message, " This storage report is more than 24 hours old; check the device's current storage.") } : warning;
}
function screenStorageWarnings(screenId, screen, now) {
  if (!screen)
    return [];
  const upgrade = screen.manifest_upgrade;
  if (upgrade && ["blocked", "failed", "retrying", "partial"].includes(upgrade.state) && isStorageFailureCode(upgrade.code ?? void 0)) {
    const updating = upgrade.active_playlist?.id !== void 0 && upgrade.active_playlist.id === upgrade.desired_playlist?.id;
    const fit = upgrade.state === "partial" ? "partial" : updating ? "transition_blocked" : "none_fit";
    return [storageFullWarning(screenId, fit)];
  }
  const forecast = screen.storage_forecast;
  const shortfall = screen.storage_shortfall;
  const sameRevision = !forecast || screen.storage?.plan?.manifest_revision === forecast.manifest_revision;
  if (shortfall && limited(shortfall.fit) && sameRevision) {
    return [withReportAge(storageFullWarning(screenId, shortfall.fit), screen.storage?.received_at, now)];
  }
  if (forecast) {
    return limited(forecast.fit) ? [withReportAge(storageFullWarning(screenId, forecast.fit), screen.storage?.received_at ?? forecast.received_at, now)] : [];
  }
  if (shortfall && limited(shortfall.fit)) {
    return [withReportAge(storageFullWarning(screenId, shortfall.fit), screen.storage?.received_at, now)];
  }
  return [];
}
function forecastStorageWarnings(screenId, forecast, now) {
  return limited(forecast.fit) ? [withReportAge(storageFullWarning(screenId, forecast.fit), forecast.received_at, now)] : [];
}

// dist/screen-link-format.js
var screen_link_format_exports = {};
__export(screen_link_format_exports, {
  guardScreenLink: () => guardScreenLink,
  screenLinkLines: () => screenLinkLines,
  screenLinkProblem: () => screenLinkProblem,
  screenLinkScreenId: () => screenLinkScreenId,
  screenLinkSummaryLines: () => screenLinkSummaryLines,
  screenLinkUrlLines: () => screenLinkUrlLines,
  screenLinkUrlProblem: () => screenLinkUrlProblem
});
var SCREEN_ID = /^(?:(?:stage|qa|development)_)?scr_[A-Za-z0-9_-]{1,64}$/;
var SCREEN_LINK_URL_MAX = 512;
var SCREEN_FRAGMENT_PATTERN = /^#screen=srsl_[A-Za-z0-9_-]{43}$/;
function screenLinkScreenId(value, command) {
  if (!value)
    throw usageError("screen link ".concat(command, " requires <id>."));
  if (!SCREEN_ID.test(value)) {
    throw usageError("A screen id looks like scr_ followed by letters, digits, - or _.", {
      command: "screenrig screen list",
      reason: "List this project's screens and their ids."
    });
  }
  return value;
}
function screenLinkUrlProblem(value) {
  if (typeof value !== "string")
    return "url is not a string.";
  if (value.length > SCREEN_LINK_URL_MAX)
    return "url is longer than ".concat(SCREEN_LINK_URL_MAX, " characters.");
  let url;
  try {
    url = new URL(value);
  } catch {
    return "url is not a valid URL.";
  }
  const localHttp = url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname.endsWith(".localhost"));
  if (url.protocol !== "https:" && !localHttp)
    return "url is not HTTPS.";
  if (url.username || url.password)
    return "url carries credentials.";
  if (url.search)
    return "url carries a query.";
  if (url.pathname !== "/player/")
    return "url does not open the Player at /player/.";
  if (!SCREEN_FRAGMENT_PATTERN.test(url.hash))
    return "url carries its secret outside the #screen= fragment.";
  return void 0;
}
function guardScreenLink(id, link) {
  if (link.url === void 0 || link.url_redacted === true && link.url === "")
    return { link, warnings: [] };
  const reason = link.url_redacted === true ? "url_redacted is true but url is not empty." : screenLinkUrlProblem(link.url);
  if (!reason)
    return { link, warnings: [] };
  const { url: _withheld, ...rest } = link;
  return {
    link: rest,
    warnings: [{
      code: "screen_link_url_withheld",
      message: "The url returned for the link of screen ".concat(id, " failed a safety check, so it is not shown: ").concat(reason, " The link itself is unchanged. Report the request_id with screenrig feedback bug.")
    }]
  };
}
var READ_ONLY_URL = "URL: withheld from a Read only credential. A Manage sign-in (screenrig login --access manage) receives it.";
function screenLinkLines(id, link) {
  if (!link)
    return [];
  return [
    "screen: ".concat(id),
    "hint: ".concat(link.hint),
    "created_at: ".concat(link.created_at),
    "last_used_at: ".concat(link.last_used_at ?? "never")
  ];
}
function screenLinkUrlLines(link, withheld) {
  if (!link)
    return [];
  if (link.url) {
    return ["", "Sensitive screen link URL (it opens this screen in a browser that keeps no storage, such as a vMix or OBS browser source; open it in one place)", "url: ".concat(link.url)];
  }
  if (withheld)
    return ["", "URL: withheld, see the warning."];
  if (link.url_redacted === true)
    return ["", READ_ONLY_URL];
  return ["", "URL: not returned."];
}
function screenLinkSummaryLines(link) {
  if (!link)
    return [];
  return ["Screen link: on (\u2026".concat(link.hint, "), last opened ").concat(link.last_used_at ?? "never")];
}
function screenLinkProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  const problem = error.problem;
  if (problem.code === "screen_link_not_found") {
    return new CliError({
      ...problem,
      next: { command: "screenrig screen link create ".concat(id), reason: "Create the screen's link, then print its URL with screenrig screen link show." }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "resource_conflict" && /no paired Player/i.test(problem.detail)) {
    return new CliError({
      ...problem,
      next: { command: "screenrig screen pair CODE", reason: "Open the Player on the display once and pair it with the code it shows; then create the link." }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "screen_archived") {
    return new CliError({
      ...problem,
      next: { command: "screenrig screen unarchive ".concat(id), reason: "An archived screen takes no new link. Unarchive it first if it should play again." }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "revision_conflict") {
    return new CliError({
      ...problem,
      next: { command: "screenrig screen show ".concat(id), reason: "Read the screen's current revision, then rerun with --expect-rev REVISION if the change still applies." }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "not_found") {
    return new CliError({
      ...problem,
      next: { command: "screenrig screen list", reason: "List this project's screens; a deleted screen does not come back." }
    }, error.exitCode, error.warnings);
  }
  return error;
}

// dist/provisioning-state.js
var provisioning_state_exports = {};
__export(provisioning_state_exports, {
  clearProvisionRetryState: () => clearProvisionRetryState,
  provisionRetryState: () => provisionRetryState
});
function sameRequest(state, label, folderId) {
  return state.label === label && state.folder_id === folderId;
}
async function provisionRetryState(options) {
  return withConfigLock(options.resolved.configPath, options.runtime.fs, { sleep: options.runtime.sleep, now: () => options.runtime.now().getTime() }, async () => {
    const stored = await readConfigFile(options.resolved.configPath, options.runtime.fs);
    const current = stored ? projectConfigFor(stored, options.resolved) : void 0;
    if (current)
      assertProjectCredential(current, options.resolved);
    if (current?.screen_provision) {
      if (!sameRequest(current.screen_provision, options.label, options.folderId)) {
        throw usageError("A browser provisioning retry is pending. Retry the same --name and --folder before creating another screen.");
      }
      if (options.requestedKey && current.screen_provision.idempotency_key !== options.requestedKey) {
        throw usageError("The supplied idempotency key does not match the pending browser provisioning retry.");
      }
      return current.screen_provision;
    }
    const idempotencyKey = options.requestedKey ?? (options.generateIdempotencyKey ?? newIdempotencyKey)();
    if (!isValidIdempotencyKey(idempotencyKey))
      throw usageError("Browser provisioning idempotency key is invalid.");
    const state = {
      idempotency_key: idempotencyKey,
      ...options.label ? { label: options.label } : {},
      ...options.folderId ? { folder_id: options.folderId } : {}
    };
    await writeConfigAtomic(options.resolved.configPath, withProjectConfig(stored ?? { api_url: options.resolved.apiUrl }, options.resolved, {
      ...current ?? { api_url: options.resolved.apiUrl },
      screen_provision: state,
      updated_at: options.runtime.now().toISOString()
    }), options.runtime.fs);
    return state;
  });
}
async function clearProvisionRetryState(resolved, runtime, idempotencyKey) {
  await withConfigLock(resolved.configPath, runtime.fs, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    const stored = await readConfigFile(resolved.configPath, runtime.fs);
    const current = stored ? projectConfigFor(stored, resolved) : void 0;
    if (current)
      assertProjectCredential(current, resolved);
    if (!current || current.screen_provision?.idempotency_key !== idempotencyKey)
      return;
    const { screen_provision: _complete, ...complete } = current;
    await writeConfigAtomic(resolved.configPath, withProjectConfig(stored, resolved, complete), runtime.fs);
  });
}

// dist/screen-link.js
var screen_link_exports = {};
__export(screen_link_exports, {
  handleScreenLinkCreate: () => handleScreenLinkCreate,
  handleScreenLinkDelete: () => handleScreenLinkDelete,
  handleScreenLinkShow: () => handleScreenLinkShow
});
function linkPath(id) {
  return "/api/screens/".concat(id, "/link");
}
async function linkCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw screenLinkProblem(error, id);
  }
}
function revisionHeaders(revision) {
  return revision ? { "if-match": quotedRevision(revision) } : void 0;
}
function linkResult(id, response, requestId, title) {
  const answered = response.body;
  const { link, warnings } = answered && typeof answered === "object" ? guardScreenLink(id, answered) : { link: answered, warnings: [] };
  return {
    envelope: jsonBody({ ...response, body: { ...link ?? {}, screen_id: id } }, requestId, void 0, warnings),
    exitCode: ExitCode.Success,
    human: [
      title,
      ...screenLinkLines(id, link),
      ...screenLinkUrlLines(link, warnings.length > 0),
      ...warnings.map((warning) => "warning: ".concat(warning.message))
    ].join("\n")
  };
}
var handleScreenLinkCreate = commandHandler(async (args, runtime, resolved) => {
  const id = screenLinkScreenId(args.positionals[3], "create");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await linkCall(client, {
    method: "POST",
    path: linkPath(id),
    idempotent: true,
    headers: revisionHeaders(flagString(args.flags, "expect-rev"))
  }, id);
  const replaced = response.body?.replaced === true;
  return linkResult(id, response, client.requestId, replaced ? "Replaced the link of screen ".concat(id, ". The old URL stopped working at once; put the new URL in the browser source.") : "Created the link of screen ".concat(id, ". Put its URL in the browser source and open it in one place."));
});
var handleScreenLinkShow = commandHandler(async (args, runtime, resolved) => {
  const id = screenLinkScreenId(args.positionals[3], "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await linkCall(client, { method: "GET", path: linkPath(id) }, id);
  return linkResult(id, response, client.requestId, "Link of screen ".concat(id));
});
var handleScreenLinkDelete = commandHandler(async (args, runtime, resolved) => {
  const id = screenLinkScreenId(args.positionals[3], "delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await linkCall(client, {
    method: "DELETE",
    path: linkPath(id),
    idempotent: true,
    headers: revisionHeaders(flagString(args.flags, "expect-rev"))
  }, id);
  return {
    envelope: jsonBody({ ...response, body: { screen_id: id, deleted: true } }, client.requestId),
    exitCode: ExitCode.Success,
    human: "Turned off the link of screen ".concat(id, ". Its URL stopped working at once; a browser source still showing it shows a notice and no content.")
  };
});

export {
  manifestUpgradeLines,
  manifestUpgradeCell,
  anyManifestUpgrade,
  screen_manifest_upgrade_exports,
  publishScreen,
  screen_publish_exports,
  displayScheduleWrite,
  rebootScheduleWrite,
  displayPower,
  displayUntil,
  untilOption,
  displayLines,
  rebootWindowOption,
  rebootWindowList,
  rebootScheduleLines,
  rebootScheduleProblem,
  rebootProblem,
  playPageProblem,
  displayProblem,
  screen_display_exports,
  expiresInSeconds,
  expiresInOption,
  identifyDurationMs,
  identifyDurationOption,
  suspendMessage,
  suspendMessageOption,
  MAINTENANCE,
  commandResultText,
  commandLines,
  maintenanceProblem,
  suspensionLines,
  replacedByLines,
  identifyProblem,
  suspendProblem,
  replaceProblem,
  commandCancelProblem,
  screen_commands_exports,
  glassLines,
  frameRow,
  flatFrameNote,
  screen_glass_exports,
  LIVE_WAIT_DEFAULT_MS,
  liveScreenId,
  liveDurationSeconds,
  liveDurationOption,
  liveWaitMs,
  liveWaitOption,
  liveSessionBody,
  settleLive,
  liveEndedError,
  liveNotReadyWarning,
  liveProblem,
  liveHumanLines,
  screen_live_exports,
  LIVE_FRAME_INTERVAL_DEFAULT_MS,
  liveFrameIntervalMs,
  liveFrameIntervalOption,
  liveFrameLeaseSeconds,
  resolveFrameOutput,
  captureLiveFrames,
  liveFramesHumanLines,
  screen_live_frame_exports,
  outageLines,
  screen_outage_exports,
  isStorageFailureCode,
  storageFullWarning,
  screenStorageWarnings,
  forecastStorageWarnings,
  screen_storage_exports,
  screenLinkSummaryLines,
  screen_link_format_exports,
  provisionRetryState,
  clearProvisionRetryState,
  provisioning_state_exports,
  handleScreenLinkCreate,
  handleScreenLinkShow,
  handleScreenLinkDelete,
  screen_link_exports
};
