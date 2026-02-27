const metric = {
  id: 'api_execution_gpay_user_lifetime_total_withdrawal_volume_usd',
  name: 'Total Withdrawals',
  description: 'Wallet lifetime (USD)',
  metricDescription: 'Total lifetime withdrawal volume (fiat off-ramps + crypto withdrawals) for the selected wallet.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatCurrency',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, total_withdrawal_volume_usd AS value
    FROM dbt.api_execution_gpay_user_lifetime_metrics
  `,
};

export default metric;
