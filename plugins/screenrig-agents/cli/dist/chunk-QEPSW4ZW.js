import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  WEBHOOK_HANDSHAKES,
  WEBHOOK_VERIFY_ENCODINGS,
  WEBHOOK_VERIFY_VENDORS,
  verifyHeaderOption,
  verifyToleranceOption
} from "./chunk-6IS6MJCJ.js";
import {
  Option
} from "./chunk-SSQ4Z4MY.js";
import {
  requireOptionGroup
} from "./chunk-PWMFRUTA.js";

// dist/cli-commands/verify-options.js
function addVerifyOptions(command, target, update) {
  const { scope, secret } = target;
  command.addOption(new Option("--verify <VENDOR>", "".concat(scope, ": accept posts that carry this vendor's own signature in place of ").concat(secret, ", which keeps working beside it: ").concat(WEBHOOK_VERIFY_VENDORS.join(", "))).choices([...WEBHOOK_VERIFY_VENDORS]).conflicts(update ? ["clearVerify"] : [])).option("--verify-secret-file <FILE>", "".concat(scope, ": read the vendor's secret from this file, or - for stdin (never an argument): the webhook secret GitHub, Stripe, Shopify, Slack, Linear or Vercel shows, or a generic_hmac sender's. asana takes none (its handshake delivers it)")).option("--verify-header <NAME>", "".concat(scope, ": with --verify generic_hmac, the header that carries the signature"), verifyHeaderOption("--verify-header")).addOption(new Option("--verify-encoding <ENCODING>", "".concat(scope, ": with --verify generic_hmac, how the signature is written (default hex); it may begin with sha256=")).choices([...WEBHOOK_VERIFY_ENCODINGS])).option("--verify-timestamp-header <NAME>", "".concat(scope, ": with --verify generic_hmac, a header that carries the Unix time in seconds (or milliseconds, 13 digits); the signed text is then <timestamp>.<body>"), verifyHeaderOption("--verify-timestamp-header")).option("--verify-tolerance <SECONDS>", "".concat(scope, ": with --verify-timestamp-header, how far the timestamp may sit from the server's clock, 1 to 86400 (default 300)"), verifyToleranceOption).addOption(new Option("--handshake <VENDOR>", "".concat(scope, ": answer the setup challenge of a vendor that has no signature scheme here: ").concat(WEBHOOK_HANDSHAKES.join(", "), " (slack and asana answer theirs through --verify)")).choices([...WEBHOOK_HANDSHAKES]).conflicts(update ? ["clearHandshake"] : []));
  if (update) {
    command.addOption(new Option("--clear-verify", "".concat(scope, ": stop accepting a vendor's signature and forget its secret")).conflicts(["verify"])).addOption(new Option("--clear-handshake", "".concat(scope, ": stop answering the vendor handshake")).conflicts(["handshake"]));
  }
  requireOptionGroup(command, "requires", ["--verify-secret-file", "--verify"]);
  requireOptionGroup(command, "requires", ["--verify-header", "--verify"]);
  requireOptionGroup(command, "requires", ["--verify-encoding", "--verify"]);
  requireOptionGroup(command, "requires", ["--verify-timestamp-header", "--verify"]);
  requireOptionGroup(command, "requires", ["--verify-tolerance", "--verify-timestamp-header"]);
}

export {
  addVerifyOptions
};
