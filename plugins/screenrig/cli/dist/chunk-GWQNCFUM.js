import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
async function t(d,e){let y=encodeURIComponent(e.id),a=e.method!=="GET";return d.call({method:e.method,path:`/api/playlists/${y}`,idempotent:a,...e.idempotencyKey===void 0?{}:{idempotencyKey:e.idempotencyKey},...e.headers?{headers:e.headers}:{},...e.body===void 0?{}:{body:e.body}})}export{t as a};
