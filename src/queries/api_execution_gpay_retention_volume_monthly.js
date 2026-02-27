const metric = {
  id: 'api_execution_gpay_retention_volume_monthly',
  name: 'Volume',
  description: 'By activation cohort, in USD',
  metricDescription: 'Monthly payment volume in USD broken down by activation cohort. Each color represents spending from users who made their first payment in that month. Shows how spending from each cohort evolves over time.',
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
