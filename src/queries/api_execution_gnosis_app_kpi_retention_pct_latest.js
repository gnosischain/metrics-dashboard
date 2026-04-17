const metric = {
  id: 'api_execution_gnosis_app_kpi_retention_pct_latest',
  name: 'M1 Retention',
  description: 'Latest cohort',
  metricDescription: 'Percentage of users in the most recent complete cohort who were still active in month + 1.',
  chartType: 'numberDisplay',
  format: 'formatPercent',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_retention_pct_latest`,
};
export default metric;
