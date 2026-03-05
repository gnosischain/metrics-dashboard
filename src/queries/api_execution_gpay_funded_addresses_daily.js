const metric = {
  id: 'api_execution_gpay_funded_addresses_daily',
  name: 'Funded Addresses',
  description: 'Cumulative Gnosis Pay wallets',
  metricDescription: 'Cumulative funded Gnosis Pay addresses by day. This tracks total funded wallets over time.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  resolutions: ['daily', 'weekly', 'monthly'],
  defaultResolution: 'weekly',
  query: `
    SELECT date, value
    FROM dbt.api_execution_gpay_funded_addresses_daily
  `,
};
export default metric;
