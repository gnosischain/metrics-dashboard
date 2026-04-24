const metric = {
  id: 'api_execution_cow_kpi_active_solvers',
  name: 'Active Solvers',
  description: 'On the allow-list now',
  metricDescription: 'Number of solvers currently active on the GPv2AllowListAuthentication contract. A solver is active if its latest event is SolverAdded (not removed).',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_execution_cow_kpi_active_solvers`,
};
export default metric;
