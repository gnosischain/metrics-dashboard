const metric = {
  id: 'api_consensus_validators_explorer_slashed_count',
  globalFilterField: 'withdrawal_credentials',
  name: 'Slashed',
  metricDescription: 'Validators slashed under this credential. Count of validators with slashed=true on the latest beacon-state snapshot — includes both active_slashed and exited_slashed statuses.',
  format: 'formatNumber',
  valueField: 'slashed_count',
  chartType: 'numberDisplay',
  variant: 'compact',
  query: `
    SELECT withdrawal_credentials, slashed_count
    FROM dbt.api_consensus_validators_explorer_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
