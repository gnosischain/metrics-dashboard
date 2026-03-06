const metric = {
  id: 'api_execution_yields_opportunities_latest',
  name: 'Yield Opportunities',
  description: 'Pools & lending ranked by yield',
  metricDescription: 'Current yield opportunities across LP pools and lending markets on Gnosis Chain. Rows are ranked by yield to compare candidates quickly.',
  chartType: 'table',
  enableFiltering: true,
  labelField: 'type',
  
  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 20,
    paginationSizeSelector: false,
    responsiveLayout: 'collapse',
    height: '100%',
    movableColumns: false,
    
    columns: [
      {
        title: "Type",
        field: "type",
        minWidth: 80,
        widthGrow: 1,
        sorter: "string",
        formatter: "plaintext",
        headerFilter: false
      },
      {
        title: "Name",
        field: "name",
        minWidth: 200,
        widthGrow: 3,
        sorter: "string",
        formatter: "plaintext",
        headerFilter: false
      },
      {
        title: "Yield",
        field: "yield_pct",
        minWidth: 130,
        widthGrow: 1.5,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return "-";
          const row = cell.getRow().getData();
          const label = row.yield_label || '';
          return val.toFixed(2) + "% " + label;
        }
      },
      {
        title: "Borrow %",
        field: "borrow_apy",
        minWidth: 110,
        widthGrow: 1,
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
        minWidth: 120,
        widthGrow: 1.5,
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
        title: "Fees 7D",
        field: "fees_7d",
        minWidth: 110,
        widthGrow: 1.5,
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
        minWidth: 120,
        widthGrow: 1.5,
        sorter: "string",
        formatter: "plaintext",
        headerFilter: false
      }
    ]
  },
  
  query: `SELECT type, name, yield_pct, yield_label, borrow_apy, tvl, fees_7d, protocol FROM dbt.api_execution_yields_opportunities_latest`,
};

export default metric;
