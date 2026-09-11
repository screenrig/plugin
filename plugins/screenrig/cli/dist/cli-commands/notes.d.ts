import type { Command } from "commander";
/** Attach native help text and retain the same note for structured discovery. */
export declare function addCommandNotes(command: Command, note: string): void;
export declare function commandNotes(command: Command): string[];
export interface OptionRelationship {
    kind: "exactlyOne" | "together" | "atLeastOne" | "requires";
    options: string[];
}
/** One definition drives both preflight validation and discovery. */
export declare function requireOptionGroup(command: Command, kind: OptionRelationship["kind"], names: string[]): void;
export declare function commandRelationships(command: Command): OptionRelationship[];
export declare function addCommandExamples(command: Command, ...commands: string[]): void;
export declare function commandExamples(command: Command): string[];
//# sourceMappingURL=notes.d.ts.map