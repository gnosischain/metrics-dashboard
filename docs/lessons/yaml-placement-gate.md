---
id: yaml-placement-gate
title: Dashboard YAML is the visibility gate — a metric that is not placed there does not exist to users
status: observed
layer: layout-config
scope: public/dashboard.yml, public/dashboards/*.yml, and every definition in src/queries
symptom: >-
  a metric was added, the tests pass, the export ran, and the dashboard shows
  nothing new. Header search cannot find it either. Nothing in the build or the
  console mentions it.
last_verified: 2026-08-05
evidence:
  - 'src/services/dashboards.js merges YAML placements with metric config; MetricGrid renders only what the resolved layout contains'
  - 'scripts/build-search-registry.js indexes src/queries, but README documents that search results are scoped to metrics resolved from dashboard YAML'
  - 'measured 2026-08-06: 635 definitions exist and 461 ids are placed across 16 YAML files — 175 definitions are placed nowhere'
  - "a tab can also name a metric outside its `metrics:` array, via globalFilterSourceMetric or explicitFilterValidationMetric — 13 such references populate and validate the explorer search boxes, and 6 of those metrics were filed as unplaced debt until 2026-08-06 because the check only read `metrics:` arrays"
  - 'the reverse also occurs: a YAML placement whose id has no definition renders an empty card, which is why check-metrics.js treats that case as a hard failure with no ratchet'
---
## Symptom

Adding a metric appears to work at every step you can observe — the file is there, the
export wrote its JSON, the suite is green — and the dashboard is unchanged. Searching for it
by name returns nothing, which makes it look like a search bug rather than a missing
placement.

## Root cause

Rendering is config-driven. `public/dashboard.yml` lists sectors and points at
`public/dashboards/<sector>.yml`, and only the metric ids appearing under a `metrics:` list
in those files are resolved, merged with their definition, and rendered. A definition in
`src/queries` with no placement is inert: nothing loads it, so nothing reports on it.

A `metrics:` list is not the only way to name one, though. `globalFilterSourceMetric` and
`explicitFilterValidationMetric` are fetched at runtime to populate and validate an explorer
tab's search box, so a metric named only there is live despite appearing in no grid. Both
count as placements.

Header search follows the same resolution, so an unplaced metric is invisible there too —
the two symptoms have one cause, which is why searching for the missing card is a dead end.

## Forbidden action

Do not treat `src/queries` as the registry — it is a library, not a manifest. Do not add a
`global_filter` entry expecting a metric; it is a layout-only pseudo-metric, and under
`globalControlsPlacement: top` the grid suppresses it deliberately.

## Detection

`pnpm run check` reports, in both directions:

- definitions placed in no YAML — ratcheted in `scripts/allow/unplaced-metrics.allow`, at 175
- YAML placements with no definition — a hard failure, because it renders an empty card. This
  covers the two filter fields too, so a typo in a search box's source metric fails the check
  instead of breaking the tab in production

## Safe remediation

Add the id under a `metrics:` list in the target sector or tab, with its grid placement. If a
definition is intentionally unrendered — superseded, or staged ahead of a dashboard change —
add it to the ratchet file with `node scripts/check-metrics.js --update` so the intent is
recorded rather than ambient.

The 175 unplaced definitions are a debt register, not a target: some are deliberately
retired. Shrinking that list is a separate piece of work from keeping it from growing.

## Enforcement

`scripts/check-metrics.js` via `pnpm run check` in CI. Status moves to `enforced` once that
workflow has run on `main`.
