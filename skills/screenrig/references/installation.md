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

If runtime approval rejects install, trust or execution, return its action and
reason and ask approval. Run no further screenRIG command, including help,
version, doctor or status. Inspecting a script grants no execution approval.
Preserve config; no cached, standalone, alternate-launcher or direct-Node retry.

Use Node.js 22.11+. Check this enabled plugin list BEFORE any CLI call, including
help/version/doctor/status. Use canonical install directly when absent; other
marketplaces need no configuration investigation:

1. Claude Code: `claude plugin list --json`, select `id: screenrig@screenrig`, use `installPath`.
2. Codex: `codex plugin list --json`, select `pluginId: screenrig@screenrig`, use `source.path`.
3. Grok: `grok plugin list --json`, select `screenrig`, use its installed path.

Saved credentials do not establish registration. Install/enable when missing,
preserving config, then repeat the lookup and use its actual root:

```text
node <root>/skills/screenrig/scripts/screenrig-plugin-freshness --bootstrap --json --host <claude|codex|grok>
```

A managed host with `PLUGIN_ROOT` and no plugin CLI omits `--host`. Follow
bootstrap's `data.action`; use `data.launcher`, or helper `--host HOST --run
COMMAND...`, per command. Avoid guessed cache versions and shell PATH state.

The existing freshness-only command remains `screenrig-plugin-freshness --json`.
`--bootstrap --config FILE` uses that exact selected CLI config for doctor and
saved-connection checks; keep the same selection for later commands.

Operational commands use JSON by default. If an older installed bundle returns
prose, add `--json` until the plugin is updated. The separate
`screenrig-plugin-freshness` helper still requires `--json`.

Use `--human` only for manual text output; it cannot be combined with `--json`.
Help and bare command groups are readable by default, with structured discovery
available through `--json --help`. Branch on `ok`, `error.status`, and
`error.code`; do not parse prose. Keep stdout separate from progress on stderr.

## Detect and refresh

Bootstrap includes freshness. For a freshness-only check, run
`screenrig-plugin-freshness --json` from the registered package:

- `keep`: installed plugin and CLI match or exceed the published CalVer; continue.
- `refresh`: update the plugin and CLI together using the commands below.
- `continue_installed`: GitHub could not be read; disclose that and continue
  with the installed package.
- `not_installed`: this helper is outside a package; use canonical installation
  and its registered helper for agent work.

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

If the update command is absent, repeat canonical add/install; Grok keeps
`--trust`. Resolve the updated registry path and rerun bootstrap. Its bundled
CLI works immediately; a new conversation loads updated skill text.

## Host authentication examples

The shared skill uses capability discovery. These examples apply only when the
executable manages the current host's registered MCP connection; verify installed
command help first. Other hosts can expose equivalent native sign-in tools.
Never install a different host CLI just to authenticate the current host.

- Codex: inspect `codex mcp list --json` and `codex mcp get NAME --json`.
  When supported, initiate `codex mcp login NAME --oauth-client-registration cimd --scopes access:manage,screens,content,playlists,reports`.
- Claude Code: check `claude mcp login --help`, then use
  `claude mcp login NAME` in a persistent interactive terminal. The plugin server
  is commonly `plugin:screenrig:screenrig-views`; use its discovered name.
  The interactive `/mcp` sign-in panel is a fallback when agent-triggered login
  is unavailable. Do not assume Desktop or Cowork uses the same controls/store.

Keep one authorization attempt alive until it completes. The person signs in
and approves; the host stores and refreshes its own OAuth session. Follow the
shared skill's bounded rediscovery/reconnect flow after successful consent.
