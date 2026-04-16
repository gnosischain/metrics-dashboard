const metric = {
  id: 'api_execution_gnosis_app_swaps_by_solver_weekly',
  name: 'Swaps by Solver',
  description: 'Weekly filled trades by solver',
  metricDescription: 'Weekly filled CoW swap count broken down by solver (top 10).',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  xField: 'date',
  yField: 'n_swaps_filled',
  seriesField: 'label',
  format: 'formatNumber',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  query: `
    WITH top_solvers AS (
      SELECT solver
      FROM dbt.api_execution_gnosis_app_swaps_by_solver_daily
      GROUP BY solver
      ORDER BY sum(n_swaps_filled) DESC
      LIMIT 10
    )
    SELECT toStartOfWeek(date, 1) AS date, solver AS label, sum(n_swaps_filled) AS n_swaps_filled
    FROM dbt.api_execution_gnosis_app_swaps_by_solver_daily
    WHERE solver IN (SELECT solver FROM top_solvers)
    GROUP BY date, label
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
