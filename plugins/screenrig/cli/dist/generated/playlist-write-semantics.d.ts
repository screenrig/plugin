/** Backend-owned offline cross-field checks. Run the generated PlaylistWrite
 * JSON Schema first. Neither pass resolves account-owned references, dynamic
 * selector cardinality, media durations, or DNS; those remain server checks. */
export interface PlaylistWriteIssue {
    path: string;
    message: string;
}
export declare function validatePlaylistWriteSemantics(value: unknown): PlaylistWriteIssue[];
//# sourceMappingURL=playlist-write-semantics.d.ts.map