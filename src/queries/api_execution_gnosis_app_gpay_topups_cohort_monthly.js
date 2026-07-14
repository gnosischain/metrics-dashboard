const metric = {
  id: 'api_execution_gnosis_app_gpay_topups_cohort_monthly',
  name: 'TopUp Retention',
  description: 'First-topup cohort × subsequent activity',
  metricDescription: `Each row is a cohort of Gnosis App users grouped by the month of their **first** Gnosis Pay top-up; each column is a later calendar month, tracking that cohort's subsequent top-up activity. A **top-up** is a Gnosis Pay "Crypto Deposit" into a currently GA-owned wallet, counted from the 2025-11-12 GA launch onward; the current, incomplete month is excluded. Toggle the cell value:

- **%** — share of the cohort active that month, measured on users (\`retention_pct\`) or on USD volume (\`amount_retention_pct\`), each relative to the cohort's own first month.
- \\# — distinct cohort users who topped up that month.
- **$** — total top-up USD volume from the cohort that month.`,
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
    FROM dbt.api_execution_gnosis_app_gpay_topups_cohort_monthly
    ORDER BY y ASC, x ASC
  `,
};
export default metric;
