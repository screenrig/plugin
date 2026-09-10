/** Explicit command input passed from Commander to the application handlers. */
export interface ParsedArgs {
    command: string[];
    flags: Record<string, string | boolean>;
    positionals: string[];
}
export declare function flagString(flags: Record<string, string | boolean>, name: string): string | undefined;
export declare function flagBool(flags: Record<string, string | boolean>, name: string): boolean;
export declare function flagNumber(flags: Record<string, string | boolean>, name: string): number | undefined;
/** Normalize the legacy spelling before Commander validation; never inspect operands. */
export declare function normalizeRevisionArgs(argv: string[]): string[];
//# sourceMappingURL=command-input.d.ts.map