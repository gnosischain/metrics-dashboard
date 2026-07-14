const metric = {
  id: 'api_execution_circles_v2_backers_cumulative_daily',
  name: 'Cumulative Backers',
  description: 'Addresses trusted by the backers group over time',
  metricDescription: `**Cumulative trust-defined backers.** Each point is the running count of distinct addresses **ever trusted** by the backers group avatar (\`0x1aca…f026\`, set via \`var('circles_target_group_address')\`) on or before that date; \`new_backers\` is how many were first trusted that day. The series is **monotonic — it ignores revocation**, so an address whose trust is later withdrawn stays counted (a separate currently-trusted series is revocation-aware). The calendar is dense from \`2025-04-25\` (\`circles_target_group_start_date\`) through yesterday, and the latest incomplete day is excluded. Backers are **not** depositors: depositors emitted a \`CirclesBackingInitiated\` event, whereas a backer is any address on the group's trust list — not every depositor gets trusted, and the group can trust addresses that never deposited.`,
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
