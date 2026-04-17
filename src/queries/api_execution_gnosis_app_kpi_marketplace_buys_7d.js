const metric = {
  id: 'api_execution_gnosis_app_kpi_marketplace_buys_7d',
  name: 'Marketplace Buys',
  description: 'Last 7 days',
  metricDescription: 'PaymentReceived events on curated marketplace offers paid by Gnosis App users in the last 7 full days.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_marketplace_buys_7d`,
};
export default metric;
