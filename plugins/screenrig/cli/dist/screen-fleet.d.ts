import type { ParsedArgs } from "./command-input.js";
import type { Warning } from "./envelope.js";
import { ExitCode } from "./exit-codes.js";
import type { ScreenActionResult, ScreenActionSelector, ScreenActionType } from "./adapters/protocol.js";
/** Screen tags share the media tag grammar. */
export declare const SCREEN_TAG_PATTERN: RegExp;
export declare const SCREEN_TAGS_MAX = 16;
/** Server bound for both selector forms. */
export declare const FLEET_SCREENS_MAX = 500;
export type ScreenTarget = {
    kind: "single";
    id: string;
} | {
    kind: "fleet";
    selector: ScreenActionSelector;
};
export declare function screenTag(value: string, flag?: string): string;
/** A comma-separated tag list: each tag validated, no duplicates, at most 16. */
export declare function screenTagList(value: string, flag: string): string[];
/**
 * Resolve `<id>`, several `<id>`s, or `--tag TAG`. Exactly one screen id keeps
 * the single-screen route and its envelope; several ids or a tag select the
 * fleet actions route.
 */
export declare function screenTarget(args: ParsedArgs, command: string): ScreenTarget;
/** Revision guards are per screen; the fleet route has none. */
export declare function rejectFleetRevision(args: ParsedArgs, command: string): void;
/** Validate a POST /api/v1/screens/actions answer against the generated ScreenActionResult contract. */
export declare function screenActionResult(body: unknown, action: ScreenActionType): ScreenActionResult;
export interface FleetItem {
    screen_id: string;
    status: "ok" | "failed";
    problem?: {
        status?: number;
        code?: string;
    };
}
export interface FleetSummary<T extends FleetItem = FleetItem> {
    matched: number;
    succeeded: number;
    failed: number;
    results: T[];
}
/**
 * Partial success is a normal answer, so the envelope stays `ok: true` and
 * `data` carries every per-screen result. The exit code is 0 only when every
 * matched screen succeeded; otherwise it is the exit code the first failed
 * screen's problem would have produced on its single-screen route. For a
 * server answer that is derived from the problem status; a client-side
 * fan-out passes each failure's own CliError exit code through exitCodeOf.
 */
export declare function fleetOutcome<T extends FleetItem>(summary: FleetSummary<T>, exitCodeOf?: (item: T) => ExitCode | undefined): {
    exitCode: ExitCode;
    warnings: Warning[];
};
/** Human summary: one count line, then one row per screen in selector order. */
export declare function fleetHumanLines<T extends FleetItem>(title: string, summary: FleetSummary<T>, detail?: (item: T) => string | undefined): string;
//# sourceMappingURL=screen-fleet.d.ts.map