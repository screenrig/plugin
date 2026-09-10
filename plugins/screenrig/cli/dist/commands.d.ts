import { type AccountEvent, type FeedbackContext, type Operation } from "./adapters/protocol.js";
import { type ParsedArgs } from "./argv.js";
import { successEnvelope } from "./envelope.js";
import { ExitCode } from "./exit-codes.js";
import type { CliRuntime } from "./runtime.js";
import { type TranscodeOptions } from "./media/transcode.js";
import { CLI_VERSION } from "./version.js";
export { CLI_VERSION };
export { ROOT_HELP as USAGE } from "./help.js";
export interface CommandResult {
    envelope: ReturnType<typeof successEnvelope<unknown>>;
    exitCode: ExitCode;
    human: string;
}
export declare function dispatch(args: ParsedArgs, runtime: CliRuntime): Promise<CommandResult>;
/** Flags that shape the pre-upload transcode. */
export declare function transcodeOptionsFromArgs(args: ParsedArgs): TranscodeOptions;
/**
 * Built from the resolved command surface only. Nothing here is derived from
 * raw argv, so no argument value, path, identifier, or credential can reach the
 * server through the diagnostic envelope.
 */
export declare function feedbackContextFromArgs(args: ParsedArgs, platform: string): FeedbackContext | undefined;
/** One logfmt line per event. Undefined when there is nothing to print. */
export declare function formatEventLine(event: AccountEvent): string | undefined;
/** First reconnect wait after a disconnect. Tests inject `runtime.sleep`. */
export declare const EVENT_STREAM_BACKOFF_MS = 250;
export declare const EVENT_STREAM_BACKOFF_CAP_MS = 15000;
export type { Operation };
//# sourceMappingURL=commands.d.ts.map