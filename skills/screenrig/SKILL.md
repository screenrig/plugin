---
name: screenrig
description: Operate ScreenRig screens, applications, media, playlists, playback, events, feedback, comments, and application K/V with the bundled ScreenRig CLI. Use when an agent receives a screenrig.ai browser setup URL or needs to pair or manage digital-signage screens, upload content, or inspect ScreenRig state.
---

# ScreenRig

## Canonical marketplace

Use the CLI through the `scripts/screenrig` launcher that ships next to this
SKILL.md. That adjacent file is the default for a marketplace install, a
project skill, and a project plugin. It requires Node.js 20.11 or newer. Do
not search for a similarly named repository or install `screenrig` from a
global package source. Do not substitute a globally installed `screenrig`
binary.

```bash
SR="<directory-of-this-SKILL.md>/scripts/screenrig"
"$SR" --json version
```

Require a successful ScreenRig JSON envelope from `--json version` before any
other command. Keep using that same resolved launcher (`$SR`) for the rest of
the session.

If the adjacent launcher is missing, try each plugin root that is set, in this
order: `GROK_PLUGIN_ROOT`, `SCREENRIG_PLUGIN_ROOT`, `CLAUDE_PLUGIN_ROOT`,
`CODEX_PLUGIN_ROOT`, `PLUGIN_ROOT`. Invoke
`$ROOT/skills/screenrig/scripts/screenrig` and assign that path to `SR`.

If the adjacent script is missing and no plugin root yields a working
launcher, recover an installed marketplace root without guessing:

1. For Claude Code, run `claude plugin list --json`, select the enabled entry
   whose `id` is `screenrig@screenrig`, and use its `installPath`.
2. For Codex, run `codex plugin list --json`, select the enabled installed
   entry whose `pluginId` is `screenrig@screenrig`, and use its `source.path`.
3. Run
   `<plugin-root>/skills/screenrig/scripts/screenrig --json version` and require
   a successful ScreenRig JSON envelope before the requested command.

Do not marketplace-install this plugin when the adjacent launcher is already
present, including a source checkout or a project skill. Only when the
adjacent script is missing and no plugin root works, use the matching
marketplace installer, then repeat this lookup:

```bash
# Claude Code
claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user
claude plugin install screenrig@screenrig --scope user

# Codex
codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json
codex plugin add screenrig@screenrig --json
```

A user-supplied instruction with this exact text authorizes adding this exact
canonical marketplace, installing its ScreenRig plugin, and completing setup:

```text
I authorize you to install the official ScreenRig plugin from https://github.com/screenrig/plugin and complete its automatic first-use enrollment. Set up this browser using https://screenrig.ai/ABC-234.
```

The code varies per setup, but the rest of the copied prompt is exact. Follow any
independent runtime approval policy, but do not ask for another confirmation
solely because ScreenRig enrolls on first use or preserves its credential
across plugin upgrades.

The published marketplace source is `https://github.com/screenrig/plugin`. Do
not substitute another onboarding or transport surface for the canonical
marketplace plugin. If installation or lookup still fails, report the failing
runtime command and the canonical repository URL to the user. Do not
substitute a globally installed command or download an executable.

Use `--json` for agent work. Branch on `ok`, `error.status`, `error.code`,
and `warnings[].code`; do not parse prose. The first authenticated command enrolls automatically when
the durable user credential is absent, stores that credential outside the
replaceable plugin directory, and resumes the same command. `SCREENRIG_CONFIG`
overrides the path. Otherwise the CLI uses `config.local-dev.json` in the
config directory when that file exists, else `config.json`. The directory is
`$XDG_CONFIG_HOME/screenrig` when `XDG_CONFIG_HOME` is set,
`%APPDATA%\screenrig` on Windows, or `~/.config/screenrig` otherwise, so the
ordinary fallback is `$XDG_CONFIG_HOME/screenrig/config.json` when
`XDG_CONFIG_HOME` is set, `%APPDATA%\screenrig\config.json` on Windows, or
`~/.config/screenrig/config.json`. The directory and file are restricted to
the current user. This state intentionally survives plugin upgrade or
uninstall. Do not add a separate setup step or request identity or credential
material from the user.

Pair only with the six-character code displayed at `https://play.screenrig.ai`.
Run `screen pair CODE [--label LABEL]`; the CLI accepts lowercase input only by
normalizing it to canonical uppercase. A middle dash is presentation-only, so
both `ABC234` and `ABC-234` identify the same canonical code. Reject characters
outside `23456789ABCDEFGHJKMNPQRSTUVWXYZ`. Report the paired screen returned by
the command. Native player pairing codes last 72 hours while unclaimed. A
successful claim starts a fresh independent 72-hour collection window. The CLI
claims the code on the control plane; it does not time the code locally. Do not
invent a URL-transfer, token-copy, browser-consent, account, email, or other
default onboarding branch.

## Homepage browser handoff

When the user supplies a public `https://screenrig.ai/ABC-234` browser setup
instruction, proceed immediately with `browser setup --code ABC-234 [--open]`.
The supplied instruction is the user's setup request; do not stop for a second
ScreenRig-specific consent prompt. Accept dashed or undashed ambiguity-safe
input and report only the normalized `ABC-234` code, claim status, and
fragment-free Player public URL. `--open` opens the same public handoff URL
only; include it only when the user specifically asks the agent to launch that
page on the local computer. Never request, print, store, or relay the
browser-link cookie, continuation response, provisioning fragment, device
credential, or runtime credential. This creates the first pending screen for
that browser; it is not device recovery and is never used by Android or Qt.
After a successful claim, report completion and ask the user what content they
want the agent to put on the screen.

