import type { CliRuntime } from "./runtime.js";
import type { CommentsWrite } from "./adapters/protocol.js";
import type { ParsedArgs } from "./argv.js";
export declare const COMMENTS_MAX_BYTES = 1024;
export declare function commentsObjectFromJson(input: string, source: "--json-value" | "comments file"): Record<string, unknown>;
export declare function commentsWriteFromArgs(args: ParsedArgs, cwd: string, runtime?: CliRuntime): Promise<CommentsWrite>;
//# sourceMappingURL=comments-write.d.ts.map