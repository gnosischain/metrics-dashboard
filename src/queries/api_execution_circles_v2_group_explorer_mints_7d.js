const metric = {
  id: 'api_execution_circles_v2_group_explorer_mints_7d',
  name: 'Group Mints (7d)',
  metricDescription: `Total amount of this group's own token (**group CRC**) minted in the rolling last 7 days (\`now() - 7 days\` to now), summed from \`group\`-kind mint events. This is a token amount, not a count of mint transactions, and covers only group-token issuance (not member/personal mints).`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  globalFilterField: 'group_address',
  valueField: 'value',
  query: `
    SELECT mints_7d AS value
    FROM dbt.api_execution_circles_v2_group_explorer_profile
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};
export default metric;
