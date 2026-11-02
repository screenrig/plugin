import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  CliError,
  usageError
} from "./chunk-FZL3NTLT.js";

// dist/authoring-input.js
import { open, mkdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
var MAX_INPUT_BYTES = 8 * 1024 * 1024;
async function readAuthoringText(file, runtime, maxBytes = MAX_INPUT_BYTES) {
  try {
    if (file !== "-") {
      const handle = await open(path.resolve(runtime.cwd(), file), "r");
      try {
        if ((await handle.stat()).size > maxBytes)
          throw usageError("Input exceeds its size limit.");
        let size2 = 0;
        const chunks2 = [];
        for await (const chunk of handle.createReadStream({ autoClose: false })) {
          size2 += chunk.length;
          if (size2 > maxBytes)
            throw usageError("Input exceeds its size limit.");
          chunks2.push(chunk);
        }
        return Buffer.concat(chunks2).toString("utf8");
      } finally {
        await handle.close();
      }
    }
    if (!runtime.stdin || runtime.isStdinTty?.())
      throw usageError("Pipe input when using '-'.");
    let size = 0;
    const chunks = [];
    for await (const chunk of runtime.stdin) {
      const bytes = Buffer.from(chunk);
      size += bytes.length;
      if (size > maxBytes)
        throw usageError("Input exceeds its size limit.");
      chunks.push(bytes);
    }
    return Buffer.concat(chunks).toString("utf8");
  } catch (error) {
    if (error instanceof CliError)
      throw error;
    const code = error.code;
    if (file !== "-" && code === "ENOENT")
      throw usageError("".concat(file, " does not exist."));
    if (file !== "-" && code === "EISDIR")
      throw usageError("".concat(file, " is a directory; name a file."));
    if (file !== "-" && code === "EACCES")
      throw usageError("".concat(file, " cannot be read (permission denied)."));
    throw usageError("Cannot read ".concat(file === "-" ? "stdin" : file, "; provide a readable file or pipe, within the size limit."));
  }
}
async function readAuthoringJson(file, runtime) {
  const text = await readAuthoringText(file, runtime);
  try {
    return JSON.parse(text);
  } catch {
    throw usageError("Input is not valid JSON.");
  }
}
var outputExists = (output) => "Output file already exists: ".concat(output, ". Nothing was written and it still holds its earlier content. Choose a new --output path, or add --overwrite to replace it.");
async function holdsContent(output) {
  try {
    return (await stat(output)).size > 0;
  } catch (error) {
    if (error.code === "ENOENT")
      return false;
    throw error;
  }
}
async function assertOutputAvailable(output, overwrite) {
  if (!overwrite && await holdsContent(output))
    throw usageError(outputExists(output));
}
async function writeOutputFile(output, text, overwrite) {
  await mkdir(path.dirname(output), { recursive: true });
  await assertOutputAvailable(output, overwrite);
  const temporary = "".concat(output, ".").concat(crypto.randomUUID(), ".tmp");
  try {
    const handle = await open(temporary, "wx", 384);
    try {
      await handle.writeFile(text);
    } finally {
      await handle.close();
    }
    await rename(temporary, output);
  } catch {
    throw usageError("Cannot create output; check that the directory is writable.");
  } finally {
    await rm(temporary, { force: true });
  }
}
async function writeAuthoringJson(file, document, runtime, overwrite = false) {
  const output = path.resolve(runtime.cwd(), file);
  await writeOutputFile(output, JSON.stringify(document, null, 2) + "\n", overwrite);
  return output;
}
async function readInputBytes(file, cwd, runtime, maxBytes) {
  if (file === "-" && (!runtime?.stdin || runtime.isStdinTty?.())) {
    throw usageError("Pipe input when using '-'.");
  }
  const handle = file === "-" ? void 0 : await open(path.resolve(cwd, file), "r");
  try {
    const chunks = [];
    let size = 0;
    const input = handle ? handle.createReadStream({ autoClose: false }) : runtime.stdin;
    for await (const chunk of input) {
      const bytes = Buffer.from(chunk);
      size += bytes.length;
      if (size > maxBytes)
        throw usageError("Input exceeds its size limit.");
      chunks.push(bytes);
    }
    return Buffer.concat(chunks);
  } finally {
    await handle?.close();
  }
}

export {
  readAuthoringText,
  readAuthoringJson,
  assertOutputAvailable,
  writeOutputFile,
  writeAuthoringJson,
  readInputBytes
};
