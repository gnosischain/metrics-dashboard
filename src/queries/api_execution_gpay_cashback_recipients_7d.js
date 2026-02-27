const metric = {
  id: 'api_execution_gpay_cashback_recipients_7d',
  name: 'Recipients',
  description: 'Last 7 days',
  metricDescription: 'Unique wallets that received GNO cashback in the last 7 days. The change percentage compares to the prior 7-day window.',
  chartType: 'numberDisplay',
  variant: 'default',
  valueField: 'value',
  format: 'formatNumber',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gpay_cashback_recipients_7d`,
};
export default metric;
