#!/usr/bin/env node
import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  commandFromArgv,
  commandPath,
  findCommand,
  flagName,
  invocationFlags
} from "./chunk-DLIFEV74.js";
import {
  FEED_REPEATABLE_FLAGS
} from "./chunk-HE3SHBEC.js";
import {
  Command,
  CommanderError,
  Option,
  nonnegativeInteger
} from "./chunk-2EAVZFIF.js";
import "./chunk-52RPSLX3.js";
import "./chunk-LMVLFNSU.js";
import "./chunk-G4R5Q7OS.js";
import "./chunk-XAYSKU3G.js";
import {
  commandExamples,
  commandNotes,
  commandRelationships
} from "./chunk-PWMFRUTA.js";
import {
  applyCreditsLowToSuccess,
  handleVersion,
  observedCreditsRemaining
} from "./chunk-VK2RJKZX.js";
import {
  clearResultContext,
  formatResultContext,
  processRuntime,
  resultContext
} from "./chunk-M3NEXUHJ.js";
import {
  LOG_SINK_DEGRADED_CODE,
  logSinkDegradedWarning
} from "./chunk-MUJZV2YM.js";
import {
  errorEnvelope,
  successEnvelope
} from "./chunk-NWPDH6L4.js";
import {
  CLI_VERSION
} from "./chunk-V3QE7ELU.js";
import "./chunk-7XLCMGU7.js";
import "./chunk-SFYZH3GR.js";
import {
  CliError,
  ExitCode,
  makeProblem,
  redactText,
  renderProblem,
  usageError,
  withDefaultHint
} from "./chunk-5E3Z6J6F.js";
import "./chunk-3FYAGULW.js";

