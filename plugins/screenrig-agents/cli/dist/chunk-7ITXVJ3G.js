import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  DEFAULT_ARCHIVE_LIMITS,
  ReleaseRuleError,
  SDK_PROTOCOL_VERSION,
  SDK_RUNTIME_PATH,
  admitPath,
  compileIgnore,
  finishRelease,
  hoistInlineAssets,
  injectRuntime,
  posixNormalize,
  writeTar
} from "./chunk-TW2MCKG3.js";
import {
  readAsset
} from "./chunk-4QJFIFQH.js";
import {
  processSettings
} from "./chunk-P3D5NU6C.js";
import {
  CliError,
  ExitCode,
  makeProblem
} from "./chunk-F5GLHZXQ.js";

// dist/pack/paths.js
import path from "node:path";
function toPosixRelative(root, absolute) {
  return posixNormalize(path.relative(root, absolute));
}

// dist/adapters/sdk-injection.js
import { readFile } from "node:fs/promises";
import path2 from "node:path";

// dist/pack/limits.js
function packError(code, detail) {
  return new CliError(makeProblem(code, "Application archive rejected", 400, detail, {
    hint: "The CLI checks the archive locally; nothing was sent. Fix the file, line or ignore rule detail names, then run the command again.",
    next: {
      command: "screenrig app pack <directory>",
      reason: "Fix the named path or ignore rule, then rebuild the archive locally."
    }
  }), ExitCode.Usage);
}
function mergeLimits(overrides) {
  return { ...DEFAULT_ARCHIVE_LIMITS, ...overrides };
}
function rethrowRule(error) {
  if (error instanceof ReleaseRuleError)
    throw packError(error.code, error.detail);
  throw error;
}
function bufferEntries(entries) {
  return entries.map((entry) => entry.data === void 0 || Buffer.isBuffer(entry.data) ? entry : { ...entry, data: Buffer.from(entry.data.buffer, entry.data.byteOffset, entry.data.byteLength) });
}

// dist/adapters/sdk-injection.js
var ArchiveSdkInjector = class {
  runtime;
  constructor(runtime) {
    this.runtime = runtime;
  }
  async inject(entries, request = {}) {
    const version = request.sdk_version ?? SDK_PROTOCOL_VERSION;
    if (version !== SDK_PROTOCOL_VERSION) {
      throw packError("sdk_version_incompatible", "Requested SDK protocol ".concat(version, "; this release supports ").concat(SDK_PROTOCOL_VERSION));
    }
    const injected = await injectRuntime(entries, this.runtime).catch(rethrowRule);
    if (request.sdk_sha256 && request.sdk_sha256 !== injected.asset_sha256) {
      throw packError("sdk_hash_mismatch", "Pinned SDK runtime hash does not match the requested compatibility record");
    }
    return { entries: bufferEntries(injected.entries), injected: true, reason: "Pinned ScreenRig browser runtime injected into archive only", asset_path: SDK_RUNTIME_PATH, asset_sha256: injected.asset_sha256 };
  }
};
var ReleaseLocalSdkInjector = class {
  async inject(entries, request) {
    const configured = processSettings().SCREENRIG_SDK_RUNTIME;
    let runtime;
    try {
      runtime = configured ? await readFile(path2.resolve(configured)) : readAsset("screenrig.runtime.js");
    } catch {
      const where = configured ? path2.resolve(configured) : "assets/screenrig.runtime.js";
      throw packError("sdk_runtime_missing", "Pinned SDK runtime is missing at ".concat(where, "; reinstall the ScreenRig CLI from a verified release"));
    }
    return new ArchiveSdkInjector(runtime).inject(entries, request);
  }
};
var defaultSdkInjector = new ReleaseLocalSdkInjector();

// dist/pack/archive.js
import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
var CRC32_TABLE = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) === 1 ? 3988292384 ^ value >>> 1 : value >>> 1;
  }
  return value >>> 0;
});
function crc32(data) {
  let value = 4294967295;
  for (let index = 0; index < data.length; index += 1) {
    value = CRC32_TABLE[(value ^ data[index]) & 255] ^ value >>> 8;
  }
  return (value ^ 4294967295) >>> 0;
}
function writeTar2(entries) {
  try {
    const tar = writeTar(entries);
    return Buffer.from(tar.buffer, tar.byteOffset, tar.byteLength);
  } catch (error) {
    return rethrowRule(error);
  }
}
function gzipDeterministic(data) {
  const deflated = deflateRawSync(data, { level: 9 });
  const header = Buffer.from([31, 139, 8, 0, 0, 0, 0, 0, 2, 255]);
  const footer = Buffer.alloc(8);
  footer.writeUInt32LE(crc32(data), 0);
  footer.writeUInt32LE(data.length >>> 0, 4);
  return Buffer.concat([header, deflated, footer]);
}
function sha256Hex(data) {
  return createHash("sha256").update(data).digest("hex");
}

