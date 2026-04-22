const metric = {
  id: 'api_consensus_validators_explorer_balance_dist',
  globalFilterField: 'withdrawal_credentials',
  name: 'Balance Distribution',
  description: 'Validator count by effective-balance bucket across co-validators under this credential',
  metricDescription: 'Bucketed histogram of effective balance across every validator sharing the selected withdrawal credential. Buckets span the 0x00/0x01 regime (32 GNO cap) and the 0x02/MaxEB regime (up to 2048 GNO). Large pools usually cluster at 16–32 GNO; MaxEB compounders cluster at ≥256.',
  chartType: 'bar',
  format: 'formatNumber',
  xField: 'bucket',
  yField: 'validator_count',
  stacked: false,
  enableZoom: false,

  query: `
    SELECT withdrawal_credentials, bucket, bucket_order, validator_count, balance_gno_total
    FROM dbt.api_consensus_validators_explorer_balance_dist
    ORDER BY bucket_order
  `,
};

export default metric;
