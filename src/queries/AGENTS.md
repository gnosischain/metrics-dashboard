# src/queries — adding and changing metrics

This is the canonical procedure. `README.md` in this directory is the *reference* for metric
config fields, chart types and query shapes; it no longer describes the workflow.

One file per metric, named after its id. 635 of them.

## Adding a metric

All four steps are required. Steps 2 and 3 fail silently when skipped.

**1. Create `src/queries/<id>.js`.** Filename must equal the `id`. Either bare keys (`id:`) or
JSON-style quoted keys (`"id":`) work — both are parsed — but be consistent within a file.

```js
const metric = {
  id: 'api_execution_example_daily',
  name: 'Example',
  description: 'One line shown under the title',
  metricDescription: `What this counts, in enough detail to settle an argument. Rendered as
markdown in the info popover. State the unit.`,
  chartType: 'line',
  format: 'formatNumber',
  query: `
    SELECT date, toInt64(value) AS value
    FROM dbt.api_execution_example_daily
    WHERE date BETWEEN '{from}' AND '{to}'
    ORDER BY date
  `
};

export default metric;
```

Read `dbt.api_*`. Not `int_*` or `fct_*` — see `docs/lessons/non-contract-dbt-reads.md`.

**2. Place it in dashboard YAML.** Add the id under a `metrics:` list in
`public/dashboards/<sector>.yml`. Without this the metric renders nowhere *and* header search
cannot find it, with no error anywhere. See `docs/lessons/yaml-placement-gate.md`.

**3. Export the SQL.**

```bash
pnpm run export-queries
```

This writes `api/queries/<id>.json`, which is what the API actually executes. The query string
in the JS file is stripped from the client bundle and has no runtime consumer, so skipping this
means your SQL never runs. See `docs/lessons/export-queries-drift.md`.

**4. Verify.**

```bash
pnpm run check
```

Commit the generated JSON together with the source.

## Changing a metric's SQL

Same thing, minus the YAML: edit the source, run `pnpm run export-queries`, commit both.

If `pnpm run check` reports drift you did not cause, do **not** just export — that publishes a
change nobody reviewed. Establish which side is correct first: read the dbt model, and
reconcile the candidate numbers against the warehouse. Exactly this happened on 2026-08-05 and
the answer changed a displayed KPI.

## Filters

- **Tab-level global filter:** the metric's filtering field must match the tab's
  `globalFilterField`, or set `globalFilterField` on the metric explicitly.
- **Scoped metrics** — anything under a per-address, per-user or per-validator scope — must
  contain `/*__FILTER_CONDITIONS__*/` in the SQL where the injected predicate belongs. The
  export fails if it is missing, listing the offending ids.
- **Local filters:** `localFilterFields` drives the per-card dropdowns and filters client-side
  without refetching.
- **Unit toggles:** `unitFilterField` or `unitFields` to inherit a tab-level native/USD toggle.
- **Token icons** in dropdowns: use `labelField: 'token'`.

## Conventions that matter

| Rule | Why |
|---|---|
| filename equals `id` | the YAML, API and search registry all key on the id; a mismatch makes the metric unfindable by filename |
| always alias the value column `AS value` | widgets resolve `valueField`, defaulting to `value` |
| use `{from}` / `{to}` placeholders | substituted per request; hardcoded dates freeze the card |
| always write `metricDescription` | it is the only explanation a reader gets, and CI checks owned sectors have one |
| never `SELECT *` | a column added upstream silently changes the shape the widget receives |

## Text widgets

A file with `chartType: 'text'` has no SQL and is skipped by the exporter. It still needs a
YAML placement.
