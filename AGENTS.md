# plugin

This public repository owns the screenRIG marketplace, the canonical skill
source, plugin metadata, and the generated bundle that contains the
`screenrig/cli` `main` CLI. It does not own the CLI source, Players, backend or
site. This is a maintainer guide; the optional workspace `AGENTS.md` adds shared
operational rules. The npm `screenrig` package is the developer-shell
distribution, never a substitute for the bundled launcher in an agent workflow.

## Size

Every marketplace install clones the whole repository and copies one plugin
folder, so every file and byte counts. Each folder and the repository have a
budget. Add no file, dependency, asset or binary without a clear need. Before
each commit run `python3 scripts/validate-plugin.py --budget` (CI runs it too)
and put the before and after counts in the commit message. The limits live in
that script; raising them is the operator's decision.

## Plugin folders

Two generated folders carry the same skills and bundled CLI:

| Folder | Installed by | Reads |
|---|---|---|
| `plugins/screenrig` | Claude and Grok (`.claude-plugin/marketplace.json`) | `.claude-plugin/plugin.json` with the inline `mcpServers` |
| `plugins/screenrig-agents` | Codex (`.agents/plugins/marketplace.json`), OpenClaw | `.codex-plugin/plugin.json` and `.mcp.json`, portable `plugin.json` and `mcp.json`, `openclaw.plugin.json`, `assets/logo.png` |

Codex would fall back to the Claude index without `.agents/plugins/marketplace.json`,
so that index exists. Grok has no index of its own: it reads the Claude index,
which keeps installs registered under `plugins/screenrig` updating. The Claude
plugin directory scans `plugins/screenrig` and holds any image or font a
command, hook or script can reach, so that folder holds no image or font file
and no manifest but `.claude-plugin/plugin.json`, which names no icon
(`validate-plugin.py` fails on either). Codex needs `./`-relative logo paths
inside its folder, which is why the logo lives in the agents folder.

## Sources and generation

- Canonical inputs: `skills/`, the root
  marketplace manifests and root public files. Plugin metadata, listing and
  review cases live in `scripts/build-plugin.py`, which generates both plugin
  folders and their manifests. Never edit `plugins/` by hand: change inputs and
  regenerate. Documentation-only change:
  `scripts/build-plugin.py --docs-only` (verify with `--docs-only --check`); it
  preserves the CLI, manifests and provenance.
- Locally the builder packs sibling `../cli` when present; CI packs
  `https://github.com/screenrig/cli` `main`. `components.lock.json` is provenance
  of the tarball just packed (filename, SHA-256, commit), not a pin to fetch.
- `release-version-files.json` inventories every version-bearing file in both
  folders; add new ones there when you generate them. Versions are CalVer `YY.MM.SERIAL` (UTC);
  `main` carries the released version and the workspace release stamps and tags
  it. CI neither versions nor tags; do not hand-edit versions.
- The launcher preflights Node.js 22.23.4+, 24.22.1+, or 26.12.1+ (excluding 23.x and 25.x) and nothing else, prefers the
  package-relative `cli/dist/bin.js`, then the host's `*_PLUGIN_ROOT` variable
  (a source checkout sets `SCREENRIG_PLUGIN_ROOT`), never searches parent
  directories, adds no global npm resolution, and is silent on success (clean
  JSON on stdout, empty stderr).
- The bundled CLI is the minified `cli/dist/bin.js` and the flat `cli/dist/*.js`
  chunks it loads per command group, its `cli/assets/` files, `package.json`, the
  runtime lock and `THIRD_PARTY_NOTICES`: no source maps, `node_modules`, native
  modules or executables. The only image binary is the listing PNG from
  `assets/logo.svg`, in `plugins/screenrig-agents` only.
- The Claude plugin directory reads at most 256 KiB of any script or document
  and holds a larger one for review; `validate-plugin.py --budget` fails on one.
  Nothing in the plugin may download and run code (the CLI fetches no renderer
  or other binary).
- The directory scan reads these as a credential taken from the environment or
  as download-and-execute: a script that hands over, copies or iterates
  `process.env` or reads `process.env[name]`, a bearer header example, a
  credential variable such as `$X_TOKEN`, `curl ... | sh`, `printenv`, and the
  word "pass" (the pass password manager). Scripts read each variable by
  literal name (`process.env.CLAUDE_PLUGIN_ROOT`), spawn children without an
  `env` option and set `process.env.SCREENRIG_INSTALL_SOURCE` before spawning;
  skills and docs word these without the phrases ("give", "supply", "bearer
  credential"). `validate-plugin.py` checks the patterns.
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
  freshness helper.
- The plugin declares the public backend MCP endpoint with host-managed OAuth,
  generated per platform in `build-plugin.py`. Bundle no MCP server code,
  credential helper, token, private origin or account setting.
- Keep skill text generic: no operator host paths or internal tooling names.
  Native platform names are not download or store claims. Add a demo URL only
  for a real recording.

## Checks

`scripts/test.py` holds every test. The public/reproducibility boundary is
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
