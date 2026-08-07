const metric = {
  id: 'api_governance_forum_activity_weekly',
  name: 'Forum activity',
  description: 'Topics, posts, and active users per week',
  metricDescription: `Weekly Discourse activity for the GnosisDAO forum: topics created,
posts created, and active users. Complements Snapshot vote activity — most deliberation
happens here before a ballot opens.

Source: \`dbt.api_governance_forum_activity_weekly\`.`,
  chartType: 'line',
  format: 'formatNumber',
  yField: 'value',
  seriesField: 'label',
  isTimeSeries: true,
  enableZoom: true,
  timeRanges: true,
  query: `
    SELECT
      date,
      multiIf(
        metric = 'topics_created', 'Topics created',
        metric = 'posts_created', 'Posts created',
        metric = 'active_users', 'Active users',
        metric
      ) AS label,
      toFloat64(value) AS value
    FROM dbt.api_governance_forum_activity_weekly
    WHERE date BETWEEN '{from}' AND '{to}'
    ORDER BY date, label
  `,
};

export default metric;
