const metric = {
  id: 'api_execution_gpay_user_lifetime_inactivity_days',
  name: 'Inactivity Days',
  description: 'Wallet recency',
  metricDescription: 'Days since the selected wallet last recorded Gnosis Pay activity.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `
    SELECT
      wallet_address,
      dateDiff('day', toDate(last_activity_date), today()) AS value
    FROM dbt.api_execution_gpay_user_lifetime_metrics
  `,
};

export default metric;
