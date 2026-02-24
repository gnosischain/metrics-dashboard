const metric = {
  id: 'api_execution_gpay_payments_by_token_daily',
  name: 'Payments',
  description: 'Daily payment count',
  metricDescription: 'Daily payment count split by token. Stacked bars show token mix and overall payment activity.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  tooltipOrder: 'valueDesc',
  resolutions: ['daily', 'weekly', 'monthly'],
  defaultResolution: 'weekly',
  query: `
    SELECT date, label, value
    FROM dbt.api_execution_gpay_payments_by_token_daily
  `,
};
export default metric;
