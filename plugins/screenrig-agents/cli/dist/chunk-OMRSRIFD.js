import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/playlist-api.js
async function callPlaylist(client, options) {
  const target = encodeURIComponent(options.id);
  const idempotent = options.method !== "GET";
  return client.call({
    method: options.method,
    path: `/api/playlists/${target}`,
    idempotent,
    ...options.idempotencyKey === void 0 ? {} : { idempotencyKey: options.idempotencyKey },
    ...options.headers ? { headers: options.headers } : {},
    ...options.body === void 0 ? {} : { body: options.body }
  });
}

export {
  callPlaylist
};
