---
name: screenrig
description: Operate ScreenRig screens, applications, media, playlists, events, and application K/V with the bundled ScreenRig CLI. Use when an agent receives a screenrig.ai browser setup URL or needs to pair or manage digital-signage screens, upload content, or inspect ScreenRig state.
---

# ScreenRig

## Canonical marketplace

The only supported installation source is the public ScreenRig marketplace at
`https://github.com/screenrig/plugin`. If the user supplies a ScreenRig setup
URL before the plugin is installed, use the matching marketplace installer:

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

Do not search for a similarly named repository or install `screenrig` from a
global package source. Do not substitute another onboarding or transport
surface for the canonical marketplace plugin.

Use the CLI packaged with this skill. It requires Node.js 20.11 or newer.
Resolve the installed plugin root and invoke the wrapper by its
package-relative path:

```bash
SCREENRIG_PLUGIN_ROOT="${CODEX_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}"
"$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts/screenrig" --json screen list
```

If `SCREENRIG_PLUGIN_ROOT` is empty after installation, recover it without
guessing:

1. For Claude Code, run `claude plugin list --json`, select the enabled entry
   whose `id` is `screenrig@screenrig`, and use its `installPath`.
2. For Codex, run `codex plugin list --json`, select the enabled installed
   entry whose `pluginId` is `screenrig@screenrig`, and use its `source.path`.
3. Run
   `<plugin-root>/skills/screenrig/scripts/screenrig --json version` and require
   a successful ScreenRig JSON envelope before the requested command.

If there is no matching entry, run the exact canonical marketplace add/install
commands above and repeat this lookup. If installation or lookup still fails,
report the failing runtime command and the canonical repository URL to the
user. Do not substitute a globally installed command or download an
executable.

Use `--json` for agent work. Branch on `ok`, `error.status`, and `error.code`;
do not parse prose. The first authenticated command enrolls automatically when
the durable user credential is absent, stores that credential outside the
replaceable plugin directory, and resumes the same command. The default file is
`$XDG_CONFIG_HOME/screenrig/config.json` when `XDG_CONFIG_HOME` is set,
`%APPDATA%\screenrig\config.json` on Windows, or
`~/.config/screenrig/config.json` otherwise; `SCREENRIG_CONFIG` may override
the path. The directory and file are restricted to the current user. This
state intentionally survives plugin upgrade or uninstall. Do not add a
separate setup step or request identity or credential material from the user.

Pair only with the six-character code displayed at `https://play.screenrig.ai`.
Run `screen pair CODE [--label LABEL]`; the CLI accepts lowercase input only by
normalizing it to canonical uppercase. A middle dash is presentation-only, so
both `ABC234` and `ABC-234` identify the same canonical code. Reject characters
outside `23456789ABCDEFGHJKMNPQRSTUVWXYZ`. Report the paired screen returned by
the command. Do not invent a URL-transfer, token-copy, browser-consent,
account, email, or other default onboarding branch.

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
- `handoff_code_invalid` or `handoff_code_expired`: ask the user to open
  ScreenRig and copy a fresh setup instruction.
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
"$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts/screenrig" --json doctor
```

Read `data.checks`. A build that reports `ffmpeg` and `ffprobe` converts media
before upload. A build that reports neither uploads the source bytes unchanged
and needs no external tool; skip the rest of this section.

On a build that converts:

- `media upload <file>` encodes video to an H.264 (High profile) MP4 by
  default and images to WebP, then uploads the converted bytes.
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

## Commands

```text
account show
auth status
auth revoke --yes

app pack <directory> [--output FILE]
app upload <directory> [--no-wait] [--poll-ms MS]
app list
app show <id>

media upload <file> [--content-type TYPE] [--no-wait]
media show <id>
media list
media delete <id> --if-match REVISION

playlist create <json-file>
playlist update <id> <json-file> --if-match REVISION
playlist show|get <id>
playlist list
playlist delete <id> --if-match REVISION

screen pair CODE [--label LABEL]
screen provision (--open | --print-url) [--label LABEL]
browser setup --code CODE [--open]
screen update <id> --if-match REVISION [--name NAME] [--playlist-id ID]
screen assign <id> --playlist-id ID --if-match REVISION
screen show <id>
screen list
screen rotate-public-id <id> --if-match REVISION
screen revoke-credential <id> --if-match REVISION
screen delete <id> --if-match REVISION
screen toast <id> --level error|alert|info --text TEXT [--duration-ms MS]

operations get <id>
operations wait <id> [--timeout MS] [--poll-ms MS]
operations cancel <id>

events list [--after CURSOR] [--limit N]
events follow [--after CURSOR] [--timeout MS]

kv list --application-id ID
kv get --application-id ID <key>
kv set --application-id ID <key> --json-value JSON [--if-match REVISION]
kv set --application-id ID <key> --file FILE --content-type TYPE [--if-match REVISION]
kv set --application-id ID <key> --value-base64 BASE64 --content-type TYPE [--if-match REVISION]
kv delete --application-id ID <key> --if-match REVISION

doctor [--repair-config]
version
```

Use the same `screen pair CODE` flow for first use and recovery. Application upload
accepts one already-built static directory with a root `index.html`. Media upload keeps
the signed transfer private and returns metadata only; see "Media uploads and the
ffmpeg toolchain" before the first upload of a session. Application K/V is
binary-safe; use exactly one value mode.

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
