import type { DashboardLink } from "./adapters/protocol.js";
export interface ValidatedDashboardLink {
    /** Absolute link URL. The fragment holds the single-use token. */
    url: string;
    expiresAt: string;
}
/**
 * Dashboard origin the configured control-plane origin implies.
 *
 * The link is opened in a browser, so the CLI must not accept whatever origin
 * the response names. Binding it to the configured origin keeps a substituted
 * or tampered response from steering the browser somewhere else with a live
 * token in the fragment.
 */
export declare function dashboardOriginFor(apiUrl: string): string;
/**
 * Accept only `<dashboard-origin>/#link=<43 base64url characters>`.
 *
 * A query, a path, or credentials in the authority would put the token
 * somewhere a server log, a proxy, or a `Referer` header can see it, so any of
 * those is a rejection rather than something to strip and continue with.
 */
export declare function validateDashboardLink(value: DashboardLink, apiUrl: string): ValidatedDashboardLink;
//# sourceMappingURL=dashboard-link.d.ts.map