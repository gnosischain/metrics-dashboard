const metric = {
  id: 'api_execution_trades_stats_trades_ts',
  name: 'DEX Trades',
  description: 'Daily trade count, stacked by protocol',
  metricDescription: 'Daily number of distinct DEX trades on Gnosis Chain, stacked by protocol. Each transaction is counted once per protocol it touches, so multi-hop trades appear in multiple protocol series. Complements the volume chart: divergence between volume and trade count reveals periods of large-trade (whale) or small-trade (retail) activity.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  showTotal: true,
  tooltipOrder: 'valueDesc',

  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.7,

  defaultZoom: { start: 0, end: 100 },

  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT date, label, value FROM dbt.api_execution_trades_stats_trades_ts`,
};

export default metric;
