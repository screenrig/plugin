# Local slide composition

Use for editable slides, tables and measured type. For task selection, see the main skill.

## Local compose

Compose is authoring path 4: slide-deck-like experiences — title/body/table
slides, internal decks, measured type that must stay editable as compose
JSON. It is local and unbilled. Presentable posters, menus, event art, and
other public-facing rich static pages are generated finished stills, not
composed pages.

When composing a slide-deck page, read
[Composition and visual direction](composition.md) before
choosing a layout. Compose visual guidance is for slide-deck pages. Overlay
is a compose mechanic for decks; it is not the presentable-poster path.
Animation is not a reason to compose.

Write JSON, `compose render`, look at the PNGs, iterate. Compose is not billed.
Uploads and playlist writes are billed. Iterate `compose render` and read
`manifest.json` before any `media upload`.

`--output` is a directory, not a `.png` / `.webp` / `.jpg` file. Stem it
before `compose render` so the directory name is the human handle. Default
`--output` follows the spec filename without `.json`. The CLI
`generic_filename` warning will not rename on upload.

```bash
screenrig --json compose catalog
screenrig --json compose render ./exec-intro.json --output ./exec-intro
# read ./exec-intro/manifest.json and the region PNGs
# agent reads the PNGs with vision; do not cat pixels into chat
# iterate the JSON and re-render
screenrig --json media upload ./exec-intro/left.png --tag TAG
screenrig --json media list --tag TAG --primitive image
# playlist page: image primitives at the manifest rects, or one combined image
# many files: media upload-batch ./images.json --state ./upload-state.json
```

`compose catalog` prints the fail-closed page language: page keys
`width`/`height`/`font`/`background`/`brand`/`text`/`image`/`video`/`motion`/`pages`/`viewing`/`logo`,
regions `fullpage|left|right|left-third|middle-third|right-third|middle-half|top-half|bottom-half|top|bottom`,
and inner fields `eyebrow|title|subtitle|text|footer|image|video|iframe|webapp|cards|card|table`
plus `enter`/`stagger`/`motion`/`align`/`valign`/`fill`/`color`/`z`/`shadow`/`outline`.
Author only catalog fields. Unknown keys fail the whole spec. Do not author
`fontSize`. Do not author `x`/`y`. Do not author Frame trees, recipes, or
`.layout.json`. On the page, `text` is the copy color. In a
region, `text` is body copy (a string or an array of lines). Type size is
procedural from `min(width, height)` and optional `viewing` `near|mid|far`
(default `mid`). Parse order is `eyebrow`, `title`, `subtitle`, `text`, then
image/cards/table, footer last. `eyebrow` is the kicker above the headline and
defaults to `brand`. Region `title` defaults to page `text`. Body `text` uses
muted (mixed from `text` toward `background`). `subtitle` and `footer` use
`text`. Card-item titles, prices, and table headers stay `brand`. Optional
region or `card` `color` overrides every role in that box. Text over a page
`image` or `video` with no `fill` gets a 1 px unblurred drop shadow
(`#000000E6` on light type, `#FFFFFFE6` on dark type). Set `shadow` to
`"none"` or `{ x, y, color, blur? }` to override (`blur` 0–32, omit is 0).
`outline` is `{ width: 0.5-12, color }` and is off unless set. A card plate is
backing, so type on a card does not get the automatic shadow.
On 1920×1080 mid, body wish is about 45 px, title wish is 130 px, and eyebrow
wish is 32 px. A region
then applies one scale (about 0.65–1.35) so type fills the box; a single line
is not grown. Footer stays on the bottom edge. If the region holds image or a
placeholder, type stays at scale 1 and media takes the leftover. Copy that
still does not fit at the minimum scale is a `usage_error` naming the region
(`bottom.card` for an ink plate) and no PNG is written for that page; shorten
the copy, drop a block, or use a taller region. Regions that sit side by side
with the same top and height (`left` and `right`, or the three thirds) form a
row: with automatic vertical alignment they share one type scale and one
starting line, so menu column titles sit on one baseline whatever each
column's body length.

`card` (singular) is a plate. `card.fit` is `region` (default: fill the whole
region rect) or `ink` (hug measured type plus 24 px pad, placed with the
region's `align`/`valign`). Default fill is the page background + B3 (30%
transparency). Override with `card.fill`. Inner fields: `eyebrow`, `title`, `subtitle`,
`text`, `footer`, `image`, `cards`, `table`, `fill`, `color`, `fit`. `cards`
(plural) is `[{ title, subtitle?, text?, price?, image? }]` and can sit inside
`card`. No nested `card`. Sibling `title`/`text`/`cards` are not allowed next
to `card`. Use a card to bring type forward over photo or video; do not wrap
every region. Cutout and image-only regions stay un-carded. Copy strings
accept `**bold**`, `*italic*`, and `__underline__` only. Nesting
`***bold italic***` is allowed. Unmatched markers stay literal. No links,
lists, or headings. `table` is `{ columns, rows }` with 1 to 8 columns; every
column is sized. Page `logo` is a path or `{ src, corner }`
(`top-left|top-right|bottom-left|bottom-right`, default `bottom-right`). The
mark sits 32 px inset from that corner, contained max 200×100, never
upscaled, never stretched, above regions. Type, card, and iframe holes inset
so they do not overlap the mark. `iframe`, `webapp`, and region `video` reserve leftover space
like an image and are not painted. Manifest `media` is
`{ type: iframe|application|video, src, rect }` in page coordinates. Omit the PNG
`file` when the layer is only a hole. URLs are allowed for iframe and webapp src
fields. Page-level `video` stays a transparent background for the player. `enter` is a playlist enter type with optional `stagger` 0 through 8.
`motion` is playlist `spin` or `drift`. Image paths are local filesystem paths
relative to the spec file, never a URL. The CLI does not fetch. The envelope
is structured JSON, not pixels.

