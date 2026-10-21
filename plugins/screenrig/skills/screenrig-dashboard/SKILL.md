---
name: screenrig-dashboard
description: Build and refresh consistent 16:9 dashboard images from recurring JSON, CSV, or messy reports. Preserve schemas, observations, queries, and design between runs. Outputs a 4K WebP for optional publication with screenrig.
---

# Persistent dashboard images

Use the helper next to this skill: `scripts/screenrig-dashboard` (Windows:
`scripts/screenrig-dashboard.cmd`), resolved from this installed skill, never a
global executable. It is independent of the project dashboard that
`screenrig dashboard open` shows, and needs no screenRIG login. Run
`screenrig-dashboard doctor`; if the runtime is missing, `screenrig-dashboard
setup` installs locked Python 3.11+ packages and Chromium into the user cache
without touching system Python. `--help`, `commands` and the
[dashboard schema](schemas/dashboard.json) list arguments and fields. Output is
JSON envelopes; stdout never carries images. `--workspace PATH` (global, before
the command) overrides the state directory, which defaults to the user's
application-data directory (`SCREENRIG_DASHBOARD_HOME` also sets it).

## Datasets

1. Find prior work with `datasets list --search TEXT` and `dashboards list`.
   Read an existing dataset definition before normalizing; match meaning, units
   and record grain, not just column names.
2. Register a new dataset once. Definitions are immutable: a changed meaning
   needs a new ID.

   ```json
   {"id": "daily-orders", "description": "Completed daily orders for one store",
    "grain": "One record per store per reporting window",
    "key": ["store", "period_end"], "time_field": "period_end",
    "fields": {"store": {"type": "string"}, "period_end": {"type": "timestamp"},
               "orders": {"type": "integer", "minimum": 0, "unit": "orders", "kind": "period_total"}}}
   ```

3. Normalize messy reports into typed JSON, NDJSON or CSV/TSV records that match
   the source: decimals as strings, timestamps with offsets, dates as
   `YYYY-MM-DD`. Keep contradictions, gaps and unknown units; do not invent rows,
   treat missing as zero, or read cumulative totals as daily events.
4. `ingest --batch FILE` (`{"inputs":[{"dataset":ID,"path":FILE}]}`, paths
   relative to the manifest) is atomic and deduplicated. A changed value for an
   existing key fails unless the user asked for a correction (`--correct`).

## Create once, refresh repeatedly

First run: write a dashboard definition (fixed 1920 x 1080 layout, widgets
`metric`, `notice`, `line`, `bar`, `table`, `gauge` bound to `latest`, `table`
or `series` queries; widgets sit inside x 40..1880, y 116..1028), `dashboards
register FILE`, `render --dashboard ID`, and inspect the 3840 x 2160 WebP against
the source; revise if needed. Later runs use `refresh --dashboard ID --batch FILE`,
which keeps the registered design; change the design only with `dashboards
revise`. `--as-of` sets a reporting cutoff after the last observation.

Check rendered text, numbers and charts against the source and report data-quality
problems. Show a subset when the source exceeds one screen and say what is
omitted. Return the WebP and its `result.json` path, and say whether it is a first
observation, a refresh or a correction. A failed render keeps the last good image
(`latest.json`).

## Publish only when requested

Hand the WebP to the [screenrig skill](../screenrig/SKILL.md):
`media upload FILE --no-transcode`, then the media ID in the normal playlist
workflow. On a refresh, once the new image plays, delete the media it replaced.
A local image is not proof of display.

## Linux sandbox

Chromium runs sandboxed. Hosts that confine unprivileged user namespaces (Ubuntu
23.10+ AppArmor, many containers) fail with `No usable sandbox`; grant that
browser binary user namespaces rather than rendering without a sandbox. A stale
`render.lock` directory is removed only after its owner PID has ended.
