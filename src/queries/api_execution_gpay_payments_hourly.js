const metric = {
  id: 'api_execution_gpay_payments_hourly',
  name: 'Hourly Payments',
  description: 'Payment count by hour',
  metricDescription: 'Hourly payment counts over the last 14 complete days, stacked by token. Shows intraday activity patterns.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  query: `
    SELECT date, label, value
    FROM dbt.api_execution_gpay_payments_hourly
  `,
};
export default metric;
