const metric = {
  id: 'api_consensus_validators_explorer_income_30d',
  globalFilterField: 'withdrawal_credentials',
  name: '30d Consensus Income',
  format: 'formatNumberWithGNO',
  valueField: 'consensus_income_amount_30d_gno',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `
    SELECT withdrawal_credentials, consensus_income_amount_30d_gno
    FROM dbt.api_consensus_validators_explorer_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
