import type { ApiClient } from "./client.js";
import type { TransportResponse } from "./transport/types.js";
/**
 * One request against the versioned playlist union.
 *
 * A stored ad-bearing page array is never exposed or overwritten through v1:
 * the server answers with an explicit version-required conflict, and this call
 * retries the v2 union once. A document already known to hold an adslot page
 * goes straight to v2, while every other refusal is returned untouched.
 */
export declare function callVersionedPlaylist(client: ApiClient, options: {
    method: "GET" | "PUT" | "DELETE";
    id: string;
    preferred: "v1" | "v2";
    body?: unknown;
    headers?: Record<string, string>;
    /** Overrides the per-invocation key when a caller derives its own durable key. */
    idempotencyKey?: string;
}): Promise<TransportResponse>;
//# sourceMappingURL=playlist-api.d.ts.map