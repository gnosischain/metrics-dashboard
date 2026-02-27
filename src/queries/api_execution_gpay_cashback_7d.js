const metric = {
  id: 'api_execution_gpay_cashback_7d',
  name: 'Cashback',
  description: 'Last 7 days',
  metricDescription: 'GNO cashback distributed in the last 7 days. Toggle between native GNO and USD. The change percentage compares to the prior 7-day window.',
  chartType: 'numberDisplay',
  variant: 'default',
  valueField: 'value',
  unitFilterField: 'unit',
  unitFields: {
    native: { field: 'value', format: 'formatNumber' },
    usd: { field: 'value', format: 'formatNumberWithUSD' },
  },
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT unit, value, change_pct FROM dbt.api_execution_gpay_cashback_7d`,
};
export default metric;
