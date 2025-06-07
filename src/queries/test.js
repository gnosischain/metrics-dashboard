// Test metric for the zoomable sunburst chart
const metric = {
    id: 'test',
    name: 'Validator Client Distribution',
    description: 'Zoomable sunburst showing client versions - click to zoom in/out',
    chartType: 'sunburst',
    format: 'formatNumber',
    
    d3Config: {
      // Data field mappings
      sequenceField: 'sequence',
      valueField: 'value',
      
      // Visual configuration
      animationDuration: 750,  // Observable default
      enableZoom: true,
    
    },
    
    // Flat sequence data that creates a good hierarchy for zooming
    query: `
      SELECT 
        CONCAT(client,' → ',IF(version='', 'Unknown',version)) AS sequence
        ,value
    FROM execution_blocks_clients_version_daily
    WHERE date = today() - INTERVAL 1 DAY AND client != 'Unknown'
      
      ORDER BY count DESC
    `
  };
  
  export default metric;