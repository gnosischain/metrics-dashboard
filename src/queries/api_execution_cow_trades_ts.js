const metric = {
  id: 'api_execution_cow_trades_ts',
  name: 'CoW Daily Trades',
  description: 'Daily trade count on CoW Protocol',
  metricDescription: 'Daily number of individual trades (Trade events) settled through CoW Protocol on Gnosis Chain.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatNumber',

  smooth: true,
  symbolSize: 0,
  lineWidth: 2,
  areaOpacity: 0.6,

  xField: 'date',
  yField: 'value',

  query: `SELECT date, value FROM dbt.api_execution_cow_trades_ts`,
};
export default metric;
