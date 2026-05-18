const formatTs = (cell) => {
  const v = cell.getValue();
  if (!v) return '<span style="color:var(--color-text-secondary)">—</span>';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().replace('T', ' ').slice(0, 16);
};

const metric = {
  id: 'api_execution_circles_v2_avatar_trust_relations',
  name: 'Trust Relations',
  description: 'Current trust pairs (outgoing, incoming, mutual)',
  metricDescription: 'Each row is one counterparty. Direction is outgoing if the avatar trusts the counterparty, incoming if the counterparty trusts the avatar, or mutual when both directions exist. Outgoing Since / Incoming Since show when each direction was established.',
  chartType: 'table',
  globalFilterField: 'avatar',
  useCached: false,
  serverPagination: true,
  serverSort: true,
  maxPageSize: 500,
  serverSortFields: [
    'direction',
    'counterparty',
    'outgoing_from',
    'incoming_from',
  ],
  paginationSize: 50,
  paginationSizeSelector: [25, 50, 100],
  initialSort: [
    { column: 'direction', dir: 'asc' },
    { column: 'counterparty', dir: 'asc' },
  ],

  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 50,
    paginationSizeSelector: [25, 50, 100],
    responsiveLayout: false,
    height: '100%',
    rowHeight: 36,
    movableColumns: false,
    initialSort: [
      { column: 'direction', dir: 'asc' },
      { column: 'counterparty', dir: 'asc' },
    ],

    columns: [
      {
        title: 'Direction',
        field: 'direction',
        width: 110,
        sorter: 'string',
        formatter: (cell) => {
          const v = String(cell.getValue() || '').trim();
          if (!v) return '-';
          const colors = {
            outgoing: { text: '#0E9384', bg: 'rgba(14, 147, 132, 0.12)', border: 'rgba(14, 147, 132, 0.24)' },
            incoming: { text: '#175CD3', bg: 'rgba(23, 92, 211, 0.12)', border: 'rgba(23, 92, 211, 0.24)' },
            mutual:   { text: '#7C3AED', bg: 'rgba(124, 58, 237, 0.12)', border: 'rgba(124, 58, 237, 0.28)' },
          };
          const c = colors[v] || { text: 'var(--color-text-secondary)', bg: 'var(--color-accent-softer)', border: 'var(--color-border)' };
          return `<span class="action-chip" style="color:${c.text};background:${c.bg};border-color:${c.border}">${v}</span>`;
        },
      },
      {
        title: 'Counterparty',
        field: 'counterparty',
        minWidth: 220,
        sorter: 'string',
        formatter: (cell) => {
          const v = String(cell.getValue() || '').trim();
          if (!v) return '-';
          const href = `https://gnosis.blockscout.com/address/${encodeURIComponent(v)}`;
          return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer">${v.slice(0, 10)}...${v.slice(-6)}</a>`;
        },
      },
      {
        title: 'Outgoing Since',
        field: 'outgoing_from',
        width: 170,
        sorter: 'datetime',
        formatter: formatTs,
      },
      {
        title: 'Incoming Since',
        field: 'incoming_from',
        width: 170,
        sorter: 'datetime',
        formatter: formatTs,
      },
    ],
  },

  query: `
    SELECT avatar, counterparty, direction, outgoing_from, incoming_from
    FROM dbt.api_execution_circles_v2_avatar_trust_relations
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
