const metric = {
  id: 'api_execution_trades_stats_size_distribution',
  name: 'Trade Size Distribution',
  description: 'Share of trades by USD size',
  metricDescription: 'Share of DEX trades by USD notional size bucket, computed as the max per-hop amount_usd within a transaction (matches the live-feed `trade_usd` convention). Window matches the Stats tab time selector.',
  chartType: 'bar',
  isTimeSeries: false,
  format: 'formatPercentageInt',
  horizontal: true,
  preserveOrder: true,

  barWidth: 'auto',
  barMaxWidth: 32,
  borderRadius: [0, 2, 2, 0],
  barOpacity: 0.9,

  xField: 'label',
  yField: 'value',

  timeWindowField: 'time_window',

  query: `SELECT label, value, bucket_order, time_window FROM dbt.api_execution_trades_stats_size_distribution ORDER BY bucket_order`,
};

export default metric;
