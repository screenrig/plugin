import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  accessClaims,
  accessLabel,
  campaignAudienceText,
  flagString,
  isValidIdempotencyKey,
  newIdempotencyKey,
  normalizeInstant,
  readConfigFile,
  sameCredential,
  successEnvelope,
  withConfigLock,
  writeConfigAtomic
} from "./chunk-D2RLMLYO.js";
import {
  USER_AGENT,
  processSettings
} from "./chunk-V3QE7ELU.js";
import {
  isResourceID
} from "./chunk-SFYZH3GR.js";
import {
  CliError,
  ExitCode,
  configError,
  fileError,
  makeProblem,
  networkError,
  normalizeProblem,
  redactText,
  timeoutError,
  unexpectedResponseError,
  usageError
} from "./chunk-JP4OQPAN.js";
import {
  __export
} from "./chunk-3FYAGULW.js";

// dist/reviews.js
var reviews_exports = {};
__export(reviews_exports, {
  DECISION_NOTE_MAX: () => DECISION_NOTE_MAX,
  PENDING_REVIEW_SENTENCE: () => PENDING_REVIEW_SENTENCE,
  PROTECTED_REVIEW_SENTENCE: () => PROTECTED_REVIEW_SENTENCE,
  REVIEW_NOTE_HEADER: () => REVIEW_NOTE_HEADER,
  REVIEW_NOTE_MAX: () => REVIEW_NOTE_MAX,
  accessFields: () => accessFields,
  accessLimitHint: () => accessLimitHint,
  decisionNote: () => decisionNote,
  mediaChangeText: () => mediaChangeText,
  mediaReplaceLines: () => mediaReplaceLines,
  pendingReviewLines: () => pendingReviewLines,
  pendingReviewOf: () => pendingReviewOf,
  pendingReviewWarning: () => pendingReviewWarning,
  plainText: () => plainText,
  playlistChangeText: () => playlistChangeText,
  protectedChangeLines: () => protectedChangeLines,
  reviewDetailLines: () => reviewDetailLines,
  reviewListLines: () => reviewListLines,
  reviewNext: () => reviewNext,
  reviewNote: () => reviewNote,
  reviewNoteHeaders: () => reviewNoteHeaders
});
var REVIEW_NOTE_HEADER = "screenrig-review-note";
var REVIEW_NOTE_MAX = 280;
var DECISION_NOTE_MAX = 500;
function plainNote(value, flag, max) {
  const note = value.trim();
  const scalars = [...note];
  if (!note || scalars.length > max || new RegExp("\\p{Cc}", "u").test(note) || scalars.some((char) => {
    const code = char.codePointAt(0);
    return code >= 55296 && code <= 57343;
  })) {
    throw usageError("".concat(flag, " takes plain text of 1 to ").concat(max, " characters, without control characters."));
  }
  return note;
}
function reviewNote(value) {
  return plainNote(value, "--note", REVIEW_NOTE_MAX);
}
function decisionNote(value) {
  return plainNote(value, "--note", DECISION_NOTE_MAX);
}
function reviewNoteHeaders(note) {
  return note === void 0 ? {} : { [REVIEW_NOTE_HEADER]: encodeURIComponent(note) };
}
function pendingReviewOf(response) {
  if (response.status !== 202)
    return void 0;
  const body = response.body;
  if (!body || typeof body !== "object" || body.status !== "pending_review")
    return void 0;
  const review = body.review;
  if (!review || typeof review.id !== "string" || !review.id || typeof review.url !== "string" || !review.url || typeof review.kind !== "string" || !review.subject || typeof review.subject.id !== "string") {
    throw unexpectedResponseError("A pending_review answer does not match the generated ReviewPending contract.", void 0, "The write may have become a review. List reviews with screenrig reviews list before writing again.");
  }
  return body;
}
function reviewNext(id) {
  return { command: "screenrig reviews show ".concat(id), argv: ["reviews", "show", id], reason: "Check the decision after the person reviews it." };
}
function pendingReviewWarning(review) {
  return { code: "pending_review", message: "Waiting for a person to approve: ".concat(review.url) };
}
var PENDING_REVIEW_SENTENCE = "Nothing changes on glass until a person approves it; they can also reject it or ask for changes. Do not repeat the write: check the decision later.";
var PROTECTED_REVIEW_SENTENCE = "This change reaches a protected screen folder, so an approver other than the person who proposed it, or who is responsible for this agent, must decide it. Nothing changes until then. Do not repeat the write: check the decision later.";
function plainText(value) {
  return value.replace(new RegExp("\\p{Cc}", "gu"), " ");
}
var KIND_LABELS = {
  playlist_change: "Playlist change",
  screen_change: "Screen change",
  ad_creative: "Ad creative",
  protected_change: "Protected change"
};
function kindLabel(kind) {
  return KIND_LABELS[kind] ?? kind;
}
function reviewLabel(review) {
  if (review.subject?.type !== "media")
    return kindLabel(review.kind);
  if (review.playlist_change?.operation === "media_replace")
    return review.playlist_change.media_replace?.source === "restore" ? "Media restore" : "Media replacement";
  return review.playlist_change?.media_change?.before ? "Media change" : "New media";
}
function subjectText(subject) {
  if (!subject)
    return void 0;
  return "".concat(subject.type, " ").concat(plainText(subject.name), " (").concat(subject.id, ")");
}
function screensText(count2) {
  return "".concat(count2, " screen").concat(count2 === 1 ? "" : "s");
}
function pendingReviewLines(review) {
  return [
    "".concat(kindLabel(review.kind), " waiting for review"),
    "review_id: ".concat(review.id),
    ...review.subject ? ["subject: ".concat(subjectText(review.subject))] : [],
    ...typeof review.impact?.screens === "number" ? ["impact: approving changes ".concat(screensText(review.impact.screens))] : [],
    "url: ".concat(review.url),
    "next: screenrig reviews show ".concat(review.id),
    review.kind === "protected_change" ? PROTECTED_REVIEW_SENTENCE : PENDING_REVIEW_SENTENCE
  ];
}
function proposerText(proposer) {
  if (!proposer)
    return void 0;
  const who = proposer.kind === "agent" ? "agent ".concat(plainText(proposer.agent_name ?? proposer.agent_id ?? "")) : proposer.kind === "client" ? "service client ".concat(plainText(proposer.client_name ?? proposer.client_id ?? "")) : "buyer ".concat(plainText(proposer.organization_name ?? proposer.project_id ?? ""));
  return proposer.person ? "".concat(who.trim(), ", for ").concat(plainText(proposer.person.name)) : who.trim();
}
function deciderText(review) {
  const by = review.decided_by;
  const name = by ? plainText(by.name ?? by.agent_name ?? by.user_id ?? by.agent_id ?? "") : "";
  if (!review.decided_at && !name)
    return void 0;
  return [review.state, name ? "by ".concat(name) : "", review.decided_at ? "at ".concat(review.decided_at) : ""].filter(Boolean).join(" ");
}
function count(items) {
  return Array.isArray(items) ? items.length : 0;
}
function playlistChangeText(change) {
  const diff = change.diff;
  const operation = change.operation === "create" ? "new playlist" : change.operation === "media_replace" ? "".concat(change.media_replace?.source === "restore" ? "restore of an earlier file" : "replacement file", " for media that playlists and schedules already play") : change.operation === "selector_refresh" ? "".concat(change.media_change?.before ? "changed tags or folder of approved media" : "new media", " for the tag, folder or all selectors of approved playlists") : "update of revision ".concat(change.base_revision);
  if (!diff)
    return operation;
  const pages = [
    count(diff.pages_changed) ? "".concat(count(diff.pages_changed), " changed") : "",
    count(diff.pages_added) ? "".concat(count(diff.pages_added), " added") : "",
    count(diff.pages_removed) ? "".concat(count(diff.pages_removed), " removed") : ""
  ].filter(Boolean);
  const media = [
    count(diff.media_added) ? "".concat(count(diff.media_added), " added") : "",
    count(diff.media_removed) ? "".concat(count(diff.media_removed), " removed") : ""
  ].filter(Boolean);
  return [
    operation,
    pages.length ? "pages ".concat(pages.join(", ")) : "pages unchanged",
    ...diff.name_changed ? ["name changed"] : [],
    diff.soundtrack_changed ? "soundtrack changed" : "soundtrack unchanged",
    ...media.length ? ["media ".concat(media.join(", "))] : []
  ].join("; ");
}
var SCREEN_ACTION_LABELS = {
  assign: "assign a playlist",
  set_playlist_schedule: "set the playlist schedule",
  clear_playlist_schedule: "clear the playlist schedule",
  takeover: "take over",
  takeover_clear: "clear the takeover"
};
function screenChangeLines(change) {
  const screens = change.screens ?? { count_at_request: 0 };
  const target = screens.tag !== void 0 ? "tag ".concat(plainText(screens.tag)) : Array.isArray(screens.ids) ? screens.ids.join(", ") : void 0;
  const result = change.result;
  return [
    "action: ".concat(SCREEN_ACTION_LABELS[change.action] ?? change.action),
    ...target ? ["screens: ".concat(target, " (").concat(screensText(screens.count_at_request ?? 0), " when proposed)")] : [],
    ...Array.isArray(change.playlist_ids) && change.playlist_ids.length ? ["playlists: ".concat(change.playlist_ids.join(", "))] : [],
    ...result ? ["result: ".concat(result.matched, " matched, ").concat(result.succeeded, " succeeded, ").concat(result.failed, " failed").concat(result.applying ? "; still applying to the rest" : "")] : []
  ];
}
function previouslyRejectedText(change) {
  const listed = change?.previously_rejected_media;
  const ids = Array.isArray(listed) ? listed.filter((id) => typeof id === "string" && id) : [];
  if (!ids.length)
    return void 0;
  return "".concat(ids.join(", "), " ").concat(ids.length === 1 ? "was" : "were", " rejected before");
}
function tagList(tags) {
  return Array.isArray(tags) && tags.length ? tags.map(plainText).join(", ") : "none";
}
function folderText(folderId) {
  return folderId ? "folder ".concat(plainText(folderId)) : "library root";
}
function sameTags(a, b) {
  const left = [...a ?? []].sort(), right = [...b ?? []].sort();
  return left.length === right.length && left.every((tag, index) => tag === right[index]);
}
function mediaChangeText(change) {
  const after = change.after ?? {};
  if (!change.before)
    return "new upload; tags ".concat(tagList(after.tags), "; ").concat(folderText(after.folder_id));
  const before = change.before;
  const tags = sameTags(before.tags, after.tags) ? "tags ".concat(tagList(after.tags), " unchanged") : "tags ".concat(tagList(before.tags), " \u2192 ").concat(tagList(after.tags));
  const folder = (before.folder_id ?? "") === (after.folder_id ?? "") ? "".concat(folderText(after.folder_id), " unchanged") : "".concat(folderText(before.folder_id), " \u2192 ").concat(folderText(after.folder_id));
  return "".concat(tags, "; ").concat(folder);
}
function mediaPlaylistText(playlist) {
  const ids = (list) => Array.isArray(list) ? list.filter((id) => typeof id === "string" && id) : [];
  const added = ids(playlist.media_added), removed = ids(playlist.media_removed);
  const changes = [
    ...added.length ? ["starts playing ".concat(added.join(", "))] : [],
    ...removed.length ? ["stops playing ".concat(removed.join(", "))] : []
  ];
  return "".concat(plainText(playlist.name), " (").concat(playlist.id, ", ").concat(screensText(playlist.screens), ")").concat(changes.length ? ": ".concat(changes.join("; ")) : "");
}
function fileText(file) {
  if (!file)
    return "-";
  const size = typeof file.width === "number" && typeof file.height === "number" ? " ".concat(file.width, "x").concat(file.height) : "";
  const duration = typeof file.duration_ms === "number" ? " ".concat((file.duration_ms / 1e3).toFixed(1), " s") : "";
  return "".concat(plainText(file.content_type)).concat(size).concat(duration, ", ").concat(file.bytes, " bytes, sha256 ").concat(plainText(file.sha256).slice(0, 12));
}
function mediaReplaceLines(change) {
  const playlists = Array.isArray(change.playlists) ? change.playlists : [];
  return [
    "file: ".concat(plainText(change.filename), " (").concat(change.media_id, ")"),
    "source: ".concat(change.source === "restore" ? "restore of version ".concat(change.restored_from ?? "?") : "replacement", "; becomes version ").concat(change.version),
    ...change.note === void 0 ? [] : ["note: ".concat(plainText(change.note))],
    "before: ".concat(fileText(change.before)),
    "after: ".concat(fileText(change.after)),
    ...change.aspect_changed ? ["aspect ratio: changed, so check how the playlists below look"] : [],
    ...playlists.length ? ["playlists: ".concat(playlists.map((playlist) => "".concat(plainText(playlist.name), " (").concat(playlist.id, ")")).join(", "))] : []
  ];
}
var PROTECTED_SUBKINDS = {
  campaign_create: "create a campaign",
  campaign_update: "change a campaign",
  campaign_delete: "delete a campaign",
  folder_create: "create a screen folder",
  folder_update: "change a screen folder",
  folder_delete: "delete a screen folder",
  folder_unprotect: "remove a screen folder's protection",
  screens_move: "move screens and screen folders"
};
function idList(ids) {
  return Array.isArray(ids) && ids.length ? ids.map(plainText).join(", ") : "none";
}
function protectedChangeLines(change) {
  const lines = ["".concat(PROTECTED_SUBKINDS[change.subkind] ?? plainText(String(change.subkind)))];
  const campaign = change.campaign;
  if (campaign) {
    const body = campaign.body ?? {};
    const audience = body.audience && typeof body.audience === "object" ? campaignAudienceText(body.audience) : void 0;
    const others = Object.keys(body).filter((key) => !["name", "playlist_id", "audience"].includes(key)).map(plainText);
    lines.push(...campaign.id ? ["campaign: ".concat(plainText(campaign.id))] : [], ...typeof body.name === "string" ? ["name: ".concat(plainText(body.name))] : [], ...typeof body.playlist_id === "string" ? ["playlist: ".concat(plainText(body.playlist_id))] : [], ...audience ? ["audience: ".concat(plainText(audience))] : [], ...others.length ? ["also sets: ".concat(others.join(", "))] : []);
  }
  const folder = change.folder;
  if (folder) {
    lines.push(...folder.id ? ["folder: ".concat(plainText(folder.id))] : [], ...folder.name !== void 0 ? ["name: ".concat(plainText(folder.name))] : [], ...change.subkind === "folder_create" || folder.move ? ["".concat(folder.move ? "moves to" : "inside", ": ").concat(folder.parent_id ? "folder ".concat(plainText(folder.parent_id)) : "the project root")] : [], ...folder.set_default ? ["default playlist: ".concat(folder.default_playlist_id ? plainText(folder.default_playlist_id) : "cleared")] : []);
  }
  const move = change.move;
  if (move) {
    lines.push("into: ".concat(move.folder_id ? "folder ".concat(plainText(move.folder_id)) : "the project root"), "screens: ".concat(idList(move.screen_ids)), "folders: ".concat(idList(move.folder_ids)));
  }
  return lines;
}
function reviewDetailLines(review) {
  const fields = [
    ["subject", subjectText(review.subject)],
    ["proposed_by", proposerText(review.proposer)],
    ["note", review.note === void 0 ? void 0 : plainText(review.note)],
    ["created_at", review.created_at],
    ["decision", deciderText(review)],
    ["decision_note", review.decision_note === void 0 ? void 0 : plainText(review.decision_note)],
    ["impact", typeof review.impact?.screens === "number" ? "approving changes ".concat(screensText(review.impact.screens)) : void 0],
    ["change", review.playlist_change ? playlistChangeText(review.playlist_change) : void 0],
    ["protected", review.protected ? "a second approver decides this: not the proposer, nor the person responsible for the proposing agent" : void 0],
    ["protected_change", review.protected_change ? protectedChangeLines(review.protected_change) : void 0],
    ["media_change", review.playlist_change?.media_change ? mediaChangeText(review.playlist_change.media_change) : void 0],
    ["media_replace", review.playlist_change?.media_replace ? mediaReplaceLines(review.playlist_change.media_replace) : void 0],
    ["applied_revision", review.playlist_change?.applied_revision === void 0 ? void 0 : String(review.playlist_change.applied_revision)],
    ["creative", review.ad_creative ? "".concat(review.ad_creative.creative_id, " revision ").concat(review.ad_creative.creative_revision) : void 0],
    ["media_playlists", review.playlist_change?.media_playlists?.length ? review.playlist_change.media_playlists.map(mediaPlaylistText) : void 0],
    ...review.blockers?.length ? [["blockers", review.blockers.map((blocker) => "".concat(blocker.id, " ").concat(blocker.state, " (").concat(subjectText(blocker.subject) ?? "-", ")")).join("; ")]] : [["blocked_by", review.blocked_by?.length ? review.blocked_by.join(", ") : void 0]],
    ["dependents", review.dependents?.length ? review.dependents.join(", ") : void 0],
    ["previously_rejected_media", previouslyRejectedText(review.playlist_change)],
    ["previous_review_id", review.previous_review_id],
    ["superseded_by", review.superseded_by],
    ["url", review.url]
  ];
  return [
    "Review ".concat(review.id, ": ").concat(reviewLabel(review), ", ").concat(review.state),
    ...fields.flatMap(([key, value]) => Array.isArray(value) ? ["".concat(key, ":"), ...value.map((line) => "  ".concat(line))] : value ? ["".concat(key, ": ").concat(value)] : []),
    ...review.screen_change ? screenChangeLines(review.screen_change) : []
  ];
}
function reviewListLines(list) {
  const items = Array.isArray(list.items) ? list.items : [];
  return [
    "Reviews (".concat(items.length, "; ").concat(list.pending_count ?? 0, " pending)"),
    ...items.map((review) => [
      review.id,
      review.kind,
      review.state,
      ...review.protected && review.kind !== "protected_change" ? ["protected"] : [],
      subjectText(review.subject) ?? "-",
      review.created_at,
      ...review.playlist_change?.media_change ? [mediaChangeText(review.playlist_change.media_change)] : [],
      ...review.playlist_change?.media_replace ? ["".concat(review.playlist_change.media_replace.source === "restore" ? "restore" : "replacement", " becomes version ").concat(review.playlist_change.media_replace.version)] : []
    ].join("  "))
  ];
}
var LIMITED_BY = {
  project: "the project requires review for agent changes",
  person: "the responsible person cannot approve reviews"
};
function accessFields(self) {
  const effective = self.effective_access ?? self.access;
  const limited = self.access_limited_by && effective !== self.access ? self.access_limited_by : void 0;
  return {
    data: {
      ...self.access ? { access: self.access } : {},
      ...effective ? { effective_access: effective } : {},
      ...limited ? { access_limited_by: limited } : {}
    },
    lines: [
      ["access", self.access ? accessLabel(self.access) : void 0],
      ["effective_access", effective && limited ? "".concat(accessLabel(effective), " (").concat(LIMITED_BY[limited], ")") : void 0]
    ]
  };
}
function accessLimitHint(limitedBy) {
  return limitedBy === "project" ? "This project requires review for agent changes, so this credential acts with Propose access whatever its sign-in grants: it proposes playlist and screen changes for review and cannot do this. A person does it in the dashboard, or turns off Require review for agent changes there." : "The person responsible for this agent cannot approve reviews in this project, so the agent acts with Propose access: it proposes playlist and screen changes for review and cannot do this. The project owner can turn on Can approve for that person in the dashboard, or a person does it there.";
}

