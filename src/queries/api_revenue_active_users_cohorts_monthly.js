const metric = {
  id: 'api_revenue_active_users_cohorts_monthly',
  name: 'Active Users — Monthly Cohorts',
  description: 'Cross-stream unique revenue-generating users, per calendar month.',
  metricDescription:
    'Cross-stream unique-user count. For each user, fees are summed across **all** streams (holdings + sDAI + GPay) **before** cohort bucketing, so a user active in multiple streams is counted once.\n\n' +
    'Fees are summed over one **calendar month** (no rolling). Buckets are scaled down from the yearly view — a user at ~$0.50 this month sits at roughly the $6/year bucket in the weekly view (6 ÷ 12 ≈ 0.5). This view highlights **who was actively generating revenue this month**, whereas the weekly view describes the ongoing rolling distribution.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'month',
  yField: 'users_cnt',
  seriesField: 'cohort',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  unitFields: {
    users: { field: 'users_cnt', format: 'formatNumber',   label: '#' },
    fees:  { field: 'fees_total', format: 'formatCurrency', label: '$' },
  },
  query: `
    SELECT month, cohort, fees_total, users_cnt
    FROM dbt.api_revenue_active_users_cohorts_monthly
    ORDER BY month ASC
  `,
};
export default metric;
