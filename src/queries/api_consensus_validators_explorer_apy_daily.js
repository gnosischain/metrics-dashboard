const metric = {
  id: 'api_consensus_validators_explorer_apy_daily',
  globalFilterField: 'withdrawal_credentials',
  name: 'Average APY',
  description: 'Daily APY for the selected credential — quantile bands across the credential\u2019s validators plus 7-day rolling median',
  metricDescription: 'For multi-validator credentials, shaded bands are T-Digest quantiles of per-validator APY on each day (q05/q95 outer, q10/q90 mid, q25/q75 inner). For solo credentials the bands collapse to a single point. Primary line = apy_rolling_7d_median of the credential\u2019s balance-weighted daily APY (trailing 7-day median), which reads as a clean smoothed APY even when the raw daily series is jittery. Secondary dashed line = apy_rolling_30d_median for longer-term trend. Sourced from api_consensus_validators_explorer_apy_dist_daily (built on the spec-bounded income fact).',
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

  lines: ['apy_rolling_7d_median', 'apy_rolling_30d_median'],

  lineOpacity: 0.9,
  lineStrokeWidth: 3,
  interpolate: 'monotoneX',

  bandColors: ['#4dabf7', '#69db7c', '#ffd43b'],
  lineColors: ['#000000', '#868e96'], // black 7d median primary, grey 30d secondary

  enableLegend: true,
  enableTooltip: true,
  legendPosition: 'top',
  legendScrollable: true,

  showWatermark: true,
  watermarkPosition: 'bottom-right',
  watermarkSize: 25,
  watermarkOpacity: 0.3,

  query: `
    SELECT *
    FROM dbt.api_consensus_validators_explorer_apy_dist_daily
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY date
  `,
};

export default metric;