// dist/project-state.js
var project_state_exports = {};
__export(project_state_exports, {
  assertProjectCredential: () => assertProjectCredential,
  projectConfigFor: () => projectConfigFor,
  selectProject: () => selectProject,
  withProjectConfig: () => withProjectConfig
});
var PROJECT_FIELDS = [
  "project_name",
  "organization_id",
  "organization_name",
  "screen_provision",
  "browser_setup",
  "media_generate",
  "pending_writes"
];
function storedProjects(config) {
  const projects = config.projects ?? {};
  if (!projects || typeof projects !== "object" || Array.isArray(projects) || Object.values(projects).some((entry) => !entry || typeof entry !== "object" || Array.isArray(entry))) {
    throw configError("Stored project state is invalid; no request was sent.");
  }
  return projects;
}
function projectConfigFor(config, resolved) {
  const projects = storedProjects(config);
  const id = resolved.projectId;
  if (id && config.project_id === id)
    return config;
  if (id && Object.hasOwn(projects, id)) {
    const entry = projects[id];
    const view = { ...config, project_id: id };
    for (const field of PROJECT_FIELDS)
      delete view[field];
    return { ...view, ...pickProjectState(entry) };
  }
  if (id && config.project_id !== id) {
    const view = { ...config, project_id: id };
    for (const field of PROJECT_FIELDS)
      delete view[field];
    return view;
  }
  return config;
}
function pickProjectState(config) {
  return Object.fromEntries(PROJECT_FIELDS.filter((field) => config[field] !== void 0).map((field) => [field, config[field]]));
}
function withProjectConfig(config, resolved, updated) {
  const id = resolved.projectId;
  if (!id)
    return updated;
  const projects = { ...storedProjects(config) };
  if (config.project_id) {
    projects[config.project_id] = pickProjectState(config);
  }
  projects[id] = pickProjectState(updated);
  const result = { ...config, projects, updated_at: updated.updated_at ?? config.updated_at };
  if (config.project_id === id) {
    for (const field of PROJECT_FIELDS)
      delete result[field];
    return { ...result, ...projects[id] };
  }
  return result;
}
function assertProjectCredential(config, resolved) {
  if (!sameCredential(config.token ?? (resolved.projectId ? config.identity_token : void 0), resolved.token)) {
    throw configError("The command's project credential changed. Retry with the current membership credential.");
  }
}
function selectProject(config, id) {
  const captured = config.project_id ? withProjectConfig(config, { projectId: config.project_id }, config) : config;
  const slot = storedProjects(captured)[id];
  if (!config.token && !config.identity_token) {
    throw configError("The selected project has no stored credential. Run project list and project use again.");
  }
  const selected = { ...captured, project_id: id };
  for (const field of PROJECT_FIELDS)
    delete selected[field];
  return { ...selected, ...pickProjectState(slot ?? {}) };
}

