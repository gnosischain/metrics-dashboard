const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatPoolCell = (cell) => {
  const row = cell.getRow().getData();
  const label = String(row.pool || '').trim();
  const address = String(row.pool_address || '').trim();
  const href = `https://gnosis.blockscout.com/address/${encodeURIComponent(address)}`;
  return `<div style="display:flex;flex-direction:column;min-width:0;line-height:1.25;">`
    + `<span style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(label)}</span>`
    + `<a href="${href}" target="_blank" rel="noopener noreferrer" class="table-link" `
    + `style="font-family:monospace;font-size:11px;color:var(--color-text-secondary,#94a3b8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(address)}</a>`
    + `</div>`;
};

const metric = {
  id: 'api_execution_circles_v2_pool_explorer_metadata',
  name: 'Pool Identity',
  description: 'Pair, protocol and headline liquidity/activity for the selected pool',
  metricDescription: `Identity and headline figures for the selected Circles DEX pool: the token pair, its \`protocol\` (Uniswap V3 or Balancer V3), and its contract address (click to open on Blockscout). **TVL (est.)** is the current USD value of both reserves; **Vol/Trades/Traders 7d** are trailing-7-day totals (distinct takers for traders). One row — driven by the pool picker above.`,
  chartType: 'table',
  globalFilterField: 'pool_address',
  useCached: false,

  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: false,
    height: '100%',
    rowHeight: 64,
    movableColumns: false,
    columns: [
      { title: 'Pool',       field: 'pool',       minWidth: 180, widthGrow: 3, sorter: 'string', formatter: formatPoolCell },
      { title: 'Protocol',   field: 'protocol',   minWidth: 90,  widthGrow: 1, sorter: 'string' },
      { title: 'TVL (est.)', field: 'tvl_usd',    minWidth: 90,  widthGrow: 1, sorter: 'number', hozAlign: 'right', formatter: 'money', formatterParams: { precision: 0, symbol: '$' } },
      { title: 'Vol 7d',     field: 'volume_7d',  minWidth: 90,  widthGrow: 1, sorter: 'number', hozAlign: 'right', formatter: 'money', formatterParams: { precision: 2, symbol: '$' } },
      { title: 'Trades 7d',  field: 'trades_7d',  minWidth: 80,  widthGrow: 1, sorter: 'number', hozAlign: 'right' },
      { title: 'Traders 7d', field: 'traders_7d', minWidth: 80,  widthGrow: 1, sorter: 'number', hozAlign: 'right' },
    ],
  },

  query: `
    SELECT
      pool,
      pool_address,
      protocol,
      round(tvl_usd, 2)   AS tvl_usd,
      round(volume_7d, 2) AS volume_7d,
      trades_7d,
      traders_7d
    FROM dbt.api_execution_circles_v2_pools_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY tvl_usd DESC NULLS LAST
  `,
};

export default metric;
