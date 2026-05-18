const metric = {
  id: 'api_execution_tokens_balances_daily',
  name: 'Token Balances — Daily',
  description: 'Daily end-of-day token balances by (address, token) for the last 2 years.',
  query: `
    SELECT
      date,
      address,
      token_address,
      any(symbol) AS symbol,
      any(token_class) AS token_class,
      argMax(balance, date) AS balance,
      argMax(coalesce(balance_usd, 0), date) AS balance_usd
    FROM dbt.int_execution_tokens_balances_daily
    PREWHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    WHERE date >= today() - 730
    GROUP BY date, address, token_address
    HAVING balance > 0
    ORDER BY date, balance_usd DESC
  `,
};

export default metric;
