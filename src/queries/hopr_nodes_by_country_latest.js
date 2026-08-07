const metric = {
  id: 'hopr_nodes_by_country_latest',
  name: 'Nodes by country',
  description: 'Announced nodes per country, including those whose location is unknown',
  metricDescription: `Announced HOPR nodes grouped by the country their IP resolves to, across both
networks.

\`UNKNOWN\` is a real bar, not a rounding error: it holds nodes that announced a dns4/ip6 address,
never announced one, or whose IP has not been enriched yet. It is kept visible because dropping it
would quietly shrink the denominator of every share read off this chart.

Source: \`dbt.api_hopr_nodes_by_country_latest\`.`,
  chartType: 'bar',
  xField: 'country',
  yField: 'value',
  seriesName: 'Nodes',
  // The chart re-sorts categories itself, so the query's ORDER BY only decides which 25
  // countries are selected, not the order they are drawn in.
  categorySort: 'absNetDesc',
  isTimeSeries: false,
  format: 'formatNumber',
  query: `
    SELECT
      country_code AS country,
      toInt64(sum(nodes)) AS value
    FROM dbt.api_hopr_nodes_by_country_latest
    GROUP BY country
    ORDER BY value DESC
    LIMIT 25
  `
};

export default metric;
