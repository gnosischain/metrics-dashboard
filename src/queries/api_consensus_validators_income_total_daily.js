const metric = {
  id: 'api_consensus_validators_income_total_daily',
  name: 'Network Consensus Income',
  description: 'Daily sum of consensus income (GNO) across every validator',
  metricDescription: 'Sum of consensus_income_amount_gno per day across the full validator set (including exited and zero-balance). Derived from the per-validator income fact int_consensus_validators_income_daily.',
  chartType: 'area',
  isTimeSeries: true,
  format: 'formatNumberWithGNO',

  xField: 'date',
  yField: 'income_gno',

  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.3,

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  query: `SELECT * FROM dbt.api_consensus_validators_income_total_daily`,
};

export default metric;
