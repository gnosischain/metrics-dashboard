const formatNumberCell = (cell) => {
  const v = cell.getValue();
  if (v === null || v === undefined || v === '') return '-';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  if (Math.abs(n) >= 1e6) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Math.abs(n) >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

const formatTokenAddress = (cell) => {
  const v = String(cell.getValue() || '').trim();
  if (!v) return '-';
  const href = `https://gnosis.blockscout.com/address/${encodeURIComponent(v)}`;
  return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer" `
    + `style="font-family:monospace;font-size:12px;">${v.slice(0, 8)}…${v.slice(-4)}</a>`;
};

const formatWrapBadge = (cell) => {
  const v = cell.getValue();
  const truthy = v === true || v === 1 || v === '1' || v === 't' || v === 'true';
  if (truthy) {
    return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;'
      + 'background:rgba(168,85,247,0.15);color:#a855f7;font-size:11px;font-weight:600;">'
      + 'wrap</span>';
  }
  return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;'
    + 'background:rgba(148,163,184,0.15);color:var(--color-text-secondary,#94a3b8);'
    + 'font-size:11px;font-weight:500;">CRC</span>';
};

const metric = {
  id: 'api_execution_circles_v2_avatar_holdings_by_token',
  name: 'Holdings by Token',
  description: 'CRC tokens held by the avatar',
  metricDescription: 'Per-token CRC balance held by the selected Circles v2 avatar. Sorted by demurrage-adjusted balance descending.',
  chartType: 'table',
  globalFilterField: 'avatar',
  useCached: false,

  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: false,
    height: '100%',
    rowHeight: 32,
    movableColumns: false,
    initialSort: [{ column: 'balance_demurraged', dir: 'desc' }],
    columns: [
      {
        title: 'Token',
        field: 'token_address',
        widthGrow: 2,
        minWidth: 130,
        sorter: 'string',
        formatter: formatTokenAddress,
      },
      {
        title: 'Type',
        field: 'is_wrapped',
        width: 70,
        hozAlign: 'center',
        headerHozAlign: 'center',
        sorter: 'boolean',
        formatter: formatWrapBadge,
      },
      {
        title: 'Static',
        field: 'balance',
        widthGrow: 1,
        minWidth: 90,
        hozAlign: 'right',
        headerHozAlign: 'right',
        sorter: 'number',
        formatter: formatNumberCell,
      },
      {
        title: 'Demurraged',
        field: 'balance_demurraged',
        widthGrow: 1,
        minWidth: 110,
        hozAlign: 'right',
        headerHozAlign: 'right',
        sorter: 'number',
        formatter: formatNumberCell,
      },
    ],
  },

  query: `
    SELECT avatar, token_address, is_wrapped, balance, balance_demurraged
    FROM dbt.api_execution_circles_v2_avatar_balances_latest
  `,
};

export default metric;
