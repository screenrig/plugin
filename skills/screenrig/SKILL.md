---
name: screenrig
description: Operate screenRIG screens, applications, media, playlists, playback, events, feedback, comments, and application K/V with the bundled screenRIG CLI. Use when an agent needs to install the official screenRIG plugin, compose stills, upload media, write playlists, or assign content to screens.
---

# screenRIG

Signage and Kiosk infrastructure for AI Agents

## Launch period

LAUNCH SPECIAL OFFER: During the launch period and until January 1st, 2027 screenRIG is free to use (within reason), fill your boots! Normal usage applies after that.

Treat usage as free until 1 Jan 2027. Do not invent a billing flow. Do not shut anyone off for empty prepaid remaining. Do not refuse compose, publish, or assign because remaining is zero during this window.

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

Canonical skill source can lead the pinned installed CLI during repository
development. New skill text does not upgrade its executable. Check the selected
CLI's `--help` or `compose catalog` before relying on newly added commands.
When explicitly testing a CLI source checkout, follow that checkout's agent
guide for its built executable; do not replace the installed plugin cache with
a mutable local build.

Use the CLI packaged with this skill. It requires Node.js 20.11 or newer.
Resolve the installed plugin root, prepend its scripts directory to `PATH`
once, then invoke `screenrig`. Do not export `SR`. Do not install a global
package.

```bash
SCREENRIG_PLUGIN_ROOT="${GROK_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}}"
if [ -n "$SCREENRIG_PLUGIN_ROOT" ]; then
  PATH="$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts:$PATH"
  screenrig --json version
fi
```

An empty root means use the lookup below before running the CLI; do not add
`/skills/screenrig/scripts` to PATH. The plugin launcher is scoped to this
shell session, so a new shell may need the same root lookup and PATH setup.

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
5. Prepend `<plugin-root>/skills/screenrig/scripts` to `PATH` and run
`screenrig --json version`. Require a successful screenRIG JSON envelope
before the requested command. Do not export `SR`.

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
screenrig --json version
screenrig --json doctor
screenrig --json compose catalog
screenrig --json compose render ./example.json --output ./example.png
screenrig --json media upload ./example.png --tag ExampleStill
screenrig --json playlist create ./playlist.json
screenrig --json screen list
screenrig --json screen assign scr_EXAMPLE --playlist-id pl_EXAMPLE --if-match REVISION
```

1. Prepend the plugin scripts directory to `PATH` and require `screenrig --json version`.
2. Run `doctor`. Read `data.checks`. Name missing toolchain parts before the
   first `media upload`.
3. Compose locally. `compose catalog` and `compose render` write stills on
   this computer. They do not debit. Iterate the JSON and the PNG before any
   upload.
4. Upload media. Use a distinctive filename stem and an optional `--tag`.
   For many files, use `media upload-batch --state`.
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
screenrig --json doctor
```

Read `data.status` and `data.checks`. Each check is `pass`, `warn`, or `fail`.
Only `fail` changes the exit code. `data.status` is the worst row. A success
envelope with `data.status` `warn` is a usable host, not a broken install.

A build that reports `ffmpeg` and `ffprobe` converts media before upload.

On a build that converts:

- `media upload <file>` encodes video to an H.264 (High profile) MP4 by
  default and images to lossy WebP, then uploads the converted bytes.
  Stills are quality 90, keep alpha (`yuva` / `-alpha_q 100`), bound each
  edge to 3840 px, never upscale, and never write lossless VP8L.
- Optional `--tag TAG` stores a 1 to 32 letter-or-digit tag on the ready
  object. Hyphens are rejected; `ExecIntro2026` is valid and `exec-intro`
  is not. `media list --tag TAG [--primitive image|video]` filters by that tag
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
  The default video path needs `libx264` (`fail` when that encoder is missing).
  Image transcode works when `encoder_libwebp` or `cwebp` is `pass`. The other
  of those two is `warn` when it is absent, because stills still convert.
  `cwebp` is `warn` when ffmpeg has `libwebp`. Both are `fail` only when the
  host has neither. `encoder_libwebp` reports the ffmpeg encoder only.
  `encoder_libx265` and `filter_hdr_tonemap` are `warn` when missing.

