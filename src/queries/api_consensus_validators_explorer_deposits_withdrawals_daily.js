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

  query: `
    SELECT withdrawal_credentials, date, 'deposits' AS label, deposits_amount_gno AS amount_gno FROM dbt.api_consensus_validators_explorer_daily WHERE deposits_amount_gno > 0
    UNION ALL
    SELECT withdrawal_credentials, date, 'withdrawals' AS label, -withdrawals_amount_gno AS amount_gno FROM dbt.api_consensus_validators_explorer_daily WHERE withdrawals_amount_gno > 0
    UNION ALL
    SELECT withdrawal_credentials, date, 'consolidation_in' AS label, consolidation_inflow_gno AS amount_gno FROM dbt.api_consensus_validators_explorer_daily WHERE consolidation_inflow_gno > 0
    UNION ALL
    SELECT withdrawal_credentials, date, 'consolidation_out' AS label, -consolidation_outflow_gno AS amount_gno FROM dbt.api_consensus_validators_explorer_daily WHERE consolidation_outflow_gno > 0
  `,
};

export default metric;
