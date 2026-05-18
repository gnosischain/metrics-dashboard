const metric = {
  id: 'api_execution_gnosis_app_kpi_mau_latest',
  name: 'MAU',
  description: 'Latest month',
  metricDescription: 'Monthly Active Users — distinct Gnosis App users with any non-onboard activity in the latest complete month.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior month' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_mau_latest`,
};
export default metric;
