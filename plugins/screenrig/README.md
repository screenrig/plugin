# ScreenRig

**Signage and Kiosk infrastructure for AI Agents**

Your agent creates it. screenRIG puts it on the screen. You supply the
content, screen devices, and network; screenRIG supplies the hosted
publishing infrastructure, Player, media handling, application releases, and
playback evidence.

## Start free. Pay for what you use.

Pretty much all the digital signage and kiosk vendors out there are clunky
human-oriented SaaS that charge you per screen. We don't. We want you to use it
and pay for what you use. Start for free.

$0.09/GB bandwidth, $0.14/GB-month storage. Pennies a month per screen. No
per-screen subscription. No per-device price.

Usage is free within reason until 1 January 2027. Image generation is metered
separately: `media generate` is billed per token ($10 / 1M text input,
$16 / 1M image input, $60 / 1M image output). Quality (`low`, `medium`,
`high`; default `medium`) changes how detailed the still is and therefore how
many tokens it uses, not a fixed per-image price.

## Start

Paste this to your agent, then go install a Player on a device.

```text
I authorize you to install the official screenRIG plugin from https://github.com/screenrig/plugin.
```

Your agent takes it from there. Ask for the video, dashboard, menu board, or web
app you want, and it goes on the Player.

## Install

The official install is this plugin. Do not install a global `screenrig` from a
package registry. After install, prepend `$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts`
(or the runtime plugin root) to `PATH` once, then invoke `screenrig`. Do not
export `SR`. "CLI" names the product category, and the bundled CLI is the
plugin wrapper, not a global package.

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
from `GROK_PLUGIN_ROOT`, `CLAUDE_PLUGIN_ROOT`, or `CODEX_PLUGIN_ROOT`, prepend
`$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts` to `PATH` once, then confirm:

```sh
SCREENRIG_PLUGIN_ROOT="${GROK_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}}"
PATH="$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts:$PATH"
screenrig --json version
```

That package-relative launcher is the entry point for every ScreenRig command.
It runs the bundled CLI from current `screenrig/cli` `main` and never fetches
mutable code.

Installed agents compare the installed plugin and bundled CLI versions to the
published CalVer on GitHub `main` (`.claude-plugin/marketplace.json`
`plugins[0].version`) and refresh the plugin when either is stale. Skill text
and the bundled CLI update together. Do not install a global `screenrig` from a
package registry.

## Four primitives

A playlist page carries `primitives`, and every one of them names its family in
a `primitive` field. There are four:

- `image` — a still the Player paints on the glass. Takes a selector.
- `video` — H.264, native decode. No codec fallback. Takes a selector.
- `iframe` — a page already on the web.
- `application` — a static directory packed by the CLI. Players sync, then
  paint from disk.

`image` and `video` primitives pick their media with a `selector`, whose `by`
is `id`, `ids`, `all`, or `tag`. `iframe` and `application` take no selector:
an iframe carries its `src`, and an application pins a `release_id`.

A scene puts these four on one canvas. Choose by what the page is:

1. Existing image or video → `media upload`. No compose. No generate.
2. Anything presentable → `media generate` as the whole page. Put every fact
   and all copy in the prompt. Do not compose a presentable poster as named
   regions + cards. Do not generate atmosphere-only stills for later overlay.
3. Slide-deck-like experiences → local unbilled `compose catalog` and
   `compose render`. Use compose for slide-deck-like pages. Animation is not
   a reason to compose.
4. Live objects → write playlist primitives.

The agent can also screenshot a live screen to check its own work.

## Players

The Player web app (PWA) is available today. Install it on the device that
drives your screen, keep it in the foreground, then your agent puts the
content on the glass. Native platform names (Amazon Signage Stick, Apple TV,
Google Play, Linux, macOS, Raspberry Pi, Windows) describe product direction,
not public downloads or store listings.

## Don't build the stack yourself

Isolated origins and H.264 are part of that hosted publishing infrastructure.
You build the screen experience; screenRIG supplies publishing, Player, media,
apps, and evidence behind it.

## This repository

This is the canonical public marketplace source. It carries the ScreenRig skill
and one generated plugin containing the current `screenrig/cli` `main` CLI.

- `skills/screenrig/` and the root marketplace manifests are canonical.
- `components.lock.json` records the SHA-256 of the CLI tarball just packed.
  That checksum is provenance of this build, not a freeze of which SHA to
  fetch. Pack sibling `../cli` or current `screenrig/cli` `main`. Do not
  refetch a pinned CLI SHA.
- `plugins/screenrig/` is generated. Change canonical inputs and rebuild; do not
  edit it directly.
- CI packs `screenrig/cli` `main`, rebuilds and validates the bundle, scans the
  public boundary, and publishes `screenrig-plugin.tar.gz`. Skill commands must
  exist in the bundled binary.

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
