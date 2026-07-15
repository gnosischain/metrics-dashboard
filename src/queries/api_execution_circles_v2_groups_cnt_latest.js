const metric = {
  id: 'api_execution_circles_v2_groups_cnt_latest',
  name: 'Groups',
  description: 'Registered group avatars (cumulative)',
  metricDescription: `**Total Circles v2 groups registered.** A group is a distinct group avatar (a \`RegisterGroup\` event, \`avatar_type = 'Group'\` in \`fct_execution_circles_v2_avatars\`) — a collective/community token minted against its members' collateral. The value is the cumulative running count of all groups ever registered (Circles has no de-registration) as of the latest complete day; the delta is the percent change versus the count 7 days earlier.`,
  format: 'formatNumber',
  valueField: 'total',
  chartType: 'numberDisplay',
  changeData: {
    enabled: true,
    field: 'change_pct', 
    period: 'from 7d ago' 
  },
  query: `SELECT * FROM dbt.api_execution_circles_v2_groups_cnt_latest`,
};

export default metric;