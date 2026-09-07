import type { SKRSContext2D } from "@napi-rs/canvas";
import { VIEWING_DISTANCES, type TypeRole, type ViewingDistance } from "./types.js";
export { VIEWING_DISTANCES };
export type { ViewingDistance };
/** Body-text x-height as a fraction of the shorter canvas edge. */
export declare const VIEWING_XHEIGHT_RATIO: Record<ViewingDistance, number>;
/** Fallback x-height as a fraction of font size when metrics are missing. */
export declare const XHEIGHT_FALLBACK = 0.52;
export declare const SCALE_MIN = 0.65;
export declare const SCALE_MAX = 1.35;
export declare const REFERENCE_CANVAS: {
    readonly width: 1920;
    readonly height: 1080;
};
export declare function pageRoot(width: number, height: number): number;
export declare function viewingFontFloor(root: number, viewing: ViewingDistance): number;
export declare function parseViewing(value: unknown): ViewingDistance;
export declare function wishOf(role: TypeRole, root: number): number;
export declare function floorOf(role: TypeRole, root: number, viewing: ViewingDistance): number;
export declare function sizeFor(ctx: SKRSContext2D, args: {
    role: TypeRole;
    text?: string;
    family: string;
    width: number;
    root: number;
    viewing: ViewingDistance;
    scale?: number;
}): number;
export interface TypeRamp {
    eyebrow: number;
    title: number;
    subtitle: number;
    text: number;
    footer: number;
    card: number;
    small: number;
    table: number;
}
export declare function sizesFor(ctx: SKRSContext2D, args: {
    root: number;
    family: string;
    width: number;
    viewing: ViewingDistance;
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    scale?: number;
}): TypeRamp;
export declare function leadingOf(size: number): number;
export declare function wrapLines(ctx: SKRSContext2D, text: string, maxWidth: number): string[];
export declare function textHeight(ctx: SKRSContext2D, text: string, maxWidth: number, size: number, family: string, leading: number): number;
export declare function viewingGuidance(): string;
//# sourceMappingURL=type.d.ts.map