A missing or unusable toolchain fails `media upload` alone. It returns a usage
error, not a plugin installation failure. Playlist, kv, doctor, compose, and
every other command keep working, so do not reinstall the plugin and do not
stop the wider task. Treat `doctor` as unhealthy only when a check is `fail`.
A `warn` row, including optional `cwebp` beside an ffmpeg with `libwebp`,
does not make `doctor` exit non-zero.

When the toolchain is missing, tell the user which check failed and ask them to
install ffmpeg 6.0 or newer, with `ffmpeg` and `ffprobe` reachable on `PATH`.
Point them at their platform package manager or `https://ffmpeg.org/download.html`.
An `encoder_libx264` failure means the installed ffmpeg build lacks that
encoder. `encoder_libx265` missing is `warn`; only `--codec hevc` needs it.
`doctor` can pass `ffmpeg` and still `warn` `encoder_libwebp`. Name that
check. If `cwebp` is `pass`, stills still convert; do not ask the user to
rebuild ffmpeg for images and do not use `--no-transcode` as the recovery.
`--no-transcode` is only for a source that is already accepted delivery WebP.
Do not upload lossless WebP. Players expect WebP. If `doctor` `ready` fails,
stop. A 503 / `transport_error` on `media upload` means the service is not
ready, not a bad PNG. Do not install software on the user's computer without
their explicit request.

`media upload` produces an H.264 MP4 by default. Every current browser and
every screenRIG player decodes it. `--codec hevc` opts in to H.265 for a
smaller file at the same quality. Use it only when every screen that will play
the media is a native player (Qt/GStreamer or Android/MediaCodec).

The filename is the human-readable handle. Ask once for a distinctive name
before uploading. The CLI only warns (`generic_filename`); it will not rename.
When `media upload` succeeds, the ready id is `data.media_id`. The same value
is `data.id` and `data.operation.result.media_id`. After a tagged upload,
`media list --tag TAG` is the filename → id map.

For many local files, point bulk work at `media upload-batch --state`; do
not loop `media upload` by hand. The manifest is
`{ "items": [ { "path": "./a.png", "tag"?: "lobby", "content_type"?: "image/png" } ] }`
with 1 to 1000 items. Paths are relative to the manifest file. `--state FILE`
is required: a 0600 JSON file keyed by the SHA-256 of each source file's
local bytes. Items already present with a `media_id` are reported as
`resumed`. Do not share one state file across accounts.

```bash
screenrig --json media upload-batch ./images.json --state ./upload-state.json
```

Run `doctor --json` for local diagnostics. Use
`doctor --repair-config --json` only to repair an existing credential file
whose permissions are too broad.

## Local compose

When composing signage pages—including posters, ads, menus, schedules, and
video-backed pages—read [Composition and visual direction](references/composition.md)
before choosing a layout. It covers reference research, useful density, independent artwork,
readability, and playlist-wide visual review.

Write JSON, render a PNG, look at that PNG, iterate. Compose is not billed.
Uploads and playlist writes are billed. Iterate `compose render` and read
`<output>.layout.json` before any `media upload`.

Stem `--output` before `compose render` so the PNG name is the human handle.
Default `--output` follows the spec filename. The CLI `generic_filename`
warning will not rename on upload.

```bash
screenrig --json compose catalog
screenrig --json compose render ./exec-intro-overlay-native-video.json \
  --output ./exec-intro-overlay-native-video.png
# read ./exec-intro-overlay-native-video.png.layout.json
# agent reads the PNG with vision; do not cat pixels into chat
# iterate the JSON and re-render
screenrig --json media upload ./exec-intro-overlay-native-video.png --tag TAG
screenrig --json media list --tag TAG --primitive image
# playlist page: one image primitive, rect = canvas, content_fit fill
# many files: media upload-batch ./images.json --state ./upload-state.json
```

