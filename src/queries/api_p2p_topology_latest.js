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
    '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#3B82F6', '#EC4899', '#14B8A6', '#F97316', '#0EA5E9'
  ],

  query: `SELECT *FROM dbt.api_p2p_topology_latest`
};

export default metric;