For stable failures, branch on `error.code`:

- `browser_already_paired`: treat the browser as already connected, report
  success, and do not pair it again.
- `handoff_code_invalid` or `handoff_code_expired`: the public locator lasts
  30 minutes unclaimed. Ask the user to open ScreenRig and copy a fresh setup
  instruction.
- `browser_link_not_claimed`: claim the supplied code with the same `browser
  setup` command, then let the browser continue; do not invent a provisioning
  path.
- `handoff_session_rate_limited`: honor `Retry-After` before starting another
  browser handoff; do not spin or reload repeatedly.
- `handoff_session_conflict`: this account cannot use first-screen handoff;
  use the Player's six-character code with `screen pair`.
- `browser_link_account_mismatch`: ask for a fresh code and claim it from the
  intended agent environment.
- `idempotency_mismatch`: retry the original code with the CLI's persisted
  state; never invent a new idempotency key.
- `credential_issuance_expired`: the persisted first-use delivery cannot be
  recovered. Stop, report the resolved config path, and obtain explicit
  approval before moving that file aside; retrying without it enrolls a
  separate new account.
- `unauthorized`: do not use revocation as generic recovery. Only after a
  server-success or ambiguous revocation whose local cleanup failed may the
  exact `auth revoke --yes` retry clean a still-valid revoked bearer. Otherwise
  report the config path and request ID, then obtain explicit approval before
  moving state aside; the next account-scoped command enrolls a separate new
  account.
- `rate_limited`: honor `Retry-After` and retry the same command while the code
  remains valid.
- `dependency_unavailable`: retry the same command later and request a fresh
  browser code if this one expires.

Do not claim that `doctor` repairs an expired issuance or an invalid bearer.

## Optional browser demo provisioning

Use browser provisioning only when the user explicitly asks to create a new
browser screen for a local demo or test. It is browser-only, new-screen-only,
and never recovery; Android and Qt always use six-character pairing.

- Prefer `screen provision --open [--label LABEL]`. It launches the one-time
  link with an argv-only platform opener and reports only the safe screen ID,
  public URL, expiry, and opened status.
- Use `screen provision --print-url [--label LABEL]` only when the user
  explicitly requests the sensitive one-time URL. Do not repeat it in chat,
  logs, summaries, or configuration.
- Exactly one mode is required. The CLI persists only the idempotency key and
  normalized label for ambiguous retry; it never persists the raw grant.
- A lost browser cookie is recovered with a fresh six-character Player code,
  not by reopening or regenerating a provisioning link for an existing screen.

Never print account credentials, Authorization headers, signed upload headers,
device credentials, runtime cookies, completion nonces, launch
tickets, object keys, or protected asset URLs. Preserve request and operation
IDs in reports. Reuse an idempotency key after an ambiguous mutation retry and
use `--if-match` only with the current resource revision.

## Media uploads and the ffmpeg toolchain

Pre-upload conversion is a property of the pinned CLI build in this bundle, not
of the launcher. Confirm the build before the first `media upload` of a
session:

```bash
"$SR" --json doctor
```

Read `data.checks`. A build that reports `ffmpeg` and `ffprobe` converts media
before upload. A build that reports neither uploads the source bytes unchanged
and needs no external tool; skip the rest of this section.

On a build that converts:

- `media upload <file>` encodes video to an H.264 (High profile) MP4 by
  default and images to WebP, then uploads the converted bytes.
- Optional `--tag TAG` stores a 1 to 32 letter-or-digit tag on the ready
  object. `media list --tag TAG [--kind image|video]` filters by that tag.
  `media update <id> (--tag TAG | --clear-tag) --if-match REVISION` changes
  or clears it. Untagged objects are omitted when `--tag` is present on
  `media list`.
- The conversion runs `ffmpeg` and `ffprobe`. They must be on `PATH`, or their
  absolute paths must be in `SCREENRIG_FFMPEG` and `SCREENRIG_FFPROBE`.
- `doctor` reports the `ffmpeg`, `ffprobe`, `encoder_libx264`,
  `encoder_libx265`, `encoder_libwebp`, and `filter_hdr_tonemap` checks. Use it
  to name the missing part before you ask the user for anything. The default
  encode path needs `libx264`.

A missing or unusable toolchain fails `media upload` alone. It returns a usage
error, not a plugin installation failure. `screen pair`, `browser setup`,
`playlist`, `kv`, `doctor`, and every other command keep working, so do not
reinstall the plugin and do not stop the wider task. Any failed check makes
`doctor` itself exit non-zero, so read the individual check names before you
call the installation unhealthy.

When the toolchain is missing, tell the user which check failed and ask them to
install ffmpeg 6.0 or newer, with `ffmpeg` and `ffprobe` reachable on `PATH`.
Point them at their platform package manager or `https://ffmpeg.org/download.html`.
An `encoder_libx264`, `encoder_libx265`, or `encoder_libwebp` failure means the
installed ffmpeg build lacks that encoder, so the user needs a build that
includes it. Do not install software on the user's computer without their
explicit request. `--no-transcode` is the escape hatch: it skips conversion
entirely and uploads the source file unchanged.

### Codec choice

