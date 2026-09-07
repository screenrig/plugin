import type { Warning } from "../envelope.js";
import type { SignedRawPut } from "../runtime.js";
import type { RunProcess } from "../runtime.js";
import type { Transport } from "../transport/types.js";
import type { LogEvent, LogSink, OperationLogger } from "./types.js";
export declare function commandWords(positionals: string[]): string[];
export declare function requestSummary(body: unknown, contentType?: string): {
    content_type?: string;
    byte_length?: number;
    request?: unknown;
};
export declare function responseSummary(body: unknown, binary: boolean, contentType?: string): {
    content_type?: string;
    byte_length?: number;
    response?: unknown;
};
export declare const LOG_SINK_DEGRADED_CODE = "log_sink_degraded";
export declare function logSinkDegradedWarning(dropped: number): Warning | undefined;
export declare const noopLogger: OperationLogger;
export declare function loggerOf(runtime: {
    logger?: OperationLogger;
}): OperationLogger;
export declare function createMemoryLogger(options?: {
    command?: string[];
    now?: () => Date;
}): {
    logger: OperationLogger;
    events: LogEvent[];
};
export declare function createSinkLogger(options: {
    sink: LogSink;
    command?: string[];
    now?: () => Date;
    runId?: string;
}): OperationLogger;
export declare function queryKeys(query?: Record<string, string | undefined>): string[] | undefined;
export declare function loggingRunProcess(run: RunProcess, logger: OperationLogger): RunProcess;
export declare function loggingTransport(transport: Transport, logger: OperationLogger): Transport;
export declare function loggingSignedRawPut(put: SignedRawPut, logger: OperationLogger): SignedRawPut;
//# sourceMappingURL=logger.d.ts.map