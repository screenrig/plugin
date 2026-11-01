# Keep cards current

screenRIG reads addresses on a schedule and accepts pushes; for everything else
you are the automation. Pick the lane by how each card's data moves.

| The data | Lane |
| --- | --- |
| Must stay live with nobody running anything: a calendar, a sheet, a JSON, CSV or XML address, Slack, social posts, reviews | A source: a preset when one exists (`source presets`), else the generic HTTP source ([sources](sources.md)) |
| Changes hourly or daily and you can read it with your own tools: a web page, a file, a database, a connector in your runtime | Your own schedule: read it, then `card data put` with `--ttl` |
| A system that pushes: a CMS, a till, GitHub, Stripe, Slack events | A card webhook, with the vendor's signature where it signs ([card webhooks](playlists.md#card-webhooks)) |

Take the first lane that fits. A source runs on screenRIG's schedule, outlives
your session and reports its own failures (`source_failed`, `source_stale`).

## Your own schedule

```sh
screenrig card data put crd_ID --file data.json --ttl 3h
```

1. Read the data with your own tools and write the card's whole document.
   `cards show TYPE` lists its dynamic properties; `card preview crd_ID` draws it.
2. Run the write from a recurring task in your runtime (a scheduled task, a
   routine, a cron job) at the data's own pace: hourly data hourly, a daily menu
   daily. A schedule that lives only in a conversation ends with it, so run it
   where it outlives the session, and tell the user where it runs and how to
   stop it.
3. Size `--ttl` to the schedule: longer than the gap between runs, so a late run
   does not blank the card, and short enough that stale data is not worth
   showing (`3h` for an hourly job, `36h` for a daily one). When it passes with
   no new write the card goes blank on every screen, offline ones included, and
   a page that depends on it through `visibility.data` falls back. Write on every
   run, changed or not: the write renews the expiry.
4. Once per project, so a stopped schedule is noticed:
   `screenrig notifications create --email owner --conditions card_data_stale`
   ([notifications](notifications.md#card_data_stale-a-scheduled-write-stops)).
5. A write that answers `rate_limited` waits `error.retry_after_seconds`; never
   write faster than the data moves.

## Systems that push

`kv webhook create --card crd_ID --map FILE` prints the sender's url and secret.
A vendor that signs its posts (GitHub, Stripe, Shopify, Slack, Linear, Vercel,
Asana, any HMAC sender) needs no header: `--verify VENDOR --verify-secret-file
FILE` lets its own signature open the webhook. Webhook data stays until the next
post, so a quiet sender keeps its last value on glass.

## Recipes

**Stock quotes.** `feeds` carries no stock quotes. Use TradingView's free widget
(ticker tape, market overview or symbol overview): on TradingView's widget page
choose the symbols, the dark theme and the size, copy the snippet, save it as one
HTML page on a host the customer controls, and play that page in an `iframe`
primitive with `content_fit: "fill"` ([dashboards](dashboards.md) shows the
primitive). The widget is a script that draws its own iframe, so it needs the
page and the screen's internet access, and Apple TV cannot show it. Leave the
TradingView link the snippet puts under the widget: it is TradingView's
attribution, and changing it is TradingView's to allow.

**Slack, Bonusly, Facebook, Instagram, Google reviews.** Each is a preset
([sources](sources.md#presets)). Create the card the preset fills, ask the
customer to save the credential to a file, preview, then create:

```sh
screenrig card create --type workplace-posts --file posts.json
screenrig source test --preset slack-channel --card crd_ID --set channel=C0123456789 --secret token=@slack.token
screenrig source create --preset slack-channel --card crd_ID --name "Announcements" --set channel=C0123456789 --secret token=@slack.token
```

`bonusly` fills `kudos`, `facebook-page` and `instagram-business` fill
`social-wall`, `google-reviews` fills `reviews`; `source presets NAME` lists the
fields and how the customer gets the credential. A preset keeps the last good
data for its stale period, and `source_failed` and `source_stale` notifications
say when it breaks.

**Microsoft Teams posts.** A card webhook created with `--handshake
microsoft_graph` answers Graph's validation request, but Graph's notifications
carry no header screenRIG verifies and name a post without its text, so a
subscription cannot fill a posts card alone. Fill a `workplace-posts` card from
something that has the text and can set a header (a Power Automate flow on "When
a new channel message is added" that posts to the webhook with `Authorization:
Bearer SECRET`), or read the channel with your own Graph access on a schedule and
`card data put` the posts with `--ttl`.
