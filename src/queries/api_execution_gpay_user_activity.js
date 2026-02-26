const metric = {
  id: 'api_execution_gpay_user_activity',
  name: 'Activity Log',
  description: 'Transaction history for the selected wallet',
  metricDescription: 'Actions include: Payment (card spend at merchant), Cashback (GNO reward), Fiat Top Up (bank transfer via Monerium), Fiat Off-ramp (withdrawal to bank), Crypto Deposit (tokens received), and Crypto Withdrawal (tokens sent out).',
  chartType: 'table',
  globalFilterField: 'wallet_address',

  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 15,
    paginationSizeSelector: false,
    responsiveLayout: 'collapse',
    height: '100%',
    movableColumns: false,
    initialSort: [{ column: 'timestamp', dir: 'desc' }],

    columns: [
      {
        title: 'Time',
        field: 'timestamp',
        minWidth: 175,
        sorter: 'datetime',
        formatter: function(cell) {
          const val = cell.getValue();
          if (!val) return '-';
          const d = new Date(val);
          return d.toISOString().replace('T', ' ').slice(0, 16);
        }
      },
      {
        title: 'Action',
        field: 'action',
        minWidth: 150,
        sorter: 'string',
        formatter: 'plaintext'
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
    SELECT wallet_address, timestamp, date, action, symbol, amount, amount_usd
    FROM dbt.api_execution_gpay_user_activity
  `,
};

export default metric;
