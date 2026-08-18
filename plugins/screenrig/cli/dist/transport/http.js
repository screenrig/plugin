import { CliError, networkError, normalizeProblem, timeoutError } from "../problems.js";
function headerMap(headers) {
    const out = {};
    headers.forEach((value, key) => {
        out[key.toLowerCase()] = value;
    });
    return out;
}
function decodeTextBody(text, contentType) {
    if (text && (contentType.includes("json") || text.startsWith("{") || text.startsWith("["))) {
        try {
            return JSON.parse(text);
        }
        catch {
            return text;
        }
    }
    return text || undefined;
}
function buildUrl(base, path, query) {
    const url = new URL(path, base.endsWith("/") ? base : `${base}/`);
    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== "") {
                url.searchParams.set(key, value);
            }
        }
    }
    return url.toString();
}
export class FetchTransport {
    apiUrl;
    token;
    fetchImpl;
    constructor(apiUrl, token, fetchImpl = fetch) {
        this.apiUrl = apiUrl;
        this.token = token;
        this.fetchImpl = fetchImpl;
    }
    headers(req) {
        const headers = {
            accept: req.binary ? "image/webp" : req.json === false ? "*/*" : "application/json",
            ...req.headers,
        };
        if (this.token && !headers.authorization) {
            headers.authorization = `Bearer ${this.token}`;
        }
        if (req.body !== undefined && headers["content-type"] === undefined) {
            headers["content-type"] =
                req.body instanceof Uint8Array ? "application/octet-stream" : "application/json";
        }
        return headers;
    }
    serialize(body) {
        if (body === undefined) {
            return undefined;
        }
        if (body instanceof Uint8Array) {
            return Buffer.from(body);
        }
        if (typeof body === "string") {
            return body;
        }
        return JSON.stringify(body);
    }
    async request(req) {
        const controller = new AbortController();
        const timer = req.timeout_ms && req.timeout_ms > 0
            ? setTimeout(() => controller.abort(), req.timeout_ms)
            : undefined;
        try {
            const response = await this.fetchImpl(buildUrl(this.apiUrl, req.path, req.query), {
                method: req.method,
                headers: this.headers(req),
                body: this.serialize(req.body),
                signal: req.signal ?? controller.signal,
            });
            const headers = headerMap(response.headers);
            if (req.binary) {
                const bytes = new Uint8Array(await response.arrayBuffer());
                if (response.status >= 400) {
                    const text = new TextDecoder().decode(bytes);
                    return { status: response.status, headers, body: decodeTextBody(text, headers["content-type"] ?? ""), rawText: text };
                }
                return { status: response.status, headers, body: bytes };
            }
            const text = await response.text();
            return { status: response.status, headers, body: decodeTextBody(text, headers["content-type"] ?? ""), rawText: text };
        }
        catch (err) {
            if (err.name === "AbortError") {
                throw timeoutError("API request timed out", req.headers?.["x-request-id"]);
            }
            throw networkError(err instanceof Error ? err.message : "API request failed", req.headers?.["x-request-id"]);
        }
        finally {
            if (timer) {
                clearTimeout(timer);
            }
        }
    }
    async stream(req) {
        let response;
        try {
            response = await this.fetchImpl(buildUrl(this.apiUrl, req.path, req.query), {
                method: req.method,
                headers: {
                    ...this.headers(req),
                    accept: "text/event-stream",
                },
                signal: req.signal,
            });
        }
        catch (err) {
            if (err.name === "AbortError") {
                throw timeoutError("SSE connection timed out", req.headers?.["x-request-id"]);
            }
            throw networkError(err instanceof Error ? err.message : "SSE connection failed", req.headers?.["x-request-id"]);
        }
        if (!response.ok || !response.body) {
            const text = await response.text();
            let body = text;
            try {
                body = JSON.parse(text);
            }
            catch { /* Preserve the bounded fallback text. */ }
            throw new CliError(normalizeProblem(body, {
                status: response.status,
                request_id: response.headers.get("x-request-id") ?? req.headers?.["x-request-id"],
                bodyText: text.slice(0, 300),
            }));
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        return {
            async *[Symbol.asyncIterator]() {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            break;
                        }
                        yield decoder.decode(value, { stream: true });
                    }
                }
                finally {
                    reader.releaseLock();
                }
            },
        };
    }
}
//# sourceMappingURL=http.js.map