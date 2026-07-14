const metric = {
  id: 'api_execution_circles_v2_kpi_active_minters_latest',
  name: 'Active Minters',
  description: 'Yesterday\'s active minters',
  metricDescription: `**Active Minters** counts avatars that minted personal CRC on every one of the last 14 days AND whose 14-day minted total is at least 80% of the theoretical maximum (0.8 x 336 = 268.8 CRC; every human can issue ~1 CRC/hour, i.e. 24 CRC/day, so 336 CRC over 14 days). This captures consistently active human minters, not one-off minters. Blacklisted avatars are not excluded. Reported for the latest complete day, with the percentage change versus 7 days earlier.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_active_minters_latest`,
};
export default metric;
