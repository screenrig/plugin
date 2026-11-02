import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/screen-health.js
var HEALTH_HOT_C = 80;
var HEALTH_CRASHING_24H = 3;
function duration(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  if (days > 0)
    return `${days}d ${hours}h`;
  if (hours > 0)
    return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
var number = (value) => typeof value === "number" && Number.isFinite(value);
function healthIssues(health) {
  if (!health || typeof health !== "object")
    return [];
  const issues = [];
  if (health.stale === true)
    issues.push("stale");
  if (health.display?.connected === false)
    issues.push("display disconnected");
  if (number(health.temperature_c) && health.temperature_c >= HEALTH_HOT_C)
    issues.push(`hot ${Math.round(health.temperature_c)}\xB0C`);
  if (number(health.crashes_24h) && health.crashes_24h >= HEALTH_CRASHING_24H)
    issues.push(`crashing ${health.crashes_24h}/24h`);
  return issues;
}
function screenHealthIssues(screen) {
  return healthIssues(screen?.health);
}
function healthLines(health) {
  if (!health || typeof health !== "object" || typeof health.reported_at !== "string")
    return [];
  const lines = [health.stale ? "Health (stale: no report for over 35 minutes)" : "Health"];
  const add = (key, value) => {
    if (value)
      lines.push(`${key}: ${value}`);
  };
  add("reported_at", health.reported_at);
  const uptime = [
    number(health.uptime_s) ? `device ${duration(health.uptime_s)}` : void 0,
    number(health.app_uptime_s) ? `player ${duration(health.app_uptime_s)}` : void 0
  ].filter(Boolean).join(", ");
  add("uptime", uptime);
  const memory = health.memory;
  if (number(memory?.used_bytes) && number(memory?.total_bytes) && memory.total_bytes > 0) {
    add("memory", `${Math.round(memory.used_bytes / memory.total_bytes * 100)}% of ${(memory.total_bytes / 1024 ** 3).toFixed(1)} GiB`);
  }
  const cpu = health.cpu;
  add("cpu", [
    number(cpu?.load_1m) ? `load ${cpu.load_1m.toFixed(2)}` : void 0,
    number(cpu?.cores) ? `${cpu.cores} cores` : void 0,
    number(cpu?.utilization_percent) ? `${Math.round(cpu.utilization_percent)}% busy` : void 0,
    number(cpu?.app_percent) ? `player ${Math.round(cpu.app_percent)}%` : void 0
  ].filter(Boolean).join(", "));
  if (number(health.temperature_c))
    add("temperature", `${health.temperature_c.toFixed(1)} \xB0C${health.temperature_c >= HEALTH_HOT_C ? " (hot)" : ""}`);
  const display = health.display;
  if (display) {
    add("display", [
      display.connected === true ? "connected" : display.connected === false ? "disconnected" : void 0,
      display.power ? `power ${display.power}` : void 0
    ].filter(Boolean).join(", "));
  }
  const network = health.network;
  if (network) {
    add("network", [network.kind, number(network.wifi_rssi_dbm) ? `${network.wifi_rssi_dbm} dBm` : void 0].filter(Boolean).join(", "));
  }
  const crashes = [
    number(health.crashes_24h) ? `${health.crashes_24h} crashes` : void 0,
    number(health.renderer_restarts_24h) ? `${health.renderer_restarts_24h} renderer restarts` : void 0
  ].filter(Boolean).join(", ");
  add("last 24h", crashes);
  const issues = healthIssues(health).filter((issue) => issue !== "stale");
  add("attention", issues.join(", "));
  return lines;
}
var CHANGE_NAME = /^[a-z][a-z0-9_]{0,63}$/;
var SAFE_VALUE = /^[A-Za-z0-9_.:+-]{1,64}$/;
function healthChangesText(changes) {
  if (!Array.isArray(changes) || changes.length === 0)
    return void 0;
  const parts = [];
  for (const item of changes) {
    if (!item || typeof item !== "object")
      continue;
    const record = item;
    if (typeof record.change !== "string" || !CHANGE_NAME.test(record.change))
      continue;
    const fields = Object.keys(record).filter((key) => key !== "change" && CHANGE_NAME.test(key)).sort().filter((key) => number(record[key]) || typeof record[key] === "string" && SAFE_VALUE.test(record[key])).map((key) => `${key}=${String(record[key])}`);
    parts.push([record.change, ...fields].join(" "));
  }
  return parts.length ? parts.join(",") : void 0;
}

export {
  screenHealthIssues,
  healthLines,
  healthChangesText
};
