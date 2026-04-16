const metric = {
  id: 'api_execution_gnosis_app_retention_monthly_heatmap',
  name: 'Retention — Monthly Cohorts',
  description: 'Cohort × months-since onboarding',
  metricDescription: `Each row is a cohort of users grouped by the month of their first Gnosis App heuristic hit. Each column is a calendar month.

- % — What percentage of the cohort was active that month.
- \\# — How many users from the cohort were active.
- $ — Total USD volume from that cohort.

Example: if the Dec 2025 row shows 65% in Feb 2026, it means 65% of users who onboarded in Dec 2025 were still active in Feb 2026.`,
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
    'pct|amount': { field: 'amount_retention_pct',  format: 'formatPercentageInt',    label: '%', visualMapCenter: 100, visualMapPercentile: true },
    'val|users':  { field: 'value_abs',             format: 'formatNumber',          label: '#', visualMapPercentile: true },
    'val|amount': { field: 'value_usd',             format: 'formatCurrencyCompact', label: '$', visualMapPercentile: true },
  },
  unitFieldGroups: [
    { options: { pct: '%', val: 'val' } },
    { options: { users: '#', amount: '$' } },
  ],
  query: `
    SELECT x, y, retention_pct, value_abs, amount_retention_pct, value_usd
    FROM dbt.api_execution_gnosis_app_retention_monthly
    ORDER BY y ASC, x ASC
  `,
};
export default metric;
