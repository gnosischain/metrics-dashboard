const metric = {
  id: 'api_execution_gnosis_app_kpi_topup_volume_7d',
  name: 'TopUp Volume',
  description: 'Last 7 days (USD)',
  metricDescription: 'GA → GP TopUp USD volume in the last 7 full days.',
  chartType: 'numberDisplay',
  format: 'formatCurrency',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'vs prior 7 days' },
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_topup_volume_7d`,
};
export default metric;
