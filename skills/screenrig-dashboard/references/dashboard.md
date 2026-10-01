# Saved dashboards

Definitions conform to [the executable schema](../schemas/dashboard.json).
Use `dashboards register FILE`, then `render --dashboard ID`. A changed design
requires `dashboards revise FILE`; refresh never edits it. Saved copies of
HTML/CSS/JS, ECharts, and fonts live with each revision.

Required top-level fields: `id`, `title`, `subtitle`, `timezone`, `queries`,
`widgets`. Optional: `theme` (`dark-modern` or `light`), `window_hours` (default 24).
The logical canvas is 1920 × 1080. Header/footer are reserved: widget rectangles
must fit x=40..1880 and y=116..1028 and cannot overlap. Each widget has `id`,
`type`, `title`, `query`, and `[x,y,width,height]` in `rect`.

Queries bind registered datasets:

- `latest`: one latest observation, with a `filter` when dimensions could tie.
- `table`: the latest observed period by default, stable `order_by` entries
  (`field`, `direction`), and a declared `limit` up to 30. `latest_period:false`
  includes history. The result reports omitted rows.
- `series`: numeric `field`, `interval` hour/day, `count` up to 2,000, and
  `aggregate` sum/latest. Sum requires a `period_total` or `event_count` field.
  Each bucket includes its left endpoint and excludes its right endpoint.
  A period's timestamp therefore denotes its start for these series. Hourly
  windows follow UTC hours; daily boundaries use the saved IANA timezone.

All query modes accept exact-value `filter` objects. Examples:

```json
{
  "totals": {"dataset":"daily-orders", "mode":"latest", "filter":{"store":"north"}},
  "history": {"dataset":"hourly-orders", "mode":"series", "field":"orders", "interval":"hour", "count":24, "aggregate":"sum"}
}
```

Widget types and bindings:

| Type | Binding |
| --- | --- |
| metric | latest query, `field`, optional `format`, `decimals`, and `note`/`note_field` |
| notice | latest query and a text `field` |
| line | series query; optional `min`, `max`, `color`, and `note` |
| bar | table query, numeric `field`, `label_field`, optional `color`/`note` |
| table | table query, `columns` with `field`, `label`, optional `format`/`decimals` |
| gauge | latest query, numeric `field`, defined `min` and `max` |

Formats: number, percent, text, bytes (decimal byte scaling), usd. Use reported
unit text if the source's byte convention is uncertain. All labels are inserted
as text. Chart interpolation across missing buckets is disabled. No invented
prior days or trend arrows. Displayed values remain bound to query output.

The effective cutoff defaults to the latest observation time across the bound
datasets. Pass `--as-of` for a reporting window ending after the last observation.
Data from different source periods must disclose its source timestamp/period in
the presentation; the default cutoff alone does not establish equal freshness.

Theme, geometry, colors, axes, limits, and output quality remain fixed in a
revision. Default WebP quality is 90. Exact repeat pixels are tested within the
same pinned runtime; arbitrary OS/browser changes are not pixel-identical.

The first release supports fixed component layouts rather than custom executable
templates, one series per line widget, and gap-only missing data. Ratios and
counter deltas must arrive as explicitly defined normalized metrics; automatic
weighted-ratio/counter-reset calculation is not implemented.
