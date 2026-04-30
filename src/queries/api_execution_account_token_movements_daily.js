import { formatNumber, formatTruncateHex } from '../utils/formatters';

const metric = {
  id: 'api_execution_account_token_movements_daily',
  name: 'Token Movements',
  description: 'Daily token inflows and outflows by counterparty',
  chartType: 'table',
  globalFilterField: 'address',
  searchFields: ['symbol', 'counterparty', 'direction'],
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
    { field: 'gross_amount_raw', title: 'Gross raw', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
  ],
  query: `
    SELECT *
    FROM dbt.api_execution_account_token_movements_daily
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY date DESC
  `,
};

export default metric;
