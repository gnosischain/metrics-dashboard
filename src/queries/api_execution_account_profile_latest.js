import { formatCurrency, formatNumber, formatTruncateHex } from '../utils/formatters';
import { formatDate } from '../utils/dates';

const metric = {
  id: 'api_execution_account_profile_latest',
  name: 'Account Profile',
  description: 'Latest profile and portfolio summary for an account',
  chartType: 'table',
  globalFilterField: 'address',
  paginationSize: 10,
  columns: [
    { field: 'address', title: 'Address', formatter: (cell) => formatTruncateHex(cell.getValue()), width: 170 },
    { field: 'display_name', title: 'Display name', width: 220 },
    { field: 'total_balance_usd', title: 'Balance', sorter: 'number', formatter: (cell) => formatCurrency(cell.getValue()) },
    { field: 'tokens_held', title: 'Tokens', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
    { field: 'first_seen_date', title: 'First seen', sorter: 'datetime', formatter: (cell) => formatDate(cell.getValue()) },
    { field: 'last_active_date', title: 'Last active', sorter: 'datetime', formatter: (cell) => formatDate(cell.getValue()) },
  ],
  query: `
    SELECT *
    FROM dbt.api_execution_account_profile_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
