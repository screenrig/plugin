# Screen operations, comments, events and feedback

## Screens

```bash
screenrig screen list
screenrig screen show scr_EXAMPLE
screenrig screen update scr_EXAMPLE --name "Lobby" --playlist-id pl_EXAMPLE
screenrig screen assign scr_EXAMPLE --playlist-id pl_EXAMPLE
screenrig screen set-timezone scr_EXAMPLE --timezone America/Los_Angeles
screenrig screen archive scr_EXAMPLE
screenrig screen unarchive scr_EXAMPLE
screenrig screen reload scr_EXAMPLE
screenrig screen toast scr_EXAMPLE --text "Updated lobby loop" --level info
screenrig screen screenshot scr_EXAMPLE --output ./lobby.webp
screenrig screen tag scr_EXAMPLE --set Lobby,Floor2
screenrig screen list --tag Lobby
screenrig screen storage-forecast scr_EXAMPLE --playlist-id pl_EXAMPLE
```

`screen list` omits archived screens. `screen list --state archived` lists
archived screens only. `screen show <id>` still returns an archived row.
`screen delete` is not a de-associate; it returns `screen_archive_required`.

`screen show <id>` prints the GET screen JSON. After a player reports a
playback surface, the body may include optional `observation`: `observed_at`
and `surfaces`. The same GET always includes `online` and `tags`. Optional
`last_online_at` and `last_ip` appear after the first connect. They are
read-only.

When a screen's Player cannot show the application or iframe primitives in its
playlist, `screen show` reports `applications_unsupported` with the time the
condition began, and `screen list` marks the row. The manifest is unchanged;
the Player skips those primitives, and skips a page left with none.

`screen screenshot <id>` blocks until a still WebP is on disk. The default
path is `./<id>.webp`. `--timeout` defaults to 35000 ms and `--poll-ms`
defaults to 500 ms. There is no `--no-wait`. The returned still is a 960×540
quarter-resolution WebP: use it for layout proof, not as a full-resolution
asset or pixel-quality proof. Do not print pixels.

`screen toast` is the agent mark on a live wall. `--level` is `info`,
`alert`, or `error`. Omitted `--level` defaults to `info`. The hosted Player shows error toasts; info and alert are diagnostic levels
that may be suppressed by the Player. A successful command does not prove visibility. `--text` is 1 to
120 characters. `--duration-ms` is optional, 2000 through 60000; omitted
values default to 10000 on the server.

`playback list` returns daily playback aggregates for this project. One row
per screen, media, and UTC day. Newest days first. `--screen-id`,
`--media-id`, and `--day YYYY-MM-DD` filter the caller's own rows. Each row
carries the server-resolved `filename` and `primitive` (`image` or `video`);
`primitive` is absent on rows last aggregated before players reported image
starts, so do not require it.

### Player storage

A native Player caches the images, videos and application packages its
playlist needs. When it reports its storage, `screen show` includes read-only
`storage`, `storage_forecast` and, while content does not fit,
`storage_shortfall`. They are health information, never permission, and
absent until the Player reports; treat an absent forecast as unknown, not as a
fit. Treat `storage.received_at` older than 24 hours as stale.

- `storage_forecast`: `fit` (`fits`, `partial` or `none_fit`) and
  `excluded_page_count` for the screen's assigned content against its last
  reported capacity. It is recomputed when that content changes.
- `storage_shortfall`: present while the Player reports `fit` `partial`,
  `transition_blocked` or `none_fit`, with `at`, `required_bytes`,
  `capacity_bytes` and `excluded_page_count`. Its start and end appear in
  `events list` as `screen.storage_shortfall` and
  `screen.storage_shortfall_cleared`.
- `storage.plan` names each excluded page in `excluded_pages` with its
  `reason`; `headroom_needed_bytes` is how much more space a blocked change needs.

`partial` shows a deterministic subset, anchored by the first page with no
`visibility` rule: then the first page of each visibility schedule, then the
remaining pages in playlist order while they fit. Excluded pages are skipped,
not retried. `transition_blocked` keeps the current content on glass because
the new anchor page cannot be downloaded beside it. `none_fit` means even the
anchor page does not fit. iframe, browser application and adslot pages use no
Player storage.

Before assigning a large playlist, dry-run it against each target:

