# Runtime and commands

Use `screenrig-dashboard --help` and subcommand help for arguments. The helper
returns JSON envelopes; stdout does not contain raw images. `commands` returns
the implemented inventory. `--workspace PATH` is a global option before commands.

```text
doctor
setup
commands
datasets list [--search TEXT]
datasets show ID
datasets register FILE
dashboards list
dashboards show ID
dashboards register FILE
dashboards revise FILE
ingest --batch FILE [--dry-run] [--correct]
snapshot --dashboard ID [--as-of TIMESTAMP] [--revision N]
render --dashboard ID [--snapshot METADATA_FILE] [--as-of TIMESTAMP] [--revision N]
refresh --dashboard ID --batch FILE [--as-of TIMESTAMP] [--correct]
runs --dashboard ID
```

State resolution: explicit `--workspace`, then `SCREENRIG_DASHBOARD_HOME`, then
`$XDG_DATA_HOME/screenrig/dashboards` (default `~/.local/share/screenrig/dashboards`)
on Linux; `~/Library/Application Support/screenrig/dashboards` on macOS;
`%LOCALAPPDATA%\screenrig\dashboards` on Windows. Keep SQLite on local storage.

Setup uses Python 3.11+, a private venv, hashed dependency locks, and Playwright's
matching Chromium. No global installs. Doctor currently reports setup state and
SQLite version; an actual render is the browser capability test. Supported-host
claims require a successful local run. Normal screenRIG commands do not depend
on this runtime.

Snapshots include a payload digest and separate metadata file. Pass its
`*.meta.json` path to render for replay. Snapshot queries use one SQLite read
transaction; corrections are append-only, retaining older record revisions.
The stored snapshot is the authoritative replay artifact.

Completed runs contain `dashboard.webp`, `payload.json`, and `result.json`.
`latest.json` points to the last successful result. Failures do not replace it.
When refresh fails after ingestion, its error still reports accepted counts;
retry rendering or repeat the same input without changing its record keys.

One render per dashboard holds a `render.lock` directory with an owner PID.
After a process crash, inspect the owner and only remove that lock after proving
the process has ended. It is never automatically stolen. Versioned presentation
assets must not be hand-edited; restore or deliberately create a new revision.

New runtime versions refuse to render presentations pinned to a different lock.
Use the original plugin/runtime to replay, or explicitly revise and visually
validate the design with the upgraded runtime. Installing a plugin does not copy
private workspace state to another machine. Backup/migration automation is still
planned; back up SQLite with its online-backup facility and retain source/assets.
