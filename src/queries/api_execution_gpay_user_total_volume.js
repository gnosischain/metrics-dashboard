const metric = {
  id: 'api_execution_gpay_user_total_volume',
  name: 'Payments Volume',
  description: 'Lifetime payment volume (USD)',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatCurrency',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `SELECT wallet_address, value FROM dbt.api_execution_gpay_user_total_volume`,
};
export default metric;
