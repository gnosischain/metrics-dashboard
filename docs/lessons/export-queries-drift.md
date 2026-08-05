---
id: export-queries-drift
title: The API executes api/queries/*.json, not src/queries/*.js — editing the source without exporting changes nothing and warns nobody
status: observed
layer: build-pipeline
scope: src/queries/*.js and their api/queries/*.json counterparts; any change to a metric's SQL
symptom: >-
  a metric's SQL is provably correct in src/queries and the dashboard still shows
  the old number. No error, no empty state, no console warning — the card renders
  a plausible wrong value, often one that disagrees with a neighbouring card built
  on the same model.
last_verified: 2026-08-05
evidence:
  - 'api/metrics.js loads api/queries/<id>.json; the frontend bundle has its SQL stripped by the strip-metric-sql plugin in vite.config.ts, so the JS query string never reaches production'
  - 'README "Adding New Metrics" lists `pnpm run export-queries` as a manual step 3, with nothing verifying it happened'
  - 'measured 2026-08-05: api_execution_gnosis_app_gt_kpi_power_users served countIf(is_power_user) = 2082 while its source said countIf(is_power_user AND is_registered_active) = 2076, and the Engagement Tiers card beside it showed power = 2076'
  - 'measured 2026-08-05: api_execution_gnosis_app_gt_engagement_tiers served ORDER BY value DESC, rendering the bars in the exact reverse of the power/core/casual/inactive order its title and preserveOrder:true promise'
  - 'both had been undetectable because the exporter silently skipped all 32 files using JSON-style quoted keys — see quoted-keys-skipped-by-exporter.md'
---
## Symptom

The dashboard disagrees with the repository. Someone edits a metric's SQL, reviews it,
merges it, and production keeps serving the previous query indefinitely. Nothing fails: the
card still renders, the number is still plausible, and the only outward sign is that it
contradicts either its own info-popover description or another card computed from the same
model.

## Root cause

A metric's SQL exists twice. `src/queries/<id>.js` is authored and reviewed;
`api/queries/<id>.json` is what the serverless API actually executes. The bridge between
them is a manual `pnpm run export-queries`, listed as a step in the README and enforced by
nothing.

The frontend cannot compensate, because `vite.config.ts` deliberately strips SQL from the
client bundle — the browser only needs the metric id. So the JS query string has no runtime
consumer at all. It is documentation that looks like code, and when it diverges from the
JSON the JSON always wins.

## Forbidden action

Never edit a query in `src/queries/` without running the export in the same change. Never
hand-edit `api/queries/*.json` to make production behave — the next successful export
silently reverts you, and in the meantime the repo's own source of truth is wrong. Never
assume a passing test suite covers this; no test reads `api/queries`.

## Detection

`pnpm run check` runs `export-queries.js --check`, which regenerates every metric in memory
and reports anything missing, stale, or orphaned, then exits non-zero. It writes nothing, so
it is safe on a dirty tree.

To find drift by symptom rather than by gate: when a card disagrees with a neighbour built
on the same model, diff the two representations of that metric before investigating dbt.

## Safe remediation

Run `pnpm run export-queries` and commit the result alongside the source change.

When the check reports drift you did not create, do not blindly export — establish which
side is correct first. In the 2026-08-05 case the source was provably right, confirmed by
reading the dbt model and reconciling both candidate counts against
`engagement_tier = 'power'` in the warehouse. Exporting changed a displayed KPI, which is a
product-visible change and deserves that level of evidence.

## Enforcement

`pnpm run check` in `.github/workflows/ci.yml`. This fault is platform-independent, so the
Ubuntu job catches it wherever it originates. Status moves to `enforced` once that workflow has
run on `main`.
