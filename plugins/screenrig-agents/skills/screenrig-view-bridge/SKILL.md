---
name: screenrig-view-bridge
description: Open the screenRIG screens, playlists and media view as a local page where the runtime shows tool results as text. Collect the view resource and saved tool results, then write one page that runs the project's own view against them.
---

# The screenRIG view as a local page

A runtime that renders MCP Apps shows the `screenrig-views` view itself: ask
for screens there and the view appears. Use this skill where the runtime hands
tool results back as text. It writes one page that runs the project's own view
resource against results collected beforehand, so the reader sees the same
screens, playlists, media and stills the connected host would show.

The view is never carried here. Read it from the connected server each time, so
the page matches that project's own release.

## Collect

1. Read the view resource the `screenrig-views` connection publishes
   (`ui://screenrig/visibility-v5`; list the connection's resources to confirm
   the current one) and write its text to a file.
2. Call the view's own read tools and keep each result whole:
   `screenrig_screen_list`, `screenrig_playlist_list`, `screenrig_media_list`,
   `screenrig_screen_get`, `screenrig_playlist_get` and `screenrig_media_get`
   per record, `screenrig_screen_screenshot_current` for each screen's saved
   still, and `screenrig_media_thumbnail` for each media item's thumbnail.
   Where the connection is unavailable, `screenrig screen list --json` and its
   siblings return the same records through the CLI. Keep those successful
   `{ok,data,warnings}` envelopes whole too; the bridge converts their `data`
   members to the view's `structuredContent` shape.
3. Write one seed file:

```json
{
  "tools": { "screenrig_screen_list": { "structuredContent": { "items": [], "next_cursor": null } } },
  "by_id": { "scr_ID": { "…one screen record…": true } },
  "images": { "scr_ID": { "data": "BASE64", "mimeType": "image/webp", "captured_at": "TIME" } }
}
```

`tools` holds each list result exactly as the MCP tool or CLI returned it.
`by_id` holds one raw record, whole MCP detail result or whole successful CLI
envelope per screen, playlist or media id the detail panels open. The bridge
normalizes all three forms. `images` holds each screen still and media thumbnail
as base64; `captured_at` applies only to screen stills.

A still from the CLI is one capture plus a resize, which keeps the page small:

```sh
screenrig screen screenshot SCREEN_ID --output CAPTURE.webp
ffmpeg -y -loglevel error -i CAPTURE.webp -vf scale=480:-2 -q:v 70 THUMB.webp
base64 -w0 THUMB.webp
```

## Write the page

```text
node <skill>/scripts/screenrig-view-bridge --app APP.html --seed SEED.json --output VIEW.html
```

It prints a JSON envelope naming the path, its size, and how many tools,
records and stills it carried. Give the reader that path. Where the runtime
opens a local page, open it; the page is self-contained and needs no server.

## What the page does

The page answers the view's own protocol: it replies to `ui/initialize` with
protocol `2026-01-26` and `hostCapabilities.serverTools`, then answers each
`tools/call` from the seed. Tabs, detail panels and saved stills read the
collected results.

Refresh, Capture screenshot and paging past the collected page report that they
need a live host, through the view's own message. Say that when handing over
the page: it reads the moment it was collected, and the banner carries that
time. For a reading that follows the fleet as it changes, use the connection
through a runtime that renders the view, or the CLI.
