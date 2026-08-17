import { ExitCode } from "./exit-codes.js";
import type { NormalizedProblem, ProblemNext } from "./envelope.js";
export declare class CliError extends Error {
    readonly problem: NormalizedProblem;
    readonly exitCode: ExitCode;
    constructor(problem: NormalizedProblem, exitCode?: ExitCode);
}
export declare function problemType(code: string): string;
export declare function makeProblem(code: string, title: string, status: number, detail: string, extras?: Partial<NormalizedProblem>): NormalizedProblem;
export declare function normalizeProblem(input: unknown, fallback?: {
    status?: number;
    request_id?: string;
    bodyText?: string;
}): NormalizedProblem;
export declare function renderProblem(problem: NormalizedProblem): string;
/** `Retry-After` in seconds, per RFC 9110. An HTTP-date form is also accepted. */
export declare function parseRetryAfter(value: string | undefined, nowMs: number): number | undefined;
export declare function describeRetryInterval(seconds: number): string;
/**
 * A bare 429 tells an agent nothing actionable. The server declares
 * `Retry-After` on every rate-limited response, so fold it into the detail and
 * the next-action guidance instead of discarding the header.
 */
export declare function withRetryAfter(problem: NormalizedProblem, retryAfterSeconds: number | undefined): NormalizedProblem;
/**
 * The account plan quota is smaller than the per-upload transport ceiling and is
 * checked first, so `quota_exceeded` is the limit a user actually meets. Point
 * at the command that reports the remaining allowance, unless the server
 * already supplied its own guidance.
 */
export declare function withQuotaGuidance(problem: NormalizedProblem): NormalizedProblem;
export declare function usageError(detail: string, next?: ProblemNext): CliError;
export declare function configError(detail: string, next?: ProblemNext): CliError;
export declare function networkError(detail: string, request_id?: string): CliError;
export declare function timeoutError(detail: string, request_id?: string): CliError;
//# sourceMappingURL=problems.d.ts.map