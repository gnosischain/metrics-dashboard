const metric = {
  id: 'api_execution_gnosis_app_users_activity_monthly',
  name: 'User Activity',
  description: 'New / active / returning / reactivated',
  metricDescription: 'Monthly breakdown of Gnosis App user activity.',
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
    SELECT toDate(month) AS date, 'New' AS label, new_users AS value
    FROM dbt.api_execution_gnosis_app_users_monthly
    UNION ALL SELECT toDate(month) AS date, 'Active' AS label, active_users AS value
    FROM dbt.api_execution_gnosis_app_users_monthly
    UNION ALL SELECT toDate(month) AS date, 'Returning' AS label, returning_users AS value
    FROM dbt.api_execution_gnosis_app_users_monthly
    UNION ALL SELECT toDate(month) AS date, 'Reactivated' AS label, reactivated_users AS value
    FROM dbt.api_execution_gnosis_app_users_monthly
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
