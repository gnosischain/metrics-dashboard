const metric = {
  id: 'api_execution_gnosis_app_token_offer_claims_cohort_monthly',
  name: 'Token Offer Retention',
  description: 'First-claim cohort × subsequent activity',
  metricDescription: `Each row is a cohort of users grouped by the month of their first token-offer claim (CRC → offer_token via ERC20TokenOfferCycle). Each column is a calendar month. Tracks their subsequent claim activity.

- % — What percentage of the cohort claimed that month.
- \\# — How many users from the cohort claimed.
- $ — Total received-side USD volume from that cohort.`,
  chartType: 'heatmap',
  xField: 'x',
  yField: 'y',
  valueField: 'retention_pct',
  format: 'formatPercentageInt',
  showLabels: true,
  enableZoom: true,
  visualMapOrient: 'vertical',
  grid: { right: '12%', bottom: '8%' },
  unitFields: {
    'pct|users':  { field: 'retention_pct',        format: 'formatPercentageInt',    label: '%' },
    'pct|amount': { field: 'amount_retention_pct', format: 'formatPercentageInt',    label: '%', visualMapCenter: 100, visualMapPercentile: true },
    'val|users':  { field: 'value_abs',            format: 'formatNumber',           label: '#', visualMapPercentile: true },
    'val|amount': { field: 'value_usd',            format: 'formatCurrencyCompact',  label: '$', visualMapPercentile: true },
  },
  unitFieldGroups: [
    { options: { pct: '%', val: 'val' } },
    { options: { users: '#', amount: '$' } },
  ],
  query: `
    SELECT x, y, retention_pct, value_abs, amount_retention_pct, value_usd
    FROM dbt.api_execution_gnosis_app_token_offer_claims_cohort_monthly
    ORDER BY y ASC, x ASC
  `,
};
export default metric;
