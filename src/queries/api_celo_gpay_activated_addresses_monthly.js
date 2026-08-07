const metric = {
  id: 'api_celo_gpay_activated_addresses_monthly',
  name: 'Activated Cards',
  description: 'Cumulative over time',
  metricDescription: `
  Running total of card Safes that have ever spent on Celo (first Payment to a
  settlement contract). Companion to Funded Cards, which counts first inbound
  money. Celo-only.
  `,
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
    FROM dbt.api_celo_gpay_activated_addresses_monthly
  `,
};
export default metric;
