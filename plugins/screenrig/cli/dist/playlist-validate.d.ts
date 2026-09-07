import { type LintFinding } from "./compose/lint.js";
export declare const PLAYLIST_SERVER_CHECKS: string[];
export declare function playlistIssues(value: unknown): Array<{
    path: string;
    message: string;
}>;
export declare function assertPlaylistValid(value: unknown): void;
export declare function playlistLint(value: unknown): LintFinding[];
//# sourceMappingURL=playlist-validate.d.ts.map