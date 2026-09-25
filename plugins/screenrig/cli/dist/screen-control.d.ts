import type { ScreenEffectivePlaylist, ScreenScheduleEntry, ScreenScheduleEntryWrite, ScreenTakeover } from "./adapters/protocol.js";
/**
 * Playlist schedules and takeover (backend "Playlist schedules and takeover").
 * Local checks mirror ScreenPlaylistScheduleWrite / ScreenTakeoverWrite shape
 * rules so a malformed file fails fast with a path; the server stays
 * authoritative for everything else (ownership, readiness, timezone, ranges).
 */
export declare const SCHEDULE_ENTRIES_MAX = 32;
export declare const SCHEDULE_WINDOWS_MAX = 16;
export declare const TAKEOVER_REASON_MAX = 120;
export declare const TAKEOVER_MAX_MS: number;
/**
 * Accept `{ "entries": [...] }` (ScreenPlaylistScheduleWrite) or a bare entry
 * array. `updated_at` and `effective_playlist` are dropped, and a saved
 * `screen schedule show` envelope is unwrapped, so its output can be edited
 * and sent back.
 */
export declare function scheduleEntries(document: unknown): ScreenScheduleEntryWrite[];
/**
 * `--for` is converted with this computer's clock and the server refuses an
 * until more than 7 days ahead of its clock, so keep a minute of headroom.
 */
export declare const TAKEOVER_FOR_MAX_MS: number;
/** `2h`, `30m`, `1h30m`, `2d`, `90s`: whole units, up to 7 days (at most 6d23h59m). */
export declare function durationMs(value: string): number;
export declare function durationOption(value: string): string;
/**
 * Strict RFC 3339 with seconds and an offset (uppercase T and Z), normalized
 * to UTC `YYYY-MM-DDTHH:MM:SS[.mmm]Z` so the request never depends on how the
 * input was spelled.
 */
export declare function normalizeInstant(value: string): string | undefined;
/** `--until RFC3339` or `--until none` (held until cleared). */
export declare function takeoverUntilOption(value: string): string;
/** undefined = omitted (held until cleared), null = explicit none. */
export declare function takeoverUntil(until: string | undefined, forValue: string | undefined, now: Date): string | null | undefined;
/** Trimmed; at most 120 characters; no Unicode control characters. */
export declare function takeoverReason(value: string): string;
/**
 * An instant shown in the screen's timezone with the zone name, for example
 * `2026-08-14 10:30 America/Los_Angeles`. Without a usable zone, UTC labelled.
 */
export declare function instantInZone(value: string, timezone: string | undefined): string;
/** "pl_X (takeover until …)", "pl_X (schedule entry lunch until …)", "pl_X (default)". */
export declare function effectivePlaylistText(effective: ScreenEffectivePlaylist | undefined, takeover?: ScreenTakeover, timezone?: string): string | undefined;
export declare function playingLine(effective: ScreenEffectivePlaylist | undefined, takeover?: ScreenTakeover, timezone?: string): string[];
export declare function takeoverLine(takeover: ScreenTakeover | undefined, timezone?: string): string[];
export declare function scheduleTableLines(entries: ScreenScheduleEntry[] | undefined, timezone?: string | null): string[];
/** Guidance for schedule/takeover refusals on one screen. Exit codes stay status-derived. */
export declare function screenControlProblem(error: unknown, id: string): unknown;
/** A playlist delete refused because a screen can still show it. */
export declare function playlistInUseProblem(error: unknown): unknown;
/**
 * --for is converted with this computer's clock; when the server still
 * refuses the resulting until, its clock differs. Suggest a shorter --for.
 */
export declare function takeoverForProblem(error: unknown): unknown;
//# sourceMappingURL=screen-control.d.ts.map