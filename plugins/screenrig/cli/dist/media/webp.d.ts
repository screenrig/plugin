/**
 * Minimal WebP container reader.
 *
 * ffmpeg cannot demux animated WebP, so ffprobe reports no stream for those
 * files. The CLI still has to know whether such a source is a real WebP and
 * whether its canvas already fits the delivery bound, which the RIFF header
 * answers without decoding any pixels.
 */
export interface WebpContainer {
    animated: boolean;
    /** Zero when the chunk that carries the canvas size is absent. */
    width: number;
    height: number;
}
export declare function readWebpContainer(bytes: Buffer): WebpContainer | undefined;
//# sourceMappingURL=webp.d.ts.map