---
name: screenrig
description: Operate screenRIG screens, applications, media, playlists, playback, events, feedback, comments, and application K/V with the bundled screenRIG CLI. Use when an agent needs to install the official screenRIG plugin, compose stills, upload media, write playlists, or assign content to screens.
---

# screenRIG

Signage and Kiosk infrastructure for AI Agents

## Launch period

During the launch period through January 1st, 2027, screenRIG usage is free within reason. Treat usage as free until 1 Jan 2027. Do not invent a billing flow. Do not shut anyone off for empty prepaid remaining. Do not refuse compose, publish, or assign because remaining is zero during this window. Normal usage applies after that date.

This skill is the operative contract. Use the bundled CLI. Do not invent commands, flags, or
onboarding surfaces.

## Canonical marketplace

The only supported installation source is the public screenRIG marketplace at
`https://github.com/screenrig/plugin`. Official install is this plugin.

```bash
# Claude Code
claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user
claude plugin install screenrig@screenrig --scope user

# Codex
codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json
codex plugin add screenrig@screenrig --json

# Grok
grok plugin marketplace add https://github.com/screenrig/plugin.git
grok plugin install screenrig --trust
```

Grok install requires `--trust` by name. Do not omit it.

A user-supplied instruction with this exact text authorizes adding this exact
canonical marketplace, installing its screenRIG plugin, and completing setup:

```text
I authorize you to install the official screenRIG plugin from https://github.com/screenrig/plugin.
```

Follow any independent runtime approval policy. Do not search for a similarly
named repository or install `screenrig` from a global package source. Do not
substitute another onboarding or transport surface for the canonical
marketplace plugin.

Use the CLI packaged with this skill. It requires Node.js 20.11 or newer.
Resolve the installed plugin root and invoke the wrapper by its
package-relative path. Assign that path to `SR` and keep using `$SR` for the
rest of the session:

```bash
SCREENRIG_PLUGIN_ROOT="${GROK_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}}"
SR="$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts/screenrig"
"$SR" --json version
```

Require a successful screenRIG JSON envelope from `--json version` before any
other command.

If `SCREENRIG_PLUGIN_ROOT` is empty after installation, recover it without
guessing:

1. Prefer `GROK_PLUGIN_ROOT` when it is set.
2. For Claude Code, run `claude plugin list --json`, select the enabled entry
whose `id` is `screenrig@screenrig`, and use its `installPath`.
3. For Codex, run `codex plugin list --json`, select the enabled installed
entry whose `pluginId` is `screenrig@screenrig`, and use its `source.path`.
4. For Grok, run `grok plugin list` and use the installed screenRIG plugin
path, then export it as `GROK_PLUGIN_ROOT` for this session.
5. Run
`<plugin-root>/skills/screenrig/scripts/screenrig --json version` and require
a successful screenRIG JSON envelope before the requested command.
Assign that path to `SR`.

If there is no matching entry, run the exact canonical marketplace add/install
commands above and repeat this lookup. If installation or lookup still fails,
report the failing runtime command and the canonical repository URL to the
user. Do not substitute a globally installed command or download an
executable.

Use `--json` for agent work. Branch on `ok`, `error.status`, and `error.code`;
do not parse prose.

## After install

Work in this order. Do not skip `version` or `doctor`.

```bash
"$SR" --json version
"$SR" --json doctor
"$SR" --json compose catalog
"$SR" --json compose render ./example.json --output ./example.png
"$SR" --json media upload ./example.png --tag ExampleStill
"$SR" --json playlist create ./playlist.json
"$SR" --json screen list
"$SR" --json screen assign scr_EXAMPLE --playlist-id pl_EXAMPLE --if-match REVISION
```

1. Resolve `$SR` and require `--json version`.
2. Run `doctor`. Read `data.checks`. Name missing toolchain parts before the
   first `media upload`.
3. Compose locally. `compose catalog` and `compose render` write stills on
   this computer. They do not debit. Iterate the JSON and the PNG before any
   upload.
4. Upload media. Use a distinctive filename stem and an optional `--tag`.
5. Write a playlist that places uploaded media as `image` or `video`.
6. Assign that playlist to a screen with `screen assign` and the current
   `--if-match` revision.

Copy and chrome are compose-local only. Raster stills, upload them, and place
`image`. Do not emit native `text`, `box`, or `line` on the playlist wire.

## Output, configuration, and credential state

