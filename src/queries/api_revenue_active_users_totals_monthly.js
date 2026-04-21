const metric = {
  id: 'api_revenue_active_users_totals_monthly',
  name: 'Active Users — Monthly',
  description: 'Unique cross-stream users with ≥ $0.50 of revenue in a calendar month (holdings + sDAI + GPay, summed before counting).',
  metricDescription:
    'For each user, calendar-month fees are summed across **all** streams (holdings + sDAI + GPay) **before** thresholding, so a user is counted at most once per month. A user qualifies if their cross-stream monthly total is **≥ $0.50** — the month-scaled equivalent of the yearly $6 threshold (6 ÷ 12 ≈ 0.5).',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'month',
  yField: 'users_cnt',
  format: 'formatNumber',
  showTotal: false,
  unitFields: {
    users: { field: 'users_cnt', format: 'formatNumber',   label: '#' },
    fees:  { field: 'fees_total', format: 'formatCurrency', label: '$' },
  },
  query: `
    SELECT month, users_cnt, fees_total
    FROM dbt.api_revenue_active_users_totals_monthly
    ORDER BY month ASC
  `,
};
export default metric;
