import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  positiveInteger
} from "./chunk-OG4KFC53.js";
import {
  clientFor,
  commandHandler,
  jsonBody
} from "./chunk-6XNEMMGF.js";
import "./chunk-UD3J3FNQ.js";
import "./chunk-Q5WKSHIH.js";
import {
  clearResultContext,
  shellQuote
} from "./chunk-B2ICBIZJ.js";
import {
  flagString
} from "./chunk-4DSCAOZX.js";
import "./chunk-C6ZDNJWW.js";
import "./chunk-BFLHHH47.js";
import "./chunk-P3D5NU6C.js";
import "./chunk-SFYZH3GR.js";
import {
  ExitCode,
  unexpectedResponseError
} from "./chunk-VYWS3KLY.js";
import "./chunk-3FYAGULW.js";

// dist/handlers/docs.js
function hitLines(hit) {
  const snippet = hit.snippet.replace(/\s+/g, " ").trim();
  return [hit.section ? "".concat(hit.title, " \u2014 ").concat(hit.section) : hit.title, hit.url, ...snippet ? [snippet] : []];
}
var handleDocsSearch = commandHandler(async (args, runtime, resolved) => {
  clearResultContext(runtime);
  const query = args.positionals.slice(2).join(" ");
  const client = clientFor(runtime, args, resolved.apiUrl);
  const response = await client.call({ method: "GET", path: "/api/docs/search", query: { q: query, limit: flagString(args.flags, "limit") } });
  const body = response.body;
  if (!Array.isArray(body?.results))
    throw unexpectedResponseError("GET /api/docs/search answered without a list of matching sections.", client.requestId);
  return {
    envelope: jsonBody(response, client.requestId),
    exitCode: ExitCode.Success,
    human: body.results.length ? body.results.map((hit) => hitLines(hit).join("\n")).join("\n\n") : "No documentation matches ".concat(JSON.stringify(query), ".")
  };
}, false);
var handleDocsShow = commandHandler(async (args, runtime, resolved) => {
  clearResultContext(runtime);
  const client = clientFor(runtime, args, resolved.apiUrl);
  const response = await client.call({ method: "GET", path: "/api/docs/page", query: { url: args.positionals[2], section: flagString(args.flags, "section") } });
  const page = response.body;
  if (typeof page?.markdown !== "string" || !Array.isArray(page.sections))
    throw unexpectedResponseError("GET /api/docs/page answered without a documentation page.", client.requestId);
  const lines = [page.markdown.trimEnd()];
  if (page.truncated)
    lines.push("", "Truncated. Read a section with: ".concat(shellQuote(["screenrig", "docs", "show", page.url, "--section", "NAME"])));
  if (page.sections.length)
    lines.push("", "Sections to read next:", ...page.sections.map((name) => "- ".concat(name)));
  return { envelope: jsonBody(response, client.requestId), exitCode: ExitCode.Success, human: lines.join("\n") };
}, false);

// dist/cli-commands/docs.js
function registerDocsCommands(root, bind) {
  const docs = root.command("docs").description("Search and read the official documentation before guessing");
  docs.command("search").description("Search the official documentation").argument("<query...>", "Words, a command or flag, or an error code").option("--limit <N>", "Hits to return, 1-25 (default 8)", positiveInteger("limit")).action(bind(handleDocsSearch));
  docs.command("show").description("Read an official documentation page or one section of it").argument("<url>", "Page address as docs search prints it, or only its path").option("--section <NAME>", "Read one section: a heading or anchor from the sections list").action(bind(handleDocsShow));
}

// dist/bundles/docs.js
function register(root, bind) {
  registerDocsCommands(root, bind);
}
export {
  register
};
