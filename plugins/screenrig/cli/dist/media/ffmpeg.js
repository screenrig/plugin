import { usageError } from "../problems.js";
import { redactText } from "../redact.js";
const INSTALL_HINT = "Install ffmpeg 6.0 or newer and make ffmpeg and ffprobe reachable on PATH, " +
    "or set SCREENRIG_FFMPEG and SCREENRIG_FFPROBE to their absolute paths.";
const VERSION_TIMEOUT_MS = 15_000;
/** Where the CLI will look for the toolchain, without running anything. */
export function ffmpegLookup(env) {
    const ffmpegEnv = trimmed(env.SCREENRIG_FFMPEG);
    const ffprobeEnv = trimmed(env.SCREENRIG_FFPROBE);
    return {
        ffmpeg: ffmpegEnv ?? "ffmpeg",
        ffprobe: ffprobeEnv ?? "ffprobe",
        ffmpegFromEnv: ffmpegEnv !== undefined,
        ffprobeFromEnv: ffprobeEnv !== undefined,
    };
}
function trimmed(value) {
    const text = value?.trim();
    return text && text.length > 0 ? text : undefined;
}
export function runProcessFor(runtime) {
    const run = runtime.runProcess;
    if (!run) {
        throw usageError("This runtime cannot start the ffmpeg toolchain.");
    }
    return run;
}
function missingToolError(binary, result) {
    const reason = result.spawnError
        ? redactText(result.spawnError)
        : result.timedOut
            ? "the version probe timed out"
            : `it exited with status ${result.code ?? "unknown"}`;
    throw usageError(`Cannot run ${binary}: ${reason}. ${INSTALL_HINT}`, {
        command: "screenrig doctor",
        reason: "Report which part of the required ffmpeg toolchain is missing or unusable.",
    });
}
function parseVersion(output) {
    const match = /^ff(?:mpeg|probe) version (\S+)/m.exec(output);
    return match?.[1] ?? "unknown";
}
/** Rows look like " V....D libx265   libx265 H.265 / HEVC (codec hevc)". */
export function parseEncoderNames(output) {
    const names = new Set();
    for (const line of output.split("\n")) {
        const match = /^\s[A-Za-z.]{6}\s+([A-Za-z0-9_.-]+)\s+\S/.exec(line);
        const name = match?.[1];
        if (name && name !== "=") {
            names.add(name);
        }
    }
    return names;
}
/**
 * Rows look like " .S zscale   V->V   Apply resizing...". The flag column width
 * has changed between ffmpeg releases, so the stable anchor is the "V->V"
 * signature rather than a fixed number of leading flag characters.
 */
