import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  handleScreenFolderCreate,
  handleScreenFolderDelete,
  handleScreenFolderList,
  handleScreenFolderShow,
  handleScreenFolderUpdate,
  handleScreenMove,
  levelsLines,
  screenFolderIdOption,
  screenFolderName,
  screenFolderPlaylistOption,
  screenListFolderOption,
  sumLevels
} from "./chunk-4URA7TOM.js";
import {
  calendarInstantOption,
  schedulePreviewLines,
  screenScheduleRevisionLines
} from "./chunk-54SN6RFT.js";
import {
  callPlaylist
} from "./chunk-RUNYOLA6.js";
import {
  revisionNumber
} from "./chunk-TYJ2ZCPG.js";
import {
  healthLines,
  screenHealthIssues
} from "./chunk-ZYFFYQJM.js";
import {
  LIVE_FRAME_INTERVAL_DEFAULT_MS,
  LIVE_WAIT_DEFAULT_MS,
  MAINTENANCE,
  anyManifestUpgrade,
  captureLiveFrames,
  clearProvisionRetryState,
  commandCancelProblem,
  commandLines,
  commandResultText,
  displayLines,
  displayPower,
  displayProblem,
  displayScheduleWrite,
  displayUntil,
  displayWarnings,
  expiresInOption,
  expiresInSeconds,
  flatFrameNote,
  forecastStorageWarnings,
  frameRow,
  glassLines,
  handleScreenLinkCreate,
  handleScreenLinkDelete,
  handleScreenLinkShow,
  identifyDurationMs,
  identifyDurationOption,
  identifyProblem,
  isStorageFailureCode,
  liveDurationOption,
  liveDurationSeconds,
  liveEndedError,
  liveFrameIntervalMs,
  liveFrameIntervalOption,
  liveFrameLeaseSeconds,
  liveFramesHumanLines,
  liveHumanLines,
  liveNotReadyWarning,
  liveProblem,
  liveScreenId,
  liveSessionBody,
  liveWaitMs,
  liveWaitOption,
  maintenanceProblem,
  manifestUpgradeCell,
  manifestUpgradeLines,
  outageLines,
  playPageProblem,
  provisionRetryState,
  publishScreen,
  rebootProblem,
  rebootScheduleLines,
  rebootScheduleProblem,
  rebootScheduleWrite,
  rebootWindowList,
  rebootWindowOption,
  replaceProblem,
  replacedByLines,
  resolveFrameOutput,
  screenLinkSummaryLines,
  screenStorageWarnings,
  settleLive,
  storageFullWarning,
  suspendMessage,
  suspendMessageOption,
  suspendProblem,
  suspensionLines,
  untilOption
} from "./chunk-2IVPW7XQ.js";
import {
  WALL_ARRANGEMENTS,
  WALL_ROTATIONS,
  assertPlaylistValid,
  assertWirePages,
  playlistNeedsTimezone,
  shortApplicationPageWarning,
  wallFromFlags,
  wallLine,
  wallOutputsOption,
  wallProblem
} from "./chunk-YJ7RQRQQ.js";
import {
  validateProvisioningUrls
} from "./chunk-MR54EUES.js";
import {
  apexHost
} from "./chunk-BWPKDRCP.js";
import {
  subcommand
} from "./chunk-QUFYJQPR.js";
import {
  fieldMap,
  fleetLinkFieldOption,
  screenAddressOption,
  screenFactsLines,
  screenFactsPatch,
  screenFieldFilterOption,
  screenFieldSetOption,
  screenFieldsCell,
  screenListFacts,
  screenLocationCell,
  screenLocationNameOption,
  screenLocationOption,
  screenNearOption,
  screenUnsetFieldOption
} from "./chunk-SOPO7JRX.js";
import {
  canonicalPairingCode
} from "./chunk-3W3YTE3M.js";
import {
  NOTE_HELP,
  Option,
  positiveInteger,
  reportFormatOption,
  reportOutputOption,
  reviewNoteOption,
  revision,
  screenTagListOption,
  screenTagOption,
  toastDuration
} from "./chunk-UZ2GQVZJ.js";
import {
  addCommandExamples,
  addCommandNotes,
  requireOptionGroup
} from "./chunk-IBLNZ4EM.js";
import {
  fleetLinkExpiresAt,
  fleetLinkId,
  fleetLinkLines,
  fleetLinkMaxScreens,
  fleetLinkName,
  fleetLinkPlaylistId,
  fleetLinkProblem,
  fleetLinkRedactedNote,
  fleetLinkTableLines,
  fleetLinkTags,
  fleetLinkUrlLines,
  fleetLinkUrlProblem,
  guardFleetLink,
  guardFleetLinks
} from "./chunk-UXMZL4AK.js";
import {
  readAuthoringJson
} from "./chunk-OFOJKZJN.js";
import {
  clientFor,
  commandHandler,
  formatBytes,
  humanLines,
  isScreenId,
  jsonBody,
  pendingReviewResult,
  quotedRevision,
  requireFlagValue,
  requirePrivateNoStore,
  requireToken,
  resolveDownloadOutput,
  resourceNotes,
  reviewNoteFrom,
  scheduleZoneError,
  simpleGet,
  simpleList,
  uptimeDays
} from "./chunk-FP3WGXZK.js";
import {
  HEALTH_DEFAULT_WINDOW_MS,
  HEALTH_HOURLY_MAX_DAYS,
  HEALTH_RAW_MAX_DAYS,
  PENDING_REVIEW_SENTENCE,
  PRESENCE_DEFAULT_WINDOW_MS,
  PRESENCE_MAX_DAYS,
  SERIES_PAGE_SIZE,
  hasFramingRefusal,
  pendingReviewOf,
  pendingReviewWarning,
  playlistAnswerWarnings,
  playlistWarnings,
  playsInstantOption,
  removeOnSignal,
  reviewNext,
  seriesWindow,
  tempPathFor,
  withoutAnswerWarnings
} from "./chunk-LN4XKIFM.js";
import {
  loggerOf
} from "./chunk-PPWTLS44.js";
import {
  SCREEN_FOLDER_ID_PATTERN,
  SCREEN_TAGS_MAX,
  assignmentLine,
  durationOption,
  effectivePlaylistText,
  flagBool,
  flagNumber,
  flagString,
  fleetHumanLines,
  fleetOutcome,
  folderSubtree,
  instantInZone,
  newIdempotencyKey,
  rejectFleetRevision,
  scheduleEntries,
  scheduleTableLines,
  screenActionResult,
  screenControlProblem,
  screenFolderId,
  screenTag,
  screenTagList,
  screenTarget,
  selectorFlags,
  successEnvelope,
  takeoverForProblem,
  takeoverLine,
  takeoverReason,
  takeoverUntil,
  takeoverUntilOption
} from "./chunk-D2RLMLYO.js";
import {
  CliError,
  ExitCode,
  makeProblem,
  networkError,
  reportedDisplayOf,
  unexpectedResponseError,
  usageError
} from "./chunk-JP4OQPAN.js";
import {
  __export
} from "./chunk-3FYAGULW.js";

// dist/bundles/screens.js
var screens_exports = {};
__export(screens_exports, {
  register: () => register
});

// dist/cli-commands/screen.js
var screen_exports2 = {};
__export(screen_exports2, {
  registerScreenCommands: () => registerScreenCommands
});

// dist/handlers/screen-schedule-change.js
var screen_schedule_change_exports = {};
__export(screen_schedule_change_exports, {
  handleScreenSchedulePreview: () => handleScreenSchedulePreview,
  handleScreenScheduleRestore: () => handleScreenScheduleRestore,
  handleScreenScheduleRevisions: () => handleScreenScheduleRevisions
});

// dist/handlers/screen.js
var screen_exports = {};
__export(screen_exports, {
  ARCHIVE_REASON_PATTERN: () => ARCHIVE_REASON_PATTERN,
  ARCHIVE_REASON_TEXT: () => ARCHIVE_REASON_TEXT,
  RECOVERY_PROBLEM_MESSAGES: () => RECOVERY_PROBLEM_MESSAGES,
  SCREENSHOT_BACKOFF_CAP_MS: () => SCREENSHOT_BACKOFF_CAP_MS,
  SCREENSHOT_BACKOFF_MS: () => SCREENSHOT_BACKOFF_MS,
  SCREENSHOT_DEFAULT_POLL_MS: () => SCREENSHOT_DEFAULT_POLL_MS,
  SCREENSHOT_DEFAULT_WAIT_MS: () => SCREENSHOT_DEFAULT_WAIT_MS,
  SCREENSHOT_FAILURE_DETAIL: () => SCREENSHOT_FAILURE_DETAIL,
  SCREENSHOT_FAILURE_HINT: () => SCREENSHOT_FAILURE_HINT,
  SCREENSHOT_FLEET_DEFAULT_CONCURRENCY: () => SCREENSHOT_FLEET_DEFAULT_CONCURRENCY,
  SCREENSHOT_FLEET_MAX_CONCURRENCY: () => SCREENSHOT_FLEET_MAX_CONCURRENCY,
  SCREENSHOT_RETRY_AFTER_CAP_MS: () => SCREENSHOT_RETRY_AFTER_CAP_MS,
  SCREENSHOT_RETRY_MAX: () => SCREENSHOT_RETRY_MAX,
  STORAGE_STALE_MS: () => STORAGE_STALE_MS,
  ScreenshotRetry: () => ScreenshotRetry,
  TOAST_DEFAULT_LEVEL: () => TOAST_DEFAULT_LEVEL,
  TOAST_DURATION_MAX: () => TOAST_DURATION_MAX,
  TOAST_DURATION_MIN: () => TOAST_DURATION_MIN,
  TOAST_LEVELS: () => TOAST_LEVELS,
  TOAST_MAX_LINES: () => TOAST_MAX_LINES,
  TOAST_TEXT_MAX: () => TOAST_TEXT_MAX,
  applicationsUnsupportedAt: () => applicationsUnsupportedAt,
  applicationsUnsupportedLines: () => applicationsUnsupportedLines,
  archiveReason: () => archiveReason,
  archivedLines: () => archivedLines,
  assertScheduledPlaylistHasZone: () => assertScheduledPlaylistHasZone,
  captureScreenshot: () => captureScreenshot,
  commandLifetime: () => commandLifetime,
  displayHuman: () => displayHuman,
  explainedScreenshotFailure: () => explainedScreenshotFailure,
  forecastLines: () => forecastLines,
  handleScreenArchive: () => handleScreenArchive,
  handleScreenAssign: () => handleScreenAssign,
  handleScreenClearCache: () => handleScreenClearCache,
  handleScreenCommandCancel: () => handleScreenCommandCancel,
  handleScreenDelete: () => handleScreenDelete,
  handleScreenDisplay: () => handleScreenDisplay,
  handleScreenDisplayClear: () => handleScreenDisplayClear,
  handleScreenDisplayScheduleClear: () => handleScreenDisplayScheduleClear,
  handleScreenDisplayScheduleSet: () => handleScreenDisplayScheduleSet,
  handleScreenDisplayScheduleShow: () => handleScreenDisplayScheduleShow,
  handleScreenHealthHistory: () => handleScreenHealthHistory,
  handleScreenIdentify: () => handleScreenIdentify,
  handleScreenList: () => handleScreenList,
  handleScreenLiveFrame: () => handleScreenLiveFrame,
  handleScreenLiveStart: () => handleScreenLiveStart,
  handleScreenLiveStatus: () => handleScreenLiveStatus,
  handleScreenLiveStop: () => handleScreenLiveStop,
  handleScreenPair: () => handleScreenPair,
  handleScreenPlayPage: () => handleScreenPlayPage,
  handleScreenPresence: () => handleScreenPresence,
  handleScreenProvision: () => handleScreenProvision,
  handleScreenPublish: () => handleScreenPublish,
  handleScreenReboot: () => handleScreenReboot,
  handleScreenRebootScheduleClear: () => handleScreenRebootScheduleClear,
  handleScreenRebootScheduleSet: () => handleScreenRebootScheduleSet,
  handleScreenRebootScheduleShow: () => handleScreenRebootScheduleShow,
  handleScreenRecover: () => handleScreenRecover,
  handleScreenReload: () => handleScreenReload,
  handleScreenReplace: () => handleScreenReplace,
  handleScreenRestartApp: () => handleScreenRestartApp,
  handleScreenResume: () => handleScreenResume,
  handleScreenRotatePublicId: () => handleScreenRotatePublicId,
  handleScreenScheduleClear: () => handleScreenScheduleClear,
  handleScreenScheduleSet: () => handleScreenScheduleSet,
  handleScreenScheduleShow: () => handleScreenScheduleShow,
  handleScreenScreenshot: () => handleScreenScreenshot,
  handleScreenSetTimezone: () => handleScreenSetTimezone,
  handleScreenShow: () => handleScreenShow,
  handleScreenStorageForecast: () => handleScreenStorageForecast,
  handleScreenSuspend: () => handleScreenSuspend,
  handleScreenTag: () => handleScreenTag,
  handleScreenTakeover: () => handleScreenTakeover,
  handleScreenTakeoverClear: () => handleScreenTakeoverClear,
  handleScreenToast: () => handleScreenToast,
  handleScreenUnarchive: () => handleScreenUnarchive,
  handleScreenUpdate: () => handleScreenUpdate,
  handleScreenUpdateSoftware: () => handleScreenUpdateSoftware,
  handleScreenUptime: () => handleScreenUptime,
  handleScreenWallClear: () => handleScreenWallClear,
  handleScreenWallSet: () => handleScreenWallSet,
  hostLines: () => hostLines,
  isScreenToastLevel: () => isScreenToastLevel,
  maintenanceHandler: () => maintenanceHandler,
  nestedScreenTarget: () => nestedScreenTarget,
  publishPlaybackWarning: () => publishPlaybackWarning,
  recoveryPendingLine: () => recoveryPendingLine,
  requestScreenshotCapture: () => requestScreenshotCapture,
  resolveScreenshotOutput: () => resolveScreenshotOutput,
  retriedScreenshotRead: () => retriedScreenshotRead,
  screenAfterScreenshot: () => screenAfterScreenshot,
  screenArchiveUnarchiveAction: () => screenArchiveUnarchiveAction,
  screenControlCall: () => screenControlCall,
  screenControlHeaders: () => screenControlHeaders,
  screenControlHuman: () => screenControlHuman,
  screenFleetAction: () => screenFleetAction,
  screenFolderCell: () => screenFolderCell,
  screenFolderLine: () => screenFolderLine,
  screenListFolderFromArgs: () => screenListFolderFromArgs,
  screenListQuery: () => screenListQuery,
  screenListStateFromArgs: () => screenListStateFromArgs,
  screenListTagFromArgs: () => screenListTagFromArgs,
  screenScreenshot: () => screenScreenshot,
  screenScreenshotFleet: () => screenScreenshotFleet,
  screenSeriesId: () => screenSeriesId,
  screenTableLines: () => screenTableLines,
  screenTags: () => screenTags,
  screenToast: () => screenToast,
  screenWallPatch: () => screenWallPatch,
  screenshotFailure: () => screenshotFailure,
  screenshotOptions: () => screenshotOptions,
  screenshotTiming: () => screenshotTiming,
  screenshotUnavailable: () => screenshotUnavailable,
  serverInstant: () => serverInstant,
  storageLines: () => storageLines,
  toastLineCount: () => toastLineCount,
  toastTextHasDisallowedControl: () => toastTextHasDisallowedControl,
  toastWriteFromArgs: () => toastWriteFromArgs,
  transientScreenshotFailure: () => transientScreenshotFailure,
  trimToastText: () => trimToastText,
  validDelivery: () => validDelivery
});
import { createHash } from "node:crypto";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

