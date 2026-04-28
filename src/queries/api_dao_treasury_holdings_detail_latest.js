import { getTokenIconHtml } from '../utils/tokenIcons.js';

const metric = {
  id: 'api_dao_treasury_holdings_detail_latest',
  name: 'Holdings Detail',
  description: 'All positions across DAO wallets on Gnosis Chain',
  metricDescription: 'Detailed breakdown of all GnosisDAO positions on Gnosis Chain — token balances and lending supply positions per wallet.',
  chartType: 'table',

  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 15,
    paginationSizeSelector: false,
    responsiveLayout: false,
    height: '100%',
    movableColumns: false,
    initialSort: [{ column: 'balance_usd', dir: 'desc' }],

    columns: [
      {
        title: 'Wallet',
        field: 'wallet_label',
        minWidth: 140,
        widthGrow: 2,
        sorter: 'string',
        formatter: 'plaintext'
      },
      {
        title: 'Token',
        field: 'symbol',
        minWidth: 90,
        widthGrow: 1.5,
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
        title: 'Type',
        field: 'position_type',
        minWidth: 70,
        widthGrow: 1,
        sorter: 'string',
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === 'lending') return 'Lending';
          return 'Wallet';
        }
      },
      {
        title: 'Protocol',
        field: 'protocol',
        minWidth: 90,
        widthGrow: 1,
        sorter: 'string',
        formatter: function(cell) {
          const val = cell.getValue();
          return val || '-';
        }
      },
      {
        title: 'Balance',
        field: 'balance',
        minWidth: 100,
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
        minWidth: 110,
        widthGrow: 2,
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

  query: `SELECT wallet_label, wallet_address, symbol, position_type, protocol, balance, balance_usd FROM dbt.api_dao_treasury_holdings_detail_latest`,
};
export default metric;
