import type { CommandActionBinder } from "./types.js";
import type { Command } from "commander";
/**
 * Project credit reads. These are bearer-authorized reads of this project's own
 * balance and posted journal. No command here grants credits, pays out, or
 * changes a payment destination; cash top-ups and withdrawals belong to the
 * verified dashboard financial flow.
 */
export declare function registerBillingCommands(root: Command, bind: CommandActionBinder): void;
//# sourceMappingURL=billing.d.ts.map