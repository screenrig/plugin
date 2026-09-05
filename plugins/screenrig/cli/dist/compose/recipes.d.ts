export declare const RECIPE_NAMES: readonly ["title", "split-image", "cards", "table", "overlay"];
export type RecipeName = typeof RECIPE_NAMES[number];
/** Recipes expand to ordinary measured Text/Row/Column nodes, never SVG text. */
export declare function expandComposeRecipe(input: unknown): unknown;
export declare function recipeExamples(): Record<RecipeName, unknown>;
//# sourceMappingURL=recipes.d.ts.map