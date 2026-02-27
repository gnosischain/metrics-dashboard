const metric = {
  id: 'api_execution_gpay_retention_pct_monthly',
  name: 'Retention Heatmap',
  description: 'Retention rate by activation cohort — rows are cohort months, columns are activity months',
  metricDescription: 'Cohort retention matrix where rows are activation cohorts and columns are activity months. Toggle between retention rate (%) and absolute user counts (#).',
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
