import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  assertPlaylistValid,
  validatePlaylistWrite
} from "./chunk-LXCYXUMT.js";
import {
  USER_AGENT
} from "./chunk-V3QE7ELU.js";
import {
  sniffMediaContainer
} from "./chunk-7XLCMGU7.js";
import {
  CliError,
  ExitCode,
  makeProblem,
  usageError
} from "./chunk-5E3Z6J6F.js";
import {
  __export
} from "./chunk-3FYAGULW.js";

// dist/migrate/map.js
var map_exports = {};
__export(map_exports, {
  DEFAULT_CANVAS: () => DEFAULT_CANVAS,
  DEFAULT_PAGE_MS: () => DEFAULT_PAGE_MS,
  PLACEHOLDER_LABEL_MAX: () => PLACEHOLDER_LABEL_MAX,
  PLACEHOLDER_TAGS_MAX: () => PLACEHOLDER_TAGS_MAX,
  PLAYLIST_NAME_MAX: () => PLAYLIST_NAME_MAX,
  TAG_MAX: () => TAG_MAX,
  addDays: () => addDays,
  allocateTags: () => allocateTags,
  buildLayout: () => buildLayout,
  buildPlaylist: () => buildPlaylist,
  campaignTiming: () => campaignTiming,
  cleanName: () => cleanName,
  kindOf: () => kindOf,
  parseCivil: () => parseCivil,
  placeholderBody: () => placeholderBody,
  tagAudience: () => tagAudience,
  tagFromName: () => tagFromName,
  truncate: () => truncate,
  uploadName: () => uploadName
});
import { createHash } from "node:crypto";
var DEFAULT_CANVAS = { width: 1920, height: 1080 };
var DEFAULT_PAGE_MS = 8e3;
var PLAYLIST_NAME_MAX = 120;
var PLACEHOLDER_LABEL_MAX = 80;
var PLACEHOLDER_TAGS_MAX = 16;
var TAG_MAX = 32;
var PAGE_MS_MIN = 1e3;
var PAGE_MS_MAX = 864e5;
var IMAGE = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "webp", "gif", "bmp", "tif", "tiff", "avif", "heic", "heif"]);
var VIDEO = /* @__PURE__ */ new Set(["mp4", "m4v", "mov", "webm", "mkv", "avi", "ogv", "mpg", "mpeg", "ts", "m2ts", "wmv", "flv", "3gp"]);
var AUDIO = /* @__PURE__ */ new Set(["mp3", "wav", "m4a", "aac", "ogg", "oga", "flac", "opus", "wma"]);
function kindOf(input) {
  const mime = input.mime?.toLowerCase().split(";")[0]?.trim();
  if (mime) {
    if (mime.startsWith("image/"))
      return "image";
    if (mime.startsWith("video/"))
      return "video";
    if (mime.startsWith("audio/"))
      return "audio";
  }
  const extension = /\.([A-Za-z0-9]{1,6})$/.exec(input.filename ?? "")?.[1]?.toLowerCase();
  if (!extension)
    return void 0;
  if (IMAGE.has(extension))
    return "image";
  if (VIDEO.has(extension))
    return "video";
  if (AUDIO.has(extension))
    return "audio";
  return void 0;
}
function truncate(text2, max) {
  const points = [...text2];
  return points.length <= max ? { text: text2, cut: false } : { text: points.slice(0, max).join(""), cut: true };
}
function cleanName(text2) {
  return text2.replace(/[\p{Cc}\p{Cf}]/gu, " ").replace(/\s+/g, " ").trim();
}
function uploadName(media) {
  const last = media.filename.split(/[\\/]/).pop() ?? "";
  const extension = /(\.[A-Za-z0-9]{1,8})$/.exec(last)?.[1] ?? "";
  let stem = cleanName(media.name.split(/[\\/]/).pop() ?? "") || cleanName(last.slice(0, last.length - extension.length)) || "media";
  if (extension && stem.toLowerCase().endsWith(extension.toLowerCase()))
    stem = stem.slice(0, stem.length - extension.length) || "media";
  const room = 255 - Buffer.byteLength(extension, "utf8");
  while (Buffer.byteLength(stem, "utf8") > room)
    stem = [...stem].slice(0, -1).join("");
  return "".concat(stem).concat(extension);
}
function tagFromName(name) {
  const words = name.normalize("NFKD").replace(new RegExp("\\p{M}+", "gu"), "").split(/[^A-Za-z0-9]+/).filter(Boolean);
  const joined2 = words.map((word) => {
    const mixed = /[a-z]/.test(word) && /[A-Z]/.test(word);
    return word[0].toUpperCase() + (mixed ? word.slice(1) : word.slice(1).toLowerCase());
  }).join("");
  return joined2.slice(0, TAG_MAX);
}
function allocateTags(wants, taken, existing = {}) {
  const reserved = new Set([...taken].map((tag) => tag.toLowerCase()));
  for (const tag of Object.values(existing))
    reserved.add(tag.toLowerCase());
  const allocated = {};
  for (const want of wants) {
    if (existing[want.key] !== void 0)
      continue;
    const base = tagFromName(want.name) || "".concat(want.fallback).concat(createHash("sha256").update(want.id).digest("hex").slice(0, 6));
    let candidate = base;
    for (let n = 2; reserved.has(candidate.toLowerCase()); n += 1) {
      candidate = "".concat(base.slice(0, TAG_MAX - String(n).length)).concat(n);
    }
    reserved.add(candidate.toLowerCase());
    allocated[want.key] = candidate;
  }
  return allocated;
}
var DAY_NAMES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
var CIVIL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
var DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
function realDay(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
function parseCivil(text2) {
  const match = text2 === void 0 ? null : CIVIL.exec(text2);
  if (!match)
    return void 0;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  if (!realDay(year, month, day) || hour > 23 || minute > 59)
    return void 0;
  return { year, month, day, hour, minute };
}
function dayNumber(date) {
  return Math.floor(Date.UTC(date.year, date.month - 1, date.day) / 864e5);
}
function fromDayNumber(days) {
  const date = new Date(days * 864e5);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}
var two = (n) => String(n).padStart(2, "0");
var dateText = (d) => "".concat(String(d.year).padStart(4, "0"), "-").concat(two(d.month), "-").concat(two(d.day));
var clock = (c) => "".concat(two(c.hour), ":").concat(two(c.minute));
function addDays(date, days) {
  const match = DATE.exec(date);
  const parts = { year: Number(match?.[1]), month: Number(match?.[2]), day: Number(match?.[3]) };
  return dateText(fromDayNumber(dayNumber(parts) + days));
}
function weekdayOf(date) {
  return DAY_NAMES[(new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() + 6) % 7];
}
function minutes(c) {
  return dayNumber(c) * 1440 + c.hour * 60 + c.minute;
}
function campaignTiming(schedule) {
  const lossy = [];
  if (schedule.always)
    return { ok: true, lossy };
  const start = parseCivil(schedule.start);
  const end = parseCivil(schedule.end);
  if (schedule.start !== void 0 && !start || schedule.end !== void 0 && !end) {
    return { ok: false, reason: "Its start or end time could not be read." };
  }
  const repeat = schedule.repeat;
  if (!repeat) {
    const from = schedule.start;
    const until = schedule.end;
    if (from !== void 0 && until !== void 0 && until <= from)
      return { ok: false, reason: "It ends before it starts." };
    return { ok: true, ...from !== void 0 ? { from } : {}, ...until !== void 0 ? { until } : {}, lossy };
  }
  if (repeat.every === "month" || repeat.every === "year" || repeat.every === "hour" || repeat.every === "minute") {
    return { ok: false, reason: "It repeats by the ".concat(repeat.every, ", which campaigns cannot express: they repeat on days of the week.") };
  }
  if (repeat.nth_weekday)
    return { ok: false, reason: "It repeats on the same numbered weekday of a month, which campaigns cannot express." };
  if (!start)
    return { ok: false, reason: "It repeats but has no start time." };
  const interval = repeat.interval !== void 0 && repeat.interval > 1 ? Math.floor(repeat.interval) : 1;
  const unit = repeat.every === "day" ? "day" : "week";
  if (interval > 1)
    lossy.push("It repeated every ".concat(interval, " ").concat(unit, "s; it now repeats every ").concat(unit, "."));
  const weekdays = repeat.weekdays?.length ? DAY_NAMES.filter((day) => repeat.weekdays.includes(day)) : repeat.every === "day" ? [...DAY_NAMES] : [weekdayOf(start)];
  const window = { days: weekdays };
  if (!end) {
    lossy.push("It had no end time; it now runs all day on its days.");
  } else {
    const length = minutes(end) - minutes(start);
    if (length <= 0)
      return { ok: false, reason: "It ends before it starts." };
    if (length >= 1440) {
      const wholeDay = length === 1440 && start.hour === 0 && start.minute === 0;
      if (!wholeDay)
        lossy.push("Each occurrence lasted 24 hours or more; it now runs all day on its days.");
    } else {
      window.start = clock(start);
      window.end = clock(end);
    }
  }
  const startDate = dateText(start);
  let last;
  if (repeat.until !== void 0) {
    if (!DATE.test(repeat.until) || !realDay(Number(repeat.until.slice(0, 4)), Number(repeat.until.slice(5, 7)), Number(repeat.until.slice(8, 10)))) {
      return { ok: false, reason: "The date its repeat ends on could not be read." };
    }
    last = repeat.until;
  }
  if (repeat.count !== void 0 && repeat.count >= 1) {
    const counted = lastOccurrence(start, repeat.every === "day" ? "day" : "week", interval, weekdays, Math.floor(repeat.count), repeat.weekdays?.length ? true : repeat.every === "week");
    if (last === void 0 || counted < last)
      last = counted;
  }
  if (last !== void 0 && last < startDate)
    return { ok: false, reason: "Its repeat ends before it starts." };
  return {
    ok: true,
    from: "".concat(startDate, "T00:00"),
    ...last !== void 0 ? { until: "".concat(addDays(last, 1), "T00:00") } : {},
    windows: [window],
    lossy
  };
}
function lastOccurrence(start, unit, interval, weekdays, count, byWeekday) {
  const first = dayNumber(start);
  if (unit === "day" && !byWeekday)
    return dateText(fromDayNumber(first + (count - 1) * interval));
  if (unit === "day") {
    let seen2 = 0;
    for (let day = first; ; day += 1) {
      if (weekdays.includes(weekdayOf(fromDayNumber(day))) && (seen2 += 1) === count)
        return dateText(fromDayNumber(day));
    }
  }
  const monday = first - (new Date(first * 864e5).getUTCDay() + 6) % 7;
  let seen = 0;
  for (let week = 0; ; week += 1) {
    for (const day of weekdays) {
      const date = monday + week * interval * 7 + DAY_NAMES.indexOf(day);
      if (date >= first && (seen += 1) === count)
        return dateText(fromDayNumber(date));
    }
  }
}
function tagAudience(tags) {
  return tags.length === 1 ? { tag: tags[0] } : { any: tags.map((tag) => ({ tag })) };
}
var newTally = () => ({ missingMedia: 0, badUrls: 0, cycles: [], lossy: /* @__PURE__ */ new Set() });
function tallyLossy(tally) {
  const lossy = [...tally.lossy];
  if (tally.missingMedia > 0)
    lossy.push("".concat(tally.missingMedia, " item").concat(tally.missingMedia === 1 ? " was" : "s were", " left out because ").concat(tally.missingMedia === 1 ? "its" : "their", " media did not come over."));
  if (tally.badUrls > 0)
    lossy.push("".concat(tally.badUrls, " web page").concat(tally.badUrls === 1 ? " was" : "s were", " left out because the address is not an http or https address."));
  for (const name of tally.cycles)
    lossy.push("".concat(name, " contains itself; the repeat was left out."));
  return lossy;
}
function milliseconds(seconds, tally) {
  if (seconds === void 0 || !(seconds > 0))
    return DEFAULT_PAGE_MS;
  const ms = Math.round(seconds * 1e3);
  if (ms < PAGE_MS_MIN || ms > PAGE_MS_MAX)
    tally.lossy.add("A duration outside 1 second to 24 hours was moved to the nearest limit.");
  return Math.min(PAGE_MS_MAX, Math.max(PAGE_MS_MIN, ms));
}
function leafOf(item, ctx, tally) {
  if ("media_id" in item) {
    const ref = ctx.media.get(item.media_id);
    if (!ref) {
      tally.missingMedia += 1;
      return void 0;
    }
    return { type: "media", ref, ...item.duration_s !== void 0 ? { seconds: item.duration_s } : {} };
  }
  if ("url" in item) {
    let host = "";
    try {
      const url = new URL(item.url);
      if (url.protocol !== "http:" && url.protocol !== "https:")
        throw new Error("scheme");
      host = url.hostname;
    } catch {
      tally.badUrls += 1;
      return void 0;
    }
    const title = truncate(cleanName(item.title ?? "") || host, 200).text;
    return { type: "url", url: item.url, title, ...item.duration_s !== void 0 ? { seconds: item.duration_s } : {} };
  }
  return void 0;
}
function leaves(items, ctx, stack, tally, nestedLayout) {
  const out = [];
  for (const item of items) {
    if ("playlist_id" in item) {
      const nested = ctx.playlists.get(item.playlist_id);
      if (!nested)
        continue;
      const key = "playlist:".concat(nested.id);
      if (stack.includes(key)) {
        tally.cycles.push("Playlist ".concat(nested.name));
        continue;
      }
      out.push(...leaves(nested.items, ctx, [...stack, key], tally, nestedLayout));
    } else if ("layout_id" in item) {
      nestedLayout(item.layout_id);
    } else {
      const leaf = leafOf(item, ctx, tally);
      if (leaf)
        out.push(leaf);
    }
  }
  return out;
}
var CANVAS = (width, height) => ({ width, height, viewport_fit: "contain", background: "#000000FF" });
var TRANSITION = { type: "crossfade", duration_ms: 200 };
function clampRect(zone, canvas) {
  const x = Math.min(canvas.width - 1, Math.max(0, Math.round(zone.x)));
  const y = Math.min(canvas.height - 1, Math.max(0, Math.round(zone.y)));
  const width = Math.max(1, Math.min(canvas.width - x, Math.round(zone.width)));
  const height = Math.max(1, Math.min(canvas.height - y, Math.round(zone.height)));
  return { x, y, width, height };
}
function primitive(id, leaf, rect, layer, options) {
  if (leaf.type === "url") {
    return { id, primitive: "iframe", src: leaf.url, title: leaf.title, rect, layer, content_fit: "fill" };
  }
  const selector = { by: "id", media_id: leaf.ref.id };
  return leaf.ref.kind === "video" ? { id, primitive: "video", selector, rect, layer, content_fit: "contain", muted: true, loop: options.loop === true } : { id, primitive: "image", selector, rect, layer, content_fit: "contain" };
}
function leafPage(leaf, canvas, tally) {
  const rect = { x: 0, y: 0, width: canvas.width, height: canvas.height };
  const isVideo = leaf.type === "media" && leaf.ref.kind === "video";
  const advance = isVideo && leaf.seconds === void 0 ? { mode: "media_end" } : { mode: "duration", after_ms: milliseconds(leaf.seconds, tally) };
  return {
    canvas: CANVAS(canvas.width, canvas.height),
    transition: TRANSITION,
    advance,
    primitives: [primitive("content", leaf, rect, 0, { loop: isVideo && leaf.seconds !== void 0 })]
  };
}
function layoutPages(layout, ctx, stack, tally) {
  const canvas = layout.width !== void 0 && layout.height !== void 0 && layout.width > 0 && layout.height > 0 ? { width: Math.round(layout.width), height: Math.round(layout.height) } : DEFAULT_CANVAS;
  const zones = [];
  layout.zones.forEach((zone, order) => {
    const found = leaves(zone.items, ctx, stack, tally, () => tally.lossy.add("A layout inside zone ".concat(zone.name, " was left out.")));
    if (found.length > 0)
      zones.push({ zone, leaves: found, order });
    else if (zone.items.length > 0)
      tally.lossy.add("Zone ".concat(zone.name, " had nothing that could be imported and was left out."));
  });
  if (zones.length === 0)
    return { pages: [], reason: "None of its zones holds anything that can be imported." };
  const area = (zone) => Math.max(0, zone.width) * Math.max(0, zone.height);
  const main = [...zones].sort((a, b) => area(b.zone) - area(a.zone) || a.zone.z - b.zone.z || a.order - b.order)[0];
  const layers = new Map([...zones].sort((a, b) => a.zone.z - b.zone.z || a.order - b.order).map((entry, index) => [entry, index]));
  const single = zones.length === 1;
  for (const entry of zones) {
    if (entry === main)
      continue;
    if (entry.leaves.length > 1)
      tally.lossy.add("Zone ".concat(entry.zone.name, " advances together with the main zone ").concat(main.zone.name, ", not on its own timing."));
    if (entry.leaves.length > main.leaves.length) {
      tally.lossy.add("Items past ".concat(main.leaves.length, " in zone ").concat(entry.zone.name, " never show: the layout has ").concat(main.leaves.length, " page").concat(main.leaves.length === 1 ? "" : "s", ", one per item of ").concat(main.zone.name, "."));
    }
  }
  const pages = main.leaves.map((mainLeaf, index) => {
    const video = mainLeaf.type === "media" && mainLeaf.ref.kind === "video" ? mainLeaf.ref : void 0;
    const mediaEnd = single && video !== void 0;
    const primitives = zones.map((entry) => {
      const leaf = entry === main ? mainLeaf : entry.leaves[index % entry.leaves.length];
      return primitive("zone_".concat(entry.order + 1), leaf, clampRect(entry.zone, canvas), layers.get(entry), {
        loop: entry === main ? !mediaEnd && leaf.type === "media" && leaf.ref.kind === "video" && leaf.seconds !== void 0 : true
      });
    });
    let advance;
    if (mediaEnd)
      advance = { mode: "media_end" };
    else if (mainLeaf.seconds !== void 0)
      advance = { mode: "duration", after_ms: milliseconds(mainLeaf.seconds, tally) };
    else if (video?.duration_ms !== void 0)
      advance = { mode: "duration", after_ms: Math.min(PAGE_MS_MAX, Math.max(PAGE_MS_MIN, video.duration_ms)) };
    else
      advance = { mode: "duration", after_ms: DEFAULT_PAGE_MS };
    return { canvas: CANVAS(canvas.width, canvas.height), transition: TRANSITION, advance, primitives };
  });
  return { pages };
}
function finish(name, pages, tracks, tally, ctx) {
  const lossy = tallyLossy(tally);
  if (pages.length === 0) {
    return { ok: false, reason: tracks.length > 0 ? "It holds only audio, and a playlist needs at least one page." : "Nothing in it can be imported.", lossy };
  }
  if (tracks.length > 0)
    lossy.push("Audio items now play as the playlist's soundtrack, not at their place in the list.");
  const cut = truncate(cleanName(name) || "Imported", PLAYLIST_NAME_MAX);
  if (cut.cut)
    lossy.push("The name was longer than ".concat(PLAYLIST_NAME_MAX, " characters and was shortened."));
  const document = {
    name: cut.text,
    ...tracks.length > 0 ? { audio: { tracks: tracks.map((media_id, index) => ({ id: "track_".concat(index + 1), media_id })) } } : {},
    pages: pages.map((page, index) => ({ id: "page_".concat(index + 1), ...page }))
  };
  try {
    assertPlaylistValid(document);
    const primitives = /* @__PURE__ */ new Map();
    for (const ref of ctx.media.values())
      primitives.set(ref.id, ref.kind);
    validatePlaylistWrite(document, primitives);
  } catch (error) {
    const first = error instanceof CliError ? error.problem.errors[0] : void 0;
    const why = first?.message ? "".concat(first.path ?? "", " ").concat(first.message).trim() : error instanceof Error ? error.message : "the document is not valid";
    return { ok: false, reason: "The playlist it becomes would be refused: ".concat(why, "."), lossy };
  }
  return { ok: true, document, lossy };
}
function buildPlaylist(playlist, ctx) {
  const tally = newTally();
  const pages = [];
  const tracks = [];
  const walk2 = (items, stack) => {
    for (const item of items) {
      if ("playlist_id" in item) {
        const nested = ctx.playlists.get(item.playlist_id);
        if (!nested)
          continue;
        const key = "playlist:".concat(nested.id);
        if (stack.includes(key))
          tally.cycles.push("Playlist ".concat(nested.name));
        else
          walk2(nested.items, [...stack, key]);
      } else if ("layout_id" in item) {
        const layout = ctx.layouts.get(item.layout_id);
        if (!layout)
          continue;
        const key = "layout:".concat(layout.id);
        if (stack.includes(key)) {
          tally.cycles.push("Layout ".concat(layout.name));
          continue;
        }
        pages.push(...layoutPages(layout, ctx, [...stack, key], tally).pages);
      } else {
        const leaf = leafOf(item, ctx, tally);
        if (!leaf)
          continue;
        if (leaf.type === "media" && leaf.ref.kind === "audio") {
          if (!tracks.includes(leaf.ref.id))
            tracks.push(leaf.ref.id);
        } else {
          pages.push(leafPage(leaf, ctx.canvas, tally));
        }
      }
    }
  };
  walk2(playlist.items, ["playlist:".concat(playlist.id)]);
  if (playlist.shuffle)
    tally.lossy.add("It played in random order; it now plays in order.");
  return finish(playlist.name, pages, tracks, tally, ctx);
}
function buildLayout(layout, ctx) {
  const tally = newTally();
  const built = layoutPages(layout, ctx, ["layout:".concat(layout.id)], tally);
  const result = finish(layout.name, built.pages, [], tally, ctx);
  return built.reason !== void 0 && !result.ok ? { ...result, reason: built.reason } : result;
}
function placeholderBody(screen, tagOfGroup, ownTag) {
  const lossy = [];
  const label = truncate(cleanName(screen.name) || "Imported screen", PLACEHOLDER_LABEL_MAX);
  if (label.cut)
    lossy.push("The name was longer than ".concat(PLACEHOLDER_LABEL_MAX, " characters and was shortened."));
  const all = [];
  for (const tag of [ownTag, ...screen.group_ids.map(tagOfGroup)]) {
    if (tag !== void 0 && !all.includes(tag))
      all.push(tag);
  }
  if (all.length > PLACEHOLDER_TAGS_MAX)
    lossy.push("It was in ".concat(all.length, " groups; a screen carries at most ").concat(PLACEHOLDER_TAGS_MAX, " tags, so ").concat(all.length - PLACEHOLDER_TAGS_MAX, " were left off."));
  return { label: label.text, tags: all.slice(0, PLACEHOLDER_TAGS_MAX), lossy };
}

// dist/migrate/http.js
var http_exports = {};
__export(http_exports, {
  VENDOR_BACKOFF_CAP_MS: () => VENDOR_BACKOFF_CAP_MS,
  VENDOR_RETRIES: () => VENDOR_RETRIES,
  VENDOR_RETRY_AFTER_MAX_S: () => VENDOR_RETRY_AFTER_MAX_S,
  backoffMs: () => backoffMs,
  createVendorHttp: () => createVendorHttp,
  cursorPages: () => cursorPages,
  offsetPages: () => offsetPages,
  retryAfterSeconds: () => retryAfterSeconds,
  vendorBadResponse: () => vendorBadResponse,
  vendorFileGone: () => vendorFileGone,
  vendorFileStalled: () => vendorFileStalled,
  vendorNotFound: () => vendorNotFound,
  vendorRateLimited: () => vendorRateLimited,
  vendorRefused: () => vendorRefused,
  vendorUnavailable: () => vendorUnavailable
});
import { open, rm } from "node:fs/promises";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
var VENDOR_RETRIES = 5;
var VENDOR_RETRY_AFTER_MAX_S = 120;
var VENDOR_BACKOFF_CAP_MS = 3e4;
var MAX_REDIRECTS = 5;
var REQUEST_TIMEOUT_MS = 6e4;
var IDLE_TIMEOUT_MS = 6e4;
function problem(code, title, status, detail, exit, hint, next) {
  return new CliError(makeProblem(code, title, status, detail, hint || next ? { ...hint ? { hint } : {}, ...next ? { next } : {} } : void 0), exit);
}
function vendorRefused(name, status, credentialNames) {
  const names = credentialNames.length ? credentialNames.join(" and ") : "the credential";
  return problem("vendor_refused", "Vendor refused the credential", status, "".concat(name, " refused the request (HTTP ").concat(status, "). Check ").concat(names, ", and that the key is allowed to read."), ExitCode.Auth, "Nothing was sent to screenRIG. Make or fix a read-only key at ".concat(name, ", put it where ").concat(names, " is read, and run the same command again."));
}
function vendorNotFound(name, what) {
  return problem("vendor_not_found", "Vendor address not found", 404, "".concat(name, " answered 404 for ").concat(what, ". The --url is usually the cause: it must be the address of the ").concat(name, " service itself."), ExitCode.NotFound, "Check --url (scheme, host and any path prefix) and run the same command again.");
}
function vendorRateLimited(name, detail) {
  return problem("vendor_rate_limited", "Vendor rate limit", 429, "".concat(name, " is rate limiting this key: ").concat(detail), ExitCode.RateLimited, "Run the same command again later; reruns continue where this one stopped.");
}
function vendorUnavailable(name, detail, status) {
  return problem("vendor_unavailable", "Vendor unavailable", status, "".concat(name, " could not be reached or kept failing: ").concat(detail), status >= 500 ? ExitCode.Server : ExitCode.Network, "Check the vendor's status and your network, then run the same command again; reruns continue where this one stopped.");
}
function vendorFileGone(name, vendor, status) {
  return problem("vendor_file_gone", "Vendor file address no longer works", 410, "A file address ".concat(name, " listed answered HTTP ").concat(status, " from a host that was sent no key: the address has expired or is protected, and the key is not the cause. Run migrate scan again to refresh the file addresses, then run the same apply again."), ExitCode.Client, "A file that still fails after a new scan can be supplied with --files.", { command: "screenrig migrate scan --from ".concat(vendor), reason: "Reads the account again, with the same options and --dir, which refreshes the file addresses." });
}
function vendorFileStalled(name) {
  return problem("vendor_file_stalled", "Vendor file download stalled", 408, "".concat(name, " stopped sending a file, so that download was dropped."), ExitCode.Timeout, "Run the same apply again: the file is downloaded from the start.");
}
function vendorBadResponse(name, detail) {
  return problem("vendor_bad_response", "Vendor sent an unusable answer", 502, "".concat(name, " sent an answer this CLI cannot use: ").concat(detail), ExitCode.Server, "The vendor's API may have changed. Run the scan again; if it keeps happening, report it with screenrig feedback bug and say which vendor.");
}
function retryAfterSeconds(header, nowMs) {
  if (header === null || header === void 0)
    return void 0;
  const text2 = header.trim();
  if (/^\d+$/.test(text2))
    return Number(text2);
  const date = Date.parse(text2);
  return Number.isFinite(date) ? Math.max(0, Math.ceil((date - nowMs) / 1e3)) : void 0;
}
function backoffMs(attempt, random) {
  const exp = Math.min(VENDOR_BACKOFF_CAP_MS, 1e3 * 2 ** attempt);
  return Math.floor(exp * (0.5 + 0.5 * Math.min(1, Math.max(0, random()))));
}
var REDIRECTS = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function sameOrigin(a, b) {
  return a.origin === b.origin;
}
function lowerKeys(headers) {
  const result = {};
  for (const [name, value] of Object.entries(headers ?? {}))
    result[name.toLowerCase()] = value;
  return result;
}
function headerObject(headers) {
  const result = {};
  headers.forEach((value, name) => {
    result[name.toLowerCase()] = value;
  });
  return result;
}
function causeCode(error) {
  let current = error;
  for (let depth = 0; depth < 5 && current instanceof Error; depth += 1) {
    const code = current.code;
    if (typeof code === "string" && /^[A-Z][A-Z0-9_]{2,63}$/.test(code))
      return code;
    current = current.cause;
  }
  return void 0;
}
function createVendorHttp(options) {
  const random = options.random ?? Math.random;
  return {
    client(clientOptions) {
      return new Client(options, clientOptions, random);
    }
  };
}
var Client = class {
  http;
  options;
  random;
  origin;
  base;
  auth;
  slots = [];
  constructor(http, options, random) {
    this.http = http;
    this.options = options;
    this.random = random;
    let parsed;
    try {
      parsed = new URL(options.base);
    } catch {
      throw problem("usage_error", "Invalid command usage", 400, "".concat(http.name, " needs a full address starting with http:// or https://."), ExitCode.Usage);
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw problem("usage_error", "Invalid command usage", 400, "".concat(http.name, " needs an address starting with http:// or https://."), ExitCode.Usage);
    }
    this.origin = parsed.origin;
    this.base = options.base.replace(/\/+$/, "");
    this.auth = lowerKeys(options.auth);
  }
  setAuth(headers) {
    this.auth = lowerKeys(headers);
  }
  /** An API path under the base. A path that resolves to another origin is refused. */
  resolve(path2) {
    const absolute = /^([a-z][a-z0-9+.-]*:)?\/\//i.test(path2);
    let url;
    try {
      url = new URL(absolute ? path2 : "".concat(this.base).concat(path2 === "" ? "" : path2.startsWith("/") ? path2 : "/".concat(path2)), this.base);
    } catch {
      throw vendorBadResponse(this.http.name, "a request path could not be read as an address");
    }
    if (url.origin !== this.origin)
      throw vendorBadResponse(this.http.name, "a request path resolved to another origin, so it was not sent");
    return url;
  }
  /** Waits for a free slot in the sliding window shared by every request of this client. */
  async acquire() {
    const rate = this.options.rate;
    if (!rate)
      return;
    const now = this.http.now();
    while (this.slots.length > 0 && this.slots[0] <= now - rate.perMs)
      this.slots.shift();
    const at = this.slots.length >= rate.requests ? Math.max(now, this.slots[this.slots.length - rate.requests] + rate.perMs) : now;
    this.slots.push(at);
    if (at > now)
      await this.http.sleep(at - now);
  }
  async once(url, method, headers, body) {
    await this.acquire();
    const started = this.http.now();
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, this.http.requestTimeoutMs ?? REQUEST_TIMEOUT_MS);
    timer.unref?.();
    try {
      const response = await this.http.fetch(url.toString(), {
        method,
        headers,
        ...body === void 0 ? {} : { body },
        redirect: "manual",
        signal: controller.signal
      });
      this.http.log?.({ vendor: this.http.vendor, method, status: response.status, ms: this.http.now() - started });
      return response;
    } catch (error) {
      const cause = timedOut ? "REQUEST_TIMEOUT" : causeCode(error);
      this.http.log?.({ vendor: this.http.vendor, method, status: 0, ms: this.http.now() - started, ...cause ? { cause } : {} });
      throw new NetworkFailure(cause);
    } finally {
      clearTimeout(timer);
    }
  }
  /** One hop: retried on 429, 503 and network errors; every other status comes back as it is. */
  async hop(url, method, headers, body) {
    for (let attempt = 0; ; attempt += 1) {
      let response;
      try {
        response = await this.once(url, method, headers, body);
      } catch (error) {
        if (!(error instanceof NetworkFailure))
          throw error;
        if (attempt >= VENDOR_RETRIES)
          throw vendorUnavailable(this.http.name, "the connection failed or timed out".concat(error.code ? " (".concat(error.code, ")") : ""), 0);
        await this.http.sleep(backoffMs(attempt, this.random));
        continue;
      }
      if (response.status !== 429 && response.status !== 503)
        return response;
      const seconds = retryAfterSeconds(response.headers.get("retry-after"), this.http.now());
      await response.body?.cancel().catch(() => void 0);
      if (seconds !== void 0 && seconds > VENDOR_RETRY_AFTER_MAX_S) {
        throw vendorRateLimited(this.http.name, "it asked to wait ".concat(seconds, " seconds, which is more than this command waits."));
      }
      if (attempt >= VENDOR_RETRIES) {
        if (response.status === 429)
          throw vendorRateLimited(this.http.name, "it still answered 429 after several tries.");
        throw vendorUnavailable(this.http.name, "it still answered 503 after several tries", 503);
      }
      await this.http.sleep(seconds !== void 0 ? seconds * 1e3 : backoffMs(attempt, this.random));
    }
  }
  /**
   * Follows redirects by hand: the credential goes only to the base origin. Returns the
   * final answer and the address it came from.
   */
  async perform(start, init) {
    let url = start;
    let method = (init.method ?? "GET").toUpperCase();
    let body = init.form !== void 0 ? new URLSearchParams(init.form).toString() : init.body !== void 0 ? JSON.stringify(init.body) : void 0;
    const content = init.form !== void 0 ? { "content-type": "application/x-www-form-urlencoded" } : init.body !== void 0 ? { "content-type": "application/json" } : {};
    for (let redirects = 0; ; redirects += 1) {
      const headers = {
        "user-agent": USER_AGENT,
        accept: "application/json",
        ...body === void 0 ? {} : content,
        ...lowerKeys(init.headers),
        ...url.origin === this.origin ? this.auth : {}
      };
      const response = await this.hop(url, method, headers, body);
      const location = response.headers.get("location");
      if (!REDIRECTS.has(response.status) || !location)
        return { response, url };
      await response.body?.cancel().catch(() => void 0);
      if (redirects >= MAX_REDIRECTS)
        throw vendorBadResponse(this.http.name, "it redirected more than 5 times");
      let next;
      try {
        next = new URL(location, url);
      } catch {
        throw vendorBadResponse(this.http.name, "it redirected to an address that cannot be read");
      }
      if (next.protocol !== "http:" && next.protocol !== "https:")
        throw vendorBadResponse(this.http.name, "it redirected to an address that is not http or https");
      if (response.status !== 307 && response.status !== 308 && method !== "GET" && method !== "HEAD") {
        method = "GET";
        body = void 0;
      } else if (body !== void 0 && !sameOrigin(next, url)) {
        throw vendorBadResponse(this.http.name, "it redirected a request with a body to another address, so the request was not repeated there");
      }
      url = next;
    }
  }
  fail(status, what) {
    const { name, credentialNames } = this.http;
    if (status === 401 || status === 403)
      return vendorRefused(name, status, credentialNames);
    if (status === 404)
      return vendorNotFound(name, what);
    if (status === 429)
      return vendorRateLimited(name, "it answered 429.");
    if (status >= 500)
      return vendorUnavailable(name, "it answered HTTP ".concat(status), status);
    return vendorBadResponse(name, "it answered HTTP ".concat(status, " for ").concat(what));
  }
  async response(path2, init = {}) {
    const url = this.resolve(path2);
    if (init.query) {
      for (const [name, value] of Object.entries(init.query)) {
        if (value !== void 0)
          url.searchParams.set(name, String(value));
      }
    }
    const what = "".concat((init.method ?? "GET").toUpperCase(), " ").concat(/^([a-z][a-z0-9+.-]*:)?\/\//i.test(path2) ? url.pathname : path2.split("?")[0]);
    const { response } = await this.perform(url, init);
    if (response.status < 200 || response.status >= 300) {
      await response.body?.cancel().catch(() => void 0);
      throw this.fail(response.status, what);
    }
    const text2 = await this.readText(response);
    let parsed;
    if (text2 !== "") {
      try {
        parsed = JSON.parse(text2);
      } catch {
        throw vendorBadResponse(this.http.name, "it answered ".concat(what, " with a body that is not JSON"));
      }
    }
    return { status: response.status, headers: headerObject(response.headers), body: parsed };
  }
  /** A whole small body, dropped if it goes silent for the idle limit. */
  async readText(response) {
    if (!response.body)
      return "";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const idleMs = this.http.idleTimeoutMs ?? IDLE_TIMEOUT_MS;
    let text2 = "";
    for (; ; ) {
      let timer;
      const silent = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new NetworkFailure("IDLE_TIMEOUT")), idleMs);
        timer.unref?.();
      });
      try {
        const next = await Promise.race([reader.read(), silent]);
        if (next.done)
          return text2 + decoder.decode();
        text2 += decoder.decode(next.value, { stream: true });
      } catch (error) {
        await reader.cancel().catch(() => void 0);
        const code = error instanceof NetworkFailure ? error.code : causeCode(error);
        throw vendorUnavailable(this.http.name, "an answer stopped arriving".concat(code ? " (".concat(code, ")") : ""), 0);
      } finally {
        clearTimeout(timer);
      }
    }
  }
  async json(path2, init = {}) {
    return (await this.response(path2, init)).body;
  }
  async graphql(query2, variables = {}) {
    const answer = await this.json("", { method: "POST", body: { query: query2, variables } });
    if (answer && Array.isArray(answer.errors) && answer.errors.length > 0) {
      const codes = [...new Set(answer.errors.map((error) => error.extensions?.code).filter((code) => typeof code === "string" && /^[A-Za-z_]{3,40}$/.test(code)))];
      if (codes.some((code) => /^(UNAUTHENTICATED|UNAUTHORIZED|FORBIDDEN)$/i.test(code))) {
        throw vendorRefused(this.http.name, 401, this.http.credentialNames);
      }
      throw vendorBadResponse(this.http.name, "its GraphQL answer carried ".concat(answer.errors.length, " error").concat(answer.errors.length === 1 ? "" : "s").concat(codes.length ? " (".concat(codes.join(", "), ")") : ""));
    }
    if (!answer || answer.data === void 0 || answer.data === null)
      throw vendorBadResponse(this.http.name, "its GraphQL answer has no data");
    return answer.data;
  }
  async download(url, destination) {
    let target;
    try {
      target = /^([a-z][a-z0-9+.-]*:)?\/\//i.test(url) ? new URL(url) : this.resolve(url);
    } catch (error) {
      if (error instanceof CliError)
        throw error;
      throw vendorBadResponse(this.http.name, "a file address could not be read");
    }
    if (target.protocol !== "http:" && target.protocol !== "https:")
      throw vendorBadResponse(this.http.name, "a file address is not http or https");
    const { response, url: answered } = await this.perform(target, { headers: { accept: "*/*" } });
    if (response.status < 200 || response.status >= 300) {
      await response.body?.cancel().catch(() => void 0);
      if (answered.origin !== this.origin && (response.status === 401 || response.status === 403 || response.status === 410)) {
        throw vendorFileGone(this.http.name, this.http.vendor, response.status);
      }
      throw this.fail(response.status, "a file download");
    }
    if (!response.body)
      throw vendorBadResponse(this.http.name, "a file download had no body");
    const idle = new AbortController();
    let timer;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => idle.abort(), this.http.idleTimeoutMs ?? IDLE_TIMEOUT_MS);
      timer.unref?.();
    };
    let bytes = 0;
    const source = Readable.fromWeb(response.body);
    let handle;
    try {
      handle = await open(destination, "wx", 384);
    } catch (error) {
      source.destroy();
      throw error;
    }
    arm();
    try {
      await pipeline(source, new Transform({
        transform(chunk, _encoding, callback) {
          bytes += chunk.length;
          arm();
          callback(null, chunk);
        }
      }), handle.createWriteStream(), { signal: idle.signal });
    } catch (error) {
      await handle.close().catch(() => void 0);
      await rm(destination, { force: true });
      if (error instanceof CliError)
        throw error;
      if (idle.signal.aborted)
        throw vendorFileStalled(this.http.name);
      const code = causeCode(error);
      throw vendorUnavailable(this.http.name, "a file download stopped before it finished".concat(code ? " (".concat(code, ")") : ""), 0);
    } finally {
      clearTimeout(timer);
    }
    return { bytes };
  }
};
var NetworkFailure = class extends Error {
  code;
  constructor(code) {
    super("network failure");
    this.code = code;
  }
};
async function offsetPages(fetchPage, options = {}) {
  const pageSize = options.pageSize ?? 100;
  const id = options.id ?? ((item) => String(item?.id ?? JSON.stringify(item)));
  const seen = /* @__PURE__ */ new Set();
  const all = [];
  for (let start = 0; ; ) {
    const page = await fetchPage(start, pageSize);
    let added = 0;
    for (const item of page.items) {
      const key = id(item);
      if (seen.has(key))
        continue;
      seen.add(key);
      all.push(item);
      added += 1;
    }
    start += page.items.length;
    if (page.items.length === 0 || added === 0 || page.items.length < pageSize)
      return all;
    if (page.total !== void 0 && start >= page.total)
      return all;
  }
}
async function cursorPages(client, query2, pick, variables = {}) {
  const all = [];
  const seen = /* @__PURE__ */ new Set();
  let after = null;
  for (; ; ) {
    const page = pick(await client.graphql(query2, { ...variables, after }));
    all.push(...page.items);
    if (!page.hasNextPage || !page.endCursor || seen.has(page.endCursor))
      return all;
    seen.add(page.endCursor);
    after = page.endCursor;
  }
}

