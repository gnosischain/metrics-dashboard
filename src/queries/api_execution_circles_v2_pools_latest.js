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

// Same-tab in-app navigation (mirrors the group leaderboard drill-down):
// pushState + popstate lets Dashboard hydrate the Pool Explorer's global filter
// from the URL without a full reload. Navigate on a plain left click; defer to
// the browser default for modifier / middle clicks (open in new tab).
const navigateInApp = (href, event) => {
  if (!href || typeof window === 'undefined') return false;
  if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || Number(event.button) > 0)) {
    return false;
  }
  if (event && typeof event.preventDefault === 'function') event.preventDefault();
  const nextUrl = href.startsWith('?') ? `${window.location.pathname}${href}` : href;
  const currentUrl = `${window.location.pathname}${window.location.search}`;
  if (nextUrl === currentUrl) return false;
  window.history.pushState({}, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
  return true;
};

const metric = {
  id: 'api_execution_circles_v2_pools_latest',
  name: 'Pools Leaderboard',
  description: 'The main Circles DEX pools at a glance',
  metricDescription: `One row per main Circles DEX pool (Uniswap V3 + Balancer V3), summarising liquidity and recent activity. **TVL (est.)** is the current USD value of both token reserves — reserves reconstructed from Uniswap V3 event deltas (within ~0.1% of on-chain \`balanceOf\`), CRC legs (s-gCRC, s-CBG) valued at their daily median trade price from the crc20 price model (ASOF carry-forward) and stablecoin legs at oracle price; it matches external references (oku.trade ≈ $31.6k for s-gCRC/sDAI). **Volume 7d**, **Trades 7d**, **Traders 7d** and **Fees 7d** are trailing-7-day totals; traders are distinct takers (Swap recipient, falling back to tx signer) deduplicated per pool. "est." flags that the auto-updating daily-exact TVL (on-chain balances for the inflationary CRC tokens) is a follow-up. Click a row to open that pool in the Pool Explorer (its address link opens Blockscout).`,
  chartType: 'table',
  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: false,
    rowHeight: 56,
    movableColumns: false,
    columns: [
      { title: 'Pool',       field: 'pool',         minWidth: 260, widthGrow: 3, sorter: 'string', formatter: formatPoolCell },
      { title: 'Protocol',   field: 'protocol',     width: 120, sorter: 'string' },
      { title: 'TVL (est.)', field: 'tvl_usd',      width: 130, sorter: 'number', hozAlign: 'right', formatter: 'money', formatterParams: { precision: 0, symbol: '$' } },
      { title: 'Vol 7d',     field: 'volume_7d',    width: 120, sorter: 'number', hozAlign: 'right', formatter: 'money', formatterParams: { precision: 2, symbol: '$' } },
      { title: 'Trades 7d',  field: 'trades_7d',    width: 110, sorter: 'number', hozAlign: 'right' },
      { title: 'Traders 7d', field: 'traders_7d',   width: 120, sorter: 'number', hozAlign: 'right' },
      { title: 'Fees 7d',    field: 'fees_7d',      width: 110, sorter: 'number', hozAlign: 'right', formatter: 'money', formatterParams: { precision: 2, symbol: '$' } },
    ],
    onRowClick: (rowData, _row, event) => {
      const p = String(rowData.pool_address || '').toLowerCase();
      if (p) navigateInApp(`?dashboard=circles&tab=pool-explorer&pool_address=${p}`, event);
    },
  },
  query: `
    SELECT
      pool,
      pool_address,
      protocol,
      round(tvl_usd, 2)   AS tvl_usd,
      round(volume_7d, 2) AS volume_7d,
      trades_7d,
      traders_7d,
      round(fees_7d, 2)   AS fees_7d
    FROM dbt.api_execution_circles_v2_pools_latest
    ORDER BY tvl_usd DESC NULLS LAST
  `,
};
export default metric;
