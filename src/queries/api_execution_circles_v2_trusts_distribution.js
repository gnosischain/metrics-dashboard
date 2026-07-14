const metric = {
  id: 'api_execution_circles_v2_trusts_distribution',
  name: 'Trust Degree Distribution',
  description: 'Avatars grouped by trust degree, given vs received',
  metricDescription: `Snapshot histogram (as of the latest complete day) of Circles v2 avatars bucketed by their **net active trust degree**, split into trusts **given** (outgoing, \`trusts_given_count\`) and **received** (incoming, \`trusts_received_count\`). Degree is the count of currently open \`(truster, trustee)\` ranges per avatar (revoked/expired trusts removed), bucketed \`0 / 1-5 / 6-10 / 11-25 / 26-50 / 51-100 / 100+\`; the \`0\` bucket holds avatars with no active trust in that direction. Each avatar falls in exactly one bucket per direction.`,
  chartType: 'bar',
  isTimeSeries: false,
  stacked: false,
  format: 'formatNumber',
  xField: 'trust_bucket',
  yField: 'avatar_count',
  seriesField: 'direction',
  tooltipOrder: 'valueDesc',
  preserveOrder: true,
  query: `
    SELECT direction, trust_bucket, avatar_count
    FROM dbt.api_execution_circles_v2_trusts_distribution
    ORDER BY
      direction,
      multiIf(
        trust_bucket = '0',      0,
        trust_bucket = '1-5',    1,
        trust_bucket = '6-10',   2,
        trust_bucket = '11-25',  3,
        trust_bucket = '26-50',  4,
        trust_bucket = '51-100', 5,
        trust_bucket = '100+',   6,
        99)
  `,
};
export default metric;
