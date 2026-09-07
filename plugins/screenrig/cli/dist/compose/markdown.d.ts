import type { SKRSContext2D } from "@napi-rs/canvas";
export interface MarkdownSpan {
    text: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
}
/** Left-to-right `**bold**`, `*italic*`, `__underline__`, and `***bold italic***`. Unmatched markers stay literal. */
export declare function parseMarkdown(text: string): MarkdownSpan[];
export declare function stripMarkdown(text: string): string;
export declare function spanFont(span: MarkdownSpan, size: number, family: string): string;
export declare function measureSpans(ctx: SKRSContext2D, spans: MarkdownSpan[], size: number, family: string): number;
export declare function measureMarkdown(ctx: SKRSContext2D, text: string, size: number, family: string): number;
/** Wrap on the stripped/styled copy so markers do not consume width. */
export declare function wrapMarkdown(ctx: SKRSContext2D, text: string, maxWidth: number, size: number, family: string): MarkdownSpan[][];
export declare function markdownPlainLines(ctx: SKRSContext2D, text: string, maxWidth: number, size: number, family: string): string[];
//# sourceMappingURL=markdown.d.ts.map