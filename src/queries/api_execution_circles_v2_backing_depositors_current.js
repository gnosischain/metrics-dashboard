const metric = {
  id: 'api_execution_circles_v2_backing_depositors_current',
  name: 'Depositors Leaderboard',
  description: 'Addresses that pledged backing collateral',
  chartType: 'table',
  query: `
    SELECT
      backer,
      toDate(first_initiated_at) AS first_initiated,
      toDate(last_event_at)      AS last_event,
      n_initiated,
      n_completed,
      n_released,
      n_distinct_assets
    FROM dbt.api_execution_circles_v2_backing_depositors_current
    ORDER BY first_initiated_at ASC
    LIMIT 200
  `,
};
export default metric;
