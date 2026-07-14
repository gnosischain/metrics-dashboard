const metric = {
  id: 'api_celo_gpay_retention_pct_monthly',
  name: 'User Retention',
  description: 'By activation cohort',
  metricDescription: `
  Each row is a cohort of Safes grouped by the month they made their first payment.
  Each column is a calendar month.

  - % — What percentage of the cohort was active that month.
  - \\# — How many Safes from the cohort were active.
  - $ — Total payment volume (USD) from that cohort.

  Example: if the Jun 2026 row shows 65% in Oct 2026, it means 65% of Safes that first paid in Jun 2026 were still active in Oct 2026.`,
  chartType: 'heatmap',
  xField: 'x',
  yField: 'y',
  valueField: 'value_pct',
  format: 'formatPercentageInt',
  showLabels: true,
  enableZoom: true,
  visualMapOrient: 'vertical',
  grid: { right: '12%', bottom: '8%' },
  unitFields: {
    'pct|users':  { field: 'retention_pct',       format: 'formatPercentageInt',    label: '%' },
    'pct|amount': { field: 'amount_retention_pct', format: 'formatPercentageInt',    label: '%', visualMapCenter: 100, visualMapPercentile: true },
    'val|users':  { field: 'value_abs',            format: 'formatNumber',          label: '#', visualMapPercentile: true },
    'val|amount': { field: 'value_usd',            format: 'formatCurrencyCompact', label: '$', visualMapPercentile: true },
  },
  unitFieldGroups: [
    { options: { pct: '%', val: 'val' } },
    { options: { users: '#', amount: '$' } },
  ],
  query: `
    SELECT x, y, retention_pct, value_abs, amount_retention_pct, value_usd
    FROM dbt.api_celo_gpay_retention_pct_monthly
  `,
};
export default metric;
