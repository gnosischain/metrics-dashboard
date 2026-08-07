const metric = {
  id: 'api_celo_gpay_funded_addresses_daily',
  name: 'Funded Cards',
  description: 'Cumulative over time',
  metricDescription: 'Running total of card Safes that have ever received money on Celo (first inbound transfer). Distinct from Activated Cards (first spend).',
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
    FROM dbt.api_celo_gpay_funded_addresses_daily
  `,
};
export default metric;
