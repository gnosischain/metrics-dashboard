import { getTokenIconHtml } from '../utils/tokenIcons.js';

const metric = {
  id: 'api_execution_yields_user_lending_positions',
  name: 'Lending Positions',
  description: 'Aave V3 supply balances',
  metricDescription: 'Current supply positions on Aave V3 for the selected wallet, with current supply APY.',
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
    initialSort: [{ column: 'balance_usd', dir: 'desc' }],

    columns: [
      {
        title: '',
        field: 'wallet_address',
        visible: false
      },
      {
        title: 'Token',
        field: 'symbol',
        minWidth: 90,
        widthGrow: 2,
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
        title: 'Balance',
        field: 'balance',
        minWidth: 90,
        widthGrow: 2,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return '-';
          return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
        }
      },
      {
        title: 'USD Value',
        field: 'balance_usd',
        minWidth: 90,
        widthGrow: 2,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined || val === 0) return '-';
          return '$' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      },
      {
        title: 'Supply APY',
        field: 'supply_apy',
        minWidth: 80,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return '-';
          return Number(val).toFixed(2) + '%';
        }
      }
    ]
  },

  query: `
    SELECT user_address AS wallet_address, reserve_address, symbol, balance, balance_usd, supply_apy, protocol
    FROM dbt.api_execution_yields_user_lending_positions
  `,
};

export default metric;
