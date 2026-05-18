const metric = {
  id: 'api_execution_gnosis_app_kpi_gp_wallets_latest',
  name: 'GP Wallets on GA',
  description: 'Current',
  metricDescription: 'Count of Gnosis Pay wallets where at least one current owner is a Gnosis App user.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_gp_wallets_latest`,
};
export default metric;
