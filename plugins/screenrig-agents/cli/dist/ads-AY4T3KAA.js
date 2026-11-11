import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  calendarInstantOption,
  campaignRevisionLines,
  schedulePreviewLines
} from "./chunk-54SN6RFT.js";
import {
  revisionNumber
} from "./chunk-62YDP7Y7.js";
import "./chunk-CKOG7ZL3.js";
import {
  readAuthoringJson,
  readAuthoringText
} from "./chunk-OFOJKZJN.js";
import {
  NOTE_HELP,
  Option,
  decisionNoteOption,
  nonnegativeNumber,
  positiveInteger,
  reportFormatOption,
  reportOutputOption,
  reviewNoteOption,
  revision,
  vastTagUrl
} from "./chunk-A2S45EKE.js";
import {
  adsListOption,
  clientFor,
  commandHandler,
  humanLines,
  jsonBody,
  pendingReviewResult,
  playbackFormat,
  quotedRevision,
  reportFileOf,
  requireFlagValue,
  requirePrivateNoStore,
  requireToken,
  resolveDownloadOutput,
  reviewNoteFrom,
  simpleGet
} from "./chunk-SX4HKPRA.js";
import "./chunk-UD3J3FNQ.js";
import "./chunk-PPWTLS44.js";
import {
  csvByteStream,
  csvRecord,
  formatResultContext,
  isoUtc,
  pendingReviewOf,
  plainText,
  playsInstant,
  playsInstantOption,
  writeCsvFile,
  writeCsvStdout
} from "./chunk-RY7TSGK3.js";
import {
  CAMPAIGN_AUDIENCE_INPUT_MAX_BYTES,
  LEVEL_IDLE_DEFAULT_S,
  campaignAllScreensAudience,
  campaignAnyTagAudience,
  campaignAnyTags,
  campaignAudienceJson,
  campaignAudienceOption,
  campaignBounds,
  campaignData,
  campaignDataOption,
  campaignDateList,
  campaignDates,
  campaignDisplayList,
  campaignDisplays,
  campaignExceptDates,
  campaignExplainLines,
  campaignExplainTime,
  campaignFolder,
  campaignFolderAudience,
  campaignId,
  campaignInstant,
  campaignLines,
  campaignMonthlies,
  campaignMonthlyList,
  campaignName,
  campaignOnTouch,
  campaignPlaylistId,
  campaignPriority,
  campaignProblem,
  campaignPromoteProblem,
  campaignScreenAudience,
  campaignScreenId,
  campaignScreenIds,
  campaignScreensCursor,
  campaignScreensLimit,
  campaignScreensLines,
  campaignTableLines,
  campaignTagAudience,
  campaignTags,
  campaignWindowList,
  campaignWindows,
  flagBool,
  flagNumber,
  flagString,
  successEnvelope
} from "./chunk-D2RLMLYO.js";
import "./chunk-7EJTDXNL.js";
import "./chunk-BFLHHH47.js";
import "./chunk-P3D5NU6C.js";
import "./chunk-SFYZH3GR.js";
import {
  addCommandNotes,
  requireOptionGroup
} from "./chunk-IBLNZ4EM.js";
import {
  ExitCode,
  unexpectedResponseError,
  usageError
} from "./chunk-JP4OQPAN.js";
import "./chunk-3FYAGULW.js";

