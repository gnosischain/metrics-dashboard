const metric = {
  id: 'sankey_gas_flow',
  name: 'Gas Usage Flow',
  description: 'Flow of gas consumption across different transaction types and contracts',
  format: {
    type: 'number',
    notation: 'compact',
    compactDisplay: 'short'
  },
  chartType: 'sankey',
  
  // Configuration object that matches the SankeyChart implementation
  config: {
    // Field mappings
    sourceField: 'tx_type',
    targetField: 'contract_category',
    valueField: 'total_gas',
    
    // Layout options
    nodeAlign: 'justify',
    
    // Visual customization from sankeyConfig
    sankeyConfig: {
      nodeWidth: 25,
      nodePadding: 12
    },
    
    // Enable cycle removal to prevent errors
    removeCycles: true,
    
    // Format for tooltips
    format: {
      type: 'number',
      notation: 'compact',
      compactDisplay: 'short',
      suffix: ' gas'
    }
  },
  
  query: `
    SELECT 'Legacy' AS tx_type, 'Uniswap' AS contract_category, 45000000 AS total_gas
    UNION ALL
    SELECT 'Legacy' AS tx_type, 'ERC20' AS contract_category, 32000000 AS total_gas
    UNION ALL
    SELECT 'EIP-1559' AS tx_type, 'Uniswap' AS contract_category, 78000000 AS total_gas
    UNION ALL
    SELECT 'EIP-1559' AS tx_type, 'Compound' AS contract_category, 56000000 AS total_gas
    UNION ALL
    SELECT 'EIP-1559' AS tx_type, 'ERC20' AS contract_category, 89000000 AS total_gas
    UNION ALL
    SELECT 'EIP-1559' AS tx_type, 'NFT' AS contract_category, 23000000 AS total_gas
    UNION ALL
    SELECT 'EIP-2930' AS tx_type, 'Aave' AS contract_category, 34000000 AS total_gas
    UNION ALL
    SELECT 'EIP-2930' AS tx_type, 'ERC20' AS contract_category, 28000000 AS total_gas
  `
};

export default metric;