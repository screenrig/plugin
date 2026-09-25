import type { Warning } from "./envelope.js";
import type { Webhook, WebhookDelivery } from "./adapters/protocol.js";
/** Backend Webhook.id and WebhookDelivery cursor shapes (vendor/openapi.yaml). */
export declare const WEBHOOK_ID_PATTERN: RegExp;
export declare const WEBHOOK_DELIVERY_CURSOR_PATTERN: RegExp;
export declare const WEBHOOK_EVENT_TYPES_MAX = 32;
export declare const WEBHOOK_DESCRIPTION_MAX = 200;
export declare const WEBHOOK_DELIVERIES_LIMIT_MAX = 200;
export declare function webhookId(value: string | undefined, command: string): string;
/** Comma-separated exact types (screen.online) or prefixes ending in .* (screen.*), 1 to 32, unique. */
export declare function webhookEventTypes(value: string): string[];
/**
 * Only the scheme, userinfo, fragment, and length are checked locally. The server owns the port rule
 * and the public-address check (it resolves the host), and its reason is shown
 * verbatim on webhook_url_rejected.
 */
export declare function webhookUrl(value: string): string;
export declare function webhookDescription(value: string): string;
export declare function webhookDeliveryCursor(value: string): string;
export declare function webhookDeliveriesLimit(value: string): string;
export declare function webhookSecretWarning(id: string, action: "create" | "rotate"): Warning;
/** Map webhook problems to actionable guidance; exit codes stay status-derived (400 → 8, 409 → 5, 412 → 6). */
export declare function webhookProblem(error: unknown, id?: string): unknown;
export declare function webhookLines(webhook: Webhook | undefined): string[];
export declare function webhookTableLines(items: Webhook[]): string[];
export declare function deliveryTableLines(items: WebhookDelivery[]): string[];
//# sourceMappingURL=webhooks.d.ts.map