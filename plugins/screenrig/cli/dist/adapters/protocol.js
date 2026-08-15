/**
 * Temporary compile-time adapter for the generated `packages/protocol` API.
 *
 * The generated package is currently private and exports TypeScript source,
 * which cannot be consumed by this independently built package without pulling
 * shared source outside `rootDir`. These definitions mirror OpenAPI v0.2.0;
 * replace them with package imports once `@screenrig/protocol` publishes JS and
 * declarations.
 */
export const DEFAULT_ARCHIVE_LIMITS = {
    application_archive_bytes: 100 * 1024 * 1024,
    application_expanded_bytes: 250 * 1024 * 1024,
    application_file_count: 5000,
    application_file_bytes: 32 * 1024 * 1024,
    application_path_depth: 16,
    application_path_bytes: 255,
};
export function limitsFromCapabilities(capabilities) {
    return {
        application_archive_bytes: capabilities.application_compressed_bytes,
        application_expanded_bytes: capabilities.application_expanded_bytes,
        application_file_count: capabilities.application_file_count,
        application_file_bytes: capabilities.application_file_bytes,
        application_path_depth: capabilities.application_path_depth,
        application_path_bytes: capabilities.application_path_bytes,
    };
}
export const TEMPORARY_PROTOCOL_VERSION = "screenrig.cli.adapter/0";
//# sourceMappingURL=protocol.js.map