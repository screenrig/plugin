---
name: screenrig-dashboard
description: Build and refresh consistent 16:9 dashboard images from recurring JSON, CSV, or messy reports. Preserve schemas, observations, queries, and design between runs. Outputs a 4K WebP for optional publication with screenrig.
---

# Persistent dashboard images

Use the helper next to this skill: `scripts/screenrig-dashboard` (Windows:
`scripts/screenrig-dashboard.cmd`). Resolve that path from this installed skill;
do not substitute a global executable. The helper is independent of the project
dashboard opened by `screenrig dashboard`.

Run `screenrig-dashboard doctor`. If its optional runtime is missing, use
`screenrig-dashboard setup` as part of an authorized dashboard-generation task.
Setup needs Python 3.11+ and downloads locked packages and Chromium into the user
cache. It does not alter system Python. No screenRIG login is needed to generate.

## Interpret and retain input

1. Use `datasets list --search TEXT` and `dashboards list` to find prior work.
   Default state lives in the user's application-data directory; `--workspace`
   overrides it. Never store user data in the installed skill or source checkout.
2. Read the existing dataset definition before normalization. Match meaning,
   units, and record grain, not just column names. Ask only when ambiguity cannot
   be resolved from the supplied facts.
3. For a new dataset, define fields, natural keys, observation timestamps, units,
   and grain. Read [data contracts](references/data.md). Keep separate source
   scopes separate even when their metric labels coincide.
4. Normalize prose and messy tables into typed JSON records and compare them to
   the source. Preserve the original privately. Retain contradictions, missing
   intervals, rounded source values, and unknown units. Do not invent rows,
   equate missing to zero, or reinterpret cumulative totals as daily events.
5. Register schemas and ingest a batch manifest. Retries are deduplicated.
   A changed value for an existing natural key fails unless the user requested a
   correction; `--correct` retains a new revision rather than discarding history.

## Create once, refresh repeatedly

On the first run, read [dashboard definitions](references/dashboard.md), choose
meaningful widgets and write a saved definition. Use dark-modern by default.
Register it, render real data, inspect the WebP, and revise the first design if
necessary. Keep the fixed 1920 × 1080 layout; output is 3840 × 2160 WebP.

Use `refresh --dashboard ID --batch FILE` on subsequent runs. It preserves the
registered schema, queries, colors, theme, and layout. Design changes use an
explicit `dashboards revise` request, never an incidental refresh. With one
daily observation, show one observation; supplied hourly observations can still
form an intraday chart. Missing hours remain null gaps.

Inspect actual rendered text, numbers, and charts against the source. Report
material data-quality issues. A funnel must not imply visitor conversion when
its stages use unrelated populations or include cumulative inventory counts.
Pick a readable subset when the source exceeds one screen; retain all data and
state what the image omits. Mask or omit unnecessary personal identifiers in
the visible dashboard while preserving authorized source data privately.

Return the generated WebP and its immutable result-manifest path. Name whether
it is a first observation, a refresh, or a correction. A failed render preserves
the last successful image; inspect returned ingestion status before retrying.
Read [runtime commands](references/runtime.md) for setup, replay, and recovery.

## Publish only when requested

For a request to put the dashboard on a screen, hand the generated WebP to the
existing [screenrig skill](../screenrig/SKILL.md). Use its bundled
`media upload FILE --no-transcode` path, then the returned ready media ID in the
normal playlist workflow. The output is already lossy delivery WebP, so avoid a
second encoding pass. Preserve unrelated playlist content. Follow that skill's
project, target, retry, and playback-verification rules. A local image is not
proof of publication or physical display.
