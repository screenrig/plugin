import type { Command } from "commander";
/** Canonical command names, excluding the executable and any supplied values. */
export declare function commandPath(command: Command): string[];
export declare function findCommand(root: Command, path: readonly string[]): Command | undefined;
/** Read explicit CLI options only; Commander defaults must not become write flags. */
export declare function invocationFlags(command: Command): Record<string, string | boolean>;
//# sourceMappingURL=command-path.d.ts.map