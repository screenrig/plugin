import { Command } from "commander";
import type { ParsedArgs } from "./command-input.js";
import type { CommandHandler } from "./commands.js";
export { commandPath, findCommand, invocationFlags } from "./command-path.js";
export interface CommandTree {
    root: Command;
    selected: () => Command;
    helpRequested: () => boolean;
    versionRequested: () => boolean;
    inventoryRequested: () => boolean;
}
export declare function commandInput(command: Command): ParsedArgs;
/** Fresh native commands per invocation; actions return their asynchronous work. */
export declare function createCommandTree(argv?: readonly string[], execute?: (handler: CommandHandler, args: ParsedArgs) => Promise<void>): CommandTree;
//# sourceMappingURL=command-tree.d.ts.map