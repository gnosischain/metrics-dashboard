const metric = {
  id: 'api_consensus_validator_group_members',
  name: 'Validator Explorer Group Members',
  chartType: 'table',
  hidden: true,
  query: `
    SELECT
      withdrawal_credentials,
      validator_index,
      pubkey,
      withdrawal_address,
      status,
      slashed,
      activation_eligibility_epoch,
      activation_epoch,
      exit_epoch,
      withdrawable_epoch,
      activation_date,
      exit_date,
      withdrawable_date,
      balance_gno,
      effective_balance_gno,
      apy_30d,
      consensus_income_amount_30d_gno,
      proposer_reward_total_30d_gno,
      proposed_blocks_count_lifetime,
      proposer_reward_total_lifetime_gno,
      total_income_estimated_gno,
      latest_date
    FROM dbt.api_consensus_validators_explorer_members_table
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY balance_gno DESC, validator_index ASC
    LIMIT 500
  `
};

export default metric;
