const metric = {
  id: 'api_execution_gpay_retention_monthly',
  name: 'User Count',
  description: 'By activation cohort',
  metricDescription: 'Monthly active user count broken down by activation cohort. Each color represents users who made their first payment in that month. Shows how many users from each cohort remain active over time.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  query: `
    SELECT date, label, value
    FROM dbt.api_execution_gpay_retention_monthly
  `,
};
export default metric;
