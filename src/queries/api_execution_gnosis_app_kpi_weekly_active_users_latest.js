const metric = {
  id: 'api_execution_gnosis_app_kpi_weekly_active_users_latest',
  name: 'WAU',
  description: 'Latest week',
  metricDescription: 'Weekly Active Users — distinct Gnosis App users with any composite activity (Circles avatar / Cometh swap / Gnosis App action) in the latest complete week. Non-blacklisted only.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior week' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_weekly_active_users_latest`,
};
export default metric;
