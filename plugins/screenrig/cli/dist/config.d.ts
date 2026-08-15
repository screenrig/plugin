import { chmod, mkdir, open, rename, rm, stat } from "node:fs/promises";
export interface ScreenRigConfig {
    api_url: string;
    token?: string;
    account_id?: string;
    enrollment?: {
        client_id: string;
        idempotency_key: string;
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
export interface ConfigFs {
    mkdir: typeof mkdir;
    open: typeof open;
    rename: typeof rename;
    rm: typeof rm;
    chmod: typeof chmod;
    stat: typeof stat;
    homedir: () => string;
    env: NodeJS.Dict<string>;
}
export declare function defaultConfigPath(fsLike: Pick<ConfigFs, "homedir" | "env">): string;
export declare function isWorldOrGroupReadable(mode: number): boolean;
export declare function readConfigFile(configPath: string, fsLike: ConfigFs, options?: {
    repair?: boolean;
}): Promise<ScreenRigConfig | undefined>;
export declare function writeConfigAtomic(configPath: string, config: ScreenRigConfig, fsLike: ConfigFs): Promise<void>;
export interface ConfigLockOptions {
    sleep: (ms: number) => Promise<void>;
    now: () => number;
    retryMs?: number;
    staleMs?: number;
    maxWaitMs?: number;
}
/**
 * Serialize first-use enrollment across CLI processes. The lock lives beside
 * the durable config, never in a replaceable plugin/cache directory.
 */
export declare function withConfigLock<T>(configPath: string, fsLike: ConfigFs, options: ConfigLockOptions, callback: () => Promise<T>): Promise<T>;
export interface ResolvedConfig {
    apiUrl: string;
    token?: string;
    accountId?: string;
    enrollment?: ScreenRigConfig["enrollment"];
    configPath: string;
    source: {
        apiUrl: "flag" | "env" | "config" | "default";
        token: "config" | "none";
    };
}
export declare function resolveConfig(options: {
    flags: Record<string, string | boolean>;
    fs: ConfigFs;
    repair?: boolean;
}): Promise<ResolvedConfig>;
export declare function describeToken(token: string | undefined): string;
//# sourceMappingURL=config.d.ts.map