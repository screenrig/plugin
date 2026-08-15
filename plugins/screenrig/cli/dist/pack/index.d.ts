import type { PackOptions, PackResult } from "./types.js";
export declare function packDirectory(root: string, options?: PackOptions): Promise<PackResult>;
export { writeTar, gzipDeterministic, sha256Hex, parseTar } from "./archive.js";
export { walkDirectory } from "./walk.js";
export { DEFAULT_ARCHIVE_LIMITS, mergeLimits } from "./limits.js";
//# sourceMappingURL=index.d.ts.map