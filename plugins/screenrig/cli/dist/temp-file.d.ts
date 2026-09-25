import { type FileHandle } from "node:fs/promises";
/**
 * A private temp file beside `target`: same directory (so the final rename is
 * atomic), a random suffix, created exclusively (`wx`, 0600) so it never
 * follows or reuses an existing path. Until `release` runs, SIGINT and SIGTERM
 * remove it before the signal's default action.
 */
export interface TempFile {
    path: string;
    handle: FileHandle;
    release: () => void;
}
export declare function tempPathFor(target: string): string;
export declare function removeOnSignal(file: string): () => void;
export declare function openTempFile(target: string): Promise<TempFile>;
/** POSIX sh single-quoting for a copy-paste command line. */
export declare function shellQuote(argv: readonly string[]): string;
//# sourceMappingURL=temp-file.d.ts.map