// dist/cli-errors.js
function commandError(error, command) {
  const path = commandPath(command).join(" ");
  const has = (flag) => command.args.some((arg) => arg === "--".concat(flag) || arg.startsWith("--".concat(flag, "=")));
  if (path.startsWith("comment ")) {
    if (command.commands.length)
      throw usageError("comment commands require screen <id> or playlist <id>.");
    if (has("expect-rev"))
      throw usageError("comment commands do not take --expect-rev; last write wins and does not bump revision.");
    if (has("page") && command.name() === "screen")
      throw usageError("comment screen commands do not take --page; use comment playlist <id> --page PAGE_ID.");
    if (has("value-base64"))
      throw usageError("comment set requires --json-value or --file.");
    if (error.code === "commander.conflictingOption")
      throw usageError("comment set requires exactly one of --json-value or --file.");
  }
  switch (error.code) {
    case "commander.invalidArgument": {
      const option = command.options.find((candidate) => candidate.argChoices && error.message.startsWith("error: option '".concat(candidate.flags, "'")));
      if (option?.argChoices) {
        const choices = option.argChoices;
        const allowed = choices.length > 2 ? "".concat(choices.slice(0, -1).join(", "), ", or ").concat(choices.at(-1)) : choices.join(" or ");
        throw usageError("".concat(option.long, " must be ").concat(allowed, "."));
      }
      throw usageError("Invalid argument. See command help for supported values.");
    }
    case "commander.missingArgument":
      if (path === "screen set-timezone")
        throw usageError("screen set-timezone requires <id> --timezone.");
      throw usageError("".concat(path, " requires ").concat(command.registeredArguments.filter((arg) => arg.required).map((arg) => "<".concat(arg.name(), ">")).join(" "), "."));
    case "commander.excessArguments": {
      const word = command.commands.length && !command.registeredArguments.length && /^[a-z][a-z0-9-]{0,39}$/.test(command.args[0] ?? "") ? command.args[0] : void 0;
      if (word)
        throw usageError("".concat(path || "screenrig", " has no command ").concat(word, ". See command help for supported commands."), { command: "screenrig".concat(path ? " ".concat(path) : "", " --help"), reason: "List supported commands, arguments, and options." });
      throw usageError("".concat(path || "screenrig", " does not accept ").concat(command.registeredArguments.length ? "extra" : "positional", " arguments."));
    }
    case "commander.conflictingOption": {
      const named = [...error.message.matchAll(/option '([^']+)'/g)].map((match) => command.options.find((option) => option.flags === match[1])?.long).filter((name) => Boolean(name));
      if (named.length === 2)
        throw usageError("".concat(named[0], " cannot be used with ").concat(named[1], ". See command help."));
      throw usageError("Conflicting options. See command help.");
    }
    case "commander.missingMandatoryOptionValue": {
      if (path === "screen set-timezone")
        throw usageError("screen set-timezone requires <id> --timezone.");
      const required = command.options.filter((option) => option.mandatory && command.getOptionValue(option.attributeName()) === void 0);
      const positional = command.registeredArguments.filter((arg, index) => arg.required && index >= command.args.length).map((arg) => "<".concat(arg.name(), ">"));
      const fleetTarget = command.registeredArguments.some((arg) => arg.variadic && !arg.required && arg.name() === "id") && command.options.some((option) => option.long === "--tag") && !command.args.length && command.getOptionValue("tag") === void 0 && command.getOptionValue("folder") === void 0;
      if (fleetTarget)
        throw usageError("".concat(path, " requires <id>, --tag TAG or --folder ID, and ").concat(required.map((option) => option.long).join(" "), "."));
      throw usageError("".concat(path, " requires ").concat([...positional, ...required.map((option) => option.long)].join(" "), "."));
    }
    case "commander.optionMissingArgument": {
      const option = command.options.find((candidate) => error.message.includes("option '".concat(candidate.flags, "'")));
      throw usageError(option ? "".concat(option.long, " requires a value.") : "An option requires a value. See command help for its arguments.");
    }
    case "commander.unknownOption": {
      const option = safeName(error.message, /unknown option '([^']*)'/, /^--?[A-Za-z][A-Za-z0-9-]{0,39}$/, "=");
      if (option)
        throw usageError("".concat(path || "screenrig", " does not accept ").concat(option, ". See command help for supported options."), { command: "screenrig".concat(path ? " ".concat(path) : "", " --help"), reason: "List supported commands, arguments, and options." });
      break;
    }
    case "commander.unknownCommand": {
      const name = safeName(error.message, /unknown command '([^']*)'/, /^[a-z][a-z0-9-]{0,39}$/);
      if (name)
        throw usageError("".concat(path || "screenrig", " has no command ").concat(name, ". See command help for supported commands."), { command: "screenrig".concat(path ? " ".concat(path) : "", " --help"), reason: "List supported commands, arguments, and options." });
      break;
    }
  }
  throw usageError("Unknown command or unsupported option. See command help for supported arguments.", { command: "screenrig".concat(path ? " ".concat(path) : "", " --help"), reason: "List supported commands, arguments, and options." });
}
function safeName(message, quoted, shape, cut) {
  const raw = quoted.exec(message)?.[1];
  const name = raw !== void 0 && cut ? raw.split(cut)[0] : raw;
  return name !== void 0 && shape.test(name) ? name : void 0;
}

// dist/cli-commands/globals.js
function registerGlobalOptions(root) {
  root.addOption(new Option("--json", "Return JSON (default; also enables structured help)").conflicts("human")).addOption(new Option("--human", "Return human-readable output").conflicts("json")).option("--api-url <URL>", "Override the API origin").option("--config <PATH>", "Use this credential/configuration file").option("--project-id <ID>", "Select a project for creates, local names and lists without changing the saved selection").option("--request-id <ID>", "Send ID (req_ + 16-64 of A-Z a-z 0-9 _ -) on the first request only").option("--idempotency-key <KEY>", "Reuse a key when retrying the same write").option("--timeout <MS>", "Set the command timeout in milliseconds", nonnegativeInteger("timeout"));
}

