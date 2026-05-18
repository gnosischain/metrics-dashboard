const metric = {
  id: 'api_execution_circles_v2_kpi_avg_members_per_group_latest',
  name: 'Avg Members / Group',
  description: 'Mean group size (members per group)',
  metricDescription: 'Average member count across Circles v2 groups, where membership = the group\'s outgoing trust list. Median shown as tooltip context.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: false },
  query: `SELECT value, median_members, change_pct FROM dbt.api_execution_circles_v2_kpi_avg_members_per_group_latest`,
};
export default metric;
