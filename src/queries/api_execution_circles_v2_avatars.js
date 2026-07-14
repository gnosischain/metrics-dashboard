const metric = {
  id: 'api_execution_circles_v2_avatars',
  name: 'New Avatars Daily',
  description: 'Daily new avatar registrations by type',
  metricDescription: `Count of new Circles v2 avatars registered each day, stacked by \`avatar_type\`. Each avatar is one on-chain Hub registration event: **Human** (\`RegisterHuman\`), **Group** (\`RegisterGroup\`), or **Org** (\`RegisterOrganization\`). Counts registrations only — there is no activity or de-registration filter. Daily grain; the current (incomplete) day is excluded.`,
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
