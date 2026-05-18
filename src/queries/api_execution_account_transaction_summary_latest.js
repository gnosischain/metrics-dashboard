import { formatNumber } from '../utils/formatters';
import { formatDate } from '../utils/dates';

const metric = {
  id: 'api_execution_account_transaction_summary_latest',
  name: 'Activity Summary',
  description: 'Production-backed token transfer activity summary',
  chartType: 'table',
  globalFilterField: 'address',
  paginationSize: 10,
  columns: [
    { field: 'first_activity_date', title: 'First activity', formatter: (cell) => formatDate(cell.getValue()) },
    { field: 'last_activity_date', title: 'Last activity', formatter: (cell) => formatDate(cell.getValue()) },
    { field: 'active_days', title: 'Active days', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
    { field: 'token_transfer_count', title: 'Transfers', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
    { field: 'inbound_transfer_count', title: 'Inbound', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
    { field: 'outbound_transfer_count', title: 'Outbound', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
    { field: 'counterparty_count', title: 'Counterparties', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
    { field: 'token_count_moved', title: 'Tokens moved', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
  ],
  query: `
    SELECT *
    FROM dbt.api_execution_account_transaction_summary_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
