const metric = {
  id: 'api_execution_circles_v2_groups_overview_daily',
  name: 'Cumulative Groups',
  description: 'Total registered Circles v2 groups over time',
  metricDescription: `**Cumulative count of Circles v2 group registrations**.

The previous \`collateral_events\` and \`active_groups\` series were dropped — both were sourced from StandardTreasury lock/burn/return events only, which under-counts groups that use other treasury implementations (CMG, Base, custom). Daily \`new groups\` is captured in the "New Groups (7d)" KPI tile.`,
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
