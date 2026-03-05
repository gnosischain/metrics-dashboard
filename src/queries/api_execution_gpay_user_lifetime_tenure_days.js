const metric = {
  id: 'api_execution_gpay_user_lifetime_tenure_days',
  name: 'Tenure Days',
  description: 'Wallet lifetime',
  metricDescription: 'Days between first and last recorded Gnosis Pay activity for the selected wallet.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, tenure_days AS value
    FROM dbt.api_execution_gpay_user_lifetime_metrics
  `,
};

export default metric;
