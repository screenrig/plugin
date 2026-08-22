import type { ArchiveEntry } from "./types.js";
export declare function crc32(data: Uint8Array): number;
export declare function writeTar(entries: ArchiveEntry[]): Buffer;
export declare function gzipDeterministic(data: Buffer): Buffer;
export declare function sha256Hex(data: Buffer): string;
export declare function parseTar(archive: Buffer): Array<{
    path: string;
    type: "file" | "directory";
    size: number;
}>;
//# sourceMappingURL=archive.d.ts.map