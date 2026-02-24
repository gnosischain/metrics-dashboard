const metric = {
  id: 'api_execution_gpay_funded_addresses_weekly',
  name: 'Funded Addresses',
  description: 'Cumulative Gnosis Pay wallets',
  metricDescription: 'Cumulative funded Gnosis Pay addresses by week. This tracks total funded wallets, not weekly net new only.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  resolutions: ['daily', 'weekly', 'monthly'],
  defaultResolution: 'weekly',
  query: `
    SELECT date, value
    FROM dbt.api_execution_gpay_funded_addresses_weekly
  `,
};
export default metric;
