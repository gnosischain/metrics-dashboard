const metric = {
  id: 'api_execution_gpay_cashback_impact_monthly',
  name: 'Cashback Program Impact',
  description: 'Segment behavior over time',
  metricDescription: 'Compares payer behavior by dynamic cashback segments over time.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'avg_volume_per_user',
  seriesField: 'segment',
  format: 'formatCurrency',
  valueModeOptions: [
    {
      key: 'avg_volume_per_user',
      label: 'ARPU (USD)',
      valueField: 'avg_volume_per_user',
      format: 'formatCurrency',
    },
    {
      key: 'payment_volume_usd',
      label: 'Payment Volume (USD)',
      valueField: 'payment_volume_usd',
      format: 'formatCurrency',
    },
    {
      key: 'users',
      label: 'Users',
      valueField: 'users',
      format: 'formatNumber',
    },
    {
      key: 'pct_of_total_volume',
      label: '% of Total Volume',
      valueField: 'pct_of_total_volume',
      format: 'formatPercentageInt',
    },
    {
      key: 'pct_of_total_users',
      label: '% of Total Users',
      valueField: 'pct_of_total_users',
      format: 'formatPercentageInt',
    },
  ],
  defaultValueMode: 'avg_volume_per_user',
  query: `
    SELECT
      toDate(month) AS date,
      segment,
      users,
      payment_volume_usd,
      payment_count,
      avg_volume_per_user,
      avg_tx_per_user,
      deposit_volume_usd,
      withdrawal_volume_usd,
      net_flow_usd,
      pct_of_total_volume,
      pct_of_total_users
    FROM dbt.api_execution_gpay_cashback_impact_monthly
    ORDER BY date ASC, segment ASC
  `,
};

export default metric;
