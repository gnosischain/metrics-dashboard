import { formatTruncateHex } from '../utils/formatters';

// Reverse lookup — Safes owned by the searched address. Powers the Safe
// sub-tab's primary table in the Account Portfolio.
const metric = {
  id: 'api_execution_account_safes_latest',
  globalFilterField: 'owner_address',
  name: 'Safes owned by this address',
  description: 'One row per Safe where the searched address is a current owner',
  chartType: 'table',

  paginationSize: 25,
  paginationSizeSelector: [10, 25, 50, 100],
  initialSort: [{ column: 'became_owner_at', dir: 'desc' }],

  columns: [
    {
      field: 'safe_address',
      title: 'Safe',
      sorter: 'string',
      formatter: (cell) => formatTruncateHex(cell.getValue()),
      width: 180,
    },
    {
      field: 'current_threshold',
      title: 'Threshold',
      sorter: 'number',
      formatter: (cell) => {
        const t = cell.getValue();
        const n = cell.getRow().getData().current_owner_count;
        return (t == null || n == null) ? '' : `${t} / ${n}`;
      },
      width: 100,
    },
    { field: 'current_owner_count', title: 'Owners', sorter: 'number', width: 80 },
    {
      field: 'became_owner_at',
      title: 'Became owner',
      sorter: 'datetime',
      formatter: (cell) => {
        const v = cell.getValue();
        return v ? new Date(v).toISOString().split('T')[0] : '';
      },
    },
    {
      field: 'deployment_date',
      title: 'Deployed',
      sorter: 'datetime',
      formatter: (cell) => {
        const v = cell.getValue();
        return v ? new Date(v).toISOString().split('T')[0] : '';
      },
    },
    { field: 'creation_version', title: 'Version', sorter: 'string', width: 100 },
  ],

  query: `SELECT
    owner_address,
    safe_address,
    became_owner_at,
    current_threshold,
    current_owner_count,
    creation_version,
    deployment_date
  FROM (
    SELECT
      owner AS owner_address,
      safe_address,
      became_owner_at,
      current_threshold,
      NULL AS current_owner_count,
      '' AS creation_version,
      NULL AS deployment_date
    FROM dbt.int_execution_safes_current_owners
  )
  WHERE 1 = 1
    /*__FILTER_CONDITIONS__*/
  ORDER BY became_owner_at DESC`,
};

export default metric;
