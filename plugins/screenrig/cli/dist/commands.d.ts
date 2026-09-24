import { type ProjectEvent, type FeedbackContext, type Operation } from "./adapters/protocol.js";
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
export declare const handleProjectShow: CommandHandler;
export declare const handleProjectCapabilities: CommandHandler;
export declare const handleProjectRename: CommandHandler;
export declare const handleSignInReset: CommandHandler;
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
export declare const handleAdsNetworksList: CommandHandler;
export declare const handleAdsNetworkInventoryShow: CommandHandler;
export declare const handleAdsNetworkShow: CommandHandler;
export declare const handleAdsNetworkCreate: CommandHandler;
export declare const handleAdsNetworkRate: CommandHandler;
export declare const handleAdsInventoryList: CommandHandler;
/**
 * Upsert one screen's advertising inventory. When the row already exists the
 * route replaces it, so the CLI reads the stored row, merges the supplied
 * changes, and writes the whole record with the current revision as its
 * precondition; an unsupplied field keeps its stored value.
 */
export declare const handleAdsInventoryUpdate: CommandHandler;
export declare const handleAdsSlotsList: CommandHandler;
export declare const handleAdsSlotsCreate: CommandHandler;
/**
 * Update one slot. The route replaces the stored definition, so the CLI reads
 * it first and writes the merged record; a rename alone keeps the accepted
 * formats, duration limits, and the rate override.
 */
export declare const handleAdsSlotsUpdate: CommandHandler;
/** Link URLs are an explicit one-time output, never logging or recovery metadata. */
export declare const handleInvitationsCreate: CommandHandler;
export declare const handleInvitationsList: CommandHandler;
export declare const handleInvitationsRevoke: CommandHandler;
export declare const handleAdsMembershipsList: CommandHandler;
/**
 * Update one membership. The route takes the policy and both scope lists, so an
 * unspecified list keeps the stored scope rather than clearing the buyer's
 * access, and the stored policy is reused when --policy is omitted.
 */
export declare const handleAdsMembershipsUpdate: CommandHandler;
export declare const handleAdsMembershipsRevoke: CommandHandler;
export declare const handleAdsCreativesList: CommandHandler;
export declare const handleAdsCreativesCreate: CommandHandler;
export declare const handleAdsCreativesShow: CommandHandler;
export declare const handleAdsCampaignsList: CommandHandler;
export declare const handleAdsCampaignsCreate: CommandHandler;
export declare const handleAdsCampaignsShow: CommandHandler;
/**
 * Quote a campaign. The route requires the current campaign revision as its
 * precondition: the operator can override it with --expect-rev, otherwise the
 * CLI reads that one campaign and uses the revision it just saw.
 */
export declare const handleAdsCampaignsPreview: CommandHandler;
export declare const handleAdsCampaignsUpdate: CommandHandler;
export declare const handleAdsCampaignsActivate: CommandHandler;
export declare const handleAdsCampaignsPause: CommandHandler;
export declare const handleAdsCampaignsResume: CommandHandler;
export declare const handleAdsCampaignsAcceptRates: CommandHandler;
export declare const handleAdsReviewsList: CommandHandler;
/**
 * The seller's preview of one submission: the dedicated review metadata route
 * returns the review and the exact creative it decided on, and nothing from the
 * buyer's wider media library.
 */
export declare const handleAdsReviewsShow: CommandHandler;
export declare const handleAdsReviewsApprove: CommandHandler;
export declare const handleAdsReviewsReject: CommandHandler;
export declare const handleAdsReportsSpend: CommandHandler;
export declare const handleAdsReportsDelivery: CommandHandler;
/**
 * Read this project's shared balance. The withdrawal section is reported as the
 * server states it: while payment rails are unconfigured the balance explains
 * that plainly instead of implying a payout path or a second wallet.
 */
export declare const handleBillingBalance: CommandHandler;
export declare const handleBillingStatement: CommandHandler;
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
export declare const handleScreenStorageForecast: CommandHandler;
export declare const handleScreenUpdate: CommandHandler;
export declare const handleScreenAssign: CommandHandler;
export declare const handleScreenSetTimezone: CommandHandler;
export declare const handleScreenArchive: CommandHandler;
export declare const handleScreenUnarchive: CommandHandler;
export declare const handleScreenDelete: CommandHandler;
export declare const handleScreenRotatePublicId: CommandHandler;
export declare const handleScreenRecover: CommandHandler;
export declare const handleScreenReload: CommandHandler;
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
export declare function formatEventLine(event: ProjectEvent): string | undefined;
/** First reconnect wait after a disconnect. Tests inject `runtime.sleep`. */
export declare const EVENT_STREAM_BACKOFF_MS = 250;
export declare const EVENT_STREAM_BACKOFF_CAP_MS = 15000;
export type { Operation };
export declare const handlePlaylistInit: CommandHandler;
export declare const handleScreenPublish: CommandHandler;
//# sourceMappingURL=commands.d.ts.map