`media upload` produces an H.264 MP4 by default. Every current browser and
every ScreenRig player decodes it. ScreenRig stores exactly one rendition per
media object, and the layout contract carries no codec parameter, so there is
no fallback. A screen that cannot decode the stored rendition shows nothing
useful.

`--codec hevc` opts in to H.265 for a smaller file at the same quality. Use it
only when every screen that will play the media is a native player
(Qt/GStreamer or Android/MediaCodec). H.265 in a browser depends on platform
hardware decode and is not dependable. Do not re-upload the same file in both
codecs to test it. Ask which screens will play it, then choose once.

### Filenames

Check the filename before you run `media upload`. Do this whether or not
conversion runs. Conversion preserves the source name stem, so a poor name
survives the whole pipeline.

The filename is the human-readable handle for a media object. It is what a
person reads in media listings, playlists, and playback reporting. If every
upload is `video.mp4`, none of those surfaces can tell one item from another.

Treat these as low-information names: a generic stem (`video`, `clip`,
`output`, `untitled`, `final`, `export`, `image`, `photo`); a camera or phone
default (`IMG_1234.jpg`, `DSC_0001.jpg`, `VID_20240101_120000.mp4`,
`GX010001.mp4`); a screen-recording default; a bare number or bare date; a
one- or two-character stem; or a name that is only counters and noise
(`final2`, `copy`, `v1`, `video (1)`).

Ask the user for a distinctive name before uploading. Suggest one drawn from
what the media actually shows and where it will play, for example
`lobby-welcome-loop.mp4` or `store-hours-winter-2026.png`. Offer it as a
suggestion. The user decides. If they keep the original name, upload it. Do
not rename the user's file on disk, and do not silently substitute a different
name in the upload.

Ask once per file. Do not re-prompt or re-upload to fix a name the user
already accepted.

The CLI is a backstop, not the prompt. It cannot ask anything, because it is
noninteractive. When a low-information name reaches it, it adds an advisory
warning with code `generic_filename` to the envelope `warnings[]` array and
still completes the upload successfully. Seeing that warning in a result means
the asking step was missed; surface it to the user rather than retrying the
upload.

## Credential removal

Run `auth revoke --yes` only when the user explicitly accepts permanent loss
of CLI access to the current anonymous account. Revocation is server-first: the CLI sends the stored bearer
to the server's credential-revocation operation first. Only an empty `204`
response with the required private no-store policy permits atomic local
removal of the credential, enrollment state, and transient authenticated-operation
state. Non-secret API configuration remains. The account, screens,
and content remain, no replacement credential is issued, and the next
account-scoped command enrolls a separate new account.

On a failed or ambiguous response, the CLI retains the exact local state.
Retry `auth revoke --yes`; the revocation endpoint alone accepts the same
cryptographically valid already-revoked bearer for an idempotent `204`, so a
server-success/local-cleanup interruption can be repaired safely. Do not delete
the config first, do not add an idempotency key, and do not describe revocation
as account deletion or credential rotation.

## Feedback

`feedback bug`, `feedback feature`, and `feedback list` record and read this
account's own submissions. The kind comes from the route. Never put `kind`
in the request body. Submissions are immutable: do not invent an update or
delete command. A correction is a new submission.

```bash
"$SR" --json feedback bug "Playlist stalls after pairing" \
  --body-file ./report.md --command "screen pair"
"$SR" --json feedback feature "Add a dry-run flag" --body "Preview a change first."
"$SR" --json feedback list [--kind bug|feature]
```

`--body` is inline text. `--body-file` reads a file. A title is at most 120
characters and a body is at most 4000. `--command` is the command the
feedback is about. It accepts a command path only, as up to four lowercase
words such as `media upload`. Validate it exactly as supplied. Never build
it from raw argv, and never lowercase it first. `--no-context` omits the
closed diagnostic envelope. That envelope holds only `cli_version`,
optional `command`, and `platform`. Do not invent a member.

Do not scrub title or body on the client. The server rejects recognizable
ScreenRig credential material. Render its problem and `errors[]` so the
operator can rewrite and resend. Writes carry `Idempotency-Key`. An exact
retry returns the original submission for twenty-four hours. A different
body under the same key is `idempotency_mismatch`. A 429 surfaces
`Retry-After` as `retry_after_seconds`. Probe support through
`capabilities.features.feedback`; `doctor` reports that check.

## Credits

The control-plane meter is 1 credit per billed authenticated command and 1
credit per billed account-stream event. Remaining is a whole integer credit
count. Read it from `data.credit_remaining` on `account show`, or from the
warning message. Remaining below 1 credit is `payment_required` (HTTP 402).

Use `--json`. Branch on `ok`, `error.status`, `error.code`, and
`warnings[].code`.

- `warnings[].code === "credits_low"`: remaining is below 1000 credits. The
  warning message includes the integer remaining. Surface remaining to the
  user. Do not retry the same billed command as a fix. Do not invent a pay
  command.
- `error.code === "payment_required"` or `error.status === 402`: remaining is
  below 1 credit. Billed commands are rejected. `error.next` points at
  `screenrig --json account show`. Stop; do not spin. A 402 envelope may also
  include `credits_low` in `warnings[]` when remaining is present and below
  1000.

These commands do not debit the 1-credit API meter, so they still work when
remaining is 0:

- `account show`
- `auth revoke --yes`
- `screen toast`
- `screen screenshot` (request, status poll, and WebP download)
- `compose catalog`
- `compose render`

