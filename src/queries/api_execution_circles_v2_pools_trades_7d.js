const metric = {
  id: 'api_execution_circles_v2_pools_trades_7d',
  name: 'Trades (7d)',
  metricDescription: `**Trailing 7-day swap count** across the three main Circles DEX pools (s-CBG/sDAI, s-gCRC/sDAI, EURe/s-gCRC on Uniswap V3). Counts every Swap event on the tracked pools over the last 7 complete days, summed across pools.`,
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  query: `SELECT sum(trades_7d) AS value FROM dbt.api_execution_circles_v2_pools_latest`,
};
export default metric;