`compose catalog` prints the fail-closed node catalog: types
`Frame`/`Column`/`Row`/`Box`/`Spacer`/`Text`/`Image`/`Icon`/`Divider`/`Pill`,
roles `display|title|body|caption|label`, spaces `xs|s|m|l|xl`, pins
`top|bottom|left|right`. Author only catalog fields. Unknown keys fail the
whole spec. Do not author `x`/`y` except on the Frame canvas. Do not author
`fontSize`. Roles pick the type ramp. On 1920×1080, `display` wishes 130 px,
`title` 86, `body` 45, `caption`/`label` 32. Budget copy for that scale.
Optional Text `scale: "display-xl"` raises that node's type wish to 60% of
the shorter edge when the Frame has that single Text child; every other role
and layout keeps the 12% cap. The type ramp uses `min(Frame width, height)`.
A 1920×400 strip Frame makes `title` wish 48 px, not 86. Overlay Frames cover
the full slide at the chosen render resolution; never size the Frame to the
plate. Read `layout.json` `ramp` vs `ramp_at_1080` (and `ramp_root`) after
`compose render`. On a 1920×1080 overlay, `ramp.title.wish` is 86; larger
render Frames scale it up. `Image`, `Box`, `Row`, `Column`, and `Spacer` honor
`width` and `height` in px. Keep `flex` for remaining space. An `Image`
without `height` or `flex` in a Column has no main-axis size and paints
nothing useful. `pin` `top` or `bottom` stretches the full width; `left` or
`right` stretches the full height. Do not pin a wordmark. Optional Text
`textShadow` is `{ x, y, blur?, color }` in px; omit it to paint without a
shadow. Optional Text `effects` is the newer home for local paint treatments,
all off by default:

```json
{
  "type": "Text",
  "role": "display",
  "text": "Tonight",
  "align": "center",
  "effects": {
    "weight": "bold",
    "italic": true,
    "underline": true,
    "outline": { "width": 4, "color": "#000000" },
    "shadow": { "x": 2, "y": 2, "blur": 4, "color": "#00000080" },
    "arc": { "degrees": 40 },
    "texture": { "src": "./paper.png", "objectFit": "cover" }
  }
}
```

`weight` is `regular` or `bold`. `outline.width` is 0.5–12 px at the rendered
size. `arc.degrees` is −180–180 (positive is a smile), centre aligned, and
single-line only. `texture.src` is a local path relative to the spec, like
`Image.src`, and fills the glyphs. `textShadow` still maps onto
`effects.shadow`. Use text effects sparingly, when the design calls for them (a headline, a badge). Body copy, menus and prices stay plain for readability.
`Image.src` is a local filesystem path relative to the spec file, never
a URL. The CLI does not fetch. The envelope is structured JSON, not pixels.

Optional `Frame.theme` selects one curated palette: `warm-cafe`,
`bakery-cream`, `midnight-neon`, `clean-corporate`, `earthy-market`,
`ocean-calm`, `bold-retail`, `cinema-noir`, `pastel-kiosk`, `forest-lodge`,
`sunset-promo`, `monochrome-ink`, `sport-arena`, `healthcare-soft`,
`festival-pop`, `luxury-gold`. A theme fills unset `background`, `color`, and
`fontFamily` on `Frame` / `Box` / `Text`; explicit values still win. `color`
and solid `background` also accept the named tokens `accent`, `ink`,
`inkMuted`, `surface`, `accentInk`, and `background`. Pick one theme per deck; use accent for one element per page.

Omitted `Frame.background` without a theme fills `#1B2632`. Set `background`
when you want a different ground. Default text fill is `#EEE9DF`; set `color`
when you need another. Omit `fontFamily` to walk `Helvetica Neue` and the
catalog fallbacks. A missing name is `usage_error`, not a silent fallback.
`Frame.background` and `Box.background` also accept a linear gradient
`{ "type": "linear", "angle": 0-360, "stops": [ { "at": 0, "color": "#…" }, … ] }`
with 2–8 strictly increasing stops. `Icon` paints a Font Awesome glyph by
`name`. `Divider` is a horizontal or vertical rule from the parent direction.
`Pill` is a padded badge.

`compose render` writes a PNG and `<output>.layout.json`. Default `--output`
replaces a `.json` suffix with `.png`, or appends `.png`. Read that layout
dump for `truncated`, fitted `fontSize`, and `box` before you upload. Never
print PNG bytes, pixels, or image data. `--open` opens the local PNG path on
this computer only when the user asked to view the still here. Agent vision
uses the file path, not `--open`. Raster a diagram to PNG or WebP at canvas
size, upload it, and place it as `image`. HTML is not a primitive.

Plan the canvas from the user's intended output, orientation, and content
viewport. Honor a requested 1920×1080 deliverable even when reviewing on a
larger monitor; desktop dimensions alone do not change the brief. For final
physical display quality, choose raster dimensions for the **physical content
viewport**, excluding letterboxing. A 1920×1080 slide displayed in a
3840×2160 viewport enlarges every flattened element 2×, even when its original
logo is high resolution.
Preserve aspect ratio: use `objectFit: "contain"` for complete marks and
`cover` for intentional cropping; `fill` can distort mismatched proportions.
Source images must support their actual painted pixel dimensions, including
the part cropped by `cover`. Re-render from originals at the target density;
enlarging the finished PNG cannot recover detail.

