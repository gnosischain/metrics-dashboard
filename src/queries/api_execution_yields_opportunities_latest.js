import { getTokenIconHtml, getTokenIconsFromName } from '../utils/tokenIcons.js';

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
    hideEmptyColumns: true,
    
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
        headerFilter: false,
        formatter: function(cell) {
          const name = cell.getValue();
          const row = cell.getRow()?.getData?.() || {};
          const address = String(row.address || '').trim();

          const safeName = String(name || '-')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

          const icons = row.type === 'LP'
            ? getTokenIconsFromName(name)
            : (getTokenIconHtml(row.token) || getTokenIconsFromName(name));
          const iconSpan = icons ? `<span style="margin-right:6px;white-space:nowrap;">${icons}</span>` : '';

          if (!address) return `<span style="display:inline-flex;align-items:center;">${iconSpan}${safeName}</span>`;

          const href = `https://gnosis.blockscout.com/address/${encodeURIComponent(address)}`;
          return `<span style="display:inline-flex;align-items:center;">${iconSpan}<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer">${safeName}</a></span>`;
        },
        cellClick: function(_event, cell) {
          const address = String(cell.getRow()?.getData?.()?.address || '').trim();
          if (!address) return;

          const href = `https://gnosis.blockscout.com/address/${encodeURIComponent(address)}`;
          if (typeof window !== 'undefined') {
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        },
        tooltip: function(cell) {
          const address = String(cell.getRow()?.getData?.()?.address || '').trim();
          if (!address) return false;
          return `Open ${address.slice(0, 10)}... on Blockscout`;
        }
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
        title: "Total Supplied",
        field: "total_supplied",
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
        title: "Total Borrowed",
        field: "total_borrowed",
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
        title: "LVR 7D",
        field: "lvr_apr_7d",
        minWidth: 90,
        widthGrow: 1,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return "-";
          const color = val >= 0 ? '#38a169' : '#e53e3e';
          return "<span style='color:" + color + "'>" + val.toFixed(2) + "%</span>";
        }
      },
      {
        title: "Util %",
        field: "utilization_rate",
        minWidth: 90,
        widthGrow: 1,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return "-";
          const pct = val.toFixed(1);
          if (val >= 85) return "<span style='color:#e53e3e;font-weight:600'>" + pct + "%</span>";
          if (val >= 70) return "<span style='color:#d69e2e;font-weight:600'>" + pct + "%</span>";
          return pct + "%";
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
  
  query: `SELECT type, token, name, address, yield_pct, yield_label, borrow_apy, tvl, total_supplied, total_borrowed, fees_7d, lvr_apr_7d, utilization_rate, protocol FROM dbt.api_execution_yields_opportunities_latest`,
};

export default metric;