// dist/aspect-mismatch.js
var aspect_mismatch_exports = {};
__export(aspect_mismatch_exports, {
  ASPECT_MISMATCH_CODE: () => ASPECT_MISMATCH_CODE,
  aspectMismatchWarnings: () => aspectMismatchWarnings
});
var ASPECT_MISMATCH_CODE = "aspect_mismatch";
function record(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function orientation(width, height) {
  if (typeof width !== "number" || typeof height !== "number" || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || width === height) {
    return void 0;
  }
  return width > height ? "landscape" : "portrait";
}
function aspectMismatchWarnings(screenId, screenValue, playlistValue) {
  const screen = record(screenValue);
  const observation = record(screen?.observation);
  const surfaces = observation?.surfaces;
  const surface = Array.isArray(surfaces) ? record(surfaces[0]) : void 0;
  const surfaceOrientation = orientation(surface?.width, surface?.height);
  if (!surface || !surfaceOrientation) {
    return [];
  }
  const playlist = record(playlistValue);
  const pages = playlist?.pages;
  if (!Array.isArray(pages)) {
    return [];
  }
  const warnings = [];
  const seen = /* @__PURE__ */ new Set();
  for (const pageValue of pages) {
    const page = record(pageValue);
    if (typeof page?.id !== "string" || !Array.isArray(page.primitives)) {
      continue;
    }
    for (const primitiveValue of page.primitives) {
      const primitive = record(primitiveValue);
      if (primitive?.primitive !== "image" && primitive?.primitive !== "video" || !Array.isArray(primitive.resolved_media)) {
        continue;
      }
      for (const mediaValue of primitive.resolved_media) {
        const media = record(mediaValue);
        const intrinsicSize = record(media?.intrinsic_size);
        const mediaOrientation = orientation(intrinsicSize?.width, intrinsicSize?.height);
        if (typeof media?.media_id !== "string" || !mediaOrientation || mediaOrientation === surfaceOrientation) {
          continue;
        }
        const key = "".concat(page.id, "\0").concat(media.media_id);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        warnings.push({
          code: ASPECT_MISMATCH_CODE,
          message: "Page ".concat(page.id, " uses ").concat(mediaOrientation, " media ").concat(media.media_id, " on screen ").concat(screenId, ", whose player reported a ").concat(surfaceOrientation, " ").concat(surface.width, "x").concat(surface.height, " surface.")
        });
      }
    }
  }
  return warnings;
}

// dist/handlers/screen.js
function screenListQuery(args) {
  const state = screenListStateFromArgs(args);
  const tag = screenListTagFromArgs(args);
  const folder = screenListFolderFromArgs(args);
  const facts = screenListFacts(args.flags);
  return { query: { ...state ? { state } : {}, ...tag ? { tag } : {}, ...folder ? { folder } : {}, ...facts.query }, ...facts.repeated ? { repeated: facts.repeated } : {} };
}
function screenListFolderFromArgs(args) {
  requireFlagValue(args, "folder", "sfd_NORTH");
  const folder = flagString(args.flags, "folder");
  return folder === void 0 || folder === "root" ? folder : screenFolderId(folder, "--folder");
}
function screenListTagFromArgs(args) {
  requireFlagValue(args, "tag", "Lobby");
  const tag = flagString(args.flags, "tag");
  return tag === void 0 ? void 0 : screenTag(tag);
}
function screenTags(screen) {
  const tags = screen?.tags;
  return Array.isArray(tags) ? tags.filter((tag) => typeof tag === "string" && /^[A-Za-z0-9]{1,32}$/.test(tag)) : [];
}
function screenFolderCell(screen) {
  const folder = screen?.folder_id;
  return typeof folder === "string" && SCREEN_FOLDER_ID_PATTERN.test(folder) ? folder : "";
}
function screenFolderLine(screen) {
  const folder = screenFolderCell(screen);
  return folder ? ["Folder: ".concat(folder, " (screen folder show ").concat(folder, ")")] : [];
}
function screenListStateFromArgs(args) {
  requireFlagValue(args, "state", "archived");
  const state = flagString(args.flags, "state");
  if (state === void 0) {
    return void 0;
  }
  if (state !== "archived") {
    throw usageError("--state must be archived.");
  }
  return state;
}
function screenSeriesId(args, command) {
  const id = args.positionals[2];
  if (!id || !isScreenId(id))
    throw usageError("".concat(command, " requires a screen ID (scr_...); screen list shows them."));
  return id;
}
var handleScreenUptime = commandHandler(async (args, runtime, resolved) => {
  const id = screenSeriesId(args, "screen uptime");
  return simpleGet(args, runtime, resolved, "/api/screens/".concat(id, "/uptime"), "Screen uptime", uptimeDays(args));
}, true);
var handleScreenPresence = commandHandler(async (args, runtime, resolved) => {
  const id = screenSeriesId(args, "screen presence");
  requireFlagValue(args, "since", "7d");
  requireFlagValue(args, "until", "now");
  const range = seriesWindow({
    from: flagString(args.flags, "since"),
    to: flagString(args.flags, "until"),
    fromFlag: "--since",
    toFlag: "--until",
    now: runtime.now(),
    defaultMs: PRESENCE_DEFAULT_WINDOW_MS,
    maxDays: PRESENCE_MAX_DAYS
  });
  return simpleList(args, runtime, resolved, "/api/screens/".concat(id, "/presence"), "Screen presence", { since: range.from, until: range.to, limit: SERIES_PAGE_SIZE }, { cursorParam: "before", uncapped: true });
}, true);
var handleScreenHealthHistory = commandHandler(async (args, runtime, resolved) => {
  const id = screenSeriesId(args, "screen health-history");
  requireFlagValue(args, "resolution", "hour");
  requireFlagValue(args, "from", "7d");
  requireFlagValue(args, "to", "now");
  const resolution = flagString(args.flags, "resolution") ?? "raw";
  if (resolution !== "raw" && resolution !== "hour")
    throw usageError("--resolution must be raw or hour.");
  const range = seriesWindow({
    from: flagString(args.flags, "from"),
    to: flagString(args.flags, "to"),
    fromFlag: "--from",
    toFlag: "--to",
    now: runtime.now(),
    defaultMs: HEALTH_DEFAULT_WINDOW_MS,
    maxDays: resolution === "hour" ? HEALTH_HOURLY_MAX_DAYS : HEALTH_RAW_MAX_DAYS,
    advice: resolution === "raw" ? " with --resolution raw; --resolution hour spans up to ".concat(HEALTH_HOURLY_MAX_DAYS, " days") : ""
  });
  return simpleList(args, runtime, resolved, "/api/screens/".concat(id, "/health/history"), "Screen health history", { from: range.from, to: range.to, resolution: flagString(args.flags, "resolution"), limit: SERIES_PAGE_SIZE }, { cursorParam: "cursor", itemsKey: resolution === "hour" ? "hours" : "samples", uncapped: true });
}, true);
var TOAST_LEVELS = /* @__PURE__ */ new Set(["error", "alert", "info"]);
var TOAST_DEFAULT_LEVEL = "info";
var TOAST_TEXT_MAX = 120;
var TOAST_MAX_LINES = 3;
var TOAST_DURATION_MIN = 2e3;
var TOAST_DURATION_MAX = 6e4;
var SCREENSHOT_DEFAULT_WAIT_MS = 35e3;
var SCREENSHOT_DEFAULT_POLL_MS = 500;
function isScreenToastLevel(value) {
  return TOAST_LEVELS.has(value);
}
function trimToastText(value) {
  return value.replace(/^[ \t\r\n]+/, "").replace(/[ \t\r\n]+$/, "");
}
function toastTextHasDisallowedControl(value) {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (character === "\n") {
      continue;
    }
    if (code < 32 || code === 127) {
      return true;
    }
  }
  return false;
}
function toastLineCount(value) {
  if (value === "") {
    return 0;
  }
  return value.split("\n").length;
}
async function assertScheduledPlaylistHasZone(client, screenId, playlistId) {
  const playlist = await callPlaylist(client, { method: "GET", id: playlistId });
  if (!playlistNeedsTimezone(playlist.body)) {
    return playlist.body;
  }
  const screen = await client.call({ method: "GET", path: "/api/screens/".concat(screenId) });
  if (screen.body?.timezone) {
    return playlist.body;
  }
  throw scheduleZoneError(screenId);
}
var handleScreenList = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const { query, repeated } = screenListQuery(args);
  const response = await client.listAll("/api/screens", query, repeated ? { queryRepeated: repeated } : void 0);
  const items = response.body?.items;
  const warnings = Array.isArray(items) ? items.flatMap((screen) => screenStorageWarnings(screen.id, screen, runtime.now())) : [];
  return {
    envelope: jsonBody(response, client.requestId, void 0, warnings),
    exitCode: ExitCode.Success,
    human: ["Screens", ...screenTableLines(Array.isArray(items) ? items : [], runtime.now()), JSON.stringify(response.body, null, 2), ...warnings.map((warning) => "warning: ".concat(warning.message))].join("\n")
  };
}, true);
function screenTableLines(items, now) {
  if (!items.length)
    return [];
  const withPlatform = items.some((screen) => typeof screen?.host?.platform === "string");
  const withReason = items.some((screen) => archiveReason(screen) !== void 0);
  const withTags = items.some((screen) => screenTags(screen).length > 0);
  const withFolder = items.some((screen) => screenFolderCell(screen) !== "");
  const withFields = items.some((screen) => screenFieldsCell(screen) !== "");
  const withLocation = items.some((screen) => screenLocationCell(screen) !== "");
  const withAssignment = items.some((screen) => screen?.effective_playlist && screen.effective_playlist.source !== "default");
  const withUpgrade = anyManifestUpgrade(items, now);
  const withHealth = items.some((screen) => screenHealthIssues(screen).length > 0);
  const rows = items.map((screen) => [
    screen?.id ?? "",
    screen?.label ?? "",
    screen?.state ?? "",
    ...withPlatform ? [screen?.host?.platform ?? ""] : [],
    ...withReason ? [archiveReason(screen) ?? ""] : [],
    ...withTags ? [screenTags(screen).join(",")] : [],
    ...withFolder ? [screenFolderCell(screen)] : [],
    ...withFields ? [screenFieldsCell(screen)] : [],
    ...withLocation ? [screenLocationCell(screen)] : [],
    ...withAssignment ? [effectivePlaylistText(screen?.effective_playlist, screen?.takeover, screen?.timezone) ?? ""] : [],
    ...withHealth ? [screenHealthIssues(screen).join(", ") || (screen?.health ? "ok" : "")] : [],
    ...withUpgrade ? [manifestUpgradeCell(screen, now) ?? ""] : [],
    ...screen?.recovery_pending?.expires_at ? ["recovery pending until ".concat(screen.recovery_pending.expires_at)] : [],
    ...applicationsUnsupportedAt(screen) ? ["applications unsupported"] : []
  ]);
  const optional = [
    [withPlatform, "PLATFORM"],
    [withReason, "REASON"],
    [withTags, "TAGS"],
    [withFolder, "FOLDER"],
    [withFields, "FIELDS"],
    [withLocation, "LOCATION"],
    [withAssignment, "ASSIGNED"],
    [withHealth, "HEALTH"],
    [withUpgrade, "UPGRADE"]
  ];
  const header = ["ID", "LABEL", "STATE", ...optional.filter(([shown]) => shown).map(([, name]) => name)];
  const widths = header.map((cell, index) => Math.max(cell.length, ...rows.map((row) => (row[index] ?? "").length)));
  const render = (row) => row.map((cell, index) => index < widths.length ? cell.padEnd(widths[index]) : cell).join("  ").trimEnd();
  return [render(header), ...rows.map(render)];
}
var ARCHIVE_REASON_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;
function archiveReason(screen) {
  const reason = screen?.state === "archived" ? screen.archive_reason : void 0;
  return typeof reason === "string" && ARCHIVE_REASON_PATTERN.test(reason) ? reason : void 0;
}
var ARCHIVE_REASON_TEXT = {
  project: "An project or dashboard request archived it.",
  device_reset: "The player was reset on the display. Its key is still bound to this screen. If the display now shows a pairing code, screen show may report recovery_pending: screen recover moves this screen to the display's new key and retires the old one, and the screen stays archived until screen unarchive.",
  device_unpair: "The paired browser unpaired itself. Its device credential is still bound to this screen.",
  replaced: "A screen replace moved this screen's device onto another screen, so this screen keeps no device binding."
};
function archivedLines(screen) {
  if (screen?.state !== "archived")
    return [];
  const reason = archiveReason(screen);
  const at = serverInstant(screen.archived_at);
  const id = typeof screen.id === "string" && screen.id ? screen.id : "<id>";
  return [
    "Archived".concat(reason ? " (".concat(reason, ")") : "").concat(at ? " at ".concat(at) : ""),
    ...reason && ARCHIVE_REASON_TEXT[reason] ? [ARCHIVE_REASON_TEXT[reason]] : [],
    // A replaced screen holds no key, so there is nothing for unarchive to re-admit.
    reason === "replaced" ? "screen unarchive cannot restore it; screen delete ".concat(id, " removes it.") : "Restore with screen unarchive ".concat(id, ". It re-admits the same key, so a display that still holds it resumes without re-pairing.")
  ];
}
function applicationsUnsupportedAt(screen) {
  return serverInstant(screen?.applications_unsupported?.at);
}
function serverInstant(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T[0-9:.]+(?:Z|[+-]\d{2}:\d{2})$/i.test(value) && !Number.isNaN(Date.parse(value)) ? value : void 0;
}
function applicationsUnsupportedLines(screen) {
  const at = applicationsUnsupportedAt(screen);
  if (!at)
    return [];
  return [
    "This player can't show applications or web pages (since ".concat(at, ")."),
    "Its manifest is unchanged: the player skips application and iframe primitives, and skips a page left with none."
  ];
}
function hostLines(host, updatedAt) {
  if (!host || typeof host !== "object")
    return [];
  const device = host.device ?? {};
  return humanLines("Host", [
    ["platform", host.platform],
    ["asset_id", device.asset_id],
    ["location", device.location],
    ["host_version", host.host_version],
    ["model", device.model],
    ["manufacturer", device.manufacturer],
    ["firmware", device.firmware],
    ["serial", device.serial],
    ["duid", device.duid],
    ["mac", device.mac],
    ["capabilities", Array.isArray(host.capabilities) && host.capabilities.length ? host.capabilities.join(", ") : void 0],
    ["updated_at", updatedAt]
  ]).split("\n");
}
function recoveryPendingLine(screen) {
  const pending = screen?.recovery_pending;
  const expiresAt = pending?.expires_at;
  if (!expiresAt)
    return [];
  const host = pending?.host && typeof pending.host === "object" ? pending.host : void 0;
  const text = (value) => typeof value === "string" && value.trim() ? value.trim() : void 0;
  const name = [text(host?.manufacturer), text(host?.platform), text(host?.model)].filter((part) => part !== void 0).join(" ");
  const firmware = text(host?.firmware);
  const described = [name || void 0, firmware ? "firmware ".concat(firmware) : void 0].filter((part) => part !== void 0).join(", ");
  return [
    "Recovery pending until ".concat(expiresAt).concat(described ? ": ".concat(described) : ""),
    "Confirm with screen recover <id>; nothing is rebound until then.",
    ...described ? ["Compare the reported model and firmware with the display you expect before confirming."] : []
  ];
}
var STORAGE_STALE_MS = 24 * 60 * 60 * 1e3;
function storageLines(screen, now) {
  const storage = screen?.storage;
  if (!storage || typeof storage !== "object")
    return [];
  const receivedMs = Date.parse(storage.received_at);
  const stale = Number.isFinite(receivedMs) && now.getTime() - receivedMs > STORAGE_STALE_MS;
  const plan = storage.plan;
  const planSummary = [plan?.fit, plan?.transition ? "".concat(plan.transition, " transition") : void 0].filter((part) => part !== void 0).join(", ");
  const excludedPages = Array.isArray(plan?.excluded_pages) ? plan.excluded_pages.length : void 0;
  const transfer = storage.transfer_24h;
  const transferred = transfer.new + transfer.refetch + transfer.repair + transfer.failed;
  const transferSummary = transferred === 0 ? "0 B" : "".concat(formatBytes(transferred), " (new ").concat(formatBytes(transfer.new), ", refetch ").concat(formatBytes(transfer.refetch), ", repair ").concat(formatBytes(transfer.repair), ", failed ").concat(formatBytes(transfer.failed), ")");
  const forecast = screen?.storage_forecast;
  const shortfall = screen?.storage_shortfall;
  return humanLines(stale ? "Storage (stale)" : "Storage", [
    ["received_at", storage.received_at],
    ["capacity", formatBytes(storage.cache.capacity_bytes)],
    ["used", formatBytes(storage.cache.house_used_bytes)],
    ["durability", storage.durability],
    ["plan", planSummary],
    ["excluded pages", excludedPages === void 0 ? void 0 : String(excludedPages)],
    ["transferred in 24h", transferSummary],
    ["forecast", forecast?.fit ? "".concat(forecast.fit, " (manifest ").concat(forecast.manifest_revision, ")") : void 0],
    ["shortfall", shortfall ? "needs ".concat(formatBytes(shortfall.required_bytes), ", capacity ").concat(formatBytes(shortfall.capacity_bytes)).concat(serverInstant(shortfall.at) ? " (since ".concat(shortfall.at, ")") : "") : void 0]
  ]).split("\n");
}
var handleScreenProvision = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const openMode = flagBool(args.flags, "open");
  const printMode = flagBool(args.flags, "print-url") || !openMode;
  if (openMode === printMode) {
    throw usageError("screen provision requires exactly one of --open or --print-url.");
  }
  const label = flagString(args.flags, "name");
  const folder = flagString(args.flags, "folder");
  const folderId = folder === void 0 ? void 0 : screenFolderId(folder, "--folder");
  const enrollmentRuntime = {
    fs: { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir },
    now: runtime.now,
    sleep: runtime.sleep
  };
  const retry = await provisionRetryState({
    resolved,
    runtime: enrollmentRuntime,
    ...label ? { label } : {},
    ...folderId ? { folderId } : {},
    ...flagString(args.flags, "idempotency-key") ? { requestedKey: flagString(args.flags, "idempotency-key") } : {}
  });
  const request = { ...label ? { label } : {}, ...folderId ? { folder_id: folderId } : {} };
  let response;
  try {
    response = await client.call({
      method: "POST",
      path: "/api/screens/provision",
      idempotent: true,
      idempotencyKey: retry.idempotency_key,
      body: request
    });
  } catch (error) {
    if (error instanceof CliError && error.problem.code === "provisioning_expired") {
      await clearProvisionRetryState(resolved, enrollmentRuntime, retry.idempotency_key);
    }
    throw error;
  }
  requirePrivateNoStore(response.headers, "Browser provisioning response");
  const provisioned = response.body;
  if (!provisioned.screen?.id || !provisioned.screen.public_id || !provisioned.expires_at || Number.isNaN(Date.parse(provisioned.expires_at))) {
    throw unexpectedResponseError("Browser provisioning response does not match the generated ScreenProvisioning contract.", client.requestId, "The server may have created the screen. Run screenrig screen list to find it before provisioning again.");
  }
  const urls = validateProvisioningUrls(provisioned);
  if ("withheld" in urls) {
    await clearProvisionRetryState(resolved, enrollmentRuntime, retry.idempotency_key);
    const warning = { code: "provisioning_url_withheld", message: "The screen was created, but its provisioning URL is not shown: ".concat(urls.withheld, " Report the request_id with screenrig feedback bug, and archive the screen if it is not needed.") };
    return {
      envelope: successEnvelope({ screen_id: provisioned.screen.id, expires_at: provisioned.expires_at, url_withheld: urls.withheld }, { request_id: client.requestId, warnings: [warning] }),
      exitCode: ExitCode.Success,
      human: humanLines("Screen created; provisioning URL withheld", [
        ["screen_id", provisioned.screen.id],
        ["expires_at", provisioned.expires_at],
        ["url_withheld", urls.withheld]
      ])
    };
  }
  const opened = openMode ? await (runtime.openUrl?.(urls.provisioningUrl) ?? Promise.resolve(false)) : false;
  if (printMode || opened)
    await clearProvisionRetryState(resolved, enrollmentRuntime, retry.idempotency_key);
  const data = {
    screen_id: provisioned.screen.id,
    ...provisioned.screen.folder_id ? { folder_id: provisioned.screen.folder_id } : {},
    public_url: urls.publicUrl,
    expires_at: provisioned.expires_at,
    ...openMode ? { opened } : { provisioning_url: urls.provisioningUrl }
  };
  return {
    envelope: successEnvelope(data, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: humanLines(openMode ? "Browser provisioning" : "Sensitive one-time browser provisioning URL", [
      ["screen_id", provisioned.screen.id],
      ["folder_id", provisioned.screen.folder_id],
      ["public_url", urls.publicUrl],
      ["expires_at", provisioned.expires_at],
      ...openMode ? [["opened", opened ? "true" : "false"]] : [["provisioning_url", urls.provisioningUrl]]
    ])
  };
}, true);
function forecastLines(screenId, playlistId, forecast, now) {
  const receivedMs = forecast.received_at === null ? Number.NaN : Date.parse(forecast.received_at);
  const stale = Number.isFinite(receivedMs) && now.getTime() - receivedMs > STORAGE_STALE_MS;
  return humanLines(stale ? "Storage forecast (stale)" : "Storage forecast", [
    ["screen_id", screenId],
    ["playlist_id", playlistId],
    ["fit", forecast.fit],
    ["excluded pages", String(forecast.excluded_page_count)],
    ["required", forecast.required_bytes === null ? void 0 : formatBytes(forecast.required_bytes)],
    ["capacity", forecast.capacity_bytes === null ? void 0 : formatBytes(forecast.capacity_bytes)],
    ["basis", forecast.basis],
    ["received_at", forecast.received_at === null ? void 0 : forecast.received_at]
  ]);
}
var handleScreenPair = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const rawCode = args.positionals.slice(2).join(" ");
  if (!rawCode)
    throw usageError("screen pair requires CODE.");
  const code = canonicalPairingCode(rawCode, "screen pair CODE");
  const label = flagString(args.flags, "name");
  const folder = flagString(args.flags, "folder");
  const request = { code, ...label ? { label } : {}, ...folder !== void 0 ? { folder_id: screenFolderId(folder, "--folder") } : {} };
  const response = await client.call({
    method: "POST",
    path: "/api/screens/pair",
    idempotent: true,
    body: request
  });
  requirePrivateNoStore(response.headers, "Screen pairing response");
  const claim = response.body;
  if (!claim.screen?.id || !claim.screen.label || !claim.public_url) {
    throw usageError("Screen pairing response does not match the generated PairingClaim contract.");
  }
  const waiting = claim.screen.state === "pairing_pending" || claim.screen.online === false;
  const next = waiting ? {
    command: "screenrig screen show ".concat(claim.screen.id),
    argv: ["screen", "show", claim.screen.id],
    reason: "The Player finishes pairing the next time it contacts the service, with nothing to do on the display. screen show reports state active and online true once it has; assign a playlist with screen assign meanwhile or after."
  } : void 0;
  return {
    envelope: jsonBody(response, client.requestId, next ? { next } : void 0),
    exitCode: ExitCode.Success,
    human: humanLines("Screen paired", [
      ["code", code],
      ["screen_id", claim.screen.id],
      ["label", claim.screen.label],
      ["folder_id", claim.screen.folder_id],
      ["state", claim.screen.state],
      ["next", next ? "".concat(next.command, " (the Player finishes pairing when it next contacts the service)") : void 0]
    ])
  };
}, true);
var handleScreenShow = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const id = args.positionals[2];
  if (!id)
    throw usageError("screen show requires an id.");
  const response = await client.call({ method: "GET", path: "/api/screens/".concat(id) });
  const screen = response.body;
  const requestId = client.requestId;
  const notes = await resourceNotes(runtime, client, "screen", id);
  const warnings = [...screenStorageWarnings(id, screen, runtime.now()), ...displayWarnings(id, screen?.display)];
  return {
    envelope: jsonBody(response, requestId, void 0, [...notes.warnings, ...warnings]),
    exitCode: ExitCode.Success,
    human: [
      "Screen",
      JSON.stringify(response.body, null, 2),
      ...screenTags(screen).length ? ["Tags: ".concat(screenTags(screen).join(", "))] : [],
      ...screenFolderLine(screen),
      ...screenFactsLines(screen),
      ...screen?.fleet_link_id ? ["Created by fleet link: ".concat(screen.fleet_link_id)] : [],
      ...screenLinkSummaryLines(screen?.link),
      ...assignmentLine(screen?.effective_playlist, screen?.takeover, screen?.timezone),
      ...takeoverLine(screen?.takeover, screen?.timezone),
      ...screen?.playlist_schedule?.entries?.length ? ["Playlist schedule: ".concat(screen.playlist_schedule.entries.length, " entr").concat(screen.playlist_schedule.entries.length === 1 ? "y" : "ies").concat(screen.playlist_schedule.entries.some((entry) => entry.paused) ? ", ".concat(screen.playlist_schedule.entries.filter((entry) => entry.paused).length, " draft") : "", " (screen schedule show ").concat(screen.id, ")")] : [],
      ...suspensionLines(screen),
      ...glassLines(screen),
      ...hostLines(screen?.host, screen?.host_updated_at),
      ...archivedLines(screen),
      ...replacedByLines(screen),
      ...applicationsUnsupportedLines(screen),
      ...recoveryPendingLine(screen),
      ...warnings.map((warning) => "warning: ".concat(warning.message)),
      ...storageLines(screen, runtime.now()),
      ...manifestUpgradeLines(screen, runtime.now()),
      ...displayLines(screen?.display, screen?.timezone),
      ...rebootScheduleLines(screen?.reboot_schedule, screen?.next_reboot_at, screen?.timezone),
      ...healthLines(screen?.health),
      ...outageLines(screen),
      ...commandLines(screen),
      ...notes.lines
    ].join("\n")
  };
}, true);
var handleScreenStorageForecast = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const id = args.positionals[2];
  const playlistId = flagString(args.flags, "playlist-id");
  const playlistRevision = flagString(args.flags, "playlist-rev");
  if (!id || !playlistId)
    throw usageError("screen storage-forecast requires <id> --playlist-id.");
  const body = {
    playlist_id: playlistId,
    ...playlistRevision ? { playlist_revision: Number(playlistRevision) } : {}
  };
  const response = await client.call({
    method: "POST",
    path: "/api/screens/".concat(id, "/storage-forecast"),
    body
  });
  const forecast = response.body;
  if (!forecast || !["fits", "partial", "none_fit", "unknown"].includes(forecast.fit) || !Number.isSafeInteger(forecast.excluded_page_count) || forecast.excluded_page_count < 0 || !(forecast.required_bytes === null || Number.isSafeInteger(forecast.required_bytes) && forecast.required_bytes >= 0) || !(forecast.capacity_bytes === null || Number.isSafeInteger(forecast.capacity_bytes) && forecast.capacity_bytes >= 0) || !(forecast.received_at === null || serverInstant(forecast.received_at) !== void 0) || forecast.basis !== "reported_capacity") {
    throw usageError("Screen storage forecast response does not match the generated ScreenStorageForecastDryRun contract.");
  }
  const warnings = forecastStorageWarnings(id, forecast, runtime.now());
  return {
    envelope: jsonBody(response, client.requestId, void 0, warnings),
    exitCode: ExitCode.Success,
    human: [forecastLines(id, playlistId, forecast, runtime.now()), ...warnings.map((warning) => "warning: ".concat(warning.message))].join("\n")
  };
}, true);
var handleScreenUpdate = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const id = args.positionals[2];
  const ifMatch = flagString(args.flags, "expect-rev");
  const name = flagString(args.flags, "name");
  const playlistId = flagString(args.flags, "playlist-id");
  const clearPlaylist = flagBool(args.flags, "clear-playlist");
  const timezone = flagString(args.flags, "timezone");
  const facts = screenFactsPatch(args.flags);
  const changesFacts = facts.fields !== void 0 || facts.location !== void 0;
  if (!id || !name && !playlistId && !clearPlaylist && !timezone && !changesFacts) {
    throw usageError("screen update requires <id>, and --name, --playlist-id, --clear-playlist, --timezone, --field, --unset-field, --clear-fields, --location, or --clear-location.");
  }
  let playlist;
  if (playlistId && !timezone) {
    playlist = await assertScheduledPlaylistHasZone(client, id, playlistId);
  } else if (playlistId) {
    try {
      playlist = (await callPlaylist(client, { method: "GET", id: playlistId })).body;
    } catch {
      playlist = void 0;
    }
  }
  const body = {
    ...name ? { name } : {},
    ...clearPlaylist ? { playlist_id: null } : playlistId ? { playlist_id: playlistId } : {},
    ...timezone ? { timezone } : {},
    ...facts
  };
  const response = await client.call({ method: "PATCH", path: "/api/screens/".concat(id), idempotent: true, headers: { ...reviewNoteFrom(args), ...ifMatch ? { "if-match": quotedRevision(ifMatch) } : {} }, body });
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  const warnings = [
    ...playlistId ? aspectMismatchWarnings(id, response.body, playlist) : [],
    ...screenStorageWarnings(id, response.body, runtime.now()),
    ...playlistAnswerWarnings(response.body)
  ];
  return {
    envelope: jsonBody({ ...response, body: withoutAnswerWarnings(response.body) }, client.requestId, void 0, warnings),
    exitCode: ExitCode.Success,
    // The merged fields and the location the screen now holds, when this update changed them.
    // Tags change through screen tag; an answer that carries levels (a tag change) prints them here too.
    human: ["Updated screen ".concat(id), ...changesFacts ? screenFactsLines(response.body) : [], ...levelsLines(response.body?.levels), ...warnings.map((warning) => "warning: ".concat(warning.message))].join("\n")
  };
}, true);
var handleScreenAssign = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const playlistId = flagString(args.flags, "playlist-id");
  const ifMatch = flagString(args.flags, "expect-rev");
  if (!playlistId)
    throw usageError("screen assign requires <id> --playlist-id.");
  const target = screenTarget(args, "screen assign");
  if (target.kind === "fleet") {
    rejectFleetRevision(args, "screen assign");
    return screenFleetAction(client, runtime, "Fleet assign", target.selector, { type: "assign", playlist_id: playlistId }, void 0, reviewNoteFrom(args));
  }
  const id = target.id;
  const playlist = await assertScheduledPlaylistHasZone(client, id, playlistId);
  const body = { playlist_id: playlistId };
  const response = await client.call({
    method: "PATCH",
    path: "/api/screens/".concat(id),
    idempotent: true,
    headers: { ...reviewNoteFrom(args), ...ifMatch ? { "if-match": quotedRevision(ifMatch) } : {} },
    body
  });
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  const warnings = [
    ...aspectMismatchWarnings(id, response.body, playlist),
    ...screenStorageWarnings(id, response.body, runtime.now()),
    ...playlistAnswerWarnings(response.body)
  ];
  return {
    envelope: jsonBody({ ...response, body: withoutAnswerWarnings(response.body) }, client.requestId, void 0, warnings),
    exitCode: ExitCode.Success,
    human: ["Assigned playlist ".concat(playlistId, " to ").concat(id), ...warnings.map((warning) => "warning: ".concat(warning.message))].join("\n")
  };
}, true);
var handleScreenSetTimezone = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const id = args.positionals[2];
  const timezone = flagString(args.flags, "timezone");
  const ifMatch = flagString(args.flags, "expect-rev");
  if (!id || !timezone)
    throw usageError("screen set-timezone requires <id> --timezone.");
  const body = { timezone };
  const response = await client.call({
    method: "PATCH",
    path: "/api/screens/".concat(id),
    idempotent: true,
    headers: ifMatch ? { "if-match": quotedRevision(ifMatch) } : void 0,
    body
  });
  const lifted = playlistAnswerWarnings(response.body);
  return {
    envelope: jsonBody({ ...response, body: withoutAnswerWarnings(response.body) }, client.requestId, void 0, lifted),
    exitCode: ExitCode.Success,
    human: ["Set timezone ".concat(timezone, " on ").concat(id), ...lifted.map((warning) => "warning: ".concat(warning.message))].join("\n")
  };
}, true);
async function screenWallPatch(args, runtime, resolved, id, wall) {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const ifMatch = flagString(args.flags, "expect-rev");
  const body = { wall };
  let response;
  try {
    response = await client.call({
      method: "PATCH",
      path: "/api/screens/".concat(encodeURIComponent(id)),
      idempotent: true,
      headers: ifMatch ? { "if-match": quotedRevision(ifMatch) } : void 0,
      body
    });
  } catch (error) {
    throw wallProblem(error, id);
  }
  return { response, client, screen: response.body };
}
var handleScreenWallSet = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  const outputs = flagString(args.flags, "outputs");
  const arrangement = flagString(args.flags, "arrangement");
  if (!id || !outputs || !arrangement)
    throw usageError("screen wall set requires <id> --outputs --arrangement.");
  const wall = wallFromFlags(outputs, arrangement, flagString(args.flags, "rotation"), flagString(args.flags, "columns"));
  const { response, client, screen } = await screenWallPatch(args, runtime, resolved, id, wall);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Set video wall on ".concat(id, ": ").concat(wallLine(wall)),
      "Once the screen plays a playlist with a matching format, every display shows its number and name for 20 seconds after a change; playlist init --screen-id writes that format.",
      ...screen?.revision !== void 0 ? ["revision: ".concat(screen.revision)] : []
    ].join("\n")
  };
}, true);
var handleScreenWallClear = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("screen wall clear requires <id>.");
  const { response, client, screen } = await screenWallPatch(args, runtime, resolved, id, null);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Cleared the video wall on ".concat(id), ...screen?.revision !== void 0 ? ["revision: ".concat(screen.revision)] : []].join("\n")
  };
}, true);
async function screenArchiveUnarchiveAction(args, runtime, resolved, action) {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const id = args.positionals[2];
  const revision2 = flagString(args.flags, "expect-rev");
  if (!id)
    throw usageError("screen ".concat(action, " requires <id>."));
  const response = await client.call({
    method: "POST",
    path: "/api/screens/".concat(id, "/").concat(action),
    idempotent: true,
    headers: revision2 ? { "if-match": quotedRevision(revision2) } : void 0
  });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: action === "archive" ? "Archived screen ".concat(id) : "Unarchived screen ".concat(id)
  };
}
var handleScreenArchive = commandHandler(async (args, runtime, resolved) => {
  return screenArchiveUnarchiveAction(args, runtime, resolved, "archive");
}, true);
var handleScreenUnarchive = commandHandler(async (args, runtime, resolved) => {
  return screenArchiveUnarchiveAction(args, runtime, resolved, "unarchive");
}, true);
var handleScreenDelete = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const id = args.positionals[2];
  const ifMatch = flagString(args.flags, "expect-rev");
  if (!id)
    throw usageError("screen delete requires <id>.");
  const response = await client.call({
    method: "DELETE",
    path: "/api/screens/".concat(id),
    idempotent: true,
    headers: ifMatch ? { "if-match": quotedRevision(ifMatch) } : void 0
  });
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: "Deleted screen ".concat(id) };
}, true);
var handleScreenRotatePublicId = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const id = args.positionals[2];
  const revision2 = flagString(args.flags, "expect-rev");
  if (!id)
    throw usageError("screen rotate-public-id requires <id>.");
  const response = await client.call({
    method: "POST",
    path: "/api/screens/".concat(id, "/public-id/rotate"),
    idempotent: true,
    headers: revision2 ? { "if-match": quotedRevision(revision2) } : void 0
  });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: "Rotated public id for ".concat(id)
  };
}, true);
var RECOVERY_PROBLEM_MESSAGES = {
  recovery_not_offered: {
    detail: "No recovery is pending for this screen. A display has to start pairing and report this screen's identifiers before recovery can be confirmed.",
    next: { command: "screenrig screen show <id>", reason: "Check recovery_pending. If the display is showing a pairing code, pair it as a new screen instead." }
  },
  recovery_expired: {
    detail: "The recovery offer for this screen has expired because the display's pairing session lapsed. Nothing was rebound.",
    next: { command: "screenrig screen show <id>", reason: "Restart pairing on the display; a new offer appears as recovery_pending." }
  },
  recovery_ambiguous: {
    detail: "The display's identifiers are attached to more than one screen, so recovery cannot be offered. Nothing was rebound.",
    next: { command: "screenrig screen pair <code>", reason: "Pair the display as a new screen, or archive the duplicate screens first." }
  }
};
var handleScreenRecover = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const id = args.positionals[2];
  if (!id)
    throw usageError("screen recover requires <id>.");
  const revision2 = flagString(args.flags, "expect-rev");
  let response;
  try {
    response = await client.call({
      method: "POST",
      path: "/api/screens/".concat(id, "/recovery/confirm"),
      idempotent: true,
      ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
    });
  } catch (error) {
    const mapped = error instanceof CliError ? RECOVERY_PROBLEM_MESSAGES[error.problem.code] : void 0;
    if (!(error instanceof CliError) || !mapped)
      throw error;
    const next = { ...mapped.next, command: mapped.next.command.replace("<id>", id) };
    throw new CliError({ ...error.problem, detail: mapped.detail, next: error.problem.next ?? next }, error.exitCode, error.warnings);
  }
  const screen = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      humanLines("Recovered screen ".concat(id), [
        ["screen_id", screen?.id],
        ["label", screen?.label],
        ["state", screen?.state],
        ["revision", screen?.revision === void 0 ? void 0 : String(screen.revision)],
        ["public_id", screen?.public_id],
        ["platform", screen?.host?.platform]
      ]),
      "The display now runs this screen with its new key; the previous key retires after a fifteen-minute grace window."
    ].join("\n")
  };
}, true);
var handleScreenReload = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const target = screenTarget(args, "screen reload");
  const lifetime = commandLifetime(args);
  if (target.kind === "fleet") {
    rejectFleetRevision(args, "screen reload");
    return screenFleetAction(client, runtime, "Fleet reload", target.selector, { type: "reload", ...lifetime });
  }
  const id = target.id;
  const revision2 = flagString(args.flags, "expect-rev");
  let response;
  try {
    response = await client.call({
      method: "POST",
      path: "/api/screens/".concat(encodeURIComponent(id), "/reload"),
      idempotent: true,
      ...lifetime.expires_in_s === void 0 ? {} : { body: lifetime },
      ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
    });
  } catch (error) {
    if (!(error instanceof CliError) || error.problem.next)
      throw error;
    if (error.problem.code === "resource_conflict") {
      throw new CliError({
        ...error.problem,
        next: { command: "screenrig screen show ".concat(id), reason: "A screen still waiting to pair has no Player to reload. Pair it first." }
      }, error.exitCode, error.warnings);
    }
    throw error;
  }
  const accepted = response.body ?? {};
  if (typeof accepted.reload_id !== "string" || !/^[A-Za-z0-9_-]{8,64}$/.test(accepted.reload_id) || serverInstant(accepted.expires_at) === void 0 || !validDelivery(accepted.state)) {
    throw usageError("Screen reload response does not match the generated ScreenReloadAccepted contract.");
  }
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      humanLines("Reload accepted", [
        ["screen_id", id],
        ["reload_id", accepted.reload_id],
        ["state", accepted.state],
        ["expires_at", accepted.expires_at]
      ]),
      accepted.state === "queued" ? "The screen is offline, so the reload waits: it is sent when the screen comes online before expires_at. Cancel it with screen command cancel ".concat(id, " ").concat(accepted.reload_id, ".") : "The Player reloads once; a Player that reloaded in the last ten minutes ignores it."
    ].join("\n")
  };
}, true);
function commandLifetime(args) {
  const value = flagString(args.flags, "expires-in");
  return value === void 0 ? {} : { expires_in_s: expiresInSeconds(value) };
}
function validDelivery(state) {
  return state === "queued" || state === "sent";
}
async function screenFleetAction(client, runtime, title, selector, action, recoverySupersede, headers) {
  const body = { selector, action };
  let response;
  let after;
  const result = { action: action.type, matched: 0, succeeded: 0, failed: 0, results: [] };
  let total;
  const answerWarnings = [];
  const pageLevels = [];
  while (true) {
    try {
      response = await client.call({
        method: "POST",
        path: "/api/screens/actions",
        idempotent: true,
        body,
        ...after === void 0 ? {} : { query: { after } },
        recoveryQuery: {},
        retainRecoveryOnRefusal: true,
        ...recoverySupersede ? { recoverySupersede } : {},
        ...headers && Object.keys(headers).length ? { headers } : {}
      });
    } catch (error) {
      if (error instanceof CliError && error.problem.status === 429 && error.problem.retry_after_seconds) {
        await runtime.sleep(error.problem.retry_after_seconds * 1e3);
        continue;
      }
      throw error;
    }
    const pending = pendingReviewOf(response);
    if (pending) {
      if (after !== void 0)
        throw unexpectedResponseError("A fleet continuation answered pending_review after screens already changed; rerun the identical command to resume safely.");
      return { ...pendingReviewResult(response, pending, client.requestId), keepRecoveryUntilOutput: true };
    }
    const page = screenActionResult(response.body, action.type);
    if ((page.offset ?? 0) !== result.matched || total !== void 0 && page.total !== total) {
      throw unexpectedResponseError("Fleet continuation does not match the selected screens; rerun the identical command to resume safely.");
    }
    if (page.total !== void 0)
      total = page.total;
    result.matched += page.matched;
    result.succeeded += page.succeeded;
    result.failed += page.failed;
    result.results.push(...page.results);
    answerWarnings.push(...playlistWarnings(page.warnings ?? []));
    pageLevels.push(page.levels);
    if (page.next_cursor === void 0) {
      if (response.status !== 200 || total !== void 0 && result.matched !== total) {
        throw unexpectedResponseError("Fleet action ended without all selected screens; rerun the identical command to resume safely.");
      }
      break;
    }
    if (response.status !== 202 || page.next_cursor !== String(result.matched)) {
      throw unexpectedResponseError("Fleet continuation cursor does not match its results.");
    }
    after = page.next_cursor;
    const wait = Number(response.headers["retry-after"] ?? 0);
    if (!page.matched && (!Number.isFinite(wait) || wait <= 0)) {
      throw unexpectedResponseError("Fleet action made no progress and supplied no Retry-After; rerun the identical command to resume safely.");
    }
    if (wait > 0 && Number.isFinite(wait))
      await runtime.sleep(wait * 1e3);
  }
  const outcome = fleetOutcome(result);
  const displayNotes = result.results.flatMap((item) => item.status === "ok" ? displayWarnings(item.screen_id, item.display) : []);
  const levels = sumLevels(pageLevels);
  if (levels)
    result.levels = levels;
  return {
    envelope: jsonBody({ ...response, body: result }, client.requestId, void 0, [...outcome.warnings, ...answerWarnings, ...displayNotes]),
    exitCode: outcome.exitCode,
    human: [
      fleetHumanLines(title, result, (item) => {
        if (Array.isArray(item.tags))
          return "tags ".concat(item.tags.filter((tag) => /^[A-Za-z0-9]{1,32}$/.test(tag)).join(",") || "(none)");
        if (typeof item.revision === "number")
          return "revision ".concat(item.revision);
        const maintenance = item.command && (item.command.command === "clear_cache" || item.command.command === "restart_app" || item.command.command === "update") ? commandResultText(item.command.command, item.command) : void 0;
        const command = commandResultText("reload", item.reload) ?? commandResultText("reboot", item.reboot) ?? maintenance;
        if (command)
          return command;
        if (item.toast && serverInstant(item.toast.expires_at))
          return "toast expires ".concat(item.toast.expires_at);
        return void 0;
      }),
      ...levelsLines(levels),
      ...outcome.warnings.map((warning) => "warning: ".concat(warning.message)),
      ...displayNotes.map((warning) => "warning: ".concat(warning.message))
    ].join("\n"),
    keepRecoveryUntilOutput: true
  };
}
var handleScreenTag = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  for (const flag of ["set", "add", "remove"])
    requireFlagValue(args, flag, "Lobby");
  const set = flagString(args.flags, "set");
  const add = flagString(args.flags, "add");
  const remove = flagString(args.flags, "remove");
  const clear = flagBool(args.flags, "clear");
  if ([set, add, remove].filter((value) => value !== void 0).length + (clear ? 1 : 0) !== 1) {
    throw usageError("Provide exactly one of --set or --add or --remove or --clear.");
  }
  const tags = set !== void 0 ? screenTagList(set, "--set") : add !== void 0 ? screenTagList(add, "--add") : remove !== void 0 ? screenTagList(remove, "--remove") : [];
  const target = screenTarget(args, "screen tag");
  if (target.kind === "fleet") {
    rejectFleetRevision(args, "screen tag");
    const action = add !== void 0 ? { type: "add_tags", tags } : remove !== void 0 ? { type: "remove_tags", tags } : { type: "set_tags", tags };
    return screenFleetAction(client, runtime, "Fleet tag", target.selector, action);
  }
  const id = target.id;
  let ifMatch = flagString(args.flags, "expect-rev");
  let next = tags;
  if (add !== void 0 || remove !== void 0) {
    const current = (await client.call({ method: "GET", path: "/api/screens/".concat(encodeURIComponent(id)) })).body;
    if (!current || current.id !== id || !Number.isSafeInteger(current.revision) || current.revision < 1) {
      throw usageError("Screen response has invalid identity or revision.");
    }
    const stored = Array.isArray(current.tags) ? current.tags : [];
    next = add !== void 0 ? [...stored, ...tags.filter((tag) => !stored.includes(tag))] : stored.filter((tag) => !tags.includes(tag));
    if (next.length > SCREEN_TAGS_MAX) {
      throw usageError("Screen ".concat(id, " would carry ").concat(next.length, " tags; a screen carries at most ").concat(SCREEN_TAGS_MAX, ". Remove tags first or use --set."));
    }
    ifMatch ??= String(current.revision);
  }
  const body = { tags: next };
  const derived = add !== void 0 || remove !== void 0;
  const response = await client.call({
    method: "PATCH",
    path: "/api/screens/".concat(encodeURIComponent(id)),
    idempotent: true,
    headers: ifMatch ? { "if-match": quotedRevision(ifMatch) } : void 0,
    body,
    // The body and guard derive from the read, so a rerun after an ambiguous
    // failure fingerprints differently; it supersedes the obsolete entry.
    ...derived ? { recoverySupersede: JSON.stringify(["screen tag", id, add !== void 0 ? "add" : "remove", tags, flagString(args.flags, "expect-rev") ?? null]) } : {}
  });
  const screen = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      humanLines("Tagged screen ".concat(id), [
        ["tags", screenTags(screen).join(", ") || "(none)"],
        ["revision", typeof screen?.revision === "number" ? String(screen.revision) : void 0]
      ]),
      ...levelsLines(screen?.levels)
    ].join("\n")
  };
}, true);
var handleScreenToast = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  return screenToast(args, runtime, client);
}, true);
var handleScreenScreenshot = commandHandler(async (args, runtime, resolved) => {
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  return loggerOf(runtime).withLocal({ op: "screenshot.capture", message: "screen screenshot" }, () => screenScreenshot(args, runtime, client));
}, true);
async function screenToast(args, runtime, client) {
  const body = toastWriteFromArgs(args);
  const target = screenTarget(args, "screen toast");
  if (target.kind === "fleet") {
    return screenFleetAction(client, runtime, "Fleet toast", target.selector, { type: "toast", ...body });
  }
  const id = target.id;
  const response = await client.call({
    method: "POST",
    path: "/api/screens/".concat(id, "/toast"),
    idempotent: true,
    body
  });
  const accepted = response.body ?? {};
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: humanLines("Toast accepted", [
      ["screen_id", id],
      ["level", body.level],
      ["expires_at", accepted.expires_at]
    ])
  };
}
function toastWriteFromArgs(args) {
  if (args.flags.level === true) {
    throw usageError("--level requires a value, such as --level info.");
  }
  if (args.flags.text === true) {
    throw usageError("--text requires a value.");
  }
  if (args.flags["duration-ms"] === true) {
    throw usageError("--duration-ms requires a value.");
  }
  const rawLevel = flagString(args.flags, "level");
  const rawText = flagString(args.flags, "text");
  if (rawText === void 0) {
    throw usageError("screen toast requires <id> and --text TEXT.");
  }
  const level = rawLevel ?? TOAST_DEFAULT_LEVEL;
  if (!isScreenToastLevel(level)) {
    throw usageError("--level must be error, alert, or info. Agent toasts use --level info.");
  }
  const text = trimToastText(rawText);
  const textLength = [...text].length;
  if (textLength < 1 || textLength > TOAST_TEXT_MAX || toastTextHasDisallowedControl(text) || toastLineCount(text) > TOAST_MAX_LINES) {
    throw usageError("Toast text must be 1 to 120 characters, use only line feed as a line break, and have at most three lines.");
  }
  const body = { level, text };
  if (args.flags["duration-ms"] !== void 0) {
    const durationMs = flagNumber(args.flags, "duration-ms");
    if (durationMs === void 0 || !Number.isInteger(durationMs) || durationMs < TOAST_DURATION_MIN || durationMs > TOAST_DURATION_MAX) {
      throw usageError("--duration-ms must be an integer between 2000 and 60000.");
    }
    body.duration_ms = durationMs;
  }
  return body;
}
var SCREENSHOT_FAILURE_DETAIL = {
  timed_out: "The Player did not upload the screenshot before the request expired (timed_out).",
  unsupported_surface: "The Player cannot capture the page it is showing now (unavailable: unsupported_surface).",
  capture_failed: "The Player tried to capture its screen and failed (unavailable: capture_failed).",
  unavailable: "The Player reported the screenshot as unavailable.",
  deadline: "No screenshot arrived before --timeout; the Player may still upload it (pending).",
  offline: "The screen is offline, so its Player cannot take a screenshot."
};
var SCREENSHOT_FAILURE_HINT = {
  timed_out: "Check the screen is online with screenrig screen show ID, then run screen screenshot again; every run requests a new capture.",
  unsupported_surface: "Capture again while the screen shows an image, video or application page; screenrig screen show ID shows what it plays.",
  capture_failed: "Run screen screenshot again; every run requests a new capture.",
  unavailable: "Run screen screenshot again; every run requests a new capture.",
  deadline: "Run screen screenshot again with a larger --timeout; every run requests a new capture.",
  offline: "Bring the Player back online (screenrig screen show ID shows last_online_at), then run screen screenshot again."
};
function screenshotUnavailable(requestId, failure, lastSeen, reportedDisplay) {
  const display = reportedDisplayOf(reportedDisplay);
  let detail = failure === "offline" && lastSeen ? "The screen is offline (last online ".concat(lastSeen, "), so its Player cannot take a screenshot.") : SCREENSHOT_FAILURE_DETAIL[failure];
  if (display?.power)
    detail += " The Player last reported display power ".concat(display.power, " at ").concat(display.reported_at).concat(display.stale ? " (stale report)" : "", ".");
  const hint = display && !display.stale && (display.power === "off" || display.power === "standby") ? "Request a new screenshot when the display is on." : SCREENSHOT_FAILURE_HINT[failure];
  return new CliError(makeProblem("screenshot_unavailable", "Screenshot is not available", 409, detail, {
    request_id: requestId,
    hint,
    display
  }));
}
function screenshotFailure(status) {
  if (status.state === "timed_out")
    return "timed_out";
  return status.reason === "unsupported_surface" || status.reason === "capture_failed" ? status.reason : "unavailable";
}
async function resolveScreenshotOutput(cwd, id, flags) {
  return resolveDownloadOutput(cwd, "./".concat(id, ".webp"), flags);
}
async function screenScreenshot(args, runtime, client) {
  const target = screenTarget(args, "screen screenshot");
  if (target.kind === "fleet")
    return screenScreenshotFleet(args, runtime, client, target.selector);
  const id = target.id;
  if (!isScreenId(id)) {
    throw usageError("screen screenshot requires <id>.");
  }
  const outputPath = await resolveScreenshotOutput(runtime.cwd(), id, args.flags);
  const saved = await captureScreenshot(runtime, client, id, outputPath, screenshotOptions(args, runtime), client.idempotencyKey);
  const screen = await screenAfterScreenshot(client, id);
  const picture = screen?.glass?.picture;
  const data = { ...saved, ...picture ? { picture } : {} };
  return {
    envelope: successEnvelope(data, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: [
      humanLines("Screenshot saved", [
        ["screen_id", data.screen_id],
        ["capture_id", data.capture_id],
        ["path", data.path],
        ["bytes", String(data.bytes)],
        ["sha256", data.sha256],
        ["width", String(data.width)],
        ["height", String(data.height)],
        ["frame", frameRow(data.frame)]
      ]),
      ...flatFrameNote(data.frame, screen),
      ...glassLines(screen)
    ].join("\n")
  };
}
async function screenAfterScreenshot(client, id) {
  try {
    return (await client.call({ method: "GET", path: "/api/screens/".concat(id) })).body;
  } catch {
    return void 0;
  }
}
function screenshotOptions(args, runtime) {
  const { timeoutMs, pollMs } = screenshotTiming(args);
  const visible = flagBool(args.flags, "human") || runtime.isStderrTty?.() === true;
  return {
    timeoutMs,
    pollMs,
    explicitTimeout: flagNumber(args.flags, "timeout") !== void 0,
    pace: { until: 0 },
    ...visible ? { notify: (line) => {
      runtime.stderr.write("".concat(line, "\n"));
    } } : {}
  };
}
function screenshotTiming(args) {
  const timeoutMs = flagNumber(args.flags, "timeout") ?? SCREENSHOT_DEFAULT_WAIT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0) {
    throw usageError("--timeout must be a non-negative number of milliseconds.");
  }
  if (args.flags["poll-ms"] !== void 0) {
    const pollMs2 = flagNumber(args.flags, "poll-ms");
    if (pollMs2 === void 0 || !Number.isInteger(pollMs2) || pollMs2 < 1) {
      throw usageError("--poll-ms must be a positive integer.");
    }
  }
  const pollMs = flagNumber(args.flags, "poll-ms") ?? SCREENSHOT_DEFAULT_POLL_MS;
  return { timeoutMs, pollMs };
}
var SCREENSHOT_RETRY_MAX = 6;
var SCREENSHOT_BACKOFF_MS = 500;
var SCREENSHOT_BACKOFF_CAP_MS = 8e3;
var SCREENSHOT_RETRY_AFTER_CAP_MS = 12e4;
function transientScreenshotFailure(error) {
  return error instanceof CliError && error.problem.code !== "file_error" && (error.problem.status >= 500 || error.problem.status === 408 || error.problem.status === 429);
}
var ScreenshotRetry = class {
  runtime;
  id;
  options;
  attempts = 0;
  deadline;
  constructor(runtime, id, options) {
    this.runtime = runtime;
    this.id = id;
    this.options = options;
    this.deadline = options.timeoutMs === 0 ? Number.POSITIVE_INFINITY : Date.now() + options.timeoutMs;
  }
  async wait(error) {
    const after = error.problem.retry_after_seconds;
    const delay = typeof after === "number" ? after * 1e3 : Math.min(SCREENSHOT_BACKOFF_MS * 2 ** this.attempts, SCREENSHOT_BACKOFF_CAP_MS);
    if (typeof after === "number" && error.problem.status === 429) {
      this.options.pace.until = Math.max(this.options.pace.until, Date.now() + delay);
    }
    if (this.attempts >= SCREENSHOT_RETRY_MAX)
      throw this.exhausted(error);
    if (Date.now() + delay > this.deadline) {
      if (this.options.explicitTimeout || typeof after !== "number" || delay > SCREENSHOT_RETRY_AFTER_CAP_MS)
        throw this.exhausted(error);
      this.deadline = Date.now() + delay + SCREENSHOT_DEFAULT_WAIT_MS;
    }
    this.attempts += 1;
    const reason = error.problem.code === "transport_error" || error.problem.code === "timeout" ? error.problem.code : "".concat(error.problem.code, " (HTTP ").concat(error.problem.status, ")");
    this.options.notify?.("screen screenshot ".concat(this.id, ": ").concat(reason, "; retrying in ").concat(Math.ceil(delay / 1e3), " s").concat(typeof after === "number" ? " as Retry-After asks" : "", " (retry ").concat(this.attempts, " of ").concat(SCREENSHOT_RETRY_MAX, ")."));
    await this.runtime.sleep(delay);
  }
  /** Sleep before the next poll, never past the deadline. */
  async poll() {
    await this.runtime.sleep(Math.max(1, Math.min(this.options.pollMs, this.deadline - Date.now())));
  }
  /** Hold a new capture request until a shared Retry-After has passed. */
  async paced() {
    const wait = this.options.pace.until - Date.now();
    if (wait <= 0)
      return;
    this.options.notify?.("screen screenshot ".concat(this.id, ": waiting ").concat(Math.ceil(wait / 1e3), " s for the screenshot rate limit."));
    if (Date.now() + wait > this.deadline && this.options.explicitTimeout)
      return;
    if (Date.now() + wait > this.deadline)
      this.deadline = Date.now() + wait + SCREENSHOT_DEFAULT_WAIT_MS;
    await this.runtime.sleep(wait);
  }
  exhausted(error) {
    const tried = this.attempts ? "screen screenshot retried this ".concat(this.attempts, " time").concat(this.attempts === 1 ? "" : "s", " with backoff before giving up.") : "No retry fit before --timeout.";
    const hint = "".concat(error.problem.hint ? "".concat(error.problem.hint, " ") : "").concat(tried, " Run screen screenshot again later; every run requests a new capture.");
    return new CliError({ ...error.problem, hint }, error.exitCode, error.warnings);
  }
};
async function requestScreenshotCapture(client, id, key, retry) {
  let lastFailure;
  while (true) {
    if (lastFailure) {
      await retry.wait(lastFailure);
      try {
        const current = (await client.call({ method: "GET", path: "/api/screens/".concat(id, "/screenshot/status") })).body;
        if (current?.state === "pending" && typeof current.capture_id === "string" && current.capture_id.length > 0)
          return current.capture_id;
      } catch (error) {
        if (!transientScreenshotFailure(error))
          throw error;
        lastFailure = error;
        continue;
      }
    }
    let acceptedResponse;
    try {
      await retry.paced();
      acceptedResponse = await client.call({ method: "POST", path: "/api/screens/".concat(id, "/screenshot"), idempotent: true, idempotencyKey: key });
    } catch (error) {
      if (!transientScreenshotFailure(error))
        throw error;
      lastFailure = error;
      continue;
    }
    const captureId = (acceptedResponse.body ?? {}).capture_id;
    if (typeof captureId !== "string" || captureId.length === 0) {
      throw new CliError(makeProblem("invalid_request", "Request is invalid", 400, "Screenshot request did not return a capture_id.", {
        request_id: client.requestId
      }));
    }
    return captureId;
  }
}
async function explainedScreenshotFailure(client, id, failure, display) {
  if (failure === "timed_out" || failure === "deadline") {
    try {
      const screen = (await client.call({ method: "GET", path: "/api/screens/".concat(id) })).body;
      if (screen?.online === false)
        return screenshotUnavailable(client.requestId, "offline", typeof screen.last_online_at === "string" ? screen.last_online_at : void 0, display);
    } catch {
    }
  }
  return screenshotUnavailable(client.requestId, failure, void 0, display);
}
async function retriedScreenshotRead(retry, read) {
  while (true) {
    try {
      return await read();
    } catch (error) {
      if (!transientScreenshotFailure(error))
        throw error;
      await retry.wait(error);
    }
  }
}
async function captureScreenshot(runtime, client, id, outputPath, options, key) {
  const retry = new ScreenshotRetry(runtime, id, options);
  let captureId = await requestScreenshotCapture(client, id, key, retry);
  let status;
  await loggerOf(runtime).withLocal({ op: "screenshot.wait", message: "wait for screenshot ".concat(id) }, async (span) => {
    while (true) {
      const statusResponse = await retriedScreenshotRead(retry, () => client.call({
        method: "GET",
        path: "/api/screens/".concat(id, "/screenshot/status")
      }));
      status = statusResponse.body ?? {};
      const currentId = status.capture_id;
      span.progress({ capture_id: currentId, state: status.state });
      if (typeof currentId === "string" && currentId.length > 0 && currentId !== captureId) {
        span.progress({ adopted_capture_id: currentId, replaced_capture_id: captureId });
        options.notify?.("screen screenshot ".concat(id, ": a later request replaced capture ").concat(captureId, "; waiting for ").concat(currentId, "."));
        captureId = currentId;
      }
      if (status.state === "ready" && currentId === captureId) {
        span.finish({ capture_id: captureId, state: status.state });
        return;
      }
      if ((status.state === "timed_out" || status.state === "unavailable") && currentId === captureId) {
        throw await explainedScreenshotFailure(client, id, screenshotFailure(status), status.display);
      }
      if (Date.now() >= retry.deadline) {
        throw await explainedScreenshotFailure(client, id, "deadline");
      }
      await retry.poll();
    }
  });
  const download = await retriedScreenshotRead(retry, () => client.call({
    method: "GET",
    path: "/api/screens/".concat(id, "/screenshot"),
    query: { capture_id: captureId },
    headers: { accept: "image/webp" },
    binary: true
  }));
  const bytes = download.body;
  const contentType = download.headers["content-type"] ?? "";
  const digest = bytes instanceof Uint8Array ? createHash("sha256").update(bytes).digest("hex") : "";
  const reportedLength = download.headers["content-length"];
  const parsedLength = reportedLength !== void 0 ? Number(reportedLength) : void 0;
  const lengthMatches = bytes instanceof Uint8Array && typeof status?.bytes === "number" && bytes.byteLength === status.bytes && (parsedLength === void 0 || !Number.isFinite(parsedLength) || parsedLength === bytes.byteLength);
  const digestMatches = typeof status?.sha256 === "string" && status.sha256 === digest;
  const typeMatches = contentType.toLowerCase().startsWith("image/webp");
  if (!(bytes instanceof Uint8Array) || !typeMatches || !lengthMatches || !digestMatches || typeof status?.width !== "number" || typeof status.height !== "number") {
    throw new CliError(makeProblem("invalid_request", "Request is invalid", 400, "Screenshot download did not match the ready status metadata.", { request_id: client.requestId }));
  }
  const tempPath = tempPathFor(outputPath);
  const release = removeOnSignal(tempPath);
  try {
    await writeFile(tempPath, bytes, { flag: "wx", mode: 384 });
    await rename(tempPath, outputPath);
  } catch {
    await rm(tempPath, { force: true });
    throw usageError("Cannot write screenshot to the output path.");
  } finally {
    release();
  }
  return {
    screen_id: id,
    capture_id: captureId,
    path: outputPath,
    bytes: bytes.byteLength,
    sha256: digest,
    width: status.width,
    height: status.height,
    ...status.frame && typeof status.frame.flat === "boolean" ? { frame: { flat: status.frame.flat, analyzed_at: status.frame.analyzed_at } } : {}
  };
}
var SCREENSHOT_FLEET_DEFAULT_CONCURRENCY = 4;
var SCREENSHOT_FLEET_MAX_CONCURRENCY = 8;
async function screenScreenshotFleet(args, runtime, client, selector) {
  if (flagString(args.flags, "idempotency-key")) {
    throw usageError("screen screenshot with several screens or --tag does not take --idempotency-key; each capture uses its own key.");
  }
  requireFlagValue(args, "concurrency", "4");
  const concurrency = flagNumber(args.flags, "concurrency") ?? SCREENSHOT_FLEET_DEFAULT_CONCURRENCY;
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > SCREENSHOT_FLEET_MAX_CONCURRENCY) {
    throw usageError("--concurrency must be a whole number from 1 to ".concat(SCREENSHOT_FLEET_MAX_CONCURRENCY, "."));
  }
  if (selector.by === "ids") {
    const invalid = selector.screen_ids.find((id) => !isScreenId(id));
    if (invalid !== void 0)
      throw usageError("screen screenshot takes screen ids (scr_...); nothing was captured.");
  }
  if (args.flags.output === true)
    throw usageError("--output requires a directory path.");
  const directory = path.resolve(runtime.cwd(), flagString(args.flags, "output") ?? ".");
  try {
    if (!(await stat(directory)).isDirectory())
      throw usageError("--output must be a directory with several screens or --tag.");
  } catch (error) {
    if (error instanceof CliError)
      throw error;
    if (error.code !== "ENOENT")
      throw usageError("--output must be a directory with several screens or --tag.");
  }
  const options = screenshotOptions(args, runtime);
  let ids;
  const offline = /* @__PURE__ */ new Map();
  if (selector.by === "tag") {
    const listed = await client.listAll("/api/screens", { tag: selector.tag }, { uncapped: true });
    const items = listed.body?.items;
    if (!Array.isArray(items))
      throw usageError("Screen list response does not match the generated ScreenList contract.");
    const active = items.filter((screen) => screen?.state === "active" && typeof screen.id === "string");
    ids = active.map((screen) => screen.id);
    for (const screen of active)
      if (screen.online === false)
        offline.set(screen.id, screen.last_online_at);
    if (ids.some((id) => !isScreenId(id)))
      throw usageError("Screen list response does not match the generated ScreenList contract.");
  } else if (selector.by === "folder") {
    await client.call({ method: "GET", path: "/api/screen-folders/".concat(selector.folder_id) });
    const folders = (await client.call({ method: "GET", path: "/api/screen-folders" })).body?.items;
    if (!Array.isArray(folders))
      throw usageError("Screen folder list response does not match the generated ScreenFolderList contract.");
    const active = [];
    for (const folderId of folderSubtree(folders, selector.folder_id)) {
      const listed = await client.listAll("/api/screens", { folder: folderId }, { uncapped: true });
      const items = listed.body?.items;
      if (!Array.isArray(items))
        throw usageError("Screen list response does not match the generated ScreenList contract.");
      active.push(...items.filter((screen) => screen?.state === "active" && typeof screen.id === "string"));
    }
    ids = active.map((screen) => screen.id);
    for (const screen of active)
      if (screen.online === false)
        offline.set(screen.id, screen.last_online_at);
    if (ids.some((id) => !isScreenId(id)))
      throw usageError("Screen list response does not match the generated ScreenList contract.");
  } else {
    ids = selector.screen_ids;
  }
  if (ids.length) {
    try {
      await mkdir(directory, { recursive: true });
    } catch {
      throw usageError("Cannot create the --output directory.");
    }
  }
  const results = new Array(ids.length);
  const exitCodes = /* @__PURE__ */ new Map();
  const failure = (id, problem) => ({ screen_id: id, status: "failed", problem });
  let next = 0;
  let fatal = false;
  const worker = async () => {
    while (!fatal && next < ids.length) {
      const index = next++;
      const id = ids[index];
      try {
        if (offline.has(id))
          throw screenshotUnavailable(client.requestId, "offline", offline.get(id));
        const saved = await captureScreenshot(runtime, client, id, path.join(directory, "".concat(id, ".webp")), options, newIdempotencyKey());
        results[index] = { ...saved, status: "ok" };
      } catch (error) {
        if (error instanceof CliError) {
          exitCodes.set(index, error.exitCode);
          const local = error.problem.code === "transport_error" || error.problem.code === "timeout";
          results[index] = failure(id, {
            code: error.problem.code,
            ...local ? {} : { status: error.problem.status },
            title: error.problem.title,
            detail: error.problem.detail,
            ...error.problem.hint ? { hint: error.problem.hint } : {},
            ...error.problem.display ? { display: error.problem.display } : {},
            ...typeof error.problem.retry_after_seconds === "number" ? { retry_after_seconds: error.problem.retry_after_seconds } : {},
            ...error.problem.request_id ? { request_id: error.problem.request_id } : {}
          });
        } else {
          fatal = true;
          exitCodes.set(index, ExitCode.Unexpected);
          results[index] = failure(id, { code: "unexpected_error", title: "Unexpected error", detail: "The capture failed unexpectedly; remaining captures were not started." });
        }
      }
    }
  };
  await Promise.allSettled(Array.from({ length: Math.min(concurrency, ids.length) }, worker));
  for (let index = 0; index < ids.length; index += 1) {
    if (results[index] === void 0) {
      exitCodes.set(index, ExitCode.Unexpected);
      results[index] = failure(ids[index], { code: "not_attempted", title: "Not attempted", detail: "Not captured because an earlier capture failed unexpectedly." });
    }
  }
  const failed = results.filter((item) => item.status === "failed").length;
  const data = {
    action: "screenshot",
    selector,
    output: directory,
    matched: results.length,
    succeeded: results.length - failed,
    failed,
    results
  };
  const outcome = fleetOutcome(data, (item) => exitCodes.get(results.indexOf(item)));
  if (fatal)
    outcome.exitCode = ExitCode.Unexpected;
  return {
    envelope: successEnvelope(data, { request_id: client.requestId, warnings: outcome.warnings }),
    exitCode: outcome.exitCode,
    human: [
      fleetHumanLines("Fleet screenshot", data, (item) => item.path),
      ...outcome.warnings.map((warning) => "warning: ".concat(warning.message))
    ].join("\n")
  };
}
var handleScreenPublish = commandHandler(async (args, runtime, resolved) => {
  const parsed = await readAuthoringJson(args.positionals[3], runtime);
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.pages))
    assertWirePages(parsed.pages);
  const document = parsed;
  assertPlaylistValid(document);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const json = !flagBool(args.flags, "human");
  const progress = flagBool(args.flags, "no-progress") ? void 0 : (stage, state) => runtime.stderr.write(json ? "".concat(JSON.stringify({ event: "publish_stage", stage, ...state ? { state } : {} }), "\n") : "screenrig: ".concat(stage).concat(state ? " (".concat(state, ")") : "", "\n"));
  const shortApplication = shortApplicationPageWarning(document);
  const result = await publishScreen({
    client,
    runtime,
    configPath: resolved.configPath,
    apiUrl: resolved.apiUrl,
    screenId: args.positionals[2],
    revision: flagString(args.flags, "expect-rev"),
    document,
    requestedKey: flagString(args.flags, "idempotency-key"),
    note: flagString(args.flags, "note"),
    wait: flagBool(args.flags, "no-wait") ? void 0 : { timeoutMs: flagNumber(args.flags, "timeout") ?? 12e4, pollMs: flagNumber(args.flags, "poll-ms") ?? 2e3 },
    progress
  });
  if (result.stage === "pending_review") {
    const first = result.reviews.find((review) => review.kind === "playlist_change") ?? result.reviews[0];
    const { warnings: raw2, ...pendingData } = result;
    const framing2 = playlistWarnings(raw2, result.playlist_id, true);
    return {
      envelope: successEnvelope({ ...pendingData, next: reviewNext(first.id) }, { request_id: client.requestId, warnings: [...shortApplication ? [shortApplication] : [], ...result.reviews.map(pendingReviewWarning), ...framing2] }),
      exitCode: ExitCode.Success,
      human: [
        "Publish waiting for review",
        "playlist_id: ".concat(result.playlist_id),
        "screen_id: ".concat(result.screen_id),
        ...result.reviews.map((review) => "review: ".concat(review.id, " ").concat(review.kind, " ").concat(review.state, " ").concat(review.url)),
        "next: screenrig reviews show ".concat(first.id),
        PENDING_REVIEW_SENTENCE,
        ...framing2.map((item) => "warning: ".concat(item.message))
      ].join("\n")
    };
  }
  const warning = publishPlaybackWarning(result);
  const { warnings: raw, ...data } = result;
  const framing = playlistWarnings(raw, result.playlist_id);
  return {
    envelope: successEnvelope(data, { request_id: client.requestId, warnings: [...shortApplication ? [shortApplication] : [], ...warning ? [warning] : [], ...framing] }),
    exitCode: ExitCode.Success,
    human: humanLines("".concat(result.playback_verified ? "Published and playing" : "Published and assigned").concat(hasFramingRefusal(framing) ? "; see the framing warning" : ""), [
      ["playlist_id", result.playlist_id],
      ["screen_id", result.screen_id],
      ["stage", result.stage],
      ["waited", "".concat(result.playback.waited_ms, " ms")],
      ...warning ? [["warning", warning.message]] : [],
      ...shortApplication ? [["warning", shortApplication.message]] : [],
      ...framing.map((item) => ["warning", item.message])
    ])
  };
});
function publishPlaybackWarning(result) {
  const { playback, screen_id: screen } = result;
  if ((playback.reason === "playback_failed" || playback.reason === "playback_pending" || playback.playing) && isStorageFailureCode(playback.code)) {
    return storageFullWarning(screen, playback.state === "partial" ? "partial" : playback.code === "transition_blocked" ? "transition_blocked" : "none_fit");
  }
  const rerun = "Rerun the identical publish command to wait again; it does not create another playlist.";
  switch (playback.reason) {
    case "screen_offline":
      return { code: "screen_offline", message: "The screen is offline, so its Player has not picked up the playlist. It plays when the Player reconnects. ".concat(rerun) };
    case "playlist_not_effective":
      return { code: "playlist_not_effective", message: "A takeover, campaign or playlist schedule shows ".concat(playback.effective_playlist_id, " on this screen. The published playlist is its default and plays when that ends; screen show ").concat(screen, " reports effective_playlist, and campaign explain ").concat(screen, " says which campaigns apply.") };
    case "playback_failed":
      return { code: "playback_failed", message: "The Player could not switch to the playlist".concat(playback.code ? " (".concat(playback.code, ")") : "", ". screen show ").concat(screen, " reports the reason; fix it, then screen reload ").concat(screen, ".") };
    case "playback_pending":
      return { code: "playback_pending", message: "The Player had not shown the playlist after ".concat(Math.round(playback.waited_ms / 1e3), " s (state ").concat(playback.state ?? "unknown", "). Large videos take longer to download. ").concat(rerun) };
  }
  if (playback.playing && playback.state === "partial") {
    return { code: "playback_partial", message: "The Player is showing only part of the playlist. screen show ".concat(screen, " reports progress and screen storage-forecast ").concat(screen, " --playlist-id ").concat(result.playlist_id, " checks available storage.") };
  }
  return void 0;
}
function nestedScreenTarget(args, command) {
  return screenTarget({ ...args, positionals: args.positionals.slice(1) }, command);
}
async function screenControlCall(client, id, request) {
  try {
    return await client.call(request);
  } catch (error) {
    throw screenControlProblem(error, id);
  }
}
function screenControlHeaders(args, revision2) {
  return { ...reviewNoteFrom(args), ...revision2 ? { "if-match": quotedRevision(revision2) } : {} };
}
function screenControlHuman(title, screen) {
  return [
    title,
    ...assignmentLine(screen?.effective_playlist, screen?.takeover, screen?.timezone),
    ...takeoverLine(screen?.takeover, screen?.timezone),
    ...screen?.playlist_schedule ? scheduleTableLines(screen.playlist_schedule.entries, screen.timezone ?? null) : [],
    ...screen?.revision !== void 0 ? ["revision: ".concat(screen.revision)] : []
  ].join("\n");
}
var handleScreenScheduleShow = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("screen schedule show requires <id>.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await screenControlCall(client, id, { method: "GET", path: "/api/screens/".concat(encodeURIComponent(id), "/playlist-schedule") });
  const view = response.body;
  let timezone;
  if (flagBool(args.flags, "human")) {
    try {
      const screen = await client.call({ method: "GET", path: "/api/screens/".concat(encodeURIComponent(id)) });
      timezone = screen.body?.timezone ?? null;
    } catch {
      timezone = void 0;
    }
  }
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Playlist schedule for ".concat(id),
      ...assignmentLine(view?.effective_playlist, void 0, timezone ?? void 0),
      ...view?.updated_at ? ["updated_at: ".concat(view.updated_at)] : [],
      ...scheduleTableLines(view?.entries, timezone === void 0 ? "unknown" : timezone)
    ].join("\n")
  };
});
var handleScreenScheduleSet = commandHandler(async (args, runtime, resolved) => {
  const file = flagString(args.flags, "file");
  if (!file)
    throw usageError("screen schedule set requires --file FILE (or --file - for stdin).");
  const target = nestedScreenTarget(args, "screen schedule set");
  if (target.kind === "fleet")
    rejectFleetRevision(args, "screen schedule set");
  const entries = scheduleEntries(await readAuthoringJson(file, runtime));
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (target.kind === "fleet") {
    return screenFleetAction(client, runtime, "Fleet schedule set", target.selector, { type: "set_playlist_schedule", entries }, void 0, reviewNoteFrom(args));
  }
  const id = target.id;
  const body = { entries };
  const revision2 = flagString(args.flags, "expect-rev");
  const response = await screenControlCall(client, id, {
    method: "PUT",
    path: "/api/screens/".concat(encodeURIComponent(id), "/playlist-schedule"),
    idempotent: true,
    body,
    headers: screenControlHeaders(args, revision2)
  });
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: screenControlHuman("Set a ".concat(entries.length, "-entry playlist schedule on ").concat(id), response.body)
  };
});
var handleScreenScheduleClear = commandHandler(async (args, runtime, resolved) => {
  const target = nestedScreenTarget(args, "screen schedule clear");
  if (target.kind === "fleet")
    rejectFleetRevision(args, "screen schedule clear");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (target.kind === "fleet") {
    return screenFleetAction(client, runtime, "Fleet schedule clear", target.selector, { type: "clear_playlist_schedule" }, void 0, reviewNoteFrom(args));
  }
  const id = target.id;
  const revision2 = flagString(args.flags, "expect-rev");
  const response = await screenControlCall(client, id, {
    method: "DELETE",
    path: "/api/screens/".concat(encodeURIComponent(id), "/playlist-schedule"),
    idempotent: true,
    headers: screenControlHeaders(args, revision2)
  });
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: screenControlHuman("Cleared the playlist schedule on ".concat(id), response.body)
  };
});
var handleScreenTakeover = commandHandler(async (args, runtime, resolved) => {
  const playlistId = flagString(args.flags, "playlist-id");
  if (!playlistId)
    throw usageError("screen takeover requires <id>, --tag TAG or --folder ID, and --playlist-id.");
  const target = nestedScreenTarget(args, "screen takeover");
  if (target.kind === "fleet")
    rejectFleetRevision(args, "screen takeover");
  const forValue = flagString(args.flags, "for");
  const until = takeoverUntil(flagString(args.flags, "until"), forValue, runtime.now());
  const reason = flagString(args.flags, "reason");
  const write = {
    playlist_id: playlistId,
    ...until !== void 0 ? { until } : {},
    ...reason !== void 0 ? { reason: takeoverReason(reason) } : {}
  };
  const supersede = forValue !== void 0 ? JSON.stringify(["screen takeover --for", target.kind === "single" ? target.id : target.selector, playlistId]) : void 0;
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (target.kind === "fleet") {
    try {
      return await screenFleetAction(client, runtime, "Fleet takeover", target.selector, { type: "takeover", ...write }, supersede, reviewNoteFrom(args));
    } catch (error) {
      throw forValue !== void 0 ? takeoverForProblem(error) : error;
    }
  }
  const id = target.id;
  const revision2 = flagString(args.flags, "expect-rev");
  let response;
  try {
    response = await screenControlCall(client, id, {
      method: "POST",
      path: "/api/screens/".concat(encodeURIComponent(id), "/takeover"),
      idempotent: true,
      body: write,
      headers: screenControlHeaders(args, revision2),
      ...supersede ? { recoverySupersede: supersede } : {}
    });
  } catch (error) {
    throw forValue !== void 0 ? takeoverForProblem(error) : error;
  }
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: screenControlHuman("Took over ".concat(id, " with ").concat(playlistId, " ").concat(typeof until === "string" ? "until ".concat(instantInZone(until, response.body?.timezone)) : "until cleared"), response.body)
  };
});
var handleScreenTakeoverClear = commandHandler(async (args, runtime, resolved) => {
  const target = nestedScreenTarget(args, "screen takeover clear");
  if (target.kind === "fleet")
    rejectFleetRevision(args, "screen takeover clear");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (target.kind === "fleet") {
    return screenFleetAction(client, runtime, "Fleet takeover clear", target.selector, { type: "takeover_clear" }, void 0, reviewNoteFrom(args));
  }
  const id = target.id;
  const revision2 = flagString(args.flags, "expect-rev");
  const response = await screenControlCall(client, id, {
    method: "DELETE",
    path: "/api/screens/".concat(encodeURIComponent(id), "/takeover"),
    idempotent: true,
    headers: screenControlHeaders(args, revision2)
  });
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: screenControlHuman("Cleared the takeover on ".concat(id), response.body)
  };
});
var handleScreenReboot = commandHandler(async (args, runtime, resolved) => {
  const target = screenTarget(args, "screen reboot");
  if (target.kind === "fleet") {
    rejectFleetRevision(args, "screen reboot");
    if (!flagBool(args.flags, "yes")) {
      throw usageError("screen reboot with several screens or --tag reboots every matching device; add --yes to confirm.", {
        command: "screenrig screen reboot ".concat(selectorFlags(target.selector), " --yes"),
        reason: "Check the matching screens with screen list first; each rebooted device is dark until it restarts."
      });
    }
  }
  const lifetime = commandLifetime(args);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (target.kind === "fleet")
    return screenFleetAction(client, runtime, "Fleet reboot", target.selector, { type: "reboot", ...lifetime });
  const id = target.id;
  const revision2 = flagString(args.flags, "expect-rev");
  let response;
  try {
    response = await client.call({
      method: "POST",
      path: "/api/screens/".concat(encodeURIComponent(id), "/reboot"),
      idempotent: true,
      ...lifetime.expires_in_s === void 0 ? {} : { body: lifetime },
      ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
    });
  } catch (error) {
    throw rebootProblem(error, id);
  }
  const accepted = response.body ?? {};
  if (typeof accepted.reboot_id !== "string" || !/^rbt_[A-Za-z0-9_-]{8,64}$/.test(accepted.reboot_id) || serverInstant(accepted.expires_at) === void 0 || !validDelivery(accepted.state)) {
    throw usageError("Screen reboot response does not match the generated ScreenRebootAccepted contract.");
  }
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      humanLines("Reboot accepted", [["screen_id", id], ["reboot_id", accepted.reboot_id], ["state", accepted.state], ["expires_at", accepted.expires_at]]),
      accepted.state === "queued" ? "The screen is offline, so the reboot waits: it is sent when the screen comes online before expires_at, and screen show lists it under commands (done once the device reports it booted). Cancel it with screen command cancel ".concat(id, " ").concat(accepted.reboot_id, ".") : "The Player reboots the device when it receives this before expires_at. Confirm it came back with screen show (online, health uptime)."
    ].join("\n")
  };
}, true);
function maintenanceHandler(spec) {
  const command = "screen ".concat(spec.name);
  return commandHandler(async (args, runtime, resolved) => {
    const target = screenTarget(args, command);
    if (target.kind === "fleet") {
      rejectFleetRevision(args, command);
      if (!flagBool(args.flags, "yes")) {
        throw usageError("".concat(command, " with several screens, --tag or --folder acts on every matching Player; add --yes to confirm."), {
          command: "screenrig ".concat(command, " ").concat(selectorFlags(target.selector), " --yes"),
          reason: "Check the matching screens with screen list first; ".concat(spec.fleetWarning)
        });
      }
    }
    const lifetime = commandLifetime(args);
    const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
    if (target.kind === "fleet")
      return screenFleetAction(client, runtime, "Fleet ".concat(spec.name), target.selector, { type: spec.type, ...lifetime });
    const id = target.id;
    const revision2 = flagString(args.flags, "expect-rev");
    let response;
    try {
      response = await client.call({
        method: "POST",
        path: "/api/screens/".concat(encodeURIComponent(id), "/").concat(spec.route),
        idempotent: true,
        ...lifetime.expires_in_s === void 0 ? {} : { body: lifetime },
        ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
      });
    } catch (error) {
      throw maintenanceProblem(error, id, spec);
    }
    const accepted = response.body ?? {};
    if (typeof accepted.command_id !== "string" || !/^cmd_[A-Za-z0-9_-]{8,64}$/.test(accepted.command_id) || accepted.command !== spec.type || serverInstant(accepted.expires_at) === void 0 || accepted.state !== "queued" && accepted.state !== "sent") {
      throw usageError("Screen ".concat(spec.name, " response does not match the generated ScreenMaintenanceAccepted contract."));
    }
    return {
      envelope: jsonBody(response, client.requestId),
      exitCode: ExitCode.Success,
      human: [
        humanLines("".concat(spec.title, " accepted"), [["screen_id", id], ["command_id", accepted.command_id], ["command", accepted.command], ["state", accepted.state], ["expires_at", accepted.expires_at]]),
        accepted.state === "queued" ? "The screen is offline, so ".concat(spec.name, " waits: it is sent when the screen comes online before expires_at, and screen show lists it under commands (done or failed, with the cause the Player reports). Cancel it with screen command cancel ").concat(id, " ").concat(accepted.command_id, ".") : "".concat(spec.effect, " screen show lists the result under commands (done or failed, with the cause the Player reports).")
      ].join("\n")
    };
  }, true);
}
var handleScreenClearCache = maintenanceHandler(MAINTENANCE["clear-cache"]);
var handleScreenRestartApp = maintenanceHandler(MAINTENANCE["restart-app"]);
var handleScreenUpdateSoftware = maintenanceHandler(MAINTENANCE["update-software"]);
var handleScreenPlayPage = commandHandler(async (args, runtime, resolved) => {
  if (args.flags["page-id"] === true)
    throw usageError("--page-id requires a value, such as --page-id pg_WELCOME.");
  const pageId = flagString(args.flags, "page-id");
  const ids = args.positionals.slice(2);
  if (!ids.length || pageId === void 0)
    throw usageError("screen play-page requires <id> and --page-id PAGE_ID.");
  const id = ids[0];
  if (id.length < 1 || id.length > 200)
    throw usageError("screen play-page screen ids must be 1 to 200 characters.");
  if (pageId.length < 1 || pageId.length > 128)
    throw usageError("--page-id must be 1 to 128 characters.");
  const body = { page_id: pageId };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let response;
  try {
    response = await client.call({ method: "POST", path: "/api/screens/".concat(encodeURIComponent(id), "/play-page"), idempotent: true, body });
  } catch (error) {
    throw playPageProblem(error, id);
  }
  const accepted = response.body ?? {};
  if (typeof accepted.playlist_id !== "string" || typeof accepted.page_id !== "string" || serverInstant(accepted.expires_at) === void 0) {
    throw usageError("Screen play-page response does not match the generated ScreenPlayPageAccepted contract.");
  }
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: humanLines("Play-page accepted", [["screen_id", id], ["playlist_id", accepted.playlist_id], ["page_id", accepted.page_id], ["expires_at", accepted.expires_at]])
  };
}, true);
var handleScreenIdentify = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  if (!id)
    throw usageError("screen identify requires <id>.");
  const duration = flagString(args.flags, "duration");
  const body = duration === void 0 ? void 0 : { duration_ms: identifyDurationMs(duration) };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let response;
  try {
    response = await client.call({ method: "POST", path: "/api/screens/".concat(encodeURIComponent(id), "/identify"), idempotent: true, ...body ? { body } : {} });
  } catch (error) {
    throw identifyProblem(error, id);
  }
  const accepted = response.body ?? {};
  if (typeof accepted.identify_id !== "string" || !/^idf_[A-Za-z0-9_-]{8,64}$/.test(accepted.identify_id) || serverInstant(accepted.expires_at) === void 0) {
    throw unexpectedResponseError("Screen identify response does not match the generated ScreenIdentifyAccepted contract.");
  }
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      humanLines("Identify accepted", [
        ["screen_id", id],
        ["identify_id", accepted.identify_id],
        ["duration_ms", Number.isSafeInteger(accepted.duration_ms) ? String(accepted.duration_ms) : void 0],
        ["expires_at", accepted.expires_at]
      ]),
      "The Player shows the screen's name over its content for the duration, counted from when it receives this; playback continues underneath. Run it again to replace the overlay."
    ].join("\n")
  };
}, true);
var handleScreenLiveStart = commandHandler(async (args, runtime, resolved) => {
  const id = liveScreenId(args.positionals[3], "start");
  const duration = flagString(args.flags, "duration");
  const wait = flagString(args.flags, "wait");
  const waitMs = wait === void 0 ? LIVE_WAIT_DEFAULT_MS : liveWaitMs(wait);
  const body = duration === void 0 ? void 0 : { duration_s: liveDurationSeconds(duration) };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const path2 = "/api/screens/".concat(encodeURIComponent(id), "/live");
  let response;
  try {
    response = await client.call({ method: "POST", path: path2, ...body ? { body } : {} });
  } catch (error) {
    throw liveProblem(error, id);
  }
  let session = liveSessionBody(response.body);
  if (!session)
    throw unexpectedResponseError("Screen live start response does not match the generated LiveSession contract.");
  session = await settleLive(session, async () => {
    response = await client.call({ method: "GET", path: path2 });
    const read = liveSessionBody(response.body);
    if (!read)
      throw unexpectedResponseError("Screen live status response does not match the generated LiveSession contract.");
    return read;
  }, { waitMs, now: () => runtime.now().getTime(), sleep: runtime.sleep });
  if (session.state === "ended" || session.state === "idle")
    throw liveEndedError(session);
  const warnings = session.publisher?.connected ? [] : [liveNotReadyWarning(session)];
  return {
    envelope: jsonBody({ body: session, headers: response.headers }, client.requestId, void 0, warnings),
    exitCode: ExitCode.Success,
    human: [liveHumanLines(session), ...warnings.map((warning) => warning.message)].join("\n")
  };
}, true);
var handleScreenLiveStatus = commandHandler(async (args, runtime, resolved) => {
  const id = liveScreenId(args.positionals[3], "status");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let response;
  try {
    response = await client.call({ method: "GET", path: "/api/screens/".concat(encodeURIComponent(id), "/live") });
  } catch (error) {
    throw liveProblem(error, id);
  }
  const session = liveSessionBody(response.body);
  if (!session)
    throw unexpectedResponseError("Screen live status response does not match the generated LiveSession contract.");
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: liveHumanLines(session) };
}, true);
var handleScreenLiveStop = commandHandler(async (args, runtime, resolved) => {
  const id = liveScreenId(args.positionals[3], "stop");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const path2 = "/api/screens/".concat(encodeURIComponent(id), "/live");
  let response;
  try {
    await client.call({ method: "DELETE", path: path2 });
    response = await client.call({ method: "GET", path: path2 });
  } catch (error) {
    throw liveProblem(error, id);
  }
  const session = liveSessionBody(response.body);
  if (!session)
    throw unexpectedResponseError("Screen live status response does not match the generated LiveSession contract.");
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: liveHumanLines(session) };
}, true);
var handleScreenLiveFrame = commandHandler(async (args, runtime, resolved) => {
  const id = liveScreenId(args.positionals[3], "frame");
  const count = flagNumber(args.flags, "count") ?? 1;
  if (!Number.isInteger(count) || count < 1)
    throw usageError("--count must be a whole number of at least 1.");
  const interval = flagString(args.flags, "interval");
  const intervalMs = interval === void 0 ? LIVE_FRAME_INTERVAL_DEFAULT_MS : liveFrameIntervalMs(interval);
  const duration = flagString(args.flags, "duration");
  const wait = flagString(args.flags, "wait");
  const plan = {
    screenId: id,
    count,
    intervalMs,
    leaseSeconds: liveFrameLeaseSeconds(duration === void 0 ? void 0 : liveDurationSeconds(duration), count, intervalMs),
    waitMs: wait === void 0 ? LIVE_WAIT_DEFAULT_MS : liveWaitMs(wait),
    stop: flagBool(args.flags, "stop"),
    output: await resolveFrameOutput(runtime.cwd(), flagString(args.flags, "output"), count)
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const result = await captureLiveFrames(plan, client, { now: () => runtime.now().getTime(), sleep: runtime.sleep });
  return { envelope: successEnvelope(result, { request_id: client.requestId }), exitCode: ExitCode.Success, human: liveFramesHumanLines(result) };
}, true);
var handleScreenSuspend = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  const message = flagString(args.flags, "message");
  if (!id || message === void 0)
    throw usageError("screen suspend requires <id> and --message TEXT.");
  const body = { message: suspendMessage(message) };
  const revision2 = flagString(args.flags, "expect-rev");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let response;
  try {
    response = await client.call({
      method: "POST",
      path: "/api/screens/".concat(encodeURIComponent(id), "/suspend"),
      idempotent: true,
      body,
      ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
    });
  } catch (error) {
    throw suspendProblem(error, id);
  }
  const screen = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      humanLines("Suspended screen ".concat(id), [
        ["since", serverInstant(screen?.suspension?.since)],
        ["revision", screen?.revision === void 0 ? void 0 : String(screen.revision)]
      ]),
      "The screen shows your notice instead of its content until screen resume ".concat(id, "; its playlist, schedule and settings are unchanged.")
    ].join("\n")
  };
}, true);
var handleScreenResume = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  if (!id)
    throw usageError("screen resume requires <id>.");
  const revision2 = flagString(args.flags, "expect-rev");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let response;
  try {
    response = await client.call({
      method: "POST",
      path: "/api/screens/".concat(encodeURIComponent(id), "/resume"),
      idempotent: true,
      ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
    });
  } catch (error) {
    throw suspendProblem(error, id);
  }
  const screen = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      humanLines("Resumed screen ".concat(id), [["revision", screen?.revision === void 0 ? void 0 : String(screen.revision)]]),
      "The screen shows its own content again."
    ].join("\n")
  };
}, true);
var handleScreenReplace = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  const withId = flagString(args.flags, "with");
  if (!id || !withId)
    throw usageError("screen replace requires <id> and --with ID.");
  if (withId === id)
    throw usageError("--with must name another screen than <id>: the screen whose paired device takes over.");
  const body = { with: withId };
  const revision2 = flagString(args.flags, "expect-rev");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let response;
  try {
    response = await client.call({
      method: "POST",
      path: "/api/screens/".concat(encodeURIComponent(id), "/replace"),
      idempotent: true,
      body,
      ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
    });
  } catch (error) {
    throw replaceProblem(error, id, withId);
  }
  const screen = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      humanLines("Replaced the device of screen ".concat(id, " with the one paired as ").concat(withId), [
        ["revision", screen?.revision === void 0 ? void 0 : String(screen.revision)]
      ]),
      "".concat(id, " keeps its name, tags, playlist, schedules and history on the new device. ").concat(withId, " is archived as replaced, and any key ").concat(id, " held retires after a fifteen-minute grace window.")
    ].join("\n")
  };
}, true);
var handleScreenCommandCancel = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  const commandId = args.positionals[4];
  if (!id || !commandId)
    throw usageError("screen command cancel requires <id> and <command_id>.");
  const revision2 = flagString(args.flags, "expect-rev");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  let response;
  try {
    response = await client.call({
      method: "POST",
      path: "/api/screens/".concat(encodeURIComponent(id), "/commands/").concat(encodeURIComponent(commandId), "/cancel"),
      idempotent: true,
      ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
    });
  } catch (error) {
    throw commandCancelProblem(error, id);
  }
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: "Cancelled command ".concat(commandId, " on ").concat(id, ": it is never sent.")
  };
}, true);
function displayHuman(title, screen) {
  return [title, ...displayLines(screen?.display, screen?.timezone), ...screen?.revision !== void 0 ? ["revision: ".concat(screen.revision)] : []].join("\n");
}
var handleScreenDisplay = commandHandler(async (args, runtime, resolved) => {
  const last = args.positionals.at(-1);
  const trailing = args.positionals.length > 3 && (last === "on" || last === "off") ? last : void 0;
  const positionals = (trailing ? args.positionals.slice(0, -1) : args.positionals).slice(1);
  const flagPower = flagString(args.flags, "power");
  if (trailing && flagPower && trailing !== flagPower)
    throw usageError("screen display got two different powers; use --power on|off once.");
  const power = displayPower(flagPower ?? trailing);
  const target = screenTarget({ ...args, positionals }, "screen display");
  if (target.kind === "fleet")
    rejectFleetRevision(args, "screen display");
  const until = displayUntil(flagString(args.flags, "until"), flagString(args.flags, "for"), runtime.now());
  const write = { power, ...until !== void 0 ? { until } : {} };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (target.kind === "fleet")
    return screenFleetAction(client, runtime, "Fleet display ".concat(power), target.selector, { type: "display", ...write });
  const id = target.id;
  const revision2 = flagString(args.flags, "expect-rev");
  let response;
  try {
    response = await client.call({
      method: "POST",
      path: "/api/screens/".concat(encodeURIComponent(id), "/display"),
      idempotent: true,
      body: write,
      ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
    });
  } catch (error) {
    throw displayProblem(screenControlProblem(error, id), id);
  }
  const screen = response.body;
  const warnings = displayWarnings(id, screen?.display);
  return {
    envelope: jsonBody(response, client.requestId, void 0, warnings),
    exitCode: ExitCode.Success,
    human: [displayHuman("Display override saved on ".concat(id, ": requested ").concat(power, " ").concat(until ? "until ".concat(instantInZone(until, screen?.timezone)) : "until the display schedule's next boundary, or until replaced"), screen), ...warnings.map((warning) => "warning: ".concat(warning.message))].join("\n")
  };
}, true);
var handleScreenDisplayScheduleShow = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("screen display-schedule show requires <id>.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await screenControlCall(client, id, { method: "GET", path: "/api/screens/".concat(encodeURIComponent(id), "/display-schedule") });
  const view = response.body;
  let timezone;
  if (flagBool(args.flags, "human")) {
    try {
      timezone = (await client.call({ method: "GET", path: "/api/screens/".concat(encodeURIComponent(id)) })).body?.timezone;
    } catch {
      timezone = void 0;
    }
  }
  const display = view?.display ?? (view?.display_schedule ? { requested: "on", source: "default", schedule: view.display_schedule } : void 0);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Display schedule for ".concat(id), ...view?.display_schedule ? [] : ["No display schedule: the display stays on unless turned off."], ...displayLines(display, timezone)].join("\n")
  };
}, true);
var handleScreenDisplayScheduleSet = commandHandler(async (args, runtime, resolved) => {
  const file = flagString(args.flags, "file");
  if (!file)
    throw usageError("screen display-schedule set requires --file FILE (or --file - for stdin).");
  const target = nestedScreenTarget(args, "screen display-schedule set");
  if (target.kind === "fleet")
    rejectFleetRevision(args, "screen display-schedule set");
  const write = displayScheduleWrite(await readAuthoringJson(file, runtime));
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (target.kind === "fleet")
    return screenFleetAction(client, runtime, "Fleet display schedule set", target.selector, { type: "set_display_schedule", ...write });
  const id = target.id;
  const revision2 = flagString(args.flags, "expect-rev");
  const response = await screenControlCall(client, id, {
    method: "PUT",
    path: "/api/screens/".concat(encodeURIComponent(id), "/display-schedule"),
    idempotent: true,
    body: write,
    ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
  });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: displayHuman("Set a ".concat(write.windows.length, "-window display schedule on ").concat(id).concat(write.enabled ? "" : " (disabled: the display stays on)"), response.body)
  };
}, true);
var handleScreenDisplayScheduleClear = commandHandler(async (args, runtime, resolved) => {
  const target = nestedScreenTarget(args, "screen display-schedule clear");
  if (target.kind === "fleet")
    rejectFleetRevision(args, "screen display-schedule clear");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (target.kind === "fleet")
    return screenFleetAction(client, runtime, "Fleet display schedule clear", target.selector, { type: "clear_display_schedule" });
  const id = target.id;
  const revision2 = flagString(args.flags, "expect-rev");
  const response = await screenControlCall(client, id, {
    method: "DELETE",
    path: "/api/screens/".concat(encodeURIComponent(id), "/display-schedule"),
    idempotent: true,
    ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
  });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: displayHuman("Cleared the display schedule on ".concat(id), response.body)
  };
}, true);
function rebootScheduleHuman(title, screen) {
  return [title, ...rebootScheduleLines(screen?.reboot_schedule, screen?.next_reboot_at, screen?.timezone), ...screen?.revision !== void 0 ? ["revision: ".concat(screen.revision)] : []].join("\n");
}
var handleScreenRebootScheduleShow = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("screen reboot-schedule show requires <id>.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await screenControlCall(client, id, { method: "GET", path: "/api/screens/".concat(encodeURIComponent(id), "/reboot-schedule") });
  const view = response.body;
  let timezone;
  if (flagBool(args.flags, "human")) {
    try {
      timezone = (await client.call({ method: "GET", path: "/api/screens/".concat(encodeURIComponent(id)) })).body?.timezone;
    } catch {
      timezone = void 0;
    }
  }
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Reboot schedule for ".concat(id), ...view?.reboot_schedule ? [] : ["No reboot schedule: the screen reboots only when asked (screen reboot)."], ...rebootScheduleLines(view?.reboot_schedule, view?.next_reboot_at, timezone)].join("\n")
  };
}, true);
var handleScreenRebootScheduleSet = commandHandler(async (args, runtime, resolved) => {
  const file = flagString(args.flags, "file");
  const windows = flagString(args.flags, "window");
  if (file === void 0 === (windows === void 0))
    throw usageError("screen reboot-schedule set requires --window SPEC (repeatable) or --file FILE (or --file - for stdin).");
  const target = nestedScreenTarget(args, "screen reboot-schedule set");
  if (target.kind === "fleet")
    rejectFleetRevision(args, "screen reboot-schedule set");
  const write = file !== void 0 ? rebootScheduleWrite(await readAuthoringJson(file, runtime)) : { enabled: !flagBool(args.flags, "disabled"), windows: rebootWindowList(windows) };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (target.kind === "fleet")
    return screenFleetAction(client, runtime, "Fleet reboot schedule set", target.selector, { type: "set_reboot_schedule", ...write });
  const id = target.id;
  const revision2 = flagString(args.flags, "expect-rev");
  let response;
  try {
    response = await client.call({
      method: "PUT",
      path: "/api/screens/".concat(encodeURIComponent(id), "/reboot-schedule"),
      idempotent: true,
      body: write,
      ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
    });
  } catch (error) {
    throw rebootScheduleProblem(screenControlProblem(error, id), id);
  }
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: rebootScheduleHuman("Set a ".concat(write.windows.length, "-window reboot schedule on ").concat(id).concat(write.enabled ? "" : " (disabled: no reboots)"), response.body)
  };
}, true);
var handleScreenRebootScheduleClear = commandHandler(async (args, runtime, resolved) => {
  const target = nestedScreenTarget(args, "screen reboot-schedule clear");
  if (target.kind === "fleet")
    rejectFleetRevision(args, "screen reboot-schedule clear");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (target.kind === "fleet")
    return screenFleetAction(client, runtime, "Fleet reboot schedule clear", target.selector, { type: "clear_reboot_schedule" });
  const id = target.id;
  const revision2 = flagString(args.flags, "expect-rev");
  const response = await screenControlCall(client, id, {
    method: "DELETE",
    path: "/api/screens/".concat(encodeURIComponent(id), "/reboot-schedule"),
    idempotent: true,
    ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
  });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: rebootScheduleHuman("Cleared the reboot schedule on ".concat(id), response.body)
  };
}, true);
var handleScreenDisplayClear = commandHandler(async (args, runtime, resolved) => {
  const target = nestedScreenTarget(args, "screen display clear");
  if (target.kind === "fleet")
    rejectFleetRevision(args, "screen display clear");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  if (target.kind === "fleet")
    return screenFleetAction(client, runtime, "Fleet display clear", target.selector, { type: "display_clear" });
  const id = target.id;
  const revision2 = flagString(args.flags, "expect-rev");
  let response;
  try {
    response = await client.call({
      method: "DELETE",
      path: "/api/screens/".concat(encodeURIComponent(id), "/display"),
      idempotent: true,
      ...revision2 ? { headers: { "if-match": quotedRevision(revision2) } } : {}
    });
  } catch (error) {
    throw displayProblem(screenControlProblem(error, id), id);
  }
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: displayHuman("Cleared the display override on ".concat(id), response.body)
  };
}, true);

