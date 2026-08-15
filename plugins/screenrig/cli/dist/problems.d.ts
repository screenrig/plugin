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
export declare function usageError(detail: string, next?: ProblemNext): CliError;
export declare function configError(detail: string, next?: ProblemNext): CliError;
export declare function networkError(detail: string, request_id?: string): CliError;
export declare function timeoutError(detail: string, request_id?: string): CliError;
//# sourceMappingURL=problems.d.ts.map