const metric = {
  id: 'api_celo_gpay_funded_addresses_weekly',
  name: 'Funded Cards',
  description: 'Cumulative over time',
  metricDescription: 'Running total of card Safes that have made their first Gnosis Pay card payment on Celo. Each bar shows the all-time count up to that week.',
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
    FROM dbt.api_celo_gpay_funded_addresses_weekly
  `,
};
export default metric;
