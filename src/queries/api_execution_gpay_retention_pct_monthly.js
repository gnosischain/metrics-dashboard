const metric = {
  id: 'api_execution_gpay_retention_pct_monthly',
  name: 'User Retention',
  description: 'By activation cohort',
  metricDescription: 'Each row is a cohort of users grouped by the month they made their first payment. Each column is a calendar month. The cell shows what % of that cohort was active (made at least one payment) in that month. Toggle to # to see absolute user counts instead.\n\nExample: if the Jun 2024 row shows 65% in the Oct 2024 column, it means 65% of users who first paid in Jun 2024 were still active in Oct 2024.',
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
  },
  query: `
    SELECT x, y, value_pct, value_abs
    FROM dbt.api_execution_gpay_retention_pct_monthly
  `,
};
export default metric;
