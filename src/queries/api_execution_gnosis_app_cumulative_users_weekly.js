const metric = {
  id: 'api_execution_gnosis_app_cumulative_users_weekly',
  name: 'Cumulative Users',
  description: 'Weekly',
  metricDescription: 'Running total of distinct Gnosis App users onboarded up to the end of each week.',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  format: 'formatNumber',
  query: `
    SELECT toDate(week) AS date, cumulative_users AS value
    FROM dbt.api_execution_gnosis_app_users_weekly
    ORDER BY date ASC
  `,
};
export default metric;
