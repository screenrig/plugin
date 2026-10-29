# Reports, exports and schedules

Reports read aggregates (uptime rollups, alert history, screen state, direct campaign delivery), never raw events.

## Read a rollup

- `reports list` names the kinds and their filters: `fleet_health`, `uptime`, `publishing`, `alerts`, `alert_log` and `proof_of_play`.
- `reports show KIND --from DAY --to DAY` covers inclusive UTC days (default 30). A folder row counts every screen in it and in the folders inside it, and the first row is the whole project. `--group-by screen|tag`, `--folder-id ID` (with `--direct`: the folder's own screens or child folders) and `--tag TAG` narrow it.
- Rows carry `id`, `parent_id` and `depth` for a folder outline. Availability is online over recorded time; `recorded` says how much of the period screens reported.

## Write a file

- `--format csv|xlsx|pdf --output FILE` on `reports show`, `alerts list`, `project uptime|health-trend`, `screen uptime|health-history`, `playback list|plays|totals|completeness` and `ads reports delivery|fill|spend`, `ads direct report`. The envelope has `path`, `bytes` and `sha256`; quote them with the file.
- A sponsor's statement: `reports show proof_of_play --advertiser "Acme" --from 2026-10-01 --to 2026-10-31 --format pdf --output acme.pdf`. A play counts when the screen reports the media completed.

## Email on a schedule

- `reports subscriptions create --name NAME --kind KIND --cadence daily|weekly|monthly [--weekday D --day-of-month N] --hour H --timezone ZONE --format pdf|xlsx|csv --recipients MEMBERS [--filter NAME=VALUE]`.
- Recipients are project members (user id or member email); anyone else is refused. Each run covers the period before it in UTC days. A failed run retries, then waits; read `last_status` and `last_error`. At most 50 per project.

## Export a project

- `project export DIR` writes `export.json` (every file with size and SHA-256), JSON for screens, folders, tags, schedules, playlists with every revision, campaigns, cards, sources, notifications, webhooks and applications, `media/files` with `media/manifest.json`, CSV under `data/` and `log/events.jsonl`. Secrets are never written. `--no-media` skips media and `--since DAY` starts the CSV data. Rerunning keeps complete media and continues partial downloads; `data.complete` false means a section failed, so run it again.
