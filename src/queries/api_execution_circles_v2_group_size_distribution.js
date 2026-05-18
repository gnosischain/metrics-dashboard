const metric = {
  id: 'api_execution_circles_v2_group_size_distribution',
  name: 'Group Size Distribution',
  description: 'Groups bucketed by member count',
  metricDescription: `**Members per group.** A group's members are the addresses on its outgoing trust list (Circles v2 group-membership semantic). Each bar is the count of groups whose member count falls in that bucket.

Buckets: \`0\`, \`1–5\`, \`6–20\`, \`21–100\`, \`101–500\`, \`500+\`.`,
  chartType: 'bar',
  format: 'formatNumber',
  xField: 'bucket',
  yField: 'n_groups',
  query: `SELECT bucket, bucket_order, n_groups FROM dbt.api_execution_circles_v2_group_size_distribution ORDER BY bucket_order`,
};
export default metric;
