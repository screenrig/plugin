import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  SCREEN_TAGS_MAX,
  normalizeInstant,
  screenTagList
} from "./chunk-5LZK5ICC.js";
import {
  isResourceID
} from "./chunk-XCQJWNID.js";
import {
  CliError,
  usageError
} from "./chunk-KI2KSDHX.js";

// dist/fleet-links.js
var FLEET_LINK_ID_PATTERN = /^(?:(?:stage|qa|development)_)?flk_[A-Za-z0-9_-]{1,64}$/;
var FLEET_LINKS_MAX = 50;
var FLEET_LINK_LABEL_MAX = 80;
var FLEET_LINK_MAX_SCREENS = 1e4;
var FLEET_LINK_URL_MAX = 512;
var FLEET_FRAGMENT_PATTERN = /^#fleet=srfl_[A-Za-z0-9_-]{43}$/;
function fleetLinkId(value, command) {
  if (!value)
    throw usageError(`fleet-links ${command} requires <id>.`);
  if (!FLEET_LINK_ID_PATTERN.test(value)) {
    throw usageError("A fleet link id looks like flk_ followed by letters, digits, - or _.", {
      command: "screenrig fleet-links list",
      reason: "List this project's fleet links and their ids."
    });
  }
  return value;
}
function fleetLinkName(value) {
  const trimmed = value.trim();
  if (!trimmed || [...trimmed].length > FLEET_LINK_LABEL_MAX || /[\p{Cc}\p{Cf}]/u.test(value)) {
    throw usageError(`--name must contain 1 to ${FLEET_LINK_LABEL_MAX} characters without controls.`);
  }
  return trimmed;
}
function fleetLinkTags(value, previous) {
  const tags = [...previous ? previous.split(",") : [], ...screenTagList(value, "--tag")];
  if (new Set(tags).size !== tags.length)
    throw usageError("--tag lists a tag more than once.");
  if (tags.length > SCREEN_TAGS_MAX)
    throw usageError(`--tag accepts at most ${SCREEN_TAGS_MAX} tags.`);
  return tags.join(",");
}
function fleetLinkPlaylistId(value) {
  if (!isResourceID(value, "playlist")) {
    throw usageError("--playlist-id must be a playlist id (pl_\u2026).", {
      command: "screenrig playlist list",
      reason: "List this project's playlists and their ids."
    });
  }
  return value;
}
function fleetLinkMaxScreens(value) {
  const number = Number(value);
  if (!/^\d+$/.test(value) || number < 1 || number > FLEET_LINK_MAX_SCREENS) {
    throw usageError(`--max-screens must be a whole number from 1 to ${FLEET_LINK_MAX_SCREENS}.`);
  }
  return value;
}
function fleetLinkExpiresAt(value) {
  const instant = normalizeInstant(value);
  if (instant === void 0) {
    throw usageError("--expires-at takes an RFC 3339 time with seconds and a zone, such as 2026-12-31T23:59:59Z or 2026-12-31T18:00:00-05:00.");
  }
  return instant;
}
function fleetLinkUrlProblem(value) {
  if (typeof value !== "string")
    return "url is not a string.";
  if (value.length > FLEET_LINK_URL_MAX)
    return `url is longer than ${FLEET_LINK_URL_MAX} characters.`;
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
  if (!FLEET_FRAGMENT_PATTERN.test(url.hash))
    return "url carries its secret outside the #fleet= fragment.";
  return void 0;
}
function urlWithheldWarning(id, reason) {
  return {
    code: "fleet_link_url_withheld",
    message: `The url returned for fleet link ${id} failed a safety check, so it is not shown: ${reason} The link itself is unchanged. Report the request_id with screenrig feedback bug.`
  };
}
function guardFleetLink(link) {
  if (link.url === void 0 || link.url_redacted === true && link.url === "")
    return { link, warnings: [] };
  const reason = link.url_redacted === true ? "url_redacted is true but url is not empty." : fleetLinkUrlProblem(link.url);
  if (!reason)
    return { link, warnings: [] };
  const { url: _withheld, ...rest } = link;
  return { link: rest, warnings: [urlWithheldWarning(String(link.id), reason)] };
}
function guardFleetLinks(items) {
  const guarded = items.map(guardFleetLink);
  return { items: guarded.map((item) => item.link), warnings: guarded.flatMap((item) => item.warnings) };
}
function fleetLinkProblem(error, id) {
  if (!(error instanceof CliError))
    return error;
  const problem = error.problem;
  if (problem.code === "fleet_link_limit_reached") {
    return new CliError({
      ...problem,
      detail: `This organization already has the maximum of ${FLEET_LINKS_MAX} fleet links across its projects. Nothing was created.`,
      next: problem.next ?? {
        command: "screenrig fleet-links list",
        reason: "Delete a fleet link you no longer need with screenrig fleet-links delete ID, then rerun create. Screens it created stay."
      }
    }, error.exitCode, error.warnings);
  }
  if (problem.next)
    return error;
  if (problem.code === "revision_conflict" && id) {
    return new CliError({
      ...problem,
      next: { command: `screenrig fleet-links show ${id}`, reason: "Read the current revision and state, then rerun with --expect-rev REVISION if the change still applies." }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "not_found" && id) {
    return new CliError({
      ...problem,
      next: { command: "screenrig fleet-links list", reason: "List this project's fleet links; a deleted link does not come back." }
    }, error.exitCode, error.warnings);
  }
  if (problem.code === "invalid_request" && problem.errors.some((item) => item?.field === "playlist_id")) {
    return new CliError({
      ...problem,
      next: { command: "screenrig playlist list", reason: "Choose a playlist id from this project for --playlist-id." }
    }, error.exitCode, error.warnings);
  }
  return error;
}
function when(value, label) {
  return value === void 0 || value === "" ? [] : [`${label}: ${value}`];
}
function screensCell(link) {
  const created = String(link.screens_created ?? 0);
  return link.max_screens === void 0 ? created : `${created}/${link.max_screens}`;
}
function fleetLinkExpired(link, now) {
  const expires = link.expires_at ? Date.parse(link.expires_at) : Number.NaN;
  return Number.isFinite(expires) && expires <= now.getTime();
}
function expiryText(link, now) {
  return link.expires_at ? `${link.expires_at}${fleetLinkExpired(link, now) ? " (expired)" : ""}` : "";
}
function fleetLinkLines(link, now) {
  if (!link)
    return [];
  return [
    `id: ${link.id}`,
    `label: ${link.label}`,
    `enabled: ${link.enabled}`,
    `tags: ${(link.tags ?? []).join(", ")}`,
    ...when(Object.entries(link.fields ?? {}).map(([name, value]) => `${name}=${value}`).join(", "), "fields"),
    ...when(link.playlist_id, "playlist_id"),
    `screens_created: ${link.screens_created ?? 0}`,
    ...when(link.max_screens, "max_screens"),
    ...when(expiryText(link, now), "expires_at"),
    ...when(link.last_used_at, "last_used_at"),
    `revision: ${link.revision}`,
    ...when(link.created_at, "created_at"),
    ...when(link.updated_at, "updated_at")
  ];
}
var READ_ONLY_URL = "URL: withheld from a Read only credential. A Manage sign-in (screenrig login --access manage) receives it.";
function fleetLinkUrlLines(link, withheld) {
  if (!link)
    return [];
  if (link.url) {
    return ["", "Sensitive fleet link URL (every device that opens it becomes a screen in this project; give it only to your device manager)", `url: ${link.url}`];
  }
  if (withheld)
    return ["", "URL: withheld, see the warning."];
  if (link.url_redacted === true)
    return ["", READ_ONLY_URL];
  return ["", "URL: not returned."];
}
function fleetLinkRedactedNote(items) {
  return items.some((item) => item.url_redacted === true) ? ["URLs: withheld from a Read only credential. With a Manage sign-in (screenrig login --access manage), fleet-links show prints one."] : [];
}
function table(header, rows) {
  const widths = header.map((cell, index) => Math.max(cell.length, ...rows.map((row) => (row[index] ?? "").length)));
  const render = (row) => row.map((cell, index) => cell.padEnd(widths[index])).join("  ").trimEnd();
  return [render(header), ...rows.map(render)];
}
function fleetLinkTableLines(items, now) {
  if (!items.length)
    return ["No fleet links"];
  const expiry = items.some((item) => item.expires_at);
  return table(["ID", "LABEL", "ENABLED", "SCREENS", ...expiry ? ["EXPIRES"] : [], "TAGS", "LAST_USED"], items.map((item) => [
    item.id ?? "",
    item.label ?? "",
    String(item.enabled),
    screensCell(item),
    ...expiry ? [expiryText(item, now)] : [],
    (item.tags ?? []).join(","),
    item.last_used_at ?? ""
  ]));
}

export {
  fleetLinkId,
  fleetLinkName,
  fleetLinkTags,
  fleetLinkPlaylistId,
  fleetLinkMaxScreens,
  fleetLinkExpiresAt,
  fleetLinkUrlProblem,
  guardFleetLink,
  guardFleetLinks,
  fleetLinkProblem,
  fleetLinkLines,
  fleetLinkUrlLines,
  fleetLinkRedactedNote,
  fleetLinkTableLines
};
