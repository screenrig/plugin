import type { CliRuntime, RunProcess } from "../runtime.js";
/** Resolved external media toolchain plus the capabilities the planner needs. */
export interface FfmpegToolchain {
    ffmpeg: string;
    ffprobe: string;
    ffmpegVersion: string;
    ffprobeVersion: string;
    encoders: ReadonlySet<string>;
    filters: ReadonlySet<string>;
}
export interface FfmpegLookup {
    ffmpeg: string;
    ffprobe: string;
    ffmpegFromEnv: boolean;
    ffprobeFromEnv: boolean;
}
/** Where the CLI will look for the toolchain, without running anything. */
export declare function ffmpegLookup(env: NodeJS.Dict<string>): FfmpegLookup;
export declare function runProcessFor(runtime: CliRuntime): RunProcess;
/** Rows look like " V....D libx265   libx265 H.265 / HEVC (codec hevc)". */
export declare function parseEncoderNames(output: string): Set<string>;
/**
 * Rows look like " .S zscale   V->V   Apply resizing...". The flag column width
 * has changed between ffmpeg releases, so the stable anchor is the "V->V"
 * signature rather than a fixed number of leading flag characters.
 */
export declare function parseFilterNames(output: string): Set<string>;
/** Test seam: forget the memoized toolchain probe. */
export declare function resetFfmpegToolchainCache(): void;
export declare function resolveFfmpegToolchain(runtime: CliRuntime): Promise<FfmpegToolchain>;
/** The single video stream and container facts the transcode planner uses. */
export interface MediaProbe {
    hasVideo: boolean;
    hasAudio: boolean;
    codec: string;
    formatNames: readonly string[];
    pixelFormat: string;
    /** Coded dimensions, before any display-matrix rotation. */
    codedWidth: number;
    codedHeight: number;
    /** Dimensions after display-matrix rotation, which is what ffmpeg filters see. */
    displayWidth: number;
    displayHeight: number;
    rotationDegrees: number;
    fps: number;
    frameCount: number;
    durationSeconds: number;
    colorTransfer: string;
    colorPrimaries: string;
    colorSpace: string;
    hasAlpha: boolean;
}
export declare function pixelFormatHasAlpha(pixelFormat: string): boolean;
export declare function parseProbePayload(raw: string): MediaProbe;
export declare function parseRate(rate: string | undefined): number;
export declare function probeMedia(runtime: CliRuntime, toolchain: FfmpegToolchain, filePath: string): Promise<MediaProbe>;
//# sourceMappingURL=ffmpeg.d.ts.map