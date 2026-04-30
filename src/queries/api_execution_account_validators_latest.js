import { formatNumber, formatTruncateHex } from '../utils/formatters';

const metric = {
  id: 'api_execution_account_validators_latest',
  name: 'Validators',
  description: 'Validators attached to the selected withdrawal address',
  chartType: 'table',
  globalFilterField: 'withdrawal_address',
  searchFields: ['validator_index', 'pubkey', 'withdrawal_credentials', 'status'],
  paginationSize: 25,
  paginationSizeSelector: [10, 25, 50, 100],
  initialSort: [{ column: 'validator_index', dir: 'asc' }],
  columns: [
    { field: 'validator_index', title: 'Index', sorter: 'number', width: 110 },
    { field: 'status', title: 'Status', sorter: 'string', width: 130 },
    { field: 'balance_gno', title: 'Balance GNO', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
    { field: 'consensus_income_amount_30d_gno', title: '30d income', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
    { field: 'total_income_estimated_gno', title: 'Total income', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
    { field: 'pubkey', title: 'Pubkey', formatter: (cell) => formatTruncateHex(cell.getValue()) },
    { field: 'withdrawal_credentials', title: 'Credential', formatter: (cell) => formatTruncateHex(cell.getValue()) },
  ],
  query: `
    SELECT *
    FROM dbt.api_execution_account_validators_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
