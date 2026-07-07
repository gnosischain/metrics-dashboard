const metric = {
  id: 'api_celo_gpay_balances_native_daily',
  name: 'Balance by Token',
  description: 'Daily total in native units',
  metricDescription: 'Daily aggregate Safe balance in native token units. Use the dropdown to switch between USDC and USDT. Balances use the net-flow method over tracked transfers.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  enableFiltering: true,
  defaultZoom: {
    start: 50,
    end: 100,
  },
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  labelField: 'token',
  query: `
    SELECT date, label as token, value
    FROM dbt.api_celo_gpay_balances_native_daily
  `,
};
export default metric;
