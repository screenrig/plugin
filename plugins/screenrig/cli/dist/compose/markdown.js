import { cssFont } from "./fonts.js";
function closerAt(text, from, marker) {
    return text.indexOf(marker, from) !== -1;
}
function flush(spans, buf, bold, italic, underline) {
    if (buf)
        spans.push({ text: buf, bold, italic, underline });
    return "";
}
/** Left-to-right `**bold**`, `*italic*`, `__underline__`, and `***bold italic***`. Unmatched markers stay literal. */
export function parseMarkdown(text) {
    const spans = [];
    let bold = false;
    let italic = false;
    let underline = false;
    let buf = "";
    let i = 0;
    const src = String(text);
    while (i < src.length) {
        if (src.startsWith("***", i)) {
            if (bold && italic) {
                buf = flush(spans, buf, bold, italic, underline);
                bold = false;
                italic = false;
                i += 3;
                continue;
            }
            if (!bold && !italic && closerAt(src, i + 3, "***")) {
                buf = flush(spans, buf, bold, italic, underline);
                bold = true;
                italic = true;
                i += 3;
                continue;
            }
            if (bold && !italic) {
                buf = flush(spans, buf, bold, italic, underline);
                bold = false;
                i += 2;
                continue;
            }
            if (italic && !bold) {
                buf = flush(spans, buf, bold, italic, underline);
                italic = false;
                i += 1;
                continue;
            }
        }
        if (src.startsWith("__", i)) {
            if (underline || closerAt(src, i + 2, "__")) {
                buf = flush(spans, buf, bold, italic, underline);
                underline = !underline;
                i += 2;
                continue;
            }
        }
        if (src.startsWith("**", i)) {
            if (bold || closerAt(src, i + 2, "**")) {
                buf = flush(spans, buf, bold, italic, underline);
                bold = !bold;
                i += 2;
                continue;
            }
        }
        if (src[i] === "*" && !src.startsWith("**", i)) {
            if (italic || closerAt(src, i + 1, "*")) {
                buf = flush(spans, buf, bold, italic, underline);
                italic = !italic;
                i += 1;
                continue;
            }
        }
        buf += src[i];
        i += 1;
    }
    if (buf)
        spans.push({ text: buf, bold, italic, underline });
    return spans.length ? spans : [{ text: "", bold: false, italic: false, underline: false }];
}
export function stripMarkdown(text) {
    return parseMarkdown(text).map((span) => span.text).join("");
}
export function spanFont(span, size, family) {
    return cssFont(span.bold ? "700" : "400", size, family, span.italic);
}
export function measureSpans(ctx, spans, size, family) {
    let width = 0;
    for (const span of spans) {
        ctx.font = spanFont(span, size, family);
        width += ctx.measureText(span.text).width;
    }
    return width;
}
export function measureMarkdown(ctx, text, size, family) {
    return measureSpans(ctx, parseMarkdown(text), size, family);
}
function trimSpans(spans) {
    const copy = spans.map((span) => ({ ...span }));
    while (copy.length && copy[0].text.trim() === "")
        copy.shift();
    while (copy.length && copy[copy.length - 1].text.trim() === "")
        copy.pop();
    return copy;
}
/** Wrap on the stripped/styled copy so markers do not consume width. */
export function wrapMarkdown(ctx, text, maxWidth, size, family) {
    const lines = [];
    for (const paragraph of String(text).split("\n")) {
        if (paragraph === "") {
            lines.push([]);
            continue;
        }
        const tokens = [];
        for (const span of parseMarkdown(paragraph)) {
            const parts = span.text.split(/(\s+)/);
            for (const part of parts) {
                if (part)
                    tokens.push({ ...span, text: part });
            }
        }
        let current = [];
        let currentWidth = 0;
        for (const token of tokens) {
            const width = measureSpans(ctx, [token], size, family);
            const isSpace = /^\s+$/.test(token.text);
            if (!isSpace && currentWidth + width > maxWidth && current.length) {
                lines.push(trimSpans(current));
                current = [];
                currentWidth = 0;
            }
            current.push(token);
            currentWidth += current.length === 1 && isSpace ? 0 : width;
        }
        if (current.length)
            lines.push(trimSpans(current));
        else if (!tokens.length)
            lines.push([]);
    }
    return lines;
}
export function markdownPlainLines(ctx, text, maxWidth, size, family) {
    return wrapMarkdown(ctx, text, maxWidth, size, family).map((line) => line.map((span) => span.text).join(""));
}
//# sourceMappingURL=markdown.js.map