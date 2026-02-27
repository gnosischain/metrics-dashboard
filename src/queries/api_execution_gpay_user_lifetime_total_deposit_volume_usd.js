const metric = {
  id: 'api_execution_gpay_user_lifetime_total_deposit_volume_usd',
  name: 'Total Deposits',
  description: 'Wallet lifetime (USD)',
  metricDescription: 'Total lifetime deposit volume (fiat top-ups + crypto deposits) for the selected wallet.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatCurrency',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, total_deposit_volume_usd AS value
    FROM dbt.api_execution_gpay_user_lifetime_metrics
  `,
};

export default metric;
