import type { ScreenProvisioning } from "./adapters/protocol.js";
export interface ValidatedProvisioning {
    publicUrl: string;
    provisioningUrl: string;
}
export declare function validateProvisioningUrls(value: ScreenProvisioning): ValidatedProvisioning;
//# sourceMappingURL=provisioning-url.d.ts.map