const metric = {
  id: 'api_execution_gpay_user_actions_radar',
  name: 'Action Profile',
  description: 'Action count by type',
  metricDescription: 'Radar profile of lifetime action counts for the selected wallet across all supported Gnosis Pay actions.',
  chartType: 'radar',
  nameField: 'profile',
  valueFields: [
    'payment',
    'reversal',
    'cashback',
    'fiat_top_up',
    'fiat_off_ramp',
    'crypto_deposit',
    'crypto_withdrawal',
    'refund',
  ],
  indicatorLabels: {
    payment: 'Payment',
    reversal: 'Reversal',
    cashback: 'Cashback',
    fiat_top_up: 'Fiat Top Up',
    fiat_off_ramp: 'Fiat Off-ramp',
    crypto_deposit: 'Crypto Deposit',
    crypto_withdrawal: 'Crypto Withdrawal',
    refund: 'Refund',
  },
  useSharedMax: true,
  radius: '60%',
  format: 'formatNumber',
  globalFilterField: 'wallet_address',
  query: `
    SELECT
      wallet_address,
      'Action Count' AS profile,
      toFloat64(countIf(action = 'Payment')) AS payment,
      toFloat64(countIf(action = 'Reversal')) AS reversal,
      toFloat64(countIf(action = 'Cashback')) AS cashback,
      toFloat64(countIf(action = 'Fiat Top Up')) AS fiat_top_up,
      toFloat64(countIf(action = 'Fiat Off-ramp')) AS fiat_off_ramp,
      toFloat64(countIf(action = 'Crypto Deposit')) AS crypto_deposit,
      toFloat64(countIf(action = 'Crypto Withdrawal')) AS crypto_withdrawal,
      toFloat64(countIf(action = 'Refund')) AS refund
    FROM dbt.api_execution_gpay_user_activity
    GROUP BY wallet_address
  `,
};

export default metric;
