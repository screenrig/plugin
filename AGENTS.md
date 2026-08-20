# ScreenRig plugin agent guide

This repository owns the public ScreenRig Codex/Claude marketplace, canonical
skill source, plugin metadata, and generated bundle containing a pinned CLI. It
does not own the CLI source, players, backend, site, or production deployment.

## Sources of truth

- `skills/screenrig/`, `build/plugin.json`, root marketplace manifests, root
  public files, and `components.lock.json` are canonical inputs.
- `components.lock.json` pins the exact `screenrig/cli` commit, artifact
  filename, and SHA-256.
- `scripts/build-plugin.py` defines generation of `plugins/screenrig/`.
- `scripts/validate-plugin.py` and `scripts/check-public-repo.py` define the
  public/reproducibility boundary.
- This repository publishes an artifact and never deploys ScreenRig.
  **Deploys are independent** (operating rule): this repository's `main`
  Action publishes the `screenrig-plugin.tar.gz` CI artifact only. No
  marketplace publish unless the user asks later. Do not pack siblings.
  Do not dispatch backend. Do not copy deploy tokens between repos.
  Coordinated multi-repo deploy is rare and only for a breaking contract
  change. `components.lock.json` pins the bundled CLI artifact; it is not
  a production host lock.

## Edit and generation rules

- Never edit `plugins/screenrig/` independently. Change canonical inputs and
  regenerate with the exact CLI artifact selected by `components.lock.json`.
- Never copy CLI source or a local mutable build into the bundle. Update the
  lock only when intentionally selecting a reviewed CLI CI artifact.
- Keep Codex and Claude marketplace metadata, generated manifests, public
  README, and skill behavior aligned **at lock/regeneration time**. Canonical
  skill source may lead the generated `plugins/screenrig/` copy while the
  lock is unchanged. Never hand-edit `plugins/screenrig/` to close that gap.
- The launcher must preflight Node.js 20.11+ and prefer the package-relative
  bundled `cli/dist/bin.js`. When that file is absent, resolve `cli/dist/bin.js`
  from a plugin-root environment variable or a parent-directory walk so a
  source checkout works without a marketplace install.
- The launcher preflights Node.js and nothing else. It must stay silent on
  success: `scripts/check-public-repo.py` and `scripts/validate-plugin.py` both
  require clean JSON on stdout and empty stderr. A dependency that only one
  command needs, such as the media toolchain, belongs to that command in the
  CLI, which can return a machine-readable envelope; it must never fail or warn
  from this shared entry point.
- Preserve unrelated work. Do not commit, push, tag, publish, deploy, or change
  marketplace/GitHub state unless explicitly authorized.

## Product and security boundaries

- Teach only implemented CLI commands. Canonical skill source
  `skills/screenrig/SKILL.md` teaches the current CLI; its Commands block
  matches CLI `USAGE`. New consumer commands (`playback list`, media tags,
  `app upload --name`) and `events follow` reconnect are **repository-ready**
  on public `main` in that skill and in the CLI. They are not in the locked
  plugin bundle, not marketplace, and not deployed. Agent `comment`
  show/set/delete is **source-ready** in the CLI working tree and in this
  canonical skill. It is not in the locked plugin bundle, not marketplace,
  and not deployed. Do not hand-edit `plugins/screenrig/` to teach it.
  Playlist swipe `transition.type` values and optional placement `enter` are
  **source-ready** in the CLI working tree and in this canonical skill.
  Default pages stay `crossfade` with no `enter`. They are not in the locked
  plugin bundle, not marketplace, and not deployed. Do not hand-edit
  `plugins/screenrig/` to teach them.
- The generated `plugins/screenrig/` copy still follows the locked CLI
  artifact in `components.lock.json`. Do not hand-edit it to teach the new
  surface. Alignment happens when the lock selects a reviewed CLI CI
  artifact and the bundle is regenerated.
- The current `screen pair` parser accepts the canonical undashed six
  characters; `browser setup` accepts the public dashed/undashed handoff
  form.
- Preserve automatic first-use enrollment, machine-readable output, user-private
  configuration outside the plugin directory, and server-first
  `auth revoke --yes`.
- Never expose account credentials, cookies, provisioning fragments, signed
  URLs, customer content, raw headers, or secret-bearing output.
- The plugin does not implement rendering, native auth, package caching, public
  handoff TTLs, or deployment; describe those only from pinned/current owning
  sources. Native players and the installed PWA identity path use
  `ScreenRig-Pairing` and `ScreenRig-Session`. `ScreenRig-Device` is
  retired. Archive hides a screen; signed on-device reset is the only
  de-associate. `screen archive` / `screen unarchive` are source-ready in
  the CLI working tree. They are not in the locked plugin bundle, not
  marketplace, and not deployed. Do not hand-edit `plugins/screenrig/`
  to teach them.
- Screenshotting is in v1. `screen screenshot <id>` blocks on a still WebP and
  writes a file. Do not print pixels.
- Teach local compose (`compose catalog`, `compose render`) for copy and
  chrome. Do not teach emitting native `text`, `box`, or `line` through
  playlist templates. Wire families are static (`image`), motion (`video`),
  and web (`iframe`, `application`). Compose is local and not billed.
  Optional Text `textShadow` is `{ x, y, blur?, color }` in px on Text
  only; omit it to paint without a shadow. It is not `screenrig.canvas/v1`
  and not a player feature. Canonical skill source may teach it as
  **source-ready** working-tree CLI behavior. It is not in the locked
  plugin bundle, not marketplace, and not deployed. Do not hand-edit
  `plugins/screenrig/` to teach it.
- Human `events list` and `events follow` print logfmt. Human logfmt omits
  canned server sentences. An `application.event` or `runtime.reported` with
  no remaining data is silent. `--json events list` is one JSON page
  envelope. `--json events follow` is a JSON stream. After redaction, `--json`
  may still include a server `message` field when it is data.
- `events follow` reconnects on disconnect or a transient connect failure,
  with exponential backoff, and sends the last SSE `id` as `after`.
  `--timeout` covers the whole follow, including backoff. 401, 403, 404,
  and other non-transient 4xx problems stop the command. Do not print
  reconnect chatter on stdout.

## Verification

```sh
python3 scripts/check-public-repo.py
plugins/screenrig/skills/screenrig/scripts/screenrig --json version
```

Bundle validation and reproduction require the exact locked CLI artifact:

```sh
python3 scripts/build-plugin.py --check --cli-artifact <locked-cli-artifact>
python3 scripts/validate-plugin.py --cli-artifact <locked-cli-artifact>
```

Verify the artifact SHA-256 against `components.lock.json` first. These gates
do not prove marketplace installation/loading, live enrollment, pairing, public
handoff, native hardware, or production deployment.

## Completion evidence

Report canonical and generated files changed, locked CLI repository/commit/hash,
generation/validation results, stale-language scan, repository status, and
every skipped marketplace/live/backend/native gate. Do not claim a reproducible
bundle when the exact locked CLI artifact was unavailable.
