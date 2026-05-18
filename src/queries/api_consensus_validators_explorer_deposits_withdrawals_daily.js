const metric = {
  id: 'api_consensus_validators_explorer_deposits_withdrawals_daily',
  globalFilterField: 'withdrawal_credentials',
  name: 'Deposits, Withdrawals & Consolidations',
  description: 'Daily net flows: deposits (+), withdrawals (−), consolidation in/out',
  metricDescription: 'Pivoted view of the four flow columns from api_consensus_validators_explorer_daily. Deposits and consolidation-inflows are plotted as positive; withdrawals and consolidation-outflows as negative. Makes it easy to see net flow direction per day.',
  chartType: 'bar',
  isTimeSeries: true,
  format: 'formatNumberWithGNO',
  stacked: true,

  xField: 'date',
  yField: 'amount_gno',
  seriesField: 'label',

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  // Single-scan arrayJoin variant — the prior 4x UNION ALL triggered
  // ClickHouse memory-exceeded errors because the framework's outer
  // `WHERE withdrawal_credentials = '...'` wrapper doesn't push down
  // through UNION ALL. See api_consensus_validator_group_history_flows_daily.js
  // for the full rationale.
  query: `
    SELECT withdrawal_credentials, date, label, amount_gno
    FROM (
      SELECT
        withdrawal_credentials,
        date,
        arrayJoin([
          ('deposits',          deposits_amount_gno),
          ('withdrawals',       -withdrawals_amount_gno),
          ('consolidation_in',  consolidation_inflow_gno),
          ('consolidation_out', -consolidation_outflow_gno)
        ]) AS flow,
        flow.1 AS label,
        flow.2 AS amount_gno
      FROM dbt.api_consensus_validators_explorer_daily
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
    )
    WHERE amount_gno != 0
  `,
};

export default metric;
