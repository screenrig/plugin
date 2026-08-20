import type { SpaceScale, TypeRamp } from "./types.js";
interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface LayoutDump {
    type: string;
    role?: string;
    pin?: string;
    box?: Box;
    fit?: {
        fontSize: number;
        lineHeight: number;
        lines: string[];
        truncated: boolean;
    };
    children?: LayoutDump[];
}
export interface ComposeResult {
    layout: LayoutDump;
    space: SpaceScale;
    ramp: TypeRamp;
    font_family: string;
    truncated: boolean;
    width: number;
    height: number;
}
export declare function resolveFontFamily(name: string | undefined): string;
export declare function resolveImagePath(src: string, baseDir: string): string;
export declare function composeSpec(spec: unknown, options: {
    baseDir: string;
    outPath?: string;
    layoutOutPath?: string;
}): Promise<ComposeResult & {
    png: Buffer;
}>;
export {};
//# sourceMappingURL=compose.d.ts.map