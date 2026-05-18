const metric = {
  id: 'api_execution_cow_kpi_volume_7d',
  name: 'Volume',
  description: 'Last 7 days',
  metricDescription: 'Total CoW Protocol trading volume (USD) on Gnosis Chain in the last 7 complete days.',
  chartType: 'numberDisplay',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_cow_kpi_volume_7d`,
};
export default metric;
