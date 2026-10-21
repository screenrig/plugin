# Playlists, motion, schedules and bundles

## Built-in cards and feeds

A card is a non-interactive live display (weather, clocks, menus, queues, KPIs,
scores, tickers), full screen or overlaid, drawn by the Player's native
interpreter. Use an application for what a card cannot do.

```sh
screenrig cards list --tag weather
screenrig cards list --category food
screenrig cards show menu
```

`cards list` and `cards show` discover catalogue types. `cards show` returns
static and dynamic property schemas with types, defaults, limits and required
flags, the card's `tier`, its supported `layouts`, its feed and an example of
a card in a playlist page. Prepare a static params JSON object matching its
schema, then create an instance:

```sh
screenrig card create --type menu --file params.json
screenrig card list
screenrig card show crd_CARD
```

Use the returned global `crd_` ID in a page's `primitives`. Carry `layout`
(required) and `anchor` on the card item. Omit `rect` and `layer` for every
layout except `free`; the server derives them from the page canvas. Send
nothing, or send exactly the derived values. Create selects the current major
unless `--major N` pins another. Choose a schema-listed `params.theme`. Set
`content_fit: "fill"`. Cards accept `enter` and no `motion`. Compose a page
with one `full`, `center` or `wide` card, plus optional `header`, `footer`,
`corner`, `chip` and `strip` cards.

| Layout | Size | Anchor |
|---|---|---|
| `full` | whole canvas | none |
| `free` | own `rect` and `layer` | none |
| `center` | 900 x 420, centred | none |
| `wide` | the screen inset 80 from the top and bottom and 30 from the sides | none |
| `header` | the whole top edge by 80 | none |
| `footer` | the whole bottom edge by 80 | none |
| `corner` | 270 x 270, flush to the corner | `top-left`, `top-right`, `bottom-left`, `bottom-right` |
| `chip` | 240 x 70, inset 30 | `top-left`, `top-right`, `bottom-left`, `bottom-right` |
| `strip` | whole edge by 120 | `top`, `bottom`, `left`, `right` |

Sizes use 1080p design units and scale by min(canvas width, canvas
height)/1080, so 4K and portrait canvases keep the same apparent size. A
`core` card takes the layouts `cards show` lists for it, and `header` and
`footer` only on a card made for them. A `fullscreen` card takes `full` only and
suits a full landscape or portrait screen. A `stinger` takes none. A page
holds at most one `full`, `center` or `wide` card, at most one `header` and one
`footer`, at most one `corner` or `chip` card per corner, and at most one
`strip` per edge, plus one presence card sharing that edge. A `header` takes
the top edge's normal `strip` slot and a `footer` the bottom edge's, so that
edge holds no normal `strip`; a presence card may share it. Images, videos and
web items carry no limit, and any number of `free` cards share a page. A
`corner` or `chip` on an edge holding a `strip` moves inward 120 past the
`strip`, and 80 past a `header` or `footer`, the larger when both hold the
edge; a `center`, `wide`, `header` or `footer` card ignores strips, and a
`strip` paints over a `center` or `wide` card. A left or right `strip` is the
band on that edge; the Player turns the card 90 degrees, left counter-clockwise
and right clockwise, so the item needs nothing extra.

A `fullscreen` card such as `menu` takes `full`:

```json
{
  "id": "menu", "primitive": "card", "card": "crd_CARD",
  "layout": "full", "content_fit": "fill"
}
```

A `corner` card adds an anchor:

```json
{
  "id": "clock", "primitive": "card", "card": "crd_CLOCK",
  "layout": "corner", "anchor": "top-right", "content_fit": "fill"
}
```

Presence cards, such as an alerts bar or a "lightning nearby" chip, appear
only while their condition holds and draw nothing otherwise; a presence
`strip` replaces the normal `strip` on its edge while present.
`card_layout_invalid` (400) signals a missing or unknown `layout`, a missing,
unknown or unwanted `anchor`, a layout the card's tier does not take, or a
`rect` or `layer` other than the derived one. `card_layout_conflict` (400)
signals two cards claiming one place on a page; `errors[0].field` names the
member. `playlist create`, `playlist update` and `screen publish` also check
the layout against the card's `layouts` before uploading.

Static params belong to the instance. Put dynamic properties in a JSON object
matching `data_schema`, without a `document` wrapper:

```sh
screenrig card data put crd_CARD --file menu-data.json
screenrig playlist create lobby.json
screenrig screen assign scr_LOBBY --playlist-id pl_LOBBY
screenrig card data get crd_CARD
screenrig card data put crd_CARD --file menu-data.json --expect-rev 3
screenrig card params crd_CARD --file params.json
screenrig card show crd_CARD
```

Prepare a complete playlist containing the placement before `playlist create`.
`screen publish` and `playlist update` use the same JSON path. Publication
resolves the instance and snapshots its static params; after `card params`,
republish the playlist to show those changes. The server validates params,
dynamic data and images against the pinned type. Data changes notify screens
without republishing. JSON inputs are objects of at most 1 MiB; `--file -`
reads stdin. Read the data revision and guard updates with `--expect-rev`
(If-Match). On `revision_conflict`,
read and reconcile; on an ambiguous transport failure, rerun the identical
create or data write with its saved idempotency key. `card_data_invalid` names
the card and property to correct. Remove a card from every playlist before
`card delete crd_CARD`; deletion refuses an instance still in use.
Card images use `media:<id>` references to ready project images; dynamic data
requires approved images. Do not supply image URLs.

Inline placements (`card` as a catalogue type, `major`, `params`, optional
`data` key) and the name-keyed `card-data get|put|list|delete` commands are
deprecated and return migration warnings. Use instance IDs.

