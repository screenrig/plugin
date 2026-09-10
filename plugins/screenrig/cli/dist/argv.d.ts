import type { ParsedArgs } from "./command-input.js";
import { type HelpDocument } from "./help.js";
export { flagString, flagBool, flagNumber, type ParsedArgs } from "./command-input.js";
/** Inspect the same native command tree without executing an application handler. */
export declare function parseArgv(argv: string[]): ParsedArgs & {
    help?: HelpDocument;
};
//# sourceMappingURL=argv.d.ts.map