// dist/handlers/ads.js
async function adsMutation(args, runtime, resolved, options) {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({
    method: options.method,
    path: options.path,
    idempotent: true,
    ...options.ifMatch ? { headers: { "if-match": quotedRevision(options.ifMatch) } } : {},
    ...options.body === void 0 ? {} : { body: options.body }
  });
  requirePrivateNoStore(response.headers, "Advertising response");
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: options.human };
}
function plugged(key, value) {
  return value === void 0 ? {} : { [key]: value };
}
function adsNetworkRateBody(args) {
  return { rate_mcr_per_15s: flagString(args.flags, "rate-mcr-per-15s") };
}
function adsInventoryBody(args) {
  const enabled = flagBool(args.flags, "enabled") ? true : flagBool(args.flags, "disabled") ? false : void 0;
  const rate = flagString(args.flags, "rate-mcr-per-15s");
  const tags = flagString(args.flags, "audience-tags");
  const impressions = flagNumber(args.flags, "impressions-per-hour");
  return {
    ...enabled === void 0 ? {} : { ads_enabled: enabled },
    ...plugged("site_name", flagString(args.flags, "site-name")),
    ...plugged("city", flagString(args.flags, "city")),
    ...plugged("region", flagString(args.flags, "region")),
    ...plugged("venue_type", flagString(args.flags, "venue-type")),
    ...tags === void 0 ? {} : { audience_tags: adsListOption(tags, "audience-tags") },
    ...plugged("placement", flagString(args.flags, "placement")),
    ...plugged("public_description", flagString(args.flags, "public-description")),
    ...rate === void 0 ? {} : { rate_override_mcr_per_15s: rate },
    ...flagBool(args.flags, "clear-rate") ? { rate_override_mcr_per_15s: null } : {},
    ...plugged("impressions_per_hour", impressions),
    ...flagBool(args.flags, "clear-impressions-per-hour") ? { impressions_per_hour: null } : {}
  };
}
function adsSlotBody(args) {
  const media = flagString(args.flags, "accepted-media");
  const rate = flagString(args.flags, "rate-mcr-per-15s");
  const enabled = flagBool(args.flags, "enabled") ? true : flagBool(args.flags, "disabled") ? false : void 0;
  return {
    ...plugged("enabled", enabled),
    ...plugged("name", flagString(args.flags, "name")),
    ...media === void 0 ? {} : { accepted_media: adsListOption(media, "accepted-media") },
    ...plugged("max_image_duration_ms", flagNumber(args.flags, "max-image-duration-ms")),
    ...plugged("max_video_duration_ms", flagNumber(args.flags, "max-video-duration-ms")),
    ...rate === void 0 ? {} : { rate_override_mcr_per_15s: rate },
    ...flagBool(args.flags, "clear-rate") ? { rate_override_mcr_per_15s: null } : {},
    ...plugged("vast_tag_url", flagString(args.flags, "vast-tag-url")),
    ...flagBool(args.flags, "clear-vast-tag-url") ? { vast_tag_url: null } : {}
  };
}
async function adsExistingRow(client, path, collection, key, value) {
  const response = await client.call({ method: "GET", path });
  const rows = response.body?.[collection];
  if (!Array.isArray(rows))
    return void 0;
  const row = rows.find((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item))
      return false;
    return key in item && item[key] === value;
  });
  return row && typeof row === "object" && !Array.isArray(row) ? row : void 0;
}
function adsSlotWriteBody(current, args) {
  const supplied = adsSlotBody(args);
  if (!current)
    return supplied;
  return {
    name: current.name,
    enabled: current.enabled,
    accepted_media: current.accepted_media,
    max_image_duration_ms: current.max_image_duration_ms,
    max_video_duration_ms: current.max_video_duration_ms,
    rate_override_mcr_per_15s: current.rate_override_mcr_per_15s ?? null,
    // An absent vast_tag_url clears the tag, so the stored one (shown to the owning seller) is sent back.
    ...typeof current.vast_tag_url === "string" && current.vast_tag_url ? { vast_tag_url: current.vast_tag_url } : {},
    ...supplied
  };
}
function adsInventoryWriteBody(current, args) {
  const supplied = adsInventoryBody(args);
  if (!current)
    return supplied;
  return {
    ads_enabled: typeof current.ads_enabled === "boolean" ? current.ads_enabled : false,
    site_name: current.site_name,
    city: current.city,
    region: current.region,
    venue_type: current.venue_type,
    audience_tags: current.audience_tags,
    placement: current.placement,
    public_description: current.public_description,
    rate_override_mcr_per_15s: current.rate_override_mcr_per_15s ?? null,
    // An absent estimate clears it, so the stored one is sent back.
    ...typeof current.impressions_per_hour === "number" ? { impressions_per_hour: current.impressions_per_hour } : {},
    ...supplied
  };
}
function adsMembershipWriteBody(current, args) {
  const screenIds = flagString(args.flags, "screen-id");
  const slotIds = flagString(args.flags, "slot-id");
  const policy = flagString(args.flags, "policy") ?? (typeof current?.policy === "string" && current.policy.length > 0 ? current.policy : void 0);
  if (policy === void 0) {
    throw usageError("The membership row was not found, so its current review policy cannot be carried over. Run ads memberships list, or add --policy trusted|review_required explicitly.");
  }
  const scope = current?.scope;
  if ((screenIds === void 0 || slotIds === void 0) && (!scope || typeof scope !== "object" || Array.isArray(scope))) {
    throw usageError("The membership did not report its scope; refusing to replace an omitted list with an empty one.");
  }
  const storedScope = scope ?? {};
  return {
    screen_ids: screenIds === void 0 ? storedScope.screen_ids ?? [] : adsListOption(screenIds, "screen-id"),
    slot_ids: slotIds === void 0 ? storedScope.slot_ids ?? [] : adsListOption(slotIds, "slot-id"),
    policy
  };
}
function isDecimalMcr(value) {
  return typeof value === "string" && /^(0|[1-9][0-9]*)$/.test(value);
}
function isPositiveMcr(value) {
  return typeof value === "string" && /^[1-9][0-9]*$/.test(value);
}
async function campaignDraft(file, runtime) {
  if (!file)
    throw usageError("ads campaigns requires a draft JSON document.");
  let parsed;
  try {
    parsed = await readAuthoringJson(file, runtime);
  } catch (error) {
    throw usageError("Cannot read the campaign draft JSON: ".concat(error instanceof Error ? error.message : "invalid JSON"));
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw usageError("A campaign draft must be a JSON object.");
  }
  const draft = parsed;
  const fail = (field, expectation) => {
    throw usageError("Campaign draft field ".concat(field, " ").concat(expectation));
  };
  if (typeof draft.name !== "string" || draft.name.trim().length === 0)
    fail("name", "must be a non-empty string.");
  for (const field of ["daily_cap_mcr", "lifetime_cap_mcr"]) {
    if (!isDecimalMcr(draft[field]))
      fail(field, 'must be a decimal mcr string, for example "100000000".');
  }
  const imageDurationMs = draft.image_duration_ms;
  if (imageDurationMs !== void 0 && (typeof imageDurationMs !== "number" || !Number.isInteger(imageDurationMs) || imageDurationMs < 5e3 || imageDurationMs > 3e4)) {
    fail("image_duration_ms", "must be a whole number of milliseconds from 5000 to 30000 when present.");
  }
  if (draft.max_play_price_mcr !== void 0 && !isPositiveMcr(draft.max_play_price_mcr)) {
    fail("max_play_price_mcr", "must be a positive decimal mcr string when present; omit it for no extra price ceiling.");
  }
  for (const field of ["flight_start", "flight_end"]) {
    if (typeof draft[field] !== "string" || draft[field].trim().length === 0)
      fail(field, "must be a UTC timestamp string.");
  }
  if (!Array.isArray(draft.networks) || draft.networks.length === 0) {
    fail("networks", "must be a non-empty array of network configurations.");
  }
  for (const [index, value] of draft.networks.entries()) {
    if (!value || typeof value !== "object" || Array.isArray(value))
      fail("networks[".concat(index, "]"), "must be an object.");
    const network = value;
    if (typeof network.seller_project_id !== "string" || network.seller_project_id.length === 0) {
      fail("networks[".concat(index, "].seller_project_id"), "must name the invited seller project.");
    }
    for (const field of ["screen_ids", "slot_ids", "creative_ids"]) {
      const list = network[field];
      if (!Array.isArray(list) || list.some((item) => typeof item !== "string")) {
        fail("networks[".concat(index, "].").concat(field), "must be an array of string identifiers.");
      }
    }
    if (network.network_cap_mcr !== void 0 && !isDecimalMcr(network.network_cap_mcr)) {
      fail("networks[".concat(index, "].network_cap_mcr"), "must be a decimal mcr string when present.");
    }
  }
  return draft;
}
var handleAdsNetworksList = commandHandler((args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/advertising/networks", "Invited networks"));
var handleAdsNetworkInventoryShow = commandHandler(async (args, runtime, resolved) => {
  const seller = args.positionals[3];
  if (!seller)
    throw usageError("ads networks show requires <seller-project-id>.");
  return simpleGet(args, runtime, resolved, "/api/advertising/networks/".concat(encodeURIComponent(seller), "/inventory"), "Permitted inventory");
});
var handleAdsNetworkShow = commandHandler((args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/advertising/network", "Advertising network"));
var handleAdsNetworkCreate = commandHandler((args, runtime, resolved) => adsMutation(args, runtime, resolved, {
  method: "POST",
  path: "/api/advertising/network",
  body: { name: flagString(args.flags, "name") },
  human: "Network created. Set the default rate before enabling paid supply."
}));
var handleAdsNetworkRate = commandHandler((args, runtime, resolved) => adsMutation(args, runtime, resolved, {
  method: "POST",
  path: "/api/advertising/network/rate",
  body: adsNetworkRateBody(args),
  ifMatch: flagString(args.flags, "expect-rev"),
  human: "Default rate updated. Affected campaigns are paused until each buyer accepts a fresh quote."
}));
var handleAdsInventoryList = commandHandler((args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/advertising/inventory", "Advertising inventory"));
var handleAdsInventoryUpdate = commandHandler(async (args, runtime, resolved) => {
  const screenId = args.positionals[3];
  if (!screenId)
    throw usageError("ads inventory update requires <screen-id>.");
  const requested = flagString(args.flags, "expect-rev");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const current = await adsExistingRow(client, "/api/advertising/inventory", "inventory", "screen_id", screenId);
  if (!current && requested) {
    throw usageError("No advertising inventory row exists for ".concat(screenId, ", so --expect-rev has nothing to check. Omit it to create the row."));
  }
  if (!current && !flagBool(args.flags, "enabled") && !flagBool(args.flags, "disabled")) {
    throw usageError("No advertising inventory row exists for ".concat(screenId, " yet; a new row needs --enabled or --disabled so the write carries its ads_enabled field."));
  }
  const currentRevision = typeof current?.revision === "number" ? String(current.revision) : void 0;
  return adsMutation(args, runtime, resolved, {
    method: "PUT",
    path: "/api/advertising/inventory/".concat(encodeURIComponent(screenId)),
    body: adsInventoryWriteBody(current, args),
    ifMatch: requested ?? (current ? currentRevision : void 0),
    human: "Updated advertising inventory for ".concat(screenId, ". Fields you did not change keep their stored values.")
  });
});
var handleAdsSlotsList = commandHandler((args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/advertising/slots", "Ad slots"));
var handleAdsSlotsCreate = commandHandler((args, runtime, resolved) => adsMutation(args, runtime, resolved, {
  method: "POST",
  path: "/api/advertising/slots",
  // The canonical slot write requires both duration limits; the values below
  // are the server's own normalization defaults for an omitted limit, so the
  // create body is complete without a second server round-trip.
  body: {
    enabled: true,
    max_image_duration_ms: 3e4,
    max_video_duration_ms: 3e4,
    ...adsSlotBody(args)
  },
  human: "Slot created. Place an adslot page in a playlist to give it an ad break."
}));
var handleAdsSlotsUpdate = commandHandler(async (args, runtime, resolved) => {
  const slotId = args.positionals[3];
  if (!slotId)
    throw usageError("ads slots update requires <slot-id>.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const current = await adsExistingRow(client, "/api/advertising/slots", "slots", "id", slotId);
  if (!current) {
    throw usageError("No slot ".concat(slotId, " exists for this project, so there is nothing to update. Create it with ads slots create."));
  }
  const currentRevision = typeof current.revision === "number" ? String(current.revision) : void 0;
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: "/api/advertising/slots/".concat(encodeURIComponent(slotId)),
    body: adsSlotWriteBody(current, args),
    ifMatch: flagString(args.flags, "expect-rev") ?? currentRevision,
    human: "Slot updated. A changed effective rate pauses affected campaigns until each buyer accepts a fresh quote."
  });
});
var handleAdsMembershipsList = commandHandler((args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/advertising/memberships", "Memberships"));
var handleAdsMembershipsUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads memberships update requires <membership-id>.");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const current = await adsExistingRow(client, "/api/advertising/memberships", "memberships", "id", id);
  const currentRevision = typeof current?.revision === "number" ? String(current.revision) : void 0;
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: "/api/advertising/memberships/".concat(encodeURIComponent(id)),
    body: adsMembershipWriteBody(current, args),
    ifMatch: flagString(args.flags, "expect-rev") ?? currentRevision,
    human: "Updated membership ".concat(id, ". Scope changes stop new selections and invalidate unstarted decisions.")
  });
});
var handleAdsMembershipsRevoke = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads memberships revoke requires <membership-id>.");
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: "/api/advertising/memberships/".concat(encodeURIComponent(id), "/revoke"),
    human: "Revoked membership ".concat(id, ". The buyer's advertiser flag and other networks are unchanged.")
  });
});
var handleAdsCreativesList = commandHandler((args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/advertising/creatives", "Creatives"));
var handleAdsCreativesCreate = commandHandler(async (args, runtime, resolved) => adsMutation(args, runtime, resolved, {
  method: "POST",
  path: "/api/advertising/creatives",
  body: { media_id: flagString(args.flags, "media-id"), copy: flagString(args.flags, "copy") },
  human: "Creative created. It binds the ready media revision; the media is neither charged nor uploaded again."
}));
var handleAdsCreativesShow = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads creatives show requires <creative-id>.");
  const result = await simpleGet(args, runtime, resolved, "/api/advertising/creatives/".concat(encodeURIComponent(id)), "Creative");
  const reviews = result.envelope.data?.reviews;
  if (!Array.isArray(reviews) || reviews.length === 0)
    return result;
  const lines = reviews.map((review) => [
    "review ".concat(review.id, " ").concat(review.state),
    "seller ".concat(review.seller_project_id),
    "revision ".concat(review.creative_revision),
    ...review.campaign_id ? ["campaign ".concat(review.campaign_id)] : []
  ].join(" ") + (review.reason ? ": ".concat(plainText(review.reason)) : ""));
  const [title, ...rest] = (result.human ?? "").split("\n");
  return { ...result, human: [title, ...lines, ...rest].join("\n") };
});
var handleAdsCampaignsList = commandHandler((args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/advertising/campaigns", "Campaigns"));
var handleAdsCampaignsCreate = commandHandler(async (args, runtime, resolved) => adsMutation(args, runtime, resolved, {
  method: "POST",
  path: "/api/advertising/campaigns",
  body: await campaignDraft(args.positionals[3], runtime),
  human: "Campaign draft created. A draft reserves no credits and cannot deliver until an accepted quote activates it."
}));
var handleAdsCampaignsShow = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads campaigns show requires <campaign-id>.");
  return simpleGet(args, runtime, resolved, "/api/advertising/campaigns/".concat(encodeURIComponent(id)), "Campaign");
});
var handleAdsCampaignsPreview = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads campaigns preview requires <campaign-id>.");
  let ifMatch = flagString(args.flags, "expect-rev");
  if (ifMatch === void 0) {
    const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
    const campaign = (await client.call({ method: "GET", path: "/api/advertising/campaigns/".concat(encodeURIComponent(id)) })).body;
    const revision2 = campaign !== null && typeof campaign === "object" && !Array.isArray(campaign) && "revision" in campaign ? campaign.revision : void 0;
    if (!Number.isSafeInteger(revision2) || revision2 < 1) {
      throw usageError("Campaign ".concat(id, " did not report a usable revision, so its quote cannot be revision-checked."));
    }
    ifMatch = String(revision2);
  }
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: "/api/advertising/campaigns/".concat(encodeURIComponent(id), "/quote"),
    ifMatch,
    human: "Quote priced for current inventory and rates. Preview reserves and spends nothing; activate with --quote-id only after the user accepts this quote."
  });
});
var handleAdsCampaignsUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads campaigns update requires <campaign-id> <file>.");
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: "/api/advertising/campaigns/".concat(encodeURIComponent(id)),
    body: await campaignDraft(args.positionals[4], runtime),
    ifMatch: flagString(args.flags, "expect-rev"),
    human: "Campaign ".concat(id, " draft replaced. Changing accepted scope requires a fresh quote and explicit acceptance.")
  });
});
var handleAdsCampaignsActivate = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads campaigns activate requires <campaign-id>.");
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: "/api/advertising/campaigns/".concat(encodeURIComponent(id), "/activate"),
    body: { quote_id: flagString(args.flags, "quote-id") },
    ifMatch: flagString(args.flags, "expect-rev"),
    human: "Campaign activation accepted the quote. No wallet debit happens here: a per-occurrence hold is placed when the runtime resolves a play and it settles only on the verified completion. Activation is not proof that a screen displayed anything."
  });
});
var handleAdsCampaignsPause = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads campaigns pause requires <campaign-id>.");
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: "/api/advertising/campaigns/".concat(encodeURIComponent(id), "/pause"),
    ifMatch: flagString(args.flags, "expect-rev"),
    human: "Paused campaign ".concat(id, ". New reservations stop; already-started valid plays settle at their reserved price.")
  });
});
var handleAdsCampaignsResume = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads campaigns resume requires <campaign-id>.");
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: "/api/advertising/campaigns/".concat(encodeURIComponent(id), "/resume"),
    ifMatch: flagString(args.flags, "expect-rev"),
    human: "Resumed campaign ".concat(id, " after a manual pause. Resume cannot clear a price-change pause; that needs a fresh quote accepted with campaigns accept-rates.")
  });
});
var handleAdsCampaignsAcceptRates = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads campaigns accept-rates requires <campaign-id>.");
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: "/api/advertising/campaigns/".concat(encodeURIComponent(id), "/accept-rates"),
    body: { quote_id: flagString(args.flags, "quote-id") },
    ifMatch: flagString(args.flags, "expect-rev"),
    human: "Accepted the fresh quote for campaign ".concat(id, ". Delivery resumes only if every other blocker, such as review or funds, is also clear.")
  });
});
var handleAdsReviewsList = commandHandler((args, runtime, resolved) => simpleGet(args, runtime, resolved, "/api/advertising/reviews", "Creative reviews"));
var handleAdsReviewsShow = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads reviews show requires <review-id>.");
  return simpleGet(args, runtime, resolved, "/api/advertising/reviews/".concat(encodeURIComponent(id)), "Review");
});
var handleAdsReviewsApprove = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads reviews approve requires <review-id>.");
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: "/api/advertising/reviews/".concat(encodeURIComponent(id), "/approve"),
    human: "Approved review ".concat(id, " for that exact creative version.")
  });
});
var handleAdsReviewsRequestChanges = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads reviews request-changes requires <review-id>.");
  const note = flagString(args.flags, "note");
  if (!note)
    throw usageError("ads reviews request-changes requires --note TEXT naming the changes.");
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: "/api/advertising/reviews/".concat(encodeURIComponent(id), "/request-changes"),
    body: { note },
    human: "Asked the buyer for changes on review ".concat(id, "; the buyer reads the note on the creative and resubmits.")
  });
});
var handleAdsReviewsReject = commandHandler(async (args, runtime, resolved) => {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads reviews reject requires <review-id>.");
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: "/api/advertising/reviews/".concat(encodeURIComponent(id), "/reject"),
    body: { reason: flagString(args.flags, "reason") },
    human: "Rejected review ".concat(id, "; the buyer sees the supplied reason.")
  });
});
function reportLines(title, body, fields, rows) {
  const record = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const lines = humanLines(title, fields.map((field) => {
    const value = record[field];
    return [field, typeof value === "string" || typeof value === "number" ? String(value) : void 0];
  })).split("\n");
  const rowValues = rows ? record.rows : void 0;
  if (!rows || !Array.isArray(rowValues)) {
    return lines.join("\n");
  }
  lines.push("rows:");
  for (const value of rowValues) {
    if (!value || typeof value !== "object" || Array.isArray(value))
      continue;
    const row = value;
    lines.push("  ".concat(rows.map((field) => "".concat(field, "=").concat(typeof row[field] === "string" || typeof row[field] === "number" ? String(row[field]) : "")).join(" ")));
  }
  return lines.join("\n");
}
var handleAdsReportsSpend = commandHandler(async (args, runtime, resolved) => {
  const spendFile = await reportFileOf(args, runtime, resolved, "/api/advertising/reports/spend", { campaign_id: flagString(args.flags, "campaign-id") }, "ad-spend", "ad spend report");
  if (spendFile)
    return spendFile;
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const response = await client.call({
    method: "GET",
    path: "/api/advertising/reports/spend",
    query: { campaign_id: flagString(args.flags, "campaign-id") }
  });
  requirePrivateNoStore(response.headers, "Advertising report response");
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: reportLines("Ad spend", response.body, ["campaign_id", "spent_mcr", "reserved_mcr", "completed", "unbillable", "pending", "estimated_impressions"])
  };
});
var handleAdsReportsDelivery = commandHandler(async (args, runtime, resolved) => {
  const deliveryFile = await reportFileOf(args, runtime, resolved, "/api/advertising/reports/delivery", { from: flagString(args.flags, "from"), to: flagString(args.flags, "to") }, "ad-delivery", "ad delivery report");
  if (deliveryFile)
    return deliveryFile;
  const token = requireToken(resolved.token);
  const client = clientFor(runtime, args, resolved.apiUrl, token);
  const response = await client.call({
    method: "GET",
    path: "/api/advertising/reports/delivery",
    query: { from: flagString(args.flags, "from"), to: flagString(args.flags, "to") }
  });
  requirePrivateNoStore(response.headers, "Advertising report response");
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: reportLines("Delivery statement", response.body, ["gross_mcr", "fee_mcr", "net_mcr", "completed", "interrupted", "unbillable", "estimated_impressions"], ["screen_id", "slot_id", "reservation_id", "gross_mcr", "fee_mcr", "net_mcr", "estimated_impressions", "completed_at"])
  };
});
var DIRECT_CAMPAIGNS = "/api/advertising/direct-campaigns";
var FILL_MAX_RANGE_MS = 35 * 864e5;
function directCampaignPath(args, command) {
  const id = args.positionals[3];
  if (!id)
    throw usageError("ads direct ".concat(command, " requires <campaign-id>."));
  return "".concat(DIRECT_CAMPAIGNS, "/").concat(encodeURIComponent(id));
}
async function directDocument(file, runtime, what) {
  if (!file)
    throw usageError("ads direct requires a ".concat(what, " JSON document."));
  let parsed;
  try {
    parsed = await readAuthoringJson(file, runtime);
  } catch (error) {
    throw usageError("Cannot read the ".concat(what, " JSON: ").concat(error instanceof Error ? error.message : "invalid JSON"));
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw usageError("A ".concat(what, " must be a JSON object."));
  }
  return parsed;
}
async function directDraft(file, runtime) {
  const draft = await directDocument(file, runtime, "direct campaign draft");
  const fail = (field, expectation) => {
    throw usageError("Direct campaign draft field ".concat(field, " ").concat(expectation));
  };
  for (const field of ["name", "advertiser", "flight_start", "flight_end"]) {
    if (typeof draft[field] !== "string" || draft[field].trim().length === 0) {
      fail(field, field === "name" || field === "advertiser" ? "must be a non-empty string." : "must be an RFC 3339 timestamp string.");
    }
  }
  if (!Array.isArray(draft.media_ids) || draft.media_ids.length === 0 || draft.media_ids.some((item) => typeof item !== "string")) {
    fail("media_ids", "must be a non-empty array of media identifiers.");
  }
  if (draft.goal_plays !== void 0 && (typeof draft.goal_plays !== "number" || !Number.isSafeInteger(draft.goal_plays) || draft.goal_plays < 0)) {
    fail("goal_plays", "must be a whole number of plays when present; 0 or omitted takes every eligible slot during the flight.");
  }
  if (draft.overbook !== void 0 && typeof draft.overbook !== "boolean") {
    fail("overbook", "must be true or false when present.");
  }
  return draft;
}
function adsWindow(args, runtime, maxMs) {
  requireFlagValue(args, "from", "7d");
  requireFlagValue(args, "to", "now");
  const now = runtime.now();
  const from = flagString(args.flags, "from");
  const to = flagString(args.flags, "to");
  const fromMs = from === void 0 ? void 0 : playsInstant(from, "--from", now);
  const toMs = to === void 0 ? void 0 : playsInstant(to, "--to", now);
  if (fromMs !== void 0 && toMs !== void 0) {
    if (fromMs >= toMs)
      throw usageError("--from must be before --to.");
    if (maxMs !== void 0 && toMs - fromMs > maxMs) {
      throw usageError("--from to --to must span at most ".concat(maxMs / 864e5, " days."));
    }
  }
  return { ...fromMs === void 0 ? {} : { from: isoUtc(fromMs) }, ...toMs === void 0 ? {} : { to: isoUtc(toMs) } };
}
var handleAdsDirectList = commandHandler((args, runtime, resolved) => simpleGet(args, runtime, resolved, DIRECT_CAMPAIGNS, "Direct campaigns"));
var handleAdsDirectShow = commandHandler((args, runtime, resolved) => simpleGet(args, runtime, resolved, directCampaignPath(args, "show"), "Direct campaign"));
var handleAdsDirectCreate = commandHandler(async (args, runtime, resolved) => adsMutation(args, runtime, resolved, {
  method: "POST",
  path: DIRECT_CAMPAIGNS,
  body: await directDraft(args.positionals[3], runtime),
  human: "Direct campaign created. It fills this project's own ad slots before marketplace campaigns and moves no money through screenRIG: you bill the advertiser."
}));
var handleAdsDirectUpdate = commandHandler(async (args, runtime, resolved) => {
  const target = directCampaignPath(args, "update");
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: target,
    body: await directDraft(args.positionals[4], runtime),
    ifMatch: flagString(args.flags, "expect-rev"),
    human: "Direct campaign ".concat(args.positionals[3], " replaced from the draft. Every writable field now holds the draft's value.")
  });
});
var directTransition = (verb, human) => commandHandler(async (args, runtime, resolved) => {
  const target = directCampaignPath(args, verb);
  return adsMutation(args, runtime, resolved, {
    method: "POST",
    path: "".concat(target, "/").concat(verb),
    ifMatch: flagString(args.flags, "expect-rev"),
    human: human(args.positionals[3])
  });
});
var handleAdsDirectPause = directTransition("pause", (id) => "Paused direct campaign ".concat(id, ". It stops taking ad slots until it is resumed."));
var handleAdsDirectResume = directTransition("resume", (id) => "Resumed direct campaign ".concat(id, ". It takes eligible ad slots again within its flight."));
var handleAdsDirectEnd = directTransition("end", (id) => "Ended direct campaign ".concat(id, ". Ending is final: create a new direct campaign to run it again. Its report stays readable."));
var handleAdsDirectAvailability = commandHandler(async (args, runtime, resolved) => {
  const query = await directDocument(args.positionals[3], runtime, "availability query");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "POST", path: "/api/advertising/availability", body: query });
  requirePrivateNoStore(response.headers, "Advertising availability response");
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: reportLines("Ad availability", response.body, ["estimated_plays", "booked_plays", "available_plays", "screens", "observed_from", "observed_to", "flight_start", "flight_end"])
  };
});
var DIRECT_REPORT_ROW_FIELDS = ["day", "screen_id", "slot_id", "media_id", "plays", "played_ms", "estimated_impressions"];
function directValueLine(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return void 0;
  const { amount, currency, model } = value;
  return typeof amount === "string" ? "".concat(amount).concat(typeof currency === "string" ? " ".concat(currency) : "").concat(typeof model === "string" ? " (".concat(model, ")") : "") : void 0;
}
var handleAdsDirectReport = commandHandler(async (args, runtime, resolved) => {
  const target = directCampaignPath(args, "report");
  const id = args.positionals[3];
  const window = adsWindow(args, runtime);
  const directFile = await reportFileOf(args, runtime, resolved, "".concat(target, "/report"), window, "direct-report-".concat(id), "direct campaign report", true);
  if (directFile)
    return directFile;
  const format = playbackFormat(args, "ads direct report");
  const toStdout = flagString(args.flags, "output") === "-";
  const outputPath = format === "csv" && !toStdout ? await resolveDownloadOutput(runtime.cwd(), "./direct-report-".concat(id, ".csv"), args.flags) : void 0;
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "".concat(target, "/report"), query: window });
  requirePrivateNoStore(response.headers, "Advertising report response");
  const report = response.body && typeof response.body === "object" && !Array.isArray(response.body) ? response.body : {};
  const rows = (Array.isArray(report.rows) ? report.rows : []).filter((row) => !!row && typeof row === "object" && !Array.isArray(row));
  const truncated = report.truncated === true;
  const truncation = { code: "direct_report_truncated", message: "The report holds only part of the rows for this period. Narrow --from and --to and run it again for the rest." };
  if (format === "json") {
    const envelope = jsonBody(response, client.requestId, void 0, truncated ? [truncation] : []);
    const lines = humanLines("Direct campaign report", [
      ["campaign_id", typeof report.campaign_id === "string" ? report.campaign_id : void 0],
      ["name", typeof report.name === "string" ? report.name : void 0],
      ["advertiser", typeof report.advertiser === "string" ? report.advertiser : void 0],
      ["period", typeof report.from === "string" && typeof report.to === "string" ? "".concat(report.from, " to ").concat(report.to) : void 0],
      ...["goal_plays", "delivered_plays", "plays", "played_ms", "not_played", "estimated_impressions"].map((field) => [field, typeof report[field] === "number" ? String(report[field]) : void 0]),
      ["value", directValueLine(report.value)]
    ]).split("\n");
    if (rows.length > 0) {
      lines.push("rows:");
      for (const row of rows)
        lines.push("  ".concat(DIRECT_REPORT_ROW_FIELDS.map((field) => "".concat(field, "=").concat(row[field] ?? "")).join(" ")));
    }
    if (truncated)
      lines.push("warning: ".concat(truncation.message));
    return { envelope, exitCode: ExitCode.Success, human: lines.join("\n") };
  }
  const csv = [
    csvRecord(DIRECT_REPORT_ROW_FIELDS),
    ...rows.map((row) => csvRecord(DIRECT_REPORT_ROW_FIELDS.map((field) => row[field])))
  ].join("");
  const what = "direct campaign report";
  if (toStdout) {
    if (formatResultContext(runtime))
      runtime.stderr.write("".concat(formatResultContext(runtime), "\n"));
    await writeCsvStdout(csvByteStream(csv), runtime.stdout, what, client.requestId);
    if (truncated)
      runtime.stderr.write("warning: ".concat(truncation.message, "\n"));
    return { envelope: successEnvelope({}), exitCode: ExitCode.Success, human: "", output: "stream" };
  }
  const file = await writeCsvFile(csvByteStream(csv), outputPath, what, client.requestId);
  const data = {
    path: file.path,
    bytes: file.bytes,
    rows: file.rows,
    sha256: file.sha256,
    content_type: "text/csv",
    campaign_id: id,
    ...typeof report.from === "string" ? { from: report.from } : {},
    ...typeof report.to === "string" ? { to: report.to } : {}
  };
  return {
    envelope: successEnvelope(data, { request_id: client.requestId, warnings: truncated ? [truncation] : [] }),
    exitCode: ExitCode.Success,
    human: [
      humanLines("Direct campaign report exported", [
        ["path", file.path],
        ["rows", String(file.rows)],
        ["bytes", String(file.bytes)],
        ["sha256", file.sha256]
      ]),
      ...truncated ? ["warning: ".concat(truncation.message)] : []
    ].join("\n")
  };
});
var handleAdsReportsFill = commandHandler(async (args, runtime, resolved) => {
  const window = adsWindow(args, runtime, FILL_MAX_RANGE_MS);
  const fillFile = await reportFileOf(args, runtime, resolved, "/api/advertising/reports/fill", window, "ad-fill", "ad fill report");
  if (fillFile)
    return fillFile;
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await client.call({ method: "GET", path: "/api/advertising/reports/fill", query: window });
  requirePrivateNoStore(response.headers, "Advertising report response");
  const report = response.body && typeof response.body === "object" && !Array.isArray(response.body) ? response.body : {};
  const lines = humanLines("Ad slot fill", [
    ["period", typeof report.from === "string" && typeof report.to === "string" ? "".concat(report.from, " to ").concat(report.to) : void 0],
    ...["occurrences", "direct", "marketplace", "vast", "unfilled", "fill_rate"].map((field) => [field, typeof report[field] === "number" ? String(report[field]) : void 0])
  ]).split("\n");
  const reasons = report.unfilled_reasons;
  if (reasons && typeof reasons === "object" && !Array.isArray(reasons)) {
    lines.push("unfilled_reasons: ".concat(Object.entries(reasons).map(([reason, count]) => "".concat(reason, "=").concat(count)).join(" ")));
  }
  if (Array.isArray(report.days)) {
    lines.push("days:");
    for (const value of report.days) {
      if (!value || typeof value !== "object" || Array.isArray(value))
        continue;
      const day = value;
      lines.push("  ".concat(["day", "occurrences", "direct", "marketplace", "vast", "unfilled", "fill_rate"].map((field) => "".concat(field, "=").concat(day[field] ?? "")).join(" ")));
    }
  }
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: lines.join("\n") };
});