Exempt listen-stream events (not billed after subscribe): `screen.*`,
`runtime.*`, `application.event`, and heartbeats.

Billed: other authenticated control-plane commands, including media, playlist,
app, kv, comment, playback, feedback, operations, screen pair/update/assign, and
`events list`. Opening `events follow` costs 1 credit as the listen
subscribe. Later billed events on that stream cost 1 credit each
(`playlist.*`, `media.*`, `kv.*`, `application.published`, `operation.*`,
`account.*`, `feedback.*`, `stream.cursor`, `stream.resync_required`).
Reconnect replay is free.

v1 does not collect money in this CLI. There is no pay command.

## Commands

```text
account show
auth status
auth revoke --yes
app pack <directory> [--output FILE]
app upload <directory> [--name NAME] [--no-wait] [--poll-ms MS]
app list
app show <id>
media upload <file> [--content-type TYPE] [--tag TAG] [--no-wait] [--poll-ms MS]
                    [--no-transcode] [--codec h264|hevc] [--max-fps N]
                    [--max-edge PIXELS] [--webp-quality 1-100] [--no-progress]
media show <id>
media list [--tag TAG] [--kind image|video]
media update <id> (--tag TAG | --clear-tag) --if-match REVISION
media delete <id> --if-match REVISION
compose catalog
compose render <file> [--output FILE] [--open]
playlist templates
playlist create <file>
playlist update <id> <file> --if-match REVISION
playlist show <id>
playlist list
playlist delete <id> --if-match REVISION
screen pair CODE [--label LABEL]
screen provision (--open | --print-url) [--label LABEL]
browser setup --code CODE [--open]
screen update <id> [--name NAME] [--playlist-id ID] [--timezone ZONE]
                   --if-match REVISION
screen list [--state archived]
screen show <id>
screen assign <id> --playlist-id ID --if-match REVISION
screen set-timezone <id> --timezone ZONE --if-match REVISION
screen archive <id> --if-match REVISION
screen unarchive <id> --if-match REVISION
screen delete <id> --if-match REVISION
screen rotate-public-id <id> --if-match REVISION
screen toast <id> --level error|alert|info --text TEXT [--duration-ms MS]
screen screenshot <id> [--output FILE] [--timeout MS] [--poll-ms MS]
kv get --application-id ID <key>
kv set --application-id ID <key> --json-value JSON [--if-match REVISION]
kv set --application-id ID <key> --file FILE --content-type TYPE [--if-match REVISION]
kv set --application-id ID <key> --value-base64 BASE64 --content-type TYPE [--if-match REVISION]
kv delete --application-id ID <key> --if-match REVISION
kv list --application-id ID
comment show screen <id>
comment show playlist <id> [--page PAGE_ID]
comment set screen <id> (--json-value JSON | --file FILE)
comment set playlist <id> [--page PAGE_ID] (--json-value JSON | --file FILE)
comment delete screen <id>
comment delete playlist <id> [--page PAGE_ID]
operations get <id>
operations wait <id> [--timeout MS] [--poll-ms MS]
operations cancel <id>
events list [--after CURSOR] [--limit N]
events follow [--after CURSOR] [--timeout MS]
playback list [--screen-id ID] [--media-id ID] [--day YYYY-MM-DD]
feedback bug <title> (--body TEXT | --body-file FILE)
                     [--command "GROUP ACTION"] [--no-context]
feedback feature <title> (--body TEXT | --body-file FILE)
                     [--command "GROUP ACTION"] [--no-context]
feedback list [--kind bug|feature]
doctor [--repair-config]
version
```

Human `events list` and `events follow` print one logfmt line per event:
`at=... type=... severity=...` plus scalar `details`. Human logfmt omits
canned server sentences. An `application.event` or `runtime.reported` with
no remaining data is silent.

`--json events list` is one JSON page envelope. `--json events follow` is
a JSON stream of envelopes. After redaction, `--json` may still include a
server `message` field when it is data.

`events follow` reconnects on disconnect or a transient failure, with
backoff, and resumes from the last SSE id via `--after`. `--timeout`
ends the whole follow, including backoff; 401, 403, 404, and other
non-transient 4xx problems stop the command.

`screen list` omits archived screens. `screen list --state archived` lists
archived screens only. `screen show <id>` still returns an archived row.
`screen archive <id> --if-match REVISION` hides the screen and darkens the
glass. It does not unbind the player. `screen unarchive` restores it to the
default list. `screen delete` is not a de-associate; it returns
`screen_archive_required`. There is no account unbind. Do not call
`screen revoke-credential`; that path is retired, and the CLI names
`screen archive` instead. Archive, unarchive, and this list filter are
**source-ready** working-tree CLI behavior. They are not in the locked
plugin bundle, not marketplace, and not deployed.

Comments are the agent's own structured JSON object on a screen, a playlist,
or one playlist page. Compact UTF-8 of that object is at most 1 KiB. The
value must be an object, not an array or scalar. ScreenRig does not read or
use it, never sends it to players, and never treats it as authorization. It
is not on the runtime manifest and does not bump revision.

```bash
"$SR" --json comment set screen scr_EXAMPLE --json-value '{"note":"lobby hours"}'
"$SR" --json comment show screen scr_EXAMPLE
"$SR" --json comment set playlist pl_EXAMPLE --page poster --file ./note.json
"$SR" --json comment delete screen scr_EXAMPLE
```

