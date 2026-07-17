const metric = {
  id: 'api_execution_gnosis_app_kpi_gp_wallets_imported',
  name: 'Imported GP Wallets',
  description: 'Cumulative',
  metricDescription: `Cumulative count of Gnosis Pay (GP) wallets classified as \`imported\` — the wallet's delay module was first enabled by a non-Gnosis-App owner (the GP card pre-existed) and a Gnosis App user was only later added as a module owner. Contrast \`onboarded_via_ga\`, where the very first module owner was already a GA user. Each card is counted once (a June-2026 migrated old-safe/new-safe pair is collapsed to a single canonical card). The value is the running total as of the latest complete day.

**Measurement limit (frozen ~June 5, 2026):** this count only includes cards onboarded under the old DelayModule architecture, where the Gnosis-App identity was recorded on-chain as a module owner. The June-2026 post-exploit migration moved cards to a RolesModule architecture in which the module owner is the user's own self-custody key and the app operates via a single shared controller (0x896a695d…) — so the Gnosis-App identity is no longer on-chain per card and post-migration cards can't be classified. Effectively frozen at the pre-migration total, not a real halt in onboarding.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_gp_wallets_imported`,
};
export default metric;
