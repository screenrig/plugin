import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  usageError
} from "./chunk-VYWS3KLY.js";
import {
  __export
} from "./chunk-3FYAGULW.js";

// dist/media/sniff.js
var sniff_exports = {};
__export(sniff_exports, {
  SNIFF_HEAD_BYTES: () => SNIFF_HEAD_BYTES,
  assertDeclaredTypeMatchesBytes: () => assertDeclaredTypeMatchesBytes,
  readMediaHead: () => readMediaHead,
  sniffMediaContainer: () => sniffMediaContainer
});
import { open } from "node:fs/promises";
import path from "node:path";
var SNIFF_HEAD_BYTES = 64;
var PNG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
var EBML = Buffer.from([26, 69, 223, 163]);
var ISO_BMFF_IMAGE_BRANDS = /* @__PURE__ */ new Set(["avif", "avis", "heic", "heix", "hevc", "hevx", "mif1", "msf1"]);
function startsWith(head, prefix, offset = 0) {
  const bytes = typeof prefix === "string" ? Buffer.from(prefix, "latin1") : prefix;
  return head.length >= offset + bytes.length && head.subarray(offset, offset + bytes.length).equals(bytes);
}
function sniffMediaContainer(input) {
  const head = Buffer.from(input.buffer, input.byteOffset, Math.min(input.byteLength, SNIFF_HEAD_BYTES));
  if (head.length < 12) {
    return void 0;
  }
  if (startsWith(head, PNG)) {
    return { contentType: "image/png", description: "a PNG image", kind: "image", demuxer: "png_pipe" };
  }
  if (head[0] === 255 && head[1] === 216 && head[2] === 255) {
    return { contentType: "image/jpeg", description: "a JPEG image", kind: "image", demuxer: "image2" };
  }
  if (startsWith(head, "GIF87a") || startsWith(head, "GIF89a")) {
    return { contentType: "image/gif", description: "a GIF image", kind: "image", demuxer: "gif" };
  }
  if (startsWith(head, "RIFF")) {
    if (startsWith(head, "WEBP", 8)) {
      return { contentType: "image/webp", description: "a WebP image", kind: "image", demuxer: "webp_pipe" };
    }
    if (startsWith(head, "AVI ", 8)) {
      return { contentType: "video/x-msvideo", description: "an AVI video", kind: "video", demuxer: "avi" };
    }
    if (startsWith(head, "WAVE", 8)) {
      return { contentType: "audio/wav", description: "a WAV audio file", kind: "audio", alsoMatches: ["audio/x-wav", "audio/wave"], demuxer: "wav" };
    }
    return void 0;
  }
  if (startsWith(head, "ftyp", 4)) {
    const brand = head.subarray(8, 12).toString("latin1").toLowerCase();
    if (brand === "m4a " || brand === "m4b ") {
      return { contentType: "audio/mp4", description: "an M4A (ISO BMFF) audio file", kind: "audio", alsoMatches: ["audio/x-m4a", "audio/aac"], demuxer: "mov" };
    }
    if (ISO_BMFF_IMAGE_BRANDS.has(brand)) {
      const avif = brand.startsWith("avi");
      return {
        contentType: avif ? "image/avif" : "image/heic",
        description: avif ? "an AVIF image" : "a HEIF/HEIC image",
        kind: "image",
        demuxer: "mov"
      };
    }
    return { contentType: "video/mp4", description: "an MP4/QuickTime (ISO BMFF) video", kind: "video", demuxer: "mov" };
  }
  if (startsWith(head, EBML)) {
    return { contentType: "video/webm", description: "a Matroska/WebM video", kind: "video", demuxer: "matroska" };
  }
  if (startsWith(head, "OggS")) {
    return { contentType: "video/ogg", description: "an Ogg container", kind: "video", alsoMatches: ["audio/ogg", "audio/opus"], demuxer: "ogg" };
  }
  if (startsWith(head, "fLaC")) {
    return { contentType: "audio/flac", description: "a FLAC audio file", kind: "audio", alsoMatches: ["audio/x-flac"], demuxer: "flac" };
  }
  if (startsWith(head, "ID3")) {
    return { contentType: "audio/mpeg", description: "an MP3 audio file", kind: "audio", alsoMatches: ["audio/mp3"] };
  }
  if (head[0] === 255 && (head[1] & 224) === 224) {
    return (head[1] & 6) === 0 ? { contentType: "audio/aac", description: "an ADTS AAC audio stream", kind: "audio", alsoMatches: ["audio/x-aac"], demuxer: "aac" } : { contentType: "audio/mpeg", description: "an MP3 audio file", kind: "audio", alsoMatches: ["audio/mp3"], demuxer: "mp3" };
  }
  if (startsWith(head, "BM")) {
    return { contentType: "image/bmp", description: "a BMP image", kind: "image", demuxer: "bmp_pipe" };
  }
  if (startsWith(head, Buffer.from([73, 73, 42, 0])) || startsWith(head, Buffer.from([77, 77, 0, 42]))) {
    return { contentType: "image/tiff", description: "a TIFF image", kind: "image", demuxer: "tiff_pipe" };
  }
  return void 0;
}
async function readMediaHead(filePath) {
  const handle = await open(filePath, "r");
  try {
    const head = Buffer.alloc(SNIFF_HEAD_BYTES);
    const { bytesRead } = await handle.read(head, 0, head.length, 0);
    return head.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}
async function assertDeclaredTypeMatchesBytes(filePath, declaredContentType) {
  if (!declaredContentType) {
    return;
  }
  let head;
  try {
    head = await readMediaHead(filePath);
  } catch {
    return;
  }
  const sniffed = sniffMediaContainer(head);
  const declared = declaredContentType.toLowerCase();
  if (!sniffed || sniffed.contentType === declared || sniffed.alsoMatches?.includes(declared)) {
    return;
  }
  throw usageError("".concat(path.basename(filePath), " was declared --content-type ").concat(declaredContentType, ", but its bytes are ") + "".concat(sniffed.description, " (").concat(sniffed.contentType, "). Nothing was transcoded or uploaded. ") + "Pass the source's real type, omit --content-type to use the file extension, or fix the file.");
}

export {
  sniffMediaContainer,
  readMediaHead,
  assertDeclaredTypeMatchesBytes,
  sniff_exports
};