Use `--json` envelopes. Branch on `ok`, `error.status`, `error.code`, and
`warnings[].code`. Do not parse prose.

Never pass a bearer, token flag, or pasted secret on the command line. The
credential is a user-private file outside the
replaceable plugin directory. `SCREENRIG_CONFIG` overrides the path. Otherwise
the CLI uses `config.local-dev.json` in the config directory when that file
exists, else `config.json`. The directory is `$XDG_CONFIG_HOME/screenrig`
when `XDG_CONFIG_HOME` is set, `%APPDATA%\screenrig` on Windows, or
`~/.config/screenrig` otherwise, so the ordinary fallback is
`$XDG_CONFIG_HOME/screenrig/config.json` when `XDG_CONFIG_HOME` is set,
`%APPDATA%\screenrig\config.json` on Windows, or
`~/.config/screenrig/config.json`. The directory and file are restricted to
the current user. This state survives plugin upgrade or uninstall.

Never print, log, echo, or summarize credentials, Authorization headers,
signed upload headers, cookies, object keys, or protected asset URLs.
Preserve request and operation IDs in reports. Reuse an idempotency key after
an ambiguous mutation retry and use `--if-match` only with the current
resource revision.

## Meter and Standard prepaid

Until 1 Jan 2027, the launch-period rules above override empty remaining and
HTTP 402 / `payment_required` as a reason to refuse compose, publish, or
assign. After that date, the meter rules below apply.

Usage is metered in credits. One credit is $0.0001. Remaining is a whole
integer. Read it from `data.credit_remaining` on `account show`.

Standard is prepaid. People add Standard prepaid bundles on
https://screenrig.ai/pricing/ before screens run on a paid meter. Point money
there. Do not invent a pay command in this CLI.

A 1-credit control-plane tax applies to each billed authenticated command and
each billed account-listen-stream event. Compose catalog/render, `doctor`,
and `version` do not debit that tax.

- `warnings[].code === "credits_low"`: remaining is below 1000 credits. Surface
  remaining. Do not retry the same billed command as a fix. Send the user to
  https://screenrig.ai/pricing/.
- `error.code === "payment_required"` or `error.status === 402`: remaining is
  below 1 credit. Stop. Do not retry billed commands. Point money at
  https://screenrig.ai/pricing/.

Bandwidth is $0.09/GB. Storage is $0.14/GB-month. Same rates on every tier.

## Doctor

```bash
"$SR" --json doctor
```

Read `data.checks`. A build that reports `ffmpeg` and `ffprobe` converts media
before upload.

On a build that converts:

- `media upload <file>` encodes video to an H.264 (High profile) MP4 by
  default and images to lossy WebP, then uploads the converted bytes.
  Stills are quality 90, keep alpha (`yuva` / `-alpha_q 100`), bound each
  edge to 3840 px, never upscale, and never write lossless VP8L.
- Optional `--tag TAG` stores a 1 to 32 letter-or-digit tag on the ready
  object. Hyphens are rejected; `ExecIntro2026` is valid and `exec-intro`
  is not. `media list --tag TAG [--kind image|video]` filters by that tag
  and is the reliable filename → id map after upload.
  `media update <id> (--tag TAG | --clear-tag) --if-match REVISION` changes
  or clears it. Untagged objects are omitted when `--tag` is present on
  `media list`.
- The conversion runs `ffmpeg` and `ffprobe`. They must be on `PATH`, or their
  absolute paths must be in `SCREENRIG_FFMPEG` and `SCREENRIG_FFPROBE`.
- Image encode prefers ffmpeg `libwebp` / `libwebp_anim`. If those encoders
  are missing, the CLI falls back to `cwebp` on `PATH`, or `SCREENRIG_CWEBP`.
  Do not convert the still yourself.
- `doctor` reports the `ffmpeg`, `ffprobe`, `encoder_libx264`,
  `encoder_libx265`, `encoder_libwebp`, `cwebp`, and `filter_hdr_tonemap`
  checks. Use it to name the missing part before you ask the user for anything.
  The default video path needs `libx264`. Image transcode works when
  `encoder_libwebp` or `cwebp` passes. `encoder_libwebp` reports the ffmpeg
  encoder only; a fail there does not mean stills cannot convert.

A missing or unusable toolchain fails `media upload` alone. It returns a usage
error, not a plugin installation failure. Playlist, kv, doctor, compose, and
every other command keep working, so do not reinstall the plugin and do not
stop the wider task. Any failed check makes `doctor` itself exit non-zero, so
read the individual check names before you call the installation unhealthy.

