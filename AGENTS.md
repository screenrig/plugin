# plugin

This public repository owns the screenRIG marketplace, the canonical skill
source, plugin metadata, and the generated bundle that contains the
`screenrig/cli` `main` CLI. It does not own the CLI source, Players, backend or
site. This is a maintainer guide; the optional workspace `AGENTS.md` adds shared
operational rules. The npm `screenrig` package is the developer-shell
distribution, never a substitute for the bundled launcher in an agent workflow.

## Size

Every marketplace install clones the whole repository and copies
`plugins/screenrig`, so every file and byte counts. Add no file, dependency,
asset or binary without a clear need. Before each commit run
`python3 scripts/validate-plugin.py --budget` (CI runs it too) and put the
before and after counts in the commit message. The limits live in that script;
raising them is the operator's decision.

## Sources and generation

- Canonical inputs: `skills/screenrig/`, `skills/screenrig-dashboard/`, the root
  marketplace manifests and root public files. Plugin metadata, listing and
  review cases live in `scripts/build-plugin.py`, which generates
  `plugins/screenrig/` and the portable manifests. Never edit `plugins/screenrig/`
  by hand: change inputs and regenerate. Documentation-only change:
  `scripts/build-plugin.py --docs-only` (verify with `--docs-only --check`); it
  preserves the CLI, manifests and provenance.
- Locally the builder packs sibling `../cli` when present; CI packs
  `https://github.com/screenrig/cli` `main`. `components.lock.json` is provenance
  of the tarball just packed (filename, SHA-256, commit), not a pin to fetch.
- `release-version-files.json` inventories every version-bearing file; add new
  ones there when you generate them. Versions are CalVer `YY.MM.SERIAL` (UTC);
  `main` carries the released version and the workspace release stamps and tags
  it. CI neither versions nor tags; do not hand-edit versions.
- The launcher preflights Node.js 22.23.4+, 24.22.1+, or 26.12.1+ (excluding 23.x and 25.x) and nothing else, prefers the
  package-relative `cli/dist/bin.js`, then the host's `*_PLUGIN_ROOT` variable
  (a source checkout sets `SCREENRIG_PLUGIN_ROOT`), never searches parent
  directories, adds no global npm resolution, and is silent on success (clean
  JSON on stdout, empty stderr).
- The bundled CLI is one minified `cli/dist/bin.js` plus `package.json`, the
  runtime lock and `THIRD_PARTY_NOTICES`: no source maps, `node_modules` or
  executables. The only image binary is the marketplace PNG from `assets/logo.svg`.
- Do not commit, push, tag or publish unless asked.

## Skill content

- `skills/screenrig/SKILL.md` is the operative skill: launcher, first-use state,
  task paths, errors and verification. CLI help and the public docs own command
  detail; keep the skill and `references/` to workflow and rules help text cannot
  carry. `README.md` addresses prospective users; neither defines API or billing
  behavior.
- Install is the plugin (Claude, Codex, Grok with `--trust` named). After install,
  `screenrig-plugin-freshness --bootstrap --json` verifies registration; agents
  call the CLI through its `--run`. Do not teach `npm i -g screenrig`, exporting
  `SR`, a token flag or a pasted bearer.
- Operational commands return JSON envelopes by default; `--human` is for manual
  text and never combines with `--json`. Keep explicit `--json` only for the
  freshness helper and scripts that must work with older bundles.
- The plugin declares the public backend MCP endpoint with host-managed OAuth,
  generated per platform in `build-plugin.py`. Bundle no MCP server code,
  credential helper, token, private origin or account setting.
- Keep skill text generic: no operator host paths or internal tooling names.
  Native platform names are not download or store claims. Add a demo URL only
  for a real recording.
- The dashboard helper authors locally: it does not import the CLI's modules or
  call the control plane, its Python/browser dependencies stay out of the
  launcher, and tests use synthetic fixtures. Regenerate `requirements.lock` from
  `requirements.in` with `uv pip compile --generate-hashes --no-header
  --no-annotate --only-binary :all:`, and vendored assets and fonts with
  `scripts/sync-dashboard-assets.py`.

## Checks

`scripts/test.py` holds every test (`--browser` adds Chromium renders and needs
the helper's locked runtime). The public/reproducibility boundary is
`scripts/validate-plugin.py` and `scripts/check-public-repo.py`.

`validate-plugin.py` fails when a skill or reference writes, as code, a
`screenrig` command path missing from the bundled CLI's `help --all`, or an MCP
tool name missing from `scripts/mcp-tools.json`. That list is the backend's
public tool list, vendored by `contracts.toml` (`rig contracts sync plugin`; CI
runs `sha256sum --strict -c contracts.sha256`), so every run checks tool names
and a missing or malformed list fails. The check judges names only, not flags,
arguments, prose or a path written without its group (`update|pause` after
"campaign").

```sh
python3 scripts/validate-plugin.py --budget
python3 scripts/check-public-repo.py
python3 scripts/build-plugin.py --check --cli-artifact <current-cli-tarball>
python3 scripts/validate-plugin.py --cli-artifact <current-cli-tarball>
python3 scripts/test.py
```

These gates do not prove marketplace installation or live API use.
