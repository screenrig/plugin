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
- Teach implemented account enrollment, connection and Player pairing in the
  operating skill, without making them the marketplace sales pitch.
- Keep `--json` envelopes. Never teach a token flag or pasted bearer.
- Never write MCP. `validate-plugin.py` rejects MCP manifests.
- Keep the skill operational: launcher, first-use account state, supported task
  paths, errors and verification. Put detailed command families in references.
- The README addresses prospective users; CONTRIBUTING.md addresses maintainers.
  Neither defines API or billing behavior. Validators check supported commands,
  references and security boundaries, not exact marketing slogans.
- Native platform names are not download or store-availability claims.

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
