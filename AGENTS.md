# ScreenRig plugin agent guide

This repository owns the public ScreenRig Codex/Claude marketplace, canonical
skill source, plugin metadata, and generated bundle containing the current
`screenrig/cli` `main` CLI. It does not own the CLI source, players, backend,
site, or production deployment. The separately published `screenrig` npm
package is the official developer-shell distribution. It is never a substitute
for this plugin's bundled launcher in an agent workflow.

## Sources of truth

- `skills/screenrig/`, `build/plugin.json`, root marketplace manifests, root
  public files, and `components.lock.json` are canonical inputs.
- `components.lock.json` records provenance of the CLI that was just bundled:
  `screenrig/cli` commit, artifact filename, and SHA-256. It is not a freeze
  that CI may refetch instead of `main`, and it is not a product version.
  Do not invent a SHA; hash the tarball you packed.
- Distributed plugin versions are CalVer `YY.MM.SERIAL` (UTC). Tags are
  `vYY.MM.N`. Committed `.claude-plugin/marketplace.json` is the published
  CalVer (currently `26.09.1`); CI stamps generated `plugin.json` in the
  distributing artifact. Local and pull-request trees use `YY.MM.0-dev`.
  Plugin CI packs `screenrig/cli` `main` and, when that HEAD is tagged
  `vYY.MM.N`, applies the same stamp so the tarball hash is stable.
- `scripts/build-plugin.py` defines generation of `plugins/screenrig/`.
  Locally it may pack sibling `../cli`. CI clones and packs
  `https://github.com/screenrig/cli` `main`.
- `scripts/validate-plugin.py` and `scripts/check-public-repo.py` define the
  public/reproducibility boundary. Skill Commands must exist in the bundled
  CLI usage; `media generate` and `media download` are required.
- This repository publishes an artifact and never deploys ScreenRig.
  **Deploys are independent** (operating rule): this repository's `main`
  Action tags CalVer `vYY.MM.N` and publishes the stamped
  `screenrig-plugin.tar.gz` CI artifact only. No
  marketplace publish unless the user asks later. Do not pack siblings as
  a deploy. Do not dispatch backend. Do not copy deploy tokens between repos.
  Coordinated multi-repo deploy is rare and only for a breaking contract
  change. Vendoring current CLI into `plugins/screenrig/cli` is how
  marketplace git-clone installs get a CLI.

## Edit and generation rules

- Never edit `plugins/screenrig/` independently. Change canonical inputs and
  regenerate from current `screenrig/cli` `main` (or the sibling checkout).
- Local `build-plugin.py` may pack sibling `../cli` when that directory
  exists. After packing, write `components.lock.json` as provenance of that
  tarball. Official rebuild: `python3 scripts/build-plugin.py --cli-artifact
  <tarball> --write-lock --cli-commit <sha>`.
- Keep Codex and Claude marketplace metadata, generated manifests, public
  README, and skill behavior aligned at regeneration time. Canonical skill
  source may lead the generated `plugins/screenrig/` copy until rebuild.
  Never hand-edit `plugins/screenrig/` to close that gap.
- The launcher must preflight Node.js 20.11+ and prefer the package-relative
  bundled `cli/dist/bin.js`. When that file is absent, resolve `cli/dist/bin.js`
  from a plugin-root environment variable or a parent-directory walk so a
  source checkout works without a marketplace install.
- Do not add global npm resolution to the launcher. The npm package is for an
  operator's developer shell; a loaded agent uses the CLI bundled with
  its installed plugin.
- The launcher preflights Node.js and nothing else. It must stay silent on
  success: `scripts/check-public-repo.py` and `scripts/validate-plugin.py` both
  require clean JSON on stdout and empty stderr. A dependency that only one
  command needs, such as the media toolchain, belongs to that command in the
  CLI, which can return a machine-readable envelope; it must never fail or warn
  from this shared entry point.
- Preserve unrelated work. Do not commit, push, tag, publish, deploy, or change
  marketplace/GitHub state unless explicitly authorized.

## Product and security boundaries

- Teach only implemented product commands. Canonical skill source
  `skills/screenrig/SKILL.md` is the operative marketplace skill. Official
  install is this plugin: Claude, Codex, and Grok marketplace commands, with
  Grok `--trust` named and `GROK_PLUGIN_ROOT` lookup. After install, prepend
  `$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts` to `PATH` once, then run
  `screenrig --json version`, `screenrig-plugin-freshness --json`, `doctor`,
  the playlist authoring tree, playlist, and `screen assign`. Refresh the
  installed plugin when that helper reports `data.action` `refresh`. Do not
  export `SR`. Teach choose by what the page is.
  Compose is local unbilled stills for slide-deck-like pages.
  Do not teach `agent enroll`, `screen pair`, `browser setup`, `screen
  provision`, `ABC-234`, or playlist text-slot template tutorials.
