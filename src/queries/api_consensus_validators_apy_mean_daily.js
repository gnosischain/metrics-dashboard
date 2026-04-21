const metric = {
  id: 'api_consensus_validators_apy_mean_daily',
  name: 'Network Average APY',
  description: 'Daily mean APY (%) across validators, outliers filtered (0 ≤ apy ≤ 200)',
  metricDescription: 'Average annualised percentage yield across every validator with a valid APY reading for the day. Outlier filter (0–200) matches the window used by int_consensus_validators_dists_daily so the two APY surfaces agree.',
  chartType: 'line',
  isTimeSeries: true,
  format: 'formatNumber',

  xField: 'date',
  yField: 'apy',

  smooth: true,
  lineWidth: 2,

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  query: `SELECT * FROM dbt.api_consensus_validators_apy_mean_daily`,
};

export default metric;
