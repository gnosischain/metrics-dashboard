const metric = {
  id: 'api_execution_account_balance_history_daily',
  name: 'Balance History',
  description: 'Daily total portfolio balance and token count',
  chartType: 'line',
  globalFilterField: 'address',
  xField: 'date',
  yField: 'total_balance_usd',
  valueField: 'total_balance_usd',
  labelField: 'series',
  format: 'formatCurrency',
  query: `
    SELECT
      date,
      address,
      'Total balance' AS series,
      total_balance_usd,
      tokens_held,
      native_or_wrapped_xdai_balance,
      priced_balance_usd,
      priced_tokens_held
    FROM dbt.int_execution_account_balance_history_daily
    PREWHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY date
  `,
};

export default metric;
