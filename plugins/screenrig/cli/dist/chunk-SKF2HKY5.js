import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  clientFor,
  commandHandler,
  jsonBody,
  pendingReviewResult,
  quotedRevision,
  requireToken,
  reviewNoteFrom
} from "./chunk-VK2RJKZX.js";
import {
  pendingReviewOf
} from "./chunk-M3NEXUHJ.js";
import {
  SCREEN_FOLDER_ID_PATTERN,
  flagBool,
  flagString,
  screenFolderId
} from "./chunk-NWPDH6L4.js";
import {
  isResourceID
} from "./chunk-SFYZH3GR.js";
import {
  CliError,
  ExitCode,
  usageError
} from "./chunk-5E3Z6J6F.js";

// dist/screen-folders.js
var SCREEN_FOLDER_NAME_MAX = 100;
var SCREEN_MOVE_IDS_MAX = 1e3;
var SCREEN_SCOPE_FOLDERS_MAX = 1e3;
var SCREEN_SCOPE_SCREENS_MAX = 200;
var FOLDERS_PATH = "/api/screen-folders";
function screenFolderName(value) {
  const trimmed = value.trim();
  if (!trimmed || [...trimmed].length > SCREEN_FOLDER_NAME_MAX || new RegExp("\\p{Cc}", "u").test(trimmed) || trimmed === "." || trimmed === "..") {
    throw usageError("--name must hold 1 to ".concat(SCREEN_FOLDER_NAME_MAX, " characters without controls, and not be . or .."));
  }
  return trimmed;
}
function screenScopeFromArgs(folderIds, screenIds) {
  if (!folderIds.length && !screenIds.length)
    throw usageError("A screen scope needs at least one --screen-folder-id or --screen-id.");
  if (folderIds.length > SCREEN_SCOPE_FOLDERS_MAX || screenIds.length > SCREEN_SCOPE_SCREENS_MAX) {
    throw usageError("A screen scope holds at most ".concat(SCREEN_SCOPE_FOLDERS_MAX, " screen folders and ").concat(SCREEN_SCOPE_SCREENS_MAX, " single screens; a folder includes every screen inside it."));
  }
  if (new Set(folderIds).size !== folderIds.length || new Set(screenIds).size !== screenIds.length)
    throw usageError("A screen scope lists each folder and screen once.");
  for (const id of folderIds)
    screenFolderId(id, "--screen-folder-id");
  for (const id of screenIds)
    if (!isResourceID(id, "screen"))
      throw usageError("--screen-id takes screen IDs (scr_...); screen list shows them.");
  return { folder_ids: folderIds, screen_ids: screenIds };
}
function screenFolderIdOption(flag) {
  return (value) => screenFolderId(value, flag);
}
function screenListFolderOption(value) {
  return value === "root" ? value : screenFolderId(value, "--folder");
}
function screenFolderPlaylistOption(value) {
  if (!isResourceID(value, "playlist")) {
    throw usageError("--default-playlist-id must be a playlist id (pl_...).", {
      command: "screenrig playlist list",
      reason: "List this project's playlists and their ids."
    });
  }
  return value;
}
function printable(text) {
  return text.replace(/[\p{Cc}\p{Cf}]/gu, " ").trim();
}
function plural(count, noun) {
  return "".concat(count, " ").concat(noun).concat(count === 1 ? "" : "s");
}
function folderRows(items) {
  const known = new Set(items.map((item) => item.id));
  const children = /* @__PURE__ */ new Map();
  for (const item of items) {
    const parent = item.parent_id !== null && known.has(item.parent_id) ? item.parent_id : null;
    children.set(parent, [...children.get(parent) ?? [], item]);
  }
  const rows = [];
  const seen = /* @__PURE__ */ new Set();
  const visit = (parent, prefix) => {
    for (const folder of children.get(parent) ?? []) {
      if (seen.has(folder.id))
        continue;
      seen.add(folder.id);
      const path = prefix ? "".concat(prefix, "/").concat(printable(folder.name)) : printable(folder.name);
      rows.push({ folder, path });
      visit(folder.id, path);
    }
  };
  visit(null, "");
  for (const item of items)
    if (!seen.has(item.id))
      visit(item.parent_id, "");
  return rows;
}
function table(header, rows) {
  const widths = header.map((cell, index) => Math.max(cell.length, ...rows.map((row) => (row[index] ?? "").length)));
  const render = (row) => row.map((cell, index) => cell.padEnd(widths[index])).join("  ").trimEnd();
  return [render(header), ...rows.map(render)];
}
function folderListLines(items) {
  if (!items.length)
    return ["No screen folders"];
  const marked = items.some((item) => item.protected);
  return [
    "Screen folders (".concat(items.length, ")"),
    ...table(["PATH", "ID", "SCREENS", "DEFAULT_PLAYLIST", ...marked ? ["PROTECTED"] : []], folderRows(items).map(({ folder, path }) => [
      path,
      folder.id,
      folder.screens === void 0 ? "" : String(folder.screens),
      folder.default_playlist_id ?? "",
      ...marked ? [folder.protected ? "yes" : ""] : []
    ]))
  ];
}
function folderLines(folder) {
  if (!folder)
    return [];
  return [
    "id: ".concat(folder.id),
    "name: ".concat(printable(folder.name)),
    "parent_id: ".concat(folder.parent_id ?? "(project root)"),
    "default_playlist_id: ".concat(folder.default_playlist_id ?? "(none)"),
    ...folder.protected ? ["protected: true (a change reaching its screens waits for a second approver)"] : [],
    ...folder.screens === void 0 ? [] : ["screens: ".concat(folder.screens)],
    "revision: ".concat(folder.revision),
    ...folder.created_at ? ["created_at: ".concat(folder.created_at)] : [],
    ...folder.updated_at ? ["updated_at: ".concat(folder.updated_at)] : []
  ];
}
function levelLine(level) {
  const name = level.name ? " ".concat(JSON.stringify(printable(level.name))) : "";
  const what = level.source === "folder" ? "default playlist" : "playlist";
  const reach = Number.isSafeInteger(level.reach_before) && Number.isSafeInteger(level.reach_after) ? ", reach ".concat(level.reach_before, " -> ").concat(level.reach_after) : "";
  return "  ".concat(level.source, " ").concat(level.id).concat(name, ": ").concat(what, " ").concat(level.playlist_id, ", ").concat(plural(level.screens, "screen")).concat(reach);
}
function sumLevels(pages) {
  const seen = pages.filter((page) => page !== void 0);
  if (!seen.length)
    return void 0;
  const add = (lists) => {
    const sums = /* @__PURE__ */ new Map();
    for (const level of lists.flat()) {
      const key = "".concat(level.source, ":").concat(level.id);
      const have = sums.get(key);
      if (!have) {
        sums.set(key, { ...level });
        continue;
      }
      have.screens += level.screens;
      if (Number.isSafeInteger(have.reach_before) && Number.isSafeInteger(have.reach_after) && Number.isSafeInteger(level.reach_before) && Number.isSafeInteger(level.reach_after)) {
        have.reach_after = have.reach_after + (level.reach_after - level.reach_before);
      }
    }
    return [...sums.values()];
  };
  return {
    gained: add(seen.map((page) => Array.isArray(page.gained) ? page.gained : [])),
    lost: add(seen.map((page) => Array.isArray(page.lost) ? page.lost : []))
  };
}
function levelsLines(levels) {
  if (!levels)
    return [];
  const gained = Array.isArray(levels.gained) ? levels.gained : [];
  const lost = Array.isArray(levels.lost) ? levels.lost : [];
  if (!gained.length && !lost.length)
    return ["No levels gained or lost: no campaign or folder default playlist changed for these screens."];
  return [
    ...gained.length ? ["Levels gained:", ...gained.map(levelLine)] : [],
    ...lost.length ? ["Levels lost:", ...lost.map(levelLine)] : []
  ];
}
function screenFolderProblem(error, id, action) {
  if (!(error instanceof CliError) || error.problem.next)
    return error;
  const problem = error.problem;
  const next = problem.code === "not_found" ? { command: "screenrig screen folder list", reason: "List this project's screen folders and their ids; a deleted folder does not come back." } : problem.code === "revision_conflict" && id ? { command: "screenrig screen folder show ".concat(id), reason: "Read the folder's current revision, then rerun with --expect-rev REVISION if the change still applies." } : problem.code === "resource_conflict" && action === "delete" ? { command: "screenrig campaign list", reason: "A campaign audience still names this folder. Change those campaigns (campaign update ID --folder OTHER, or campaign delete ID), then delete the folder." } : problem.code === "resource_conflict" ? { command: "screenrig screen folder list", reason: "Sibling folders need different names; list the folders to see what the destination already holds." } : void 0;
  return next ? new CliError({ ...problem, next }, error.exitCode, error.warnings) : error;
}
async function folderCall(client, request, id, action) {
  try {
    return await client.call(request);
  } catch (error) {
    throw screenFolderProblem(error, id, action);
  }
}
function folderResult(response, requestId, title) {
  const folder = response.body;
  return {
    envelope: jsonBody(response, requestId),
    exitCode: ExitCode.Success,
    human: [title, ...folderLines(folder), ...levelsLines(folder?.levels)].join("\n")
  };
}
var handleScreenFolderList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await folderCall(client, { method: "GET", path: FOLDERS_PATH });
  const items = response.body?.items;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: folderListLines(Array.isArray(items) ? items : []).join("\n")
  };
});
var handleScreenFolderShow = commandHandler(async (args, runtime, resolved) => {
  const id = screenFolderId(args.positionals[3], "screen folder show <id>");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await folderCall(client, { method: "GET", path: "".concat(FOLDERS_PATH, "/").concat(id) }, id);
  return folderResult(response, client.requestId, "Screen folder");
});
var handleScreenFolderCreate = commandHandler(async (args, runtime, resolved) => {
  const parent = flagString(args.flags, "parent");
  const playlist = flagString(args.flags, "default-playlist-id");
  const body = {
    name: screenFolderName(flagString(args.flags, "name") ?? ""),
    ...parent !== void 0 ? { parent_id: screenFolderId(parent, "--parent") } : {},
    ...playlist !== void 0 ? { default_playlist_id: screenFolderPlaylistOption(playlist) } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await folderCall(client, { method: "POST", path: FOLDERS_PATH, idempotent: true, body, headers: reviewNoteFrom(args) });
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  const id = response.body?.id ?? "";
  return folderResult(response, client.requestId, "Created screen folder ".concat(id, " ").concat(parent === void 0 ? "at the project root" : "inside ".concat(parent), ". screenrig screen move SCREEN_ID --folder ").concat(id, " puts screens in it."));
});
var handleScreenFolderUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = screenFolderId(args.positionals[3], "screen folder update <id>");
  const name = flagString(args.flags, "name");
  const parent = flagString(args.flags, "parent");
  const root = flagBool(args.flags, "root");
  const playlist = flagString(args.flags, "default-playlist-id");
  const clearDefault = flagBool(args.flags, "clear-default");
  const revision = flagString(args.flags, "expect-rev");
  const unprotect = flagBool(args.flags, "unprotect");
  if (name === void 0 && parent === void 0 && !root && playlist === void 0 && !clearDefault && !unprotect) {
    throw usageError("screen folder update requires --name NAME, --parent ID, --root, --default-playlist-id ID, --clear-default or --unprotect.");
  }
  if (parent !== void 0 && root)
    throw usageError("Give --parent ID or --root, not both.");
  if (playlist !== void 0 && clearDefault)
    throw usageError("Give --default-playlist-id ID or --clear-default, not both.");
  if (unprotect && (name !== void 0 || parent !== void 0 || root || playlist !== void 0 || clearDefault)) {
    throw usageError("--unprotect changes protection alone: send the rename, move or default playlist in another command.");
  }
  const body = unprotect ? { protected: false } : {
    ...name !== void 0 ? { name: screenFolderName(name) } : {},
    ...parent !== void 0 ? { parent_id: screenFolderId(parent, "--parent") } : {},
    ...root ? { parent_id: null } : {},
    ...playlist !== void 0 ? { default_playlist_id: screenFolderPlaylistOption(playlist) } : {},
    ...clearDefault ? { default_playlist_id: null } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await folderCall(client, {
    method: "PATCH",
    path: "".concat(FOLDERS_PATH, "/").concat(id),
    idempotent: true,
    body,
    headers: { ...reviewNoteFrom(args), ...revision ? { "if-match": quotedRevision(revision) } : {} }
  }, id);
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  return folderResult(response, client.requestId, unprotect ? "Cleared the protection of screen folder ".concat(id, ".") : "Updated screen folder ".concat(id, ". The screens inside re-resolve their playlist within about 15 seconds."));
});
var handleScreenFolderDelete = commandHandler(async (args, runtime, resolved) => {
  const id = screenFolderId(args.positionals[3], "screen folder delete <id>");
  const revision = flagString(args.flags, "expect-rev");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await folderCall(client, {
    method: "DELETE",
    path: "".concat(FOLDERS_PATH, "/").concat(id),
    idempotent: true,
    headers: { ...reviewNoteFrom(args), ...revision ? { "if-match": quotedRevision(revision) } : {} }
  }, id, "delete");
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  const levels = response.body?.levels;
  return {
    envelope: jsonBody({ ...response, body: { id, deleted: true, ...levels ? { levels } : {} } }, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Deleted screen folder ".concat(id, "; its screens and folders moved up into its parent (the project root when it had none) and the screens re-resolve their playlist."),
      ...levelsLines(levels)
    ].join("\n")
  };
});
var handleScreenMove = commandHandler(async (args, runtime, resolved) => {
  const destination = flagString(args.flags, "folder");
  const toRoot = flagBool(args.flags, "root");
  if (destination === void 0 === !toRoot)
    throw usageError("screen move requires exactly one of --folder ID or --root.");
  const screen_ids = [];
  const folder_ids = [];
  const ids = args.positionals.slice(2);
  for (const id of ids) {
    if (SCREEN_FOLDER_ID_PATTERN.test(id))
      folder_ids.push(id);
    else if (isResourceID(id, "screen"))
      screen_ids.push(id);
    else
      throw usageError("screen move takes screen IDs (scr_...) and screen folder IDs (sfd_...), not ".concat(JSON.stringify(id), "."));
  }
  if (!ids.length)
    throw usageError("screen move requires at least one screen or folder ID.");
  if (new Set(ids).size !== ids.length)
    throw usageError("screen move lists an ID more than once.");
  if (ids.length > SCREEN_MOVE_IDS_MAX)
    throw usageError("screen move takes at most ".concat(SCREEN_MOVE_IDS_MAX, " IDs in one request; split the move."));
  const folder = destination === void 0 ? null : screenFolderId(destination, "--folder");
  if (folder !== null && folder_ids.includes(folder))
    throw usageError("A folder cannot move into itself.");
  const body = {
    folder_id: folder,
    ...screen_ids.length ? { screen_ids } : {},
    ...folder_ids.length ? { folder_ids } : {}
  };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await folderCall(client, { method: "POST", path: "/api/screens/move", idempotent: true, body, headers: reviewNoteFrom(args) });
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  const moved = response.body;
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Moved ".concat(plural(moved?.screens ?? 0, "screen"), " and ").concat(plural(moved?.folders ?? 0, "folder"), " ").concat(folder === null ? "to the project root" : "into ".concat(folder), "."),
      ...levelsLines(moved?.levels)
    ].join("\n")
  };
});

export {
  screenFolderName,
  screenScopeFromArgs,
  screenFolderIdOption,
  screenListFolderOption,
  screenFolderPlaylistOption,
  sumLevels,
  levelsLines,
  handleScreenFolderList,
  handleScreenFolderShow,
  handleScreenFolderCreate,
  handleScreenFolderUpdate,
  handleScreenFolderDelete,
  handleScreenMove
};
