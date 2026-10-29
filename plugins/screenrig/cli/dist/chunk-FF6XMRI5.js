import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import{readFileSync as r}from"node:fs";function n(e){return r(new URL(`../assets/${e}`,import.meta.url))}export{n as a};
