import { getTokenIconHtml } from '../utils/tokenIcons.js';
import { formatPercentageBar } from '../utils/formatters';

const metric = {
  id: 'api_execution_tokens_top_holders_latest',
  name: 'Top Holders',
  description: 'Largest token holders by USD balance with concentration metrics',
  metricDescription:
    'Top holders ranked by USD balance for the selected token. ' +
    'Cumulative % shows the combined share of the top N holders — read row 10 to see "top 10 hold X%". ' +
    '7d change shows balance movement vs one week ago. Labels identify protocol contracts (Aave, Balancer, etc.) vs wallets and EOAs.',
  chartType: 'table',

  enableFiltering: true,
  labelField: 'token',

  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 25,
    paginationSizeSelector: [25, 50, 100],
    responsiveLayout: false,
    height: '100%',
    movableColumns: false,
    initialSort: [{ column: 'rank', dir: 'asc' }],

    columns: [
      {
        title: '#',
        field: 'rank',
        minWidth: 50,
        widthGrow: 0.5,
        sorter: 'number',
        hozAlign: 'center',
      },
      {
        title: 'Address',
        field: 'address',
        minWidth: 140,
        widthGrow: 2,
        sorter: 'string',
        formatter: function (cell) {
          const addr = cell.getValue();
          if (!addr) return '-';
          const short = addr.slice(0, 6) + '...' + addr.slice(-4);
          return `<a href="https://gnosisscan.io/address/${addr}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;">${short}</a>`;
        },
      },
      {
        title: 'Label',
        field: 'label',
        minWidth: 90,
        widthGrow: 1.5,
        sorter: 'string',
        formatter: function (cell) {
          const val = cell.getValue();
          return val || '-';
        },
      },
      {
        title: 'Via',
        field: 'protocols',
        minWidth: 90,
        widthGrow: 1.5,
        sorter: 'string',
        formatter: function (cell) {
          const val = cell.getValue();
          if (!val || val.length === 0) return '-';
          const arr = Array.isArray(val) ? val : JSON.parse(val);
          return arr.filter(Boolean).join(', ') || '-';
        },
      },
      {
        title: 'Balance',
        field: 'balance',
        minWidth: 110,
        widthGrow: 2,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function (cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return '-';
          return Number(val).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        },
      },
      {
        title: 'USD Value',
        field: 'balance_usd',
        minWidth: 110,
        widthGrow: 2,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function (cell) {
          const val = cell.getValue();
          if (val === null || val === undefined || val === 0) return '-';
          return (
            '$' +
            Number(val).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          );
        },
      },
      {
        title: '% of Total',
        field: 'pct_of_total',
        minWidth: 90,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function (cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return '-';
          return Number(val).toFixed(2) + '%';
        },
      },
      {
        title: 'Cumul. %',
        field: 'cumulative_pct',
        minWidth: 110,
        widthGrow: 1.4,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function (cell) {
          return formatPercentageBar(cell.getValue());
        },
      },
      {
        title: '7d Change',
        field: 'change_usd_7d',
        minWidth: 100,
        widthGrow: 1.5,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function (cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return '-';
          const abs = Math.abs(val);
          const formatted =
            abs >= 1000000
              ? '$' + (abs / 1000000).toFixed(2) + 'M'
              : abs >= 1000
                ? '$' + (abs / 1000).toFixed(1) + 'K'
                : '$' + abs.toFixed(2);
          const sign = val > 0 ? '+' : val < 0 ? '-' : '';
          const color = val > 0 ? '#4caf50' : val < 0 ? '#f44336' : 'inherit';
          return `<span style="color:${color}">${sign}${formatted}</span>`;
        },
      },
    ],
  },

  query: `
    SELECT rank, address, symbol AS token, label, protocols, balance, balance_usd,
           pct_of_total, cumulative_pct, change_usd_7d
    FROM dbt.api_execution_tokens_top_holders_latest
    WHERE rank <= 100
    ORDER BY token, rank
  `,
};
export default metric;
