import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/dev/origins.js
import { createHash } from "node:crypto";
import path from "node:path";
var DEV_PORT = 18890;
var PLAYER_HOST = "play.screenrig.localhost";
var APP_HOST_SUFFIX = ".apps.screenrig.localhost";
var APP_HOST = /^r-[a-f0-9]{40}\.apps\.screenrig\.localhost$/;
function playerOrigin(port) {
  return "http://".concat(PLAYER_HOST, ":").concat(port);
}
function releaseHostFor(directory) {
  return "r-".concat(createHash("sha1").update(path.resolve(directory)).digest("hex")).concat(APP_HOST_SUFFIX);
}
function appOrigin(host, port) {
  return "http://".concat(host, ":").concat(port);
}
function isReleaseHost(host) {
  return APP_HOST.test(host);
}
function parseHostHeader(value) {
  if (!value)
    return void 0;
  const match = /^([a-z0-9.-]+)(?::(\d{1,5}))?$/i.exec(value.trim());
  if (!match)
    return void 0;
  return { hostname: match[1].toLowerCase(), port: match[2] ?? "" };
}

export {
  DEV_PORT,
  PLAYER_HOST,
  APP_HOST_SUFFIX,
  playerOrigin,
  releaseHostFor,
  appOrigin,
  isReleaseHost,
  parseHostHeader
};
