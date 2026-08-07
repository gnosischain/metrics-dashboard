const metric = {
  id: 'hopr_node_map_latest',
  name: 'Where HOPR nodes are',
  description: 'Announced nodes by city, sized by node count and coloured by host',
  metricDescription: `Every announced HOPR node whose IP resolved to a location, aggregated to its
city and coloured by the provider that hosts most of the nodes there.

**This map is deliberately incomplete.** A node with no resolvable IPv4 cannot be plotted, so it
is absent here — the "Nodes by country" card beside it keeps those in an explicit \`UNKNOWN\`
bar. Read the two together; the map alone under-counts the network.

Coordinates are the **city centroid ipinfo reports, not the machine**. Every node in a city
collapses to one point. IP geolocation does not locate a host more precisely than that, and
treating a point as a node's whereabouts would over-read it.

Source: \`dbt.api_hopr_node_locations_latest\`.`,
  chartType: 'map',
  peerLatField: 'latitude',
  peerLonField: 'longitude',
  peerIdField: 'city',
  peerNameField: 'city',
  valueField: 'nodes',
  categoryField: 'top_hosting_provider',
  peerTooltipFields: ['country_code', 'nodes', 'live_nodes', 'distinct_hosts', 'top_hosting_provider'],
  nodeMinSize: 6,
  nodeMaxSize: 34,
  format: 'formatNumber',
  // Land/ocean/border contrast modelled on the P2P topology map. Borders are a
  // touch stronger than P2P because this chart has no connection mesh to help
  // the eye read continents — only city dots on the fill.
  mapBackgroundColor: '#FFFFFF',
  mapAreaColor: '#DCE6F2',
  mapBorderColor: '#8EA6C2',
  mapEmphasisColor: '#C8D9ED',
  mapBackgroundColorDark: '#0B1220',
  mapAreaColorDark: '#243247',
  mapBorderColorDark: '#7B8BA4',
  mapEmphasisColorDark: '#334863',
  query: `
    SELECT
      city,
      country_code,
      latitude,
      longitude,
      toInt64(sum(nodes))          AS nodes,
      toInt64(sum(live_nodes))     AS live_nodes,
      toInt64(sum(distinct_hosts)) AS distinct_hosts,
      any(top_hosting_provider)    AS top_hosting_provider
    FROM dbt.api_hopr_node_locations_latest
    GROUP BY city, country_code, latitude, longitude
    ORDER BY nodes DESC
  `
};

export default metric;
