const metric = {
  id: 'api_execution_circles_v2_avatars_cumulative',
  name: 'Avatars Cumulative',
  description: 'Cumulative avatars by type over time',
  metricDescription: 'Cumulative total of registered Circles v2 avatars, stacked by avatar type (Human, Group, Org).',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'avatar_type',
  query: `SELECT date, avatar_type, total AS value FROM dbt.api_execution_circles_v2_avatars`,
};

export default metric;
