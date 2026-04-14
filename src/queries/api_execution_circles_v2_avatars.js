const metric = {
  id: 'api_execution_circles_v2_avatars',
  name: 'New Avatars Daily',
  description: 'Daily new avatar registrations by type',
  metricDescription: 'Daily count of new Circles v2 avatar registrations, stacked by avatar type (Human, Group, Org).',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'avatar_type',
  query: `SELECT date, avatar_type, cnt AS value FROM dbt.api_execution_circles_v2_avatars`,
};

export default metric;
