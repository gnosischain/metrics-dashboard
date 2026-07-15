const metric = {
  id: 'api_execution_circles_v2_pool_explorer_reserves',
  name: 'Reserves',
  description: 'Both token reserves of the selected pool',
  metricDescription: `Current reserves of **both tokens** in the selected pool — one row per leg. \`Reserve\` is the token amount held by the pool (Uniswap V3: reconstructed from event deltas, matches on-chain \`balanceOf\` within a few %; Balancer: from the vault balances). \`Price\` is the token's USD price (CRC legs from their daily median trade price, stablecoin legs from the oracle) and \`Value\` = reserve × price — the two Values sum to the pool's TVL.`,
  chartType: 'table',
  globalFilterField: 'pool_address',
  useCached: false,

  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: false,
    rowHeight: 52,
    movableColumns: false,
    columns: [
      { title: 'Token',       field: 'token_symbol', minWidth: 70,  widthGrow: 1, sorter: 'string' },
      { title: 'Reserve',     field: 'reserve',      minWidth: 100, widthGrow: 2, sorter: 'number', hozAlign: 'right', formatter: 'money', formatterParams: { precision: 2, thousand: ',' } },
      { title: 'Price (USD)', field: 'price_usd',    minWidth: 80,  widthGrow: 1, sorter: 'number', hozAlign: 'right', formatter: 'money', formatterParams: { precision: 4, symbol: '$' } },
      { title: 'Value (USD)', field: 'tvl_usd',      minWidth: 90,  widthGrow: 1, sorter: 'number', hozAlign: 'right', formatter: 'money', formatterParams: { precision: 0, symbol: '$' } },
    ],
  },

  query: `
    SELECT
      token_symbol,
      round(reserve, 2)   AS reserve,
      round(price_usd, 6) AS price_usd,
      round(tvl_usd, 2)   AS tvl_usd
    FROM dbt.api_execution_circles_v2_pools_reserves_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY tvl_usd DESC
  `,
};

export default metric;
