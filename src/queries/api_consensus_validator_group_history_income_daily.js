const metric = {
  id: 'api_consensus_validator_group_history_income_daily',
  name: 'Validator Explorer Group Income History',
  chartType: 'table',
  hidden: true,
  query: `
    SELECT
      date,
      withdrawal_credentials,
      consensus_income_amount_gno
    FROM dbt.api_consensus_validators_explorer_daily
    WHERE date BETWEEN '{from}' AND '{to}'
      /*__FILTER_CONDITIONS__*/
    ORDER BY date ASC
  `
};

export default metric;
