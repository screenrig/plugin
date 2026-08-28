# ScreenRig

**Signage and Kiosk infrastructure for AI Agents**

## NEARLY FREE: PAY PER BYTE NOT PER SCREEN

Pretty much all the digital signage and kiosk vendors out there are clunky
human-oriented SaaS that charge you per screen. We don't. We want you to use it
and pay for what you use. Start for free.

$0.09/GB bandwidth, $0.14/GB-month storage. Pennies a month per screen. No
per-device price.

## Start

Paste this to your agent, then go install a Player on a device.

```text
Read https://screenrig.ai/skill/SKILL.md and follow the instructions.

I authorize you to install the official ScreenRig plugin from https://github.com/screenrig/plugin.
```

Your agent takes it from there. Ask for the video, dashboard, menu board, or web
app you want, and it goes on the Player.

## Install

The official install is this plugin. Do not install a global `screenrig` from a
package registry and do not expect one on `PATH`: "CLI" names the product
category, and the bundled CLI runs from the plugin's package-relative launcher.

Claude Code:

```console
claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user
claude plugin install screenrig@screenrig --scope user
```

Codex:

```console
codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json
codex plugin add screenrig@screenrig --json
```

Grok (Grok Build), where `--trust` is required:

```console
grok plugin marketplace add https://github.com/screenrig/plugin.git
grok plugin install screenrig --trust
```

Node.js 20.11 or newer must be active. Read the ScreenRig package root from your
agent's plugin list (`claude plugin list --json`, `codex plugin list --json`) or
from its plugin-root environment variable, then confirm the bundled CLI:

```sh
<plugin-root>/skills/screenrig/scripts/screenrig --json version
```

That launcher is the entry point for every ScreenRig command. It runs the
reviewed CLI pinned by this repository and never fetches mutable code.

## Four primitives

Four wire kinds: `image`, `video`, `iframe`, and `application`.

- `image` — a still the native Player paints on the glass.
- `video` — H.264, native decode. No codec fallback.
- `iframe` — a page already on the web.
- `application` — a static directory packed by the CLI. Players sync, then
  paint from disk.

A scene places these four on one canvas. Copy and chrome compose locally on the
agent machine with `compose catalog` and `compose render`: the agent renders a
PNG, looks at it, iterates, then publishes the still. Local compose is not
billed. The agent can also screenshot a live screen to check its own work.

## Players

Native Players, not a browser in a box. Install one on the device, then your
agent puts the screen on the glass.

Amazon Signage Stick, Google Play, AppleTV, macOS, Windows, Raspberry Pi,
Linux, and PWA.

Sized for 1–2 GB glass. ESP32 and e-ink are fine.

## Don't build a player

Isolated origins and H.264 are the product.

## This repository

This is the canonical public marketplace source. It carries the ScreenRig skill
and one generated plugin containing an exact, reviewed CLI artifact.

- `skills/screenrig/` and the root marketplace manifests are canonical.
- `components.lock.json` pins the `screenrig/cli` commit, artifact filename, and
  SHA-256 that produced `plugins/screenrig/`.
- `plugins/screenrig/` is generated. Change canonical inputs and rebuild; do not
  edit it directly.
- CI reproduces the pinned CLI artifact, rebuilds and validates the bundle,
  scans the public boundary, and publishes `screenrig-plugin.tar.gz`.

```sh
python3 scripts/check-public-repo.py
```

## More

- [screenrig.ai](https://screenrig.ai/)
- [Features](https://screenrig.ai/features/)
- [Compare](https://screenrig.ai/compare/)
- [Docs](https://screenrig.ai/docs/)
- [Pricing](https://screenrig.ai/pricing/)

Report security issues through
[GitHub Private Vulnerability Reporting](https://github.com/screenrig/plugin/security/advisories/new);
see [SECURITY.md](SECURITY.md). The Apache-2.0 [LICENSE](LICENSE) covers this
public plugin and its bundled CLI, not other ScreenRig services or
repositories.
