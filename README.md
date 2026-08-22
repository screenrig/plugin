# ScreenRig agent plugin

ScreenRig is an agent-first digital-signage workflow. This public repository is
the canonical marketplace source and distributes one generated plugin containing
the ScreenRig skill plus a pinned CLI artifact.

## Install

Claude Code:

```sh
claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user
claude plugin install screenrig@screenrig --scope user
```

Codex:

```sh
codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json
codex plugin add screenrig@screenrig --json
```

Confirm the installed entry and read its package root:

```sh
claude plugin list --json
codex plugin list --json
```

Run `node --version` first. The package-relative launcher fails closed unless
Node.js 20.11 or newer is active. After installation, use the agent's plugin list
JSON to read the ScreenRig `installPath` (Claude Code) or `source.path`
(Codex), then verify the installed bundle:

```sh
<plugin-root>/skills/screenrig/scripts/screenrig --json version
```

Use that same launcher for every ScreenRig command. It prefers
`<plugin-root>/cli/dist/bin.js`. For source-checkout fallbacks it accepts
`SCREENRIG_PLUGIN_ROOT`, `CLAUDE_PLUGIN_ROOT`, or `CODEX_PLUGIN_ROOT`, then
walks parent directories to find a plugin root containing `cli/dist/bin.js`.
It does not use a global ScreenRig executable or fetch mutable code.

## Official npm CLI for developer shells

The official npm distribution provides the same command-line product for direct
developer shell use. For an exact version that is present on npm, install:

```sh
npm install --global screenrig@0.1.0
screenrig --json version
```

The npm package is an official developer distribution, but it is not an agent
plugin fallback. When an agent has loaded this plugin, it must use the adjacent
package-relative launcher above. That launcher preserves the plugin's reviewed
CLI pin and deliberately ignores a global `screenrig` on `PATH`.

## Pairing and browser setup

Open `https://play.screenrig.ai` and ask the agent to pair the six-character
code. The browser Player displays a middle dash such as `ABC-234`; the current
default pair command requires the canonical six characters:

```sh
<plugin-root>/skills/screenrig/scripts/screenrig --json screen pair ABC234
```

Native player pairing codes last 72 hours while unclaimed. A successful
`screen pair` claim starts a fresh independent 72-hour collection window. The
CLI claims the code on the control plane; it does not time the code locally.

The public homepage handoff is separate first-use convenience. An unclaimed
`https://screenrig.ai/ABC-234` locator lasts 30 minutes. `browser setup --code
ABC-234` accepts the dashed display form (or `ABC234`), and a successful claim
creates a fresh independent 10-minute protected delivery window. CLI output is
limited to the normalized code, claim status, and fragment-free Player URL.

Enrollment is explicit and mandatory. Nothing enrolls as a side effect of
another command. Until this installation holds a credential, every
authenticated command fails with `error.code` `not_enrolled` and an
`error.next.command` naming what to run, and sends no authenticated request.

```sh
screenrig --json agent enroll --email you@example.com --name "NAME THE AGENT CHOOSES"
```

`--email` is required. The agent supplies an address it already knows for the
user, and asks the user when it does not know one. The server stores the
trimmed address as unverified contact metadata: ScreenRig sends no mail, the
address is never a login identifier, and it does not recover an account.
Dashboard sign-in stays passkey-only. One account per address; a `409`
`email_conflict` means the address is already enrolled, and the remedy is
`agent connect`, never a second address. `--name` is optional in the contract,
but the agent should choose one, because that name is how the human recognizes
this installation in the dashboard Agents view.

Enrollment stores its credential with user-only permissions outside the
replaceable plugin directory and verifies it. The default configuration is
`$XDG_CONFIG_HOME/screenrig/config.json` when `XDG_CONFIG_HOME` is set,
`%APPDATA%\screenrig\config.json` on Windows, or
`~/.config/screenrig/config.json`; `SCREENRIG_CONFIG` may override it.

`agent connect [--name NAME]` connects this installation to an existing
account after a fresh dashboard passkey assertion. The status SSE carries state only; the distinct agent
credential is recipient-encrypted and collected separately. Cancelled and
expired connections are terminal. Definitive rejection or revocation of a
pending bearer clears unusable local connection state; ambiguous failures retain
it for exact retry. `agent status` never enrolls.
For an active agent it reports `connection_ready` only when a persisted
dashboard passkey can approve another agent.
`agent disconnect --yes` revokes only this installation and preserves the
account, screens, content, and other agents. The last-agent safety check needs
`--allow-lockout` as a separate explicit choice. `auth status` and `auth revoke
--yes [--allow-lockout]` remain deprecated aliases; revoke has the same
last-agent guard and cleanup behavior as disconnect. Failed or ambiguous
disconnects preserve local state for an exact retry.

