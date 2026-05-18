const metric = {
  id: 'api_execution_cow_kpi_traders_7d',
  name: 'Unique Traders',
  description: 'Last 7 days',
  metricDescription: 'Distinct trader addresses (order owners) that executed at least one CoW Protocol trade in the last 7 complete days. Exact count, not approximate.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_cow_kpi_traders_7d`,
};
export default metric;
