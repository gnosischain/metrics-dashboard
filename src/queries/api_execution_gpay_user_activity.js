const metric = {
  id: 'api_execution_gpay_user_activity',
  name: 'Transaction History',
  description: 'In/Outflows',
  metricDescription: 'Actions include: Payment (card spend at merchant), Cashback (GNO reward), Fiat Top Up (bank transfer via Monerium), Fiat Off-ramp (withdrawal to bank), Crypto Deposit (tokens received), and Crypto Withdrawal (tokens sent out).',
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
    initialSort: [{ column: 'timestamp', dir: 'desc' }],

    columns: [
      {
        title: 'Timestamp',
        field: 'timestamp',
        minWidth: 175,
        sorter: 'datetime',
        formatter: function(cell) {
          const value = cell.getValue();
          const txHash = String(cell.getRow()?.getData?.()?.transaction_hash || '').trim();
          const parsedDate = value ? new Date(value) : null;
          const label = parsedDate && !Number.isNaN(parsedDate.getTime())
            ? parsedDate.toISOString().replace('T', ' ').slice(0, 16)
            : (value ? String(value) : '-');

          const safeLabel = label
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

          if (!txHash) return safeLabel;

          const href = `https://gnosis.blockscout.com/tx/${encodeURIComponent(txHash)}`;
          return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
        },
        cellClick: function(_event, cell) {
          const txHash = String(cell.getRow()?.getData?.()?.transaction_hash || '').trim();
          if (!txHash) return;

          const href = `https://gnosis.blockscout.com/tx/${encodeURIComponent(txHash)}`;
          if (typeof window !== 'undefined') {
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        },
        tooltip: function(cell) {
          const txHash = String(cell.getRow()?.getData?.()?.transaction_hash || '').trim();
          if (!txHash) return false;
          return `Open tx ${txHash.slice(0, 10)}...`;
        }
      },
      {
        title: 'Action',
        field: 'action',
        minWidth: 150,
        sorter: 'string',
        actionColorMap: {
          Payment: {
            light: { text: '#175CD3', background: 'rgba(23, 92, 211, 0.12)', border: 'rgba(23, 92, 211, 0.24)' },
            dark: { text: '#93C5FD', background: 'rgba(37, 99, 235, 0.28)', border: 'rgba(96, 165, 250, 0.45)' }
          },
          Reversal: {
            light: { text: '#B42318', background: 'rgba(180, 35, 24, 0.14)', border: 'rgba(180, 35, 24, 0.28)' },
            dark: { text: '#FCA5A5', background: 'rgba(185, 28, 28, 0.28)', border: 'rgba(252, 165, 165, 0.45)' }
          },
          Cashback: {
            light: { text: '#027A48', background: 'rgba(2, 122, 72, 0.12)', border: 'rgba(2, 122, 72, 0.24)' },
            dark: { text: '#86EFAC', background: 'rgba(22, 163, 74, 0.24)', border: 'rgba(134, 239, 172, 0.42)' }
          },
          'Fiat Top Up': {
            light: { text: '#0A7D45', background: 'rgba(10, 125, 69, 0.12)', border: 'rgba(10, 125, 69, 0.24)' },
            dark: { text: '#6EE7B7', background: 'rgba(5, 150, 105, 0.24)', border: 'rgba(110, 231, 183, 0.42)' }
          },
          'Fiat Off-ramp': {
            light: { text: '#C4320A', background: 'rgba(196, 50, 10, 0.12)', border: 'rgba(196, 50, 10, 0.24)' },
            dark: { text: '#FDBA74', background: 'rgba(194, 65, 12, 0.24)', border: 'rgba(251, 146, 60, 0.42)' }
          },
          'Crypto Deposit': {
            light: { text: '#0E9384', background: 'rgba(14, 147, 132, 0.12)', border: 'rgba(14, 147, 132, 0.24)' },
            dark: { text: '#5EEAD4', background: 'rgba(13, 148, 136, 0.24)', border: 'rgba(94, 234, 212, 0.42)' }
          },
          'Crypto Withdrawal': {
            light: { text: '#B54708', background: 'rgba(181, 71, 8, 0.12)', border: 'rgba(181, 71, 8, 0.24)' },
            dark: { text: '#FDBA74', background: 'rgba(180, 83, 9, 0.24)', border: 'rgba(253, 186, 116, 0.42)' }
          },
          Refund: {
            light: { text: '#B54708', background: 'rgba(250, 204, 21, 0.2)', border: 'rgba(250, 204, 21, 0.34)' },
            dark: { text: '#FDE68A', background: 'rgba(161, 98, 7, 0.24)', border: 'rgba(253, 230, 138, 0.44)' }
          },
          default: {
            light: { text: 'var(--color-text-secondary)', background: 'var(--color-accent-softer)', border: 'var(--color-border)' },
            dark: { text: 'var(--color-text-primary)', background: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.28)' }
          }
        },
        formatter: function(cell) {
          const rawValue = cell.getValue();
          const actionText = rawValue === null || rawValue === undefined || rawValue === '' ? '-' : String(rawValue);
          const columnDefinition = cell.getColumn()?.getDefinition?.() || {};
          const actionColorMap = columnDefinition.actionColorMap || {};
          const colorEntry = actionColorMap[actionText] || actionColorMap.default || {};

          const isDarkMode = Boolean(
            cell.getTable()?.element?.closest('.table-widget.dark')
          );
          const style = (isDarkMode ? colorEntry.dark : colorEntry.light) || colorEntry || {};

          const inlineStyles = [
            style.text ? `color:${style.text}` : null,
            style.background ? `background:${style.background}` : null,
            style.border ? `border-color:${style.border}` : null
          ]
            .filter(Boolean)
            .join(';');

          const safeAction = actionText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

          return `<span class="action-chip" style="${inlineStyles}">${safeAction}</span>`;
        }
      },
      {
        title: 'Token',
        field: 'symbol',
        minWidth: 100,
        sorter: 'string',
        formatter: 'plaintext'
      },
      {
        title: 'Amount',
        field: 'amount',
        minWidth: 150,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return '-';
          return Number(val).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
          });
        }
      },
      {
        title: 'USD Value',
        field: 'amount_usd',
        minWidth: 130,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined || val === 0) return '-';
          return '$' + Number(val).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }
      },
    ]
  },

  query: `
    SELECT wallet_address, timestamp, date, action, symbol, amount, amount_usd, transaction_hash
    FROM dbt.api_execution_gpay_user_activity
  `,
};

export default metric;