- Keep `--json` envelopes. Never teach a token flag or pasted bearer. The
  credential is a user-private file.
- Meter usage in credits. Standard is prepaid. HTTP 402 / `payment_required`
  means do not retry billed commands; point money at
  https://screenrig.ai/pricing/. Write in a feature-complete voice.
- Teach the playlist authoring tree. Choose by what the page is. Do not
  generate an atmosphere plate and compose type onto it. Do not compose a
  presentable poster as named regions + cards.
  1. Existing image or video → `media upload` and place `med_…`. No compose.
     No generate.
  2. Anything presentable (posters, announcements, restaurant menus, event
     art, product stills, public-facing rich static pages) → `media generate`
     as the **whole page**. Put every fact and all copy in the prompt so the
     image model typesets it. ScreenRig generate is the default.
     Own-gen-then-upload remains valid only if
     they already have a preferred model. Do not compose this page. Do not
     generate atmosphere-only stills for later overlay.
  3. Slide-deck-like experiences (title/body/table slides, internal decks,
     measured type that must stay editable as compose JSON) → local unbilled
     `compose render`.
  4. Live objects (a playing video, iframe, or webapp as the page or as
     playlist primitives) → write playlist primitives. Upload the video if
     you have it. Do not local-render stills merely to attach `enter` /
     `motion`. Animation is not a reason to compose.
  `media generate` is billed per still by `--quality`: low $0.06 (600 credits)
  for unimportant generated stills only, medium $0.12 (1200 credits) for most
  cases (default), high $0.50 (5000 credits) for dense text and complex
  posters. Quality changes the image and the price. Do not teach emitting
  native `text`, `box`, or `line` on the playlist wire. Compose is local and
  not billed.
- The category word is **primitive**, never placement, kind, or type. Four
  wire primitives exist: static (`image`), motion (`video`), and web
  (`iframe`, `application`). A page carries `pages[].primitives`, and each
  entry is flat: a `primitive` field naming the family, that family's own
  fields, then `rect`, `layer`, `content_fit`, and optional `enter`. There is
  no nested content object. Image and video primitives take a `selector`
  (`by` is `id`, `ids`, `all`, or `tag`); iframe and application do not.
  `media list` filters with `--primitive`, the API parameter is `primitive`,
  and the event field is `primitive_id`. MIME `--content-type`, `feedback
  --kind`, and transition/enter/advance `type` are unrelated and stay. Teach
  the primitive wire alone: no placement compat shim and no dual-read of the
  retired vocabulary.
- Screenshotting is in v1. `screen screenshot <id>` blocks on a still WebP and
  writes a file. Do not print pixels.
- Human `events list` and `events follow` print logfmt. `--json events list`
  is one JSON page envelope. `--json events follow` is a JSON stream.
- `events follow` reconnects on disconnect or a transient connect failure,
  with exponential backoff, and sends the last SSE `id` as `after`.
  `--timeout` covers the whole follow, including backoff. 401, 403, 404,
  and other non-transient 4xx problems stop the command.

## Follow operation logs

This plugin does not emit the operation log. The CLI does, through optional
`log_socket` in the same user config as the token. Canonical skill source
teaches credential state in `skills/screenrig/SKILL.md` under Output,
configuration, and credential state.

Players emit their own separate logs. The skill documents where each player
family writes (socket path and env override, Android log tag, Windows trace
output, browser console) so an agent can read `params.pairing_code` off a
`pairing.start` row where a player publishes it, and says to fall back to the
code on the glass where one does not. Keep that generic: no operator host
paths, no local listener service, no internal tooling names.

Never print credentials, cookies, `Authorization` headers, signed URLs,
object keys, or pixels.

## Verification

```sh
python3 scripts/check-public-repo.py
plugins/screenrig/skills/screenrig/scripts/screenrig --json version
```

Bundle validation compares the committed `plugins/screenrig` tree to a rebuild
from current `screenrig/cli` `main` (or `--cli-artifact` of that pack):

```sh
python3 scripts/build-plugin.py --check --cli-artifact <current-cli-tarball>
python3 scripts/validate-plugin.py --cli-artifact <current-cli-tarball>
python3 scripts/test-skill-commands.py
python3 scripts/test-plugin-freshness.py
```

`components.lock.json` must match the tarball just packed. These gates do not
prove marketplace installation/loading, live API use, native hardware, or
production deployment.

## Completion evidence

Report canonical and generated files changed, bundled CLI repository/commit/hash
(provenance), generation/validation results, stale-language scan, repository
status, and every skipped marketplace/live/backend/native gate.
