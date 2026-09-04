/**
 * Lookup segment of a credential, for internal correlation only. A redacted
 * credential never carries it: the segment identifies the live token, so
 * printing it hands an observer a usable half of the secret.
 */
export declare function tokenLookupId(token: string): string | undefined;
/** What a live credential looks like once redacted: the shape, and nothing else. */
export declare const REDACTED_TOKEN = "sr_live_***";
export declare function isSensitiveKey(key: string): boolean;
export declare function isSensitiveValue(value: string): boolean;
export declare function redactText(value: string): string;
export declare function redactValue(value: unknown): unknown;
/** Omit sensitive keys and credential-shaped values; redact remaining strings. */
export declare function redactEvent(value: unknown): unknown;
//# sourceMappingURL=redact.d.ts.map