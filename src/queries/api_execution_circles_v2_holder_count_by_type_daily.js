const metric = {
  id: 'api_execution_circles_v2_holder_count_by_type_daily',
  name: 'Holders by Type',
  description: 'Daily distinct holder count per category',
  metricDescription: 'Daily count of distinct addresses holding CRC, broken down by holder category.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  enableFiltering: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  labelField: 'label',
  legend: { top: 'top', type: 'scroll' },
  query: `SELECT date, label, holder_count AS value FROM dbt.api_execution_circles_v2_supply_by_holder_type_daily`,
};

export default metric;
