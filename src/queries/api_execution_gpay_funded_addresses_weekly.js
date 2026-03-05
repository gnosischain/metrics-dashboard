const metric = {
  id: 'api_execution_gpay_funded_addresses_weekly',
  name: 'Funded Wallets',
  description: 'Cumulative over time',
  metricDescription: 'Running total of wallets that have made their first Gnosis Pay card payment. Each bar shows the all-time count up to that period. A wallet is counted from the week of its first payment.',
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
