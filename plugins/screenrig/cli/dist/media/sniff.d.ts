/**
 * Container sniffing for `media upload`.
 *
 * `--content-type` is the operator's claim about the source. The bytes are the
 * fact. When the two disagree the CLI must refuse before ffmpeg runs and before
 * any declare, because ffmpeg happily re-encodes a PNG "declared" as
 * `video/mp4` into a one-frame MP4 and uploads it (UAT R1-029).
 *
 * Only the magic numbers of common signage sources are recognized. An
 * unrecognized head is not a mismatch: extension and probe decide as before.
 */
export interface SniffedMedia {
    /** Canonical declared type this container corresponds to, for comparison. */
    contentType: string;
    /** Human description used in the mismatch message. */
    description: string;
    kind: "image" | "video";
}
/** Bytes needed to classify every signature below. */
export declare const SNIFF_HEAD_BYTES = 64;
export declare function sniffMediaContainer(input: Uint8Array): SniffedMedia | undefined;
/** Read only the head of the file; the upload path snapshots the whole file later. */
export declare function readMediaHead(filePath: string): Promise<Buffer>;
/**
 * Refuse a declared `--content-type` the bytes contradict. Runs before any
 * transcode or declare so nothing is encoded or uploaded under the wrong type.
 * A file the sniffer does not recognize is left to extension and ffprobe.
 */
export declare function assertDeclaredTypeMatchesBytes(filePath: string, declaredContentType: string | undefined): Promise<void>;
//# sourceMappingURL=sniff.d.ts.map