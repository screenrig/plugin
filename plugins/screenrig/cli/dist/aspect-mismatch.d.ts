import type { Warning } from "./envelope.js";
export declare const ASPECT_MISMATCH_CODE = "aspect_mismatch";
/**
 * Warn when server-resolved playlist media has the opposite orientation from
 * the player's last reported playback surface. Incomplete or malformed data is
 * deliberately treated as unknown: assignment remains authoritative on the
 * server and this advisory must never block it.
 */
export declare function aspectMismatchWarnings(screenId: string, screenValue: unknown, playlistValue: unknown): Warning[];
//# sourceMappingURL=aspect-mismatch.d.ts.map