export declare function posixNormalize(relativePath: string): string;
export declare function caseFold(relativePath: string): string;
export declare function hasTraversal(relativePath: string): boolean;
export declare function pathDepth(relativePath: string): number;
export declare function utf8Bytes(value: string): number;
export declare function hasIllegalChars(relativePath: string): boolean;
/**
 * gitignore-inspired matcher for `.screenrigignore`.
 * Built-in rules are applied separately and cannot be negated.
 */
export declare function compileIgnore(patterns: string[]): (posixPath: string, isDir: boolean) => boolean;
export declare const BUILTIN_IGNORE_PATTERNS: string[];
export declare function isDotComponentPath(posixPath: string): boolean;
export declare function isBuiltinIgnored(posixPath: string, isDir: boolean): boolean;
export declare function toPosixRelative(root: string, absolute: string): string;
//# sourceMappingURL=paths.d.ts.map