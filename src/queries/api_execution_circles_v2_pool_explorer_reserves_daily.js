const metric = {
  id: 'api_execution_circles_v2_pool_explorer_reserves_daily',
  name: 'Reserves / TVL (daily)',
  description: 'USD value of each token reserve over time',
  metricDescription: `Daily **USD value of each token leg** in the selected pool, stacked so the total height is the pool's TVL over time. Uniswap V3 reserves are reconstructed from cumulative event deltas (within a few % of on-chain \`balanceOf\`); the Balancer leg comes from the vault balances. CRC legs are valued at their trade VWAP and stablecoin legs at the oracle price. The current incomplete day is excluded.`,
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'token_symbol',
  labelField: 'token_symbol',
  format: 'formatCurrency',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  globalFilterField: 'pool_address',

  query: `
    SELECT
      date,
      token_symbol,
      round(tvl_usd, 2) AS value
    FROM dbt.api_execution_circles_v2_pools_reserves_token_daily
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY date
  `,
};

export default metric;
