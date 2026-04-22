const metric = {
  id: 'api_consensus_validators_explorer_proposed_blocks_lifetime',
  globalFilterField: 'withdrawal_credentials',
  name: 'Lifetime Proposed Blocks',
  format: 'formatNumber',
  valueField: 'proposed_blocks_count_lifetime',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `SELECT withdrawal_credentials, proposed_blocks_count_lifetime FROM dbt.api_consensus_validators_explorer_latest`,
};

export default metric;
