const metric = {
  id: 'api_consensus_validators_explorer_exited_count',
  globalFilterField: 'withdrawal_credentials',
  name: 'Exited',
  description: 'Validators that have exited under this credential',
  metricDescription: 'Count of validators with status starting exited_* (voluntary, slashed, or otherwise).',
  format: 'formatNumber',
  valueField: 'exited_count',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `SELECT withdrawal_credentials, exited_count FROM dbt.api_consensus_validators_explorer_latest`,
};

export default metric;
