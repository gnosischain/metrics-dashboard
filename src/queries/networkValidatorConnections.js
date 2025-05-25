const metric = {
    id: 'network_validator_connections',
    name: 'Validator Network Topology',
    description: 'Network connections and relationships between validators',
    format: 'formatNumber',
    chartType: 'network',
    
    // Network-specific field mappings
    sourceIdField: 'source_id',
    sourceNameField: 'source_name', 
    sourceGroupField: 'source_client',
    targetIdField: 'target_id',
    targetNameField: 'target_name',
    targetGroupField: 'target_client',
    valueField: 'connection_strength',
    calculateNodeSize: true,
    
    networkConfig: {
      nodeRadius: 8,
      linkDistance: 80,
      chargeStrength: -400,
      enableDrag: true,
      enableZoom: true,
      showLabels: true,
      clusterByGroup: true
    },
    
    query: `
      SELECT 'val_1' AS source_id, 'Lighthouse-1' AS source_name, 'Lighthouse' AS source_client,
             'val_2' AS target_id, 'Teku-1' AS target_name, 'Teku' AS target_client,
             15 AS connection_strength
      UNION ALL
      SELECT 'val_1' AS source_id, 'Lighthouse-1' AS source_name, 'Lighthouse' AS source_client,
             'val_3' AS target_id, 'Prysm-1' AS target_name, 'Prysm' AS target_client,
             12 AS connection_strength
      UNION ALL
      SELECT 'val_2' AS source_id, 'Teku-1' AS source_name, 'Teku' AS source_client,
             'val_3' AS target_id, 'Prysm-1' AS target_name, 'Prysm' AS target_client,
             18 AS connection_strength
      UNION ALL
      SELECT 'val_2' AS source_id, 'Teku-1' AS source_name, 'Teku' AS source_client,
             'val_4' AS target_id, 'Nimbus-1' AS target_name, 'Nimbus' AS target_client,
             8 AS connection_strength
      UNION ALL
      SELECT 'val_3' AS source_id, 'Prysm-1' AS source_name, 'Prysm' AS source_client,
             'val_4' AS target_id, 'Nimbus-1' AS target_name, 'Nimbus' AS target_client,
             22 AS connection_strength
      UNION ALL
      SELECT 'val_4' AS source_id, 'Nimbus-1' AS source_name, 'Nimbus' AS source_client,
             'val_5' AS target_id, 'Lighthouse-2' AS target_name, 'Lighthouse' AS target_client,
             14 AS connection_strength
      UNION ALL
      SELECT 'val_1' AS source_id, 'Lighthouse-1' AS source_name, 'Lighthouse' AS source_client,
             'val_5' AS target_id, 'Lighthouse-2' AS target_name, 'Lighthouse' AS target_client,
             25 AS connection_strength
    `
  };
  
  export default metric;