screenRIG fetches and caches third-party feeds. Never call weather, air quality,
alerts, exchange-rate, crypto, earthquake or headline providers from the agent.
Cards derive their feed from static params; never add a `feed` field or write
a system `feed:` key. To read the same cached data directly:

```sh
screenrig feeds get weather --lat 49.25 --lon -123
screenrig feeds get airquality --lat 49.25 --lon -123
screenrig feeds get alerts --lat 49.25 --lon -123
screenrig feeds get rates --base EUR
screenrig feeds get crypto --symbols btc,eth --currency usd
screenrig feeds get earthquakes --lat 49.25 --lon -123 --radius-km 500
screenrig feeds get headlines --url https://example.com/news.xml
```

A card whose feed is not listed above and that has no dynamic properties in
`cards show` (for example `departures`, `flights`, `scores`) draws its waiting
state. For other live data, choose a card with dynamic properties and write it
with `card data put`.

A pending feed returns `state: pending`, `retry_after_seconds` and `retry_at`
with exit 0; report its retry time and return without looping. Ready documents
include `fetchedAt` and `attribution`; show attribution wherever the data shows.
Inspect a Player screenshot after publishing to confirm card placement and data.

## Prepare, publish, and edit playlists

For ready images and videos, prepare a full-screen playlist in playback order:

```sh
screenrig playlist init med_POSTER med_VIDEO --name "Lobby loop" --screen-id scr_LOBBY --output lobby.json
screenrig playlist preview lobby.json --output preview --contact-sheet
screenrig screen publish scr_LOBBY lobby.json
```

Preview draws each image and video from a local `<media_id>.png` (or `.jpg`,
`.webp`, `.gif`, `.mp4`, `.webm`) beside the playlist, in the working directory
or in `--output`, and otherwise fetches it from the project when the CLI is
logged in. A grey box labelled with a media ID is a placeholder, not the page:
`data.placeholders` and the `preview_media_placeholder` warning name each one.

Inspect the document and preview before publishing. `playlist init` accepts local
image/video/audio files, ready `med_` IDs, pinned `rel_` application releases, and HTTPS
iframe URLs in playback order, including mixed inputs:

```sh
screenrig playlist init ./poster.png med_VIDEO rel_APP https://example.com --name Lobby --screen-id scr_LOBBY --output lobby.json
```

Local files upload through the normal media path, up to four at a time, and wait
for readiness. This requires ffmpeg and ffprobe unless `--no-transcode` is
supplied. `data.uploads` lists each file's `media_id`, `reused`, and per-stage
`timing`. Preparation writes the local document and may upload media; it neither
creates a remote playlist nor assigns a screen. Existing media must be ready.
HTTPS URLs must contain no username or password and are not fetched during
preparation.

If preparation is interrupted, rerun the identical command. Nothing is written
until every upload is ready, so no output file blocks the retry, and a file
whose upload already finished returns its existing media ID (`reused: true`)
instead of uploading again. There is nothing to reconcile by hand.

Each input becomes one full-screen page with a black background and a 200 ms
crossfade. Images and videos use `--fit contain|cover|fill` (default `contain`).
Videos are muted, do not loop, and advance on completion. Image and iframe pages use
`--duration-ms` (default 8000). Applications and iframes use `fill`; application
releases are pinned with timed advancement and no controller privileges, and hold
86400000 ms (24 hours, the longest `after_ms`) unless `--duration-ms` is given, so
an app that rotates internally and keeps state is not restarted by the page timer.
An explicit `--duration-ms` applies to every non-video page, and an application page
under 60 seconds returns an `application_page_short` warning from `playlist init`,
`validate`, `preview` and `screen publish`. Edit the document for
application-controlled advancement. The static preview represents
applications and iframes with placeholders; verify release readiness, embedding,
and actual playback through the server and intended Player.

Supply `--screen-id` to read the target dimensions and revision. The result includes
`data.screen_id`, `data.screen_revision`, `data.preview.argv`, and `data.publish.argv`.
Pass these argument arrays to the bundled `screenrig` launcher without shell
splitting: they preserve paths, config, and API origin.
Inspect the preview before publishing. Add `--expect-rev` explicitly to guard against later screen changes. Target metadata stays outside the authored document.

To override the canvas, supply both `--target-width` and `--target-height`. These
also work without a screen, in which case no publish arguments are returned.
Unknown or multiple reported surfaces require explicit dimensions. Output files are exclusive by default: a non-empty existing `--output` fails with `usage_error` (exit 2) and stays untouched, so choose a new path or use `--overwrite` to replace it atomically. An empty file does not count as existing. Confirm init exited 0 and that `data.release_ids` and `data.media_ids` match the intended inputs before `screen publish`. Parent directories are created automatically. URL and release-ID inputs with explicit dimensions work without login.

`screen publish <screen-id> <file>` creates a new playlist, assigns it with an optional **screen** revision guard, reads back the assignment, and waits for the Player to show it. It does not update an
existing playlist by name. Display names may repeat; use the playlist ID for an explicit `playlist update`.

The wait is bounded by `--timeout` (default 120000 ms). It ends as soon as the
Player acknowledges the playlist on glass: `data.stage` is `playing` and
`data.playback_verified` is `true`. Report that to the user as playing.
Otherwise `data.stage` stays `assigned` and `data.playback.reason`, repeated as
a warning code with its next step, says why:

| `data.playback.reason` | What to do |
|---|---|
| `screen_offline` | Tell the user the screen is offline; it plays when its Player reconnects. |
| `playlist_not_effective` | A takeover or schedule shows `data.playback.effective_playlist_id`; the published default plays when that ends. |
| `playback_failed` | Read `data.playback.code` and `screen show`; fix the cause, then `screen reload`. |
| `playback_pending` | Still downloading or preparing (`data.playback.state`); rerun the identical command to keep waiting. |

