const metric = {
    id: 'node_status_table',
    name: 'Node Status Table',
    description: 'Network nodes status overview',
    chartType: 'table',
    minimal: true,
    
    tableConfig: {
      layout: 'fitColumns',
      pagination: true, // Enable pagination
      paginationSize: 6, // Show 6 rows per page
      paginationSizeSelector: [5, 10, 15, 20], // Options for rows per page
      responsiveLayout: 'collapse',
      autoResize: true,
      height: 'auto',
      
      // DISABLE header filters (search boxes)
      enableFiltering: false, // This will disable all header filters
      
      // Optimize pagination display
      renderVerticalBuffer: 0,
      paginationButtonCount: 5, // Show page numbers
      
      // Custom column definitions to ensure no filters
      columns: [
        {
          title: "Node ID",
          field: "node_id",
          width: 120,
          sorter: "string",
          headerFilter: false // Explicitly disable filter for this column
        },
        {
          title: "Country",
          field: "country",
          width: 150,
          sorter: "string",
          headerFilter: false // Explicitly disable filter for this column
        },
        {
          title: "Client",
          field: "client",
          width: 130,
          sorter: "string",
          headerFilter: false // Explicitly disable filter for this column
        },
        {
          title: "Peer Count",
          field: "peer_count",
          width: 120,
          sorter: "number",
          headerFilter: false, // Explicitly disable filter for this column
          formatter: "plaintext" // Simple number formatting
        },
        {
          title: "Status",
          field: "status",
          width: 100,
          sorter: "string",
          headerFilter: false, // Explicitly disable filter for this column
          formatter: function(cell) {
            const value = cell.getValue();
            const color = value === 'Online' ? '#28a745' : '#dc3545';
            return `<span style="color: ${color}; font-weight: 500;">${value}</span>`;
          }
        }
      ]
    },
    
    // Your existing query
    query: `
      SELECT 
        'node_001' as node_id, 'Germany' as country, 'Lighthouse' as client, 
        45 as peer_count, 'Online' as status
      UNION ALL
      SELECT 
        'node_002', 'USA', 'Teku', 32, 'Online'
      UNION ALL
      SELECT 
        'node_003', 'France', 'Prysm', 28, 'Offline'
      UNION ALL
      SELECT 
        'node_004', 'Japan', 'Nimbus', 41, 'Online'
      UNION ALL
      SELECT 
        'node_005', 'Canada', 'Lodestar', 36, 'Online'
      UNION ALL
      SELECT 
        'node_006', 'UK', 'Lighthouse', 52, 'Online'
      UNION ALL
      SELECT 
        'node_007', 'Australia', 'Teku', 29, 'Offline'
      UNION ALL
      SELECT 
        'node_008', 'Netherlands', 'Prysm', 38, 'Online'
    `
  };
  
  export default metric;