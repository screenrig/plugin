import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  usageError
} from "./chunk-CO45JNNU.js";

// dist/cli-commands/notes.js
var notes = /* @__PURE__ */ new WeakMap();
function addCommandNotes(command, note) {
  command.addHelpText("after", "\n".concat(note));
  notes.set(command, [...notes.get(command) ?? [], note]);
}
function commandNotes(command) {
  return [...notes.get(command) ?? []];
}
var relationships = /* @__PURE__ */ new WeakMap();
var examples = /* @__PURE__ */ new WeakMap();
function requireOptionGroup(command, kind, names) {
  const options = names.map((name) => {
    const option = command.options.find((candidate) => candidate.long === name);
    if (!option)
      throw new Error("Unknown option ".concat(name));
    return option;
  });
  relationships.set(command, [...relationships.get(command) ?? [], { kind, options: names }]);
  const message = kind === "exactlyOne" ? "Provide exactly one of ".concat(names.join(" or "), ".") : kind === "atLeastOne" ? "Provide at least one of ".concat(names.join(" or "), ".") : kind === "atMostOne" ? "Provide at most one of ".concat(names.join(" or "), ".") : kind === "requires" ? "".concat(names[0], " requires ").concat(names.slice(1).join(" and "), ".") : "Provide ".concat(names.join(" and "), " together.");
  addCommandNotes(command, message);
  command.hook("preAction", () => {
    const count = options.filter((option) => command.getOptionValueSource(option.attributeName()) === "cli").length;
    const supplied = (index) => command.getOptionValueSource(options[index].attributeName()) === "cli";
    const invalid = kind === "exactlyOne" ? count !== 1 : kind === "atLeastOne" ? count === 0 : kind === "atMostOne" ? count > 1 : kind === "requires" ? supplied(0) && options.slice(1).some((_, index) => !supplied(index + 1)) : count !== 0 && count !== options.length;
    if (invalid)
      throw usageError(message);
  });
}
function commandRelationships(command) {
  return relationships.get(command) ?? [];
}
function addCommandExamples(command, ...commands) {
  examples.set(command, [...examples.get(command) ?? [], ...commands]);
  command.addHelpText("after", "\nExamples:\n".concat(commands.map((example) => "  ".concat(example)).join("\n")));
}
function commandExamples(command) {
  return examples.get(command) ?? [];
}

export {
  addCommandNotes,
  commandNotes,
  requireOptionGroup,
  commandRelationships,
  addCommandExamples,
  commandExamples
};
