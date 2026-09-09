# Applications and persistent state

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

Application-controlled page fragment:

```json
{
  "id": "board-page",
  "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
  "transition": { "type": "crossfade", "duration_ms": 200 },
  "advance": { "mode": "application", "max_ms": 60000 },
  "primitives": [
    {
      "id": "board",
      "primitive": "application",
      "release_id": "rel_01EXAMPLERELEASE00000000",
      "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
      "layer": 0,
      "content_fit": "fill",
      "controller": true
    }
  ]
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

Use `duration` when the app never signals that it is finished, and omit
`controller` from its primitive:

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

`controller` is legal only on an `application` primitive whose page uses
`advance.mode: "application"`. In that mode exactly one application primitive
must carry `controller: true`. Do not set `controller` on a `duration` or
`media_end` page, and never set it on an `iframe`. `media_end` also forbids
`application` and `iframe` primitives on that page.

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

`screen assign` and `screen show` return the screen's
`manifest_revision` and `content_access_generation`. `manifest_revision`
bumps when that screen's resolved runtime manifest changes. After `playlist update`
or a screen assignment, compare `screen show` with the earlier value: a bump proves
the changed manifest reached that screen's control-plane state, while the
glass or player log still proves rendering. `content_access_generation` bumps
when runtime content access is invalidated or regranted, including archive,
unarchive, and public-id rotation; it is not a playlist-content version.

Looking at the screen stays the only proof of layout. `screen screenshot <id>`
blocks on a WebP. Do not print pixels.

## Application K/V

Application K/V is binary-safe. Use exactly one value mode.

```bash
screenrig --json kv set --application-id app_EXAMPLE lobby --json-value '{"open":true}'
screenrig --json kv get --application-id app_EXAMPLE lobby
screenrig --json kv list --application-id app_EXAMPLE
screenrig --json kv delete --application-id app_EXAMPLE lobby --if-match REVISION
```

`kv get` returns the stored bytes only as `data.value_base64`, including when
`data.content_type` is `application/json`. Base64-decode it in the caller,
then parse JSON only when the content type says it is JSON. `kv list` omits
values.

