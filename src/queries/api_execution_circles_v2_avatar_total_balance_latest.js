const metric = {
  id: 'api_execution_circles_v2_avatar_total_balance_latest',
  name: 'Total CRC (Demurraged)',
  description: 'Sum of all CRC tokens held by the avatar',
  chartType: 'numberDisplay',
  globalFilterField: 'avatar',
  valueField: 'balance_demurraged',
  format: 'formatNumber',

  query: `
    SELECT avatar, sum(balance) AS balance, sum(balance_demurraged) AS balance_demurraged
    FROM dbt.api_execution_circles_v2_avatar_balances_latest
    GROUP BY avatar
  `,
};

export default metric;
