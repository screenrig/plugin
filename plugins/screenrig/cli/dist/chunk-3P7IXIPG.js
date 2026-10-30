import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import{A as r}from"./chunk-UQFN5NVT.js";var s="23456789ABCDEFGHJKMNPQRSTUVWXYZ",a=/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;function c(o,t){let e=o.replace(/[\s-]+/g,"").toUpperCase();if(!a.test(e))throw r(`${t} must be six characters from ${s}; spaces and dashes between them are ignored.`);return e}export{c as a};
