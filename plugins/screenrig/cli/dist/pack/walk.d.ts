import type { ArchiveEntry } from "./types.js";
import type { ArchiveLimits } from "./types.js";
export declare function loadScreenrigIgnore(root: string): Promise<(posixPath: string, isDir: boolean) => boolean>;
export declare function walkDirectory(root: string, limits: ArchiveLimits): Promise<ArchiveEntry[]>;
//# sourceMappingURL=walk.d.ts.map