When the toolchain is missing, tell the user which check failed and ask them to
install ffmpeg 6.0 or newer, with `ffmpeg` and `ffprobe` reachable on `PATH`.
Point them at their platform package manager or `https://ffmpeg.org/download.html`.
An `encoder_libx264` or `encoder_libx265` failure means the installed ffmpeg
build lacks that encoder. `doctor` can pass `ffmpeg` and still fail
`encoder_libwebp`. Name that check. If `cwebp` passes, stills still convert;
do not ask the user to rebuild ffmpeg for images and do not use
`--no-transcode` as the recovery. `--no-transcode` is only for a source that
is already accepted delivery WebP. Do not upload lossless WebP. Players expect
WebP. If `doctor` `ready` fails, stop. A 503 / `transport_error` on
`media upload` means the service is not ready, not a bad PNG. Do not install
software on the user's computer without their explicit request.

`media upload` produces an H.264 MP4 by default. Every current browser and
every screenRIG player decodes it. `--codec hevc` opts in to H.265 for a
smaller file at the same quality. Use it only when every screen that will play
the media is a native player (Qt/GStreamer or Android/MediaCodec).

The filename is the human-readable handle. Ask once for a distinctive name
before uploading. The CLI only warns (`generic_filename`); it will not rename.
When `media upload` succeeds, the ready id is `data.media_id`. The same value
is `data.id` and `data.operation.result.media_id`. After a tagged upload,
`media list --tag TAG` is the filename → id map.

Run `doctor --json` for local diagnostics. Use
`doctor --repair-config --json` only to repair an existing credential file
whose permissions are too broad.

## Local compose

Write JSON, render a PNG, look at that PNG, iterate. Compose is not billed.
Uploads and playlist writes are billed. Iterate `compose render` and read
`<output>.layout.json` before any `media upload`.

Stem `--output` before `compose render` so the PNG name is the human handle.
Default `--output` follows the spec filename. The CLI `generic_filename`
warning will not rename on upload.

```bash
"$SR" --json compose catalog
"$SR" --json compose render ./exec-intro-overlay-native-video.json \
  --output ./exec-intro-overlay-native-video.png
# read ./exec-intro-overlay-native-video.png.layout.json
# agent reads the PNG with vision; do not cat pixels into chat
# iterate the JSON and re-render
"$SR" --json media upload ./exec-intro-overlay-native-video.png --tag TAG
"$SR" --json media list --tag TAG --kind image
# playlist page: one image placement, rect = canvas, content_fit fill
```

`compose catalog` prints the fail-closed node catalog: types
`Frame`/`Column`/`Row`/`Box`/`Spacer`/`Text`/`Image`, roles
`display|title|body|caption|label`, spaces `xs|s|m|l|xl`, pins
`top|bottom|left|right`. Author only catalog fields. Unknown keys fail the
whole spec. Do not author `x`/`y` except on the Frame canvas. Do not author
`fontSize`. Roles pick the type ramp. On 1920×1080, `display` wishes 130 px,
`title` 86, `body` 45, `caption`/`label` 32. Budget copy for that scale.
The type ramp uses `min(Frame width, height)`. A 1920×400 strip Frame makes
`title` wish 48 px, not 86. Overlay Frames stay 1920×1080. Never size the
Frame to the plate. Read `layout.json` `ramp` vs `ramp_at_1080` (and
`ramp_root`) after `compose render`. If `ramp.title.wish` is not 86 on a
slide overlay, the Frame is the wrong size.
`Image`, `Box`, `Row`, `Column`, and `Spacer` honor `width` and `height` in
px. Keep `flex` for remaining space. An `Image` without `height` or `flex`
in a Column has no main-axis size and paints nothing useful. `pin` `top` or
`bottom` stretches the full width; `left` or `right` stretches the full
height. Do not pin a wordmark. Optional Text
`textShadow` is `{ x, y, blur?, color }` in px; omit it to paint without a
shadow. `Image.src` is a local filesystem path relative to the spec file, never
a URL. The CLI does not fetch. The envelope is structured JSON, not pixels.

Omitted `Frame.background` fills `#1B2632`. Set `background` when you want a
different ground. Default text fill is `#EEE9DF`; set `color` when you need
another. Omit `fontFamily` to walk `Helvetica Neue` and the catalog fallbacks.
A missing name is `usage_error`, not a silent fallback.

