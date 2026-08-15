import { DEFAULT_ARCHIVE_LIMITS } from "../adapters/protocol.js";
import { CliError } from "../problems.js";
export { DEFAULT_ARCHIVE_LIMITS };
export declare function packError(code: string, detail: string): CliError;
export declare function mergeLimits(overrides?: Partial<typeof DEFAULT_ARCHIVE_LIMITS>): typeof DEFAULT_ARCHIVE_LIMITS;
//# sourceMappingURL=limits.d.ts.map