export function parseFilterNames(output) {
    const names = new Set();
    for (const line of output.split("\n")) {
        const match = /^\s*\S{2,4}\s+([A-Za-z0-9_]+)\s+[AVN|]+(?:->|→)[AVN|]+/.exec(line);
        const name = match?.[1];
        if (name) {
            names.add(name);
        }
    }
    return names;
}
let cached;
/** Test seam: forget the memoized toolchain probe. */
export function resetFfmpegToolchainCache() {
    cached = undefined;
}
export async function resolveFfmpegToolchain(runtime) {
    cached ??= probeToolchain(runtime);
    try {
        return await cached;
    }
    catch (error) {
        cached = undefined;
        throw error;
    }
}
async function probeToolchain(runtime) {
    const run = runProcessFor(runtime);
    const lookup = ffmpegLookup(runtime.env);
    const ffmpegVersionResult = await run({
        command: lookup.ffmpeg,
        args: ["-hide_banner", "-version"],
        timeoutMs: VERSION_TIMEOUT_MS,
    });
    if (ffmpegVersionResult.spawnError || ffmpegVersionResult.code !== 0) {
        missingToolError(lookup.ffmpeg, ffmpegVersionResult);
    }
    const ffprobeVersionResult = await run({
        command: lookup.ffprobe,
        args: ["-hide_banner", "-version"],
        timeoutMs: VERSION_TIMEOUT_MS,
    });
    if (ffprobeVersionResult.spawnError || ffprobeVersionResult.code !== 0) {
        missingToolError(lookup.ffprobe, ffprobeVersionResult);
    }
    // A build that answered -version but cannot list its own capabilities is
    // unusable. Failing here keeps the diagnosis honest, because an empty
    // capability set would otherwise be reported as "no libx265 encoder".
    const encodersResult = await run({
        command: lookup.ffmpeg,
        args: ["-hide_banner", "-encoders"],
        timeoutMs: VERSION_TIMEOUT_MS,
    });
    if (encodersResult.spawnError || encodersResult.code !== 0) {
        missingToolError(lookup.ffmpeg, encodersResult);
    }
    const filtersResult = await run({
        command: lookup.ffmpeg,
        args: ["-hide_banner", "-filters"],
        timeoutMs: VERSION_TIMEOUT_MS,
    });
    if (filtersResult.spawnError || filtersResult.code !== 0) {
        missingToolError(lookup.ffmpeg, filtersResult);
    }
    return {
        ffmpeg: lookup.ffmpeg,
        ffprobe: lookup.ffprobe,
        ffmpegVersion: parseVersion(ffmpegVersionResult.stdout),
        ffprobeVersion: parseVersion(ffprobeVersionResult.stdout),
        encoders: parseEncoderNames(encodersResult.stdout),
        filters: parseFilterNames(filtersResult.stdout),
    };
}
const ALPHA_PIXEL_MARKERS = ["rgba", "bgra", "argb", "abgr", "yuva", "gbrap", "pal8"];
export function pixelFormatHasAlpha(pixelFormat) {
    if (pixelFormat.length === 0) {
        return false;
    }
    if (/^ya\d/.test(pixelFormat)) {
        return true;
    }
    return ALPHA_PIXEL_MARKERS.some((marker) => pixelFormat.includes(marker));
}
export function parseProbePayload(raw) {
    let payload;
    try {
        payload = JSON.parse(raw);
    }
    catch {
        throw usageError("ffprobe returned output the CLI could not parse.");
    }
    const streams = payload.streams ?? [];
    const video = streams.find((stream) => stream.codec_type === "video");
    const audio = streams.find((stream) => stream.codec_type === "audio");
    const codedWidth = video?.width ?? 0;
    const codedHeight = video?.height ?? 0;
    const rotationDegrees = normalizeRotation(video);
    const swapped = rotationDegrees === 90 || rotationDegrees === 270;
    const fps = parseRate(video?.avg_frame_rate) || parseRate(video?.r_frame_rate);
    const frameCount = Number.parseInt(video?.nb_frames ?? "", 10);
    const duration = Number.parseFloat(payload.format?.duration ?? "") || Number.parseFloat(video?.duration ?? "") || 0;
    const pixelFormat = normalizeField(video?.pix_fmt);
    return {
        hasVideo: video !== undefined && codedWidth > 0 && codedHeight > 0,
        hasAudio: audio !== undefined,
        codec: normalizeField(video?.codec_name),
        formatNames: (payload.format?.format_name ?? "").split(",").filter((name) => name.length > 0),
        pixelFormat,
        codedWidth,
        codedHeight,
        displayWidth: swapped ? codedHeight : codedWidth,
        displayHeight: swapped ? codedWidth : codedHeight,
        rotationDegrees,
        fps: Number.isFinite(fps) ? fps : 0,
        frameCount: Number.isInteger(frameCount) && frameCount > 0 ? frameCount : 0,
        durationSeconds: Number.isFinite(duration) && duration > 0 ? duration : 0,
        colorTransfer: normalizeField(video?.color_transfer),
        colorPrimaries: normalizeField(video?.color_primaries),
        colorSpace: normalizeField(video?.color_space),
        hasAlpha: pixelFormatHasAlpha(pixelFormat),
    };
}
function normalizeRotation(video) {
    const fromSideData = video?.side_data_list?.find((entry) => typeof entry.rotation === "number")?.rotation;
    const fromTag = Number.parseFloat(video?.tags?.rotate ?? "");
    const raw = typeof fromSideData === "number" ? fromSideData : fromTag;
    if (!Number.isFinite(raw)) {
        return 0;
    }
    const normalized = ((Math.round(raw) % 360) + 360) % 360;
    return normalized === 90 || normalized === 180 || normalized === 270 ? normalized : 0;
}
function normalizeField(value) {
    const text = (value ?? "").trim().toLowerCase();
    return text === "unknown" || text === "n/a" ? "" : text;
}
export function parseRate(rate) {
    if (!rate) {
        return 0;
    }
    const [numerator, denominator] = rate.split("/", 2);
    const num = Number.parseFloat(numerator ?? "");
    if (!Number.isFinite(num)) {
        return 0;
    }
    if (denominator === undefined) {
        return num;
    }
    const den = Number.parseFloat(denominator);
    return Number.isFinite(den) && den !== 0 ? num / den : 0;
}
export async function probeMedia(runtime, toolchain, filePath) {
    const run = runProcessFor(runtime);
    const result = await run({
        command: toolchain.ffprobe,
        args: [
            "-v", "quiet",
            "-print_format", "json",
            "-show_streams",
            "-show_format",
            filePath,
        ],
        timeoutMs: 120_000,
    });
    if (result.spawnError || result.code !== 0) {
        throw usageError(`ffprobe could not read the media file: ${result.spawnError ? redactText(result.spawnError) : `exit status ${result.code ?? "unknown"}`}.`);
    }
    return parseProbePayload(result.stdout);
}
//# sourceMappingURL=ffmpeg.js.map