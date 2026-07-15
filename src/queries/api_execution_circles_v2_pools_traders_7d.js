const metric = {
  id: 'api_execution_circles_v2_pools_traders_7d',
  name: 'Traders (7d)',
  description: 'Trailing 7-day distinct traders (per-pool, summed)',
  metricDescription: `**Trailing 7-day distinct traders** across four pools (Uniswap V3 + Balancer V3): s-CBG/sDAI, s-gCRC/sDAI, EURe/s-gCRC, and the Balancer s-gCRC/sDAI pool. A trader is the swap taker (Swap event recipient), falling back to the transaction signer. Distinct traders are counted per pool over the last 7 complete days and then summed across pools — a wallet active in two pools contributes to both, so this is an upper bound on ecosystem-unique traders.`,
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  query: `SELECT sum(traders_7d) AS value FROM dbt.api_execution_circles_v2_pools_latest`,
};
export default metric;
