const metric = {
  id: 'api_execution_circles_v2_kpi_mints_7d',
  name: 'Mints (7d)',
  description: 'Mint events in last 7 days',
  metricDescription: 'Total personal-mint events network-wide in the last 7 full days, with pct change vs the prior 7-day window.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_mints_7d`,
};
export default metric;