```bash
screenrig screen storage-forecast scr_EXAMPLE --playlist-id pl_EXAMPLE [--playlist-rev 7]
```

It answers `fit`, `excluded_page_count`, and bytes required versus capacity
from the screen's last reported storage, with the same target selection as
`storage_forecast` in `screen show`, and writes nothing: no assignment, no
screen revision, no event. `fit` is `unknown` when the screen never reported
storage or the playlist's content is not ready; the byte counts are then
null. A report older than 24 hours is marked stale and still forecast from.
`--playlist-rev` refuses a playlist that changed since you read it with
`revision_conflict`. Right after assignment, read the forecast again, since it
then reflects the new content before the Player finishes downloading. After
publishing, watch for `screen.storage_shortfall` events or `storage_shortfall`.
For `partial`, `transition_blocked` or `none_fit`, make the content smaller:
use smaller renditions, fewer or shorter videos, remove unused pages, or split
the playlist so each screen carries less. Put the page that must always show
first. Content delivery is billed per download, so settle the playlist before
publishing instead of republishing variations the Player must fetch again.

### Archived screens and recovery

`screen archive` removes the screen from the default list, releases its screen
quota, and darkens the display. It keeps the display's binding: the Player stays
connected, never re-pairs, and resumes on `screen unarchive`. To retire
hardware, leave the screen archived or move it to new hardware with
`screen recover`.

A screen is also archived when its Player is reset on the display
(`archive_reason: device_reset`) or a paired browser unpairs itself
(`device_unpair`). A project or dashboard archive reports `project`. `screen
show` prints `archive_reason` and `archived_at` when the server reports them,
and `screen list --state archived` adds a `REASON` column. Treat an unknown
reason as archived; do not guess its cause.

`screen unarchive <id>` restores a screen archived for any reason. It re-admits
the same display key, so a display that still holds it resumes with no
re-pairing. The screen must still fit the project's screen quota. A Player
reset on the display rotates its own key, and a browser that unpaired itself
loses its cookies, so neither holds the archived screen's key any more:
unarchive alone does not bring that display back, and it gives content to
whatever still holds the old key. A kept binding is still a credential.

A display reset on the device starts pairing with a new key. When that
pairing is offered as a recovery of the archived screen, `screen show`
reports `recovery_pending`. Confirm with the user that it is the same display,
then run `screen recover <id>`, which moves the screen to the new key. The
screen stays archived until `screen unarchive <id>`. A key retired by a
confirmed `screen recover` stays retired. Recovery needs a native Player's
hardware identifiers, so an unpaired browser is never offered one. When no
recovery is offered, or no archived screen matches (older servers do not
archive on reset), pair the code as a new screen only after the user confirms,
and leave the old screen archived.

```bash
screenrig screen list --state archived
screenrig screen show scr_EXAMPLE
screenrig screen recover scr_EXAMPLE   # only when recovery_pending and confirmed
screenrig screen unarchive scr_EXAMPLE
```

### Reload

`screen reload <id>` asks the screen's Player to reload once and returns
`reload_id` and `expires_at`, ten minutes after the request. A web Player reloads at its
next page boundary; a native Player reconnects, refetches its manifest, and
checks for an update. The Player reloads once, and ignores a reload within
ten minutes of the last one it acted on.
It works on active and archived screens and does not change the screen
revision; `--expect-rev` is optional. A screen still waiting to pair answers
`resource_conflict`. An older server without the route returns an error that
says so; nothing was sent. Acceptance does not prove the reload happened;
check with `screen screenshot` or events.

## Fleets: tags and fleet actions

Tags name screens by location and role so one command reaches the right set.
A screen carries 0 to 16 unique tags, each 1 to 32 letters or digits (no
spaces, hyphens or underscores). Tags select fleets; they are never
authorization and never reach the Player. Changing tags bumps the screen
revision, not the manifest revision.

### Tag at pairing time

Tag each screen right after `screen pair` or `browser setup`, while the human
standing at the display can confirm where it is and what it does. Agree the
vocabulary with the user once, for example a location tag (`Lobby`,
`Floor2`, `StoreBerlin`) plus a role tag (`Menu`, `Wayfinding`, `Queue`):

```bash
screenrig screen pair 234567 --name "Lobby left"
screenrig screen tag scr_LOBBYLEFT --set Lobby,Floor2,Wayfinding
screenrig screen list --tag Lobby
```

