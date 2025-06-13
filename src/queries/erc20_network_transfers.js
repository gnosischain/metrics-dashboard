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
  
  // Network configuration with stabilization
  networkConfig: {
    // Node configuration
    nodeRadius: 8,
    minNodeSize: 8,
    maxNodeSize: 40,
    
    // Force layout parameters - adjusted for responsiveness
    linkDistance: 120,        // Moderate spacing
    chargeStrength: 400,      // Moderate repulsion
    centerStrength: 0.05,     // Light centering
    
    // Stabilization settings
    stabilizationTime: 3000,  // Stop after 3 seconds
    
    // Interaction
    enableDrag: true,
    enableZoom: true,
    showLabels: false,        // Turn off labels for cleaner look
    clusterByGroup: true,     // Cluster nodes by token type
    
    // Temporal edge coloring configuration
    linkColorByDate: true,
    linkColorDateRange: ['#4dabf7', '#e03131'], // Blue (old) to Red (recent)
    linkThicknessScale: 1.5,  // Scale up thickness for better visibility
    minLinkThickness: 1,
    maxLinkThickness: 8,
    
    // Visual improvements
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