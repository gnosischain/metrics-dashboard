const metric = {
  id: 'api_execution_gpay_volume_payments_by_token_weekly',
  name: 'Volume by Token',
  description: 'Weekly payment volume in USD',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatCurrency',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  query: `
    SELECT date, label, value
    FROM dbt.api_execution_gpay_volume_payments_by_token_weekly
  `,
};
export default metric;
