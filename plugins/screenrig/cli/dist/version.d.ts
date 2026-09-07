/** Committed package.json placeholder. CI stamps the artifact; 0 is not a release. */
export declare const PLACEHOLDER_VERSION = "0.1.0";
export declare function isReleaseVersion(value: string): boolean;
export declare function isDevVersion(value: string): boolean;
export declare function isProductVersion(value: string): boolean;
export declare function untaggedDevVersion(now?: Date): string;
export declare function versionFromTag(tag: string): string | undefined;
export declare function resolveCliVersion(input?: {
    env?: Record<string, string | undefined>;
    packageVersion?: string;
    now?: Date;
}): string;
export declare const CLI_VERSION: string;
//# sourceMappingURL=version.d.ts.map