Current compose output dimensions equal the Frame dimensions. To adapt a
1920×1080 spec for 3840×2160, double the Frame and every explicit child
`width`/`height`, plus Text `textShadow` offsets and blur if present. Keep
roles, spacing/radius tokens, and `flex` unchanged: they scale or distribute
space through layout. Compare the new layout and PNG because type rounding
and text wrapping can change. Increasing only the Frame leaves fixed-size
elements proportionally smaller. Inspect the result on the physical screen
at 1:1 pixels; native screenshots are reduced resolution and can hide
pixelation.

Pass `--target-width 3840 --target-height 2160` to `compose render` when the
physical content viewport is known. These flags check quality; they do not
resize the Frame or PNG. Read envelope `warnings` and `data.quality`, also
saved in the layout dump. `image_upscaled` reports decoded source enlargement
above 1.25× using actual paint bounds, including cover cropping.
`image_aspect_stretched` reports fill distortion above 1%; `contain` and
`cover` preserve proportions. `compose_output_upscaled` reports output
magnification above 1.25× at the target. Fix the source or render dimensions
before uploading. With no target, quality reports `target_status: "unknown"`;
this is not evidence of adequate display resolution. Upload transcoding can
change dimensions, so inspect the accepted media dimensions too.

Use optional `--safe-area` for a TV that may crop edges: it warns when measured text crosses the 5% margin. Warnings are nonblocking, and full-bleed
imagery stays valid. `compose render --ink-tight [--ink-padding PX]` crops a
transparent still to the measured ink of every layer, then adds optional
padding (0 through 8192, default 0) for animated entry. `--ink-padding`
requires `--ink-tight`. The envelope reports the original `frame` size, the
`ink` rect, the final size, `overhang`, and `clipped`. `compose batch`
accepts the same flags and applies them per page. `compose catalog` exposes
validator-backed per-node attributes, installed font families, curated
themes, recipes, and renderable slide, overlay, themed, gradient, icon, and
effects examples.

### Compose a deck with fewer corrective steps

Prefer measured native compose Text/Row/Column nodes for titles, copy, cards
and tables. Flattening all copy into an SVG or PNG hides it from text fitting,
font checks and safe-area diagnostics. Keep code-native illustrations as image
assets when useful, while leaving adjacent explanatory text measurable.

Recipes from `compose catalog` are optional starting points, not a visual
system for every page. Generic recipes: `title`, `split-image`, `cards`,
`table`, `overlay`. Signage recipes: `hero`, `price-list`, `menu-board`,
`promo`, `event`, `quote`, `schedule`. They accept `theme` and `variant`
`a` (default), `b`, or `c`. Use ordinary compose nodes when the content
calls for a different hierarchy. Generic recipes keep a 5% content inset
and the normal readable type floors. Signage recipes leave an 8% safe
margin and warn `too_dense` when copy exceeds that recipe's word budget.
Set `width` and `height` to the intended content viewport. Omitted
dimensions are 1920×1080. `split-image` uses `contain` by default; `cover`
crops proportionally. The overlay recipe defaults to a transparent canvas
and an approximately 89% opaque plate with independently opaque text. Omit
its `image` to layer the PNG over native video; include a local image for a
flattened still. Alternate variants or recipes on adjacent pages; a deck
that repeats one layout reads as a slideshow, not signage.
`plate: auto`, `focal`, `viewing`, compose lint, and `playlist preview` are
not listed by `compose catalog`; see the CLI README rather than inventing
those fields.

For several pages, `compose batch` provides a shared render and review path:

```json
{
  "pages": [
    { "id": "intro", "spec": { "recipe": "title", "width": 3840, "height": 2160, "title": "A clear introduction", "body": "One useful idea, explained simply." } },
    { "id": "comparison", "spec": { "recipe": "cards", "width": 3840, "height": 2160, "title": "Compare the outcomes", "cards": [{ "title": "Prepare", "body": "Validate before publishing." }, { "title": "Verify", "body": "Inspect the target screen." }] } }
  ]
}
```

