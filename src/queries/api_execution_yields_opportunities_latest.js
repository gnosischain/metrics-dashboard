const metric = {
  id: 'api_execution_yields_opportunities_latest',
  name: 'Yield Opportunities',
  description: 'LP pools and lending markets sorted by yield',
  metricDescription: 'Current yield opportunities across LP pools and lending markets. Rows are ranked by yield to compare candidates quickly.',
  chartType: 'table',
  enableFiltering: true,
  labelField: 'type',
  
  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 10,
    paginationSizeSelector: false,
    responsiveLayout: 'collapse',
    height: '100%',
    movableColumns: false,
    
    columns: [
      {
        title: "Type",
        field: "type",
        width: 100,
        sorter: "string",
        formatter: "plaintext",
        headerFilter: false
      },
      {
        title: "Name",
        field: "name",
        minWidth: 200,
        sorter: "string",
        formatter: "plaintext",
        headerFilter: false
      },
      {
        title: "Yield %",
        field: "yield_pct",
        width: 120,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return "-";
          return val.toFixed(2) + "%";
        }
      },
      {
        title: "Borrow APY",
        field: "borrow_apy",
        width: 120,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined || val === 0) return "-";
          return val.toFixed(2) + "%";
        }
      },
      {
        title: "TVL",
        field: "tvl",
        width: 140,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined || val === 0) return "-";
          if (val >= 1e6) return "$" + (val / 1e6).toFixed(1) + "M";
          if (val >= 1e3) return "$" + (val / 1e3).toFixed(1) + "K";
          return "$" + val.toFixed(0);
        }
      },
      {
        title: "Protocol",
        field: "protocol",
        width: 140,
        sorter: "string",
        formatter: "plaintext",
        headerFilter: false
      }
    ]
  },
  
  query: `SELECT type, name, yield_pct, borrow_apy, tvl, protocol FROM dbt.api_execution_yields_opportunities_latest`,
};

export default metric;
