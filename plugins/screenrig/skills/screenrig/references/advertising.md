# Advertising

Advertising runs on the same CLI. Advertisers pay in US dollars by card or x402
machine payment, and sellers' earnings are dollars. `advertiser`
and `screens` are independent project features: a project can buy ads, sell its
own inventory, do both or neither. Read `screenrig project capabilities` first;
the server's answer wins over anything cached. Flags and examples:
`screenrig ads --help` and the [CLI reference](https://screenrig.ai/docs/cli.md).

## Buying

1. A person claims the emailed buyer invitation in the dashboard; admission is
   by invitation only. `ads networks list|show` reads the sellers, screens, slots
   and per-play rates this membership permits. An empty list means no permission.
2. Read `billing balance` (the project's funds for ads), upload creative with `media upload`, bind it with
   `ads creatives create --media-id ID --copy TEXT`.
3. `ads campaigns create FILE` drafts a campaign (networks, scope, flight,
   `image_duration_ms`, `max_play_price_mcr`, daily and lifetime caps). Money fields
   (`*_mcr`) are exact decimal strings. A draft spends nothing and is not permission to buy.
4. `ads campaigns preview ID` returns the quote; show the user the prices,
   flight and caps. Only with the user's explicit authority run
   `ads campaigns activate ID --quote-id QUOTE --expect-rev REV`. Activation
   reserves nothing; each play is held and settled on verified completion.
   Pending review is not running.
5. Monitor with `ads reports spend`; `pause` and `resume` need the current
   revision. A seller rate change sets `price_change_pending`, which only
   `preview` then `accept-rates --quote-id ... --expect-rev ...` clears; a
   payment or `resume` does not. `quote_stale` means re-preview.

## Selling

Opt screens in with `ads inventory update`, set the network and default rate
(`ads network create|rate`), define slots (`ads slots create|update`; `--vast-tag-url`
sets your own VAST fallback), invite buyers (`invitations create --kind ad-buyer --email ADDRESS --screen-id ID
--slot-id ID --policy trusted|review_required`), and approve or reject
review-required creatives with `ads reviews`. Manage access with
`ads memberships`. Report with `ads reports delivery`. A slot alone places no
ad: add an `adslot` page to a playlist (see [playlists](playlists.md)) and check
the assigned Players support it. Tags are public venue metadata, never
individual demographics. `--impressions-per-hour N` records the seller's
audience estimate for a screen; reports then show `estimated_impressions`
(per play: N × seconds played ÷ 3600). Prices stay per play.

## Direct campaigns

A direct campaign is the seller's own deal with an advertiser who does not use
screenRIG. It plays on the project's opted-in screens and moves no money: the
seller bills the advertiser, and the recorded `price` (`cpm` or `flat` with a
currency) only values the report. `ads direct create FILE` takes `name`,
`advertiser`, an optional `category`, the flight, `media_ids` (the project's own
ready images or videos), an optional `goal_plays` and targeting (`screen_ids`,
`slot_ids`, `venue_types`, `cities`, `tags`, `dayparts`; an empty list means all).

- Direct campaigns fill a slot before invited buyers. A goal is paced evenly
  across the flight and plays first while behind; a campaign without a goal takes
  every slot it fits during its flight.
- Read `ads direct availability FILE` before booking a goal and show the user the
  estimate. A goal above it is refused with `goal_overbooked`; add
  `"overbook": true` only on the user's explicit decision.
- `category` keeps competitors apart: two ads of one category never play in the
  same break. Marketplace campaign drafts take the same `category`.
- `ads direct pause|resume|end ID --expect-rev REV` and `ads direct update ID
  FILE --expect-rev REV` operate it; `end` is final.
- `ads direct report ID --format csv` is the advertiser's proof: plays against the
  goal, pace, value and rows by day, screen and media. `ads reports fill` shows
  how the project's ad slots were filled and why the rest were not.

## Payment and payouts

Advertisers pay by card or x402 machine payment, and prices and earnings are
dollars. Seller payouts start 1 January 2027; the dashboard's financial
administrator withdraws, and the CLI has no cash-out. A campaign on the
project's own network is a direct campaign; a marketplace buy there is refused
(`self_deal`). On `insufficient_credits` send the user to the dashboard to add
funds by card or x402 payment, and invent no payment command. `capability_required` and
`invitation_*` errors are final until the cause changes. Ad playback evidence is
not an audited audience count.
