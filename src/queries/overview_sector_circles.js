const metric = {
  id: 'overview_sector_circles',
  name: 'Circles',
  kpiLabel: 'Total CRC Supply',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatNumberCompact',
  linkTo: 'circles',
  changePeriod: 'vs 30d ago',
  query: `
    SELECT date, value
    FROM dbt.api_execution_circles_v2_total_supply_daily
    WHERE date >= today() - INTERVAL 30 DAY
    ORDER BY date ASC
  `
};

export default metric;
