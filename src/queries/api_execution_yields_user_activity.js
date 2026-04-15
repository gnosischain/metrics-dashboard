import { getTokenIconHtml } from '../utils/tokenIcons.js';

const metric = {
  id: 'api_execution_yields_user_activity',
  name: 'Activity History',
  description: 'LP & lending actions',
  metricDescription: 'Unified activity feed showing all LP actions (Add/Remove Liquidity, Collect Fees) and lending actions (Supply, Withdraw, Borrow, Repay) for the selected wallet.',
  chartType: 'table',
  globalFilterField: 'wallet_address',
  useCached: false,

  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 100,
    paginationSizeSelector: false,
    responsiveLayout: 'collapse',
    height: '100%',
    rowHeight: 40,
    movableColumns: false,
    initialSort: [{ column: 'block_timestamp', dir: 'desc' }],

    columns: [
      {
        title: '',
        field: 'wallet_address',
        visible: false
      },
      {
        title: 'Timestamp',
        field: 'block_timestamp',
        minWidth: 160,
        sorter: 'string',
        formatter: function(cell) {
          const value = cell.getValue();
          const txHash = String(cell.getRow()?.getData?.()?.transaction_hash || '').trim();
          const parsedDate = value ? new Date(value) : null;
          const label = parsedDate && !Number.isNaN(parsedDate.getTime())
            ? parsedDate.toISOString().replace('T', ' ').slice(0, 16)
            : (value ? String(value) : '-');

          const safeLabel = label
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

          if (!txHash) return safeLabel;
          const href = `https://gnosis.blockscout.com/tx/${encodeURIComponent(txHash)}`;
          return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
        },
        cellClick: function(_event, cell) {
          const txHash = String(cell.getRow()?.getData?.()?.transaction_hash || '').trim();
          if (!txHash) return;
          window.open(`https://gnosis.blockscout.com/tx/${encodeURIComponent(txHash)}`, '_blank', 'noopener,noreferrer');
        }
      },
      {
        title: 'Action',
        field: 'action',
        minWidth: 140,
        sorter: 'string',
        actionColorMap: {
          'Add Liquidity': {
            light: { text: '#027A48', background: 'rgba(2,122,72,0.12)', border: 'rgba(2,122,72,0.24)' },
            dark: { text: '#86EFAC', background: 'rgba(22,163,74,0.24)', border: 'rgba(134,239,172,0.42)' }
          },
          'Remove Liquidity': {
            light: { text: '#B42318', background: 'rgba(180,35,24,0.14)', border: 'rgba(180,35,24,0.28)' },
            dark: { text: '#FCA5A5', background: 'rgba(185,28,28,0.28)', border: 'rgba(252,165,165,0.45)' }
          },
          'Collect Fees': {
            light: { text: '#175CD3', background: 'rgba(23,92,211,0.12)', border: 'rgba(23,92,211,0.24)' },
            dark: { text: '#93C5FD', background: 'rgba(37,99,235,0.28)', border: 'rgba(96,165,250,0.45)' }
          },
          Supply: {
            light: { text: '#027A48', background: 'rgba(2,122,72,0.12)', border: 'rgba(2,122,72,0.24)' },
            dark: { text: '#86EFAC', background: 'rgba(22,163,74,0.24)', border: 'rgba(134,239,172,0.42)' }
          },
          Withdraw: {
            light: { text: '#B42318', background: 'rgba(180,35,24,0.14)', border: 'rgba(180,35,24,0.28)' },
            dark: { text: '#FCA5A5', background: 'rgba(185,28,28,0.28)', border: 'rgba(252,165,165,0.45)' }
          },
          Borrow: {
            light: { text: '#C4320A', background: 'rgba(196,50,10,0.12)', border: 'rgba(196,50,10,0.24)' },
            dark: { text: '#FDBA74', background: 'rgba(194,65,12,0.24)', border: 'rgba(251,146,60,0.42)' }
          },
          Repay: {
            light: { text: '#0E9384', background: 'rgba(14,147,132,0.12)', border: 'rgba(14,147,132,0.24)' },
            dark: { text: '#5EEAD4', background: 'rgba(13,148,136,0.24)', border: 'rgba(94,234,212,0.42)' }
          },
          default: {
            light: { text: 'var(--color-text-secondary)', background: 'var(--color-accent-softer)', border: 'var(--color-border)' },
            dark: { text: 'var(--color-text-primary)', background: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.28)' }
          }
        },
        formatter: function(cell) {
          const rawValue = cell.getValue();
          const actionText = rawValue === null || rawValue === undefined || rawValue === '' ? '-' : String(rawValue);
          const columnDefinition = cell.getColumn()?.getDefinition?.() || {};
          const actionColorMap = columnDefinition.actionColorMap || {};
          const colorEntry = actionColorMap[actionText] || actionColorMap.default || {};

          const isDarkMode = Boolean(cell.getTable()?.element?.closest('.table-widget.dark'));
          const style = (isDarkMode ? colorEntry.dark : colorEntry.light) || colorEntry || {};

          const inlineStyles = [
            style.text ? `color:${style.text}` : null,
            style.background ? `background:${style.background}` : null,
            style.border ? `border-color:${style.border}` : null
          ].filter(Boolean).join(';');

          const safeAction = actionText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          return `<span class="action-chip" style="${inlineStyles}">${safeAction}</span>`;
        }
      },
      {
        title: 'Source',
        field: 'source',
        minWidth: 80,
        sorter: 'string',
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === 'lp') return 'LP';
          if (val === 'lending') return 'Lending';
          return val || '-';
        }
      },
      {
        title: 'Protocol',
        field: 'protocol',
        minWidth: 100,
        sorter: 'string',
        formatter: 'plaintext'
      },
      {
        title: 'Token',
        field: 'token_symbol',
        minWidth: 110,
        sorter: 'string',
        formatter: function(cell) {
          const symbol = cell.getValue();
          if (!symbol) return '-';
          const icon = getTokenIconHtml(symbol);
          const safe = String(symbol).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          return icon
            ? `<span style="display:inline-flex;align-items:center;gap:6px;">${icon}${safe}</span>`
            : safe;
        }
      },
      {
        title: 'Amount',
        field: 'amount',
        minWidth: 120,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return '-';
          return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
        }
      },
      {
        title: 'USD Value',
        field: 'amount_usd',
        minWidth: 110,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined || val === 0) return '-';
          return '$' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      }
    ]
  },

  query: `
    SELECT wallet_address, block_timestamp, date, transaction_hash, protocol,
           position_address, action, token_symbol, token_address, amount, amount_usd, source
    FROM dbt.api_execution_yields_user_activity
  `,
};

export default metric;
