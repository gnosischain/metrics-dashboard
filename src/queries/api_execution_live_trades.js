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
  refreshInterval: 45000,

  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 25,
    paginationSizeSelector: [10, 25, 50, 100],
    height: '100%',
    movableColumns: false,
    searchFields: ['token_sold', 'token_bought', 'via', 'trader', 'aggregator'],
    initialSort: [{ column: 'block_timestamp', dir: 'desc' }],

    tabulatorConfig: {
      rowFormatter: (row) => {
        const el = row.getElement();
        const existing = el.querySelector(':scope > .hops-detail-wrapper');
        if (existing) existing.remove();

        const data = row.getData();
        let hops = data.hops_detail;
        if (typeof hops === 'string') {
          try { hops = JSON.parse(hops); } catch { hops = []; }
        }
        if (!Array.isArray(hops) || hops.length === 0) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'hops-detail-wrapper';
        wrapper.style.display = 'none';
        wrapper.style.padding = '12px 20px';
        wrapper.style.borderTop = '1px solid rgba(127,127,127,0.2)';
        wrapper.style.background = 'rgba(127,127,127,0.06)';
        wrapper.style.boxSizing = 'border-box';

        // Hop array positions:
        // [0]=log_index, [1]=protocol, [2]=pool, [3]=token_sold,
        // [4]=amount_sold, [5]=token_bought, [6]=amount_bought, [7]=amount_usd
        const header = `
          <div style="display:grid;grid-template-columns:40px 1.4fr 1.2fr 1.4fr 1.4fr 1fr;gap:12px;font-size:11px;font-weight:600;text-transform:uppercase;opacity:0.7;padding-bottom:6px;border-bottom:1px solid rgba(127,127,127,0.2);">
            <div>#</div><div>Protocol</div><div>Pool</div><div>Sold</div><div>Bought</div><div style="text-align:right;">USD</div>
          </div>`;
        const rows = hops.map((h, i) => {
          const pool = String(h[2] || '');
          const poolShort = pool ? `${pool.slice(0, 6)}…${pool.slice(-4)}` : '-';
          const poolHref = pool ? `${BLOCKSCOUT}/address/${encodeURIComponent(pool)}` : '';
          const soldSym = escapeHtml(h[3] || '-');
          const boughtSym = escapeHtml(h[5] || '-');
          const amtSold = fmtAmount(Number(h[4]));
          const amtBought = fmtAmount(Number(h[6]));
          const usd = fmtUsd(Number(h[7]));
          return `
            <div style="display:grid;grid-template-columns:40px 1.4fr 1.2fr 1.4fr 1.4fr 1fr;gap:12px;padding:6px 0;font-size:12px;align-items:center;">
              <div style="opacity:0.7;">${i + 1}</div>
              <div>${escapeHtml(h[1] || '-')}</div>
              <div>${pool ? `<a class="table-link" href="${poolHref}" target="_blank" rel="noopener noreferrer">${escapeHtml(poolShort)}</a>` : '-'}</div>
              <div>${amtSold} <strong>${soldSym}</strong></div>
              <div>${amtBought} <strong>${boughtSym}</strong></div>
              <div style="text-align:right;">${usd}</div>
            </div>`;
        }).join('');

        wrapper.innerHTML = header + rows;
        el.appendChild(wrapper);
      },
    },

    columns: [
      {
        title: '',
        field: '_expand',
        width: 34,
        minWidth: 34,
        hozAlign: 'center',
        headerSort: false,
        headerFilter: false,
        resizable: false,
        formatter: () => '<span class="expand-toggle" style="display:inline-block;transition:transform 0.15s;opacity:0.6;">▸</span>',
        cellClick: (e, cell) => {
          const rowEl = cell.getRow().getElement();
          const detail = rowEl.querySelector(':scope > .hops-detail-wrapper');
          if (!detail) return;
          const open = detail.style.display !== 'none';
          detail.style.display = open ? 'none' : 'block';
          const toggle = cell.getElement().querySelector('.expand-toggle');
          if (toggle) toggle.style.transform = open ? 'rotate(0deg)' : 'rotate(90deg)';
        },
      },
      {
        // Using 'string' sort because our timestamps are ISO-ordered and
        // Tabulator's 'datetime' sorter requires Luxon (not loaded here).
        title: 'Time',
        field: 'block_timestamp',
        minWidth: 110,
        widthGrow: 1,
        sorter: 'string',
        headerFilter: false,
        formatter: (cell) => {
          const v = cell.getValue();
          const ago = fmtTimeAgo(v);
          const utc = v ? String(v).slice(0, 16).replace('T', ' ') + ' UTC' : '';
          return `<div style="line-height:1.35;"><div>${ago}</div><div style="font-size:10px;opacity:0.45;margin-top:1px;">${utc}</div></div>`;
        },
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
      hops_detail,
      trader,
      aggregator
    FROM dbt.api_execution_live_trades
    LIMIT 200
  `,
};

export default metric;
