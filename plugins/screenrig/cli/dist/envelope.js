export function successEnvelope(data, extras) {
    return {
        ok: true,
        data,
        request_id: extras?.request_id,
        operation_id: extras?.operation_id,
        warnings: extras?.warnings ?? [],
    };
}
export function errorEnvelope(error, extras) {
    const warnings = extras?.warnings ?? [];
    return warnings.length > 0 ? { ok: false, error, warnings } : { ok: false, error };
}
//# sourceMappingURL=envelope.js.map