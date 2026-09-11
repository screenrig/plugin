import { handlerOptionName } from "./cli-commands/aliases.js";
/** Canonical command names, excluding the executable and any supplied values. */
export function commandPath(command) {
    return command.parent ? [...commandPath(command.parent), command.name()] : [];
}
export function findCommand(root, path) {
    let command = root;
    for (const word of path) {
        const child = command.commands.find((candidate) => candidate.name() === word || candidate.aliases().includes(word));
        if (!child)
            return undefined;
        command = child;
    }
    return command;
}
/** Read explicit CLI options only; Commander defaults must not become write flags. */
export function invocationFlags(command) {
    const flags = Object.create(null);
    for (let current = command; current; current = current.parent) {
        for (const option of current.options) {
            if (current.getOptionValueSource(option.attributeName()) !== "cli")
                continue;
            const value = current.getOptionValue(option.attributeName());
            if (option.negate && value !== false)
                continue;
            if (!option.negate && option.isBoolean() && value === false)
                continue;
            flags[handlerOptionName(option)] = option.negate ? true : current.getOptionValue(option.attributeName());
        }
    }
    return flags;
}
//# sourceMappingURL=command-path.js.map