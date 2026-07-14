const metric = {
  id: 'api_execution_live_trades_stats_multihop',
  name: 'Multi-hop',
  description: 'Last 30 min',
  metricDescription: 'Share of trades in the feed window that route through more than one pool — i.e. the transaction contains swaps on 2+ protocols/pools in sequence. Indicates how much of current activity is complex routing vs direct single-pool swaps.',
  format: 'formatPercentage',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  refreshInterval: 45000,
  query: `SELECT multihop_share_pct AS value FROM dbt.api_execution_live_trades_stats`,
};

export default metric;
