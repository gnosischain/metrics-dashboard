const metric = {
  id: 'api_governance_forum_activity_weekly',
  name: 'Forum Activity',
  description: 'Weekly',
  metricDescription: 'Weekly forum.gnosis.io activity: topics created, posts created, active users, and likes given. Counts cover public, non-deleted, human-visible content only (the canonical eligibility contract applied in the underlying model).',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  query: `
    SELECT
      date,
      multiIf(
        metric = 'topics_created', 'Topics created',
        metric = 'posts_created', 'Posts created',
        metric = 'active_users', 'Active users',
        metric = 'likes_given', 'Likes given',
        metric
      ) AS series,
      value
    FROM dbt.api_governance_forum_activity_weekly
    WHERE metric IN ('topics_created', 'posts_created', 'active_users', 'likes_given')
    ORDER BY date, series
  `,
};
export default metric;
