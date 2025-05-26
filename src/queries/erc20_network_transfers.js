const metric = {
    id: 'erc20_network_transfers',
    name: 'ERC20 Transfer Network',
    description: 'Network visualization of ERC20 token transfers with temporal edge coloring',
    format: 'formatNumber',
    chartType: 'network',
    
    // Network-specific field mappings for your data structure
    sourceIdField: 'from',
    sourceNameField: 'from',
    sourceGroupField: 'token_address', // Group by token for node coloring
    targetIdField: 'to',
    targetNameField: 'to',
    targetGroupField: 'token_address',
    valueField: 'value',
    dateField: 'date', // For temporal edge coloring
    
    // Network configuration with temporal features
    networkConfig: {
      nodeRadius: 8,
      linkDistance: 120,
      chargeStrength: -600,
      centerStrength: 0.1,
      enableDrag: true,
      enableZoom: true,
      showLabels: false, // Turn off labels for cleaner look with many nodes
      clusterByGroup: true, // Cluster nodes by token type
      
      // Temporal edge coloring configuration
      linkColorByDate: true,
      linkColorDateRange: ['#4dabf7', '#e03131'], // Blue (old) to Red (recent)
      linkThicknessScale: 1.5, // Scale up thickness for better visibility
      minLinkThickness: 1,
      maxLinkThickness: 8,
      
      // Animation and interaction
      enableTemporalAnimation: false, // Could be extended later
      highlightConnectedNodes: true
    },
    
    // Your query with the network-specific data structure
    query: `
      SELECT
        date,
        from,
        to,
        token_address,
        value
      FROM (
        SELECT
          toStartOfDay(block_timestamp) AS date,
          from,
          to,
          token_address,
          SUM(toUInt256OrNull(value)/POWER(10,18)) AS value
        FROM dbt.transfers_erc20_bluechips
        WHERE block_timestamp >= DATE '2025-05-20'
        GROUP BY 1, 2, 3, 4
      )
      WHERE value > 1000
      ORDER BY date ASC, value DESC
    `
  };
  
  export default metric;