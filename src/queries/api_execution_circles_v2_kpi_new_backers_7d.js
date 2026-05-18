const metric = {
  id: 'api_execution_circles_v2_kpi_new_backers_7d',
  name: 'New Backers (7d)',
  description: 'Backers newly trusted in the last 7 days',
  metricDescription: 'Count of addresses that became trust-defined backers in the last 7 days (first appearance on the backers group\'s trust list). 7d-on-7d pct change.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_new_backers_7d`,
};
export default metric;
