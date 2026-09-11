import { type AccountEvent, type FeedbackContext, type Operation } from "./adapters/protocol.js";
import { type ParsedArgs } from "./command-input.js";
import { successEnvelope } from "./envelope.js";
import { ExitCode } from "./exit-codes.js";
import type { CliRuntime } from "./runtime.js";
import { type TranscodeOptions } from "./media/transcode.js";
import { CLI_VERSION } from "./version.js";
export { CLI_VERSION };
export interface CommandResult {
    envelope: ReturnType<typeof successEnvelope<unknown>>;
    exitCode: ExitCode;
    human: string;
    /** Help defaults to text; streams have already emitted their output. */
    output?: "help" | "stream";
}
export type CommandHandler = (args: ParsedArgs, runtime: CliRuntime) => Promise<CommandResult>;
export declare const handleVersion: CommandHandler;
export declare const handleComposeCatalog: CommandHandler;
export declare const handlePlaylistValidate: CommandHandler;
export declare const handlePlaylistPreview: CommandHandler;
export declare const handleComposeBatch: CommandHandler;
export declare const handleComposeRender: CommandHandler;
export declare const handlePlaylistTemplates: CommandHandler;
export declare const handleDoctor: CommandHandler;
export declare const handleAppPack: CommandHandler;
export declare const handleAgentStatus: CommandHandler;
export declare const handleAgentConnect: CommandHandler;
export declare const handleAgentEnroll: CommandHandler;
export declare const handleAgentDisconnect: CommandHandler;
export declare const handleAccountShow: CommandHandler;
export declare const handleDashboard: CommandHandler;
export declare const handleAppUpload: CommandHandler;
export declare const handleAppUpdate: CommandHandler;
export declare const handleAppList: CommandHandler;
export declare const handleAppShow: CommandHandler;
export declare const handleBrowserSetup: CommandHandler;
export declare const handleOperationsGet: CommandHandler;
export declare const handleOperationsWait: CommandHandler;
export declare const handleOperationsCancel: CommandHandler;
export declare const handleEventsList: CommandHandler;
export declare const handleEventsFollow: CommandHandler;
export declare const handlePlaybackList: CommandHandler;
export declare const handleMediaList: CommandHandler;
export declare const handleMediaShow: CommandHandler;
export declare const handleMediaUpdate: CommandHandler;
export declare const handleMediaDownload: CommandHandler;
export declare const handleMediaDelete: CommandHandler;
export declare const handleMediaGenerate: CommandHandler;
export declare const handleMediaUpload: CommandHandler;
export declare const handleMediaUploadBatch: CommandHandler;
/** Flags that shape the pre-upload transcode. */
export declare function transcodeOptionsFromArgs(args: ParsedArgs): TranscodeOptions;
/**
 * Built from the resolved command surface only. Nothing here is derived from
 * raw argv, so no argument value, path, identifier, or credential can reach the
 * server through the diagnostic envelope.
 */
export declare function feedbackContextFromArgs(args: ParsedArgs, platform: string): FeedbackContext | undefined;
export declare const handleFeedbackList: CommandHandler;
export declare const handleFeedbackBug: CommandHandler;
export declare const handleFeedbackFeature: CommandHandler;
export declare const handlePlaylistList: CommandHandler;
export declare const handlePlaylistShow: CommandHandler;
export declare const handlePlaylistExport: CommandHandler;
export declare const handlePlaylistImport: CommandHandler;
export declare const handlePlaylistCreate: CommandHandler;
export declare const handlePlaylistUpdate: CommandHandler;
export declare const handlePlaylistReplaceRelease: CommandHandler;
export declare const handlePlaylistDelete: CommandHandler;
export declare const handleScreenList: CommandHandler;
export declare const handleScreenProvision: CommandHandler;
export declare const handleScreenPair: CommandHandler;
export declare const handleScreenShow: CommandHandler;
export declare const handleScreenUpdate: CommandHandler;
export declare const handleScreenAssign: CommandHandler;
export declare const handleScreenSetTimezone: CommandHandler;
export declare const handleScreenArchive: CommandHandler;
export declare const handleScreenUnarchive: CommandHandler;
export declare const handleScreenDelete: CommandHandler;
export declare const handleScreenRotatePublicId: CommandHandler;
export declare const handleScreenRecover: CommandHandler;
export declare const handleScreenToast: CommandHandler;
export declare const handleScreenScreenshot: CommandHandler;
export declare const handleKvList: CommandHandler;
export declare const handleKvGet: CommandHandler;
export declare const handleKvSet: CommandHandler;
export declare const handleKvDelete: CommandHandler;
export declare const handleCommentShowScreen: CommandHandler;
export declare const handleCommentShowPlaylist: CommandHandler;
export declare const handleCommentSetScreen: CommandHandler;
export declare const handleCommentSetPlaylist: CommandHandler;
export declare const handleCommentDeleteScreen: CommandHandler;
export declare const handleCommentDeletePlaylist: CommandHandler;
/** One logfmt line per event. Undefined when there is nothing to print. */
export declare function formatEventLine(event: AccountEvent): string | undefined;
/** First reconnect wait after a disconnect. Tests inject `runtime.sleep`. */
export declare const EVENT_STREAM_BACKOFF_MS = 250;
export declare const EVENT_STREAM_BACKOFF_CAP_MS = 15000;
export type { Operation };
export declare const handlePlaylistInit: CommandHandler;
export declare const handleScreenPublish: CommandHandler;
//# sourceMappingURL=commands.d.ts.map