// dist/handlers/screen-schedule-change.js
var schedulePath = (id) => "/api/screens/".concat(encodeURIComponent(id), "/playlist-schedule");
function singleScreen(args, command) {
  const id = args.positionals[3];
  if (!id)
    throw usageError("".concat(command, " requires <id>."));
  return id;
}
var handleScreenScheduleRevisions = commandHandler(async (args, runtime, resolved) => {
  const id = singleScreen(args, "screen schedule revisions");
  const after = flagString(args.flags, "after");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await screenControlCall(client, id, { method: "GET", path: "".concat(schedulePath(id), "/revisions"), ...after !== void 0 ? { query: { after } } : {} });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: screenScheduleRevisionLines(id, response.body).join("\n")
  };
});
async function screenGuard(client, id, given) {
  if (given !== void 0)
    return given;
  const response = await screenControlCall(client, id, { method: "GET", path: "/api/screens/".concat(encodeURIComponent(id)) });
  const current = response.body?.revision;
  if (typeof current !== "number")
    throw unexpectedResponseError("The screen answer lacks its revision.", client.requestId);
  return String(current);
}
var handleScreenScheduleRestore = commandHandler(async (args, runtime, resolved) => {
  const id = singleScreen(args, "screen schedule restore");
  const number = revisionNumber(args, "screen schedule restore");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const expected = await screenGuard(client, id, flagString(args.flags, "expect-rev"));
  const response = await screenControlCall(client, id, {
    method: "POST",
    path: "".concat(schedulePath(id), "/revisions/").concat(number, "/restore"),
    idempotent: true,
    headers: screenControlHeaders(args, expected)
  });
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  const screen = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: screenControlHuman("Restored revision ".concat(number, " of the playlist schedule on ").concat(id).concat(screen?.revision === Number(expected) ? "; it already held that content, so nothing changed" : ""), screen)
  };
});
var handleScreenSchedulePreview = commandHandler(async (args, runtime, resolved) => {
  const file = flagString(args.flags, "file");
  if (!file)
    throw usageError("screen schedule preview requires --file FILE (or --file - for stdin).");
  const id = singleScreen(args, "screen schedule preview");
  const entries = scheduleEntries(await readAuthoringJson(file, runtime));
  const from = flagString(args.flags, "calendar-from");
  const to = flagString(args.flags, "calendar-to");
  const body = { entries, ...from !== void 0 ? { from } : {}, ...to !== void 0 ? { to } : {} };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await screenControlCall(client, id, { method: "POST", path: "".concat(schedulePath(id), "/preview"), body });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: schedulePreviewLines("a ".concat(entries.length, "-entry playlist schedule on ").concat(id), response.body).join("\n")
  };
});

