const metric = {
  id: 'api_consensus_validators_explorer_slashed_count',
  globalFilterField: 'withdrawal_credentials',
  name: 'Slashed',
  description: 'Validators slashed under this credential',
  metricDescription: 'Count of validators with slashed=true on the latest beacon-state snapshot. Includes both active_slashed and exited_slashed statuses.',
  format: 'formatNumber',
  valueField: 'slashed_count',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `SELECT withdrawal_credentials, slashed_count FROM dbt.api_consensus_validators_explorer_latest`,
};

export default metric;
