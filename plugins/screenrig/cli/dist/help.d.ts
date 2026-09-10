import type { Command } from "commander";
export { CREDIT_HELP } from "./help-text.js";
export interface HelpDocument {
    path: string[];
    aliases: string[][];
    kind: "group" | "command";
    usage: string;
    synopsis: string[];
    commands: Array<{
        name: string;
        path: string[];
        kind: "group" | "command";
        summary: string;
        help: string;
    }>;
    options: Array<{
        name: string;
        type: "boolean" | "value";
        description: string;
        required: boolean;
    }>;
    globalOptions: Array<{
        name: string;
        type: "boolean" | "value";
        description: string;
        required: boolean;
    }>;
    notes: string[];
}
/** Canonical and alias paths of every descendant leaf, in tree order. */
export declare function leafCommandPaths(command: Command): string[];
/** JSON discovery and human help both read the actual Commander command tree. */
export declare function describeHelp(command: Command): HelpDocument;
export declare function commandHelp(path?: readonly string[]): HelpDocument;
export declare const ROOT_HELP: string;
//# sourceMappingURL=help.d.ts.map