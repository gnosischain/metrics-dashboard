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

const formatTradeLeg = (symbolField, amountField) => (cell) => {
  const row = cell.getRow().getData();
  const sym = String(row[symbolField] || '').trim();
  const amt = Number(row[amountField]);
  const amtStr = Number.isFinite(amt)
    ? amt.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : '-';
  return `<span style="white-space:nowrap;"><span style="font-variant-numeric:tabular-nums;">${escapeHtml(amtStr)}</span> `
    + `<span style="color:var(--color-text-secondary,#94a3b8);">${escapeHtml(sym)}</span></span>`;
};

const formatTxLink = (cell) => {
  const v = String(cell.getValue() || '').trim();
  if (!v) return '-';
  const href = `https://gnosis.blockscout.com/tx/${encodeURIComponent(v)}`;
  return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer" style="font-family:monospace;">${v.slice(0, 10)}…</a>`;
};

const formatTrader = (cell) => {
  const v = String(cell.getValue() || '').trim();
  if (!v) return '-';
  const href = `https://gnosis.blockscout.com/address/${encodeURIComponent(v)}`;
  return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer" style="font-family:monospace;">${v.slice(0, 8)}…${v.slice(-4)}</a>`;
};

const metric = {
  id: 'api_execution_circles_v2_pool_explorer_swaps',
  name: 'Recent Swaps',
  description: 'Most recent swaps through the selected pool',
  metricDescription: `The most recent swaps routed through the selected pool (latest 200). \`Sold\`/\`Bought\` are the token amounts each side of the trade, \`Value\` is its USD size (via the stablecoin leg), \`Trader\` is the taker and \`Tx\` links to the transaction on Blockscout.`,
  chartType: 'table',
  globalFilterField: 'pool_address',
  useCached: false,

  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: true,
    paginationSize: 25,
    rowHeight: 44,
    movableColumns: false,
    columns: [
      { title: 'Time',       field: 'ts',           minWidth: 150, sorter: 'datetime', formatter: formatDateTime },
      { title: 'Sold',       field: 'amount_sold',  minWidth: 140, widthGrow: 1, hozAlign: 'right', formatter: formatTradeLeg('token_sold', 'amount_sold') },
      { title: 'Bought',     field: 'amount_bought', minWidth: 140, widthGrow: 1, hozAlign: 'right', formatter: formatTradeLeg('token_bought', 'amount_bought') },
      { title: 'Value (USD)', field: 'amount_usd',  width: 130, sorter: 'number', hozAlign: 'right', formatter: 'money', formatterParams: { precision: 2, symbol: '$' } },
      { title: 'Trader',     field: 'trader',       width: 140, formatter: formatTrader },
      { title: 'Tx',         field: 'tx_hash',      width: 120, formatter: formatTxLink },
    ],
  },

  query: `
    SELECT
      ts,
      token_sold,
      round(amount_sold, 6)   AS amount_sold,
      token_bought,
      round(amount_bought, 6) AS amount_bought,
      round(amount_usd, 2)    AS amount_usd,
      trader,
      tx_hash
    FROM dbt.api_execution_circles_v2_pool_explorer_swaps
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY ts DESC
    LIMIT 200
  `,
};

export default metric;
