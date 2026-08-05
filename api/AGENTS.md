# api — serverless functions

Vercel functions. This is where metric SQL is actually executed against ClickHouse.

## The queries directory is generated

`api/queries/*.json` is written by `scripts/export-queries.js` from `src/queries/*.js`.

**Never hand-edit it.** The next export silently reverts you, and until then the repository's
own source of truth disagrees with production. If a query is wrong, fix
`src/queries/<id>.js` and re-export. See `docs/lessons/export-queries-drift.md`.

`api/metrics.js` loads them once per cold start into `startupQueries`, then substitutes
`{from}` / `{to}` and any scoped filter predicate at `/*__FILTER_CONDITIONS__*/` before
execution. Only local dev re-reads the directory per request (`getActiveQueries`), so in
production a newly deployed query file is picked up by the next cold start, not the next
request. The client never sends SQL — only a metric id and parameters — because
`vite.config.ts` strips SQL from the bundle.

## Hazards here

**`getDefaultQueries()` masks total failure.** It returns five hardcoded legacy queries
(`historical_yield_sdai`, `queryCount`, `dataSize`, `queryDuration`, `errorRate`), and it is
returned whenever the queries directory is missing *or* loads empty. A packaging or path
regression that loses `api/queries/` therefore degrades the API to those five instead of
failing loudly. If you touch query loading, make the empty case loud.

**Caching is keyed on metric id plus parameters.** A change to a query's SQL does not by itself
invalidate anything keyed only on the id, so verify cache behaviour when changing result shape.
See `cache.js` and the cache sections of the root `README.md`.

**Serverless means no shared memory between invocations.** In-process caches are per-instance
and vanish on cold start; treat them as opportunistic, never as a store.

## Before you commit

```bash
pnpm run check      # includes export parity, so it catches a stale api/queries
pnpm run test:ci
```

Tests for this directory live beside the code (`api/cache.test.js`,
`api/metrics-pagination.test.js`) and run in the same vitest suite as the frontend.
