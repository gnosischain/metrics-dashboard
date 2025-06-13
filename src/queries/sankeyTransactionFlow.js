const metric = {
  id: 'sankey_transaction_flow',
  name: 'Transaction Flow Analysis',
  description: 'Flow of transactions between different contract types and services',
  format: 'formatNumber',
  chartType: 'sankey',
  
  // Field mappings at root level (for backwards compatibility)
  sourceField: 'source',
  targetField: 'target', 
  valueField: 'total_value',
  
  // Visual configuration
  sankeyConfig: {
    nodeWidth: 20,
    nodePadding: 15
  },
  
  // Additional configuration options
  removeCycles: true,
  allowCycles: false,
  nodeAlign: 'justify',
  
  query: `
    SELECT 'DEX' AS source, 'Lending' AS target, 1500 AS total_value
    UNION ALL
    SELECT 'EOA' AS source, 'DEX' AS target, 2300 AS total_value
    UNION ALL
    SELECT 'EOA' AS source, 'Lending' AS target, 800 AS total_value
    UNION ALL
    SELECT 'Bridge' AS source, 'DEX' AS target, 1200 AS total_value
    UNION ALL
    SELECT 'Lending' AS source, 'EOA' AS target, 900 AS total_value
    UNION ALL
    SELECT 'DEX' AS source, 'EOA' AS target, 1800 AS total_value
  `
};

export default metric;