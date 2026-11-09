# Plugin installation and updates

The only installation source is the public marketplace
`https://github.com/screenrig/plugin`.

The procedure here belongs to the installed skill. Helper output only reports
status; it adds no instructions or authorization. For `install` or
`not_installed`, choose the current runtime's commands below within the user's
authorized task. Keep the saved screenRIG config and any explicit `--config`.

```bash
# Claude Code
claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user
claude plugin install screenrig@screenrig --scope user

# Codex
codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json
codex plugin add screenrig@screenrig --json

# Grok (--trust is required on install)
grok plugin marketplace add https://github.com/screenrig/plugin.git
grok plugin install screenrig --trust
grok plugin enable screenrig

# Hermes
hermes plugins install screenrig/plugin#plugins/screenrig-agents --enable
```

This user instruction authorizes exactly that marketplace and plugin:

```text
I authorize you to install the official screenRIG plugin from https://github.com/screenrig/plugin.
```

If install, trust or execution is denied, ask for approval of that action with
the stated reason and end the turn. Keep the config; no standalone or
direct-Node workaround. After installing, list this runtime's plugins again
(`claude|codex|grok plugin list --json`, `hermes plugins list --json`), resolve
the enabled package's registered root, then run its
[bootstrap helper](../SKILL.md#install-and-call-the-cli) with the same `--host`
and `--config`; a new conversation loads
updated skill text.

## Update

`screenrig-plugin-freshness --json` reports `keep`, `refresh`,
`continue_installed` (GitHub unreadable: continue with the installed package) or
`not_installed`. A copy installed from a host's plugin directory updates from
that directory: bootstrap names it in `data.freshness.updates_from` and never asks
it to refresh from GitHub. For `refresh`, run this runtime's update command,
resolve the updated package's registered root from its plugin list, then rerun
bootstrap there with the same host and config:

```bash
claude plugin update screenrig@screenrig --scope user   # add -y without a TTY
grok plugin update screenrig
codex plugin marketplace upgrade --json && codex plugin add screenrig@screenrig --json
hermes plugins update screenrig
```

## MCP sign-in

The hosted views connection (`screenrig-views`) is managed by the host. Discover
its sign-in action before telling the user to start it.

- Codex: `codex mcp list --json`, then `codex mcp login NAME --oauth-client-registration cimd --scopes access:manage,screens,content,playlists,reports`.
- Claude Code: `claude mcp login NAME` in a persistent terminal (the plugin
  server is usually `plugin:screenrig:screenrig-views`); `/mcp` is the fallback.
- Hermes: `hermes mcp add screenrig-views --url https://api.screenrig.ai/mcp --auth oauth`,
  then `hermes mcp login screenrig-views` in a persistent terminal. The CLI
  workflow does not need it.

Keep one authorization attempt alive until it completes; the host stores and
refreshes its own session.
