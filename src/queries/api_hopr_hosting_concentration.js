const metric = {
  id: 'api_hopr_hosting_concentration',
  name: 'Dufour Hosting Concentration',
  description: '% of nodes per hosting class',
  metricDescription: 'Share of dufour nodes per hosting classification — percent of total, deliberately not a stack. The sentinels UNRESOLVED / NO_IPV4 / Unknown dominate (~90%); named providers are the small resolved minority, so this is a decentralization read over the resolved subset only.',
  chartType: 'bar',
  isTimeSeries: false,
  horizontal: true,
  preserveOrder: true,
  format: 'formatPercentageInt',
  xField: 'label',
  yField: 'value',
  query: `
    SELECT label, round(v / sum(v) OVER () * 100, 1) AS value
    FROM (
      SELECT ifNull(hosting_provider, 'UNRESOLVED') AS label, toFloat64(sum(nodes)) AS v
      FROM dbt.api_hopr_nodes_hosting_latest
      WHERE network = 'dufour'
      GROUP BY hosting_provider
    )
    ORDER BY value DESC
  `,
};
export default metric;