// dist/cli-commands/index.js
var COMMAND_BUNDLES = {
  account: () => import("./account-TMYDMFTK.js"),
  ads: () => import("./ads-BKF6PAAW.js"),
  media: () => import("./media-FNEAI5OF.js"),
  playlists: () => import("./playlists-SOXJO27X.js"),
  screens: () => import("./screens-TC3A5SLQ.js"),
  monitoring: () => import("./monitoring-NXUD2YPK.js"),
  integrations: () => import("./integrations-TSTNGYQE.js"),
  migrate: () => import("./migrate-63AGTG5H.js")
};
var TOP_LEVEL_COMMANDS = {
  project: "account",
  organization: "account",
  invitations: "account",
  ads: "ads",
  billing: "account",
  login: "account",
  logout: "account",
  agent: "account",
  "service-client": "account",
  dashboard: "account",
  app: "media",
  media: "media",
  playlist: "playlists",
  screen: "screens",
  campaign: "ads",
  reviews: "playlists",
  browser: "media",
  "fleet-links": "screens",
  triggers: "monitoring",
  kv: "media",
  cards: "playlists",
  card: "playlists",
  feeds: "playlists",
  source: "media",
  connection: "integrations",
  comment: "playlists",
  operations: "monitoring",
  events: "monitoring",
  notes: "account",
  playback: "monitoring",
  webhooks: "integrations",
  notifications: "integrations",
  alerts: "monitoring",
  reports: "integrations",
  bi: "integrations",
  audit: "integrations",
  feedback: "account",
  support: "account",
  doctor: "account",
  version: "account",
  status: "account",
  recovery: "account",
  migrate: "migrate",
  schedule: "playlists"
};
function valueOptions() {
  const probe = new Command();
  registerGlobalOptions(probe);
  return new Set(probe.options.filter((option) => option.required || option.optional).map((option) => option.long));
}
function commandBundlesFor(argv) {
  const end = argv.indexOf("--");
  const tokens = end < 0 ? argv : argv.slice(0, end);
  const takesValue = valueOptions();
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (takesValue.has(token)) {
      index += 1;
      continue;
    }
    if (token.startsWith("-"))
      continue;
    const bundle = TOP_LEVEL_COMMANDS[token];
    return bundle ? [bundle] : Object.keys(COMMAND_BUNDLES);
  }
  return Object.keys(COMMAND_BUNDLES);
}
async function loadCommandRegistrars(argv) {
  return Promise.all(commandBundlesFor(argv).map(async (bundle) => (await COMMAND_BUNDLES[bundle]()).register));
}
function registerCommands(root, bind, registrars) {
  registerGlobalOptions(root);
  for (const register of registrars)
    register(root, bind);
  const order = Object.keys(TOP_LEVEL_COMMANDS);
  root.commands.sort((left, right) => order.indexOf(left.name()) - order.indexOf(right.name()));
}