`compose render` writes a PNG and `<output>.layout.json`. Default `--output`
replaces a `.json` suffix with `.png`, or appends `.png`. Read that layout
dump for `truncated`, fitted `fontSize`, and `box` before you upload. Never
print PNG bytes, pixels, or image data. `--open` opens the local PNG path on
this computer only when the user asked to view the still here. Agent vision
uses the file path, not `--open`. Raster a diagram to PNG or WebP at canvas
size, upload it, and place it as `image`. HTML is not a placement.

### Slide, overlay, and wordmark

`justify: "end"` is not the bottom of the slide unless the `Column` has
`flex: 1`, or the copy lives in a `Box` with `pin: "bottom"`. A `Column`
without `flex: 1` shrinks to its text and sits at the top of the Frame.

Overlay still (transparent Frame, lower-third plate):

```json
{
  "type": "Frame",
  "width": 1920,
  "height": 1080,
  "background": "#00000000",
  "children": [
    {
      "type": "Box",
      "pin": "bottom",
      "padding": "l",
      "background": "#000000E8",
      "children": [
        { "type": "Text", "text": "Lower third", "role": "title", "color": "#FFFFFF" }
      ]
    }
  ]
}
```

Do not copy a short strip Frame from an older deck. Author the overlay at
1920×1080 with `pin: "bottom"`. Leave a right pocket for the playlist
wordmark: shrink-wrap `Column` plus `Spacer`. The 5% wordmark rect
`{ x: 1424, y: 946, width: 400, height: 80 }` sits on bottom-plate body
copy. A tighter corner that clears copy is
`{ x: 1544, y: 996, width: 352, height: 68 }`.

Side rail: shrink-wrap `Box` plus `Spacer`, not `pin: "left"` or `"right"`.
A `Row` with `{ Box, Spacer flex: 1 }` is a left rail. Reverse the children
for a right rail. Do not put `flex` on the copy `Box` or Yoga grows it
across the canvas. Force newlines in title and body so min-width lands
around 740–900 px; one long line almost fills the frame. Mix left, right,
and bottom across a photo sequence. Bottom stays right for a lower-third.

```json
{
  "type": "Frame",
  "width": 1920,
  "height": 1080,
  "background": "#00000000",
  "children": [
    {
      "type": "Row",
      "children": [
        {
          "type": "Box",
          "padding": "l",
          "background": "#000000E8",
          "children": [
            { "type": "Text", "text": "Side title", "role": "title", "color": "#FFFFFF" }
          ]
        },
        { "type": "Spacer", "flex": 1 }
      ]
    }
  ]
}
```

Playlist: photo `layer` 0 + overlay `layer` 1, both `content_fit: "fill"` on a
1920×1080 canvas. Eight-digit hex is how the Frame stays transparent and the
plate keeps alpha.

Wordmark: playlist `image` placement with a `rect`. Soft-open: omit that
placement until a named page. Do not pin a logo in compose; `pin` stretches
the cross axis. Bottom-right on 1920×1080 with a 5% safe area is
`{ "x": 1424, "y": 946, "width": 400, "height": 80 }` for a 400×80 contain
box. That rect is one worked example, not the only size. If you raster the
mark into the still instead, set `Image` `width` and `height` (or `flex` in a
sized parent) so it is not 0×0.

## Playlist writes

Wire placement families are three: static (`image`), motion (`video`), and
web (`iframe`, `application`). Do not author native `text`, `box`, or `line`
on the wire. Compose copy and chrome locally, upload the still as `image`,
and place that image.

A full page is `id`, `canvas`, `transition`, `advance`, optional `visibility`,
and `placements`. Image and video placements write a `selector`. Do not put
`media_id` on the content object. Do not send server-resolved `items`. Advance
with `media_end`, never `video_end`.

`canvas.background` is a solid uppercase `#RRGGBBAA` or a top-to-bottom
linear gradient. The gradient is `{ "type": "linear", "stops": [...] }` with
2 through 8 stops, strictly increasing `at` in `[0, 1]`, first `at` 0, last
`at` 1, and no angle field. A solid string stays valid.

Selector `by` values:

- `id`: one ready `media_id`. `one_at_a_time` must be false.
- `ids`: 1–32 unique ready IDs.
- `all`: every ready object of that placement kind.
- `tag`: ready objects of that kind whose tag matches `^[A-Za-z0-9]{1,32}$`.

