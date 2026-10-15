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

#### Start the SDK in this order

`window.screenrig` starts `inert` and turns `active` only when the Player's
handshake and context arrive; a page that is not on screen yet stays inert.
While inert, `ready()`, `log()`, `emit()`, `emitConfirmed()`, `nextPage()` and
`kv` throw or reject with code `inert`. Every app starts like this:

```javascript
const sr = window.screenrig;
async function start() {
  render(); // draw the UI; it must also work outside screenRIG
  if (!sr) return;
  for (;;) {
    try { await sr.waitUntilActive(60000); break; }
    catch (err) { if (err.code !== "activation_timeout") return; }
  }
  await sr.ready();
  // Only from here: emit, emitConfirmed, log, kv, nextPage.
}
start();
```

- Call `ready()` only after `waitUntilActive()` resolves, never before.
- Check `sr.readyState === "active"` before every SDK call made from an event
  handler, timer or `catch`. Never call `log()` in a handler that can run while
  inert: it throws too, and that throw stops the rest of startup, so no event
  is ever sent.
- Queue input that arrives before activation and send it after `ready()`. Use
  `emitConfirmed(code)` when a receipt matters and handle its rejection; plain
  `emit(code)` is a send attempt.

Released apps run under a strict Content-Security-Policy (`script-src 'self';
style-src 'self'`), so inline code in the served HTML never runs. The packer
moves inline `<style>` blocks and inline `<script>` blocks into generated files
under `_screenrig/inline/` and rewrites the tags, so a one-file `index.html`
with inline style and script renders as authored. It refuses inline event
handler attributes (`onclick=` and the like) and `javascript:` URLs with the
file and line; move that code into a script that calls `addEventListener`. An
archive uploaded without the packer that still carries inline script fails
publication with `inline_script_blocked`.