`--json-value` is a JSON object. `--file` reads a JSON object from disk.
Exactly one of those on set. Last write wins; do not send `--if-match`.
Unset show is `{ "comments": null }`. `screen show` and `playlist show`
include `comments` when the server sends it; do not strip it. Do not put
comments on playlist create/update JSON; those writes cannot set it. Human
HTTP paths such as `comment/screen/:id` are not CLI commands. Comment
commands are **source-ready** working-tree CLI behavior. They are not in
the locked plugin bundle, not marketplace, and not deployed. Do not
hand-edit `plugins/screenrig/` to teach them.

`screen screenshot <id>` is in v1. It blocks until a still WebP is on disk.
The default path is `./<id>.webp`. `--timeout` defaults to 35000 ms and
`--poll-ms` defaults to 500 ms. There is no `--no-wait`. Do not print
pixels.

`compose catalog` and `compose render` run locally. They do not enroll and
they do not debit. See "Local compose" below.

`screen show <id>` prints the GET screen JSON. After a player reports a
playback surface, the body may include optional `observation`: `observed_at`
and `surfaces`. Each surface has `id`, `width`, `height`, `pixel_ratio`, and
`presentation` (`output` or `windowed`). The field is read-only. `screen
update` cannot send it. Absence means no player has reported a surface yet.
Do not treat it as a meter. Do not invent extra surfaces.

The same GET always includes `online`. It is true while a paired player is
connected, including a short reconnect window, and false until the first
connect. Optional `last_online_at` and `last_ip` appear after that first
connect. When the screen is offline, `last_online_at` is the last time it was
online. Absence of those two fields means the player has never connected.
They are read-only. `screen update` cannot send them. Do not treat them as a
meter. Do not invent a heartbeat.

`playback list` returns daily playback aggregates for this account. One
row per screen, media, and UTC day. Newest days first. `--screen-id`,
`--media-id`, and `--day YYYY-MM-DD` filter the caller's own rows.

Use the same `screen pair CODE` flow for first use and recovery. Application upload
accepts one already-built static directory with a root `index.html`; see "Putting a
web app on a screen" for the whole path from that directory to a running screen.
Optional `--name` (at most 120 characters) sets the application name header.
Media upload keeps the signed transfer private and returns metadata only; see "Media
uploads and the ffmpeg toolchain" before the first upload of a session. Application
K/V is binary-safe; use exactly one value mode.

## Local compose

Write JSON, render a PNG, look at that PNG, iterate. Compose is not billed.

```bash
"$SR" --json compose catalog
"$SR" --json compose render ./spec.json --output ./still.png
# agent reads ./still.png with vision; do not cat pixels into chat
# iterate the JSON and re-render
"$SR" --json media upload ./still.png
# playlist page: one image placement, rect = canvas, content_fit fill
```

`compose catalog` prints the fail-closed node catalog: types
`Frame`/`Column`/`Row`/`Box`/`Spacer`/`Text`/`Image`, roles
`display|title|body|caption|label`, spaces `xs|s|m|l|xl`, pins
`top|bottom|left|right`. Do not author `x`/`y` except on the Frame canvas.
Do not author `fontSize`. Optional Text `textShadow` is `{ x, y, blur?, color }`
in px; omit it to paint without a shadow. `Image.src` is a local filesystem
path relative to the spec file. The CLI does not fetch URLs. The envelope is
structured JSON, not pixels.

`compose render` writes a PNG and `<output>.layout.json`. Default `--output`
replaces a `.json` suffix with `.png`, or appends `.png`. Never print PNG
bytes, pixels, or image data. `--open` opens the local PNG path on this
computer only when the user asked to view the still here. Agent vision uses
the file path, not `--open`.

## Playlist writes

A page is one of two shapes. Do not mix `template` and `placements` on the
same page.

Wire placement families are three: static (`image`), motion (`video`), and
web (`iframe`, `application`). Do not author native `text`, `box`, or `line`
on the wire. Compose copy and chrome locally, upload the still as `image`,
and place that image.

### Full page

A full page is `id`, `canvas`, `transition`, `advance`, optional `visibility`,
and `placements`. Image and video placements write a `selector`. Do not put
`media_id` on the content object. Do not send server-resolved `items`. Advance
with `media_end`, never `video_end`.

`canvas.background` is a solid uppercase `#RRGGBBAA` or a top-to-bottom
linear gradient. The gradient is `{ "type": "linear", "stops": [...] }` with
2 through 8 stops, strictly increasing `at` in `[0, 1]`, first `at` 0, last
`at` 1, and no angle field. A solid string stays valid.

Selector `by` values:

- `id`: one ready `media_id`. `one_at_a_time` must be false.
- `ids`: 1–32 unique ready IDs.
- `all`: every ready object of that placement kind.
- `tag`: ready objects of that kind whose tag matches `^[A-Za-z0-9]{1,32}$`.

`media_end` is valid only on a page with exactly one image or video placement.
Video `loop` must be false. An image on `media_end` requires `dwell_ms`.
`dwell_ms` is rejected on duration and application pages.

