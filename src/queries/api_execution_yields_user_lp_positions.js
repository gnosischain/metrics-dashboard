const metric = {
  id: 'api_execution_yields_user_lp_positions',
  name: 'LP Positions',
  description: 'Active and historical positions',
  metricDescription: 'LP positions across Uniswap V3, Swapr V3, Balancer V2, and Balancer V3. Shows capital invested, withdrawn, fees collected, and in-range status for concentrated liquidity positions.',
  chartType: 'table',
  globalFilterField: 'wallet_address',
  useCached: false,

  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 10,
    paginationSizeSelector: false,
    responsiveLayout: false,
    height: '100%',
    movableColumns: false,
    initialSort: [
      { column: 'is_active', dir: 'desc' },
      { column: 'last_action_date', dir: 'desc' }
    ],

    columns: [
      {
        title: '',
        field: 'wallet_address',
        visible: false
      },
      {
        title: 'Pool',
        field: 'pool_address',
        minWidth: 120,
        widthGrow: 1.5,
        sorter: 'string',
        formatter: function(cell) {
          const addr = cell.getValue();
          if (!addr) return '-';
          const short = addr.slice(0, 6) + '\u2026' + addr.slice(-4);
          const href = `https://gnosis.blockscout.com/address/${encodeURIComponent(addr)}`;
          return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer">${short}</a>`;
        },
        cellClick: function(_event, cell) {
          const addr = String(cell.getValue() || '').trim();
          if (!addr) return;
          window.open(`https://gnosis.blockscout.com/address/${encodeURIComponent(addr)}`, '_blank', 'noopener,noreferrer');
        }
      },
      {
        title: 'Protocol',
        field: 'protocol',
        minWidth: 100,
        widthGrow: 1,
        sorter: 'string',
        formatter: 'plaintext'
      },
      {
        title: 'Status',
        field: 'is_active',
        minWidth: 90,
        widthGrow: 0.8,
        sorter: 'string',
        formatter: function(cell) {
          const active = cell.getValue();
          const row = cell.getRow()?.getData?.() || {};
          const inRange = row.is_in_range;

          if (!active) {
            return '<span class="action-chip" style="color:#9CA3AF;background:rgba(156,163,175,0.12);border-color:rgba(156,163,175,0.28)">Closed</span>';
          }
          if (inRange === true || inRange === 1) {
            return '<span class="action-chip" style="color:#027A48;background:rgba(2,122,72,0.12);border-color:rgba(2,122,72,0.24)">In Range</span>';
          }
          if (inRange === false || inRange === 0) {
            return '<span class="action-chip" style="color:#B42318;background:rgba(180,35,24,0.14);border-color:rgba(180,35,24,0.28)">Out of Range</span>';
          }
          return '<span class="action-chip" style="color:#027A48;background:rgba(2,122,72,0.12);border-color:rgba(2,122,72,0.24)">Active</span>';
        }
      },
      {
        title: 'Tick Range',
        field: 'tick_lower',
        minWidth: 110,
        widthGrow: 1,
        sorter: 'number',
        formatter: function(cell) {
          const row = cell.getRow()?.getData?.() || {};
          const lo = row.tick_lower;
          const hi = row.tick_upper;
          if (lo === null || lo === undefined) return 'Full';
          return `${Number(lo).toLocaleString()}\u2009\u2192\u2009${Number(hi).toLocaleString()}`;
        }
      },
      {
        title: 'Capital In',
        field: 'capital_in_usd',
        minWidth: 100,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined || val === 0) return '-';
          return '$' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        }
      },
      {
        title: 'Capital Out',
        field: 'capital_out_usd',
        minWidth: 100,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined || val === 0) return '-';
          return '$' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        }
      },
      {
        title: 'Fees Collected',
        field: 'fees_collected_usd',
        minWidth: 100,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined || val === 0) return '-';
          return '$' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      },
      {
        title: 'Since',
        field: 'entry_date',
        minWidth: 95,
        widthGrow: 0.8,
        sorter: 'datetime',
        formatter: function(cell) {
          const val = cell.getValue();
          if (!val) return '-';
          return new Date(val).toISOString().slice(0, 10);
        }
      },
      {
        title: 'Last Action',
        field: 'last_action_date',
        minWidth: 95,
        widthGrow: 0.8,
        sorter: 'datetime',
        formatter: function(cell) {
          const val = cell.getValue();
          if (!val) return '-';
          return new Date(val).toISOString().slice(0, 10);
        }
      }
    ]
  },

  query: `
    SELECT provider AS wallet_address, pool_address, protocol, tick_lower, tick_upper,
           capital_in_usd, capital_out_usd, fees_collected_usd,
           is_active, is_in_range, pool_current_tick, entry_date, last_action_date
    FROM dbt.api_execution_yields_user_lp_positions
  `,
};

export default metric;
