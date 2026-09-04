import { chmod, mkdir, open, rename, rm, stat } from "node:fs/promises";
import type { OperationLogger } from "./log/types.js";
export interface ScreenRigConfig {
    api_url: string;
    token?: string;
    /** Path to an already-listening AF_UNIX socket for NDJSON operation logs. */
    log_socket?: string;
    account_id?: string;
    agent_id?: string;
    last_agent?: {
        id: string;
        name: string;
        agent_type: string;
        state: "revoked";
        revoked_at?: string;
    };
    agent_connection?: {
        private_jwk: {
            kty: "OKP";
            crv: "X25519";
            x: string;
            d: string;
        };
        name?: string;
        connection_id?: string;
        connection_token?: string;
        approval_url?: string;
        expires_at?: string;
        pending_agent_id?: string;
    };
    enrollment?: {
        client_id: string;
        idempotency_key: string;
        /** Exact trimmed contact address retained only until enrollment verifies. */
        email?: string;
    };
    screen_provision?: {
        idempotency_key: string;
        label?: string;
    };
    browser_setup?: {
        idempotency_key: string;
        code: string;
    };
    updated_at?: string;
}
export declare const DEFAULT_API_URL = "https://api.screenrig.ai";
export declare const LOCAL_DEV_API_URL = "http://api.screenrig.localhost:8088";
export interface ConfigFs {
    mkdir: typeof mkdir;
    open: typeof open;
    rename: typeof rename;
    rm: typeof rm;
    chmod: typeof chmod;
    stat: typeof stat;
    homedir: () => string;
    env: NodeJS.Dict<string>;
    logger?: OperationLogger;
}
export declare function defaultConfigPath(fsLike: Pick<ConfigFs, "homedir" | "env" | "stat">): Promise<string>;
export declare function isWorldOrGroupReadable(mode: number): boolean;
export declare function readConfigFile(configPath: string, fsLike: ConfigFs, options?: {
    repair?: boolean;
}): Promise<ScreenRigConfig | undefined>;
/**
 * Keep `log_socket` across rewrites that build a fresh object. Spread
 * `current` first when the rest of the file should survive; use this when
 * the write is intentionally sparse (enrollment pending, disconnect).
 */
export declare function preserveLogSocket(current: ScreenRigConfig | undefined, next: ScreenRigConfig): ScreenRigConfig;
export declare function writeConfigAtomic(configPath: string, config: ScreenRigConfig, fsLike: ConfigFs): Promise<void>;
export interface ConfigLockOptions {
    sleep: (ms: number) => Promise<void>;
    now: () => number;
    retryMs?: number;
    staleMs?: number;
    maxWaitMs?: number;
}
/**
 * Serialize explicit enrollment across CLI processes. The lock lives beside
 * the durable config, never in a replaceable plugin/cache directory.
 */
export declare function withConfigLock<T>(configPath: string, fsLike: ConfigFs, options: ConfigLockOptions, callback: () => Promise<T>): Promise<T>;
export interface ResolvedConfig {
    apiUrl: string;
    token?: string;
    accountId?: string;
    agentId?: string;
    enrollment?: ScreenRigConfig["enrollment"];
    agentConnection?: ScreenRigConfig["agent_connection"];
    lastAgent?: ScreenRigConfig["last_agent"];
    configPath: string;
    logSocket?: string;
    source: {
        apiUrl: "flag" | "env" | "config" | "local-dev" | "default";
        token: "config" | "none";
    };
}
export declare function validateLogSocketPath(value: unknown, fsLike: Pick<ConfigFs, "stat">): Promise<string | undefined>;
export declare function resolveConfig(options: {
    flags: Record<string, string | boolean>;
    fs: ConfigFs;
    repair?: boolean;
}): Promise<ResolvedConfig>;
/** Whether this installation holds a credential at all. */
export declare function hasToken(token: string | undefined): boolean;
/**
 * Presence of a credential, for stdout. Every part of a live token is
 * secret, including the lookup segment, so no shape, prefix, or suffix of
 * the stored value is reported here.
 */
export declare function describeTokenPresence(token: string | undefined): string;
//# sourceMappingURL=config.d.ts.map