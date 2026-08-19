export { minSansLineHeight, measureSansLineWidth, longestSansLineWidth } from "./sans-advance.js";
export declare const SLIDE_CANVAS_WIDTH = 1920;
export declare const SLIDE_CANVAS_HEIGHT = 1080;
export declare const SLIDE_VIEWPORT_FIT: "contain";
export declare const SLIDE_BACKGROUND = "#1B2632FF";
export declare const SLIDE_TEXT_COLOR = "#EEE9DFFF";
export declare const SLIDE_BAR_COLOR = "#F8B334FF";
export declare const SLIDE_MUSTARD = "#F8B334FF";
export declare const SLIDE_DIM = "#B8B3A9FF";
export declare const SLIDE_FAINT = "#8C8880FF";
export declare const SLIDE_FONT_FAMILY: "sans";
export declare const SLIDE_DEFAULT_TRANSITION: {
    type: "crossfade";
    duration_ms: number;
};
export declare const SLIDE_DEFAULT_ADVANCE: {
    mode: "duration";
    after_ms: number;
};
export declare const SLIDE_PLATE_FILL = "#243040FF";
export declare const SLIDE_PLATE_RADIUS = 24;
export declare const SLIDE_PLATE_PAD_X = 48;
export declare const SLIDE_PLATE_PAD_Y = 40;
export declare const SLIDE_FIT_MIN_RATIO = 0.5;
export declare const SLIDE_FIT_MAX_RATIO = 1.5;
export declare const SLIDE_FIT_ABS_FLOOR = 12;
export declare const SHARED_LOGO_RECT: {
    x: number;
    y: number;
    width: number;
    height: number;
};
/** One stop on a top-to-bottom linear canvas background. `at=0` is the top edge. */
export interface LinearGradientStop {
    at: number;
    color: string;
}
/**
 * Top-to-bottom linear fill. There is no angle field. `stops` is 2 through 8
 * entries, strictly increasing `at` in [0, 1], first at=0, last at=1.
 */
export interface LinearGradientBackground {
    type: "linear";
    stops: LinearGradientStop[];
}
/** Solid canonical `#RRGGBBAA`, or a linear top-to-bottom gradient. */
export type CanvasBackground = string | LinearGradientBackground;
interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
type Align = "left" | "center" | "right";
type VerticalAlign = "top" | "middle" | "bottom";
interface TextSlotDef {
    id: string;
    kind: "text";
    required: boolean;
    rect: Rect;
    font_size: number;
    line_height: number;
    font_weight: 400 | 700;
    align: Align;
    vertical_align: VerticalAlign;
    color?: string;
}
interface PictureSlotDef {
    id: string;
    kind: "picture";
    required: boolean;
    rect: Rect;
    content_fit: "cover" | "contain";
    accept: "image" | "image_or_video";
    layer: 0 | 2;
}
type SlotDef = TextSlotDef | PictureSlotDef;
interface ChromeDef {
    id: string;
    rect: Rect;
    color: string;
}
export interface SlideTemplateDef {
    id: string;
    slots: readonly SlotDef[];
    chrome: readonly ChromeDef[];
    stack: readonly string[];
    pack: "start" | "center";
    plate: boolean;
}
export declare const SLIDE_TEMPLATES: readonly SlideTemplateDef[];
export type CatalogSlotKind = "text" | "image" | "image_or_video";
export interface TemplateCatalogSlot {
    id: string;
    kind: CatalogSlotKind;
    required: boolean;
    align?: Align;
    vertical_align?: VerticalAlign;
}
export interface TemplateCatalogEntry {
    id: string;
    slots: TemplateCatalogSlot[];
}
export interface TemplateCatalog {
    canvas: {
        width: number;
        height: number;
        viewport_fit: "contain";
        background: string;
    };
    text_color: string;
    font_family: "sans";
    wrap: false;
    transition: {
        type: "crossfade";
        duration_ms: number;
    };
    advance: {
        mode: "duration";
        after_ms: number;
    };
    templates: TemplateCatalogEntry[];
}
export declare function playlistTemplateCatalog(): TemplateCatalog;
export declare function formatTemplateCatalog(catalog: TemplateCatalog): string;
export declare function expandPlaylistPages(pages: unknown[]): unknown[];
export declare function expandPlaylistPage(page: unknown, index?: number): unknown;
//# sourceMappingURL=playlist-templates.d.ts.map