import type { CliRuntime } from "../runtime.js";
import { type FfmpegToolchain, type MediaProbe } from "./ffmpeg.js";
import { type ProgressReporter } from "./progress.js";
/**
 * Delivery targets for signage and kiosk playback.
 *
 * Both dimensions are bounded by MAX_EDGE, so a portrait source is capped the
 * same way a landscape source is. Aspect ratio is preserved and sources smaller
 * than the bound are never upscaled.
 */
export declare const MAX_EDGE = 3840;
export declare const DEFAULT_MAX_FPS = 30;
export declare const DEFAULT_WEBP_QUALITY = 90;
export type TranscodeCodec = "hevc" | "h264";
export interface TranscodeOptions {
    codec: TranscodeCodec;
    maxFps: number;
    webpQuality: number;
    maxEdge: number;
}
/**
 * H.264 High is the default because ScreenRig stores exactly one rendition per
 * media object and the layout contract carries no codec parameter, so there is
 * no per-client fallback. A browser that cannot decode H.265 does not fall back
 * to anything; it stalls. H.265 stays available through `--codec hevc` for
 * fleets known to be native-only.
 */
export declare const DEFAULT_CODEC: TranscodeCodec;
export declare function defaultTranscodeOptions(): TranscodeOptions;
export type SourceKind = "video" | "image";
export declare function classifySource(filePath: string, explicitContentType?: string): SourceKind;
export interface TranscodeResult {
    /** Absolute path to the bytes that should be uploaded. */
    filePath: string;
    /** Upload filename, which keeps the source stem and takes the target extension. */
    filename: string;
    contentType: "video/mp4" | "image/webp";
    /** True when the source already met the target and was passed through unchanged. */
    passthrough: boolean;
    reason: string;
    stage: SourceKind;
    sourceBytes: number;
    outputBytes: number;
    durationMs: number;
    width: number;
    height: number;
    /** True when width/height were read back from the produced file. */
    dimensionsMeasured: boolean;
    warnings: string[];
    /** Directory the caller must remove once the upload completes. */
    cleanupDir?: string;
}
export interface TranscodeRequest {
    runtime: CliRuntime;
    filePath: string;
    explicitContentType?: string;
    options: TranscodeOptions;
    reporter?: ProgressReporter;
}
export declare function transcodeForUpload(request: TranscodeRequest): Promise<TranscodeResult>;
/** Fit within a maxEdge x maxEdge box, preserving aspect and never upscaling. */
export declare function boundedSize(width: number, height: number, maxEdge: number): {
    width: number;
    height: number;
};
/**
 * Image bound used when cwebp is given exact pixel sizes. Unlike `boundedSize`,
 * this does not snap to even values: stills have no 4:2:0 chroma constraint.
 */
export declare function boundedImageSize(width: number, height: number, maxEdge: number): {
    width: number;
    height: number;
};
export declare function hasWebpEncoder(toolchain: FfmpegToolchain, animated: boolean): boolean;
export declare function boundedScaleFilter(maxEdge: number): string;
export declare function isHdr(probe: MediaProbe): boolean;
/**
 * HDR sources are tone mapped down to Rec. 709 so a signage panel does not show
 * a washed-out picture. zscale and tonemap come from libzimg, which some ffmpeg
 * builds omit; without them the CLI falls back to a plain conversion and warns.
 */
export declare function videoFilterChain(toolchain: FfmpegToolchain, probe: MediaProbe, maxEdge: number): {
    filter: string;
    warnings: string[];
};
export declare function encodeTiming(probe: MediaProbe, maxFps: number): {
    rate: string;
    gop: number;
};
/** An input is animated when it carries more than one frame with a timeline. */
export declare function isAnimated(probe: MediaProbe): boolean;
/** Keep the last few ffmpeg diagnostic lines, redacted and length bounded. */
export declare function summarizeFfmpegError(stderrTail: string): string;
//# sourceMappingURL=transcode.d.ts.map