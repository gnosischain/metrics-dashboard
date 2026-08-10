# Celo / Gnosis Pay — disabled

The backend half of a disabled dashboard section: 38 query definitions that `api/metrics.js`
does not serve, because it reads only the top level of `api/queries/`. `vercel.json` also
limits the deployed function to `api/queries/*.json`, so these are not uploaded — don't widen
it to `api/queries/**`.

How to restore: `src/queries/_disabled/README.md`.
