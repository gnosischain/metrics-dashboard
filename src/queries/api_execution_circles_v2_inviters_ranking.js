const metric = {
  id: 'api_execution_circles_v2_inviters_ranking',
  name: 'Top Inviters',
  description: 'Leaderboard of top inviters by humans invited',
  chartType: 'table',
  query: `
    SELECT
      rank,
      preview_image_url AS image,
      display_name,
      inviter,
      is_blacklisted,
      invite_count,
      toDate(first_invite_ts) AS first_invite,
      toDate(last_invite_ts)  AS last_invite
    FROM dbt.api_execution_circles_v2_inviters_ranking
    ORDER BY rank
    LIMIT 100
  `,
};
export default metric;
