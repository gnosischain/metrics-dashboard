const metric = {
  id: 'api_execution_circles_v2_pools_volume_7d',
  name: 'Volume (7d)',
  description: 'Trailing 7-day swap volume, all tracked pools',
  metricDescription: `**Trailing 7-day trading volume** across the four main Circles DEX pools (s-CBG/sDAI, s-gCRC/sDAI, EURe/s-gCRC on Uniswap V3, and s-gCRC/sDAI on Balancer V3), in USD. Sums the USD value of every swap in each pool over the last 7 complete days. Volume is USD-denominated using the priced leg of each trade.`,
  format: 'formatCurrency',
  valueField: 'value',
  chartType: 'numberDisplay',
  query: `SELECT round(sum(volume_7d), 2) AS value FROM dbt.api_execution_circles_v2_pools_latest`,
};
export default metric;
