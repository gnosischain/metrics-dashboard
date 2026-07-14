const metric = {
  id: 'api_execution_live_trades_freshness',
  name: 'Data lag',
  metricDescription: 'Seconds behind Gnosis Chain — difference between the newest ingested log in execution_live.logs and the ClickHouse server clock. Higher = staler data. If this grows unbounded, the cryo-live indexer is falling behind.',
  format: 'formatDuration',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  refreshInterval: 45000,
  query: `SELECT lag_seconds AS value FROM dbt.api_execution_live_trades_freshness`,
};

export default metric;
