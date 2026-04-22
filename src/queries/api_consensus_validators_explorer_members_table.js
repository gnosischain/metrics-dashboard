const metric = {
  id: 'api_consensus_validators_explorer_members_table',
  globalFilterField: 'withdrawal_credentials',
  name: 'Validators under this credential',
  description: 'Per-validator breakdown of the selected operator/withdrawal credential',
  metricDescription: 'One row per validator sharing the selected withdrawal_credentials. Lifecycle columns (status, activation/exit dates, slashed) let you see which validators in an operator pool are active vs retired. apy_30d is per-validator balance-weighted APY over the last 30 days.',
  chartType: 'table',

  columns: [
    { key: 'validator_index', label: 'Index', type: 'number' },
    { key: 'status', label: 'Status' },
    { key: 'slashed', label: 'Slashed', type: 'boolean' },
    { key: 'activation_date', label: 'Activated', type: 'date' },
    { key: 'exit_date', label: 'Exited', type: 'date' },
    { key: 'balance_gno', label: 'Balance (GNO)', type: 'number', format: 'formatNumber' },
    { key: 'effective_balance_gno', label: 'Eff. Balance (GNO)', type: 'number', format: 'formatNumber' },
    { key: 'apy_30d', label: 'APY 30d', type: 'number', format: 'formatPercentage' },
    { key: 'consensus_income_amount_30d_gno', label: '30d Income (GNO)', type: 'number', format: 'formatNumber' },
    { key: 'proposed_blocks_count_lifetime', label: 'Blocks (lifetime)', type: 'number', format: 'formatNumber' },
    { key: 'proposer_reward_total_lifetime_gno', label: 'Proposer Rewards (lifetime GNO)', type: 'number', format: 'formatNumber' },
    { key: 'total_income_estimated_gno', label: 'Total Income (GNO)', type: 'number', format: 'formatNumber' },
    { key: 'withdrawal_address', label: 'Withdrawal Address' },
    { key: 'pubkey', label: 'Pubkey' },
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
    ORDER BY validator_index
  `,
};

export default metric;
