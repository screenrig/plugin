# Playlist schedules and takeover

The server decides which playlist each screen plays, in this order:

1. its **takeover**, if one is active;
2. else the first **playlist schedule** entry whose windows match the
   screen's local time;
3. else the **default** playlist assigned with `screen assign`.

Switches land within about a minute of a boundary. Players need no update.

## Choose the tool

| Need | Use |
| --- | --- |
| Some pages of one playlist show only at certain times (a breakfast special inside an all-day loop) | Page `visibility` in the playlist; see [page scheduling](playlists.md#page-scheduling-with-visibility) |
| Whole different playlists by daypart, weekday or date range (breakfast, lunch, dinner menus) | A playlist schedule on the screen |
| One playlist ahead of everything for a bounded time (emergency notice, closure, fire drill, launch event) | A takeover |

Visibility travels with the playlist to every screen assigned it. A schedule
and a takeover belong to the screen, and fleet forms apply them by `--tag`.

## Prerequisites

- **Default playlist.** Schedule and takeover writes need an assigned default
  playlist, because the screen falls back to it. Without one the write is
  `invalid_request` (exit 8) and `next` points at
  `screen assign ID --playlist-id PLAYLIST_ID`.
- **Timezone.** A schedule reads windows in the screen timezone. Without one
  the write is `invalid_request` (exit 8) and `next` points at
  `screen set-timezone`.
- **Storage.** `storage_forecast` covers every playlist the screen can switch
  to (effective, default, every entry, the takeover), so a fit answers whether
  the Player can hold everything its schedule shows. Before scheduling large
  playlists, dry-run each against a representative screen with
  `screen storage-forecast SCREEN_ID --playlist-id ID`, and read
  `storage_forecast` in `screen show` after the write.
- An archived screen answers `screen_archived` (exit 5; `next` is
  `screen unarchive`).

## Playlist schedules

```bash
screenrig screen schedule show scr_CAFE
screenrig screen schedule set scr_CAFE --file dayparts.json [--expect-rev REVISION]
screenrig screen schedule set --tag Cafe --file dayparts.json
screenrig screen schedule clear scr_CAFE [--expect-rev REVISION]
screenrig screen schedule clear --tag Cafe
```

A schedule file lists 1 to 32 entries in priority order; the first entry that
matches wins. Each entry names a `playlist_id` and 1 to 16 windows in the
screen timezone:

- `days` uses `mon` to `sun`; `start` and `end` are `HH:MM`. Omit both for the
  whole day. An `end` at or before `start` crosses midnight and belongs to the
  start day.
- Optional `from` (inclusive) and `until` (exclusive) bound the entry in civil
  minutes such as `2026-12-24T18:00`, with no offset.
- An omitted `id` becomes `entry_N`.

The CLI checks this shape before sending anything, and accepts the JSON output
of `screen schedule show` back unchanged, so read, edit and set. Breakfast,
lunch and dinner dayparts:

```json
{
  "entries": [
    { "id": "breakfast", "playlist_id": "pl_BREAKFAST",
      "windows": [{ "days": ["mon", "tue", "wed", "thu", "fri"], "start": "06:00", "end": "11:00" },
                  { "days": ["sat", "sun"], "start": "08:00", "end": "12:00" }] },
    { "id": "lunch", "playlist_id": "pl_LUNCH",
      "windows": [{ "days": ["mon", "tue", "wed", "thu", "fri"], "start": "11:00", "end": "15:00" }] },
    { "id": "dinner", "playlist_id": "pl_DINNER",
      "windows": [{ "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], "start": "17:00", "end": "22:00" }] }
  ]
}
```

Outside every window the default playlist plays. Put a date-bounded entry
(a holiday menu with `from`/`until`) above the everyday entries so it wins.
Every playlist an entry names is validated as an assignment when you write the
schedule. If one later cannot be shown, its entries are skipped and
`screen.playlist_unavailable` is recorded.

## Takeover

```bash
screenrig screen takeover scr_LOBBY --playlist-id pl_DRILL --for 30m --reason "Fire drill"
screenrig screen takeover --tag Lobby --playlist-id pl_CLOSED --until 2026-10-01T18:00:00Z --reason "Closed for inspection"
screenrig screen takeover scr_A scr_B --playlist-id pl_NOTICE --until none
screenrig screen takeover clear --tag Lobby
```

A takeover shows one playlist ahead of the schedule and the default. Use it
for emergencies, closures and events, and always give a `--reason`: it is trimmed, at most 120 characters with no
control characters, and travels with the takeover and its events.

- `--for 30m|2h|3d` sets the end from this computer's clock, up to
  `6d23h59m`; `7d` is refused, which leaves a minute for clock differences.
  Use `--until` for a full 7 days. If the server still refuses the result,
  `next` suggests a shorter `--for`.
- `--until` takes a strict RFC 3339 instant with seconds and an offset, such
  as `2026-10-01T18:00:00Z` or `2026-10-01T11:00:00-07:00` (uppercase `T` and
  `Z`). It is sent normalized to UTC and must be in the future and at most 7
  days ahead.
- `--until none`, or neither flag, holds the takeover until
  `screen takeover clear`. Prefer a bounded end so a forgotten takeover
  expires on its own.
- A new takeover replaces the previous one.
- `screen takeover clear` ends it early; the screen returns to its schedule
  or default.
- `screen takeover ID` is short for `screen takeover set ID`.

A `--for` rerun after an ambiguous failure computes a new end and is sent as a
new request; check `screen show` before rerunning. A takeover whose playlist
cannot be shown ends.

## Single screen and fleets

With one screen id, `schedule set`, `schedule clear`, `takeover` and
`takeover clear` return the updated screen, and `--expect-rev` guards its
revision (`revision_conflict`, exit 6). Several ids or `--tag` become one
fleet request with the fleet envelope and exit rules in
[fleets](operations.md#fleets-tags-and-fleet-actions): read `data.results[]`
and retry only failed ids. Each screen fails alone, for example a screen with
no timezone or no default playlist fails with `invalid_request`.

## Limits

- Schedules: 1 to 32 entries, each with 1 to 16 windows.
- Takeover: `--until` at most 7 days ahead, `--for` at most `6d23h59m`;
  reason at most 120 characters after trimming.
- Schedule and takeover writes share per-minute limits: 20 per screen, 600 per
  project, 60 per IP (`rate_limited`, exit 7, with `retry_after_seconds`). A
  fleet request larger than what remains of the project budget is refused
  whole before any screen changes.

## Verify

`screen show`, `screen list` and these writes return `effective_playlist`
(`{id, source: takeover|schedule|default, entry_id?, until?}`), `takeover`
and `playlist_schedule`. `until` is the next moment the choice is known to
change. After a write:

```bash
screenrig screen show scr_CAFE
screenrig screen screenshot scr_CAFE --output ./cafe.webp
screenrig screen screenshot --tag Lobby --output ./lobby-shots
```

Confirm `effective_playlist.id` and `source`, then inspect the screenshot:
the effective playlist is the control-plane choice, the screenshot is the
proof of display.

Project events in `events list` and `events follow` (unbilled on the listen
stream):

- `screen.playlist_switched`: `playlist_id`, `previous_playlist_id`,
  `source`, `entry_id`, `until`, on every change of effective playlist.
- `screen.takeover_started`: `playlist_id`, `until` (`none` means held until
  cleared), `reason`.
- `screen.takeover_ended`: `reason` `expired`, `cleared`, `replaced`,
  `playlist_deleted` or `playlist_unavailable`.
- `screen.playlist_unavailable` (warning): `playlist_id`, `entry_ids`, and
  `code` `playlist_deleted` or `playlist_unavailable`. Fix or replace the
  playlist, then set the schedule again.

## Deleting a playlist

`playlist delete` is refused with `resource_conflict` (exit 5) while any
screen can still show the playlist: assigned, named by a schedule entry, held
by a takeover, or effective. `next` points at `screen list`, and
`screen show ID` shows the reference. Remove it from those screens first.
