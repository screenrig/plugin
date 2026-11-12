import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  clientFor,
  commandHandler,
  jsonBody,
  pendingReviewResult,
  playlistWriteResult,
  quotedRevision,
  requireToken,
  reviewNoteFrom
} from "./chunk-AOLD7THY.js";
import {
  pendingReviewOf
} from "./chunk-XWMHWXE7.js";
import {
  flagBool,
  flagString,
  successEnvelope
} from "./chunk-V5GOKJGU.js";
import {
  isResourceID
} from "./chunk-SFYZH3GR.js";
import {
  ExitCode,
  usageError
} from "./chunk-JP4OQPAN.js";

// dist/playlist-fields.js
var isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var FIELD_NAME = /^[a-z0-9_]{1,32}$/;
var CONTROL = /[\u0000-\u0009\u000b-\u001f\u007f]/;
function templateSetOption(input, previous) {
  const at = input.indexOf("=");
  const name = at < 0 ? "" : input.slice(0, at).trim();
  if (!FIELD_NAME.test(name))
    throw usageError('--set takes NAME=VALUE with a field name of 1 to 32 lower case letters, digits or underscores, such as --set headline="Closed today".');
  const value = input.slice(at + 1);
  if (CONTROL.test(value))
    throw usageError("--set ".concat(name, " takes a value without control characters."));
  const held = previous === void 0 ? {} : JSON.parse(previous);
  if (Object.hasOwn(held, name))
    throw usageError("--set ".concat(name, " is given more than once."));
  return JSON.stringify({ ...held, [name]: value });
}
function templateClearOption(input, previous) {
  const name = input.trim();
  if (!FIELD_NAME.test(name))
    throw usageError("--clear takes a field name of 1 to 32 lower case letters, digits or underscores.");
  const held = previous === void 0 ? [] : JSON.parse(previous);
  if (held.includes(name))
    throw usageError("--clear ".concat(name, " is given more than once."));
  return JSON.stringify([...held, name]);
}
var setValues = (args) => {
  const raw = flagString(args.flags, "set");
  return raw === void 0 ? {} : JSON.parse(raw);
};
var clearedNames = (args) => {
  const raw = flagString(args.flags, "clear");
  return raw === void 0 ? [] : JSON.parse(raw);
};
var playlistPath = (id) => "/api/playlists/".concat(encodeURIComponent(id));
function playlistIdArg(args, command) {
  const id = args.positionals[2];
  if (!id || !isResourceID(id, "playlist"))
    throw usageError("playlist ".concat(command, " requires a playlist ID (pl_...); playlist list shows them."));
  return id;
}
async function createFromTemplate(args, client) {
  const from = flagString(args.flags, "from-template");
  const starter = flagString(args.flags, "starter");
  const name = flagString(args.flags, "name");
  const values = setValues(args);
  if (from === void 0 === (starter === void 0))
    throw usageError("playlist create takes a file, --from-template ID or --starter KEY, one of them.");
  if (args.positionals[2] !== void 0)
    throw usageError("playlist create takes a file, --from-template ID or --starter KEY, not a file with either.");
  if (starter !== void 0) {
    if (Object.keys(values).length || flagBool(args.flags, "dry-run"))
      throw usageError("--starter takes no --set or --dry-run: fill the template with --from-template afterwards.");
    return client.call({ method: "POST", path: "/api/playlists", idempotent: true, body: { ...name ? { name } : {}, starter }, headers: reviewNoteFrom(args) });
  }
  if (!isResourceID(from, "playlist"))
    throw usageError("--from-template takes a template's playlist ID (pl_...); playlist list --templates shows them.");
  if (flagBool(args.flags, "dry-run")) {
    return client.call({ method: "POST", path: "".concat(playlistPath(from), "/expand"), body: { values } });
  }
  if (!name)
    throw usageError("playlist create --from-template requires --name: the new playlist's name.");
  return client.call({
    method: "POST",
    path: "/api/playlists",
    idempotent: true,
    body: { name, from_template: { playlist_id: from, values } },
    headers: reviewNoteFrom(args)
  });
}
async function playlistCreateFromTemplate(args, runtime, resolved) {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await createFromTemplate(args, client);
  if (flagBool(args.flags, "dry-run")) {
    const pages = isObject(response.body) && Array.isArray(response.body.pages) ? response.body.pages : [];
    return {
      envelope: jsonBody(response, client.requestId),
      exitCode: ExitCode.Success,
      human: "The playlist would hold ".concat(pages.length, " page(s). Nothing was created; run again without --dry-run to create it.")
    };
  }
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  return playlistWriteResult(response, client.requestId, "Playlist created.");
}
var describe = (field) => "".concat(String(field.name), "	").concat(String(field.type)).concat(field.required === true ? "	required" : "	optional").concat(typeof field.max_length === "number" ? "	max ".concat(field.max_length) : "", "	").concat(String(field.label));
var handlePlaylistFields = commandHandler(async (args, runtime, resolved) => {
  const id = playlistIdArg(args, "fields");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const sets = setValues(args), clears = clearedNames(args);
  const changing = Object.keys(sets).length > 0 || clears.length > 0 || flagBool(args.flags, "refresh");
  for (const name of clears)
    if (Object.hasOwn(sets, name))
      throw usageError("".concat(name, " is both --set and --clear."));
  if (changing) {
    const expected = flagString(args.flags, "expect-rev");
    const response = await client.call({
      method: "PATCH",
      path: "".concat(playlistPath(id), "/values"),
      idempotent: true,
      body: { values: { ...sets, ...Object.fromEntries(clears.map((name) => [name, null])) } },
      headers: { ...reviewNoteFrom(args), ...expected !== void 0 ? { "if-match": quotedRevision(expected) } : {} }
    });
    const pending = pendingReviewOf(response);
    if (pending)
      return pendingReviewResult(response, pending, client.requestId);
    return playlistWriteResult(response, client.requestId, "Playlist values updated.");
  }
  const playlist = (await client.call({ method: "GET", path: playlistPath(id) })).body;
  if (!isObject(playlist))
    throw usageError("The playlist answer does not match the generated contract.");
  if (Array.isArray(playlist.fields) && playlist.fields.length > 0) {
    const instances = (await client.call({ method: "GET", path: "".concat(playlistPath(id), "/instances") })).body;
    const count = isObject(instances) && Array.isArray(instances.items) ? instances.items.length : 0;
    const data2 = { playlist_id: id, kind: "template", name: playlist.name, revision: playlist.revision, fields: playlist.fields, instances: count };
    return {
      envelope: successEnvelope(data2, { request_id: client.requestId }),
      exitCode: ExitCode.Success,
      human: [
        "Template ".concat(String(playlist.name), " (revision ").concat(String(playlist.revision), "), ").concat(count, " playlist(s) made from it"),
        "Name	Type	Required	Label",
        ...playlist.fields.filter(isObject).map(describe)
      ].join("\n")
    };
  }
  const source = typeof playlist.template_id === "string" ? playlist.template_id : void 0;
  if (!source)
    throw usageError("Playlist ".concat(id, " is neither a template (it declares no fields) nor made from one."));
  const values = isObject(playlist.values) ? playlist.values : {};
  const template = (await client.call({ method: "GET", path: playlistPath(source) })).body;
  if (!isObject(template) || typeof template.revision !== "number")
    throw usageError("The template answer does not include its current revision.");
  const current = template.revision;
  const built = typeof playlist.template_revision === "number" ? playlist.template_revision : void 0;
  if (built === void 0)
    throw usageError("The playlist answer does not include its template revision.");
  const outdated = built < current;
  const labels = new Map((isObject(template) && Array.isArray(template.fields) ? template.fields : []).filter(isObject).map((field) => [String(field.name), String(field.label)]));
  const data = { playlist_id: id, kind: "instance", name: playlist.name, revision: playlist.revision, template_id: source, template_revision: built, template_current_revision: current, outdated, values };
  return {
    envelope: successEnvelope(data, { request_id: client.requestId }),
    exitCode: ExitCode.Success,
    human: [
      "".concat(String(playlist.name), " was made from ").concat(source, " at revision ").concat(String(built)).concat(outdated ? " (the template is now at revision ".concat(String(current), ": playlist fields ").concat(id, " --refresh brings this copy up to date)") : ""),
      ...Object.entries(values).map(([name, value]) => "".concat(name, "	").concat(labels.get(name) ?? "", "	").concat(String(value)))
    ].join("\n")
  };
}, true);
var handlePlaylistInstances = commandHandler(async (args, runtime, resolved) => {
  const id = playlistIdArg(args, "instances");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "".concat(playlistPath(id), "/instances") });
  const items = isObject(response.body) && Array.isArray(response.body.items) ? response.body.items.filter(isObject) : [];
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [
      "Playlists made from the template",
      "ID	Revision	Template revision	State	Name",
      ...items.map((item) => "".concat(String(item.id), "	").concat(String(item.revision), "	").concat(String(item.template_revision), "	").concat(item.outdated === true ? "outdated" : "current", "	").concat(String(item.name)))
    ].join("\n")
  };
}, true);

export {
  templateSetOption,
  templateClearOption,
  createFromTemplate,
  playlistCreateFromTemplate,
  handlePlaylistFields,
  handlePlaylistInstances
};
