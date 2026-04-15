const metric = {
  id: 'api_execution_live_trades_stats_aggregator',
  name: 'Via Aggregators',
  description: '% of trades routed',
  metricDescription: 'Share of feed trades where tx.to_address matches a labeled aggregator or router in int_crawlers_data_labels (CoW, 1inch, etc.). Indicates how much of current volume is retail-via-aggregator vs direct pool interactions.',
  format: 'formatPercentage',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT aggregator_share_pct AS value FROM dbt.api_execution_live_trades_stats`,
};

export default metric;
