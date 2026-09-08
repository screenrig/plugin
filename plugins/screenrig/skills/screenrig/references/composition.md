# Composition and visual direction

Choose by what the page is.

`media generate` as the whole page is image-model layout: the model paints
art, hierarchy, and type together. That is the presentable quality bar. Local
`compose render` is a slide-deck renderer. It is not in the same quality
class. Compose and generate are not interchangeable layout tools. Pick
generate when the page must look presentable.

Posters, restaurant menus, event art, product stills, and other pages that
must look presentable are generated finished stills. Compose visual guidance
in this file is for slide-deck pages. Animation is not a reason to compose.

## Presentable pages are generated finished stills

A persuasive event poster, an orderable restaurant menu, an announcement, or
a product still is one `media generate` image for the **whole page**. Put
every fact and all copy in the prompt so the image model typesets it.
ScreenRig generate is the default.
Own-gen-then-upload remains valid only when a preferred model is already in
use.

Do not compose a presentable poster as named regions and cards. Do not
generate an atmosphere plate and overlay type. Do not local-render a
presentable page in order to attach `enter` or `motion`.

When establishing a visual direction, inspect a few strong comparable
screens, posters, or menus using available browsing and image-viewing tools.
Reuse that understanding for minor edits; a fresh research phase is not
always needed. Inspect the visual examples, not just search snippets.
Official venue and restaurant pages, published menus, and public design
portfolios can reveal category grouping, information density, type scale,
photograph placement, price alignment, and the space given to branding.
Prefer examples relevant to the brief over an unrelated mood board. If
browsing is unavailable, use supplied references and disclose that limit.

Borrow successful layout and information structure with the user's content.
Use supplied, original, or appropriately licensed imagery; copying a
composition does not require copying another business's private art or
assets. Keep source notes for material references. Historical menus can
inform layout, but do not establish current prices or offerings.

- **Posters and campaign art:** when the user names a style, use it. When
  they do not, still choose a treatment that fits that page's content.
  Photographic editorial, illustration, collage, silkscreen, risograph,
  travel poster, chalkboard, Swiss grid, woodcut, and other
  genre-appropriate styles are all valid. Vary at will when a different
  treatment fits; do not force a different style on every page of a loop.
  A real campaign or brand still needs consistent identity across its pages.
  Each presentable page is a finished generated still with the copy in the
  image.
- **Menus:** keep most of the canvas useful for choosing an order. Group
  actual categories, make item names and prices easy to scan, and subordinate
  concise descriptions, size choices, modifiers, and add-ons. Product
  photographs should support the choices, with enough presence to be useful.
  Keep branding compact; do not turn every menu into a large logo and three
  decorative dishes. Preserve consistent type, price alignment, and grouping
  within one restaurant system; different restaurant genres can need
  different structures and densities. A presentable menu is a generated
  finished still, not a compose card grid.
- **Events and promotions:** make what, when, where, and the next action
  legible in the generated still, alongside the expressive imagery. A poster
  needs those facts on the page, not a title and one line. Use the user's
  facts. For a requested demo, invent coherent fictional details; do not
  present invented dates, offers, or prices as a real business's information.

Iterate the generate prompt when the still is wrong. Do not switch a
presentable page to compose to save a generation.

## Compose for slide-deck pages

Local unbilled `compose render` is for slide-deck-like experiences:
title/body/table slides, internal decks, and measured type that must stay
editable as compose JSON. Schedules and noticeboards that need a consistent
editable grid belong here. Presentable posters, menus, and event art do not.

Use deliberate depth, overlap, contrast, scale, and negative space to guide
the eye. Rich composition can be clear: complexity should organize or express
something. Arbitrary minimalism, gratuitous decoration, and a repeated grid of
cards can each weaken the result. There is no fixed template or maximum layer
count; every element should earn its space.

- **Title, body, and table slides:** prefer region `eyebrow` / `title` /
  `text` / `cards` / `table` so type fitting, font checks, and safe-area
  diagnostics still run. Keep illustrations as image assets in a region.
  Kickers go in `eyebrow` (brand, above the headline). Headlines go in
  `title` (page text). Body goes in `text` (muted).
- **Schedules and noticeboards:** make time, activity, location, and status
  easy to scan, with a clear date, audience, and next step. A consistent grid
  can be the right structure for functional information; choose it when it
  helps people find what they need.

