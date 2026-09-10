export function flagString(flags, name) {
    const value = flags[name];
    return typeof value === "string" && value.length > 0 ? value : undefined;
}
export function flagBool(flags, name) {
    return flags[name] === true;
}
export function flagNumber(flags, name) {
    const value = flagString(flags, name);
    if (value === undefined) {
        return undefined;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
}
//# sourceMappingURL=command-input.js.map