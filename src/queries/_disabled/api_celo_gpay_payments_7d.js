const metric = {
  id: 'api_celo_gpay_payments_7d',
  name: 'Payments',
  description: 'Last 7 days',
  metricDescription: `
  Total card payment count in the last 7 days.

  The change percentage compares to the prior 7-day window.`,
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_celo_gpay_payments_7d`,
};
export default metric;
