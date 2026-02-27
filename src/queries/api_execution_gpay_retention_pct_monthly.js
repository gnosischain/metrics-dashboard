const metric = {
  id: 'api_execution_gpay_retention_pct_monthly',
  name: 'User Retention',
  description: 'By activation cohort',
  metricDescription: 'Each row is a cohort of users grouped by the month they made their first payment. Each column is a calendar month.\n\n- % — What percentage of the cohort was active that month.\n- \\# — How many users from the cohort were active.\n- $ — Total payment volume (USD) from that cohort.\n\nExample: if the Jun 2024 row shows 65% in Oct 2024, it means 65% of users who first paid in Jun 2024 were still active in Oct 2024.',
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
    FROM dbt.api_execution_gpay_retention_pct_monthly
  `,
};
export default metric;
