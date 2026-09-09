# plugin

This repository owns the public ScreenRig marketplace, canonical skill source,
plugin metadata, and the generated bundle that contains the current
`screenrig/cli` `main` CLI.

It does not own the CLI source, Players, backend, site, or production
deployment. The separately published `screenrig` npm package is the official
developer-shell distribution. It is never a substitute for this plugin's
bundled launcher in an agent workflow.

The workspace [`../AGENTS.md`](../AGENTS.md) is the shared working agreement.
This file outranks it on anything local here.

## Sources of truth

- `skills/screenrig/`, `build/plugin.json`, root marketplace manifests, and
  root public files are canonical inputs.
- `components.lock.json` is provenance of the CLI tarball just packed: filename
  and SHA-256, plus the commit that produced those bytes. It is not a freeze of
  which SHA to fetch.
- `scripts/build-plugin.py` generates `plugins/screenrig/`. Locally it packs
  sibling `../cli` when that directory exists. CI clones and packs
  `https://github.com/screenrig/cli` `main`.
- `scripts/validate-plugin.py` and `scripts/check-public-repo.py` define the
  public/reproducibility boundary. Skill commands must exist in the bundled CLI
  usage; `media generate` and `media download` are required.
- Distributed plugin versions are CalVer `YY.MM.SERIAL` (UTC). Committed
  `.claude-plugin/marketplace.json` is the published CalVer. Local and
  pull-request trees use `YY.MM.0-dev`.

## Edit and generation rules

- Never edit `plugins/screenrig/` independently. Change canonical inputs and
  regenerate.
- After packing, write `components.lock.json` as provenance of that tarball.
  Do not refetch a pinned CLI SHA.
- Keep Codex and Claude marketplace metadata, generated manifests, public
  README, and skill behavior aligned at regeneration time.
- The launcher must preflight Node.js 20.11+ and prefer the package-relative
  bundled `cli/dist/bin.js`. Do not add global npm resolution to the launcher.
- The launcher preflights Node.js and nothing else. It must stay silent on
  success: stdout is clean JSON, stderr is empty.
- Preserve unrelated work. Do not commit, push, tag, or publish unless asked.

This repository's `main` Action tags CalVer and publishes
`screenrig-plugin.tar.gz`. It does not deploy ScreenRig and does not publish a
marketplace listing unless the user asks.

## Product and security boundaries

- Canonical skill source `skills/screenrig/SKILL.md` is the operative
  marketplace skill. Official install is this plugin: Claude, Codex, and Grok
  marketplace commands, with Grok `--trust` named and `GROK_PLUGIN_ROOT`
  lookup.
- After install, prepend `$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts` to
  `PATH` once, then run `screenrig --json version`,
  `screenrig-plugin-freshness --json`, `doctor`, then content work. Do not
  export `SR`. Do not teach `npm i -g screenrig`.
- Do not teach `agent enroll`, `screen pair`, `browser setup`,
  `screen provision`, `ABC-234`, or playlist text-slot template tutorials.
- Keep `--json` envelopes. Never teach a token flag or pasted bearer.
- Never write MCP. `validate-plugin.py` rejects MCP manifests.
- Teach the playlist authoring tree. Choose by what the page is:
  1. Existing image or video → `media upload`. No compose. No generate.
  2. Anything presentable → `media generate` as the whole page. Put every
     fact and all copy in the prompt. Do not compose a presentable poster as
     named regions + cards. Do not generate atmosphere-only stills for later
     overlay. Generate is billed per token ($10 / 1M text input, $16 / 1M
     image input, $60 / 1M image output). Quality changes detail and token
     usage, not a fixed per-image price. Generate stores `med_…`; the caller
     does not re-upload.
  3. Slide-deck-like experiences → local unbilled `compose render`.
  4. Live objects → write playlist primitives. Animation is not a reason to
     compose.
- Lead marketplace README and skill with the human homepage line: **give
  your agent a screen**. Then the homepage body: your agent creates it;
  screenRIG puts it on the screen. Do not lead with pack-only “Build the
  screen experience on infrastructure” or “You supply content / we host”
  framing. Compare is the human three-column table (screenRIG / Build your
  own / Dashboard-led signage), not DIY or legacy checklist prose. Do not
  claim “twice vendor cost”. The available Player is the PWA. Native
  platform names are product direction, not public downloads or store
  listings.
- The category word is **primitive**. Four wire primitives: `image`, `video`,
  `iframe`, `application`. Image and video take a `selector`; iframe and
  application do not.
- Screenshotting is in v1. Do not print pixels.
- Root `README.md` is the public marketing face and is fact-gated. Required
  marketplace strings and forbidden patterns live in
  `scripts/validate-plugin.py`. Do not drop a required fact. Do not introduce
  enroll, pairing, MCP, or global npm install. Do not promise native Players
  as available; do not use the phrase “coming soon” in the README.

## Local workspace logs

When plugin or bundled-CLI stdout is captured through `rig start` in the
developer workspace, it is appended to `../logs/YY-MM-DD/plugin.log`
(example `../logs/26-09-08/plugin.log`). Rig deletes date folders older
than 7 days. The `logs/` directory is not a git repository.

## Follow operation logs

This plugin does not emit the operation log. The bundled CLI does, through
optional `log_socket` in the user config. Keep skill text generic: no operator
host paths, no local listener service, no internal tooling names.

## Verification

```sh
python3 scripts/check-public-repo.py
plugins/screenrig/skills/screenrig/scripts/screenrig --json version
python3 scripts/build-plugin.py --check --cli-artifact <current-cli-tarball>
python3 scripts/validate-plugin.py --cli-artifact <current-cli-tarball>
python3 scripts/test-skill-commands.py
python3 scripts/test-plugin-freshness.py
```

These gates do not prove marketplace installation, live API use, native
hardware, or production deployment.

## Completion evidence

Report canonical and generated files changed, bundled CLI
repository/commit/hash, generation/validation results, stale-language scan,
repository status, skipped marketplace/live/native gates, and claim state.