```bash
screenrig --json compose batch ./deck.json --output ./rendered --target-width 3840 --target-height 2160 --safe-area --ink-tight
```

Each `spec` can instead be a relative JSON file path. One command accepts 1
to 2000 pages and returns ordered page results, individual PNG/layout paths,
a contact-sheet preview, and a manifest. Larger inputs are processed in
internal chunks of 100 so peak full-resolution memory stays bounded;
rendering stays serial. Batches that span more than one chunk write extra
contact sheets (`preview-2.png`, …) alongside `preview.png`. Failed pages
are named in the JSON error; successful outputs remain available. Fix one
page and run the same command with `--only comparison`: only that page
renders, the others are explicitly `not_selected`, and a separate correction
manifest/preview preserves the full-run evidence. This is selective
rendering, not an automatic cache-validity promise.

Read node-specific `text_overflow`, `text_truncated`, `text_dense` and
`text_overlap` warnings before upload. Shorten copy, widen its container, or
split a page instead of lowering type floors. `data.quality.text` reports
measured ink and layout bounds. Parent plates are not text collisions;
intentional text-over-media and media-over-media intersections are recorded
separately in `quality.overlaps`. Image upscale/stretch warnings remain
separate. The preview preserves aspect and shows transparency over a checker.
Inspect individual full-resolution outputs before claiming pixel quality.

Font checks compare rendered characters with the font's missing-glyph raster
at the requested weight. `font_glyph_fallback` reports a replacement font for
that Text node; measurement and painting both use it. Choose the named font
explicitly for consistent typography. `font_glyph_missing` means no installed
fallback covers the text. Install a suitable font or change the family; do not
accept missing-character boxes. This check is not a proof of every language's
shaping or typography quality.

Validate the separate wire playlist locally before expensive upload/publication
work, and again after replacing draft references with accepted resource IDs:

```bash
screenrig --json playlist validate ./playlist.json
```

This uses backend-generated schema and semantics, including application
controllers, selectors, duplicate IDs, object `enter` (type plus optional
`stagger`), and object `motion`. Errors name exact JSON paths. It is local and does not require authentication or make
HTTP requests. Create/update also run this check before their write. A pass
means local shape and cross-field semantics are valid; authorization, media
readiness, dynamic selector counts, durations and remote availability still
require server checks. Raster QA alone never proves the playlist is valid.

### Slide, overlay, and wordmark

`justify: "end"` is not the bottom of the slide unless the `Column` has
`flex: 1`, or the copy lives in a `Box` with `pin: "bottom"`. A `Column`
without `flex: 1` shrinks to its text and sits at the top of the Frame.

For text over images or video, fit support snugly around the copy: a
translucent plate or raster gradient can retain the picture while making type
readable. Choose opacity from the actual imagery; a large nearly opaque panel
is not the default. Compose colors use `#RRGGBBAA`: for example,
`Box.background: "#000000E0"` is black at about 88% opacity. Add padding
around the copy, such as `"padding": "l"`. Apply alpha to the backplate
background only; keep text opaque, such as `"color": "#FFFFFF"`, rather
than fading the whole group. For a separate overlay over video, keep the
Frame transparent. Check contrast over changing bright and dark frames;
increase the plate opacity or use an opaque plate when needed for legibility.

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

Author the overlay at the full slide resolution (1920×1080 in this example),
so the type ramp stays at the intended scale. The pinned bottom plate above
is a full-width lower-third example, not a requirement for every image. Keep
any separate wordmark clear of the copy and preserve its proportions.

For snug side support, use a shrink-wrapped `Box` plus `Spacer` rather than
`pin: "left"` or `"right"`, which stretches the cross axis. A `Row` with
`{ Box, Spacer flex: 1 }` makes a left rail; reverse the children for a right
rail. Omit `flex` on the copy `Box` to avoid growing it across the canvas.
Choose line breaks and measured container sizes for the actual copy and
picture; inspect the resulting plate bounds.

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

Playlist: photo `layer` 0 + overlay `layer` 1 on a 1920×1080 canvas. Use
`content_fit: "fill"` for a matching-aspect full-canvas overlay; preserve the
photo proportions with `contain` or intentional `cover` cropping. Eight-digit
hex is how the Frame stays transparent and the plate keeps alpha.