// dist/command-tree.js
function commandInput(command) {
  const positionals = [...commandPath(command), ...command.args];
  return { command: positionals.slice(0, 2), positionals, flags: invocationFlags(command) };
}
function protectOption(command, option, argv, seen) {
  const name = option.long.slice(2);
  if (option.required || option.optional) {
    const parser = option.parseArg;
    option.argParser((value, previous) => {
      const csvOutput = name === "output" && (command.parent?.name() === "playback" || command.name() === "report" && command.parent?.name() === "direct");
      const dash = value === "-" && (/\bstdin\b/.test(option.description) || csvOutput);
      if (!value.length && name !== "value-base64" || value.startsWith("-") && !dash && !/^-\d/.test(value) && !argv.includes("--".concat(name, "=").concat(value))) {
        throw usageError("--".concat(name, " requires a value. Use --").concat(name, "=VALUE for a value starting with a dash."));
      }
      return parser ? parser(value, previous) : value;
    });
  }
  command.on("option:".concat(option.name()), () => {
    const repeatable = name === "capability" && command.name() === "create" && command.parent?.name() === "service-client" || name === "tag" && ["fleet-links", "notifications"].includes(command.parent?.name() ?? "") && ["create", "update"].includes(command.name()) || ["any-tag", "all-tags", "severity", "active-hours"].includes(name) && command.parent?.name() === "notifications" && ["create", "update"].includes(command.name()) || name === "window" && command.parent?.name() === "reboot-schedule" && command.name() === "set" || name === "field" && command.parent?.name() === "fleet-links" && ["create", "update"].includes(command.name()) || ["set", "clear"].includes(name) && command.parent?.name() === "playlist" && ["create", "fields"].includes(command.name()) || ["var", "page"].includes(name) && command.parent?.name() === "view" && ["create", "update"].includes(command.name()) || name === "screen-id" && command.parent?.name() === "triggers" && ["create", "update"].includes(command.name()) || ["set", "secret", "unset-secret"].includes(name) && command.parent?.name() === "source" && ["create", "update", "test"].includes(command.name()) || ["screen-id", "tag"].includes(name) && command.parent?.name() === "alerts" && command.name() === "mute" || name === "filter" && command.parent?.name() === "subscriptions" && ["create", "update"].includes(command.name()) || command.parent?.name() === "screen" && (command.name() === "update" && (name === "field" || name === "unset-field") || command.name() === "list" && name === "field") || ["tag", "any-tag", "screen-id", "window", "monthly", "date", "except"].includes(name) && command.parent?.name() === "campaign" && ["create", "update", "preview"].includes(command.name()) || command.parent?.name() === "feeds" && command.name() === "get" && FEED_REPEATABLE_FLAGS.includes(name);
    if (seen.has(flagName(option)) && !repeatable)
      throw usageError("--".concat(name, " may be supplied only once."));
    seen.add(flagName(option));
  });
}
function createCommandTree(argv, execute, registrars) {
  const end = argv.indexOf("--");
  const tokens = end < 0 ? argv : argv.slice(0, end);
  if (tokens.includes("--json") && tokens.includes("--human")) {
    throw usageError("--json and --human are mutually exclusive.");
  }
  for (const spellings of [["--help", "-h"], ["--version", "-V"]]) {
    if (tokens.filter((arg) => spellings.includes(arg)).length > 1)
      throw usageError("".concat(spellings[0], " may be supplied only once."));
  }
  const root = new Command("screenrig").description("Signage and kiosk infrastructure for agents").version(CLI_VERSION, "-V, --version", "Show CLI and protocol versions");
  let selected = root;
  let helpRequested = false;
  let versionRequested = false;
  let inventoryRequested = false;
  const seen = /* @__PURE__ */ new Set();
  registerCommands(root, (handler) => (...values) => {
    selected = values[values.length - 1];
    return execute?.(handler, commandInput(selected));
  }, registrars);
  root.command("help [command...]").description("Discover commands; --all lists every command").option("--all", "Include all descendant command paths").action((path, options) => {
    inventoryRequested = options.all === true;
    const target = findCommand(root, path);
    if (!target)
      throw usageError("Unknown help topic.");
    target.help();
  });
  const configure = (command) => {
    command.allowExcessArguments(false).addHelpCommand(false).showSuggestionAfterError(false).configureOutput({ writeOut() {
    }, writeErr() {
    }, outputError() {
    } }).configureHelp({ helpWidth: 100, showGlobalOptions: true }).exitOverride((error) => {
      selected = command;
      if (error.code === "commander.helpDisplayed" || error.code === "commander.help")
        helpRequested = true;
      else if (error.code === "commander.version")
        versionRequested = true;
      else
        commandError(error, command);
      throw error;
    });
    for (const option of command.options) {
      if (option.long !== "--version")
        protectOption(command, option, tokens, seen);
    }
    if (command.commands.length)
      command.action(() => command.help());
    command.commands.forEach(configure);
  };
  configure(root);
  return { root, selected: () => selected, helpRequested: () => helpRequested, versionRequested: () => versionRequested, inventoryRequested: () => inventoryRequested };
}

