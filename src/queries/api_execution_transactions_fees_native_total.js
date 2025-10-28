const metric = {
  id: 'api_execution_transactions_fees_native_total',
  name: 'Fees (Native)',
  description: 'All-time',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT * FROM dbt.api_execution_transactions_fees_native_total`,
};
export default metric;