Wordmark: playlist `image` primitive with a `rect`. Soft-open: omit that
primitive until a named page. Do not pin a logo in compose; `pin` stretches
the cross axis. Bottom-right on 1920×1080 with a 5% safe area is
`{ "x": 1424, "y": 946, "width": 400, "height": 80 }` for a 400×80 contain
box. That rect is one worked example, not the only size. If you raster the
mark into the still instead, set `Image` `width` and `height` (or `flex` in a
sized parent) so it is not 0×0.

## Playlist writes

Four wire primitives exist: `image`, `video`, `iframe`, and `application`.
Static is `image`, motion is `video`, and web is `iframe` or `application`.
Do not author native `text`, `box`, or `line` on the wire. Compose copy and
chrome locally, upload the still as `image`, and use that image primitive.

A full page is `id`, `canvas`, `transition`, `advance`, optional `visibility`,
and `primitives`. A primitive is flat: `id`, a `primitive` field naming one of
the four, that primitive's own fields, then `rect`, `layer`, `content_fit`,
optional `enter`, and optional `motion`. There is no nested content object.

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

To slide text in over a still or video, compose the text and its translucent
plate into a transparent PNG, place that image above the background's layer,
and apply `enter` to the overlay image. Keep the background independent.
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
before any media download. Import creates a new playlist by default. Updating
requires both `--update` and the current `--if-match` revision.

## Putting a web app on a screen

Provide visible in-app Back and Reset controls for kiosk navigation. Do not
rely on Escape or the platform Back key: the Qt player reserves them for
operator Settings. Verify keyboard focus and key handling inside the native
player as well as in browser preview before advertising keyboard shortcuts.

### 1. Upload the app and read its release id

`app upload` takes one already-built static directory with a root `index.html`.
It packs the directory itself, so run `app pack` only when you want to inspect
the archive first. The packer injects the screenRIG browser SDK at
`_screenrig/runtime.js` and adds its script tag to `index.html`, so the app
reaches `window.screenrig` at runtime with no build step and no dependency to
install.

```bash
screenrig --json app upload ./lobby-board --name "Lobby board"
```

`app upload` waits for the publication operation by default. Read three fields
from the envelope:

- `data.operation.state` is `succeeded`.
- `data.application.release_id` is the `rel_...` release id. This is the only
  value an application primitive needs.
- `data.application.id` is the `app_...` application id. `kv` commands take this
  one; a playlist primitive never does.

With `--no-wait` run `operations wait <operation_id>` before pinning the
release into a playlist. Every `app upload` creates a new application and a
first immutable release. To repair or improve the same app, read its current
revision with `app show`, then publish a new release:

```bash
screenrig --json app show app_EXAMPLE
screenrig --json app update app_EXAMPLE ./lobby-board --if-match 3
```

`app update` preserves application identity, name, and application K/V. It uses
the same packer, upload limits, operation wait, and release result as upload.
Wait for `operation.state: "succeeded"`, then explicitly replace the intended
playlist primitive's `release_id` and update the playlist with its revision.
Existing playlists remain pinned to their old immutable release until edited.
On a revision conflict, read the app again before deciding whether to retry;
do not create a replacement application just to bypass the conflict.

### 2. Write the application primitive

```json
{
  "id": "board",
  "primitive": "application",
  "release_id": "rel_01EXAMPLERELEASE00000000",
  "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
  "layer": 0,
  "content_fit": "fill",
  "controller": true
}
```

- `release_id` is required on an `application` primitive. `application_id` is
  an optional ownership assertion; omit it.
- An `application` primitive takes no `selector`.
- `content_fit` must be `fill` for `application` and `iframe`.
- `iframe` is `{ "primitive": "iframe", "src": "https://...", "title": "..." }`
  and takes no `selector`. `src` must be a public `https://` URL without
  credentials. An `iframe` can never be a controller.

### 3. Choose how the page advances

Use `duration` when the app never signals that it is finished:

```json
{ "mode": "duration", "after_ms": 15000 }
```

Use `application` when the app calls `window.screenrig.nextPage()`:

```json
{ "mode": "application", "max_ms": 60000 }
```

