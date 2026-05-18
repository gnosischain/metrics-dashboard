import { formatNumber, formatTruncateHex } from '../utils/formatters';
import { formatDate } from '../utils/dates';

const metric = {
  id: 'api_execution_gnosis_app_user_profile_latest',
  name: 'Gnosis App Profile',
  description: 'Address-level Gnosis App profile and controlled Pay wallet',
  chartType: 'table',
  globalFilterField: 'address',
  paginationSize: 10,
  columns: [
    { field: 'address', title: 'Address', formatter: (cell) => formatTruncateHex(cell.getValue()), width: 170 },
    { field: 'first_seen_at', title: 'First seen', sorter: 'datetime', formatter: (cell) => formatDate(cell.getValue()) },
    { field: 'last_seen_at', title: 'Last seen', sorter: 'datetime', formatter: (cell) => formatDate(cell.getValue()) },
    { field: 'heuristic_hits', title: 'Hits', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
    { field: 'n_distinct_heuristics', title: 'Heuristics', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
    { field: 'controlled_gpay_wallet', title: 'Controlled GPay wallet', formatter: (cell) => formatTruncateHex(cell.getValue()) },
    { field: 'onboarding_class', title: 'Onboarding', sorter: 'string' },
  ],
  query: `
    SELECT *
    FROM dbt.api_execution_gnosis_app_user_profile_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
