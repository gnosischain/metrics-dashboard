const metric = {
  id: 'api_consensus_attestations_p50_inclusion_delay_daily',
  name: 'P50 Inclusion Delay',
  description: 'Median attestation inclusion delay (slots)',
  metricDescription: 'Weighted median of attestation inclusion delay. Typically 1 on healthy network days — values > 1 indicate congestion or correlated client issues.',
  chartType: 'line',
  isTimeSeries: true,
  format: 'formatNumber',

  xField: 'date',
  yField: 'p50_inclusion_delay',

  smooth: true,
  lineWidth: 2,

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  query: `SELECT date, p50_inclusion_delay FROM dbt.api_consensus_attestations_performance_daily ORDER BY date`,
};

export default metric;
