const metric = {
  id: 'hopr_kpi_distinct_hosts',
  name: 'Distinct hosts',
  description: 'dufour, current',
  chartType: 'numberDisplay',
  variant: 'compact',
  valueField: 'value',
  format: 'formatNumberCompact',
  metricDescription: `Distinct IP addresses across all announced HOPR nodes.

Nodes routinely share a machine, so this sits well below the node count — the ratio between them is how much a node count overstates the number of physical hosts. Nodes that never announced an IPv4 contribute nothing here, so treat this as a lower bound.`,
  query: `
    SELECT sum(distinct_hosts) AS value
    FROM dbt.api_hopr_nodes_hosting_latest
    -- dufour, so every card on this tab counts the same population as the chart below it.
    -- jura's nodes appear on the Geography and Economics tabs.
    WHERE network = 'dufour'
  `,
};

export default metric;
