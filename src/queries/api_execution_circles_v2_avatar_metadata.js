const metric = {
  id: 'api_execution_circles_v2_avatar_metadata',
  name: 'Avatar Identity',
  description: 'Registration metadata for the selected avatar',
  metricDescription: 'Avatar type, registration time, inviter, and personal token contract for the selected Circles v2 avatar.',
  chartType: 'table',
  globalFilterField: 'avatar',
  useCached: false,

  tableConfig: {
    layout: 'fitColumns',
    pagination: false,
    responsiveLayout: 'collapse',
    height: '100%',
    rowHeight: 36,
    movableColumns: false,
    columns: [
      { title: 'Type', field: 'avatar_type', minWidth: 100, sorter: 'string' },
      {
        title: 'Name',
        field: 'name',
        minWidth: 140,
        sorter: 'string',
        formatter: (cell) => {
          const v = cell.getValue();
          return v === null || v === undefined || v === '' ? '-' : String(v);
        },
      },
      {
        title: 'Registered',
        field: 'registered_at',
        minWidth: 170,
        sorter: 'datetime',
        formatter: (cell) => {
          const v = cell.getValue();
          if (!v) return '-';
          const d = new Date(v);
          return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().replace('T', ' ').slice(0, 16);
        },
      },
      {
        title: 'Invited By',
        field: 'invited_by',
        minWidth: 200,
        sorter: 'string',
        formatter: (cell) => {
          const v = String(cell.getValue() || '').trim();
          if (!v || v === '0x0000000000000000000000000000000000000000') return '-';
          const href = `https://gnosis.blockscout.com/address/${encodeURIComponent(v)}`;
          return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer">${v.slice(0, 10)}...${v.slice(-6)}</a>`;
        },
      },
      {
        title: 'Personal Token',
        field: 'token_id',
        minWidth: 200,
        sorter: 'string',
        formatter: (cell) => {
          const v = String(cell.getValue() || '').trim();
          if (!v) return '-';
          const href = `https://gnosis.blockscout.com/address/${encodeURIComponent(v)}`;
          return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer">${v.slice(0, 10)}...${v.slice(-6)}</a>`;
        },
      },
    ],
  },

  query: `
    SELECT avatar, avatar_type, invited_by, name, token_id, registered_at
    FROM dbt.api_execution_circles_v2_avatar_metadata
  `,
};

export default metric;