// dist/project-context.js
var project_context_exports = {};
__export(project_context_exports, {
  cacheProjectContexts: () => cacheProjectContexts,
  clearResultContext: () => clearResultContext,
  contextFromProject: () => contextFromProject,
  formatResultContext: () => formatResultContext,
  projectName: () => projectName,
  resultContext: () => resultContext,
  setResultContext: () => setResultContext,
  validateProjectContext: () => validateProjectContext
});
var contexts = /* @__PURE__ */ new WeakMap();
function resultContext(runtime) {
  return contexts.get(runtime);
}
function clearResultContext(runtime) {
  contexts.delete(runtime);
}
function formatResultContext(runtime) {
  const context = resultContext(runtime);
  if (!context)
    return "";
  const safe = (value) => value.replace(/[\p{Cc}\p{Cf}]/gu, (character) => JSON.stringify(character).slice(1, -1));
  return "organization: ".concat(safe(context.organization?.name ?? "(unknown)"), "\nproject: ").concat(safe(context.project.name), " (").concat(safe(context.project.id), ")");
}
function setResultContext(runtime, resolved) {
  if (!resolved.projectId || !resolved.projectName)
    return;
  contexts.set(runtime, {
    project: { id: resolved.projectId, name: resolved.projectName },
    ...resolved.organizationId && resolved.organizationName ? { organization: { id: resolved.organizationId, name: resolved.organizationName } } : {}
  });
}
function projectName(value, label = "Project name") {
  if (typeof value !== "string" || !value.trim() || [...value.trim()].length > 60 || /[\p{Cc}\p{Cf}]/u.test(value)) {
    throw usageError("".concat(label, " must contain 1\u201360 characters without controls."));
  }
  return value.trim();
}
function validateProjectContext(value) {
  const context = value;
  if (!context?.project || !isResourceID(context.project.id, "project") || typeof context.project.name !== "string" || !context.project.name || !context.organization || typeof context.organization.id !== "string" || !/^(?:(?:stage|qa|development)_)?org_[A-Za-z0-9_-]+$/.test(context.organization.id) || typeof context.organization.name !== "string" || !context.organization.name || context.project.organization_id && context.project.organization_id !== context.organization.id) {
    throw configError("Project response does not match its organization and project context.");
  }
  return {
    project: context.project,
    organization: { id: context.organization.id, name: context.organization.name },
    ...typeof context.owner_user_id === "string" ? { owner_user_id: context.owner_user_id } : {}
  };
}
function contextFromProject(project) {
  return validateProjectContext({ project, organization: { id: project.organization_id, name: project.organization_name } });
}
async function cacheProjectContexts(runtime, resolved, values, options = {}) {
  const verified = values.map(validateProjectContext);
  const fs = { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir };
  await withConfigLock(resolved.configPath, fs, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    let current = await readConfigFile(resolved.configPath, fs);
    if (!current || current.api_url.replace(/\/+$/, "") !== resolved.apiUrl)
      throw configError("Stored API configuration changed before project context persistence.");
    if (options.identityToken && !sameCredential(current.identity_token, options.identityToken, "identity"))
      throw configError("Identity credential changed before project selection.");
    if (options.credential && !sameCredential(projectConfigFor(current, resolved).token ?? current.identity_token, options.credential)) {
      throw configError("Project credential changed before its context was stored.");
    }
    for (const context of verified) {
      const id = context.project.id;
      const view = current.projects?.[id] ? projectConfigFor(current, { ...resolved, projectId: id }) : current.project_id === id || !current.project_id && options.credential && current.token === options.credential ? current : { ...current, project_id: id, screen_provision: void 0, browser_setup: void 0, media_generate: void 0, pending_writes: void 0 };
      current = withProjectConfig(current, { ...resolved, projectId: id }, {
        ...view,
        project_name: context.project.name,
        organization_id: context.organization.id,
        organization_name: context.organization.name,
        updated_at: runtime.now().toISOString()
      });
    }
    if (options.select)
      current = selectProject(current, options.select);
    else if (!current.project_id && options.credential && verified.length === 1)
      current = selectProject(current, verified[0].project.id);
    await writeConfigAtomic(resolved.configPath, current, fs);
  });
  const selected = verified.find((context) => context.project.id === (options.select ?? resolved.projectId)) ?? (!resolved.projectId && options.credential && verified.length === 1 ? verified[0] : void 0);
  if (!selected)
    return resolved;
  const updated = {
    ...resolved,
    projectId: selected.project.id,
    projectName: selected.project.name,
    organizationId: selected.organization.id,
    organizationName: selected.organization.name
  };
  setResultContext(runtime, updated);
  return updated;
}

// dist/project-routing.js
var project_routing_exports = {};
__export(project_routing_exports, {
  projectRequest: () => projectRequest,
  projectStreamQuery: () => projectStreamQuery
});
var PROJECT_ROUTES = /* @__PURE__ */ new Set([
  "project",
  "project/deletion-preview",
  "project/owner",
  "project/move",
  "project/moves",
  "project/capabilities",
  "project/browser-links/claim",
  "invitations",
  "applications",
  "applications/uploads",
  "playlists",
  "screens",
  "screens/pair",
  "screens/provision",
  "screens/actions",
  "screens/move",
  "screen-folders",
  "triggers",
  "campaigns",
  "events",
  "billing/balance",
  "billing/statement",
  "billing/usage",
  "advertising/network",
  "advertising/network/rate",
  "advertising/inventory",
  "advertising/slots",
  "advertising/memberships",
  "advertising/networks",
  "advertising/creatives",
  "advertising/campaigns",
  "advertising/reviews",
  "advertising/reports/spend",
  "advertising/reports/delivery",
  "advertising/reports/fill",
  "advertising/direct-campaigns",
  "advertising/availability",
  "playback",
  "playback/plays",
  "playback/totals",
  "playback/completeness",
  "health/trend",
  "uptime/daily",
  "card-types",
  "card-data",
  "cards",
  "media",
  "media/generations",
  "media-folders",
  "media/move",
  "media/uploads",
  "selectors/preview",
  "feedback/bugs",
  "feedback/features",
  "service-clients",
  "fleet-links",
  "webhooks",
  "notifications",
  "alerts",
  "alert-mutes",
  "notes",
  "support/status",
  "support/conversations",
  "reviews",
  "agents/self",
  "agents/self/disconnect"
]);
var GLOBAL_LISTS = /* @__PURE__ */ new Set(["screens", "applications", "playlists", "media", "cards", "media-folders", "screen-folders", "notes"]);
function projectRequest(request, projectId) {
  if (!projectId)
    return request;
  const route = request.path.startsWith("/api/") ? request.path.slice(5) : "";
  const read = request.method === "GET" || request.method === "HEAD";
  if (read && /^playlists\/[^/]+(?:\/instances)?$/.test(route) || request.method === "POST" && /^playlists\/[^/]+\/expand$/.test(route)) {
    return { ...request, query: { ...request.query, project: projectId } };
  }
  if (read && GLOBAL_LISTS.has(route))
    return { ...request, query: { ...request.query, project: projectId } };
  if (route === "card-types" || route.startsWith("card-types/"))
    return { ...request, query: { ...request.query, project: projectId } };
  if (PROJECT_ROUTES.has(route) || route.startsWith("card-data/") || route.startsWith("feeds/") || /^advertising\/networks\/[^/]+\/inventory$/.test(route)) {
    return { ...request, path: "/api/projects/".concat(encodeURIComponent(projectId), "/").concat(route) };
  }
  return request;
}
function projectStreamQuery(projectId) {
  return projectId ? { project: projectId } : {};
}

// dist/temp-file.js
var temp_file_exports = {};
__export(temp_file_exports, {
  openTempFile: () => openTempFile,
  removeOnSignal: () => removeOnSignal,
  shellQuote: () => shellQuote,
  tempPathFor: () => tempPathFor
});
import { randomBytes } from "node:crypto";
import { rmSync } from "node:fs";
import { open } from "node:fs/promises";
import path from "node:path";
function tempPathFor(target) {
  return path.join(path.dirname(target), ".".concat(path.basename(target), ".").concat(randomBytes(8).toString("hex"), ".part"));
}
function removeOnSignal(file) {
  const signals = ["SIGINT", "SIGTERM"];
  let released = false;
  const handler = (signal) => {
    try {
      rmSync(file, { force: true });
    } catch {
    }
    release();
    if (process.listenerCount(signal) === 0)
      process.kill(process.pid, signal);
  };
  const release = () => {
    if (released)
      return;
    released = true;
    for (const signal of signals)
      process.removeListener(signal, handler);
  };
  for (const signal of signals)
    process.on(signal, handler);
  return release;
}
async function openTempFile(target) {
  const file = tempPathFor(target);
  const handle = await open(file, "wx", 384);
  return { path: file, handle, release: removeOnSignal(file) };
}
function shellQuote(argv) {
  return argv.map((arg) => /^[A-Za-z0-9_./:=@%+,-]+$/.test(arg) ? arg : "'".concat(arg.replaceAll("'", "'\\''"), "'")).join(" ");
}

