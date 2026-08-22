import { creditsLowWarnings, observeCreditsRemaining, parseCreditsRemainingHeader } from "./credits.js";
import { ExitCode } from "./exit-codes.js";
import { isValidIdempotencyKey, isValidRequestId, newIdempotencyKey, newRequestId } from "./ids.js";
import { CliError, makeProblem, normalizeProblem, parseRetryAfter, timeoutError, usageError, withPaymentGuidance, withQuotaGuidance, withRetryAfter, } from "./problems.js";
export class ApiClient {
    requestId;
    idempotencyKey;
    token;
    transport;
    timeoutMs;
    creditsOwner;
    constructor(options) {
        this.transport = options.transport;
        this.token = options.token;
        this.timeoutMs = options.timeoutMs ?? 30_000;
        this.creditsOwner = options.creditsOwner;
        if (options.requestId && !isValidRequestId(options.requestId)) {
            throw usageError("Invalid --request-id; expected req_ plus 16+ URL-safe characters.");
        }
        if (options.idempotencyKey && !isValidIdempotencyKey(options.idempotencyKey)) {
            throw usageError("Invalid --idempotency-key.");
        }
        this.requestId = options.requestId ?? newRequestId();
        this.idempotencyKey = options.idempotencyKey ?? newIdempotencyKey();
    }
    headers(idempotent, extra, idempotencyKey) {
        const headers = {
            "x-request-id": this.requestId,
            ...extra,
        };
        if (this.token) {
            headers.authorization = `Bearer ${this.token}`;
        }
        if (idempotent) {
            headers["idempotency-key"] = idempotencyKey ?? this.idempotencyKey;
        }
        return headers;
    }
    async call(req) {
        const { idempotent, idempotencyKey, ...transportRequest } = req;
        if (idempotencyKey !== undefined && !isValidIdempotencyKey(idempotencyKey)) {
            throw usageError("Invalid per-request idempotency key.");
        }
        const response = await this.transport.request({
            ...transportRequest,
            timeout_ms: req.timeout_ms ?? this.timeoutMs,
            headers: this.headers(idempotent === true, req.headers, idempotencyKey),
        });
        const remaining = this.token ? parseCreditsRemainingHeader(response.headers) : undefined;
        if (response.status >= 400) {
            const problem = normalizeProblem(response.body, {
                status: response.status,
                request_id: response.headers["x-request-id"] ?? this.requestId,
                bodyText: typeof response.rawText === "string" ? response.rawText : undefined,
            });
            throw new CliError(withPaymentGuidance(withQuotaGuidance(withRetryAfter(problem, parseRetryAfter(response.headers["retry-after"], Date.now())))), undefined, creditsLowWarnings(remaining));
        }
        if (this.creditsOwner) {
            observeCreditsRemaining(this.creditsOwner, remaining);
        }
        return response;
    }
    async download(req) {
        const response = await this.transport.download({
            ...req,
            timeout_ms: req.timeout_ms ?? this.timeoutMs,
            headers: this.headers(false, req.headers),
        });
        const remaining = this.token ? parseCreditsRemainingHeader(response.headers) : undefined;
        if (response.status >= 400) {
            const problem = normalizeProblem(response.problem, {
                status: response.status,
                request_id: response.headers["x-request-id"] ?? this.requestId,
                bodyText: response.rawText,
            });
            throw new CliError(withPaymentGuidance(withQuotaGuidance(withRetryAfter(problem, parseRetryAfter(response.headers["retry-after"], Date.now())))), undefined, creditsLowWarnings(remaining));
        }
        if (this.creditsOwner)
            observeCreditsRemaining(this.creditsOwner, remaining);
        return response;
    }
    async getOperation(id) {
        const response = await this.call({ method: "GET", path: `/api/v1/operations/${id}` });
        return response.body;
    }
    async waitForOperation(id, options) {
        const deadline = Date.now() + options.timeoutMs;
        while (true) {
            const operation = await this.getOperation(id);
            if (operation.state === "succeeded" || operation.state === "failed" || operation.state === "cancelled") {
                if (operation.state !== "succeeded") {
                    const problem = normalizeProblem(operation.error, {
                        status: 500,
                        request_id: operation.request_id ?? this.requestId,
                    });
                    throw new CliError({
                        ...problem,
                        operation_id: operation.id,
                        request_id: problem.request_id ?? this.requestId,
                        code: problem.code === "http_error" ? "operation_failed" : problem.code,
                    }, ExitCode.OperationFailed);
                }
                return operation;
            }
            if (Date.now() >= deadline) {
                throw timeoutError(`Timed out waiting for operation ${id}`, this.requestId);
            }
            await options.sleep(options.pollMs);
        }
    }
}
export function requireToken(token) {
    if (!token) {
        throw new CliError(makeProblem("unauthenticated", "Credential unavailable", 401, "Automatic enrollment did not produce a durable credential.", {
            next: {
                command: "screenrig doctor --json",
                reason: "Inspect the local credential state, then retry the original command.",
            },
        }), ExitCode.Auth);
    }
    return token;
}
//# sourceMappingURL=client.js.map