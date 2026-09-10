import { createHash } from "node:crypto";
import { readConfigFile, withConfigLock, writeConfigAtomic } from "./config.js";
import { isValidIdempotencyKey, newIdempotencyKey } from "./ids.js";
import { configError, usageError } from "./problems.js";
// Server replay records last 24 hours. Stop earlier rather than silently
// replaying a mutation after the server may have forgotten its key.
const SAFE_REPLAY_MS = 23 * 60 * 60 * 1000;
function ledger(config) {
    const value = config.pending_writes === undefined ? {} : config.pending_writes;
    if (!value || typeof value !== "object" || Array.isArray(value) ||
        Object.entries(value).some(([hash, entry]) => !/^[a-f0-9]{64}$/.test(hash) ||
            !entry || typeof entry.idempotency_key !== "string" || !isValidIdempotencyKey(entry.idempotency_key) ||
            typeof entry.created_at !== "string" || !Number.isFinite(Date.parse(entry.created_at)))) {
        throw configError("Pending write recovery state is invalid; no request was sent.");
    }
    return value;
}
/** Per-invocation coordinator. Only hashes, keys and timestamps reach disk. */
export class WriteRecovery {
    resolved;
    runtime;
    touched = new Map();
    constructor(resolved, runtime) {
        this.resolved = resolved;
        this.runtime = runtime;
    }
    async update(work) {
        const fs = { ...this.runtime.fs, env: this.runtime.env, homedir: this.runtime.homedir };
        return withConfigLock(this.resolved.configPath, fs, { sleep: this.runtime.sleep, now: () => this.runtime.now().getTime() }, async () => {
            const config = await readConfigFile(this.resolved.configPath, fs);
            if (!config || config.token !== this.resolved.token) {
                throw configError("Agent credential changed during write recovery; retry with the current installation.");
            }
            const pending = ledger(config);
            const result = work(config, pending);
            const { pending_writes: _old, ...rest } = config;
            await writeConfigAtomic(this.resolved.configPath, { ...rest, ...(Object.keys(pending).length ? { pending_writes: pending } : {}) }, fs);
            return result;
        });
    }
    async prepare(request, requestedKey) {
        const headers = Object.entries(request.headers ?? {})
            .filter(([name]) => !["x-request-id", "idempotency-key"].includes(name.toLowerCase()))
            .map(([name, value]) => [name.toLowerCase(), value]).sort(([a], [b]) => a.localeCompare(b));
        const body = request.body === undefined ? undefined : request.body instanceof Uint8Array
            ? request.body : typeof request.body === "string" ? request.body : JSON.stringify(request.body);
        const hash = createHash("sha256").update(JSON.stringify([
            this.resolved.apiUrl, this.resolved.token, request.method, request.path,
            Object.entries(request.query ?? {}).sort(), headers, body === undefined ? "absent" : "present",
        ]));
        if (body !== undefined)
            hash.update(body);
        const fingerprint = hash.digest("hex");
        const pending = await this.update((_config, entries) => {
            const existing = entries[fingerprint];
            const reuse = existing && (!requestedKey || requestedKey === existing.idempotency_key);
            if (reuse && this.runtime.now().getTime() - Date.parse(existing.created_at) >= SAFE_REPLAY_MS) {
                throw usageError("This unresolved write is older than the safe replay window. Inspect the resource before explicitly supplying a new --idempotency-key for a reconciled write.");
            }
            if (!existing && Object.keys(entries).length >= 256) {
                throw configError("Too many unresolved writes. Reconcile pending writes before starting another mutation.");
            }
            const key = reuse ? existing.idempotency_key : requestedKey ?? newIdempotencyKey();
            entries[fingerprint] = reuse ? existing : { idempotency_key: key, created_at: this.runtime.now().toISOString() };
            return { fingerprint, key };
        });
        this.touched.set(fingerprint, pending);
        return pending;
    }
    async clear(pending) {
        await this.update((_config, entries) => {
            if (entries[pending.fingerprint]?.idempotency_key === pending.key)
                delete entries[pending.fingerprint];
        });
        this.touched.delete(pending.fingerprint);
    }
    get hasPending() { return this.touched.size > 0; }
    async finish() {
        if (!this.touched.size)
            return;
        await this.update((_config, entries) => {
            for (const pending of this.touched.values()) {
                if (entries[pending.fingerprint]?.idempotency_key === pending.key)
                    delete entries[pending.fingerprint];
            }
        });
        this.touched.clear();
    }
}
//# sourceMappingURL=write-recovery.js.map