const metric = {
  id: 'api_execution_gpay_payments_hourly',
  name: 'Payments',
  description: 'Hourly count by token',
  metricDescription: 'Payment counts per hour over the last 14 complete days, broken down by token. Useful for spotting intraday activity patterns and peak usage hours.',
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
