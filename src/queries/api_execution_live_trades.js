const BLOCKSCOUT = 'https://gnosis.blockscout.com';

const shortHex = (hex, head = 6, tail = 4) => {
  const s = String(hex || '').trim();
  if (!s) return '';
  if (s.length <= head + tail + 2) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
};

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const fmtUsd = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '-';
  const n = Number(val);
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(2) + 'K';
  if (n >= 1)   return '$' + n.toFixed(2);
  return '$' + n.toFixed(4);
};

const fmtAmount = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '-';
  const n = Number(val);
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  if (n >= 1)   return n.toFixed(4);
  return n.toFixed(6);
};

const fmtTimeAgo = (ts) => {
  if (!ts) return '-';
  const t = new Date(String(ts).replace(' ', 'T') + 'Z').getTime();
  if (isNaN(t)) return String(ts);
  const diffSec = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (diffSec < 60)      return `${diffSec}s ago`;
  if (diffSec < 3600)    return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400)   return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

const metric = {
  id: 'api_execution_live_trades',
  name: 'Live Trades',
  description: 'Recent DEX swaps on Gnosis Chain',
  metricDescription: 'DEX swaps from the last 30 minutes of cached data across Uniswap V3, Swapr V3, Balancer V2 and Balancer V3. Multi-hop router paths are collapsed to one row per transaction. Times are relative to your browser clock — note that the underlying indexer may lag the chain; see the "Data lag" tile at the top of the page.',
  chartType: 'table',
  enableFiltering: true,

  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 25,
    paginationSizeSelector: [10, 25, 50, 100],
    responsiveLayout: 'collapse',
    height: '100%',
    movableColumns: false,
    searchFields: ['token_sold', 'token_bought', 'via', 'trader', 'aggregator'],
    initialSort: [{ column: 'block_timestamp', dir: 'desc' }],

    columns: [
      {
        // Using 'string' sort because our timestamps are ISO-ordered and
        // Tabulator's 'datetime' sorter requires Luxon (not loaded here).
        title: 'Time',
        field: 'block_timestamp',
        minWidth: 90,
        widthGrow: 1,
        sorter: 'string',
        headerFilter: false,
        formatter: (cell) => fmtTimeAgo(cell.getValue()),
        tooltip: (cell) => String(cell.getValue() || ''),
      },
      {
        title: 'Tx',
        field: 'transaction_hash',
        minWidth: 110,
        widthGrow: 1,
        sorter: 'string',
        headerFilter: false,
        formatter: (cell) => {
          const h = String(cell.getValue() || '').trim();
          if (!h) return '-';
          const norm = h.startsWith('0x') ? h : '0x' + h;
          const href = `${BLOCKSCOUT}/tx/${encodeURIComponent(norm)}`;
          return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(shortHex(norm))}</a>`;
        },
      },
      {
        title: 'Sold',
        field: 'token_sold',
        minWidth: 140,
        widthGrow: 1.4,
        sorter: 'string',
        headerFilter: false,
        formatter: (cell) => {
          const sym = escapeHtml(cell.getValue() || '-');
          const amt = fmtAmount(cell.getRow()?.getData?.()?.amount_sold);
          return `<span>${amt} <strong>${sym}</strong></span>`;
        },
      },
      {
        title: 'Bought',
        field: 'token_bought',
        minWidth: 140,
        widthGrow: 1.4,
        sorter: 'string',
        headerFilter: false,
        formatter: (cell) => {
          const sym = escapeHtml(cell.getValue() || '-');
          const amt = fmtAmount(cell.getRow()?.getData?.()?.amount_bought);
          return `<span>${amt} <strong>${sym}</strong></span>`;
        },
      },
      {
        title: 'USD',
        field: 'trade_usd',
        minWidth: 90,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
        headerFilter: false,
        formatter: (cell) => fmtUsd(cell.getValue()),
      },
      {
        title: 'Via',
        field: 'via',
        minWidth: 140,
        widthGrow: 1.5,
        sorter: 'string',
        headerFilter: false,
        formatter: 'plaintext',
      },
      {
        title: 'Hops',
        field: 'hops',
        minWidth: 70,
        widthGrow: 0.6,
        sorter: 'number',
        hozAlign: 'right',
        headerFilter: false,
      },
      {
        title: 'Trader',
        field: 'trader',
        minWidth: 120,
        widthGrow: 1,
        sorter: 'string',
        headerFilter: false,
        formatter: (cell) => {
          const a = String(cell.getValue() || '').trim();
          if (!a) return '-';
          const norm = a.startsWith('0x') ? a : '0x' + a;
          const href = `${BLOCKSCOUT}/address/${encodeURIComponent(norm)}`;
          return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(shortHex(norm))}</a>`;
        },
      },
      {
        title: 'Aggregator',
        field: 'aggregator',
        minWidth: 120,
        widthGrow: 1,
        sorter: 'string',
        headerFilter: false,
        formatter: (cell) => {
          const v = cell.getValue();
          if (!v) return '<span style="color:#999;">direct</span>';
          return escapeHtml(String(v));
        },
      },
    ],
  },

  query: `
    SELECT
      block_timestamp,
      transaction_hash,
      token_sold,
      amount_sold,
      token_bought,
      amount_bought,
      trade_usd,
      via,
      hops,
      trader,
      aggregator
    FROM playground_max.api_execution_live_trades
    LIMIT 200
  `,
};

export default metric;
