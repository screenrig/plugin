import { type Writable } from "node:stream";
import type { Transport } from "./transport/types.js";
import type { ConfigFs } from "./config.js";
import { type OpenPath, type OpenUrl } from "./open-url.js";
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
    openPath?: OpenPath;
    runProcess?: RunProcess;
    isStderrTty?: () => boolean;
}
export interface SignedRawPutRequest {
    url: string;
    method: "PUT";
    headers: Record<string, string>;
    body: Uint8Array | AsyncIterable<Uint8Array>;
    credentials: "omit";
    redirect: "error";
}
export interface SignedRawPutResponse {
    status: number;
    bodyText?: string;
}
export type SignedRawPut = (request: SignedRawPutRequest) => Promise<SignedRawPutResponse>;
export interface RunProcessRequest {
    command: string;
    args: string[];
    /** Receives each complete stdout line. When set, stdout is streamed instead of captured. */
    onStdoutLine?: (line: string) => void;
    timeoutMs?: number;
}
export interface RunProcessResult {
    /** Null when the child was terminated by a signal or never started cleanly. */
    code: number | null;
    signal: string | null;
    /** Captured stdout, or the empty string when onStdoutLine streamed it. */
    stdout: string;
    /** Bounded tail of stderr, for diagnostics only. */
    stderrTail: string;
    /** Set when the process could not be started at all. */
    spawnError?: string;
    timedOut?: boolean;
}
export type RunProcess = (request: RunProcessRequest) => Promise<RunProcessResult>;
export declare function spawnRunProcess(): RunProcess;
export declare function fetchSignedRawPut(fetchImpl?: typeof fetch): SignedRawPut;
export declare function processRuntime(): CliRuntime;
//# sourceMappingURL=runtime.d.ts.map