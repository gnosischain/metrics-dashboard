const metric = {
  id: 'api_execution_gpay_active_users_7d',
  name: 'Active Users',
  description: 'Last 7 days',
  metricDescription: 'Unique wallets that made at least one card payment in the last 7 days. The change percentage compares to the prior 7-day window.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gpay_active_users_7d`,
};
export default metric;
