import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  table
} from "./chunk-CKOG7ZL3.js";
import {
  clientFor,
  commandHandler,
  jsonBody,
  playlistWriteResult,
  quotedRevision,
  requireToken
} from "./chunk-AOLD7THY.js";
import {
  flagString
} from "./chunk-V5GOKJGU.js";
import {
  ExitCode,
  usageError
} from "./chunk-JP4OQPAN.js";

// dist/playlist-revisions.js
var playlistRevisionsPath = (id) => "/api/playlists/".concat(encodeURIComponent(id), "/revisions");
function changeText(item) {
  return item.change === "promoted" && item.restored_from !== void 0 ? "promoted from ".concat(item.restored_from) : item.change;
}
function authorText(author) {
  return author ? "".concat(author.name, " (").concat(author.type, ")") : "\u2014";
}
function playlistRevisionLines(playlistId, page) {
  const items = Array.isArray(page?.items) ? page.items : [];
  const next = typeof page?.next_cursor === "string" && page.next_cursor ? page.next_cursor : void 0;
  return [
    "Playlist ".concat(playlistId, " revisions (").concat(items.length, ")"),
    ...items.length ? table(["REVISION", "CHANGE", "PAGES", "CREATED", "AUTHOR", "NAME"], items.map((item) => [
      "".concat(item.revision).concat(item.current ? " (current)" : ""),
      changeText(item),
      String(item.page_count),
      item.created_at,
      authorText(item.author),
      item.name
    ])) : ["No revisions"],
    ...next ? ["next: screenrig playlist revisions ".concat(playlistId, " --after ").concat(next)] : []
  ];
}
function playlistRevisionDetailLines(playlistId, detail) {
  const revision = detail?.revision;
  if (!revision)
    return ["Playlist ".concat(playlistId, " revision\n").concat(JSON.stringify(detail, null, 2))];
  return [
    "Playlist ".concat(playlistId, " revision ").concat(revision.revision).concat(revision.current ? " (current)" : ""),
    "change: ".concat(changeText(revision)),
    "created: ".concat(revision.created_at),
    "author: ".concat(authorText(revision.author)),
    "name: ".concat(revision.name),
    "pages: ".concat(revision.page_count),
    JSON.stringify(detail.playlist, null, 2)
  ];
}
var handlePlaylistRevisions = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  if (!id)
    throw usageError("playlist revisions requires <id>.");
  const after = flagString(args.flags, "after");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: playlistRevisionsPath(id), query: after !== void 0 ? { after } : {} });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: playlistRevisionLines(id, response.body).join("\n")
  };
});
function revisionNumber(args, command) {
  const value = flagString(args.flags, "revision");
  const number = Number(value);
  if (value === void 0 || !Number.isSafeInteger(number) || number < 1)
    throw usageError("".concat(command, " requires --revision N, a whole number from 1."));
  return number;
}
var handlePlaylistRevisionShow = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("playlist revision show requires <id> and --revision N.");
  const number = revisionNumber(args, "playlist revision show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "".concat(playlistRevisionsPath(id), "/").concat(number) });
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: playlistRevisionDetailLines(id, response.body).join("\n")
  };
});
var handlePlaylistPromote = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[2];
  const expected = flagString(args.flags, "expect-rev");
  if (!id)
    throw usageError("playlist promote requires <id>, --revision N and --expect-rev CURRENT.");
  const number = revisionNumber(args, "playlist promote");
  if (expected === void 0)
    throw usageError("playlist promote requires --expect-rev, the playlist's current revision.", {
      command: "screenrig playlist show ".concat(id),
      reason: "Shows the playlist; its revision is the current revision to pass as --expect-rev."
    });
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: "POST",
    path: "".concat(playlistRevisionsPath(id), "/").concat(number, "/promote"),
    idempotent: true,
    headers: { "if-match": quotedRevision(expected) }
  });
  const current = response.body?.revision;
  const unchanged = current === Number(expected);
  return playlistWriteResult(response, client.requestId, unchanged ? "Revision ".concat(number, " holds the playlist's current content; nothing changed. ").concat(id, " stays at revision ").concat(current, ".") : "Promoted revision ".concat(number, " of ").concat(id, ": it is now the current revision ").concat(current, ". The name is unchanged and every screen showing the playlist updates."));
}, true);

export {
  handlePlaylistRevisions,
  revisionNumber,
  handlePlaylistRevisionShow,
  handlePlaylistPromote
};
