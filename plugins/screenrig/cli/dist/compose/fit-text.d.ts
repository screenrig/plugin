import type { CanvasRenderingContext2D } from "@napi-rs/canvas";
import type { Role, TypeRamp } from "./types.js";
export declare function lineHeightFor(size: number): number;
export declare function wrapLines(ctx: CanvasRenderingContext2D, text: string, font: string, maxWidth: number): string[];
export interface FittedText {
    fontSize: number;
    role: Role;
    lines: string[];
    height: number;
    lineHeight: number;
    font: string;
    truncated: boolean;
}
export declare function fitType(ctx: CanvasRenderingContext2D, args: {
    text: string;
    family: string;
    ramp: TypeRamp;
    role: Role;
    maxWidth: number;
    maxHeight: number | null;
}): FittedText;
//# sourceMappingURL=fit-text.d.ts.map