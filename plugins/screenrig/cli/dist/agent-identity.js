import { createDecipheriv, createHash, createPrivateKey, createPublicKey, diffieHellman, generateKeyPairSync, hkdfSync, } from "node:crypto";
import { configError, usageError } from "./problems.js";
const CONNECTION_ID = /^acn_[A-Za-z0-9_-]+$/;
const AGENT_ID = /^agt_[A-Za-z0-9_-]+$/;
const CONNECTION_TOKEN = /^sac_[A-Za-z0-9_-]{43}$/;
const BASE64URL_32 = /^[A-Za-z0-9_-]{43}$/;
const CONNECTION_FIELDS = new Set([
    "connection_id",
    "name",
    "agent_type",
    "platform",
    "version",
    "status",
    "expires_at",
    "created_at",
]);
function isDateTime(value) {
    return typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value));
}
function decodeBase64Url(value, label) {
    if (!/^[A-Za-z0-9_-]+$/.test(value)) {
        throw configError(`Agent connection ${label} is not unpadded base64url.`);
    }
    const decoded = Buffer.from(value, "base64url");
    if (decoded.toString("base64url") !== value) {
        throw configError(`Agent connection ${label} is not canonical unpadded base64url.`);
    }
    return decoded;
}
function validatePublicJwk(value, label) {
    const jwk = value;
    if (!jwk || jwk.kty !== "OKP" || jwk.crv !== "X25519" || typeof jwk.x !== "string" || !BASE64URL_32.test(jwk.x)) {
        throw configError(`Agent connection ${label} is not a valid X25519 public JWK.`);
    }
}
export function generateAgentConnectionKey() {
    const { privateKey } = generateKeyPairSync("x25519");
    const jwk = privateKey.export({ format: "jwk" });
    if (jwk.kty !== "OKP" || jwk.crv !== "X25519" || typeof jwk.x !== "string" || typeof jwk.d !== "string"
        || !BASE64URL_32.test(jwk.x) || !BASE64URL_32.test(jwk.d)) {
        throw configError("Node.js did not produce a valid X25519 connection key.");
    }
    return { kty: "OKP", crv: "X25519", x: jwk.x, d: jwk.d };
}
export function publicAgentConnectionKey(privateJwk) {
    if (privateJwk.kty !== "OKP" || privateJwk.crv !== "X25519" || !BASE64URL_32.test(privateJwk.x)
        || !BASE64URL_32.test(privateJwk.d)) {
        throw configError("Pending agent connection key is invalid.");
    }
    return { kty: "OKP", crv: "X25519", x: privateJwk.x };
}
export function agentPlatform() {
    return `${process.platform}/${process.arch}`;
}
export function validateAgent(value, expectedState) {
    const agent = value;
    if (!agent || typeof agent.id !== "string" || !AGENT_ID.test(agent.id)
        || typeof agent.name !== "string" || agent.name.length === 0
        || typeof agent.agent_type !== "string" || agent.agent_type.length === 0
        || !["pending", "active", "revoked", "cancelled", "expired"].includes(agent.state ?? "")
        || typeof agent.authenticated_requests !== "number" || typeof agent.metered_credits !== "number"
        || !isDateTime(agent.created_at) || (expectedState !== undefined && agent.state !== expectedState)) {
        throw usageError("Agent response does not match the generated Agent contract.");
    }
    return agent;
}
export function validateAgentSelfStatus(value, expectedState) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw usageError("Agent self status does not match the generated AgentSelfStatus contract.");
    }
    const status = value;
    if (typeof status.connection_ready !== "boolean") {
        throw usageError("Agent self status does not match the generated AgentSelfStatus contract.");
    }
    return { agent: validateAgent(status.agent, expectedState), connection_ready: status.connection_ready };
}
function expectedDashboardOrigin(apiUrl) {
    const api = new URL(apiUrl);
    let hostname;
    if (api.hostname === "api.screenrig.ai")
        hostname = "dashboard.screenrig.ai";
    else if (api.hostname === "api.screenrig.localhost")
        hostname = "dashboard.screenrig.localhost";
    else if (api.hostname.startsWith("api."))
        hostname = `dashboard.${api.hostname.slice(4)}`;
    else
        throw configError("Agent connection approval URL cannot be bound to this API hostname.");
    return `${api.protocol}//${hostname}${api.port ? `:${api.port}` : ""}`;
}
export function validateAgentApprovalUrl(value, apiUrl, connectionId) {
    let parsed;
    try {
        parsed = new URL(value);
    }
    catch {
        throw configError("Agent connection returned an invalid dashboard approval URL.");
    }
    if (parsed.origin !== expectedDashboardOrigin(apiUrl) || parsed.username || parsed.password || parsed.search || parsed.hash
        || parsed.pathname !== `/agents/connect/${connectionId}`) {
        throw configError("Agent connection returned an unsafe or off-origin dashboard approval URL.");
    }
    return parsed.href;
}
export function validateAgentConnectionStart(value, apiUrl) {
    const start = value;
    if (!start || typeof start.connection_id !== "string" || !CONNECTION_ID.test(start.connection_id)
        || typeof start.connection_token !== "string" || !CONNECTION_TOKEN.test(start.connection_token)
        || typeof start.approval_url !== "string" || !isDateTime(start.expires_at)) {
        throw configError("Agent connection start response does not match the generated contract.");
    }
    return {
        connection_id: start.connection_id,
        connection_token: start.connection_token,
        approval_url: validateAgentApprovalUrl(start.approval_url, apiUrl, start.connection_id),
        expires_at: start.expires_at,
    };
}
export function validateAgentConnectionEvent(value, connectionId) {
    if (!value || typeof value !== "object" || Array.isArray(value)
        || Object.keys(value).some((key) => !CONNECTION_FIELDS.has(key))) {
        throw configError("Agent connection SSE contained fields outside the status-only contract.");
    }
    const event = value;
    if (event.connection_id !== connectionId || typeof event.name !== "string" || event.name.length === 0
        || typeof event.agent_type !== "string" || event.agent_type.length === 0
        || !["pending", "approved", "connected", "denied", "expired", "cancelled"].includes(event.status ?? "")
        || !isDateTime(event.expires_at) || !isDateTime(event.created_at)) {
        throw configError("Agent connection SSE did not match the generated status contract.");
    }
    return event;
}
export function decryptAgentCredential(collection, connection) {
    if (!connection.connection_id || !CONNECTION_ID.test(connection.connection_id)) {
        throw configError("Pending agent connection identifier is invalid.");
    }
    const agent = validateAgent(collection.agent, "pending");
    const envelope = collection.credential_envelope;
    if (!envelope || envelope.algorithm !== "X25519-HKDF-SHA256-A256GCM") {
        throw configError("Agent credential envelope uses an unsupported algorithm.");
    }
    validatePublicJwk(envelope.ephemeral_public_key, "ephemeral key");
    const nonce = decodeBase64Url(envelope.nonce, "nonce");
    const sealed = decodeBase64Url(envelope.ciphertext, "ciphertext");
    if (nonce.length !== 12 || sealed.length <= 16) {
        throw configError("Agent credential envelope has invalid AES-GCM lengths.");
    }
    let plaintext;
    try {
        const privateKey = createPrivateKey({ key: connection.private_jwk, format: "jwk" });
        const ephemeralKey = createPublicKey({ key: envelope.ephemeral_public_key, format: "jwk" });
        const shared = diffieHellman({ privateKey, publicKey: ephemeralKey });
        const salt = createHash("sha256")
            .update(`screenrig/agent-credential-envelope/salt/v1\0${connection.connection_id}`)
            .digest();
        const key = Buffer.from(hkdfSync("sha256", shared, salt, Buffer.from("screenrig/agent-credential-envelope/key/v1"), 32));
        const ciphertext = sealed.subarray(0, sealed.length - 16);
        const tag = sealed.subarray(sealed.length - 16);
        const decipher = createDecipheriv("aes-256-gcm", key, nonce);
        decipher.setAAD(Buffer.from(`screenrig/agent-credential-envelope/aad/v1\0${connection.connection_id}\0${agent.id}`));
        decipher.setAuthTag(tag);
        plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    }
    catch {
        throw configError("Agent credential envelope could not be authenticated by this installation.");
    }
    let decoded;
    try {
        decoded = JSON.parse(plaintext.toString("utf8"));
    }
    catch {
        throw configError("Agent credential envelope plaintext is invalid.");
    }
    if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) {
        throw configError("Agent credential envelope plaintext is invalid.");
    }
    const record = decoded;
    if (Object.keys(record).sort().join(",") !== "agent_id,connection_id,token"
        || record.agent_id !== agent.id || record.connection_id !== connection.connection_id
        || typeof record.token !== "string" || !/^sr_live_[A-Za-z0-9_-]+_[A-Za-z0-9_-]+$/.test(record.token)) {
        throw configError("Agent credential envelope is not bound to this connection and agent.");
    }
    return { token: record.token, agentId: agent.id };
}
//# sourceMappingURL=agent-identity.js.map