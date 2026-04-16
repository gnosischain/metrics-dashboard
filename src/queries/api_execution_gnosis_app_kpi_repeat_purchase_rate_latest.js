const metric = {
  id: 'api_execution_gnosis_app_kpi_repeat_purchase_rate_latest',
  name: 'Repeat Purchase Rate',
  description: 'Last 30 days',
  metricDescription: 'Share of active Gnosis App users with ≥ 2 filled swaps or marketplace buys in the last 30 days.',
  chartType: 'numberDisplay',
  format: 'formatPercent',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_repeat_purchase_rate_latest`,
};
export default metric;
