---
name: screenrig
description: Operate screenRIG screens and advertising with the bundled CLI. Use to upload or generate media, compose slides, publish applications and playlists, assign content, verify playback, place adslot breaks, and buy or manage ad campaigns or sell ad inventory.
---

# Operate screenRIG

Use the official plugin's bundled CLI to enroll a project, prepare and publish
signage content to the intended Player, and buy or sell advertising where the
project is permitted to. The customer installs a Player on the screen device
from [Downloads](https://screenrig.ai/downloads/) (Android:
[Google Play](https://play.google.com/store/apps/details?id=ai.screenrig.player); Linux and Raspberry Pi:
`curl -fsSL https://screenrig.ai/linux/install.sh | sh`; any browser:
https://play.screenrig.ai). Setup detail is in
[Player setup](https://screenrig.ai/docs/players.md).

Resolve the project's capabilities and the requested intent before any operation;
the section below is the only branch that needs a screenRIG screen.

## Prepare the installation

Node.js 22.11 or newer is required. Resolve the installed plugin root and put its
launcher on this shell's PATH. Never substitute a global or source-checkout binary.

```bash
SCREENRIG_PLUGIN_ROOT="${GROK_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}}"
if [ -n "$SCREENRIG_PLUGIN_ROOT" ]; then
  PATH="$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts:$PATH"
  screenrig version
fi
```

If the root is empty, use the runtime's plugin list to find the enabled
`screenrig@screenrig` installation. Read [installation and updates](references/installation.md)
for exact lookup, official install commands, and update recovery. Installation
must respect the user's authorization and the runtime's approval policy.

Require a successful version envelope, then run:

```bash
screenrig-plugin-freshness --json
screenrig doctor
```

Use `screenrig status` to check current production service availability before
investigating a service failure. It reads the independent monitor without project
credentials and reports stale observations as unknown. `screenrig status --environment stage`
checks stage. Degraded or down explains a service-wide
condition; keep the monitor's observation time in any diagnosis.

For freshness, `keep` means continue, `refresh` means update the plugin using the
installation reference, `continue_installed` means continue with the installed
copy and disclose that the published version could not be checked, and
`not_installed` means the helper is not inside an installed plugin, so continue
without refreshing.

Read doctor's individual checks. A missing token is a warning, not a broken
installation. Missing media tools affect upload; see [media](references/media.md).

## First run: enroll a new project

On first setup, enroll. It is the only first-run path, and it always creates a
new project, even when the contact email already signs in to another screenRIG
project. Do not run `agent connect`, open the dashboard, or ask the human to
approve, sign in or claim anything.

Authenticated commands never create a project as a side effect; they fail with
`not_enrolled`, and doctor warns about the missing token. Then:

1. Propose a project name, confirm it with the user, and ask for their contact
   email.
2. Enroll:

   ```bash
   screenrig agent enroll --email ADDRESS --project-name NAME
   ```

3. Tell the user the server is emailing that address a member invitation for
   their dashboard login. Nothing waits on it: do not generate an invitation
   link or send them to the dashboard. Go straight on to pairing and content.

An already enrolled installation reuses its project. If the work is explicitly
advertising rather than signage, add `--intent advertising`: that project buys
ads and does not pair devices or author playlists.

Every first-run problem still ends in enrollment:

- Enroll reports a pending existing-project connection the user did not ask
  for: `screenrig agent enroll --force --email ADDRESS` discards it and enrolls.
- The server rejects the stored credential (`unauthorized`): this
  installation's project is gone. Clear it and enroll:

  ```bash
  screenrig agent disconnect --yes
  screenrig agent enroll --email ADDRESS --project-name NAME
  ```

- A `next` step, hint or doctor path names `agent connect` or the dashboard:
  do not follow it on first setup.

Consult `screenrig --help` for the installed command's arguments. Never ask the
user to paste a project bearer into the conversation or command line.

### Join an existing project (only on explicit request)

Use `agent connect` only when the user explicitly says this installation should
join a screenRIG project that already exists, for example "connect to our
existing Acme project". An email that already has a screenRIG login, an existing
dashboard, or a CLI message mentioning `agent connect` is not that request.

Connection returns promptly by default; a pending success is not active access.
The human approves in their dashboard. Follow `data.next.argv` after approval and
require `data.connection_complete: true`. See
[connection behavior](references/commands.md#connect-an-existing-project).

Agent credentials have their own capabilities, separate from project feature
entitlements: `screens`, `content`, `playlists`, `advertising`, `reports`, and
`project`. Enrollment grants the first agent all six. Connecting an existing
project requests all six unless you repeat `--capability` for only the areas
this installation needs. For an ad buyer using existing creative:

```bash
screenrig agent connect --capability advertising --print-url
```

If this buyer also uploads media, request `--capability content` as well.
Screen publishing commonly needs `screens`, `content`, and `playlists`.
`reports` permits area reads and is required for events and playback reporting.
`project` permits project administration, webhooks, invitations, billing and
browser-link claims. Basic project, current-agent and operation-status reads
remain available to any active credential.

The human can approve a non-empty subset of the request in the dashboard.
Resume the same pending request without changing its capabilities, then run
`screenrig agent status` to read the granted `agent.capabilities`. Check these
alongside `screenrig project capabilities`; project features do not grant agent
permissions.

### Credential-scope refusals

HTTP 403 `forbidden` with `This agent credential lacks the <name> capability.`
is a credential-scope refusal, not a billing or transient failure. Stop the
denied operation and explain the missing permission. Capabilities are immutable:
with the user's authorization, connect a new agent requesting the required
capability (repeat for every permission needed), using a separate private
`--config` path. Obtain dashboard approval, verify the new agent, then disconnect
the old one. Follow the CLI's `error.next` guidance; never retry through another
route, paste a credential, or silently request broader access.

### Capability and intent dispatch (before any screen operation)

1. Resolve the official installed plugin and CLI, then verify version, freshness,
   and doctor as above.
2. Enroll (see [First run](#first-run-enroll-a-new-project)). Connect only a
   project the user explicitly asked to join.
3. Read the authenticated project ID, plan, feature flags, feature revision, and
   the server's effective capabilities. Never infer permission from a screen
   quota of zero, a plan name, a dashboard label, or which commands exist.

   ```bash
   screenrig project capabilities
   ```

4. Classify the request: buying ads, selling inventory, ordinary signage, or
   financial administration. One project may hold both the advertising and
   screens features and support both ad roles. If intent is materially ambiguous,
   ask about the task, never for a token or credential.
5. Load the matching reference and run only capability-permitted operations:
   signage follows [playlists](references/playlists.md) and
   [operations](references/operations.md); buying and selling follow
   [advertising](references/advertising.md). An advertiser workflow has no screen
   pairing, playlist creation, or screenshot prerequisite.
6. Respect a server denial even when cached capabilities suggested permission.
   Refresh capability state for diagnosis; do not retry through another API,
   enroll another project, or change the plan to bypass a restriction.

### The human's dashboard, invitations, and sign-in reset

The dashboard is where the human signs in with their own login — a passkey or a
password — and switches between their projects. `screenrig dashboard open`
opens the dashboard origin for them.

Members join this project by email invitation, and advertising buyers are
invited by email with an explicit inventory scope and review policy:

```bash
screenrig invitations create --email ADDRESS[,ADDRESS]
screenrig invitations create --kind ad-buyer --email ADDRESS[,ADDRESS] --screen-id ID --slot-id ID
```

Email delivery is requested, not proof of arrival; the server emails each
recipient. A link invitation (`invitations create --email ADDRESS --link`) is
an exception, never part of enrollment or setup: use it only when the person
never used their emailed invitation and later asks to get into the dashboard.
Print it once and deliver it only to that person, never elsewhere. If the human
has signed in before and cannot now,
`screenrig dashboard reset-sign-in --email ADDRESS` requests emailed
sign-in instructions; the acknowledgment is neutral whether or not the address
is known. Details are in [commands](references/commands.md#invite-people-and-ad-buyers).

### Signage branch: resolve the target screen

After enroll, the Player pairing code is the only glass-side human step. If the
user has no Player yet, send them to https://screenrig.ai/downloads/ for their
device (Android TVs and boxes: https://play.google.com/store/apps/details?id=ai.screenrig.player). When the
Player shows its pairing code, pass it as shown, for example
`screen pair "ABC 234"`; spaces, dashes and case do not matter. Then list screens
and resolve the intended target before a write. A missing screen is not a reason
to assign to another screen or invent an identifier. This branch applies only when
the resolved intent is signage or seller work on owned screens.

```bash
screenrig screen list
screenrig screen show SCREEN_ID
```

Tag each new screen right after pairing, while the human at the display can
confirm its location and role, for example
`screen tag SCREEN_ID --set Lobby,Floor2,Menu`. Tags are 1 to 32 letters or
digits, up to 16 per screen, and select fleets; they are never authorization.

`screen show` reports the display's host details when the Player supplied them
(platform, model, firmware, identifiers). If a screen shows a pending recovery,
a display reporting that screen's identifiers has lost its stored identity and
is asking to reconnect; confirm it with `screen recover SCREEN_ID` only after
checking with the user that it is the same display. Nothing reconnects without
that confirmation.

A display that was reset on the device, or a paired browser that unpaired
itself, leaves its screen archived, not deleted: the screen keeps its playlist,
history and binding. The reset display itself rotates its key (an unpaired
browser loses its cookies) and shows a new pairing code. Before pairing a
display that was already in use, check `screen list --state archived`.
`screen show` reports `archive_reason` (`project`, `device_reset` or
`device_unpair`) and `archived_at` when the server supplies them. Prefer
recovery to pairing it as a new screen: if the archived screen shows
`recovery_pending`, confirm with `screen recover SCREEN_ID` as above, then run
`screen unarchive SCREEN_ID`. Unarchive re-admits the screen's current key, so
a display that still holds it (a dark screen, for example after a `project`
archive) resumes without re-pairing. A display that reset or unpaired no longer
holds that key, so unarchive alone does not bring it back and gives content to
whatever still holds the old key. With no recovery offered, or no archived
match (older servers do not archive on reset), pair the code as a new screen
and leave the old one archived. A `project` archive was a deliberate choice;
ask before undoing it. See [operations](references/operations.md).

## Signage branch: choose the content path

Read the target screen's reported playback surface before choosing aspect ratio.
If it has no observation, ask for the intended orientation or use dimensions the
user supplied. Preserve source facts and supplied brand assets.

| What the page needs | Path | Reference |
| --- | --- | --- |
| Finished image or video | Upload the file. | [Media](references/media.md) |
| Recurring data or reports that need a consistent dashboard image | Use the dashboard skill to preserve schemas and history and render a 4K WebP, then publish it as media. | [Dashboards](../screenrig-dashboard/SKILL.md) |
| Official art plus additional copy | Render one finished still locally, preserving the art, then upload. | [Visual design](references/composition.md) |
| A finished poster, menu, announcement or other presentable still | Generate the whole page with all exact copy in the prompt; inspect before publishing. | [Media](references/media.md) |
| Editable title/body/table slides or a measured grid | Local, unbilled `compose render`. | [Compose](references/compose.md) |
| Playing video, an iframe or an application | Place the live object directly on the playlist. | [Playlists](references/playlists.md), [applications](references/applications.md) |
| Background music or a jingle across pages | Upload the audio, then add it to the playlist soundtrack. | [Playlists](references/playlists.md#soundtrack) |

Generation lays out the artwork and type together. Do not generate a background
and then compose text over it for a finished poster. Animation alone does not
require composition. Supplied finished assets do not need generation.
The first `compose` or `playlist preview` command on a machine downloads the
renderer for that machine from the npm registry once and caches it.

For visual direction and review, read [visual design](references/composition.md).
Keep a campaign consistent and use real supplied facts; label fictional demo facts.

The Linux Player ships for `x86_64` and `aarch64` from
https://screenrig.ai/linux/, including 64-bit Raspberry Pi OS (trixie).
Raspberry Pi 5 decodes HEVC in hardware up to 4K, so upload 4K video for a Pi 5
fleet with `--codec hevc`; H.264 suits 1080p, and Raspberry Pi 4 plays 1080p.
Keep the H.264 default for mixed or unverified fleets: each upload has one
rendition. See [video codec selection](references/media.md) before uploading.

## Signage branch: publish and verify
The five primitives are `image`, `video`, `stream`, `iframe`, and `application`.
Use streaming only with a compatible backend and Player.
Image and video use media selectors; stream, iframe, and application do not.
Streams require an uploaded image fallback and a duration-based page. Apple TV
cannot display iframe or application content. Text and
shapes belong in prepared content, not additional native playlist primitives.
Audio is not a primitive: a playlist-level soundtrack of uploaded MP3 tracks
plays continuously while pages change, and pages may carry an `audio_cue` hint.
Canvas video stays muted, so the soundtrack is the only sound on the screen.

1. Prepare and inspect the content at the intended size. Generation stores its
   returned media ID directly; do not upload it again.
2. For full-screen pages, use `playlist init` with local media files, ready media
   IDs, pinned application releases, or HTTPS URLs and `--screen-id`. Local files
   upload during preparation, several at a time, and it returns once every file
   is uploaded and processed. If it is interrupted, rerun the identical command:
   finished uploads return their existing media IDs. Follow `data.preview.argv`,
   inspect the result, then use `data.publish.argv`. For layouts, read
   [playlists](references/playlists.md).
3. Publish a new playlist with `screen publish SCREEN_ID FILE`. It assigns the
   playlist and waits, up to two minutes by default, until the Player shows it.
   To edit an existing playlist, obtain its file with `playlist show ID --output
   FILE`, edit that file, then use `playlist update`. The revision guard is
   optional. Updates affect all assigned screens. For an application pin change,
   use `playlist replace-release` with `--apply` to change the pin directly; omit
   `--apply` for an optional shared-screen impact review. See the playlist
   reference for revision guards and partial-failure recovery.
4. Report the outcome from the publish result. `data.stage` `playing` with
   `data.playback_verified: true` means the Player acknowledged the playlist on
   glass. `assigned` means it is not showing yet: `data.playback.reason` and the
   warning of the same code say why (offline screen, takeover or schedule,
   failed upgrade, or still downloading) and what to do. Take a screenshot when
   you need to see the content itself.

Tell the user where publishing stands as it moves: uploaded and processed
(`playlist init`), assigned, playing (`screen publish`). A slow upload's
`data.uploads[].timing` shows which stage took the time.

Native Players cache playlist media within their reported storage. Before
assigning a large playlist, dry-run it with
`screen storage-forecast SCREEN_ID --playlist-id ID`; it writes nothing and
answers `fit` and `excluded_page_count` (`unknown` when the screen never
reported storage). Read `storage_forecast` from `screen show` again right after
assignment, when it reflects the new content. Absent means
the Player has not reported, so the fit is unknown. After publishing, watch
`screen.storage_shortfall` events or `storage_shortfall` (`fit` `partial`,
`transition_blocked` or `none_fit`). A `partial` fit shows a deterministic
subset anchored by the first always-visible page. To remedy, use smaller
renditions, fewer or shorter videos, split the playlist, or remove unused pages.
Delivery is billed per download, so avoid republishing churn. See
[Player storage](references/operations.md#player-storage).

`screen reload SCREEN_ID` asks a screen's Player to reload once, for example
when it looks stale. Acceptance does not prove the reload; verify it with a
screenshot or events.

### Fleets

`screen assign`, `reload`, `toast`, and `tag` take several ids or `--tag TAG`
(active screens only) as one metered request. `screen publish` is
single-screen: for a fleet, `playlist create FILE` once, then
`screen assign --tag TAG --playlist-id ID`. The answer stays `ok: true`; read
`data.results[]`, where each screen is `ok` or `failed` with its own problem.
Warning `fleet_partial_failure` sets the exit code to the first failed
screen's; `fleet_no_match` is exit 0 with nothing changed. After an
interrupted request (timeout or ambiguous transport failure), rerun the
identical command: finished screens replay. After a definite partial failure,
fix the cause and retry only the failed ids. Fleet `reload` and `toast` share
a 600 screens/minute project budget; a larger request is refused whole with
429 `rate_limited` and `Retry-After` before any screen changes. Per-screen
limits (reload 6/min, toast 20/min) return per-screen `rate_limited`; retry
those ids later.
Verify with `screen screenshot --tag TAG --output DIR`, one
`<screen_id>.webp` per screen (`--tag` matches at most 500 active screens
with one billed list request; captures are free). A `screen.offline` event in `events list` or
`events follow` (written after 60 s offline) with no later `screen.online`
marks a dead screen. Details are in [fleets](references/operations.md#fleets-tags-and-fleet-actions).

### Schedules and takeover

A screen plays its takeover, else the first matching playlist schedule entry,
else its default playlist. Use page `visibility` for pages inside one
playlist, `screen schedule set ID --file FILE` for whole playlists by daypart
(1 to 32 entries, 1 to 16 windows each, in the screen timezone), and
`screen takeover ID --playlist-id ID --for 2h --reason TEXT` for emergencies,
closures and events (`--for` up to `6d23h59m`, or `--until` a strict RFC 3339
instant with seconds and offset, at most 7 days; `screen takeover clear` ends
it early).
Both need a default playlist, a schedule also the screen timezone, and both
take `--tag` for fleets. Dry-run large playlists with `screen storage-forecast`
first: the forecast covers every playlist a screen can switch to. Verify with
`effective_playlist` in `screen show` and a screenshot. See
[schedules](references/schedules.md).

### Device health and power

`screen show` returns `health` (uptime, memory, CPU, temperature, display,
network, crashes; `stale` after 35 minutes) and `display` (requested versus
reported power). Alert on `screen.health_changed` events, for example through
a webhook. `screen reboot ID` works only where the Player declares `reboot`
(else `reboot_unsupported`), at most 2 per screen per 10 minutes; a fleet
reboot needs `--yes` and the user's confirmation. `screen display ID --power
off --for 2h` overrides the display, `screen display clear` ends it, and
`screen display-schedule set ID --file FILE` sets ON windows in the screen
timezone that the Player runs offline. Methods depend on the Player platform;
read the host capabilities in `screen show`. See
[devices](references/devices.md).

### Proof of play

`playback plays --from 7d --to now` lists one row per visible start (proof of
play); `playback list` gives daily totals. For reports, export CSV with
`--format csv --output FILE` (at most 31 days per plays export; one billed
request). An interrupted export leaves `FILE.partial` and `error.next` for the
rest. See [playback](references/playback.md).

### Webhooks

To wake an agent, bot or automation on project events (a kiosk check-in via
`application.event`, `screen.offline`, `playback.page_failed`,
`webhook.disabled`), create a webhook:
`screenrig webhooks create --url HTTPS_URL --event-types TYPES`, with exact types
or `prefix.*`, filtered narrowly. Targets are public HTTPS on port 443 or 8443.
`data.secret` is shown once: put it straight into the receiver's secret store,
never into the conversation or a repository file. Receivers verify
`ScreenRig-Signature`, reject a stale `t`, deduplicate on
`ScreenRig-Event-Id`, and answer 2xx fast; delivery is at least once,
unordered, retried for 24 hours, and disabled after 72 hours of failure.
Confirm with `webhooks test` and `webhooks deliveries`. Receiver code, secret
rotation, billing and a scheduled-agent recipe are in
[webhooks](references/webhooks.md).

For screen controls, reload, screenshots, comments, events and feedback, use
[operations](references/operations.md). For app uploads, page completion and K/V,
use [applications](references/applications.md). App code must
`await screenrig.waitUntilActive()` before `await screenrig.ready()` and make
no SDK call, `log()` included, while `readyState` is not `active`; see
[SDK startup](references/applications.md#start-the-sdk-in-this-order). The [command inventory](references/commands.md)
provides a compact reference for supported operations.

## Resolve issues and ask for support

Own diagnosis and resolution for the user: inspect the actual error and current
state, read https://screenrig.ai/docs/ and https://screenrig.ai/llms-full.txt,
then apply and verify the documented fix within the user's authorization.
Submit a reproducible
bug with `screenrig feedback bug` or product feedback with `feedback feature`;
these reports do not open a support chat.

Every plan, including Standard, includes support chat. `screenrig support status`
reports availability and staffed hours. If support is needed, use `support submit` to start a
conversation; reuse its `conversation.id` for follow-ups. Read prior messages
with `support history` and follow replies with `support follow`. Ask a human
with `--human-requested` and then wait for staff; do not keep soliciting AI
answers. Do not promise a response time. Commands, cursors and read receipts
are in [operations](references/operations.md#support-conversations). End resolved
conversations with `support close --conversation-id ID`; their history is retained.

## Responses, retries and secrets

Operational commands return JSON envelopes by default; `--json` remains a
compatible explicit choice. Use `--human` only for manual inspection, never
together with `--json`. Help and bare command groups are readable by default;
`--json --help` returns structured help. Progress stays on stderr; parse stdout
separately. `events follow` emits one JSON envelope per line (NDJSON).
Branch on `ok`, `error.status`, `error.code` and `warnings[].code`.
On any failure, read `error.detail` (what was wrong, specifically) and
`error.hint` (what to do about it) before deciding the next step, and pass the
gist to the user when they need to act. Follow an applicable `error.next.command` without inventing flags,
except do not follow a connect or dashboard next-step on first setup unless the
user said this installation should join an existing screenRIG project.
Revision guards are optional for most writes: omit `--expect-rev` to write the
current resource without a prior revision read, or supply it to reject a stale
write. Advertising mutations are the enforced exception — campaign `update`,
`activate`, `pause`, `resume`, and `accept-rates`, seller `ads network rate`,
`ads slots update`, and `ads memberships update` require the current revision.

On a revision conflict, refetch and reconcile the intended change. After an
ambiguous write, retry with the same idempotency key and same request, not a new write.
Honor retry delays. Do not retry an explicit permission, admission or payment
refusal. A refused `media generate` does not stop the task: tell the user and
make the image another way (see [media](references/media.md#when-generation-is-refused)).

The credential file lives outside the replaceable plugin directory and survives
updates. `SCREENRIG_CONFIG` selects an explicit config path. Normal configuration
is under `$XDG_CONFIG_HOME/screenrig`, `%APPDATA%\screenrig` on Windows, or
`~/.config/screenrig`. Use `doctor` to inspect configuration problems.

An invitation link URL and an `agent connect` approval handoff URL are
themselves credentials, including when `data.url` appears in JSON stdout or a
browser-open fallback. Deliver each only to the intended person, print a link
invitation URL once, and exclude both from retained logs and conversation
output. Never print credentials, Authorization headers, cookies, signed upload
headers, protected URLs, object keys or image bytes. Keep request and operation
IDs for diagnosis.

## Usage and payment responses

Usage is free within reason until 1 January 2027. Image generation is metered
separately. A displayed zero balance or `credits_low` warning is not authority to
refuse otherwise authorized work during that window. The server decides admission;
a returned `payment_required` or HTTP 402 must still be reported and respected.
Do not retry a rejected billed operation or invent a payment command.

Each generation is billed; prepare a complete prompt and inspect its returned
`usage`. Standard projects can generate 5 successful images in their first
24 hours, then 10 per UTC day, resetting at midnight UTC. Failed generations
do not count. At the Standard daily cap, tell the user: continuing now means
paying for a paid project plan to remove the Standard daily cap, or making
the images with your own tools and uploading them. Premium and Enterprise
remove the daily cap; the first-24-hour cap still applies to new customer
projects on every plan. Offer the user the paid upgrade through
[pricing](https://screenrig.ai/pricing/), and continue with your own image
generation or local rendering unless they choose the upgrade. Follow
[generation refusal recovery](references/media.md#when-generation-is-refused).
Quality affects detail and token consumption, not a fixed image price.
For current rates and terms, use [pricing](https://screenrig.ai/pricing/).
For product questions use [product context](https://screenrig.ai/llms.txt), then
[expanded context](https://screenrig.ai/llms-full.txt) if needed. These explain the
product; the installed CLI and its responses determine available operations.
