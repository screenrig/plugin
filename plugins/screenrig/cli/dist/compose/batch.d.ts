import { type ComposeQuality, type ComposeWarning } from "./compose.js";
import { type LintFinding } from "./lint.js";
export declare const COMPOSE_BATCH_MIN_PAGES = 1;
export declare const COMPOSE_BATCH_MAX_PAGES = 2000;
export declare const COMPOSE_BATCH_CHUNK_SIZE = 100;
export interface BatchPage {
    id: string;
    status: "rendered" | "failed" | "not_selected";
    output?: string;
    width?: number;
    height?: number;
    warnings?: ComposeWarning[];
    quality?: ComposeQuality;
    lint?: LintFinding[];
    error?: {
        code: string;
        message: string;
    };
}
export interface BatchChunkTiming {
    index: number;
    pages: number;
    duration_ms: number;
}
export interface BatchResult {
    manifest: string;
    preview: string;
    rendered: number;
    failed: number;
    not_selected: number;
    pages: BatchPage[];
    chunks: number;
    chunk_timings: BatchChunkTiming[];
    lint: LintFinding[];
}
export declare function composeBatch(inputFile: string, directory: string, options?: {
    target?: {
        width: number;
        height: number;
    };
    safeArea?: boolean;
    only?: string;
    lintOnly?: boolean;
}): Promise<BatchResult>;
//# sourceMappingURL=batch.d.ts.map