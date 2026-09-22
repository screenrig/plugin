type RecordValue = Record<string, any>;
/** Preserve authored selectors; strip only fields the backend derives on reads. */
export declare function editablePlaylist(value: unknown): RecordValue;
/**
 * The advertising branch of the versioned page union: a whole-page slot
 * reference (`id`, `type`, `adslot_id`, optional `visibility`) with no canvas,
 * primitives, creative, duration, or price.
 */
export declare function isAdSlotPage(page: unknown): boolean;
/**
 * Ad-bearing documents are authored, read, and written under the version 2
 * union. A document of ordinary pages keeps the v1 contract unchanged.
 */
export declare function playlistApiVersion(pages: unknown): "v1" | "v2";
export declare function initializePlaylist(options: {
    name: string;
    media: RecordValue[];
    width: number;
    height: number;
    durationMs: number;
    fit: string;
}): RecordValue;
/** Build the backend-owned write document; target metadata stays outside it. */
export declare function preparePlaylist(options: {
    name: string;
    content: RecordValue[];
    width: number;
    height: number;
    durationMs: number;
    fit: string;
}): RecordValue;
export declare function targetDimensions(screen: unknown, width?: number, height?: number): {
    width: number;
    height: number;
};
export {};
//# sourceMappingURL=playlist-authoring.d.ts.map