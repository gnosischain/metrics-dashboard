const metric = {
  id: 'api_execution_circles_v2_pools_trades_7d',
  name: 'Trades (7d)',
  description: 'Trailing 7-day swap count, all tracked pools',
  metricDescription: `**Trailing 7-day swap count** across four pools (Uniswap V3 + Balancer V3). Counts every Swap event on the tracked pools over the last 7 complete days, summed across pools.`,
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  query: `SELECT sum(trades_7d) AS value FROM dbt.api_execution_circles_v2_pools_latest`,
};
export default metric;
