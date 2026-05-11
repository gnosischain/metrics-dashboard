const metric = {
  id: 'api_execution_gnosis_app_kpi_weekly_economically_active_users_latest',
  name: 'WEAU',
  description: 'Latest week',
  metricDescription: 'Weekly Economically Active Users — addresses that were active AND earned ≥1 gCRC cashback or ≥1 CRC inviter fee in the latest complete week. Non-blacklisted only.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior week' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_weekly_economically_active_users_latest`,
};
export default metric;
