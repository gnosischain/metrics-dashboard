const metric = {
  id: 'api_consensus_validator_compare_balance_daily',
  name: 'Validator Explorer Compare Balance History',
  chartType: 'table',
  hidden: true,
  query: `
    SELECT
      date,
      validator_index,
      balance_gno
    FROM dbt.int_consensus_validators_income_daily
    WHERE date BETWEEN '{from}' AND '{to}'
      /*__FILTER_CONDITIONS__*/
    ORDER BY date ASC, validator_index ASC
  `
};

export default metric;