// dist/cli-commands/ads.js
function registerAdsCommands(root, bind) {
  const ads = root.command("ads").description("Buy advertising and sell owned inventory");
  const networks = ads.command("networks").description("Inspect the networks this project may buy ads in");
  networks.command("list").description("List invited networks this project has joined").action(bind(handleAdsNetworksList));
  networks.command("show").description("Inspect one joined network's permitted inventory and slots").argument("<seller-project-id>", "Seller project that owns the network").action(bind(handleAdsNetworkInventoryShow));
  const network = ads.command("network").description("Inspect or configure this project's own seller network");
  network.command("show").description("Inspect this seller project's network").action(bind(handleAdsNetworkShow));
  network.command("create").description("Create this seller project's network").requiredOption("--name <NAME>", "Network display name").action(bind(handleAdsNetworkCreate));
  const rate = network.command("rate").description("Set the network default rate per 15 seconds").requiredOption("--rate-mcr-per-15s <MCR>", "Positive integer mcr rate per 15 seconds of completed playback", positiveInteger("rate-mcr-per-15s")).requiredOption("--expect-rev <REVISION>", "Current network revision (required)", revision).action(bind(handleAdsNetworkRate));
  addCommandNotes(rate, "Changing the effective rate for accepted inventory pauses every affected campaign with price_change_pending. Each buyer must accept a fresh quote before delivery resumes; a top-up, schedule tick, or ordinary resume cannot supply that consent.");
  const inventory = ads.command("inventory").description("Opt this project's screens in or out of advertising and describe them");
  inventory.command("list").description("List this seller project's advertising inventory").action(bind(handleAdsInventoryList));
  const inventoryUpdate = inventory.command("update").description("Update one screen's advertising inventory").argument("<screen-id>", "Owned screen identifier").addOption(new Option("--enabled", "Enable paid advertising on this screen").conflicts("disabled")).addOption(new Option("--disabled", "Stop offering paid advertising on this screen").conflicts("enabled")).option("--site-name <NAME>", "Public site name").option("--city <CITY>", "City").option("--region <REGION>", "Region or province").option("--venue-type <TYPE>", "Venue type").option("--audience-tags <TOKENS>", "Comma-separated public audience tags (at most 20 tokens, 32 characters each)").option("--placement <TEXT>", "Physical placement of this screen at the venue").option("--expect-rev <REVISION>", "Override the precondition with this inventory revision", revision).option("--public-description <TEXT>", "Public description shown to invited buyers").addOption(new Option("--rate-mcr-per-15s <MCR>", "Positive integer mcr rate override per 15 seconds").argParser(positiveInteger("rate-mcr-per-15s")).conflicts("clearRate")).addOption(new Option("--clear-rate", "Remove this screen's rate override and inherit the project default").conflicts("rateMcrPer15s")).addOption(new Option("--impressions-per-hour <N>", "Estimated impressions this screen delivers per hour (0 or more)").argParser(nonnegativeNumber("impressions-per-hour")).conflicts("clearImpressionsPerHour")).addOption(new Option("--clear-impressions-per-hour", "Remove this screen's impressions estimate").conflicts("impressionsPerHour")).action(bind(handleAdsInventoryUpdate));
  requireOptionGroup(inventoryUpdate, "atLeastOne", [
    "--enabled",
    "--disabled",
    "--site-name",
    "--city",
    "--region",
    "--venue-type",
    "--audience-tags",
    "--placement",
    "--public-description",
    "--rate-mcr-per-15s",
    "--clear-rate",
    "--impressions-per-hour",
    "--clear-impressions-per-hour"
  ]);
  addCommandNotes(inventoryUpdate, "The stored row is read first, then written as a whole record: flags you omit keep the current opt-in flag, price override, impressions estimate, and public metadata, and the row's current revision is sent as the precondition. When no row exists yet the supplied fields create it (a new row requires --enabled or --disabled) and --expect-rev has nothing to check. --impressions-per-hour sets the screen's estimate of impressions per hour; reports count each completed play as that estimate times the seconds played over 3600 in estimated_impressions, and --clear-impressions-per-hour removes the estimate.");
  const slots = ads.command("slots").description("Manage the reusable ad slots this seller offers");
  slots.command("list").description("List this seller project's slot definitions").action(bind(handleAdsSlotsList));
  const VAST_HELP = "The seller's own VAST 2-4 ad tag (HTTPS), tried when no invited campaign fills this slot; the slot must accept video";
  const slotFields = (command, create) => command.addOption(new Option("--enabled", "Enable this slot (the default for a new slot)").conflicts("disabled")).addOption(new Option("--disabled", "Keep this slot unavailable for paid playback").conflicts("enabled")).addOption(create ? new Option("--name <NAME>", "Slot display name (required)").makeOptionMandatory() : new Option("--name <NAME>", "Slot display name")).addOption(create ? new Option("--accepted-media <KINDS>", "Comma-separated accepted media: image, video (required)").makeOptionMandatory() : new Option("--accepted-media <KINDS>", "Comma-separated accepted media: image, video")).option("--max-image-duration-ms <MS>", "Longest accepted image duration", positiveInteger("max-image-duration-ms")).option("--max-video-duration-ms <MS>", "Longest accepted finite video duration", positiveInteger("max-video-duration-ms")).addOption(new Option("--rate-mcr-per-15s <MCR>", "Positive integer mcr rate override for this slot").argParser(positiveInteger("rate-mcr-per-15s")).conflicts("clearRate")).addOption(new Option("--clear-rate", "Remove this slot's rate override and inherit the screen or project rate").conflicts("rateMcrPer15s")).addOption(create ? new Option("--vast-tag-url <URL>", VAST_HELP).argParser(vastTagUrl) : new Option("--vast-tag-url <URL>", VAST_HELP).argParser(vastTagUrl).conflicts("clearVastTagUrl"));
  const slotsCreate = slotFields(slots.command("create").description("Create a reusable slot definition").action(bind(handleAdsSlotsCreate)), true);
  const slotsUpdate = slotFields(slots.command("update").description("Update a reusable slot definition").argument("<slot-id>", "Slot identifier").requiredOption("--expect-rev <REVISION>", "Current slot revision (required)", revision).addOption(new Option("--clear-vast-tag-url", "Remove this slot's VAST tag").conflicts("vastTagUrl")).action(bind(handleAdsSlotsUpdate)), false);
  addCommandNotes(slotsCreate, "Creating a slot definition does not put an ad break into any playlist: place an adslot page through playlist authoring. Omitted duration limits adopt the server defaults: images up to 30000 ms and finite videos up to 30000 ms.");
  addCommandNotes(slotsUpdate, "The stored definition is read first, then written as a whole record: flags you omit keep the current accepted formats, duration limits, and rate override. A changed effective rate installs a pricing barrier that pauses affected campaigns with price_change_pending until each buyer accepts a fresh quote.");
  const memberships = ads.command("memberships").description("Manage buyers admitted to this seller's network");
  memberships.command("list").description("List this seller project's memberships").action(bind(handleAdsMembershipsList));
  memberships.command("update").description("Change one membership's policy or inventory scope").argument("<membership-id>", "Membership identifier").addOption(new Option("--policy <POLICY>", "Review policy").choices(["trusted", "review_required"])).option("--screen-id <IDS>", "Comma-separated allowed screen identifiers (empty means no screen)").option("--slot-id <IDS>", "Comma-separated allowed slot identifiers (empty means no slot)").requiredOption("--expect-rev <REVISION>", "Current membership revision (required)", revision).action(bind(handleAdsMembershipsUpdate));
  addCommandNotes(memberships.commands.find((command) => command.name() === "update"), "The stored membership is read first: an omitted --policy keeps the current review policy, and an omitted scope list keeps the buyer's stored screen and slot access instead of clearing it.");
  memberships.command("revoke").description("Revoke a membership").argument("<membership-id>", "Membership identifier").action(bind(handleAdsMembershipsRevoke));
  const creatives = ads.command("creatives").description("Bind ready owned media to an immutable advertising creative");
  creatives.command("list").description("List this buyer project's creatives").action(bind(handleAdsCreativesList));
  const creativeCreate = creatives.command("create").description("Create a creative from ready owned media").requiredOption("--media-id <ID>", "Ready media identifier owned by this project").requiredOption("--copy <TEXT>", "Approved copy shown with the creative").action(bind(handleAdsCreativesCreate));
  const creativeShow = creatives.command("show").description("Inspect one creative and its review state").argument("<creative-id>", "Creative identifier").action(bind(handleAdsCreativesShow));
  addCommandNotes(creativeShow, "reviews lists each seller network's decision on a revision of this creative (pending, approved, rejected or changes_requested) with the seller's reason for a rejection or a change request. Human output prints one line per review.");
  addCommandNotes(creativeCreate, "Binding a creative neither charges nor uploads the media again. An approved creative never changes pixels in place: edit the source media and bind a new creative version.");
  const campaigns = ads.command("campaigns").description("Draft, price, activate, and operate buyer campaigns");
  campaigns.command("list").description("List this buyer project's campaigns").action(bind(handleAdsCampaignsList));
  campaigns.command("show").description("Inspect one campaign").argument("<campaign-id>", "Campaign identifier").action(bind(handleAdsCampaignsShow));
  const campaignCreate = campaigns.command("create").description("Create a campaign draft from a JSON document").argument("<file>", "Campaign draft JSON file, or - for stdin").action(bind(handleAdsCampaignsCreate));
  const campaignUpdate = campaigns.command("update").description("Replace a campaign draft from a JSON document").argument("<campaign-id>", "Campaign identifier").argument("<file>", "Campaign draft JSON file, or - for stdin").requiredOption("--expect-rev <REVISION>", "Current campaign revision (required)", revision).action(bind(handleAdsCampaignsUpdate));
  const campaignActivate = campaigns.command("activate").description("Activate a campaign under an accepted quote").argument("<campaign-id>", "Campaign identifier").requiredOption("--quote-id <ID>", "Quote identifier returned by campaigns preview").requiredOption("--expect-rev <REVISION>", "Campaign revision the quote priced (required)", revision).action(bind(handleAdsCampaignsActivate));
  const campaignPreview = campaigns.command("preview").description("Quote the campaign's current inventory and prices").argument("<campaign-id>", "Campaign identifier").option("--expect-rev <REVISION>", "Override the precondition with this campaign revision", revision).action(bind(handleAdsCampaignsPreview));
  const campaignPause = campaigns.command("pause").description("Pause a campaign").argument("<campaign-id>", "Campaign identifier").requiredOption("--expect-rev <REVISION>", "Current campaign revision (required)", revision).action(bind(handleAdsCampaignsPause));
  campaigns.command("resume").description("Resume a manually paused campaign").argument("<campaign-id>", "Campaign identifier").requiredOption("--expect-rev <REVISION>", "Current campaign revision (required)", revision).action(bind(handleAdsCampaignsResume));
  const campaignAcceptRates = campaigns.command("accept-rates").description("Accept a fresh quote and resume after a seller rate change").argument("<campaign-id>", "Campaign identifier").requiredOption("--quote-id <ID>", "Fresh quote identifier for the changed rates").requiredOption("--expect-rev <REVISION>", "Campaign revision the fresh quote priced (required)", revision).action(bind(handleAdsCampaignsAcceptRates));
  for (const command of [campaignCreate, campaignUpdate]) {
    addCommandNotes(command, 'The draft JSON needs name, daily_cap_mcr, lifetime_cap_mcr, flight_start and flight_end (RFC 3339), and networks: [{"seller_project_id", "screen_ids": [...], "slot_ids": [...], "creative_ids": [...]}], one per seller network this buyer was admitted to. A saved draft authorizes nothing: no credits are reserved and no ad can play until an accepted, unexpired quote activates it. The draft chooses the image display duration (`image_duration_ms`, 5000\u201330000 ms, ten seconds when omitted) and an optional per-play price ceiling (`max_play_price_mcr`, a decimal mcr string; omit it for no extra ceiling). Money fields are decimal mcr strings, never numbers. An optional `category` (the values are listed under ads direct create) keeps competitors apart: two ads of one category never play in the same ad break on a screen.');
  }
  addCommandNotes(campaignPreview, "Preview is the acceptance artifact: it prices the current inventory and rates and spends, reserves, and activates nothing. The quote is revision-checked against the campaign revision the CLI just read, or the one you pass with --expect-rev. Rates can change before activation: accept the quote you were shown, never a silent replacement.");
  addCommandNotes(campaignActivate, "Activation requires explicit acceptance of this exact quote. It atomically checks ownership, current invitation authority, quote expiry, and pricing revisions; no wallet debit or seller revenue happens just from accepting terms.");
  addCommandNotes(campaignAcceptRates, "Only the buyer's explicit acceptance resumes a campaign paused by a seller rate change. A top-up, price ceiling, schedule tick, or ordinary resume cannot supply that consent, and a stale quote is rejected rather than accepted at another price.");
  addCommandNotes(campaignPause, "Pausing stops new reservations. Already-started valid plays normally finish and settle at their reserved price.");
  const direct = ads.command("direct").description("Run direct campaigns for outside advertisers on this project's own ad slots");
  addCommandNotes(direct, "A direct campaign is this seller's own deal for an outside advertiser on the seller's own ad inventory. It moves no money through screenRIG: the seller bills the advertiser, and the recorded price (cpm per thousand plays, or a flat fee) only values the delivery report. Direct campaigns fill ad slots before marketplace campaigns. A campaign with goal_plays is paced evenly across its flight and plays first while it is behind pace; one without a goal takes every eligible slot during its flight. An optional category keeps competitors apart: two ads of one category never play in the same ad break on a screen.");
  direct.command("list").description("List this seller project's direct campaigns").action(bind(handleAdsDirectList));
  direct.command("show").description("Inspect one direct campaign, its state and pace").argument("<campaign-id>", "Direct campaign identifier").action(bind(handleAdsDirectShow));
  const directCreate = direct.command("create").description("Create a direct campaign from a JSON document").argument("<file>", "Direct campaign draft JSON file, or - for stdin").action(bind(handleAdsDirectCreate));
  const directUpdate = direct.command("update").description("Replace a direct campaign from a JSON document").argument("<campaign-id>", "Direct campaign identifier").argument("<file>", "Direct campaign draft JSON file, or - for stdin").requiredOption("--expect-rev <REVISION>", "Current campaign revision (required)", revision).action(bind(handleAdsDirectUpdate));
  const directPause = direct.command("pause").description("Pause a direct campaign").argument("<campaign-id>", "Direct campaign identifier").requiredOption("--expect-rev <REVISION>", "Current campaign revision (required)", revision).action(bind(handleAdsDirectPause));
  const directResume = direct.command("resume").description("Resume a paused direct campaign").argument("<campaign-id>", "Direct campaign identifier").requiredOption("--expect-rev <REVISION>", "Current campaign revision (required)", revision).action(bind(handleAdsDirectResume));
  const directEnd = direct.command("end").description("End a direct campaign for good").argument("<campaign-id>", "Direct campaign identifier").requiredOption("--expect-rev <REVISION>", "Current campaign revision (required)", revision).action(bind(handleAdsDirectEnd));
  const directReport = direct.command("report").description("Read a direct campaign's delivery and value, or export its rows as CSV").argument("<campaign-id>", "Direct campaign identifier").option("--from <TIME>", "Inclusive start: RFC 3339, now, or an age such as 7d, 12h, 30m (default: the start of the flight)", playsInstantOption("--from")).option("--to <TIME>", "Exclusive end: RFC 3339, now, or an age (default: the end of the flight)", playsInstantOption("--to")).addOption(new Option("--format <FORMAT>", "json (default), csv, xlsx or pdf").choices(["json", "csv", "xlsx", "pdf"])).addOption(new Option("--output <FILE>", "File to write (with --format csv, xlsx or pdf; default ./direct-report-CAMPAIGN_ID.FORMAT); - writes a CSV to stdout instead of the envelope")).action(bind(handleAdsDirectReport));
  const directAvailability = direct.command("availability").description("Estimate the plays still available for a targeting and flight").argument("<file>", "Availability query JSON file, or - for stdin").action(bind(handleAdsDirectAvailability));
  for (const command of [directCreate, directUpdate]) {
    addCommandNotes(command, 'Writes this project\'s own direct campaign. The draft JSON needs name, advertiser, flight_start and flight_end (RFC 3339) and media_ids (this project\'s ready images or videos); it may add category, goal_plays, price {"model": "cpm" | "flat", "amount": "12.50", "currency": "USD"}, image_duration_ms, screen_ids, slot_ids, venue_types, cities, tags, dayparts [{"days": ["mon"], "start": "11:00", "end": "14:00"}] and overbook. Targeting lists left empty match every screen and slot. category is one of: alcohol, apparel, automotive, beauty, cannabis, consumer_electronics, education, entertainment, financial_services, food_and_beverage, gambling, government, grocery, health_and_pharma, home_and_garden, insurance, jobs, legal, media, political, quick_service_restaurants, real_estate, restaurants, retail, sports_and_fitness, technology, telecom, tobacco_and_vaping, travel, utilities. Booking a goal_plays larger than the availability estimate is refused with problem goal_overbooked (HTTP 409) unless the draft sets "overbook": true; estimate first with ads direct availability.');
  }
  addCommandNotes(directUpdate, "The draft replaces every writable field, so send the whole document, not only the fields that change. The write is checked against --expect-rev.");
  addCommandNotes(directPause, "Writes the campaign's state. A paused campaign takes no ad slots until it is resumed.");
  addCommandNotes(directResume, "Writes the campaign's state. The campaign takes eligible ad slots again within its flight.");
  addCommandNotes(directEnd, "Writes the campaign's state. Ending is final: an ended campaign cannot be resumed, and its report stays readable. Create a new direct campaign to run the ad again.");
  addCommandNotes(directReport, "Reads delivery for one direct campaign: plays, played_ms, plays not played, estimated_impressions, pace, and value, the recorded price applied to the delivery for the seller to bill the advertiser. --format csv writes the rows as day,screen_id,slot_id,media_id,plays,played_ms,estimated_impressions (empty when the screen had no estimate). A report that holds only part of the rows carries the warning direct_report_truncated: narrow --from and --to for the rest.");
  addCommandNotes(directAvailability, "Reads only; nothing is booked. The query JSON takes screen_ids, slot_ids, venue_types, cities, tags, dayparts, flight_start, flight_end and exclude_campaign_id (the campaign being edited, so its own bookings are not counted against it). The answer gives estimated_plays, booked_plays and available_plays for the selected screens.");
  const reviews = ads.command("reviews").description("Decide exact submitted creative versions");
  reviews.command("list").description("List creative versions awaiting this seller's decision").action(bind(handleAdsReviewsList));
  reviews.command("show").description("Inspect one submission's review and its exact creative").argument("<review-id>", "Review identifier").action(bind(handleAdsReviewsShow));
  const reviewApprove = reviews.command("approve").description("Approve one exact creative version").argument("<review-id>", "Review identifier").action(bind(handleAdsReviewsApprove));
  const reviewReject = reviews.command("reject").description("Reject one exact creative version").argument("<review-id>", "Review identifier").requiredOption("--reason <TEXT>", "Reason shown to the buyer").action(bind(handleAdsReviewsReject));
  const reviewRequestChanges = reviews.command("request-changes").description("Ask the buyer for changes to one exact creative version").argument("<review-id>", "Review identifier").requiredOption("--note <TEXT>", "The changes the buyer should make, at most 500 characters (required)", decisionNoteOption).action(bind(handleAdsReviewsRequestChanges));
  for (const command of [reviewApprove, reviewReject, reviewRequestChanges]) {
    addCommandNotes(command, "Approval covers the exact submitted version only. It does not choose the buyer's budget or grant access to its media library; editing the pixels requires a new version and a new decision.");
  }
  addCommandNotes(reviewRequestChanges, "The review becomes changes_requested with the note in reason. The buyer reads it on the creative (ads creatives show), and the campaign's next submission to this network opens a new review that links previous_review_id. Deciding needs Manage, and a person deciding in the dashboard needs to be an approver.");
  const reports = ads.command("reports").description("Read delivery and spend for this project");
  const reportSpend = reports.command("spend").description("Read buyer ad spend for one campaign").requiredOption("--campaign-id <ID>", "Campaign to report").addOption(reportFormatOption()).addOption(reportOutputOption("ad-spend.FORMAT")).action(bind(handleAdsReportsSpend));
  const reportDelivery = reports.command("delivery").description("Read seller delivery and gross/fee/net for a period").requiredOption("--from <TIMESTAMP>", "Inclusive RFC 3339 start of the reporting period").requiredOption("--to <TIMESTAMP>", "Exclusive RFC 3339 end of the reporting period").addOption(reportFormatOption()).addOption(reportOutputOption("ad-delivery.FORMAT")).action(bind(handleAdsReportsDelivery));
  const reportFill = reports.command("fill").description("Read how this seller's ad slots were filled").option("--from <TIME>", "Inclusive start: RFC 3339, now, or an age such as 7d, 12h, 30m (default 7 days before --to)", playsInstantOption("--from")).option("--to <TIME>", "Exclusive end: RFC 3339, now, or an age (default now); at most 35 days after --from", playsInstantOption("--to")).addOption(reportFormatOption()).addOption(reportOutputOption("ad-fill.FORMAT")).action(bind(handleAdsReportsFill));
  addCommandNotes(reportFill, "Fill statistics count this project's ad-slot occurrences over up to 35 days: how many were filled by direct campaigns, marketplace campaigns and the slot's VAST tag, how many stayed unfilled and why (no_demand, ineligible, separated, capped), the fill_rate, and the same by day.");
  addCommandNotes(reportSpend, "A buyer report shows this project's own debit and campaign evidence, never a seller's other income or project-wide usage. Money is reported as decimal mcr strings; estimated_impressions appears when a screen carries an impressions estimate.");
  addCommandNotes(reportDelivery, "A seller report shows gross ad income, the serving-fee debit, and net credits for this project's own delivery, with one row per completed occurrence. Normal project costs consume the shared balance. estimated_impressions appears when a screen carries an impressions estimate.");
}

