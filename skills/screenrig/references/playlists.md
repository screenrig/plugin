# Playlist documents, cards and feeds

The full document reference is "The playlist document" in the
[CLI reference](https://screenrig.ai/docs/cli.md); `playlist validate FILE`
checks a document and `playlist show ID --output FILE` writes an editable one.

## Built-in cards and feeds

A card is a non-interactive live display drawn natively by every Player. Use an
application only for what a card cannot do.

```sh
screenrig cards list --category food        # or --tag weather
screenrig cards show menu                   # schemas, tier, layouts, feed, example
screenrig card create --type menu --file params.json   # returns crd_ID
screenrig card data put crd_ID --file data.json [--expect-rev N] [--ttl 2h]
screenrig card preview crd_ID --output card.png
```

- Put the `crd_` ID in a page primitive: `{"id", "primitive": "card", "card":
  "crd_ID", "layout", "anchor"?, "content_fit": "fill"}`. `layout` is required
  and must be one `cards show` lists for the type; omit `rect` and `layer` unless
  the layout is `free`. Layouts, anchors and per-page limits:
  [cards](https://screenrig.ai/docs/cards.md#layouts-and-anchors). A `fullscreen`
  card takes `full` only.
- Static params belong to the instance: after `card params`, republish. Dynamic
  data (no `document` wrapper, at most 1 MiB) reaches screens without
  republishing. Card images are `media:<id>` references to ready images.
- Remove a card from every playlist before `card delete`.
- Preview locally with installed Chromium (`SCREENRIG_BROWSER` selects it);
  `--now ISO --timezone ZONE` freezes clocks. Resolve every item in
  `data.placeholders` and check a Player screenshot after publishing.
- Weather, air quality, alerts, rates, crypto, earthquakes and headlines come
  from `screenrig feeds get NAME ...`, cached by screenRIG; never call providers.
  A `state: pending` answer carries `retry_after_seconds`: report it and return.
  Show a feed's `attribution` wherever its data shows.

## Card webhooks

An outside system (a CMS, Zapier, a point of sale, a script) pushes data to a
card with one HTTP POST. Create the webhook, give its administrator the url and
secret, and read the delivery log when nothing shows.

```sh
screenrig kv webhook create --card crd_ID --map map.json --description "CMS alerts"   # url and secret, shown once
screenrig kv webhook update kvw_ID --card crd_ID --map map.json    # also --clear-map, --disable, --signing
screenrig kv webhook deliveries kvw_ID --card crd_ID               # why each post was written, unchanged or refused
```

- Without `--map` the posted JSON object (or form) is the card's data document.
  With it, a template builds the document from the body:
  `{"title":"{{body.alert.title}}","body":"{{body.alert.message}}"}`;
  `{{body.items[0].name}}` indexes; a string that is one placeholder keeps the
  value's type; `{"$each":"{{body.items}}","$limit":20,"$template":{"text":"{{item.title}}"}}`
  maps an array (also `$group`, `$number` for `$3.50` or `3,50 €`, `$bool`,
  `$text`); `{{query.NAME}}` reads the URL's query. A missing value is empty in
  text and leaves a lone value out.
- The sender sends `Authorization: Bearer SECRET` (or HTTP Basic with the
  webhook id as user), never the secret in the url. Each post is checked as the
  card's own data (`card_data_invalid` names the path), an identical document is
  not rewritten, and an accepted post is one billed API request.
- A wrong url, a wrong secret, a disabled webhook and any GET answer the same 404;
  only `deliveries` says why. `--signing` also requires `ScreenRig-Signature:
  t=UNIX,v1=HEX`, the HMAC-SHA256 of `t.BODY` under `data.signing_secret`, within
  five minutes. Secrets go to the sender's administrator, never into
  conversation, files or logs.

## Per-screen values

Each screen carries its own `fields` (up to 32 lower-case names, values up to
200 characters) and `location` (latitude, longitude, an optional `name` cards
show and an `address`). `screen update` sets them: `--field NAME=VALUE`
(repeatable), `--unset-field NAME`, `--clear-fields`, `--location LAT,LON
[--location-name NAME] [--address TEXT]`, `--clear-location`. Changing them
reissues the screen's manifest.

A card's params read them with tokens that screenRIG fills for each screen:

- Any text param: `{screen.name}`, `{screen.timezone}`, `{screen.field.NAME}`,
  for example `"title": "Store {screen.field.store_number}"`.
- A card's `location` param: the whole value `"{screen.location}"`, so weather,
  air quality, alerts, earthquake, moon and prayer-time cards follow each
  screen. A CAP alert card takes it only without `sources`.

`card create` and playlists accept the tokens. `card preview` shows them as
written, so check one screen's screenshot after publishing. A screen without
the field shows empty text; a screen without a location shows the card without
one.

## Video walls

A kiosk-installed Linux Player drives 2 or 3 displays as one wall. Set it with
`screenrig screen wall set SCREEN_ID --outputs HDMI-A-1,HDMI-A-2 --arrangement
row|column [--rotation 0|90|180|270]` (outputs from `screen show`, in physical
order) and remove it with `screen wall clear SCREEN_ID`; `wall_unsupported`
means the Player lacks wall support. A wall playlist carries `format`
(`displays`, `arrangement`, `orientation`), every page canvas is the wall
canvas, and primitives take `displays` (`[1,2,3]`, `[2]`) or a free `rect`.
Assigning it to a screen whose wall differs is refused
(`playlist_format_mismatch`). Canvas sizes, card layouts and video sizing (wall
aspect ratio within 4K, `content_fit: "fill"`, text off the seams):
[video walls](https://screenrig.ai/docs/players.md#video-walls).

## Playlist rules that validation will enforce

- A playlist is `name`, optional `audio`, and `pages`. A page has `id`, `canvas`
  (`width`, `height`, `viewport_fit`, `background`), `transition`, `advance`,
  optional `visibility` and `audio_cue`, and flat `primitives` (`id`,
  `primitive`, its own fields, `rect`, `layer`, `content_fit`, optional `enter`
  and `motion`).
- Primitives are `image`, `video`, `stream`, `iframe`, `application`, `card`.
  Text and shapes are not primitives: compose or generate them into an image.
- `image` and `video` need a `selector` (`by` `id`, `ids`, `all`, `tag`,
  `folder` with a `folder_id` from `media folder list`); `media_id` lives inside it. Others take none. Dynamic selectors
  resolve at each loop; on duration, application and `audio_end` pages they
  need `one_at_a_time: true`. `media_end` is valid only on a page with exactly
  one image or video; an image there needs `dwell_ms`, a video must not loop.
  Use `media selector-preview` to inspect a selector.
- `iframe` and `application` use `content_fit: "fill"`; `application` pins a
  `release_id`. A `stream` needs `fallback_media_id` and a `duration` page. Its
  `sources` take an `https` HLS URL or a camera's `rtsp://`/`rtsps://` URL as
  given, login included (`{"url": "…"}` is enough); Android, Amazon and Linux
  Players open RTSP directly, others show the fallback. UniFi Protect: the
  camera's channel RTSP URL from Protect. Apple TV rejects `iframe` and
  `application`.
- For YouTube, put the link the user gave (video, Shorts, live, playlist or
  `youtube.com/channel/UC…/live`) in an `iframe` `src`: the server stores an
  autoplaying, looping embed without YouTube's controls. Native Players play
  sound, the web Player plays muted; `mute=1` in the link mutes everywhere.
  A channel handle (`@name`) is rejected: ask for a video or channel-ID link.
- `visibility` times are civil (no zone); keep at least one page without it, and
  set the screen timezone before assigning a scheduled playlist. A
  `visibility.data` condition keys off card data.
- A soundtrack is `audio: {tracks, loop, volume, cued}` (1 to 128 uploaded
  tracks); pages bind with `audio_cue` or `advance: {"mode": "audio_end"}`.
  `playlist update` replaces the whole document, so omitting `audio` removes it.
  Details: [compose](https://screenrig.ai/docs/compose.md#add-a-soundtrack).
- An ad break is an `adslot` page (`id`, `type`, `adslot_id`, optional
  `visibility`), not a primitive; keep an ordinary fallback page.
- `playlist export|import` moves image/video media, soundtrack audio and iframe
  URLs as a bundle. Cards, streams and adslot pages stop export. Applications
  stop it by default; `--skip-applications` drops them and empty or
  application-controlled pages, and requires at least one remaining page.
  For an editable document retaining card/application references in the same
  project, use `playlist show ID --output playlist.json`; referenced resources
  stay in that project.
  `playlist patch` and `rename` change only supplied fields.