// dist/migrate/csv.js
var csv_exports = {};
__export(csv_exports, {
  csvTable: () => csvTable,
  parseCsv: () => parseCsv
});
function parseCsv(text2, label = "CSV file") {
  const source = text2.charCodeAt(0) === 65279 ? text2.slice(1) : text2;
  const rows2 = [];
  let row = [];
  let field = "";
  let quoted = false;
  let wasQuoted = false;
  let line = 1;
  let quoteLine = 1;
  const endField = () => {
    row.push(field);
    field = "";
    wasQuoted = false;
  };
  const endRow = () => {
    const quotedEmpty = wasQuoted;
    endField();
    if (!(row.length === 1 && row[0] === "" && !quotedEmpty))
      rows2.push(row);
    row = [];
  };
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        if (char === "\n")
          line += 1;
        field += char;
      }
      continue;
    }
    if (char === '"' && field === "") {
      quoted = true;
      wasQuoted = true;
      quoteLine = line;
    } else if (char === ",") {
      endField();
    } else if (char === "\r" || char === "\n") {
      if (char === "\r" && source[index + 1] === "\n")
        index += 1;
      line += 1;
      endRow();
    } else {
      field += char;
    }
  }
  if (quoted)
    throw usageError("".concat(label, " has a quote opened on line ").concat(quoteLine, " that is never closed."));
  if (field !== "" || row.length > 0 || wasQuoted)
    endRow();
  return rows2;
}
function csvTable(text2, columns, options) {
  const parsed = parseCsv(text2, options.label);
  const header = parsed[0] ?? [];
  const position = /* @__PURE__ */ new Map();
  header.forEach((name, index) => {
    const wanted2 = name.trim().toLowerCase();
    for (const [canonical, spellings] of Object.entries(columns)) {
      if (!position.has(canonical) && (canonical === wanted2 || spellings.includes(wanted2)))
        position.set(canonical, index);
    }
  });
  for (const required of options.required ?? []) {
    if (!position.has(required)) {
      throw usageError("".concat(options.label, " needs a ").concat(required, " column (").concat([required, ...columns[required] ?? []].join(", "), "); its header row is ").concat(header.map((name) => JSON.stringify(name)).join(", ") || "empty", "."));
    }
  }
  const rows2 = parsed.slice(1).map((cells, offset) => {
    const values = {};
    for (const [canonical, index] of position) {
      const cell = cells[index];
      values[canonical] = cell === void 0 ? void 0 : cell.trim();
    }
    return { row: offset + 2, values };
  });
  return { header, rows: rows2 };
}

