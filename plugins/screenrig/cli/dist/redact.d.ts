export declare function tokenLookupId(token: string): string | undefined;
export declare function redactToken(token: string): string;
export declare function isSensitiveKey(key: string): boolean;
export declare function isSensitiveValue(value: string): boolean;
export declare function redactText(value: string): string;
export declare function redactValue(value: unknown): unknown;
/** Omit sensitive keys and credential-shaped values; redact remaining strings. */
export declare function redactEvent(value: unknown): unknown;
//# sourceMappingURL=redact.d.ts.map