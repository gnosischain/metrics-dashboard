const metric = {
  id: 'table_gnosis_chain_history',
  name: 'Gnosis Chain — History & Upgrades',
  description: 'A timeline of major milestones, forks, and protocol upgrades on Gnosis Chain',
  chartType: 'table',
  minimal: false, // Use regular card
  
  tableConfig: {
    layout: 'fitColumns',
    pagination: false, // Disable pagination to show all rows
    responsiveLayout: 'collapse',
    height: '100%', // Use full height of container
    
    // DISABLE header filters (search boxes)
    enableFiltering: false,
    
    // Allow table to use full container height
    autoResize: true,
    renderVerticalBuffer: 0,
    
    // Custom column definitions with proper formatting
    columns: [
      {
        title: "Date",
        field: "date",
        width: 130,
        sorter: "string",
        headerFilter: false,
        formatter: "plaintext"
      },
      {
        title: "Fork Name",
        field: "fork_name",
        width: 230,
        sorter: "string",
        headerFilter: false,
        formatter: "plaintext"
      },
      {
        title: "Type",
        field: "type",
        width: 130,
        sorter: "string",
        headerFilter: false,
        formatter: function(cell) {
          const value = cell.getValue();
          let color = '#6c757d'; // default gray
          switch(value) {
            case 'Combined': color = '#007bff'; break;
            case 'Execution': color = '#28a745'; break;
            case 'Consensus': color = '#ffc107'; break;
            case 'Protocol': color = '#dc3545'; break;
            default: color = '#6c757d'; break;
          }
          return `<span style="color: ${color}; font-weight: 500;">${value}</span>`;
        }
      },
      {
        title: "Block/Epoch",
        field: "block_epoch",
        width: 170,
        sorter: "string",
        headerFilter: false,
        formatter: "plaintext"
      },
      {
        title: "Description",
        field: "description",
        width: 330,
        sorter: "string",
        headerFilter: false,
        formatter: "textarea"
      },
      {
        title: "Key EIPs",
        field: "key_eips",
        width: 180,
        sorter: "string",
        headerFilter: false,
        formatter: "textarea"
      }
    ]
  },
  
  // Use a query with UNION ALL to provide the static data (following your working pattern)
  query: `
    SELECT 
      '2025-04-30' as date, 
      'Prague/Electra (Pectra)' as fork_name, 
      'Combined' as type, 
      'Epoch 1,337,856' as block_epoch,
      'Smart-account powers for EOAs, higher validator balance, execution-layer exits' as description,
      'EIP-7702, EIP-7251, EIP-7002' as key_eips
    UNION ALL
    SELECT 
      '2024-03-11', 
      'Cancun/Deneb (Dencun)', 
      'Combined', 
      'Epoch 889,856',
      'Blob transactions for cheaper L2 data. Gnosis tuned parameters (1 gwei min blob price)',
      'EIP-4844, EIP-7514, EIP-1153, EIP-4788'
    UNION ALL
    SELECT 
      '2023-08-01', 
      'Shanghai/Capella (Shapella)', 
      'Combined', 
      'Epoch 648,704',
      'Enables validator withdrawals. Rewards/principal paid in GNO',
      'EIP-3651, EIP-3855, EIP-3860, EIP-6049'
    UNION ALL
    SELECT 
      '2022-12-08', 
      'The Merge', 
      'Protocol', 
      'Beacon block 6,306,357',
      'Execution layer fused with Beacon Chain, transition to PoS',
      '—'
    UNION ALL
    SELECT 
      '2022-04-20', 
      'GIP-31 Hard Fork', 
      'Execution', 
      'Block 21,735,000',
      'Hardened old permittable bridged tokens against re-entrancy',
      '—'
    UNION ALL
    SELECT 
      '2021-12-08', 
      'Beacon Chain Genesis', 
      'Consensus', 
      'Epoch 0',
      'PoS consensus layer launch (later merged with execution)',
      '—'
    UNION ALL
    SELECT 
      '2021-11-12', 
      'London', 
      'Execution', 
      'Block 19,040,000',
      'Basefee + burn (EIP-1559), block size to 34M',
      'EIP-1559, EIP-3198, EIP-3529, EIP-3541'
    UNION ALL
    SELECT 
      '2021-05-17', 
      'Berlin', 
      'Execution', 
      'Block 16,101,500',
      'Gas-cost optimizations, typed-transaction groundwork',
      'EIP-2565, EIP-2929, EIP-2718, EIP-2930'
    UNION ALL
    SELECT 
      '2020-04-01', 
      'POSDAO Activation', 
      'Protocol', 
      'Block 9,186,425',
      'Activated POSDAO contracts and validator-set logic on xDai',
      '—'
    UNION ALL
    SELECT 
      '2019-12-12', 
      'Istanbul', 
      'Execution', 
      'Block 7,298,030',
      'DoS resilience improvements, L2 proof systems',
      'EIP-1344, EIP-1884, EIP-2028'
    UNION ALL
    SELECT 
      '2019-03-06', 
      'EIP-1283 Disable', 
      'Execution', 
      'Block 2,508,800',
      'Disabled EIP-1283 SSTORE gas metering (security fix)',
      'EIP-1283'
    UNION ALL
    SELECT 
      '2019-01-11', 
      'Constantinople', 
      'Execution', 
      'Block 1,604,400',
      'Activated Constantinople EIPs on xDai',
      'EIP-145, EIP-1014, EIP-1052, EIP-1283'
  `
};

export default metric;