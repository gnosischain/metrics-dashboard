const metric = {
  id: 'api_execution_gpay_retention_pct_monthly',
  name: 'User Retention',
  description: 'By activation cohort',
  metricDescription: 'Each row is a cohort of users grouped by the month they made their first payment. Each column is a calendar month.\n\n- % — What percentage of the cohort was active that month.\n- \\# — How many users from the cohort were active.\n- $ — Total payment volume (USD) from that cohort.\n\nExample: if the Jun 2024 row shows 65% in Oct 2024, it means 65% of users who first paid in Jun 2024 were still active in Oct 2024.',
  chartType: 'heatmap',
  xField: 'x',
  yField: 'y',
  valueField: 'value_pct',
  format: 'formatPercentage',
  showLabels: true,
  visualMapOrient: 'vertical',
  grid: { right: '8%', bottom: '8%' },
  unitFields: {
    pct: { field: 'value_pct', format: 'formatPercentage', label: '%' },
    abs: { field: 'value_abs', format: 'formatNumber', label: '#' },
    usd: { field: 'value_usd', format: 'formatCurrencyCompact', label: '$' },
  },
  query: `
    SELECT x, y, value_pct, value_abs, value_usd
    FROM dbt.api_execution_gpay_retention_pct_monthly
  `,
};
export default metric;
