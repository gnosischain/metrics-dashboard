const metric = {
  id: 'p2p_geo_topology',
  name: 'P2P Geographic Network Topology',
  description: 'Geographic visualization of peer-to-peer network connections',
  format: 'formatNumber',
  chartType: 'map',
  
  // Map-specific configuration
  // Required fields for geographic coordinates
  peerLatField: 'peer_lat',
  peerLonField: 'peer_lon',
  neighborLatField: 'neighbor_lat',
  neighborLonField: 'neighbor_lon',
  
  // Optional fields for enhanced visualization
  valueField: 'cnt', // Connection count/strength
  labelField: 'peer_client', // For categorizing nodes by color
  
  // Optional ID fields (if not provided, lat_lon will be used as ID)
  peerIdField: 'peer_discovery_id_prefix',
  neighborIdField: 'neighbor_discovery_id_prefix',
  
  // Optional name fields for node labels
  peerNameField: 'peer_city',
  neighborNameField: 'neighbor_city',
  
  // Tooltip configuration - fields to show in tooltip
  peerTooltipFields: [
    { field: 'peer_country', label: 'Country' },
    { field: 'peer_org', label: 'Organization' },
    { field: 'peer_hostname', label: 'Hostname' }
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

  query: `
      SELECT

        date,
        peer_discovery_id_prefix,
        peer_cl_fork_name,
        peer_cl_next_fork_name,
        peer_client,
        peer_hostname,
        peer_city,
        peer_country,
        peer_org,
        splitByChar(',', peer_loc)[1] AS peer_lat,
        splitByChar(',', peer_loc)[2] AS peer_lon,
        neighbor_discovery_id_prefix,
        neighbor_cl_fork_name,
        neighbor_cl_next_fork_name,
        neighbor_client,
        neighbor_city,
        neighbor_country,
        neighbor_org,
        splitByChar(',', neighbor_loc)[1] AS neighbor_lat,
        splitByChar(',', neighbor_loc)[2] AS neighbor_lon,
        cnt
      FROM dbt.p2p_peers_geo_topology_latest
      WHERE 
        peer_loc != '' 
        AND neighbor_loc != ''
    `
};

export default metric;