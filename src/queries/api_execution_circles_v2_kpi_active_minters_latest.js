const metric = {
  id: 'api_execution_circles_v2_kpi_active_minters_latest',
  name: 'Active Minters',
  description: 'Yesterday\'s active minters',
  metricDescription: 'Avatars that minted on each of the last 14 days AND whose 14-day mint sum is ≥ 80% of the 336 CRC theoretical maximum, measured yesterday. WoW pct change.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_active_minters_latest`,
};
export default metric;