// dist/handlers/campaign.js
var CAMPAIGNS_PATH = "/api/campaigns";
async function campaignCall(client, request, id, subject = "campaign") {
  try {
    return await client.call(request);
  } catch (error) {
    throw campaignProblem(error, id, subject);
  }
}
function campaignRevisionHeaders(args) {
  const revision2 = flagString(args.flags, "expect-rev");
  const headers = { ...reviewNoteFrom(args), ...revision2 ? { "if-match": quotedRevision(revision2) } : {} };
  return Object.keys(headers).length ? headers : void 0;
}
async function campaignAudienceFlag(args, runtime) {
  const tags = flagString(args.flags, "tag");
  const anyTags = flagString(args.flags, "any-tag");
  const screenIds = flagString(args.flags, "screen-id");
  const folder = flagString(args.flags, "folder");
  const raw = flagString(args.flags, "audience");
  const all = flagBool(args.flags, "all-screens");
  if ([tags, anyTags, screenIds, folder, raw].filter((value) => value !== void 0).length + (all ? 1 : 0) > 1) {
    throw usageError("Provide at most one of --tag, --any-tag, --screen-id, --folder, --all-screens or --audience.");
  }
  if (tags !== void 0)
    return campaignTagAudience(tags.split(","));
  if (anyTags !== void 0)
    return campaignAnyTagAudience(anyTags.split(","));
  if (screenIds !== void 0)
    return campaignScreenAudience(screenIds.split(","));
  if (folder !== void 0)
    return campaignFolderAudience(campaignFolder(folder));
  if (all)
    return campaignAllScreensAudience();
  if (raw === void 0)
    return void 0;
  const source = raw.trim();
  const text = source === "-" || source.startsWith("@") ? await readAuthoringText(source === "-" ? source : source.slice(1), runtime, CAMPAIGN_AUDIENCE_INPUT_MAX_BYTES) : raw;
  return campaignAudienceJson(text);
}
function campaignLevelFlags(args) {
  const monthly = flagString(args.flags, "monthly");
  const dates = flagString(args.flags, "date");
  const except = flagString(args.flags, "except");
  const data = flagString(args.flags, "data");
  const covers = flagString(args.flags, "covers");
  const displays = flagString(args.flags, "displays");
  const start = flagString(args.flags, "start");
  const onTouch = args.flags["on-touch"];
  return {
    ...monthly !== void 0 ? { monthly: campaignMonthlyList(monthly) } : {},
    ...dates !== void 0 ? { dates: campaignDateList(dates) } : {},
    ...except !== void 0 ? { except: except.split(",") } : {},
    ...data !== void 0 ? { data: campaignData(data) } : {},
    ...onTouch !== void 0 && onTouch !== false ? { interaction: { idle_s: typeof onTouch === "string" ? Number(onTouch) : LEVEL_IDLE_DEFAULT_S } } : {},
    ...covers !== void 0 ? { covers } : {},
    ...displays !== void 0 ? { displays: campaignDisplayList(displays) } : {},
    ...start !== void 0 ? { start: start === "on-time" ? "on_time" : "next_item" } : {}
  };
}
function campaignResult(response, client, title) {
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: [title, ...campaignLines(response.body)].join("\n")
  };
}
async function campaignCreateBody(args, runtime, command) {
  const name = campaignName(flagString(args.flags, "name") ?? "");
  const playlistId = campaignPlaylistId(flagString(args.flags, "playlist-id") ?? "");
  const audience = await campaignAudienceFlag(args, runtime);
  if (!audience)
    throw usageError("".concat(command, " takes exactly one of --tag, --any-tag, --screen-id, --folder, --all-screens or --audience."));
  const from = flagString(args.flags, "from");
  const until = flagString(args.flags, "until");
  campaignBounds(from, until);
  const windows = flagString(args.flags, "window");
  const priority = flagString(args.flags, "priority");
  const paused = flagBool(args.flags, "paused");
  return {
    name,
    playlist_id: playlistId,
    audience,
    ...from !== void 0 ? { from } : {},
    ...until !== void 0 ? { until } : {},
    ...windows !== void 0 ? { windows: campaignWindowList(windows) } : {},
    ...campaignLevelFlags(args),
    ...priority !== void 0 ? { priority: Number(priority) } : {},
    ...paused ? { paused: true } : {}
  };
}
var handleCampaignCreate = commandHandler(async (args, runtime, resolved) => {
  const body = await campaignCreateBody(args, runtime, "campaign create");
  const paused = body.paused === true;
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await campaignCall(client, { method: "POST", path: CAMPAIGNS_PATH, idempotent: true, body, headers: campaignRevisionHeaders(args) });
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  const id = response.body?.id ?? "";
  return campaignResult(response, client, paused ? "Created campaign ".concat(id, ", paused. No screen changes until screenrig campaign resume ").concat(id, ".") : "Created campaign ".concat(id, ". Screens in its audience switch to the playlist within a minute while it holds; screenrig campaign screens ").concat(id, " shows each screen's standing."));
});
var handleCampaignList = commandHandler(async (args, runtime, resolved) => {
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await campaignCall(client, { method: "GET", path: CAMPAIGNS_PATH });
  const items = response.body?.items;
  const list = Array.isArray(items) ? items : [];
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: ["Campaigns (".concat(list.length, "), in the order screens read them"), ...campaignTableLines(list)].join("\n")
  };
});
var handleCampaignShow = commandHandler(async (args, runtime, resolved) => {
  const id = campaignId(args.positionals[2], "show");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await campaignCall(client, { method: "GET", path: "".concat(CAMPAIGNS_PATH, "/").concat(id) }, id);
  return campaignResult(response, client, "Campaign");
});
async function campaignPatchBody(args, runtime) {
  const name = flagString(args.flags, "name");
  const playlistId = flagString(args.flags, "playlist-id");
  const from = flagString(args.flags, "from");
  const until = flagString(args.flags, "until");
  const windows = flagString(args.flags, "window");
  const priority = flagString(args.flags, "priority");
  const clears = ["clear-from", "clear-until", "clear-windows", "clear-monthly", "clear-dates", "clear-except", "clear-data", "clear-on-touch", "clear-displays"].filter((flag) => flagBool(args.flags, flag));
  const audience = await campaignAudienceFlag(args, runtime);
  campaignBounds(from, until);
  const patch = {
    ...name !== void 0 ? { name: campaignName(name) } : {},
    ...playlistId !== void 0 ? { playlist_id: campaignPlaylistId(playlistId) } : {},
    ...audience ? { audience } : {},
    ...from !== void 0 ? { from } : {},
    ...clears.includes("clear-from") ? { from: null } : {},
    ...until !== void 0 ? { until } : {},
    ...clears.includes("clear-until") ? { until: null } : {},
    ...windows !== void 0 ? { windows: campaignWindowList(windows) } : {},
    ...clears.includes("clear-windows") ? { windows: null } : {},
    ...campaignLevelFlags(args),
    ...clears.includes("clear-monthly") ? { monthly: null } : {},
    ...clears.includes("clear-dates") ? { dates: null } : {},
    ...clears.includes("clear-except") ? { except: null } : {},
    ...clears.includes("clear-data") ? { data: null } : {},
    ...clears.includes("clear-on-touch") ? { interaction: null } : {},
    ...clears.includes("clear-displays") ? { displays: null } : {},
    ...priority !== void 0 ? { priority: Number(priority) } : {}
  };
  return patch;
}
var handleCampaignUpdate = commandHandler(async (args, runtime, resolved) => {
  const id = campaignId(args.positionals[2], "update");
  const patch = await campaignPatchBody(args, runtime);
  if (!Object.keys(patch).length) {
    throw usageError("campaign update requires at least one of --name, --playlist-id, an audience (--tag, --any-tag, --screen-id, --folder, --all-screens or --audience), --from, --clear-from, --until, --clear-until, --window, --clear-windows, --monthly, --clear-monthly, --date, --clear-dates, --except, --clear-except, --data, --clear-data, --on-touch, --clear-on-touch, --displays, --clear-displays, --start, or --priority.");
  }
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await campaignCall(client, {
    method: "PATCH",
    path: "".concat(CAMPAIGNS_PATH, "/").concat(id),
    idempotent: true,
    body: patch,
    headers: campaignRevisionHeaders(args)
  }, id);
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  return campaignResult(response, client, "Updated campaign ".concat(id, ". Every screen of its old and new audience re-resolves within a minute."));
});
async function campaignPaused(args, runtime, resolved, paused) {
  const id = campaignId(args.positionals[2], paused ? "pause" : "resume");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const body = { paused };
  const response = await campaignCall(client, {
    method: "PATCH",
    path: "".concat(CAMPAIGNS_PATH, "/").concat(id),
    idempotent: true,
    body,
    headers: campaignRevisionHeaders(args)
  }, id);
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  return campaignResult(response, client, paused ? "Paused campaign ".concat(id, ". Screens that showed it return to what they would show without it within a minute; screenrig campaign resume ").concat(id, " starts it again.") : "Resumed campaign ".concat(id, ". Screens in its audience switch to the playlist within a minute while it holds; screenrig campaign screens ").concat(id, " shows each screen's standing."));
}
var handleCampaignPause = commandHandler((args, runtime, resolved) => campaignPaused(args, runtime, resolved, true));
var handleCampaignResume = commandHandler((args, runtime, resolved) => campaignPaused(args, runtime, resolved, false));
var handleCampaignDelete = commandHandler(async (args, runtime, resolved) => {
  const id = campaignId(args.positionals[2], "delete");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await campaignCall(client, {
    method: "DELETE",
    path: "".concat(CAMPAIGNS_PATH, "/").concat(id),
    idempotent: true,
    headers: campaignRevisionHeaders(args)
  }, id);
  const pending = pendingReviewOf(response);
  if (pending)
    return pendingReviewResult(response, pending, client.requestId);
  return {
    envelope: successEnvelope({ id, deleted: true }, { request_id: response.headers["x-request-id"] ?? client.requestId }),
    exitCode: ExitCode.Success,
    human: "Deleted campaign ".concat(id, ". Screens that showed it return to what they would show without it within a minute.")
  };
});
var handleCampaignScreens = commandHandler(async (args, runtime, resolved) => {
  const id = campaignId(args.positionals[2], "screens");
  const limit = flagString(args.flags, "limit");
  const cursor = flagString(args.flags, "cursor");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await campaignCall(client, {
    method: "GET",
    path: "".concat(CAMPAIGNS_PATH, "/").concat(id, "/screens"),
    query: { ...limit !== void 0 ? { limit } : {}, ...cursor !== void 0 ? { cursor } : {} }
  }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: campaignScreensLines(id, response.body, limit).join("\n")
  };
});
var handleCampaignExplain = commandHandler(async (args, runtime, resolved) => {
  const screenId = campaignScreenId(args.positionals[2]);
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const at = flagString(args.flags, "at");
  const to = flagString(args.flags, "to");
  const response = await campaignCall(client, {
    method: "GET",
    path: "/api/screens/".concat(screenId, "/campaigns"),
    ...at !== void 0 || to !== void 0 ? { query: { ...at !== void 0 ? { at } : {}, ...to !== void 0 ? { to } : {} } } : {}
  }, screenId, "screen");
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: campaignExplainLines(screenId, response.body).join("\n")
  };
});
async function campaignGuard(client, args, id) {
  const given = flagString(args.flags, "expect-rev");
  if (given !== void 0)
    return given;
  const response = await campaignCall(client, { method: "GET", path: "".concat(CAMPAIGNS_PATH, "/").concat(id) }, id);
  const current = response.body?.revision;
  if (typeof current !== "number")
    throw unexpectedResponseError("The campaign answer lacks its revision.", client.requestId);
  return String(current);
}
var handleCampaignPublish = commandHandler(async (args, runtime, resolved) => {
  const id = campaignId(args.positionals[2], "publish");
  const folder = flagString(args.flags, "test-folder");
  const screens = flagString(args.flags, "test-screen");
  const test = folder !== void 0 ? campaignFolderAudience(campaignFolder(folder)) : screens !== void 0 ? campaignScreenAudience(screens.split(",")) : void 0;
  const body = { paused: false, ...test ? { audience: test } : {} };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await campaignCall(client, {
    method: "PATCH",
    path: "".concat(CAMPAIGNS_PATH, "/").concat(id),
    idempotent: true,
    body,
    headers: campaignRevisionHeaders(args)
  }, id);
  return campaignResult(response, client, test ? "Published campaign ".concat(id, " to a test audience. Only the screens named here switch to the playlist within a minute; screenrig campaign revisions ").concat(id, " lists the draft to copy to the real audience with screenrig campaign promote ").concat(id, " --revision N.") : "Published campaign ".concat(id, ". Screens in its audience switch to the playlist within a minute while it holds; screenrig campaign screens ").concat(id, " shows each screen's standing."));
});
var handleCampaignPromote = commandHandler(async (args, runtime, resolved) => {
  const id = campaignId(args.positionals[2], "promote");
  const number = revisionNumber(args, "campaign promote");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const expected = await campaignGuard(client, args, id);
  const body = { revision: number };
  let response;
  try {
    response = await campaignCall(client, {
      method: "POST",
      path: "".concat(CAMPAIGNS_PATH, "/").concat(id, "/promote"),
      idempotent: true,
      body,
      headers: { "if-match": quotedRevision(expected) }
    }, id);
  } catch (error) {
    throw campaignPromoteProblem(error, id);
  }
  const unchanged = response.body?.revision === Number(expected);
  return campaignResult(response, client, unchanged ? "Revision ".concat(number, " holds the audience campaign ").concat(id, " already has; nothing changed.") : "Promoted revision ".concat(number, " of campaign ").concat(id, ": its audience is now the campaign's. Every screen of the old and the new audience re-resolves within a minute; screenrig campaign screens ").concat(id, " shows each screen's standing."));
});
var handleCampaignRevisions = commandHandler(async (args, runtime, resolved) => {
  const id = campaignId(args.positionals[2], "revisions");
  const after = flagString(args.flags, "after");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await campaignCall(client, { method: "GET", path: "".concat(CAMPAIGNS_PATH, "/").concat(id, "/revisions"), ...after !== void 0 ? { query: { after } } : {} }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: campaignRevisionLines(id, response.body).join("\n")
  };
});
var handleCampaignRestore = commandHandler(async (args, runtime, resolved) => {
  const id = campaignId(args.positionals[2], "restore");
  const number = revisionNumber(args, "campaign restore");
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const expected = await campaignGuard(client, args, id);
  const response = await campaignCall(client, {
    method: "POST",
    path: "".concat(CAMPAIGNS_PATH, "/").concat(id, "/revisions/").concat(number, "/restore"),
    idempotent: true,
    headers: { "if-match": quotedRevision(expected) }
  }, id);
  const unchanged = response.body?.revision === Number(expected);
  return campaignResult(response, client, unchanged ? "Revision ".concat(number, " holds the content campaign ").concat(id, " already has; nothing changed.") : "Restored revision ".concat(number, " of campaign ").concat(id, " as a new revision. Every screen of the old and the new audience re-resolves within a minute."));
});
var PREVIEW_CLEARS = ["clear-from", "clear-until", "clear-windows", "clear-monthly", "clear-dates", "clear-except", "clear-data", "clear-on-touch", "clear-displays"];
var handleCampaignPreview = commandHandler(async (args, runtime, resolved) => {
  const given = args.positionals[2];
  const id = given === void 0 ? void 0 : campaignId(given, "preview");
  const publish = flagBool(args.flags, "publish");
  let body;
  if (id === void 0) {
    const clear = PREVIEW_CLEARS.find((flag) => flagBool(args.flags, flag));
    if (publish || clear)
      throw usageError("campaign preview without an ID previews a new campaign; --".concat(publish ? "publish" : clear, " changes an existing one. Name the campaign: campaign preview ID."));
    body = await campaignCreateBody(args, runtime, "campaign preview without an ID");
  } else {
    const patch = await campaignPatchBody(args, runtime);
    if (publish)
      patch.paused = false;
    else if (flagBool(args.flags, "paused"))
      patch.paused = true;
    if (!Object.keys(patch).length) {
      throw usageError("campaign preview ID requires at least one change to preview: the flags of campaign update, --publish or --paused.");
    }
    body = patch;
  }
  const from = flagString(args.flags, "calendar-from");
  const to = flagString(args.flags, "calendar-to");
  const request = { ...id !== void 0 ? { id } : {}, body, ...from !== void 0 ? { from } : {}, ...to !== void 0 ? { to } : {} };
  const client = clientFor(runtime, args, resolved.apiUrl, requireToken(resolved.token));
  const response = await campaignCall(client, { method: "POST", path: "".concat(CAMPAIGNS_PATH, "/preview"), body: request }, id);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: schedulePreviewLines(id === void 0 ? "a new campaign" : "the change to campaign ".concat(id), response.body).join("\n")
  };
});

