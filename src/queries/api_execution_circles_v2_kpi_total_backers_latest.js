const metric = {
  id: 'api_execution_circles_v2_kpi_total_backers_latest',
  name: 'Total Backers',
  description: 'Addresses trusted by the backers group',
  metricDescription: 'Count of addresses currently trusted by the backers group (`circles_target_group_address`). Trust-defined population, distinct from depositors. 7-day pct change.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_total_backers_latest`,
};
export default metric;
