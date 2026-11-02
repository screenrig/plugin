import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/command-path.js
function flagName(option) {
  return option.long.slice(2);
}
function commandPath(command) {
  return command.parent ? [...commandPath(command.parent), command.name()] : [];
}
function findCommand(root, path) {
  let command = root;
  for (const word of path) {
    const child = command.commands.find((candidate) => candidate.name() === word);
    if (!child)
      return void 0;
    command = child;
  }
  return command;
}
function commandFromArgv(root, argv) {
  const end = argv.indexOf("--");
  const tokens = end < 0 ? argv : argv.slice(0, end);
  let command = root;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.startsWith("-")) {
      if (token.includes("="))
        continue;
      let takesValue = false;
      for (let current = command; current; current = current.parent) {
        const option = current.options.find((candidate) => candidate.long === token || candidate.short === token);
        if (option) {
          takesValue = option.required || option.optional;
          break;
        }
      }
      if (takesValue)
        index += 1;
      continue;
    }
    const child = command.commands.find((candidate) => candidate.name() === token);
    if (!child)
      break;
    command = child;
  }
  return command;
}
function invocationFlags(command) {
  const flags = /* @__PURE__ */ Object.create(null);
  for (let current = command; current; current = current.parent) {
    for (const option of current.options) {
      if (current.getOptionValueSource(option.attributeName()) !== "cli")
        continue;
      const value = current.getOptionValue(option.attributeName());
      if (option.negate && value !== false)
        continue;
      if (!option.negate && option.isBoolean() && value === false)
        continue;
      flags[flagName(option)] = option.negate ? true : current.getOptionValue(option.attributeName());
    }
  }
  return flags;
}

export {
  flagName,
  commandPath,
  findCommand,
  commandFromArgv,
  invocationFlags
};
