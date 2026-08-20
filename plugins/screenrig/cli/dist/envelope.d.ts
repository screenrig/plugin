export interface ProblemNext {
    command: string;
    reason: string;
}
export interface NormalizedProblem {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
    code: string;
    request_id?: string;
    operation_id?: string;
    current_revision?: number;
    /** Present only on 429, taken from the server's Retry-After header. */
    retry_after_seconds?: number;
    errors: unknown[];
    next?: ProblemNext;
}
export interface Warning {
    code: string;
    message: string;
}
export interface SuccessEnvelope<T> {
    ok: true;
    data: T;
    request_id?: string;
    operation_id?: string;
    warnings: Warning[];
}
export interface ErrorEnvelope {
    ok: false;
    error: NormalizedProblem;
    warnings?: Warning[];
}
export type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope;
export declare function successEnvelope<T>(data: T, extras?: {
    request_id?: string;
    operation_id?: string;
    warnings?: Warning[];
}): SuccessEnvelope<T>;
export declare function errorEnvelope(error: NormalizedProblem, extras?: {
    warnings?: Warning[];
}): ErrorEnvelope;
//# sourceMappingURL=envelope.d.ts.map