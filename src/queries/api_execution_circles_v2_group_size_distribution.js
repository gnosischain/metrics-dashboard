const metric = {
  id: 'api_execution_circles_v2_group_size_distribution',
  name: 'Group Size Distribution',
  description: 'Groups bucketed by member count',
  metricDescription: `**Distribution of Circles v2 groups by member count.** A group's *members* are the distinct trustees on its outgoing trust list — the addresses the group avatar trusts (the Circles v2 group-membership semantic), from \`fct_execution_circles_v2_group_size_current\`. Every registered \`Group\` avatar is included, so groups with **0** members form their own bucket. Each bar is the number of groups whose current member count falls in that bucket (\`0\`, \`1–5\`, \`6–20\`, \`21–100\`, \`101–500\`, \`500+\`). This is a current snapshot, not a time series.`,
  chartType: 'bar',
  format: 'formatNumber',
  xField: 'bucket',
  yField: 'n_groups',
  preserveOrder: true,
  query: `SELECT substring(bucket, position(bucket, '. ') + 2) AS bucket, bucket_order, n_groups FROM dbt.api_execution_circles_v2_group_size_distribution ORDER BY bucket_order`,
};
export default metric;
