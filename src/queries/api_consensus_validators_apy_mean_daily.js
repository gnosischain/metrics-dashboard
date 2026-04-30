const metric = {
  id: 'api_consensus_validators_apy_mean_daily',
  name: 'Network Average APY',
  description: 'Daily APY distribution across validators (bands) with network median and balance-weighted mean overlaid',
  metricDescription: 'Shaded bands are T-Digest quantiles of per-validator APY across the active validator set each day (q05/q95 outer, q10/q90 mid, q25/q75 inner). Solid line is the network median; dashed line is the balance-weighted mean (matches legacy fct_consensus_validators_apy_mean_daily). Built on int_consensus_validators_income_daily via the new api_consensus_validators_apy_dist_income_daily view.',
  chartType: 'quantileBands',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',

  defaultZoom: { start: 80, end: 100 },

  xField: 'date',

  bands: [
    { lower: 'q05_apy', upper: 'q95_apy', opacity: 0.15, name: '90% Range (5%-95%)' },
    { lower: 'q10_apy', upper: 'q90_apy', opacity: 0.25, name: '80% Range (10%-90%)' },
    { lower: 'q25_apy', upper: 'q75_apy', opacity: 0.35, name: 'IQR (25%-75%)' }
  ],

  lines: ['q50_apy', 'avg_apy_weighted'],

  lineOpacity: 0.9,
  lineStrokeWidth: 3,
  interpolate: 'monotoneX',

  bandColors: ['#4dabf7', '#69db7c', '#ffd43b'],
  lineColors: ['#000000', '#c92a2a'], // black median, red mean

  enableLegend: true,
  enableTooltip: true,
  legendPosition: 'top',
  legendScrollable: true,

  showWatermark: true,
  watermarkPosition: 'bottom-right',
  watermarkSize: 25,
  watermarkOpacity: 0.3,

  // Sourced from the NEW income-daily-backed distribution view. The legacy
  // api_consensus_validators_apy_mean_daily view still exists (returns just the
  // weighted mean), but this dashboard chart now reads the richer distribution
  // so bands and overlays can be drawn from a single query.
  query: `SELECT * FROM dbt.api_consensus_validators_apy_dist_income_daily`,
};

export default metric;
