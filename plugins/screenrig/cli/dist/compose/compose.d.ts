import type { ComposeDocument, LayerSpec, LogoCorner, PageManifest, PageSpec, PlaylistRect } from "./types.js";
import { CARD_INK_PAD, LOGO_INSET, LOGO_MAX } from "./types.js";
export { resolveFontFamily } from "./fonts.js";
export { parseComposeSpec } from "./parse.js";
export { regionRect } from "./parse.js";
export declare function rejectImageLikeOutput(output: string, command: string): void;
export declare function resolveImagePath(src: string, baseDir: string, field?: string): string;
export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
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
        layer: string;
        role: string;
        box: Box;
        ink: Box;
        font_size: number;
        family: string;
    }>;
    fonts: Array<{
        layer: string;
        family: string;
        fallback_from?: string;
        missing_codepoints: string[];
    }>;
    overlaps: Array<{
        first: string;
        second: string;
        kind: "layer_layer";
        area: number;
    }>;
    images: Array<{
        layer: string;
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
        object_fit: "cover";
        scale_x: number;
        scale_y: number;
    }>;
}
export interface ComposeWarning {
    code: string;
    message: string;
}
export interface PaintedLayer {
    id: string;
    png: Buffer | null;
    family: string;
    overflow: boolean;
    scale: number;
    /** Distance from the padded region top to the first line of type. */
    originOffset: number;
    ink: Box[];
}
export interface ComposePageResult {
    id: string;
    layers: LayerSpec[];
    painted: PaintedLayer[];
    manifest: PageManifest;
    combined: Buffer;
    quality: ComposeQuality;
    warnings: ComposeWarning[];
    font_family: string;
}
export interface ComposeResult {
    document: ComposeDocument;
    pages: ComposePageResult[];
    canvas: {
        width: number;
        height: number;
    };
    name: string | null;
}
export { LOGO_MAX, LOGO_INSET, CARD_INK_PAD };
export declare function logoSize(img: {
    width: number;
    height: number;
}): {
    width: number;
    height: number;
};
export declare function placeLogo(img: {
    width: number;
    height: number;
}, canvas: {
    width: number;
    height: number;
}, corner: LogoCorner): Box;
/** Logo painted box plus the 32 px margin back to the chosen canvas edges. */
export declare function reservedLogoBox(logo: Box, canvas: {
    width: number;
    height: number;
}, corner: LogoCorner): Box;
export declare function composeDocument(source: unknown, options: {
    baseDir: string;
    target?: {
        width: number;
        height: number;
    };
    safeArea?: boolean;
}): Promise<ComposeResult>;
export interface WrittenCompose {
    output: string;
    canvas: {
        width: number;
        height: number;
    };
    name: string | null;
    files: string[];
    pages: Array<{
        id: string;
        dir: string;
        manifest: PageManifest;
        images: Array<{
            id: string;
            file: string;
        }>;
        combined?: string;
        quality: ComposeQuality;
        warnings: ComposeWarning[];
        font_family: string;
        scale: Record<string, number>;
    }>;
    manifest: PageManifest | null;
    images: Array<{
        id: string;
        file: string;
    }>;
    quality: ComposeQuality;
    warnings: ComposeWarning[];
    font_family: string;
}
export declare function composeAndWrite(source: unknown, options: {
    baseDir: string;
    outDir: string;
    combined?: boolean;
    target?: {
        width: number;
        height: number;
    };
    safeArea?: boolean;
    lintOnly?: boolean;
}): Promise<WrittenCompose & {
    result: ComposeResult;
}>;
export declare function defaultComposeOutDir(specPath: string): string;
export type { PlaylistRect, PageSpec };
//# sourceMappingURL=compose.d.ts.map