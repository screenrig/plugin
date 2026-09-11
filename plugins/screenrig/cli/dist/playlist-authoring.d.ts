type RecordValue = Record<string, any>;
/** Preserve authored selectors; strip only fields the backend derives on reads. */
export declare function editablePlaylist(value: unknown): RecordValue;
export declare function initializePlaylist(options: {
    name: string;
    media: RecordValue[];
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