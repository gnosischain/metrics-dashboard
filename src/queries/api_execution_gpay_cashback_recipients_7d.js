const metric = {
  id: 'api_execution_gpay_cashback_recipients_7d',
  name: 'Recipients',
  description: 'Unique wallets receiving cashback - Last 7 days',
  chartType: 'numberDisplay',
  variant: 'default',
  valueField: 'value',
  format: 'formatNumber',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gpay_cashback_recipients_7d`,
};
export default metric;
