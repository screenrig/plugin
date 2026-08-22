import type { Transport, TransportDownloadResponse, TransportRequest, TransportResponse } from "./transport/types.js";
import type { Operation } from "./adapters/protocol.js";
export interface ApiClientOptions {
    transport: Transport;
    token?: string;
    requestId?: string;
    idempotencyKey?: string;
    timeoutMs?: number;
    /** When set, authenticated remaining credits are observed for the envelope warning. */
    creditsOwner?: object;
}
export declare class ApiClient {
    readonly requestId: string;
    readonly idempotencyKey: string;
    private readonly token?;
    private readonly transport;
    private readonly timeoutMs;
    private readonly creditsOwner?;
    constructor(options: ApiClientOptions);
    private headers;
    call(req: Omit<TransportRequest, "headers"> & {
        headers?: Record<string, string>;
        idempotent?: boolean;
        idempotencyKey?: string;
    }): Promise<TransportResponse>;
    download(req: Omit<TransportRequest, "headers"> & {
        headers?: Record<string, string>;
    }): Promise<TransportDownloadResponse>;
    getOperation(id: string): Promise<Operation>;
    waitForOperation(id: string, options: {
        timeoutMs: number;
        pollMs: number;
        sleep: (ms: number) => Promise<void>;
    }): Promise<Operation>;
}
export declare function requireToken(token: string | undefined): string;
//# sourceMappingURL=client.d.ts.map