A `playback_partial` warning means the Player plays the playlist without
`data.playback.missing_page_count` pages that do not fit its storage. Rerunning
the identical publish never creates another playlist. Progress lines go to
stderr. Take a screenshot when you need to see the content itself, for example
to check layout.

`screen publish` targets one screen. For a fleet, run `playlist create FILE`
once, then `screen assign --tag TAG --playlist-id ID` (or several screen ids);
see [fleets](operations.md#fleets-tags-and-fleet-actions).

Publishing saves a private local journal automatically. After an ambiguous failure,
repeat the identical command and input with the same config to resume. If playlist
creation succeeded before assignment failed, the error identifies the created
playlist. Do not delete it or start another create to recover. A revision conflict
requires inspecting the screen and reconciling the intended assignment; an already
created playlist can be assigned explicitly with `screen assign`. Publishing never
silently refreshes the expected revision. Unfinished recovery stops after the
24-hour server idempotency window; inspect and reconcile before making more writes.

To rename a playlist without resubmitting its content:

```sh
screenrig playlist rename pl_EXISTING --name "Cello recordings — 36 tracks" --expect-rev 7
screenrig playlist patch pl_EXISTING changes.json --expect-rev 7
```

`playlist patch` accepts a partial JSON object with `name`, `pages` and/or `audio`,
or `--name NAME` and `--clear-audio`. Omitted fields stay unchanged; supplied pages
and audio replace the complete value, arrays are not merged, and `audio: null`
clears the soundtrack. Remove any page audio cues in the same patch when clearing
their soundtrack. A name-only change preserves content without revalidating its
authoring format. It follows the existing revision guards, saved retry keys and
approval policy: `pending_review` waits for a person before changing live content.
`playlist list --human` includes ID, revision and update time; select by ID.

To edit an existing playlist:

```sh
screenrig playlist show pl_EXISTING --output lobby.json
screenrig playlist update pl_EXISTING lobby.json
```

`playlist show --output` writes the editable `{name, audio?, pages}` document and returns
its path, `playlist_id`, and source `revision` on stdout. Optionally pass that revision with `--expect-rev` to guard the update. It preserves dynamic selectors, schedules, motion, and pinned
application releases, removing server-derived and read-only fields, so the file
validates and updates as written; edit it in place. Comments remain separate;
page comments carry over by page ID. Plain `playlist show` is an inspection response; `--editable`
without `--output` returns `data.document`, `data.playlist_id`, and `data.revision`.
Updating a playlist affects every screen assigned to it.

### Replace one application release

After a successful `app update`, take `data.application.release_id` and identify the
exact playlist, page, and application primitive to change. Preview the replacement:

```sh
screenrig playlist replace-release pl_EXISTING --page board-page --primitive board --release-id rel_NEW
```

This is a read-only impact review, not a rendered preview. Inspect
`data.previous_release_id`, `data.release_id`, and `data.affected_screens`, including
archived assignments. Apply directly with `--apply`. To opt into this impact check, also supply `--expect-impact` with the preview’s `data.impact`:

```sh
screenrig playlist replace-release pl_EXISTING --page board-page --primitive board --release-id rel_NEW --apply
```

Other primitives and settings are preserved. The update affects every screen
assigned to this shared playlist; archived screens retain the new pin for later
use. When `--expect-impact` is supplied, a changed replacement, revision, or observed screen impact requires a fresh preview. Direct apply skips the screen survey; `affected_screens` is omitted. An already pinned release succeeds without writing. Assignments may change after the snapshot: the server checks the playlist revision atomically only when `--expect-rev` is supplied. The server validates release
availability and ownership on apply. Existing pins remain unchanged until apply;
afterward, verify manifest revisions and playback on the affected screens.

Playlist validate, create, update, preview, and screen publish accept `-` as their
input file to read stdin. JSON envelopes are never written into authored files.
`--expect-rev` is the preferred revision spelling; `--if-match` remains a compatible
alias. Supply only one. Omit the flag to write the current resource without a revision precondition. A supplied stale revision still returns `revision_conflict`.

Generation accepts either `--prompt TEXT` or `--prompt-file FILE`, including
`--prompt-file -` for stdin. The file is the complete prompt, with no trimming;
the existing 4000-character limit applies. Prompts are excluded from diagnostics.

## Playlist writes

Use six primitives: `image`, uploaded `video`, live `stream`, `iframe`,
`application`, and built-in `card`. Streaming requires a compatible backend and Player.
Do not author native `text`, `box`, or `line` on the wire. Presentable copy
lives in the generated still. Deck copy and chrome are composed locally,
uploaded as `image`, and used as one image primitive.

A playlist has `name`, optional `audio` (the soundtrack), and `pages`, with no
playlist-wide dimensions. Each
page's `canvas.width` and `canvas.height` define its layout coordinate system;
`canvas.viewport_fit` controls how it fits the Player's viewport. This layout
size can differ from the pixel dimensions of media rendered from a compose deck.

A full playlist page is `id`, `canvas`, `transition`, `advance`, optional `visibility`,
optional `audio_cue`, and `primitives`. A primitive is flat: `id`, a `primitive` field naming
a supported kind, that primitive's own fields, then `rect`, `layer`, `content_fit`,
optional `enter`, and optional `motion`. There is no nested content object. A card item carries `layout` and, for corner, chip and strip, `anchor`; it omits `rect` and `layer` unless its layout is `free`.

Keep the authored playlist JSON as the source of truth. To obtain one from an
existing playlist, use `playlist show ID --output FILE`; the returned envelope
includes the source revision. Ordinary `playlist show` remains an inspection
response and must not be submitted as a write document.

Image and video primitives require a `selector`. `stream`, `iframe`, and `application`
do not take one. Do not put `media_id` on the primitive itself; it belongs
inside the selector. Do not send server-resolved `items`. Advance with
`media_end`, never `video_end`.

`canvas.background` is a solid uppercase `#RRGGBBAA` or a top-to-bottom
linear gradient. The gradient is `{ "type": "linear", "stops": [...] }` with
2 through 8 stops, strictly increasing `at` in `[0, 1]`, first `at` 0, last
`at` 1, and no angle field. A solid string stays valid.

Selector `by` values:

- `id`: one ready `media_id`. `one_at_a_time` must be false.
- `ids`: 1–1,024 unique ready IDs.
- `all`: every ready object of that primitive, image or video.
- `tag`: ready objects of that primitive whose tag matches
  `^[A-Za-z0-9]{1,32}$`.
- `folder`: ready objects of that primitive directly inside one media
  folder, named by `folder_id` (`mfd_…`); files in its subfolders are not
  included.

`all`, `tag` and `folder` accept `order: "filename"` (default) or `"random"`.
Players resolve all dynamic selectors together at playlist startup and each
loop boundary. Uploads, removals, tag edits and files moved in or out of a
folder take effect on the next loop;
the manifest revision stays stable. An empty match skips the primitive and
any resulting empty page. Each selector resolves at most 1,024 ready items.

With `one_at_a_time: true`, each page appearance plays one item and advances
a persistent cursor. With `false` on a `media_end` page, every matched item
plays before the page advances. Random order shuffles once per complete pass;
refreshing the snapshot preserves the unplayed queue, skips removed items,
and adds new items on the next pass. Offline playback uses the last snapshot.
Dynamic selectors on duration, application or `audio_end` pages require `one_at_a_time: true`.

`media_end` is valid only on a page with exactly one image or video primitive.
Video `loop` must be false. An image on `media_end` requires `dwell_ms`.
`dwell_ms` is rejected on duration, application and `audio_end` pages. A video
plus a lower-third image is two primitives, so that page cannot use
`media_end`. Time it with `advance.mode` `duration`: set `after_ms` longer than
the clip, or set `loop: true`. If `after_ms` equals the clip length, the page
cuts when the film ends. When a soundtrack track times the page instead, use
`audio_end`: its image and video primitives follow the duration rules (no
`dwell_ms`, `one_at_a_time: true` on dynamic selectors), so a video plus an
overlay works. A `stream` primitive still needs a `duration` page, and an
application on an `audio_end` page is never its controller.

`audio_end` ends a page when the soundtrack track its `audio_cue` names ends.
Use it for a page that lasts exactly as long as a track, such as an album or a
book with one page per track. See
[Bind a page to a track](#bind-a-page-to-a-track).

Default `transition` is `{ "type": "crossfade", "duration_ms": 200 }`. Use
swipe types, object `enter`, and object `motion` sparingly.

```json
{
  "name": "Lobby loop",
  "pages": [
    {
      "id": "poster",
      "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
      "transition": { "type": "crossfade", "duration_ms": 200 },
      "advance": { "mode": "duration", "after_ms": 8000 },
      "primitives": [
        {
          "id": "hero",
          "primitive": "image",
          "selector": { "by": "id", "media_id": "med_01EXAMPLEIMAGE0000000000" },
          "alt": "Lobby poster",
          "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
          "layer": 0,
          "content_fit": "contain"
        }
      ]
    },
    {
      "id": "clip",
      "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
      "transition": { "type": "crossfade", "duration_ms": 200 },
      "advance": { "mode": "media_end" },
      "primitives": [
        {
          "id": "feature",
          "primitive": "video",
          "selector": { "by": "id", "media_id": "med_01EXAMPLEVIDEO0000000000" },
          "muted": true,
          "loop": false,
          "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
          "layer": 0,
          "content_fit": "contain"
        }
      ]
    }
  ]
}
```

Use `data.media_id` from `media upload` or `media generate` (same value as
`data.id`). Do not invent one. After a tagged upload or generate,
`media list --tag TAG` is the filename → id map. Do not re-upload a generated
still; `media download` it when a composed page needs the file.

Deck photo plus overlay still. Presentable posters are one generated `image`,
not this two-layer shape.

```json
{
  "id": "hero",
  "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
  "transition": { "type": "crossfade", "duration_ms": 200 },
  "advance": { "mode": "duration", "after_ms": 8000 },
  "primitives": [
    {
      "id": "photo",
      "primitive": "image",
      "selector": { "by": "id", "media_id": "med_01EXAMPLEPHOTO0000000000" },
      "alt": "Hero photo",
      "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
      "layer": 0,
      "content_fit": "fill"
    },
    {
      "id": "overlay",
      "primitive": "image",
      "selector": { "by": "id", "media_id": "med_01EXAMPLEOVERLAY000000000" },
      "alt": "Lower third",
      "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
      "layer": 1,
      "content_fit": "fill"
    }
  ]
}
```

Video plus a lower-third image uses the same two-layer shape with
`advance.mode` `duration`, or `audio_end` when a soundtrack track times the
page. Do not use `media_end` there.

### Page motion

These are playlist document fields the CLI sends. The control plane accepts
swipe types, object `enter`, and object `motion`.

Default pages: `transition` is `{ "type": "crossfade", "duration_ms": 200 }`.
Author crossfade unless swipe or `enter` is the intended emphasis. Select
foreground artwork or a short headline for restrained entrances; leave menu
items, prices, and other information stationary. Video already supplies
motion. Choose animated layers by purpose, without a fixed layer quota or
an entrance on every primitive.

`transition.type` is `crossfade`, `swipe-left`, `swipe-right`, `swipe-up`, or
`swipe-down`. `duration_ms` is required and runs from 0 through 60000. When
you choose a swipe type, write `duration_ms: 600`.

Swipe is the incoming page's type. The outgoing page follows so the edges
stay touching. The name is motion direction: `swipe-left` moves content
left.

Optional object `enter` is `{ "type": "...", "stagger"?: 0 }` with that same
object name on playlist JSON. Types: `fade-up`, `fade-down`, `fade-left`,
`fade-right`, `fade-in`, `zoom-in`, `zoom-out`. Optional integer `stagger`
is 0 through 8. Absent means no object animation.

Object enter starts invisible. It runs 500 ms after the page occupies the
full viewport, for 400 ms, plus `stagger * 120` ms when `stagger` is
present. Those delays are contract constants, not author fields and not CLI
flags. Do not send duration or delay inside `enter`; `stagger` is the only
extra author field.

To slide deck text in over a still or video, compose the text and its translucent
plate into a transparent PNG, place that image above the background's layer,
and apply `enter` to the overlay image. Keep the background independent.
This is a deck or live-video mechanic, not the presentable-poster path.
Animation is not a reason to compose a presentable page.
The same mechanism works for independent foreground artwork with alpha.
Leave transparent breathing room around moving ink within its raster and
primitive rect so entry motion does not clip its edges; do not stretch the
asset to compensate. Keep supported timing constants unchanged.
Preview the first activation and a loop replay on each intended player; check
that the overlay begins hidden, enters within its rect, and retains the
expected layer order. A settled screenshot alone cannot verify animation.

Optional object `motion` is a discriminated object on `type`: `spin`,
`path`, or `drift`. Absent means the primitive stays at rest after enter.
Persistent motion is for designs that call for it; one moving element per page is the norm. Prefer a panning background or one accent over several moving objects.

`spin` takes `direction` `cw` or `ccw` and `speed` `slow`, `medium`, or
`fast`, and applies to `image` and `video` only:

```json
{
  "id": "badge",
  "primitive": "image",
  "selector": { "by": "id", "media_id": "med_01EXAMPLEBADGE00000000000" },
  "rect": { "x": 1640, "y": 80, "width": 200, "height": 200 },
  "layer": 1,
  "content_fit": "contain",
  "motion": { "type": "spin", "direction": "cw", "speed": "slow" }
}
```

`path` takes 1 through 64 `points`, `rate` greater than 0 and at most 10000,
and optional `loop` `loop`, `ping-pong`, or `once`. It applies to `image`,
`video`, `application`, and `iframe`. The authored `rect` is the start pose;
`points` are later top-left waypoints in canvas units:

```json
{
  "id": "background",
  "primitive": "image",
  "selector": { "by": "id", "media_id": "med_01EXAMPLEBACKGROUND000000" },
  "rect": { "x": 0, "y": 0, "width": 2400, "height": 1080 },
  "layer": 0,
  "content_fit": "cover",
  "motion": {
    "type": "path",
    "points": [{ "x": -480, "y": 0 }],
    "rate": 40,
    "loop": "loop"
  }
}
```

`drift` is a Ken Burns pan-and-zoom. It takes `zoom` `in` or `out`,
`direction` `left`, `right`, `up`, `down`, or `none`, and the same `speed`
tokens. It applies to `image` and `video` only:

```json
{
  "id": "photo",
  "primitive": "image",
  "selector": { "by": "id", "media_id": "med_01EXAMPLEPHOTO0000000000" },
  "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
  "layer": 0,
  "content_fit": "cover",
  "motion": {
    "type": "drift",
    "zoom": "in",
    "direction": "right",
    "speed": "slow"
  }
}
```

### Operator navigation while a web page is active

On Qt and Android, plain Space, N/P, Enter, and arrows belong to an active iframe or
application so typing and kiosk navigation remain usable. Operator shortcuts
are Ctrl+Alt+Left/Right for Previous/Next and Ctrl+Alt+Space for Pause/Resume.
Escape opens Settings with Previous page, Pause/Resume playback, and Next page
menu controls. On Qt, use Up/Down to select a row and Enter to choose it.
A paused web page stays paused until explicit resume or the player's existing
60-minute expiry. Rapid navigation while the next page prepares keeps only the
latest pending direction and applies it once after activation; it does not
queue an unbounded series of stale key presses.

## Soundtrack

A playlist may carry one soundtrack: ordered MP3 tracks that play back to back
and keep playing while pages change. Page advances, transitions, schedules and
republishing an unchanged track list never restart it. Canvas video stays
muted, so the soundtrack is the only sound on the screen.

Upload the audio first (`media upload ./theme.wav`; see [media](media.md)), or
pass audio files to `playlist init`, which turns every audio input into a
soundtrack track instead of a page.

```json
{
  "name": "Lobby",
  "audio": {
    "tracks": [
      { "id": "intro", "media_id": "med_INTRO" },
      { "id": "bed", "media_id": "med_BED" }
    ],
    "loop": true,
    "volume": 0.8
  },
  "pages": [
    { "id": "welcome", "audio_cue": { "track": "intro", "restart": true }, "...": "..." }
  ]
}
```

- `tracks`: 1 to 128 entries in play order. Track `id` is unique within the
  playlist; `media_id` must be a ready `audio` object. The same media may
  appear under two ids. A longer list is refused with the limit and the count.
- `loop` (default `true`) starts again at the first track after the last;
  `false` stops after the last track.
- `volume` (default `1`) is 0 to 1 and multiplies the Player's own volume.
- `cued` (default `false`): `true` makes a cued soundtrack, which plays a track
  only when a page `audio_cue` starts it. See
  [Bind a page to a track](#bind-a-page-to-a-track).
- A page `audio_cue` is a hint. When the page becomes current, the Player
  switches to the named track from its start unless it is already playing;
  `restart: true` restarts it even then. The sequence continues from that
  track. A cue must name a track in `audio.tracks`; adslot pages take no cue.
- `playlist update` replaces the whole document, so omitting `audio` removes
  the soundtrack. `playlist show --output` keeps it.
- Browsers can block sound until someone interacts with the page. A kiosk
  browser running the browser Player should allow autoplay (Chromium
  `--autoplay-policy=no-user-gesture-required`); native Players are not
  affected.

### Bind a page to a track

To make a page last exactly as long as a track, or to tie each page of an
album or a book to its own track, bind the page to the track.

- `advance: { "mode": "audio_end" }` ends the page when the track its
  `audio_cue` names ends, the way `media_end` ends a page when its video ends.
  The page must carry an `audio_cue` and the playlist an `audio` soundtrack;
  otherwise the write is refused. If a Player cannot play the track, the page
  still lasts the track's length. Image and video
  primitives follow the `duration` rules: no `dwell_ms`, and `one_at_a_time:
  true` on every dynamic selector (`all`, `tag`, `folder`, or `ids` with more
  than one id), even when it matches one object today. Streams still need
  `duration`. An application may share the page but is never its controller.
  Send no `after_ms`. `max_ms` is an optional safety hint: the server sets the
  hard deadline from the track's verified length plus a margin, and
  `playlist show --output` leaves it out of the document you edit.
- `audio.cued: true` stops the soundtrack after each track. A track plays only
  when a page `audio_cue` starts it. It keeps playing under any ordinary pages
  that follow its page until it ends, and then the soundtrack is silent until
  the next cue, so a page and its track stay bound. Any number of ordinary
  pages may sit between bound pages. `loop` has no effect on a cued
  soundtrack. Without `cued`, the soundtrack moves on to the next track the
  instant a track ends, so a following page that cues that track
  (`restart: false`) changes together with it.

A bound page normally cues with `restart: true`, so its track starts with the
page. A cued album with one page per track and a timed page between songs:

```json
{
  "name": "Album",
  "audio": {
    "tracks": [
      { "id": "song1", "media_id": "med_SONG1" },
      { "id": "song2", "media_id": "med_SONG2" }
    ],
    "cued": true
  },
  "pages": [
    {
      "id": "song1-cover",
      "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
      "transition": { "type": "crossfade", "duration_ms": 200 },
      "advance": { "mode": "audio_end" },
      "audio_cue": { "track": "song1", "restart": true },
      "primitives": [
        {
          "id": "cover",
          "primitive": "image",
          "selector": { "by": "id", "media_id": "med_COVER1" },
          "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
          "layer": 0,
          "content_fit": "contain"
        }
      ]
    },
    {
      "id": "interlude",
      "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
      "transition": { "type": "crossfade", "duration_ms": 200 },
      "advance": { "mode": "duration", "after_ms": 8000 },
      "primitives": [
        {
          "id": "title",
          "primitive": "image",
          "selector": { "by": "id", "media_id": "med_TITLE" },
          "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
          "layer": 0,
          "content_fit": "contain"
        }
      ]
    },
    {
      "id": "song2-cover",
      "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
      "transition": { "type": "crossfade", "duration_ms": 200 },
      "advance": { "mode": "audio_end" },
      "audio_cue": { "track": "song2", "restart": true },
      "primitives": [
        {
          "id": "cover",
          "primitive": "image",
          "selector": { "by": "id", "media_id": "med_COVER2" },
          "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
          "layer": 0,
          "content_fit": "contain"
        }
      ]
    }
  ]
}
```

## Page scheduling with visibility

To switch whole playlists by daypart or put one playlist ahead of everything
for a while, use a playlist schedule or a takeover on the screen instead; see
[schedules and takeover](schedules.md).

A page may carry an optional `visibility` object that limits when the page
plays. It is a sibling of `advance`.

- Every playlist must keep at least one page with no `visibility` field at
  all.
- A screen running a scheduled playlist must have a timezone.

```json
{
  "id": "after-hours",
  "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
  "transition": { "type": "crossfade", "duration_ms": 200 },
  "advance": { "mode": "duration", "after_ms": 8000 },
  "visibility": {
    "enabled": true,
    "from": "2026-09-01T00:00",
    "until": "2026-12-31T23:59",
    "windows": [
      { "days": ["mon", "tue", "wed", "thu"], "start": "09:00", "end": "17:00" },
      { "days": ["fri"], "start": "22:00", "end": "02:00" },
      { "days": ["sun"] }
    ]
  },
  "primitives": []
}
```

- `enabled` is required and boolean. `false` hides the page unconditionally.
- `from` and `until` are optional civil bounds, `YYYY-MM-DDTHH:MM`, minute
  precision, **no offset and no zone suffix**. `from` is inclusive, `until` is
  exclusive.
- `windows` is an optional array of 1 to 16 recurring windows.
- `days` is 1 to 7 unique values from `mon`, `tue`, `wed`, `thu`, `fri`, `sat`,
  `sun`.
- `start` and `end` are civil `HH:MM`. Set both or omit both. Omitting both
  selects the whole day.

A page is eligible when `enabled` is `true`, the current civil time is inside
`[from, until)`, and `windows` is absent or at least one window matches.

An overnight window is written `end` at or before `start`, and the start day
owns it. `{"days": ["fri"], "start": "22:00", "end": "02:00"}` runs Friday
22:00 through Saturday 02:00.

```bash
screenrig screen set-timezone scr_EXAMPLE --timezone America/Los_Angeles
```

`--timezone` is an IANA identifier such as `America/Los_Angeles` or
`Europe/Berlin`. Set the timezone before assigning a scheduled playlist.
`screen update` accepts the same `--timezone`.

### Adslot pages

A seller places an advertising break as a whole `adslot` page, not as a canvas
primitive. The page carries only `id`, `type`, `adslot_id`, and an optional
`visibility` schedule; no creative, price, serving fee, or client-chosen duration
is stored in the playlist, and a selected fill never rewrites the saved document.

```json
{
  "id": "lobby_sponsor_break",
  "type": "adslot",
  "adslot_id": "ads_lobby",
  "visibility": {
    "enabled": true,
    "windows": [{"days": ["mon", "tue", "wed", "thu", "fri"], "start": "09:00", "end": "18:00"}]
  }
}
```

Keep at least one ordinary page with no visibility rule as the fallback. Adslot
pages count toward the normal page limits, the slot definition must already exist
for the project, and the assigned Players must support the adslot capability; a
slot definition alone does not create an ad break. An ad-bearing playlist is an
ordinary playlist read and write at `/api/playlists`; the CLI never filters an
ad break out of the document. `playlist preview` renders one labelled placeholder
for an adslot page because the fill is chosen at runtime, and a playlist bundle
cannot carry an adslot page. See [advertising](advertising.md).

## Playlist bundle export and import

Use a `screenrig.playlist-bundle/v1` directory to move one playlist and every
referenced image, video, or soundtrack audio file together.

```bash
screenrig playlist export pl_EXAMPLE --output ./lobby-bundle
screenrig playlist export pl_EXAMPLE --output ./lobby-bundle --skip-applications
screenrig playlist import ./lobby-bundle
screenrig playlist import ./lobby-bundle --update pl_TARGET
```

The export destination must not exist. The bundle contains
`screenrig-bundle.json`, `playlist.json`, and content-addressed
`media/<sha256>.<canonical-ext>` files. Export snapshots dynamic `all`, `tag`
and `folder` selectors to exact `id` or `ids` selectors. An application primitive stops
export before any media download unless `--skip-applications` is given, which
drops the application primitives and any page left with no primitives and
reports the skipped primitive and page ids. Import creates a new playlist by
default. Display names may repeat. `--name NAME` (1 to 120 characters)
optionally renames the imported copy; `--update ID` replaces the existing
playlist instead.
Updating requires `--update`; `--expect-rev` is optional.

```bash
screenrig playlist import ./lobby-bundle --name "Lobby loop (copy)"
```

## Live streams

Upload a ready image in the same project and use its ID as `fallback_media_id`.
Use at most one stream on a page with duration advance, for example
`advance: {"mode":"duration","after_ms":30000}`. Preview paints the fallback
without contacting the stream. Bundle import/export does not support streams.

```json
{
  "id": "live",
  "primitive": "stream",
  "sources": [
    {"protocol": "udp-mpegts", "group": "239.10.0.1", "port": 5000},
    {"protocol": "hls", "url": "https://example.com/live.m3u8"}
  ],
  "fallback_media_id": "med_fallback",
  "muted": true,
  "rect": {"x": 0, "y": 0, "width": 1920, "height": 1080},
  "layer": 0,
  "content_fit": "contain"
}
```

Provide one or two sources with unique protocols, in preference order. HLS uses
public HTTPS without embedded credentials. Web playback requires CORS on the
playlist, segments, and keys. Optional direct UDP/MPEG-TS multicast uses an IPv4
ASM group in 239/8 and a port on Android or Qt; enable reception locally first.
Other Players choose HLS when supplied, otherwise they receive the fallback.
There is no multicast-to-HLS conversion.

The fallback displays while connecting, stalled, unsupported, or offline. Live
stream bytes are not cached. Muted defaults to true; browser autoplay can
require mute. A stream never controls page advance. Use contain, cover, or fill;
entrance motion is supported, and continuous motion is limited to path.

Apple TV supports image, video, and HLS stream, but rejects playlists containing
iframe or application. The Linux Player supports web content, HLS, and optional
UDP/MPEG-TS multicast. HLS is also supported on Web, Android, macOS, and Windows.
Every Player download is at https://screenrig.ai/downloads/ (Android on Google
Play: https://play.google.com/store/apps/details?id=ai.screenrig.player). See https://screenrig.ai/docs/players.md for the
platform matrix.

### Tag filters and playback batches

Media carries up to 32 unique tags, each 1–32 letters or digits. Replace the
whole set with `screenrig media update med_ID --tags Summer,Drinks`.
`--tag Summer` replaces it with one tag; `--clear-tag` clears every tag.
`media list --tag Summer` matches membership anywhere in the set. Tags are
case-sensitive and are never authorization.

A dynamic selector can use one `tag` or a `tags` filter object:

```json
{
  "by": "tag",
  "tags": { "all": ["Summer", "Drinks"], "any": ["Lobby", "Patio"], "none": ["Expired"] },
  "order": "random",
  "one_at_a_time": false,
  "batch_size": 3
}
```

`all` requires every listed tag, `any` requires at least one, and `none`
excludes any listed tag. Present groups combine with AND; omitted groups
impose no condition. Supply at least one nonempty group. Each group accepts
up to 32 unique tags. `tag` and `tags` are mutually exclusive. A `none`-only
filter selects all ready media of that primitive except the excluded tags.
Image selectors select images and video selectors select videos.

A folder selector plays the files a person keeps in one folder of the
dashboard's Media library:

```json
{ "by": "folder", "folder_id": "mfd_EXAMPLE", "order": "filename", "one_at_a_time": true }
```

The person organizes folders in the dashboard and copies a folder's
identifier from its details there; `media show med_ID` reports a file's
`folder_id`, absent at the library's top level. The folder must exist when
the playlist is written; it may be empty. Moving files in or out changes
what playing screens show from their next loop, without a playlist write. A
folder that is later deleted matches nothing, so its primitive is skipped.

The candidate pool contains up to 1,024 ready media per selector, with 1,024
media references across the complete loop snapshot. A larger match returns
an error; narrow the filters. `batch_size` is a separate limit of 1–1,024
items per page visit. On a `media_end` page, `one_at_a_time: false` plays the
next batch in sequence; omitting `batch_size` plays the remaining pass.
`one_at_a_time: true` plays one item per appearance and allows only an omitted
batch size or `batch_size: 1`. Duration, application and `audio_end` pages
require `one_at_a_time: true` on every dynamic selector (`all`, `tag`,
`folder`, or `ids` with more than one id), even when it matches one object
today. Images on `media_end` also require `dwell_ms`; videos cannot loop on
that page.

The Player resolves every dynamic media primitive in one request at playlist
startup and at each loop boundary. Membership is frozen during the loop.
Uploads, removals, and tagging changes do not regenerate the manifest.
At the next refresh, removed or newly excluded items leave the pending queue;
new matches join when the current pass finishes. A final batch may contain
fewer than the requested number; it does not refill from the next pass.
Filename order sorts by filename, then media ID. Random order shuffles once
per complete pass, preserving the remaining order across loop refreshes.
The cursor is local to the screen, playlist, page, and primitive, persists
across restart, and resets when the filter, order, or batch policy changes.
Offline playback uses the last successful snapshot. Empty matches skip the
primitive and any resulting empty page.

Save the selector object above as `selector.json`, then inspect its current
candidate catalog before publishing:

```sh
screenrig media selector-preview selector.json --primitive video
```

Preview returns `matched_count`, filename-ordered `candidates` with media
IDs and tags, and the normalized `selector` policy. With random order it
shows the pool and shuffle policy; it does not choose the Player's shuffle,
advance a cursor, create a playback grant, or change a manifest. The API is
`POST /api/selectors/preview` with `{ "primitive": "video", "selector": ... }`.
It uses the authenticated project and the same matching rules as playback.
Catalog changes after preview are resolved at playback's next loop boundary.

Static bundle export freezes dynamic matches as exact IDs. It preserves
one-at-a-time or complete-pass playback; a bounded runtime sequence using
`batch_size` with `one_at_a_time: false` requires removing that field or
choosing explicit IDs before export. This prevents silently losing a runtime
batch cursor in a static bundle.

## Local card previews, data conditions and receipts

Use `card preview TYPE --params params.json --data data.json --output card.png`
for one card, or `card preview crd_CARD --output card.png` for a saved instance.
Then run `playlist preview FILE --output preview --contact-sheet` for its full
page context. Open and inspect the image files before publishing. The CLI runs
an installed Chromium or Chrome locally; `SCREENRIG_BROWSER` selects its
executable. It fetches the verified published renderer and fonts and reuses its
cache. `--now 2026-10-20T18:00:00Z --timezone America/Vancouver` freezes card
clocks. `data.rendered_cards` names rendered card versions; `data.placeholders`
names content that was represented by a box. Application interaction and live
streams still need Player verification.

Root launches supply Chromium's required `--no-sandbox`; other users retain its
sandbox. A render failure includes browser console errors and failed-resource
paths, with credentials and URL query strings removed. Include those diagnostics
when reporting a failed preview.

Optional `backgroundColor` and `textColor` card params accept `#RRGGBB` or
`#RRGGBBAA` (CSS alpha order). `backgroundColor: "#382719CC"` makes a translucent
warm scrim; `#E86A17` makes a solid orange ground. `background: "none"` takes
precedence. `textColor` sets main and secondary text, while `accent` continues
to colour eyebrows/highlights. Unset properties preserve the theme. Text-card
bodies keep newlines and put inline bullet separators on separate lines.

`card data put crd_CARD --file data.json --ttl 2h` expires that edition two
hours after acceptance; `--expires-at ISO` supplies an absolute deadline. Use
one option at a time. A replacement without either removes expiry. Expired
data stays inspectable through the agent read but blanks on an updated Player,
including offline caches. Repeating an identical idempotent write preserves
its original deadline.

A page can use `"visibility":{"enabled":true,"data":{"key":"crd_CARD",
"path":"/enabled","equals":true}}`. `key` names card data; `path` is an optional
JSON Pointer. Without `equals`, the document or field must exist (a present
null counts); with it, the scalar must equal the supplied value. Missing and
expired data never match. Keep one ordinary page without visibility as a
permanent fallback. Date/time bounds can be combined with the data condition.
Players advertise `page.conditions`; other Players receive conditional pages
disabled. A screen's `effective_timezone` and `timezone_source` show the
configured zone, device fallback, or unknown. An explicit UTC zone stays UTC.

Watch project events `screen.card_data_applied` for a rendered edition
(`manifest_revision`, `page_id`, `primitive_id`, `data_key`, `data_revision`)
and `screen.playlist_loop_completed` for the first uninterrupted eligible loop
of a manifest. These are Player receipts, separate from write acceptance.
Screenshot-ready events continue to identify completed captures.

Use `screen changes scr_SCREEN` to list up to 50 issued composition changes
retained for 30 days. `screen revert scr_SCREEN --change-id man_CHANGE
--expect-rev REV` restores that change's preceding composition on that screen
by creating a separate playlist. Other screens and source playlists stay as
they are. Live card data stays current, with its expiry. A newer publish,
assignment, takeover, expired history or unavailable dependency refuses the
revert. Exact retries return the same accepted assignment. Check the returned
screen's `manifest_upgrade` or its activation event before claiming the Player
has applied it.
