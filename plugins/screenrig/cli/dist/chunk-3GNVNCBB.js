import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  __export
} from "./chunk-CIJQ2GE5.js";

// dist/host-settings.js
var host_settings_exports = {};
__export(host_settings_exports, {
  processSettings: () => processSettings
});
function processSettings() {
  const settings = {
    XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME,
    APPDATA: process.env.APPDATA,
    PROGRAMFILES: process.env.PROGRAMFILES,
    TMPDIR: process.env.TMPDIR,
    DISPLAY: process.env.DISPLAY,
    WAYLAND_DISPLAY: process.env.WAYLAND_DISPLAY,
    SCREENRIG_CONFIG: process.env.SCREENRIG_CONFIG,
    SCREENRIG_API_URL: process.env.SCREENRIG_API_URL,
    SCREENRIG_BROWSER: process.env.SCREENRIG_BROWSER,
    SCREENRIG_FFMPEG: process.env.SCREENRIG_FFMPEG,
    SCREENRIG_FFPROBE: process.env.SCREENRIG_FFPROBE,
    SCREENRIG_CWEBP: process.env.SCREENRIG_CWEBP,
    SCREENRIG_VERSION: process.env.SCREENRIG_VERSION,
    SCREENRIG_INSTALL_SOURCE: process.env.SCREENRIG_INSTALL_SOURCE,
    SCREENRIG_SDK_RUNTIME: process.env.SCREENRIG_SDK_RUNTIME
  };
  for (const name of Object.keys(settings))
    if (settings[name] === void 0)
      delete settings[name];
  return settings;
}

// dist/version.js
var version_exports = {};
__export(version_exports, {
  AGENT_PLUGIN_SETUP: () => AGENT_PLUGIN_SETUP,
  CLI_VERSION: () => CLI_VERSION,
  PLACEHOLDER_VERSION: () => PLACEHOLDER_VERSION,
  cliDistribution: () => cliDistribution,
  isDevVersion: () => isDevVersion,
  isProductVersion: () => isProductVersion,
  isReleaseVersion: () => isReleaseVersion,
  resolveCliVersion: () => resolveCliVersion,
  untaggedDevVersion: () => untaggedDevVersion,
  versionFromTag: () => versionFromTag
});
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
var PLACEHOLDER_VERSION = "0.1.0";
var RELEASE_VERSION = /^(\d{2})\.(0[1-9]|1[0-2])\.([1-9]\d*)$/;
var DEV_VERSION = /^(\d{2})\.(0[1-9]|1[0-2])\.0-dev$/;
var RELEASE_TAG = /^v(\d{2})\.(0[1-9]|1[0-2])\.([1-9]\d*)$/;
function isReleaseVersion(value) {
  return RELEASE_VERSION.test(value);
}
function isDevVersion(value) {
  return DEV_VERSION.test(value);
}
function isProductVersion(value) {
  return isReleaseVersion(value) || isDevVersion(value);
}
function untaggedDevVersion(now = /* @__PURE__ */ new Date()) {
  const year = String(now.getUTCFullYear()).slice(-2);
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}.${month}.0-dev`;
}
function versionFromTag(tag) {
  const match = RELEASE_TAG.exec(tag);
  return match ? tag.slice(1) : void 0;
}
function readPackageVersion() {
  try {
    const packagePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "package.json");
    const parsed = JSON.parse(readFileSync(packagePath, "utf8"));
    if (parsed && typeof parsed === "object" && "version" in parsed && typeof parsed.version === "string") {
      return parsed.version;
    }
  } catch {
    return void 0;
  }
  return void 0;
}
function resolveCliVersion(input = {}) {
  const stamped = (input.settings ?? processSettings()).SCREENRIG_VERSION;
  if (typeof stamped === "string" && isProductVersion(stamped)) {
    return stamped;
  }
  const pkg = input.packageVersion ?? readPackageVersion();
  if (typeof pkg === "string" && pkg !== PLACEHOLDER_VERSION && isProductVersion(pkg)) {
    return pkg;
  }
  return untaggedDevVersion(input.now);
}
var CLI_VERSION = resolveCliVersion();
var AGENT_PLUGIN_SETUP = "Agent workflows use the official screenRIG plugin from https://github.com/screenrig/plugin. Check this runtime's plugin list and install screenrig@screenrig when absent, preserving saved screenRIG credentials. Then run the installed plugin's bootstrap helper before enrollment, pairing or publishing.";
function cliDistribution(moduleUrl = import.meta.url, version = CLI_VERSION) {
  const root = path.resolve(path.dirname(fileURLToPath(moduleUrl)), "..", "..");
  const helper = path.join(root, "skills", "screenrig", "scripts", "screenrig-plugin-freshness");
  if (existsSync(helper) && isProductVersion(version)) {
    return {
      kind: "plugin_bundle",
      plugin_version: version,
      bootstrap: `${helper} --bootstrap --json`,
      agent_setup: "Run the bundled bootstrap helper to verify registration, installation and the saved connection. Its reported launcher is the executable for subsequent commands."
    };
  }
  return { kind: "standalone", agent_setup: AGENT_PLUGIN_SETUP };
}

// dist/user-agent.js
var user_agent_exports = {};
__export(user_agent_exports, {
  USER_AGENT: () => USER_AGENT
});
import { arch, platform } from "node:os";
var USER_AGENT = `screenrig-cli/${CLI_VERSION} (${platform()}; ${arch()})`;

export {
  processSettings,
  host_settings_exports,
  CLI_VERSION,
  cliDistribution,
  version_exports,
  USER_AGENT,
  user_agent_exports
};
