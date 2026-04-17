const metric = {
  id: 'api_execution_gnosis_app_users_activity_daily',
  name: 'User Activity',
  description: 'New / active / returning / reactivated',
  metricDescription: 'Daily breakdown of Gnosis App user activity.',
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
    SELECT toDate(date) AS date, 'New' AS label, new_users AS value
    FROM dbt.api_execution_gnosis_app_users_daily
    UNION ALL SELECT toDate(date) AS date, 'Active' AS label, active_users AS value
    FROM dbt.api_execution_gnosis_app_users_daily
    UNION ALL SELECT toDate(date) AS date, 'Returning' AS label, returning_users AS value
    FROM dbt.api_execution_gnosis_app_users_daily
    UNION ALL SELECT toDate(date) AS date, 'Reactivated' AS label, reactivated_users AS value
    FROM dbt.api_execution_gnosis_app_users_daily
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
