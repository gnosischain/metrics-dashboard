const metric = {
  id: 'api_consensus_validator_compare_proposer_rewards_daily',
  name: 'Validator Explorer Compare Proposer Rewards History',
  chartType: 'table',
  hidden: true,
  query: `
    SELECT
      date,
      validator_index,
      proposer_reward_total_gno
    FROM dbt.int_consensus_validators_proposer_rewards_daily
    WHERE date BETWEEN '{from}' AND '{to}'
      /*__FILTER_CONDITIONS__*/
    ORDER BY date ASC, validator_index ASC
  `
};

export default metric;
