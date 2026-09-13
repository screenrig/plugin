import type { CliRuntime } from "./runtime.js";
export declare function readAuthoringText(file: string, runtime: CliRuntime, maxBytes?: number): Promise<string>;
export declare function readAuthoringJson(file: string, runtime: CliRuntime): Promise<any>;
/** Exclusive creation keeps a prepared document safe from accidental replacement. */
export declare function writeAuthoringJson(file: string, document: unknown, runtime: CliRuntime, overwrite?: boolean): Promise<string>;
export declare function readInputBytes(file: string, cwd: string, runtime: CliRuntime | undefined, maxBytes: number): Promise<Buffer>;
//# sourceMappingURL=authoring-input.d.ts.map