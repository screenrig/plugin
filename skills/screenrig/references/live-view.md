# Watch a screen live

`screen screenshot` is a still. Live view is sub-second video of what the
screen plays, shown to a person in the dashboard. You do not receive the video:
start the session, give the person `data.viewer_url`, and use a screenshot for
anything you must inspect yourself. Live view is free.

## Start, watch, stop

```sh
screenrig screen live start SCREEN_ID --duration 10m
screenrig screen live status SCREEN_ID
screenrig screen live stop SCREEN_ID
```

`start` asks the Player to publish and reads the session every second for
`--wait` (default 30s) until `data.publisher.connected` is true. Open or send
`data.viewer_url`: the dashboard page that shows the video. A start on a live
session renews it. A session ends when its lease passes (`--duration`, default
5m; 30s to 1h), after 60 minutes at most, or on `stop`; stop it when the person
is done.

## What the answers mean

- Warning `live_not_ready`: ok, but the Player has not connected yet. Read
  `status` again; do not say the video is showing. On Android someone at the
  screen must allow screen capture once each time the Player starts.
- `live_unavailable`: the screen is offline or the session ended. Its detail
  names `ended_reason`: `consent_denied` and `consent_timeout` mean nobody at
  the screen allowed capture; `capture_failed` and `connection_failed` are the
  Player's.
- `live_unsupported`: this Player cannot publish; update it. Use `screen
  screenshot` meanwhile.
- `feature_unavailable`: the server has no live view. Use `screen screenshot`.

`publisher.connected` is the Player's own report, at most 45 seconds old. It is
not proof of a picture, and live view does not replace a screenshot for
checking layout.

To sample JPEG frames of the live stream yourself, see [live frames](live-frames.md).
