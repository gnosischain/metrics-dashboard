const metric = {
  id: 'api_consensus_validators_explorer_members_table',
  name: 'Validators under this credential',
  description: 'Per-validator breakdown of the selected operator/withdrawal credential',
  metricDescription: 'One row per validator sharing the selected withdrawal_credentials. Lets you drill into which specific validator is driving the operator-level aggregates.',
  chartType: 'table',

  columns: [
    { key: 'validator_index', label: 'Index', type: 'number' },
    { key: 'status', label: 'Status' },
    { key: 'balance_gno', label: 'Balance (GNO)', type: 'number', format: 'formatNumber' },
    { key: 'effective_balance_gno', label: 'Eff. Balance (GNO)', type: 'number', format: 'formatNumber' },
    { key: 'consensus_income_amount_30d_gno', label: '30d Income (GNO)', type: 'number', format: 'formatNumber' },
    { key: 'proposed_blocks_count_lifetime', label: 'Blocks (lifetime)', type: 'number', format: 'formatNumber' },
    { key: 'proposer_reward_total_lifetime_gno', label: 'Proposer Rewards (lifetime GNO)', type: 'number', format: 'formatNumber' },
    { key: 'total_income_estimated_gno', label: 'Total Income (GNO)', type: 'number', format: 'formatNumber' },
    { key: 'withdrawal_address', label: 'Withdrawal Address' },
    { key: 'pubkey', label: 'Pubkey' },
  ],

  query: `
    SELECT
      validator_index,
      status,
      balance_gno,
      effective_balance_gno,
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
