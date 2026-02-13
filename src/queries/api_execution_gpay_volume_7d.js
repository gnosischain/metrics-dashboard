const metric = {
  id: 'api_execution_gpay_volume_7d',
  name: 'Volume',
  description: 'Last 7 days',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gpay_volume_7d`,
};
export default metric;
