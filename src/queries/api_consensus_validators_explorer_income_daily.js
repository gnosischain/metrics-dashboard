const metric = {
  id: 'api_consensus_validators_explorer_income_daily',
  name: 'Daily Consensus Income',
  description: 'Daily consensus income (GNO) summed across the selected validator(s)',
  metricDescription: 'Sum of consensus_income_amount_gno across every validator sharing the selected withdrawal_credentials. Excludes deposits, withdrawals, and consolidation transfers — pure consensus rewards.',
  chartType: 'area',
  isTimeSeries: true,
  format: 'formatNumberWithGNO',

  xField: 'date',
  yField: 'consensus_income_amount_gno',

  smooth: true,
  lineWidth: 2,
  areaOpacity: 0.3,

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  query: `SELECT date, consensus_income_amount_gno FROM dbt.api_consensus_validators_explorer_daily ORDER BY date`,
};

export default metric;