// dist/cli-commands/screen.js
function folderSelector(verb = "Target") {
  return new Option("--folder <ID>", "".concat(verb, " every active screen in this screen folder (sfd_...) and the folders inside it")).argParser(screenFolderIdOption("--folder")).conflicts("tag");
}
function registerScreenCommands(root, bind) {
  const screen = root.command("screen").description("Pair, configure, and inspect screens");
  screen.command("publish").description("Publish a prepared playlist after rendering and inspecting its local preview").argument("<id>", "Screen identifier").argument("<file>", "Prepared playlist file, or - for stdin").option("--expect-rev <REVISION>", "Expected screen revision", revision).option("--no-wait", "Return after assignment without waiting for the Player to show the playlist").option("--poll-ms <MS>", "Set the screen polling interval while waiting", positiveInteger("poll-ms")).option("--no-progress", "Suppress stderr progress").option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleScreenPublish));
  screen.command("pair").description("Claim a Player pairing code").argument("<code...>", "Player pairing code as shown; spaces and dashes are ignored").option("--name <NAME>", "Set the screen name").option("--folder <ID>", "Put the screen in this screen folder (sfd_...); omitted leaves it at the project root. An agent limited to screen folders must name a folder of its scope", screenFolderIdOption("--folder")).action(bind(handleScreenPair));
  screen.command("provision").description("Create a screen and browser handoff").addOption(new Option("--open", "Open the browser Player handoff").conflicts(["printUrl"])).option("--print-url", "Return the browser handoff URL").option("--name <NAME>", "Set the screen name").option("--folder <ID>", "Put the screen in this screen folder (sfd_...); omitted leaves it at the project root. An agent limited to screen folders must name a folder of its scope", screenFolderIdOption("--folder")).action(bind(handleScreenProvision));
  screen.command("update").description("Update a screen").argument("<id>", "Screen identifier").option("--name <NAME>", "Set the screen name").addOption(new Option("--playlist-id <ID>", "Select the playlist to assign").conflicts("clearPlaylist")).addOption(new Option("--clear-playlist", "Clear this screen's default assignment; keep pairing and other content levels, showing idle when none applies").conflicts("playlistId")).option("--timezone <ZONE>", "Set an IANA timezone").addOption(new Option("--field <NAME=VALUE>", "Set a field: NAME is 1 to 32 lower case letters, digits or underscores, VALUE 1 to 200 characters (repeatable; at most 32 fields)").argParser(screenFieldSetOption).conflicts(["clearFields"])).addOption(new Option("--unset-field <NAME>", "Remove a field (repeatable)").argParser(screenUnsetFieldOption).conflicts(["clearFields"])).addOption(new Option("--clear-fields", "Remove every field").conflicts(["field", "unsetField"])).addOption(new Option("--location <LAT,LON>", "Set where the screen is, in decimal degrees; replaces the whole location").argParser(screenLocationOption).conflicts(["clearLocation"])).option("--location-name <NAME>", "Name the location, at most 40 characters: the place name a card shows (with --location)", screenLocationNameOption).option("--address <TEXT>", "Give the location an address, at most 200 characters (with --location)", screenAddressOption).addOption(new Option("--clear-location", "Remove the location").conflicts(["location"])).option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleScreenUpdate));
  screen.command("list").description("List screens").addOption(new Option("--state <STATE>", "List archived screens; omitted lists active screens").choices(["archived"])).option("--tag <TAG>", "List only screens carrying this exact tag", screenTagOption).option("--folder <ID|root>", "List only the screens directly in this screen folder (sfd_...), not those of the folders inside it; root lists the screens outside every folder", screenListFolderOption).addOption(new Option("--field <NAME=VALUE>", "List only screens whose field NAME holds exactly VALUE (repeatable; every one must match)").argParser(screenFieldFilterOption)).addOption(new Option("--near <LAT,LON,KM>", "List only screens located within KM kilometres of the point; screens with no location are left out").argParser(screenNearOption)).action(bind(handleScreenList));
  screen.command("show").description("Inspect a screen").argument("<id>", "Screen identifier").action(bind(handleScreenShow));
  screen.command("uptime").description("Read a screen's daily availability over UTC days").argument("<id>", "Screen identifier").option("--day-from <YYYY-MM-DD>", "First UTC day, inclusive (default 29 days before --day-to)").option("--day-to <YYYY-MM-DD>", "Last UTC day, inclusive (default today); at most 366 days after --day-from").addOption(reportFormatOption()).addOption(reportOutputOption("screen-uptime.FORMAT")).action(bind(handleScreenUptime));
  screen.command("presence").description("List a screen's online and offline transitions, newest first").argument("<id>", "Screen identifier").option("--since <TIME>", "Inclusive start of the transition time: RFC 3339, now, or an age such as 7d, 12h, 30m (default 30 days before --until)", playsInstantOption("--since")).option("--until <TIME>", "Exclusive end of the transition time: RFC 3339, now, or an age (default now); at most 366 days after --since", playsInstantOption("--until")).action(bind(handleScreenPresence));
  screen.command("health-history").description("List the health a screen reported over time, each report or one summary per hour").argument("<id>", "Screen identifier").option("--from <TIME>", "Inclusive start of the report time: RFC 3339, now, or an age such as 7d, 12h, 30m (default 24 hours before --to)", playsInstantOption("--from")).option("--to <TIME>", "Exclusive end of the report time: RFC 3339, now, or an age (default now); at most 31 days after --from, 93 with --resolution hour", playsInstantOption("--to")).addOption(new Option("--resolution <RESOLUTION>", "raw (default) lists each report; hour summarizes each UTC hour").choices(["raw", "hour"])).addOption(reportFormatOption()).addOption(reportOutputOption("screen-health-history.FORMAT")).action(bind(handleScreenHealthHistory));
  screen.command("storage-forecast").description("Dry-run whether a playlist fits a screen's reported storage").argument("<id>", "Screen identifier").requiredOption("--playlist-id <ID>", "Select the playlist to forecast (required)").option("--playlist-rev <REVISION>", "Optionally require the playlist to be at this revision", positiveInteger("playlist-rev")).action(bind(handleScreenStorageForecast));
  screen.command("assign").description("Assign a playlist to a screen or a fleet of screens").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).requiredOption("--playlist-id <ID>", "Select the playlist to assign (required)").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleScreenAssign));
  addCommandNotes(screen.command("set-timezone").description("Set a screen's timezone").argument("<id>", "Screen identifier").requiredOption("--timezone <ZONE>", "Set an IANA timezone name, such as Europe/London (required)").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleScreenSetTimezone)), "Timezone:\n  ZONE is an IANA timezone name: Area/City such as America/New_York,\n  Europe/London or Asia/Tokyo, or UTC. Playlist schedules, takeovers and\n  display schedules read their civil times in this zone. Page visibility\n  needs it for from, until or windows; data-only visibility needs no zone.");
  const wall = screen.command("wall").description("Set or clear a screen's video wall: one Player driving two to twelve displays as one canvas");
  subcommand(wall, "set").description("Set a screen's video wall").argument("<id>", "Screen identifier").requiredOption("--outputs <NAMES>", "Two to twelve comma-separated output names in physical order (left to right, then top to bottom), as screen show lists them under observation.surfaces (required)", wallOutputsOption).addOption(new Option("--arrangement <ARRANGEMENT>", "row (one row, left to right), column (one column, top to bottom) or grid (rows of --columns outputs, top to bottom) (required)").choices([...WALL_ARRANGEMENTS]).makeOptionMandatory()).option("--columns <N>", "Outputs per row of a grid (required for grid, not allowed for row or column); at least 2, dividing the outputs into at least 2 rows", positiveInteger("columns")).addOption(new Option("--rotation <DEGREES>", "Clockwise rotation of every output (default 0); 90 and 270 are portrait panels").choices([...WALL_ROTATIONS])).option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleScreenWallSet));
  wall.command("clear").description("Remove a screen's video wall").argument("<id>", "Screen identifier").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleScreenWallClear));
  screen.command("archive").description("Archive a screen").argument("<id>", "Screen identifier").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleScreenArchive));
  screen.command("unarchive").description("Restore an archived screen").argument("<id>", "Screen identifier").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleScreenUnarchive));
  screen.command("suspend").description("Show a notice on a screen instead of its content, until screen resume").argument("<id>", "Screen identifier").requiredOption("--message <TEXT>", "Set the notice the screen shows, 1 to 280 characters; line feeds are kept (required)", suspendMessageOption).option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleScreenSuspend));
  screen.command("resume").description("End a screen's suspension so it shows its own content again").argument("<id>", "Screen identifier").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleScreenResume));
  screen.command("delete").description("Delete a screen").argument("<id>", "Screen identifier").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleScreenDelete));
  screen.command("rotate-public-id").description("Rotate a screen's public identifier").argument("<id>", "Screen identifier").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleScreenRotatePublicId));
  const link = screen.command("link").description("Give a screen a Player URL for a browser that keeps no storage, such as a vMix or OBS browser source");
  addCommandNotes(link, "Screen links:\n  A screen link is the Player URL (https://play.<domain>/player/#screen=...) that\n  opens one screen in a browser that keeps no storage. Pair the screen once with\n  its code, create the link, paste it into the browser source. The URL is a\n  credential: open it in one place, and replace it when it leaks.");
  link.command("create").description("Create the screen's link, or replace it, and print its Player URL (the old URL stops working at once)").argument("<id>", "Screen identifier").option("--expect-rev <REVISION>", "Optionally require this screen revision", revision).action(bind(handleScreenLinkCreate));
  link.command("show").description("Print the screen's link and its Player URL").argument("<id>", "Screen identifier").action(bind(handleScreenLinkShow));
  link.command("delete").description("Turn the screen's link off; its URL stops working at once").argument("<id>", "Screen identifier").option("--expect-rev <REVISION>", "Optionally require this screen revision", revision).action(bind(handleScreenLinkDelete));
  const recover = screen.command("recover").description("Reconnect a display that reports this screen's identifiers").argument("<id>", "Screen identifier").option("--expect-rev <REVISION>", "Require the current resource revision", revision).action(bind(handleScreenRecover));
  addCommandNotes(recover, "Recovery reconnects a display that lost its stored identity and now reports this screen's hardware identifiers while pairing. Nothing is rebound until this command confirms it: the screen keeps its label, playlist, timezone, schedules, and history; the display's new key replaces the previous one, which retires after a fifteen-minute grace window. screen show reports the offer as recovery_pending with its deadline and, when the server reports it, the platform, model, firmware, and manufacturer of the display asking to reconnect. Compare the reported model and firmware with the display you expect before confirming: a display's identifiers can be read by any application running on it, so the offer alone does not prove which display is asking. The service refuses offers while the screen's current player is still online and limits how many offers each screen receives. Recovery never crosses projects.");
  addCommandExamples(recover, "screenrig screen show scr_LOBBY", "screenrig screen recover scr_LOBBY");
  screen.command("replace").description("Move the device paired as another screen onto this screen, keeping its settings and history").argument("<id>", "Screen to keep: it keeps its name, playlist, schedules and history").requiredOption("--with <ID>", "Screen whose paired device takes over this screen; it is archived (required)").option("--expect-rev <REVISION>", "Optionally require this resource revision of the screen to keep", revision).action(bind(handleScreenReplace));
  screen.command("reload").description("Ask a screen's player, or a fleet's players, to reload").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).option("--expires-in <DURATION>", "How long the reload waits for an offline screen to come online: 60s to 24h, such as 30m or 2h (default 24h)", expiresInOption).option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleScreenReload));
  screen.command("toast").description("Show a temporary message on a screen or a fleet of screens").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).requiredOption("--text <TEXT>", "Set the screen message (required)").addOption(new Option("--level <LEVEL>", "Set toast level").choices(["error", "alert", "info"]).default("info")).option("--duration-ms <MS>", "Show the message for 2000\u201360000 milliseconds", toastDuration).action(bind(handleScreenToast));
  screen.command("identify").description("Show a screen's name over its content for a while, to find it on site").argument("<id>", "Screen identifier").option("--duration <DURATION>", "How long the overlay stays up: 2s to 10m, such as 30s or 1m30s (default 60s)", identifyDurationOption).action(bind(handleScreenIdentify));
  screen.command("play-page").description("Start a page of the playlist a screen is playing now, for checking that page with screen screenshot").argument("<id>", "Screen identifier").requiredOption("--page-id <ID>", "Page of the playlist the screen is playing (required)").action(bind(handleScreenPlayPage));
  const live = screen.command("live").description("Watch what a screen plays, live: start, read and stop a live view session");
  live.command("start").description("Start live view of a screen, or renew it, and print the dashboard page that shows it").argument("<id>", "Screen identifier").option("--duration <DURATION>", "How long the session lasts unless renewed: 30s to 5m, such as 90s or 5m (default 5m); a session ends after five minutes at most", liveDurationOption).option("--wait <DURATION>", "How long to wait for the Player to start publishing: 1s to 10m, or 0 to return at once (default 30s)", liveWaitOption).action(bind(handleScreenLiveStart));
  live.command("status").description("Read a screen's live view session").argument("<id>", "Screen identifier").action(bind(handleScreenLiveStatus));
  live.command("stop").description("End a screen's live view session").argument("<id>", "Screen identifier").action(bind(handleScreenLiveStop));
  live.command("frame").description("Save JPEG frames of what a screen plays, from its live stream, to check playback and motion").argument("<id>", "Screen identifier").option("--output <PATH>", "Write one frame to this file, or the frames into this directory as frame-<captured_at>.jpg (default: the working directory)").option("--count <N>", "Save this many new frames (default 1)", positiveInteger("count")).option("--interval <DURATION>", "Pause between frames: 1s to 5m, or 0 to take each frame as it arrives (default 1s)", liveFrameIntervalOption).option("--duration <DURATION>", "Lease of the live session this command starts, at least long enough for the frames: 30s to 5m, such as 90s or 5m (default 2m)", liveDurationOption).option("--wait <DURATION>", "How long to wait for the Player to start publishing, and for each frame: 1s to 10m, or 0 to try once (default 30s)", liveWaitOption).option("--stop", "End the live session when done, also when a frame failed").action(bind(handleScreenLiveFrame));
  screen.command("screenshot").description("Capture and download screenshots from a screen or a fleet of screens").argument("[id...]", "Screen identifier; several ids capture each screen").option("--tag <TAG>", "Capture every active screen carrying this tag", screenTagOption).addOption(folderSelector("Capture")).option("--output <PATH>", "Write the screenshot to this file; with several ids or --tag, a directory").option("--concurrency <N>", "Captures in flight at once with several ids or --tag (1-8, default 4)", positiveInteger("concurrency")).option("--poll-ms <MS>", "Set the operation polling interval", positiveInteger("poll-ms")).action(bind(handleScreenScreenshot));
  const tag = screen.command("tag").description("Set, add, remove, or clear screen tags on a screen or a fleet of screens").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).option("--set <TAGS>", "Replace the tag set with these comma-separated tags", screenTagListOption("--set")).option("--add <TAGS>", "Add these comma-separated tags", screenTagListOption("--add")).option("--remove <TAGS>", "Remove these comma-separated tags", screenTagListOption("--remove")).option("--clear", "Remove every tag").option("--expect-rev <REVISION>", "Optionally require this screen revision (one screen id only)", revision).action(bind(handleScreenTag));
  requireOptionGroup(tag, "exactlyOne", ["--set", "--add", "--remove", "--clear"]);
  const move = screen.command("move").description("Move screens and screen folders into a screen folder, or back to the project root").argument("<ids...>", "Screen (scr_...) and screen folder (sfd_...) identifiers, at most 1000").option("--folder <ID>", "Destination screen folder (sfd_...)", screenFolderIdOption("--folder")).option("--root", "Move to the project root, outside every folder").option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleScreenMove));
  requireOptionGroup(move, "exactlyOne", ["--folder", "--root"]);
  const folder = screen.command("folder").description("List, create, rename, move, and delete screen folders; a folder targets its screens and sets their default playlist");
  folder.command("list").description("List the project's screen folders as a tree, with the live screens directly in each and its default playlist").action(bind(handleScreenFolderList));
  folder.command("show").description("Inspect a screen folder").argument("<id>", "Screen folder identifier (sfd_...)").action(bind(handleScreenFolderShow));
  folder.command("create").description("Create a screen folder at the project root or inside another folder").requiredOption("--name <NAME>", "Folder name, 1 to 100 characters, unique among its siblings (required)", screenFolderName).option("--parent <ID>", "Create it inside this screen folder (sfd_...); omitted creates it at the project root", screenFolderIdOption("--parent")).option("--default-playlist-id <ID>", "The approved playlist its screens show when they have none of their own", screenFolderPlaylistOption).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleScreenFolderCreate));
  const folderUpdate = folder.command("update").description("Rename a screen folder, move it with everything inside, or set or clear its default playlist").argument("<id>", "Screen folder identifier (sfd_...)").option("--name <NAME>", "New folder name, 1 to 100 characters, unique among its siblings", screenFolderName).addOption(new Option("--parent <ID>", "Move it inside this screen folder (sfd_...)").argParser(screenFolderIdOption("--parent")).conflicts("root")).addOption(new Option("--root", "Move it to the project root").conflicts("parent")).addOption(new Option("--default-playlist-id <ID>", "The approved playlist its screens show when they have none of their own").argParser(screenFolderPlaylistOption).conflicts("clearDefault")).addOption(new Option("--clear-default", "Remove its default playlist").conflicts("defaultPlaylistId")).addOption(new Option("--unprotect", "Propose removing the folder's protection, sent alone; a second approver decides the review").conflicts(["name", "parent", "root", "defaultPlaylistId", "clearDefault"])).option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleScreenFolderUpdate));
  requireOptionGroup(folderUpdate, "atLeastOne", ["--name", "--parent", "--root", "--default-playlist-id", "--clear-default", "--unprotect"]);
  folder.command("delete").description("Delete a screen folder; its screens and folders move up one level").argument("<id>", "Screen folder identifier (sfd_...)").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleScreenFolderDelete));
  const schedule = screen.command("schedule").description("Show, set, or clear a screen's server-evaluated playlist schedule");
  schedule.command("show").description("Show a screen's playlist schedule and the playlist it currently selects").argument("<id>", "Screen identifier").action(bind(handleScreenScheduleShow));
  subcommand(schedule, "set").description("Replace the playlist schedule on a screen or a fleet of screens").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).requiredOption("--file <FILE>", 'Schedule JSON {"entries": [...]}, or - for stdin (required)').option("--expect-rev <REVISION>", "Optionally require this screen revision (one screen id only)", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleScreenScheduleSet));
  schedule.command("clear").description("Remove the playlist schedule from a screen or a fleet of screens").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).option("--expect-rev <REVISION>", "Optionally require this screen revision (one screen id only)", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleScreenScheduleClear));
  schedule.command("revisions").description("List a screen's playlist schedule revisions, newest first, one page at a time").argument("<id>", "Screen identifier").option("--after <CURSOR>", "Continue from the data.next_cursor of the previous page").action(bind(handleScreenScheduleRevisions));
  schedule.command("restore").description("Put an earlier revision's schedule back on a screen by copying it forward").argument("<id>", "Screen identifier").requiredOption("--revision <N>", "Revision to copy forward, as screen schedule revisions numbers it (required)", positiveInteger("revision")).option("--expect-rev <REVISION>", "Require this current screen revision (default: the revision read just before the write)", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleScreenScheduleRestore));
  schedule.command("preview").description("Show what replacing a screen's playlist schedule would change, without making it").argument("<id>", "Screen identifier").requiredOption("--file <FILE>", 'Schedule JSON {"entries": [...]}, or - for stdin (required)').addOption(new Option("--calendar-from <INSTANT>", "Start the calendars at this instant with a zone, such as 2026-12-01T00:00:00Z (default: now)").argParser(calendarInstantOption("--calendar-from"))).addOption(new Option("--calendar-to <INSTANT>", "End the calendars at this instant with a zone, at most 93 days after the start (default: a week after it)").argParser(calendarInstantOption("--calendar-to"))).action(bind(handleScreenSchedulePreview));
  const takeover = screen.command("takeover").description("Put a playlist ahead of campaigns, the schedule and assignment, or clear it");
  takeover.command("set", { isDefault: true }).description("Take over a screen or a fleet with one playlist (default: screen takeover ID ...)").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).requiredOption("--playlist-id <ID>", "Playlist to show (required)").addOption(new Option("--until <TIME>", "End at this RFC 3339 instant (at most 7 days ahead), or none to hold until cleared").argParser(takeoverUntilOption).conflicts(["for"])).addOption(new Option("--for <DURATION>", "End after this duration, such as 30m, 2h, or 3d (at most 7d)").argParser(durationOption).conflicts(["until"])).option("--reason <TEXT>", "Operator note carried on the takeover and its events (at most 120 characters)", takeoverReason).option("--expect-rev <REVISION>", "Optionally require this screen revision (one screen id only)", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleScreenTakeover));
  takeover.command("clear").description("End the takeover on a screen or a fleet of screens").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).option("--expect-rev <REVISION>", "Optionally require this screen revision (one screen id only)", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleScreenTakeoverClear));
  addCommandExamples(schedule.commands.find((command) => command.name() === "show"), "screenrig screen schedule show scr_LOBBY");
  addCommandExamples(schedule.commands.find((command) => command.name() === "set"), "screenrig screen schedule set scr_LOBBY --file dayparts.json --expect-rev 4", "screenrig screen schedule set --tag Cafe --file dayparts.json");
  addCommandExamples(schedule.commands.find((command) => command.name() === "clear"), "screenrig screen schedule clear scr_LOBBY", "screenrig screen schedule clear --tag Cafe");
  addCommandExamples(schedule.commands.find((command) => command.name() === "revisions"), "screenrig screen schedule revisions scr_LOBBY", "screenrig screen schedule revisions scr_LOBBY --after CURSOR");
  addCommandExamples(schedule.commands.find((command) => command.name() === "restore"), "screenrig screen schedule restore scr_LOBBY --revision 4", "screenrig screen schedule restore scr_LOBBY --revision 4 --expect-rev 9");
  addCommandExamples(schedule.commands.find((command) => command.name() === "preview"), "screenrig screen schedule preview scr_LOBBY --file dayparts.json", "screenrig screen schedule preview scr_LOBBY --file dayparts.json --calendar-from 2026-12-01T00:00:00Z --calendar-to 2027-01-01T00:00:00Z");
  addCommandExamples(takeover.commands.find((command) => command.name() === "set"), 'screenrig screen takeover scr_LOBBY --playlist-id pl_DRILL --for 30m --reason "Fire drill"', "screenrig screen takeover --tag Lobby --playlist-id pl_LAUNCH --for 2h", "screenrig screen takeover scr_A scr_B --playlist-id pl_NOTICE --until none");
  addCommandExamples(takeover.commands.find((command) => command.name() === "clear"), "screenrig screen takeover clear scr_LOBBY", "screenrig screen takeover clear --tag Lobby");
  const reboot = screen.command("reboot").description("Reboot a screen's device, or a fleet's devices").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).option("--yes", "Confirm a reboot of several screens or --tag (required for a fleet)").option("--expires-in <DURATION>", "How long the reboot waits for an offline screen to come online: 60s to 24h, such as 30m or 2h (default 24h)", expiresInOption).option("--expect-rev <REVISION>", "Optionally require this screen revision (one screen id only)", revision).action(bind(handleScreenReboot));
  addCommandNotes(reboot, "Reboot:\n  The Player reboots the device, not just itself. Only a Player that declares\n  the reboot capability in its host report receives it; any other screen is\n  refused with reboot_unsupported (exit 5) and nothing is sent. A screen that\n  is online is sent the request at once (state sent); an offline screen holds\n  it queued (state queued) and is sent it when it comes online, for 24 hours by\n  default; --expires-in changes that, from 60s to 24h. A newer reboot\n  supersedes one still queued. screen show lists the screen's commands (a sent\n  reboot is done once the device reports it booted), and screen command cancel\n  ID COMMAND_ID cancels one still queued. Each screen accepts at most 2 reboots\n  per 10 minutes; a refused or failed request and an exact replay spend none. A\n  fleet (several ids or --tag) requires --yes: the CLI never prompts.");
  addCommandExamples(reboot, "screenrig screen reboot scr_LOBBY", "screenrig screen reboot scr_LOBBY --expires-in 2h", "screenrig screen reboot --tag Lobby --yes");
  const maintenance = (spec, description, handler, notes, examples) => {
    const command = screen.command(spec.name).description(description).argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).option("--yes", "Confirm ".concat(spec.name, " on several screens, --tag or --folder (required for a fleet)")).option("--expires-in <DURATION>", "How long the ".concat(spec.name, " waits for an offline screen to come online: 60s to 24h, such as 30m or 2h (default 24h)"), expiresInOption).option("--expect-rev <REVISION>", "Optionally require this screen revision (one screen id only)", revision).action(bind(handler));
    const shared = "A screen that is online is sent the request at once (state sent); an offline screen\n  holds it queued (state queued) and is sent it when it comes online, for 24 hours by\n  default; --expires-in changes that, from 60s to 24h. Only a Player that declares the\n  ".concat(spec.type, " capability in its host report (screen show lists host capabilities)\n  receives it; any other screen is refused with command_unsupported (exit 5) and\n  nothing is sent. The Player reports how it ended: screen show lists the screen's\n  commands, each done or failed with the cause the Player reported. A newer ").concat(spec.name, "\n  supersedes one still queued, and screen command cancel ID COMMAND_ID cancels one\n  still queued. Each screen accepts at most 2 clear-cache, restart-app and\n  update-software requests together per 10 minutes; a refused or failed request and\n  an exact replay spend none. A fleet (several ids, --tag or --folder) requires --yes:\n  the CLI never prompts.");
    addCommandNotes(command, "".concat(spec.title, ":\n  ").concat(notes, "\n  ").concat(shared));
    addCommandExamples(command, ...examples);
  };
  maintenance(MAINTENANCE["clear-cache"], "Clear a screen's Player caches, or a fleet's", handleScreenClearCache, "The Player deletes its downloaded media, application packages and data caches,\n  keeps its pairing, identity and settings, then fetches the manifest and content\n  again; the screen can show its loading state while content refills. To refresh\n  content without clearing anything, run screen reload.", ["screenrig screen clear-cache scr_LOBBY", "screenrig screen clear-cache scr_LOBBY --expires-in 2h", "screenrig screen clear-cache --tag Lobby --yes"]);
  maintenance(MAINTENANCE["restart-app"], "Restart a screen's Player application, or a fleet's", handleScreenRestartApp, "The Player restarts its application, not the device: the Player process restarts\n  (a web Player reloads its page) and reports from the restarted process. To restart\n  the device, run screen reboot.", ["screenrig screen restart-app scr_LOBBY", "screenrig screen restart-app scr_LOBBY --expires-in 2h", "screenrig screen restart-app --tag Lobby --yes"]);
  maintenance(MAINTENANCE["update-software"], "Update a screen's Player to the newest release, or a fleet's", handleScreenUpdateSoftware, "The Player checks for the newest Player release now and installs it where its\n  platform lets the Player update itself (a web Player updates its service worker,\n  then reloads). done with cause up_to_date means the newest release already runs;\n  updated means a release was installed. A Player installed from a store or managed\n  by a device manager does not declare the capability and updates through that channel.", ["screenrig screen update-software scr_LOBBY", "screenrig screen update-software scr_LOBBY --expires-in 2h", "screenrig screen update-software --tag Lobby --yes"]);
  const commandGroup = screen.command("command").description("Manage the commands asked of a screen (reboot, reload, clear-cache, restart-app, update-software)");
  commandGroup.command("cancel").description("Cancel a command still queued for an offline screen").argument("<id>", "Screen identifier").argument("<command_id>", "Command id: an entry of commands in screen show, or the reboot_id, reload_id or command_id of the request's answer").option("--expect-rev <REVISION>", "Optionally require this resource revision", revision).action(bind(handleScreenCommandCancel));
  const displayGroup = screen.command("display").description("Turn a screen's display on or off now, or clear that override");
  const display = displayGroup.command("set", { isDefault: true }).description("Turn a screen's display, or a fleet's displays, on or off now (default: screen display ID --power on|off)").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request; a trailing on|off sets the power").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).addOption(new Option("--power <POWER>", "on or off").choices(["on", "off"])).addOption(new Option("--until <TIME>", "End at this RFC 3339 instant (strictly future, at most 7 days ahead)").argParser(untilOption).conflicts(["for"])).addOption(new Option("--for <DURATION>", "End after this duration, such as 30m, 2h, or 3d (at most 6d23h59m)").argParser(durationOption).conflicts(["until"])).option("--expect-rev <REVISION>", "Optionally require this screen revision (one screen id only)", revision).action(bind(handleScreenDisplay));
  addCommandNotes(display, "Display power:\n  A manual override of the display schedule. Without --until or --for it ends\n  at the display schedule's next boundary; a later display-schedule change or\n  timezone change moves that end to the new next boundary. With no schedule\n  boundary in the next eight days (no enabled schedule) it holds until\n  screen display clear or a replacement. Success saves the override without\n  waiting for a power report. display.override_status compares a newer report:\n  matches, mismatch, pending, stale or unknown; matches describes the report,\n  not command execution. Inspect warnings and screen show before capturing.\n  display_power_mismatch names a fresh differing report; display_power_unconfirmed\n  means a newer usable report is needed. display_scrim_only means the Player\n  controls a black overlay; display on removes it without a hardware wake.\n  At most 10 display changes per screen per minute; refusals and replays spend none.");
  addCommandExamples(display, "screenrig screen display scr_LOBBY --power off --for 2h", "screenrig screen display --tag Lobby --power on", "screenrig screen display scr_A scr_B --power off --for 8h");
  const displayClear = displayGroup.command("clear").description("End the manual display override on a screen or a fleet; the schedule (else on) applies again").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).option("--expect-rev <REVISION>", "Optionally require this screen revision (one screen id only)", revision).action(bind(handleScreenDisplayClear));
  addCommandExamples(displayClear, "screenrig screen display clear scr_LOBBY", "screenrig screen display clear --tag Lobby");
  const displaySchedule = screen.command("display-schedule").description("Show, set, or clear when a screen's display is on");
  displaySchedule.command("show").description("Show a screen's display schedule and its display state").argument("<id>", "Screen identifier").action(bind(handleScreenDisplayScheduleShow));
  subcommand(displaySchedule, "set").description("Replace the display schedule on a screen or a fleet of screens").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).requiredOption("--file <FILE>", 'Display schedule JSON {"enabled": true, "windows": [...]}, or - for stdin (required)').option("--expect-rev <REVISION>", "Optionally require this screen revision (one screen id only)", revision).action(bind(handleScreenDisplayScheduleSet));
  displaySchedule.command("clear").description("Remove the display schedule from a screen or a fleet of screens").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).option("--expect-rev <REVISION>", "Optionally require this screen revision (one screen id only)", revision).action(bind(handleScreenDisplayScheduleClear));
  addCommandNotes(displaySchedule, 'Display schedule:\n  The screen needs a timezone first (screen set-timezone ID --timezone ZONE).\n  1 to 16 windows when the display is ON, in the screen timezone (required):\n  {"enabled": true, "windows": [{"days": ["mon","tue"], "start": "07:00", "end": "19:00"}]}.\n  end <= start crosses midnight; omit start and end for the whole day. Outside\n  every window the display goes to standby. enabled false keeps the windows and\n  leaves the display on. The device evaluates it offline.');
  addCommandExamples(displaySchedule.commands.find((command) => command.name() === "show"), "screenrig screen display-schedule show scr_LOBBY");
  addCommandExamples(displaySchedule.commands.find((command) => command.name() === "set"), "screenrig screen display-schedule set scr_LOBBY --file hours.json", "screenrig screen display-schedule set --tag Cafe --file hours.json");
  addCommandExamples(displaySchedule.commands.find((command) => command.name() === "clear"), "screenrig screen display-schedule clear scr_LOBBY", "screenrig screen display-schedule clear --tag Cafe");
  const rebootSchedule = screen.command("reboot-schedule").description("Show, set, or clear when the backend reboots a screen's device");
  rebootSchedule.command("show").description("Show a screen's reboot schedule and its next reboot").argument("<id>", "Screen identifier").action(bind(handleScreenRebootScheduleShow));
  const rebootScheduleSet = subcommand(rebootSchedule, "set").description("Replace the reboot schedule on a screen or a fleet of screens").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).addOption(new Option("--window <SPEC>", 'Reboot at the start of this weekly window, DAYS HH:MM-HH:MM such as "Mon-Sun 04:00-04:30" (repeatable, at most 16); each window lasts 5 minutes to 24 hours').argParser(rebootWindowOption).conflicts(["file"])).addOption(new Option("--file <FILE>", 'Reboot schedule JSON {"enabled": true, "windows": [...]}, or - for stdin, instead of --window').conflicts(["window", "disabled"])).addOption(new Option("--disabled", "Keep the windows and reboot nothing").conflicts(["file"])).option("--expect-rev <REVISION>", "Optionally require this screen revision (one screen id only)", revision).action(bind(handleScreenRebootScheduleSet));
  requireOptionGroup(rebootScheduleSet, "exactlyOne", ["--window", "--file"]);
  rebootSchedule.command("clear").description("Remove the reboot schedule from a screen or a fleet of screens").argument("[id...]", "Screen identifier; several ids target those screens in one fleet request").option("--tag <TAG>", "Target every active screen carrying this tag", screenTagOption).addOption(folderSelector()).option("--expect-rev <REVISION>", "Optionally require this screen revision (one screen id only)", revision).action(bind(handleScreenRebootScheduleClear));
  addCommandNotes(rebootSchedule, 'Reboot schedule:\n  The screen needs a timezone first (screen set-timezone ID --timezone ZONE), and\n  its Player must declare the reboot capability (reboot_unsupported otherwise).\n  Each --window is DAYS HH:MM-HH:MM in the screen timezone, 5 minutes to 24 hours\n  long (end <= start crosses midnight); the backend sends the normal reboot at the\n  start of every window, so "Mon-Sun 04:00-04:30" reboots the screen at 04:00\n  local time every day. An offline screen keeps the reboot queued only until its\n  window ends, so a late reboot never lands in business hours. screen show lists\n  such a reboot under commands with source schedule, and a planned reboot raises\n  no offline alert for ten minutes. --disabled keeps the windows and reboots\n  nothing. show prints next_reboot_at.');
  addCommandExamples(rebootSchedule.commands.find((command) => command.name() === "show"), "screenrig screen reboot-schedule show scr_LOBBY");
  addCommandExamples(rebootScheduleSet, 'screenrig screen reboot-schedule set scr_LOBBY --window "Mon-Sun 04:00-04:30"', 'screenrig screen reboot-schedule set --tag Cafe --window "Mon-Fri 04:00-04:30" --window "Sat,Sun 05:00-06:00"', "screenrig screen reboot-schedule set scr_LOBBY --file reboots.json --expect-rev 4");
  addCommandExamples(rebootSchedule.commands.find((command) => command.name() === "clear"), "screenrig screen reboot-schedule clear scr_LOBBY", "screenrig screen reboot-schedule clear --tag Cafe");
  const update = screen.commands.find((command) => command.name() === "update");
  requireOptionGroup(update, "requires", ["--location-name", "--location"]);
  requireOptionGroup(update, "requires", ["--address", "--location"]);
  requireOptionGroup(update, "atLeastOne", ["--name", "--playlist-id", "--clear-playlist", "--timezone", "--field", "--unset-field", "--clear-fields", "--location", "--clear-location"]);
}

