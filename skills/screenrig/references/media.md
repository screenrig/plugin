# Generate, inspect and upload media

Use the authoring choice in the main skill before opening this reference.

## Generate a finished still

Use the task selection in the main skill. Choose the intended aspect ratio from
`screenrig --json screen show SCREEN_ID` or the user's supplied dimensions before
generation. If the screen has no observation, confirm its orientation. Fit and
cropping are deliberate choices; a source image's aspect need not match a canvas
when the design intentionally contains or crops it.

Generation stores the finished artwork, including its type, in the account media
store. Each call is billed, so prepare the copy and art direction together.

### Write the prompt

Include the venue or purpose, a suitable visual style, palette, exact copy,
type hierarchy and aspect ratio. Preserve supplied facts and official assets.
For invented demo content, make its fictional status clear. A supplied official
image that must remain unchanged follows the local render-and-upload path in the
main skill; do not ask generation to recreate its logo or key art.

Ask for the artwork itself rather than a photograph of a monitor displaying it,
unless the user actually wants that scene. For full-bleed artwork, say that the
artwork fills the image and inspect the result for unwanted frames or furniture.
Use a consistent campaign style rather than forcing variation on every page.

For example, a fictional bookshop announcement:

```bash
screenrig --json media generate --aspect-ratio 16:9 --quality medium --tag AuthorNight --prompt "Landscape 16:9 event poster artwork for fictional Example Books. Full bleed. Two-colour risograph style: paper white, teal and coral. Exact copy: 'Author Night', 'Guest Author reads from Sample Title', 'Thursday 24 September, 7 pm', 'Free entry', 'Fictional Example Books, Main Hall'. Large readable headline, clear time and location, open-book illustration. Artwork only, no display device or additional text."
```

Read [visual design](composition.md) when establishing a layout or reviewing a
menu, campaign or deck. Inspect generated text before publication.

### Quality and cost