These agent identity commands are included in the reviewed CLI artifact pinned
by `components.lock.json` and in the generated plugin bundle. That is source
and artifact evidence only; it does not establish marketplace publication,
installation, or public-origin availability.

The dashboard Agents view lists agent state, last use, direct request and
credit usage, and recent resource events. A fresh passkey assertion can
disconnect one selected agent without deleting the account or its content.
Authenticated request counts are best-effort diagnostics, not exact billing or
audit totals.

Browser cookie handoff uses server-managed HttpOnly cookies. Native
players and the installed PWA identity path use generate-once Ed25519
proofs with `ScreenRig-Pairing` and `ScreenRig-Session`.
`ScreenRig-Device` is retired. Runtime pages use `screenrig.canvas/v1`;
protected content and `screenrig.webapp-package/v1` artifacts remain
manifest-bound. Screenshotting is in v1. `screen screenshot <id>`
blocks on a still WebP and writes a file. It does not print image
bytes. Native identity, archive, and reset exist in their owning repositories;
this documentation does not claim deployment.

## Media uploads

The launcher preflights Node.js only. Pre-upload media conversion is a property
of the pinned CLI build, so read it from the tool itself:

```sh
<plugin-root>/skills/screenrig/scripts/screenrig --json doctor
```

A build whose `checks` include `ffmpeg` and `ffprobe` encodes video to H.264
(High profile) MP4 and images to lossy WebP before upload. That build needs ffmpeg 6.0 or
newer, with `ffmpeg` and `ffprobe` on `PATH` or their absolute paths in
`SCREENRIG_FFMPEG` and `SCREENRIG_FFPROBE`. Image encode prefers ffmpeg
`libwebp`; if that encoder is missing, the CLI falls back to `cwebp` on `PATH`
or `SCREENRIG_CWEBP`. `doctor` also reports the
`encoder_libx264`, `encoder_libx265`, `encoder_libwebp`, `cwebp`, and
`filter_hdr_tonemap` checks. `encoder_libwebp` is the ffmpeg encoder only.
This pinned build never silently falls back to uploading an unconverted source
when its required toolchain is missing.

A missing toolchain fails `media upload` alone; pairing, playlists, and
application K/V are unaffected. `--no-transcode` uploads accepted delivery
bytes unchanged; lossless WebP is still rejected. It is the escape hatch for
already-correct delivery WebP, not the recovery for a missing libwebp encoder.
`--codec hevc` opts in to H.265 for a smaller file at the same quality; use it
only when every screen that will play the media is a native player
(Qt/GStreamer or Android/MediaCodec).

## Artifact provenance and validation

`components.lock.json` pins the exact `screenrig/cli` commit, artifact
filename, and SHA-256 used to generate `plugins/screenrig`. Root skill and
metadata files are canonical; the committed plugin directory is generated and
must not be edited independently. CI reproduces the pinned CLI artifact,
rebuilds/validates the bundle, scans the public boundary, and publishes
deterministic `screenrig-plugin.tar.gz`.

This repository does not deploy ScreenRig. **Deploys are independent**
(operating rule): this repository's `main` Action publishes the
`screenrig-plugin.tar.gz` CI artifact only. No marketplace publish unless
the user asks later. Do not pack siblings. Do not dispatch backend. Do
not copy deploy tokens between repos. Coordinated multi-repo deploy is
rare and only for a breaking contract change. `components.lock.json` pins
the bundled CLI artifact; it is not a production host lock.

```sh
python3 scripts/check-public-repo.py
skills/screenrig/scripts/screenrig --json version
```

Full regeneration additionally requires the exact CLI artifact selected by
`components.lock.json`. Source validation does not prove marketplace
installation, enrollment against the live API, pairing, public browser
handoff, native hardware, or production deployment.

Security reports belong in
[GitHub Private Vulnerability Reporting](https://github.com/screenrig/plugin/security/advisories/new).
See [SECURITY.md](SECURITY.md). The Apache-2.0 license covers this public plugin
and its bundled CLI, not other ScreenRig services or repositories.
