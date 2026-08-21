import { PINS, ROLES, SPACES } from "./tokens.js";
export const COMPOSE_TYPES = ["Frame", "Column", "Row", "Box", "Spacer", "Text", "Image"];
export const WIRE_PLACEMENT_KINDS = ["image", "video", "iframe", "application"];
export const FONT_FALLBACKS = ["Helvetica Neue", "Helvetica", "Arial", "DejaVu Sans", "Liberation Sans"];
export function composeCatalog() {
    return {
        types: [...COMPOSE_TYPES],
        roles: [...ROLES],
        spaces: [...SPACES],
        pins: [...PINS],
        rules: {
            authoring_xy: "Frame canvas only; child nodes use width, height, pin, flex, padding, and gap",
            child_size: "Image, Box, Row, Column, and Spacer honor width and height in px. Keep flex for remaining space.",
            pin_stretch: "pin top|bottom stretches the full width; pin left|right stretches the full height. Size a wordmark with width and height, not pin.",
            fontSize: false,
            image_src: "local filesystem path relative to the spec file directory",
            envelope: "structured JSON, not pixels",
            textShadow: "optional Text object { x, y, blur?, color }; omitted paints without a shadow",
        },
        wire_kinds: [...WIRE_PLACEMENT_KINDS],
        font_fallbacks: [...FONT_FALLBACKS],
    };
}
export function formatComposeCatalog(catalog) {
    const lines = [
        "Local compose catalog",
        `types: ${catalog.types.join("|")}`,
        `roles: ${catalog.roles.join("|")}`,
        `spaces: ${catalog.spaces.join("|")}`,
        `pins: ${catalog.pins.join("|")}`,
        `authoring_xy: ${catalog.rules.authoring_xy}`,
        `child_size: ${catalog.rules.child_size}`,
        `pin_stretch: ${catalog.rules.pin_stretch}`,
        "fontSize: not authorable",
        `image_src: ${catalog.rules.image_src}`,
        `textShadow: ${catalog.rules.textShadow}`,
        `wire_kinds: ${catalog.wire_kinds.join("|")}`,
        "envelope: structured JSON, not pixels",
    ];
    return lines.join("\n");
}
//# sourceMappingURL=catalog.js.map