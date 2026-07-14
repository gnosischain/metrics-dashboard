const metric = {
  id: 'api_execution_circles_v2_group_explorer_members_latest',
  name: 'Members',
  metricDescription: `Current member count = the number of distinct addresses on the group's **active outgoing trust list** (the trustees the group currently trusts). A count taken from the latest group-size snapshot; \`0\` if the group trusts no one.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  globalFilterField: 'group_address',
  valueField: 'value',
  query: `
    SELECT n_members AS value
    FROM dbt.api_execution_circles_v2_group_explorer_profile
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};
export default metric;
