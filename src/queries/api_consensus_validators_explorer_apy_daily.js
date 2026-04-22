const metric = {
  id: 'api_consensus_validators_explorer_apy_daily',
  globalFilterField: 'withdrawal_credentials',
  name: 'Average APY',
  description: 'Daily mean APY across the selected validator(s), outliers filtered',
  metricDescription: 'avgIf(apy, apy BETWEEN 0 AND 200) across every validator sharing the selected withdrawal_credentials. For a solo credential this is that validator\'s own daily APY.',
  chartType: 'line',
  isTimeSeries: true,
  format: 'formatNumber',

  xField: 'date',
  yField: 'apy',

  smooth: true,
  lineWidth: 2,

  enableZoom: true,
  defaultZoom: { start: 80, end: 100 },

  query: `SELECT withdrawal_credentials, date, apy FROM dbt.api_consensus_validators_explorer_daily ORDER BY date`,
};

export default metric;