// dist/migrate/zip.js
var zip_exports = {};
__export(zip_exports, {
  ZipArchive: () => ZipArchive
});
import { crc32, createInflateRaw } from "node:zlib";
import { createReadStream } from "node:fs";
import { open as open2, rm as rm2 } from "node:fs/promises";
import { Readable as Readable2, Transform as Transform2, Writable } from "node:stream";
import { pipeline as pipeline2 } from "node:stream/promises";
var EOCD = 101010256;
var EOCD64 = 101075792;
var EOCD64_LOCATOR = 117853008;
var CENTRAL = 33639248;
var LOCAL = 67324752;
var STORED = 0;
var DEFLATE = 8;
var U16 = 65535;
var U32 = 4294967295;
function safeNumber(value, what) {
  if (value > BigInt(Number.MAX_SAFE_INTEGER))
    throw usageError("This zip's ".concat(what, " is larger than this CLI can address."));
  return Number(value);
}
async function readAt(handle, position, length) {
  const buffer = Buffer.alloc(length);
  let done = 0;
  while (done < length) {
    const { bytesRead } = await handle.read(buffer, done, length - done, position + done);
    if (bytesRead === 0)
      throw usageError("This zip ends before its directory says it does; the file is truncated or damaged.");
    done += bytesRead;
  }
  return buffer;
}
function decodeName(raw, utf8Flag) {
  if (utf8Flag)
    return raw.toString("utf8");
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(raw);
  } catch {
    return raw.toString("latin1");
  }
}
function wanted(name, madeByUnix, attributes) {
  if (name === "" || name.endsWith("/") || name.endsWith("\\"))
    return false;
  if (madeByUnix) {
    const type = attributes >>> 16 & 61440;
    if (type === 40960 || type === 16384)
      return false;
  }
  for (const segment of name.split(/[\\/]/)) {
    if (segment === "__MACOSX")
      return false;
    if (segment.startsWith(".") && segment !== "." && segment !== "..")
      return false;
  }
  return true;
}
var ZipArchive = class _ZipArchive {
  file;
  entries;
  constructor(file, entries) {
    this.file = file;
    this.entries = entries;
  }
  static async open(file) {
    let handle;
    try {
      handle = await open2(file, "r");
    } catch {
      throw usageError("Cannot open the zip file for reading.");
    }
    try {
      return new _ZipArchive(file, await _ZipArchive.readDirectory(handle));
    } finally {
      await handle.close();
    }
  }
  static async readDirectory(handle) {
    const size = (await handle.stat()).size;
    if (size < 22)
      throw usageError("This file is too small to be a zip archive.");
    const tailLength = Math.min(size, 22 + 65535);
    const tailStart = size - tailLength;
    const tail = await readAt(handle, tailStart, tailLength);
    let eocd = -1;
    for (let at2 = tail.length - 22; at2 >= 0; at2 -= 1) {
      if (tail.readUInt32LE(at2) === EOCD && at2 + 22 + tail.readUInt16LE(at2 + 20) === tail.length) {
        eocd = at2;
        break;
      }
    }
    if (eocd < 0)
      throw usageError("This file is not a zip archive: its end-of-directory record is missing.");
    let count = tail.readUInt16LE(eocd + 10);
    let directorySize = tail.readUInt32LE(eocd + 12);
    let directoryOffset = tail.readUInt32LE(eocd + 16);
    if (count === U16 || directorySize === U32 || directoryOffset === U32) {
      const locatorAt = tailStart + eocd - 20;
      if (locatorAt < 0)
        throw usageError("This zip needs zip64 records that are missing.");
      const locator = await readAt(handle, locatorAt, 20);
      if (locator.readUInt32LE(0) !== EOCD64_LOCATOR)
        throw usageError("This zip needs zip64 records that are missing.");
      const record = await readAt(handle, safeNumber(locator.readBigUInt64LE(8), "directory position"), 56);
      if (record.readUInt32LE(0) !== EOCD64)
        throw usageError("This zip's zip64 end-of-directory record is damaged.");
      count = safeNumber(record.readBigUInt64LE(32), "entry count");
      directorySize = safeNumber(record.readBigUInt64LE(40), "directory size");
      directoryOffset = safeNumber(record.readBigUInt64LE(48), "directory position");
    }
    const directory = await readAt(handle, directoryOffset, directorySize);
    const entries = [];
    let at = 0;
    for (let index = 0; index < count; index += 1) {
      if (at + 46 > directory.length || directory.readUInt32LE(at) !== CENTRAL) {
        throw usageError("This zip's directory is damaged.");
      }
      const madeBy = directory.readUInt16LE(at + 4);
      const flags = directory.readUInt16LE(at + 8);
      const method = directory.readUInt16LE(at + 10);
      const crc = directory.readUInt32LE(at + 16);
      let compressed = directory.readUInt32LE(at + 20);
      let bytes = directory.readUInt32LE(at + 24);
      const nameLength = directory.readUInt16LE(at + 28);
      const extraLength = directory.readUInt16LE(at + 30);
      const commentLength = directory.readUInt16LE(at + 32);
      const attributes = directory.readUInt32LE(at + 38);
      let offset = directory.readUInt32LE(at + 42);
      const nameEnd = at + 46 + nameLength;
      const extraEnd = nameEnd + extraLength;
      if (extraEnd + commentLength > directory.length)
        throw usageError("This zip's directory is damaged.");
      const name = decodeName(directory.subarray(at + 46, nameEnd), (flags & 2048) !== 0);
      let extra = nameEnd;
      while (extra + 4 <= extraEnd) {
        const id = directory.readUInt16LE(extra);
        const length = directory.readUInt16LE(extra + 2);
        if (id === 1) {
          let cursor = extra + 4;
          const take = () => {
            if (cursor + 8 > extra + 4 + length)
              throw usageError("This zip's zip64 extra field is damaged.");
            const value = safeNumber(directory.readBigUInt64LE(cursor), "entry size");
            cursor += 8;
            return value;
          };
          if (bytes === U32)
            bytes = take();
          if (compressed === U32)
            compressed = take();
          if (offset === U32)
            offset = take();
        }
        extra += 4 + length;
      }
      at = extraEnd + commentLength;
      if (!wanted(name, madeBy >>> 8 === 3, attributes))
        continue;
      const unreadable = (flags & 1) !== 0 || (flags & 64) !== 0 ? "encrypted" : method === STORED || method === DEFLATE ? void 0 : { method };
      entries.push({ name, bytes, compressedBytes: compressed, method, crc32: crc, offset, ...unreadable ? { unreadable } : {} });
    }
    return entries;
  }
  /** The decompressed bytes of one entry as they come, without the CRC-32 check. */
  async stream(entry) {
    if (entry.unreadable)
      throw usageError("This zip entry cannot be read out.");
    const handle = await open2(this.file, "r");
    let start;
    try {
      const local = await readAt(handle, entry.offset, 30);
      if (local.readUInt32LE(0) !== LOCAL)
        throw usageError("This zip entry's header is damaged.");
      start = entry.offset + 30 + local.readUInt16LE(26) + local.readUInt16LE(28);
    } finally {
      await handle.close();
    }
    if (entry.compressedBytes === 0)
      return Readable2.from([]);
    const raw = createReadStream(this.file, { start, end: start + entry.compressedBytes - 1 });
    if (entry.method === STORED)
      return raw;
    const inflate = createInflateRaw();
    raw.on("error", (error) => inflate.destroy(error));
    inflate.on("close", () => raw.destroy());
    return raw.pipe(inflate);
  }
  /** The first `length` bytes of an entry, enough to tell what kind of file it is. */
  async head(entry, length = 64) {
    const stream = await this.stream(entry);
    const parts = [];
    let have = 0;
    try {
      for await (const chunk of stream) {
        parts.push(chunk);
        have += chunk.length;
        if (have >= length)
          break;
      }
    } finally {
      stream.destroy();
    }
    return Buffer.concat(parts).subarray(0, length);
  }
  verifying(entry) {
    let total = 0;
    let crc = 0;
    return new Transform2({
      transform(chunk, _encoding, callback) {
        total += chunk.length;
        if (total > entry.bytes) {
          callback(usageError("A zip entry holds more bytes than its directory says; the archive is damaged."));
          return;
        }
        crc = crc32(chunk, crc);
        callback(null, chunk);
      },
      flush(callback) {
        if (total !== entry.bytes || crc !== entry.crc32)
          callback(usageError("A zip entry fails its checksum; the archive is damaged."));
        else
          callback();
      }
    });
  }
  /** A whole entry in memory, checksum verified. For small text files. */
  async read(entry) {
    const parts = [];
    await pipeline2(await this.stream(entry), this.verifying(entry), new Writable({
      write(chunk, _encoding, callback) {
        parts.push(chunk);
        callback();
      }
    }));
    return Buffer.concat(parts);
  }
  /** Writes an entry to `destination` (created exclusively, mode 0600), checksum verified; a failed read leaves no file. */
  async extract(entry, destination) {
    const source = await this.stream(entry);
    let handle;
    try {
      handle = await open2(destination, "wx", 384);
    } catch (error) {
      source.destroy();
      throw error;
    }
    try {
      await pipeline2(source, this.verifying(entry), handle.createWriteStream());
    } catch (error) {
      await handle.close().catch(() => void 0);
      await rm2(destination, { force: true });
      throw error;
    }
    return { bytes: entry.bytes };
  }
};

// dist/migrate/local-files.js
var local_files_exports = {};
__export(local_files_exports, {
  baseName: () => baseName,
  openLocalFiles: () => openLocalFiles
});
import { constants } from "node:fs";
import { copyFile, lstat, open as open3, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
function baseName(entryPath) {
  const segments = entryPath.split(/[\\/]/);
  return segments[segments.length - 1] ?? entryPath;
}
function matchKey(name) {
  return name.normalize("NFC").toLowerCase();
}
function indexed(entries) {
  const byName = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    const key = matchKey(baseName(entry.path));
    byName.set(key, [...byName.get(key) ?? [], entry]);
  }
  return (filename, bytes) => (byName.get(matchKey(baseName(filename))) ?? []).filter((entry) => bytes === void 0 || entry.bytes === bytes);
}
var byPath = (a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
async function walk(root, relative, into) {
  const directory = relative === "" ? root : path.join(root, ...relative.split("/"));
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (item.name.startsWith(".") || item.name === "__MACOSX" || item.isSymbolicLink())
      continue;
    const child = relative === "" ? item.name : "".concat(relative, "/").concat(item.name);
    if (item.isDirectory()) {
      await walk(root, child, into);
    } else if (item.isFile()) {
      into.push({ path: child, bytes: (await lstat(path.join(root, ...child.split("/")))).size });
    }
  }
}
async function folderFiles(root) {
  const entries = [];
  await walk(root, "", entries);
  entries.sort(byPath);
  const real = (entry) => path.join(root, ...entry.path.split("/"));
  return {
    label: path.basename(path.resolve(root)),
    entries: () => entries,
    match: indexed(entries),
    async head(entry, length = 64) {
      const handle = await open3(real(entry), "r");
      try {
        const buffer = Buffer.alloc(length);
        const { bytesRead } = await handle.read(buffer, 0, length, 0);
        return buffer.subarray(0, bytesRead);
      } finally {
        await handle.close();
      }
    },
    read: (entry) => readFile(real(entry)),
    async extract(entry, destination) {
      await copyFile(real(entry), destination, constants.COPYFILE_EXCL | constants.COPYFILE_FICLONE);
      return { bytes: entry.bytes };
    }
  };
}
function zipReason(entry) {
  if (!entry.unreadable)
    return void 0;
  return entry.unreadable === "encrypted" ? "It is encrypted in the zip." : "It uses zip compression method ".concat(entry.unreadable.method, ", which this CLI cannot read.");
}
async function zipFiles(file) {
  const archive = await ZipArchive.open(file);
  const byName = /* @__PURE__ */ new Map();
  const entries = archive.entries.map((entry) => {
    const reason = zipReason(entry);
    const local = { path: entry.name.replaceAll("\\", "/"), bytes: entry.bytes, ...reason ? { unreadable: reason } : {} };
    byName.set(local.path, entry);
    return local;
  });
  entries.sort(byPath);
  const raw = (entry) => {
    const found = byName.get(entry.path);
    if (!found)
      throw usageError("That file is not in the zip.");
    return found;
  };
  return {
    label: path.basename(file).replace(/\.zip$/i, ""),
    entries: () => entries,
    match: indexed(entries),
    head: (entry, length) => archive.head(raw(entry), length),
    read: (entry) => archive.read(raw(entry)),
    extract: (entry, destination) => archive.extract(raw(entry), destination)
  };
}
async function openLocalFiles(source) {
  let info;
  try {
    info = await stat(source);
  } catch {
    throw usageError("--files names a path that does not exist. Give a folder, or a .zip you downloaded.");
  }
  if (info.isDirectory())
    return folderFiles(source);
  if (info.isFile())
    return zipFiles(source);
  throw usageError("--files must be a folder or a .zip file.");
}