`media_end` is valid only on a page with exactly one image or video placement.
Video `loop` must be false. An image on `media_end` requires `dwell_ms`.
`dwell_ms` is rejected on duration and application pages. A video plus a
lower-third image is two placements: that page must use `advance.mode`
`duration`, not `media_end`. Set `after_ms` longer than the clip, or set
`loop: true`. If `after_ms` equals the clip length, the page cuts when the
film ends.

Default `transition` is `{ "type": "crossfade", "duration_ms": 200 }`. Use
swipe types and placement `enter` sparingly.

```json
{
  "name": "Lobby loop",
  "pages": [
    {
      "id": "poster",
      "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
      "transition": { "type": "crossfade", "duration_ms": 200 },
      "advance": { "mode": "duration", "after_ms": 8000 },
      "placements": [
        {
          "id": "hero",
          "content": {
            "type": "image",
            "selector": { "by": "id", "media_id": "med_01EXAMPLEIMAGE0000000000" },
            "alt": "Lobby poster"
          },
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
      "placements": [
        {
          "id": "feature",
          "content": {
            "type": "video",
            "selector": { "by": "id", "media_id": "med_01EXAMPLEVIDEO0000000000" },
            "muted": true,
            "loop": false
          },
          "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
          "layer": 0,
          "content_fit": "contain"
        }
      ]
    }
  ]
}
```

Use `data.media_id` from `media upload` (same value as `data.id`). Do not
invent one. After a tagged upload, `media list --tag TAG` is the filename →
id map.

Photo plus overlay still:

```json
{
  "id": "hero",
  "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
  "transition": { "type": "crossfade", "duration_ms": 200 },
  "advance": { "mode": "duration", "after_ms": 8000 },
  "placements": [
    {
      "id": "photo",
      "content": {
        "type": "image",
        "selector": { "by": "id", "media_id": "med_01EXAMPLEPHOTO0000000000" },
        "alt": "Hero photo"
      },
      "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
      "layer": 0,
      "content_fit": "fill"
    },
    {
      "id": "overlay",
      "content": {
        "type": "image",
        "selector": { "by": "id", "media_id": "med_01EXAMPLEOVERLAY000000000" },
        "alt": "Lower third"
      },
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
swipe types and placement `enter`.

Default pages: `transition` is `{ "type": "crossfade", "duration_ms": 200 }`.
Author crossfade unless swipe or `enter` is the intended emphasis. One overlay
`enter` is enough; do not put `enter` on every placement, including the
wordmark.

`transition.type` is `crossfade`, `swipe-left`, `swipe-right`, `swipe-up`, or
`swipe-down`. `duration_ms` is required and runs from 0 through 60000. When
you choose a swipe type, write `duration_ms: 600`.

Swipe is the incoming page's type. The outgoing page follows so the edges
stay touching. The name is motion direction: `swipe-left` moves content
left.

Optional placement `enter` is `{ "type": "..." }` with that same object name
on playlist JSON. Types: `fade-up`, `fade-down`, `fade-left`, `fade-right`,
`fade-in`, `zoom-in`, `zoom-out`. Absent means no object animation.

Object enter starts invisible. It runs 500 ms after the page occupies the
full viewport, for 400 ms. Those delays are contract constants, not author
fields and not CLI flags. Do not send duration or delay inside `enter`.

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
  "placements": []
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
"$SR" --json screen set-timezone scr_EXAMPLE --timezone America/Los_Angeles --if-match 3
```

`--timezone` is an IANA identifier such as `America/Los_Angeles` or
`Europe/Berlin`. Set the timezone before assigning a scheduled playlist.
`screen update` accepts the same `--timezone`.

## Playlist bundle export and import

Use a `screenrig.playlist-bundle/v1` directory to move one playlist and every
referenced image or video rendition together.

```bash
"$SR" --json playlist export pl_EXAMPLE --output ./lobby-bundle
"$SR" --json playlist import ./lobby-bundle
"$SR" --json playlist import ./lobby-bundle --update pl_TARGET --if-match REVISION
```

The export destination must not exist. The bundle contains
`screenrig-bundle.json`, `playlist.json`, and content-addressed
`media/<sha256>.<canonical-ext>` files. Export snapshots dynamic `all` and `tag`
selectors to exact `id` or `ids` selectors. Application placements stop export
before any media download. Import creates a new playlist by default. Updating
requires both `--update` and the current `--if-match` revision.

