const metric = {
  id: 'api_execution_circles_v2_pools_reserves_latest',
  name: 'Pool Reserves',
  description: 'Both token reserves of each pool',
  metricDescription: `Current reserves of **both tokens** in each main Circles DEX pool — two rows per pool (one per leg). \`Reserve\` is the token amount held by the pool (Uniswap V3 pools: reconstructed from event deltas, matches on-chain \`balanceOf\` within a few %; the Balancer pool: from the vault balances). \`Price\` is the token's USD price (CRC legs from their trade VWAP, stablecoin legs from the oracle) and \`Value\` = reserve × price — the two Values for a pool sum to its TVL. Pools: s-CBG/sDAI, s-gCRC/sDAI, EURe/s-gCRC, and the Balancer s-gCRC/sDAI pool.`,
  chartType: 'table',
  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: false,
    rowHeight: 48,
    movableColumns: false,
    groupBy: 'pool',
    columns: [
      { title: 'Pool',        field: 'pool',         minWidth: 220, widthGrow: 2, sorter: 'string' },
      { title: 'Token',       field: 'token_symbol', width: 110, sorter: 'string' },
      { title: 'Reserve',     field: 'reserve',      width: 160, sorter: 'number', hozAlign: 'right', formatter: 'money', formatterParams: { precision: 2, thousand: ',' } },
      { title: 'Price (USD)', field: 'price_usd',    width: 130, sorter: 'number', hozAlign: 'right', formatter: 'money', formatterParams: { precision: 4, symbol: '$' } },
      { title: 'Value (USD)', field: 'tvl_usd',      width: 140, sorter: 'number', hozAlign: 'right', formatter: 'money', formatterParams: { precision: 0, symbol: '$' } },
    ],
  },
  query: `
    SELECT
      pool,
      token_symbol,
      round(reserve, 2)   AS reserve,
      round(price_usd, 6) AS price_usd,
      round(tvl_usd, 2)   AS tvl_usd
    FROM dbt.api_execution_circles_v2_pools_reserves_latest
    ORDER BY pool, tvl_usd DESC
  `,
};
export default metric;
