const metric = {
  id: 'api_execution_gnosis_app_kpi_churn_rate_latest',
  name: 'Churn Rate',
  description: 'Latest month',
  metricDescription: 'Share of users active in the latest month who did not return the following month (Any-activity scope).',
  chartType: 'numberDisplay',
  format: 'formatPercent',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_churn_rate_latest`,
};
export default metric;