```json
{
  "name": "Lobby loop",
  "pages": [
    {
      "id": "poster",
      "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
      "transition": { "type": "crossfade", "duration_ms": 200 },
      "advance": { "mode": "duration", "after_ms": 8000 },
      "placements": [
        {
          "id": "hero",
          "content": {
            "type": "image",
            "selector": { "by": "id", "media_id": "med_01EXAMPLEIMAGE0000000000" },
            "alt": "Lobby poster"
          },
          "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
          "layer": 0,
          "content_fit": "contain"
        }
      ]
    },
    {
      "id": "clip",
      "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
      "transition": { "type": "crossfade", "duration_ms": 200 },
      "advance": { "mode": "media_end" },
      "placements": [
        {
          "id": "feature",
          "content": {
            "type": "video",
            "selector": { "by": "id", "media_id": "med_01EXAMPLEVIDEO0000000000" },
            "muted": true,
            "loop": false
          },
          "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
          "layer": 0,
          "content_fit": "contain"
        }
      ]
    }
  ]
}
```

Use the `media_id` returned by `media upload`. Do not invent one.

For `application` and `iframe` placements, and for the `application` advance
mode, write a full page and follow "Putting a web app on a screen" below.

### Page motion

These are playlist document fields the CLI sends. Do not claim they are
already live on production.

Default pages: `transition` is `{ "type": "crossfade", "duration_ms": 200 }`.
Do not put `enter` on placements.

Use swipe types and placement `enter` sparingly, for emphasis or a particular
style, not on every page.

`transition.type` is `crossfade`, `swipe-left`, `swipe-right`, `swipe-up`, or
`swipe-down`. `duration_ms` is required and runs from 0 through 60000. When
you choose a swipe type, write `duration_ms: 600`. That is the authoring
default for swipe, not a schema default. Template expansion still fills an
omitted transition with crossfade 200 ms.

Swipe is the incoming page's type. The outgoing page follows so the edges
stay touching. The name is motion direction: `swipe-left` moves content
left.

Optional placement `enter` is `{ "type": "..." }` with that same object name
on playlist JSON. There is no snake_case rename inside it. Types: `fade-up`,
`fade-down`, `fade-left`, `fade-right`, `fade-in`, `zoom-in`, `zoom-out`.
Absent means no object animation.

If you want object animation, layer the content. Put the motion on the
top-layer text or images. Do not animate every placement.

Object enter starts invisible. It runs 500 ms after the page occupies the
full viewport, for 400 ms. Those delays are contract constants, not author
fields and not CLI flags. Do not send duration or delay inside `enter`.

Swipe types and placement `enter` are **source-ready** working-tree CLI
behavior. They are not in the locked plugin bundle, not marketplace, and not
deployed. Do not hand-edit `plugins/screenrig/` to teach them.

### Templated page

Do not emit native `text`, `box`, or `line` through templates. Slide layouts
with copy or chrome are composed locally, uploaded as `image`, then placed
as one image. See "Local compose".

```bash
"$SR" --json compose catalog
"$SR" --json playlist templates
```

`playlist templates` is a local catalog of slide ids. Templates that would
emit vector chrome fail with `usage_error` pointing at `compose catalog`
and `compose render`. Do not silently rasterize and upload. Picture-only
templates (`slide-full-bleed`, and `slide-photo` without a caption) still
expand to image or video placements with selectors. A `logo` slot is image
only; video is a `usage_error`.

Allowed keys on a templated page: `id`, `template`, `slots`, optional
`canvas.background` only, optional `text_color`, optional `transition`,
optional `advance`, optional `visibility`. Any other page key is a
`usage_error`. `canvas.width`, `canvas.height`, and `canvas.viewport_fit` on
a templated page are a `usage_error`.

Wire families:

- static: `image`
- motion: `video`
- web: `iframe`, `application`

Looking at the screen stays the only proof of layout. Do not claim a
template is hardware-validated.

## Page scheduling with visibility

A page may carry an optional `visibility` object that limits when the page
plays. It is a sibling of `advance`: both describe playback, not geometry.
Nothing about `visibility` belongs inside `canvas`, `rect`, or a placement.

Read these two rules before authoring any schedule. Breaking either one is
rejected, and the second rejection is the one that surprises people.

- **Every playlist must keep at least one page with no `visibility` field at
  all.** That page is what guarantees the screen always has something eligible
  to show. A page whose only rule is `enabled: false` does **not** satisfy this.
  Neither does a page whose window happens to be open right now. The server
  counts pages where the key is absent, so an always-visible page omits
  `visibility` entirely.
- **A screen running a scheduled playlist must have a timezone.** See "Screen
  timezone" below.

### The field

```json
{
  "id": "after-hours",
  "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
  "transition": { "type": "crossfade", "duration_ms": 200 },
  "advance": { "mode": "duration", "after_ms": 8000 },
  "visibility": {
    "enabled": true,
    "from": "2026-09-01T00:00",
    "until": "2026-12-31T23:59",
    "windows": [
      { "days": ["mon", "tue", "wed", "thu"], "start": "09:00", "end": "17:00" },
      { "days": ["fri"], "start": "22:00", "end": "02:00" },
      { "days": ["sun"] }
    ]
  },
  "placements": []
}
```

- `enabled` is required and boolean. `false` hides the page unconditionally.
- `from` and `until` are optional civil bounds, `YYYY-MM-DDTHH:MM`, minute
  precision, **no offset and no zone suffix**. `from` is inclusive, `until` is
  exclusive. When both are present, `from` must be strictly earlier than
  `until`.
- `windows` is an optional array of 1 to 16 recurring windows.
- `days` is 1 to 7 unique values from `mon`, `tue`, `wed`, `thu`, `fri`, `sat`,
  `sun`. The server stores them in mon-to-sun order, so a reordered array is the
  same set and does not remint the manifest.
