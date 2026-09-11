import { usageError } from "../problems.js";
const notes = new WeakMap();
/** Attach native help text and retain the same note for structured discovery. */
export function addCommandNotes(command, note) {
    command.addHelpText("after", `\n${note}`);
    notes.set(command, [...(notes.get(command) ?? []), note]);
}
export function commandNotes(command) {
    return [...(notes.get(command) ?? [])];
}
const relationships = new WeakMap();
const examples = new WeakMap();
/** One definition drives both preflight validation and discovery. */
export function requireOptionGroup(command, kind, names) {
    const options = names.map((name) => {
        const option = command.options.find((candidate) => candidate.long === name);
        if (!option)
            throw new Error(`Unknown option ${name}`);
        return option;
    });
    relationships.set(command, [...(relationships.get(command) ?? []), { kind, options: names }]);
    const message = kind === "exactlyOne"
        ? `Provide exactly one of ${names.join(" or ")}.`
        : kind === "atLeastOne" ? `Provide at least one of ${names.join(" or ")}.`
            : kind === "requires" ? `${names[0]} requires ${names.slice(1).join(" and ")}.`
                : `Provide ${names.join(" and ")} together.`;
    addCommandNotes(command, message);
    command.hook("preAction", () => {
        const count = options.filter((option) => command.getOptionValueSource(option.attributeName()) === "cli").length;
        const supplied = (index) => command.getOptionValueSource(options[index].attributeName()) === "cli";
        const invalid = kind === "exactlyOne" ? count !== 1
            : kind === "atLeastOne" ? count === 0
                : kind === "requires" ? supplied(0) && options.slice(1).some((_, index) => !supplied(index + 1))
                    : count !== 0 && count !== options.length;
        if (invalid)
            throw usageError(message);
    });
}
export function commandRelationships(command) {
    return relationships.get(command) ?? [];
}
export function addCommandExamples(command, ...commands) {
    examples.set(command, [...(examples.get(command) ?? []), ...commands]);
    command.addHelpText("after", `\nExamples:\n${commands.map((example) => `  ${example}`).join("\n")}`);
}
export function commandExamples(command) {
    return examples.get(command) ?? [];
}
//# sourceMappingURL=notes.js.map