const metric = {
    id: 'p2p_geo_topology',
    name: 'P2P Geographic Network Topology',
    description: 'Geographic visualization of peer-to-peer network connections the past day',
    format: 'formatNumber',
    chartType: 'geoNetwork',
    
    // Geographic network configuration
    networkConfig: {
      // Source node field mappings
      sourceIdField: 'peer_discovery_id_prefix',
      sourceLatField: 'peer_lat',           // Use separate lat field
      sourceLonField: 'peer_lon',           // Use separate lon field
      sourceLocationField: 'peer_loc',      // Fallback combined field
      sourceNameField: 'peer_hostname',
      sourceCityField: 'peer_city',
      sourceCountryField: 'peer_country',
      sourceGroupField: 'peer_client',         // For node coloring by organization
      
      // Target node field mappings
      targetIdField: 'neighbor_discovery_id_prefix',
      targetLatField: 'neighbor_lat',       // Use separate lat field
      targetLonField: 'neighbor_lon',       // Use separate lon field
      targetLocationField: 'neighbor_loc',  // Fallback combined field
      targetNameField: 'neighbor_ip',        // Using IP as name since hostname might not exist
      targetCityField: 'neighbor_city',
      targetCountryField: 'neighbor_country',
      targetGroupField: 'neighbor_client',
      
      // Edge configuration
      valueField: 'cnt', // Connection count for edge thickness
      directed: true, // Show directional arrows from peer to neighbor
      
      // Visual styling
      minNodeRadius: 2,
      maxNodeRadius: 4,
      nodeOpacity: 0.8,
      
      // Thin but visible edges to avoid clutter
      minEdgeWidth: 0.2,
      maxEdgeWidth: 1.5,
      edgeOpacity: 0.01,
      
      // Other settings for dense networks
      linkOpacity: 0.3,       

      nodeStroke: 'transparent',    // Invisible borders
      nodeStrokeWidth: 0.1,           // Or set width to 0
      
      // Location parsing
      locationSeparator: ',', // For parsing 'lat,lon' format
      
      // Map configuration
      mapProjection: 'geoNaturalEarth1', // Natural Earth projection
      mapScale: 180,
      mapCenter: [0, 20], // Slight northward center
      
      // Interaction
      enableZoom: true,
      enablePan: true
    },
    
    // Query - using the data structure you already have
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