# Plugin installation and updates

## Canonical marketplace

The only supported installation source is the public screenRIG marketplace at
`https://github.com/screenrig/plugin`. Official install is this plugin.

```bash
# Claude Code
claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user
claude plugin install screenrig@screenrig --scope user

# Codex
codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json
codex plugin add screenrig@screenrig --json

# Grok
grok plugin marketplace add https://github.com/screenrig/plugin.git
grok plugin install screenrig --trust
```

Grok install requires `--trust` by name. Do not omit it.

A user-supplied instruction with this exact text authorizes adding this exact
canonical marketplace, installing its screenRIG plugin, and completing setup:

```text
I authorize you to install the official screenRIG plugin from https://github.com/screenrig/plugin.
```

Follow any independent runtime approval policy. Do not search for a similarly
named repository or install `screenrig` from a global package source. Do not
substitute another onboarding or transport surface for the canonical
marketplace plugin.

Use the CLI packaged with this skill. It requires Node.js 20.11 or newer.
Resolve the installed plugin root, prepend its scripts directory to `PATH`
once, then invoke `screenrig`. Do not export `SR`. Do not install a global
package.

```bash
SCREENRIG_PLUGIN_ROOT="${GROK_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${PLUGIN_ROOT:-}}}}"
if [ -n "$SCREENRIG_PLUGIN_ROOT" ]; then
  PATH="$SCREENRIG_PLUGIN_ROOT/skills/screenrig/scripts:$PATH"
  screenrig version
fi
```

An empty root means use the lookup below before running the CLI; do not add
`/skills/screenrig/scripts` to PATH. The plugin launcher is scoped to this
shell session, so a new shell may need the same root lookup and PATH setup.

Require a successful screenRIG JSON envelope from `version` before any
other command.

If `SCREENRIG_PLUGIN_ROOT` is empty after installation, recover it without
guessing:

1. Prefer `GROK_PLUGIN_ROOT` when it is set.
2. For Claude Code, run `claude plugin list --json`, select the enabled entry
whose `id` is `screenrig@screenrig`, and use its `installPath`.
3. For Codex, run `codex plugin list --json`, select the enabled installed
entry whose `pluginId` is `screenrig@screenrig`, and use its `source.path`.
4. For Grok, run `grok plugin list` and use the installed screenRIG plugin
path, then export it as `GROK_PLUGIN_ROOT` for this session.
5. Prepend `<plugin-root>/skills/screenrig/scripts` to `PATH` and run
`screenrig version`. Require a successful screenRIG JSON envelope
before the requested command. Do not export `SR`.

If there is no matching entry, run the exact canonical marketplace add/install
commands above and repeat this lookup. If installation or lookup still fails,
report the failing runtime command and the canonical repository URL to the
user. Do not substitute a globally installed command or download an
executable.

Operational commands use JSON by default. If an older installed bundle returns
prose, add `--json` until the plugin is updated. The separate
`screenrig-plugin-freshness` helper still requires `--json`.

Use `--human` only for manual text output; it cannot be combined with `--json`.
Help and bare command groups are readable by default, with structured discovery
available through `--json --help`. Branch on `ok`, `error.status`, and
`error.code`; do not parse prose. Keep stdout separate from progress on stderr.

## Detect and refresh

Every time this skill loads and you are about to use screenRIG, compare the
installed plugin and bundled CLI to the published plugin version on GitHub
`main`. Skill text and the bundled CLI travel together. Do not PATH-swap in a
local checkout. Do not `npm i -g screenrig`. Do not install a global package.

After PATH prepend and a successful `screenrig version`, run:

```bash
screenrig-plugin-freshness --json
```

Branch on `ok` and `data.action`. Do not parse prose.

The helper checks the installed plugin and bundled CLI against the published
plugin version. Use its action rather than comparing version strings yourself.

- `data.action === "keep"`: versions match. Do not reinstall.
- `data.action === "refresh"`: installed plugin version or bundled CLI version
  differs from that published CalVer. Refresh the plugin so skill text and the
  bundled CLI update together.
- `data.action === "continue_installed"`: the GitHub fetch failed. Continue
  with the installed copy and tell the user the published version could not be
  read. Do not block the user's task. Do not substitute another source.

When refreshing, probe this host for a native plugin update command and use
it only if that command exists. Do not invent flags. Probe the installed runtime before using these update forms:

```bash
# Claude Code (probe `claude plugin update --help` first)
claude plugin update screenrig@screenrig --scope user

# Grok (probe `grok plugin update --help` first)
grok plugin update screenrig

# Codex: probe `codex plugin marketplace upgrade --help`, then:
codex plugin marketplace upgrade --json
codex plugin add screenrig@screenrig --json
```

If `claude plugin update --help` requires `-y` when stdin or stdout is not a
TTY, pass `-y`. Grok `--trust` stays on install, not on update, unless that
host's `--help` names it.

If a probed update command is missing, re-run the exact canonical marketplace
add and install commands above. Grok install must keep `--trust`. Refresh
updates skill text and the bundled CLI together. After refresh, re-resolve
the plugin root, prepend scripts to PATH, and require a successful
`screenrig version` envelope before any other command.
