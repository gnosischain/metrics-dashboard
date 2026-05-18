const metric = {
  id: 'api_execution_circles_v2_active_minters_daily',
  name: 'Active Minters',
  description: 'Daily Active Minters (14d sustained mint)',
  metricDescription: 'Distinct avatars that minted on each of the last 14 days AND whose 14-day mint sum is ≥ 80% of the 336 CRC theoretical maximum. Canonical KPI from the Circles v2 KPIs dashboard.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'active_minters',
  query: `SELECT date, active_minters FROM dbt.api_execution_circles_v2_active_minters_daily`,
};
export default metric;
