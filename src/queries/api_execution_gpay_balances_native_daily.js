const metric = {
  id: 'api_execution_gpay_balances_native_daily',
  name: 'Balance by Token',
  description: 'Daily total in native units',
  metricDescription: 'Daily aggregate balance in native token units. Use the dropdown to switch between EURe, GBPe, USDC.e, and GNO. Each token is shown in its own denomination.',
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
    FROM dbt.api_execution_gpay_balances_native_daily
  `,
};
export default metric;
