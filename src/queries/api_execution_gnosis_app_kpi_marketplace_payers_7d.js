const metric = {
  id: 'api_execution_gnosis_app_kpi_marketplace_payers_7d',
  name: 'Marketplace Payers',
  description: 'Last 7 days',
  metricDescription: 'Distinct Gnosis App payers across curated marketplace offers in the last 7 full days.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_marketplace_payers_7d`,
};
export default metric;
