const metric = {
  id: 'api_execution_gpay_retention_monthly',
  name: 'User Retention',
  description: 'Monthly active users by activation cohort',
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
