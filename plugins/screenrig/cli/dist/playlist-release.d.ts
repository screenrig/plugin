import { ApiClient } from "./client.js";
import type { Screen } from "./adapters/protocol.js";
/** Review is a snapshot; the existing API atomically guards playlist revision only. */
export declare function replacePlaylistRelease(options: {
    client: ApiClient;
    apiUrl: string;
    playlistId: string;
    pageId: string;
    primitiveId: string;
    releaseId: string;
    apply: boolean;
    revision?: string;
    impact?: string;
}): Promise<{
    impact: string;
    applied: boolean;
    playlist_id: string;
    playlist_name: any;
    revision: number;
    page_id: string;
    primitive_id: string;
    previous_release_id: any;
    release_id: string;
    affected_screens: Pick<Screen, "id" | "state" | "label" | "revision">[] | undefined;
    consequence: string;
} | {
    impact: string;
    applied: boolean;
    unchanged: boolean;
    playlist: unknown;
    playlist_id: string;
    playlist_name: any;
    revision: number;
    page_id: string;
    primitive_id: string;
    previous_release_id: any;
    release_id: string;
    affected_screens: Pick<Screen, "id" | "state" | "label" | "revision">[] | undefined;
    consequence: string;
} | {
    impact: string;
    applied: boolean;
    playlist: unknown;
    playlist_id: string;
    playlist_name: any;
    revision: number;
    page_id: string;
    primitive_id: string;
    previous_release_id: any;
    release_id: string;
    affected_screens: Pick<Screen, "id" | "state" | "label" | "revision">[] | undefined;
    consequence: string;
}>;
//# sourceMappingURL=playlist-release.d.ts.map