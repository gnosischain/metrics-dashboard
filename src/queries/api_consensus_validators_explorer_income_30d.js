const metric = {
  id: 'api_consensus_validators_explorer_income_30d',
  name: '30d Consensus Income',
  format: 'formatNumberWithGNO',
  valueField: 'consensus_income_amount_30d_gno',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `SELECT consensus_income_amount_30d_gno FROM dbt.api_consensus_validators_explorer_latest`,
};

export default metric;
