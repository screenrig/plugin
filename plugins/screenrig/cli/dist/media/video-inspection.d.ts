import type { CliRuntime } from "../runtime.js";
import { type FfmpegToolchain, type MediaProbe } from "./ffmpeg.js";
import { type VideoOptions } from "./video-profile.js";
interface PacketState {
    count: number;
    bytes: number;
    lastDts?: number;
    lastDuration?: number;
    bucket: number;
    pendingPts: number[];
    nextPts?: number;
}
/** Full packet traversal: bounded video/AAC rate envelopes and constant video cadence. */
export declare class VideoPacketInspection {
    private readonly probe;
    readonly video: PacketState;
    readonly audio: PacketState;
    private valid;
    private lines;
    constructor(probe: MediaProbe);
    line(line: string): boolean;
    private tolerance;
    private presentation;
    finish(): boolean;
}
/** Parse FFmpeg's trace_headers syntax summaries, never entropy-decode pictures. */
export declare class H264HeaderInspection {
    private readonly probe;
    packets: number;
    bytes: number;
    private valid;
    private lines;
    private section;
    private fields;
    private sps;
    private pps;
    private signature?;
    private packet?;
    private lastIdr;
    private bRun;
    constructor(probe: MediaProbe);
    line(line: string): boolean;
    private endSection;
    private endPacket;
    finish(): boolean;
}
export declare function inspectH264Passthrough(runtime: CliRuntime, toolchain: FfmpegToolchain, source: string, initialProbe: MediaProbe, options: VideoOptions): Promise<{
    filePath: string;
    cleanupDir: string;
    sha256: string;
    bytes: number;
    probe: MediaProbe;
} | undefined>;
export {};
//# sourceMappingURL=video-inspection.d.ts.map