import type { ArchiveEntry } from "../pack/types.js";
export declare const SDK_PROTOCOL_VERSION = "1";
export declare const SDK_RUNTIME_PATH = "_screenrig/runtime.js";
export declare const SDK_MARKER = "data-screenrig-sdk=\"1\"";
export declare const SDK_SCRIPT_TAG = "<script src=\"./_screenrig/runtime.js\" data-screenrig-sdk=\"1\"></script>";
export interface SdkInjectionRequest {
    sdk_version?: string;
    sdk_sha256?: string;
}
export interface SdkInjectionResult {
    entries: ArchiveEntry[];
    injected: boolean;
    reason: string;
    asset_path?: string;
    asset_sha256?: string;
}
export interface SdkInjector {
    inject(entries: ArchiveEntry[], request?: SdkInjectionRequest): Promise<SdkInjectionResult>;
}
export declare class ArchiveSdkInjector implements SdkInjector {
    private readonly runtime;
    constructor(runtime: Buffer);
    inject(entries: ArchiveEntry[], request?: SdkInjectionRequest): Promise<SdkInjectionResult>;
}
export declare const defaultSdkInjector: SdkInjector;
//# sourceMappingURL=sdk-injection.d.ts.map