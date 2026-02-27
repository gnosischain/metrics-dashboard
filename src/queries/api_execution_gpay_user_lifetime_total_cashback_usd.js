const metric = {
  id: 'api_execution_gpay_user_lifetime_total_cashback_usd',
  name: 'Total Cashback (USD)',
  description: 'Wallet lifetime',
  metricDescription: 'Total cashback received in USD by the selected wallet.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatCurrency',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, total_cashback_usd AS value
    FROM dbt.api_execution_gpay_user_lifetime_metrics
  `,
};

export default metric;