// dist/playback-export.js
var playback_export_exports = {};
__export(playback_export_exports, {
  AGGREGATE_MAX_DAYS: () => AGGREGATE_MAX_DAYS,
  CsvRecordCounter: () => CsvRecordCounter,
  CsvStreamFailure: () => CsvStreamFailure,
  PLAYBACK_CSV_IDLE_TIMEOUT_MS: () => PLAYBACK_CSV_IDLE_TIMEOUT_MS,
  PLAYS_ALL_MAX_PAGES: () => PLAYS_ALL_MAX_PAGES,
  PLAYS_CURSOR_PATTERN: () => PLAYS_CURSOR_PATTERN,
  PLAYS_DEFAULT_RANGE_MS: () => PLAYS_DEFAULT_RANGE_MS,
  PLAYS_LIMIT_MAX: () => PLAYS_LIMIT_MAX,
  PLAYS_MAX_RANGE_MS: () => PLAYS_MAX_RANGE_MS,
  PLAYS_SETTLE_MS: () => PLAYS_SETTLE_MS,
  csvByteStream: () => csvByteStream,
  csvCells: () => csvCells,
  csvRecord: () => csvRecord,
  isoUtc: () => isoUtc,
  playbackExportBudget: () => playbackExportBudget,
  playsCursor: () => playsCursor,
  playsInstant: () => playsInstant,
  playsInstantOption: () => playsInstantOption,
  playsLimit: () => playsLimit,
  playsRange: () => playsRange,
  requireCsvResponse: () => requireCsvResponse,
  unusedPath: () => unusedPath,
  writeCsvFile: () => writeCsvFile,
  writeCsvStdout: () => writeCsvStdout
});
import { createHash } from "node:crypto";
import { rename, rm, stat } from "node:fs/promises";
var PLAYS_MAX_RANGE_MS = 31 * 864e5;
var PLAYS_DEFAULT_RANGE_MS = 864e5;
var PLAYS_LIMIT_MAX = 1e3;
var AGGREGATE_MAX_DAYS = 366;
var PLAYS_ALL_MAX_PAGES = 50;
var PLAYS_CURSOR_PATTERN = /^pc_[A-Za-z0-9_-]{1,512}$/;
var PLAYBACK_CSV_IDLE_TIMEOUT_MS = 6e4;
var PLAYS_SETTLE_MS = 5e3;
var RELATIVE = /^(\d{1,4})([dhm])$/;
var UNIT_MS = { d: 864e5, h: 36e5, m: 6e4 };
function isoUtc(ms) {
  return new Date(ms).toISOString().replace(/\.000Z$/, "Z");
}
function playsInstant(value, flag, now) {
  const trimmed = value.trim();
  if (trimmed === "now")
    return now.getTime();
  const relative = RELATIVE.exec(trimmed);
  if (relative) {
    return now.getTime() - Number(relative[1]) * UNIT_MS[relative[2]];
  }
  const normalized = normalizeInstant(trimmed);
  if (normalized === void 0) {
    throw usageError("".concat(flag, " takes an RFC 3339 instant with seconds and an offset (2026-09-01T00:00:00Z or 2026-09-01T00:00:00-07:00), now, or an age before now such as 7d, 12h, or 30m."));
  }
  return Date.parse(normalized);
}
function playsInstantOption(flag) {
  return (value) => {
    playsInstant(value, flag, /* @__PURE__ */ new Date());
    return value;
  };
}
function playsRange(from, to, now) {
  const toMs = to === void 0 ? now.getTime() : playsInstant(to, "--to", now);
  const fromMs = from === void 0 ? toMs - PLAYS_DEFAULT_RANGE_MS : playsInstant(from, "--from", now);
  if (fromMs >= toMs)
    throw usageError("--from must be before --to.");
  if (toMs - fromMs > PLAYS_MAX_RANGE_MS) {
    throw usageError("--from to --to must span at most 31 days. Export a longer period as several ranges.");
  }
  return { from: isoUtc(fromMs), to: isoUtc(toMs) };
}
function playsCursor(value) {
  if (!PLAYS_CURSOR_PATTERN.test(value))
    throw usageError("--cursor takes the data.next_cursor value of the previous page (pc_\u2026).");
  return value;
}
function playsLimit(value) {
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > PLAYS_LIMIT_MAX) {
    throw usageError("--limit must be a whole number from 1 to ".concat(PLAYS_LIMIT_MAX, "."));
  }
  return value;
}
function csvCells(record) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < record.length; index += 1) {
    const char = record[index];
    if (quoted) {
      if (char === '"' && record[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"')
        quoted = false;
      else
        cell += char;
    } else if (char === '"')
      quoted = true;
    else if (char === ",") {
      cells.push(cell);
      cell = "";
    } else
      cell += char;
  }
  cells.push(cell);
  return cells;
}
function csvRecord(cells) {
  const text2 = (cell) => {
    const value = cell === null || cell === void 0 ? "" : String(cell);
    return /[",\r\n]/.test(value) ? '"'.concat(value.replaceAll('"', '""'), '"') : value;
  };
  return "".concat(cells.map(text2).join(","), "\r\n");
}
function csvByteStream(csv) {
  const bytes = new TextEncoder().encode(csv);
  return {
    async *[Symbol.asyncIterator]() {
      if (bytes.byteLength > 0)
        yield bytes;
    }
  };
}
var CsvRecordCounter = class {
  records = 0;
  header;
  last;
  /** Bytes seen, and the offset just past the last complete record. */
  bytes = 0;
  completeBytes = 0;
  current = [];
  quoted = false;
  push(chunk) {
    for (const byte of chunk) {
      this.bytes += 1;
      if (byte === 34)
        this.quoted = !this.quoted;
      if (byte === 10 && !this.quoted) {
        const bytes = this.current.at(-1) === 13 ? this.current.slice(0, -1) : this.current;
        const text2 = Buffer.from(bytes).toString("utf8");
        if (this.records === 0)
          this.header = text2;
        this.last = text2;
        this.records += 1;
        this.current = [];
        this.completeBytes = this.bytes;
        continue;
      }
      this.current.push(byte);
    }
  }
  /** True when the body ended on a record boundary (the backend ends every record with CRLF). */
  get complete() {
    return this.records > 0 && this.completeBytes === this.bytes;
  }
  get rows() {
    return Math.max(0, this.records - 1);
  }
  /** Cells of the last complete data row (not the header). */
  lastRow() {
    return this.rows > 0 && this.last !== void 0 ? csvCells(this.last) : void 0;
  }
  headerCells() {
    return csvCells(this.header ?? "");
  }
};
var CsvStreamFailure = class extends CliError {
  failure;
  rows;
  header;
  lastRow;
  partialPath;
  constructor(failure, rows, header, lastRow, partialPath) {
    super(failure.problem, failure.exitCode, failure.warnings);
    this.failure = failure;
    this.rows = rows;
    this.header = header;
    this.lastRow = lastRow;
    this.partialPath = partialPath;
  }
};
function endedMidRow(what, requestId) {
  return networkError("The ".concat(what, " CSV stream ended in the middle of a row."), requestId);
}
function requireCsvResponse(headers, what, requestId) {
  const type = (headers["content-type"] ?? "").split(";", 1)[0].trim().toLowerCase();
  if (type !== "text/csv")
    throw unexpectedResponseError("The ".concat(what, " export answered ").concat(type || "without a Content-Type", ", not text/csv."), requestId);
}
async function unusedPath(file, extension = "") {
  const stem = extension && file.endsWith(extension) ? file.slice(0, -extension.length) : file;
  for (let index = 1; index < 1e3; index += 1) {
    const candidate = index === 1 ? file : "".concat(stem, "-").concat(index).concat(extension && file.endsWith(extension) ? extension : "");
    try {
      await stat(candidate);
    } catch (error) {
      if (error.code === "ENOENT")
        return candidate;
      throw error;
    }
  }
  throw usageError("Too many earlier exports named ".concat(file, "; move them away and rerun."));
}
async function writeCsvFile(body, outputPath, what, requestId, keepPartial = false) {
  const hash = createHash("sha256");
  const counter = new CsvRecordCounter();
  let failure;
  let temp;
  try {
    try {
      temp = await openTempFile(outputPath);
    } catch (error) {
      throw fileError("Cannot create a temporary file beside ".concat(outputPath, "."), error);
    }
    const { handle } = temp;
    try {
      try {
        for await (const chunk of body) {
          counter.push(chunk);
          hash.update(chunk);
          let offset = 0;
          while (offset < chunk.byteLength) {
            const written = await handle.write(chunk, offset, chunk.byteLength - offset);
            offset += written.bytesWritten;
          }
        }
        if (!counter.complete)
          failure = endedMidRow(what, requestId);
      } catch (error) {
        if (!(error instanceof CliError))
          throw fileError("Cannot write the ".concat(what, " CSV beside ").concat(outputPath, "."), error);
        failure = error;
      }
      if (failure && keepPartial && counter.rows > 0)
        await handle.truncate(counter.completeBytes);
      await handle.sync();
    } finally {
      await handle.close();
    }
    if (failure) {
      if (keepPartial && counter.rows > 0) {
        let partialPath;
        try {
          partialPath = await unusedPath("".concat(outputPath, ".partial"));
          await rename(temp.path, partialPath);
        } catch {
          partialPath = void 0;
        }
        throw new CsvStreamFailure(failure, counter.rows, counter.headerCells(), counter.lastRow(), partialPath);
      }
      throw new CsvStreamFailure(failure, counter.rows, counter.headerCells(), counter.lastRow());
    }
    try {
      await rename(temp.path, outputPath);
    } catch (error) {
      throw fileError("Cannot move the ".concat(what, " CSV into place at ").concat(outputPath, "."), error);
    }
  } catch (error) {
    if (temp)
      await rm(temp.path, { force: true });
    if (error instanceof CliError)
      throw error;
    throw fileError("Cannot write the ".concat(what, " CSV to ").concat(outputPath, "."), error);
  } finally {
    temp?.release();
    await body.cancel?.();
  }
  return {
    path: outputPath,
    bytes: counter.bytes,
    rows: counter.rows,
    sha256: hash.digest("hex"),
    header: counter.headerCells(),
    last: counter.lastRow()
  };
}
function writeChunk(stream, chunk) {
  return new Promise((resolve, reject) => {
    const onError = (error) => reject(error);
    stream.once("error", onError);
    stream.write(chunk, (error) => {
      stream.removeListener("error", onError);
      if (error)
        reject(error);
      else
        resolve();
    });
  });
}
async function writeCsvStdout(body, stdout, what, requestId) {
  const counter = new CsvRecordCounter();
  let failure;
  try {
    for await (const chunk of body) {
      counter.push(chunk);
      await writeChunk(stdout, chunk);
    }
    if (!counter.complete)
      failure = endedMidRow(what, requestId);
  } catch (error) {
    if (!(error instanceof CliError))
      throw error;
    failure = error;
  } finally {
    await body.cancel?.();
  }
  if (failure)
    throw new CsvStreamFailure(failure, counter.rows, counter.headerCells(), counter.lastRow());
}
function playbackExportBudget(header) {
  if (!header)
    return void 0;
  let budget;
  for (const member of header.split(",")) {
    const match = /^\s*"?(playback-export-[a-z]+)"?((?:;[a-z]+=\d+)*)\s*$/.exec(member);
    if (!match)
      continue;
    const remaining = /;r=(\d+)/.exec(match[2])?.[1];
    const reset = /;t=(\d+)/.exec(match[2])?.[1];
    if (remaining === void 0)
      continue;
    const next = { remaining: Number(remaining), resetSeconds: reset === void 0 ? 0 : Number(reset) };
    if (!budget || next.remaining < budget.remaining)
      budget = next;
  }
  return budget;
}

// dist/series.js
var series_exports = {};
__export(series_exports, {
  HEALTH_DEFAULT_WINDOW_MS: () => HEALTH_DEFAULT_WINDOW_MS,
  HEALTH_HOURLY_MAX_DAYS: () => HEALTH_HOURLY_MAX_DAYS,
  HEALTH_RAW_MAX_DAYS: () => HEALTH_RAW_MAX_DAYS,
  PRESENCE_DEFAULT_WINDOW_MS: () => PRESENCE_DEFAULT_WINDOW_MS,
  PRESENCE_MAX_DAYS: () => PRESENCE_MAX_DAYS,
  SERIES_PAGE_SIZE: () => SERIES_PAGE_SIZE,
  UPTIME_MAX_DAYS: () => UPTIME_MAX_DAYS,
  seriesWindow: () => seriesWindow
});
var SERIES_PAGE_SIZE = "500";
var HOUR_MS = 36e5;
var DAY_MS = 864e5;
var HEALTH_DEFAULT_WINDOW_MS = 24 * HOUR_MS;
var PRESENCE_DEFAULT_WINDOW_MS = 30 * DAY_MS;
var HEALTH_RAW_MAX_DAYS = 31;
var HEALTH_HOURLY_MAX_DAYS = 93;
var PRESENCE_MAX_DAYS = 366;
var UPTIME_MAX_DAYS = 366;
function seriesWindow(input) {
  const iso = (ms) => new Date(ms).toISOString().replace(/\.000Z$/, "Z");
  const toMs = input.to === void 0 ? input.now.getTime() : playsInstant(input.to, input.toFlag, input.now);
  const fromMs = input.from === void 0 ? toMs - input.defaultMs : playsInstant(input.from, input.fromFlag, input.now);
  if (fromMs >= toMs)
    throw usageError("".concat(input.fromFlag, " must be before ").concat(input.toFlag, "."));
  if (toMs - fromMs > input.maxDays * DAY_MS) {
    throw usageError("".concat(input.fromFlag, " to ").concat(input.toFlag, " must span at most ").concat(input.maxDays, " days").concat(input.advice ?? "", "."));
  }
  return { from: iso(fromMs), to: iso(toMs) };
}

// dist/report-export.js
var report_export_exports = {};
__export(report_export_exports, {
  REPORT_FORMATS: () => REPORT_FORMATS,
  downloadReportFile: () => downloadReportFile,
  downloadToFile: () => downloadToFile,
  reportFileResult: () => reportFileResult,
  reportFormat: () => reportFormat,
  reportOutputPath: () => reportOutputPath,
  wantsReportFile: () => wantsReportFile
});
import { createHash as createHash2 } from "node:crypto";
import { rename as rename2, rm as rm2, stat as stat2 } from "node:fs/promises";
import path2 from "node:path";
var REPORT_FORMATS = ["json", "csv", "xlsx", "pdf"];
var CONTENT_TYPES = {
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf"
};
function reportFormat(args) {
  const value = flagString(args.flags, "format") ?? "json";
  if (!REPORT_FORMATS.includes(value))
    throw usageError("--format must be json, csv, xlsx or pdf.");
  return value;
}
function wantsReportFile(format, nativeCsv = false) {
  return format !== "json" && !(nativeCsv && format === "csv");
}
async function reportOutputPath(request) {
  const relative = request.output ?? "./".concat(request.stem, ".").concat(request.format);
  if (relative.endsWith("/") || relative.endsWith("\\"))
    throw usageError("--output must be a file path, not a directory.");
  const target = path2.resolve(request.cwd, relative);
  const existing = await stat2(target).catch((error) => {
    if (error.code === "ENOENT")
      return void 0;
    throw usageError("--output must be a file path, not a directory.");
  });
  if (existing?.isDirectory())
    throw usageError("--output must be a file path, not a directory.");
  return target;
}
async function downloadToFile(client, request) {
  const response = await client.download({ method: "GET", path: request.path, query: request.query });
  const type = (response.headers["content-type"] ?? "").split(";", 1)[0]?.trim().toLowerCase();
  if (type !== request.contentType) {
    await response.body?.cancel?.();
    throw unexpectedResponseError("The ".concat(request.what, " export answered ").concat(type || "without a Content-Type", ", not ").concat(request.contentType, "."), response.headers["x-request-id"]);
  }
  if (!response.body)
    throw unexpectedResponseError("The ".concat(request.what, " export returned no body."), response.headers["x-request-id"]);
  const temp = await openTempFile(request.target);
  const hash = createHash2("sha256");
  let bytes = 0;
  try {
    for await (const chunk of response.body) {
      let offset = 0;
      while (offset < chunk.byteLength) {
        const result = await temp.handle.write(chunk, offset, chunk.byteLength - offset);
        offset += result.bytesWritten;
      }
      bytes += chunk.byteLength;
      hash.update(chunk);
    }
    await temp.handle.sync();
    await temp.handle.close();
    await rename2(temp.path, request.target);
  } catch (error) {
    await temp.handle.close().catch(() => void 0);
    await rm2(temp.path, { force: true });
    throw error;
  } finally {
    temp.release();
  }
  return { path: request.target, bytes, sha256: hash.digest("hex"), content_type: request.contentType, format: "", requestId: response.headers["x-request-id"] };
}
async function downloadReportFile(client, request) {
  const target = await reportOutputPath(request);
  const file = await downloadToFile(client, {
    path: request.path,
    query: { ...request.query, format: request.format },
    target,
    contentType: CONTENT_TYPES[request.format],
    what: request.what
  });
  return { ...file, format: request.format };
}
function reportFileResult(file, extra = {}) {
  const data = { path: file.path, bytes: file.bytes, sha256: file.sha256, content_type: file.content_type, format: file.format, ...extra };
  return {
    envelope: successEnvelope(data, { request_id: file.requestId }),
    human: ["Report written: ".concat(file.path), "  format: ".concat(file.format), "  bytes: ".concat(file.bytes), "  sha256: ".concat(file.sha256)].join("\n")
  };
}

// dist/playlist-warnings.js
var playlist_warnings_exports = {};
__export(playlist_warnings_exports, {
  IFRAME_FRAMING_REFUSED: () => IFRAME_FRAMING_REFUSED,
  SCREEN_FACT_MISSING: () => SCREEN_FACT_MISSING,
  hasFramingRefusal: () => hasFramingRefusal,
  playlistAnswerWarnings: () => playlistAnswerWarnings,
  playlistWarning: () => playlistWarning,
  playlistWarningItems: () => playlistWarningItems,
  playlistWarnings: () => playlistWarnings,
  withoutAnswerWarnings: () => withoutAnswerWarnings
});
var IFRAME_FRAMING_REFUSED = "iframe_framing_refused";
var SCREEN_FACT_MISSING = "screen_fact_missing";
function text(value, max = 600) {
  return typeof value === "string" && value.trim() ? plainText(value).trim().slice(0, max) : void 0;
}
function playlistWarningItems(value) {
  if (!Array.isArray(value))
    return [];
  const items = [];
  for (const raw of value) {
    const item = raw;
    if (!item || typeof item !== "object")
      continue;
    const code = text(item.code, 80);
    const message = text(item.message, 1e3);
    if (!code || !message)
      continue;
    items.push({
      code,
      message,
      ...text(item.page_id, 200) ? { page_id: text(item.page_id, 200) } : {},
      ...text(item.primitive_id, 200) ? { primitive_id: text(item.primitive_id, 200) } : {},
      ...text(item.src, 2e3) ? { src: text(item.src, 2e3) } : {},
      ...text(item.reason, 80) ? { reason: text(item.reason, 80) } : {},
      ...Array.isArray(item.tokens) ? { tokens: item.tokens.flatMap((token) => text(token, 100) ?? []).slice(0, 64) } : {},
      ...Array.isArray(item.screen_ids) ? { screen_ids: item.screen_ids.flatMap((id) => text(id, 200) ?? []).slice(0, 20) } : {},
      ...typeof item.screen_count === "number" && Number.isSafeInteger(item.screen_count) && item.screen_count > 0 ? { screen_count: item.screen_count } : {}
    });
  }
  return items;
}
function playlistWarning(item, playlistId, pending = false) {
  if (item.code === SCREEN_FACT_MISSING)
    return screenFactWarning(item);
  if (item.code !== IFRAME_FRAMING_REFUSED)
    return { code: item.code, message: item.message };
  const where = [
    item.page_id ? "page ".concat(item.page_id) : void 0,
    item.primitive_id ? "primitive ".concat(item.primitive_id) : void 0,
    item.src ? item.src : void 0
  ].filter(Boolean).join(", ");
  const edit = playlistId ? "screenrig playlist patch ".concat(playlistId) : "screenrig playlist patch ID";
  return {
    code: item.code,
    message: "".concat(item.message, " ").concat(pending ? "The change waits for review as written." : "The playlist was saved as written.", " Next: ").concat(where ? "replace the iframe (".concat(where, ") with a page that allows framing from the Player origin, or ask the page's owner to allow it") : "replace the iframe with a page that allows framing from the Player origin, or ask the page's owner to allow it", "; edit the pages with ").concat(edit, " FILE.")
  };
}
function screenFactWarning(item) {
  const ids = item.screen_ids ?? [];
  const more = item.screen_count !== void 0 && item.screen_count > ids.length ? " and ".concat(item.screen_count - ids.length, " more") : "";
  const screens = ids.length ? " Screens: ".concat(ids.join(", ")).concat(more, ".") : "";
  const tokens = item.tokens?.length ? " Tokens: ".concat(item.tokens.join(", "), ".") : "";
  const where = item.page_id || item.primitive_id ? " First use: ".concat([item.page_id ? "page ".concat(item.page_id) : "", item.primitive_id ? "primitive ".concat(item.primitive_id) : ""].filter(Boolean).join(", "), ".") : "";
  const next = ids.length ? " Next: screenrig screen update ".concat(ids[0], " --field NAME=VALUE (or --location LAT,LON, --timezone ZONE) gives a screen the value; screenrig screen show ").concat(ids[0], " lists what it has.") : "";
  return { code: item.code, message: "".concat(item.message).concat(where).concat(tokens).concat(screens).concat(next) };
}
function playlistWarnings(items, playlistId, pending = false) {
  return playlistWarningItems(items).map((item) => playlistWarning(item, playlistId, pending));
}
function playlistAnswerWarnings(body) {
  const answer = body;
  if (!answer || typeof answer !== "object")
    return [];
  const id = typeof answer.id === "string" ? answer.id : typeof answer.playlist?.id === "string" ? answer.playlist.id : void 0;
  return playlistWarnings(answer.warnings, id, answer.status === "pending_review");
}
function withoutAnswerWarnings(body) {
  if (!body || typeof body !== "object" || Array.isArray(body) || !("warnings" in body))
    return body;
  const { warnings: _lifted, ...rest } = body;
  return rest;
}
function hasFramingRefusal(warnings) {
  return warnings.some((warning) => warning.code === IFRAME_FRAMING_REFUSED);
}

// dist/write-recovery.js
var write_recovery_exports = {};
__export(write_recovery_exports, {
  WriteRecovery: () => WriteRecovery,
  manageWriteRecovery: () => manageWriteRecovery
});
import { createHash as createHash3 } from "node:crypto";
var SAFE_REPLAY_MS = 23 * 60 * 60 * 1e3;
var commandGroups = ["kv", "comment", "feedback", "support", "operations", "app", "playlist", "media", "screen", "project", "invitations", "dashboard", "webhooks", "notifications", "alerts", "source", "connection"];
var commandActions = ["create", "update", "delete", "upload", "set", "put", "assign", "pair", "unpair", "clear", "toast", "screenshot", "reload", "restart", "cancel", "submit", "set-timezone", "archive", "unarchive", "rotate-public-id", "tag", "bug", "feature", "rename", "revoke", "reset-sign-in", "rotate-secret", "test", "schedule", "takeover", "ack", "snooze", "mute", "unmute", "refresh", "promote", "restore", "version", "connect"];
function safeCommand(value) {
  if (typeof value !== "string")
    return null;
  const parts = value.split(" ");
  return parts.length === 2 && commandGroups.includes(parts[0]) && commandActions.includes(parts[1]) ? value : null;
}
function ledger(config) {
  const value = config.pending_writes === void 0 ? {} : config.pending_writes;
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.entries(value).some(([hash, entry]) => !/^[a-f0-9]{64}$/.test(hash) || !entry || typeof entry.idempotency_key !== "string" || !isValidIdempotencyKey(entry.idempotency_key) || typeof entry.created_at !== "string" || !Number.isFinite(Date.parse(entry.created_at)))) {
    throw configError("Pending write recovery state is invalid; no request was sent.");
  }
  return value;
}
var WriteRecovery = class {
  resolved;
  runtime;
  command;
  touched = /* @__PURE__ */ new Map();
  constructor(resolved, runtime, command) {
    this.resolved = resolved;
    this.runtime = runtime;
    this.command = command;
  }
  async update(work) {
    const fs = { ...this.runtime.fs, settings: this.runtime.settings, homedir: this.runtime.homedir };
    return withConfigLock(this.resolved.configPath, fs, { sleep: this.runtime.sleep, now: () => this.runtime.now().getTime() }, async () => {
      const stored = await readConfigFile(this.resolved.configPath, fs);
      const config = stored ? this.resolved.identityWriteScope ? { ...stored, token: stored.identity_token, pending_writes: stored.identity_writes } : projectConfigFor(stored, this.resolved) : void 0;
      if (!config) {
        throw configError("Agent credential changed during write recovery; retry with the current installation.");
      }
      if (this.command === "project create") {
        if (!sameCredential(config.token ?? config.identity_token, this.resolved.token, "identity")) {
          throw configError("The sign-in changed during project creation. Retry with the current sign-in.");
        }
      } else
        assertProjectCredential(config, this.resolved);
      const pending = ledger(config);
      const result = work(config, pending);
      const { pending_writes: _old, ...rest } = config;
      if (this.resolved.identityWriteScope) {
        const { identity_writes: _old2, ...global } = stored;
        await writeConfigAtomic(this.resolved.configPath, { ...global, ...Object.keys(pending).length ? { identity_writes: pending } : {} }, fs);
      } else {
        await writeConfigAtomic(this.resolved.configPath, withProjectConfig(stored, this.resolved, { ...rest, ...Object.keys(pending).length ? { pending_writes: pending } : {} }), fs);
      }
      return result;
    });
  }
  /**
   * `supersede` names a write whose request is derived from a fresh read (for
   * example a tag edit guarded by the revision just read). Its fingerprint
   * includes that derived guard, so a rerun after an ambiguous failure reads a
   * new revision and fingerprints differently. The earlier entry is then
   * obsolete: its guard names a revision that is no longer current, so its
   * replay could only fail. Entries sharing the same `supersede` hash with a
   * different fingerprint are dropped instead of lingering as orphans.
   */
  async prepare(request, requestedKey, supersede) {
    const headers = Object.entries(request.headers ?? {}).filter(([name]) => !["x-request-id", "idempotency-key"].includes(name.toLowerCase())).map(([name, value]) => [name.toLowerCase(), value]).sort(([a], [b]) => a.localeCompare(b));
    const body = request.body === void 0 ? void 0 : request.body instanceof Uint8Array ? request.body : typeof request.body === "string" ? request.body : JSON.stringify(request.body);
    const fingerprintFor = (credential) => {
      const hash = createHash3("sha256").update(JSON.stringify([
        this.resolved.apiUrl,
        credential,
        request.method,
        request.path,
        Object.entries(request.query ?? {}).sort(),
        headers,
        body === void 0 ? "absent" : "present"
      ]));
      if (body !== void 0)
        hash.update(body);
      return hash.digest("hex");
    };
    const grant = this.command === "project create" ? accessClaims(this.resolved.token)?.sid : void 0;
    const fingerprint = fingerprintFor(grant ? "grant:".concat(grant) : this.resolved.token);
    const legacyFingerprint = fingerprintFor(this.resolved.token);
    const scope = supersede === void 0 ? void 0 : createHash3("sha256").update(JSON.stringify([this.resolved.apiUrl, this.resolved.token, "supersede", supersede])).digest("hex");
    const pending = await this.update((_config, entries) => {
      if (scope) {
        for (const [other, entry] of Object.entries(entries)) {
          if (other !== fingerprint && entry.supersede === scope)
            delete entries[other];
        }
      }
      const existing = entries[fingerprint] ?? entries[legacyFingerprint];
      const reuse = existing && (!requestedKey || requestedKey === existing.idempotency_key);
      if (reuse && this.runtime.now().getTime() - Date.parse(existing.created_at) >= SAFE_REPLAY_MS) {
        throw usageError("This unresolved write is older than the safe replay window. Run screenrig recovery list and inspect the resource before using screenrig recovery reconcile ID or explicitly supplying a new --idempotency-key for a reconciled write.");
      }
      if (!existing && Object.keys(entries).length >= 256) {
        throw configError("Too many unresolved writes. Run screenrig recovery list, inspect the remote outcome, then use screenrig recovery reconcile ID before starting another mutation.");
      }
      const key = reuse ? existing.idempotency_key : requestedKey ?? newIdempotencyKey();
      if (legacyFingerprint !== fingerprint)
        delete entries[legacyFingerprint];
      entries[fingerprint] = reuse ? existing : {
        idempotency_key: key,
        created_at: this.runtime.now().toISOString(),
        ...safeCommand(this.command) ? { command: safeCommand(this.command) } : {},
        ...scope ? { supersede: scope } : {}
      };
      return { fingerprint, key };
    });
    this.touched.set(fingerprint, pending);
    return pending;
  }
  async clear(pending) {
    await this.update((_config, entries) => {
      if (entries[pending.fingerprint]?.idempotency_key === pending.key)
        delete entries[pending.fingerprint];
    });
    this.touched.delete(pending.fingerprint);
  }
  get hasPending() {
    return this.touched.size > 0;
  }
  async finish() {
    if (!this.touched.size)
      return;
    await this.update((_config, entries) => {
      for (const pending of this.touched.values()) {
        if (entries[pending.fingerprint]?.idempotency_key === pending.key)
          delete entries[pending.fingerprint];
      }
    });
    this.touched.clear();
  }
};
function recoveryId(fingerprint, entry) {
  return "wr_" + createHash3("sha256").update(JSON.stringify([fingerprint, entry.idempotency_key, entry.created_at])).digest("hex");
}
function describeEntry(fingerprint, entry, now) {
  const expiry = Date.parse(entry.created_at) + SAFE_REPLAY_MS;
  return {
    id: recoveryId(fingerprint, entry),
    command: safeCommand(entry.command),
    created_at: entry.created_at,
    replay_expires_at: new Date(expiry).toISOString(),
    replay_status: now >= expiry ? "expired" : "within_window"
  };
}
async function manageWriteRecovery(resolved, runtime, action, id) {
  if (action !== "list" && (!id || !/^wr_[a-f0-9]{64}$/.test(id))) {
    throw usageError("Use a recovery ID returned by screenrig recovery list.");
  }
  const fs = { ...runtime.fs, settings: runtime.settings, homedir: runtime.homedir };
  return withConfigLock(resolved.configPath, fs, { sleep: runtime.sleep, now: () => runtime.now().getTime() }, async () => {
    const stored = await readConfigFile(resolved.configPath, fs);
    const config = stored ? projectConfigFor(stored, resolved) : void 0;
    const pending = ledger(config ?? { api_url: resolved.apiUrl });
    const globalPending = ledger({ api_url: resolved.apiUrl, pending_writes: stored?.identity_writes });
    const entries = Object.entries(pending).map(([fingerprint, entry2]) => describeEntry(fingerprint, entry2, runtime.now().getTime()));
    entries.push(...Object.entries(globalPending).map(([fingerprint, entry2]) => ({ ...describeEntry(fingerprint, entry2, runtime.now().getTime()), scope: "identity" })));
    entries.sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
    if (action === "list")
      return entries;
    const entry = entries.find((entry2) => entry2.id === id);
    if (!entry)
      throw usageError("Recovery entry is no longer pending. Run screenrig recovery list for current IDs; nothing was changed.");
    if (action === "reconcile") {
      const globalFingerprint = Object.keys(globalPending).find((hash) => recoveryId(hash, globalPending[hash]) === id);
      if (globalFingerprint) {
        delete globalPending[globalFingerprint];
        const { identity_writes: _old2, ...rest2 } = stored;
        await writeConfigAtomic(resolved.configPath, { ...rest2, ...Object.keys(globalPending).length ? { identity_writes: globalPending } : {} }, fs);
        return [entry];
      }
      const fingerprint = Object.keys(pending).find((hash) => recoveryId(hash, pending[hash]) === id);
      delete pending[fingerprint];
      const { pending_writes: _old, ...rest } = config;
      await writeConfigAtomic(resolved.configPath, withProjectConfig(stored, resolved, { ...rest, ...Object.keys(pending).length ? { pending_writes: pending } : {} }), fs);
    }
    return [entry];
  });
}

// dist/open-url.js
var open_url_exports = {};
__export(open_url_exports, {
  hasDesktop: () => hasDesktop,
  openExternalUrl: () => openExternalUrl,
  spawnDetached: () => spawnDetached
});
import { spawn } from "node:child_process";
var OPENER_SETTLE_MS = 2e3;
function spawnDetached(command, argv, settleMs = OPENER_SETTLE_MS) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (opened) => {
      if (!settled) {
        settled = true;
        resolve(opened);
      }
    };
    const child = spawn(command, argv, { detached: true, stdio: "ignore", shell: false });
    child.once("error", () => finish(false));
    child.once("exit", (code) => finish(code === 0));
    child.once("spawn", () => {
      const timer = setTimeout(() => {
        child.unref();
        finish(true);
      }, settleMs);
      timer.unref();
      child.once("exit", () => clearTimeout(timer));
    });
  });
}
function hasDesktop(platform = process.platform, settings = processSettings()) {
  if (platform === "darwin" || platform === "win32")
    return true;
  return Boolean(settings.DISPLAY || settings.WAYLAND_DISPLAY);
}
var openExternalUrl = async (url) => {
  const target = new URL(url);
  if (target.protocol !== "https:" && !(target.protocol === "http:" && (target.hostname === "localhost" || target.hostname === "127.0.0.1" || target.hostname.endsWith(".localhost"))))
    return false;
  if (!hasDesktop())
    return false;
  const [command, argv] = process.platform === "darwin" ? ["open", [target.href]] : process.platform === "win32" ? ["rundll32.exe", ["url.dll,FileProtocolHandler", target.href]] : ["xdg-open", [target.href]];
  return spawnDetached(command, argv);
};

