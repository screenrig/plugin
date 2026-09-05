export declare const FONT_FALLBACKS: readonly ["Helvetica Neue", "Helvetica", "Arial", "DejaVu Sans", "Liberation Sans"];
export declare function loadUserFonts(): void;
export declare function resolveFontFamily(name: string | undefined): string;
interface TextFontResolution {
    family: string;
    fallback_from?: string;
    missing_codepoints: string[];
}
/** Napi can silently paint .notdef even with a CSS fallback list. Detect that
 * raster at the requested weight and select a measured fallback for this Text.
 * This is a missing-glyph check, not a promise of language shaping correctness. */
export declare function resolveTextFont(text: string, family: string, weight: string): TextFontResolution;
export {};
//# sourceMappingURL=fonts.d.ts.map