const metric = {
  id: 'api_execution_gpay_retention_pct_monthly',
  name: 'Retention Heatmap',
  description: 'Retention rate by activation cohort — rows are cohort months, columns are activity months',
  chartType: 'heatmap',
  xField: 'x',
  yField: 'y',
  valueField: 'value',
  format: 'formatPercentage',
  showLabels: true,
  query: `
    SELECT x, y, value
    FROM dbt.api_execution_gpay_retention_pct_monthly
  `,
};
export default metric;
