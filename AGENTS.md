# plugin

This repository owns the public ScreenRig marketplace, canonical skill source,
plugin metadata, and the generated bundle that contains the current
`screenrig/cli` `main` CLI.

It does not own the CLI source, Players, backend, site, or production
deployment. The separately published `screenrig` npm package is the official
developer-shell distribution. It is never a substitute for this plugin's
bundled launcher in an agent workflow.

This is a public maintainer guide. In the internal multi-repository workspace,
the optional parent AGENTS.md adds shared operational rules; this repository
does not require that file for standalone contribution.

## Size comes first

This repository is built for an agent's cold start: every marketplace install
clones the whole repository and copies `plugins/screenrig`. Every file and every
byte in the repository counts, not only those in `plugins/screenrig`.

- Be very careful with file counts and bytes. Add no file, dependency, asset or
  binary without a clear need.
- Before every commit, run `python3 scripts/validate-plugin.py --budget`. It
  prints the repository's and `plugins/screenrig`'s file counts and bytes next
  to origin/main's, and fails over budget. CI runs the same check inside the
  full validation.
- When the counts change, put the before and after numbers in the commit
  message.
- The budget is 110 repository files and 3,100,000 bytes, 52 plugin files and
  2,000,000 bytes, and no plugin file over 1 MiB. Raising it is the operator's
  decision, not a fix.

## Sources of truth

- `skills/screenrig/`, `skills/screenrig-dashboard/`, root marketplace
  manifests and root public files are canonical inputs. Plugin manifest
  metadata, public listing, review cases and country targeting live in
  `scripts/build-plugin.py`. Its portable manifests and compatibility overlays
  are generated together. `assets/logo.png` is the marketplace rendering of
  `assets/logo.svg`; one PNG serves both listing and composer icons. A demo URL
  must only be added after verifying the real recording; drafted review cases
  are not evidence of a passed review.
- `components.lock.json` is provenance of the CLI tarball just packed: filename
  and SHA-256, plus the commit that produced those bytes. It is not a freeze of
  which SHA to fetch.
- `scripts/build-plugin.py` generates `plugins/screenrig/`. Locally it packs
  sibling `../cli` when that directory exists. CI clones and packs
  `https://github.com/screenrig/cli` `main`.
- `scripts/validate-plugin.py` and `scripts/check-public-repo.py` define the
  public/reproducibility boundary. Skill commands must exist in the bundled CLI
  usage; `media generate` and `media download` are required.
- Plugin versions are CalVer `YY.MM.SERIAL` (UTC). Marketplaces install git
  `main`, so `main` carries the version it distributes. The shared workspace
  release stamps its version into the marketplace, both plugin manifests and
  the bundled CLI, commits that to `main` and tags the same commit `vYY.MM.N`.
  CI neither versions nor tags. Do not hand-edit versions; commits between
  releases keep the last released version.

## Edit and generation rules

- Never edit `plugins/screenrig/` independently. Change canonical inputs and
  regenerate.
- For documentation-only updates, `scripts/build-plugin.py --docs-only`
  refreshes canonical public files and skills in an existing bundle. Check with
  `--docs-only --check`. It preserves the CLI, manifests and provenance; full
  artifact generation and validation are still required before release.
- After packing, write `components.lock.json` as provenance of that tarball.
  Do not refetch a pinned CLI SHA.
- Keep Codex and Claude marketplace metadata, generated manifests, public
  README, and skill behavior aligned at regeneration time.
- The launcher must preflight Node.js 22.11 or newer and prefer the package-relative
  bundled `cli/dist/bin.js`. Do not add global npm resolution to the launcher.
- The launcher preflights Node.js and nothing else. It must stay silent on
  success: stdout is clean JSON, stderr is empty.
