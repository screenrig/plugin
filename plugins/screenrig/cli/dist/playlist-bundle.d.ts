import type { FileHandle } from "node:fs/promises";
import type { ApiClient } from "./client.js";
import { type CliRuntime } from "./runtime.js";
export declare const PLAYLIST_BUNDLE_SCHEMA = "screenrig.playlist-bundle/v1";
export declare const PLAYLIST_BUNDLE_MANIFEST = "screenrig-bundle.json";
export declare const PLAYLIST_BUNDLE_PLAYLIST = "playlist.json";
interface JsonRecord {
    [key: string]: unknown;
}
export interface PlaylistBundleMedia {
    source_id: string;
    path: string;
    filename: string;
    content_type: string;
    bytes: number;
    sha256: string;
    tag?: string;
}
export interface PlaylistBundleManifest {
    schema: typeof PLAYLIST_BUNDLE_SCHEMA;
    selector_policy: "snapshot";
    comments_policy: "excluded";
    playlist: {
        source_id: string;
        source_revision: number;
        path: typeof PLAYLIST_BUNDLE_PLAYLIST;
    };
    media: PlaylistBundleMedia[];
}
export interface PlaylistBundlePreflight {
    root: string;
    manifest: PlaylistBundleManifest;
    playlist: JsonRecord;
    files: Map<string, {
        path: string;
        handle: FileHandle;
    }>;
    close(): Promise<void>;
}
export interface PlaylistBundleSkipSummary {
    /** Application primitive ids removed by --skip-applications. */
    primitives: string[];
    /** Page ids removed because every primitive on them was an application. */
    pages: string[];
}
export interface PlaylistBundleExportResult {
    schema: typeof PLAYLIST_BUNDLE_SCHEMA;
    directory: string;
    playlist_id: string;
    playlist_revision: number;
    media_count: number;
    media_bytes: number;
    skipped_applications: PlaylistBundleSkipSummary;
}
export interface PlaylistBundleImportResult {
    schema: typeof PLAYLIST_BUNDLE_SCHEMA;
    directory: string;
    source_playlist_id: string;
    playlist: unknown;
    mode: "create" | "update";
    media: {
        total: number;
        reused: number;
        uploaded: number;
    };
}
export declare function preflightPlaylistBundle(directory: string): Promise<PlaylistBundlePreflight>;
export declare function normalizePlaylistForBundle(input: unknown, options?: {
    skipApplications?: boolean;
}): {
    id: string;
    revision: number;
    playlist: JsonRecord;
    mediaIds: string[];
    skipped: PlaylistBundleSkipSummary;
};
export declare function exportPlaylistBundle(options: {
    playlistId: string;
    outputDirectory: string;
    client: ApiClient;
    /** Drop application pages and primitives instead of refusing the export. */
    skipApplications?: boolean;
}): Promise<PlaylistBundleExportResult>;
export declare function deriveBundleIdempotencyKey(base: string, phase: string, identity: string): string;
export declare function importPlaylistBundle(options: {
    directory: string;
    client: ApiClient;
    runtime: CliRuntime;
    updateId?: string;
    ifMatch?: string;
    /** Replaces the bundle's display name on the written playlist. */
    name?: string;
    timeoutMs?: number;
    pollMs?: number;
    beforePlaylistWrite?: (playlist: JsonRecord, updateId: string | undefined) => Promise<void>;
}): Promise<PlaylistBundleImportResult>;
export {};
//# sourceMappingURL=playlist-bundle.d.ts.map