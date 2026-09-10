# Screen operations, comments, events and feedback

## Screens

```bash
screenrig screen list
screenrig screen show scr_EXAMPLE
screenrig screen update scr_EXAMPLE --name "Lobby" --playlist-id pl_EXAMPLE --if-match REVISION
screenrig screen assign scr_EXAMPLE --playlist-id pl_EXAMPLE --if-match REVISION
screenrig screen set-timezone scr_EXAMPLE --timezone America/Los_Angeles --if-match REVISION
screenrig screen archive scr_EXAMPLE --if-match REVISION
screenrig screen unarchive scr_EXAMPLE --if-match REVISION
screenrig screen toast scr_EXAMPLE --text "Updated lobby loop" --level info
screenrig screen screenshot scr_EXAMPLE --output ./lobby.webp
```

`screen list` omits archived screens. `screen list --state archived` lists
archived screens only. `screen show <id>` still returns an archived row.
`screen archive` hides the screen. `screen unarchive` restores it. `screen
delete` is not a de-associate; it returns `screen_archive_required`.

`screen show <id>` prints the GET screen JSON. After a player reports a
playback surface, the body may include optional `observation`: `observed_at`
and `surfaces`. The same GET always includes `online`. Optional
`last_online_at` and `last_ip` appear after the first connect. They are
read-only.

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

`playback list` returns daily playback aggregates for this account. One row
per screen, media, and UTC day. Newest days first. `--screen-id`,
`--media-id`, and `--day YYYY-MM-DD` filter the caller's own rows. Each row
carries the server-resolved `filename` and `primitive` (`image` or `video`);
`primitive` is absent on rows last aggregated before players reported image
starts, so do not require it.

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
Exactly one of those on set. Last write wins; do not send `--if-match`.
Unset show is `{ "comments": null }`.

## Events

`events list` returns one JSON page envelope by default. `events follow` emits
NDJSON: one JSON envelope per line. An empty follow emits an envelope with
`data.items: []`. `--human events list` and `--human events follow` select one
logfmt line per event for manual inspection. `--json` remains compatible.

An `application.event` line leads its details with `code` and `primitive_id`,
the id of the primitive that emitted it.

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
