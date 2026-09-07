import type { ComposeQuality } from "./compose.js";
import { VIEWING_DISTANCES, VIEWING_XHEIGHT_RATIO, XHEIGHT_FALLBACK, parseViewing, type ViewingDistance } from "./type.js";
export { VIEWING_DISTANCES, parseViewing };
export type { ViewingDistance };
export declare const LOOK_AT_THE_CONTACT_SHEET = "Look at the contact sheet before publishing. Fix what the lint names, then look again.";
export declare const LINT_CODES: readonly ["low_contrast_rendered", "text_over_busy_image", "too_small_for_distance", "too_dense", "collision", "motion_overuse", "adjacent_repeat", "safe_margin"];
export type LintCode = (typeof LINT_CODES)[number];
export declare const FREEFORM_WORD_BUDGET = 60;
export { VIEWING_XHEIGHT_RATIO, XHEIGHT_FALLBACK };
export interface LintFinding {
    page_id: string;
    code: LintCode;
    id: string;
    message: string;
}
export interface PixelBuffer {
    data: Uint8ClampedArray | Uint8Array;
    width: number;
    height: number;
}
export declare function viewingOf(spec: unknown): ViewingDistance;
/** Page object for lint: that page, with inherited `viewing` when the deck omits it. */
export declare function pageSpecForLint(input: unknown, pageId: string): unknown;
export declare function sortLint(findings: LintFinding[], pageOrder: string[]): LintFinding[];
export declare function pixelsFromPng(png: Buffer): Promise<PixelBuffer>;
export declare function lintComposedPage(args: {
    page_id: string;
    spec: unknown;
    quality: ComposeQuality;
    pixels?: PixelBuffer;
    viewing?: ViewingDistance;
}): LintFinding[];
export declare function lintAdjacentComposePages(pages: Array<{
    id: string;
    spec: unknown;
}>): LintFinding[];
export declare function lintPlaylistPages(pages: unknown[], options?: {
    pixelsByPage?: Map<string, PixelBuffer>;
}): LintFinding[];
export declare function lintCodesList(): string;
//# sourceMappingURL=lint.d.ts.map