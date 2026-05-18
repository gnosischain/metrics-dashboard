const metric = {
  id: 'api_execution_circles_v2_kpi_avg_trusts_per_avatar_latest',
  name: 'Avg Trusts / Human',
  description: 'Active trusts ÷ humans',
  metricDescription: 'Network density indicator: total active trust relationships divided by total registered humans. Higher = denser web of mutual trust.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_execution_circles_v2_kpi_avg_trusts_per_avatar_latest`,
};
export default metric;
