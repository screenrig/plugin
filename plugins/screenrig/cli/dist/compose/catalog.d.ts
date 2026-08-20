import { PINS, ROLES, SPACES } from "./tokens.js";
export declare const COMPOSE_TYPES: readonly ["Frame", "Column", "Row", "Box", "Spacer", "Text", "Image"];
export declare const WIRE_PLACEMENT_KINDS: readonly ["image", "video", "iframe", "application"];
export declare const FONT_FALLBACKS: readonly ["Helvetica Neue", "Helvetica", "Arial", "DejaVu Sans", "Liberation Sans"];
export interface ComposeCatalog {
    types: typeof COMPOSE_TYPES[number][];
    roles: typeof ROLES[number][];
    spaces: typeof SPACES[number][];
    pins: typeof PINS[number][];
    rules: {
        authoring_xy: string;
        fontSize: false;
        image_src: string;
        envelope: string;
        textShadow: string;
    };
    wire_kinds: typeof WIRE_PLACEMENT_KINDS[number][];
    font_fallbacks: typeof FONT_FALLBACKS[number][];
}
export declare function composeCatalog(): ComposeCatalog;
export declare function formatComposeCatalog(catalog: ComposeCatalog): string;
//# sourceMappingURL=catalog.d.ts.map