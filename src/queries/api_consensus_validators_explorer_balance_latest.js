const metric = {
  id: 'api_consensus_validators_explorer_balance_latest',
  name: 'Total Balance',
  format: 'formatNumberWithGNO',
  valueField: 'balance_gno',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `SELECT balance_gno FROM dbt.api_consensus_validators_explorer_latest`,
};

export default metric;
