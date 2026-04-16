const metric = {
  id: 'api_execution_gnosis_app_users_activity_weekly',
  name: 'User Activity',
  description: 'New / active / returning / reactivated',
  metricDescription: 'Breakdown of Gnosis App user activity: new onboardings, total active, retained (active in this period AND the previous), and reactivated (active now after a dormancy window). Toggle D / W / M for granularity.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  format: 'formatNumber',
  resolutions: ['daily', 'weekly', 'monthly'],
  defaultResolution: 'weekly',
  query: `
    SELECT toDate(week) AS date, 'New' AS label, new_users AS value
    FROM dbt.api_execution_gnosis_app_users_weekly
    UNION ALL SELECT toDate(week) AS date, 'Active' AS label, active_users AS value
    FROM dbt.api_execution_gnosis_app_users_weekly
    UNION ALL SELECT toDate(week) AS date, 'Returning' AS label, returning_users AS value
    FROM dbt.api_execution_gnosis_app_users_weekly
    UNION ALL SELECT toDate(week) AS date, 'Reactivated' AS label, reactivated_users AS value
    FROM dbt.api_execution_gnosis_app_users_weekly
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
