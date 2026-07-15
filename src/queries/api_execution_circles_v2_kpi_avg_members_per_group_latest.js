const metric = {
  id: 'api_execution_circles_v2_kpi_avg_members_per_group_latest',
  name: 'Avg Members / Group',
  description: 'Mean group size (members per group)',
  metricDescription: `**Avg Members / Group** is the mean member count across all Circles v2 group avatars. A group's members are the distinct addresses on its outgoing trust list (rows where \`truster = group\`), the Circles v2 group-membership semantic; groups with zero current members are included as 0, which pulls the average down. This is a current snapshot with no upstream time series, so no change delta is shown.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: false },
  query: `SELECT value, median_members, change_pct FROM dbt.api_execution_circles_v2_kpi_avg_members_per_group_latest`,
};
export default metric;
