const metric = {
  id: 'api_execution_gnosis_app_retention_by_action_monthly_heatmap',
  name: 'Retention by Action',
  description: 'Cohort × months-since — per activity_kind',
  metricDescription: 'Cohort retention heatmap by activity type. Filter action and switch between user count / percentage views.',
  chartType: 'heatmap',
  xField: 'x',
  yField: 'y',
  valueField: 'retention_pct',
  format: 'formatPercentageInt',
  showLabels: true,
  enableZoom: true,
  visualMapOrient: 'vertical',
  grid: { right: '12%', bottom: '8%' },
  enableFiltering: true,
  labelField: 'activity_kind',
  unitFields: {
    'pct|users': { field: 'retention_pct', format: 'formatPercentageInt', label: '%' },
    'val|users': { field: 'value_abs',     format: 'formatNumber',       label: '#', visualMapPercentile: true },
  },
  unitFieldGroups: [
    { options: { pct: '%', val: 'val' } },
    { options: { users: '#' } },
  ],
  query: `
    SELECT activity_kind, x, y, retention_pct, value_abs
    FROM dbt.api_execution_gnosis_app_retention_by_action_monthly
    ORDER BY
      if(activity_kind = 'circles_trust', 0, 1),
      y ASC,
      x ASC
  `,
};
export default metric;
