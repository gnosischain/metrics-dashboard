const metric = {
  id: 'api_consensus_validators_explorer_balance_latest',
  globalFilterField: 'withdrawal_credentials',
  name: 'Total Balance',
  format: 'formatNumberWithGNO',
  valueField: 'balance_gno',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `
    SELECT withdrawal_credentials, balance_gno
    FROM dbt.api_consensus_validators_explorer_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
