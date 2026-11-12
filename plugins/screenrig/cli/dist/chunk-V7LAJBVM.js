import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/sse.js
function projectEventOf(frame) {
  if (!frame.data)
    return void 0;
  let value;
  try {
    value = JSON.parse(frame.data);
  } catch {
    return void 0;
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    return void 0;
  const type = value.type;
  if (typeof type !== "string" || !/^[a-z][a-z0-9_]*(?:\.[a-z0-9_]+)+$/.test(type))
    return void 0;
  if (frame.event !== void 0 && frame.event !== "message" && frame.event !== type)
    return void 0;
  return value;
}
function parseSse(buffer) {
  const events = [];
  let item = {};
  let lineStart = 0;
  let frameStart = 0;
  for (const ending of buffer.matchAll(/\r\n|\r|\n/g)) {
    const line = buffer.slice(lineStart, ending.index);
    lineStart = ending.index + ending[0].length;
    if (line === "") {
      if (Object.keys(item).length > 0)
        events.push(item);
      item = {};
      frameStart = lineStart;
      continue;
    }
    if (line.startsWith(":"))
      continue;
    const colon = line.indexOf(":");
    const field = colon < 0 ? line : line.slice(0, colon);
    let value = colon < 0 ? "" : line.slice(colon + 1);
    if (value.startsWith(" "))
      value = value.slice(1);
    if (field === "id" && !value.includes("\0")) {
      item.id = value;
    } else if (field === "event") {
      item.event = value;
    } else if (field === "retry") {
      if (/^\d+$/.test(value))
        item.retry = Number(value);
    } else if (field === "data") {
      item.data = item.data === void 0 ? value : "".concat(item.data, "\n").concat(value);
    }
  }
  return { events, rest: buffer.slice(frameStart) };
}

export {
  projectEventOf,
  parseSse
};
