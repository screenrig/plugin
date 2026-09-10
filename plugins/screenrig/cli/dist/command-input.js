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
/** Normalize the legacy spelling before Commander validation; never inspect operands. */
export function normalizeRevisionArgs(argv) {
    let ended = false;
    return argv.map((arg) => {
        if (arg === "--")
            ended = true;
        if (ended)
            return arg;
        if (arg === "--if-match")
            return "--expect-rev";
        if (arg.startsWith("--if-match="))
            return "--expect-rev=" + arg.slice(11);
        return arg;
    });
}
//# sourceMappingURL=command-input.js.map