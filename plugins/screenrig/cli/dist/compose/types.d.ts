export declare const REGIONS: readonly ["fullpage", "left", "right", "left-third", "middle-third", "right-third", "middle-half", "top-half", "bottom-half", "top", "bottom"];
export type RegionName = (typeof REGIONS)[number];
export declare const ENTER_TYPES: readonly ["fade-up", "fade-down", "fade-left", "fade-right", "fade-in", "zoom-in", "zoom-out"];
export type EnterType = (typeof ENTER_TYPES)[number];
export declare const ALIGN: readonly ["left", "center", "right"];
export type Align = (typeof ALIGN)[number];
export declare const VALIGN: readonly ["auto", "top", "center", "bottom"];
export type Valign = (typeof VALIGN)[number];
export declare const SPIN_DIR: readonly ["cw", "ccw"];
export declare const DRIFT_ZOOM: readonly ["in", "out"];
export declare const DRIFT_DIR: readonly ["left", "right", "up", "down", "none"];
export declare const SPEED: readonly ["slow", "medium", "fast"];
export declare const VIEWING_DISTANCES: readonly ["near", "mid", "far"];
export type ViewingDistance = (typeof VIEWING_DISTANCES)[number];
export declare const TYPE_ROLES: readonly ["eyebrow", "title", "subtitle", "text", "footer", "card", "small", "table"];
export type TypeRole = (typeof TYPE_ROLES)[number];
export declare const LOGO_CORNERS: readonly ["top-left", "top-right", "bottom-left", "bottom-right"];
export type LogoCorner = (typeof LOGO_CORNERS)[number];
export declare const CARD_FITS: readonly ["region", "ink"];
export type CardFit = (typeof CARD_FITS)[number];
export declare const LOGO_INSET = 32;
export declare const LOGO_MAX: {
    readonly width: 200;
    readonly height: 100;
};
export declare const CARD_INK_PAD = 24;
export declare const WIRE_PRIMITIVES: readonly ["image", "video", "iframe", "application"];
export type WirePrimitive = (typeof WIRE_PRIMITIVES)[number];
/** Playlist PrimitiveEnter, field-for-field. */
export interface PrimitiveEnter {
    type: EnterType;
    stagger?: number;
}
/** Playlist PrimitiveMotionSpin, field-for-field. */
export interface PrimitiveMotionSpin {
    type: "spin";
    direction: (typeof SPIN_DIR)[number];
    speed: (typeof SPEED)[number];
}
/** Playlist PrimitiveMotionDrift, field-for-field. */
export interface PrimitiveMotionDrift {
    type: "drift";
    zoom: (typeof DRIFT_ZOOM)[number];
    direction: (typeof DRIFT_DIR)[number];
    speed: (typeof SPEED)[number];
}
export type PrimitiveMotion = PrimitiveMotionSpin | PrimitiveMotionDrift;
/** Playlist PlaylistRect with integer fields. */
export interface PlaylistRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface CardItem {
    title: string;
    subtitle?: string | null;
    text?: string | null;
    price?: string | null;
    image?: string | null;
}
/** Drop shadow. Optional `blur` is 0–32 px; omit is 0 (unblurred offset fill). `"none"` disables the automatic media shadow. */
export type LayerShadow = "none" | {
    x: number;
    y: number;
    color: string;
    blur?: number;
};
/** Stroke around glyphs. Off unless set. Width is 0.5–12 px. */
export interface LayerOutline {
    width: number;
    color: string;
}
export interface TableBlock {
    columns: string[];
    rows: string[][];
}
export type LayerBlock = {
    role: "eyebrow" | "title" | "subtitle" | "text" | "footer";
    text: string;
} | {
    role: "image";
    src: string;
} | {
    role: "placeholder";
    kind: "video" | "iframe" | "application";
    src: string;
    label: string;
} | {
    role: "cards";
    items: CardItem[];
} | ({
    role: "table";
} & TableBlock);
export interface LayerMedia {
    type: WirePrimitive;
    src: string;
    rect?: PlaylistRect;
}
export interface LayerSpec {
    id: string;
    region: RegionName | "background" | "logo";
    z: number;
    order: number;
    x: number;
    y: number;
    w: number;
    h: number;
    pad: number;
    fill: string | null;
    ink: string | null;
    cardFit: CardFit | null;
    surface: string;
    shadow: LayerShadow | null;
    outline: LayerOutline | null;
    overMedia: boolean;
    align: Align;
    valign: Valign;
    font: string | null;
    text: string;
    muted: string;
    brand: string;
    root: number;
    viewing: ViewingDistance;
    enter: PrimitiveEnter | null;
    motion: PrimitiveMotion | null;
    media: LayerMedia | null;
    blocks: LayerBlock[];
    logoCorner?: LogoCorner | null;
}
export interface PageSpec {
    id: string;
    layers: LayerSpec[];
}
export interface ComposeDocument {
    canvas: {
        width: number;
        height: number;
    };
    name: string | null;
    viewing: ViewingDistance;
    pages: PageSpec[];
}
export interface LayerManifest {
    id: string;
    file?: string;
    z: number;
    rect: PlaylistRect;
    enter?: PrimitiveEnter;
    motion?: PrimitiveMotion;
    media?: LayerMedia;
    overflow?: boolean;
}
export interface PageManifest {
    version: 1;
    canvas: {
        width: number;
        height: number;
    };
    layers: LayerManifest[];
}
//# sourceMappingURL=types.d.ts.map