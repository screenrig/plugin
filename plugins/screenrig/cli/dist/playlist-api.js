import { CliError } from "./problems.js";
/**
 * One request against the versioned playlist union.
 *
 * A stored ad-bearing page array is never exposed or overwritten through v1:
 * the server answers with an explicit version-required conflict, and this call
 * retries the v2 union once. A document already known to hold an adslot page
 * goes straight to v2, while every other refusal is returned untouched.
 */
export async function callVersionedPlaylist(client, options) {
    const target = encodeURIComponent(options.id);
    // Reads carry no idempotency key, exactly like every other GET in the client.
    // Mutations keep the existing write convention: one durable key per
    // invocation, reused when the same write is retried.
    const idempotent = options.method !== "GET";
    const send = (version) => client.call({
        method: options.method,
        path: `/api/${version}/playlists/${target}`,
        idempotent,
        ...(options.idempotencyKey === undefined ? {} : { idempotencyKey: options.idempotencyKey }),
        ...(options.headers ? { headers: options.headers } : {}),
        ...(options.body === undefined ? {} : { body: options.body }),
    });
    try {
        return await send(options.preferred);
    }
    catch (error) {
        if (options.preferred === "v1" && error instanceof CliError && error.problem.code === "version_required") {
            return await send("v2");
        }
        throw error;
    }
}
//# sourceMappingURL=playlist-api.js.map