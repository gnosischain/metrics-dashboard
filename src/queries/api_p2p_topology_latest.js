const metric = {
  id: 'api_p2p_topology_latest',
  name: 'P2P Geographic Network Topology',
  description: 'Geographic visualization of peer-to-peer network connections',
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
  lineOpacity: 0.2,
  
  // Animation toggle
  enableAnimation: false, // Set to true to enable animated connection trails
  
  // Custom color palette (optional)
  colors: [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#ff9845'
  ],

  query: `SELECT *FROM dbt.api_p2p_topology_latest`
};

export default metric;