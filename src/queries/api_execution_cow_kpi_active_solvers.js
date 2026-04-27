const metric = {
  id: 'api_execution_cow_kpi_active_solvers',
  name: 'Active Solvers',
  description: 'Settled batches in last 7 days',
  metricDescription: 'Number of distinct solvers that settled at least one batch in the last 7 complete days. Reflects who is actually competing for batches, not just who is allow-listed.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_cow_kpi_active_solvers`,
};
export default metric;
