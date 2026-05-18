import { formatCurrency, formatNumber } from '../utils/formatters';

const metric = {
  id: 'api_execution_gnosis_app_user_activity_daily',
  name: 'Gnosis App Activity',
  description: 'Daily Gnosis App activity by kind',
  chartType: 'table',
  globalFilterField: 'address',
  searchFields: ['activity_kind'],
  paginationSize: 25,
  initialSort: [{ column: 'date', dir: 'desc' }],
  columns: [
    { field: 'date', title: 'Date', sorter: 'datetime', width: 130 },
    { field: 'activity_kind', title: 'Activity', sorter: 'string' },
    { field: 'n_events', title: 'Events', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
    { field: 'amount_usd', title: 'Amount USD', sorter: 'number', formatter: (cell) => formatCurrency(cell.getValue()) },
  ],
  query: `
    SELECT *
    FROM dbt.api_execution_gnosis_app_user_activity_daily
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY date DESC
  `,
};

export default metric;
