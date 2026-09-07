# ScreenRig plugin agent guide

This repository owns the public ScreenRig Codex/Claude marketplace, canonical
skill source, plugin metadata, and generated bundle containing a pinned CLI. It
does not own the CLI source, players, backend, site, or production deployment.
The separately published `screenrig` npm package is the official developer-shell
distribution. It is never a substitute for this plugin's pinned launcher in an
agent workflow.

## Sources of truth

- `skills/screenrig/`, `build/plugin.json`, root marketplace manifests, root
  public files, and `components.lock.json` are canonical inputs.
- `components.lock.json` pins the exact `screenrig/cli` commit, artifact
  filename, and SHA-256. That lock is not a product version and does not
  store CalVer. The first CLI tarball that stamps CalVer into package.json
  will not match the locked sha256 until ops re-locks; do not invent a SHA.
- Distributed plugin versions are CalVer `YY.MM.SERIAL` (UTC). Tags are
  `vYY.MM.N`. Committed `.claude-plugin/marketplace.json` stays `0.1.2`;
  CI stamps generated `plugin.json` in the artifact. Local and pull-request
  trees use `YY.MM.0-dev`. Plugin CI fetches the CLI commit's `vYY.MM.*`
  tag and applies the same stamp so the rebuilt tarball hash does not drift.
- `scripts/build-plugin.py` defines generation of `plugins/screenrig/`.
- `scripts/validate-plugin.py` and `scripts/check-public-repo.py` define the
  public/reproducibility boundary.
- This repository publishes an artifact and never deploys ScreenRig.
  **Deploys are independent** (operating rule): this repository's `main`
  Action tags CalVer `vYY.MM.N` and publishes the stamped
  `screenrig-plugin.tar.gz` CI artifact only. No
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
- Do not add global npm resolution to the launcher. The npm package is for an
  operator's developer shell; a loaded agent uses the reviewed CLI bundled with
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
  `screenrig --json version`, `doctor`, the playlist authoring tree, playlist,
  and `screen assign`. Do not export `SR`. Teach choose by what the page is.
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

Bundle validation and reproduction require the exact locked CLI artifact:

```sh
python3 scripts/build-plugin.py --check --cli-artifact <locked-cli-artifact>
python3 scripts/validate-plugin.py --cli-artifact <locked-cli-artifact>
```

Verify the artifact SHA-256 against `components.lock.json` first. These gates
do not prove marketplace installation/loading, live API use, native hardware,
or production deployment.

## Completion evidence

Report canonical and generated files changed, locked CLI repository/commit/hash,
generation/validation results, stale-language scan, repository status, and
every skipped marketplace/live/backend/native gate. Do not claim a reproducible
bundle when the exact locked CLI artifact was unavailable.
