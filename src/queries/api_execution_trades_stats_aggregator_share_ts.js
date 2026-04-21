const metric = {
  id: 'api_execution_trades_stats_aggregator_share_ts',
  name: 'Aggregator Share',
  description: 'Daily share of trades by router/aggregator (stacks to 100%)',
  metricDescription: 'Daily share of trades by router/aggregator. A trade is assigned to its transaction-level `tx_to` when labeled in int_crawlers_data_labels; unlabeled transactions are bucketed as "Direct". Each day sums to 100%.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatPercentageInt',
  showTotal: false,

  smooth: true,
  symbolSize: 0,
  lineWidth: 1,
  areaOpacity: 0.75,

  defaultZoom: { start: 0, end: 100 },

  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT date, label, value FROM dbt.api_execution_trades_stats_aggregator_share_ts`,
};

export default metric;
