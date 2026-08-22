import type { Agent, AgentConnection, AgentConnectionStart, AgentCredentialCollection, AgentSelfStatus, X25519PublicJWK } from "./adapters/protocol.js";
import type { ScreenRigConfig } from "./config.js";
export type AgentConnectionConfig = NonNullable<ScreenRigConfig["agent_connection"]>;
export interface DecryptedAgentCredential {
    token: string;
    agentId: string;
}
export declare function generateAgentConnectionKey(): AgentConnectionConfig["private_jwk"];
export declare function publicAgentConnectionKey(privateJwk: AgentConnectionConfig["private_jwk"]): X25519PublicJWK;
export declare function agentPlatform(): string;
export declare function validateAgent(value: unknown, expectedState?: Agent["state"]): Agent;
export declare function validateAgentSelfStatus(value: unknown, expectedState?: Agent["state"]): AgentSelfStatus;
export declare function validateAgentApprovalUrl(value: string, apiUrl: string, connectionId: string): string;
export declare function validateAgentConnectionStart(value: unknown, apiUrl: string): AgentConnectionStart;
export declare function validateAgentConnectionEvent(value: unknown, connectionId: string): AgentConnection;
export declare function decryptAgentCredential(collection: AgentCredentialCollection, connection: AgentConnectionConfig): DecryptedAgentCredential;
//# sourceMappingURL=agent-identity.d.ts.map