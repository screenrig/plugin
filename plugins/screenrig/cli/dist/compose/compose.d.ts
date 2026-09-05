import { resolveTextFont } from "./fonts.js";
export { resolveFontFamily } from "./fonts.js";
import type { SpaceScale, TypeRamp } from "./types.js";
interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface LayoutDump {
    type: string;
    role?: string;
    pin?: string;
    box?: Box;
    text_bounds?: Box;
    text_font?: ReturnType<typeof resolveTextFont>;
    fit?: {
        fontSize: number;
        lineHeight: number;
        lines: string[];
        truncated: boolean;
    };
    children?: LayoutDump[];
}
export interface ComposeQuality {
    target_status: "known" | "unknown";
    output: {
        width: number;
        height: number;
    };
    target?: {
        width: number;
        height: number;
    };
    output_scale?: {
        x: number;
        y: number;
    };
    text: Array<{
        node: string;
        box: Box;
        ink: Box;
        font_size: number;
        preferred_font_size: number;
        truncated: boolean;
    }>;
    fonts: Array<{
        node: string;
        family: string;
        fallback_from?: string;
        missing_codepoints: string[];
    }>;
    overlaps: Array<{
        first: string;
        second: string;
        kind: "text_text" | "text_media" | "media_media";
        area: number;
    }>;
    images: Array<{
        node: string;
        source: {
            width: number;
            height: number;
        };
        box: {
            width: number;
            height: number;
        };
        painted: {
            width: number;
            height: number;
        };
        object_fit: string;
        scale_x: number;
        scale_y: number;
    }>;
}
export interface ComposeWarning {
    code: string;
    message: string;
}
export interface ComposeResult {
    quality: ComposeQuality;
    warnings: ComposeWarning[];
    layout: LayoutDump;
    space: SpaceScale;
    ramp: TypeRamp;
    ramp_root: number;
    ramp_at_1080: TypeRamp;
    font_family: string;
    truncated: boolean;
    width: number;
    height: number;
}
export declare function resolveImagePath(src: string, baseDir: string): string;
export declare function composeSpec(spec: unknown, options: {
    baseDir: string;
    outPath?: string;
    layoutOutPath?: string;
    safeArea?: boolean;
    target?: {
        width: number;
        height: number;
    };
}): Promise<ComposeResult & {
    png: Buffer;
}>;
//# sourceMappingURL=compose.d.ts.map