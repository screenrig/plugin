/** 128 bits of CSPRNG entropy, encoded URL-safe without padding (22 chars). */
export declare const ENTROPY_BYTES = 16;
export declare function randomUrlSafe128(): string;
export declare function randomPrefixedId(prefix: string, bytes?: number): string;
export declare function newRequestId(): string;
export declare function newIdempotencyKey(): string;
export declare function isValidRequestId(value: string): boolean;
export declare function isValidIdempotencyKey(value: string): boolean;
export declare function requestIdEntropyBytes(value: string): number;
//# sourceMappingURL=ids.d.ts.map