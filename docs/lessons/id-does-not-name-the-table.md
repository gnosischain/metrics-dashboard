---
id: id-does-not-name-the-table
title: A metric's id does not reliably name the model it reads, so renames cannot be found by filename
status: observed
layer: query-definition
scope: src/queries/*.js — filenames, exported ids, and the dbt models inside their query strings
symptom: >-
  an upstream model is renamed, someone greps the dashboard for that name among
  the file names and metric ids, finds nothing, and concludes there is no
  consumer. The consuming card breaks after deploy.
last_verified: 2026-08-05
evidence:
  - 'overview_stake_api reads dbt.api_consensus_info_apy_latest — the id names neither the model nor the metric'
  - 'several api_celo_gpay_kpi_* ids all slice one dbt.api_celo_gpay_kpi_monthly table'
  - 'api_p2p_visits_latest_discv5 and api_p2p_visits_latest_discv4 both read dbt.api_p2p_visits_latest, differing only in presentation'
  - 'overview_kpi_gpay_active_users reads dbt.fct_execution_gpay_activity_daily, bypassing the api_ layer its siblings use'
  - 'measured 2026-08-05: 5 definitions have a filename that differs from their exported id — networkClientDistribution, networkValidatorConnections, nodeStatusTable, sankeyGasFlow, sankeyTransactionFlow'
---
## Symptom

The dbt side is about to rename a model and wants to know who consumes it. The natural check
— search the dashboard for the model name — comes back empty, because the dashboard names
things after what the card shows, not after what it queries. The rename ships and a card
breaks.

The inverse also bites: someone edits `sankeyGasFlow.js` expecting to affect a metric called
`sankeyGasFlow`, when the id is `sankey_gas_flow` and every YAML placement, API JSON file, and
search-registry entry uses the underscored form.

## Root cause

Three names exist per metric and only loosely coincide: the filename, the exported `id`, and
the dbt model inside the query string. The convention is that all three match, and for most of
the 635 definitions they do — but the exceptions are systematic rather than random. Overview
and KPI cards are named for the tile they render; several KPI cards slice one shared monthly
table; presentation variants read a single model twice; and five legacy files predate the
snake_case convention.

Because the model reference lives inside a SQL string, the only reliable index from model to
consumer is a grep of the SQL itself.

## Forbidden action

Do not use file names or metric ids to answer "who reads this model" — grep the query strings.
Do not rename a file to match its id without also updating every YAML placement that references
the id, since the id is what the layout resolves.

## Detection

`pnpm run check` reports definitions whose filename differs from their exported id, ratcheted
at the 5 pre-existing cases in `scripts/allow/id-filename-mismatch.allow`, so new ones fail.

For rename impact, the authoritative query is a grep for `dbt.<model>` across `src/queries`.

## Safe remediation

Name new files after their id. For the legacy five, renaming means updating the YAML
placements in the same change; the ratchet records them until someone does.

When answering an upstream rename, search the SQL and report metric ids, not file names — the
ids are what the dashboard, the API and the search registry all key on.

## Enforcement

`scripts/check-metrics.js` via `pnpm run check` in CI. Status moves to `enforced` once that
workflow has run on `main`.
