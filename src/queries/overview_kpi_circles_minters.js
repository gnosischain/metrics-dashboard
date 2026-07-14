const metric = {
  id: 'overview_kpi_circles_minters',
  name: 'Circles Active Minters',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatNumberCompact',
  changePeriod: 'vs 30d ago',
  metricDescription: 'Circles v2 active minters (avatars whose personal CRC minting over the last 14 days is at least 80% of the theoretical maximum), on the most recent complete day.',
  query: `
    SELECT date, active_minters AS value
    FROM dbt.api_execution_circles_v2_active_minters_daily
    WHERE date >= today() - INTERVAL 30 DAY
    ORDER BY date ASC
  `
};

export default metric;
