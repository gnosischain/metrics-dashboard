const metric = {
  id: 'api_execution_gnosis_app_kpi_total_users',
  name: 'Total Users',
  description: 'Lifetime',
  metricDescription: 'Distinct addresses that have ever acted through the Gnosis App bundler path. Derived from the heuristic-based user registry.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_total_users`,
};
export default metric;
