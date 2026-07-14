const metric = {
  id: 'api_execution_gnosis_app_swaps_by_pair_weekly',
  name: 'Swaps by Pair',
  description: 'Weekly — token pair breakdown',
  metricDescription: `Weekly count of **filled** CoW Protocol swaps broken down by token pair (\`sold → bought\`), on Monday-started weeks, showing the top 10 pairs by total filled-swap count. A swap is attributed to the Gnosis App when its CoW \`PreSignature\` was relayed by an active Cometh ERC-4337 bundler for a known Gnosis App user; only filled orders (those that produced at least one on-chain \`Trade\` fill) are included, since unfilled orders have no traded tokens. Pair labels use token symbols, with Circles v2 ERC-20 wrapper tokens resolved to their underlying \`CRC\` symbol (unknown tokens shown as \`?\`). Since 2025-11-12; unit: swap count.`,
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
