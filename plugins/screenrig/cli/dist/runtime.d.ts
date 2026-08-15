import type { Writable } from "node:stream";
import type { Transport } from "./transport/types.js";
import type { ConfigFs } from "./config.js";
import { type OpenUrl } from "./open-url.js";
export interface CliRuntime {
    argv: string[];
    env: NodeJS.Dict<string>;
    stdout: Writable;
    stderr: Writable;
    now: () => Date;
    sleep: (ms: number) => Promise<void>;
    homedir: () => string;
    fs: ConfigFs;
    transport?: Transport;
    signedRawPut?: SignedRawPut;
    cwd: () => string;
    openUrl?: OpenUrl;
}
export interface SignedRawPutRequest {
    url: string;
    method: "PUT";
    headers: Record<string, string>;
    body: Uint8Array;
    credentials: "omit";
    redirect: "error";
}
export interface SignedRawPutResponse {
    status: number;
    bodyText?: string;
}
export type SignedRawPut = (request: SignedRawPutRequest) => Promise<SignedRawPutResponse>;
export declare function fetchSignedRawPut(fetchImpl?: typeof fetch): SignedRawPut;
export declare function processRuntime(): CliRuntime;
//# sourceMappingURL=runtime.d.ts.map