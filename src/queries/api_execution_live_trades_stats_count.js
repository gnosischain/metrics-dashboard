const metric = {
  id: 'api_execution_live_trades_stats_count',
  name: 'Trades',
  description: 'Last 30 min',
  metricDescription: 'Number of DEX transactions in the feed window (last 30 minutes of cached data, after the 60s reorg buffer and dust filter). Each row = one on-chain transaction; multi-hop router paths are one trade.',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT trade_count AS value FROM dbt.api_execution_live_trades_stats`,
};

export default metric;
