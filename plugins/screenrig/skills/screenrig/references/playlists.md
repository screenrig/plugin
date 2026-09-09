# Playlists, motion, schedules and bundles

## Playlist writes

Four wire primitives exist: `image`, `video`, `iframe`, and `application`.
Static is `image`, motion is `video`, and web is `iframe` or `application`.
Do not author native `text`, `box`, or `line` on the wire. Presentable copy
lives in the generated still. Deck copy and chrome are composed locally,
uploaded as `image`, and used as one image primitive.

A playlist has `name` and `pages`, with no playlist-wide dimensions. Each
page's `canvas.width` and `canvas.height` define its layout coordinate system;
`canvas.viewport_fit` controls how it fits the Player's viewport. This layout
size can differ from the pixel dimensions of media rendered from a compose deck.

A full playlist page is `id`, `canvas`, `transition`, `advance`, optional `visibility`,
and `primitives`. A primitive is flat: `id`, a `primitive` field naming one of
the four, that primitive's own fields, then `rect`, `layer`, `content_fit`,
optional `enter`, and optional `motion`. There is no nested content object.

Keep the authored playlist JSON as the source of truth. `playlist show` is an
inspection payload, not a guaranteed write document: the server may add
resolved/defaulted fields such as `advance.max_ms` and
`selector.one_at_a_time`. Do not feed a show payload directly to `playlist
create` or `playlist update`; edit and submit the authored file instead.

Image and video primitives require a `selector`. `iframe` and `application`
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
screenrig --json screen set-timezone scr_EXAMPLE --timezone America/Los_Angeles --if-match 3
```

`--timezone` is an IANA identifier such as `America/Los_Angeles` or
`Europe/Berlin`. Set the timezone before assigning a scheduled playlist.
`screen update` accepts the same `--timezone`.

## Playlist bundle export and import

Use a `screenrig.playlist-bundle/v1` directory to move one playlist and every
referenced image or video rendition together.

```bash
screenrig --json playlist export pl_EXAMPLE --output ./lobby-bundle
screenrig --json playlist import ./lobby-bundle
screenrig --json playlist import ./lobby-bundle --update pl_TARGET --if-match REVISION
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
`--update ID --if-match REVISION` replaces the existing playlist instead.
Updating requires both `--update` and the current `--if-match` revision.

```bash
screenrig --json playlist import ./lobby-bundle --name "Lobby loop (copy)"
```

