const metric = {
  id: 'api_execution_gnosis_app_token_offer_claims_cohort_monthly',
  name: 'Token Offer Retention',
  description: 'First-claim cohort × subsequent activity',
  metricDescription: `Each row (\`y\`) groups Gnosis App users by the month of their **first** token-offer claim (spending CRC to receive an offer token via a Circles v2 \`ERC20TokenOfferCycle\`, Cometh-routed); each column (\`x\`) is a later calendar month showing how much of that cohort kept claiming. The current partial month is excluded, and USD is valued on the received token only (CRC spent has no USD feed).

- **%** (\`retention_pct\`) — share of the cohort's first-month size that claimed in that month; the amount view uses \`amount_retention_pct\` (USD claimed vs the cohort's initial month).
- **\\#** (\`value_abs\`) — distinct cohort users who claimed that month.
- **$** (\`value_usd\`) — total received-side USD claimed by the cohort that month.`,
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
