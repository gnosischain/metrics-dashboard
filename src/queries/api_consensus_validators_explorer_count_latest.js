const metric = {
  id: 'api_consensus_validators_explorer_count_latest',
  name: 'Validators',
  format: 'formatNumber',
  valueField: 'validator_count',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `SELECT validator_count FROM dbt.api_consensus_validators_explorer_latest`,
};

export default metric;
