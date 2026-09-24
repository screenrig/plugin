import type { ProjectCapabilities } from "./adapters/protocol.js";
import type { ApiClient } from "./client.js";
import type { ProblemNext } from "./envelope.js";
/** Reject a body that does not match the generated project capabilities contract. */
export declare function validateProjectCapabilities(value: unknown): ProjectCapabilities;
/**
 * Refuse a capability-gated write when the server's own capability set does not
 * grant it.
 *
 * Discovery is a required part of the current contract, so an unreadable or
 * malformed capability response fails closed: the write is refused rather than
 * attempted without a preflight. No plan label, numeric quota, or previously
 * read capability is accepted as authority, and a server denial still wins.
 */
export declare function requireCapability(client: ApiClient, capability: string, action: string, next: ProblemNext): Promise<void>;
//# sourceMappingURL=project-capabilities.d.ts.map