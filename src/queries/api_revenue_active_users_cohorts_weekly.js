const metric = {
  id: 'api_revenue_active_users_cohorts_weekly',
  name: 'Active Users — Rolling 52w Cohorts',
  description: 'Cross-stream unique revenue-generating users, trailing-year.',
  metricDescription:
    'Cross-stream unique-user count. For each user, fees are summed across **all** streams (holdings + sDAI + GPay) **before** cohort bucketing, so a user who is ≥$6/yr in holdings alone is counted once — not again for GPay. This is the canonical "active revenue-generating users" metric.\n\n' +
    'Daily fees are summed per user to the week, then trailing 52 weeks are summed for each user-week. Users are bucketed by their annualised cross-stream total (`<1`, $1–3, $3–6, $6–10, $10–100, ≥$100). ' +
    'This view is distinct from the monthly view — not an aggregate of it.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'week',
  yField: 'users_cnt',
  seriesField: 'cohort',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  unitFields: {
    users: { field: 'users_cnt',                 format: 'formatNumber',   label: '#' },
    fees:  { field: 'annual_rolling_fees_total', format: 'formatCurrency', label: '$' },
  },
  query: `
    SELECT week, cohort, annual_rolling_fees_total, users_cnt
    FROM dbt.api_revenue_active_users_cohorts_weekly
    ORDER BY week ASC
  `,
};
export default metric;
