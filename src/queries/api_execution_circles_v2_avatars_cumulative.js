const metric = {
  id: 'api_execution_circles_v2_avatars_cumulative',
  name: 'Avatars Cumulative',
  description: 'Cumulative avatars by type over time',
  metricDescription: `Running cumulative total of registered Circles v2 avatars over time, stacked by \`avatar_type\`. Each avatar is one on-chain Hub registration event: **Human** (\`RegisterHuman\`), **Group** (\`RegisterGroup\`), or **Org** (\`RegisterOrganization\`); the total only grows since registrations are never removed. Daily grain; the current (incomplete) day is excluded.`,
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
