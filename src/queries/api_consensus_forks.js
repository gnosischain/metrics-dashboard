const metric = {
  id: 'api_consensus_forks',
  name: 'Forks Info',
  description: 'Consensus layer Forks',
  chartType: 'table',
  minimal: true,
  
  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    responsiveLayout: 'collapse',
    height: 400, // Slightly taller for modern design
    
    // Modern table settings
    selectableRows: false,
    enableFiltering: false,
    paginationInitialPage: 1,
    paginationCounter: "rows",
    autoResize: false,
    reactiveData: false,
    
    // Optimized columns for modern design
    columns: [
      {
        title: "Name",
        field: "fork_name",
        width: 140,
        minWidth: 100,
        sorter: "string",
        headerFilter: false,
        formatter: "plaintext",
        cssClass: "fork-name-cell"
      },
      {
        title: "Version",
        field: "fork_version", 
        width: 140,
        minWidth: 100,
        sorter: "string",
        headerFilter: false,
        formatter: "plaintext",
        cssClass: "version-cell"
      },
      {
        title: "Fork Digest",
        field: "fork_digest",
        width: 140,
        minWidth: 100,
        sorter: "string", 
        headerFilter: false,
        formatter: "plaintext",
        cssClass: "digest-cell"
      },
      {
        title: "Epoch",
        field: "fork_epoch",
        width: 140,
        minWidth: 80,
        sorter: "number",
        headerFilter: false,
        formatter: "plaintext",
        cssClass: "epoch-cell",
        hozAlign: "right" 
      }
    ],
    
    // Additional modern styling settings
    movableColumns: false,
    resizableRows: false,
    debugInvalidOptions: false,
    renderVerticalBuffer: 0,
    virtualDom: false,
    
    // Enhanced pagination settings
    paginationButtonCount: 7, // Show more page buttons
    paginationSizeSelector: [10, 20, 50],
    paginationElement: undefined,
    
    // Custom styling config
    tabulatorConfig: {
      selectableRows: false,
      persistence: false,
      dataLoader: false,
      progressiveLoad: false,
      placeholder: "No fork data available",
      tooltips: true,
      tooltipGenerationMode: "hover"
    }
  },
  
  query: `
    SELECT * FROM dbt.api_consensus_forks
  `
};

export default metric;