// dist/cli-commands/fleet-links.js
var fleet_links_exports2 = {};
__export(fleet_links_exports2, {
  registerFleetLinksCommands: () => registerFleetLinksCommands
});

// dist/handlers/fleet-links.js
var fleet_links_exports = {};
__export(fleet_links_exports, {
  FLEET_LINKS_PATH: () => FLEET_LINKS_PATH,
  fleetLinkAndroidProvisioning: () => fleetLinkAndroidProvisioning,
  fleetLinkCall: () => fleetLinkCall,
  fleetLinkResult: () => fleetLinkResult,
  fleetLinkRevisionHeaders: () => fleetLinkRevisionHeaders,
  fleetLinkTagList: () => fleetLinkTagList,
  handleFleetLinksCreate: () => handleFleetLinksCreate,
  handleFleetLinksDelete: () => handleFleetLinksDelete,
  handleFleetLinksList: () => handleFleetLinksList,
  handleFleetLinksRotate: () => handleFleetLinksRotate,
  handleFleetLinksShow: () => handleFleetLinksShow,
  handleFleetLinksUpdate: () => handleFleetLinksUpdate
});

// dist/android-provisioning.js
var android_provisioning_exports = {};
__export(android_provisioning_exports, {
  ANDROID_MANIFEST_PATH: () => ANDROID_MANIFEST_PATH,
  PROVISIONING_NOTICE: () => PROVISIONING_NOTICE,
  androidProvisioning: () => androidProvisioning,
  fetchManagedArtifact: () => fetchManagedArtifact,
  fleetLinkSecret: () => fleetLinkSecret,
  managedArtifact: () => managedArtifact,
  signatureChecksum: () => signatureChecksum,
  siteOrigin: () => siteOrigin,
  unsupportedSiteError: () => unsupportedSiteError
});
var ANDROID_MANIFEST_PATH = "/android/manifest.json";
var ADMIN_RECEIVER = "ai.screenrig.player.managed.ScreenRigDeviceAdminReceiver";
var PACKAGE_NAME = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/;
var SIGNER_SHA256 = /^[0-9a-f]{64}$/i;
var FLEET_SECRET = /srfl_[A-Za-z0-9_-]{43}(?![A-Za-z0-9_-])/;
var MANIFEST_TIMEOUT_MS = 15e3;
function fleetLinkSecret(text) {
  return text === void 0 ? void 0 : FLEET_SECRET.exec(text)?.[0];
}
function signatureChecksum(signerSha256) {
  return Buffer.from(signerSha256, "hex").toString("base64url");
}
function managedArtifact(manifest) {
  const entry = manifest && typeof manifest === "object" ? manifest.managed : void 0;
  if (!entry || typeof entry !== "object")
    return void 0;
  const { package: name, path: path2, signer_sha256: signer } = entry;
  if (typeof name !== "string" || !PACKAGE_NAME.test(name))
    return void 0;
  if (typeof path2 !== "string" || !path2.startsWith("/android/") || !path2.endsWith(".apk"))
    return void 0;
  if (typeof signer !== "string" || !SIGNER_SHA256.test(signer))
    return void 0;
  return { package: name, path: path2, signer_sha256: signer };
}
function siteOrigin(apiUrl) {
  let api;
  try {
    api = new URL(apiUrl);
  } catch {
    return void 0;
  }
  const apex = apexHost(api.hostname);
  if (!apex || api.protocol !== "https:" && !(api.protocol === "http:" && api.hostname.endsWith(".localhost")))
    return void 0;
  return "".concat(api.protocol, "//").concat(apex).concat(api.port ? ":".concat(api.port) : "");
}
function androidProvisioning(artifact, origin, secret) {
  if (fleetLinkSecret(secret) !== secret)
    return void 0;
  let location;
  try {
    location = new URL(artifact.path, origin);
  } catch {
    return void 0;
  }
  if (location.origin !== origin || !location.pathname.startsWith("/android/"))
    return void 0;
  return {
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "".concat(artifact.package, "/").concat(ADMIN_RECEIVER),
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": location.href,
    "android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM": signatureChecksum(artifact.signer_sha256),
    "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": true,
    "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": { fleet_link: secret }
  };
}
function causeText(error) {
  const message = error instanceof Error ? error.message : String(error);
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  return cause && cause !== message ? "".concat(message, ": ").concat(cause) : message;
}
async function fetchManagedArtifact(origin, fetchImplementation) {
  const url = "".concat(origin).concat(ANDROID_MANIFEST_PATH);
  let response;
  try {
    response = await fetchImplementation(url, { method: "GET", headers: { accept: "application/json" }, redirect: "error", signal: AbortSignal.timeout(MANIFEST_TIMEOUT_MS) });
  } catch (error) {
    throw networkError("Could not read ".concat(url, ": ").concat(causeText(error), "."));
  }
  if (!response.ok)
    throw unexpectedResponseError("".concat(url, " answered HTTP ").concat(response.status, "."));
  let manifest;
  try {
    manifest = await response.json();
  } catch {
    throw unexpectedResponseError("".concat(url, " did not answer a JSON document."));
  }
  const artifact = managedArtifact(manifest);
  if (!artifact) {
    throw new CliError(makeProblem("android_device_owner_build_unavailable", "No Android device owner build", 404, "".concat(origin, " lists no Android build for device owner setup, so there is nothing to provision with. Do not use the player build: it has no device administrator.")));
  }
  return artifact;
}
var PROVISIONING_NOTICE = "Sensitive: this JSON carries the fleet link secret, which creates screens. Encode it as a QR code and show it only to the person at the device (Welcome screen: tap six times, then scan).";
function unsupportedSiteError() {
  return usageError("--android-provisioning reads the Android build list from the site that belongs to the configured API origin, and this origin has none.", {
    command: "screenrig doctor",
    reason: "Shows the configured API origin without sending requests."
  });
}

