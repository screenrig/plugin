import { commandPath, createCommandTree, findCommand } from "./command-tree.js";
import { commandNotes } from "./cli-commands/notes.js";
import { usageError } from "./problems.js";
export { CREDIT_HELP } from "./help-text.js";
/** Canonical and alias paths of every descendant leaf, in tree order. */
export function leafCommandPaths(command) {
    const paths = [];
    const visit = (node) => {
        if (node.commands.length) {
            node.commands.forEach(visit);
            return;
        }
        const path = commandPath(node);
        if (!path.length)
            return;
        paths.push(path.join(" "));
        for (const alias of node.aliases())
            paths.push([...path.slice(0, -1), alias].join(" "));
    };
    command.commands.forEach(visit);
    return paths;
}
function commandInventory(command) {
    const paths = leafCommandPaths(command);
    if (!paths.length)
        return undefined;
    return ["All commands:", ...paths.map((path) => `  ${path}`)].join("\n");
}
/** JSON discovery and human help both read the actual Commander command tree. */
export function describeHelp(command) {
    const helper = command.createHelp();
    const path = commandPath(command);
    const notes = commandNotes(command);
    const inventory = commandInventory(command);
    const describeOption = (option) => ({
        name: option.long, type: (option.negate || option.isBoolean()) ? "boolean" : "value", description: option.description, required: option.mandatory,
    });
    return {
        path,
        aliases: command.aliases().map((alias) => [...path.slice(0, -1), alias]),
        kind: command.commands.length ? "group" : "command",
        usage: [command.helpInformation().trimEnd(), inventory, ...notes].filter((part) => part !== undefined).join("\n\n"),
        synopsis: [helper.commandUsage(command)],
        commands: helper.visibleCommands(command).map((child) => ({
            name: child.name(), path: commandPath(child), kind: child.commands.length ? "group" : "command",
            summary: child.description(), help: `screenrig ${commandPath(child).join(" ")} --help`,
        })),
        options: helper.visibleOptions(command).map(describeOption),
        globalOptions: helper.visibleGlobalOptions(command).map(describeOption),
        notes,
    };
}
export function commandHelp(path = []) {
    const command = findCommand(createCommandTree().root, path);
    if (!command)
        throw usageError("Unknown help topic.");
    return describeHelp(command);
}
//# sourceMappingURL=help.js.map