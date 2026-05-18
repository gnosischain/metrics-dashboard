const formatNumberCell = (cell) => {
  const v = cell.getValue();
  if (v === null || v === undefined || v === '') return '-';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  if (Math.abs(n) >= 1e6) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Math.abs(n) >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatTokenAddress = (cell) => {
  const v = String(cell.getValue() || '').trim();
  if (!v) return '-';
  const href = `https://gnosis.blockscout.com/address/${encodeURIComponent(v)}`;
  return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer" `
    + `style="font-family:monospace;font-size:12px;">${v.slice(0, 8)}…${v.slice(-4)}</a>`;
};

const formatTokenLabel = (cell) => {
  const row = cell.getData();
  const label = String(cell.getValue() || row.token_symbol || row.token_name || '').trim();
  const address = String(row.token_address || '').trim();
  const displayLabel = label || (address ? `${address.slice(0, 8)}…${address.slice(-4)}` : '-');
  const addressLine = address
    ? `<span style="display:block;color:var(--color-text-tertiary);font-family:monospace;font-size:11px;margin-top:2px;">${escapeHtml(address.slice(0, 8))}…${escapeHtml(address.slice(-4))}</span>`
    : '';
  return `<span style="display:block;min-width:0;"><strong>${escapeHtml(displayLabel)}</strong>${addressLine}</span>`;
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
  serverPagination: true,
  serverSort: true,
  maxPageSize: 500,
  serverSortFields: [
    'token_label',
    'token_symbol',
    'token_name',
    'token_address',
    'is_wrapped',
    'balance',
    'balance_demurraged',
  ],
  paginationSize: 50,
  paginationSizeSelector: [25, 50, 100],
  initialSort: [
    { column: 'balance_demurraged', dir: 'desc' },
    { column: 'token_address', dir: 'asc' },
  ],

  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: true,
    paginationSize: 50,
    paginationSizeSelector: [25, 50, 100],
    height: '100%',
    rowHeight: 32,
    movableColumns: false,
    initialSort: [
      { column: 'balance_demurraged', dir: 'desc' },
      { column: 'token_address', dir: 'asc' },
    ],
    columns: [
      {
        title: 'Token / Symbol',
        field: 'token_label',
        widthGrow: 2,
        minWidth: 160,
        sorter: 'string',
        formatter: formatTokenLabel,
      },
      {
        title: 'Contract',
        field: 'token_address',
        width: 120,
        sorter: 'string',
        formatter: formatTokenAddress,
      },
      {
        title: 'Type',
        field: 'is_wrapped',
        width: 100,
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
    WITH filtered AS (
      SELECT avatar, token_address, is_wrapped, balance, balance_demurraged
      FROM dbt.api_execution_circles_v2_avatar_balances_latest
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
    )
    SELECT
      filtered.avatar,
      filtered.token_address,
      coalesce(nullIf(metadata.metadata_symbol, ''), nullIf(metadata.metadata_name, ''), if(
        lower(coalesce(filtered.token_address, '')) = lower(coalesce(filtered.avatar, '')),
        'Own CRC',
        concat('CRC ', substring(coalesce(filtered.token_address, ''), 3, 6))
      )) AS token_symbol,
      coalesce(nullIf(metadata.metadata_name, ''), nullIf(metadata.metadata_symbol, ''), '') AS token_name,
      concat(
        coalesce(nullIf(metadata.metadata_symbol, ''), nullIf(metadata.metadata_name, ''), if(
          lower(coalesce(filtered.token_address, '')) = lower(coalesce(filtered.avatar, '')),
          'Own CRC',
          concat('CRC ', substring(coalesce(filtered.token_address, ''), 3, 6))
        )),
        ' - ',
        substring(coalesce(filtered.token_address, ''), 3, 6)
      ) AS token_label,
      filtered.is_wrapped,
      filtered.balance,
      filtered.balance_demurraged
    FROM filtered
    LEFT JOIN (
      SELECT avatar, metadata_symbol, metadata_name
      FROM dbt.api_execution_circles_v2_avatar_metadata
    ) AS metadata
      ON lower(coalesce(metadata.avatar, '')) = lower(coalesce(filtered.token_address, ''))
  `,
};

export default metric;
