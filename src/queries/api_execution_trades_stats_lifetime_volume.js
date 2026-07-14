const metric = {
  id: 'api_execution_trades_stats_lifetime_volume',
  name: 'Lifetime Volume',
  description: 'All-time DEX volume',
  metricDescription: 'All-time sum of per-swap USD notional across indexed DEX trades on Gnosis Chain. Multi-hop routes contribute once per pool leg, consistent with the volume timeseries. Not affected by the time window.',
  format: 'formatCurrencyCompact',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT lifetime_volume_usd AS value FROM dbt.api_execution_trades_stats_lifetime`,
};

export default metric;