```bash
screenrig app upload ./lobby-board --name "Lobby board"
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
first immutable release. To repair or improve the same app, publish a new release:

```bash
screenrig app update app_EXAMPLE ./lobby-board
```

`app update` preserves application identity, name, and application K/V. It uses
the same packer, upload limits, operation wait, and release result as upload.
Wait for `data.operation.state: "succeeded"`, then use `playlist replace-release`
to review the exact page and primitive replacement and all affected screens. Apply
with `--apply`; optionally pass the preview's `--expect-impact TOKEN` and/or `--expect-rev` revision guard; see [release replacement](playlists.md#replace-one-application-release).
Existing playlists remain pinned until that replacement is applied.
On a revision conflict, read the app again before deciding whether to retry;
do not create a replacement application just to bypass the conflict.

To change the display name without uploading another release:

```bash
screenrig app rename app_EXAMPLE --name "Lobby welcome"
```

Names contain 1 to 120 Unicode characters after trimming and no controls. The
response carries `data.id`, `data.name`, and `data.revision`. The application ID,
releases, K/V data, and playlist references keep their identities. Use
`--expect-rev REVISION` for an optional revision guard; renaming to the current
name leaves the revision unchanged.

### 2. Write the application primitive

For a timed full-screen application page, pass its `rel_` ID to `playlist init`;
see [preparation](playlists.md#prepare-publish-and-edit-playlists). That default has
no controller privileges. For application-controlled advancement, author this
page fragment instead:

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
bounded fallback in the experience. Start the visitor idle clock and send
events only after the [startup sequence](#start-the-sdk-in-this-order)
(`waitUntilActive()`, then `ready()`) finishes. Use
`await window.screenrig.emitConfirmed(code)` when the UI promises that an event
was accepted, and handle its rejection. The receipt resolves only after the
backend accepted the event; do not retry automatically after a timeout, since
the event may already be recorded. Choose a shorter duration only for a
preview that is supposed to rotate regardless of input.

`controller` is legal only on an `application` primitive whose page uses
`advance.mode: "application"`. In that mode exactly one application primitive
must carry `controller: true`. Do not set `controller` on a `duration` or
`media_end` page, and never set it on an `iframe`. `media_end` also forbids
`application` and `iframe` primitives on that page.

### 4. Create the playlist and assign it to a screen

```bash
screenrig playlist create ./lobby-board.json
screenrig screen list
screenrig screen assign scr_EXAMPLE --playlist-id pl_EXAMPLE
```

Take `--playlist-id` from `data.id` of the `playlist create` result. To guard against concurrent writes, optionally supply
`--expect-rev` from the screen's current `revision`, which both `screen list` and
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

Application K/V is binary-safe. The agent writes it with `kv` commands, and a
running application reads and writes the same store through
`window.screenrig.kv.get`, `list`, `set`, and `delete`, and hears about every
change through `kv.onChange`. Reads and `onChange` need
`capabilities["kv.read"]` and writes need `capabilities["kv.write"]`; check
the flag before calling.

### Where the SDK runs

The web Player (including on Samsung Smart Signage and BrightSign, which run it),
the Android Player, the Linux Player (Linux and Raspberry Pi), the Windows Player
and the macOS Player host the SDK in full:
`ready`, `waitUntilActive`, `nextPage`, `emit`, `emitConfirmed` receipts, and
`screenrig.kv` with `kv.onChange`. Apple TV has no web primitives, so it shows no application or
iframe content; target it with image, video, and stream pages.

Use exactly one value mode.

```bash
screenrig kv set --app-id app_EXAMPLE lobby --json-value '{"open":true}'
screenrig kv get --app-id app_EXAMPLE lobby
screenrig kv list --app-id app_EXAMPLE
screenrig kv delete --app-id app_EXAMPLE lobby
```

`kv get` returns the stored bytes only as `data.value_base64`, including when
`data.content_type` is `application/json`. Base64-decode it in the caller,
then parse JSON only when the content type says it is JSON. `kv list` omits
values.

### Update screens the moment data changes

`kv.onChange(handler)` runs the handler whenever a key of this application
changes, whoever wrote it: `kv set`, the API, an incoming webhook, or the app
on another screen. Every screen whose playlist shows the app hears it within
seconds; quick writes to one key may arrive as one change with the newest
revision. The change carries `key`, `revision` and `deleted`, never the value,
so read the value with `kv.get`, which resolves to the entry with
`value_base64` and `content_type`. Subscribe once after `ready()`; the SDK
keeps the subscription across page changes. It returns a function that
removes the handler.

```javascript
async function showMenu() {
  const entry = await sr.kv.get("menu");
  render(JSON.parse(new TextDecoder().decode(
    Uint8Array.from(atob(entry.value_base64), c => c.charCodeAt(0)))));
}
// after await sr.ready():
if (sr.capabilities["kv.read"]) {
  await showMenu();
  sr.kv.onChange(change => {
    if (change.key === "menu" && !change.deleted) showMenu().catch(() => {});
  });
}
```

Prefer this over polling `kv.get` on a timer.

### Let another system write a key: incoming webhook

When data lives in another system (a point of sale, a spreadsheet, Zapier or
Make, a cron job), create a webhook for the key instead of relaying writes
yourself. It is one URL that writes one key of one application; the app
updates through `kv.onChange`.

```bash
screenrig kv webhook create --app-id app_EXAMPLE menu --description "POS price export"
```

The answer holds `data.url` and `data.secret` (`srkw_...`). The secret appears
only in this answer and in `kv webhook rotate-secret`: hand it to the sending
system or the user at once, and never write it to a file, log, playlist or
app. The sender posts the raw value with the secret in the Authorization
header (Bearer, or HTTP Basic with the webhook id as the username and the
secret as the password); a secret in the URL is never accepted:

```bash
curl -X POST "$URL" -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" --data '{"latte":4.5}'
```

The body (at most 1 MiB) becomes the key's value and `Content-Type` its
content type. Each post is a normal K/V write and one billed API request: it
bumps the revision and answers with the key's metadata, never its value. An
`Idempotency-Key` header makes a sender's retries safe for 24 hours. Limits:
120 posts a minute per webhook and 20 webhooks per application. `kv webhook
list` shows each webhook's key, url and last use, `kv webhook rotate-secret`
replaces a leaked secret (the old one stops at once), and `kv webhook delete`
stops the URL and keeps the key's value.
