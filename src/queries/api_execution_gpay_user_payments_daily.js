const metric = {
  id: 'api_execution_gpay_user_payments_daily',
  name: 'Payments by Token',
  description: 'Daily payment volume by token (USD)',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: false,
  format: 'formatCurrency',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, date, label, value
    FROM dbt.api_execution_gpay_user_payments_daily
  `,
};
export default metric;
