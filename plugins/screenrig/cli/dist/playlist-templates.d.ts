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
/** Authoring duration when a swipe type is chosen. Not an OpenAPI default. */
export declare const SLIDE_SWIPE_AUTHORING_DURATION_MS = 600;
export declare const PLAYLIST_TRANSITION_TYPES: readonly ["crossfade", "swipe-left", "swipe-right", "swipe-up", "swipe-down"];
export declare const PLACEMENT_ENTER_TYPES: readonly ["fade-up", "fade-down", "fade-left", "fade-right", "fade-in", "zoom-in", "zoom-out"];
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
export type CatalogSlotKind = "compose" | "image" | "image_or_video";
export interface TemplateCatalogSlot {
    id: string;
    kind: CatalogSlotKind;
    required: boolean;
}
export interface TemplateCatalogEntry {
    id: string;
    compose_locally: boolean;
    slots: TemplateCatalogSlot[];
}
export interface TemplateCatalog {
    compose: {
        catalog_command: string;
        render_command: string;
        wire_kinds: readonly string[];
    };
    canvas: {
        width: number;
        height: number;
        viewport_fit: "contain";
        background: string;
    };
    transition: {
        type: "crossfade";
        duration_ms: number;
    };
    transition_types: readonly typeof PLAYLIST_TRANSITION_TYPES[number][];
    swipe_duration_ms: number;
    enter_types: readonly typeof PLACEMENT_ENTER_TYPES[number][];
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
export {};
//# sourceMappingURL=playlist-templates.d.ts.map