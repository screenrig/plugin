# Playback records and proof of play

Two views answer "what played":

- **Per play** (`playback plays`): one row per visible start of an image or
  video, oldest first by `received_at`. Use it for proof of play, audits,
  advertiser or sponsor reports, and "did this exact asset show on that
  screen at that time".
- **Daily totals** (`playback list`): one row per screen, media and UTC day,
  newest day first. Use it for trends and play counts.

Both read this project's own rows only.

## Commands

```bash
screenrig playback plays [--from TIME] [--to TIME] [--screen-id ID] [--media-id ID] [--tag TAG] [--cursor CURSOR] [--limit N] [--all]
screenrig playback plays --format csv [--output FILE] [--from TIME] [--to TIME] [--screen-id ID] [--media-id ID] [--tag TAG]
screenrig playback list [--screen-id ID] [--media-id ID] [--day YYYY-MM-DD | --day-from YYYY-MM-DD --day-to YYYY-MM-DD] [--format csv] [--output FILE]
```

## Time range

- `--from` (inclusive) and `--to` (exclusive) bound `received_at`. Each takes
  an RFC 3339 instant with seconds and an offset (`2026-09-01T00:00:00Z`,
  `2026-09-01T00:00:00-07:00`), `now`, or an age before now (`7d`, `12h`,
  `30m`).
- The default is the 24 hours up to now. A range longer than 31 days is
  refused; split a longer report into 31-day ranges.
- The CLI normalizes both bounds to UTC and echoes them as `data.from` and
  `data.to`.
- The newest 5 seconds are held back until they settle, so a play appears
  about 5 seconds after it is received. `data.to` reports that effective end,
  at most 5 seconds before now, and `data.next` keeps it. Start the next
  report from the previous `data.to` so no play is missed or counted twice.
- `--tag` matches a tag the screen carried when the play was received, so
  retagging a screen does not rewrite history.

## JSON pages

JSON returns one page in `data.items` (server default 200 rows, `--limit` up
to 1000) with `data.next_cursor`. Pass it back with `--cursor` and the same
filters; `data.next.argv` is that exact command.

`--all` follows the cursor to the end of the range, 1000 rows per page unless
`--limit` says otherwise, for at most 50 pages. It stops early, with
`data.next` and a warning, at the page cap (`playback_plays_truncated`) or
when the playback export budget is spent (`playback_export_rate_limited`),
rather than spending requests into a refusal. Continue later with
`data.next.argv`. For large ranges prefer CSV.

## CSV export

```bash
screenrig playback plays --format csv --from 7d --to now --tag Lobby --output lobby-plays.csv
screenrig playback list --day-from 2026-09-01 --day-to 2026-09-30 --format csv --output september.csv
```

`--format csv` streams the whole range as RFC 4180 CSV with a fixed header
row, in one request:

- The CLI writes to `--output FILE` (default `./playback-plays.csv`, or
  `./playback-aggregates.csv` for `playback list`) through a private temporary
  file in the same directory, and renames it onto `FILE` only after the stream
  ends cleanly. An existing `FILE` is replaced then.
- `--output -` writes only the CSV to stdout.
- The envelope reports `path`, `bytes`, `rows`, `sha256` and, for plays,
  `last_received_at`; the CSV never enters the envelope.
- `--timeout` is the no-progress limit (default 60000 ms without a byte), not
  a limit on total duration.

Plays columns:
`screen_id,playlist_id,page_id,primitive_id,media_id,primitive,started_at,received_at`.

Daily totals columns:
`screen_id,media_id,filename,primitive,day,play_count,last_page_id,last_manifest_revision,first_started_at,last_started_at`.

`primitive_id` and `started_at` cells are empty unless the Player reported
them; do not require them. A cell that begins with `=`, `+`, `-`, `@`, tab or
carriage return carries a leading `'` so spreadsheets do not evaluate it;
strip it when processing the file as data.

### Interrupted exports

A stream that fails partway exits non-zero and never writes the target file.

- For plays, the complete rows already received stay in `FILE.partial`
  (`FILE.partial-2` and so on if that exists), and `error.next` exports the
  rest of the range from the last `received_at` into an unused
  `FILE-rest.csv`. Run it, then join the two files. Rows received at that
  exact instant appear in both, so drop the repeats when joining.
- A failed daily-totals export keeps nothing; rerun it.

## Daily totals ranges

`playback list` takes `--day` for one UTC day, or `--day-from` and
`--day-to` for an inclusive range of at most 366 days. With `--format csv`
and no range it exports the 31 days up to today. Rows carry the
server-resolved `filename` and `primitive` (`image` or `video`); `primitive`
is absent on rows last aggregated before Players reported image starts.

## Billing and limits

- Each JSON page is one billed API request, so `--all` bills one request per
  page it follows.
- A CSV export is one billed request for the whole range.
- Every plays request and every CSV export also spends the playback export
  budget of 30 requests per minute per project. Past it the answer is
  `rate_limited` (exit 7) with `retry_after_seconds`; wait that long, then
  continue.
