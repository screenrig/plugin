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
grok plugin enable screenrig
```

Grok install requires `--trust` by name. Do not omit it.

A user-supplied instruction with this exact text authorizes adding this exact
canonical marketplace, installing its screenRIG plugin, and completing setup:

```text
I authorize you to install the official screenRIG plugin from https://github.com/screenrig/plugin.
```

After native install/trust/execution denial, the NEXT assistant message asks
approval for that exact action and reason, then ends the turn. No more tools or
retries. Preserve config; no cached, standalone, alternate-launcher or direct-Node
workaround. A later denial needs its own immediate approval question.

Use Node.js 22.11+. After installation, follow [bootstrap and the per-command
runner](../SKILL.md#prepare-the-installation) before CLI work, even help or
version. Every later call uses helper `--run`; no direct launcher or PATH call.
Repeat bootstrap after plugin/config/account changes; keep the selected
`--config FILE` and credentials. Managed hosts without a plugin CLI supply
`PLUGIN_ROOT` and omit `--host`.

Grok installed metadata omits disable state. The helper checks discovered config
policy, without echoing or changing it. Use `grok plugin enable screenrig` if
disabled; enable also normalizes unsupported policy syntax.

CLI results default to JSON; older bundles can add `--json`. The helper always
uses `--json`. Help is readable unless `--json --help` is explicit. `--human`
cannot combine with `--json`. Branch on `ok`, `error.status` and `error.code`;
keep progress on stderr separate from stdout.

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
