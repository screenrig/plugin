# Alert channels: Slack, Teams, PagerDuty, Telegram

`notifications create` posts to a team's chat or pager the way it emails or
POSTs a signed webhook: the same conditions, hold, `--tag` scope, snooze and
mutes, one notice per outage and screen, and a recovery notice only after that
channel's own first notice went out.

| Flag | Credential the user supplies | Notes |
| --- | --- | --- |
| `--slack URL` | A Slack incoming webhook URL (`hooks.slack.com/services/...`) | Posts a Block Kit card |
| `--teams URL` | The URL of a Teams Workflows webhook (the "When a Teams webhook request is received" trigger) | Posts an Adaptive Card. Office 365 connector URLs are retired and refused |
| `--pagerduty KEY` | An Events API v2 routing key (32 characters) | Triggers one incident per outage and screen and resolves it on recovery; `crashing` triggers an incident a person resolves |
| `--telegram TOKEN --telegram-chat CHAT_ID` | A bot token and the chat id (`-1001234567890`) or `@channelname` | Posts an HTML message |

Each needs `--conditions`. Never put the credential on the command line where
the user's shell history keeps it: pass `-` and pipe it in, as in
`printf '%s\n' "$URL" | screenrig notifications create --slack - --conditions screen_offline`.
The credential is sealed and never shown again; `notifications show ID` gives a
masked `destination_hint` (`https://hooks.slack.com/…/x9Zq`, or `…a1b2` for a key
or token) and, for Telegram, `telegram_chat_id`. Replace it with
`notifications update ID --destination -` (and `--telegram-chat ID`). A value of
the wrong shape is `notification_destination_rejected` (exit 8) and nothing is
created.

Prove the path with `notifications test ID`, then `notifications deliveries ID`:
a post is `succeeded` on a 2xx answer, otherwise it is retried for 24 hours and
`last_status` and `last_error` say why. A notification that fails for 72 hours is
disabled; fix the destination, then `notifications update ID --enable`. For
PagerDuty the test triggers an information event and resolves it at once, so no
incident stays open.

A recovered screen's message names the likely cause when `screen show` has one.
Chat notices are free.
