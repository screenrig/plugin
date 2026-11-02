import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import{B as t}from"./chunk-CYIOGFGF.js";var c=/^(?:(?:stage|qa|development)_)?pcn_[A-Za-z0-9_-]+$/,o=/^(?:(?:stage|qa|development)_)?pcn_[A-Za-z0-9_-]{4,64}$/;function i(n){if(!o.test(n))throw t("--connection-id takes a connection id (pcn_\u2026).",{command:"screenrig connection list",reason:"List this project's connections and their ids."});return n}export{c as a,i as b};