## Putting a web app on a screen

### 1. Upload the app and read its release id

`app upload` takes one already-built static directory with a root `index.html`.
It packs the directory itself, so run `app pack` only when you want to inspect
the archive first. The packer injects the screenRIG browser SDK at
`_screenrig/runtime.js` and adds its script tag to `index.html`, so the app
reaches `window.screenrig` at runtime with no build step and no dependency to
install.

```bash
"$SR" --json app upload ./lobby-board --name "Lobby board"
```

`app upload` waits for the publication operation by default. Read three fields
from the envelope:

- `data.operation.state` is `succeeded`.
- `data.application.release_id` is the `rel_...` release id. This is the only
  value a playlist placement needs.
- `data.application.id` is the `app_...` application id. `kv` commands take this
  one; a playlist placement never does.

With `--no-wait` run `operations wait <operation_id>` before pinning the
release into a playlist. Every `app upload` creates a new application and a
new release.

### 2. Write the application placement

```json
{
  "id": "board",
  "content": { "type": "application", "release_id": "rel_01EXAMPLERELEASE00000000" },
  "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
  "layer": 0,
  "content_fit": "fill",
  "controller": true
}
```

- `content.release_id` is required. `content.application_id` is an optional
  ownership assertion; omit it.
- `content_fit` must be `fill` for `application` and `iframe`.
- `iframe` is `{ "type": "iframe", "src": "https://...", "title": "..." }`.
  `src` must be a public `https://` URL without credentials. An `iframe` can
  never be a controller.

### 3. Choose how the page advances

Use `duration` when the app never signals that it is finished:

```json
{ "mode": "duration", "after_ms": 15000 }
```

Use `application` when the app calls `window.screenrig.nextPage()`:

```json
{ "mode": "application", "max_ms": 60000 }
```

On an `application` page exactly one placement must carry `controller: true`,
and it must be an `application` placement. `media_end` forbids `application`
and `iframe` placements on that page.

### 4. Create the playlist and assign it to a screen

```bash
"$SR" --json playlist create ./lobby-board.json
"$SR" --json screen list
"$SR" --json screen assign scr_EXAMPLE --playlist-id pl_EXAMPLE --if-match 3
```

Take `--playlist-id` from `data.id` of the `playlist create` result. Take
`--if-match` from the screen's current `revision`, which both `screen list` and
`screen show` return. `revision_conflict` means refetch and retry. Do not
invent the revision.

Looking at the screen stays the only proof of layout. `screen screenshot <id>`
blocks on a WebP. Do not print pixels.

## Screens

```bash
"$SR" --json screen list
"$SR" --json screen show scr_EXAMPLE
"$SR" --json screen update scr_EXAMPLE --name "Lobby" --playlist-id pl_EXAMPLE --if-match REVISION
"$SR" --json screen assign scr_EXAMPLE --playlist-id pl_EXAMPLE --if-match REVISION
"$SR" --json screen set-timezone scr_EXAMPLE --timezone America/Los_Angeles --if-match REVISION
"$SR" --json screen archive scr_EXAMPLE --if-match REVISION
"$SR" --json screen unarchive scr_EXAMPLE --if-match REVISION
"$SR" --json screen toast scr_EXAMPLE --text "Updated lobby loop" --level info
"$SR" --json screen screenshot scr_EXAMPLE --output ./lobby.webp
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
defaults to 500 ms. There is no `--no-wait`. Do not print pixels.

`screen toast` is the agent mark on a live wall. `--level` is `info`,
`alert`, or `error`. Omitted `--level` defaults to `info`. Production glass
shows error toasts only; alert and info only off production. `--text` is 1 to
120 characters. `--duration-ms` is optional, 2000 through 60000; omitted
values default to 10000 on the server.

`playback list` returns daily playback aggregates for this account. One row
per screen, media, and UTC day. Newest days first. `--screen-id`,
`--media-id`, and `--day YYYY-MM-DD` filter the caller's own rows.

## Comments

Comments are the agent's own structured JSON object on a screen, a playlist,
or one playlist page. Compact UTF-8 of that object is at most 1 KiB. The
value must be an object. screenRIG does not read or use it and never sends it
to players.

```bash
"$SR" --json comment set screen scr_EXAMPLE --json-value '{"note":"lobby hours"}'
"$SR" --json comment show screen scr_EXAMPLE
"$SR" --json comment set playlist pl_EXAMPLE --page poster --file ./note.json
"$SR" --json comment delete screen scr_EXAMPLE
```

`--json-value` is a JSON object. `--file` reads a JSON object from disk.
Exactly one of those on set. Last write wins; do not send `--if-match`.
Unset show is `{ "comments": null }`.

## Application K/V

Application K/V is binary-safe. Use exactly one value mode.

```bash
"$SR" --json kv set --application-id app_EXAMPLE lobby --json-value '{"open":true}'
"$SR" --json kv get --application-id app_EXAMPLE lobby
"$SR" --json kv list --application-id app_EXAMPLE
"$SR" --json kv delete --application-id app_EXAMPLE lobby --if-match REVISION
```

## Events

Human `events list` and `events follow` print one logfmt line per event.
`--json events list` is one JSON page envelope. `--json events follow` is a
JSON stream of envelopes.

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
"$SR" --json feedback bug "Playlist stalls after assign" \
  --body-file ./report.md --command "screen assign"
"$SR" --json feedback feature "Add a dry-run flag" --body "Preview a change first."
"$SR" --json feedback list [--kind bug|feature]
```