// dist/handlers/fleet-links.js
var FLEET_LINKS_PATH = "/api/fleet-links";
async function fleetLinkCall(client, request, id) {
  try {
    return await client.call(request);
  } catch (error) {
    throw fleetLinkProblem(error, id);
  }
}
function fleetLinkRevisionHeaders(args) {
  const revision2 = flagString(args.flags, "expect-rev");
  return revision2 ? { "if-match": quotedRevision(revision2) } : void 0;
}
function fleetLinkTagList(args) {
  const tags = flagString(args.flags, "tag");
  return tags === void 0 ? void 0 : tags.split(",");
}
function fleetLinkResult(response, client, title, withUrl, now) {
  const answered = response.body;
  const { link, warnings } = answered && typeof answered === "object" ? guardFleetLink(answered) : { link: answered, warnings: [] };
  return {
    envelope: jsonBody({ ...response, body: link }, client.requestId, void 0, warnings),
    exitCode: ExitCode.Success,
    human: [
      title,
      ...fleetLinkLines(link, now),
      ...withUrl ? fleetLinkUrlLines(link, warnings.length > 0) : [],
      ...warnings.map((warning) => "warning: ".concat(warning.message))
    ].join("\n")
  };
}
var handleFleetLinksCreate = commandHandler(async (args, runtime, resolved) => {
  const label = fleetLinkName(flagString(args.flags, "name") ?? "");
  const tags = fleetLinkTagList(args);
  const fields = fieldMap(flagString(args.flags, "field"));
  const playlistId = flagString(args.flags, "playlist-id");
  const maxScreens = flagString(args.flags, "max-screens");
  const expiresAt = flagString(args.flags, "expires-at");
  const body = {
    label,
    ...flagBool(args.flags, "disabled") ? { enabled: false } : {},
    ...tags !== void 0 ? { tags } : {},
    ...fields !== void 0 ? { fields } : {},
    ...playlistId !== void 0 ? { playlist_id: fleetLinkPlaylistId(playlistId) } : {},
    ...maxScreens !== void 0 ? { max_screens: Number(fleetLinkMaxScreens(maxScreens)) } : {},
    ...expiresAt !== void 0 ? { expires_at: fleetLinkExpiresAt(expiresAt) } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await fleetLinkCall(client, { method: "POST", path: FLEET_LINKS_PATH, idempotent: true, body });
  const id = response.body?.id;
  return fleetLinkResult(response, client, "Created fleet link ".concat(id ?? "").trimEnd(), true, runtime.now());
});
var handleFleetLinksList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await fleetLinkCall(client, { method: "GET", path: FLEET_LINKS_PATH });
  const listed = response.body?.items;
  const { items, warnings } = guardFleetLinks(Array.isArray(listed) ? listed : []);
  return {
    envelope: jsonBody({ ...response, body: { ...response.body, items } }, client.requestId, void 0, warnings),
    exitCode: ExitCode.Success,
    human: ["Fleet links (".concat(items.length, ")"), ...fleetLinkTableLines(items, runtime.now()), ...fleetLinkRedactedNote(items), ...warnings.map((warning) => "warning: ".concat(warning.message))].join("\n")
  };
});
var handleFleetLinksShow = commandHandler(async (args, runtime, resolved) => {
  const id = fleetLinkId(args.positionals[2], "show");
  const wantsProvisioning = flagBool(args.flags, "android-provisioning");
  const origin = wantsProvisioning ? siteOrigin(resolved.apiUrl) : void 0;
  if (wantsProvisioning && origin === void 0)
    throw unsupportedSiteError();
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await fleetLinkCall(client, { method: "GET", path: "".concat(FLEET_LINKS_PATH, "/").concat(id) }, id);
  if (origin === void 0)
    return fleetLinkResult(response, client, "Fleet link", true, runtime.now());
  return fleetLinkAndroidProvisioning(response, client, origin, runtime);
});
async function fleetLinkAndroidProvisioning(response, client, origin, runtime) {
  const answered = response.body;
  const secret = answered && typeof answered === "object" && !fleetLinkUrlProblem(answered.url) ? fleetLinkSecret(answered.url) : void 0;
  if (secret === void 0) {
    throw new CliError(makeProblem("fleet_link_secret_unavailable", "Fleet link secret unavailable", 403, answered?.url_redacted === true ? "A Read only credential receives no fleet link URL, so the provisioning payload cannot carry the link's secret." : "The fleet link was returned without a usable URL, so the provisioning payload cannot carry its secret.", { next: { command: "screenrig login --access manage", reason: "A Manage sign-in receives the fleet link URL." } }));
  }
  const artifact = await fetchManagedArtifact(origin, runtime.siteFetch ?? globalThis.fetch);
  const provisioning = androidProvisioning(artifact, origin, secret);
  if (provisioning === void 0) {
    throw unexpectedResponseError("The managed Android build lists a path outside ".concat(origin, "/android/, so no download location is built for it."));
  }
  const id = String(answered?.id ?? "");
  return {
    envelope: successEnvelope({ id, provisioning }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: ["Android device owner provisioning for fleet link ".concat(id), PROVISIONING_NOTICE, "", JSON.stringify(provisioning)].join("\n")
  };
}
var handleFleetLinksUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = fleetLinkId(args.positionals[2], "update");
  const name = flagString(args.flags, "name");
  const tags = fleetLinkTagList(args);
  const fields = fieldMap(flagString(args.flags, "field"));
  const playlistId = flagString(args.flags, "playlist-id");
  const maxScreens = flagString(args.flags, "max-screens");
  const expiresAt = flagString(args.flags, "expires-at");
  const patch = {
    ...name !== void 0 ? { label: fleetLinkName(name) } : {},
    ...flagBool(args.flags, "enable") ? { enabled: true } : {},
    ...flagBool(args.flags, "disable") ? { enabled: false } : {},
    ...tags !== void 0 ? { tags } : {},
    ...flagBool(args.flags, "clear-tags") ? { tags: [] } : {},
    ...fields !== void 0 ? { fields } : {},
    ...flagBool(args.flags, "clear-fields") ? { fields: null } : {},
    ...playlistId !== void 0 ? { playlist_id: fleetLinkPlaylistId(playlistId) } : {},
    ...flagBool(args.flags, "clear-playlist") ? { playlist_id: null } : {},
    ...maxScreens !== void 0 ? { max_screens: Number(fleetLinkMaxScreens(maxScreens)) } : {},
    ...flagBool(args.flags, "clear-max-screens") ? { max_screens: null } : {},
    ...expiresAt !== void 0 ? { expires_at: fleetLinkExpiresAt(expiresAt) } : {},
    ...flagBool(args.flags, "clear-expires-at") ? { expires_at: null } : {}
  };
  if (!Object.keys(patch).length) {
    throw usageError("fleet-links update requires at least one of --name, --enable, --disable, --tag, --clear-tags, --field, --clear-fields, --playlist-id, --clear-playlist, --max-screens, --clear-max-screens, --expires-at, or --clear-expires-at.");
  }
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await fleetLinkCall(client, {
    method: "PATCH",
    path: "".concat(FLEET_LINKS_PATH, "/").concat(id),
    idempotent: true,
    body: patch,
    headers: fleetLinkRevisionHeaders(args)
  }, id);
  return fleetLinkResult(response, client, "Updated fleet link ".concat(id, ". Screens it already created are unchanged."), false, runtime.now());
});
var handleFleetLinksRotate = commandHandler(async (args, runtime, resolved) => {
  const id = fleetLinkId(args.positionals[2], "rotate");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await fleetLinkCall(client, {
    method: "POST",
    path: "".concat(FLEET_LINKS_PATH, "/").concat(id, "/rotate"),
    idempotent: true,
    headers: fleetLinkRevisionHeaders(args)
  }, id);
  return fleetLinkResult(response, client, "Rotated fleet link ".concat(id, ". The old URL stopped working; screens it already created keep playing. Put the new URL in your device manager."), true, runtime.now());
});
var handleFleetLinksDelete = commandHandler(async (args, runtime, resolved) => {
  const id = fleetLinkId(args.positionals[2], "delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await fleetLinkCall(client, {
    method: "DELETE",
    path: "".concat(FLEET_LINKS_PATH, "/").concat(id),
    idempotent: true,
    headers: fleetLinkRevisionHeaders(args)
  }, id);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: "Deleted fleet link ".concat(id, ". Its URL stopped working; screens it created stay, with their playlists and tags.")
  };
});

