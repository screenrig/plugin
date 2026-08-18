/**
 * CLI-private conservative advance table for bundled `sans` (Inter) at
 * weights 400 and 700. Values are thousandths of an em and overestimate the
 * real glyph so author-time fit undersizes rather than clips. Players never
 * read this table; they paint the ordinary `font_size` the expander emits.
 *
 * Inter line-box: unitsPerEm 2048, typoAscender 1984, typoDescender -494.
 * Natural height is font_size * 2478 / 2048. Half-leading below that clips
 * descenders under no-overflow.
 */
export declare const SANS_UNITS_PER_EM = 2048;
export declare const SANS_TYPO_ASCENDER = 1984;
export declare const SANS_TYPO_DESCENDER = 494;
export declare const SANS_LINE_BOX: number;
export declare function minSansLineHeight(fontSize: number): number;
export declare function measureSansLineWidth(text: string, fontSize: number, weight: 400 | 700): number;
export declare function longestSansLineWidth(lines: readonly string[], fontSize: number, weight: 400 | 700): number;
//# sourceMappingURL=sans-advance.d.ts.map