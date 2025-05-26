
const metric = {
    id: 'node_status_table',
    name: 'Node Status Table',
    description: 'Network nodes status overview',
    chartType: 'table',
    minimal: true,
    
    tableConfig: {
      layout: 'fitColumns',
      pagination: true, // Enable pagination
      paginationSize: 4, // Show only 4 rows per page (this will force pagination)
      paginationSizeSelector: [3, 4, 6, 10], // Options for rows per page
      responsiveLayout: 'collapse',
      height: 350, // Fixed height to fit in card properly
      
      // DISABLE header filters (search boxes)
      enableFiltering: false,
      
      // Force pagination to always show
      paginationInitialPage: 1,
      paginationCounter: "rows", // Show row counter
      
      // Custom column definitions to ensure no filters and proper formatting
      columns: [
        {
          title: "Node ID",
          field: "node_id",
          width: 120,
          sorter: "string",
          headerFilter: false
        },
        {
          title: "Country",
          field: "country",
          width: 150,
          sorter: "string",
          headerFilter: false
        },
        {
          title: "Client",
          field: "client",
          width: 130,
          sorter: "string",
          headerFilter: false
        },
        {
          title: "Peer Count",
          field: "peer_count",
          width: 120,
          sorter: "number",
          headerFilter: false,
          formatter: "plaintext"
        },
        {
          title: "Status",
          field: "status",
          width: 100,
          sorter: "string",
          headerFilter: false,
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