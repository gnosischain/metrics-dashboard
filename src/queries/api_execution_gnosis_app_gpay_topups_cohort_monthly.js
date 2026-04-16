const metric = {
  id: 'api_execution_gnosis_app_gpay_topups_cohort_monthly',
  name: 'TopUp Retention',
  description: 'First-topup cohort × subsequent activity',
  metricDescription: `Each row is a cohort of users grouped by the month of their first Gnosis App → Gnosis Pay TopUp. Each column is a calendar month. Tracks their subsequent TopUp activity.

- % — What percentage of the cohort topped up that month.
- \\# — How many users from the cohort topped up.
- $ — Total TopUp USD volume from that cohort.`,
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
