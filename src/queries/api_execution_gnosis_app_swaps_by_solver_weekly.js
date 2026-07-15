const metric = {
  id: 'api_execution_gnosis_app_swaps_by_solver_weekly',
  name: 'Swaps by Solver',
  description: 'Weekly filled trades by solver',
  metricDescription: `Weekly count of **filled** CoW Protocol swaps broken down by the settling **solver**, on Monday-started weeks, showing the top 10 solvers by total filled swaps. A swap is attributed to the Gnosis App when its CoW \`PreSignature\` was relayed by an active Cometh ERC-4337 bundler for a known Gnosis App user; only filled orders (\`was_filled = 1\`) are counted, and \`solver\` is the CoW solver address that settled the order. Since 2025-11-12; the current incomplete week is excluded. Unit: swap count.`,
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
      AND date < toStartOfWeek(today(), 1)
    GROUP BY date, label
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
