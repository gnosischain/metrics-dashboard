import { formatNumber, formatTruncateHex } from '../utils/formatters';
import { formatDate } from '../utils/dates';

const metric = {
  id: 'api_execution_account_linked_entities_latest',
  name: 'Linked Entities',
  description: 'Direct Safes, owners, GPay wallets, and validator credentials linked to this account',
  chartType: 'table',
  globalFilterField: 'root_address',
  searchFields: ['entity_id', 'display_label', 'relation'],
  paginationSize: 20,
  paginationSizeSelector: [10, 20, 50, 100],
  initialSort: [{ column: 'last_seen_at', dir: 'desc' }],
  columns: [
    { field: 'relation', title: 'Relation', sorter: 'string', width: 220 },
    { field: 'entity_type', title: 'Type', sorter: 'string', width: 150 },
    { field: 'entity_address', title: 'Address', sorter: 'string', formatter: (cell) => formatTruncateHex(cell.getValue()), width: 170 },
    { field: 'display_label', title: 'Label', sorter: 'string' },
    { field: 'value_count', title: 'Count', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()), width: 100 },
    { field: 'last_seen_at', title: 'Last seen', sorter: 'datetime', formatter: (cell) => formatDate(cell.getValue()), width: 140 },
  ],
  query: `
    SELECT *
    FROM dbt.api_execution_account_linked_entities_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
