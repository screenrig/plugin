import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import Yoga, { Align as YogaAlign, Direction, Edge, FlexDirection, Gutter, Justify as YogaJustify, MeasureMode, PositionType, } from "yoga-layout";
import { resolveFontFamily, resolveTextFont } from "./fonts.js";
export { resolveFontFamily } from "./fonts.js";
import { fitType } from "./fit-text.js";
import { REFERENCE_CANVAS, rampRoot, resolveSpace, spaceScale, typeRamp } from "./tokens.js";
import { validateSpec } from "./validate.js";
import { expandComposeRecipe } from "./recipes.js";
const ALIGN = {
    start: YogaAlign.FlexStart,
    center: YogaAlign.Center,
    end: YogaAlign.FlexEnd,
    stretch: YogaAlign.Stretch,
};
const JUSTIFY = {
    start: YogaJustify.FlexStart,
    center: YogaJustify.Center,
    end: YogaJustify.FlexEnd,
    "space-between": YogaJustify.SpaceBetween,
    "space-around": YogaJustify.SpaceAround,
    "space-evenly": YogaJustify.SpaceEvenly,
};
function usage(message) {
    const err = new Error(message);
    err.code = "usage_error";
    return err;
}
export function resolveImagePath(src, baseDir) {
    if (src.includes("\0")) {
        throw usage("Image.src must not contain a NUL byte");
    }
    if (src.includes("://") || /^(https?|file|data):/i.test(src)) {
        throw usage("Image.src must be a local filesystem path, not a URL");
    }
    return isAbsolute(src) ? src : join(baseDir, src);
}
function applyPin(yoga, pin) {
    yoga.setPositionType(PositionType.Absolute);
    if (pin === "bottom" || pin === "top") {
        yoga.setPosition(Edge.Left, 0);
        yoga.setPosition(Edge.Right, 0);
        yoga.setPosition(pin === "bottom" ? Edge.Bottom : Edge.Top, 0);
    }
    else {
        yoga.setPosition(Edge.Top, 0);
        yoga.setPosition(Edge.Bottom, 0);
        yoga.setPosition(pin === "right" ? Edge.Right : Edge.Left, 0);
    }
}
function buildTree(node, ctx, family, ramp, space) {
    const yoga = Yoga.Node.create();
    node._yoga = yoga;
    const pad = resolveSpace(node.padding, space, "padding");
    if (pad) {
        yoga.setPadding(Edge.All, pad);
    }
    if (node.gap)
        yoga.setGap(Gutter.All, resolveSpace(node.gap, space, "gap"));
    if (typeof node.flex === "number") {
        yoga.setFlexGrow(node.flex);
        yoga.setFlexShrink(1);
    }
    if (node.align)
        yoga.setAlignItems(ALIGN[node.align] ?? YogaAlign.Stretch);
    else if (node.type === "Row" || node.type === "Column" || node.type === "Frame" || node.type === "Box") {
        yoga.setAlignItems(YogaAlign.Stretch);
    }
    if (node.justify)
        yoga.setJustifyContent(JUSTIFY[node.justify] ?? YogaJustify.FlexStart);
    if (node.pin)
        applyPin(yoga, node.pin);
    if (node.type !== "Frame") {
        if (typeof node.width === "number")
            yoga.setWidth(node.width);
        if (typeof node.height === "number")
            yoga.setHeight(node.height);
    }
    if (node.type === "Frame") {
        yoga.setWidth(node.width ?? 0);
        yoga.setHeight(node.height ?? 0);
        yoga.setFlexDirection(node.direction === "row" ? FlexDirection.Row : FlexDirection.Column);
    }
    else if (node.type === "Row") {
        yoga.setFlexDirection(FlexDirection.Row);
    }
    else if (node.type === "Column" || node.type === "Box") {
        yoga.setFlexDirection(FlexDirection.Column);
    }
    else if (node.type === "Spacer") {
        if (typeof node.flex !== "number" && node.width == null && node.height == null) {
            yoga.setFlexGrow(1);
        }
    }
    else if (node.type === "Text") {
        const role = node.role ?? "body";
        node._textFont = resolveTextFont(String(node.text ?? ""), family, ramp[role].weight);
        yoga.setMeasureFunc((width, widthMode, height, heightMode) => {
            let maxWidth = width;
            if (widthMode === MeasureMode.Undefined || maxWidth <= 0)
                maxWidth = 4096;
            let maxHeight = null;
            if (heightMode === MeasureMode.AtMost || heightMode === MeasureMode.Exactly)
                maxHeight = height;
            const fitted = fitType(ctx, {
                text: String(node.text ?? ""),
                family: node._textFont.family,
                ramp,
                role,
                maxWidth,
                maxHeight,
            });
            node._fit = fitted;
            const contentWidth = Math.ceil(Math.max(0, ...fitted.lines.map((line) => {
                ctx.font = fitted.font;
                return ctx.measureText(line).width;
            })));
            return {
                width: widthMode === MeasureMode.Exactly ? width : Math.min(maxWidth, contentWidth),
                height: fitted.height,
            };
        });
    }
    else if (node.type === "Image") {
        yoga.setFlexGrow(node.flex ?? 0);
        if (node.flex)
            yoga.setFlexShrink(1);
    }
    (node.children ?? []).forEach((child, i) => {
        yoga.insertChild(buildTree(child, ctx, family, ramp, space), i);
    });
    return yoga;
}
function collectBoxes(node, ox, oy) {
    const layout = node._yoga?.getComputedLayout();
    if (!layout)
        return;
    node._box = {
        x: ox + layout.left,
        y: oy + layout.top,
        width: layout.width,
        height: layout.height,
    };
    for (const child of node.children ?? [])
        collectBoxes(child, node._box.x, node._box.y);
}
function parseColor(value, fallback) {
    if (!value)
        return fallback;
    const raw = value.replace("#", "");
    if (raw.length === 8) {
        const r = parseInt(raw.slice(0, 2), 16);
        const g = parseInt(raw.slice(2, 4), 16);
        const b = parseInt(raw.slice(4, 6), 16);
        const a = parseInt(raw.slice(6, 8), 16) / 255;
        return `rgba(${r},${g},${b},${a})`;
    }
    return `#${raw}`;
}
function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}
async function imageFor(src, baseDir, cache) {
    const path = resolveImagePath(src, baseDir);
    let pending = cache.get(path);
    if (!pending) {
        pending = loadImage(path).catch(() => {
            throw usage("Image.src could not be read as a local file");
        });
        cache.set(path, pending);
    }
    return pending;
}
async function paint(ctx, node, baseDir, space, cache, quality, warnings, nodePath = "Frame") {
    const box = node._box;
    if (!box)
        return;
    const radius = node.radius ? resolveSpace(node.radius, space, "radius") : 0;
    const clipBox = Boolean(radius) && node.type !== "Text";
    if (clipBox) {
        ctx.save();
        roundRect(ctx, box.x, box.y, box.width, box.height, radius);
        ctx.clip();
    }
    if (node.background && node.type !== "Image") {
        ctx.fillStyle = parseColor(node.background, "#000");
        if (radius) {
            roundRect(ctx, box.x, box.y, box.width, box.height, radius);
            ctx.fill();
        }
        else {
            ctx.fillRect(box.x, box.y, box.width, box.height);
        }
    }
    if (node.type === "Image") {
        const img = await imageFor(String(node.src ?? ""), baseDir, cache);
        const fit = node.objectFit ?? "cover";
        ctx.save();
        if (radius) {
            roundRect(ctx, box.x, box.y, box.width, box.height, radius);
            ctx.clip();
        }
        else {
            ctx.beginPath();
            ctx.rect(box.x, box.y, box.width, box.height);
            ctx.clip();
        }
        const scaleCover = Math.max(box.width / img.width, box.height / img.height);
        const scaleContain = Math.min(box.width / img.width, box.height / img.height);
        const scale = fit === "contain" ? scaleContain : fit === "fill" ? null : scaleCover;
        const scaleX = scale ?? box.width / img.width;
        const scaleY = scale ?? box.height / img.height;
        quality.images.push({ node: nodePath, source: { width: img.width, height: img.height },
            box: { width: box.width, height: box.height },
            painted: { width: img.width * scaleX, height: img.height * scaleY },
            object_fit: fit, scale_x: scaleX, scale_y: scaleY });
        if (Math.max(scaleX, scaleY) > 1.25)
            warnings.push({ code: "image_upscaled",
                message: `${nodePath}: ${img.width}×${img.height} source paints at ${Math.round(img.width * scaleX)}×${Math.round(img.height * scaleY)} (${Math.max(scaleX, scaleY).toFixed(2)}×). Use a higher-resolution original or reduce the image size.` });
        if (fit === "fill" && scaleX > 0 && scaleY > 0 && Math.max(scaleX / scaleY, scaleY / scaleX) > 1.01)
            warnings.push({ code: "image_aspect_stretched",
                message: `${nodePath}: fill stretches the image unevenly (${scaleX.toFixed(2)}× horizontally, ${scaleY.toFixed(2)}× vertically). Use contain to preserve the whole image or cover to crop without distortion.` });
        if (scale == null) {
            ctx.drawImage(img, box.x, box.y, box.width, box.height);
        }
        else {
            const dw = img.width * scale;
            const dh = img.height * scale;
            ctx.drawImage(img, box.x + (box.width - dw) / 2, box.y + (box.height - dh) / 2, dw, dh);
        }
        ctx.restore();
    }
    if (node.type === "Text" && node._fit) {
        const fit = node._fit;
        ctx.save();
        ctx.fillStyle = parseColor(node.color, "#EEE9DF");
        ctx.font = fit.font;
        ctx.textBaseline = "alphabetic";
        const align = node.align ?? "left";
        ctx.textAlign = align === "center" ? "center" : align === "right" ? "right" : "left";
        let x = box.x;
        if (align === "center")
            x = box.x + box.width / 2;
        if (align === "right")
            x = box.x + box.width;
        const blockHeight = fit.lines.length * fit.lineHeight;
        let y = box.y + Math.round((box.height - blockHeight) / 2) + Math.round(fit.fontSize * 0.8);
        if (box.height <= blockHeight + 2)
            y = box.y + Math.round(fit.fontSize * 0.8);
        const shadow = node.textShadow;
        if (shadow) {
            ctx.shadowOffsetX = shadow.x;
            ctx.shadowOffsetY = shadow.y;
            ctx.shadowBlur = shadow.blur ?? 0;
            ctx.shadowColor = parseColor(shadow.color, "#000000");
        }
        for (const line of fit.lines) {
            const metrics = ctx.measureText(line);
            const ink = { x: x - metrics.actualBoundingBoxLeft, y: y - metrics.actualBoundingBoxAscent,
                width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
                height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent };
            if (ink.width > 0 && ink.height > 0) {
                const prior = node._ink;
                node._ink = prior ? { x: Math.min(prior.x, ink.x), y: Math.min(prior.y, ink.y),
                    width: Math.max(prior.x + prior.width, ink.x + ink.width) - Math.min(prior.x, ink.x),
                    height: Math.max(prior.y + prior.height, ink.y + ink.height) - Math.min(prior.y, ink.y) } : ink;
            }
            ctx.fillText(line, x, y);
            y += fit.lineHeight;
        }
        ctx.restore();
    }
    for (const [index, child] of (node.children ?? []).entries())
        await paint(ctx, child, baseDir, space, cache, quality, warnings, `${nodePath}.children[${index}]`);
    if (clipBox)
        ctx.restore();
}
function layoutDump(node) {
    const dump = { type: node.type, role: node.role, pin: node.pin, box: node._box, text_bounds: node._ink, text_font: node._textFont };
    if (node._fit) {
        dump.fit = {
            fontSize: node._fit.fontSize,
            lineHeight: node._fit.lineHeight,
            lines: node._fit.lines,
            truncated: node._fit.truncated,
        };
    }
    if (node.children)
        dump.children = node.children.map(layoutDump);
    return dump;
}
function anyTruncated(dump) {
    if (dump.fit?.truncated)
        return true;
    return (dump.children ?? []).some(anyTruncated);
}
function assessComposition(layout, quality, warnings, ramp, safeArea) {
    const output = { x: 0, y: 0, ...quality.output };
    const inset = { x: output.width * 0.05, y: output.height * 0.05, width: output.width * 0.9, height: output.height * 0.9 };
    const outside = (ink, box) => ink.x < box.x - 1 || ink.y < box.y - 1 || ink.x + ink.width > box.x + box.width + 1 || ink.y + ink.height > box.y + box.height + 1;
    const visible = [];
    const visit = (node, nodePath) => {
        if (node.type === "Text" && node.text_bounds && node.box && node.fit) {
            const ink = node.text_bounds;
            const preferred = ramp[(node.role ?? "body")].wish;
            if (node.text_font) {
                quality.fonts.push({ node: nodePath, ...node.text_font });
                if (node.text_font.fallback_from)
                    warnings.push({ code: "font_glyph_fallback", message: `${nodePath}: ${node.text_font.fallback_from} cannot render ${node.text_font.missing_codepoints.slice(0, 16).join(", ")} at this weight. Used ${node.text_font.family} for this text, then remeasured it. Choose that font explicitly for consistent typography.` });
                else if (node.text_font.missing_codepoints.length)
                    warnings.push({ code: "font_glyph_missing", message: `${nodePath}: missing glyphs ${node.text_font.missing_codepoints.slice(0, 16).join(", ")} in ${node.text_font.family}; no installed fallback covers this text. Install a font with these characters or choose one from compose catalog.` });
            }
            quality.text.push({ node: nodePath, box: node.box, ink, font_size: node.fit.fontSize, preferred_font_size: preferred, truncated: node.fit.truncated });
            visible.push({ node: nodePath, type: "Text", bounds: ink });
            if (outside(ink, node.box) || outside(ink, output))
                warnings.push({ code: "text_overflow", message: `${nodePath}: measured text extends beyond its layout box or canvas. Shorten the copy, widen its container, or split it across pages.` });
            if (node.fit.truncated)
                warnings.push({ code: "text_truncated", message: `${nodePath}: some copy was replaced by an ellipsis. Shorten it or give this text more space.` });
            if (node.fit.fontSize < preferred * 0.8)
                warnings.push({ code: "text_dense", message: `${nodePath}: text shrank to ${node.fit.fontSize}px from its preferred ${preferred}px. Reduce copy or split this section; do not lower the readable type floor.` });
            if (safeArea && outside(ink, inset))
                warnings.push({ code: "text_outside_safe_area", message: `${nodePath}: measured text crosses the 5% TV-safe margin. Inset its container if the screen crops its edges.` });
        }
        else if (node.type === "Image" && node.box)
            visible.push({ node: nodePath, type: "Image", bounds: node.box });
        node.children?.forEach((child, index) => visit(child, `${nodePath}.children[${index}]`));
    };
    visit(layout, "Frame");
    for (let i = 0; i < visible.length; i++)
        for (let j = i + 1; j < visible.length; j++) {
            const first = visible[i], second = visible[j];
            const width = Math.min(first.bounds.x + first.bounds.width, second.bounds.x + second.bounds.width) - Math.max(first.bounds.x, second.bounds.x);
            const height = Math.min(first.bounds.y + first.bounds.height, second.bounds.y + second.bounds.height) - Math.max(first.bounds.y, second.bounds.y);
            if (width <= 1 || height <= 1)
                continue;
            const kind = first.type === "Text" && second.type === "Text" ? "text_text" : first.type === "Image" && second.type === "Image" ? "media_media" : "text_media";
            quality.overlaps.push({ first: first.node, second: second.node, kind, area: width * height });
            if (kind === "text_text")
                warnings.push({ code: "text_overlap", message: `${first.node} overlaps ${second.node}. Separate the text containers or shorten their copy. Background plates and intentional text-over-media are not treated as text collisions.` });
        }
}
export async function composeSpec(spec, options) {
    const validated = validateSpec(expandComposeRecipe(spec));
    const tree = structuredClone(validated);
    tree.background = tree.background || "#1B2632";
    const family = resolveFontFamily(typeof tree.fontFamily === "string" ? tree.fontFamily : undefined);
    const width = tree.width ?? 0;
    const height = tree.height ?? 0;
    if (options.target && (![options.target.width, options.target.height].every((n) => Number.isSafeInteger(n) && n > 0))) {
        throw usage("physical target width and height must be positive integers");
    }
    const quality = { target_status: options.target ? "known" : "unknown", output: { width, height }, images: [], text: [], overlaps: [], fonts: [] };
    const warnings = [];
    if (options.target) {
        quality.target = options.target;
        quality.output_scale = { x: options.target.width / width, y: options.target.height / height };
        if (Math.max(quality.output_scale.x, quality.output_scale.y) > 1.25)
            warnings.push({ code: "compose_output_upscaled",
                message: `Frame: ${width}×${height} output will display at ${options.target.width}×${options.target.height}. Re-render from original sources at target resolution; enlarging the finished PNG cannot recover detail.` });
    }
    const space = spaceScale(width, height);
    const ramp = typeRamp(width, height);
    const ramp_root = rampRoot(width, height);
    const ramp_at_1080 = typeRamp(REFERENCE_CANVAS.width, REFERENCE_CANVAS.height);
    const scratch = createCanvas(8, 8);
    const measureCtx = scratch.getContext("2d");
    const root = buildTree(tree, measureCtx, family, ramp, space);
    try {
        root.calculateLayout(width, height, Direction.LTR);
        collectBoxes(tree, 0, 0);
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        // paint owns the Frame background too; pre-filling would apply its alpha twice.
        await paint(ctx, tree, options.baseDir, space, new Map(), quality, warnings);
        const png = Buffer.from(canvas.toBuffer("image/png"));
        const layout = layoutDump(tree);
        assessComposition(layout, quality, warnings, ramp, options.safeArea === true);
        if (options.outPath) {
            await mkdir(dirname(options.outPath), { recursive: true });
            await writeFile(options.outPath, png);
        }
        if (options.layoutOutPath) {
            await mkdir(dirname(options.layoutOutPath), { recursive: true });
            await writeFile(options.layoutOutPath, `${JSON.stringify({ space, ramp, ramp_root, ramp_at_1080, quality, warnings, tree: layout }, null, 2)}\n`);
        }
        return {
            quality,
            warnings,
            png,
            layout,
            space,
            ramp,
            ramp_root,
            ramp_at_1080,
            font_family: family,
            truncated: anyTruncated(layout),
            width,
            height,
        };
    }
    finally {
        root.freeRecursive();
    }
}
//# sourceMappingURL=compose.js.map