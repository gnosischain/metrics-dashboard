const metric = {
  id: 'api_execution_transactions_fees_native_total',
  name: 'Transaction Fees',
  description: 'All-time',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumberWithXDAI',
  query: `SELECT * FROM dbt.api_execution_transactions_fees_native_total`,
};
export default metric;