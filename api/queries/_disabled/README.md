# Celo / Gnosis Pay — disabled

The backend half of a disabled dashboard section: 38 query definitions that `api/metrics.js`
does not serve, because it reads only the top level of `api/queries/`. `vercel.json` also
limits the deployed function to `api/queries/*.json`, so these are not uploaded — don't widen
it to `api/queries/**`.

How to restore: `src/queries/_disabled/README.md`.

Also archived here (not part of the Celo section):
`api_execution_state_full_size_daily.json` — retired 2026-08 because its dbt source
chain is deprecated (`execution.storage_diffs` ingestion ended 2026-01-30; the series
is permanently frozen at that date). No dashboard YAML referenced it; it was
search-only. Restoring it requires re-sourcing the dbt chain first.
