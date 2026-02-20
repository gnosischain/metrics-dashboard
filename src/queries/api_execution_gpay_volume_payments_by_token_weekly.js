const metric = {
  id: 'api_execution_gpay_volume_payments_by_token_weekly',
  name: 'Volume by Token',
  description: 'Weekly payment volume in USD',
  metricDescription: 'Weekly payment volume in USD split by token. Stacked bars show token contribution to total processed volume.',
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
