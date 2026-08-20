export type OpenUrl = (url: string) => Promise<boolean>;
export type OpenPath = (filePath: string) => Promise<boolean>;
export declare const openExternalUrl: OpenUrl;
/** Open a local filesystem path. Refuses a NUL byte. Does not accept URLs. */
export declare const openLocalPath: OpenPath;
//# sourceMappingURL=open-url.d.ts.map