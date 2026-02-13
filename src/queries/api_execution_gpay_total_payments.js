const metric = {
  id: 'api_execution_gpay_total_payments',
  name: 'Total Payments',
  description: 'All-time',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_execution_gpay_total_payments`,
};
export default metric;
