import type { Command, CommanderError } from "commander";
/** Commander diagnostics can contain raw option names/values. Never expose them. */
export declare function commandError(error: CommanderError, command: Command): never;
//# sourceMappingURL=cli-errors.d.ts.map