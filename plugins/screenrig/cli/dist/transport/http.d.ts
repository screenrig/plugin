import type { Transport, TransportDownloadResponse, TransportRequest, TransportResponse, TransportStream } from "./types.js";
export declare class FetchTransport implements Transport {
    private readonly apiUrl;
    private readonly token;
    private readonly fetchImpl;
    constructor(apiUrl: string, token: string | undefined, fetchImpl?: typeof fetch);
    private headers;
    private serialize;
    request(req: TransportRequest): Promise<TransportResponse>;
    stream(req: TransportRequest): Promise<TransportStream>;
    download(req: TransportRequest): Promise<TransportDownloadResponse>;
}
//# sourceMappingURL=http.d.ts.map