// dist/pack/walk.js
import { constants } from "node:fs";
import { lstat, open, readdir, readFile as readFile2 } from "node:fs/promises";
import path3 from "node:path";
var FILE_TYPE_NAMES = {
  0: "unknown"
};
function fileTypeLabel(stat) {
  if (stat.isSymbolicLink())
    return "symlink";
  if (stat.isFIFO())
    return "fifo";
  if (stat.isSocket())
    return "socket";
  if (stat.isCharacterDevice())
    return "character-device";
  if (stat.isBlockDevice())
    return "block-device";
  if (stat.isDirectory())
    return "directory";
  if (stat.isFile())
    return "file";
  return FILE_TYPE_NAMES[0] ?? "unsupported";
}
function isSparse(stat) {
  if (typeof stat.blocks !== "number") {
    return false;
  }
  return stat.blocks * 512 < stat.size;
}
async function loadScreenrigIgnore(root) {
  try {
    const raw = await readFile2(path3.join(root, ".screenrigignore"), "utf8");
    return compileIgnore(raw.split(/\r?\n/));
  } catch (err) {
    if (err.code === "ENOENT") {
      return () => false;
    }
    throw err;
  }
}
async function walkDirectory(root, limits) {
  const extraIgnore = await loadScreenrigIgnore(root);
  const entries = [];
  const seen = { normalized: /* @__PURE__ */ new Set(), folded: /* @__PURE__ */ new Set() };
  let fileCount = 0;
  let expandedBytes = 0;
  async function visit(absolute) {
    const relative = toPosixRelative(root, absolute);
    const posixPath = posixNormalize(relative);
    let st;
    try {
      st = await lstat(absolute);
    } catch (err) {
      throw packError("unsupported_entry", "Unable to stat ".concat(posixPath || ".", ": ").concat(err instanceof Error ? err.message : "unknown error"));
    }
    const isDir = st.isDirectory();
    if (posixPath) {
      let admitted;
      try {
        admitted = admitPath(posixPath, isDir, limits, seen, extraIgnore);
      } catch (error) {
        rethrowRule(error);
      }
      if (!admitted) {
        return;
      }
    }
    if (st.isSymbolicLink()) {
      throw packError("symlink_rejected", "Symlinks are not allowed: ".concat(posixPath || "."));
    }
    if (st.isFIFO()) {
      throw packError("fifo_rejected", "FIFOs are not allowed: ".concat(posixPath || "."));
    }
    if (st.isSocket()) {
      throw packError("socket_rejected", "Sockets are not allowed: ".concat(posixPath || "."));
    }
    if (st.isCharacterDevice() || st.isBlockDevice()) {
      throw packError("device_rejected", "Device files are not allowed: ".concat(posixPath || "."));
    }
    if (!st.isFile() && !st.isDirectory()) {
      throw packError("unsupported_entry", "Unsupported filesystem entry (".concat(fileTypeLabel(st), "): ").concat(posixPath || "."));
    }
    if (st.isFile() && st.nlink > 1) {
      throw packError("hardlink_rejected", "Hardlinks are not allowed: ".concat(posixPath || "."));
    }
    if (st.isFile() && isSparse(st)) {
      throw packError("sparse_rejected", "Sparse files are not allowed: ".concat(posixPath || "."));
    }
    if (st.isDirectory()) {
      if (posixPath) {
        entries.push({ path: posixPath, type: "directory", size: 0 });
      }
      const children = await readdir(absolute);
      children.sort((a, b) => Buffer.compare(Buffer.from(a.normalize("NFC")), Buffer.from(b.normalize("NFC"))));
      for (const child of children) {
        await visit(path3.join(absolute, child));
      }
      return;
    }
    if (st.size > limits.application_file_bytes) {
      throw packError("file_too_large", "File exceeds ".concat(limits.application_file_bytes, " bytes: ").concat(posixPath));
    }
    if (fileCount >= limits.application_file_count) {
      throw packError("too_many_files", "Archive exceeds the ".concat(limits.application_file_count, " file limit at ").concat(posixPath));
    }
    if (st.size > limits.application_expanded_bytes - expandedBytes) {
      throw packError("expanded_too_large", "Expanded size exceeds ".concat(limits.application_expanded_bytes, " at ").concat(posixPath));
    }
    const handle = await open(absolute, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    let data;
    try {
      const opened = await handle.stat();
      if (!opened.isFile() || opened.dev !== st.dev || opened.ino !== st.ino || opened.size !== st.size || opened.nlink !== 1 || isSparse(opened)) {
        throw packError("unsupported_entry", "File changed while packing: ".concat(posixPath));
      }
      data = Buffer.allocUnsafe(st.size);
      let offset = 0;
      while (offset < data.length) {
        const { bytesRead } = await handle.read(data, offset, Math.min(256 * 1024, data.length - offset), offset);
        if (bytesRead === 0)
          throw packError("unsupported_entry", "File changed while packing: ".concat(posixPath));
        offset += bytesRead;
      }
      const after = await handle.stat();
      if (after.size !== opened.size || after.mtimeMs !== opened.mtimeMs || after.ctimeMs !== opened.ctimeMs) {
        throw packError("unsupported_entry", "File changed while packing: ".concat(posixPath));
      }
    } finally {
      await handle.close();
    }
    fileCount += 1;
    expandedBytes += data.length;
    entries.push({ path: posixPath, type: "file", data, size: data.length });
  }
  const rootStat = await lstat(root);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw packError("unsupported_entry", "Application source must be a real directory");
  }
  await visit(root);
  const files = entries.filter((entry) => entry.type === "file");
  if (files.length > limits.application_file_count) {
    throw packError("too_many_files", "Archive contains ".concat(files.length, " files; limit is ").concat(limits.application_file_count));
  }
  const expanded = files.reduce((sum, entry) => sum + entry.size, 0);
  if (expanded > limits.application_expanded_bytes) {
    throw packError("expanded_too_large", "Expanded size ".concat(expanded, " exceeds ").concat(limits.application_expanded_bytes));
  }
  if (!files.some((entry) => entry.path === "index.html")) {
    throw packError("missing_index", "Application directory must contain index.html at the archive root");
  }
  return entries.sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path)));
}

