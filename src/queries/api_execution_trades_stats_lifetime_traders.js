const metric = {
  id: 'api_execution_trades_stats_lifetime_traders',
  name: 'Lifetime Traders',
  description: 'All-time unique wallets',
  metricDescription: 'All-time distinct count of trader addresses (`tx_from`) across indexed DEX trades on Gnosis Chain. Not affected by the time window.',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT lifetime_unique_traders AS value FROM dbt.api_execution_trades_stats_lifetime`,
};

export default metric;
