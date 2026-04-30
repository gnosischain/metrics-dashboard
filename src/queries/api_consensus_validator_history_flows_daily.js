// Per-validator flow history. Single-scan arrayJoin — see the matching
// operator-grain file (api_consensus_validator_group_history_flows_daily)
// for the rationale. The 4x UNION ALL variant blew ClickHouse memory
// when the outer validator_index filter wasn't pushed through the union.
const metric = {
  id: 'api_consensus_validator_history_flows_daily',
  name: 'Validator Explorer Validator Flow History',
  chartType: 'table',
  hidden: true,
  query: `
    SELECT
      date,
      validator_index,
      label,
      amount_gno
    FROM (
      SELECT
        date,
        validator_index,
        arrayJoin([
          ('Deposits',          deposits_amount_gno),
          ('Withdrawals',       -withdrawals_amount_gno),
          ('Consolidation In',  consolidation_inflow_gno),
          ('Consolidation Out', -consolidation_outflow_gno)
        ]) AS flow,
        flow.1 AS label,
        flow.2 AS amount_gno
      FROM dbt.int_consensus_validators_income_daily
      WHERE date BETWEEN '{from}' AND '{to}'
        /*__FILTER_CONDITIONS__*/
    )
    WHERE amount_gno != 0
    ORDER BY date ASC, label ASC
  `
};

export default metric;
