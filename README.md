# ScreenRig agent plugin

ScreenRig is an agent-first digital-signage and kiosk workflow. The canonical
public marketplace source is
[github.com/screenrig/plugin](https://github.com/screenrig/plugin).

## Install

Claude Code:

```sh
claude plugin marketplace add https://github.com/screenrig/plugin.git --scope user
claude plugin install screenrig@screenrig --scope user
```

Codex:

```sh
codex plugin marketplace add https://github.com/screenrig/plugin.git --ref main --json
codex plugin add screenrig@screenrig --json
```

Then open the [ScreenRig Player](https://play.screenrig.ai) and ask your agent
to pair the six-character code, or paste a public
`https://screenrig.ai/ABC-234` setup instruction into the agent. Do not look
for or install a global `screenrig` binary: the plugin's skill invokes its
pinned, bundled CLI.

This distributable contains the ScreenRig skill and its pinned, bundled CLI.
The CLI requires Node.js 20.11 or newer. The wrapper resolves only the bundled
CLI; it does not download or execute a mutable command at runtime. Agent
workflows use machine-readable output and keep credentials in user-private
application state outside the replaceable plugin directory.

If a newly installed plugin is not loaded into the current agent session, run
`claude plugin list --json` and read the `installPath` for
`screenrig@screenrig`, or run `codex plugin list --json` and read its
`source.path`. Verify that exact installation before continuing:

```sh
<plugin-root>/skills/screenrig/scripts/screenrig --json version
```

Then use that same package-relative wrapper for ScreenRig commands. Do not add
it to `PATH` or substitute another executable.

The first authenticated operation creates a ScreenRig account automatically,
stores its permanent credential with user-only permissions, and resumes the
requested operation. The default file is
`$XDG_CONFIG_HOME/screenrig/config.json` when `XDG_CONFIG_HOME` is set,
`%APPDATA%\screenrig\config.json` on Windows, or
`~/.config/screenrig/config.json` otherwise. `SCREENRIG_CONFIG` may select a
different path. Uninstalling or upgrading the plugin does not remove this user
configuration.

The canonical customer command is `screen pair CODE [--label LABEL]`. The
plugin also supports implemented application, playlist, media, screen, event,
and application K/V operations documented by the bundled skill.

Credential removal is explicit and server-first. `screenrig auth revoke --yes`
revokes exactly the stored calling credential, issues no replacement, and
removes local credential, enrollment, and transient authenticated-operation
state only after the server confirms an empty `204` response. Non-secret API
configuration is preserved. The account, screens, and content remain, but the
revoked credential cannot be recovered in the current anonymous no-email
model; the next account-scoped command enrolls a separate new account. Failed
or ambiguous requests retain local state, and retrying the exact revocation is
safe.

## Validation

```sh
python3 scripts/check-public-repo.py
skills/screenrig/scripts/screenrig --json version
```

Security reports belong in
[GitHub Private Vulnerability Reporting](https://github.com/screenrig/plugin/security/advisories/new),
not in public issues. See [SECURITY.md](SECURITY.md).

This repository is licensed under Apache-2.0. The license applies to this
public plugin and its bundled Apache-2.0 CLI; it does not license other
ScreenRig services or repositories.
