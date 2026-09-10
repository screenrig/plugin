/** Declarative command inputs for the Commander tree. */
export interface CommandSpec {
    readonly path: readonly string[];
    readonly arguments?: string;
    readonly aliases?: readonly (readonly string[])[];
    readonly flags: readonly string[];
    readonly requiredFlags?: readonly string[];
}
export declare const GLOBAL_FLAGS: readonly ["json", "api-url", "config", "request-id", "idempotency-key", "timeout", "beta-key", "token"];
export declare const COMMAND_SPECS: readonly CommandSpec[];
//# sourceMappingURL=command-spec.d.ts.map