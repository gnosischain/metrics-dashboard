const metric = {
  id: 'api_execution_gnosis_app_swaps_by_pair_weekly',
  name: 'Swaps by Pair',
  description: 'Weekly — token pair breakdown',
  metricDescription: 'Weekly CoW swap counts broken down by token pair (sold → bought). Top-N pairs by total volume.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  xField: 'date',
  yField: 'n_swaps',
  seriesField: 'label',
  format: 'formatNumber',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  query: `
    WITH top_pairs AS (
      SELECT pair
      FROM dbt.api_execution_gnosis_app_swaps_by_pair_daily
      GROUP BY pair
      ORDER BY sum(n_swaps) DESC
      LIMIT 10
    )
    SELECT toStartOfWeek(date, 1) AS date, pair AS label, sum(n_swaps) AS n_swaps
    FROM dbt.api_execution_gnosis_app_swaps_by_pair_daily
    WHERE pair IN (SELECT pair FROM top_pairs)
    GROUP BY date, label
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
