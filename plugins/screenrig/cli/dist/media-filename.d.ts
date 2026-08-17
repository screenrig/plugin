/**
 * Advisory filename check for `media upload`. Independent of the transcode
 * pipeline: the name is the human-readable handle, whether or not ffmpeg runs.
 */
export declare const GENERIC_STEMS: readonly ["video", "movie", "clip", "output", "out", "untitled", "unnamed", "new", "temp", "tmp", "final", "export", "render", "download", "downloaded", "file", "media", "image", "img", "photo", "pic", "picture", "asset", "content", "sample", "test", "demo", "copy", "document", "recording", "screenshot", "screencast", "capture", "upload"];
export declare const NOISE_SUFFIXES: readonly ["copy", "final", "finished", "new", "edit", "edited", "export", "exported", "render", "rendered", "draft", "fixed", "updated", "revised", "compressed", "converted", "orig", "original", "backup", "bak"];
/**
 * Camera, phone, and screen-capture defaults. A match only counts when the
 * remainder after the prefix is empty or is only separators, digits, dates,
 * times, and the time-connector words in REMAINDER_TIME_WORDS.
 */
export declare const DEVICE_PREFIXES: readonly ["screen recording", "screen capture", "whatsapp video", "whatsapp image", "new project", "my movie", "screen shot", "screenshot", "screencast", "recording", "untitled", "document", "snapshot", "sequence", "capture", "signal", "record", "takes", "photo", "video", "movie", "clip", "frame", "scene", "take", "dscn", "dscf", "gopr", "img", "dsc", "vid", "mvi", "mov", "pxl", "dji", "wa", "gh", "gx"];
/** `P` + this many digits is a known camera default (`P1010001`). */
export declare const P_PREFIX_MIN_DIGITS = 7;
/** Allowed in a device-prefix remainder as part of a time phrase (`at 10.14.22`). */
export declare const REMAINDER_TIME_WORDS: readonly ["at"];
export declare function lowInformationFilenameWarning(filename: string): string | null;
//# sourceMappingURL=media-filename.d.ts.map