import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  usageError
} from "./chunk-VYWS3KLY.js";

// dist/pairing-code.js
var PAIRING_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
var CODE_PATTERN = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;
function canonicalPairingCode(input, subject) {
  const code = input.replace(/[\s-]+/g, "").toUpperCase();
  if (!CODE_PATTERN.test(code)) {
    throw usageError("".concat(subject, " must be six characters from ").concat(PAIRING_CODE_ALPHABET, "; spaces and dashes between them are ignored."));
  }
  return code;
}

export {
  canonicalPairingCode
};
