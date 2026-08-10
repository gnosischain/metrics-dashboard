# Celo / Gnosis Pay — disabled

The Gnosis Pay dashboard had a per-tab toggle that switched its cards between Gnosis Chain
and Celo. The Celo half is disabled. Everything needed to bring it back exactly as it was is
in this folder and in `api/queries/_disabled/`.

Nothing here runs. The metric loader, the search-registry builder and the query loader all
read only the top level of their directory, and `vercel.json` limits the deployed function to
`api/queries/*.json`. Don't widen that to `api/queries/**`, and check those four before
renaming or moving either `_disabled/` folder.

## Restore

**Step 1 before step 2.** Card variants are preloaded regardless of which chain is selected,
so YAML pointing at metrics still sitting in `_disabled/` breaks the Gnosis Pay tabs.

1. Move up one level:
   - `src/queries/_disabled/api_celo_gpay_*.js` and `text_celo_gpay_glossary.js` → `src/queries/`
   - `api/queries/_disabled/api_celo_gpay_*.json` → `api/queries/`
   - leave this README, the patch and the layout file behind

2. Restore the dashboard wiring — the `chains:` block, the tagline, the 5 per-tab `chains:`
   keys and all 31 per-card `celoId:` lines:

   ```
   git apply src/queries/_disabled/reinstate-yaml.patch
   ```

   If it no longer applies, `gnosis-pay.celo-layout.yml` lists the same lines against each
   card id — re-place them against the current grid rather than the old `gridRow` values.

3. Set `includeFiles` back to `api/queries/**` in `vercel.json`, or leave it if you keep a
   `_disabled/` folder around.

4. `pnpm build-search-registry && pnpm build`, then confirm the toggle appears on the
   Gnosis Pay tabs.

The toggle mechanism was never removed — `chains:` parsing in `src/services/dashboards.js`,
the toggle in `src/components/MetricGrid.js` and variant preloading in
`src/components/Dashboard.js` are all in place and tested — so behaviour is identical once
the above is done. The `dbt.api_celo_gpay_*` models these query were not touched.

Note: the `chore/gates` branch holds 8 further Celo metrics (activated addresses, funnel
cohorts, first-fund by channel, settlement cost and fee bps) that were never live. Pull them
from there if you want those too.
