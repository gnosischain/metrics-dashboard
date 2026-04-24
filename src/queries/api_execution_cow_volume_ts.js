const metric = {
  id: 'api_execution_cow_volume_ts',
  name: 'CoW Daily Volume',
  description: 'Daily USD trading volume on CoW Protocol',
  metricDescription: 'Daily total trading volume (USD) routed through CoW Protocol on Gnosis Chain. Priced using the best available side (buy or sell) from daily token prices.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatCurrencyCompact',

  smooth: true,
  symbolSize: 0,
  lineWidth: 2,
  areaOpacity: 0.6,

  xField: 'date',
  yField: 'value',

  query: `SELECT date, value FROM dbt.api_execution_cow_volume_ts`,
};
export default metric;