Keep support behind text close to its actual bounds. Prefer a `card` plate:
`fit: "region"` on a column or full-width band, `fit: "ink"` only on a snug
lower third, so type sits on a plate instead of a giant default wash. Keep
text opaque; adjust `card.fill` independently. Do not wrap every region. A
full-width lower third is useful when the content calls for one, rather than
a default applied to every page. Overlay cards are a deck mechanic, not the
presentable-poster path.

For an exec-intro-style deck, copy the overlay family from `compose catalog`.
Photo or video is page `image` or `video`, at rest. Copy is a named region;
`overlay-left`, `overlay-right`, and `overlay-bottom` add a `card`. Enter lives
on the copy region, from the layout side: `left` gets `fade-right`, `right`
gets `fade-left`, `bottom` gets `fade-up`. A page may override. The mark is
page `logo`, at rest. Catalog keys: `overlay-title` (page image, `left` type,
no card), `overlay-left`, `overlay-right`, `overlay-bottom`, `overlay-still`
(`fullpage` type, no photo, no card), and `overlay` (video plus ink-fit lower
third). Do not rebuild those pages as Frame trees, recipes, or playlist
template `slots`.

Read the selected CLI's `compose catalog` before authoring. The language is
named regions, not Frame trees, recipes, or curated themes. Type size is
procedural; do not author `fontSize`, `x`, or `y`. Overlay-family copy uses
`eyebrow` for the kicker, `title` for the headline, and `text` for the body.
`eyebrow` and card-item titles default to brand; region title defaults to
page text; body `text` uses muted. Region `shadow` (`{ x, y, color, blur? }`,
blur 0–32) and `outline` are optional paint treatments. Use them sparingly,
when the design calls for them (a headline, a badge). Body copy, menus and
prices stay plain for readability. When an unsupported visual treatment is
needed, bake it into an appropriate image asset using available tools and
preserve transparent padding. Compose paint treatments and playlist primitive
`enter`/`motion` are not interchangeable APIs.

## Live objects and motion

A playing video, iframe, or webapp is a playlist primitive. Upload the video
if you have it. Write the primitive. Do not local-render stills merely to
attach `enter` or `motion`. Animation is not a reason to compose.

Full-bleed video is useful when it serves the content. Plan the crop and
focal subject together. Keep aspect ratio intact and verify source resolution
against the painted area after cropping; a 720p clip expanded to 1080p does
not become a 1080p source. Check readable overlay text against changing light
and motion, not only a convenient frame. Overlay type on live video is a deck
mechanic; a presentable poster of that scene is a generated finished still.

Use restrained entry animation for emphasis on a live object or a deck layer:
foreground artwork or a short headline can draw attention while functional
information settles immediately. Menu items, descriptions, prices, and
ordering information should remain stationary. Video already provides motion,
so additional entrances need a reason. Persistent object motion is for a
design that calls for it; one moving element per page is the norm. Prefer a
panning background or one accent over several moving objects. Do not animate
everything or enforce a quota. Keep foreground raster padding and primitive
bounds large enough for clean motion without changing the artwork's intended
scale. The main skill's Page motion section defines supported `enter` types,
`enter.stagger`, persistent `motion` (`spin`, `path`, `drift`), fixed timing,
and review mechanics.

A flattened poster with separately animated text is not independent moving
artwork, and it is not a reason to compose a presentable page. Decide which
live objects must remain separate primitives before writing the playlist.

## Review the intended output

Honor the requested canvas and orientation, including a 1920×1080 target shown
in a window on a larger monitor. Plan source density for the intended display
viewport and preserve logos with `contain`; never stretch a mark to fill a box.
The main skill's Local compose section covers resolution diagnostics and
scaling mechanics for deck pages.

Review the whole playlist locally for rhythm, repeated adjacent hierarchies,
authentic genre treatment, and consistency within a brand. Then inspect
individual pages at the intended size for useful information, readable prices,
crop, contrast, clean alpha, and awkward overlaps. A contact sheet reveals
repetition; individual full-resolution images reveal detail. For separate
deck layers, inspect the combined composition as well as the individual
assets. Zero truncation and valid JSON do not prove compelling design. Choose
page timing for the brief, reading load, and media; do not carry a fixed
duration from an unrelated playlist.

Correct observed deck problems with focused local renders before uploading.
Iterate a generate prompt when a presentable still is wrong. Use motion
previews when available; a settled still cannot verify an entrance or video
behavior. Match any player verification to the authorized task and state what
was actually observed. Do not repeat expensive testing without a specific
unresolved issue.
