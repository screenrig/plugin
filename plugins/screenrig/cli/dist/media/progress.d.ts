import type { Writable } from "node:stream";
export type ProgressStage = "video" | "image";
export interface ProgressStart {
    stage: ProgressStage;
    /** Short description of the target, for example "H.265 MP4". */
    target: string;
    sourceBytes: number;
    /** Zero when the source has no timeline, such as a still image. */
    durationSeconds: number;
    width: number;
    height: number;
}
export interface ProgressFinish {
    outputBytes: number;
    elapsedMs: number;
}
/**
 * Progress is written to stderr only. Stdout stays reserved for the single
 * result envelope so an agent can parse it without stripping progress noise.
 */
export interface ProgressReporter {
    start(info: ProgressStart): void;
    /** fraction is clamped to 0..1 by the reporter. */
    update(fraction: number): void;
    finish(info: ProgressFinish): void;
    failed(): void;
}
export interface ProgressOptions {
    stderr: Writable;
    /** Machine-readable JSON lines instead of human text. */
    json: boolean;
    /** Redraw a single line in place instead of appending lines. */
    tty: boolean;
    now: () => number;
    /** Minimum gap between emitted updates. */
    throttleMs?: number;
    /** Minimum percentage-point change between emitted non-TTY updates. */
    stepPercent?: number;
}
export declare function silentProgressReporter(): ProgressReporter;
export declare function formatClock(totalSeconds: number): string;
export declare function formatBytes(bytes: number): string;
export declare function createProgressReporter(options: ProgressOptions): ProgressReporter;
//# sourceMappingURL=progress.d.ts.map