- `start` and `end` are civil `HH:MM`. Set both or omit both. Omitting both
  selects the **whole day**, as `{"days": ["sun"]}` above does.

### Semantics

A page is eligible when **all** of the following hold:

1. `enabled` is `true`.
2. The current civil time is inside `[from, until)`. Each bound is optional.
3. `windows` is absent, **or** at least one window matches.

A window matches when the current civil day of week is in `days` and, if `start`
and `end` are present, the civil time is in `[start, end)`.

**An overnight window is written `end` at or before `start`, and the start day
owns it.** `{"days": ["fri"], "start": "22:00", "end": "02:00"}` runs Friday
22:00 through Saturday 02:00. It does **not** start again on Saturday evening.
To cover both nights, list both days. Equal edges are the degenerate case: a
full 24 hours from `start`.

The player evaluates these rules against the screen's timezone; the server never
does. So a schedule boundary does not remint the manifest and does not restart
the screen. Scheduling only hides pages, and a broken clock must not hide
content: `enabled: false` needs no clock and always applies, while every
clock-dependent rule fails visible.

### Screen timezone

The rules are civil times, so they are meaningless without a zone. The zone
lives on the screen, not on the playlist.

```bash
"$SR" --json screen set-timezone scr_EXAMPLE --timezone America/Los_Angeles --if-match 3
```

`--timezone` is an IANA identifier such as `America/Los_Angeles` or
`Europe/Berlin`. The server validates it against an embedded zone database, so a
name it does not know is rejected. A screen has no timezone until one is set,
and a patch never clears one. `screen update` accepts the same `--timezone`, so
one call can set the zone and assign the playlist together. Changing the zone
remints the manifest revision. Take `--if-match` from the screen's current
`revision`.

**Set the timezone before assigning a scheduled playlist.** The CLI checks this
locally on `screen assign`, `screen update --playlist-id`, and `playlist
update`, and refuses with a `usage_error` naming the screen and the exact
`screen set-timezone` command to run. Nothing is sent to the server when it
refuses, so no revision is consumed. The server enforces the same rule on
assignment, on playlist update, and when it resolves the manifest.

### When a schedule is rejected

- `invalid_request` naming `pages`, saying at least one page must have no
  visibility rule: every page carries `visibility`. Remove the field from the
  page that should always be eligible.
- `invalid_request` naming `.visibility`, saying it must bound visibility: a
  page set `enabled: true` and gave no `from`, `until`, or `windows`. That is a
  no-op. An always-visible page omits `visibility` entirely.
- `invalid_request` naming `.visibility.until`: `until` is not later than
  `from`.
- `invalid_request` naming `.visibility.windows[N]`: `start` and `end` were not
  set together, or a time is not civil `HH:MM`.
- `invalid_request` naming `timezone`: the screen has no timezone, or the
  identifier is not in the zone database. Run `screen set-timezone` with a real
  IANA name.

## Putting a web app on a screen

This is the whole path from a built static directory to a running interactive
app. Every step below is a real command against the bundled CLI.

### 1. Upload the app and read its release id

`app upload` takes one already-built static directory with a root `index.html`.
It packs the directory itself, so run `app pack` only when you want to inspect
the archive first. The packer injects the ScreenRig browser SDK at
`_screenrig/runtime.js` and adds its script tag to `index.html`, so the app
reaches `window.screenrig` at runtime with no build step and no dependency to
install.

```bash
"$SR" --json app upload ./lobby-board --name "Lobby board"
```

`app upload` waits for the publication operation by default. Read three fields
from the envelope:

- `data.operation.state` is `succeeded`.
- `data.application.release_id` is the `rel_...` release id. This is the only
  value a playlist placement needs. It is always present, because the upload is
  attributed to a release the moment it is accepted.
- `data.application.id` is the `app_...` application id. `kv` commands take this
  one; a playlist placement never does.

Knowing the release id is not the same as the release being usable. A succeeded
publication operation is what means the release is ready to reference. Do not
poll `app list` or `app show` to decide readiness. With `--no-wait` the release
id is already in the envelope, but the operation has not finished, so run
`operations wait <operation_id>` before pinning it into a playlist.

An application carries no state of its own; publish state lives on the operation
and on the release. `app show` reports `latest_ready_release`, which is absent
until a first publish reaches ready.

Every `app upload` creates a new application and a new release. There is no
in-place update and no way to add a release to an existing application. A
re-upload therefore has a different `application_id`, so it does not inherit the
earlier app's K/V, and a different `release_id`, so a playlist keeps serving the
release it already pins until you `playlist update` it.

### 2. Write the application placement

An `application` placement pins exactly one release:

```json
{
  "id": "board",
  "content": { "type": "application", "release_id": "rel_01EXAMPLERELEASE00000000" },
  "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
  "layer": 0,
  "content_fit": "fill",
  "controller": true
}
```

- `content.release_id` is required and comes from step 1. `content.application_id`
  is an optional ownership assertion the server checks against the release;
  omit it.
- `rect` is in the page's canvas coordinates, not screen pixels and not
  percentages. The example fills a 1920x1080 canvas. A right-hand half panel on
  that canvas is `{ "x": 960, "y": 0, "width": 960, "height": 1080 }`.
