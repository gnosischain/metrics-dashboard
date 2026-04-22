const metric = {
  id: 'api_consensus_validators_explorer_active_count',
  globalFilterField: 'withdrawal_credentials',
  name: 'Active',
  description: 'Current',
  metricDescription: 'Validators currently active under this credential. Count of validators with status in (active_ongoing, active_exiting, active_slashed).',
  format: 'formatNumber',
  valueField: 'active_count',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `SELECT withdrawal_credentials, active_count FROM dbt.api_consensus_validators_explorer_latest`,
};

export default metric;
