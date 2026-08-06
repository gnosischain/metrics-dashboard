# metrics-dashboard — agent guide

Vite + React SPA serving the public Gnosis Chain metrics dashboard, plus the Vercel
serverless functions that execute its SQL against ClickHouse. JavaScript, not TypeScript.
pnpm 10.29.3, Node 22.

Read this before changing anything. For a metric, then read `src/queries/AGENTS.md`, which
is the canonical procedure — this file does not repeat it.

Last verified: 2026-08-06.

## The one thing that will catch you out

**A metric's SQL exists twice, and the copy you edit is not the copy that runs.**

`src/queries/<id>.js` is authored and reviewed. `api/queries/<id>.json` is what the API
executes. `vite.config.ts` strips SQL from the client bundle, so the JS query string has no
runtime consumer at all — if the two disagree, the JSON wins, silently, forever.

Editing SQL without running `pnpm run export-queries` changes nothing and warns nobody.
That is not hypothetical: on 2026-08-05 two metrics had been serving the wrong query for
months, one of them a headline KPI that disagreed with the chart beside it.
See `docs/lessons/export-queries-drift.md`.

## Before you commit

```bash
pnpm run check      # export parity + metric registration. Fast, no network, no writes.
pnpm test           # 288 tests in 32 files, ~80s unloaded
pnpm run check:dbt  # every dbt reference still exists upstream. Fetches a public manifest.
```

`pnpm run check` is the gate that catches the silent failures. Run it after touching
anything under `src/queries/`, `api/queries/`, or `public/dashboards/`.

`pnpm run check:dbt` answers a different question — whether the models your SQL names still
exist in dbt. It also runs daily in CI, because that reference can break with no commit here.

## Three places, two of which fail silently

| Place | What it decides | If you skip it |
|---|---|---|
| `src/queries/<id>.js` | the definition and its SQL | nothing exists |
| `public/dashboards/<sector>.yml` | whether it renders at all | renders nowhere, and header search cannot find it either — no error |
| `api/queries/<id>.json` | what production executes | the old SQL keeps running — no error |

Only the first is obvious when missing. `pnpm run check` covers the other two.

## Rules

- **Never hand-edit `api/queries/*.json`.** It is generated. The next export reverts you, and
  meanwhile the repo's own source of truth is wrong.
- **Read `dbt.api_*`, not `dbt.int_*` or `dbt.fct_*`.** Only `api_*` is a contract; dbt is
  free to rename everything else. 42 metrics already break this rule in feature areas that
  have no `api_` model, and they are recorded in `scripts/allow/non-contract-dbt-reads.allow`.
  Do not add a 43rd. See `docs/lessons/non-contract-dbt-reads.md`.
- **Read the `dbt` database and nothing else.** `playground_max` is the shared development
  target — anyone's dbt run can rebuild or drop what a live card depends on, and the
  `CLICKHOUSE_DBT_SCHEMA` override rewrites only the `dbt.` prefix, so a foreign reference
  escapes it. If production data is wrong, fix the dbt model; never point a card at dev.
  `pnpm run check` fails on any non-`dbt` reference and there are no exemptions.
- **Name the file after the metric id.** Ids are what the YAML, the API and the search
  registry key on. Five legacy camelCase files predate this and are ratcheted.
- **Scoped metrics need `/*__FILTER_CONDITIONS__*/`** in their SQL, or the export fails. The
  filter is injected there at query time.
- **Do not fix a line-ending diff with `.gitattributes`.** It cannot work here; the fix is
  already in the generators. Equally, do not remove the `normalizeNewlines` calls in
  `scripts/export-queries.js` or `scripts/build-search-registry.js` — they are no-ops on macOS
  and Linux, load-bearing on Windows, and nothing in CI catches their removal. Each carries a
  comment saying so. See `docs/lessons/crlf-export-drift.md`.
- **Never import from `./index` inside a module that `./index` imports.** That cycle turns any
  module-level throw in the barrel into a test run that hangs with no error and no timeout —
  it cost the suite `MetricWidget.test.jsx` for months. See
  `docs/lessons/barrel-import-cycle-hangs-tests.md`.
- **If a test run hangs, cap the workers first.** `--poolOptions.forks.maxForks=1
  --no-file-parallelism` turns an unreadable stall into a real timeout. Both hang lessons under
  `docs/lessons/INDEX.md` → "It hangs, and no timeout fires" start there.

## Layout

| Path | What lives there |
|---|---|
| `src/queries/` | 635 metric definitions, one file per metric — SQL and widget config |
| `public/dashboard.yml` | sector list, chain variants, palettes |
| `public/dashboards/*.yml` | 16 files: per-sector tabs and metric placement |
| `src/components/` | widgets and chart types; `MetricWidget` and `MetricGrid` are the hubs |
| `src/services/` | config resolution, metric loading, account portfolio |
| `api/` | Vercel functions; `api/metrics.js` executes the queries and caches results |
| `scripts/` | the generators, `check-metrics.js`, `check-dbt-contract.js`; `scripts/allow/` holds the ratchets |
| `docs/lessons/` | recorded mistake classes — read by symptom, see `INDEX.md` |

Three directories carry their own `AGENTS.md` with what is specific to them:
`src/queries/` (the metric procedure), `api/` (execution and caching), `src/components/`
(remounting and test conventions).

## Retrieval

`docs/lessons/INDEX.md` is grouped by symptom, because every record in it was first
misdiagnosed as something else. Search it for what you are *seeing* before reading code.

Adding a record: `docs/workflows/incident.md`. The validator in
`scripts/__tests__/lessons.test.js` enforces the schema, so a malformed record fails tests.

## Warehouse

Read-only ClickHouse. Production data lives in the `dbt` database; never write to it. Queries
run through `api/metrics.js`, which caches by metric id and parameters. Placeholders `{from}`
and `{to}` are substituted per request.

For dbt model semantics, the model SQL in the `dbt-cerebro` checkout is authoritative. Its
documented column names are **not**: `dbt.api_esg_cif_network_vs_countries_daily` documents
`carbon_intensity` while the view returns `carbon_intensity_gco2_kwh`. Reconcile against the
warehouse itself before changing a metric's meaning.

What dbt currently publishes is readable without credentials at
`https://gnosischain.github.io/dbt-cerebro/manifest.json` — model and seed names, tags, and
lineage. `catalog.json` alongside it is published with zero model nodes, so it is not a source
of real column lists. `pnpm run check:dbt` uses the manifest.

## Known debt, deliberately recorded

These are ratcheted, not forgotten. New violations fail; existing ones are listed so the
count can only shrink.

| Debt | Count | Where |
|---|---|---|
| definitions placed in no YAML | 181 | `scripts/allow/unplaced-metrics.allow` |
| non-contract dbt reads | 42 | `scripts/allow/non-contract-dbt-reads.allow` |
| rendered card on a `dev`-tagged dbt model | 1 | `scripts/allow/dev-tagged-dbt-models.allow` |
| filename ≠ id | 5 | `scripts/allow/id-filename-mismatch.allow` |

`api/metrics.js` also carries a `getDefaultQueries()` fallback holding five legacy queries. It
is returned whenever the queries directory is missing or loads empty, which would quietly
degrade the whole API to those five instead of failing loudly.