With one screen id, `--set` and `--clear` replace the whole set (guarded only
by `--expect-rev`). `--add` and `--remove` read the screen and write the new
set guarded by the revision just read, so a concurrent change fails with
`revision_conflict` (exit 6); rerun. `screen list --tag TAG` lists only
screens carrying that exact tag and adds a `TAGS` column.

### Target a fleet

`screen assign`, `screen reload`, `screen toast`, and `screen tag` take
several screen ids or `--tag TAG` (not both). Either form is one
`POST /api/v1/screens/actions` request: one metered request for up to 500
screens. `--tag` selects active screens only; archived screens are skipped.
`--expect-rev` is refused, because revision guards are per screen.

```bash
screenrig screen assign --tag Lobby --playlist-id pl_EXAMPLE
screenrig screen reload scr_LOBBYLEFT scr_LOBBYRIGHT
screenrig screen toast --tag Lobby --text "Closing in ten minutes"
screenrig screen tag --tag Lobby --add Spring
```

`screen publish` is single-screen. To publish to a fleet, run
`playlist create FILE` once, then `screen assign --tag TAG --playlist-id ID`.
Each screen applies its own schedule timezone rule and fails on its own.
Before a large fleet assignment, dry-run `screen storage-forecast` on a
representative screen of each hardware type.

### Read the results and retry only failed screens

A fleet answer stays `ok: true`; partial success is a normal answer:

```json
{
  "ok": true,
  "data": {
    "action": "reload",
    "matched": 3, "succeeded": 2, "failed": 1,
    "results": [
      { "screen_id": "scr_LOBBYLEFT", "status": "ok", "reload": { "reload_id": "…", "expires_at": "…" } },
      { "screen_id": "scr_GONE", "status": "failed", "problem": { "code": "not_found", "status": 404 } },
      { "screen_id": "scr_LOBBYRIGHT", "status": "ok", "reload": { "reload_id": "…", "expires_at": "…" } }
    ]
  },
  "warnings": [{ "code": "fleet_partial_failure", "message": "…" }]
}
```

An `ok` result carries that screen's single-screen result: `revision` for
`assign`, `revision` and `tags` for tag actions, `reload` for reload, `toast`
for toast. A `failed` result carries the problem that screen's own request
would have returned.

- Exit 0 means every matched screen succeeded.
- After a partial failure the exit code is the first failed screen's problem
  (for example 4 for `not_found`, 6 for `revision_conflict`), with warning
  `fleet_partial_failure`. Branch on `data.results[]`, not the exit code alone.
- No match is exit 0 with warning `fleet_no_match`. Check the tag spelling
  with `screen list --tag TAG` before assuming the fleet is empty.
- A malformed selector or action fails the whole request before any screen
  changes.
- Fleet `reload` and `toast` share a per-project budget of 600 screens per
  minute. A request over it is refused whole with 429 `rate_limited` and
  `Retry-After` before any screen is touched; wait, then rerun or split it.
- Per-screen limits still apply inside fleet actions: reload 6 per minute and
  toast 20 per minute per screen. Those screens fail individually with
  `rate_limited`; retry only those ids later, honoring any retry delay.

Every fleet request carries an Idempotency-Key automatically. After an
interrupted request (timeout or ambiguous transport failure), rerun the
identical command (or pass the same `--idempotency-key`): finished screens
replay without repeating side effects. Replay is only for interrupted
requests.
To retry after a definite partial failure, fix each failed screen's cause
first, then rerun with only the failed ids from `data.results[]`, not the
whole tag, so succeeded screens are not touched again:

```bash
screenrig screen assign scr_GONE2 scr_GONE3 --playlist-id pl_EXAMPLE
```

Do not retry `not_found`, permission, or payment problems unchanged; report them.

### Verify a fleet

Acceptance does not prove display. Capture every screen in the fleet:

```bash
screenrig screen screenshot --tag Lobby --output ./lobby-shots --concurrency 4
```