// dist/runtime.js
var runtime_exports = {};
__export(runtime_exports, {
  SIGNED_PUT_ANSWER_MS: () => SIGNED_PUT_ANSWER_MS,
  SIGNED_PUT_IDLE_MS: () => SIGNED_PUT_IDLE_MS,
  fetchSignedRawPut: () => fetchSignedRawPut,
  processRuntime: () => processRuntime,
  signedPutDispatcher: () => signedPutDispatcher,
  spawnRunProcess: () => spawnRunProcess,
  storageError: () => storageError
});
import { spawn as spawn2 } from "node:child_process";
import { chmod, mkdir, open as open2, rename as rename3, rm as rm3, stat as stat3 } from "node:fs/promises";
import { homedir } from "node:os";
import { Readable } from "node:stream";
var STDERR_TAIL_LIMIT = 8192;
function spawnRunProcess() {
  return (request) => new Promise((resolve) => {
    let child;
    try {
      child = spawn2(request.command, request.args, {
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true
      });
    } catch (error) {
      resolve({
        code: null,
        signal: null,
        stdout: "",
        stderrTail: "",
        spawnError: error instanceof Error ? error.message : "spawn failed"
      });
      return;
    }
    const streaming = typeof request.onStdoutLine === "function";
    let stdout = "";
    let pending = "";
    let stderrPending = "";
    let outputTruncated = false;
    let stoppedEarly = false;
    let stderrTail = "";
    let settled = false;
    let timedOut = false;
    const timer = request.timeoutMs && request.timeoutMs > 0 ? setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, request.timeoutMs) : void 0;
    const emit = (line, callback) => {
      if (stoppedEarly)
        return;
      if (request.maxLineChars && line.length > request.maxLineChars) {
        outputTruncated = true;
        stoppedEarly = true;
      } else if (callback(line.replace(/\r$/, "")) === false) {
        stoppedEarly = true;
      }
      if (stoppedEarly)
        child.kill("SIGKILL");
    };
    const lines = (previous, chunk, callback) => {
      if (stoppedEarly)
        return "";
      const text2 = previous + chunk;
      let start = 0;
      for (let end = text2.indexOf("\n"); end >= 0; end = text2.indexOf("\n", start)) {
        emit(text2.slice(start, end), callback);
        start = end + 1;
        if (stoppedEarly)
          return "";
      }
      const rest = text2.slice(start);
      if (request.maxLineChars && rest.length > request.maxLineChars) {
        outputTruncated = true;
        stoppedEarly = true;
        child.kill("SIGKILL");
        return "";
      }
      return rest;
    };
    child.stdout?.setEncoding("utf8");
    child.stdout?.on("data", (chunk) => {
      if (!streaming) {
        stdout += chunk;
        return;
      }
      pending = lines(pending, chunk, request.onStdoutLine);
    });
    child.stderr?.setEncoding("utf8");
    child.stderr?.on("data", (chunk) => {
      if (request.onStderrLine)
        stderrPending = lines(stderrPending, chunk, request.onStderrLine);
      else
        stderrTail = (stderrTail + chunk).slice(-STDERR_TAIL_LIMIT);
    });
    const settle = (result) => {
      if (settled)
        return;
      settled = true;
      if (timer)
        clearTimeout(timer);
      if (streaming && pending.length > 0) {
        emit(pending, request.onStdoutLine);
        pending = "";
      }
      if (request.onStderrLine && stderrPending)
        emit(stderrPending, request.onStderrLine);
      resolve({ ...result, outputTruncated, stoppedEarly });
    };
    child.on("error", (error) => {
      settle({
        code: null,
        signal: null,
        stdout,
        stderrTail,
        spawnError: error instanceof Error ? error.message : "spawn failed"
      });
    });
    child.on("close", (code, signal) => {
      settle({ code, signal, stdout, stderrTail, timedOut });
    });
  });
}
var SIGNED_PUT_IDLE_MS = 10 * 6e4;
var SIGNED_PUT_ANSWER_MS = 30 * 6e4;
function signedPutDispatcher(timeouts = { headersTimeout: 0, bodyTimeout: 0 }) {
  const base = globalThis[/* @__PURE__ */ Symbol.for("undici.globalDispatcher.1")];
  if (typeof base?.dispatch !== "function")
    return void 0;
  return { dispatch: (options, handler) => base.dispatch({ ...options, ...timeouts }, handler) };
}
function stalled(code) {
  return Object.assign(new Error(code === "UPLOAD_STALLED" ? "No upload bytes moved." : "Storage did not answer the upload."), { code });
}
var STORAGE_ERROR_BYTES = 8 * 1024;
var XML_ENTITIES = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };
function storageError(text2) {
  const field = (name) => new RegExp("<".concat(name, ">([^<]{1,2000})</").concat(name, ">")).exec(text2)?.[1]?.replace(/&(lt|gt|amp|quot|apos);/g, (_entity, name2) => XML_ENTITIES[name2] ?? "").replace(/\s+/g, " ").trim();
  const code = field("Code");
  const message = field("Message");
  const cleaned = message === void 0 ? "" : redactText(message).replace(/\bhttps?:\/\/\S+/gi, "[url]").replace(/\.$/, "");
  return {
    ...code && /^[A-Za-z][A-Za-z0-9.]{0,63}$/.test(code) ? { errorCode: code } : {},
    ...cleaned ? { errorMessage: cleaned.length > 300 ? "".concat(cleaned.slice(0, 300), "\u2026") : cleaned } : {}
  };
}
async function readStorageError(response) {
  const reader = response.body?.getReader();
  if (!reader)
    return {};
  const parts = [];
  let size = 0;
  try {
    while (size < STORAGE_ERROR_BYTES) {
      const { done, value } = await reader.read();
      if (done)
        break;
      parts.push(value);
      size += value.byteLength;
    }
  } catch {
    return {};
  } finally {
    await reader.cancel().catch(() => void 0);
  }
  return storageError(Buffer.concat(parts).subarray(0, STORAGE_ERROR_BYTES).toString("utf8"));
}
function fetchSignedRawPut(fetchImpl = fetch) {
  return async (request) => {
    const source = request.body;
    const controller = new AbortController();
    let timer;
    let finished = false;
    const arm = (ms, code) => {
      clearTimeout(timer);
      if (finished)
        return;
      timer = setTimeout(() => controller.abort(stalled(code)), ms);
      timer.unref?.();
    };
    const chunks = source instanceof Uint8Array ? (function* () {
      for (let offset = 0; offset < source.byteLength; offset += 256 * 1024) {
        yield source.subarray(offset, Math.min(offset + 256 * 1024, source.byteLength));
      }
    })() : source;
    const watched = (async function* () {
      for await (const chunk of chunks) {
        arm(SIGNED_PUT_IDLE_MS, "UPLOAD_STALLED");
        yield chunk;
      }
      arm(SIGNED_PUT_ANSWER_MS, "UPLOAD_UNANSWERED");
    })();
    const body = Readable.from(watched, { objectMode: false, highWaterMark: 256 * 1024 });
    try {
      if (request.expiresAt !== void 0 && request.expiresAt <= Date.now())
        throw new Error("Media upload session expired.");
      arm(SIGNED_PUT_IDLE_MS, "UPLOAD_STALLED");
      const dispatcher = signedPutDispatcher();
      const response = await fetchImpl(request.url, {
        method: request.method,
        headers: { "user-agent": USER_AGENT, ...request.headers },
        body,
        credentials: request.credentials,
        redirect: request.redirect,
        signal: controller.signal,
        duplex: "half",
        ...dispatcher ? { dispatcher } : {}
      });
      if (response.status >= 200 && response.status < 300) {
        await response.body?.cancel();
        return { status: response.status };
      }
      arm(SIGNED_PUT_IDLE_MS, "UPLOAD_STALLED");
      return { status: response.status, ...await readStorageError(response) };
    } catch (error) {
      throw controller.signal.aborted && controller.signal.reason instanceof Error ? controller.signal.reason : error;
    } finally {
      finished = true;
      clearTimeout(timer);
      body.destroy();
      if (source instanceof Readable)
        source.destroy();
    }
  };
}
function processRuntime() {
  const settings = processSettings();
  return {
    argv: process.argv.slice(2),
    stdin: process.stdin,
    isStdinTty: () => process.stdin.isTTY === true,
    settings,
    stdout: process.stdout,
    stderr: process.stderr,
    now: () => /* @__PURE__ */ new Date(),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    homedir,
    cwd: () => process.cwd(),
    signedRawPut: fetchSignedRawPut(),
    openUrl: openExternalUrl,
    runProcess: spawnRunProcess(),
    isStderrTty: () => process.stderr.isTTY === true,
    fs: {
      mkdir,
      open: open2,
      rename: rename3,
      rm: rm3,
      chmod,
      stat: stat3,
      homedir,
      settings
    }
  };
}

