# ScreenRig agent plugin

ScreenRig is an agent-first digital-signage and kiosk workflow. Install the
plugin from the ScreenRig marketplace, open the Player, then ask your agent to
pair the six-character code shown on screen.

This distributable contains the ScreenRig skill and its pinned, self-contained
CLI. The wrapper resolves only the bundled CLI; it does not download or execute
a mutable command at runtime. Agent workflows use machine-readable output and
keep credentials in user-private application state outside the replaceable
plugin directory.

The canonical customer command is `screen pair CODE [--label LABEL]`. The
plugin also supports implemented application, playlist, media, screen, event,
and application K/V operations documented by the bundled skill.

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
