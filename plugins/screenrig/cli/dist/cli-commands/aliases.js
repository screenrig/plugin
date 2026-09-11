import { Option } from "commander";
const handlers = new WeakMap();
const aliases = new WeakMap();
/** Both spellings share one Commander value and validation; handlers keep their contract. */
export function addValueAlias(command, canonical, legacy, description, required = false) {
    const placeholder = canonical === "--name" ? "NAME" : "ID";
    const option = new Option(`${canonical} <${placeholder}>`, `${description} (${legacy} alias)`);
    if (required)
        option.makeOptionMandatory();
    const alias = new Option(`${legacy} <${placeholder}>`, `Alias for ${canonical}`).hideHelp();
    alias.attributeName = () => option.attributeName();
    handlers.set(option, legacy.slice(2));
    handlers.set(alias, legacy.slice(2));
    aliases.set(option, [legacy]);
    command.addOption(option).addOption(alias);
}
export function handlerOptionName(option) {
    return handlers.get(option) ?? (option.long === "--expect-rev" ? "if-match" : option.long.slice(2));
}
export function optionAliases(option) { return aliases.get(option) ?? []; }
//# sourceMappingURL=aliases.js.map