const metric = {
  id: 'api_execution_gpay_user_total_payments',
  name: 'Total Payments',
  description: 'Lifetime payment count',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `SELECT wallet_address, value FROM dbt.api_execution_gpay_user_total_payments`,
};
export default metric;
