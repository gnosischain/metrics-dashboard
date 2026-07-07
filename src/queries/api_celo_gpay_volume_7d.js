const metric = {
  id: 'api_celo_gpay_volume_7d',
  name: 'Payments Volume',
  description: 'Last 7 days',
  metricDescription: `
  Total card payment volume in USD (USDC + USDT) in the last 7 days.

  The change percentage compares to the prior 7-day window.`,
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatCurrency',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_celo_gpay_volume_7d`,
};
export default metric;
