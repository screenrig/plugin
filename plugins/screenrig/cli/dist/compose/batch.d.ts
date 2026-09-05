import { type ComposeResult } from "./compose.js";
export interface BatchPage {
    id: string;
    status: "rendered" | "failed" | "not_selected";
    output?: string;
    layout_output?: string;
    width?: number;
    height?: number;
    warnings?: ComposeResult["warnings"];
    quality?: ComposeResult["quality"];
    error?: {
        code: string;
        message: string;
    };
}
export declare function composeBatch(inputFile: string, directory: string, options?: {
    target?: {
        width: number;
        height: number;
    };
    safeArea?: boolean;
    only?: string;
}): Promise<{
    manifest: string;
    preview: string;
    rendered: number;
    failed: number;
    not_selected: number;
    pages: BatchPage[];
}>;
//# sourceMappingURL=batch.d.ts.map