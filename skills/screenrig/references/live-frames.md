# Sample frames of a live screen

`screen live frame` saves JPEG frames of what a screen plays, taken from its
live stream, so you can check playback and motion without waiting for
screenshots. It needs only HTTPS. Frames are free.

```sh
screenrig screen live frame SCREEN_ID --output now.jpg --stop
screenrig screen live frame SCREEN_ID --output frames/ --count 5 --interval 1s
```

It starts the live session (`--duration`, default 2m, lengthened to cover the
frames; a session lasts five minutes at most, so `--count` times `--interval`
must fit), waits up to `--wait` (default 30s) for the Player to publish, asks the
media relay for frames, and saves each new frame once as
`frame-<captured_at>.jpg`. `data.frames` lists `path`, `captured_at`, `width`,
`height`, `bytes` and `sha256`. The session is left to its lease, and a person
watching the dashboard shares it; `--stop` ends it, also after a failure.

## Reading frames

- Look at the saved images before saying content is showing or moving.
- To check motion take `--count 5 --interval 1s` and compare the images. Equal
  `sha256` values are the same picture; different ones do not prove motion on
  their own, because video encoding changes bytes of a still scene.
- A frame is what the Player's encoder sent: scaled to at most 1280x720, lossy,
  about one a second. It is not a screenshot; use `screen screenshot` for layout
  and small text. A frame can be black where the Player cannot capture protected
  video, and nothing detects that.

## What the errors mean

- `live_not_ready`: the Player did not start publishing within `--wait`, or no
  new frame arrived in time. On Android someone at the screen must allow screen
  capture once each time the Player starts. Run it again.
- `live_unavailable`: the screen is offline, the session ended (the detail names
  `ended_reason`), or the relay delivers no frames. Read `screen live status`,
  then start again.
- `live_unsupported`: update the Player. `feature_unavailable`: this server has
  no live frames. Use `screen screenshot` instead.
