const metric = {
  id: 'api_execution_gpay_retention_volume_monthly',
  name: 'Volume by Cohort',
  description: 'Monthly payment volume (USD) by activation cohort',
  metricDescription: 'Monthly payment volume (USD) by activation cohort. Shows how spending retention evolves after first activation month.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatCurrency',
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT date, label, value
    FROM dbt.api_execution_gpay_retention_volume_monthly
  `,
};
export default metric;