Generation rates are published on [pricing](https://screenrig.ai/pricing.md). Quality (`low`, `medium`, `high`; default `medium`)
changes how detailed the still is and therefore how many tokens it uses,
not a fixed per-image price. Envelope `usage` is the debit for that still.

| quality | when |
|---|---|
| `low` | unimportant generated stills, not compose-overlay backgrounds |
| `medium` | default; recommend for most cases, including typical menus |
| `high` | dense text / complex posters |

`--quality` defaults to `medium`. A 402 / `payment_required` means stop; do
not retry generate, and point money at https://screenrig.ai/pricing/.

### Budget for the blocking call

`media generate` is one blocking call and it is slow on purpose: the image is
drawn while the request is open. The command blocks until the server returns
`201` MediaGeneration; there is no 202 poll and no client PUT. Expect about
15 s at `low`, 35 s at `medium`, and 80 s at `high`. Do not treat a slow call
as a hang, and allow at least three minutes in any wrapper that imposes a
timeout of its own.

Do not pass `--timeout` on generate. The CLI budgets 150 s for this call by
default, above the server's own budget, so plain `screenrig --json media
generate …` completes at `high`. Under `--json` the command writes one
`media_generate_started` line to stderr before it blocks, carrying `quality`,
`typical_seconds`, and `timeout_ms` and never the prompt; `--no-progress`
suppresses it. The success envelope reports `elapsed_ms` beside `media_id`.

If generate times out or the connection drops, do not assume nothing
happened: the still may have been created and billed. Re-run the *identical*
command. The CLI persists the idempotency key before the request goes out and
replays the request under it, so a still that was created comes back instead
of a second one being billed; changing the prompt, aspect ratio, quality, or
tag starts a fresh key, and a server answer clears the stored one. Or run the
`media list` command named in `error.next.command` on the timeout problem to
see what the account actually holds. `--idempotency-key KEY` still pins the
key explicitly when you want to name it.

### Read the result

`--prompt` is required (1 to 4000 characters). `--aspect-ratio` defaults to
`16:9` (`1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`). Optional `--tag`
is the same 1–32 letter-or-digit tag as upload. Success is `201` with
`{ media, usage }`: `data.media.id` / `data.media_id` is `med_…`, and
`usage` shows credits and usd for that still. Never print pixels or the
prompt.

What generate stores: a lossy WebP (quality 90) at the exact aspect size with
a 1080 px short edge, so `16:9` is 1920×1080, `9:16` 1080×1920, `1:1`
1080×1080, `4:3` 1440×1080, `3:4` 1080×1440, `3:2` 1620×1080, and `2:3`
1080×1620. The vendor canvas is centre-cropped and resampled to that size.
The filename is distinctive per generation, `generated-16x9-1a2b3c4d.webp`,
with the suffix taken from the media id; a generated still has no
`source_filename`. Read `data.media.width` / `height` from the envelope.

Match `--aspect-ratio` to the screen content viewport where the still will
play. With `content_fit: "contain"`, a 9:16 artefact on a 16:9 screen is
pillarboxed to about one third of the screen width; that is useful evidence of
orientation, not a usable landscape layout.

Place the returned `med_…` on the playlist as one full-canvas `image`
primitive with `content_fit` `contain`; the still already is the page. Then
proof it: `media download <id> --output FILE` writes the stored rendition to
disk (verified against the row's `bytes` and `sha256`) so you can read it
with vision before it goes on glass, and `screen screenshot` shows it in
place afterwards. Check every item, price, and date against the copy you
sent. A misspelling or a missing dish is fixed by sharpening the prompt and
regenerating, not by composing a correction over the top. Never print the
downloaded bytes.

```bash
screenrig --json media download med_EXAMPLE --output ./burger-board.webp
```

`--output` is a file path, not a directory; the default is `./<id>.<ext>` in
the current directory with the extension from the content type. An existing
file is overwritten. The envelope is `media_id`, `path`, `bytes`, `sha256`,
`content_type`, `primitive`, `filename`, optional `source_filename`, and
`width` / `height`. It never carries pixels.

Downloading also lets a generated still serve as a region `image` inside a
`compose render` spec for the exception cases in step 4, for example a
`low`-quality generated background behind a live video hole. That is compose
using a generated picture, not text layered over a generated poster.

## Doctor

```bash
screenrig --json doctor
```

Read `data.status` and `data.checks`. Each check is `pass`, `warn`, or `fail`.
Only `fail` changes the exit code. `data.status` is the worst row. A success
envelope with `data.status` `warn` is a usable host, not a broken install.

On a fresh install the `token` row is `warn`, not `fail`. `fail` is
reserved for damage: a config file other users can read
(`config_permissions`), a Node below 20, a missing `ffmpeg`/`ffprobe` or
`libx264`, or a control plane that does not answer. Read the `ready` row's
detail too: a `warn` there names each degraded server dependency and prints
the server's own sentence for it verbatim (for example that application
upload is unavailable and `POST /api/v1/applications` answers 503
`dependency_unavailable` until the workers run). Relay that sentence to the
user instead of attempting the `app upload` and reporting the 503.

A build that reports `ffmpeg` and `ffprobe` converts media before upload.

On a build that converts:

- `media upload <file>` encodes video to an H.264 (High profile) MP4 by
  default and images to lossy WebP, then uploads the converted bytes.
  Stills are quality 90, keep alpha (`yuva` / `-alpha_q 100`), bound each
  edge to 3840 px, never upscale, and never write lossless VP8L. An oversize
  source (for example 9000×9000) is accepted and scaled down to 3840 on its
  longest edges, not rejected; the envelope then carries an `image_resized`
  warning naming the source and delivered sizes, and `data.transcode` carries
  `source_width` / `source_height` beside `width` / `height`. Tell the user
  when their still was resized.
- `--content-type TYPE` is checked against the file's bytes before anything
  runs. A declared type the container contradicts (`photo.png --content-type
  video/mp4`) fails locally with `usage_error` naming both types; nothing is
  transcoded or uploaded. Omit `--content-type` when the extension is right.
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

`media upload` produces an H.264 MP4 by default. The available Player is the
PWA, and it decodes H.264. `--codec hevc` opts in to H.265 for a smaller file
at the same quality. Use it only when every screen that will play the media
is a native-only fleet; native platform names are product direction, not
public downloads.

The filename is the human-readable handle. Ask once for a distinctive name
before uploading. The CLI only warns (`generic_filename`); it will not rename.
The CLI declares the caller's file name as `source_filename`, and the server
keeps it on the ready object and derives the stored `filename` from it when
the extension changed: `photo.png` transcoded to WebP is stored as
`photo.png.webp`, `photo.jpg` as `photo.jpg.webp`, and a source `photo.webp`
stays `photo.webp`. Distinct sources no longer collide. `media list` and
`media show` return both `filename` and `source_filename`; use
`source_filename` when the user names a file. When `media upload` succeeds,
the ready id is `data.media_id`. The same value is `data.id` and
`data.operation.result.media_id`. `data.upload.filename` is the name the
server stored, so `photo.png` reads back as `photo.png.webp`;
`data.upload.declared_filename` is what the CLI sent and
`data.upload.source_filename` is the caller's original. Quote
`source_filename` to the user and carry `filename` when you mean the stored
object. Dimensions of the accepted object are under `data.transcode.width` /
`height`. After a tagged upload, `media list --tag TAG` is the filename → id
map.

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

The envelope carries `data.items[]`, one row per item that reached the
account, in manifest order, each with `path`, `source_filename`, `sha256`,
`outcome` (`accepted` or `resumed`), and `media_id`. Read the ids from there;
a batch no longer needs a follow-up `media list --tag` to learn what it
created. `data.failed[]` carries the items that did not land, with their
problem code and status.

Run `doctor --json` for local diagnostics. Use
`doctor --repair-config --json` only to repair an existing credential file
whose permissions are too broad.
