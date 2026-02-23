const metric = {
  id: 'api_execution_gpay_user_balances_daily',
  name: 'Balance by Token',
  description: 'Daily wallet balance by token (USD)',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  defaultZoom: {
    start: 50,
    end: 100,
  },
  format: 'formatCurrency',
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  tooltipOrder: 'valueDesc',
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, date, label, value
    FROM dbt.api_execution_gpay_user_balances_daily
  `,
};
export default metric;
