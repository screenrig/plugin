---
name: screenrig
description: Operate screenRIG screens and advertising with the bundled CLI. Use to upload or generate media, compose slides, publish applications and playlists, assign content, verify playback, place adslot breaks, and buy or manage ad campaigns or sell ad inventory.
---

# Operate screenRIG

Use the official plugin's bundled CLI to connect one account, prepare and publish
signage content to the intended Player, and buy or sell advertising where the
account is permitted to. The customer Player is the PWA described in
[Player setup](https://screenrig.ai/docs/players.md).

Resolve the account's capabilities and the requested intent before any operation;
the section below is the only branch that needs a screenRIG screen.

## Prepare the installation

Node.js 20.11 or newer is required. Resolve the installed plugin root and put its
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

For freshness, `keep` means continue, `refresh` means update the plugin using the
installation reference, and `continue_installed` means continue with the installed
copy and disclose that the published version could not be checked.

Read doctor's individual checks. A missing token is a warning, not a broken
installation. Missing media tools affect upload; see [media](references/media.md).

## Resolve the account, then the intent before any operation

Default first-run is enroll. Do not open `agent connect` or send dashboard URLs
unless the user says they already have a screenRIG account. Prefer enroll for new
accounts; treat connect as existing-account only; never ask the human for dashboard
work on first setup.

Authenticated commands require an enrolled installation. They do not create an
account as a side effect. For `not_enrolled` on first setup, obtain the contact
email and enroll. Do not follow a connect or dashboard `next.command`.

```bash
screenrig agent enroll --email ADDRESS
```

Use the user's actual address. If the work is explicitly advertising rather than
signage, enroll that same account with the advertising purpose; it buys ads and
does not pair devices or author playlists. Never create a second account merely
because the task is advertising.

```bash
screenrig agent enroll --intent advertising --email ADDRESS
```

If enroll reports a pending existing-account connection and the user did not ask
to connect an existing account, rerun with `--force` so enroll is not dead-ended:

```bash
screenrig agent enroll --force --email ADDRESS
```

`--force` discards that unwanted pending connection, then enrolls. Do not use it
to skip an intentional existing-account reconnect. Consult `screenrig --help` for
the installed command's arguments. Never ask the user to paste an account bearer
into the conversation or command line.

Only when the user explicitly says they already have a screenRIG account, use
`agent connect` and resume the dashboard approval flow instead of creating another
account. Connection returns promptly by default; a pending success is not active
access. Follow `data.next.argv` after approval and require
`data.connection_complete: true`. See
[connection behavior](references/commands.md#connect-an-existing-account).

### Capability and intent dispatch (before any screen operation)

1. Resolve the official installed plugin and CLI, then verify version, freshness,
   and doctor as above.
2. Connect the intended existing account, or enroll explicitly.
3. Read the authenticated account ID, plan, feature flags, feature revision, and
   the server's effective capabilities. Never infer permission from a screen
   quota of zero, a plan name, a dashboard label, or which commands exist.

   ```bash
   screenrig account capabilities
   ```

4. Classify the request: buying ads, selling inventory, ordinary signage, or
   financial administration. One account may hold both the advertising and
   screens features and support both ad roles. If intent is materially ambiguous,
   ask about the task, never for a token or credential.
5. Load the matching reference and run only capability-permitted operations:
   signage follows [playlists](references/playlists.md) and
   [operations](references/operations.md); buying and selling follow
   [advertising](references/advertising.md). An advertiser workflow has no screen
   pairing, playlist creation, or screenshot prerequisite.
6. Respect a server denial even when cached capabilities suggested permission.
   Refresh capability state for diagnosis; do not retry through another API,
   create another account, or change the plan to bypass a restriction.

### Signage branch: resolve the target screen

After enroll, the Player pairing code is the only glass-side human step. If the
Player shows a setup code, use `screen pair CODE` with that code. Then list screens
and resolve the intended target before a write. A missing screen is not a reason
to assign to another screen or invent an identifier. This branch applies only when
the resolved intent is signage or seller work on owned screens.

```bash
screenrig screen list
screenrig screen show SCREEN_ID
```

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
`screen show` reports `archive_reason` (`account`, `device_reset` or
`device_unpair`) and `archived_at` when the server supplies them. Prefer
recovery to pairing it as a new screen: if the archived screen shows
`recovery_pending`, confirm with `screen recover SCREEN_ID` as above, then run
`screen unarchive SCREEN_ID`. Unarchive re-admits the screen's current key, so
a display that still holds it (a dark screen, for example after an `account`
archive) resumes without re-pairing. A display that reset or unpaired no longer
holds that key, so unarchive alone does not bring it back and gives content to
whatever still holds the old key. With no recovery offered, or no archived
match (older servers do not archive on reset), pair the code as a new screen
and leave the old one archived. An `account` archive was a
deliberate choice; ask before undoing it. See [operations](references/operations.md).

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

Generation lays out the artwork and type together. Do not generate a background
and then compose text over it for a finished poster. Animation alone does not
require composition. Supplied finished assets do not need generation.

For visual direction and review, read [visual design](references/composition.md).
Keep a campaign consistent and use real supplied facts; label fictional demo facts.

The Qt CI artifact is x86_64 Linux. There is no ARM/Pi artifact and no
hardware-validated Pi decode path. Do not treat Raspberry Pi as a supported
fleet. Prefer H.264 unless the operator has confirmed HEVC on a named device.
See [video codec selection](references/media.md) before uploading; a native
Player alone does not guarantee HEVC support.

## Signage branch: publish and verify
The five primitives are `image`, `video`, `stream`, `iframe`, and `application`.
Use streaming only with a compatible backend and Player.
Image and video use media selectors; stream, iframe, and application do not.
Streams require an uploaded image fallback and a duration-based page. Apple TV
cannot display iframe or application content. Text and
shapes belong in prepared content, not additional native playlist primitives.

1. Prepare and inspect the content at the intended size. Generation stores its
   returned media ID directly; do not upload it again.
2. For full-screen pages, use `playlist init` with local media files, ready media
   IDs, pinned application releases, or HTTPS URLs and `--screen-id`. Local files
   upload during preparation. Follow `data.preview.argv`, inspect the result, then
   use `data.publish.argv`. For layouts and file retry rules, read
   [playlists](references/playlists.md).
3. Publish a new playlist with `screen publish SCREEN_ID FILE`.
   To edit an existing playlist, obtain its file with `playlist show ID --output
   FILE`, then use `playlist update`. The revision guard is optional. Updates affect
   all assigned screens. For an application pin change, use `playlist replace-release`
   with `--apply` to change the pin directly; omit `--apply` for an optional shared-screen impact review. See the playlist reference
   for revision guards and partial-failure recovery.
4. Request a screenshot and inspect relevant playback and events. Assignment
   readback alone does not prove physical display. Report the observed evidence.

Native Players cache playlist media within their reported storage. Before
publishing or assigning a large playlist, read each target's
`storage_forecast` from `screen show` (`fit`, `excluded_page_count`), and read
it again right after assignment, when it reflects the new content. Absent means
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

For screen controls, reload, screenshots, comments, events and feedback, use
[operations](references/operations.md). For app uploads, page completion and K/V,
use [applications](references/applications.md). The [command inventory](references/commands.md)
provides a compact reference for supported operations.

## Responses, retries and secrets

Operational commands return JSON envelopes by default; `--json` remains a
compatible explicit choice. Use `--human` only for manual inspection, never
together with `--json`. Help and bare command groups are readable by default;
`--json --help` returns structured help. Progress stays on stderr; parse stdout
separately. `events follow` emits one JSON envelope per line (NDJSON).
Branch on `ok`, `error.status`, `error.code` and `warnings[].code`,
not prose. Follow an applicable `error.next.command` without inventing flags,
except do not follow a connect or dashboard next-step on first setup unless the
user already has a screenRIG account.
Revision guards are optional for most writes: omit `--expect-rev` to write the
current resource without a prior revision read, or supply it to reject a stale
write. Advertising mutations are the enforced exception — campaign `update`,
`activate`, `pause`, `resume`, and `accept-rates`, seller `ads network rate`,
`ads slots update`, and `ads memberships update` require the current revision.

On a revision conflict, refetch and reconcile the intended change. After an
ambiguous write, retry with the same idempotency key and same request, not a new write.
Honor retry delays. Stop on an explicit permission, admission or payment refusal.

The credential file lives outside the replaceable plugin directory and survives
updates. `SCREENRIG_CONFIG` selects an explicit config path. Normal configuration
is under `$XDG_CONFIG_HOME/screenrig`, `%APPDATA%\screenrig` on Windows, or
`~/.config/screenrig`. Use `doctor` to inspect configuration problems.

The URL returned by `dashboard --print-url` is itself a credential, including
when `data.url` appears in JSON stdout or a browser-open fallback. Send it only to
the intended browser; exclude it from retained logs and conversation output.
Never print credentials, Authorization headers, cookies, signed upload headers,
protected URLs, object keys or image bytes. Keep request and operation IDs for diagnosis.

## Usage and payment responses

Usage is free within reason until 1 January 2027. Image generation is metered
separately. A displayed zero balance or `credits_low` warning is not authority to
refuse otherwise authorized work during that window. The server decides admission;
a returned `payment_required` or HTTP 402 must still be reported and respected.
Do not retry a rejected billed operation or invent a payment command.

Each generation is billed; prepare a complete prompt and inspect its returned
`usage`. Quality affects detail and token consumption, not a fixed image price.
For current rates and terms, use [pricing](https://screenrig.ai/pricing/).
For product questions use [product context](https://screenrig.ai/llms.txt), then
[expanded context](https://screenrig.ai/llms-full.txt) if needed. These explain the
product; the installed CLI and its responses determine available operations.