// dist/transport/http.js
var http_exports = {};
__export(http_exports, {
  FetchTransport: () => FetchTransport
});
function fetchFailure(err, fallback) {
  if (!(err instanceof Error))
    return fallback;
  const cause = err.cause;
  const code = cause && typeof cause === "object" ? cause.code : void 0;
  const causeMessage = cause instanceof Error ? cause.message : void 0;
  const detail = [typeof code === "string" ? code : void 0, causeMessage && causeMessage !== code ? causeMessage : void 0].filter(Boolean).join(": ");
  return redactText(detail && !err.message.includes(detail) ? "".concat(err.message, " (").concat(detail, ")") : err.message || fallback);
}
function headerMap(headers) {
  const out = {};
  headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
}
function decodeTextBody(text2, contentType) {
  if (text2 && (contentType.includes("json") || text2.startsWith("{") || text2.startsWith("["))) {
    try {
      return JSON.parse(text2);
    } catch {
      return text2;
    }
  }
  return text2 || void 0;
}
function buildUrl(base, path3, query, repeated) {
  const url = new URL(path3, base.endsWith("/") ? base : "".concat(base, "/"));
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== void 0 && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }
  if (repeated) {
    for (const [key, values] of Object.entries(repeated)) {
      for (const value of values)
        url.searchParams.append(key, value);
    }
  }
  return url.toString();
}
function carriesCredential(req, headers) {
  return req.credential === true || headers.authorization !== void 0;
}
function redirectRefused(req, status) {
  return new CliError(makeProblem("credential_redirect_refused", "Redirect refused", status, "The API answered ".concat(req.method, " ").concat(req.path, " with a redirect (HTTP ").concat(status, "). The CLI never follows a redirect with a credential, so nothing was sent onward."), {
    request_id: req.headers?.["x-request-id"],
    hint: "Check the API origin with screenrig doctor. A proxy in front of the API may be redirecting requests."
  }), ExitCode.Unexpected);
}
var FetchTransport = class {
  apiUrl;
  token;
  fetchImpl;
  constructor(apiUrl, token, fetchImpl = fetch) {
    this.apiUrl = apiUrl;
    this.token = token;
    this.fetchImpl = fetchImpl;
  }
  headers(req) {
    const headers = {
      "user-agent": USER_AGENT,
      accept: req.binary ? "image/webp" : req.json === false ? "*/*" : "application/json",
      ...req.headers
    };
    if (this.token && !headers.authorization) {
      headers.authorization = "Bearer ".concat(this.token);
    }
    if (req.body !== void 0 && headers["content-type"] === void 0) {
      headers["content-type"] = req.body instanceof Uint8Array ? "application/octet-stream" : "application/json";
    }
    return headers;
  }
  serialize(body) {
    if (body === void 0) {
      return void 0;
    }
    if (body instanceof Uint8Array) {
      return Buffer.from(body);
    }
    if (typeof body === "string") {
      return body;
    }
    return JSON.stringify(body);
  }
  async request(req) {
    const controller = new AbortController();
    const signal = req.signal ? AbortSignal.any([req.signal, controller.signal]) : controller.signal;
    const timer = req.timeout_ms && req.timeout_ms > 0 ? setTimeout(() => controller.abort(), req.timeout_ms) : void 0;
    const requestHeaders = this.headers(req);
    const manual = carriesCredential(req, requestHeaders);
    try {
      const response = await this.fetchImpl(buildUrl(this.apiUrl, req.path, req.query, req.queryRepeated), {
        method: req.method,
        headers: requestHeaders,
        body: this.serialize(req.body),
        signal,
        redirect: manual ? "manual" : "follow"
      });
      if (manual && response.status >= 300 && response.status < 400) {
        await response.body?.cancel().catch(() => void 0);
        throw redirectRefused(req, response.status);
      }
      const headers = headerMap(response.headers);
      if (req.binary) {
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (response.status >= 400) {
          const text3 = new TextDecoder().decode(bytes);
          return { status: response.status, headers, body: decodeTextBody(text3, headers["content-type"] ?? ""), rawText: text3 };
        }
        return { status: response.status, headers, body: bytes };
      }
      const text2 = await response.text();
      return { status: response.status, headers, body: decodeTextBody(text2, headers["content-type"] ?? ""), rawText: text2 };
    } catch (err) {
      if (err instanceof CliError)
        throw err;
      if (signal.aborted || err.name === "AbortError") {
        throw timeoutError("API request timed out", req.headers?.["x-request-id"]);
      }
      throw networkError(fetchFailure(err, "API request failed"), req.headers?.["x-request-id"]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }
  async stream(req) {
    let response;
    const streamHeaders = { ...this.headers(req), accept: "text/event-stream" };
    const manual = carriesCredential(req, streamHeaders);
    try {
      response = await this.fetchImpl(buildUrl(this.apiUrl, req.path, req.query, req.queryRepeated), {
        method: req.method,
        headers: streamHeaders,
        signal: req.signal,
        redirect: manual ? "manual" : "follow"
      });
    } catch (err) {
      if (err.name === "AbortError") {
        throw timeoutError("SSE connection timed out", req.headers?.["x-request-id"]);
      }
      throw networkError(fetchFailure(err, "SSE connection failed"), req.headers?.["x-request-id"]);
    }
    if (manual && response.status >= 300 && response.status < 400) {
      await response.body?.cancel().catch(() => void 0);
      throw redirectRefused(req, response.status);
    }
    if (!response.ok || !response.body) {
      const text2 = await response.text();
      let body = text2;
      try {
        body = JSON.parse(text2);
      } catch {
      }
      throw new CliError(normalizeProblem(body, {
        status: response.status,
        request_id: response.headers.get("x-request-id") ?? req.headers?.["x-request-id"],
        bodyText: text2.slice(0, 300)
      }));
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const requestId = req.headers?.["x-request-id"];
    return {
      async *[Symbol.asyncIterator]() {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            yield decoder.decode(value, { stream: true });
          }
        } catch (err) {
          if (err.name === "AbortError") {
            throw err;
          }
          throw networkError(err instanceof Error ? err.message : "SSE stream failed", requestId);
        } finally {
          try {
            await reader.cancel();
          } catch {
          }
          reader.releaseLock();
        }
      }
    };
  }
  async download(req) {
    const controller = new AbortController();
    const signal = req.signal ? AbortSignal.any([req.signal, controller.signal]) : controller.signal;
    const what = req.label ?? "Media download";
    const idleMs = req.idle_timeout_ms && req.idle_timeout_ms > 0 ? req.idle_timeout_ms : void 0;
    let timer = req.timeout_ms && req.timeout_ms > 0 ? setTimeout(() => controller.abort(), req.timeout_ms) : void 0;
    let idleTimer = idleMs ? setTimeout(() => controller.abort(), idleMs) : void 0;
    const touch = () => {
      if (!idleMs)
        return;
      if (idleTimer)
        clearTimeout(idleTimer);
      idleTimer = setTimeout(() => controller.abort(), idleMs);
    };
    const clearTimers = () => {
      if (timer)
        clearTimeout(timer);
      if (idleTimer)
        clearTimeout(idleTimer);
      timer = void 0;
      idleTimer = void 0;
    };
    let response;
    const downloadHeaders = { ...this.headers(req), accept: "*/*" };
    const manual = carriesCredential(req, downloadHeaders);
    try {
      response = await this.fetchImpl(buildUrl(this.apiUrl, req.path, req.query, req.queryRepeated), {
        method: req.method,
        headers: downloadHeaders,
        signal,
        redirect: manual ? "manual" : "follow"
      });
    } catch (err) {
      clearTimers();
      if (signal.aborted || err.name === "AbortError") {
        throw timeoutError("".concat(what, " timed out"), req.headers?.["x-request-id"]);
      }
      throw networkError(fetchFailure(err, "".concat(what, " failed")), req.headers?.["x-request-id"]);
    }
    if (manual && response.status >= 300 && response.status < 400) {
      clearTimers();
      await response.body?.cancel().catch(() => void 0);
      throw redirectRefused(req, response.status);
    }
    touch();
    const headers = headerMap(response.headers);
    if (response.status >= 400) {
      try {
        const text2 = await response.text();
        return {
          status: response.status,
          headers,
          problem: decodeTextBody(text2, headers["content-type"] ?? ""),
          rawText: text2
        };
      } catch (err) {
        if (signal.aborted || err.name === "AbortError") {
          throw timeoutError("".concat(what, " timed out"), req.headers?.["x-request-id"]);
        }
        throw networkError(err instanceof Error ? err.message : "".concat(what, " failed"), req.headers?.["x-request-id"]);
      } finally {
        clearTimers();
      }
    }
    if (!response.body) {
      clearTimers();
      return { status: response.status, headers };
    }
    const reader = response.body.getReader();
    const requestId = req.headers?.["x-request-id"];
    const onAbort = () => {
      void reader.cancel().catch(() => void 0);
    };
    signal.addEventListener("abort", onAbort, { once: true });
    let released = false;
    const cancel = async () => {
      if (released)
        return;
      released = true;
      clearTimers();
      signal.removeEventListener("abort", onAbort);
      try {
        await reader.cancel();
      } catch {
      }
      reader.releaseLock();
    };
    const body = {
      cancel,
      async *[Symbol.asyncIterator]() {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              if (signal.aborted)
                throw new DOMException("aborted", "AbortError");
              break;
            }
            touch();
            yield value;
          }
        } catch (err) {
          if (signal.aborted || err.name === "AbortError")
            throw timeoutError("".concat(what, " timed out"), requestId);
          throw networkError(err instanceof Error ? err.message : "".concat(what, " stream failed"), requestId);
        } finally {
          await cancel();
        }
      }
    };
    return { status: response.status, headers, body };
  }
};

