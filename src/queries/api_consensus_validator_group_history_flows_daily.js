// Flow history per withdrawal_credentials.
//
// Previous version did 4x `UNION ALL` over `api_consensus_validators_explorer_daily`,
// each branch reading the full date range across every credential, then the
// framework's outer `WHERE withdrawal_credentials = '...'` wrapper tried to
// filter the union. ClickHouse's planner does NOT push the outer predicate
// down through `UNION ALL` on a view, so the query scanned ~3,400 credentials
// × 738 days × 4 branches ≈ 10M rows and blew the 10.8 GiB memory cap (500).
//
// Rewrite: single scan of the source, with `arrayJoin` fanning each row into
// four labelled flow rows. ClickHouse pushes the outer `withdrawal_credentials`
// filter down to the base table scan (the source's primary key is
// `(withdrawal_credentials, date)`), so we only read the one credential's
// rows. One pass, ~738 rows in, ~2,952 rows out.
const metric = {
  id: 'api_consensus_validator_group_history_flows_daily',
  name: 'Validator Explorer Group Flow History',
  chartType: 'table',
  hidden: true,
  query: `
    SELECT
      date,
      withdrawal_credentials,
      label,
      amount_gno
    FROM (
      SELECT
        date,
        withdrawal_credentials,
        arrayJoin([
          ('Deposits',          deposits_amount_gno),
          ('Withdrawals',       -withdrawals_amount_gno),
          ('Consolidation In',  consolidation_inflow_gno),
          ('Consolidation Out', -consolidation_outflow_gno)
        ]) AS flow,
        flow.1 AS label,
        flow.2 AS amount_gno
      FROM dbt.api_consensus_validators_explorer_daily
      WHERE date BETWEEN '{from}' AND '{to}'
        /*__FILTER_CONDITIONS__*/
    )
    WHERE amount_gno != 0
    ORDER BY date ASC, label ASC
  `
};

export default metric;
