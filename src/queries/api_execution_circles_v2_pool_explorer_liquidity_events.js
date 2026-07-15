const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatDateTime = (cell) => {
  const v = cell.getValue();
  if (!v) return '-';
  const d = new Date(String(v).replace(' ', 'T') + 'Z');
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().replace('T', ' ').slice(0, 16);
};

const formatEventKind = (cell) => {
  const v = String(cell.getValue() || '').trim();
  const isAdd = v === 'Add';
  const color = isAdd ? '#16a34a' : '#dc2626';
  const bg = isAdd ? 'rgba(34,197,94,0.14)' : 'rgba(239,68,68,0.14)';
  const label = v || '-';
  return `<span style="display:inline-block;padding:2px 10px;border-radius:999px;`
    + `font-weight:600;font-size:12px;color:${color};background:${bg};">${escapeHtml(label)}</span>`;
};

const formatTokenLeg = (symbolField, amountField) => (cell) => {
  const row = cell.getRow().getData();
  const sym = String(row[symbolField] || '').trim();
  const amt = Number(row[amountField]);
  if (!Number.isFinite(amt) || amt === 0) {
    return `<span style="color:var(--color-text-secondary,#94a3b8);">—</span>`;
  }
  const amtStr = amt.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return `<span style="white-space:nowrap;"><span style="font-variant-numeric:tabular-nums;">${escapeHtml(amtStr)}</span> `
    + `<span style="color:var(--color-text-secondary,#94a3b8);">${escapeHtml(sym)}</span></span>`;
};

const formatAddressShort = (cell) => {
  const v = String(cell.getValue() || '').trim();
  if (!v || v === '0x0000000000000000000000000000000000000000') return '-';
  const href = `https://gnosis.blockscout.com/address/${encodeURIComponent(v)}`;
  return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer" style="font-family:monospace;">${v.slice(0, 8)}…${v.slice(-4)}</a>`;
};

const formatTxLink = (cell) => {
  const v = String(cell.getValue() || '').trim();
  if (!v) return '-';
  const href = `https://gnosis.blockscout.com/tx/${encodeURIComponent(v)}`;
  return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer" style="font-family:monospace;">${v.slice(0, 10)}…</a>`;
};

const metric = {
  id: 'api_execution_circles_v2_pool_explorer_liquidity_events',
  name: 'Liquidity Events',
  description: 'Individual add/remove liquidity events for the selected pool',
  metricDescription: `Every **liquidity event** for the selected pool, most recent first. \`Type\` is **Add** (Uniswap V3 \`Mint\` — an LP deposits liquidity) or **Remove** (\`Burn\` — position principal withdrawn). The two token columns show the amount of **each reserve token added or removed** by that event (position principal; separately-collected fees via \`Collect\` are not shown). \`Value\` is the event's USD size — each leg valued at its as-of price (CRC legs at the daily median trade price, stablecoin legs at the oracle); an event that predates the token's first market price, such as the pool-creation mint, is valued at that first observed price. \`LP\` is the position owner recorded in the event and \`Tx\` links to the transaction on Blockscout. Uniswap V3 pools only (the Balancer pool renders empty here).`,
  chartType: 'table',
  globalFilterField: 'pool_address',
  useCached: false,

  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: true,
    paginationSize: 25,
    rowHeight: 46,
    movableColumns: false,
    columns: [
      { title: 'Time',        field: 'ts',            minWidth: 150, sorter: 'datetime', formatter: formatDateTime },
      { title: 'Type',        field: 'event_kind',    width: 110, sorter: 'string', hozAlign: 'center', formatter: formatEventKind },
      { title: 'Token 0',     field: 'amount0',       minWidth: 150, widthGrow: 1, hozAlign: 'right', formatter: formatTokenLeg('token0_symbol', 'amount0') },
      { title: 'Token 1',     field: 'amount1',       minWidth: 150, widthGrow: 1, hozAlign: 'right', formatter: formatTokenLeg('token1_symbol', 'amount1') },
      { title: 'Value (USD)', field: 'amount_usd',    width: 130, sorter: 'number', hozAlign: 'right', formatter: 'money', formatterParams: { precision: 2, symbol: '$' } },
      { title: 'LP',          field: 'lp',            width: 140, formatter: formatAddressShort },
      { title: 'Tx',          field: 'tx_hash',       width: 120, formatter: formatTxLink },
    ],
    initialSort: [{ column: 'ts', dir: 'desc' }],
  },

  query: `
    SELECT
      ts,
      event_kind,
      token0_symbol,
      round(amount0, 6) AS amount0,
      token1_symbol,
      round(amount1, 6) AS amount1,
      round(amount_usd, 2) AS amount_usd,
      lp,
      tx_hash
    FROM dbt.api_execution_circles_v2_pool_explorer_liquidity_events
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY ts DESC
    LIMIT 200
  `,
};

export default metric;
