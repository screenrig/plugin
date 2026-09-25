import type { Screen, ScreenHealth } from "./adapters/protocol.js";
/** Backend hysteresis start (hot at or above 80 °C) and the crash count that reads as crashing. */
export declare const HEALTH_HOT_C = 80;
export declare const HEALTH_CRASHING_24H = 3;
/**
 * The problems `screen list` flags: a disconnected display, a hot device
 * (80 °C or more), crashing (3 or more crashes in 24 hours), or a stale report.
 */
export declare function healthIssues(health: ScreenHealth | undefined): string[];
export declare function screenHealthIssues(screen: Screen | undefined): string[];
/** The compact `Health` block of `screen show --human`; nothing when the Player never reported. */
export declare function healthLines(health: ScreenHealth | undefined): string[];
/**
 * screen.health_changed details.changes as one logfmt value:
 * `display_disconnected,display_power from=on to=standby,temperature_high temperature_c=82`.
 */
export declare function healthChangesText(changes: unknown): string | undefined;
//# sourceMappingURL=screen-health.d.ts.map