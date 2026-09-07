import { measureMarkdown, stripMarkdown, wrapMarkdown } from "./markdown.js";
import { VIEWING_DISTANCES } from "./types.js";
export { VIEWING_DISTANCES };
/** Body-text x-height as a fraction of the shorter canvas edge. */
export const VIEWING_XHEIGHT_RATIO = {
    near: 0.007,
    mid: 0.012,
    far: 0.02,
};
/** Fallback x-height as a fraction of font size when metrics are missing. */
export const XHEIGHT_FALLBACK = 0.52;
export const SCALE_MIN = 0.65;
export const SCALE_MAX = 1.35;
export const REFERENCE_CANVAS = { width: 1920, height: 1080 };
/**
 * CLI signage fractions of min(width, height). 1080p body wish is ~45 px.
 * Title/subtitle width-fit between floor and wish; wrap roles use the scaled wish.
 */
const ROLE = {
    eyebrow: { wish: 0.03, floor: 0.015, fit: "line", minWish: 22 },
    title: { wish: 0.12, floor: 0.04, fit: "line", minWish: 48 },
    subtitle: { wish: 0.05, floor: 0.026, fit: "line", minWish: 32 },
    text: { wish: 0.042, floor: 0.021, fit: "wrap", minWish: 32 },
    footer: { wish: 0.03, floor: 0.015, fit: "wrap", minWish: 22 },
    card: { wish: 0.042, floor: 0.021, fit: "wrap", minWish: 32 },
    small: { wish: 0.03, floor: 0.015, fit: "wrap", minWish: 22 },
    table: { wish: 0.042, floor: 0.021, fit: "wrap", minWish: 32 },
};
export function pageRoot(width, height) {
    return Math.min(width, height);
}
export function viewingFontFloor(root, viewing) {
    return Math.ceil((root * VIEWING_XHEIGHT_RATIO[viewing]) / XHEIGHT_FALLBACK);
}
export function parseViewing(value) {
    if (value === "near" || value === "mid" || value === "far")
        return value;
    return "mid";
}
export function wishOf(role, root) {
    const spec = ROLE[role];
    return Math.max(spec.minWish, Math.round(root * spec.wish));
}
export function floorOf(role, root, viewing) {
    const spec = ROLE[role];
    const wish = wishOf(role, root);
    const roleFloor = Math.max(18, Math.round(root * spec.floor), Math.round(wish * 0.5));
    return Math.max(roleFloor, viewingFontFloor(root, viewing));
}
export function sizeFor(ctx, args) {
    const spec = ROLE[args.role];
    const baseWish = wishOf(args.role, args.root);
    const floor = floorOf(args.role, args.root, args.viewing);
    const scale = args.scale ?? 1;
    const ceiling = Math.max(floor, Math.round(baseWish * SCALE_MAX));
    const wish = Math.min(ceiling, Math.max(floor, Math.round(baseWish * scale)));
    if (spec.fit !== "line" || !args.text)
        return wish;
    const lines = String(args.text).split("\n");
    let lo = floor;
    let hi = wish;
    let best = floor;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (lines.every((line) => measureMarkdown(ctx, line, mid, args.family) <= args.width + 0.5)) {
            best = mid;
            lo = mid + 1;
        }
        else {
            hi = mid - 1;
        }
    }
    return best;
}
export function sizesFor(ctx, args) {
    const shared = { family: args.family, width: args.width, root: args.root, viewing: args.viewing, scale: args.scale ?? 1 };
    return {
        eyebrow: sizeFor(ctx, { role: "eyebrow", text: args.eyebrow, ...shared }),
        title: sizeFor(ctx, { role: "title", text: args.title, ...shared }),
        subtitle: sizeFor(ctx, { role: "subtitle", text: args.subtitle, ...shared }),
        text: sizeFor(ctx, { role: "text", ...shared }),
        footer: sizeFor(ctx, { role: "footer", ...shared }),
        card: sizeFor(ctx, { role: "card", ...shared }),
        small: sizeFor(ctx, { role: "small", ...shared }),
        table: sizeFor(ctx, { role: "table", ...shared }),
    };
}
export function leadingOf(size) {
    return Math.round(size * 1.28);
}
export function wrapLines(ctx, text, maxWidth) {
    const plain = stripMarkdown(text);
    if (!plain)
        return [];
    const lines = [];
    for (const paragraph of plain.split("\n")) {
        if (paragraph === "") {
            lines.push("");
            continue;
        }
        const words = paragraph.split(/\s+/);
        let current = "";
        for (const word of words) {
            const trial = current ? `${current} ${word}` : word;
            if (ctx.measureText(trial).width <= maxWidth || current === "")
                current = trial;
            else {
                lines.push(current);
                current = word;
            }
        }
        lines.push(current);
    }
    return lines;
}
export function textHeight(ctx, text, maxWidth, size, family, leading) {
    return wrapMarkdown(ctx, text, maxWidth, size, family).length * leading;
}
export function viewingGuidance() {
    return 'optional page "near"|"mid"|"far"; default mid. Type floors use that x-height at layout (1080p mid body wish is ~45 px); lint warns too_small_for_distance if a node still undershoots 0.7%/1.2%/2.0% of the shorter edge.';
}
//# sourceMappingURL=type.js.map