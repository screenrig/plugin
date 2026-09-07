import type { ApiClient } from "./client.js";
import { LOOK_AT_THE_CONTACT_SHEET, type LintFinding } from "./compose/lint.js";
export { LOOK_AT_THE_CONTACT_SHEET };
import type { CliRuntime } from "./runtime.js";
export declare const PREVIEW_STATES: readonly ["rest", "entry", "motion-mid"];
export type PreviewState = (typeof PREVIEW_STATES)[number];
export declare const PREVIEW_VIEWPORT: {
    width: number;
    height: number;
};
export declare const ENTRY_TIME_MS = 700;
export declare const OBJECT_ENTER_DELAY_MS = 500;
export declare const OBJECT_ENTER_DURATION_MS = 400;
export declare const OBJECT_ENTER_STAGGER_STEP_MS = 120;
export declare const CONTACT_SHEET_COLUMNS = 6;
export declare const CONTACT_SHEET_TILE_WIDTH = 320;
export declare const CONTACT_SHEET_TILE_HEIGHT = 180;
export declare const CONTACT_SHEET_LABEL_HEIGHT = 28;
interface Size {
    width: number;
    height: number;
}
export interface PreviewPageResult {
    id: string;
    files: Record<PreviewState, string>;
    lint_count: number;
}
export interface PlaylistPreviewResult {
    output: string;
    viewport: Size;
    pages: PreviewPageResult[];
    contact_sheet?: string;
    lint: LintFinding[];
}
export declare function previewPlaylist(options: {
    playlist: unknown;
    outputDirectory: string;
    viewport?: Size;
    frameMs?: number;
    contactSheet?: boolean;
    lintOnly?: boolean;
    searchDirs?: string[];
    client?: ApiClient;
    runtime?: CliRuntime;
}): Promise<PlaylistPreviewResult>;
export declare function contactSheetSize(pageCount: number): Size;
//# sourceMappingURL=playlist-preview.d.ts.map