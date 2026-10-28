# Data sources: cards that stay live from an outside address

A data source reads an address on a schedule and writes the result to one
card's dynamic properties, so the card stays current without republishing and
screens refetch it when it changes. One source writes one card. Use it when the
data already lives somewhere you can name (a calendar today); use `card data
put` for data you hold, and `kv webhook` for a system that pushes.

Commands go through the launcher (`SKILL.md`, "Install and call the CLI").
The help for `source create` lists the kinds; settings, status codes and
privacy rules per kind are at https://screenrig.ai/docs/sources. Changing
sources needs Manage access; `source list|show` needs Read only.

## The workflow

1. **Create the card** the data will fill, with `card create --type TYPE --file
   PARAMS.json`. A calendar fills an `events` card (an agenda of every calendar,
   merged) or a `study-rooms` card (one room per calendar). Place it on a page as
   usual; the source never needs a republish.
2. **Preview.** `source test --kind ics --card crd_ID --set
   'calendars=[{"key":"lobby"}]' --secret calendar_url.lobby=@lobby.url`
   fetches, shapes and validates against the card and writes nothing. Read
   `data.valid`, `data.warnings` (a time zone it could not place, events cut at
   a limit) and `data.document`. If `valid` is false the warning names the path
   the card refuses.
3. **Create** with the same options plus `--name`: `source create --kind ics
   --card crd_ID --name "Lobby calendar" ...`. It runs within seconds.
4. **Check.** `source show src_ID` (or `source refresh src_ID`, which syncs now
   and shows the result): `status.state` ok, `last_success_at` moving, and
   `card data get crd_ID` holds the events. Report what you saw.

`--settings JSON|@FILE|-` gives the whole config; `--set KEY=VALUE` changes one
top-level member (JSON when it parses, else text). `--config` is the CLI's
credential-file option, not the source's. `source update src_ID --set days=14`
edits the saved config; `--disable` stops the schedule and the card keeps its
last document; `source delete src_ID` does the same for good.

## Secrets

A calendar address is a credential: anyone holding a private feed address reads
the calendar. Pass it as `--secret calendar_url.KEY=@FILE` (the file holds the
address) or `=-` to read stdin, so it stays out of shell history and process
lists; at most one option reads stdin. It is stored sealed and every read shows
only the scheme and host. Never paste an address into a note, a card, a message
or a playlist. A secret is entered for the address it was entered for: if
`source update` points a source elsewhere, `source_secret_required` asks for it
again.

## Reading status

`status.state`: `pending` (not run yet), `ok`, `error` (the card keeps its last
good document; `status.error.code` and `.message` say why) or `disabled`.
`ok` means the last fetch worked and the card accepted the document; it does
not say the upstream data is right or current, or that a screen shows the card.
Failures back off by themselves; `source refresh` retries now. Common codes:
`parse_failed` (the address returned a web page: use the calendar's ICS
address), `unreachable` (public http(s) on port 80 or 443 only), `auth_failed`,
`http_status`, `card_data_invalid`. Problems on create: `source_target_taken`
(the card has a source), `source_target_unsupported` (the detail names the card
types the kind fills), `source_secret_required`, `source_limit_reached` (200).

## Calendars (`ics`)

`config`: `calendars` (1 to 60, each `{key, name?, floor?, capacity?}` with a
key of lower-case letters, digits, `-` and `_`), `days` (1 to 31, default 7),
`time_zone` (IANA, for floating times and the day boundary), `private_title`
(default `Private`). One secret per calendar: `calendar_url.KEY`. Google,
Outlook, iCloud and Nextcloud addresses, and `webcal://`, work. Set
`time_zone` when the feed names none (the warning says so). Recurrences,
exceptions and time zones are expanded on the server; events marked private or
confidential show their times only. Free (transparent) events are left out of a
`study-rooms` card. A `study-rooms` card takes one calendar per room.

<!-- sources:tabular -->

<!-- sources:rooms -->

<!-- sources:pos -->