For an interactive kiosk, use application mode with a `max_ms` long enough
for the intended visit. A duration page advances at its deadline even while a
visitor is using the app; pointer activity does not extend that deadline.
Call `nextPage()` after completion or a deliberate idle reset, and explain the
bounded fallback in the experience. `await window.screenrig.ready()` completes
the bridge handshake; it does not prove the candidate page is active. Use
`await window.screenrig.waitUntilActive()` before starting a visitor idle clock
or sending active-page events. Use `await window.screenrig.emitConfirmed(code)`
when the UI promises that an event was accepted, and handle its rejection;
plain `emit(code)` is a send attempt. Choose a shorter duration only for a
preview that is supposed to rotate regardless of input.

On an `application` page exactly one primitive must carry `controller: true`,
and it must be an `application` primitive. `media_end` forbids `application`
and `iframe` primitives on that page.

### 4. Create the playlist and assign it to a screen

```bash
screenrig --json playlist create ./lobby-board.json
screenrig --json screen list
screenrig --json screen assign scr_EXAMPLE --playlist-id pl_EXAMPLE --if-match 3
```

Take `--playlist-id` from `data.id` of the `playlist create` result. Take
`--if-match` from the screen's current `revision`, which both `screen list` and
`screen show` return. `revision_conflict` means refetch and retry. Do not
invent the revision.

Looking at the screen stays the only proof of layout. `screen screenshot <id>`
blocks on a WebP. Do not print pixels.

## Screens

```bash
screenrig --json screen list
screenrig --json screen show scr_EXAMPLE
screenrig --json screen update scr_EXAMPLE --name "Lobby" --playlist-id pl_EXAMPLE --if-match REVISION
screenrig --json screen assign scr_EXAMPLE --playlist-id pl_EXAMPLE --if-match REVISION
screenrig --json screen set-timezone scr_EXAMPLE --timezone America/Los_Angeles --if-match REVISION
screenrig --json screen archive scr_EXAMPLE --if-match REVISION
screenrig --json screen unarchive scr_EXAMPLE --if-match REVISION
screenrig --json screen toast scr_EXAMPLE --text "Updated lobby loop" --level info
screenrig --json screen screenshot scr_EXAMPLE --output ./lobby.webp
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
screenrig --json comment set screen scr_EXAMPLE --json-value '{"note":"lobby hours"}'
screenrig --json comment show screen scr_EXAMPLE
screenrig --json comment set playlist pl_EXAMPLE --page poster --file ./note.json
screenrig --json comment delete screen scr_EXAMPLE
```

`--json-value` is a JSON object. `--file` reads a JSON object from disk.
Exactly one of those on set. Last write wins; do not send `--if-match`.
Unset show is `{ "comments": null }`.

## Application K/V

Application K/V is binary-safe. Use exactly one value mode.

```bash
screenrig --json kv set --application-id app_EXAMPLE lobby --json-value '{"open":true}'
screenrig --json kv get --application-id app_EXAMPLE lobby
screenrig --json kv list --application-id app_EXAMPLE
screenrig --json kv delete --application-id app_EXAMPLE lobby --if-match REVISION
```

## Events

Human `events list` and `events follow` print one logfmt line per event.
`--json events list` is one JSON page envelope. `--json events follow` is a
JSON stream of envelopes.

An `application.event` line leads its details with `code` and `primitive_id`,
the id of the primitive that emitted it.

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
screenrig --json feedback bug "Playlist stalls after assign" \
  --body-file ./report.md --command "screen assign"
screenrig --json feedback feature "Add a dry-run flag" --body "Preview a change first."
screenrig --json feedback list [--kind bug|feature]
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
app update <id> <directory> --if-match REVISION [--no-wait] [--poll-ms MS]
app list
app show <id>
media upload <file> [--content-type TYPE] [--tag TAG] [--no-wait] [--poll-ms MS]
                    [--no-transcode] [--codec h264|hevc] [--max-fps N]
                    [--max-edge PIXELS] [--webp-quality 1-100] [--no-progress]
media upload-batch <manifest.json> --state FILE [--concurrency N]
                   [--no-transcode] [--tag TAG] [--no-progress]
media show <id>
media list [--tag TAG] [--primitive image|video]
media update <id> (--tag TAG | --clear-tag) --if-match REVISION
media delete <id> --if-match REVISION
compose catalog
compose render <file> [--output FILE] [--target-width PX --target-height PX] [--safe-area]
                      [--ink-tight] [--ink-padding PX] [--open]
compose batch <file> --output DIRECTORY [--only ID] [--target-width PX --target-height PX]
                      [--safe-area] [--ink-tight] [--ink-padding PX]
playlist validate <file>
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