- `content_fit` must be `fill` for `application` and `iframe`. Both have no
  intrinsic size, so the server rejects `contain` and `cover`. Size and place
  them with `rect` alone.
- `layer` runs from 0 through 1024, and a higher layer draws on top. Placements
  sharing a layer tie-break by their order in the `placements` array.
- `controller` belongs to step 3. Omit it, or set it to `false`, on any page
  that does not use `application` advance.

`iframe` is the same placement shape for a public HTTPS page you do not own.
Its `content` is `{ "type": "iframe", "src": "https://...", "title": "..." }`,
`src` must be a public `https://` URL without credentials, `title` is 1 to 200
characters, and `content_fit` is `fill`. An `iframe` can never be a controller.

### 3. Choose how the page advances

The app decides which mode fits, not the playlist author.

Use `duration` when the app renders a view and never signals that it is
finished:

```json
{ "mode": "duration", "after_ms": 15000 }
```

Use `application` when the app calls `window.screenrig.nextPage()` to end its
own turn:

```json
{ "mode": "application", "max_ms": 60000 }
```

On an `application` page:

- `max_ms` is required and runs from 1000 through 86400000. It is a backstop,
  not a duration: the page advances at `max_ms` only if the app never calls
  `nextPage()`. An app that always calls it never reaches `max_ms`.
- Exactly one placement must carry `controller: true`, and it must be an
  `application` placement. The server rejects a page with none and a page with
  more than one.
- Only the controller placement receives the `page.advance` capability.
  `nextPage()` from any other placement rejects with `capability_denied`.
  Non-controller `application` placements on the same page still render, read
  and write K/V, and emit events.
- `nextPage()` is one-shot per activation. A second call in the same activation
  does nothing.
- `controller` is forbidden whenever the mode is not `application`.

`media_end` forbids `application` and `iframe` placements on that page outright.
Do not mix them.

On any `duration` or `application` page, `dwell_ms` is forbidden on image
placements, and a media selector that resolves more than one object must set
`one_at_a_time` to `true`.

### 4. Create the playlist and assign it to a screen

```json
{
  "name": "Lobby board",
  "pages": [
    {
      "id": "board",
      "canvas": { "width": 1920, "height": 1080, "viewport_fit": "contain", "background": "#000000FF" },
      "transition": { "type": "crossfade", "duration_ms": 200 },
      "advance": { "mode": "application", "max_ms": 60000 },
      "placements": [
        {
          "id": "board",
          "content": { "type": "application", "release_id": "rel_01EXAMPLERELEASE00000000" },
          "rect": { "x": 0, "y": 0, "width": 1920, "height": 1080 },
          "layer": 0,
          "content_fit": "fill",
          "controller": true
        }
      ]
    }
  ]
}
```

```bash
"$SR" --json playlist create ./lobby-board.json
"$SR" --json screen list
"$SR" --json screen assign scr_EXAMPLE --playlist-id pl_EXAMPLE --if-match 3
```

Take `--playlist-id` from `data.id` of the `playlist create` result. Take
`--if-match` from the screen's current `revision`, which both `screen list` and
`screen show` return.

### 5. Verify the result

`playlist create` returning `ok` proves the server accepted the page and
resolved the release. It does not prove the app rendered.

- `screen show <id>` confirms the screen carries the intended `playlist_id`.
  Optional `observation` is player-reported and read-only when present.
- `events list` reports what the account did and what the fleet did. A published
  release appends `application.published`. An app that calls
  `screenrig.emit(code)` appends its own event, which is the most direct
  evidence that the app ran on a screen.
- `screen toast <id> --level info --text "..."` puts a visible marker on the
  stage and confirms the screen is live and reachable.
- Looking at the screen stays the only proof of layout and rendering. Ask the
  user to confirm what they see.

### When it is rejected

- `resource_conflict` on `playlist create` or `playlist update`: the
  `release_id` is not an owned ready release. Re-read
  `data.application.release_id` and confirm the upload operation succeeded.
- `invalid_request` naming `.content_fit`: an `application` or `iframe`
  placement used `contain` or `cover`. Use `fill`.
- `invalid_request` naming `.placements` or `.controller`: the page's controller
  count does not match its advance mode. Application advance needs exactly one
  controller application, and every other mode needs none.
- `revision_conflict` on `screen assign`: refetch the screen, take the returned
  `revision`, and retry.
- `usage_error` on `screen assign` saying the screen has no timezone: the
  playlist schedules pages. Run the `screen set-timezone` command the error
  names, then assign. See "Page scheduling with visibility".

`screen toast` posts one transient stage-chrome message to a named screen. It is
not a placement: it occupies no canvas slot, has no layer, and is not part of
readiness or crossfade. `--level` is `error`, `alert`, or `info`. `--text` is 1
to 120 characters, line feed only, and at most three lines. `--duration-ms` is
optional and must be between 2000 and 60000 when supplied; omitted values
default to 10000 on the server. Latest-wins: there is no queue and no cancel
command. The accepted envelope is `{ expires_at }` only; do not expect the text
back, and do not put credentials or other secret material in the text. Level
colours are player chrome and are not API fields.

On `revision_conflict`, fetch the resource, reapply the intended change, and
retry with the returned revision. On an ambiguous transport failure, reuse the
same idempotency key. On `stream.resync_required`, refetch authoritative state
and resume from the supplied cursor. Run `doctor --json` for local diagnostics;
use `doctor --repair-config --json` only to repair an existing credential file
whose permissions are too broad.
