const metric = {
  id: 'api_consensus_attestations_pct_distance_1_daily',
  name: '% Attestations at Distance 1',
  description: 'Share of attestations included with inclusion_delay = 1',
  metricDescription: 'Fraction of attestations included in the very next slot (inclusion_delay = 1). This is the upper bound of attestation timeliness — higher is better.',
  chartType: 'line',
  isTimeSeries: true,
  format: 'formatPercentage',

  xField: 'date',
  yField: 'pct_inclusion_distance_1',

  smooth: true,
  lineWidth: 2,

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  query: `SELECT date, pct_inclusion_distance_1 FROM dbt.api_consensus_attestations_performance_daily ORDER BY date`,
};

export default metric;
