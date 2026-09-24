import type { ArchiveEntry } from "./types.js";
/**
 * Hoists inline styles and executable inline scripts from every HTML entry into
 * deterministic files under `_screenrig/inline`, rewriting the tags so the
 * application renders under the release Content-Security-Policy. Inline event
 * handlers and `javascript:` URLs are refused with the file and line.
 */
export declare function hoistInlineAssets(entries: ArchiveEntry[]): ArchiveEntry[];
//# sourceMappingURL=inline.d.ts.map