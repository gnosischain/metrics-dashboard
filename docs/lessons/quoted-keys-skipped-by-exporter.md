---
id: quoted-keys-skipped-by-exporter
title: Two generators read the same files with different regexes, so 32 metrics fell out of the export and nothing said so
status: observed
layer: build-pipeline
scope: scripts/export-queries.js and scripts/build-search-registry.js; src/queries files written with JSON-style quoted keys
symptom: >-
  a metric is searchable and renders, but the exporter never writes its
  api/queries JSON, so its SQL is frozen at whatever was last committed by hand.
  The only visible trace was a "Could not find ID or query in <file>, skipping"
  line in the middle of ~600 lines of success output.
last_verified: 2026-08-05
evidence:
  - 'src/queries files use both styles: bare `id:` and JSON-style `"id":`; api_execution_gnosis_app_gt_engagement_tiers.js mixes both in one object'
  - 'scripts/build-search-registry.js already accepted either style via a (?:^|[\s,{])[''"]?field[''"]? pattern; scripts/export-queries.js required a bare key'
  - 'the stripMetricSql plugin in vite.config.ts also handles quoted keys, its own comment saying "key may be quoted" — so the exporter was the only one of three consumers that did not'
  - 'measured 2026-08-05: 32 files were skipped — 12 gpay_migration_*, 10 gnosis_app_gt_*, 10 growth_*'
  - 'once the exporter accepted quoted keys, 2 of the 32 turned out to carry genuine SQL drift — see export-queries-drift.md'
---
## Symptom

A whole family of metrics behaves as though the export step does not exist. They render,
they appear in header search, and their `api/queries` JSON is real and committed — but it
was written by hand and no export ever refreshes it. Editing the source has no effect and
produces no warning that survives a scroll.

## Root cause

`src/queries` contains two authoring styles. Most files use bare object keys (`id:`,
`query:`); the newer `growth_*`, `gnosis_app_gt_*` and `gpay_migration_*` families use
JSON-style quoted keys (`"id":`, `"query":`). Some files mix the two.

`build-search-registry.js` was taught to accept both, with a boundary-guarded pattern that
tolerates an optional quote around the key. `export-queries.js` was not, and kept matching a
bare `id:` only. In `"id": "…"` the character after `id` is a quote rather than a colon, so
the match fails, the file is skipped, and the loop moves on.

The skip was reported — but as a `console.warn` inside roughly six hundred lines of
`Exported <id>` chatter, in a script nobody reads the output of. Being technically logged is
not being detected.

## Forbidden action

Do not add a third regex. When two generators consume the same files, they must agree on how
those files are parsed; a divergence between them is a silent-skip bug waiting to happen. Do
not "fix" a skipped metric by hand-writing its `api/queries` JSON — that is what made this
invisible for as long as it was.

## Detection

`pnpm run check` reports skipped files as a warning and, more importantly, reports the
resulting staleness as a failure. A metric that cannot be parsed can no longer hide behind
successful-looking output.

## Safe remediation

Accept both key styles, with a leading boundary so a key such as `"chart_id"` cannot be read
as `id`:

```js
/(?:^|[{,\s])["']?id["']?\s*:\s*['"]([^'"]+)['"]/
```

Bringing skipped files under the exporter can change what production runs, because their
hand-maintained JSON may differ from their source. Check before writing: run `--check`
first, and establish which side is correct for anything it flags.

## Enforcement

Both generators now use the same boundary-guarded key pattern, and `pnpm run check` fails on
the staleness a skip produces. Status moves to `enforced` once CI has run on `main`.
