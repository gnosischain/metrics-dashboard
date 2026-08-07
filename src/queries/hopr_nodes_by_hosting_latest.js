const metric = {
  id: 'hopr_nodes_by_hosting_latest',
  name: 'Nodes by hosting provider',
  description: 'Who actually runs the machines, and how many hosts they represent',
  metricDescription: `Announced HOPR nodes grouped by the provider hosting them, with the number of
distinct machines beside it.

Read the two series together. **Nodes** counts node processes; **Hosts** counts distinct IPs. Where
nodes greatly exceeds hosts, many nodes are sharing a machine — which is what a raw node count
hides when it is offered as evidence of decentralisation.

Three buckets are not providers and are shown anyway:
- \`Unknown\` — the provider classifier matched no rule. This does **not** mean residential; it means
  undetermined, and folding it into either side of a home-vs-datacenter split would be a guess.
- \`NO_IPV4\` — the node never announced an IPv4 address.
- \`UNRESOLVED\` — it has one, but no geo/ASN lookup exists for it yet.

Source: \`dbt.api_hopr_nodes_hosting_latest\`.`,
  chartType: 'bar',
  xField: 'provider',
  yField: 'value',
  seriesField: 'label',
  // The chart re-sorts categories itself, so the query's ORDER BY only decides which 20
  // providers are selected, not the order they are drawn in.
  categorySort: 'absNetDesc',
  isTimeSeries: false,
  format: 'formatNumber',
  colors: ['#3E6957', '#C9B037'],
  // Hosts are a subset of nodes, so the two must sit side by side. A multi-series bar
  // stacks itself unless told not to, and stacking these would double-count machines.
  stacked: false,
  query: `
    WITH by_provider AS (
      SELECT
        hosting_provider             AS provider,
        toInt64(sum(nodes))          AS nodes,
        toInt64(sum(distinct_hosts)) AS hosts
      FROM dbt.api_hopr_nodes_hosting_latest
      GROUP BY provider
      ORDER BY nodes DESC
      LIMIT 20
    )
    -- One row per series, not one column per series: the chart maps a single value column
    -- plus a label. seq only orders the series so colors[] lands on the intended bar.
    SELECT provider, label, value
    FROM (
      SELECT provider, 'Nodes' AS label, nodes AS value, nodes AS rank, 1 AS seq FROM by_provider
      UNION ALL
      SELECT provider, 'Hosts' AS label, hosts AS value, nodes AS rank, 2 AS seq FROM by_provider
    )
    ORDER BY rank DESC, seq
  `
};

export default metric;
