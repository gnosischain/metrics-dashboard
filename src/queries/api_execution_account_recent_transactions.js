import { formatNumber, formatTruncateHex } from '../utils/formatters';

const metric = {
  id: 'api_execution_account_recent_transactions',
  name: 'Recent Movement Rows',
  description: 'Most recent production-backed token movement rows',
  chartType: 'table',
  globalFilterField: 'address',
  searchFields: ['counterparty', 'symbol', 'direction'],
  paginationSize: 25,
  paginationSizeSelector: [10, 25, 50, 100],
  initialSort: [{ column: 'date', dir: 'desc' }],
  columns: [
    { field: 'date', title: 'Date', sorter: 'datetime', width: 130 },
    { field: 'direction', title: 'Direction', sorter: 'string', width: 110 },
    { field: 'symbol', title: 'Token', sorter: 'string', width: 110 },
    { field: 'counterparty', title: 'Counterparty', sorter: 'string', formatter: (cell) => formatTruncateHex(cell.getValue()), width: 180 },
    { field: 'transfer_count', title: 'Transfers', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()), width: 120 },
    { field: 'net_amount_raw', title: 'Net raw', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
  ],
  query: `
    SELECT *
    FROM dbt.api_execution_account_recent_transactions
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY date DESC
  `,
};

export default metric;
