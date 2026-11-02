import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  table
} from "./chunk-ZHIJOAOF.js";
import {
  instantInZone
} from "./chunk-KGGOHJPO.js";
import {
  usageError
} from "./chunk-CO45JNNU.js";

// dist/change-control.js
import { isDeepStrictEqual } from "node:util";
var REACH_IDS_SHOWN = 10;
var GROUPS_SHOWN = 5;
var STRETCHES_SHOWN = 12;
var RFC3339_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})$/;
function calendarInstantOption(flag) {
  return (value) => {
    if (!RFC3339_INSTANT.test(value) || !Number.isFinite(Date.parse(value))) {
      throw usageError("".concat(flag, " takes an instant with a zone, such as 2026-12-01T00:00:00Z or 2026-12-01T00:00:00-05:00."));
    }
    return value;
  };
}
function authorText(author) {
  return author ? "".concat(author.name, " (").concat(author.type, ")") : "\u2014";
}
function changeText(item) {
  return (item.change === "restored" || item.change === "promoted") && item.restored_from !== void 0 ? "".concat(item.change, " from ").concat(item.restored_from) : item.change;
}
function nextPageLine(command, page) {
  const next = typeof page?.next_cursor === "string" && page.next_cursor ? page.next_cursor : void 0;
  return next ? ["next: ".concat(command, " --after ").concat(next)] : [];
}
function campaignRevisionLines(id, page) {
  const items = Array.isArray(page?.items) ? page.items : [];
  const last = !(typeof page?.next_cursor === "string" && page.next_cursor);
  return [
    "Campaign ".concat(id, " revisions (").concat(items.length, ")"),
    ...items.length ? table(["REVISION", "CHANGE", "STATE", "CREATED", "AUTHOR", "NAME", "PLAYLIST"], items.map((item) => [
      "".concat(item.revision).concat(item.current ? " (current)" : ""),
      changeText(item),
      item.campaign?.paused ? "paused" : "live",
      item.created_at,
      authorText(item.author),
      item.campaign?.name ?? "",
      item.campaign?.playlist_id ?? ""
    ])) : ["No revisions"],
    ...items.length && last && items.every((item) => item.campaign?.paused) ? ["No revision has been published: this campaign is a draft."] : [],
    ...nextPageLine("screenrig campaign revisions ".concat(id), page)
  ];
}
function screenScheduleRevisionLines(id, page) {
  const items = Array.isArray(page?.items) ? page.items : [];
  return [
    "Screen ".concat(id, " playlist schedule revisions (").concat(items.length, ")"),
    ...items.length ? table(["REVISION", "CHANGE", "ENTRIES", "DRAFTS", "CREATED", "AUTHOR"], items.map((item) => {
      const entries = Array.isArray(item.entries) ? item.entries : [];
      return ["".concat(item.revision).concat(item.current ? " (current)" : ""), changeText(item), String(entries.length), String(entries.filter((entry) => entry.paused).length), item.created_at, authorText(item.author)];
    })) : ["No revisions"],
    ...nextPageLine("screenrig screen schedule revisions ".concat(id), page)
  ];
}
function reachLine(verb, reach) {
  const count = reach?.count ?? 0;
  if (!count)
    return "".concat(verb, " no screens");
  const ids = Array.isArray(reach?.screen_ids) ? reach.screen_ids : [];
  const shown = ids.slice(0, REACH_IDS_SHOWN).join(", ");
  const more = count > REACH_IDS_SHOWN ? " and ".concat(count - REACH_IDS_SHOWN, " more (the JSON lists up to ").concat(ids.length, " ids)") : "";
  return "".concat(verb, " ").concat(count, " screen").concat(count === 1 ? "" : "s", ": ").concat(shown).concat(more);
}
function localMinute(value, timezone) {
  return instantInZone(value, timezone).slice(0, 16);
}
function levelText(group, id) {
  if (!id)
    return "nothing plays";
  const level = [...group.levels ?? [], ...group.paused_levels ?? []].find((item) => item.id === id);
  return level ? "".concat(id, " (").concat(level.playlist_id, ")") : id;
}
function groupLines(group) {
  const zone = group.timezone || void 0;
  const onScreen = (Array.isArray(group.on_screen) ? group.on_screen : []).filter((item) => !item.region);
  const display = Math.min(...onScreen.map((item) => item.display));
  const stretches = [];
  for (const item of onScreen.filter((candidate) => candidate.display === display)) {
    const previous = stretches.at(-1);
    if (previous && previous.to === item.from && previous.level_id === item.level_id)
      previous.to = item.to;
    else
      stretches.push({ from: item.from, to: item.to, level_id: item.level_id });
  }
  const drafts = (Array.isArray(group.spans) ? group.spans : []).filter((span) => span.state === "paused");
  const row = (from, to, text) => "    ".concat(localMinute(from, zone), " \u2192 ").concat(localMinute(to, zone), "  ").concat(text);
  return [
    "  ".concat(group.screens, " screen").concat(group.screens === 1 ? "" : "s", ", ").concat(zone ?? "UTC").concat(group.displays > 1 ? ", display ".concat(display) : ""),
    ...stretches.length ? stretches.slice(0, STRETCHES_SHOWN).map((item) => row(item.from, item.to, levelText(group, item.level_id))) : ["    nothing is scheduled"],
    ...stretches.length > STRETCHES_SHOWN ? ["    \u2026 ".concat(stretches.length - STRETCHES_SHOWN, " more stretches (see the JSON)")] : [],
    ...drafts.slice(0, STRETCHES_SHOWN).map((span) => row(span.from, span.to, "draft ".concat(levelText(group, span.level_id)))),
    ...drafts.length > STRETCHES_SHOWN ? ["    \u2026 ".concat(drafts.length - STRETCHES_SHOWN, " more draft stretches (see the JSON)")] : []
  ];
}
function calendarSideLines(label, calendar) {
  const groups = Array.isArray(calendar?.groups) ? calendar.groups : [];
  return [
    label,
    ...groups.length ? groups.slice(0, GROUPS_SHOWN).flatMap(groupLines) : ["  no screens"],
    ...groups.length > GROUPS_SHOWN ? ["  \u2026 ".concat(groups.length - GROUPS_SHOWN, " more groups (see the JSON)")] : [],
    ...calendar?.truncated ? ["  (the calendar was cut short; ask for a shorter window)"] : []
  ];
}
function schedulePreviewLines(title, preview) {
  const before = preview?.calendar?.before;
  const after = preview?.calendar?.after;
  const window = "".concat(before?.from ?? after?.from ?? "", " to ").concat(before?.to ?? after?.to ?? "");
  return [
    "Preview of ".concat(title, ". Nothing was changed."),
    reachLine("Gains", preview?.gained),
    reachLine("Loses", preview?.lost),
    ...isDeepStrictEqual(before, after) ? ["Calendar ".concat(window, ": no change")] : ["Calendar ".concat(window), ...calendarSideLines("Before", before), ...calendarSideLines("After", after)]
  ];
}

export {
  calendarInstantOption,
  campaignRevisionLines,
  screenScheduleRevisionLines,
  schedulePreviewLines
};
