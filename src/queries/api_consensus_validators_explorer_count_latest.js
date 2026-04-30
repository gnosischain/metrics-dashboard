const metric = {
  id: 'api_consensus_validators_explorer_count_latest',
  globalFilterField: 'withdrawal_credentials',
  name: 'Validators',
  format: 'formatNumber',
  valueField: 'validator_count',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `
    SELECT withdrawal_credentials, validator_count
    FROM dbt.api_consensus_validators_explorer_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
