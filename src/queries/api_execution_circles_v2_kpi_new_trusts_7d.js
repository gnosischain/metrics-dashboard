const metric = {
  id: 'api_execution_circles_v2_kpi_new_trusts_7d',
  name: 'New Trusts (7d)',
  description: 'New trusts granted in last 7 days',
  metricDescription: 'New Circles v2 trusts granted in the last 7 full days (expiry > now), with pct change vs the prior 7-day window.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_new_trusts_7d`,
};
export default metric;
