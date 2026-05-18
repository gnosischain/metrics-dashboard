const metric = {
  id: 'api_execution_trades_stats_size_distribution',
  name: 'Trade Size Distribution',
  description: 'Share of trades by USD size (last 30 days)',
  metricDescription: 'Share of DEX trades by USD notional size bucket, computed as the max per-hop amount_usd within a transaction (matches the live-feed `trade_usd` convention). Fixed 30-day window; not affected by the Stats tab time selector.',
  chartType: 'bar',
  isTimeSeries: false,
  format: 'formatPercentageInt',

  barWidth: 'auto',
  barMaxWidth: 60,
  borderRadius: [2, 2, 0, 0],
  barOpacity: 0.9,

  xField: 'label',
  yField: 'value',

  query: `SELECT label, value FROM dbt.api_execution_trades_stats_size_distribution ORDER BY bucket_order`,
};

export default metric;
