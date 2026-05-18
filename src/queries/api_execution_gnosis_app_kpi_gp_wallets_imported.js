const metric = {
  id: 'api_execution_gnosis_app_kpi_gp_wallets_imported',
  name: 'Imported GP Wallets',
  description: 'Cumulative',
  metricDescription: 'Pre-existing GP wallets where a GA user was later added as module owner.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_gp_wallets_imported`,
};
export default metric;
