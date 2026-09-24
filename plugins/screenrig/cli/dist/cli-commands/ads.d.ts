import type { CommandActionBinder } from "./types.js";
import { type Command } from "commander";
/**
 * Advertising commands. Buyer operations act through invited memberships;
 * seller operations act on the calling project's own network and inventory. No
 * command here mutates a wallet: a draft is not spending, and a campaign only
 * becomes deliverable through an explicitly accepted, unexpired quote.
 */
export declare function registerAdsCommands(root: Command, bind: CommandActionBinder): void;
//# sourceMappingURL=ads.d.ts.map