const metric = {
  id: 'api_execution_circles_v2_backers_cumulative_daily',
  name: 'Cumulative Backers',
  description: 'Addresses trusted by the backers group over time',
  metricDescription: `**Cumulative trust-defined backers.** Each point is the count of addresses ever trusted by the backers group (\`0x1aca…f026\`, configured via \`var('circles_target_group_address')\`) on or before that date.

This is **not** the same as depositors. Depositors are addresses that have emitted a \`CirclesBackingInitiated\` event — a transactional population. Backers are addresses on the backers group's trust list. Not every depositor ends up trusted by the group, and the group can trust addresses that never deposited.`,
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'cumulative_backers',
  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.3,
  tooltipExtraFields: ['new_backers'],
  query: `
    SELECT date, new_backers, cumulative_backers
    FROM dbt.api_execution_circles_v2_backers_cumulative_daily
    ORDER BY date
  `,
};
export default metric;
