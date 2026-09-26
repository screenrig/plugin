import type { Screen, ScreenDisplay, ScreenScheduleWindow } from "./adapters/protocol.js";
/**
 * Reboot and display power (backend "Reboot and display power",
 * docs/player-compatibility.md §6.5). Local checks mirror ScreenDisplayWrite
 * and ScreenDisplayScheduleWrite; the server stays authoritative.
 */
export declare const DISPLAY_WINDOWS_MAX = 16;
/**
 * Accept ScreenDisplayScheduleWrite `{enabled, windows}`, or a saved
 * `screen display-schedule show` envelope / view (its display_schedule is
 * unwrapped and updated_at dropped) so show output can be edited and sent back.
 */
export declare function displayScheduleWrite(document: unknown): {
    enabled: boolean;
    windows: ScreenScheduleWindow[];
};
/** `on`/`off` from --power, or a trailing positional on|off. */
export declare function displayPower(value: string | undefined): "on" | "off";
/** --until RFC 3339 (normalized to UTC) or --for DURATION; undefined = until the schedule's next boundary, else until replaced. */
export declare function displayUntil(until: string | undefined, forValue: string | undefined, now: Date): string | undefined;
export declare function untilOption(value: string): string;
/** `Display:` lines for screen show --human; nothing when the screen has no display state. */
export declare function displayLines(display: ScreenDisplay | undefined, timezone: string | undefined): string[];
export declare function hostDeclaresReboot(screen: Screen | undefined): boolean;
/** 409 reboot_unsupported, explained: the Player must declare the reboot capability. */
export declare function rebootProblem(error: unknown, id: string): unknown;
/** Display override refusals: a pending screen has no paired Player yet; an archived one must be unarchived. */
export declare function displayProblem(error: unknown, id: string): unknown;
//# sourceMappingURL=screen-display.d.ts.map