const metric = {
  id: 'api_consensus_validators_explorer_income_daily',
  globalFilterField: 'withdrawal_credentials',
  name: 'Daily Consensus Income',
  description: 'Daily consensus income (GNO) — green bars on positive days, red on negative days',
  metricDescription: 'Sum of consensus_income_amount_gno across every validator sharing the selected withdrawal_credentials. Excludes deposits, withdrawals, and consolidation transfers — pure consensus rewards. The series is split on sign so ECharts colours positive (gain) days green and negative (loss) days red via seriesColorsByName.',
  chartType: 'bar',
  isTimeSeries: true,
  format: 'formatNumberWithGNO',
  stacked: false,

  xField: 'date',
  yField: 'amount_gno',
  seriesField: 'label',

  // Conditional colouring by sign is not natively supported by the bar chart.
  // Pattern borrowed from api_consensus_validators_explorer_deposits_withdrawals_daily:
  // UNION two branches that tag each row as 'gain' or 'loss', then assign a
  // per-series colour. ECharts paints each series with its own colour so we
  // get green positive bars and red negative bars without a custom component.
  seriesColorsByName: {
    gain: '#22c55e',
    loss: '#ef4444',
  },

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  query: `
    SELECT withdrawal_credentials, date, 'gain' AS label, consensus_income_amount_gno AS amount_gno
    FROM dbt.api_consensus_validators_explorer_daily
    WHERE consensus_income_amount_gno > 0
    UNION ALL
    SELECT withdrawal_credentials, date, 'loss' AS label, consensus_income_amount_gno AS amount_gno
    FROM dbt.api_consensus_validators_explorer_daily
    WHERE consensus_income_amount_gno < 0
  `,
};

export default metric;
