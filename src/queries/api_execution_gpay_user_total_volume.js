const metric = {
  id: 'api_execution_gpay_user_total_volume',
  name: 'Payments Volume',
  description: 'Lifetime payment volume (USD)',
  metricDescription: `
  All-time card payment volume in USD for the selected wallet. 
  Counts only wallet-to-merchant transfers (card spend at point of sale).
  `,
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatCurrency',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `SELECT wallet_address, value FROM dbt.api_execution_gpay_user_total_volume`,
};
export default metric;
