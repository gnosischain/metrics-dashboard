const metric = {
  id: 'api_execution_trades_stats_lifetime_trades',
  name: 'Lifetime Trades',
  description: 'All-time transaction count',
  metricDescription: 'All-time distinct transaction count of indexed DEX trades on Gnosis Chain. Multi-hop router swaps are counted as one trade. Not affected by the time window.',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT lifetime_trade_count AS value FROM dbt.api_execution_trades_stats_lifetime`,
};

export default metric;
