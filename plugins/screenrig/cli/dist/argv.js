import { normalizeRevisionArgs } from "./command-input.js";
import { CommanderError } from "commander";
import { commandInput, createCommandTree } from "./command-tree.js";
import { describeHelp } from "./help.js";
export { flagString, flagBool, flagNumber } from "./command-input.js";
/** Inspect the same native command tree without executing an application handler. */
export function parseArgv(argv) {
    argv = normalizeRevisionArgs(argv);
    const tree = createCommandTree(argv);
    try {
        tree.root.parse(argv, { from: "user" });
    }
    catch (error) {
        if (!(error instanceof CommanderError) || !(tree.helpRequested() || tree.versionRequested()))
            throw error;
    }
    const args = commandInput(tree.selected());
    if (tree.versionRequested())
        args.flags.version = true;
    if (tree.helpRequested()) {
        const help = describeHelp(tree.selected());
        return { command: help.path.slice(0, 2), positionals: help.path, flags: { ...args.flags, help: true }, help };
    }
    return args;
}
//# sourceMappingURL=argv.js.map