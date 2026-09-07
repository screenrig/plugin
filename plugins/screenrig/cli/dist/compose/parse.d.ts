import { REGIONS, type ComposeDocument } from "./types.js";
export { REGIONS };
/** Page background RGB with alpha B3 (70% opaque). `#0D0D0D` → `#0D0D0DB3`. */
export declare function defaultCardFill(background: string): string;
export declare function regionRect(name: string, width: number, height: number): {
    x: number;
    y: number;
    w: number;
    h: number;
} | null;
export declare function parseComposeSpec(source: unknown): ComposeDocument;
//# sourceMappingURL=parse.d.ts.map