const metric = {
  id: 'api_execution_circles_v2_trust_flow_daily',
  name: 'Trust Creations vs Revocations',
  description: 'Daily new vs revoked trust relationships',
  metricDescription: `Daily count of Circles v2 trust relationships **created** (\`New\`) versus **ended** (\`Revoked\`). Derived from SCD2 validity ranges of distinct \`(truster, trustee)\` trust pairs: a \`New\` is booked on a range's \`valid_from\` date and a \`Revoked\` on its \`valid_to\` date. Trusts that are still open (no end) are never counted as revoked, and the current incomplete day is excluded. This is net-stock accounting on pair ranges, so re-trusting an already-open pair does not double-count (unlike the raw trust-event series).`,
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  query: `
    SELECT date, 'New' AS label, new_trusts AS value
    FROM dbt.api_execution_circles_v2_active_trusts_daily
    UNION ALL
    SELECT date, 'Revoked' AS label, revoked_trusts AS value
    FROM dbt.api_execution_circles_v2_active_trusts_daily
  `,
};

export default metric;
