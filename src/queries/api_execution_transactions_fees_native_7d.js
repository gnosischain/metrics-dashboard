const metric = {
  id: 'api_execution_transactions_fees_native_7d',
  name: 'Transaction Fees',
  description: 'Last 7 days',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumberWithXDAI',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT * FROM dbt.api_execution_transactions_fees_native_7d`,
};
export default metric;