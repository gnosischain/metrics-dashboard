const metric = {
  id: 'api_execution_circles_v2_groups_overview_daily',
  name: 'Cumulative Groups',
  description: 'Total registered Circles v2 groups over time',
  metricDescription: `**Cumulative number of Circles v2 groups registered over time.** Each day contributes \`n_new_groups\` = group avatars registered that day (a \`RegisterGroup\` event, i.e. \`avatar_type = 'Group'\` in \`int_execution_circles_v2_avatars\`); the plotted \`n_groups_total\` is the running cumulative total of all groups ever registered (Circles has no de-registration). The current incomplete day is excluded, and the tooltip also surfaces that day's new-group count.`,
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'n_groups_total',
  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.3,
  tooltipExtraFields: ['n_new_groups'],
  query: `
    SELECT
      date,
      n_new_groups,
      n_groups_total
    FROM dbt.api_execution_circles_v2_groups_overview_daily
    ORDER BY date
  `,
};
export default metric;
