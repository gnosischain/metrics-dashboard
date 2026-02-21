const metric = {
  id: 'api_p2p_topology_latest',
  name: 'P2P Geographic Network Topology',
  description: 'Geographic visualization of peer-to-peer network connections',
  metricDescription: `
  # Crawl Details
  ___
  _All crawl data is filtered for Gnosis Network_

  #### Legend

  - **Node** - a peer (identified by its node ID / ENR).
  - **Link** - “seen-as-neighbors” during a crawl
  - **Thickness** - persistence/frequency across crawls: thicker means those two IDs are often adjacent in the routing tables.

  #### Reading the links correctly

  - **Geo-IP is fuzzy** (NAT, VPNs, clouds; city-level can be off). Don’t over-interpret exact cities or countries.
  - **Crawler bias**: seed lists, query schedule, and crawler location influence which buckets one hit most.
  `,
  chartType: 'map',

  enableFiltering: true,
  labelField: 'protocol', // This will create a dropdown to filter by network type
  
  
  // Map-specific configuration
  // Required fields for geographic coordinates
  peerLatField: 'peer_lat',
  peerLonField: 'peer_lon',
  neighborLatField: 'neighbor_lat',
  neighborLonField: 'neighbor_lon',
  
  // Optional fields for enhanced visualization
  valueField: 'cnt', // Connection count/strength
  categoryField: 'peer_client', // For categorizing nodes by color (separate from filtering)
  
//  labelField: 'peer_client', // For categorizing nodes by color
  
  // Optional ID fields (if not provided, lat_lon will be used as ID)
  peerIdField: 'peer_discovery_id_prefix',
  neighborIdField: 'neighbor_discovery_id_prefix',
  
  // Optional name fields for node labels
  peerNameField: 'peer_city',
  neighborNameField: 'neighbor_city',
  
  // Tooltip configuration - fields to show in tooltip
  peerTooltipFields: [
    { field: 'peer_country', label: 'Country' },
    { field: 'peer_org', label: 'Organization' }
  ],
  neighborTooltipFields: [
    { field: 'neighbor_country', label: 'Country' },
    { field: 'neighbor_org', label: 'Organization' }
  ],
  
  // Visual customization
  nodeMinSize: 8,
  nodeMaxSize: 35,
  lineMinWidth: 0.5,
  lineMaxWidth: 5,
  lineOpacity: 0.22,
  lineColorLight: '#6EE7B7',
  lineColorDark: '#86EFAC',
  
  // Animation toggle
  enableAnimation: false, // Set to true to enable animated connection trails
  
  // Custom color palette (optional)
  colors: [
    '#0072B2', '#009E73', '#E69F00', '#D55E00',
    '#CC79A7', '#56B4E9', '#F0E442', '#94A3B8'
  ],
  mapBackgroundColor: '#FFFFFF',
  mapAreaColor: '#DCE6F2',
  mapBorderColor: '#8EA6C2',
  mapEmphasisColor: '#C8D9ED',
  mapBackgroundColorDark: '#0B1220',
  mapAreaColorDark: '#1F2A3D',
  mapBorderColorDark: '#5B6B84',
  mapEmphasisColorDark: '#2B3D59',
  mapRoam: false,
  legendType: 'scroll',
  legendOrient: 'vertical',
  legendLeft: 12,
  legendTop: 12,
  legendWidth: 132,
  legendHeight: '58%',
  legendItemWidth: 9,
  legendItemHeight: 9,
  legendItemGap: 8,
  legendFontSize: 11,
  legendPadding: [8, 8, 8, 8],
  mapLayoutCenter: ['50%', '52%'],
  mapLayoutSize: '114%',

  query: `SELECT *FROM dbt.api_p2p_topology_latest`
};

export default metric;
