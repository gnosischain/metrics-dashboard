const metric = {
  id: 'api_execution_trades_stats_volume_ts',
  name: 'DEX Volume',
  description: 'Daily USD volume, stacked by protocol',
  metricDescription: 'Daily DEX trading volume on Gnosis Chain, stacked by protocol (Uniswap V3, Balancer V2, Balancer V3, Swapr V3). Volume is summed per swap event, so multi-hop trades contribute to every protocol they touch.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatCurrencyCompact',
  showTotal: true,

  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.7,

  defaultZoom: { start: 0, end: 100 },

  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT date, label, value FROM dbt.api_execution_trades_stats_volume_ts`,
};

export default metric;
