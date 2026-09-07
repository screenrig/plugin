export declare const FONT_FALLBACKS: readonly ["Helvetica Neue", "Helvetica", "Arial", "DejaVu Sans", "Liberation Sans"];
export declare function loadUserFonts(): void;
export declare function resolveFontFamily(name: string | undefined): string;
export declare function cssFont(weight: string, size: number, family: string, italic?: boolean): string;
export declare function familyHasFace(family: string, weight: number, italic: boolean): boolean;
export declare function isSyntheticFace(family: string, weight: string, italic: boolean): boolean;
interface TextFontResolution {
    family: string;
    fallback_from?: string;
    missing_codepoints: string[];
}
export declare function familyRendersText(family: string, text: string, weight: string): boolean;
/** Napi can silently paint .notdef even with a CSS fallback list. Detect that
 * raster at the requested weight and select a measured fallback for this Text.
 * This is a missing-glyph check, not a promise of language shaping correctness. */
export declare function resolveTextFont(text: string, family: string, weight: string): TextFontResolution;
export {};
//# sourceMappingURL=fonts.d.ts.map