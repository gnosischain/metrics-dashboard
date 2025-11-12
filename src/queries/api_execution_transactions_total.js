const metric = {
  id: 'api_execution_transactions_total',
  name: 'Transactions Count',
  description: 'All-time',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT * FROM dbt.api_execution_transactions_total`,
};
export default metric;