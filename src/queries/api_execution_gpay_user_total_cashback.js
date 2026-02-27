const metric = {
  id: 'api_execution_gpay_user_total_cashback',
  name: 'Total Cashback',
  description: 'Lifetime cashback earned (GNO)',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `SELECT wallet_address, value FROM dbt.api_execution_gpay_user_total_cashback`,
};
export default metric;
