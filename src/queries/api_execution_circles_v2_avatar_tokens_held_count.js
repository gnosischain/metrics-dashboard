const metric = {
  id: 'api_execution_circles_v2_avatar_tokens_held_count',
  name: 'Tokens Held',
  description: 'Current',
  metricDescription: 'Number of distinct Circles v2 CRC tokens the selected avatar currently holds with a balance above 0.001 CRC. The 0.001 dust threshold filters out near-zero residual balances from completed transfers.',
  chartType: 'numberDisplay',
  globalFilterField: 'avatar',
  valueField: 'tokens_held_count',
  format: 'formatNumber',

  query: `
    SELECT avatar, tokens_held_count
    FROM dbt.api_execution_circles_v2_avatar_tokens_held_count
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
