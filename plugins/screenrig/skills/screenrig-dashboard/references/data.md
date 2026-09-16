# Data contracts

`datasets register FILE` takes an immutable definition:

```json
{
  "id": "daily-orders",
  "description": "Completed daily orders for one store",
  "grain": "One record per store per reporting window",
  "key": ["store", "period_end"],
  "time_field": "period_end",
  "fields": {
    "store": {"type": "string"},
    "period_end": {"type": "timestamp"},
    "orders": {"type": "integer", "minimum": 0, "unit": "orders", "kind": "period_total"},
    "revenue": {"type": "decimal", "scale": 2, "unit": "CAD", "kind": "period_total"}
  }
}
```

Types: string, integer, decimal, boolean, date, timestamp, opaque json. Nullable
fields declare `nullable: true`; all others are required. Decimals arrive as
strings and are stored as scaled integers. Excess precision is rejected, not
rounded. Timestamps need explicit offsets. Dates are YYYY-MM-DD. Field IDs start
with a lowercase letter and contain lowercase letters, digits, hyphens, or
underscores. Keys are non-null scalars. A schema with changed meaning must get a
new ID; automatic schema migration is not implemented.

The runtime supports normalized JSON arrays, NDJSON, and CSV/TSV with exact field
names. CSV values are strings; integer and decimal parsing is deterministic.
Use JSON for typed boolean, null, or nested values. The host agent performs
messy-text extraction and alias/unit conversion before ingestion. No runtime
code is generated from source text.

A batch file groups inputs into one transaction:

```json
{"inputs":[{"dataset":"daily-orders","path":"orders.json"}]}
```

Paths resolve relative to the batch manifest. Unknown fields fail. Identical
natural keys/values are no-ops across file formats; conflicting duplicates within
one batch fail it. Conflicting stored values require explicit `--correct`.
All records in a batch succeed together. A failed validation creates no records.

Keep the source and the extraction review alongside the private workspace.
Input files are retained by digest in its `sources` directory. Never include
customer reports or account identifiers in public examples or tests.

The ingestion timestamp is not the observation timestamp. Retain separate source
populations; do not reconcile incompatible counts by silently choosing one.
Record percentages as reported, with their denominator meaning. Do not sum
snapshots, counters, or ratios. Source MB/KB can be preserved as reported numeric
values and units when the byte convention is unknown.
