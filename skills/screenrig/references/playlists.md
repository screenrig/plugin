# Playlists, motion, schedules and bundles

## Prepare, publish, and edit playlists

For ready images and videos, prepare a full-screen playlist in playback order:

```sh
screenrig playlist init med_POSTER med_VIDEO --name "Lobby loop" --screen-id scr_LOBBY --output lobby.json
screenrig playlist preview lobby.json --output preview --contact-sheet
screenrig screen publish scr_LOBBY lobby.json --expect-rev 7
```

Inspect the document and preview before publishing. `playlist init` accepts local
image/video files, ready `med_` IDs, pinned `rel_` application releases, and HTTPS
iframe URLs in playback order, including mixed inputs:

```sh
screenrig playlist init ./poster.png med_VIDEO rel_APP https://example.com --name Lobby --screen-id scr_LOBBY --output lobby.json
```

Local files upload through the normal media path and wait for readiness. This
requires ffmpeg and ffprobe unless `--no-transcode` is supplied. Preparation writes
the local document and may upload media; it neither creates a remote playlist nor
assigns a screen. Existing media must be ready. HTTPS URLs must contain no username
or password and are not fetched during preparation.

For retryable file preparation, choose `--idempotency-key` on the first attempt
and reuse it with identical files and input order within the server replay window.
Each file occurrence gets its own upload keys. Without an explicit key, a new
invocation gets new keys. Uploaded media survives a later preparation failure;
inspect `media list` and reuse those IDs when reconciling a partial result.

Each input becomes one full-screen page with a black background and a 200 ms
crossfade. Images and videos use `--fit contain|cover|fill` (default `contain`).
Videos are muted, do not loop, and advance on completion. Other pages use
`--duration-ms` (default 8000). Applications and iframes use `fill`; application
releases are pinned with timed advancement and no controller privileges. Edit the
document for application-controlled advancement. The static preview represents
applications and iframes with placeholders; verify release readiness, embedding,
and actual playback through the server and intended Player.

Supply `--screen-id` to read the target dimensions and revision. The result includes
`data.screen_id`, `data.screen_revision`, `data.preview.argv`, and `data.publish.argv`.
Pass these argument arrays to the bundled `screenrig` launcher without shell
splitting: they preserve paths, config, API origin, and the observed revision.
Inspect the preview before publishing. Later screen changes still cause revision
conflicts. Target metadata stays outside the authored document.

To override the canvas, supply both `--target-width` and `--target-height`. These
also work without a screen, in which case no publish arguments are returned.
Unknown or multiple reported surfaces require explicit dimensions. Output files
must not already exist.

`screen publish <screen-id> <file>` creates a new playlist, assigns it using the
expected **screen** revision, and reads back the assignment. It does not update an
existing playlist by name. A name collision requires a different name or an
explicit `playlist update`. Its JSON result reports `playlist_id`,
`playlist_revision`, `screen_id`, `screen_revision`, `assignment_verified`, and
`playback_verified`. Assignment verification does not prove playback; request and
inspect a screenshot and relevant playback evidence separately.

Publishing saves a private local journal automatically. After an ambiguous failure,
repeat the identical command and input with the same config to resume. If playlist
creation succeeded before assignment failed, the error identifies the created
playlist. Do not delete it or start another create to recover. A revision conflict
requires inspecting the screen and reconciling the intended assignment; an already
created playlist can be assigned explicitly with `screen assign`. Publishing never
silently refreshes the expected revision. Unfinished recovery stops after the
24-hour server idempotency window; inspect and reconcile before making more writes.

To edit an existing playlist:

```sh
screenrig playlist show pl_EXISTING --output lobby.json
screenrig playlist update pl_EXISTING lobby.json --expect-rev 4
```

`playlist show --output` writes the editable `{name, pages}` document and returns
its path, `playlist_id`, and source `revision` on stdout. Use that returned revision
for the update. It preserves dynamic selectors, schedules, motion, and pinned
application releases, removing server-derived media and timing fields. Comments
remain separate. Plain `playlist show` is an inspection response; `--editable`
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
archived assignments. Apply the reviewed change using its `data.revision` and
`data.impact`:

```sh
screenrig playlist replace-release pl_EXISTING --page board-page --primitive board --release-id rel_NEW --apply --expect-rev 4 --expect-impact TOKEN_FROM_PREVIEW
```

