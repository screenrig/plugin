import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/assets.js
import { readFileSync } from "node:fs";
function readAsset(name) {
  return readFileSync(new URL("../assets/".concat(name), import.meta.url));
}

export {
  readAsset
};
