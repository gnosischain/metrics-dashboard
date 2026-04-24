const metric = {
  id: 'api_execution_cow_kpi_trades_7d',
  name: 'Trades',
  description: 'Last 7 days',
  metricDescription: 'Number of CoW Protocol trades on Gnosis Chain in the last 7 complete days. Each Trade event in the GPv2Settlement contract counts as one trade.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_cow_kpi_trades_7d`,
};
export default metric;
