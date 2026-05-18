const metric = {
  id: 'api_execution_circles_v2_kpi_new_groups_7d',
  name: 'New Groups (7d)',
  description: 'New groups registered in the last 7 days',
  metricDescription: 'Count of Circles v2 group avatars registered in the last 7 days, with week-over-week pct change.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_new_groups_7d`,
};
export default metric;
