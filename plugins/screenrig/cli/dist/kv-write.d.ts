import type { KVWrite } from "./adapters/protocol.js";
import type { ParsedArgs } from "./argv.js";
export declare const KV_VALUE_BASE64_MAX_LENGTH = 1398104;
export declare function canonicalJson(input: string): string;
export declare function canonicalBase64(input: string): string;
export declare function kvWriteFromArgs(args: ParsedArgs, cwd: string): Promise<KVWrite>;
//# sourceMappingURL=kv-write.d.ts.map