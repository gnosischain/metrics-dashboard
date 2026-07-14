const metric = {
  id: 'api_execution_circles_v2_group_explorer_holders_count_latest',
  name: 'Token Holders',
  metricDescription: `Number of distinct wallets currently holding a positive balance of this group's token, counting both the native ERC-1155 CRC and its ERC-20 wrapper; a wallet holding both forms is counted once. Balances are nominal (not demurrage-adjusted) and zero balances are excluded. Snapshot at the latest indexed state.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  globalFilterField: 'group_address',
  valueField: 'value',
  query: `
    SELECT holders_count AS value
    FROM dbt.api_execution_circles_v2_group_explorer_profile
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};
export default metric;