export {
  reviewNote,
  decisionNote,
  reviewNoteHeaders,
  pendingReviewOf,
  reviewNext,
  pendingReviewWarning,
  PENDING_REVIEW_SENTENCE,
  plainText,
  pendingReviewLines,
  reviewDetailLines,
  reviewListLines,
  accessFields,
  accessLimitHint,
  reviews_exports,
  projectConfigFor,
  withProjectConfig,
  assertProjectCredential,
  selectProject,
  project_state_exports,
  resultContext,
  clearResultContext,
  formatResultContext,
  setResultContext,
  projectName,
  validateProjectContext,
  contextFromProject,
  cacheProjectContexts,
  project_context_exports,
  projectRequest,
  projectStreamQuery,
  project_routing_exports,
  tempPathFor,
  removeOnSignal,
  openTempFile,
  shellQuote,
  temp_file_exports,
  PLAYS_LIMIT_MAX,
  AGGREGATE_MAX_DAYS,
  PLAYS_ALL_MAX_PAGES,
  PLAYBACK_CSV_IDLE_TIMEOUT_MS,
  PLAYS_SETTLE_MS,
  isoUtc,
  playsInstant,
  playsInstantOption,
  playsRange,
  playsCursor,
  playsLimit,
  csvRecord,
  csvByteStream,
  CsvStreamFailure,
  requireCsvResponse,
  unusedPath,
  writeCsvFile,
  writeCsvStdout,
  playbackExportBudget,
  playback_export_exports,
  SERIES_PAGE_SIZE,
  HEALTH_DEFAULT_WINDOW_MS,
  PRESENCE_DEFAULT_WINDOW_MS,
  HEALTH_RAW_MAX_DAYS,
  HEALTH_HOURLY_MAX_DAYS,
  PRESENCE_MAX_DAYS,
  UPTIME_MAX_DAYS,
  seriesWindow,
  series_exports,
  reportFormat,
  wantsReportFile,
  downloadToFile,
  downloadReportFile,
  reportFileResult,
  report_export_exports,
  playlistWarningItems,
  playlistWarnings,
  playlistAnswerWarnings,
  withoutAnswerWarnings,
  hasFramingRefusal,
  playlist_warnings_exports,
  WriteRecovery,
  manageWriteRecovery,
  write_recovery_exports,
  open_url_exports,
  SIGNED_PUT_IDLE_MS,
  SIGNED_PUT_ANSWER_MS,
  fetchSignedRawPut,
  processRuntime,
  runtime_exports,
  FetchTransport,
  http_exports
};
