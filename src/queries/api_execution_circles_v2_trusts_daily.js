const metric = {
  id: 'api_execution_circles_v2_trusts_daily',
  name: 'Daily Trusts',
  description: 'Trust event activity',
  metricDescription: `Daily Circles v2 trust activity at the **raw \`Trust\` event grain** — every on-chain \`Trust\` call, so re-trusting or extending an existing pair is counted each time. \`n_new_trusts\` = events whose \`expiry_time\` is in the future (trust granted or extended); \`n_revoked_trusts\` = events whose \`expiry_time\` is at or before the block time (expiry set to the past, i.e. a revoke); \`n_trust_events\` is their total. Also reports distinct \`truster\` and \`trustee\` addresses active that day. The current incomplete day is excluded. Contrast with the net active-trust stock series, which dedupes to distinct \`(truster, trustee)\` validity ranges.`,
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'n_new_trusts',
  unitFields: {
    new_trusts:        { field: 'n_new_trusts',        format: 'formatNumber' },
    revoked_trusts:    { field: 'n_revoked_trusts',    format: 'formatNumber' },
    distinct_trusters: { field: 'n_distinct_trusters', format: 'formatNumber' },
    distinct_trustees: { field: 'n_distinct_trustees', format: 'formatNumber' },
  },
  query: `
    SELECT
      date,
      n_trust_events,
      n_new_trusts,
      n_revoked_trusts,
      n_distinct_trusters,
      n_distinct_trustees
    FROM dbt.api_execution_circles_v2_trusts_daily
    ORDER BY date
  `,
};
export default metric;
