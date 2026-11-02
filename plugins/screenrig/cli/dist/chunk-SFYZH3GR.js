import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  __export
} from "./chunk-3FYAGULW.js";

// dist/generated/resource-ids.js
var resource_ids_exports = {};
__export(resource_ids_exports, {
  RESOURCE_ID_PATTERNS: () => RESOURCE_ID_PATTERNS,
  isResourceID: () => isResourceID
});
var environment = "(?:(?:stage|qa|development)_)?";
var RESOURCE_ID_PATTERNS = {
  project: new RegExp("^".concat(environment, "prj_[A-Za-z0-9_-]+$")),
  agent: new RegExp("^".concat(environment, "agt_[A-Za-z0-9_-]+$")),
  connection: new RegExp("^".concat(environment, "acn_[A-Za-z0-9_-]+$")),
  screen: new RegExp("^".concat(environment, "scr_[A-Za-z0-9_-]+$")),
  playlist: new RegExp("^".concat(environment, "pl_[A-Za-z0-9_-]+$")),
  release: new RegExp("^".concat(environment, "rel_[A-Za-z0-9_-]+$")),
  media: /^med_[A-Za-z0-9_-]+$/
};
function isResourceID(value, kind) {
  return typeof value === "string" && RESOURCE_ID_PATTERNS[kind].test(value);
}

export {
  RESOURCE_ID_PATTERNS,
  isResourceID,
  resource_ids_exports
};
