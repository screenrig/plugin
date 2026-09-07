import { FONT_FALLBACKS } from "./fonts.js";
import { ALIGN, CARD_FITS, DRIFT_DIR, DRIFT_ZOOM, ENTER_TYPES, LOGO_CORNERS, REGIONS, SPEED, SPIN_DIR, VALIGN, VIEWING_DISTANCES, WIRE_PRIMITIVES } from "./types.js";
export { FONT_FALLBACKS } from "./fonts.js";
export { WIRE_PRIMITIVES } from "./types.js";
export interface ComposeCatalog {
    page_keys: string[];
    regions: typeof REGIONS[number][];
    region_fields: string[];
    card_fields: string[];
    card_plate_fields: string[];
    card_fits: typeof CARD_FITS[number][];
    logo_corners: typeof LOGO_CORNERS[number][];
    table_fields: string[];
    enter: typeof ENTER_TYPES[number][];
    motion: {
        types: ["spin", "drift"];
        spin: {
            direction: typeof SPIN_DIR[number][];
            speed: typeof SPEED[number][];
        };
        drift: {
            zoom: typeof DRIFT_ZOOM[number][];
            direction: typeof DRIFT_DIR[number][];
            speed: typeof SPEED[number][];
        };
    };
    align: typeof ALIGN[number][];
    valign: typeof VALIGN[number][];
    viewing: typeof VIEWING_DISTANCES[number][];
    installed_fonts: string[];
    examples: Record<string, unknown>;
    rules: {
        authoring: string;
        font: string;
        fontSize: false;
        xy: false;
        page_text: string;
        region_text: string;
        title_color: string;
        card: string;
        logo: string;
        iframe: string;
        markdown: string;
        image_src: string;
        shadow: string;
        outline: string;
        layered: string;
        envelope: string;
        viewing: string;
        lint: string;
        preview: string;
        wire: string;
    };
    wire_primitives: typeof WIRE_PRIMITIVES[number][];
    font_fallbacks: typeof FONT_FALLBACKS[number][];
}
export declare function composeCatalog(): ComposeCatalog;
export declare function formatComposeCatalog(catalog: ComposeCatalog): string;
//# sourceMappingURL=catalog.d.ts.map