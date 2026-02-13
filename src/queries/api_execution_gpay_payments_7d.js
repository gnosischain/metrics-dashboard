const metric = {
  id: 'api_execution_gpay_payments_7d',
  name: 'Payments',
  description: 'Last 7 days',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gpay_payments_7d`,
};
export default metric;
