const metric = {
  id: 'api_execution_gnosis_app_kpi_topups_7d',
  name: 'TopUps',
  description: 'Last 7 days',
  metricDescription: 'GA → GP TopUp count in the last 7 full days.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_topups_7d`,
};
export default metric;
