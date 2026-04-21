const metric = {
  id: 'api_consensus_validators_explorer_proposed_blocks_lifetime',
  name: 'Lifetime Proposed Blocks',
  format: 'formatNumber',
  valueField: 'proposed_blocks_count_lifetime',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `SELECT proposed_blocks_count_lifetime FROM dbt.api_consensus_validators_explorer_latest`,
};

export default metric;
