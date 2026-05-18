const metric = {
  id: 'api_execution_circles_v2_kpi_total_supply_latest',
  name: 'Total Supply',
  description: 'Network-wide CRC supply',
  metricDescription: 'Latest network-wide total Circles v2 supply (sum of every avatar\'s personal CRC), with 7-day pct change.',
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  changeData: { enabled: true, field: 'change_pct', period: 'from 7d ago' },
  query: `SELECT value, change_pct FROM dbt.api_execution_circles_v2_kpi_total_supply_latest`,
};
export default metric;
