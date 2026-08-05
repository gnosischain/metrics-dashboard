---
id: non-contract-dbt-reads
title: Only dbt.api_* is a contract — 42 metrics read int_/fct_ internals dbt is free to move
status: observed
layer: query-definition
scope: src/queries/*.js query strings; any FROM or JOIN against the dbt database
symptom: >-
  a card that has worked for months goes empty or errors after an upstream dbt
  change that broke no documented contract. Nothing in this repo referenced the
  renamed model by name, because the reference lives inside a SQL string.
last_verified: 2026-08-05
evidence:
  - 'the workspace contract table names `dbt.api_* view names + columns` as the surface dbt-cerebro owes this repo; int_ and fct_ models carry no such obligation'
  - 'measured 2026-08-05 by two independent methods (ripgrep over src/queries and scripts/check-metrics.js): 42 definitions read dbt.int_* or dbt.fct_*'
  - 'they cluster into whole feature areas rather than scattering: Account Portfolio, Validator Explorer and validator-compare, gnosis_app_gt, and the gpay_migration family'
  - 'int_execution_gnosis_app_gt_wallet_metrics carries meta expose_to_mcp:false, privacy_tier:internal and api.exclude_from_api:true — it is explicitly not a consumer surface'
  - 'api/metrics.js getDefaultQueries() still references dbt.yields_sdai_apy_daily, a fallback for a model this repo stopped using'
---
## Symptom

An upstream dbt change lands that renames or reshapes an intermediate or fact model. Nothing
in the dashboard's file names, metric ids, or config mentions that model, so no grep during
the dbt review finds a consumer. The affected cards go empty or start erroring, and the
breakage is attributed to the dashboard rather than to a contract that never existed.

## Root cause

Every metric's dbt reference lives inside a SQL template literal, so it is invisible to any
tooling that reasons about names — including whatever the dbt side greps before a rename.

Only `dbt.api_*` is a declared contract surface. `int_*` and `fct_*` models are internals;
dbt-cerebro is entitled to rename, restructure, or delete them. Some are explicitly marked
not for consumption — `int_execution_gnosis_app_gt_wallet_metrics` sets
`api.exclude_from_api: true` and `privacy_tier: internal`.

The 42 current cases are not carelessness. They cluster into whole feature areas that have no
`api_*` model to read: Account Portfolio, Validator Explorer, `gnosis_app_gt`, and the GPay
migration set. Those features could not have been built any other way. That makes this a
known, bounded exposure rather than a defect list.

## Forbidden action

Do not add a new `int_*` or `fct_*` read outside the areas already recorded in the ratchet.
If a needed field is not exposed through `api_*`, the fix is an upstream `api_` model, not
another internal read. Do not read a model whose meta marks it internal-only.

## Detection

`pnpm run check` extracts every `FROM`/`JOIN dbt.<model>` from every query string and fails on
any non-`api_` read that is not in `scripts/allow/non-contract-dbt-reads.allow`.

When an upstream rename is announced, grep the SQL rather than the file names — the ids do not
name their tables (see `id-does-not-name-the-table.md`).

## Safe remediation

Prefer an `api_*` model. Where one exists but the metric reads the fact directly, switching is
usually a one-line change — note that `api_execution_gnosis_app_gt_wallet_metrics` exists
alongside the `fct_..._public` model several metrics currently read.

Where no `api_*` model exists, the read stays in the ratchet and the exposure is accepted
explicitly rather than silently.

## Enforcement

`scripts/check-metrics.js` via `pnpm run check` in CI, ratcheted at the 42 pre-existing cases.
Status moves to `enforced` once that workflow has run on `main`. Column-level breakage is not
covered by any static check; that needs the query smoke test described in
`docs/workflows/incident.md`.
