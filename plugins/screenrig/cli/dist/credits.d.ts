import type { SuccessEnvelope, Warning } from "./envelope.js";
/** Whole prepaid credits. Remaining below this value is `credits_low`. */
export declare const CREDITS_LOW_THRESHOLD = 1000;
export declare const CREDITS_LOW_CODE = "credits_low";
export declare const CREDITS_REMAINING_HEADER = "screenrig-credits-remaining";
export declare function headerValue(headers: Record<string, string> | undefined, name: string): string | undefined;
/** Integer prepaid credits. Missing, negative, fractional, or unparseable values are absent. */
export declare function parseCreditsInteger(value: unknown): number | undefined;
export declare function parseCreditsRemainingHeader(headers: Record<string, string> | undefined): number | undefined;
export declare function creditsLowWarning(remaining: number | undefined): Warning | undefined;
export declare function creditsLowWarnings(remaining: number | undefined): Warning[];
export declare function observeCreditsRemaining(owner: object, remaining: number | undefined): void;
export declare function observedCreditsRemaining(owner: object): number | undefined;
export declare function applyCreditsLowToSuccess<T extends {
    envelope: SuccessEnvelope<unknown>;
    human: string;
}>(result: T, remaining: number | undefined): T;
//# sourceMappingURL=credits.d.ts.map