const metric = {
  id: 'api_execution_gnosis_app_kpi_gp_wallets_imported',
  name: 'Imported GP Wallets',
  description: 'Cumulative',
  metricDescription: `Cumulative count of Gnosis Pay (GP) wallets classified as \`imported\` — the wallet's delay module was first enabled by a non-Gnosis-App owner (the GP card pre-existed) and a Gnosis App user was only later added as a module owner. Contrast \`onboarded_via_ga\`, where the very first module owner was already a GA user. Each card is counted once (a June-2026 migrated old-safe/new-safe pair is collapsed to a single canonical card). The value is the running total as of the latest complete day.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_gp_wallets_imported`,
};
export default metric;
