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
- Production deployment belongs only to the backend repository's component
  lock; this repository publishes an artifact and never deploys ScreenRig.

## Edit and generation rules

- Never edit `plugins/screenrig/` independently. Change canonical inputs and
  regenerate with the exact CLI artifact selected by `components.lock.json`.
- Never copy CLI source or a local mutable build into the bundle. Update the
  lock only when intentionally selecting a reviewed CLI CI artifact.
- Keep Codex and Claude marketplace metadata, generated manifests, public
  README, and skill behavior aligned.
- The launcher must remain package-relative, preflight Node.js 20.11+, and
  execute only the bundled `cli/dist/bin.js`.
- The launcher preflights Node.js and nothing else. It must stay silent on
  success: `scripts/check-public-repo.py` and `scripts/validate-plugin.py` both
  require clean JSON on stdout and empty stderr. A dependency that only one
  command needs, such as the media toolchain, belongs to that command in the
  CLI, which can return a machine-readable envelope; it must never fail or warn
  from this shared entry point.
- Preserve unrelated work. Do not commit, push, tag, publish, deploy, or change
  marketplace/GitHub state unless explicitly authorized.

## Product and security boundaries

- Teach only implemented CLI commands. The current `screen pair` parser accepts
  the canonical undashed six characters; `browser setup` accepts the public
  dashed/undashed handoff form.
- Preserve automatic first-use enrollment, machine-readable output, user-private
  configuration outside the plugin directory, and server-first
  `auth revoke --yes`.
- Never expose account credentials, cookies, provisioning fragments, signed
  URLs, customer content, raw headers, or secret-bearing output.
- The plugin does not implement rendering, native auth, package caching, public
  handoff TTLs, or deployment; describe those only from pinned/current owning
  sources.
- Screenshotting is outside v1 and no screenshot command may be documented.

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
