const metric = {
  id: 'api_execution_trades_stats_hop_distribution',
  name: 'Hop Distribution',
  description: 'Share of trades by hop count',
  metricDescription: 'Share of DEX trades by hop count — 1 hop (direct pool swaps), 2/3 hops (short routes), 4+ hops (complex aggregator routing). Window matches the Stats tab time selector.',
  chartType: 'bar',
  isTimeSeries: false,
  format: 'formatPercentageInt',

  barWidth: 'auto',
  barMaxWidth: 80,
  borderRadius: [2, 2, 0, 0],
  barOpacity: 0.9,

  xField: 'label',
  yField: 'value',

  timeWindowField: 'time_window',

  query: `SELECT label, value, bucket_order, time_window FROM dbt.api_execution_trades_stats_hop_distribution ORDER BY bucket_order`,
};

export default metric;
