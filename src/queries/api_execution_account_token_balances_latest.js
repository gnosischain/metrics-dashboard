import { formatCurrency, formatNumber, formatTruncateHex } from '../utils/formatters';

const metric = {
  id: 'api_execution_account_token_balances_latest',
  name: 'Current Token Balances',
  description: 'Latest non-zero token balances for the selected account or group',
  chartType: 'table',
  globalFilterField: 'address',
  searchFields: ['symbol', 'token_address'],
  paginationSize: 25,
  paginationSizeSelector: [10, 25, 50, 100],
  initialSort: [{ column: 'balance_usd', dir: 'desc' }],
  columns: [
    { field: 'symbol', title: 'Token', sorter: 'string', width: 120 },
    { field: 'token_class', title: 'Class', sorter: 'string', width: 120 },
    { field: 'token_address', title: 'Contract', sorter: 'string', formatter: (cell) => formatTruncateHex(cell.getValue()), width: 170 },
    { field: 'balance', title: 'Balance', sorter: 'number', formatter: (cell) => formatNumber(cell.getValue()) },
    { field: 'balance_usd', title: 'Balance USD', sorter: 'number', formatter: (cell) => formatCurrency(cell.getValue()) },
    { field: 'date', title: 'As of', sorter: 'datetime', width: 130 },
  ],
  query: `
    SELECT
      address,
      token_address,
      symbol,
      token_class,
      max_date AS date,
      balance,
      balance_usd
    FROM (
      SELECT
        address,
        token_address,
        any(symbol) AS symbol,
        any(token_class) AS token_class,
        max(date) AS max_date,
        argMax(balance, date) AS balance,
        argMax(coalesce(balance_usd, 0), date) AS balance_usd
      FROM dbt.int_execution_tokens_balances_daily
      PREWHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
      WHERE date >= today() - 90
      GROUP BY address, token_address
    )
    WHERE balance > 0
    ORDER BY balance_usd DESC
    LIMIT 500
  `,
};

export default metric;
