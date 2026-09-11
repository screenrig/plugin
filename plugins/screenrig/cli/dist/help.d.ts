import type { Command } from "commander";
import { type OptionRelationship } from "./cli-commands/notes.js";
export { CREDIT_HELP } from "./help-text.js";
export interface HelpOption {
    name: string;
    type: "boolean" | "value";
    description: string;
    required: boolean;
    valueRequired: boolean;
    variadic: boolean;
    choices?: string[];
    default?: unknown;
    conflicts: string[];
}
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
    arguments: Array<{
        name: string;
        description: string;
        required: boolean;
        variadic: boolean;
        choices?: string[];
        default?: unknown;
    }>;
    options: HelpOption[];
    globalOptions: HelpOption[];
    relationships: OptionRelationship[];
    examples: string[];
    allCommands?: string[];
    notes: string[];
}
/** Canonical and alias paths of every descendant leaf, in tree order. */
export declare function leafCommandPaths(command: Command): string[];
/** JSON discovery and human help both read the actual Commander command tree. */
export declare function describeHelp(command: Command, all?: boolean): HelpDocument;
export declare function commandHelp(path?: readonly string[], all?: boolean): HelpDocument;
//# sourceMappingURL=help.d.ts.map