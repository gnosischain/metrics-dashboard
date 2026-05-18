const metric = {
  id: 'api_execution_gnosis_app_kpi_dau_latest',
  name: 'DAU',
  description: 'Yesterday',
  metricDescription: 'Daily Active Users — distinct Gnosis App users with any non-onboard activity yesterday.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs day before' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_dau_latest`,
};
export default metric;
