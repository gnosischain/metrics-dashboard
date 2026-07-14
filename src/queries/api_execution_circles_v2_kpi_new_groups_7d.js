const metric = {
  id: 'api_execution_circles_v2_kpi_new_groups_7d',
  name: 'New Groups (7d)',
  description: 'New groups registered in the last 7 days',
  metricDescription: `Number of Circles v2 **group** avatars newly registered in the last 7 days — \`RegisterGroup\` events, i.e. avatars with \`avatar_type = 'Group'\` — with week-over-week percent change. Counts only group registrations, not their members, trusts, or minted supply. Today is excluded (source is cut at \`block_timestamp < today()\`), so the window ends yesterday.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_new_groups_7d`,
};
export default metric;
