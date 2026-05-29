const metric = {
  id: 'api_execution_live_trades_stats_volume',
  name: 'Volume',
  description: 'Last 30 min',
  metricDescription: 'Sum of per-trade USD notionals in the feed window. Uses a conservative pricing: for trades where both sides have a price, takes the LEAST of the two (rejects inflated long-tail prices). Trades with no price on either side contribute 0.',
  format: 'formatNumberWithUSD',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  refreshInterval: 45000,
  query: `SELECT volume_usd AS value FROM dbt.api_execution_live_trades_stats`,
};

export default metric;
