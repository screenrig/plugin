import type { Envelope } from "./envelope.js";
import { errorEnvelope } from "./envelope.js";
import type { Transport, TransportRequest, TransportResponse } from "./transport/types.js";
import type { Operation } from "./adapters/protocol.js";
export interface ApiClientOptions {
    transport: Transport;
    token?: string;
    requestId?: string;
    idempotencyKey?: string;
    timeoutMs?: number;
}
export declare class ApiClient {
    readonly requestId: string;
    readonly idempotencyKey: string;
    private readonly token?;
    private readonly transport;
    private readonly timeoutMs;
    constructor(options: ApiClientOptions);
    private headers;
    call(req: Omit<TransportRequest, "headers"> & {
        headers?: Record<string, string>;
        idempotent?: boolean;
        idempotencyKey?: string;
    }): Promise<TransportResponse>;
    getOperation(id: string): Promise<Operation>;
    waitForOperation(id: string, options: {
        timeoutMs: number;
        pollMs: number;
        sleep: (ms: number) => Promise<void>;
    }): Promise<Operation>;
}
export declare function envelopeFromUnknown<T>(data: T, requestId?: string, operationId?: string): Envelope<T>;
export declare function requireToken(token: string | undefined): string;
export { errorEnvelope };
//# sourceMappingURL=client.d.ts.map