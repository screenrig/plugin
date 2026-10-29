# Data sources: cards that stay live from an outside address

A data source reads an address on a schedule and writes the result to one
card's dynamic properties, so the card stays current without republishing and
screens refetch it when it changes. One source writes one card. Use it when the
data already lives somewhere you can name (a calendar, a Google Sheet, a CSV
file, a JSON API, room calendars, a Square or Shopify till); use `card data put`
for data you hold, and `kv webhook` for a system that pushes.

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

## Sheets, CSV and JSON (`sheets`, `csv`, `json`)

These fill any card. The settings carry a `mapping`, a JSON template that builds
the card's data from what was read; the card's own schema decides whether the
result is accepted, so `source test` is the loop: edit the mapping until
`data.valid` is true.

- `sheets`: `{url, sheet?, header_row, key_column?, mapping}`, no secret. The
  sheet must be shared (Share, General access, Anyone with the link, Viewer) or
  published to the web, else the status is `not_shared`: ask its owner, never
  sign in for them. `url` is the link they copy; `sheet` names a tab.
- `csv`: `{url, delimiter?, header_row, key_column?, auth, header_name?, mapping}`.
  `json`: `{url, auth, header_name?, rows_path?, key_field?, mapping}`.
- `auth` is `none`, `bearer` or `header` (with `header_name`, such as
  `X-API-Key`). The token is `--secret token=@FILE`, sent only to the address's
  own origin: pointing the source at another site asks for it again.

Mapping roots. Tables: `rows` (objects by column key), `columns` (`[{key,
name}]`) and, with `key_column`, `by_key`. JSON: `body` and, with `rows_path`
plus `key_field`, `by_key`. A header becomes a key in lower case with `_` for
anything else (`Sold out` is `sold_out`). Prefer `by_key` to positions: a key
keeps pointing at its row when someone sorts the sheet. Cells are text:
`{"$number": "{{item.price}}"}` reads `$4.50` or `3,50` (with `"$decimal": ","`),
`{"$bool": "{{item.sold_out}}"}` reads yes, x or 1. `{"$each": "{{rows}}",
"$template": T}` maps a list; `{"$group": "{{rows}}", "$by": "{{item.section}}",
"$template": T}` groups, with `group.key` and `group.items` inside. A missing
column leaves its member out, and the card then names what it lacks.

A `menu` sheet with columns Section, Item, Price:

    {"sections": {"$group": "{{rows}}", "$by": "{{item.section}}", "$template": {
      "name": "{{group.key}}",
      "items": {"$each": "{{group.items}}", "$template": {
        "name": "{{item.item}}", "price": {"$number": "{{item.price}}"}}}}}}

A `kpi` sheet with columns Metric, Value and `key_column` Metric:

    {"tiles": [{"label": "Revenue", "value": {"$number": "{{by_key.Revenue.value}}"}}]}

To see what a source reads, test with the mapping `{"columns": "{{columns}}",
"rows": "{{rows}}"}`: the card refuses it, and `data.document` shows every key
and row. `parse_failed` means the address returned a web page or a file that is
not CSV text or JSON; `not_shared` names the sharing setting to change.
Warnings count repeated keys and cut rows (10,000 rows, 200 columns) without
quoting the data.

<!-- sources:rooms -->

## Meeting rooms (`microsoft365`, `google_calendar`)

A room's calendar fills a `room` card (the door sign of exactly one room) or a
`room-board` card (a building's rooms, up to 60). Create the card first
(`card create --type room ...` with `room`, `capacity`, `showOrganizer`;
`--type room-board` with `showTitles`). The cards take no input and the
sources only read, so nothing is booked, ended or checked in from a screen; the
card works out free, in use and next on the screen every second, so a sign
stays right while its screen is offline. An `ics` calendar fills the same
cards.

- **`microsoft365`** reads Exchange Online room mailboxes with the customer's
  own Microsoft Entra app. Config: `tenant` (directory id or verified domain,
  never `common`, `organizations` or `consumers`), `client_id`, `rooms`
  (`[{key, email, name?, floor?, capacity?}]`), `days`, `time_zone`,
  `private_title`. Secret `client_secret` (the secret's Value):
  `--secret client_secret=@secret.txt`. The app needs the Microsoft Graph
  application permission `Calendars.Read` with admin consent.
- **`google_calendar`** reads resource calendars as the customer's service
  account. Config: `rooms` (`[{key, calendar_id, name?, floor?, capacity?}]`),
  `subject?` (domain-wide delegation), `days`, `time_zone`, `private_title`.
  Secret `service_account_key`: the JSON key file as Google issues it,
  `--secret service_account_key=@key.json`; the secret's hint is the account's
  address, which each room calendar is shared with (See all event details).

The customer's administrator does the setup on their side; ask for no admin
credentials. Give them the Exchange commands that scope the app to the room
mailboxes (`New-ApplicationAccessPolicy -AppId CLIENT_ID -PolicyScopeGroupId
GROUP -AccessRight RestrictAccess`, checked with `Test-ApplicationAccessPolicy
-AppId CLIENT_ID -Identity ROOM`) and, for meeting titles to show,
`Set-CalendarProcessing -Identity ROOM -DeleteSubject $false
-AddOrganizerToSubject $false`. Both secrets go in only as `@FILE` or `-`.

Preview with `source test` and read `data.stats`: `rooms`, `events`, one
`events_KEY` per room (compare with what the customer sees in their calendar)
and, for Microsoft 365 when the app also holds `Place.Read.All`, `places_rooms`.
Set `time_zone` (otherwise days start at UTC midnight and a warning says so).
Free time is not a booking, tentative counts as busy, private and confidential
meetings carry `private_title` and no organizer. The document carries titles
and organizers; a `room` card draws organizers only with `showOrganizer` and a
`room-board` titles only with `showTitles`.

Errors quote Microsoft's or Google's own text. `auth_failed` with an `AADSTS`
code or `invalid_grant` is a wrong secret, tenant or key, or a missing consent
or delegation: the customer fixes it on their side, then `source refresh`.
`config_invalid` names the room's address when no calendar can be found or
seen. One room failing fails the sync and names the room (`Room KEY: ...`);
the card keeps its last good document.

<!-- sources:pos -->