`--body` is inline text. `--body-file` reads a file. A title is at most 120
characters and a body is at most 4000. `--command` is the command the
feedback is about. Probe support through `capabilities.features.feedback`;
`doctor` reports that check.

## Commands

```text
account show
dashboard [--print-url]
app pack <directory> [--output FILE]
app upload <directory> [--name NAME] [--no-wait] [--poll-ms MS]
app list
app show <id>
media upload <file> [--content-type TYPE] [--tag TAG] [--no-wait] [--poll-ms MS]
                    [--no-transcode] [--codec h264|hevc] [--max-fps N]
                    [--max-edge PIXELS] [--webp-quality 1-100] [--no-progress]
media show <id>
media list [--tag TAG] [--kind image|video]
media update <id> (--tag TAG | --clear-tag) --if-match REVISION
media delete <id> --if-match REVISION
compose catalog
compose render <file> [--output FILE] [--open]
playlist create <file>
playlist update <id> <file> --if-match REVISION
playlist export <id> --output DIRECTORY
playlist import <directory> [--update ID --if-match REVISION]
playlist show <id>
playlist list
playlist delete <id> --if-match REVISION
screen update <id> [--name NAME] [--playlist-id ID] [--timezone ZONE]
                   --if-match REVISION
screen list [--state archived]
screen show <id>
screen assign <id> --playlist-id ID --if-match REVISION
screen set-timezone <id> --timezone ZONE --if-match REVISION
screen archive <id> --if-match REVISION
screen unarchive <id> --if-match REVISION
screen delete <id> --if-match REVISION
screen rotate-public-id <id> --if-match REVISION
screen toast <id> --text TEXT [--level info] [--duration-ms MS]
screen screenshot <id> [--output FILE] [--timeout MS] [--poll-ms MS]
kv get --application-id ID <key>
kv set --application-id ID <key> --json-value JSON [--if-match REVISION]
kv set --application-id ID <key> --file FILE --content-type TYPE [--if-match REVISION]
kv set --application-id ID <key> --value-base64 BASE64 --content-type TYPE [--if-match REVISION]
kv delete --application-id ID <key> --if-match REVISION
kv list --application-id ID
comment show screen <id>
comment show playlist <id> [--page PAGE_ID]
comment set screen <id> (--json-value JSON | --file FILE)
comment set playlist <id> [--page PAGE_ID] (--json-value JSON | --file FILE)
comment delete screen <id>
comment delete playlist <id> [--page PAGE_ID]
operations get <id>
operations wait <id> [--timeout MS] [--poll-ms MS]
operations cancel <id>
events list [--after CURSOR] [--limit N]
events follow [--after CURSOR] [--timeout MS]
playback list [--screen-id ID] [--media-id ID] [--day YYYY-MM-DD]
feedback bug <title> (--body TEXT | --body-file FILE)
                     [--command "GROUP ACTION"] [--no-context]
feedback feature <title> (--body TEXT | --body-file FILE)
                     [--command "GROUP ACTION"] [--no-context]
feedback list [--kind bug|feature]
doctor [--repair-config]
version
```

On `revision_conflict`, fetch the resource, reapply the intended change, and
retry with the returned revision. On an ambiguous transport failure, reuse the
same idempotency key.
