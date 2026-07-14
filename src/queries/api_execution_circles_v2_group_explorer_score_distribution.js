const metric = {
  id: 'api_execution_circles_v2_group_explorer_score_distribution',
  name: 'Member Score Distribution',
  description: 'Members bucketed by on-chain trust score',
  metricDescription: `Distribution of the group's members across **trust-score buckets** (0-24, 25-49, 50-74, 75-99, 100-149, 150+). Each member is placed by their latest on-chain mint score under the \`OffchainScoreBasedMintPolicy\`. Only score-based groups populate this; other groups render empty. Buckets are shown in ascending score order.`,
  chartType: 'bar',
  globalFilterField: 'group_address',
  xField: 'label',
  yField: 'value',
  format: 'formatNumber',
  preserveOrder: true,
  query: `
    SELECT score_bucket AS label, n_members AS value
    FROM dbt.api_execution_circles_v2_group_score_distribution
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY bucket_rank
  `,
};
export default metric;
