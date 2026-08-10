# Disabled metrics — Celo / Gnosis Pay

The Gnosis Pay dashboard used to carry a per-tab chain toggle that swapped its cards
between Gnosis Chain and Celo. The Celo half was switched off in August 2026. The work is
kept here, intact, so it can be reinstated without digging through git history.

Nothing in this folder is loaded, bundled, served, or queried. That is not an accident of
naming — every scanner in the repo reads only the top level of its directory:

| Scanner | Pattern | Sees this folder? |
| --- | --- | --- |
| `src/queries/index.js` | `import.meta.glob('./*.js')` | no — non-recursive |
| `scripts/build-search-registry.js` | `readdirSync` + `.endsWith('.js')` | no |
| `scripts/export-queries.js` | `readdirSync` + `.endsWith('.js')` | no |
| `api/metrics.js` (`loadQueries`) | `readdirSync` + `.endsWith('.json')` | no |
| `vercel.json` `includeFiles` | `api/queries/*.json` | no — narrowed for this reason |

So these files cost nothing at runtime: no chunks emitted, no entries in the search
registry, no ids served by `/api/metrics/<id>`, and nothing uploaded into the serverless
function.

**If you move or rename this folder, check that list first.** In particular, the
`includeFiles` narrowing in `vercel.json` is what keeps `api/queries/_disabled/` out of the
deployed function — widening it back to `api/queries/**` would ship these files to
production even though nothing reads them.

## Contents

- `api_celo_gpay_*.js` (38) — frontend metric configs: title, chart type, formatting, SQL
- `text_celo_gpay_glossary.js` — the Celo glossary card
- `api_celo_gpay_*.json` (38) — lives in `api/queries/_disabled/`, the backend SQL by id
- `gnosis-pay.celo-layout.yml` — the YAML lines that wired the above into the dashboard

The layout lives in this folder rather than commented out in `public/dashboards/gnosis-pay.yml`
for a specific reason: everything under `public/` is deployed verbatim and served openly
(`https://metrics.gnosischain.com/dashboards/gnosis-pay.yml` returns 200), so commented-out
config there is public content, not an internal note.

## Reinstating

1. Move the configs back up one level:
   - `src/queries/_disabled/api_celo_gpay_*.js` and `text_celo_gpay_glossary.js` → `src/queries/`
   - `api/queries/_disabled/api_celo_gpay_*.json` → `api/queries/`
2. Apply `gnosis-pay.celo-layout.yml` to `public/dashboard.yml` (the `chains:` block and
   the tagline) and `public/dashboards/gnosis-pay.yml` (per-tab `chains:` key and per-card
   `celoId:`). Re-place cards against the current grid — do not trust old `gridRow` values.
3. Revert `includeFiles` in `vercel.json` to `api/queries/**`, or leave it as
   `api/queries/*.json` if you keep a `_disabled/` folder around.
4. Run `pnpm build-search-registry`, then `pnpm build`, and confirm the toggle appears on
   the Gnosis Pay tabs.

The mechanism itself was never removed — `chains:` parsing in `src/services/dashboards.js`,
the toggle in `src/components/MetricGrid.js`, and variant preloading in
`src/components/Dashboard.js` are all still in place and covered by tests. It supports one
default chain plus one variant (`celoId`), not an arbitrary list.

Upstream, the `dbt.api_celo_gpay_*` models these read from live in `dbt-cerebro` and were
not touched, so the SQL here has real tables behind it as long as those models still build.
