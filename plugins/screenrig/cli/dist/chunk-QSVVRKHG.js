import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  table
} from "./chunk-34HCQ4WD.js";
import {
  clientFor,
  commandHandler,
  jsonBody,
  playlistWriteResult,
  quotedRevision,
  requireToken
} from "./chunk-BLRK52WK.js";
import {
  flagString
} from "./chunk-5LZK5ICC.js";
import {
  ExitCode,
  usageError
} from "./chunk-KI2KSDHX.js";

// dist/playlist-revisions.js
var playlistRevisionsPath = (id) => `/api/playlists/${encodeURIComponent(id)}/revisions`;
function changeText(item) {
  return item.change === "promoted" && item.restored_from !== void 0 ? `promoted from ${item.restored_from}` : item.change;
}
function authorText(author) {
  return author ? `${author.name} (${author.type})` : "\u2014";
}
function playlistRevisionLines(playlistId, page) {
  const items = Array.isArray(page?.items) ? page.items : [];
  const next = typeof page?.next_cursor === "string" && page.next_cursor ? page.next_cursor : void 0;
  return [
    `Playlist ${playlistId} revisions (${items.length})`,
    ...items.length ? table(["REVISION", "CHANGE", "PAGES", "CREATED", "AUTHOR", "NAME"], items.map((item) => [
      `${item.revision}${item.current ? " (current)" : ""}`,
      changeText(item),
      String(item.page_count),
      item.created_at,
      authorText(item.author),
      item.name
    ])) : ["No revisions"],
    ...next ? [`next: screenrig playlist revisions ${playlistId} --after ${next}`] : []
  ];
}
function playlistRevisionDetailLines(playlistId, detail) {
  const revision = detail?.revision;
  if (!revision)
    return [`Playlist ${playlistId} revision
${JSON.stringify(detail, null, 2)}`];
  return [
    `Playlist ${playlistId} revision ${revision.revision}${revision.current ? " (current)" : ""}`,
    `change: ${changeText(revision)}`,
    `created: ${revision.created_at}`,
    `author: ${authorText(revision.author)}`,
    `name: ${revision.name}`,
    `pages: ${revision.page_count}`,
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
    throw usageError(`${command} requires --revision N, a whole number from 1.`);
  return number;
}
var handlePlaylistRevisionShow = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("playlist revision show requires <id> and --revision N.");
  const number = revisionNumber(args, "playlist revision show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: `${playlistRevisionsPath(id)}/${number}` });
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
      command: `screenrig playlist show ${id}`,
      reason: "Shows the playlist; its revision is the current revision to pass as --expect-rev."
    });
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: "POST",
    path: `${playlistRevisionsPath(id)}/${number}/promote`,
    idempotent: true,
    headers: { "if-match": quotedRevision(expected) }
  });
  const current = response.body?.revision;
  const unchanged = current === Number(expected);
  return playlistWriteResult(response, client.requestId, unchanged ? `Revision ${number} holds the playlist's current content; nothing changed. ${id} stays at revision ${current}.` : `Promoted revision ${number} of ${id}: it is now the current revision ${current}. The name is unchanged and every screen showing the playlist updates.`);
}, true);

export {
  handlePlaylistRevisions,
  revisionNumber,
  handlePlaylistRevisionShow,
  handlePlaylistPromote
};
