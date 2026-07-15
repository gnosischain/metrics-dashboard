const metric = {
  id: 'api_execution_circles_v2_pools_tvl_daily',
  name: 'Reserves / TVL (daily)',
  description: 'USD value locked per pool over time',
  metricDescription: `Daily **total value locked (TVL)** in each main Circles DEX pool (Uniswap V3 + Balancer V3), in USD, stacked to show combined reserves and each pool's share. Uniswap V3 reserves are reconstructed from event deltas (cumulative net token flow — matches on-chain \`balanceOf\` within a few %) and the Balancer V3 leg from vault balances; CRC legs (s-gCRC, s-CBG) are valued at their daily median trade price and stablecoin legs (sDAI, EURe) at the oracle price (ASOF carry-forward). Pools: **s-CBG/sDAI**, **s-gCRC/sDAI**, **EURe/s-gCRC**, **s-gCRC/sDAI (Balancer)**. Marked "est." because for the inflationary CRC tokens the delta-based reserve can drift a few % from a true on-chain read. The current incomplete day is excluded.`,
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'pool',
  labelField: 'pool',
  format: 'formatCurrency',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  query: `
    SELECT date, pool, round(tvl_usd, 2) AS value
    FROM dbt.api_execution_circles_v2_pools_reserves_daily
    WHERE tvl_usd > 0
    ORDER BY date
  `,
};
export default metric;