// dist/pack/inline.js
async function hoistInlineAssets2(entries) {
  return bufferEntries(await hoistInlineAssets(entries).catch(rethrowRule));
}

// dist/pack/index.js
async function releaseEntries(root, options = {}) {
  const logger = options.logger;
  const limits = mergeLimits(options.limits);
  const walked = logger ? await logger.withLocal({ op: "pack.walk", message: "walk ".concat(root) }, async (span) => {
    const result = await walkDirectory(root, limits);
    span.finish({ file_count: result.filter((entry) => entry.type === "file").length });
    return result;
  }) : await walkDirectory(root, limits);
  const hoisted = await hoistInlineAssets2(walked);
  const injector = options.injector ?? defaultSdkInjector;
  const injected = await injector.inject(hoisted);
  const enforceLimits = () => {
    try {
      return finishRelease(injected.entries, limits);
    } catch (error) {
      return rethrowRule(error);
    }
  };
  const release = logger?.enabled ? await logger.withLocal({ op: "pack.limits", message: "enforce archive limits" }, async (span) => {
    const finished = enforceLimits();
    span.finish({
      file_count: finished.file_count,
      expanded_bytes: finished.expanded_bytes,
      application_file_count: limits.application_file_count,
      application_expanded_bytes: limits.application_expanded_bytes
    });
    return finished;
  }) : enforceLimits();
  return {
    entries: bufferEntries(release.entries),
    file_count: release.file_count,
    expanded_bytes: release.expanded_bytes,
    sdk_injection: {
      injected: injected.injected,
      reason: injected.reason,
      asset_path: injected.asset_path,
      asset_sha256: injected.asset_sha256
    }
  };
}
async function packDirectory(root, options = {}) {
  const logger = options.logger;
  const limits = mergeLimits(options.limits);
  const run = async () => {
    const release = await releaseEntries(root, options);
    const { entries, expanded_bytes: expandedBytes, file_count: fileCount } = release;
    const packed = logger ? await logger.withLocal({ op: "pack.archive", message: "write gzip archive" }, async (span) => {
      const tar = writeTar2(entries);
      const archive = gzipDeterministic(tar);
      span.finish({
        compressed_bytes: archive.length,
        expanded_bytes: expandedBytes,
        file_count: fileCount,
        sha256: sha256Hex(archive)
      });
      return archive;
    }) : gzipDeterministic(writeTar2(entries));
    if (packed.length > limits.application_archive_bytes) {
      throw packError("compressed_too_large", "Compressed archive ".concat(packed.length, " exceeds ").concat(limits.application_archive_bytes));
    }
    return {
      archive: packed,
      sha256: sha256Hex(packed),
      compressed_bytes: packed.length,
      expanded_bytes: expandedBytes,
      file_count: fileCount,
      entries: entries.map((entry) => ({ path: entry.path, type: entry.type, size: entry.size })),
      sdk_injection: release.sdk_injection
    };
  };
  if (!logger?.enabled) {
    return run();
  }
  return logger.withLocal({ op: "pack.directory", message: "pack ".concat(root) }, async (span) => {
    const result = await run();
    span.finish({
      compressed_bytes: result.compressed_bytes,
      expanded_bytes: result.expanded_bytes,
      file_count: result.file_count,
      sha256: result.sha256
    });
    return result;
  });
}

export {
  releaseEntries,
  packDirectory
};