// dist/help.js
function leafCommandPaths(command) {
  const paths = [];
  const children = (node) => node.createHelp().visibleCommands(node);
  const visit = (node) => {
    if (children(node).length) {
      children(node).forEach(visit);
      return;
    }
    const path = commandPath(node);
    if (!path.length)
      return;
    paths.push(path.join(" "));
  };
  children(command).forEach(visit);
  return paths;
}
function commandInventory(command) {
  const paths = leafCommandPaths(command);
  if (!paths.length)
    return void 0;
  return ["All commands:", ...paths.map((path) => "  ".concat(path))].join("\n");
}
function describeHelp(command, all = false) {
  const helper = command.createHelp();
  const path = commandPath(command);
  const notes = commandNotes(command);
  const inventory = all ? commandInventory(command) : void 0;
  const examples = commandExamples(command);
  const visibleOptions = [...helper.visibleOptions(command), ...helper.visibleGlobalOptions(command)];
  const describeOption = (option) => ({
    name: option.long,
    type: option.negate || option.isBoolean() ? "boolean" : "value",
    description: option.description,
    required: option.mandatory,
    valueRequired: option.required,
    variadic: option.variadic,
    ...option.argChoices ? { choices: option.argChoices } : {},
    ...option.defaultValue !== void 0 ? { default: option.defaultValue } : {},
    // Commander exposes these native conflict names at runtime but omits them from its typings.
    conflicts: (option.conflictsWith ?? []).flatMap((name) => visibleOptions.filter((candidate) => candidate.attributeName() === name).map((candidate) => candidate.long))
  });
  return {
    path,
    kind: command.commands.length ? "group" : "command",
    usage: [command.helpInformation().trimEnd(), inventory, ...notes, ...examples.length ? ["Examples:\n".concat(examples.map((example) => "  ".concat(example)).join("\n"))] : []].filter((part) => part !== void 0).join("\n\n"),
    synopsis: [helper.commandUsage(command)],
    commands: helper.visibleCommands(command).map((child) => ({
      name: child.name(),
      path: commandPath(child),
      kind: child.commands.length ? "group" : "command",
      summary: child.description(),
      help: "screenrig ".concat(commandPath(child).join(" "), " --help")
    })),
    arguments: command.registeredArguments.map((argument) => ({
      name: argument.name(),
      description: argument.description,
      required: argument.required,
      variadic: argument.variadic,
      ...argument.argChoices ? { choices: argument.argChoices } : {},
      ...argument.defaultValue !== void 0 ? { default: argument.defaultValue } : {}
    })),
    relationships: commandRelationships(command),
    examples: commandExamples(command),
    ...all ? { allCommands: leafCommandPaths(command) } : {},
    options: helper.visibleOptions(command).map(describeOption),
    globalOptions: helper.visibleGlobalOptions(command).map(describeOption),
    notes
  };
}

// dist/program.js
function withUsageHelp(error, command) {
  if (!(error instanceof CliError) || error.problem.code !== "usage_error")
    return error;
  if (error.problem.hint && error.problem.next)
    return error;
  const path = commandPath(command);
  const help = ["screenrig", ...path, "--help"].join(" ");
  return new CliError({
    ...error.problem,
    hint: error.problem.hint ?? "Fix the argument or input named in detail and run the command again. ".concat(help, " lists the accepted arguments and values, with an example."),
    next: error.problem.next ?? { command: help, argv: [...path, "--help"], reason: "Lists this command's arguments, accepted values, and a working example." }
  }, error.exitCode, error.warnings);
}
async function executeCommand(argv, runtime) {
  let result;
  const tree = createCommandTree(argv, async (handler, args) => {
    result = await handler(args, runtime);
  }, await loadCommandRegistrars(argv));
  try {
    await tree.root.parseAsync(argv, { from: "user" });
  } catch (error) {
    if (!(error instanceof CommanderError) || !(tree.helpRequested() || tree.versionRequested())) {
      throw withUsageHelp(error, tree.selected() !== tree.root ? tree.selected() : commandFromArgv(tree.root, argv));
    }
  }
  if (tree.helpRequested()) {
    const { registerGuidance } = await import("./register-guidance-MV4CM7GZ.js");
    registerGuidance(tree.root);
    const help = describeHelp(tree.selected(), tree.inventoryRequested());
    return { envelope: successEnvelope(help), exitCode: ExitCode.Success, human: help.usage, output: "help" };
  }
  if (tree.versionRequested())
    return handleVersion({ command: ["version"], positionals: ["version"], flags: {} }, runtime);
  if (!result)
    throw new Error("Command completed without a result.");
  return result;
}

