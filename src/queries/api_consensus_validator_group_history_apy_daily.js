const metric = {
  id: 'api_consensus_validator_group_history_apy_daily',
  name: 'Validator Explorer Group APY History',
  chartType: 'table',
  hidden: true,
  query: `
    SELECT
      date,
      withdrawal_credentials,
      apy
    FROM dbt.api_consensus_validators_explorer_daily
    WHERE date BETWEEN '{from}' AND '{to}'
      /*__FILTER_CONDITIONS__*/
    ORDER BY date ASC
  `
};

export default metric;
