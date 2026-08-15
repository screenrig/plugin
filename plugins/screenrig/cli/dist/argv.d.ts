export interface ParsedArgs {
    command: string[];
    flags: Record<string, string | boolean>;
    positionals: string[];
}
export declare function parseArgv(argv: string[]): ParsedArgs;
export declare function flagString(flags: Record<string, string | boolean>, name: string): string | undefined;
export declare function flagBool(flags: Record<string, string | boolean>, name: string): boolean;
export declare function flagNumber(flags: Record<string, string | boolean>, name: string): number | undefined;
//# sourceMappingURL=argv.d.ts.map