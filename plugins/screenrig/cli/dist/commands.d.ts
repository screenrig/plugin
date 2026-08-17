import { type FeedbackContext, type Operation } from "./adapters/protocol.js";
import { type ParsedArgs } from "./argv.js";
import { successEnvelope } from "./envelope.js";
import { ExitCode } from "./exit-codes.js";
import type { CliRuntime } from "./runtime.js";
import { type TranscodeOptions } from "./media/transcode.js";
export declare const CLI_VERSION = "0.1.0";
export declare const USAGE = "screenrig \u2014 ScreenRig localhost v1 control-plane CLI\n\nUsage:\n  screenrig [--json] [--api-url URL] [--config PATH]\n            [--request-id ID] [--idempotency-key KEY] [--timeout MS]\n            <command> [args]\n\nCommands:\n  account show\n  auth status\n  auth revoke --yes\n  app pack <directory> [--output FILE]\n  app upload <directory>\n  app list\n  app show <id>\n  media upload <file> [--content-type TYPE] [--no-wait]\n                      [--no-transcode] [--codec h264|hevc] [--max-fps N]\n                      [--max-edge PIXELS] [--webp-quality 1-100] [--no-progress]\n  media show <id>\n  media list\n  media delete <id> --if-match REVISION\n  playlist create <file>\n  playlist update <id> <file> --if-match REVISION\n  playlist show <id>\n  playlist list\n  playlist delete <id> --if-match REVISION\n  screen pair CODE [--label LABEL]\n  screen provision (--open | --print-url) [--label LABEL]\n  browser setup --code CODE [--open]\n  screen update <id> [--name NAME] [--playlist-id ID] --if-match REVISION\n  screen list\n  screen show <id>\n  screen assign <id> --playlist-id ID --if-match REVISION\n  screen delete <id> --if-match REVISION\n  screen rotate-public-id <id> --if-match REVISION\n  screen revoke-credential <id> --if-match REVISION\n  screen toast <id> --level error|alert|info --text TEXT [--duration-ms MS]\n  kv get --application-id ID <key>\n  kv set --application-id ID <key> --json-value JSON [--if-match REVISION]\n  kv set --application-id ID <key> --file FILE --content-type TYPE\n  kv set --application-id ID <key> --value-base64 BASE64 --content-type TYPE\n  kv delete --application-id ID <key> --if-match REVISION\n  kv list --application-id ID\n  operations get <id>\n  operations wait <id>\n  operations cancel <id>\n  events list [--after CURSOR] [--limit N]\n  events follow [--after CURSOR]\n  feedback bug <title> (--body TEXT | --body-file FILE)\n                       [--command \"GROUP ACTION\"] [--no-context]\n  feedback feature <title> (--body TEXT | --body-file FILE)\n                       [--command \"GROUP ACTION\"] [--no-context]\n  feedback list [--kind bug|feature]\n  doctor [--repair-config]\n  version\n";
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
export type { Operation };
//# sourceMappingURL=commands.d.ts.map