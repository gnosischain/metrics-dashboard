const metric = {
  id: 'api_execution_gpay_user_balances_daily',
  name: 'Balance by Token',
  description: 'Daily wallet balance by token',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: false,
  xField: 'date',
  yField: 'value_usd',
  seriesField: 'label',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  enableFiltering: true,
  labelField: 'token',
  unitFilterField: 'unit',
  format: 'formatCurrency',
  unitFields: {
    native: { field: 'value_native', format: 'formatNumber' },
    usd: { field: 'value_usd', format: 'formatCurrency' }
  },
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, date, token, label, value_native, value_usd
    FROM dbt.api_execution_gpay_user_balances_daily
  `,
};
export default metric;