A named `font` must be installed on this host. A missing family is
`usage_error`, not a silent fallback. Omit `font` to walk catalog fallbacks.
Set page `background`, `brand`, and `text` as hex colors. Muted copy is mixed
from `text` toward `background`.

`compose render` writes one PNG per region and `manifest.json`
(`version`, `canvas`, `layers[]` each `{ id, file?, z, rect, enter?, motion?, media? }`).
Rects are integers, field-for-field with playlist `PlaylistRect`.
`--combined` writes a flattened PNG for inspection. Default for agent work is
layered. Never print PNG bytes, pixels, or image data. `--open` opens the
combined PNG on this computer only when the user asked to view the still here.
Agent vision uses the file path, not `--open`. Raster a diagram to PNG or WebP
at canvas size, upload it, and place it as `image`. HTML is not a primitive.

Plan the canvas from the user's intended output, orientation, and content
viewport. Honor a requested 1920×1080 deliverable even when reviewing on a
larger monitor; desktop dimensions alone do not change the brief. For final
physical display quality, choose raster dimensions for the **physical content
viewport**, excluding letterboxing. A 1920×1080 slide displayed in a
3840×2160 viewport enlarges every flattened element 2×, even when its original
logo is high resolution. Region images cover their box. Source images must
support their actual painted pixel dimensions, including the part cropped by
cover. Re-render from originals at the target density; enlarging the finished
PNG cannot recover detail.

Current compose output dimensions equal the page `width`/`height`. To adapt a
1920×1080 spec for 3840×2160, double `width` and `height`. Type scales with
the shorter edge. Inspect the result on the physical screen at 1:1 pixels;
native screenshots are reduced resolution and can hide pixelation.

Pass `--target-width 3840 --target-height 2160` to `compose render` when the
physical content viewport is known. These flags check quality; they do not
resize the PNG. Read envelope `warnings` and `data.quality`.
`image_upscaled` reports decoded source enlargement above 1.25× using actual
paint bounds. `compose_output_upscaled` reports output magnification above
1.25× at the target. Fix the source or render dimensions before uploading.
With no target, quality reports `target_status: "unknown"`; this is not
evidence of adequate display resolution. Upload transcoding can change
dimensions, so inspect the accepted media dimensions too.

Use optional `--safe-area` for a TV that may crop edges: it warns when
measured text crosses the 5% margin. Warnings are nonblocking, and full-bleed
imagery stays valid. `compose catalog` lists page keys, regions, inner fields,
enter/motion enums, viewing, installed fonts, and examples in this language.

### Author a compose deck with fewer corrective steps

A **compose deck** is a local design document. Its top-level `width` and
`height` set the shared render size in pixels for all its pages. Render its
media, then upload and place that media in a **playlist**, the playback
document sent to Players. These are separate JSON formats.

Prefer region `eyebrow`/`title`/`text`/`cards`/`table` for kickers, titles,
copy, cards and tables so type fitting, font checks and safe-area diagnostics
still run.
Keep illustrations as image assets in a region. A deck is `{ "pages": [ {
"id": "intro", ...page overrides, regions } ] }`. `compose render` of that
file is enough. `compose batch` adds a contact sheet and `--only ID`.

```json
{
  "width": 1920,
  "height": 1080,
  "background": "#1C1410",
  "brand": "#C9A227",
  "text": "#F3E6D0",
  "pages": [
    {
      "id": "intro",
      "left": { "title": "A clear introduction", "text": "One useful idea, explained simply." }
    },
    {
      "id": "comparison",
      "fullpage": {
        "title": "Compare the outcomes",
        "cards": [
          { "title": "Prepare", "text": "Validate before publishing." },
          { "title": "Verify", "text": "Inspect the target screen." }
        ]
      }
    }
  ]
}
```

```bash
screenrig --json compose render ./deck.json --output ./rendered --target-width 3840 --target-height 2160 --safe-area
screenrig --json compose batch ./deck.json --output ./rendered --target-width 3840 --target-height 2160 --safe-area
```

`compose batch` accepts 1 to 2000 pages and returns ordered page results,
layered PNG paths, a contact-sheet preview, and a batch manifest. Fix one
page and run the same command with `--only comparison`: only that page
renders, the others are explicitly `not_selected`. This is selective
rendering, not an automatic cache-validity promise.

