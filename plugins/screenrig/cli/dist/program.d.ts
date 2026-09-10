import { type CommandResult } from "./commands.js";
import type { CliRuntime } from "./runtime.js";
/** Run one native Commander action and return its result to the output boundary. */
export declare function executeCommand(argv: string[], runtime: CliRuntime): Promise<CommandResult>;
//# sourceMappingURL=program.d.ts.map