// dist/migrate/vendors/files.js
var files_exports = {};
__export(files_exports, {
  files: () => files
});
var COLLATOR = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
var PLAYLIST_COLUMNS = {
  playlist: [],
  file: ["filename", "path"],
  duration: ["seconds"],
  order: ["position"]
};
var SCREEN_COLUMNS = {
  name: [],
  group: ["groups", "tags"],
  playlist: [],
  timezone: []
};
function validZone(zone) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}
function stemOf(filename) {
  return filename.replace(/\.[A-Za-z0-9]{1,8}$/, "") || filename;
}
function folderOf(entryPath) {
  const cut = entryPath.lastIndexOf("/");
  return cut < 0 ? "" : entryPath.slice(0, cut);
}
function uniquely(name, used) {
  let candidate = name;
  for (let n = 2; used.has(candidate); n += 1)
    candidate = "".concat(name, " (").concat(n, ")");
  used.add(candidate);
  return candidate;
}
var FilesSession = class {
  files;
  constructor(files2) {
    this.files = files2;
  }
  async scan() {
    const notImported = [];
    const notes = [];
    const entries = this.files.entries();
    const rootCsv = (name) => entries.find((entry) => entry.path.toLowerCase() === name);
    const playlistsCsv = rootCsv("playlists.csv");
    const screensCsv = rootCsv("screens.csv");
    const media = [];
    for (const entry of entries) {
      if (entry === playlistsCsv || entry === screensCsv)
        continue;
      const name = baseName(entry.path);
      if (entry.unreadable) {
        notImported.push({ kind: "file", source_id: entry.path, name, reason: entry.unreadable });
        continue;
      }
      const sniffed = sniffMediaContainer(await this.files.head(entry));
      if (!sniffed) {
        notImported.push({ kind: "file", source_id: entry.path, name, reason: "It is not an image, video or audio file." });
        continue;
      }
      media.push({ id: entry.path, name: stemOf(name), filename: name, kind: sniffed.kind, bytes: entry.bytes, fetch: { entry: entry.path }, original: true });
    }
    const byPath2 = new Map(media.map((item) => [item.id.toLowerCase(), item]));
    const byName = /* @__PURE__ */ new Map();
    for (const item of media)
      byName.set(item.filename.toLowerCase(), [...byName.get(item.filename.toLowerCase()) ?? [], item]);
    const resolve = (cell) => {
      const exact = byPath2.get(cell.replaceAll("\\", "/").replace(/^\.\//, "").toLowerCase());
      if (exact)
        return exact;
      const named = byName.get(baseName(cell).toLowerCase()) ?? [];
      return named.length === 1 ? named[0] : named.length > 1 ? "many" : void 0;
    };
    const playlists = [];
    if (playlistsCsv) {
      const table = csvTable((await this.files.read(playlistsCsv)).toString("utf8"), PLAYLIST_COLUMNS, { label: "playlists.csv", required: ["playlist", "file"] });
      const grouped = /* @__PURE__ */ new Map();
      for (const { row, values } of table.rows) {
        const playlist = values.playlist ?? "";
        const file = values.file ?? "";
        if (!playlist && !file)
          continue;
        const entry = { kind: "item", source_id: "playlists.csv row ".concat(row), name: file || "(no file)", reason: "" };
        if (!playlist) {
          notImported.push({ ...entry, reason: "The row has no playlist name." });
          continue;
        }
        if (!grouped.has(playlist))
          grouped.set(playlist, []);
        if (!file) {
          notImported.push({ ...entry, reason: "The row has no file." });
          continue;
        }
        const found = resolve(file);
        if (found === void 0) {
          notImported.push({ ...entry, reason: "No such media file was found in --files.", next: "Add the file to the folder or zip and rerun migrate scan, or correct the name in playlists.csv." });
          continue;
        }
        if (found === "many") {
          notImported.push({ ...entry, reason: "More than one file has this name; give its path from the root of --files.", next: "Write the file's path in playlists.csv and rerun migrate scan." });
          continue;
        }
        const seconds = values.duration === void 0 || values.duration === "" ? void 0 : Number(values.duration);
        if (seconds !== void 0 && !(seconds > 0))
          notes.push("playlists.csv row ".concat(row, ': the duration "').concat(values.duration, '" is not a number of seconds; the default is used.'));
        const order = values.order === void 0 || values.order === "" ? void 0 : Number(values.order);
        grouped.get(playlist).push({
          item: { media_id: found.id, ...seconds !== void 0 && seconds > 0 ? { duration_s: seconds } : {} },
          order: order !== void 0 && Number.isFinite(order) ? order : row,
          row
        });
      }
      for (const [name, rows2] of grouped) {
        rows2.sort((a, b) => a.order - b.order || a.row - b.row);
        playlists.push({ id: name, name, items: rows2.map((row) => row.item), notes: [] });
      }
    } else {
      const folders = /* @__PURE__ */ new Map();
      for (const item of media)
        folders.set(folderOf(item.id), [...folders.get(folderOf(item.id)) ?? [], item]);
      for (const [folder, list] of [...folders].sort(([a], [b]) => COLLATOR.compare(a, b))) {
        const name = folder === "" ? this.files.label : folder.split("/").join(" / ");
        const ordered2 = [...list].sort((a, b) => COLLATOR.compare(a.filename, b.filename) || COLLATOR.compare(a.id, b.id));
        playlists.push({ id: folder === "" ? "(root)" : folder, name, items: ordered2.map((item) => ({ media_id: item.id })), notes: [] });
      }
    }
    const groups = [];
    const screens = [];
    if (screensCsv) {
      const table = csvTable((await this.files.read(screensCsv)).toString("utf8"), SCREEN_COLUMNS, { label: "screens.csv", required: ["name"] });
      const groupByName = /* @__PURE__ */ new Map();
      const used = /* @__PURE__ */ new Set();
      const playlistByName = (cell) => {
        const wanted2 = cell.trim().toLowerCase();
        const exact = playlists.find((playlist) => playlist.name.toLowerCase() === wanted2 || playlist.id.toLowerCase() === wanted2);
        if (exact)
          return exact;
        const tail = playlists.filter((playlist) => (playlist.name.split(" / ").pop() ?? "").toLowerCase() === wanted2);
        return tail.length === 1 ? tail[0] : void 0;
      };
      for (const { row, values } of table.rows) {
        const name = values.name ?? "";
        if (!name) {
          if (Object.values(values).some((value) => value))
            notImported.push({ kind: "screen", source_id: "screens.csv row ".concat(row), name: "(no name)", reason: "The row has no name." });
          continue;
        }
        const screenNotes = [];
        const groupIds = [];
        for (const cell of (values.group ?? "").split(";").map((part) => part.trim()).filter(Boolean)) {
          let group = groupByName.get(cell.toLowerCase());
          if (!group) {
            group = { id: cell, name: cell };
            groupByName.set(cell.toLowerCase(), group);
            groups.push(group);
          }
          if (!groupIds.includes(group.id))
            groupIds.push(group.id);
        }
        let content;
        if (values.playlist) {
          const playlist = playlistByName(values.playlist);
          if (playlist)
            content = { playlist_id: playlist.id };
          else
            screenNotes.push('The playlist "'.concat(values.playlist, '" is not among the playlists, so it has no default playlist.'));
        }
        let timezone;
        if (values.timezone) {
          if (validZone(values.timezone))
            timezone = values.timezone;
          else
            screenNotes.push('The time zone "'.concat(values.timezone, '" is not an IANA name such as America/Toronto, so none is set.'));
        }
        screens.push({ id: uniquely(name, used), name, group_ids: groupIds, ...content ? { content } : {}, ...timezone ? { timezone } : {}, notes: screenNotes });
      }
    }
    return { account: "files", label: this.files.label, media, playlists, layouts: [], groups, screens, schedules: [], not_imported: notImported, notes };
  }
  async fetchMedia(media, destination) {
    const entry = this.files.entries().find((candidate) => candidate.path === media.fetch?.entry);
    if (!entry)
      throw usageError("".concat(media.filename, " is no longer in --files. Put it back and run the same command again."));
    return this.files.extract(entry, destination);
  }
};
var files = {
  id: "files",
  name: "Files",
  inputs: { files: "required", timezone: true },
  credentials: [],
  connect: [
    "Put the media in one folder, or one .zip: images, video and audio, in folders if you like.",
    "Optional: playlists.csv at the root with columns playlist, file, duration (seconds) and order.",
    "Optional: screens.csv at the root with columns name, group (separate several with ;), playlist and timezone."
  ],
  maps: [
    "Each image, video and audio file becomes media, found by what is in the file, not its extension.",
    "playlists.csv rows become playlists, in order; without it each folder that holds media becomes a playlist in natural file-name order, and files at the root form a playlist named after the folder or zip.",
    "screens.csv rows become one waiting screen each, with their groups as tags, their playlist and their time zone."
  ],
  skips: [
    "Files that are not images, video or audio, and zip entries that are encrypted, are listed.",
    "There are no schedules: create them with campaign create once the playlists exist."
  ],
  docs: ["https://datatracker.ietf.org/doc/html/rfc4180"],
  example: "screenrig migrate scan --from files --files ./signage-media",
  async open(input) {
    if (!input.files)
      throw usageError("--from files needs --files PATH: a folder or a .zip of media.");
    return new FilesSession(input.files);
  }
};

// dist/migrate/vendors/xy-rows.js
var xy_rows_exports = {};
__export(xy_rows_exports, {
  asRow: () => asRow,
  flag: () => flag,
  idOf: () => idOf,
  num: () => num,
  rows: () => rows,
  text: () => text,
  zoneOf: () => zoneOf
});
var asRow = (value) => value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
var rows = (value) => Array.isArray(value) ? value.map(asRow) : [];
var text = (value) => typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "";
var flag = (value) => value === true || value === 1 || value === "1";
function num(value) {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? n : void 0;
}
function idOf(vendor, row, field, where) {
  const value = row[field];
  if (typeof value === "number" && Number.isFinite(value))
    return String(value);
  if (typeof value === "string" && value !== "")
    return value;
  throw vendorBadResponse(vendor, "".concat(where, " has a row without ").concat(field));
}
function zoneOf(value) {
  const name = text(value);
  if (name === "")
    return void 0;
  try {
    return new Intl.DateTimeFormat("en", { timeZone: name }).resolvedOptions().timeZone;
  } catch {
    return void 0;
  }
}

// dist/migrate/vendors/xibo.js
var xibo_exports = {};
__export(xibo_exports, {
  xibo: () => xibo
});
var NAME = "Xibo";
var idOf2 = (row, field, where) => idOf(NAME, row, field, where);
var PAGE = 100;
var DATE_MAX = 2147483647;
var WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
var MEDIA_KINDS = { image: "image", video: "video", audio: "audio" };
var RECURRENCE = {
  Minute: "minute",
  Hour: "hour",
  Day: "day",
  Week: "week",
  Month: "month",
  Year: "year"
};
var EVENT_REASONS = {
  2: "Command events run a command on the display.",
  3: "Overlay events draw a layout over the one that is playing.",
  4: "Interrupt events take a share of each hour from the running schedule.",
  6: "Action events wait for a trigger code from a web hook.",
  7: "Media events show one library item full screen, and Xibo's API does not say which item.",
  8: "Playlist events show one playlist full screen, and Xibo's API does not say which playlist.",
  9: "Synchronised events drive several displays together as a video wall.",
  10: "Data connector events feed a dataset."
};
var FILE_LABELS = {
  font: "A font",
  pdf: "A PDF",
  powerpoint: "A PowerPoint file",
  htmlpackage: "An HTML package",
  flash: "A Flash file",
  genericfile: "A generic file"
};
var formatters = /* @__PURE__ */ new Map();
function civil(seconds, zone) {
  let format = formatters.get(zone);
  if (!format) {
    format = new Intl.DateTimeFormat("en-CA", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    formatters.set(zone, format);
  }
  const parts = {};
  for (const part of format.formatToParts(new Date(seconds * 1e3)))
    parts[part.type] = part.value;
  return "".concat(parts.year, "-").concat(parts.month, "-").concat(parts.day, "T").concat(parts.hour, ":").concat(parts.minute);
}
function cmsAddress(url) {
  let parsed;
  try {
    parsed = new URL((url ?? "").trim());
  } catch {
    throw usageError("--url must be the address of the Xibo CMS, such as https://cms.example.com (add the folder if it is installed in one).");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
    throw usageError("--url must start with http:// or https://.");
  const folder = parsed.pathname.replace(/\/+$/, "").replace(/\/api$/i, "");
  const root = "".concat(parsed.origin).concat(folder);
  return { api: "".concat(root, "/api"), account: root, label: "".concat(parsed.host).concat(folder) };
}
function widgetOption(widget, option) {
  const found = rows(widget.widgetOptions).find((candidate) => text(candidate.option) === option);
  return text(found?.value);
}
function itemsOf(widgets, where, entries, nowSeconds) {
  const ordered2 = rows(widgets).map((widget, index) => ({ widget, index })).sort((a, b) => (num(a.widget.displayOrder) ?? a.index) - (num(b.widget.displayOrder) ?? b.index) || a.index - b.index);
  const items = [];
  let expired = 0;
  let dated = 0;
  for (const { widget, index } of ordered2) {
    const type = text(widget.type).toLowerCase();
    const fromDt = num(widget.fromDt) ?? 0;
    const toDt = num(widget.toDt);
    const hasEnd = toDt !== void 0 && toDt > 0 && toDt !== DATE_MAX;
    if (hasEnd && toDt <= nowSeconds) {
      expired += 1;
      continue;
    }
    if (fromDt > 0 || hasEnd)
      dated += 1;
    let seconds;
    if (type !== "audio") {
      if (flag(widget.useDuration) && (num(widget.duration) ?? 0) > 0)
        seconds = num(widget.duration);
      else if (type !== "video" && (num(widget.calculatedDuration) ?? 0) > 0)
        seconds = num(widget.calculatedDuration);
    }
    const name = widgetOption(widget, "name");
    const entry = (reason, next) => {
      entries.push({ kind: "item", source_id: "".concat(where, " item ").concat(text(widget.widgetId) || index + 1), name: name || "".concat(type || "unknown", " widget"), reason, ...next ? { next } : {} });
    };
    if (type in MEDIA_KINDS) {
      const media = Array.isArray(widget.mediaIds) ? widget.mediaIds[0] : void 0;
      if (typeof media === "number" || typeof media === "string" && media !== "")
        items.push({ media_id: String(media), ...seconds !== void 0 ? { duration_s: seconds } : {} });
      else
        entry("A ".concat(type, " widget with no library file in it."));
    } else if (type === "webpage") {
      const address = widgetOption(widget, "uri");
      if (/^https?:\/\//i.test(address))
        items.push({ url: address, ...seconds !== void 0 ? { duration_s: seconds } : {} });
      else
        entry("A web page widget whose address is not an http or https address.");
    } else {
      const label = type === "" ? "Widgets of an unknown type" : "".concat(type[0].toUpperCase()).concat(type.slice(1), " widgets");
      entry("".concat(label, " are not images, video, audio or web pages."), "Rebuild it as a built-in card, or as a web page if it shows one.");
    }
  }
  const notes = [];
  if (expired > 0)
    notes.push("".concat(expired, " item").concat(expired === 1 ? " was" : "s were", " left out because ").concat(expired === 1 ? "its" : "their", " play dates had passed."));
  if (dated > 0)
    notes.push("".concat(dated, " item").concat(dated === 1 ? " had" : "s had", " play dates; ").concat(dated === 1 ? "it now plays" : "they now play", " whenever the list does."));
  return { items, notes };
}
var XiboSession = class {
  client;
  credentials;
  options;
  authorized;
  renewal;
  constructor(client, credentials, options) {
    this.client = client;
    this.credentials = credentials;
    this.options = options;
  }
  async authorize() {
    this.client.setAuth(void 0);
    const answer = asRow(await this.client.json("/authorize/access_token", {
      method: "POST",
      form: { grant_type: "client_credentials", client_id: this.credentials.id, client_secret: this.credentials.secret }
    }));
    const token = answer.access_token;
    if (typeof token !== "string" || token === "")
      throw vendorBadResponse(NAME, "its token answer has no access_token");
    this.client.setAuth({ Authorization: "Bearer ".concat(token) });
  }
  /** Runs one request with a token; a 401 gets a fresh token and one more try. */
  async call(run) {
    await (this.authorized ??= this.authorize());
    try {
      return await run();
    } catch (error) {
      if (!(error instanceof CliError) || error.problem.code !== "vendor_refused" || error.problem.status !== 401)
        throw error;
      await (this.renewal ??= this.authorize().finally(() => {
        this.renewal = void 0;
      }));
      return run();
    }
  }
  /** Every row of a grid. The total comes from X-Total-Count, so a CMS that caps the page size is still read to the end. */
  async list(path2, idField, query2 = {}) {
    const all = [];
    const seen = /* @__PURE__ */ new Set();
    for (let start = 0; ; ) {
      const page = await this.call(() => this.client.response(path2, { query: { ...query2, start, length: PAGE } }));
      if (!Array.isArray(page.body))
        throw vendorBadResponse(NAME, "GET ".concat(path2, " did not answer with a list"));
      let added = 0;
      for (const row of page.body.map(asRow)) {
        const id = idOf2(row, idField, "GET ".concat(path2));
        if (seen.has(id))
          continue;
        seen.add(id);
        all.push(row);
        added += 1;
      }
      start += page.body.length;
      const total = num(page.headers["x-total-count"]);
      if (page.body.length === 0 || added === 0)
        return all;
      if (total !== void 0 ? start >= total : page.body.length < PAGE)
        return all;
    }
  }
  async scan() {
    const nowSeconds = Math.floor(this.options.now().getTime() / 1e3);
    const library = await this.list("/library", "mediaId");
    const playlistRows = await this.list("/playlist", "playlistId", { embed: "widgets" });
    const layoutRows = await this.list("/layout", "layoutId", { embed: "regions,playlists,widgets" });
    const groupRows = await this.list("/displaygroup", "displayGroupId");
    const displayRows = await this.list("/display", "displayId", { embed: "displaygroups" });
    const campaignRows = await this.list("/campaign", "campaignId", { embed: "layouts" });
    const eventRows = await this.list("/schedule", "eventId");
    const entries = [];
    const notes = [];
    const media = [];
    for (const row of library) {
      const id = idOf2(row, "mediaId", "GET /library");
      const type = text(row.mediaType);
      const filename = text(row.fileName) || text(row.storedAs);
      const name = text(row.name) || filename || "Media ".concat(id);
      const kind = MEDIA_KINDS[type.toLowerCase()];
      if (flag(row.retired)) {
        entries.push({ kind: "media", source_id: id, name, reason: "It is retired in Xibo, so no screen plays it." });
      } else if (!kind) {
        const label = FILE_LABELS[type.toLowerCase()] ?? "A ".concat(type || "unknown", " item");
        const next = /^(pdf|powerpoint)$/i.test(type) ? "Export its pages as images, or the deck as a video, and add them with media upload-batch." : /^htmlpackage$/i.test(type) ? "Host the page on a web server and add it as an iframe page." : void 0;
        entries.push({ kind: "media", source_id: id, name, reason: "".concat(label, " is not an image, video or audio file."), ...next ? { next } : {} });
      } else {
        const bytes = num(row.fileSize);
        media.push({ id, name, filename: filename || name, kind, ...bytes !== void 0 && bytes > 0 ? { bytes } : {}, fetch: { id, type }, original: true });
      }
    }
    const playlists = [];
    for (const row of playlistRows) {
      if ((num(row.regionId) ?? 0) > 0)
        continue;
      const id = idOf2(row, "playlistId", "GET /playlist");
      const gathered = itemsOf(row.widgets, "playlist ".concat(id), entries, nowSeconds);
      const itemNotes = [...gathered.notes];
      if (flag(row.isDynamic))
        itemNotes.push("It was a dynamic playlist that picks its media by name or tag; it now holds only the media it listed at scan time.");
      playlists.push({ id, name: text(row.name) || "Playlist ".concat(id), items: gathered.items, notes: itemNotes });
    }
    const layouts = [];
    const layoutOfCampaign = /* @__PURE__ */ new Map();
    for (const row of layoutRows) {
      if ((num(row.parentId) ?? 0) > 0)
        continue;
      const id = idOf2(row, "layoutId", "GET /layout");
      const name = text(row.layout) || "Layout ".concat(id);
      const retired = flag(row.retired);
      const campaign = num(row.campaignId);
      if (campaign !== void 0)
        layoutOfCampaign.set(String(campaign), { id, retired });
      if (retired) {
        entries.push({ kind: "layout", source_id: id, name, reason: "It is retired in Xibo, so no screen plays it." });
        continue;
      }
      const layoutNotes = /* @__PURE__ */ new Set();
      const zones = [];
      let position = 0;
      for (const region of rows(row.regions)) {
        position += 1;
        const regionId = text(region.regionId) || String(position);
        const widgets = asRow(region.regionPlaylist).widgets;
        if (flag(region.isDrawer)) {
          if (rows(widgets).length > 0)
            layoutNotes.add("The items in its drawer, which actions bring up, do not come over.");
          continue;
        }
        const gathered = itemsOf(widgets, "layout ".concat(id, " zone ").concat(regionId), entries, nowSeconds);
        for (const note of gathered.notes)
          layoutNotes.add(note);
        zones.push({
          id: regionId,
          name: text(region.name) || "Zone ".concat(position),
          x: num(region.left) ?? 0,
          y: num(region.top) ?? 0,
          width: num(region.width) ?? 0,
          height: num(region.height) ?? 0,
          z: num(region.zIndex) ?? 0,
          items: gathered.items
        });
      }
      if ((num(row.backgroundImageId) ?? 0) > 0)
        layoutNotes.add("Its background image does not come over.");
      const width = num(row.width);
      const height = num(row.height);
      layouts.push({ id, name, ...width !== void 0 && width > 0 ? { width } : {}, ...height !== void 0 && height > 0 ? { height } : {}, zones, notes: [...layoutNotes] });
    }
    const importableLayouts = new Set(layouts.map((layout) => layout.id));
    const adCampaigns = /* @__PURE__ */ new Set();
    const campaignPlaylist = /* @__PURE__ */ new Map();
    for (const row of campaignRows) {
      const id = idOf2(row, "campaignId", "GET /campaign");
      if (flag(row.isLayoutSpecific))
        continue;
      const type = text(row.type).toLowerCase();
      const name = text(row.campaign) || "Campaign ".concat(id);
      if (type === "ad") {
        adCampaigns.add(id);
        entries.push({ kind: "playlist", source_id: "campaign:".concat(id), name, reason: "It is an ad campaign, which Xibo schedules by a target of plays, spend or impressions." });
        continue;
      }
      if (type !== "" && type !== "list")
        continue;
      const repeats = flag(row.cyclePlaybackEnabled) ? Math.max(1, Math.floor(num(row.playCount) ?? 1)) : 1;
      const items = [];
      const ordered2 = rows(row.layouts).map((layout, index) => ({ layout, index })).sort((a, b) => (num(a.layout.displayOrder) ?? a.index) - (num(b.layout.displayOrder) ?? b.index) || a.index - b.index);
      for (const { layout } of ordered2) {
        const layoutId = text(layout.layoutId);
        if (layoutId === "" || !importableLayouts.has(layoutId))
          continue;
        for (let copy = 0; copy < repeats; copy += 1)
          items.push({ layout_id: layoutId });
      }
      campaignPlaylist.set(id, "campaign:".concat(id));
      playlists.push({ id: "campaign:".concat(id), name, items, notes: [] });
    }
    const groups = [];
    let dynamicGroups = 0;
    for (const row of groupRows) {
      const id = idOf2(row, "displayGroupId", "GET /displaygroup");
      if (flag(row.isDisplaySpecific))
        continue;
      if (flag(row.isDynamic))
        dynamicGroups += 1;
      groups.push({ id, name: text(row.displayGroup) || "Group ".concat(id) });
    }
    const groupIds = new Set(groups.map((group) => group.id));
    if (dynamicGroups > 0) {
      notes.push("".concat(dynamicGroups, " display group").concat(dynamicGroups === 1 ? " picks its displays" : "s pick their displays", " by name or tag; ").concat(dynamicGroups === 1 ? "it" : "they", " came over with the displays held now."));
    }
    const screens = [];
    const displayOfOwnGroup = /* @__PURE__ */ new Map();
    const membersOfGroup = /* @__PURE__ */ new Map();
    for (const row of displayRows) {
      const id = idOf2(row, "displayId", "GET /display");
      const own = num(row.displayGroupId);
      if (own !== void 0)
        displayOfOwnGroup.set(String(own), id);
      const memberOf = [];
      for (const group of rows(row.displayGroups)) {
        const groupId = text(group.displayGroupId);
        if (!groupIds.has(groupId) || memberOf.includes(groupId))
          continue;
        memberOf.push(groupId);
        membersOfGroup.set(groupId, [...membersOfGroup.get(groupId) ?? [], id]);
      }
      const layout = num(row.defaultLayoutId);
      const timezone = zoneOf(row.timeZone);
      screens.push({
        id,
        name: text(row.display) || "Display ".concat(id),
        group_ids: memberOf,
        ...layout !== void 0 && layout > 0 ? { content: { layout_id: String(layout) } } : {},
        ...timezone ? { timezone } : {},
        notes: []
      });
    }
    const screenZone = new Map(screens.map((screen) => [screen.id, screen.timezone]));
    const schedules = [];
    for (const row of eventRows) {
      const eventId = idOf2(row, "eventId", "GET /schedule");
      const typeId = num(row.eventTypeId) ?? 1;
      const name = text(row.name) || text(row.campaign) || "Event ".concat(eventId);
      const refuse = (reason, next) => {
        entries.push({ kind: "schedule", source_id: eventId, name, reason, ...next ? { next } : {} });
      };
      if (typeId !== 1 && typeId !== 5) {
        refuse(EVENT_REASONS[typeId] ?? "Event type ".concat(typeId, " is not one that campaigns can express."), "Recreate it with campaign create once the screens are paired, if you still need it.");
        continue;
      }
      if (flag(row.isGeoAware)) {
        refuse("It plays only inside a map area (geo-fencing), which campaigns cannot express.");
        continue;
      }
      if (rows(row.criteria).length > 0) {
        refuse("It plays only while a condition holds (schedule criteria), which campaigns cannot express.");
        continue;
      }
      const campaignId = text(row.campaignId);
      let content;
      if (typeId === 1) {
        const layout = layoutOfCampaign.get(campaignId);
        if (!layout) {
          refuse("The layout it plays was not found among the layouts this key can read.");
          continue;
        }
        if (layout.retired) {
          refuse("The layout it plays is retired in Xibo.");
          continue;
        }
        content = { layout_id: layout.id };
      } else {
        const playlist = campaignPlaylist.get(campaignId);
        if (!playlist) {
          refuse(adCampaigns.has(campaignId) ? "It plays an ad campaign, which Xibo schedules by a target of plays, spend or impressions." : "The campaign it plays was not found among the campaigns this key can read.");
          continue;
        }
        content = { playlist_id: playlist };
      }
      const always = flag(row.isAlways);
      const fromDt = num(row.fromDt);
      const toDt = num(row.toDt);
      const range = num(row.recurrenceRange);
      const every = RECURRENCE[text(row.recurrenceType)];
      const repeating = !always && every !== void 0;
      const lastSecond = repeating ? range !== void 0 && range > 0 ? range : void 0 : toDt;
      if (!always && lastSecond !== void 0 && lastSecond > 0 && lastSecond <= nowSeconds) {
        refuse("It has already ended.");
        continue;
      }
      const groupTargets = [];
      const screenTargets = [];
      for (const group of rows(row.displayGroups)) {
        const groupId = text(group.displayGroupId);
        const display = displayOfOwnGroup.get(groupId);
        if (display !== void 0) {
          if (!screenTargets.includes(display))
            screenTargets.push(display);
        } else if (groupIds.has(groupId) && !groupTargets.includes(groupId)) {
          groupTargets.push(groupId);
        }
      }
      const reached = [.../* @__PURE__ */ new Set([...screenTargets, ...groupTargets.flatMap((group) => membersOfGroup.get(group) ?? [])])];
      const cmsZone = this.options.timezone;
      const cms = { zone: cmsZone ?? "UTC", known: cmsZone !== void 0 };
      const synced = flag(row.syncTimezone) && !always;
      const parts = [];
      const byZone = /* @__PURE__ */ new Map();
      if (synced) {
        for (const display of reached) {
          const own = screenZone.get(display);
          const zone = own !== void 0 ? { zone: own, known: true } : cms;
          const bucket = byZone.get(zone.zone) ?? { known: zone.known, screens: [] };
          bucket.screens.push(display);
          byZone.set(zone.zone, bucket);
        }
      }
      if (byZone.size > 1) {
        for (const [zone, bucket] of byZone)
          parts.push({ zone, known: bucket.known, groups: [], screens: bucket.screens });
      } else {
        const only = [...byZone][0];
        parts.push({ ...only ? { zone: only[0], known: only[1].known } : cms, groups: groupTargets, screens: screenTargets });
      }
      const baseNotes = [];
      if ((num(row.dayPartId) ?? 0) > 0 && !always && !flag(row.isCustom))
        baseNotes.push("It used a Xibo daypart; its times were taken as the event stores them.");
      if ((num(row.maxPlaysPerHour) ?? 0) > 0)
        baseNotes.push("It was limited to ".concat(num(row.maxPlaysPerHour), " plays an hour; it now has no limit."));
      const isoDays = (value) => {
        const wanted2 = new Set(text(value).split(",").map((day) => Number(day.trim())));
        return WEEKDAYS.filter((_, index) => wanted2.has(index + 1));
      };
      const priority = Math.min(100, Math.max(0, Math.trunc(num(row.isPriority) ?? 0) * 10));
      for (const part of parts) {
        const partNotes = [...baseNotes];
        if (parts.length > 1)
          partNotes.push("It reached displays in several time zones, so it became one schedule per zone.");
        if (!part.known && !always)
          partNotes.push("No time zone was known, so its times were read as UTC. Check them, or scan again with --timezone.");
        let repeat;
        if (repeating && every !== void 0) {
          const interval = num(row.recurrenceDetail);
          const weekdays = every === "week" ? isoDays(row.recurrenceRepeatsOn) : [];
          repeat = {
            every,
            ...interval !== void 0 && interval > 1 ? { interval: Math.floor(interval) } : {},
            ...weekdays.length > 0 ? { weekdays } : {},
            ...every === "month" && flag(row.recurrenceMonthlyRepeatsOn) ? { nth_weekday: true } : {},
            ...range !== void 0 && range > 0 ? { until: civil(range, part.zone).slice(0, 10) } : {}
          };
        }
        schedules.push({
          id: parts.length > 1 ? "".concat(eventId, "@").concat(part.zone) : eventId,
          name,
          targets: { group_ids: part.groups, screen_ids: part.screens },
          content,
          ...always ? { always: true } : {
            ...fromDt !== void 0 && fromDt > 0 ? { start: civil(fromDt, part.zone) } : {},
            ...toDt !== void 0 && toDt > 0 ? { end: civil(toDt, part.zone) } : {},
            // Only a synced event is read in a zone of its own; the rest read on each display's clock, as campaigns do.
            ...synced ? { timezone: part.zone } : {}
          },
          ...repeat ? { repeat } : {},
          priority,
          notes: partNotes
        });
      }
    }
    return { account: this.options.account, label: this.options.label, media, playlists, layouts, groups, screens, schedules, not_imported: entries, notes };
  }
  async fetchMedia(media, destination) {
    const ref = asRow(media.fetch);
    const id = text(ref.id);
    const type = text(ref.type);
    if (id === "" || type === "")
      throw vendorBadResponse(NAME, "a library file has no download reference");
    return this.call(() => this.client.download("/library/download/".concat(encodeURIComponent(id), "/").concat(encodeURIComponent(type)), destination));
  }
};
var xibo = {
  id: "xibo",
  name: NAME,
  inputs: { url: "required", timezone: true },
  credentials: [
    { name: "XIBO_CLIENT_ID", secret: false, required: true, help: "The Client ID of a Xibo Application that uses the Client Credentials grant (Administration, Applications)." },
    { name: "XIBO_CLIENT_SECRET", secret: true, required: true, help: "The Client Secret of that Application." }
  ],
  connect: [
    "Make a dedicated CMS user that can view the library, layouts, campaigns, displays and schedule. A Client Credentials token acts as the user that owns the Application, so give that user nothing more.",
    "Signed in as that user, open Administration, then Applications, and add an Application. Enable the Client Credentials grant, save, then edit it to read the Client ID and Client Secret. The secret is shown once; reset it if it is lost.",
    "Write XIBO_CLIENT_ID=... and XIBO_CLIENT_SECRET=... as two lines in a file only you can read, and name it with --credentials FILE.",
    "--url is the address you sign in at, including the folder when the CMS is installed in one (https://example.org/xibo). --timezone is the CMS's own time zone, used to read the hours of events that play at the same clock time on every display."
  ],
  maps: [
    "Library images, video and audio become media, downloaded from the CMS.",
    "Library playlists become playlists: image, video and audio widgets by their media and duration, web page widgets by their address.",
    "Published layouts become layouts, each region a zone with its position, size and layer.",
    "A campaign that lists layouts becomes a playlist of those layouts, in order, each repeated for its play count.",
    "Display groups become groups; a display's own group is the display. Displays become waiting screens with their default layout, groups and time zone.",
    "Layout and campaign events become schedules: dates and hours, daily and weekly repeats on chosen days, an end date, and priority."
  ],
  skips: [
    "Overlay, command, interrupt, action, synchronised, data connector, media and playlist events, events with geo-fencing or criteria, repeats by the minute, hour, month or year, ad campaigns, and events that have ended are listed.",
    "Widgets that are not images, video, audio or web pages (text, clock, ticker, RSS, weather, embedded HTML) are listed per item; so are library files of other kinds (fonts, PDFs, packages).",
    "Draft and retired layouts, a layout's background image, transitions, and the day or daypart limits of a layout inside a campaign are not read.",
    "Events that use a daypart come over with the dates and hours they store."
  ],
  docs: [
    "https://docs.xibosignage.com/developer/integrate/authentication",
    "https://docs.xibosignage.com/developer/integrate/openapi",
    "https://docs.xibosignage.com/scheduling/scheduling_repeats",
    "https://raw.githubusercontent.com/xibosignage/xibo-cms/develop/web/swagger.json",
    "https://github.com/xibosignage/xibo-cms/blob/develop/lib/Entity/Schedule.php"
  ],
  example: "screenrig migrate scan --from xibo --url https://cms.example.com --timezone America/Toronto --credentials ./xibo-key.txt",
  async open(input) {
    const address = cmsAddress(input.url);
    const id = input.credentials.XIBO_CLIENT_ID;
    const secret = input.credentials.XIBO_CLIENT_SECRET;
    if (id === void 0 || secret === void 0)
      throw usageError("Xibo needs XIBO_CLIENT_ID and XIBO_CLIENT_SECRET.");
    const client = input.http.client({ base: address.api });
    return new XiboSession(client, { id, secret }, { ...input.timezone !== void 0 ? { timezone: input.timezone } : {}, now: input.now, account: address.account, label: address.label });
  }
};

// dist/migrate/vendors/yodeck.js
var yodeck_exports = {};
__export(yodeck_exports, {
  yodeck: () => yodeck
});
var NAME2 = "Yodeck";
var idOf3 = (row, field, where) => idOf(NAME2, row, field, where);
var BASE = "https://app.yodeck.com/api/v2";
var PAGE2 = 100;
var RATE = { requests: 21, perMs: 1e4 };
var WEEKDAYS2 = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
var MEDIA_KINDS2 = { image: "image", video: "video", audio: "audio" };
var STREAM_NEXT = "Add it to a playlist after the import: a YouTube link goes in an iframe page, an HLS or RTSP address in a stream page.";
var CARD_NEXT = "Rebuild it as a built-in card, or as a web page if it shows one.";
var HTTP = /^https?:\/\//i;
var CIVIL2 = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/;
var ENDED_SLACK_MS = 36 * 36e5;
function tokenOf(raw) {
  const token = (raw ?? "").trim().replace(/^Token\s+/i, "");
  if (!/^[^\s:]+:\S+$/.test(token)) {
    throw usageError("YODECK_API_TOKEN must be the token as label:token, the label being the name you gave the token in Yodeck.");
  }
  return token;
}
var civilOf = (value) => {
  const found = CIVIL2.exec(text(value));
  return found ? "".concat(found[1], "T").concat(found[2], ":").concat(found[3]) : void 0;
};
function plusMinutes(at, minutes2) {
  const moment = new Date("".concat(at, ":00Z"));
  moment.setUTCMinutes(moment.getUTCMinutes() + minutes2);
  return moment.toISOString().slice(0, 16);
}
var priorityOrder = (a, b) => (num(a.row.priority) ?? a.index) - (num(b.row.priority) ?? b.index) || a.index - b.index;
var ordered = (value) => rows(value).map((row, index) => ({ row, index })).sort(priorityOrder).map((entry) => entry.row);
var YodeckSession = class {
  client;
  options;
  constructor(client, options) {
    this.client = client;
    this.options = options;
  }
  /** Every row of a limit/offset listing. The total is the listing's own count, so a server that caps the page is still read to the end. */
  async list(path2, query2 = {}) {
    const all = [];
    const seen = /* @__PURE__ */ new Set();
    for (let offset = 0; ; ) {
      const page = asRow(await this.client.json(path2, { query: { ...query2, limit: PAGE2, offset } }));
      if (!Array.isArray(page.results))
        throw vendorBadResponse(NAME2, "GET ".concat(path2, " has no results list"));
      let added = 0;
      for (const row of page.results.map(asRow)) {
        const id = idOf3(row, "id", "GET ".concat(path2));
        if (seen.has(id))
          continue;
        seen.add(id);
        all.push(row);
        added += 1;
      }
      offset += page.results.length;
      if (page.results.length === 0 || added === 0)
        return all;
      const count = num(page.count);
      if (count !== void 0 ? offset >= count : page.next === null || page.next === void 0)
        return all;
    }
  }
  async scan() {
    const mediaRows = await this.list("/media/");
    const playlistRows = await this.list("/playlists/");
    const layoutRows = await this.list("/layouts/");
    const scheduleRows = await this.list("/schedules/");
    const screenRows = await this.list("/screens/");
    const basicRows = await this.list("/screens/", { subset: "basic" });
    const entries = [];
    const notes = [];
    const media = [];
    const pages = /* @__PURE__ */ new Map();
    const naturalSeconds = /* @__PURE__ */ new Map();
    const audio = /* @__PURE__ */ new Set();
    const mediaNames = /* @__PURE__ */ new Map();
    const availability = [];
    for (const row of mediaRows) {
      const id = idOf3(row, "id", "GET /media/");
      const origin = asRow(row.media_origin);
      const type = text(origin.type).toLowerCase();
      const source = text(origin.source).toLowerCase();
      const args = asRow(row.arguments);
      const name = text(row.name) || "Media ".concat(id);
      mediaNames.set(id, name);
      if (flag(asRow(row.availability_schedule).enable))
        availability.push(name);
      const refuse = (reason, next) => {
        entries.push({ kind: "media", source_id: id, name, reason, ...next ? { next } : {} });
      };
      if (type === "webpage") {
        const url = text(args.play_from_url);
        if (HTTP.test(url))
          pages.set(id, { url, title: name });
        else
          refuse("A web page with no http or https address.");
        continue;
      }
      if (type === "app") {
        refuse("Apps (clocks, weather, RSS and other widgets) are not media files.", CARD_NEXT);
        continue;
      }
      if (type === "document") {
        refuse("Documents (PDF, Word, Excel, PowerPoint) are not images, video or audio.", "Export its pages as images, or a deck as a video, and add them with media upload-batch.");
        continue;
      }
      const kind = MEDIA_KINDS2[type];
      if (!kind) {
        refuse("A ".concat(type || "unknown", " item is not an image, video or audio file."));
        continue;
      }
      const status = text(row.status);
      if (status !== "" && status !== "finished") {
        refuse("Yodeck has not finished processing it.", "Wait for Yodeck to finish it, then scan again.");
        continue;
      }
      if (source === "stream" || source === "usb_stream") {
        refuse("It is a live stream or a capture input, not a file.", STREAM_NEXT);
        continue;
      }
      const download = text(args.download_from_url);
      const play = text(args.play_from_url);
      let fetch;
      let original = true;
      if (HTTP.test(download)) {
        fetch = { url: download };
      } else if (kind === "video" && source === "local" && HTTP.test(play)) {
        fetch = { url: play };
        original = false;
      } else if (source === "url" && play !== "") {
        refuse("It is a hosted video or audio link (YouTube, Vimeo), not a file.", STREAM_NEXT);
        continue;
      }
      const seconds = num(args.duration);
      if (kind === "video" && seconds !== void 0 && seconds > 0)
        naturalSeconds.set(id, seconds);
      if (kind === "audio")
        audio.add(id);
      const extension = text(row.file_extension).replace(/^\./, "");
      const named = extension !== "" && !name.toLowerCase().endsWith(".".concat(extension.toLowerCase())) ? "".concat(name, ".").concat(extension) : name;
      media.push({ id, name, filename: named.replace(/[\\/]/g, "_"), kind, ...fetch ? { fetch } : {}, original });
    }
    if (availability.length > 0) {
      const shown = availability.slice(0, 3).join(", ");
      notes.push("".concat(availability.length, " media ").concat(availability.length === 1 ? "has" : "have", " availability dates or hours in Yodeck (").concat(shown).concat(availability.length > 3 ? ", and more" : "", "); they now play whenever their playlist does."));
    }
    const mediaItem = (id, seconds) => {
      const page = pages.get(id);
      const wanted2 = seconds !== void 0 && seconds > 0 && !audio.has(id) ? seconds : void 0;
      if (page)
        return { url: page.url, title: page.title, ...wanted2 !== void 0 ? { duration_s: wanted2 } : {} };
      const natural = naturalSeconds.get(id);
      const explicit = wanted2 !== void 0 && !(natural !== void 0 && Math.abs(wanted2 - natural) <= 1) ? wanted2 : void 0;
      return { media_id: id, ...explicit !== void 0 ? { duration_s: explicit } : {} };
    };
    const synthetic = /* @__PURE__ */ new Map();
    const mediaPlaylist = (id) => {
      const key = "media:".concat(id);
      if (!synthetic.has(key))
        synthetic.set(key, { id: key, name: mediaNames.get(id) ?? "Media ".concat(id), items: [mediaItem(id, void 0)], notes: [] });
      return key;
    };
    const contentOf = (source) => {
      const type = text(source.source_type);
      const id = text(source.source_id);
      if (id === "")
        return void 0;
      if (type === "playlist")
        return { playlist_id: id };
      if (type === "layout")
        return { layout_id: id };
      if (type === "media")
        return { playlist_id: mediaPlaylist(id) };
      return void 0;
    };
    const playlists = [];
    for (const row of playlistRows) {
      const id = idOf3(row, "id", "GET /playlists/");
      const playlistNotes = /* @__PURE__ */ new Set();
      const items = [];
      for (const item of ordered(row.items)) {
        const type = text(item.type);
        const itemId = text(item.id);
        if (type === "media" && itemId !== "") {
          items.push(mediaItem(itemId, num(item.duration)));
        } else if (type === "layout" && itemId !== "") {
          items.push({ layout_id: itemId });
        } else if (type === "subplaylist" && itemId !== "") {
          items.push({ playlist_id: itemId });
          if ((num(item.max_items) ?? 0) > 0 || (num(item.max_time) ?? 0) > 0) {
            playlistNotes.add("Its sub-playlist ".concat(text(item.name) || itemId, " was limited to a number of items or a time; it now plays in full."));
          }
        } else {
          playlistNotes.add("An item of type ".concat(/^[A-Za-z0-9_-]{1,30}$/.test(type) ? type : "unknown", " was left out."));
        }
      }
      playlists.push({ id, name: text(row.name) || "Playlist ".concat(id), items, ...flag(asRow(row.playback_options).random_playback) ? { shuffle: true } : {}, notes: [...playlistNotes] });
    }
    const layouts = [];
    for (const row of layoutRows) {
      const id = idOf3(row, "id", "GET /layouts/");
      const layoutNotes = /* @__PURE__ */ new Set();
      const zones = [];
      let position = 0;
      for (const region of rows(row.regions).sort((a, b) => (num(a.order) ?? 0) - (num(b.order) ?? 0))) {
        if (flag(region.hidden))
          continue;
        position += 1;
        const regionId = text(region.id) || String(position);
        const where = "layout ".concat(id, " zone ").concat(regionId);
        const item = asRow(region.item);
        const type = text(item.type);
        const itemId = text(item.id);
        const entry = (reason) => {
          entries.push({ kind: "item", source_id: where, name: "Zone ".concat(position), reason, next: CARD_NEXT });
        };
        const seconds = num(region.duration);
        const items = [];
        if (type === "playlist" && itemId !== "")
          items.push({ playlist_id: itemId });
        else if (/^(image|video|audio|pdf|url)$/.test(type) && itemId !== "")
          items.push(mediaItem(itemId, seconds));
        else if (type === "widget")
          entry("Apps (clocks, weather, RSS and other widgets) are not media files.");
        else if (type === "integration")
          entry("Integrations with other services are not media files.");
        else if (type === "" && Object.keys(asRow(region.content_data)).length > 0)
          entry("Text and clipart zones are not media files.");
        if ((num(region.rotation) ?? 0) !== 0)
          layoutNotes.add("A rotated zone comes over unrotated.");
        zones.push({
          id: regionId,
          name: "Zone ".concat(position),
          x: num(region.left) ?? 0,
          y: num(region.top) ?? 0,
          width: num(region.width) ?? 0,
          height: num(region.height) ?? 0,
          z: num(region.zindex) ?? 0,
          items
        });
      }
      if (row.background_audio !== null && row.background_audio !== void 0 && Object.keys(asRow(row.background_audio)).length > 0)
        layoutNotes.add("Its background audio does not come over.");
      const width = num(row.resolution_width);
      const height = num(row.resolution_height);
      layouts.push({ id, name: text(row.name) || "Layout ".concat(id), ...width !== void 0 && width > 0 ? { width } : {}, ...height !== void 0 && height > 0 ? { height } : {}, zones, notes: [...layoutNotes] });
    }
    const scheduleById = new Map(scheduleRows.map((row) => [idOf3(row, "id", "GET /schedules/"), row]));
    const screensOfSchedule = /* @__PURE__ */ new Map();
    const merged = /* @__PURE__ */ new Map();
    for (const row of screenRows)
      merged.set(idOf3(row, "id", "GET /screens/"), row);
    for (const row of basicRows) {
      const id = idOf3(row, "id", "GET /screens/?subset=basic");
      merged.set(id, { ...merged.get(id), ...row });
    }
    const groups = /* @__PURE__ */ new Map();
    const screens = [];
    for (const [id, row] of merged) {
      const basic = asRow(row.basic);
      const screenNotes = [];
      const groupIds = [];
      for (const tag of Array.isArray(basic.tags) ? basic.tags.map(text).filter((name) => name !== "") : []) {
        const groupId = "tag:".concat(tag.toLowerCase());
        if (!groups.has(groupId))
          groups.set(groupId, { id: groupId, name: tag });
        if (!groupIds.includes(groupId))
          groupIds.push(groupId);
      }
      const area = text(basic.time_zone);
      const place = text(basic.time_subzone);
      const timezone = area === "" ? void 0 : zoneOf(place !== "" ? "".concat(area, "/").concat(place) : area);
      if (area !== "" && timezone === void 0)
        screenNotes.push("Its time zone ".concat(area).concat(place !== "" ? "/".concat(place) : "", " is not one this CLI knows, so none is set."));
      const shown = asRow(row.screen_content);
      const shownType = text(shown.source_type);
      let content;
      if (shownType === "schedule") {
        const scheduleId = text(shown.source_id);
        screensOfSchedule.set(scheduleId, [...screensOfSchedule.get(scheduleId) ?? [], id]);
        const filler = asRow(scheduleById.get(scheduleId)?.filler_content);
        content = contentOf(filler);
        if (content === void 0 && text(filler.source_type) === "turned_off")
          screenNotes.push("Its schedule turns the screen off between events; set a default playlist after pairing.");
      } else if (shownType === "turned_off") {
        screenNotes.push("It was turned off in Yodeck, so it has no default content.");
      } else {
        content = contentOf(shown);
      }
      screens.push({ id, name: text(row.name) || "Screen ".concat(id), group_ids: groupIds, ...content ? { content } : {}, ...timezone ? { timezone } : {}, notes: screenNotes });
    }
    const schedules = [];
    const nowMs = this.options.now().getTime();
    for (const [scheduleId, row] of scheduleById) {
      const scheduleName = text(row.name) || "Schedule ".concat(scheduleId);
      const targets = screensOfSchedule.get(scheduleId) ?? [];
      if (targets.length === 0) {
        entries.push({ kind: "schedule", source_id: scheduleId, name: scheduleName, reason: "No screen shows it, so there is nothing to aim it at." });
        continue;
      }
      const events = rows(row.events);
      for (const event of events) {
        const eventId = "".concat(scheduleId, ":").concat(idOf3(event, "id", "GET /schedules/"));
        const source = asRow(event.source);
        const sourceName = text(source.source_name);
        const name = events.length > 1 && sourceName !== "" ? "".concat(scheduleName, ": ").concat(sourceName) : scheduleName;
        const refuse = (reason, next) => {
          entries.push({ kind: "schedule", source_id: eventId, name, reason, ...next ? { next } : {} });
        };
        if (text(source.source_type) === "turned_off") {
          refuse("It turns the screen off, and campaigns show content.", "After pairing, set when the display is on with screen display-schedule.");
          continue;
        }
        const content = contentOf(source);
        if (content === void 0) {
          refuse("It shows something other than a playlist, a layout or a media item.");
          continue;
        }
        const start = civilOf(event.start);
        if (start === void 0) {
          refuse("Its start time could not be read.");
          continue;
        }
        const minutes2 = num(event.duration);
        const end = minutes2 !== void 0 && minutes2 > 0 ? plusMinutes(start, minutes2) : void 0;
        const kind = text(event.recurrence) || "o";
        const bits = /^[01]{7}$/.test(text(event.days_of_week)) ? text(event.days_of_week) : "";
        const weekdays = WEEKDAYS2.filter((_, index) => bits[index] === "1");
        let repeat;
        if (kind !== "o") {
          const interval = num(event.every);
          const occurrences = num(event.occurrences);
          const last = /^(\d{4}-\d{2}-\d{2})/.exec(text(event.end))?.[1];
          const every = kind === "d" ? weekdays.length > 0 ? "week" : "day" : kind === "w" ? "week" : kind === "m" ? "month" : kind === "y" ? "year" : void 0;
          if (every === void 0) {
            refuse("Its repeat is not one Yodeck documents.");
            continue;
          }
          repeat = {
            every,
            ...interval !== void 0 && interval > 1 ? { interval: Math.floor(interval) } : {},
            ...every === "week" && weekdays.length > 0 ? { weekdays } : {},
            ...last !== void 0 ? { until: last } : {},
            ...occurrences !== void 0 && occurrences > 0 ? { count: Math.floor(occurrences) } : {}
          };
        }
        const finished = repeat === void 0 ? end : repeat.until !== void 0 ? "".concat(repeat.until, "T23:59") : void 0;
        if (finished !== void 0 && Date.parse("".concat(finished, ":00Z")) + ENDED_SLACK_MS < nowMs) {
          refuse("It has already ended.");
          continue;
        }
        schedules.push({
          id: eventId,
          name,
          targets: { group_ids: [], screen_ids: targets },
          content,
          start,
          ...end ? { end } : {},
          ...repeat ? { repeat } : {},
          priority: Math.min(100, Math.max(0, Math.trunc(num(event.priority) ?? 0))),
          notes: []
        });
      }
    }
    const workspaces = [mediaRows, playlistRows, layoutRows, scheduleRows, screenRows, basicRows].flat().map((row) => num(asRow(row.workspace).id)).filter((id) => id !== void 0);
    const account = workspaces.length > 0 ? "yodeck:".concat(Math.min(...workspaces)) : "yodeck";
    return {
      account,
      label: "Yodeck",
      media,
      playlists: [...playlists, ...synthetic.values()],
      layouts,
      groups: [...groups.values()],
      screens,
      schedules,
      not_imported: entries,
      notes
    };
  }
  async fetchMedia(media, destination) {
    const url = text(asRow(media.fetch).url);
    if (!HTTP.test(url))
      throw vendorBadResponse(NAME2, "a media file has no download address");
    return this.client.download(url, destination);
  }
};
var yodeck = {
  id: "yodeck",
  name: NAME2,
  inputs: { timezone: true, files: "optional" },
  credentials: [
    { name: "YODECK_API_TOKEN", secret: true, required: true, help: "A Yodeck API token as label:token, the label being the name you gave the token." }
  ],
  connect: [
    "Yodeck's API is available on the Premium and Enterprise plans.",
    "Open Account, then Account Settings, then Advanced Settings, then API Tokens, and choose Generate Token. Name it, and give it a role that can view media, playlists, layouts, schedules and screens: the token acts as a user with that role.",
    "Copy the token when it is shown; it cannot be shown again. It reads label:token. Write YODECK_API_TOKEN=label:token as a line in a file only you can read, and name it with --credentials FILE.",
    "Yodeck's API does not hand out files you uploaded. Download those originals from Yodeck into one folder (or a .zip) and name it with --files; the playlists, layouts, schedules and screens still come from the API.",
    "--timezone is used for screens that have no time zone in Yodeck."
  ],
  maps: [
    "Images, video and audio become media. Ones Yodeck imported from a web address are downloaded from it; a video Yodeck holds only as its playable copy comes from that copy, marked lossy, unless the original is in --files; the rest are matched by file name in --files.",
    "Web page media become web page items.",
    "Playlists become playlists, with sub-playlists inlined. Layouts become layouts, each region a zone with its position, size and layer.",
    "Screen tags become groups. Screens become waiting screens with their default content and time zone.",
    "The schedule a screen shows becomes one campaign per event for that screen: dates and hours, daily and weekly repeats on chosen days, an end date, a count, and priority. The schedule's filler content becomes the screen's default."
  ],
  skips: [
    "Uploaded images, audio and documents are never replaced by thumbnails: without the original in --files they are listed.",
    "Apps, integrations, text and clipart zones, documents, live streams and capture inputs are listed.",
    "Events that turn the screen off (next: screen display-schedule), events that repeat monthly or yearly, events that have ended and schedules no screen shows are listed.",
    "Random play order, playlist transitions, a media's availability dates and hours and a sub-playlist's limits do not carry over; tag-based playlists, emergency alerts, takeovers and working hours are not read."
  ],
  docs: [
    "https://app.yodeck.com/api-docs/",
    "https://app.yodeck.com/api-docs/bundle.yaml",
    "https://www.yodeck.com/academy/api-token/"
  ],
  example: "screenrig migrate scan --from yodeck --files ./yodeck-downloads --timezone America/Toronto --credentials ./yodeck-key.txt",
  async open(input) {
    const token = tokenOf(input.credentials.YODECK_API_TOKEN);
    const client = input.http.client({ base: BASE, auth: { Authorization: "Token ".concat(token) }, rate: RATE });
    return new YodeckSession(client, { now: input.now });
  }
};

// dist/migrate/vendors/anthias.js
var anthias_exports = {};
__export(anthias_exports, {
  anthias: () => anthias
});
import { createReadStream as createReadStream2 } from "node:fs";
import { open as open4, rm as rm3 } from "node:fs/promises";
var NAME3 = "Anthias";
var DAY_NAMES2 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
var HEAD_LIMIT = 1 << 20;
var CONTENT_KEY = /"content"\s*:\s*"/;
function validZone2(zone) {
  if (!zone)
    return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}
function joined(words) {
  return words.length <= 1 ? words[0] ?? "" : "".concat(words.slice(0, -1).join(", "), " and ").concat(words[words.length - 1]);
}
function clock2(value) {
  const match = /^(\d{1,2}):(\d{2})/.exec(value ?? "");
  return match ? "".concat(match[1].padStart(2, "0"), ":").concat(match[2]) : void 0;
}
function deviceBase(url) {
  const base = (url ?? "").trim().replace(/\/+$/, "").replace(/\/api(\/v2)?$/i, "");
  try {
    const parsed = new URL(base);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      throw new Error("scheme");
  } catch {
    throw usageError("--url must be the address of the Anthias device, such as http://192.168.1.50.", {
      command: "screenrig migrate vendors anthias",
      reason: "Shows what Anthias takes and how to read it."
    });
  }
  return base;
}
function nameOf(asset) {
  return (asset.name ?? "").trim() || "Asset ".concat(asset.asset_id.slice(0, 8));
}
async function decodeEnvelope(envelope, destination) {
  const out = await open4(destination, "wx", 384);
  let bytes = 0;
  try {
    let phase = "head";
    let head = "";
    let pending = "";
    let closed = false;
    for await (const chunk of createReadStream2(envelope, { highWaterMark: 1 << 20 })) {
      let piece = chunk.toString("latin1");
      if (phase === "head") {
        head += piece;
        const found = CONTENT_KEY.exec(head);
        if (!found) {
          if (head.length > HEAD_LIMIT)
            throw vendorBadResponse(NAME3, "an asset's content answer has no content field");
          continue;
        }
        const kind = /"type"\s*:\s*"([^"\\]*)"/.exec(head.slice(0, found.index))?.[1];
        if (kind !== "file")
          throw vendorBadResponse(NAME3, "an asset's content answer is not a file");
        piece = head.slice(found.index + found[0].length);
        phase = "body";
        head = "";
      }
      const end = piece.indexOf('"');
      const data = pending + (end < 0 ? piece : piece.slice(0, end));
      const usable = end < 0 ? data.length - data.length % 4 : data.length;
      const decoded = Buffer.from(data.slice(0, usable), "base64");
      if (decoded.length > 0) {
        await out.write(decoded);
        bytes += decoded.length;
      }
      pending = data.slice(usable);
      if (end >= 0) {
        closed = true;
        break;
      }
    }
    if (!closed || pending.length > 0) {
      throw vendorBadResponse(NAME3, phase === "head" ? "an asset's content answer holds no file" : "an asset's content answer ended before its file did");
    }
    return bytes;
  } catch (error) {
    await rm3(destination, { force: true });
    throw error;
  } finally {
    await out.close().catch(() => void 0);
  }
}
var AnthiasSession = class {
  client;
  base;
  hasCredentials;
  now;
  constructor(client, base, hasCredentials, now) {
    this.client = client;
    this.base = base;
    this.hasCredentials = hasCredentials;
    this.now = now;
  }
  async list(path2) {
    try {
      return await this.client.json(path2);
    } catch (error) {
      if (!this.hasCredentials && error instanceof CliError && error.problem.code === "vendor_bad_response") {
        throw vendorRefused(NAME3, 302, ["ANTHIAS_USERNAME", "ANTHIAS_PASSWORD"]);
      }
      throw error;
    }
  }
  async scan() {
    const assets = await this.list("/api/v2/assets");
    if (!Array.isArray(assets))
      throw vendorBadResponse(NAME3, "the asset list is not an array");
    const settings = await this.client.json("/api/v2/device_settings") ?? {};
    const host = new URL(this.base).host;
    const device = (settings.player_name ?? "").trim() || host;
    const now = this.now().getTime();
    const defaultSeconds = typeof settings.default_duration === "number" && settings.default_duration > 0 ? settings.default_duration : void 0;
    const rows2 = assets.map((row, index) => {
      if (!row || typeof row !== "object" || typeof row.asset_id !== "string" || row.asset_id === "") {
        throw vendorBadResponse(NAME3, "assets[".concat(index, "].asset_id is missing"));
      }
      return row;
    });
    rows2.sort((a, b) => (a.play_order ?? 0) - (b.play_order ?? 0) || (a.asset_id < b.asset_id ? -1 : a.asset_id > b.asset_id ? 1 : 0));
    const media = [];
    const items = [];
    const notes = [];
    const notImported = [];
    let endDates = 0;
    const skip = (kind, asset, reason, next) => {
      notImported.push({ kind, source_id: asset.asset_id, name: nameOf(asset), reason, ...next ? { next } : {} });
    };
    for (const asset of rows2) {
      const name = nameOf(asset);
      const type = (asset.mimetype ?? "").toLowerCase();
      const web = type.includes("web");
      const stream = type.startsWith("stream");
      const kind = type.startsWith("image") ? "image" : type.startsWith("video") ? "video" : void 0;
      if (asset.is_enabled !== true) {
        skip(web || stream ? "item" : "media", asset, "It is switched off on the device.");
        continue;
      }
      const end = asset.end_date ? Date.parse(asset.end_date) : NaN;
      if (Number.isFinite(end) && end < now) {
        skip(web || stream ? "item" : "media", asset, "It has passed its end date.");
        continue;
      }
      const uri = (asset.uri ?? "").trim();
      const seconds = typeof asset.duration === "number" && asset.duration > 0 ? asset.duration : defaultSeconds;
      let item;
      if (stream) {
        skip("item", asset, "It is a live stream.", "Add the stream address as a stream page in a playlist.");
      } else if (web) {
        if (/^https?:\/\//i.test(uri))
          item = { url: uri, title: name, ...seconds !== void 0 ? { duration_s: seconds } : {} };
        else
          skip("item", asset, "Its address is not an http or https address.");
      } else if (kind === void 0) {
        skip("media", asset, "Its type is not image, video, webpage or streaming.");
      } else if (asset.is_processing === true) {
        skip("media", asset, "The device is still processing it.", "Run the same command again when the device has finished.");
      } else if (!uri.startsWith("/")) {
        skip("media", asset, "It plays from a web address, not from a file on the device.", "Upload the file with media upload, or add the address as a web page in a playlist.");
      } else {
        media.push({ id: asset.asset_id, name, filename: uri.split("/").pop() || name, kind, fetch: { asset: asset.asset_id }, original: true });
        item = { media_id: asset.asset_id, ...kind === "image" && seconds !== void 0 ? { duration_s: seconds } : {} };
      }
      if (!item)
        continue;
      items.push(item);
      const start = asset.start_date ? Date.parse(asset.start_date) : NaN;
      if (Number.isFinite(start) && start > now)
        notes.push("".concat(name, " was set to start on ").concat(new Date(start).toISOString().slice(0, 10), "; it now plays at once."));
      if (Number.isFinite(end))
        endDates += 1;
      const days = Array.isArray(asset.play_days) ? [...new Set(asset.play_days)].filter((day) => day >= 1 && day <= 7).sort((a, b) => a - b) : [];
      if (days.length > 0 && days.length < 7)
        notes.push("".concat(name, " played only on ").concat(joined(days.map((day) => DAY_NAMES2[day - 1])), "; it now plays every day."));
      const from = clock2(asset.play_time_from);
      const to = clock2(asset.play_time_to);
      if (from !== void 0 && to !== void 0)
        notes.push("".concat(name, " played only from ").concat(from, " to ").concat(to, "; it now plays all day."));
    }
    if (endDates > 0)
      notes.push("".concat(endDates, " item").concat(endDates === 1 ? " had" : "s had", " an end date; ").concat(endDates === 1 ? "it now stays" : "they now stay", " in the playlist until you remove ").concat(endDates === 1 ? "it" : "them", "."));
    const timezone = validZone2(settings.timezone) ? settings.timezone : void 0;
    return {
      account: this.base.toLowerCase(),
      label: host,
      media,
      playlists: [{ id: "loop", name: "".concat(device, " loop"), items, ...settings.shuffle_playlist === true ? { shuffle: true } : {}, notes }],
      layouts: [],
      groups: [],
      screens: [{ id: "device", name: device, group_ids: [], content: { playlist_id: "loop" }, ...timezone ? { timezone } : {}, notes: [] }],
      schedules: [],
      not_imported: notImported,
      notes: []
    };
  }
  async fetchMedia(media, destination) {
    const id = media.fetch?.asset;
    if (!id)
      throw vendorBadResponse(NAME3, "a media entry has no asset id");
    const envelope = "".concat(destination, ".json");
    try {
      await this.client.download("/api/v2/assets/".concat(encodeURIComponent(id), "/content"), envelope);
      return { bytes: await decodeEnvelope(envelope, destination) };
    } finally {
      await rm3(envelope, { force: true });
    }
  }
};
var anthias = {
  id: "anthias",
  name: NAME3,
  inputs: { url: "required" },
  credentials: [
    { name: "ANTHIAS_USERNAME", secret: false, required: false, help: "The device's operator name, only when authentication is on." },
    { name: "ANTHIAS_PASSWORD", secret: true, required: false, help: "The device's operator password, only when authentication is on." }
  ],
  connect: [
    "Use the device's address, such as http://192.168.1.50 (the same address you open in a browser).",
    "A new Anthias install has authentication off: no username or password is needed.",
    "With authentication on, put the operator ANTHIAS_USERNAME and ANTHIAS_PASSWORD in a file and name it with --credentials. Both go to that device only."
  ],
  maps: [
    "The enabled loop, in play order, becomes one playlist; image and video files become media, web pages become web page items, and the shuffle setting is kept as a note.",
    "The device becomes one waiting screen named after its player name, with its time zone and the loop as its content."
  ],
  skips: [
    "Switched-off and expired assets, live streams, assets that play from a remote file address, and assets still processing are listed.",
    "An asset's start date, weekdays and daily hours come over as plays-always, and each is listed.",
    "The backup archive is not read: the API lists the same content."
  ],
  docs: [
    "https://github.com/Screenly/Anthias/blob/master/website/content/agents.md",
    "https://github.com/Screenly/Anthias/blob/master/website/data/openapi.json"
  ],
  example: "screenrig migrate scan --from anthias --url http://192.168.1.50",
  async open(input) {
    const base = deviceBase(input.url);
    const user = input.credentials.ANTHIAS_USERNAME;
    const password = input.credentials.ANTHIAS_PASSWORD;
    if (user === void 0 !== (password === void 0)) {
      throw usageError("Anthias needs both ANTHIAS_USERNAME and ANTHIAS_PASSWORD, or neither.", {
        command: "screenrig migrate vendors anthias",
        reason: "Shows what Anthias takes and where each value goes."
      });
    }
    const client = input.http.client({
      base,
      ...user !== void 0 && password !== void 0 ? { auth: { Authorization: "Basic ".concat(Buffer.from("".concat(user, ":").concat(password)).toString("base64")) } } : {}
    });
    return new AnthiasSession(client, base, user !== void 0, input.now);
  }
};

// dist/migrate/vendors/optisigns.js
var optisigns_exports = {};
__export(optisigns_exports, {
  civil: () => civil2,
  optisigns: () => optisigns,
  parseRule: () => parseRule
});
var NAME4 = "OptiSigns";
var ENDPOINT = "https://graphql-gateway.optisigns.com/graphql";
var PAGE3 = 100;
var WEEKDAYS3 = { MO: "mon", TU: "tue", WE: "wed", TH: "thu", FR: "fri", SA: "sat", SU: "sun" };
var NO_DOWNLOAD = "Download your files from OptiSigns into one folder and rerun migrate scan with --files DIR.";
var APP_NEXT = "Rebuild it as a built-in card, an iframe page or a stream page in a playlist.";
function validZone3(zone) {
  if (!zone)
    return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}
var isHttp = (value) => typeof value === "string" && /^https?:\/\//i.test(value.trim());
function civil2(instant, zone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(instant).map((part) => [part.type, part.value]));
  return "".concat(parts.year, "-").concat(parts.month, "-").concat(parts.day, "T").concat(parts.hour, ":").concat(parts.minute);
}
var FREQUENCY = { DAILY: "day", WEEKLY: "week", MONTHLY: "month", YEARLY: "year", HOURLY: "hour", MINUTELY: "minute" };
function parseRule(text2, zone) {
  let rule;
  for (const line of (text2 ?? "").split(/\r?\n/).map((part) => part.trim()).filter(Boolean)) {
    const upper = line.toUpperCase();
    if (upper.startsWith("DTSTART"))
      continue;
    if (/^(EXDATE|RDATE|EXRULE)/.test(upper))
      return { ok: false, reason: "It skips or adds single dates, which campaigns cannot express." };
    rule = line.replace(/^RRULE:/i, "");
  }
  if (rule === void 0 || rule === "")
    return { ok: true };
  const parts = /* @__PURE__ */ new Map();
  for (const part of rule.split(";")) {
    const cut = part.indexOf("=");
    if (cut > 0)
      parts.set(part.slice(0, cut).trim().toUpperCase(), part.slice(cut + 1).trim());
  }
  for (const key of parts.keys()) {
    if (!["FREQ", "INTERVAL", "COUNT", "UNTIL", "BYDAY", "WKST"].includes(key))
      return { ok: false, reason: "It repeats by ".concat(key, ", which campaigns cannot express: they repeat on days of the week.") };
  }
  const every = FREQUENCY[(parts.get("FREQ") ?? "").toUpperCase()];
  if (!every)
    return { ok: false, reason: "Its repeat rule has no frequency campaigns can express." };
  const repeat = { every };
  const interval = parts.get("INTERVAL");
  if (interval !== void 0) {
    if (!/^[1-9]\d*$/.test(interval))
      return { ok: false, reason: "Its repeat interval could not be read." };
    repeat.interval = Number(interval);
  }
  const count = parts.get("COUNT");
  if (count !== void 0) {
    if (!/^[1-9]\d*$/.test(count))
      return { ok: false, reason: "Its repeat count could not be read." };
    repeat.count = Number(count);
  }
  const byDay = parts.get("BYDAY");
  if (byDay !== void 0) {
    const weekdays = [];
    for (const token of byDay.split(",")) {
      const match = /^([+-]?\d{1,2})?(MO|TU|WE|TH|FR|SA|SU)$/i.exec(token.trim());
      if (!match)
        return { ok: false, reason: "Its weekdays could not be read." };
      if (match[1] !== void 0)
        repeat.nth_weekday = true;
      weekdays.push(WEEKDAYS3[match[2].toUpperCase()]);
    }
    repeat.weekdays = weekdays;
  }
  const until = parts.get("UNTIL");
  if (until !== void 0) {
    const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(until);
    if (!match)
      return { ok: false, reason: "The date its repeat ends on could not be read." };
    const day = "".concat(match[1], "-").concat(match[2], "-").concat(match[3]);
    repeat.until = match[7] ? civil2(new Date("".concat(day, "T").concat(match[4], ":").concat(match[5], ":").concat(match[6], "Z")), zone).slice(0, 10) : day;
  }
  if (repeat.count === 1)
    return { ok: true };
  return { ok: true, repeat };
}
var OptiSignsSession = class {
  client;
  files;
  timezone;
  constructor(client, files2, timezone) {
    this.client = client;
    this.files = files2;
    this.timezone = timezone;
  }
  all(field, args, node, extra = {}) {
    const text2 = "query($first:Int,$after:String".concat(extra.declare ?? "", "){ ").concat(field, "(").concat(args, "first:$first, after:$after){ page{ edges{ cursor node{ ").concat(node, " } } pageInfo{ hasNextPage endCursor } } } }");
    return cursorPages(this.client, text2, (data) => {
      const page = data[field]?.page;
      if (!page || !Array.isArray(page.edges) || !page.pageInfo)
        throw vendorBadResponse(NAME4, "".concat(field, ".page.edges or ").concat(field, ".page.pageInfo is missing"));
      return {
        items: page.edges.map((edge, index) => {
          if (!edge?.node)
            throw vendorBadResponse(NAME4, "".concat(field, ".page.edges[").concat(index, "].node is missing"));
          return edge.node;
        }),
        hasNextPage: page.pageInfo.hasNextPage === true,
        endCursor: page.pageInfo.endCursor ?? null
      };
    }, { first: PAGE3, ...extra.variables ?? {} });
  }
  async scan() {
    const devices = await this.all("devices", "query:{}, ", "_id accountId deviceName name tags currentType currentAssetId currentPlaylistId currentScheduleId");
    const assets = await this.all("assets", "query:{}, ", "_id accountId name filename originalFileName fileType type appType webLink AWSS3ID screenZones{ id }");
    const playlists = await this.all("playlists", "query:{}, ", "_id accountId name options{ shuffle backgroundAudio backgroundAudioName } assets{ _id filename fileType type appType webLink duration srcDuration AWSS3ID }");
    const schedules = await this.all("schedules", "query:{}, ", "_id accountId name defaultAssetId");
    for (const [path2, rows2] of [["devices", devices], ["assets", assets], ["playlists", playlists], ["schedules", schedules]]) {
      rows2.forEach((row, index) => {
        if (typeof row._id !== "string" || row._id === "")
          throw vendorBadResponse(NAME4, "".concat(path2, ".page.edges[").concat(index, "].node._id is missing"));
      });
    }
    const notImported = [];
    const notes = [];
    const media = [];
    const mediaKinds = /* @__PURE__ */ new Map();
    const webPages = /* @__PURE__ */ new Map();
    const assetName = /* @__PURE__ */ new Map();
    const byStorage = /* @__PURE__ */ new Map();
    const byName = /* @__PURE__ */ new Map();
    for (const asset of assets) {
      const candidates = [...new Set([asset.originalFileName, asset.filename].map((value) => (value ?? "").trim()).filter(Boolean))];
      const name = (asset.name ?? "").trim() || candidates[0] || "Asset ".concat(asset._id.slice(0, 8));
      assetName.set(asset._id, name);
      const skip = (reason, next) => {
        notImported.push({ kind: "media", source_id: asset._id, name, reason, ...next ? { next } : {} });
      };
      if (asset.screenZones) {
        skip("It is a multi-zone screen layout, which the OptiSigns API does not describe fully enough to rebuild.", "Rebuild it as a layout playlist.");
        continue;
      }
      const kind = fileKind(asset.fileType, candidates[0]);
      if (kind && candidates.length > 0) {
        const filename = candidates.find((candidate) => (this.files?.match(candidate) ?? []).length > 0) ?? candidates[0];
        media.push({ id: asset._id, name, filename, kind, original: true });
        mediaKinds.set(asset._id, kind);
        if (asset.AWSS3ID)
          byStorage.set(asset.AWSS3ID, asset._id);
        for (const candidate of candidates)
          byName.set(candidate.toLowerCase(), [...byName.get(candidate.toLowerCase()) ?? [], asset._id]);
      } else if (isHttp(asset.webLink)) {
        webPages.set(asset._id, { url: asset.webLink.trim(), title: name });
      } else if ((asset.fileType ?? "").toLowerCase() === "document") {
        skip("It is a document, not an image, video or audio file.", "Export its pages as images and upload them with media upload.");
      } else {
        notImported.push({ kind: "item", source_id: asset._id, name, reason: "It is an OptiSigns app with no web address in the API.", next: APP_NEXT });
      }
    }
    let sawDuration = false;
    const catalogPlaylists = playlists.map((playlist) => {
      const name = (playlist.name ?? "").trim() || "Playlist ".concat(playlist._id.slice(0, 8));
      const items = [];
      (playlist.assets ?? []).forEach((item, index) => {
        const label = (item.filename ?? "").trim() || (item.appType ?? "").trim() || "item";
        const skip = (reason, next) => {
          notImported.push({ kind: "item", source_id: "".concat(playlist._id, ":").concat(item._id ?? index), name: "".concat(name, ": ").concat(label), reason, ...next ? { next } : {} });
        };
        const kind = fileKind(item.fileType, item.filename ?? void 0);
        const seconds = typeof item.duration === "number" && item.duration > 0 ? item.duration : void 0;
        if (kind && (item.filename ?? "") !== "") {
          const named = byName.get(item.filename.trim().toLowerCase()) ?? [];
          let id = (item.AWSS3ID ? byStorage.get(item.AWSS3ID) : void 0) ?? named[0];
          if (id === void 0) {
            id = "item:".concat(item.filename.trim().toLowerCase());
            const filename = item.filename.trim();
            media.push({ id, name: filename.replace(/\.[A-Za-z0-9]{1,8}$/, "") || filename, filename, kind, original: true });
            mediaKinds.set(id, kind);
            byName.set(filename.toLowerCase(), [id]);
          }
          const own = kind === "audio" ? void 0 : kind === "video" ? seconds !== void 0 && (typeof item.srcDuration !== "number" || Math.abs(seconds - item.srcDuration) > 0.5) ? seconds : void 0 : seconds;
          if (own !== void 0)
            sawDuration = true;
          items.push({ media_id: id, ...own !== void 0 ? { duration_s: own } : {} });
        } else if (isHttp(item.webLink)) {
          if (seconds !== void 0)
            sawDuration = true;
          items.push({ url: item.webLink.trim(), title: label === "item" ? item.webLink.trim() : label, ...seconds !== void 0 ? { duration_s: seconds } : {} });
        } else if ((item.fileType ?? "").toLowerCase() === "document") {
          skip("It is a document, not an image, video or audio file.", "Export its pages as images and upload them with media upload.");
        } else {
          skip("It is an OptiSigns app with no web address in the API.", APP_NEXT);
        }
      });
      const playlistNotes = [];
      if (playlist.options?.backgroundAudio || playlist.options?.backgroundAudioName)
        playlistNotes.push("Its background audio does not come over.");
      return { id: playlist._id, name, items, ...playlist.options?.shuffle === true ? { shuffle: true } : {}, notes: playlistNotes };
    });
    const playlistIds = new Set(catalogPlaylists.map((playlist) => playlist.id));
    const single = /* @__PURE__ */ new Map();
    const contentOf = (id) => {
      if (!id)
        return void 0;
      if (playlistIds.has(id))
        return { playlist_id: id };
      const key = "asset:".concat(id);
      if (single.has(key))
        return { playlist_id: key };
      const name = assetName.get(id) ?? "Asset";
      if (mediaKinds.has(id))
        single.set(key, { id: key, name, items: [{ media_id: id }], notes: [] });
      else if (webPages.has(id))
        single.set(key, { id: key, name, items: [{ url: webPages.get(id).url, title: webPages.get(id).title }], notes: [] });
      else
        return void 0;
      return { playlist_id: key };
    };
    const usedBy = /* @__PURE__ */ new Map();
    for (const device of devices) {
      if ((device.currentType ?? "").toLowerCase() === "schedule" && device.currentScheduleId)
        usedBy.set(device.currentScheduleId, [...usedBy.get(device.currentScheduleId) ?? [], device._id]);
    }
    const scheduleIds = new Set(schedules.map((schedule) => schedule._id));
    const groups = [];
    const sourceSchedules = [];
    const scheduleDefault = /* @__PURE__ */ new Map();
    for (const schedule of schedules) {
      const name = (schedule.name ?? "").trim() || "Schedule ".concat(schedule._id.slice(0, 8));
      scheduleDefault.set(schedule._id, contentOf(schedule.defaultAssetId));
      if (!usedBy.has(schedule._id)) {
        notImported.push({ kind: "schedule", source_id: schedule._id, name, reason: "No screen uses this schedule." });
        continue;
      }
      groups.push({ id: "schedule:".concat(schedule._id), name });
      const events = await this.all("scheduleItems", "query:{scheduleId:$scheduleId}, ", "_id name type assetId playlistId single parentScheduleId range{ startDate endDate } repeatObject{ rrule }", { declare: ",$scheduleId:String!", variables: { scheduleId: schedule._id } });
      events.forEach((event, index) => {
        if (typeof event._id !== "string" || event._id === "")
          throw vendorBadResponse(NAME4, "scheduleItems.page.edges[".concat(index, "].node._id is missing"));
        const title = (event.name ?? "").trim() || name;
        const problem2 = (reason, next) => {
          notImported.push({ kind: "schedule", source_id: event._id, name: title, reason, ...next ? { next } : {} });
        };
        const content = (event.type ?? "").toLowerCase() === "playlist" ? contentOf(event.playlistId) : contentOf(event.assetId);
        if (!content)
          return problem2("The playlist or asset it plays did not come over.");
        if (!this.timezone)
          return problem2("OptiSigns gives event times as exact instants without a time zone.", "Rerun migrate scan with --timezone ZONE, the zone your OptiSigns schedules use.");
        const start = event.range?.startDate ? new Date(event.range.startDate) : void 0;
        const end = event.range?.endDate ? new Date(event.range.endDate) : void 0;
        if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
          return problem2("Its time range could not be read.");
        const rule = parseRule(event.repeatObject?.rrule, this.timezone);
        if (!rule.ok)
          return problem2(rule.reason);
        const replaces = event.single === true && !!event.parentScheduleId;
        sourceSchedules.push({
          id: event._id,
          name: title,
          targets: { group_ids: ["schedule:".concat(schedule._id)], screen_ids: [] },
          content,
          start: civil2(start, this.timezone),
          end: civil2(end, this.timezone),
          timezone: this.timezone,
          ...rule.repeat ? { repeat: rule.repeat } : {},
          priority: replaces ? 10 : 0,
          notes: replaces ? ["It replaced one occurrence of a repeating event; it now takes priority over that event at its own time."] : []
        });
      });
    }
    const tagGroups = /* @__PURE__ */ new Map();
    const catalogScreens = devices.map((device) => {
      const ids = [];
      for (const tag of Array.isArray(device.tags) ? device.tags : []) {
        const text2 = typeof tag === "string" ? tag.trim() : "";
        if (!text2)
          continue;
        const key = text2.toLowerCase();
        if (!tagGroups.has(key)) {
          tagGroups.set(key, "tag:".concat(key));
          groups.push({ id: "tag:".concat(key), name: text2 });
        }
        if (!ids.includes(tagGroups.get(key)))
          ids.push(tagGroups.get(key));
      }
      const type = (device.currentType ?? "").toLowerCase();
      let content;
      if (type === "playlist")
        content = contentOf(device.currentPlaylistId);
      else if (type === "asset")
        content = contentOf(device.currentAssetId);
      else if (type === "schedule" && device.currentScheduleId) {
        if (scheduleIds.has(device.currentScheduleId))
          ids.push("schedule:".concat(device.currentScheduleId));
        content = scheduleDefault.get(device.currentScheduleId);
      }
      return { id: device._id, name: (device.deviceName ?? device.name ?? "").trim() || "Device ".concat(device._id.slice(0, 8)), group_ids: ids, ...content ? { content } : {}, notes: [] };
    });
    if (!this.files)
      notes.push("OptiSigns documents no way to download a file, so none of its media comes over from the API. ".concat(NO_DOWNLOAD, " Playlists, schedules and screens come over from the API either way."));
    if (sawDuration)
      notes.push("OptiSigns documents item durations without a unit; they were read as seconds.");
    const account = [...devices, ...assets, ...playlists, ...schedules].map((row) => row.accountId).find((id) => typeof id === "string" && id !== "");
    return {
      account: account ?? "optisigns",
      label: NAME4,
      media,
      playlists: [...catalogPlaylists, ...single.values()],
      layouts: [],
      groups,
      screens: catalogScreens,
      schedules: sourceSchedules,
      not_imported: notImported,
      notes
    };
  }
  async fetchMedia() {
    throw usageError("OptiSigns hands out no files: they come from --files.");
  }
};
function fileKind(fileType, filename) {
  const type = (fileType ?? "").toLowerCase();
  if (type === "image" || type === "video" || type === "audio")
    return type;
  if (type !== "")
    return void 0;
  return kindOf({ filename });
}
var optisigns = {
  id: "optisigns",
  name: NAME4,
  inputs: { timezone: true, files: "optional" },
  credentials: [{ name: "OPTISIGNS_API_KEY", secret: true, required: true, help: "An API key from OptiSigns, API Key settings." }],
  connect: [
    "In OptiSigns open API Keys (app.optisigns.com/app/s/apikeys), click New API Key, name it, and turn on the Screens, Files/Assets, Playlists and Schedules scopes with read access. The key is shown once.",
    "Making a key needs the Pro Plus plan or above, an Account Owner or Super Admin sign-in, and a portal that is not white-labeled.",
    "Put OPTISIGNS_API_KEY=... in a file and name it with --credentials.",
    "OptiSigns has no way to download files through its API: download your files from OptiSigns into one folder and name it with --files. Playlists, schedules and screens come from the API either way.",
    "Add --timezone with the zone your OptiSigns schedules use: the API gives event times as exact instants without one."
  ],
  maps: [
    "Image, video and audio assets become media once their files are in --files, matched on the asset's file name; web assets become web page items.",
    "Playlists keep their item order, durations and shuffle setting. A device that shows one asset gets a playlist of that asset.",
    "Devices become waiting screens; their tags become groups. A device on a schedule joins a group named after the schedule, and its default content is the schedule's default asset or playlist.",
    "Schedule events become campaigns for that group: daily and weekly repeats, with COUNT and UNTIL, exactly."
  ],
  skips: [
    "Without --files every media is listed, and the playlists that need them wait.",
    "Documents, apps with no web address and multi-zone layouts are listed.",
    "Events that repeat by month or year or by another rule, events that skip single dates, and events without --timezone are listed with the reason.",
    "A playlist's background audio does not come over."
  ],
  docs: [
    "https://docs.optisigns.com/generate-api-key",
    "https://support.optisigns.com/hc/en-us/articles/4414563797139-Generate-Manage-OptiSigns-API-Key",
    "https://docs.optisigns.com/fundamental/pagination",
    "https://docs.optisigns.com/quickstart",
    "https://api-doc.optisigns.com/"
  ],
  example: "screenrig migrate scan --from optisigns --files ./optisigns-downloads --timezone America/Toronto --credentials ./optisigns-key.txt",
  async open(input) {
    const key = input.credentials.OPTISIGNS_API_KEY;
    const zone = input.timezone;
    return new OptiSignsSession(input.http.client({ base: ENDPOINT, auth: { Authorization: "Bearer ".concat(key) } }), input.files, validZone3(zone) ? zone : void 0);
  }
};

// dist/migrate/vendors/screencloud.js
var screencloud_exports = {};
__export(screencloud_exports, {
  screencloud: () => screencloud,
  zoneRects: () => zoneRects
});
var NAME5 = "ScreenCloud";
var HOSTS = { eu: "https://graphql.eu.screencloud.com/graphql", us: "https://graphql.us.screencloud.com/graphql" };
var PAGE4 = 100;
var DEFAULT_CANVAS2 = { width: 1920, height: 1080 };
function jsonOf(value) {
  if (value && typeof value === "object" && !Array.isArray(value))
    return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : void 0;
    } catch {
      return void 0;
    }
  }
  return void 0;
}
function validZone4(zone) {
  if (!zone)
    return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}
var query = (field, nodes) => "query($first:Int!,$after:Cursor){ ".concat(field, "(first:$first, after:$after){ pageInfo{ hasNextPage endCursor } nodes{ ").concat(nodes, " } } }");
function zoneRects(css, width, height) {
  const rects = /* @__PURE__ */ new Map();
  const unit = (value, axis) => {
    const match = /^(-?\d*\.?\d+)\s*(vw|vh|%|px)?$/.exec((value ?? "").trim());
    if (!match)
      return void 0;
    const n = Number(match[1]);
    if (match[2] === "vw")
      return n / 100 * width;
    if (match[2] === "vh")
      return n / 100 * height;
    if (match[2] === "%")
      return n / 100 * (axis === "x" ? width : height);
    return n;
  };
  const sheet = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rule = /#([A-Za-z0-9_-]+)\s*\{([^}]*)\}/g;
  for (let match = rule.exec(sheet); match; match = rule.exec(sheet)) {
    const props = {};
    for (const declaration of match[2].split(";")) {
      const cut = declaration.indexOf(":");
      if (cut > 0)
        props[declaration.slice(0, cut).trim().toLowerCase()] = declaration.slice(cut + 1).trim();
    }
    const x = unit(props.left, "x") ?? 0;
    const y = unit(props.top, "y") ?? 0;
    const w = unit(props.width, "x");
    const h = unit(props.height, "y");
    if (w === void 0 || h === void 0)
      continue;
    rects.set(match[1], { x, y, width: w, height: h, z: Number(props["z-index"]) || 0 });
  }
  return rects;
}
var ScreenCloudSession = class {
  client;
  region;
  constructor(client, region) {
    this.client = client;
    this.region = region;
  }
  all(field, nodes) {
    return cursorPages(this.client, query(field, nodes), (data) => {
      const connection = data[field];
      if (!connection || !Array.isArray(connection.nodes) || !connection.pageInfo)
        throw vendorBadResponse(NAME5, "".concat(field, ".nodes or ").concat(field, ".pageInfo is missing"));
      return { items: connection.nodes, hasNextPage: connection.pageInfo.hasNextPage === true, endCursor: connection.pageInfo.endCursor ?? null };
    }, { first: PAGE4 });
  }
  /** The items of one list, with nested playlists and channels as references the mapper inlines. */
  items(list, defaults, ctx, owner, zone) {
    const out = [];
    let ruled = 0;
    let audio = 0;
    if (!Array.isArray(list))
      return { items: out, ruled, audio };
    list.forEach((entry, index) => {
      const ref = entry?.content?._ref;
      if (!ref || typeof ref.type !== "string" || typeof ref.id !== "string")
        return;
      if (Array.isArray(entry.rules) && entry.rules.length > 0)
        ruled += 1;
      const ms = entry.content?.props?.duration;
      const where = "".concat(owner.name).concat(zone ? " / ".concat(zone) : "");
      const skip = (name, reason, next) => {
        ctx.notImported.push({ kind: "item", source_id: "".concat(owner.kind, ":").concat(owner.id, ":").concat(entry.list_id ?? index), name: "".concat(where, ": ").concat(name), reason, ...next ? { next } : {} });
      };
      const own = typeof ms === "number" && ms > 0 ? ms / 1e3 : void 0;
      const fallback = (value) => typeof value === "number" && value > 0 ? value / 1e3 : void 0;
      switch (ref.type.toLowerCase()) {
        case "file": {
          const kind = ctx.media.get(ref.id);
          if (kind === void 0) {
            out.push({ media_id: ref.id });
            break;
          }
          if (kind === "audio" && zone !== void 0) {
            audio += 1;
            break;
          }
          const duration = kind === "audio" ? void 0 : kind === "video" ? own : own ?? fallback(defaults.image);
          out.push({ media_id: ref.id, ...duration !== void 0 ? { duration_s: duration } : {} });
          break;
        }
        case "playlist":
          if (ctx.playlistIds.has(ref.id))
            out.push({ playlist_id: ref.id });
          break;
        case "channel":
          if (ctx.channelIds.has(ref.id))
            out.push({ layout_id: ref.id });
          break;
        case "link": {
          const link = ctx.links.get(ref.id);
          if (!link?.url)
            skip("link ".concat(ref.id.slice(0, 8)), "ScreenCloud gave no address for the link.");
          else {
            const duration = own ?? fallback(defaults.link);
            out.push({ url: link.url, title: (link.name ?? "").trim() || link.url, ...duration !== void 0 ? { duration_s: duration } : {} });
          }
          break;
        }
        default:
          skip("".concat(ref.type.toLowerCase(), " ").concat(ref.id.slice(0, 8)), "A ScreenCloud ".concat(ref.type.toLowerCase(), " is not media, a web link or a playlist."), "Rebuild it as a built-in card, an iframe page or a stream page in a playlist.");
      }
    });
    return { items: out, ruled, audio };
  }
  async scan() {
    const org = await this.client.graphql("query{ currentOrgId }");
    if (typeof org.currentOrgId !== "string" || org.currentOrgId === "")
      throw vendorBadResponse(NAME5, "currentOrgId is missing");
    const files2 = await this.all("allFiles", "id name mimetype size source deletedAt fileOutputsByFileId(first:20){ nodes{ url mimetype } }");
    const playlists = await this.all("allPlaylists", "id name content draftOf");
    const layouts = await this.all("allLayouts", "id width height config");
    const channels = await this.all("allChannels", "id name width height layoutId content draftOf type");
    const screens = await this.all("allScreens", "id name screenGroupId tags content timezone playerTimezone timezoneOverride");
    const groups = await this.all("allScreenGroups", "id name");
    const links = await this.all("allLinks", "id name url");
    for (const [path2, rows2] of [["allFiles", files2], ["allPlaylists", playlists], ["allLayouts", layouts], ["allChannels", channels], ["allScreens", screens], ["allScreenGroups", groups], ["allLinks", links]]) {
      rows2.forEach((row, index) => {
        if (typeof row?.id !== "string" || row.id === "")
          throw vendorBadResponse(NAME5, "".concat(path2, ".nodes[").concat(index, "].id is missing"));
      });
    }
    const notImported = [];
    const notes = [];
    const media = [];
    const kinds = /* @__PURE__ */ new Map();
    const fileNames = /* @__PURE__ */ new Map();
    for (const file of files2) {
      if (file.deletedAt)
        continue;
      const name = (file.name ?? "").trim() || "File ".concat(file.id.slice(0, 8));
      fileNames.set(file.id, name);
      const kind = kindOf({ mime: file.mimetype ?? void 0, filename: file.name ?? void 0 });
      if (!kind) {
        notImported.push({ kind: "media", source_id: file.id, name, reason: "It is not an image, video or audio file." });
        continue;
      }
      const size = Number(file.size);
      let url;
      let original = true;
      if (typeof file.source === "string" && /^https:\/\//i.test(file.source)) {
        url = file.source;
      } else {
        const output = (file.fileOutputsByFileId?.nodes ?? []).find((node) => node?.url && /^https:\/\//i.test(node.url) && kindOf({ mime: node.mimetype ?? void 0 }) === kind);
        url = output?.url ?? void 0;
        original = false;
      }
      if (!url) {
        notImported.push({ kind: "media", source_id: file.id, name, reason: "ScreenCloud gave no address for the file." });
        continue;
      }
      media.push({ id: file.id, name, filename: name, kind, ...original && Number.isFinite(size) && size > 0 ? { bytes: size } : {}, fetch: { url }, original });
      kinds.set(file.id, kind);
    }
    const linkById = new Map(links.map((link) => [link.id, link]));
    const ctx = {
      media: kinds,
      links: linkById,
      playlistIds: new Set(playlists.filter((playlist) => !playlist.draftOf).map((playlist) => playlist.id)),
      channelIds: /* @__PURE__ */ new Set(),
      notImported
    };
    const layoutById = new Map(layouts.map((layout) => [layout.id, layout]));
    const publishedChannels = channels.filter((channel) => !channel.draftOf && channel.type !== "BLANK" && channel.type !== "SPLASH");
    if (publishedChannels.length < channels.filter((channel) => !channel.draftOf).length)
      notes.push("ScreenCloud's built-in blank and splash channels are not imported.");
    for (const channel of publishedChannels)
      ctx.channelIds.add(channel.id);
    const ruledNote = (kind, id, name, count) => {
      if (count === 0)
        return;
      notImported.push({
        kind: "schedule",
        source_id: "".concat(kind, ":").concat(id),
        name: "".concat(name, " (").concat(count, " item").concat(count === 1 ? "" : "s", ")"),
        reason: "Its items carry time, weekday or date rules, which do not come over: they play whenever the ".concat(kind, " plays."),
        next: "After the screen is paired, make a campaign for those hours (campaign create), or set visibility on the playlist's pages."
      });
    };
    const catalogPlaylists = [];
    for (const playlist of playlists) {
      if (playlist.draftOf)
        continue;
      const name = (playlist.name ?? "").trim() || "Playlist ".concat(playlist.id.slice(0, 8));
      const content = jsonOf(playlist.content) ?? {};
      const defaults = jsonOf(jsonOf(content.props)?.default_durations) ?? {};
      const built = this.items(content.list, defaults, ctx, { kind: "playlist", id: playlist.id, name });
      ruledNote("playlist", playlist.id, name, built.ruled);
      catalogPlaylists.push({ id: playlist.id, name, items: built.items, notes: [] });
    }
    const playlistIds = new Set(catalogPlaylists.map((playlist) => playlist.id));
    const playlistItems = new Map(catalogPlaylists.map((playlist) => [playlist.id, playlist.items]));
    const flatten = (list, stack, dropped) => list.flatMap((item) => {
      if ("playlist_id" in item) {
        const inner = playlistItems.get(item.playlist_id);
        return inner && !stack.includes(item.playlist_id) ? flatten(inner, [...stack, item.playlist_id], dropped) : [];
      }
      if ("media_id" in item && kinds.get(item.media_id) === "audio") {
        dropped.audio += 1;
        return [];
      }
      return [item];
    });
    const catalogLayouts = [];
    for (const channel of publishedChannels) {
      const name = (channel.name ?? "").trim() || "Channel ".concat(channel.id.slice(0, 8));
      const layout = channel.layoutId ? layoutById.get(channel.layoutId) : void 0;
      const config = jsonOf(layout?.config) ?? {};
      const width = Number(config.width) || layout?.width || channel.width || DEFAULT_CANVAS2.width;
      const height = Number(config.height) || layout?.height || channel.height || DEFAULT_CANVAS2.height;
      const content = jsonOf(channel.content) ?? {};
      const zoneContent = jsonOf(content.zones) ?? {};
      const channelDefaults = jsonOf(jsonOf(content.props)?.default_durations) ?? {};
      const defined = Array.isArray(config.zones) && config.zones.length > 0 ? config.zones.filter((zone) => typeof zone?.id === "string").map((zone) => ({ id: zone.id, name: typeof zone.name === "string" && zone.name.trim() ? zone.name.trim() : zone.id })) : Object.keys(zoneContent).filter((id) => id !== "hidden").sort().map((id) => ({ id, name: id }));
      const rects = zoneRects(typeof config.css === "string" ? config.css : "", width, height);
      const layoutNotes = [];
      let ruled = 0;
      let audioDropped = 0;
      const zones = defined.map((zone) => {
        const holder = jsonOf(zoneContent[zone.id]);
        const zoneDefaults = { ...channelDefaults, ...jsonOf(jsonOf(holder?.props)?.default_durations) ?? {} };
        const built = this.items(holder?.list, zoneDefaults, ctx, { kind: "channel", id: channel.id, name }, zone.name);
        const dropped = { audio: built.audio };
        built.items = flatten(built.items, [], dropped);
        ruled += built.ruled;
        audioDropped += dropped.audio;
        const rect = rects.get(zone.id);
        if (!rect && defined.length > 1)
          layoutNotes.push("The position of ".concat(zone.name, " could not be read from the layout, so it fills the screen."));
        return { id: zone.id, name: zone.name, ...rect ?? { x: 0, y: 0, width, height, z: 0 }, items: built.items };
      });
      const hidden = jsonOf(zoneContent.hidden)?.list;
      if (Array.isArray(hidden) && hidden.length > 0)
        layoutNotes.push("Its hidden zone held ".concat(hidden.length, " item").concat(hidden.length === 1 ? ", which does" : "s, which do", " not come over."));
      if (audioDropped > 0)
        layoutNotes.push("".concat(audioDropped, " audio file").concat(audioDropped === 1 ? " is" : "s are", " not played: audio comes over only as a playlist's soundtrack, not inside a layout."));
      ruledNote("channel", channel.id, name, ruled);
      catalogLayouts.push({ id: channel.id, name, width: Math.round(width), height: Math.round(height), zones, notes: layoutNotes });
    }
    const catalogGroups = groups.map((group) => ({ id: "g:".concat(group.id), name: (group.name ?? "").trim() || "Group ".concat(group.id.slice(0, 8)) }));
    const tagGroups = /* @__PURE__ */ new Map();
    const synthetic = /* @__PURE__ */ new Map();
    const catalogScreens = screens.map((screen) => {
      const ids = screen.screenGroupId ? ["g:".concat(screen.screenGroupId)] : [];
      for (const tag of Array.isArray(screen.tags) ? screen.tags : []) {
        const text2 = typeof tag === "string" ? tag.trim() : "";
        if (!text2)
          continue;
        const key = text2.toLowerCase();
        if (!tagGroups.has(key)) {
          tagGroups.set(key, "tag:".concat(key));
          catalogGroups.push({ id: "tag:".concat(key), name: text2 });
        }
        if (!ids.includes(tagGroups.get(key)))
          ids.push(tagGroups.get(key));
      }
      const screenNotes = [];
      let content;
      const raw = jsonOf(screen.content);
      if (raw) {
        const ref = jsonOf(raw._ref) ?? raw;
        const type = typeof ref.type === "string" ? ref.type.toLowerCase() : "";
        const id = typeof ref.id === "string" ? ref.id : "";
        if (type === "channel" && ctx.channelIds.has(id))
          content = { layout_id: id };
        else if (type === "playlist" && playlistIds.has(id))
          content = { playlist_id: id };
        else if (type === "file" && kinds.has(id) && kinds.get(id) !== "audio") {
          const key = "file:".concat(id);
          if (!synthetic.has(key))
            synthetic.set(key, { id: key, name: fileNames.get(id) ?? "File", items: [{ media_id: id }], notes: [] });
          content = { playlist_id: key };
        } else if (type === "link" && linkById.get(id)?.url) {
          const key = "link:".concat(id);
          const link = linkById.get(id);
          if (!synthetic.has(key))
            synthetic.set(key, { id: key, name: (link.name ?? "").trim() || link.url, items: [{ url: link.url, title: (link.name ?? "").trim() || link.url }], notes: [] });
          content = { playlist_id: key };
        } else if (type === "app" || type === "site") {
          screenNotes.push("It showed ".concat(type === "app" ? "an app" : "a site", ", which does not come over."));
        } else if (type === "") {
          screenNotes.push("Its current content could not be read.");
        }
      }
      const timezone = [screen.timezoneOverride, screen.timezone, screen.playerTimezone].find(validZone4);
      return { id: screen.id, name: (screen.name ?? "").trim() || "Screen ".concat(screen.id.slice(0, 8)), group_ids: ids, ...content ? { content } : {}, ...timezone ? { timezone } : {}, notes: screenNotes };
    });
    return {
      account: org.currentOrgId,
      label: "ScreenCloud (".concat(this.region.toUpperCase(), ")"),
      media,
      playlists: [...catalogPlaylists, ...synthetic.values()],
      layouts: catalogLayouts,
      groups: catalogGroups,
      screens: catalogScreens,
      schedules: [],
      not_imported: notImported,
      notes
    };
  }
  async fetchMedia(media, destination) {
    const url = media.fetch?.url;
    if (!url)
      throw vendorBadResponse(NAME5, "a media entry has no file address");
    return this.client.download(url, destination);
  }
};
var screencloud = {
  id: "screencloud",
  name: NAME5,
  inputs: { regions: ["eu", "us"], files: "optional" },
  credentials: [{ name: "SCREENCLOUD_API_TOKEN", secret: true, required: true, help: "An API token from ScreenCloud Studio, Account Settings, Developer." }],
  connect: [
    "In Studio open Account Settings, then the Developer tab, and click New Token. Choose read permissions for files, playlists, channels, layouts, screens, screen groups and links (full access also works), and copy the key once.",
    "The Developer tab names your GraphQL endpoint; its region is eu or us, and goes to --region.",
    "Put SCREENCLOUD_API_TOKEN=... in a file and name it with --credentials."
  ],
  maps: [
    "Files become media (images, video and audio), and web links become web page items.",
    "Playlists keep their items and durations. Channels become layouts: each zone is placed from the layout's CSS, and a channel's own playlists are inlined.",
    "Screen groups and screen tags become groups. Screens become waiting screens with their time zone and, when it is a channel, playlist, file or link, their content."
  ],
  skips: [
    "ScreenCloud has no schedule object, so none are created. Time, weekday and date rules on items are listed per channel and playlist; the items play whenever the channel does.",
    "Apps, sites, a channel's hidden zone, and drafts are listed or left out; files that are not images, video or audio are listed."
  ],
  docs: [
    "https://screencloud.github.io/signage-next-graphql-docs/get-an-api-token",
    "https://screencloud.github.io/signage-next-graphql-docs/graphql-reference/content-json-reference/playlist-content",
    "https://screencloud.github.io/signage-next-graphql-docs/graphql-reference/content-json-reference/channel-content",
    "https://screencloud.github.io/signage-next-graphql-docs/graphql-reference/content-json-reference/custom-layout-config",
    "https://screencloud.github.io/signage-next-graphql-docs/graphql-reference"
  ],
  example: "screenrig migrate scan --from screencloud --region eu --credentials ./screencloud-key.txt",
  async open(input) {
    const host = HOSTS[input.region ?? ""];
    if (!host)
      throw vendorBadResponse(NAME5, "the region is not eu or us");
    const token = (input.credentials.SCREENCLOUD_API_TOKEN ?? "").trim().replace(/^Bearer\s+/i, "");
    return new ScreenCloudSession(input.http.client({ base: host, auth: { Authorization: "Bearer ".concat(token) } }), input.region);
  }
};

// dist/migrate/vendors/screenly.js
var screenly_exports = {};
__export(screenly_exports, {
  parsePredicate: () => parsePredicate,
  screenly: () => screenly,
  termTiming: () => termTiming
});
var NAME6 = "Screenly";
var BASE2 = "https://api.screenlyapp.com/api/v4.1";
var DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
var PAGE5 = 100;
var MS_PER_DAY = 864e5;
var MS_PER_MINUTE = 6e4;
var END_OF_DAY = MS_PER_DAY - 1;
var Unsupported = class extends Error {
};
var TOKEN = /\s*(\$[A-Za-z]+|<=|>=|=|<|>|\(|\)|\{|\}|,|-?\d+|[A-Za-z]+)/y;
function tokens(text2) {
  const out = [];
  TOKEN.lastIndex = 0;
  let at = 0;
  while (at < text2.length) {
    TOKEN.lastIndex = at;
    const match = TOKEN.exec(text2);
    if (!match) {
      if (text2.slice(at).trim() === "")
        break;
      throw new Unsupported("It uses a form this CLI does not read.");
    }
    out.push(match[1]);
    at = TOKEN.lastIndex;
  }
  return out;
}
function intersect(a, b) {
  const days = a.days && b.days ? a.days.filter((day) => b.days.includes(day)) : a.days ?? b.days;
  const pick = (x, y, wider) => x === void 0 ? y : y === void 0 ? x : wider(x, y);
  const term = {
    ...days ? { days } : {},
    ...pick(a.lo, b.lo, Math.max) !== void 0 ? { lo: pick(a.lo, b.lo, Math.max) } : {},
    ...pick(a.hi, b.hi, Math.min) !== void 0 ? { hi: pick(a.hi, b.hi, Math.min) } : {},
    ...pick(a.dlo, b.dlo, Math.max) !== void 0 ? { dlo: pick(a.dlo, b.dlo, Math.max) } : {},
    ...pick(a.dhi, b.dhi, Math.min) !== void 0 ? { dhi: pick(a.dhi, b.dhi, Math.min) } : {}
  };
  const empty = term.days !== void 0 && term.days.length === 0 || term.dlo !== void 0 && term.dhi !== void 0 && dayOf(term.dlo) > dayOf(term.dhi);
  return empty ? void 0 : term;
}
function dayOf(ms) {
  return new Date(Math.round(ms / MS_PER_DAY) * MS_PER_DAY).toISOString().slice(0, 10);
}
function parsePredicate(predicate) {
  const text2 = (predicate ?? "").trim();
  if (text2 === "")
    return { ok: true, terms: [{}] };
  let list;
  try {
    list = tokens(text2);
  } catch (error) {
    return { ok: false, reason: error instanceof Unsupported ? error.message : "It could not be read." };
  }
  let at = 0;
  const peek = () => list[at]?.toUpperCase();
  const take = () => list[at++] ?? "";
  const expect = (word) => {
    if (peek() !== word)
      throw new Unsupported("It uses a form this CLI does not read.");
    at += 1;
  };
  const number = () => {
    const value = take();
    if (!/^-?\d+$/.test(value))
      throw new Unsupported("It uses a form this CLI does not read.");
    return Number(value);
  };
  const set = () => {
    expect("{");
    const values = [number()];
    while (peek() === ",") {
      at += 1;
      values.push(number());
    }
    expect("}");
    return values;
  };
  const weekdays = (negate) => {
    const values = set();
    if (values.some((day) => day < 0 || day > 6))
      throw new Unsupported("A weekday is outside 0 (Monday) to 6 (Sunday).");
    const chosen = [...new Set(values)].sort((x, y) => x - y);
    return [{ days: negate ? [0, 1, 2, 3, 4, 5, 6].filter((day) => !chosen.includes(day)) : chosen }];
  };
  const clause = () => {
    const word = peek();
    if (word === "TRUE") {
      at += 1;
      return [{}];
    }
    if (word === "FALSE") {
      at += 1;
      return [];
    }
    if (word === "(") {
      at += 1;
      const inner = orExpr();
      expect(")");
      return inner;
    }
    if (word === "NOT") {
      at += 1;
      const grouped = peek() === "(";
      if (grouped)
        at += 1;
      if (peek() !== "$WEEKDAY")
        throw new Unsupported("It negates something other than a weekday list, which campaigns cannot express.");
      at += 1;
      expect("IN");
      const result = weekdays(true);
      if (grouped)
        expect(")");
      return result;
    }
    if (word === "$WEEKDAY") {
      at += 1;
      let negate = false;
      if (peek() === "NOT") {
        negate = true;
        at += 1;
      }
      expect("IN");
      return weekdays(negate);
    }
    if (word === "$TIME") {
      at += 1;
      const operator = peek();
      if (operator === "BETWEEN") {
        at += 1;
        const pair = set();
        if (pair.length !== 2)
          throw new Unsupported("Its time rule does not hold exactly a start and an end.");
        return [{ lo: pair[0], hi: pair[1] }];
      }
      if (operator === ">=") {
        at += 1;
        return [{ lo: number() }];
      }
      if (operator === "<=") {
        at += 1;
        return [{ hi: number() }];
      }
      throw new Unsupported("Its time rule uses an operator other than BETWEEN, >= or <=.");
    }
    if (word === "$DATE") {
      at += 1;
      const operator = peek();
      if (operator === "<=" || operator === ">=" || operator === "=") {
        at += 1;
        const value = number();
        return [operator === "<=" ? { dhi: value } : operator === ">=" ? { dlo: value } : { dlo: value, dhi: value }];
      }
      throw new Unsupported("Its date rule uses an operator other than <=, = or >=.");
    }
    throw new Unsupported("It uses a form this CLI does not read.");
  };
  const andExpr = () => {
    let terms = clause();
    while (peek() === "AND") {
      at += 1;
      const right = clause();
      terms = terms.flatMap((left) => right.flatMap((other) => intersect(left, other) ?? []));
    }
    return terms;
  };
  const orExpr = () => {
    const terms = andExpr();
    while (peek() === "OR") {
      at += 1;
      terms.push(...andExpr());
    }
    return terms;
  };
  try {
    const terms = orExpr();
    if (at < list.length)
      throw new Unsupported("It uses a form this CLI does not read.");
    const alive = terms.flatMap((term) => intersect(term, {}) ?? []);
    if (alive.length === 0)
      return { ok: false, reason: "Its rule is never true, so the playlist never plays." };
    if (alive.some((term) => isAlways(term)))
      return { ok: true, terms: [{}] };
    const seen = /* @__PURE__ */ new Set();
    return { ok: true, terms: alive.filter((term) => !seen.has(JSON.stringify(term)) && seen.add(JSON.stringify(term))) };
  } catch (error) {
    return { ok: false, reason: error instanceof Unsupported ? error.message : "It could not be read." };
  }
}
function isAlways(term) {
  return term.dlo === void 0 && term.dhi === void 0 && !restrictsDays(term) && !restrictsTime(term);
}
function restrictsDays(term) {
  return term.days !== void 0 && term.days.length < 7;
}
function restrictsTime(term) {
  return term.lo !== void 0 && term.lo > 0 || term.hi !== void 0 && term.hi < END_OF_DAY;
}
function termTiming(term, today) {
  const notes = [];
  const dlo = term.dlo === void 0 ? void 0 : dayOf(term.dlo);
  const dhi = term.dhi === void 0 ? void 0 : dayOf(term.dhi);
  for (const stamp of [term.dlo, term.dhi]) {
    if (stamp !== void 0 && stamp % MS_PER_DAY !== 0) {
      notes.push("Screenly gives a date as a time stamp without a zone; it was read as the calendar day nearest the stamp.");
      break;
    }
  }
  if (isAlways(term))
    return { ok: true, schedule: { always: true }, notes };
  if (!restrictsDays(term) && !restrictsTime(term)) {
    return {
      ok: true,
      schedule: { ...dlo ? { start: "".concat(dlo, "T00:00") } : {}, ...dhi ? { end: "".concat(addDays(dhi, 1), "T00:00") } : {} },
      notes
    };
  }
  const weekdays = restrictsDays(term) ? term.days.map((day) => DAYS[day]) : void 0;
  let start = "00:00";
  let end = "00:00";
  let endsNextDay = true;
  if (restrictsTime(term)) {
    const from = term.lo ?? 0;
    const to = Math.min(term.hi ?? END_OF_DAY, END_OF_DAY);
    if (from < 0 || from > END_OF_DAY || to < 0)
      return { ok: false, reason: "Its time window is outside the day." };
    if (to < from)
      return { ok: false, reason: "Its time window ends before it starts." };
    const startMinute = Math.floor(from / MS_PER_MINUTE);
    const endMinute = Math.ceil(to / MS_PER_MINUTE);
    if (from % MS_PER_MINUTE !== 0 || to % MS_PER_MINUTE !== 0 && to !== END_OF_DAY)
      notes.push("Its times were rounded outward to the minute.");
    if (endMinute <= startMinute)
      return { ok: false, reason: "Its time window is shorter than a minute." };
    const clock3 = (minute) => "".concat(String(Math.floor(minute / 60) % 24).padStart(2, "0"), ":").concat(String(minute % 60).padStart(2, "0"));
    start = clock3(startMinute);
    end = clock3(endMinute);
    endsNextDay = endMinute >= 1440;
  }
  const first = dlo ?? today;
  return {
    ok: true,
    schedule: {
      start: "".concat(first, "T").concat(start),
      end: "".concat(endsNextDay ? addDays(first, 1) : first, "T").concat(end),
      repeat: { every: weekdays ? "week" : "day", ...weekdays ? { weekdays } : {}, ...dhi ? { until: dhi } : {} }
    },
    notes
  };
}
var EXTENSION = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/bmp": "bmp",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-matroska": "mkv",
  "video/mpeg": "mpg",
  "video/ogg": "ogv",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/aac": "aac",
  "audio/flac": "flac"
};
function filenameOf(asset, title) {
  const extension = EXTENSION[(asset.mimetype ?? "").toLowerCase().split(";")[0].trim()];
  return extension ? "".concat(title, ".").concat(extension) : title;
}
var NOT_MEDIA = {
  streaming: ["It is a live stream.", "Add the stream address as a stream page in a playlist."],
  "edge-app": ["It is a Screenly Edge App.", "Rebuild it as a built-in card or an iframe page in a playlist."],
  "edge-app-file": ["It is a file of a Screenly Edge App.", "Rebuild it as a built-in card or an iframe page in a playlist."],
  pdf: ["It is a PDF document, which is not an image, video or audio file.", "Export its pages as images and upload them with media upload."],
  "pdf-page": ["It is a page of a PDF document, which is not an image, video or audio file.", "Export the pages as images and upload them with media upload."]
};
var ScreenlySession = class {
  client;
  now;
  constructor(client, now) {
    this.client = client;
    this.now = now;
  }
  /** Rows are asked for 100 at a time and the listing ends on an empty page: a PostgREST server may return fewer rows than the limit when it caps them, and a short page is then not the end. */
  list(path2, order) {
    return offsetPages(async (start) => {
      const body = await this.client.json(path2, { query: { limit: PAGE5, offset: start, order } });
      if (!Array.isArray(body))
        throw vendorBadResponse(NAME6, "".concat(path2, " did not answer with a list"));
      return { items: body };
    }, { pageSize: 1 });
  }
  async scan() {
    const assets = await this.list("/assets", "id");
    const playlists = await this.list("/playlists", "id");
    const items = await this.list("/playlist-items", "id");
    const labels = await this.list("/labels", "id");
    const labelScreens = await this.list("/labels/screens", "label_id,screen_id");
    const labelPlaylists = await this.list("/labels/playlists", "label_id,playlist_id");
    const screens = await this.list("/screens", "id");
    requireIds("/assets", assets);
    requireIds("/playlists", playlists);
    requireIds("/labels", labels);
    requireIds("/screens", screens);
    items.forEach((row, index) => {
      if (typeof row.playlist_id !== "string" || typeof row.asset_id !== "string")
        throw vendorBadResponse(NAME6, "/playlist-items[".concat(index, "] has no playlist_id or asset_id"));
    });
    const today = this.now().toISOString().slice(0, 10);
    const media = [];
    const notImported = [];
    const webPages = /* @__PURE__ */ new Map();
    const importedMedia = /* @__PURE__ */ new Set();
    for (const asset of assets) {
      const title = (asset.title ?? "").trim() || "Asset ".concat(asset.id.slice(0, 8));
      const type = asset.type ?? "";
      const entry = (reason, next) => {
        notImported.push({ kind: type === "web" || type === "streaming" || type.startsWith("edge-app") ? "item" : "media", source_id: asset.id, name: title, reason, ...next ? { next } : {} });
      };
      if (NOT_MEDIA[type]) {
        entry(...NOT_MEDIA[type]);
      } else if (type === "web") {
        const url = (asset.source_url ?? asset.asset_url ?? "").trim();
        if (/^https?:\/\//i.test(url))
          webPages.set(asset.id, { url, title });
        else
          entry("Its address is not an http or https address.");
      } else if (type === "image" || type === "video" || type === "audio") {
        if (asset.status !== void 0 && asset.status !== "finished")
          entry("Screenly has not finished processing it.");
        else if (!asset.asset_url)
          entry("Screenly gave no address for the file.");
        else {
          media.push({ id: asset.id, name: title, filename: filenameOf(asset, title), kind: type, fetch: { url: asset.asset_url }, original: true });
          importedMedia.add(asset.id);
        }
      } else {
        entry('Screenly asset type "'.concat(type || "unknown", '" is not an image, video, audio file or web page.'));
      }
    }
    const assetById = new Map(assets.map((asset) => [asset.id, asset]));
    const byPlaylist = /* @__PURE__ */ new Map();
    for (const item of items)
      byPlaylist.set(item.playlist_id, [...byPlaylist.get(item.playlist_id) ?? [], item]);
    const catalogPlaylists = playlists.map((playlist) => {
      const ordered2 = [...byPlaylist.get(playlist.id) ?? []].sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || (a.id ?? "").localeCompare(b.id ?? ""));
      const out = [];
      let left = 0;
      for (const item of ordered2) {
        const asset = assetById.get(item.asset_id);
        const played = item.effective_duration !== void 0 && item.effective_duration > 0 ? item.effective_duration : item.duration;
        if (importedMedia.has(item.asset_id)) {
          const kind = asset.type;
          if (kind === "image")
            out.push({ media_id: item.asset_id, ...played !== void 0 && played > 0 ? { duration_s: played } : {} });
          else if (kind === "video") {
            const own = typeof asset.duration === "number" ? asset.duration : void 0;
            out.push({ media_id: item.asset_id, ...played !== void 0 && played > 0 && (own === void 0 || Math.abs(played - own) > 0.5) ? { duration_s: played } : {} });
          } else
            out.push({ media_id: item.asset_id });
        } else if (webPages.has(item.asset_id)) {
          const page = webPages.get(item.asset_id);
          out.push({ url: page.url, title: page.title, ...played !== void 0 && played > 0 ? { duration_s: played } : {} });
        } else
          left += 1;
      }
      const notes = [];
      if (left > 0)
        notes.push("".concat(left, " item").concat(left === 1 ? " was" : "s were", " left out because ").concat(left === 1 ? "its" : "their", " asset is listed under Cannot come over."));
      if (playlist.is_enabled === false)
        notes.push("It was switched off in Screenly.");
      return { id: playlist.id, name: (playlist.title ?? "").trim() || "Playlist ".concat(playlist.id.slice(0, 8)), items: out, notes };
    });
    const playlistById = new Map(catalogPlaylists.map((playlist) => [playlist.id, playlist]));
    const screenIds = new Set(screens.map((screen) => screen.id));
    const members = /* @__PURE__ */ new Map();
    for (const link of labelScreens) {
      if (typeof link.label_id !== "string" || typeof link.screen_id !== "string")
        throw vendorBadResponse(NAME6, "/labels/screens has a row without label_id or screen_id");
      if (screenIds.has(link.screen_id))
        members.set(link.label_id, [...members.get(link.label_id) ?? [], link.screen_id]);
    }
    const screenName = new Map(screens.map((screen) => [screen.id, (screen.name ?? "").trim()]));
    const groups = [];
    const ownLabel = /* @__PURE__ */ new Map();
    const groupMembers = /* @__PURE__ */ new Map();
    for (const label of labels) {
      const names = [label.human_name, label.name].map((value) => (value ?? "").trim()).filter(Boolean);
      const reached = label.type === "all-screens" ? [...screenIds] : [...new Set(members.get(label.id) ?? [])];
      const only = reached.length === 1 ? reached[0] : void 0;
      const own = only !== void 0 && (label.type === "screen" || label.type === void 0 && names.includes(screenName.get(only) ?? "\0"));
      if (own) {
        ownLabel.set(label.id, only);
      } else if (label.type === "screen") {
        continue;
      } else {
        groups.push({ id: label.id, name: names[0] ?? "Label ".concat(label.id.slice(0, 8)) });
        groupMembers.set(label.id, reached);
      }
    }
    const groupIds = new Set(groups.map((group) => group.id));
    const labelsOf = /* @__PURE__ */ new Map();
    for (const link of labelPlaylists) {
      if (typeof link.label_id !== "string" || typeof link.playlist_id !== "string")
        throw vendorBadResponse(NAME6, "/labels/playlists has a row without label_id or playlist_id");
      labelsOf.set(link.playlist_id, [...labelsOf.get(link.playlist_id) ?? [], link.label_id]);
    }
    const schedules = [];
    const base = /* @__PURE__ */ new Map();
    const addBase = (screen, playlist) => {
      if (!base.has(screen))
        base.set(screen, /* @__PURE__ */ new Set());
      base.get(screen).add(playlist);
    };
    for (const playlist of playlists) {
      const reach = [...new Set(labelsOf.get(playlist.id) ?? [])].filter((id) => ownLabel.has(id) || groupIds.has(id));
      if (reach.length === 0)
        continue;
      const title = playlistById.get(playlist.id).name;
      const problem2 = (reason) => {
        notImported.push({ kind: "schedule", source_id: playlist.id, name: title, reason });
      };
      if (playlist.is_enabled === false) {
        problem2("The playlist is switched off in Screenly, so its labels play nothing.");
        continue;
      }
      const parsed = parsePredicate(playlist.predicate);
      if (!parsed.ok) {
        problem2(parsed.reason);
        continue;
      }
      const priority = playlist.priority === true ? 10 : 0;
      const alwaysOn = parsed.terms.length === 1 && isAlways(parsed.terms[0]);
      if (alwaysOn && priority === 0) {
        for (const label of reach)
          for (const screen of ownLabel.has(label) ? [ownLabel.get(label)] : groupMembers.get(label) ?? [])
            addBase(screen, playlist.id);
        continue;
      }
      parsed.terms.forEach((term, index) => {
        const timing = termTiming(term, today);
        if (!timing.ok) {
          problem2(timing.reason);
          return;
        }
        const suffix = parsed.terms.length > 1 ? " (".concat(index + 1, ")") : "";
        for (const label of reach) {
          const own = ownLabel.get(label);
          schedules.push({
            id: "".concat(playlist.id, ":").concat(label).concat(parsed.terms.length > 1 ? ":".concat(index + 1) : ""),
            name: "".concat(title).concat(suffix),
            targets: own ? { group_ids: [], screen_ids: [own] } : { group_ids: [label], screen_ids: [] },
            content: { playlist_id: playlist.id },
            ...timing.schedule,
            priority,
            notes: [
              ...timing.notes,
              ...parsed.terms.length > 1 ? ["Its rule had several alternatives; each became its own campaign."] : [],
              // A priority playlist replaces the others while its rule is true, as a campaign does; any other plays beside them.
              ...priority === 0 ? ["In Screenly it played alongside the screen's other playlists during its hours; the campaign shows it instead of them."] : []
            ]
          });
        }
      });
    }
    const combined = /* @__PURE__ */ new Map();
    const catalogScreens = screens.map((screen) => {
      const wanted2 = [...base.get(screen.id) ?? []].sort((a, b) => playlistById.get(a).name.localeCompare(playlistById.get(b).name) || (a < b ? -1 : 1));
      let content;
      if (wanted2.length === 1)
        content = { playlist_id: wanted2[0] };
      else if (wanted2.length > 1) {
        const id = "combined:".concat(wanted2.join("+"));
        if (!combined.has(id)) {
          const names = wanted2.map((playlistId) => playlistById.get(playlistId).name);
          combined.set(id, {
            id,
            name: names.join(" + ").slice(0, 100),
            items: wanted2.map((playlist_id) => ({ playlist_id })),
            notes: ["Screenly plays every active playlist of a screen one after another, in an order it does not publish; this one plays ".concat(names.join(", "), " in that order.")]
          });
        }
        content = { playlist_id: id };
      }
      const timezone = screen.timezone && validZone5(screen.timezone) ? screen.timezone : void 0;
      return {
        id: screen.id,
        name: (screen.name ?? "").trim() || "Screen ".concat(screen.id.slice(0, 8)),
        group_ids: groups.filter((group) => groupMembers.get(group.id)?.includes(screen.id)).map((group) => group.id),
        ...content ? { content } : {},
        ...timezone ? { timezone } : {},
        notes: screen.is_enabled === false ? ["It was switched off in Screenly."] : []
      };
    });
    const teams = /* @__PURE__ */ new Map();
    for (const row of [...assets, ...labels, ...screens, ...playlists])
      if (row.team_id)
        teams.set(row.team_id, (teams.get(row.team_id) ?? 0) + 1);
    const team = [...teams].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0]?.[0];
    return {
      account: team ?? "screenly",
      label: "Screenly",
      media,
      playlists: [...catalogPlaylists, ...combined.values()],
      layouts: [],
      groups,
      screens: catalogScreens,
      schedules,
      not_imported: notImported,
      notes: []
    };
  }
  async fetchMedia(media, destination) {
    const url = media.fetch?.url;
    if (!url)
      throw vendorBadResponse(NAME6, "a media entry has no file address");
    return this.client.download(url, destination);
  }
};
function requireIds(path2, rows2) {
  rows2.forEach((row, index) => {
    if (typeof row.id !== "string" || row.id === "")
      throw vendorBadResponse(NAME6, "".concat(path2, "[").concat(index, "].id is missing"));
  });
}
function validZone5(zone) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}
var screenly = {
  id: "screenly",
  name: NAME6,
  inputs: {},
  credentials: [{ name: "SCREENLY_API_TOKEN", secret: true, required: true, help: "An API token from your Screenly workspace settings." }],
  connect: [
    "In Screenly open Settings (the workspace settings, not your account), then Security, then Tokens, and add a token. It is shown once.",
    "A token can do what its creator can do, and Screenly has no read-only token: make it from a User-role account made for this, and delete the token when the import is done.",
    "Put SCREENLY_API_TOKEN=... in a file and name it with --credentials."
  ],
  maps: [
    "Image, video and audio assets become media, and web assets become web page items; playlists keep their item order and durations.",
    "Labels become groups; a screen's own label stays with that screen. Screens become waiting screens with their time zone.",
    "A screen's always-on playlist is its default content (several play as one combined playlist). Every other playlist rule on a label (weekdays, time of day, dates, alternatives joined by OR) becomes campaigns for that label's screens."
  ],
  skips: [
    "Streaming, Edge App and PDF assets are listed.",
    "Rules campaigns cannot express (an operator or form the Screenly predicate reference does not list, a window that ends before it starts) and playlists switched off are listed.",
    "Shared playlists from other workspaces and playlist transitions do not come over."
  ],
  docs: [
    "https://developer.screenly.io/api_v4_1/",
    "https://www.screenly.io/docs/scheduling/advanced/predicates/",
    "https://www.screenly.io/docs/developers/overview/api-tokens/"
  ],
  example: "screenrig migrate scan --from screenly --credentials ./screenly-key.txt",
  async open(input) {
    const token = input.credentials.SCREENLY_API_TOKEN;
    const client = input.http.client({ base: BASE2, auth: { Authorization: "Token ".concat(token) } });
    return new ScreenlySession(client, input.now);
  }
};

// dist/migrate/vendors/index.js
var vendors_exports = {};
__export(vendors_exports, {
  VENDORS: () => VENDORS
});
var VENDORS = [
  files,
  // xy entries: insert directly below this line.
  xibo,
  yodeck,
  // more entries: insert directly below this line.
  anthias,
  optisigns,
  screencloud,
  screenly
];

export {
  DEFAULT_CANVAS,
  truncate,
  cleanName,
  uploadName,
  allocateTags,
  campaignTiming,
  tagAudience,
  buildPlaylist,
  buildLayout,
  placeholderBody,
  map_exports,
  vendorBadResponse,
  createVendorHttp,
  http_exports,
  csv_exports,
  zip_exports,
  openLocalFiles,
  local_files_exports,
  files_exports,
  xy_rows_exports,
  xibo_exports,
  yodeck_exports,
  anthias_exports,
  optisigns_exports,
  screencloud_exports,
  screenly_exports,
  VENDORS,
  vendors_exports
};
