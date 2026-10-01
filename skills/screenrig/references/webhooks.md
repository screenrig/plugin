# Webhooks

A webhook POSTs this project's own durable events to an HTTPS endpoint the
customer runs, signed with a per-webhook secret. Use it when something must
react without an agent holding `events follow` open, for example to wake an
agent or bot when:

- a kiosk application reports a check-in (`application.event`, from the app's
  `emit` or `emitConfirmed` codes)
- a screen goes dark (`screen.offline`)
- a page fails to play (`playback.page_failed`)
- a webhook stops delivering (`webhook.disabled`)

For a watch that only lasts while the agent is working, `events follow` is
simpler. A project has at most 10 webhooks.

## Commands

```bash
screenrig webhooks create --url https://hooks.example.com/screenrig --event-types "screen.offline,application.event" [--description TEXT] [--disabled]
screenrig webhooks list
screenrig webhooks show whk_EXAMPLE
screenrig webhooks update whk_EXAMPLE [--url URL] [--event-types TYPES] [--description TEXT | --clear-description] [--enable | --disable] [--expect-rev REVISION]
screenrig webhooks delete whk_EXAMPLE [--expect-rev REVISION]
screenrig webhooks rotate-secret whk_EXAMPLE [--expect-rev REVISION]
screenrig webhooks test whk_EXAMPLE
screenrig webhooks deliveries whk_EXAMPLE [--before CURSOR] [--limit N]
```

## Create

- `--url` is `https` on port 443 (the default) or 8443, and its host resolves
  only to public Internet addresses. The server checks it on every write and
  again before every delivery. A refusal is `webhook_url_rejected` (exit 8)
  with the reason in `error.detail`.
- `--event-types` takes 1 to 32 comma-separated exact types (`screen.offline`)
  or prefixes ending in `.*` (`screen.*`). Subscribe narrowly: every delivery
  wakes the receiver.
- An eleventh webhook is `webhook_limit_reached` (exit 5); delete one first.
- `--disabled` creates it without delivering until `webhooks update --enable`.

### The secret is shown once

`create` and `rotate-secret` return the signing secret in `data.secret` with
warning `webhook_secret_shown_once`. No other command returns it, and the CLI
never writes it to its config, operation log or recovery state.

Hand the secret straight to the receiver's secret store: the bot platform's
secret setting, the automation's environment variable, or the deployment's
secret manager. Never paste it into the conversation, a chat message, a
command transcript you retain, or a file in a repository. If the secret is
exposed or lost, rotate it.

After an interrupted or ambiguous `create` or `rotate-secret`, rerun the
identical command within 24 hours: it reuses the saved Idempotency-Key and the
server replays the same answer, secret included. Do not create a second
webhook to recover.

### Rotate the secret

1. `screenrig webhooks rotate-secret whk_EXAMPLE` and store the new
   `data.secret` in the receiver's secret store.
2. Keep the receiver accepting both secrets briefly: at most one attempt that
   was already in flight can still arrive signed with the old one.
3. `screenrig webhooks test whk_EXAMPLE`, then confirm the test row in
   `webhooks deliveries` succeeded before removing the old secret.

## Receive a delivery

The body is the same JSON event object that `events list` returns. The
headers are `ScreenRig-Webhook-Id`, `ScreenRig-Event-Id` (stable across
retries), and `ScreenRig-Signature: t=<unix seconds>,v1=<hex>`, where `v1` is
HMAC-SHA256 keyed with the secret string over `"<t>.<raw body>"`.

A receiver must:

1. Compute the HMAC over the raw request bytes before parsing JSON and compare
   it in constant time.
2. Reject a stale `t` (for example more than 300 seconds from its clock).
3. Deduplicate on `ScreenRig-Event-Id`: delivery is at least once and
   unordered, so the same event can arrive twice and events can arrive out of
   order. Order by the event's `sequence` or `at` when it matters.
4. Answer 2xx within 10 seconds, then do the slow work asynchronously.

```js
import { createHmac, timingSafeEqual } from "node:crypto";

function verify(rawBody, signatureHeader, secret, toleranceSeconds = 300) {
  const parts = Object.fromEntries(signatureHeader.split(",").map((part) => part.split("=", 2)));
  const t = Number(parts.t);
  if (!Number.isInteger(t) || Math.abs(Date.now() / 1000 - t) > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest();
  const given = Buffer.from(parts.v1 ?? "", "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
```

## Delivery, failure and re-enabling

- A failed attempt is retried with backoff for 24 hours.
- After 72 hours of continuous failure the webhook is disabled
  (`status: disabled`, `disabled_reason: delivery_failures`) and a
  `webhook.disabled` event is written. Watch for it with `events list` or a
  second webhook.
- `webhooks update --enable` clears the failure state and starts at the
  current event. Events from while it was disabled are not replayed; read them
  with `events list --after CURSOR`.
- `--disable` and `delete` fail pending deliveries.

## Test and inspect

`webhooks test` queues one `webhook.test` delivery to that webhook only. It is
attempted once, without retries, at most 20 per minute per project
(`rate_limited`, exit 7). Then read the log:

```bash
screenrig webhooks test whk_EXAMPLE
screenrig webhooks deliveries whk_EXAMPLE --limit 20
screenrig webhooks show whk_EXAMPLE
```

`deliveries` lists one row per event, newest first, with `state`, `attempts`,
`last_status` and a fixed `last_error` class. Pass `data.next_cursor` back as
`--before` for the next page. `webhooks show` reports `status`,
`failing_since`, `disabled_reason` and `disabled_at`.

## Recipe: trigger a Grok Bot or scheduled agent

Use a webhook to start an agent run from screen events, with the agent's own
screenRIG installation doing the work.

1. In the bot or automation platform, create an HTTPS trigger (a webhook URL
   for the Grok Bot, the scheduled agent, or the workflow runner) that verifies
   `ScreenRig-Signature` as above. Store the webhook secret in that platform's
   secret setting.
2. Point a webhook at it with the narrowest event types that need a response:

   ```bash
   screenrig webhooks create --url https://TRIGGER_URL --event-types "screen.offline,playback.page_failed" --description "Wake the fleet agent"
   ```

3. Store `data.secret` in the platform, then run `webhooks test` and confirm
   the test row in `webhooks deliveries`.
4. In the triggered agent's instructions, treat the delivered event as a
   pointer, not the whole story: read `ScreenRig-Event-Id`, the event `type`,
   `resource.id` and `cursor`, then fetch context with its own enrolled
   installation:

   ```bash
   screenrig events list --after CURSOR
   screenrig screen show SCREEN_ID
   ```

   Keep the last processed cursor in the agent's own state so each run pages
   forward from there, and skip events it has already handled.
5. Have the agent act (reload, reassign, message the human) and report, using
   the same fleet and verification rules as any other run.

The trigger URL and the webhook secret are credentials. Never place either in
a prompt, a repository, or a conversation.

## Billing

Each delivery attempt is metered like a listen-stream event: 1 credit per
billed attempt, counted against the same monthly API and listen-stream
allowance. Event types that are free on the listen stream are free as
deliveries: `screen.*`, `runtime.*`, `application.event`,
`playback.page_failed`, and `agent.command`. See
[pricing](https://screenrig.ai/pricing/) for current rates.
