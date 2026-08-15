import type { Transport, TransportRequest, TransportResponse, TransportStream } from "./types.js";
export declare class FetchTransport implements Transport {
    private readonly apiUrl;
    private readonly token;
    private readonly fetchImpl;
    constructor(apiUrl: string, token: string | undefined, fetchImpl?: typeof fetch);
    private headers;
    private serialize;
    request(req: TransportRequest): Promise<TransportResponse>;
    stream(req: TransportRequest): Promise<TransportStream>;
}
//# sourceMappingURL=http.d.ts.map