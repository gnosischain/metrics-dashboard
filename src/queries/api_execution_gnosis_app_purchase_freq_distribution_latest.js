const metric = {
  id: 'api_execution_gnosis_app_purchase_freq_distribution_latest',
  name: 'Purchase Frequency (30d)',
  description: 'Users by # of purchases in last 30 days',
  metricDescription: 'Histogram of last-30-day purchase counts per Gnosis App user (swap_filled + marketplace_buy). Bucket order: 1 / 2 / 3 / 4-5 / 6-10 / 11+. Replaces the binary repeat_purchase_rate with a full distribution.',
  chartType: 'bar',
  isTimeSeries: false,
  format: 'formatNumber',
  xField: 'bucket',
  yField: 'n_users',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT bucket_order, bucket, n_users
    FROM dbt.api_execution_gnosis_app_purchase_freq_distribution_latest
    ORDER BY bucket_order
  `,
};
export default metric;