// dist/main.js
function appendLogSinkWarning(warnings, dropped) {
  const warning = logSinkDegradedWarning(dropped);
  if (!warning || warnings.some((item) => item.code === LOG_SINK_DEGRADED_CODE)) {
    return warnings;
  }
  return [...warnings, warning];
}
function applyLogSinkToSuccess(result, dropped) {
  const warnings = appendLogSinkWarning(result.envelope.warnings, dropped);
  if (warnings === result.envelope.warnings) {
    return result;
  }
  const warning = warnings[warnings.length - 1];
  const line = warning ? "warning: ".concat(warning.message) : "";
  const human = !result.human || !line || result.human.includes(line) ? result.human : "".concat(result.human, "\n").concat(line);
  return { ...result, envelope: { ...result.envelope, warnings }, human };
}
function confirmedWrite(stream, text) {
  return new Promise((resolve, reject) => {
    const onError = (error) => reject(error);
    stream.once("error", onError);
    try {
      stream.write(text, (error) => {
        stream.removeListener("error", onError);
        if (error)
          reject(error);
        else
          resolve();
      });
    } catch (error) {
      stream.removeListener("error", onError);
      reject(error);
    }
  });
}
async function run(runtime = processRuntime()) {
  clearResultContext(runtime);
  const end = runtime.argv.indexOf("--");
  const options = end < 0 ? runtime.argv : runtime.argv.slice(0, end);
  const explicitJson = options.includes("--json");
  const json = explicitJson || !options.includes("--human");
  try {
    const dispatched = applyCreditsLowToSuccess(await executeCommand(runtime.argv, runtime), observedCreditsRemaining(runtime));
    runtime.logger?.endRun();
    const result = applyLogSinkToSuccess(dispatched, runtime.logger?.droppedLines() ?? 0);
    if (result.output === "stream") {
      return result.exitCode;
    }
    const text = json && (result.output !== "help" || explicitJson) ? "".concat(JSON.stringify(result.envelope), "\n") : result.human ? "".concat(result.human, "\n") : "";
    if (result.afterOutput) {
      try {
        await confirmedWrite(runtime.stdout, text);
      } catch {
        try {
          runtime.stderr.write("error: the answer could not be written to stdout. The saved write key is kept; rerun the identical command within 24 hours to receive the same answer again.\n");
        } catch {
        }
        return ExitCode.Unexpected;
      }
      try {
        await result.afterOutput();
      } catch {
      }
      return result.exitCode;
    }
    if (text)
      runtime.stdout.write(text);
    return result.exitCode;
  } catch (err) {
    runtime.logger?.endRun(err);
    const problem = withDefaultHint(err instanceof CliError ? err.problem : makeProblem("unexpected_error", "Unexpected error", 500, redactText(err instanceof Error ? err.message : "unknown error")));
    const exitCode = err instanceof CliError ? err.exitCode : ExitCode.Unexpected;
    const warnings = appendLogSinkWarning(err instanceof CliError ? err.warnings : [], runtime.logger?.droppedLines() ?? 0);
    if (json) {
      runtime.stdout.write("".concat(JSON.stringify({ ...errorEnvelope(problem, { warnings }), ...resultContext(runtime) ? { context: resultContext(runtime) } : {} }), "\n"));
    } else {
      if (formatResultContext(runtime))
        runtime.stderr.write("".concat(formatResultContext(runtime), "\n"));
      runtime.stderr.write("".concat(renderProblem(problem), "\n"));
      for (const warning of warnings) {
        runtime.stderr.write("warning: ".concat(warning.message, "\n"));
      }
    }
    return exitCode;
  } finally {
    clearResultContext(runtime);
    const logger = runtime.logger;
    if (logger) {
      try {
        await logger.close();
      } catch {
      }
    }
  }
}

// dist/node-runtime.js
var NODE_RUNTIME_REQUIREMENT = "Node.js 22.23.4+, 24.22.1+, or 26.12.1+ (excluding 23.x and 25.x)";
function nodeRuntimeSupported(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version))
    return false;
  const [major = 0, minor = 0, patch = 0] = version.split(".").map(Number);
  const minimum = { 22: [23, 4], 24: [22, 1], 26: [12, 1] }[major];
  return major > 26 || !!minimum && (minor > minimum[0] || minor === minimum[0] && patch >= minimum[1]);
}

// dist/bin.js
if (!nodeRuntimeSupported(process.versions.node)) {
  process.stderr.write("ScreenRig requires ".concat(NODE_RUNTIME_REQUIREMENT, "; upgrade the active node runtime, then retry.\n"));
  process.exitCode = 69;
} else {
  process.exitCode = await run();
}
