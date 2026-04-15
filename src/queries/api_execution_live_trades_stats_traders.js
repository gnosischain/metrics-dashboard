const metric = {
  id: 'api_execution_live_trades_stats_traders',
  name: 'Unique Traders',
  description: 'Last 30 min',
  metricDescription: 'Distinct tx.from_address values across the feed window. This is the EOA that initiated the swap, not the settlement recipient.',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT unique_traders AS value FROM dbt.api_execution_live_trades_stats`,
};

export default metric;
