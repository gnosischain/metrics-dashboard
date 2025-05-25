const metric = {
    id: 'network_client_distribution', 
    name: 'Client Network Graph',
    description: 'Network visualization of client implementations and their connections',
    format: 'formatNumber',
    chartType: 'network',
    
    // Network-specific field mappings
    sourceIdField: 'client_1',
    sourceNameField: 'client_1',
    sourceGroupField: 'client_1_type',
    targetIdField: 'client_2', 
    targetNameField: 'client_2',
    targetGroupField: 'client_2_type',
    valueField: 'peer_count',
    calculateNodeSize: true,
    
    networkConfig: {
      nodeRadius: 12,
      linkDistance: 100,
      chargeStrength: -500,
      enableDrag: true,
      enableZoom: true, 
      showLabels: true,
      clusterByGroup: false
    },
    
    query: `
      SELECT 'Lighthouse' AS client_1, 'Lighthouse' AS client_1_name, 'consensus' AS client_1_type,
             'Teku' AS client_2, 'Teku' AS client_2_name, 'consensus' AS client_2_type,
             45 AS peer_count
      UNION ALL
      SELECT 'Lighthouse' AS client_1, 'Lighthouse' AS client_1_name, 'consensus' AS client_1_type,
             'Prysm' AS client_2, 'Prysm' AS client_2_name, 'consensus' AS client_2_type,
             32 AS peer_count
      UNION ALL
      SELECT 'Teku' AS client_1, 'Teku' AS client_1_name, 'consensus' AS client_1_type,
             'Prysm' AS client_2, 'Prysm' AS client_2_name, 'consensus' AS client_2_type,
             28 AS peer_count
      UNION ALL
      SELECT 'Prysm' AS client_1, 'Prysm' AS client_1_name, 'consensus' AS client_1_type,
             'Nimbus' AS client_2, 'Nimbus' AS client_2_name, 'consensus' AS client_2_type,
             15 AS peer_count
      UNION ALL
      SELECT 'Nimbus' AS client_1, 'Nimbus' AS client_1_name, 'consensus' AS client_1_type,
             'Lodestar' AS client_2, 'Lodestar' AS client_2_name, 'consensus' AS client_2_type,
             12 AS peer_count
      UNION ALL
      SELECT 'Lodestar' AS client_1, 'Lodestar' AS client_1_name, 'consensus' AS client_1_type,
             'Lighthouse' AS client_2, 'Lighthouse' AS client_2_name, 'consensus' AS client_2_type,
             38 AS peer_count
      UNION ALL
      SELECT 'Teku' AS client_1, 'Teku' AS client_1_name, 'consensus' AS client_1_type,
             'Nimbus' AS client_2, 'Nimbus' AS client_2_name, 'consensus' AS client_2_type,
             22 AS peer_count
    `
  };
  
  export default metric;