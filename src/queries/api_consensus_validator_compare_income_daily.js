const metric = {
  id: 'api_consensus_validator_compare_income_daily',
  name: 'Validator Explorer Compare Income History',
  chartType: 'table',
  hidden: true,
  query: `
    SELECT
      date,
      validator_index,
      consensus_income_amount_gno
    FROM dbt.int_consensus_validators_income_daily
    WHERE date BETWEEN '{from}' AND '{to}'
      /*__FILTER_CONDITIONS__*/
    ORDER BY date ASC, validator_index ASC
  `
};

export default metric;