Read `data.quality.text` for measured ink. Image upscale warnings remain
separate. Inspect individual full-resolution region PNGs and the combined
composition before claiming pixel quality.

Font checks compare rendered characters with the font's missing-glyph raster.
`font_glyph_fallback` reports a replacement font for that run; choose the
named font explicitly for consistent typography. `font_glyph_missing` means
no installed fallback covers the text. Install a suitable font or change the
family; do not accept missing-character boxes. This check is not a proof of
every language's shaping or typography quality.

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

Codes worth acting on:

- `safe_margin`: non-full-bleed ink or a primitive sits within 4% of an edge;
  move it inward unless it is intentionally full bleed.
- `motion_overuse`: the page has more than one persistent motion or too many
  entrance effects; keep one moving element and remove decorative motion.
- `too_small_for_distance`: measured x-height is below the selected
  `near`/`mid`/`far` floor; shorten the copy or give it a larger region, and
  keep `viewing` honest.
- `text_outside_safe_area`: with `--safe-area`, measured text crosses the 5%
  margin; change the named-region layout or shorten copy until it clears it.
  There is no authorable `inset` field.
- `image_resized`: upload accepted an oversize still but reduced its delivered
  dimensions; inspect the reported output size and proof that rendition.
- `page_ready_timeout`: a player candidate did not become ready before its
  deadline; inspect the running player's operation log and fix the failing
  application, iframe, or page readiness path before retrying.
- `adjacent_repeat`: adjacent compose pages reuse the same region set, or
  adjacent playlist pages show the same media at the same rects; vary the
  layout or content when the repeat is accidental.

### Overlay family (slide-deck pages)

Overlay is a compose mechanic for slide-deck pages and live video. It is not
the presentable-poster path. A presentable poster, menu, or event still is
one generated image with the copy typeset in the still.

Named regions are the only compose language. Copy catalog examples; do not
invent Frame trees, recipes, `fontSize`, `x`, or `y`. Do not put deck copy
through `playlist templates` or template `slots` — those still
`vectorChromeError`.

Photo or video is page `image` or `video`, at rest. Copy is a named region.
`overlay-left`, `overlay-right`, and `overlay-bottom` add a `card`.
`overlay-title` and `overlay-still` do not. Enter lives on the copy region,
from the layout side (page may override). The mark is page `logo`, at rest —
not a third raster.

`compose catalog` examples name the family:

| example | rails | copy | enter |
|---|---|---|---|
| `overlay-title` | page `image` | `left` type, no card | `fade-right` |
| `overlay-left` | page `image` | `left` card, `fit` `region` | `fade-right` |
| `overlay-right` | page `image` | `right` card, `fit` `region` | `fade-left` |
| `overlay-bottom` | page `image` or `video` | `bottom` card, `fit` `region` | `fade-up` |
| `overlay-still` | no photo | `fullpage` type, no card | `fade-in` |
| `overlay` | page `video` | `bottom` card, `fit` `ink` | `fade-up` |

`card.fit: "region"` for left/right panels and full-width bands. `fit: "ink"`
only for a snug lower third. Default fill is the page background + B3.
Override with `card.fill` when that wash is too thin; keep text opaque.
Do not wrap every region. Boardroom titles use `overlay-title`: type on
`left`, `valign` bottom, no card. Lone stills and diagrams use `overlay-still`:
`fullpage` with `enter: "fade-in"` and no copy card.

```json
{
  "width": 1920,
  "height": 1080,
  "background": "#2A3547",
  "brand": "#F8B334",
  "text": "#F4F7FA",
  "image": "./still.jpg",
  "left": {
    "enter": "fade-right",
    "card": {
      "fit": "region",
      "fill": "#2A3547E6",
      "eyebrow": "THE LOW END",
      "title": "RAM is shrinking",
      "text": "What, when, where, and the next action."
    }
  }
}
```

Snug lower third (`overlay` in the catalog):

```json
{
  "width": 1920,
  "height": 1080,
  "background": "#00000000",
  "brand": "#C9A227",
  "text": "#FFFFFF",
  "video": "./clip.mp4",
  "bottom": {
    "enter": "fade-up",
    "valign": "bottom",
    "card": {
      "fit": "ink",
      "title": "Lower third",
      "text": "Keep copy on a snug plate over the picture."
    }
  }
}
```

Author the overlay at the full slide resolution (1920×1080 in this example),
so the type ramp stays at the intended scale. Page `logo` is the identity
mark: 32 px inset from the chosen corner, contain inside 200×100, never
upscaled. Prefer `logo` over a hand-placed playlist wordmark.

For a deck overlay playlist: photo or video `layer` 0 + overlay `layer` 1 on a
1920×1080 canvas. Use `content_fit: "fill"` for a matching-aspect full-canvas
overlay; preserve the photo proportions with `contain` or intentional `cover`
cropping. Eight-digit hex is how the page stays transparent and the plate
keeps alpha. Layered region PNGs can sit as image primitives at their
manifest rects. Inspect with `--combined`; default agent output stays layered.
A presentable poster is one generated `image` primitive, not photo plus overlay.
