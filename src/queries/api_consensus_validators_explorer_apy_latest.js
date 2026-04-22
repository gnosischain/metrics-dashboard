const metric = {
  id: 'api_consensus_validators_explorer_apy_latest',
  globalFilterField: 'withdrawal_credentials',
  name: 'APY (30d)',
  description: '30d',
  metricDescription: 'Per-credential balance-weighted APY = SUM(30d consensus income) / AVG(30d effective balance) × 365 × 100. Ignores validators with zero effective balance so idle/exited slots do not drag the mean.',
  format: 'formatPercentage',
  valueField: 'apy_30d',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `SELECT withdrawal_credentials, apy_30d FROM dbt.api_consensus_validators_explorer_latest`,
};

export default metric;
