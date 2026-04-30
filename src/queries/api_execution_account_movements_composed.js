import { formatNumber, formatTruncateHex } from '../utils/formatters';

const metric = {
  id: 'api_execution_account_movements_composed',
  name: 'Account Movements',
  description: 'Canonical scoped token movement history for Account Portfolio',
  chartType: 'table',
  globalFilterField: 'address',
  searchFields: ['symbol', 'token_class', 'direction'],
  paginationSize: 25,
  paginationSizeSelector: [10, 25, 50, 100],
  initialSort: [{ column: 'date', dir: 'desc' }],
  columns: [
    { field: 'date', title: 'Date', sorter: 'datetime', width: 130 },
    { field: 'direction', title: 'Direction', sorter: 'string', width: 110 },
    { field: 'symbol', title: 'Token', sorter: 'string', width: 110 },
    { field: 'token_class', title: 'Class', sorter: 'string', width: 120 },
    { field: 'token_address', title: 'Token Contract', sorter: 'string', formatter: (cell) => formatTruncateHex(cell.getValue()), width: 180 },
    { field: 'net_delta', title: 'Net Amount', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
  ],
  query: `
    SELECT
      d.date,
      d.address,
      d.token_address,
      d.symbol,
      d.token_class,
      toFloat64(d.net_delta_raw) / pow(10, coalesce(w.decimals, 18)) AS net_delta,
      if(toFloat64(d.net_delta_raw) >= 0, 'inflow', 'outflow') AS direction
    FROM dbt.int_execution_tokens_address_diffs_daily AS d
    LEFT JOIN (
      SELECT address AS whitelist_address, decimals
      FROM dbt.tokens_whitelist
    ) AS w
      ON lower(w.whitelist_address) = lower(d.token_address)
    WHERE d.date BETWEEN toDate('{from}') AND toDate('{to}')
      /*__FILTER_CONDITIONS__*/
      AND d.net_delta_raw IS NOT NULL
      AND toFloat64(d.net_delta_raw) != 0
    ORDER BY d.date DESC, d.symbol ASC, d.token_address ASC
    LIMIT 500
  `,
};

export default metric;
