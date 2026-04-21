const metric = {
  id: 'api_consensus_attestations_avg_inclusion_delay_daily',
  name: 'Avg Inclusion Delay',
  description: 'Weighted mean attestation inclusion delay (slots)',
  metricDescription: 'Average number of slots between attestation slot and inclusion slot, weighted by attestation count. Lower is better — 1 slot means included in the next block.',
  chartType: 'line',
  isTimeSeries: true,
  format: 'formatNumber',

  xField: 'date',
  yField: 'avg_inclusion_delay',

  smooth: true,
  lineWidth: 2,

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  query: `SELECT date, avg_inclusion_delay FROM dbt.api_consensus_attestations_performance_daily ORDER BY date`,
};

export default metric;