// dist/cli-commands/campaign.js
var nameOption = (value) => {
  campaignName(value);
  return value;
};
function audienceOptions(command, verb) {
  const others = (own) => ["tag", "anyTag", "screenId", "folder", "allScreens", "audience"].filter((name) => name !== own);
  command.addOption(new Option("--tag <TAG>", "".concat(verb, ": screens that carry this tag; repeat or comma-separate to require every listed tag")).argParser(campaignTags).conflicts(others("tag"))).addOption(new Option("--any-tag <TAG>", "".concat(verb, ": screens that carry at least one of these tags (repeatable, or comma-separated)")).argParser(campaignAnyTags).conflicts(others("anyTag"))).addOption(new Option("--screen-id <ID>", "".concat(verb, ": these screens (repeatable, or comma-separated)")).argParser(campaignScreenIds).conflicts(others("screenId"))).addOption(new Option("--folder <ID>", "".concat(verb, ": the screens in this screen folder (sfd_...) and every folder inside it")).argParser(campaignFolder).conflicts(others("folder"))).addOption(new Option("--all-screens", "".concat(verb, ": every screen in the project")).conflicts(others("allScreens"))).addOption(new Option("--audience <RULE>", "".concat(verb, ': a rule as JSON such as {"all":[{"tag":"North"},{"tag":"Cafe"}]}, @FILE to read it from a file, or - for stdin')).argParser(campaignAudienceOption).conflicts(others("audience")));
}
var MONTHLY_HELP = "DAY or NTH-WEEKDAY with an optional @HH:MM-HH:MM, such as 15, 1st-mon, 3rd-wed@18:00-21:00 or last-sun@09:00-14:00 (repeatable, at most 16)";
var DATE_HELP = "YYYY-MM-DD with an optional @HH:MM-HH:MM, such as 2026-12-24 or 2026-12-24@18:00-22:00 (repeatable, at most 100)";
var EXCEPT_HELP = "YYYY-MM-DD dates; an exception removes every occurrence that starts on that date (repeatable, or comma-separated, at most 100)";
var ON_TOUCH_HELP = "Hold only while someone is using the screen, until IDLE_S seconds (5 to 3600, default 60) pass without input; Players that resolve their own stack honor it";
var DATA_HELP = "Hold only while card data KEY exists, optionally at an RFC 6901 PATH or equal to VALUE (JSON scalar or bare string); missing or expired data never matches";
var DISPLAYS_HELP = "Play only on these video wall outputs, 1 to 12, comma-separated (default: every output)";
var COVERS_HELP = "Where it plays: full (the whole page, default), main (the page itself), or header, footer or side, a strip drawn over the page that needs a playlist made for that region (playlist create --format-region)";
var COVERS = ["full", "main", "header", "footer", "side"];
var START_HELP = "on-time switches at the edge, interrupting the current item; next-item waits for it to end (default)";
function changeOptions(command) {
  command.addOption(new Option("--from <TIME>", "Start at this civil time in each screen's timezone, YYYY-MM-DDTHH:MM").argParser(campaignInstant("--from")).conflicts(["clearFrom"])).addOption(new Option("--clear-from", "Remove the start").conflicts(["from"])).addOption(new Option("--until <TIME>", "End before this civil time in each screen's timezone, YYYY-MM-DDTHH:MM, later than from").argParser(campaignInstant("--until")).conflicts(["clearUntil"])).addOption(new Option("--clear-until", "Remove the end").conflicts(["until"])).addOption(new Option("--window <SPEC>", "Replace every window with this one, DAYS or DAYS@HH:MM-HH:MM, such as mon-fri@09:00-17:00 or sat,sun (repeatable, at most 16)").argParser(campaignWindows).conflicts(["clearWindows"])).addOption(new Option("--clear-windows", "Remove every window").conflicts(["window"])).addOption(new Option("--monthly <SPEC>", "Replace every monthly rule with this one, ".concat(MONTHLY_HELP)).argParser(campaignMonthlies).conflicts(["clearMonthly"])).addOption(new Option("--clear-monthly", "Remove every monthly rule").conflicts(["monthly"])).addOption(new Option("--date <SPEC>", "Replace every date with this one, ".concat(DATE_HELP)).argParser(campaignDates).conflicts(["clearDates"])).addOption(new Option("--clear-dates", "Remove every date").conflicts(["date"])).addOption(new Option("--except <DATE>", "Replace every exception date with these, ".concat(EXCEPT_HELP)).argParser(campaignExceptDates).conflicts(["clearExcept"])).addOption(new Option("--clear-except", "Remove every exception date").conflicts(["except"])).addOption(new Option("--data <KEY[:PATH[=VALUE]]>", DATA_HELP).argParser(campaignDataOption).conflicts(["clearData"])).addOption(new Option("--clear-data", "Remove the card-data condition").conflicts(["data"])).addOption(new Option("--on-touch [IDLE_S]", ON_TOUCH_HELP).argParser(campaignOnTouch).conflicts(["clearOnTouch"])).addOption(new Option("--clear-on-touch", "Remove the interaction condition").conflicts(["onTouch"])).addOption(new Option("--covers <WHERE>", COVERS_HELP).choices(COVERS)).addOption(new Option("--displays <N>", DISPLAYS_HELP).argParser(campaignDisplays).conflicts(["clearDisplays"])).addOption(new Option("--clear-displays", "Play on every output again").conflicts(["displays"])).addOption(new Option("--start <WHEN>", START_HELP).choices(["on-time", "next-item"])).option("--priority <N>", "Priority 0 to 100; the higher wins when two campaigns hold on one screen", campaignPriority);
}
var AUDIENCE_FLAGS = ["--tag", "--any-tag", "--screen-id", "--folder", "--all-screens", "--audience"];
function registerCampaignCommands(root, bind) {
  const campaign = root.command("campaign").description("Schedule your screens; ads campaigns buy ad time on other screens");
  addCommandNotes(campaign, "Campaigns:\n  A campaign switches every screen in its audience to one playlist while its\n  from and until dates, weekly windows, monthly rules, dates, exceptions, data and\n  touch conditions hold, and back when they stop; with none of them it holds\n  always. It schedules your own screens: ads campaigns\n  buy ad time on other screens and are a different resource. The audience is a\n  rule over screen tags, ids or screen folders. from, until, windows, monthly rules, dates and exceptions are\n  civil times read in each screen's own timezone. Per screen, a takeover wins, then the first\n  campaign that holds (priority 0 to 100, higher first, then the newest), then\n  the screen's playlist schedule, then its default playlist. Screens switch\n  within a minute. campaign screens shows each screen's standing and campaign\n  explain says why a campaign plays on a screen or not. An organization has at most\n  100 campaigns across its projects. A paused campaign is a draft: it is on no screen until\n  campaign publish; publish it to a test folder or test screens first, then\n  campaign promote puts the draft's audience on it. campaign preview shows a\n  change before it is made; campaign revisions and campaign restore keep and\n  bring back earlier versions.");
  campaign.command("list").description("List this project's campaigns in the order screens read them").action(bind(handleCampaignList));
  campaign.command("show").description("Inspect a campaign").argument("<id>", "Campaign identifier").action(bind(handleCampaignShow));
  const create = campaign.command("create").description("Switch the screens of an audience to a playlist, always or while its dates, weekly, monthly and other rules hold").requiredOption("--name <NAME>", "Name the campaign, 1 to 120 characters (required)", nameOption).requiredOption("--playlist-id <ID>", "Playlist the audience shows while the campaign holds; it must be approved (required)", campaignPlaylistId);
  audienceOptions(create, "Audience");
  create.addOption(new Option("--from <TIME>", "Start at this civil time in each screen's timezone, YYYY-MM-DDTHH:MM (default: no start)").argParser(campaignInstant("--from"))).addOption(new Option("--until <TIME>", "End before this civil time in each screen's timezone, YYYY-MM-DDTHH:MM, later than --from (default: no end)").argParser(campaignInstant("--until"))).addOption(new Option("--window <SPEC>", "Hold only in this weekly window, DAYS or DAYS@HH:MM-HH:MM, such as mon-fri@09:00-17:00 or sat,sun (repeatable, at most 16)").argParser(campaignWindows)).addOption(new Option("--monthly <SPEC>", "Hold only on this monthly occurrence, ".concat(MONTHLY_HELP)).argParser(campaignMonthlies)).addOption(new Option("--date <SPEC>", "Hold only on this date, ".concat(DATE_HELP)).argParser(campaignDates)).addOption(new Option("--except <DATE>", "Skip these dates, ".concat(EXCEPT_HELP)).argParser(campaignExceptDates)).addOption(new Option("--data <KEY[:PATH[=VALUE]]>", DATA_HELP).argParser(campaignDataOption)).addOption(new Option("--on-touch [IDLE_S]", ON_TOUCH_HELP).argParser(campaignOnTouch)).addOption(new Option("--covers <WHERE>", COVERS_HELP).choices(COVERS)).addOption(new Option("--displays <N>", DISPLAYS_HELP).argParser(campaignDisplays)).addOption(new Option("--start <WHEN>", START_HELP).choices(["on-time", "next-item"])).option("--priority <N>", "Priority 0 to 100; the higher wins when two campaigns hold on one screen (default: 0)", campaignPriority).option("--paused", "Create it paused: no screen changes until campaign resume").option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleCampaignCreate));
  requireOptionGroup(create, "exactlyOne", AUDIENCE_FLAGS);
  const update = campaign.command("update").description("Change a campaign; the screens of its old and new audience re-resolve within a minute").argument("<id>", "Campaign identifier").option("--name <NAME>", "Rename the campaign, 1 to 120 characters", nameOption).option("--playlist-id <ID>", "Show this playlist instead; it must be approved", campaignPlaylistId);
  audienceOptions(update, "Replace the audience");
  changeOptions(update);
  update.option("--expect-rev <REVISION>", "Optionally require this campaign revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleCampaignUpdate));
  requireOptionGroup(update, "atLeastOne", ["--name", "--playlist-id", ...AUDIENCE_FLAGS, "--from", "--clear-from", "--until", "--clear-until", "--window", "--clear-windows", "--monthly", "--clear-monthly", "--date", "--clear-dates", "--except", "--clear-except", "--data", "--clear-data", "--on-touch", "--clear-on-touch", "--covers", "--displays", "--clear-displays", "--start", "--priority"]);
  requireOptionGroup(update, "atMostOne", AUDIENCE_FLAGS);
  const preview = campaign.command("preview").description("Show what creating or changing a campaign would do before making it: the screens that gain or lose it and the calendar before and after").argument("[id]", "Campaign to preview a change to; omit to preview a new campaign from the create flags").option("--name <NAME>", "The new name (required for a new campaign), 1 to 120 characters", nameOption).option("--playlist-id <ID>", "The playlist to show (required for a new campaign); it must be approved", campaignPlaylistId);
  audienceOptions(preview, "Audience");
  changeOptions(preview);
  preview.addOption(new Option("--paused", "Preview it as a draft: paused, on no screen").conflicts(["publish"])).addOption(new Option("--publish", "Preview unpausing the campaign (with an audience flag, publishing it to that audience)").conflicts(["paused"])).addOption(new Option("--calendar-from <INSTANT>", "Start the calendars at this instant with a zone, such as 2026-12-01T00:00:00Z (default: now)").argParser(calendarInstantOption("--calendar-from"))).addOption(new Option("--calendar-to <INSTANT>", "End the calendars at this instant with a zone, at most 93 days after the start (default: a week after it)").argParser(calendarInstantOption("--calendar-to"))).action(bind(handleCampaignPreview));
  requireOptionGroup(preview, "atMostOne", AUDIENCE_FLAGS);
  campaign.command("publish").description("Unpause a draft campaign, optionally only to a test folder or a few test screens").argument("<id>", "Campaign identifier").addOption(new Option("--test-folder <ID>", "Publish only to the screens in this screen folder (sfd_...) and every folder inside it, instead of the campaign's audience").argParser(campaignFolder).conflicts(["testScreen"])).addOption(new Option("--test-screen <ID>", "Publish only to these screens (repeatable, or comma-separated), instead of the campaign's audience").argParser(campaignScreenIds).conflicts(["testFolder"])).option("--expect-rev <REVISION>", "Optionally require this campaign revision", revision).action(bind(handleCampaignPublish));
  campaign.command("promote").description("Put a draft's audience on the campaign after its test: the audience of an earlier paused revision becomes the campaign's").argument("<id>", "Campaign identifier").requiredOption("--revision <N>", "The draft's (paused) revision whose audience the campaign takes, as campaign revisions numbers it (required)", positiveInteger("revision")).option("--expect-rev <REVISION>", "Require this current campaign revision (default: the revision read just before the write)", revision).action(bind(handleCampaignPromote));
  campaign.command("revisions").description("List a campaign's revisions, newest first, one page at a time").argument("<id>", "Campaign identifier").option("--after <CURSOR>", "Continue from the data.next_cursor of the previous page").action(bind(handleCampaignRevisions));
  campaign.command("restore").description("Make an earlier revision current again by copying it forward as a new revision").argument("<id>", "Campaign identifier").requiredOption("--revision <N>", "Revision to copy forward, as campaign revisions numbers it (required)", positiveInteger("revision")).option("--expect-rev <REVISION>", "Require this current campaign revision (default: the revision read just before the write)", revision).action(bind(handleCampaignRestore));
  campaign.command("pause").description("Stop a campaign on every screen without deleting it").argument("<id>", "Campaign identifier").option("--expect-rev <REVISION>", "Optionally require this campaign revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleCampaignPause));
  campaign.command("resume").description("Start a paused campaign again").argument("<id>", "Campaign identifier").option("--expect-rev <REVISION>", "Optionally require this campaign revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleCampaignResume));
  campaign.command("delete").description("Delete a campaign; its screens return to what they would show without it").argument("<id>", "Campaign identifier").option("--expect-rev <REVISION>", "Optionally require this campaign revision", revision).option("--note <TEXT>", NOTE_HELP, reviewNoteOption).action(bind(handleCampaignDelete));
  campaign.command("screens").description("Show the screens a campaign reaches and how each stands").argument("<id>", "Campaign identifier").option("--limit <N>", "Screens per page, 1 to 500 (default: 100)", campaignScreensLimit).option("--cursor <CURSOR>", "Continue after the data.next_cursor of the previous page", campaignScreensCursor).action(bind(handleCampaignScreens));
  campaign.command("explain").description("Show why each campaign plays on one screen or not, now or at a chosen time").argument("<screen-id>", "Screen identifier").addOption(new Option("--at <TIME>", "Explain this time instead of now: an instant with a zone (2026-03-08T09:30:00Z) or a time on the screen's clock (2026-03-08T09:30)").argParser(campaignExplainTime("--at"))).addOption(new Option("--to <TIME>", "Also list the playlist switches from --at (default: now) to this time, in the same forms").argParser(campaignExplainTime("--to"))).action(bind(handleCampaignExplain));
}

// dist/bundles/ads.js
function register(root, bind) {
  registerAdsCommands(root, bind);
  registerCampaignCommands(root, bind);
}
export {
  register
};
