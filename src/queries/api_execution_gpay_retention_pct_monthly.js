const metric = {
  id: 'api_execution_gpay_retention_pct_monthly',
  name: 'Retention Heatmap',
  description: 'Retention rate by activation cohort — rows are cohort months, columns are activity months',
  metricDescription: 'Cohort retention matrix where rows are activation cohorts and columns are activity months. Each cell is retained user share for that cohort-month pair.',
  chartType: 'heatmap',
  xField: 'x',
  yField: 'y',
  valueField: 'value',
  format: 'formatPercentage',
  showLabels: true,
  visualMapOrient: 'vertical',
  grid: { right: '8%', bottom: '8%' },
  query: `
    SELECT x, y, value
    FROM dbt.api_execution_gpay_retention_pct_monthly
  `,
};
export default metric;
