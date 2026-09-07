# Composition and visual direction

Read this when a page belongs in local compose: several live primitives on one
page, such as a video or web hole with copy beside it; dense data that must be
exact and cannot be proofread item by item on a generated still; or iterating a
layout without spending credits. A poster, menu board, announcement, or other
informational screen is generated as one finished artefact instead — see
"Generate the artefact" in the main skill — and text is never composed over a
generated image.

The direction below applies to both paths. Everything about genre, density,
hierarchy, and review is as useful for writing a generation prompt as for
authoring a compose spec; only the mechanics (regions, cards, rasters) are
compose-only.

Make signage that belongs in its real setting: a persuasive event poster, an
orderable restaurant menu, or an inviting moving welcome. A technically valid
title/body/footer slide can still look like generic PowerPoint. Choose the
visual hierarchy from the content and genre, not from the first available
layout.

## Learn from comparable screens

When establishing a visual direction, inspect a few strong comparable screens,
posters, or menus using available browsing and image-viewing tools. Reuse that
understanding for minor edits; a fresh research phase is not always needed.
Inspect the visual examples, not just search snippets. Official venue and restaurant pages, published menus,
and public design portfolios can reveal category grouping, information density,
type scale, photograph placement, price alignment, and the space given to
branding. Prefer examples relevant to the brief over an unrelated mood board.
If browsing is unavailable, use supplied references and disclose that limit.

Borrow and recreate successful layout and information structure with the user's
content. Use supplied, original, or appropriately licensed imagery; copying a
composition does not require copying another business's private art or assets.
Keep source notes for material references. Historical menus can inform layout, but do not establish current prices or offerings.

## Compose for the content

Use deliberate depth, overlap, contrast, scale, and negative space to guide the
eye. Rich composition can be clear: complexity should organize or express
something. Arbitrary minimalism, gratuitous decoration, and a repeated grid of
cards can each weaken the result. There is no fixed template or maximum layer
count; every element should earn its space.

- **Creative poster playlists:** vary authentic art direction and composition
  across distinct concepts where the brief invites it: photographic editorial,
  illustration, collage, bold typography, or other genre-appropriate styles.
  Changing only colors and titles leaves the same visual hierarchy. A real
  campaign or brand still needs consistent identity across its pages.
- **Menus:** keep most of the canvas useful for choosing an order. Group actual
  categories, make item names and prices easy to scan, and subordinate concise
  descriptions, size choices, modifiers, and add-ons. Product photographs should
  support the choices, with enough presence to be useful. Keep branding compact;
  do not turn every menu into a large logo and three decorative dishes. Preserve
  consistent type, price alignment, and grouping within one restaurant system;
  different restaurant genres can need different structures and densities.
- **Events and promotions:** make what, when, where, and the next action legible
  alongside the expressive imagery. A poster needs those facts on the page, not
  a title and one line. Use the user's facts. For a requested demo, invent
  coherent fictional details; do not present invented dates, offers, or prices
  as a real business's information. Do not author title-plus-one-line pages.
- **Schedules and noticeboards:** make time, activity, location, and status
  easy to scan, with a clear date, audience, and next step. A consistent grid
  can be the right structure for functional information; choose it when it
  helps people find what they need.
- **Video-backed pages:** full-bleed video is useful when it serves the content.
  Plan the crop, focal subject, and copy together. Keep aspect ratio intact and
  verify source resolution against the painted area after cropping; a 720p clip
  expanded to 1080p does not become a 1080p source. Check readable text against
  changing light and motion, not only a convenient frame.

## Build actual depth and purposeful motion

For a layered composition, use independent foreground images with real alpha
where appropriate: a product cutout, figure, illustrated object, or collage
fragment can sit above a background and alongside or across typography. A
flattened poster with separately animated text is not independent moving
artwork. Decide which elements must remain separate before rendering assets.
Rasterize foreground art at its intended painted resolution; preserve clean
alpha edges and its relationship to the background. Use measured compose text
for functional copy, then place its output and artwork as image primitives.

Keep support behind text close to its actual bounds. Prefer a `card` plate:
`fit: "region"` on a column, `fit: "ink"` on a lower third or short copy, so
type sits on a snug translucent surface instead of a giant opaque band. Keep
text opaque; adjust `card.fill` independently. Do not wrap every region. A
full-width lower third is useful when the content calls for one, rather than
a default applied to every page.

Use restrained entry animation for emphasis: foreground artwork or a short
headline can draw attention while functional information settles immediately.
Menu items, descriptions, prices, and ordering information should remain
stationary. Video already provides motion, so additional entrances need a
reason. Persistent object motion is for a design that calls for it; one
moving element per page is the norm. Prefer a panning background or one
accent over several moving objects. Do not animate everything or enforce a
quota. Keep foreground raster padding and primitive bounds large enough for
clean motion without changing the artwork's intended scale. The main skill's
Page motion section defines supported `enter` types, `enter.stagger`,
persistent `motion` (`spin`, `path`, `drift`), fixed timing, and review
mechanics.

Read the selected CLI's `compose catalog` before authoring. The language is
named regions, not Frame trees, recipes, or curated themes. Type size is
procedural; do not author `fontSize`, `x`, or `y`. Region `shadow` and
`outline` are optional paint treatments. Use them sparingly, when the design
calls for them (a headline, a badge). Body copy, menus and prices stay plain
for readability. When an unsupported visual treatment is needed, bake it into
an appropriate image asset using available tools and preserve transparent
padding. Compose paint treatments and playlist primitive `enter`/`motion` are
not interchangeable APIs.

## Review the intended output

Honor the requested canvas and orientation, including a 1920×1080 target shown
in a window on a larger monitor. Plan source density for the intended display
viewport and preserve logos with `contain`; never stretch a mark to fill a box.
The main skill's Local compose section covers resolution diagnostics and
scaling mechanics.

Review the whole playlist locally for rhythm, repeated adjacent hierarchies,
authentic genre treatment, and consistency within a brand. Then inspect
individual pages at the intended size for useful information, readable prices,
crop, contrast, clean alpha, and awkward overlaps. A contact sheet reveals
repetition; individual full-resolution images reveal detail. For separate
layers, inspect the combined composition as well as the individual assets.
Zero truncation and valid JSON do not prove compelling design. Choose page
timing for the brief, reading load, and media; do not carry a fixed duration
from an unrelated playlist.

Correct observed problems with focused local renders before uploading. Use
motion previews when available; a settled still cannot verify an entrance or
video behavior. Match any player verification to the authorized task and state
what was actually observed. Do not turn creative review into a mandatory paid
generation loop or repeat expensive testing without a specific unresolved issue.
