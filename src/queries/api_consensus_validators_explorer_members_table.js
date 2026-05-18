import { formatTruncateHex } from '../utils/formatters';

const metric = {
  id: 'api_consensus_validators_explorer_members_table',
  globalFilterField: 'withdrawal_credentials',
  name: 'Validators under this credential',
  description: 'Per-validator breakdown of the selected operator/withdrawal credential',
  metricDescription: 'One row per validator sharing the selected withdrawal_credentials. Default sort is balance (desc) and default page size is 25 so large operator pools are navigable. Select one or more rows to overlay those validators\u2019 APY / balance / income on the tab\u2019s charts via the `validator_index` secondary global filter. Pubkey and withdrawal_address are truncated with click-to-copy; full hex is in the hover title.',
  chartType: 'table',
  serverPagination: true,
  serverSearch: true,
  serverSort: true,
  maxPageSize: 500,
  serverSearchFields: ['validator_index', 'status', 'withdrawal_address', 'pubkey', 'withdrawal_credentials'],
  serverSortFields: [
    'validator_index',
    'status',
    'slashed',
    'activation_date',
    'exit_date',
    'balance_gno',
    'effective_balance_gno',
    'apy_30d',
    'consensus_income_amount_30d_gno',
    'proposed_blocks_count_lifetime',
    'proposer_reward_total_lifetime_gno',
    'total_income_estimated_gno',
    'withdrawal_address',
    'pubkey',
    'withdrawal_credentials',
  ],

  // v2 (2026-04): higher default page size, sort by balance desc, row selection on, and
  // the validator_index column is hidden here but still emitted so the secondary-filter
  // plumbing can pick it up on row-select.
  paginationSize: 25,
  paginationSizeSelector: [10, 25, 50, 100],
  initialSort: [
    { column: 'balance_gno', dir: 'desc' },
    { column: 'validator_index', dir: 'asc' },
  ],
  selectableRows: true,
  // Tab-level secondary global filter — the fields a selected row emits to cascade to
  // other charts on the tab. Read by Dashboard.js via secondaryGlobalFilterField.
  rowSelectionEmits: ['validator_index'],

  // Column order: identity first (index, status, slashed), then the numbers the user
  // scans for (balance, effective balance, apy_30d, income_30d), then lifetime counters,
  // then dates, then the long-hex columns with truncation at the end where they don't
  // push everything else off-screen.
  columns: [
    { field: 'validator_index', title: 'Index', sorter: 'number', width: 80 },
    { field: 'status', title: 'Status', sorter: 'string', width: 120 },
    { field: 'slashed', title: 'Slashed', sorter: 'number', width: 80 },
    { field: 'balance_gno', title: 'Balance (GNO)', sorter: 'number', formatter: (cell) => {
        const v = cell.getValue();
        return v == null ? '' : Number(v).toLocaleString('en-US', { maximumFractionDigits: 3 });
      } },
    { field: 'effective_balance_gno', title: 'Eff. Balance (GNO)', sorter: 'number', formatter: (cell) => {
        const v = cell.getValue();
        return v == null ? '' : Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 });
      } },
    { field: 'apy_30d', title: 'APY 30d (%)', sorter: 'number', formatter: (cell) => {
        const v = cell.getValue();
        return v == null ? '' : Number(v).toFixed(2);
      } },
    { field: 'consensus_income_amount_30d_gno', title: '30d Income (GNO)', sorter: 'number', formatter: (cell) => {
        const v = cell.getValue();
        return v == null ? '' : Number(v).toFixed(3);
      } },
    { field: 'proposed_blocks_count_lifetime', title: 'Blocks (lifetime)', sorter: 'number' },
    { field: 'proposer_reward_total_lifetime_gno', title: 'Proposer Rewards (lifetime GNO)', sorter: 'number', formatter: (cell) => {
        const v = cell.getValue();
        return v == null ? '' : Number(v).toFixed(3);
      } },
    { field: 'total_income_estimated_gno', title: 'Total Income (GNO)', sorter: 'number', formatter: (cell) => {
        const v = cell.getValue();
        return v == null ? '' : Number(v).toFixed(3);
      } },
    { field: 'activation_date', title: 'Activated', sorter: 'string' },
    { field: 'exit_date', title: 'Exited', sorter: 'string' },
    { field: 'withdrawal_address', title: 'Withdrawal Address', sorter: 'string', formatter: (cell) => formatTruncateHex(cell.getValue()), width: 140 },
    { field: 'pubkey', title: 'Pubkey', sorter: 'string', formatter: (cell) => formatTruncateHex(cell.getValue()), width: 140 },
  ],

  query: `
    SELECT
      withdrawal_credentials,
      validator_index,
      status,
      slashed,
      activation_date,
      exit_date,
      balance_gno,
      effective_balance_gno,
      apy_30d,
      consensus_income_amount_30d_gno,
      proposed_blocks_count_lifetime,
      proposer_reward_total_lifetime_gno,
      total_income_estimated_gno,
      withdrawal_address,
      pubkey
    FROM dbt.api_consensus_validators_explorer_members_table
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY balance_gno DESC, validator_index ASC
  `,
};

export default metric;
