import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/apex-origin.js
var APEX_HOSTS = /* @__PURE__ */ new Map([
  ["api.screenrig.ai", "screenrig.ai"],
  ["api.stage.screenrig.ai", "stage.screenrig.ai"],
  ["api.screenrig.localhost", "screenrig.localhost"]
]);
function apexHost(apiHostname) {
  return APEX_HOSTS.get(apiHostname);
}

export {
  apexHost
};
