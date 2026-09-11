import { type Command, Option } from "commander";
/** Both spellings share one Commander value and validation; handlers keep their contract. */
export declare function addValueAlias(command: Command, canonical: string, legacy: string, description: string, required?: boolean): void;
export declare function handlerOptionName(option: Option): string;
export declare function optionAliases(option: Option): string[];
//# sourceMappingURL=aliases.d.ts.map