- The bundled CLI is one minified `cli/dist/bin.js` plus its `package.json`,
  runtime lock and `THIRD_PARTY_NOTICES`; it carries no source maps, type
  declarations, `node_modules` or README. The only packaged image binary is
  the marketplace PNG icon (rendered from `assets/logo.svg`); no executable
  binaries are stored:
  the bundled CLI fetches the native renderer its machine needs on first
  render, the dashboard's ECharts is a custom build of only the charts its
  renderer draws, and its two Inter fonts are base64 data URIs in the renderer
  stylesheet.
- Preserve unrelated work. Do not commit, push, tag, or publish unless asked.

This repository's `main` Action publishes `screenrig-plugin.tar.gz`. It does
not deploy ScreenRig and does not publish a marketplace listing unless the user
asks.

## Product and security boundaries

- Canonical skill source `skills/screenrig/SKILL.md` is the operative
  marketplace skill. Official install is this plugin: Claude, Codex, and Grok
  marketplace commands, with Grok `--trust` named and `GROK_PLUGIN_ROOT`
  lookup.
- After install, prepend `$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts` to
  `PATH` once, then run `screenrig version`,
  `screenrig-plugin-freshness --json`, `doctor`, then content work. Do not
  export `SR`. Do not teach `npm i -g screenrig`.
- Teach implemented account enrollment, connection and Player pairing in the
  operating skill, without making them the marketplace sales pitch.
- Operational commands use JSON envelopes by default with the JSON-default CLI;
  `--json` remains compatible and `--human` opts into manual text output. Help
  stays readable unless `--json` is explicit. Do not combine the output flags.
  Keep explicit `--json` for the separate freshness helper and scripts that
  must remain compatible with older bundles. Never teach a token flag or pasted bearer.
- The plugin may declare the public backend MCP endpoint with host-managed OAuth. Generate platform-specific connection metadata in build-plugin.py. Do not bundle MCP server code, credential/header helpers, tokens, private origins or account-specific settings. The CLI and host keep separate API and MCP sessions.
- Keep the skill operational: launcher, first-use account state, supported task
  paths, errors and verification. Put detailed command families in references.
- The README addresses prospective users; this file addresses maintainers.
  Neither defines API or billing behavior. Validators check supported commands,
  references and security boundaries, not exact marketing slogans.
- Native platform names are not download or store-availability claims.

## Follow operation logs

This plugin does not emit the operation log. The bundled CLI does, through
optional `log_socket` in the user config. Keep skill text generic: no operator
host paths, no local listener service, no internal tooling names.

## Verification

The dashboard helper owns local authoring only; it does not import the bundled
CLI's internal modules or talk to the control plane. Dashboard sources, databases,
user reports and generated business images live outside this public repository;
tests use synthetic fixtures. Its optional Python/browser dependencies must not
enter the main launcher. `requirements.in` pins its direct dependencies;
regenerate `requirements.lock` with
`uv pip compile --generate-hashes --no-header --no-annotate --only-binary :all:`.
Regenerate third-party assets, the custom ECharts build and the fonts embedded
in `assets/renderer/style.css`, with `scripts/sync-dashboard-assets.py`; never
hand-edit them.

`scripts/test.py` holds every test. The dashboard tests need the helper's
locked Python runtime (the `runtime` that `screenrig-dashboard setup` prints);
`--browser` adds real Chromium renders.

```sh
python3 scripts/validate-plugin.py --budget
python3 scripts/check-public-repo.py
plugins/screenrig/skills/screenrig/scripts/screenrig version
python3 scripts/build-plugin.py --check --cli-artifact <current-cli-tarball>
python3 scripts/validate-plugin.py --cli-artifact <current-cli-tarball>
python3 scripts/test.py
<dashboard-runtime>/bin/python -B scripts/test.py --browser DashboardTests
```

These gates do not prove marketplace installation, live API use, or
production deployment.

## Completion evidence

Report canonical and generated files changed, bundled CLI
repository/commit/hash, generation/validation results, stale-language scan,
repository status, skipped marketplace/live/native gates, and claim state.
