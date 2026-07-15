const metric = {
  id: 'api_execution_circles_v2_active_minters_daily',
  name: 'Active Minters (daily)',
  description: 'Daily Active Minters (14d sustained mint)',
  metricDescription: `Count of **active minters** per day: distinct avatars that personally minted CRC on **each of the last 14 days** and whose 14-day mint total is at least **80% of the 336 CRC theoretical maximum** (≥ 268.8 CRC). Personal issuance accrues at ~1 CRC/hour (24 CRC/day), so 336 CRC is a fully active human over 14 days. Counts personal minting only (not group mints); blacklisted avatars are **not** filtered out. Daily grain; the current (incomplete) day is excluded. This is the canonical Active Minters KPI from the Circles v2 KPIs board.`,
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'active_minters',
  query: `SELECT date, active_minters FROM dbt.api_execution_circles_v2_active_minters_daily`,
};
export default metric;
