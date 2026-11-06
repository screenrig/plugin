import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  CliError,
  ExitCode,
  makeProblem,
  usageError
} from "./chunk-JP4OQPAN.js";

// dist/project-capabilities.js
function validateProjectCapabilities(value) {
  const body = value;
  const features = body?.features;
  const planFeatures = body?.plan_features;
  if (!body || typeof body.project_id !== "string" || body.project_id.length === 0 || typeof body.plan_id !== "string" || body.plan_id.length === 0 || !features || typeof features.advertiser !== "boolean" || typeof features.screens !== "boolean" || !Number.isSafeInteger(body.feature_revision) || (body.feature_revision ?? -1) < 0 || !Array.isArray(body.capabilities) || body.capabilities.some((item) => typeof item !== "string") || !planFeatures || !Array.isArray(planFeatures.features) || !Array.isArray(planFeatures.featuresets) || !body.limits || typeof body.limits !== "object") {
    throw usageError("Capabilities response does not match the generated project capabilities contract.");
  }
  return body;
}
var LIMIT_KEYS = ["screens", "members", "video_bytes", "event_retention_days"];
function planFeatureFields(capabilities) {
  const { features, featuresets } = capabilities.plan_features;
  const limits = capabilities.limits;
  const stated = LIMIT_KEYS.flatMap((key) => {
    const value = limits[key];
    return typeof value === "number" ? ["".concat(key, "=").concat(value === 0 ? "none" : value)] : [];
  });
  const on = [];
  const off = [];
  for (const feature of features) {
    if (feature.enabled)
      on.push(feature.id);
    else
      off.push("".concat(feature.id, " (").concat(feature.required_plan, ")"));
  }
  return [
    ["featuresets", featuresets.join(", ") || "(none)"],
    ["plan_features_on", on.join(", ") || "(none)"],
    ["plan_features_off", off.join(", ") || "(none)"],
    ["limits", stated.join(" ") || void 0]
  ];
}
async function requireCapability(client, capability, action, next) {
  let capabilities;
  try {
    const response = await client.call({ method: "GET", path: "/api/project/capabilities" });
    capabilities = validateProjectCapabilities(response.body);
  } catch (error) {
    const detail = error instanceof CliError ? error.problem.detail : error instanceof Error ? error.message : "the request failed";
    throw new CliError(makeProblem("capability_unavailable", "Project capability discovery unavailable", 503, "".concat(action, " requires the ").concat(capability, " capability, and this project's capability set could not be read (").concat(detail, "). The write is refused rather than attempted without a capability check."), { next }), ExitCode.Server);
  }
  if (!capabilities.capabilities.includes(capability)) {
    const advertiserOnly = capabilities.features.advertiser && !capabilities.features.screens;
    throw new CliError(makeProblem("capability_required", "Project capability required", 403, "".concat(action, " requires the ").concat(capability, " capability, and this project does not have it. An advertising project (advertiser=true, screens=false) cannot pair devices or author and publish playlists; change the project's purpose in the dashboard if signage is intended."), { next }), ExitCode.Auth, advertiserOnly ? [{ code: "capability_scope", message: "This project is advertising only: creative and campaign work is permitted, but screen pairing, playlists, and publication are not." }] : []);
  }
}

export {
  validateProjectCapabilities,
  planFeatureFields,
  requireCapability
};
