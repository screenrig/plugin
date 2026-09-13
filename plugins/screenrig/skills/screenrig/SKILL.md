---
name: screenrig
description: Operate screenRIG screens with the bundled CLI. Use to upload or generate media, compose slides, publish applications and playlists, assign content, and verify playback.
---

# Operate screenRIG

Use the official plugin's bundled CLI to prepare content, publish it to the intended
Player, and inspect the result. The customer Player is the PWA described in
[Player setup](https://screenrig.ai/docs/players.md).

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

## Establish account and screen access

Authenticated commands require an enrolled installation. They do not create an
account as a side effect. For `not_enrolled`, read the returned `next.command`.
For a new account, obtain the user's contact email and use the supported explicit
step:

```bash
screenrig agent enroll --email ADDRESS
```

Use the user's actual address. For an existing account, use `agent connect` and
resume the dashboard approval flow instead of creating another account. Connection
returns promptly by default; a pending success is not active access. Follow
`data.next.argv` after approval and require `data.connection_complete: true`.
See [connection behavior](references/commands.md#connect-an-existing-account).
Consult `screenrig --help` for the installed command's arguments. Never ask the user
to paste an account bearer into the conversation or command line.

List screens and resolve the intended target before a write. If the user's Player
shows a setup code, use `screen pair CODE` with that code. A missing screen is not a
reason to assign to another screen or invent an identifier.

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

## Choose the content path

Read the target screen's reported playback surface before choosing aspect ratio.
If it has no observation, ask for the intended orientation or use dimensions the
user supplied. Preserve source facts and supplied brand assets.

| What the page needs | Path | Reference |
| --- | --- | --- |
| Finished image or video | Upload the file. | [Media](references/media.md) |
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

## Publish and verify

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

For screen controls, screenshots, comments, events and feedback, use
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
not prose. Follow an applicable `error.next.command` without inventing flags.
Revision guards are optional throughout the CLI. Omit `--expect-rev` to write
the current resource without a prior revision read. Supply it only when you want
a stale write rejected.

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
