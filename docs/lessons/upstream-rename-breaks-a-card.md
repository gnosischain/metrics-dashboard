---
id: upstream-rename-breaks-a-card
title: dbt owns the models, this repo owns the references, and until now nothing checked they still agree
status: observed
layer: query-definition
scope: every FROM/JOIN against the dbt database in src/queries/*.js; scripts/check-dbt-contract.js
symptom: >-
  a card goes empty or errors with no commit in this repo, and every dbt test upstream is
  green. The model is healthy; the dashboard's reference to it is not. Nobody is notified,
  because neither side's gates look across the boundary.
last_verified: 2026-08-06
evidence:
  - 'dbt-cerebro runs ~900 tests, source freshness, Elementary anomaly detection and `edr monitor` to a Slack webhook daily (scripts/run_dbt_observability.sh) — all of it scoped to its own models, none of it aware of a consumer'
  - "this repo's `pnpm run check` proves a metric is registered consistently in three places inside the repo, and never looks outside it"
  - 'measured 2026-08-06: 631 dbt references across 606 metric queries, resolved against 1283 relations (1250 models + 33 seeds) in the public manifest; all 631 resolve'
  - '8 references point at models tagged `dev`, which the production run (`--select tag:production`, `docs generate --exclude tag:dev`) does not build, test, or Elementary-monitor; all 8 were verified to return rows'
  - "7 of those 8 are the DaoTreasury sector, which carries `enabled: false` in public/dashboard.yml, so they render nowhere — staging a WIP feature that way is the intended workflow, and gnosis-revenue.yml states the reason outright: `enabled: false  # models not yet in prod`"
  - 'the 8th, api_execution_yields_lending_top_lenders_latest, sits in Yields -> Lending, a tab with no disable flag, so it is the one rendered card with no upstream quality gate behind it'
  - 'the published catalog.json — the only artifact generated from the database rather than from docs — ships with zero model nodes (96 sources, 0 nodes), so no public artifact carries real column lists'
  - 'manifest columns are the ones schema.yml documents, and they demonstrably drift: dbt.api_esg_cif_network_vs_countries_daily documents `carbon_intensity` while `describe_table` shows the view returns `carbon_intensity_gco2_kwh`. A column rule built on the manifest flags a correct metric.'
  - '`dbt.tokens_whitelist` is a seed, not a model; an existence check that indexes only resource_type=model reports a false positive for it'
---
## Symptom

A card that worked for months goes empty, or starts erroring, and nothing in this repo
changed. Upstream, every dbt test is green and Elementary reported nothing, because from
dbt's point of view nothing is wrong — the model it renamed is healthy under its new name.

The tell is the absence of a trigger: no PR here, no failing test either side, no alert.

## Root cause

The dashboard's dbt references live inside SQL template literals. dbt-cerebro's gates
validate its own models; this repo's gates validate its own registration. Both are thorough
and neither crosses the boundary, so the reference itself — the thing that actually breaks —
was covered by nothing at all.

That gap is structural, not an oversight. dbt cannot see into a string in another repo, and
until now this repo had no way to learn what dbt currently publishes.

## Forbidden action

Do not build a column-level check on the manifest. Its `columns` are what `schema.yml`
*documents*, which is not what the table returns:
`dbt.api_esg_cif_network_vs_countries_daily` documents `carbon_intensity` while the view
returns `carbon_intensity_gco2_kwh`. A rule on that data fails correct metrics, and a
ratchet entry that silences a correct metric teaches people the gate lies. The artifact that
would carry real columns, `catalog.json`, is published with zero model nodes.

Do not treat "missing the `production` tag" as a violation either. Live models carry
`tag:live` and are built on their own schedule, and intermediate models arrive as
dependencies, so that rule flags healthy references.

Do not index only `resource_type: model` when resolving a reference. 33 seeds are real tables
in the `dbt` schema and metrics join to them.

Do not flag a `dev`-tagged reference whose card renders nowhere. Holding a feature behind
`enabled: false` until its models reach production is the *correct* habit here — seven of the
eight known `dev` references are the disabled DaoTreasury sector, and gnosis-revenue.yml spells
the reason out in a comment. Flagging them would punish the right behaviour, and it would also
park them in the ratchet, silencing the check at the only moment it matters: when someone
enables the sector while the models are still `dev`.

## Detection

`pnpm run check:dbt` resolves every `FROM`/`JOIN dbt.<relation>` in every metric query
against dbt's published manifest at
`https://gnosischain.github.io/dbt-cerebro/manifest.json`. It is a public gh-pages artifact,
so this needs no warehouse credentials and no secrets.

It runs as its own CI job on every PR **and on a daily schedule**, because the interesting
case has no commit here to trigger on. The manifest is cached locally for 12 hours;
`--refresh` forces a re-fetch and `DBT_MANIFEST_PATH` points it at a local file.

## Safe remediation

For an unknown relation, find the current name in the manifest and update the query — the ids
do not name their tables, so grep the SQL (see `id-does-not-name-the-table.md`).

For a `dev`-tagged model there are two remediations, and the cheap one is local: set
`enabled: false` on the tab or sector until the model is promoted, which is what the DAO
treasury cards already do. The real fix is upstream — promote it to `tag:production` so dbt's
tests and Elementary cover it. Leaving it in the ratchet is an explicit acceptance that a
*rendered* card's data has no upstream quality gate behind it.

A fetch failure is reported and passes. Do not "fix" that by making it fatal — a required
check that depends on the network teaches people to ignore CI.

## Enforcement

`scripts/check-dbt-contract.js`, run by the `dbt-contract` job in
`.github/workflows/ci.yml` on pull requests, pushes to `main`, and a daily schedule.
Ratcheted at 0 unknown relations and 1 rendered `dev`-tagged reference
(`api_execution_yields_lending_top_lenders_latest`). The other 7 are reported as staged, not
ratcheted, so enabling DaoTreasury before those models are promoted fails the job. Status moves
to `enforced` once the scheduled run has fired on `main` and someone has confirmed it catches
a real rename.

Two things this gate cannot see: a column rename (no public artifact carries real columns),
and a model that exists but stopped being refreshed (that is dbt's freshness and Elementary
coverage, and it is why the `dev`-tagged entries matter).
