import { ApiClient } from "./client.js";
import type { CliRuntime } from "./runtime.js";
/** Multi-request publishing is resumable, not atomic. The journal contains no authored content. */
export declare function publishScreen(options: {
    client: ApiClient;
    runtime: CliRuntime;
    configPath: string;
    apiUrl: string;
    screenId: string;
    revision: string;
    document: any;
    requestedKey?: string;
}): Promise<{
    playlist_id: string;
    playlist_revision: number;
    screen_id: string;
    screen_revision: number;
    assignment_verified: boolean;
    playback_verified: boolean;
    journal: string;
}>;
//# sourceMappingURL=screen-publish.d.ts.map