Several ids or `--tag` fan out on the client. `--tag` makes one billed
`screen list --tag` request to resolve the fleet and matches at most 500
active screens; the captures themselves are free. Several ids must all be
`scr_…` screen ids.
`--output` is a directory (default the current directory, created if
missing) and each capture writes `<screen_id>.webp`. `--concurrency` is 1 to
8, default 4. The envelope has `action: "screenshot"`, `selector`, `output`,
`matched`, `succeeded`, `failed`, and `results[]`; each `ok` result carries
`path`, `bytes`, `sha256`, `width`, and `height`. Exit code and warnings follow
the fleet rule. `--idempotency-key` is refused in this form. An unexpected
local failure reports `unexpected_error` for that screen and starts no new
captures; screens not yet started report `not_attempted`, and the exit code is
1. Rerun for those screens. Inspect each
image, then re-capture only the screens that failed or look wrong.

### Detect dead screens

`screen.offline` (warning) is written once a screen's presence lease has been
expired for 60 seconds. `screen.online` (info) is written when a screen
connects from offline or unknown presence. `screen.offline` carries
`details.offline_since` and, when the screen was ever online,
`details.last_online_at`. `screen.online` carries `details.last_online_at`,
and `details.offline_at` only when its prior state was offline. A brief reconnect
inside the 60-second grace writes neither, so each event is a real
transition. Both are project events in `events list` and `events follow`, and
unbilled on the listen stream.

```bash
screenrig events follow --timeout 600000
```

A `screen.offline` without a later `screen.online` for the same screen (match
on the event's `resource.id`) is a dead screen. Page through `events list --after CURSOR` to
find the latest presence event for each screen. Confirm with `screen show <id>` (`online`, `last_online_at`),
then ask the human to check power and network at that display. Do not
reassign content to work around an offline screen; it plays its assignment
when it returns.

## Comments

Comments are the agent's own structured JSON object on a screen, a playlist,
or one playlist page. Compact UTF-8 of that object is at most 1 KiB. The
value must be an object. screenRIG does not read or use it and never sends it
to players.

```bash
screenrig comment set screen scr_EXAMPLE --json-value '{"note":"lobby hours"}'
screenrig comment show screen scr_EXAMPLE
screenrig comment set playlist pl_EXAMPLE --page poster --file ./note.json
screenrig comment delete screen scr_EXAMPLE
```

`--json-value` is a JSON object. `--file` reads a JSON object from disk.
Exactly one of those on set. Last write wins; do not send `--expect-rev`.
Unset show is `{ "comments": null }`.

## Events

`events list` returns one JSON page envelope by default. `events follow` emits
NDJSON: one JSON envelope per line. An empty follow emits an envelope with
`data.items: []`. `--human events list` and `--human events follow` select one
logfmt line per event for manual inspection. `--json` remains compatible.

An `application.event` line leads its details with `code` and `primitive_id`,
the id of the primitive that emitted it. `screen.online` and `screen.offline`
report presence transitions; see [dead screens](#detect-dead-screens).

`events list` returns one page of `items`, oldest first, plus `next_cursor`.
While newer events already exist, `next_cursor` is the cursor of the last
returned event: pass it back as `--after CURSOR` for the next page. At the end
of the history it is `null`; stop there. `null` is the normal end, not an
error. `--limit` defaults to 50 and accepts 1 through 200; the CLI forwards
it unchanged, so a value outside that range is the server's 400
`invalid_request` with `error.errors[].field` equal to `limit`. There is no
silent cap. Every row carries `type`, a snake_case `tag`, and `id` when a
resource is involved (`scr_…`, `pl_…`, `med_…`, `op_…`).

`events follow` reconnects on disconnect or a transient failure, with
backoff, and resumes from the last SSE id via `--after`. `--timeout` ends the
whole follow, including backoff; 401, 403, 404, and other non-transient 4xx
problems stop the command.

Exempt listen-stream events (not billed after subscribe): `screen.*`,
`runtime.*`, `application.event`, and heartbeats. Opening `events follow`
costs 1 credit as the listen subscribe. Later billed events on that stream
cost 1 credit each.

On `stream.resync_required`, refetch authoritative state and resume from the
supplied cursor.

## Feedback

```bash
screenrig feedback bug "Playlist stalls after assign" \
  --body-file ./report.md --command "screen assign"
screenrig feedback feature "Add a dry-run flag" --body "Preview a change first."
screenrig feedback list [--kind bug|feature]
```

`--body` is inline text. `--body-file` reads a file. A title is at most 120
characters and a body is at most 4000. `--command` is the command the
feedback is about. Probe support through `capabilities.features.feedback`;
`doctor` reports that check.
