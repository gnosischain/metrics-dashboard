const metric = {
  id: 'api_execution_gnosis_app_kpi_gp_wallets_onboarded',
  name: 'Onboarded via GA',
  description: 'Cumulative',
  metricDescription: `Cumulative count of Gnosis Pay cards that were first activated through the Gnosis App. A card is \`onboarded_via_ga\` when the very first owner module ever enabled on its Safe Delay Module was a **Gnosis App user** address (versus \`imported\`, where the first owner was some other address). Migrated old/new Safe pairs are collapsed to one \`canonical_address\`. A running total across all dates before today; a count of cards, not USD.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_gp_wallets_onboarded`,
};
export default metric;