Other primitives and settings are preserved. The update affects every screen
assigned to this shared playlist; archived screens retain the new pin for later
use. A changed replacement, revision, or observed screen impact requires a fresh
preview and review. Assignments may change after the snapshot: only the playlist
revision is checked atomically by the server. The server validates release
availability and ownership on apply. Existing pins remain unchanged until apply;
afterward, verify manifest revisions and playback on the affected screens.

Playlist validate, create, update, preview, and screen publish accept `-` as their
input file to read stdin. JSON envelopes are never written into authored files.
`--expect-rev` is the preferred revision spelling; `--if-match` remains a compatible
alias. Supply only one. The HTTP revision contract is unchanged.

Generation accepts either `--prompt TEXT` or `--prompt-file FILE`, including
`--prompt-file -` for stdin. The file is the complete prompt, with no trimming;
the existing 4000-character limit applies. Prompts are excluded from diagnostics.

## Playlist writes

Use five primitives: `image`, uploaded `video`, live `stream`, `iframe`, and
`application`. Streaming requires a compatible backend and Player.
Do not author native `text`, `box`, or `line` on the wire. Presentable copy
lives in the generated still. Deck copy and chrome are composed locally,
uploaded as `image`, and used as one image primitive.

A playlist has `name` and `pages`, with no playlist-wide dimensions. Each
page's `canvas.width` and `canvas.height` define its layout coordinate system;
`canvas.viewport_fit` controls how it fits the Player's viewport. This layout
size can differ from the pixel dimensions of media rendered from a compose deck.

A full playlist page is `id`, `canvas`, `transition`, `advance`, optional `visibility`,
and `primitives`. A primitive is flat: `id`, a `primitive` field naming
a supported kind, that primitive's own fields, then `rect`, `layer`, `content_fit`,
optional `enter`, and optional `motion`. There is no nested content object.

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
- `ids`: 1–32 unique ready IDs.
- `all`: every ready object of that primitive, image or video.
- `tag`: ready objects of that primitive whose tag matches
  `^[A-Za-z0-9]{1,32}$`.

`media_end` is valid only on a page with exactly one image or video primitive.
Video `loop` must be false. An image on `media_end` requires `dwell_ms`.
`dwell_ms` is rejected on duration and application pages. A video plus a
lower-third image is two primitives: that page must use `advance.mode`
`duration`, not `media_end`. Set `after_ms` longer than the clip, or set
`loop: true`. If `after_ms` equals the clip length, the page cuts when the
film ends.

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
`advance.mode` `duration`. Do not use `media_end` there.

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

## Page scheduling with visibility

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
screenrig screen set-timezone scr_EXAMPLE --timezone America/Los_Angeles --expect-rev 3
```

`--timezone` is an IANA identifier such as `America/Los_Angeles` or
`Europe/Berlin`. Set the timezone before assigning a scheduled playlist.
`screen update` accepts the same `--timezone`.

## Playlist bundle export and import

Use a `screenrig.playlist-bundle/v1` directory to move one playlist and every
referenced image or video rendition together.

```bash
screenrig playlist export pl_EXAMPLE --output ./lobby-bundle
screenrig playlist import ./lobby-bundle
screenrig playlist import ./lobby-bundle --update pl_TARGET --expect-rev REVISION
```

The export destination must not exist. The bundle contains
`screenrig-bundle.json`, `playlist.json`, and content-addressed
`media/<sha256>.<canonical-ext>` files. Export snapshots dynamic `all` and `tag`
selectors to exact `id` or `ids` selectors. Application primitives stop export
before any media download. Import creates a new playlist by default. Playlist
names are unique per account, so importing an account's own export unchanged
is refused with 409 `resource_conflict` ("playlist name is already in use");
that problem's `error.next` names the two ways forward. `--name NAME` (1 to
120 characters) imports the bundle as a new playlist under that name;
`--update ID --expect-rev REVISION` replaces the existing playlist instead.
Updating requires both `--update` and the current `--expect-rev` revision.

```bash
screenrig playlist import ./lobby-bundle --name "Lobby loop (copy)"
```

## Live streams

Upload a ready image in the same account and use its ID as `fallback_media_id`.
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
Native Players are coming soon. See https://screenrig.ai/docs/players.md for the
platform matrix and availability.
