const metric = {
  id: 'api_execution_gnosis_app_kpi_marketplace_buys_total',
  name: 'Total Marketplace Buys',
  description: 'All time',
  metricDescription: 'Lifetime Gnosis App marketplace buys across all curated offers.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_marketplace_buys_total`,
};
export default metric;
