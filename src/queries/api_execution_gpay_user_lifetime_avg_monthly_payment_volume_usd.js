const metric = {
  id: 'api_execution_gpay_user_lifetime_avg_monthly_payment_volume_usd',
  name: 'Avg Monthly Payment',
  description: 'Wallet lifetime (USD)',
  metricDescription: 'Average monthly payment volume for months in which the selected wallet was active.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatCurrency',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, avg_monthly_payment_volume_usd AS value
    FROM dbt.api_execution_gpay_user_lifetime_metrics
  `,
};

export default metric;
