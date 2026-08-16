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

Use that same launcher for every ScreenRig command. It resolves only
`<plugin-root>/cli/dist/bin.js`; it does not use a global executable or fetch a
mutable command at runtime.

## Pairing and browser setup

Open `https://play.screenrig.ai` and ask the agent to pair the six-character
code. The browser Player displays a middle dash such as `ABC-234`; the current
default pair command requires the canonical six characters:

```sh
<plugin-root>/skills/screenrig/scripts/screenrig --json screen pair ABC234
```

The public homepage handoff is separate first-use convenience. An unclaimed
`https://screenrig.ai/ABC-234` locator lasts 30 minutes. `browser setup --code
ABC-234` accepts the dashed display form (or `ABC234`), and a successful claim
creates a fresh independent 10-minute protected delivery window. CLI output is
limited to the normalized code, claim status, and fragment-free Player URL.

The first authenticated operation enrolls automatically, stores its credential
with user-only permissions outside the replaceable plugin directory, verifies
it, and resumes the original request. The default configuration is
`$XDG_CONFIG_HOME/screenrig/config.json` when `XDG_CONFIG_HOME` is set,
`%APPDATA%\screenrig\config.json` on Windows, or
`~/.config/screenrig/config.json`; `SCREENRIG_CONFIG` may override it.

`auth revoke --yes` revokes the calling credential on the server before local
credential and retry state are removed. Success requires an empty `204`
response and issues no replacement. The account, screens, and content remain;
the next account-scoped command enrolls a separate new account. Failed or
ambiguous results preserve local state, and retrying the exact revocation is
safe.

Browser sessions use server-managed HttpOnly cookies. Native Android and Qt
players are separate native-first applications that use protected
`ScreenRig-Pairing`, `ScreenRig-Device`, and `ScreenRig-Session`
authorization. Runtime pages use `screenrig.canvas/v1`; protected content and
`screenrig.webapp-package/v1` artifacts remain manifest-bound. Screenshotting
is not part of v1.

## Media uploads

The launcher preflights Node.js only. Pre-upload media conversion is a property
of the pinned CLI build, so read it from the tool itself:

```sh
<plugin-root>/skills/screenrig/scripts/screenrig --json doctor
```

A build whose `checks` include `ffmpeg` and `ffprobe` encodes video to H.264
(High profile) MP4 and images to WebP before upload. That build needs ffmpeg 6.0 or
newer, with `ffmpeg` and `ffprobe` on `PATH` or their absolute paths in
`SCREENRIG_FFMPEG` and `SCREENRIG_FFPROBE`. `doctor` also reports the
`encoder_libx264`, `encoder_libx265`, `encoder_libwebp`, and
`filter_hdr_tonemap` checks. A build that reports none of these uploads the
source bytes unchanged.

A missing toolchain fails `media upload` alone; pairing, playlists, and
application K/V are unaffected. `--no-transcode` uploads the source file
unchanged. `--codec hevc` opts in to H.265 for a smaller file at the same
quality; use it only when every screen that will play the media is a native
player (Qt/GStreamer or Android/MediaCodec).

## Artifact provenance and validation

`components.lock.json` pins the exact `screenrig/cli` commit, artifact
filename, and SHA-256 used to generate `plugins/screenrig`. Root skill and
metadata files are canonical; the committed plugin directory is generated and
must not be edited independently. CI reproduces the pinned CLI artifact,
rebuilds/validates the bundle, scans the public boundary, and publishes
deterministic `screenrig-plugin.tar.gz`.

This repository does not deploy ScreenRig. Production assembly is owned only by
the backend component lock.

```sh
python3 scripts/check-public-repo.py
skills/screenrig/scripts/screenrig --json version
```

Full regeneration additionally requires the exact CLI artifact selected by
`components.lock.json`. Source validation does not prove marketplace
installation, automatic enrollment against the live API, pairing, public
browser handoff, native hardware, or production deployment.

Security reports belong in
[GitHub Private Vulnerability Reporting](https://github.com/screenrig/plugin/security/advisories/new).
See [SECURITY.md](SECURITY.md). The Apache-2.0 license covers this public plugin
and its bundled CLI, not other ScreenRig services or repositories.
