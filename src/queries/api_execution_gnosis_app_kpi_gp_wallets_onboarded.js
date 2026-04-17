const metric = {
  id: 'api_execution_gnosis_app_kpi_gp_wallets_onboarded',
  name: 'Onboarded via GA',
  description: 'Cumulative',
  metricDescription: 'GP wallets whose first-ever module owner was a Gnosis App user.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_gp_wallets_onboarded`,
};
export default metric;