// dist/cli-commands/fleet-links.js
var nameOption = (value) => {
  fleetLinkName(value);
  return value;
};
function registerFleetLinksCommands(root, bind) {
  const links = root.command("fleet-links").description("Turn every device that opens one Player URL into a screen");
  addCommandNotes(links, "Fleet links:\n  A fleet link is one Player URL (https://play.<domain>/player/#fleet=...) for a\n  device manager, such as a Google Admin console kiosk app. Every device that\n  opens it becomes its own screen in this project, without a pairing code, with\n  the link's tags and playlist and a label from the device (its administrator\n  asset ID, then location). A device keeps its one screen across reloads. The\n  URL is a credential that creates screens: give it only to the device manager.\n  A link can expire at a set time. An organization has at most 50 across its projects.");
  links.command("create").description("Create a fleet link and print its Player URL").requiredOption("--name <NAME>", "Name the link, 1 to 80 characters (required)", nameOption).option("--tag <TAG>", "Give each new screen this tag (repeatable, or comma-separated; at most 16)", fleetLinkTags).option("--field <NAME=VALUE>", "Give each new screen this field, which card placements read as {screen.field.NAME} (repeatable; at most 32)", fleetLinkFieldOption).option("--playlist-id <ID>", "Assign this playlist to each new screen", fleetLinkPlaylistId).option("--max-screens <N>", "Create at most N screens, 1 to 10000 (default: no cap)", fleetLinkMaxScreens).option("--expires-at <TIME>", "Stop creating and recovering screens at this RFC 3339 time with a zone, such as 2026-12-31T23:59:59Z (default: never)", fleetLinkExpiresAt).option("--disabled", "Create it disabled; devices show their pairing code until fleet-links update --enable").action(bind(handleFleetLinksCreate));
  links.command("list").description("List this project's fleet links (never their URLs in human output)").action(bind(handleFleetLinksList));
  links.command("show").description("Inspect a fleet link and print its Player URL").argument("<id>", "Fleet link identifier").option("--android-provisioning", "Print the Android device owner provisioning JSON for this link instead of its details; encode it as a QR code for a factory-reset device (needs a Manage sign-in)").action(bind(handleFleetLinksShow));
  const update = links.command("update").description("Change what a fleet link gives the screens it creates from now on").argument("<id>", "Fleet link identifier").option("--name <NAME>", "Rename the link, 1 to 80 characters", nameOption).addOption(new Option("--enable", "Let the link create and recover screens again").conflicts(["disable"])).addOption(new Option("--disable", "Stop creating and recovering screens; devices show their pairing code").conflicts(["enable"])).addOption(new Option("--tag <TAG>", "Replace the tags new screens get (repeatable, or comma-separated; at most 16)").argParser(fleetLinkTags).conflicts(["clearTags"])).addOption(new Option("--field <NAME=VALUE>", "Replace the fields new screens get (repeatable; at most 32)").argParser(fleetLinkFieldOption).conflicts(["clearFields"])).addOption(new Option("--clear-fields", "New screens get no fields").conflicts(["field"])).addOption(new Option("--clear-tags", "New screens get no tags").conflicts(["tag"])).addOption(new Option("--playlist-id <ID>", "Assign this playlist to each new screen").argParser(fleetLinkPlaylistId).conflicts(["clearPlaylist"])).addOption(new Option("--clear-playlist", "New screens get no playlist").conflicts(["playlistId"])).addOption(new Option("--max-screens <N>", "Create at most N screens in all, 1 to 10000").argParser(fleetLinkMaxScreens).conflicts(["clearMaxScreens"])).addOption(new Option("--clear-max-screens", "Remove the cap on the screens this link creates").conflicts(["maxScreens"])).addOption(new Option("--expires-at <TIME>", "Stop creating and recovering screens at this RFC 3339 time with a zone, such as 2026-12-31T23:59:59Z").argParser(fleetLinkExpiresAt).conflicts(["clearExpiresAt"])).addOption(new Option("--clear-expires-at", "Remove the expiry; the link never expires").conflicts(["expiresAt"])).option("--expect-rev <REVISION>", "Optionally require this fleet link revision", revision).action(bind(handleFleetLinksUpdate));
  requireOptionGroup(update, "atLeastOne", ["--name", "--enable", "--disable", "--tag", "--clear-tags", "--field", "--clear-fields", "--playlist-id", "--clear-playlist", "--max-screens", "--clear-max-screens", "--expires-at", "--clear-expires-at"]);
  links.command("rotate").description("Replace a fleet link's URL; the old URL stops working at once").argument("<id>", "Fleet link identifier").option("--expect-rev <REVISION>", "Optionally require this fleet link revision", revision).action(bind(handleFleetLinksRotate));
  links.command("delete").description("Delete a fleet link; its URL stops working and its screens stay").argument("<id>", "Fleet link identifier").option("--expect-rev <REVISION>", "Optionally require this fleet link revision", revision).action(bind(handleFleetLinksDelete));
}

// dist/bundles/screens.js
function register(root, bind) {
  registerScreenCommands(root, bind);
  registerFleetLinksCommands(root, bind);
}

export {
  aspect_mismatch_exports,
  screen_exports,
  screen_schedule_change_exports,
  screen_exports2,
  android_provisioning_exports,
  fleet_links_exports,
  fleet_links_exports2,
  register,
  screens_exports
};
