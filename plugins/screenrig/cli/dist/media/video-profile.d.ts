import type { MediaProbe } from "./ffmpeg.js";
export type SignagePreset = "signage-1080p30" | "signage-4k30";
export interface VideoOptions {
    codec: "h264" | "hevc";
    maxFps: number;
    maxEdge: number;
    preset?: SignagePreset;
    noAudio?: boolean;
}
export interface VideoDelivery {
    width: number;
    height: number;
    fps: number;
    level: string;
    levelId: number;
    audio: boolean;
}
export declare const MAX_VIDEO_PIXELS: number;
export declare function videoBounds(options: VideoOptions): {
    longEdge: number;
    shortEdge: number;
    pixels: number;
    fps: number;
};
/** Preserve orientation/aspect; bound both axes and total pixels before encoding. */
export declare function boundedVideoSize(width: number, height: number, options: VideoOptions): {
    width: number;
    height: number;
};
export declare function videoLevel(codec: VideoOptions["codec"], width: number, height: number, fps: number): {
    level: string;
    levelId: number;
};
export declare function planVideoDelivery(probe: MediaProbe, options: VideoOptions): VideoDelivery;
/** Check facts available in ffprobe; this is not a peak-bitrate or device certification. */
export declare function validateVideoOutput(probe: MediaProbe, delivery: VideoDelivery, options: VideoOptions): void;
//# sourceMappingURL=video-profile.d.ts.map