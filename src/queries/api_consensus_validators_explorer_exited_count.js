const metric = {
  id: 'api_consensus_validators_explorer_exited_count',
  globalFilterField: 'withdrawal_credentials',
  name: 'Exited',
  metricDescription: 'Validators that have exited under this credential. Count of validators with status starting exited_* (voluntary, slashed, or otherwise).',
  format: 'formatNumber',
  valueField: 'exited_count',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `
    SELECT withdrawal_credentials, exited_count
    FROM dbt.api_consensus_validators_explorer_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
